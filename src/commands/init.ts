import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { displayWelcome } from '../utils/ascii.js';
import {
  determineTemplate,
  confirmTypeScript,
  confirmESBuild,
  confirmNpmInstall,
} from '../utils/prompts.js';
import {
  getTemplateName,
  updatePackageJson,
  installDependencies,
  printNextSteps,
} from '../utils/project.js';
import {
  loadConfig,
  findConfigFiles,
  createDefaultWorkflowConfig,
  createDefaultTemplatesConfig,
  getTemplateConfig,
  downloadTemplatesFromGit,
} from '../utils/config.js';
import {
  executeWorkflowPrompts,
  executePostProcessing,
  type PromptAnswers,
} from '../utils/dynamic-prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find the package root and templates directory
function getTemplatesPath(): string {
  // When running from dist/cli.js, go up to package root
  let currentDir = __dirname;

  // Keep going up until we find package.json or templates directory
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    const templatesDir = path.join(currentDir, 'templates');

    if (fs.existsSync(packageJsonPath) && fs.existsSync(templatesDir)) {
      return templatesDir;
    }

    currentDir = path.dirname(currentDir);
  }

  // Fallback to relative path from current file
  return path.join(__dirname, '../../templates');
}

type InitOptions = {
  template?: string;
  typescript?: boolean;
  esbuild?: boolean;
  install?: boolean;
  config?: string;
  workflow?: string;
  templates?: string;
  repo?: string;
  branch?: string;
  debug?: boolean;
  verbose?: boolean;
};

export function initCommand(program: Command) {
  program
    .command('init <project-name>')
    .description(
      'Initialize a new project (use "." or "./" for current directory)'
    )
    .option('-t, --template <template>', 'Project template to use')
    .option('-ts, --typescript', 'Add TypeScript support')
    .option('-es, --esbuild', 'Add ESBuild configuration')
    .option('-i, --install', 'Install dependencies automatically')
    .option('-c, --config <path>', 'Use specific configuration file')
    .option('-w, --workflow <path>', 'Use specific workflow YAML file')
    .option('--templates <path>', 'Use specific templates JSON file')
    .option(
      '-r, --repo <url>',
      'Git repository URL for configurations and templates'
    )
    .option('-b, --branch <name>', 'Git branch to use (default: main)')
    .option('--debug', 'Show detailed debug information')
    .option('--verbose', 'Show verbose output')
    .addHelpText(
      'after',
      `
Examples:
  $ mvp-gen init my-project          Create project in new directory
  $ mvp-gen init .                   Create project in current directory
  $ mvp-gen init ./                  Create project in current directory
  $ mvp-gen init my-app -t express-hbs --typescript --esbuild --install
  $ mvp-gen init . --template express-api --typescript
  $ mvp-gen init my-project --config ./custom-config.yml
  $ mvp-gen init my-app --workflow ./workflow.yml --templates ./templates.json
  $ mvp-gen init my-project --repo https://github.com/user/config-repo.git
  $ mvp-gen init my-app --repo https://github.com/user/repo.git --branch develop
  $ mvp-gen init my-project --debug  Show debug information
    `
    )
    .action(async (projectName: string, options: InitOptions) => {
      try {
        // Display welcome message
        displayWelcome();
        await initializeProject(projectName, options);
      } catch (error) {
        console.error(
          chalk.red('Error:'),
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });
}

async function initializeProject(projectName: string, options: InitOptions) {
  // Handle current directory cases
  let targetDir: string;
  let actualProjectName: string;

  if (projectName === '.' || projectName === './') {
    // Use current directory
    targetDir = process.cwd();
    actualProjectName = path.basename(targetDir);

    // Check if current directory is empty or only has common files
    const files = await fs.readdir(targetDir);
    const allowedFiles = [
      '.git',
      '.gitignore',
      'README.md',
      '.DS_Store',
      'Thumbs.db',
      'mvp-gen.yml',
      'mvp-gen.yaml',
      '.mvp-gen.yml',
      '.mvp-gen.yaml',
      'templates.json',
      '.templates.json',
    ];
    const nonAllowedFiles = files.filter(
      (file) => !allowedFiles.includes(file)
    );

    if (nonAllowedFiles.length > 0) {
      throw new Error(
        `Current directory is not empty! Found files: ${nonAllowedFiles.join(', ')}\nPlease use an empty directory or specify a new project name.`
      );
    }
  } else {
    // Use specified project name
    targetDir = path.resolve(process.cwd(), projectName);
    actualProjectName = projectName;

    // Check if directory exists
    if (await fs.pathExists(targetDir)) {
      throw new Error(`Directory "${targetDir}" already exists!`);
    }
  }

  const rootDir = process.cwd();
  let globalConfig;
  let workflowConfig;
  let templatesConfig;

  // Load configuration files with Git support
  try {
    if (options.workflow || options.templates) {
      // Use specific config files
      globalConfig = await loadConfig(
        options.workflow,
        options.templates,
        options.repo,
        options.branch
      );
    } else if (options.config) {
      // Use unified config file (not implemented yet, for future)
      console.log(
        chalk.yellow(
          '⚠️ Unified config files not yet supported. Using workflow and templates separately.'
        )
      );
      const configFiles = await findConfigFiles(
        rootDir,
        options.repo,
        options.branch
      );
      globalConfig = await loadConfig(
        configFiles.workflow,
        configFiles.templates,
        options.repo,
        options.branch
      );
    } else {
      // Auto-discover config files
      const configFiles = await findConfigFiles(
        rootDir,
        options.repo,
        options.branch
      );
      globalConfig = await loadConfig(
        configFiles.workflow,
        configFiles.templates,
        options.repo,
        options.branch
      );
    }

    workflowConfig = globalConfig.workflow;
    templatesConfig = globalConfig.templates;
  } catch (error) {
    console.warn(
      chalk.yellow(
        `⚠️ Configuration loading failed: ${error instanceof Error ? error.message : error}`
      )
    );
    console.log(chalk.gray('Using default configuration...'));
  }

  // Use default configs if not loaded
  if (!workflowConfig) {
    workflowConfig = createDefaultWorkflowConfig();
  }
  if (!templatesConfig) {
    templatesConfig = createDefaultTemplatesConfig();
  }

  // Get user preferences through dynamic prompts or CLI options
  let answers: PromptAnswers;

  if (
    options.template ||
    options.typescript !== undefined ||
    options.esbuild !== undefined ||
    options.install !== undefined
  ) {
    // Use CLI options (non-interactive mode)
    console.log(chalk.cyan('\n🤖 Using CLI options (non-interactive mode)'));

    answers = {
      template: options.template || (await determineTemplate()),
      typescript: options.typescript ?? (await confirmTypeScript()),
      esbuild: options.esbuild ?? (await confirmESBuild()),
      npmInstall: options.install ?? (await confirmNpmInstall()),
    };
  } else {
    // Use dynamic workflow prompts
    try {
      answers = await executeWorkflowPrompts(workflowConfig, templatesConfig);
    } catch (error) {
      console.warn(
        chalk.yellow(
          `⚠️ Workflow execution failed: ${error instanceof Error ? error.message : error}`
        )
      );
      console.log(chalk.gray('Falling back to default prompts...'));

      // Fallback to original prompts
      answers = {
        template: await determineTemplate(),
        typescript: await confirmTypeScript(),
        esbuild: await confirmESBuild(),
        npmInstall: await confirmNpmInstall(),
      };
    }
  }

  // Get template configuration to determine TypeScript and ESBuild settings
  const selectedTemplateConfig = getTemplateConfig(
    templatesConfig,
    answers.template
  );

  const isDebug =
    process.env.NODE_ENV === 'development' || options.debug || options.verbose;

  if (isDebug) {
    console.log(chalk.gray('\n🔍 Debug: Template configuration'));
    console.log(chalk.gray(`  Selected template: ${answers.template}`));
    if (selectedTemplateConfig) {
      console.log(
        chalk.gray(`  Template name: ${selectedTemplateConfig.name}`)
      );
      console.log(
        chalk.gray(`  Template path: ${selectedTemplateConfig.path}`)
      );
      console.log(
        chalk.gray(
          `  Template options: ${selectedTemplateConfig.options.join(', ')}`
        )
      );
      console.log(
        chalk.gray(
          `  TypeScript: ${selectedTemplateConfig.options.includes('ts')}`
        )
      );
      console.log(
        chalk.gray(
          `  ESBuild: ${selectedTemplateConfig.options.includes('esbuild')}`
        )
      );
    } else {
      console.log(
        chalk.yellow(`  ⚠️ Template config not found, using fallback`)
      );
    }
  }

  const projectConfig = {
    typescript: selectedTemplateConfig?.options.includes('ts') || false,
    esbuild: selectedTemplateConfig?.options.includes('esbuild') || false,
    npmInstall: answers.npmInstall || false,
  };

  if (isDebug) {
    console.log(chalk.gray('\n🔍 Debug: Final project configuration'));
    console.log(chalk.gray(`  TypeScript: ${projectConfig.typescript}`));
    console.log(chalk.gray(`  ESBuild: ${projectConfig.esbuild}`));
    console.log(chalk.gray(`  NPM Install: ${projectConfig.npmInstall}`));
  }

  const spinner = ora('Creating project...').start();

  try {
    // Create project directory (only when not current directory)
    if (projectName !== '.' && projectName !== './') {
      await fs.ensureDir(targetDir);
    }

    // Get template configuration
    let templatePath: string;

    if (selectedTemplateConfig) {
      // Use configured template path
      templatePath = selectedTemplateConfig.path;
      spinner.text = `Using template: ${selectedTemplateConfig.name}`;
    } else {
      // Fallback to template name resolution
      templatePath = getTemplateName(answers.template, projectConfig);
      spinner.text = 'Using fallback template structure...';
    }

    // Try downloading from Git first if repo URL provided
    if (options.repo) {
      try {
        spinner.text = `Downloading template from Git repository...`;
        await downloadTemplatesFromGit(
          templatePath,
          targetDir,
          options.repo,
          options.branch,
          isDebug
        );
      } catch (error) {
        console.warn(
          chalk.yellow(
            `⚠️ Git template download failed: ${error instanceof Error ? error.message : error}`
          )
        );
        console.log(chalk.gray('Falling back to local templates...'));

        // Fallback to local templates
        const templatesDir = getTemplatesPath();
        const fullTemplatePath = path.join(templatesDir, templatePath);

        if (await fs.pathExists(fullTemplatePath)) {
          await fs.copy(fullTemplatePath, targetDir);
        } else {
          throw new Error(
            `Template "${templatePath}" not found locally or in Git repository`
          );
        }
      }
    } else {
      // Use local templates
      const templatesDir = getTemplatesPath();
      const fullTemplatePath = path.join(templatesDir, templatePath);

      // Verify template exists
      if (!(await fs.pathExists(fullTemplatePath))) {
        // Try fallback template structure
        const fallbackTemplatePath = path.join(templatesDir, answers.template);
        if (await fs.pathExists(fallbackTemplatePath)) {
          spinner.text = 'Using legacy template structure...';
          await fs.copy(fallbackTemplatePath, targetDir);
        } else {
          throw new Error(
            `Template "${templatePath}" not found at ${fullTemplatePath}\nAlso tried fallback: ${fallbackTemplatePath}\nConsider using --repo option to download from Git`
          );
        }
      } else {
        await fs.copy(fullTemplatePath, targetDir);
      }
    }

    spinner.text = 'Updating configuration...';

    // Update package.json with project name
    await updatePackageJson(targetDir, actualProjectName, projectConfig);

    spinner.succeed(
      chalk.green(`Project "${actualProjectName}" created successfully!`)
    );

    // Install dependencies if requested
    if (projectConfig.npmInstall) {
      await installDependencies(targetDir, projectConfig);
    }

    // Execute post-processing steps
    try {
      await executePostProcessing(workflowConfig, answers, targetDir);
    } catch (error) {
      console.warn(
        chalk.yellow(
          `⚠️ Post-processing failed: ${error instanceof Error ? error.message : error}`
        )
      );
    }

    // Print next steps with appropriate information
    if (projectName === '.' || projectName === './') {
      printCurrentDirectoryNextSteps(actualProjectName, projectConfig);
    } else {
      printNextSteps(actualProjectName, projectConfig);
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    throw error;
  }
}

// Function to print next steps for current directory initialization
function printCurrentDirectoryNextSteps(
  projectName: string,
  options: { typescript: boolean; esbuild: boolean; npmInstall: boolean }
) {
  console.log('\n' + chalk.cyan('🎉 Next steps:'));

  if (!options.npmInstall) {
    console.log(chalk.gray('  # Install dependencies'));
    console.log(chalk.white('  npm install'));
    console.log('');
  }

  console.log(chalk.gray('  # Start development server'));
  if (options.esbuild) {
    console.log(chalk.white('  npm run dev'));
  } else {
    console.log(chalk.white('  npm start'));
  }
  console.log('');

  if (options.esbuild) {
    console.log(chalk.gray('  # Build for production'));
    console.log(chalk.white('  npm run build'));
    console.log('');
  }

  if (options.typescript) {
    console.log(chalk.gray('  # Type check'));
    console.log(chalk.white('  npm run typecheck'));
    console.log('');
  }

  console.log(chalk.green('Happy coding! 🚀'));
}

// ... (Các hàm hỗ trợ khác tương tự như trước)
