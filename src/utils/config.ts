import fs from 'fs-extra';
import path from 'path';
import * as YAML from 'yaml';
import chalk from 'chalk';
import { execSync } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';
import {
  WorkflowConfigSchema,
  TemplatesConfigSchema,
  type Config,
  type WorkflowConfig,
  type TemplatesConfig,
  type TemplateConfig,
  type TemplateOption,
} from '../schemas/config.js';
import {
  downloadFromGitHubRaw,
  isGitHubRepository,
  convertToGitHubRawUrl,
} from './github-raw.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get package.json information
 */
export function getPackageInfo(): {
  repository?: { url: string; branch?: string };
  defaultRepo?: string;
  defaultBranch?: string;
} {
  try {
    // Find package.json from current directory or parent directories
    let currentDir = path.dirname(path.dirname(__dirname)); // Go up from src/utils to project root

    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8')
        );

        if (packageJson.repository) {
          const repo = packageJson.repository;
          const repoUrl = typeof repo === 'string' ? repo : repo.url;
          const branch = typeof repo === 'object' ? repo.branch : 'main';

          return {
            repository: { url: repoUrl, branch },
            defaultRepo: repoUrl,
            defaultBranch: branch || 'main',
          };
        }
        break;
      }
      currentDir = path.dirname(currentDir);
    }

    // Fallback if no package.json found
    return {
      defaultRepo: 'https://github.com/duyvu871/mvp-generate-template.git',
      defaultBranch: 'main',
    };
  } catch (error) {
    // Fallback on error
    return {
      defaultRepo: 'https://github.com/duyvu871/mvp-generate-template.git',
      defaultBranch: 'main',
    };
  }
}

// Get package info on module load
const packageInfo = getPackageInfo();
const DEFAULT_CONFIG_REPO =
  packageInfo.defaultRepo ||
  'https://github.com/duyvu871/mvp-generate-template.git';
const DEFAULT_BRANCH = packageInfo.defaultBranch || 'main';

/**
 * Get appropriate cache directory for the platform
 */
function getCacheDirectory(): string {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case 'win32':
      return path.join(
        process.env.LOCALAPPDATA || path.join(homeDir, 'AppData', 'Local'),
        'mvp-generate-template',
        'cache'
      );
    case 'darwin':
      return path.join(homeDir, 'Library', 'Caches', 'mvp-generate-template');
    case 'linux':
    default:
      return path.join(
        process.env.XDG_CACHE_HOME || path.join(homeDir, '.cache'),
        'mvp-generate-template'
      );
  }
}

/**
 * Get npm cache directory if available
 */
function getNpmCacheDirectory(): string | null {
  try {
    const npmCacheDir = execSync('npm config get cache', {
      encoding: 'utf8',
    }).trim();
    if (npmCacheDir && npmCacheDir !== 'undefined') {
      return path.join(npmCacheDir, 'mvp-generate-template');
    }
  } catch (error) {
    // npm not available or command failed
  }
  return null;
}

/**
 * Get the best cache directory available (kept for cache management commands)
 */
function getOptimalCacheDirectory(): string {
  // Try npm cache first, fallback to OS cache
  const npmCache = getNpmCacheDirectory();
  if (npmCache) {
    return npmCache;
  }
  return getCacheDirectory();
}

/**
 * Clean up cache directory
 */
export async function cleanCache(debug = false): Promise<void> {
  try {
    const cacheDir = getOptimalCacheDirectory();

    if (await fs.pathExists(cacheDir)) {
      if (debug) {
        console.log(chalk.gray(`🧹 Cleaning cache directory: ${cacheDir}`));
      }
      await fs.remove(cacheDir);
      console.log(chalk.green(`✅ Cache cleaned successfully`));
    } else {
      if (debug) {
        console.log(chalk.gray(`📁 No cache directory found at: ${cacheDir}`));
      }
    }
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Failed to clean cache: ${error instanceof Error ? error.message : error}`
      )
    );
  }
}

/**
 * Get cache information
 */
export async function getCacheInfo(): Promise<{
  cacheDir: string;
  exists: boolean;
  size?: string;
  repositories?: string[];
}> {
  const cacheDir = getOptimalCacheDirectory();
  const exists = await fs.pathExists(cacheDir);

  const info = {
    cacheDir,
    exists,
  } as {
    cacheDir: string;
    exists: boolean;
    size?: string;
    repositories?: string[];
  };

  if (exists) {
    try {
      // Get cache size
      const stats = await fs.stat(cacheDir);
      info.size = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

      // Get cached repositories
      const items = await fs.readdir(cacheDir);
      info.repositories = items.filter((item) => item.startsWith('repo-'));
    } catch (error) {
      // Ignore errors for size/repo info
    }
  }

  return info;
}

/**
 * Load and validate YAML configuration file from local or Git URL
 */
export async function loadWorkflowConfig(
  configPath: string,
  repoUrl?: string,
  branch?: string,
  options: { useCache?: boolean; directFetch?: boolean } = {}
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
            `🌐 Loading workflow config from GitHub raw: ${gitUrl}/${gitPath}`
          )
        );
      }

      // Use direct GitHub raw download
      if (isGitHubRepository(gitUrl)) {
        const content = await downloadFromGitHubRaw(
          gitUrl,
          gitPath,
          branch || DEFAULT_BRANCH,
          isDebug
        );
        if (!content) {
          throw new Error(
            `Configuration file not found in GitHub repository: ${gitPath}`
          );
        }
        fileContent = content;
      } else {
        throw new Error(
          `Only GitHub repositories are supported for remote config loading.\n` +
            `Repository: ${gitUrl}\n` +
            `Use local files instead.`
        );
      }
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
  branch?: string,
  options: { useCache?: boolean; directFetch?: boolean } = {}
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
            `🌐 Loading templates config from GitHub raw: ${gitUrl}/${gitPath}`
          )
        );
      }

      // Use direct GitHub raw download
      if (isGitHubRepository(gitUrl)) {
        const content = await downloadFromGitHubRaw(
          gitUrl,
          gitPath,
          branch || DEFAULT_BRANCH,
          isDebug
        );
        if (!content) {
          throw new Error(
            `Templates configuration file not found in GitHub repository: ${gitPath}`
          );
        }
        fileContent = content;
      } else {
        throw new Error(
          `Only GitHub repositories are supported for remote config loading.\n` +
            `Repository: ${gitUrl}\n` +
            `Use local files instead.`
        );
      }
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
 * Find configuration files with Git-first approach using direct GitHub raw downloads
 */
export async function findConfigFiles(
  rootDir: string,
  repoUrl?: string,
  branch?: string,
  useLocalFirst = false,
  options: { useCache?: boolean; directFetch?: boolean } = {}
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
    console.log(chalk.gray(`\n🔍 Debug: Searching for config files`));
    console.log(
      chalk.gray(
        `  Strategy: ${useLocalFirst ? 'Local first' : 'Git-first via raw downloads (default)'}`
      )
    );
    if (repoUrl) {
      console.log(chalk.gray(`  Repository: ${repoUrl}`));
    }
  }

  // Configuration file paths to check
  const workflowPaths = [
    'mvp-gen.yml',
    'mvp-gen.yaml',
    '.mvp-gen.yml',
    '.mvp-gen.yaml',
    'config/workflow.yml',
    'config/workflow.yaml',
  ];

  const templatesPaths = [
    'templates.json',
    '.templates.json',
    'config/templates.json',
    'templates/config.json',
  ];

  if (useLocalFirst) {
    // Legacy behavior: Check local files first
    if (isDebug) {
      console.log(chalk.gray('  🏠 Checking local files first...'));
    }

    // Check local workflow files
    for (const workflowPath of workflowPaths) {
      const fullPath = path.join(rootDir, workflowPath);
      if (await fs.pathExists(fullPath)) {
        configFiles.workflow = fullPath;
        if (isDebug) {
          console.log(chalk.green(`    ✓ Found local workflow: ${fullPath}`));
        }
        break;
      }
    }

    // Check local templates files
    for (const templatesPath of templatesPaths) {
      const fullPath = path.join(rootDir, templatesPath);
      if (await fs.pathExists(fullPath)) {
        configFiles.templates = fullPath;
        if (isDebug) {
          console.log(chalk.green(`    ✓ Found local templates: ${fullPath}`));
        }
        break;
      }
    }

    // Try GitHub raw as fallback if local not found
    if (
      (!configFiles.workflow || !configFiles.templates) &&
      repoUrl &&
      isGitHubRepository(repoUrl)
    ) {
      if (isDebug) {
        console.log(chalk.gray('  🌐 Falling back to GitHub raw downloads...'));
      }

      if (!configFiles.workflow) {
        for (const workflowPath of workflowPaths) {
          const content = await downloadFromGitHubRaw(
            repoUrl,
            workflowPath,
            branch || DEFAULT_BRANCH,
            isDebug
          );
          if (content) {
            configFiles.workflow = workflowPath;
            if (isDebug) {
              console.log(
                chalk.green(`    ✓ Found in GitHub raw: ${workflowPath}`)
              );
            }
            break;
          }
        }
      }

      if (!configFiles.templates) {
        for (const templatesPath of templatesPaths) {
          const content = await downloadFromGitHubRaw(
            repoUrl,
            templatesPath,
            branch || DEFAULT_BRANCH,
            isDebug
          );
          if (content) {
            configFiles.templates = templatesPath;
            if (isDebug) {
              console.log(
                chalk.green(`    ✓ Found in GitHub raw: ${templatesPath}`)
              );
            }
            break;
          }
        }
      }
    }
  } else {
    // New default behavior: Check GitHub raw first for GitHub repos
    const gitUrl = repoUrl || DEFAULT_CONFIG_REPO;

    if (isGitHubRepository(gitUrl)) {
      if (isDebug) {
        console.log(chalk.gray(`  🌐 Checking GitHub raw first: ${gitUrl}`));
      }

      // Try GitHub raw first for workflow
      for (const workflowPath of workflowPaths) {
        const content = await downloadFromGitHubRaw(
          gitUrl,
          workflowPath,
          branch || DEFAULT_BRANCH,
          isDebug
        );
        if (content) {
          configFiles.workflow = workflowPath;
          if (isDebug) {
            console.log(
              chalk.green(`    ✓ Found workflow in GitHub raw: ${workflowPath}`)
            );
          }
          break;
        }
      }

      // Try GitHub raw first for templates
      for (const templatesPath of templatesPaths) {
        const content = await downloadFromGitHubRaw(
          gitUrl,
          templatesPath,
          branch || DEFAULT_BRANCH,
          isDebug
        );
        if (content) {
          configFiles.templates = templatesPath;
          if (isDebug) {
            console.log(
              chalk.green(
                `    ✓ Found templates in GitHub raw: ${templatesPath}`
              )
            );
          }
          break;
        }
      }
    }

    // Fallback to local files if GitHub raw failed
    if (!configFiles.workflow || !configFiles.templates) {
      if (isDebug) {
        console.log(chalk.gray('  🏠 Falling back to local files...'));
      }

      if (!configFiles.workflow) {
        for (const workflowPath of workflowPaths) {
          const fullPath = path.join(rootDir, workflowPath);
          if (await fs.pathExists(fullPath)) {
            configFiles.workflow = fullPath;
            if (isDebug) {
              console.log(
                chalk.green(`    ✓ Found local workflow: ${fullPath}`)
              );
            }
            break;
          }
        }
      }

      if (!configFiles.templates) {
        for (const templatesPath of templatesPaths) {
          const fullPath = path.join(rootDir, templatesPath);
          if (await fs.pathExists(fullPath)) {
            configFiles.templates = fullPath;
            if (isDebug) {
              console.log(
                chalk.green(`    ✓ Found local templates: ${fullPath}`)
              );
            }
            break;
          }
        }
      }
    }
  }

  if (isDebug) {
    console.log(chalk.gray('\n  🎯 Final results:'));
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
 * Load configuration from multiple sources with Git-first approach using direct downloads
 */
export async function loadConfig(
  workflowPath?: string,
  templatesPath?: string,
  repoUrl?: string,
  branch?: string,
  useLocalFirst = false
): Promise<Config> {
  const config: Config = {};
  const isDebug =
    process.env.NODE_ENV === 'development' ||
    process.argv.includes('--debug') ||
    process.argv.includes('--verbose');

  // Default to Git repository if no repo specified and not using local first
  const defaultRepo =
    !useLocalFirst && !repoUrl ? DEFAULT_CONFIG_REPO : repoUrl;

  if (isDebug) {
    console.log(chalk.gray('\n🔍 Debug: Configuration loading...'));
    console.log(
      chalk.gray(
        `  Strategy: ${useLocalFirst ? 'Local first' : 'GitHub raw downloads (default)'}`
      )
    );
    if (defaultRepo) {
      console.log(chalk.gray(`  Repository: ${defaultRepo}`));
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
      config.workflow = await loadWorkflowConfig(
        workflowPath,
        defaultRepo,
        branch
      );
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
        defaultRepo,
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

/**
 * Download template zip file from GitHub repository and extract it using adm-zip
 */
export async function downloadTemplateFilesFromGitHub(
  templatePath: string,
  targetDir: string,
  repoUrl = DEFAULT_CONFIG_REPO,
  branch = DEFAULT_BRANCH,
  debug = false
): Promise<void> {
  try {
    if (!isGitHubRepository(repoUrl)) {
      throw new Error(
        `Only GitHub repositories are supported for template downloads.\n` +
          `Repository: ${repoUrl}\n` +
          `Use local templates instead.`
      );
    }

    if (debug) {
      console.log(
        chalk.gray(
          `🌐 Downloading template zip from GitHub: ${repoUrl}/templates/${templatePath}.zip`
        )
      );
    }

    // Download the zip file using GitHub raw API
    const zipFilePath = `templates/${templatePath}.zip`;
    const rawUrl = convertToGitHubRawUrl(repoUrl, zipFilePath, branch);

    if (!rawUrl) {
      throw new Error(`Failed to convert to GitHub raw URL: ${repoUrl}`);
    }

    if (debug) {
      console.log(chalk.gray(`📡 Fetching: ${rawUrl}`));
    }

    // Create temporary file for the zip content
    const tempZipFile = path.join(
      os.tmpdir(),
      `mvp-template-${Date.now()}.zip`
    );

    try {
      // Download zip file directly using curl
      execSync(`curl -L -s -f "${rawUrl}" -o "${tempZipFile}"`, {
        stdio: debug ? 'inherit' : 'pipe',
        timeout: 60000, // 60 second timeout for larger files
      });

      // Verify zip file was downloaded
      if (!(await fs.pathExists(tempZipFile))) {
        throw new Error(
          `Template zip file not found: ${zipFilePath}\n` +
            `Make sure the template exists and has been packaged with 'npm run package-templates'`
        );
      }

      const zipStats = await fs.stat(tempZipFile);
      if (debug) {
        console.log(
          chalk.gray(
            `💾 Downloaded zip: ${(zipStats.size / 1024).toFixed(1)} KB`
          )
        );
      }

      // Ensure target directory exists
      await fs.ensureDir(targetDir);

      // Extract zip file using adm-zip (dynamic import to avoid ESBuild issues)
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip(tempZipFile);
      zip.extractAllTo(targetDir, true); // true = overwrite

      if (debug) {
        const entries = zip.getEntries();
        console.log(
          chalk.gray(`📦 Extracted ${entries.length} files to: ${targetDir}`)
        );
      }

      console.log(
        chalk.green(
          `✅ Template '${templatePath}' downloaded and extracted successfully`
        )
      );
    } finally {
      // Clean up temporary zip file
      if (await fs.pathExists(tempZipFile)) {
        await fs.remove(tempZipFile);
      }
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
