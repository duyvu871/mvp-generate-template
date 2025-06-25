import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  type PromptStep,
  type WorkflowConfig,
  type TemplatesConfig,
} from '../schemas/config.js';
import { getTemplateChoices } from './config.js';

// Type for prompt answers
export type PromptAnswers = Record<string, any>;

// Validation functions registry
const validationFunctions: Record<string, (value: any) => boolean | string> = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return true;
  },
  isValidProjectName: (value: string) => {
    const projectNameRegex = /^[a-z0-9-_]+$/i;
    if (!projectNameRegex.test(value)) {
      return 'Project name can only contain letters, numbers, hyphens, and underscores';
    }
    return true;
  },
};

// Dynamic validation function creator
export function createMinLengthValidator(
  min: number
): (value: string) => boolean | string {
  return (value: string) => {
    if (value.length < min) {
      return `Minimum length is ${min} characters`;
    }
    return true;
  };
}

// Condition functions registry
const conditionFunctions: Record<string, (answers: PromptAnswers) => boolean> =
  {
    hasTypeScript: (answers: PromptAnswers) => answers.typescript === true,
    hasESBuild: (answers: PromptAnswers) => answers.esbuild === true,
    hasDatabase: (answers: PromptAnswers) =>
      answers.features && answers.features.includes('database'),
    isExpressTemplate: (answers: PromptAnswers) =>
      answers.template === 'express-hbs' || answers.template === 'express-api',
  };

// Filter functions registry
const filterFunctions: Record<string, (value: any) => any> = {
  trim: (value: string) => value.trim(),
  toLowerCase: (value: string) => value.toLowerCase(),
  toKebabCase: (value: string) => value.toLowerCase().replace(/\s+/g, '-'),
};

/**
 * Execute a single prompt step
 */
async function executePromptStep(
  step: PromptStep,
  previousAnswers: PromptAnswers,
  templatesConfig?: TemplatesConfig
): Promise<any> {
  // Check condition
  if (step.when && conditionFunctions[step.when]) {
    if (!conditionFunctions[step.when](previousAnswers)) {
      return undefined; // Skip this step
    }
  }

  // Prepare prompt configuration
  const promptConfig: any = {
    type: step.type,
    name: step.name,
    message: step.message,
    default: step.default,
  };

  // Add choices for list/checkbox prompts
  if (
    step.name === 'template' &&
    templatesConfig &&
    (step.type === 'list' || step.type === 'checkbox')
  ) {
    // Special handling for template choices - auto-populate from templates config
    // This takes priority over static choices defined in workflow
    const templateChoices = getTemplateChoices(
      templatesConfig,
      step.templateDisplay
    );
    
    // Debug: Check for duplicates
    const isDebug = process.env.NODE_ENV === 'development' || 
      process.argv.includes('--debug') || 
      process.argv.includes('--verbose');
      
    if (isDebug) {
      console.log(chalk.gray(`\n🔍 Debug: Template choices generation`));
      console.log(chalk.gray(`  Total templates in config: ${templatesConfig.templates.length}`));
      console.log(chalk.gray(`  Generated choices: ${templateChoices.length}`));
      
      // Check for duplicate values
      const values = templateChoices.map(choice => choice.value);
      const uniqueValues = [...new Set(values)];
      if (values.length !== uniqueValues.length) {
        console.log(chalk.yellow(`  ⚠️ Found ${values.length - uniqueValues.length} duplicate choices!`));
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        console.log(chalk.yellow(`  Duplicates: ${duplicates.join(', ')}`));
      }
    }
    
    promptConfig.choices = templateChoices;
  } else if (step.choices && (step.type === 'list' || step.type === 'checkbox')) {
    // Use static choices from workflow step
    promptConfig.choices = step.choices;
  } else if (step.name === 'template' && (step.type === 'list' || step.type === 'checkbox')) {
    // Template step without templates config and without static choices
    throw new Error(
      'Template step requires either static choices in workflow config or templates configuration to be loaded'
    );
  }

  // Add display configuration
  if (step.pageSize) {
    promptConfig.pageSize = step.pageSize;
  }

  if (step.loop !== undefined) {
    promptConfig.loop = step.loop;
  }

  // Add validation
  if (step.validate && validationFunctions[step.validate]) {
    promptConfig.validate = validationFunctions[step.validate];
  }

  // Add filter
  if (step.filter && filterFunctions[step.filter]) {
    promptConfig.filter = filterFunctions[step.filter];
  }

  // Execute the prompt
  const result = await inquirer.prompt([promptConfig]);
  return result[step.name];
}

/**
 * Execute workflow prompts dynamically
 */
export async function executeWorkflowPrompts(
  workflow: WorkflowConfig,
  templatesConfig?: TemplatesConfig
): Promise<PromptAnswers> {
  const answers: PromptAnswers = {};

  console.log(chalk.cyan(`\n🔄 Starting workflow: ${workflow.name}`));
  if (workflow.description) {
    console.log(chalk.gray(workflow.description));
  }
  console.log('');

  for (const step of workflow.steps) {
    try {
      const answer = await executePromptStep(step, answers, templatesConfig);

      // Only store answer if step was not skipped
      if (answer !== undefined) {
        answers[step.name] = answer;
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Error in step "${step.name}": ${error instanceof Error ? error.message : error}`
        )
      );
      throw error;
    }
  }

  return answers;
}

/**
 * Register custom validation function
 */
export function registerValidationFunction(
  name: string,
  fn: (value: any) => boolean | string
): void {
  validationFunctions[name] = fn;
}

/**
 * Register custom condition function
 */
export function registerConditionFunction(
  name: string,
  fn: (answers: PromptAnswers) => boolean
): void {
  conditionFunctions[name] = fn;
}

/**
 * Register custom filter function
 */
export function registerFilterFunction(
  name: string,
  fn: (value: any) => any
): void {
  filterFunctions[name] = fn;
}

/**
 * Get available validation functions
 */
export function getAvailableValidationFunctions(): string[] {
  return Object.keys(validationFunctions);
}

/**
 * Get available condition functions
 */
export function getAvailableConditionFunctions(): string[] {
  return Object.keys(conditionFunctions);
}

/**
 * Get available filter functions
 */
export function getAvailableFilterFunctions(): string[] {
  return Object.keys(filterFunctions);
}

/**
 * Create inquirer prompt from step configuration
 */
export function createInquirerPrompt(step: PromptStep): any {
  const prompt: any = {
    type: step.type,
    name: step.name,
    message: step.message,
  };

  if (step.default !== undefined) {
    prompt.default = step.default;
  }

  if (step.choices && (step.type === 'list' || step.type === 'checkbox')) {
    prompt.choices = step.choices.map((choice) => ({
      name: choice.name,
      value: choice.value,
      short: choice.description,
    }));
  }

  return prompt;
}

/**
 * Validate prompt step configuration
 */
export function validatePromptStep(step: PromptStep): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!step.name) {
    errors.push('Step name is required');
  }

  if (!step.message) {
    errors.push('Step message is required');
  }

  // Check type-specific requirements
  if (step.type === 'list' || step.type === 'checkbox') {
    if (!step.choices || step.choices.length === 0) {
      errors.push(`Step type "${step.type}" requires choices`);
    }
  }

  // Check function references
  if (step.validate && !validationFunctions[step.validate]) {
    errors.push(`Validation function "${step.validate}" not found`);
  }

  if (step.when && !conditionFunctions[step.when]) {
    errors.push(`Condition function "${step.when}" not found`);
  }

  if (step.filter && !filterFunctions[step.filter]) {
    errors.push(`Filter function "${step.filter}" not found`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Execute post-processing steps
 */
export async function executePostProcessing(
  workflow: WorkflowConfig,
  answers: PromptAnswers,
  targetDir: string
): Promise<void> {
  if (!workflow.postProcess) {
    return;
  }

  console.log(chalk.cyan('\n🔧 Executing post-processing steps...'));

  // Execute custom scripts
  if (
    workflow.postProcess.customScripts &&
    workflow.postProcess.customScripts.length > 0
  ) {
    const { execSync } = await import('child_process');

    for (const script of workflow.postProcess.customScripts) {
      try {
        console.log(chalk.gray(`  Running: ${script}`));
        execSync(script, {
          cwd: targetDir,
          stdio: 'inherit',
          env: { ...process.env, ...answers },
        });
      } catch (error) {
        console.error(chalk.red(`❌ Script failed: ${script}`));
        throw error;
      }
    }
  }

  console.log(chalk.green('✅ Post-processing completed'));
}
