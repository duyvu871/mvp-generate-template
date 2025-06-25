import fs from 'fs-extra';
import path from 'path';
import * as YAML from 'yaml';
import chalk from 'chalk';
import {
  WorkflowConfigSchema,
  TemplatesConfigSchema,
  type Config,
  type WorkflowConfig,
  type TemplatesConfig,
  type TemplateConfig,
  type TemplateOption,
} from '../schemas/config.js';

/**
 * Load and validate YAML configuration file
 */
export async function loadWorkflowConfig(
  configPath: string
): Promise<WorkflowConfig> {
  try {
    if (!(await fs.pathExists(configPath))) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    const fileContent = await fs.readFile(configPath, 'utf-8');
    const parsedYaml = YAML.parse(fileContent);

    // Validate with Zod schema
    const result = WorkflowConfigSchema.safeParse(parsedYaml);

    if (!result.success) {
      console.error(chalk.red('❌ Invalid YAML configuration:'));
      result.error.errors.forEach((error) => {
        console.error(
          chalk.red(`  • ${error.path.join('.')}: ${error.message}`)
        );
      });
      throw new Error('Configuration validation failed');
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to load workflow config: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load and validate JSON templates configuration
 */
export async function loadTemplatesConfig(
  configPath: string
): Promise<TemplatesConfig> {
  try {
    if (!(await fs.pathExists(configPath))) {
      throw new Error(`Templates configuration file not found: ${configPath}`);
    }

    const fileContent = await fs.readFile(configPath, 'utf-8');
    const parsedJson = JSON.parse(fileContent);

    // Validate with Zod schema
    const result = TemplatesConfigSchema.safeParse(parsedJson);

    if (!result.success) {
      console.error(chalk.red('❌ Invalid JSON templates configuration:'));
      result.error.errors.forEach((error) => {
        console.error(
          chalk.red(`  • ${error.path.join('.')}: ${error.message}`)
        );
      });
      throw new Error('Templates configuration validation failed');
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to load templates config: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load configuration from multiple sources
 */
export async function loadConfig(
  workflowPath?: string,
  templatesPath?: string
): Promise<Config> {
  const config: Config = {};
  const isDebug =
    process.env.NODE_ENV === 'development' ||
    process.argv.includes('--debug') ||
    process.argv.includes('--verbose');

  if (isDebug) {
    console.log(chalk.gray('\n🔍 Debug: Configuration loading...'));
    if (workflowPath) {
      console.log(chalk.gray(`  Workflow: ${workflowPath}`));
    }
    if (templatesPath) {
      console.log(chalk.gray(`  Templates: ${templatesPath}`));
    }
  }

  // Load workflow config (YAML)
  if (workflowPath) {
    try {
      config.workflow = await loadWorkflowConfig(workflowPath);
      if (isDebug) {
        console.log(chalk.green(`✓ Loaded workflow config: ${workflowPath}`));
      }
    } catch (error: unknown) {
      console.error(
        chalk.red(
          `❌ Failed to load workflow config: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  }

  // Load templates config (JSON)
  if (templatesPath) {
    try {
      config.templates = await loadTemplatesConfig(templatesPath);
      if (isDebug) {
        console.log(chalk.green(`✓ Loaded templates config: ${templatesPath}`));
      }
    } catch (error: unknown) {
      console.error(
        chalk.red(
          `❌ Failed to load templates config: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  }

  if (isDebug && Object.keys(config).length === 0) {
    console.log(
      chalk.yellow('⚠️ No configuration files loaded, using defaults')
    );
  }

  return config;
}

/**
 * Find configuration files in standard locations
 */
export async function findConfigFiles(
  rootDir: string
): Promise<{ workflow?: string; templates?: string }> {
  const isDebug =
    process.env.NODE_ENV === 'development' ||
    process.argv.includes('--debug') ||
    process.argv.includes('--verbose');

  const configFiles = {
    workflow: undefined as string | undefined,
    templates: undefined as string | undefined,
  };

  if (isDebug) {
    console.log(
      chalk.gray(`\n🔍 Debug: Searching for config files in ${rootDir}`)
    );
  }

  // Standard workflow config locations (YAML)
  const workflowPaths = [
    path.join(rootDir, 'mvp-gen.yml'),
    path.join(rootDir, 'mvp-gen.yaml'),
    path.join(rootDir, '.mvp-gen.yml'),
    path.join(rootDir, '.mvp-gen.yaml'),
    path.join(rootDir, 'config', 'workflow.yml'),
    path.join(rootDir, 'config', 'workflow.yaml'),
  ];

  if (isDebug) {
    console.log(chalk.gray('  Checking workflow paths:'));
    workflowPaths.forEach((p) => console.log(chalk.gray(`    ${p}`)));
  }

  for (const workflowPath of workflowPaths) {
    if (await fs.pathExists(workflowPath)) {
      configFiles.workflow = workflowPath;
      if (isDebug) {
        console.log(chalk.green(`    ✓ Found: ${workflowPath}`));
      }
      break;
    }
  }

  // Standard templates config locations (JSON)
  const templatesPaths = [
    path.join(rootDir, 'templates.json'),
    path.join(rootDir, '.templates.json'),
    path.join(rootDir, 'config', 'templates.json'),
    path.join(rootDir, 'templates', 'config.json'),
  ];

  if (isDebug) {
    console.log(chalk.gray('  Checking templates paths:'));
    templatesPaths.forEach((p) => console.log(chalk.gray(`    ${p}`)));
  }

  for (const templatesPath of templatesPaths) {
    if (await fs.pathExists(templatesPath)) {
      configFiles.templates = templatesPath;
      if (isDebug) {
        console.log(chalk.green(`    ✓ Found: ${templatesPath}`));
      }
      break;
    }
  }

  if (isDebug) {
    console.log(chalk.gray('\n  Discovery results:'));
    console.log(
      chalk.gray(`    Workflow: ${configFiles.workflow || 'not found'}`)
    );
    console.log(
      chalk.gray(`    Templates: ${configFiles.templates || 'not found'}`)
    );
  }

  return configFiles;
}

/**
 * Get template configuration by name
 */
export function getTemplateConfig(
  templates: TemplatesConfig,
  templateName: string
): TemplateConfig | null {
  return (
    templates.templates.find(
      (t: TemplateConfig) => t.name === templateName || t.path === templateName
    ) || null
  );
}

/**
 * Filter templates by options
 */
export function filterTemplatesByOptions(
  templates: TemplatesConfig,
  requiredOptions: string[]
): TemplateConfig[] {
  return templates.templates.filter((template: TemplateConfig) => {
    // Check if template supports all required options
    return requiredOptions.every((option) =>
      template.options.includes(option as TemplateOption)
    );
  });
}

/**
 * Get available template choices for inquirer with display configuration
 */
export function getTemplateChoices(
  templates: TemplatesConfig,
  displayConfig?: {
    showDescription?: boolean;
    showCategory?: boolean;
    showOptions?: boolean;
    maxWidth?: number;
    separator?: string;
  }
): Array<{ name: string; value: string; description?: string }> {
  const config = {
    showDescription: true,
    showCategory: false,
    showOptions: true,
    maxWidth: 200,
    separator: ' - ',
    ...displayConfig,
  };

  return templates.templates
    .filter((template: TemplateConfig) => !template.deprecated)
    .sort(
      (a: TemplateConfig, b: TemplateConfig) =>
        (b.priority || 0) - (a.priority || 0)
    )
    .map((template: TemplateConfig) => {
      let displayName = `${template.experimental ? '🧪 ' : ''}${template.name}`;

      // Add category if enabled
      if (config.showCategory && template.category) {
        displayName = `[${template.category.toUpperCase()}] ${displayName}`;
      }

      // Add options if enabled
      if (config.showOptions && template.options.length > 0) {
        const optionsStr = template.options
          .map((opt) => {
            switch (opt) {
              case 'ts':
                return 'TypeScript';
              case 'esbuild':
                return 'ESBuild';
              case 'nextjs':
                return 'Next.js';
              case 'react':
                return 'React';
              case 'vue':
                return 'Vue';
              case 'docker':
                return 'Docker';
              case 'mongodb':
                return 'MongoDB';
              case 'postgresql':
                return 'PostgreSQL';
              default:
                return opt;
            }
          })
          .join(' + ');
        displayName = `${displayName} (${optionsStr})`;
      }

      // Add description on new line with gray color if enabled
      if (config.showDescription && template.description) {
        displayName = `${displayName}\n  ${chalk.gray(template.description)}`;
      }

      return {
        name: displayName,
        value: template.path,
        description: template.description,
      };
    });
}

/**
 * Validate template path exists
 */
export async function validateTemplatePath(
  templatePath: string,
  rootDir: string
): Promise<boolean> {
  const fullPath = path.join(rootDir, 'templates', templatePath);
  return await fs.pathExists(fullPath);
}

/**
 * Create default workflow configuration
 */
export function createDefaultWorkflowConfig(): WorkflowConfig {
  return {
    version: '1.0.0',
    name: 'Default MVP Generator Workflow',
    description: 'Standard project generation workflow',
    steps: [
      {
        type: 'list',
        name: 'template',
        message: 'Select a project template:',
        choices: [
          { name: '🌐 Express + Handlebars', value: 'express-hbs' },
          { name: '⚡ Express API', value: 'express-api' },
          { name: '📦 Node.js CLI Tool', value: 'node-cli' },
          { name: '🏗️ Basic Node.js', value: 'basic-node' },
        ],
        required: false,
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Add TypeScript support?',
        default: true,
        required: false,
      },
      {
        type: 'confirm',
        name: 'esbuild',
        message: 'Add ESBuild for fast compilation?',
        default: true,
        required: false,
      },
      {
        type: 'confirm',
        name: 'npmInstall',
        message: 'Install dependencies automatically?',
        default: true,
        required: false,
      },
    ],
    postProcess: {
      updatePackageJson: true,
      installDependencies: false,
      customScripts: [],
    },
  };
}

/**
 * Create default templates configuration
 */
export function createDefaultTemplatesConfig(): TemplatesConfig {
  return {
    version: '1.0.0',
    templates: [
      {
        path: 'express-hbs',
        name: 'Express + Handlebars',
        description: 'Full-stack web application with Express and Handlebars',
        options: ['ts', 'esbuild'],
        category: 'web',
        priority: 100,
        deprecated: false,
        experimental: false,
      },
      {
        path: 'express-api',
        name: 'Express API',
        description: 'RESTful API server with Express',
        options: ['ts', 'esbuild'],
        category: 'api',
        priority: 90,
        deprecated: false,
        experimental: false,
      },
      {
        path: 'node-cli',
        name: 'Node.js CLI Tool',
        description: 'Command-line application template',
        options: ['ts', 'esbuild'],
        category: 'cli',
        priority: 80,
        deprecated: false,
        experimental: false,
      },
      {
        path: 'basic-node',
        name: 'Basic Node.js',
        description: 'Minimal Node.js project',
        options: ['ts', 'esbuild'],
        category: 'basic',
        priority: 70,
        deprecated: false,
        experimental: false,
      },
    ],
    defaultOptions: {
      typescript: true,
      esbuild: true,
      npmInstall: true,
    },
  };
}
