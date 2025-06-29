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
  downloadTemplateFilesFromGitHub,
  getTemplateConfig,
  filterTemplatesByOptions,
  getTemplateChoices,
  createDefaultWorkflowConfig,
  createDefaultTemplatesConfig,
  cleanCache,
  getCacheInfo,
  getPackageInfo,
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
  local?: boolean;
  debug?: boolean;
  verbose?: boolean;
};

export function initCommand(program: Command) {
  // Get repository info for help text
  const packageInfo = getPackageInfo();

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
    .option(
      '-b, --branch <n>',
      `Git branch to use (default: ${packageInfo.defaultBranch || 'main'})`
    )
    .option(
      '-l, --local',
      'Use local files first instead of Git repository (legacy mode)'
    )
    .option('--debug', 'Show detailed debug information')
    .option('--verbose', 'Show verbose output')
    .addHelpText(
      'after',
      `
Examples:
  $ mvp-gen init my-project          Create project (uses GitHub raw downloads)
  $ mvp-gen init . --local           Create project using local files only
  $ mvp-gen init ./                  Create project in current directory
  $ mvp-gen init my-app -t express-hbs --typescript --esbuild --install
  $ mvp-gen init . --template express-api --typescript
  $ mvp-gen init my-project --workflow ./custom-workflow.yml --local
  $ mvp-gen init my-app --workflow config/workflow.yml --templates config/templates.json
  $ mvp-gen init my-project --repo https://github.com/user/config-repo.git
  $ mvp-gen init my-app --repo https://github.com/user/repo.git --branch develop
  $ mvp-gen init my-project --debug  Show debug information
  
Download Behavior:
  - Default: Uses GitHub raw API for direct file downloads (fast and always up-to-date)
  - --local: Uses local files first (legacy v0.2.0 behavior)
  
Default Repository:
  - ${packageInfo.defaultRepo || 'https://github.com/duyvu871/mvp-generate-template.git'} (branch: ${packageInfo.defaultBranch || 'main'})
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

  const isDebug =
    process.env.NODE_ENV === 'development' || options.debug || options.verbose;

  // Get repository information from package.json
  const packageInfo = getPackageInfo();
  const defaultRepoUrl =
    options.repo ||
    packageInfo.defaultRepo ||
    'https://github.com/duyvu871/mvp-generate-template.git';
  const defaultBranch = options.branch || packageInfo.defaultBranch || 'main';

  if (isDebug) {
    console.log(chalk.cyan('\n🚀 MVP Generator - GitHub Raw Downloads'));
    console.log(
      chalk.gray(
        `Strategy: ${options.local ? 'Local First (Legacy)' : 'GitHub Raw Downloads (Default)'}`
      )
    );
    console.log(chalk.gray(`Repository: ${defaultRepoUrl}`));
    console.log(chalk.gray(`Branch: ${defaultBranch}`));
  }

  // Load configuration files with Git-first approach
  try {
    if (options.workflow || options.templates) {
      // Use specific config files
      globalConfig = await loadConfig(
        options.workflow,
        options.templates,
        defaultRepoUrl,
        defaultBranch,
        options.local || false
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
        defaultRepoUrl,
        defaultBranch,
        options.local || false
      );
      globalConfig = await loadConfig(
        configFiles.workflow,
        configFiles.templates,
        defaultRepoUrl,
        defaultBranch,
        options.local || false
      );
    } else {
      // Auto-discover config files with Git-first approach
      const configFiles = await findConfigFiles(
        rootDir,
        defaultRepoUrl,
        defaultBranch,
        options.local || false
      );
      globalConfig = await loadConfig(
        configFiles.workflow,
        configFiles.templates,
        defaultRepoUrl,
        defaultBranch,
        options.local || false
      );
    }

    workflowConfig = globalConfig.workflow;
    templatesConfig = globalConfig.templates;

    if (isDebug) {
      if (workflowConfig) {
        console.log(
          chalk.green(`✅ Workflow configuration loaded successfully`)
        );
      }
      if (templatesConfig) {
        console.log(
          chalk.green(`✅ Templates configuration loaded successfully`)
        );
        console.log(
          chalk.gray(
            `   Available templates: ${templatesConfig.templates.length}`
          )
        );
      }
    }
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
    npmInstall: Boolean(answers.npmInstall),
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
      templatePath = getTemplateName(answers.template as string, projectConfig);
      spinner.text = 'Using fallback template structure...';
    }

    // Download template files using GitHub raw API
    if (options.repo) {
      if (isDebug) {
        console.log(
          chalk.blue(
            '\n📥 Downloading template files from specified repository...'
          )
        );
      }

      await downloadTemplateFilesFromGitHub(
        templatePath,
        targetDir,
        options.repo,
        options.branch || defaultBranch,
        isDebug
      );
    } else if (!options.local) {
      // Use repository from package.json for GitHub raw downloads
      if (isDebug) {
        console.log(
          chalk.blue(
            '\n📥 Downloading template files from package repository...'
          )
        );
      }

      await downloadTemplateFilesFromGitHub(
        templatePath,
        targetDir,
        defaultRepoUrl,
        defaultBranch,
        isDebug
      );
    } else {
      // Fallback to local templates when --local flag is used
      const localTemplatePath = path.join(
        process.cwd(),
        'templates',
        templatePath
      );
      if (await fs.pathExists(localTemplatePath)) {
        await fs.copy(localTemplatePath, targetDir);
        if (isDebug) {
          console.log(chalk.green(`✓ Copied local template: ${templatePath}`));
        }
      } else {
        throw new Error(`Local template not found: ${templatePath}`);
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
      if (workflowConfig.postProcess) {
        console.log(chalk.cyan('\n🔧 Executing post-processing steps...'));

        if (
          workflowConfig.postProcess.customScripts &&
          workflowConfig.postProcess.customScripts.length > 0
        ) {
          const { execSync } = await import('child_process');

          for (const script of workflowConfig.postProcess.customScripts) {
            try {
              console.log(chalk.gray(`  Running: ${script}`));
              execSync(script, {
                cwd: targetDir,
                stdio: 'inherit',
                env: {
                  ...process.env,
                  // Convert answers to string environment variables
                  ...Object.fromEntries(
                    Object.entries(answers).map(([key, value]) => [
                      key,
                      typeof value === 'string' ? value : String(value),
                    ])
                  ),
                },
              });
            } catch (error) {
              console.error(chalk.red(`❌ Script failed: ${script}`));
              throw error;
            }
          }
        }

        console.log(chalk.green('✅ Post-processing completed'));
      }
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
