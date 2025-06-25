import fs from 'fs-extra';
import path from 'path';
import * as YAML from 'yaml';
import chalk from 'chalk';
import { execSync } from 'child_process';
import {
  WorkflowConfigSchema,
  TemplatesConfigSchema,
  type Config,
  type WorkflowConfig,
  type TemplatesConfig,
  type TemplateConfig,
  type TemplateOption,
} from '../schemas/config.js';

// Default Git repository for configurations and templates
const DEFAULT_CONFIG_REPO =
  'https://github.com/duyvu871/mvp-generate-template.git';
const DEFAULT_BRANCH = 'main';

/**
 * Download file from Git repository
 */
async function downloadFromGit(
  repoUrl: string,
  filePath: string,
  branch = DEFAULT_BRANCH,
  debug = false
): Promise<string | null> {
  try {
    const tempDir = path.join(process.cwd(), '.tmp-mvp-config');

    if (debug) {
      console.log(
        chalk.gray(`🌐 Downloading from Git: ${repoUrl}/${filePath}`)
      );
    }

    // Clone or pull repository
    if (await fs.pathExists(tempDir)) {
      if (debug) {
        console.log(chalk.gray(`📁 Using existing temp directory: ${tempDir}`));
      }
      execSync(`git pull origin ${branch}`, {
        cwd: tempDir,
        stdio: debug ? 'inherit' : 'pipe',
      });
    } else {
      if (debug) {
        console.log(chalk.gray(`📦 Cloning repository to: ${tempDir}`));
      }
      execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} ${tempDir}`, {
        stdio: debug ? 'inherit' : 'pipe',
      });
    }

    const fullPath = path.join(tempDir, filePath);

    if (await fs.pathExists(fullPath)) {
      const content = await fs.readFile(fullPath, 'utf-8');
      if (debug) {
        console.log(chalk.green(`✓ Downloaded: ${filePath}`));
      }
      return content;
    } else {
      if (debug) {
        console.log(chalk.yellow(`⚠️ File not found: ${filePath}`));
      }
      return null;
    }
  } catch (error) {
    if (debug) {
      console.error(
        chalk.red(
          `❌ Git download failed: ${error instanceof Error ? error.message : error}`
        )
      );
    }
    return null;
  }
}

/**
 * Load and validate YAML configuration file from local or Git URL
 */
export async function loadWorkflowConfig(
  configPath: string,
  repoUrl?: string,
  branch?: string
): Promise<WorkflowConfig> {
  try {
    const isDebug =
      process.env.NODE_ENV === 'development' ||
      process.argv.includes('--debug') ||
      process.argv.includes('--verbose');

    let fileContent: string;

    // Check if configPath is a URL or local path
    if (
      configPath.startsWith('http://') ||
      configPath.startsWith('https://') ||
      repoUrl
    ) {
      const gitUrl = repoUrl || DEFAULT_CONFIG_REPO;
      const gitPath = repoUrl ? configPath : `config/${configPath}`;

      if (isDebug) {
        console.log(
          chalk.gray(
            `🌐 Loading workflow config from Git: ${gitUrl}/${gitPath}`
          )
        );
      }

      const content = await downloadFromGit(gitUrl, gitPath, branch, isDebug);
      if (!content) {
        throw new Error(
          `Configuration file not found in Git repository: ${gitPath}`
        );
      }
      fileContent = content;
    } else {
      // Local file
      if (!(await fs.pathExists(configPath))) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }
      fileContent = await fs.readFile(configPath, 'utf-8');
    }

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
 * Load and validate JSON templates configuration from local or Git URL
 */
export async function loadTemplatesConfig(
  configPath: string,
  repoUrl?: string,
  branch?: string
): Promise<TemplatesConfig> {
  try {
    const isDebug =
      process.env.NODE_ENV === 'development' ||
      process.argv.includes('--debug') ||
      process.argv.includes('--verbose');

    let fileContent: string;

    // Check if configPath is a URL or local path
    if (
      configPath.startsWith('http://') ||
      configPath.startsWith('https://') ||
      repoUrl
    ) {
      const gitUrl = repoUrl || DEFAULT_CONFIG_REPO;
      const gitPath = repoUrl ? configPath : `config/${configPath}`;

      if (isDebug) {
        console.log(
          chalk.gray(
            `🌐 Loading templates config from Git: ${gitUrl}/${gitPath}`
          )
        );
      }

      const content = await downloadFromGit(gitUrl, gitPath, branch, isDebug);
      if (!content) {
        throw new Error(
          `Templates configuration file not found in Git repository: ${gitPath}`
        );
      }
      fileContent = content;
    } else {
      // Local file
      if (!(await fs.pathExists(configPath))) {
        throw new Error(
          `Templates configuration file not found: ${configPath}`
        );
      }
      fileContent = await fs.readFile(configPath, 'utf-8');
    }

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
 * Load configuration from multiple sources with Git support
 */
export async function loadConfig(
  workflowPath?: string,
  templatesPath?: string,
  repoUrl?: string,
  branch?: string
): Promise<Config> {
  const config: Config = {};
  const isDebug =
    process.env.NODE_ENV === 'development' ||
    process.argv.includes('--debug') ||
    process.argv.includes('--verbose');

  if (isDebug) {
    console.log(chalk.gray('\n🔍 Debug: Configuration loading...'));
    if (repoUrl) {
      console.log(chalk.gray(`  Repository: ${repoUrl}`));
      console.log(chalk.gray(`  Branch: ${branch || DEFAULT_BRANCH}`));
    }
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
      config.workflow = await loadWorkflowConfig(workflowPath, repoUrl, branch);
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
      config.templates = await loadTemplatesConfig(
        templatesPath,
        repoUrl,
        branch
      );
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
 * Find configuration files in standard locations (local and Git)
 */
export async function findConfigFiles(
  rootDir: string,
  repoUrl?: string,
  branch?: string
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
    if (repoUrl) {
      console.log(chalk.gray(`  Also checking Git repository: ${repoUrl}`));
    }
  }

  // Local workflow config locations (YAML)
  const workflowPaths = [
    'mvp-gen.yml',
    'mvp-gen.yaml',
    '.mvp-gen.yml',
    '.mvp-gen.yaml',
    'config/workflow.yml',
    'config/workflow.yaml',
  ];

  // Local templates config locations (JSON)
  const templatesPaths = [
    'templates.json',
    '.templates.json',
    'config/templates.json',
    'templates/config.json',
  ];

  if (isDebug) {
    console.log(chalk.gray('  Checking local workflow paths:'));
    workflowPaths.forEach((p) =>
      console.log(chalk.gray(`    ${path.join(rootDir, p)}`))
    );
  }

  // Check local workflow files first
  for (const workflowPath of workflowPaths) {
    const fullPath = path.join(rootDir, workflowPath);
    if (await fs.pathExists(fullPath)) {
      configFiles.workflow = fullPath;
      if (isDebug) {
        console.log(chalk.green(`    ✓ Found local: ${fullPath}`));
      }
      break;
    }
  }

  // If no local workflow found and Git repo provided, try Git
  if (!configFiles.workflow && repoUrl) {
    for (const workflowPath of workflowPaths) {
      const content = await downloadFromGit(
        repoUrl,
        workflowPath,
        branch,
        isDebug
      );
      if (content) {
        configFiles.workflow = workflowPath;
        if (isDebug) {
          console.log(chalk.green(`    ✓ Found in Git: ${workflowPath}`));
        }
        break;
      }
    }
  }

  if (isDebug) {
    console.log(chalk.gray('  Checking local templates paths:'));
    templatesPaths.forEach((p) =>
      console.log(chalk.gray(`    ${path.join(rootDir, p)}`))
    );
  }

  // Check local templates files first
  for (const templatesPath of templatesPaths) {
    const fullPath = path.join(rootDir, templatesPath);
    if (await fs.pathExists(fullPath)) {
      configFiles.templates = fullPath;
      if (isDebug) {
        console.log(chalk.green(`    ✓ Found local: ${fullPath}`));
      }
      break;
    }
  }

  // If no local templates found and Git repo provided, try Git
  if (!configFiles.templates && repoUrl) {
    for (const templatesPath of templatesPaths) {
      const content = await downloadFromGit(
        repoUrl,
        templatesPath,
        branch,
        isDebug
      );
      if (content) {
        configFiles.templates = templatesPath;
        if (isDebug) {
          console.log(chalk.green(`    ✓ Found in Git: ${templatesPath}`));
        }
        break;
      }
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
 * Download and extract templates from Git repository
 */
export async function downloadTemplatesFromGit(
  templatePath: string,
  targetDir: string,
  repoUrl = DEFAULT_CONFIG_REPO,
  branch = DEFAULT_BRANCH,
  debug = false
): Promise<void> {
  try {
    const tempDir = path.join(process.cwd(), '.tmp-mvp-templates');

    if (debug) {
      console.log(
        chalk.gray(
          `🌐 Downloading template from Git: ${repoUrl}/templates/${templatePath}`
        )
      );
    }

    // Clone or pull repository
    if (await fs.pathExists(tempDir)) {
      if (debug) {
        console.log(chalk.gray(`📁 Using existing temp directory: ${tempDir}`));
      }
      execSync(`git pull origin ${branch}`, {
        cwd: tempDir,
        stdio: debug ? 'inherit' : 'pipe',
      });
    } else {
      if (debug) {
        console.log(chalk.gray(`📦 Cloning repository to: ${tempDir}`));
      }
      execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} ${tempDir}`, {
        stdio: debug ? 'inherit' : 'pipe',
      });
    }

    const sourceDir = path.join(tempDir, 'templates', templatePath);

    if (!(await fs.pathExists(sourceDir))) {
      throw new Error(`Template "${templatePath}" not found in repository`);
    }

    // Copy template to target directory
    await fs.copy(sourceDir, targetDir);

    if (debug) {
      console.log(
        chalk.green(`✓ Template copied: ${templatePath} → ${targetDir}`)
      );
    }

    // Clean up temp directory if not in debug mode
    if (!debug) {
      await fs.remove(tempDir);
    }
  } catch (error) {
    if (debug) {
      console.error(
        chalk.red(
          `❌ Template download failed: ${error instanceof Error ? error.message : error}`
        )
      );
    }
    throw error;
  }
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
