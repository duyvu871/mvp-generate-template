import fs from 'fs-extra';
import path from 'path';
import * as YAML from 'yaml';
import chalk from 'chalk';
import { execSync } from 'child_process';
import os from 'os';
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

// Default Git repository for configurations and templates
const DEFAULT_CONFIG_REPO =
  'https://github.com/duyvu871/mvp-generate-template.git';
const DEFAULT_BRANCH = 'main';

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
 * Get the best cache directory available
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
 * Download file content directly from Git repository without local caching
 */
async function downloadContentFromGit(
  repoUrl: string,
  filePath: string,
  branch = DEFAULT_BRANCH,
  debug = false
): Promise<string | null> {
  try {
    if (debug) {
      console.log(
        chalk.gray(
          `🌐 Fetching content directly from repository: ${repoUrl}/${filePath}`
        )
      );
    }

    // Primary strategy: GitHub raw API using curl (fastest and most reliable)
    if (isGitHubRepository(repoUrl)) {
      const content = await downloadFromGitHubRaw(
        repoUrl,
        filePath,
        branch,
        debug
      );
      if (content) {
        return content;
      }

      if (debug) {
        console.log(chalk.yellow(`⚠️ GitHub raw API failed for: ${filePath}`));
      }
    }

    // For non-GitHub repositories, return error with helpful message
    if (!isGitHubRepository(repoUrl)) {
      throw new Error(
        `Direct fetch only supports GitHub repositories.\n` +
          `Repository: ${repoUrl}\n` +
          `Use caching mode instead (remove --direct-fetch flag)`
      );
    }

    // If we reach here, it means GitHub raw API failed
    throw new Error(
      `Failed to fetch from GitHub raw API.\n` +
        `File: ${filePath}\n` +
        `Repository: ${repoUrl}\n` +
        `Branch: ${branch}\n` +
        `This might be a private repository or the file doesn't exist.`
    );
  } catch (error) {
    if (debug) {
      console.error(
        chalk.red(
          `❌ Direct Git fetch failed: ${error instanceof Error ? error.message : error}`
        )
      );
    }
    return null;
  }
}

/**
 * Download file from Git repository with caching support
 */
async function downloadFromGit(
  repoUrl: string,
  filePath: string,
  branch = DEFAULT_BRANCH,
  debug = false,
  useCache = true,
  directFetch = false
): Promise<string | null> {
  // If direct fetch is requested, get content without caching
  if (directFetch) {
    return await downloadContentFromGit(repoUrl, filePath, branch, debug);
  }

  try {
    const cacheDir = useCache
      ? getOptimalCacheDirectory()
      : path.join(os.tmpdir(), 'mvp-generate-template');
    const repoHash = Buffer.from(repoUrl).toString('base64').slice(0, 16);
    const tempDir = path.join(cacheDir, `repo-${repoHash}`);

    if (debug) {
      console.log(
        chalk.gray(`🌐 Downloading from Git: ${repoUrl}/${filePath}`)
      );
      console.log(chalk.gray(`📁 Cache directory: ${tempDir}`));
    }

    // Ensure cache directory exists
    await fs.ensureDir(cacheDir);

    // Clone or pull repository to cache
    if (await fs.pathExists(tempDir)) {
      if (debug) {
        console.log(chalk.gray(`📁 Using cached repository: ${tempDir}`));
      }
      try {
        execSync(`git pull origin ${branch}`, {
          cwd: tempDir,
          stdio: debug ? 'inherit' : 'pipe',
        });
      } catch (pullError) {
        if (debug) {
          console.log(chalk.yellow(`⚠️ Git pull failed, using cached version`));
        }
      }
    } else {
      if (debug) {
        console.log(chalk.gray(`📦 Cloning repository to cache: ${tempDir}`));
      }

      try {
        execSync(
          `git clone --depth 1 --branch ${branch} ${repoUrl} ${tempDir}`,
          {
            stdio: debug ? 'inherit' : 'pipe',
          }
        );
      } catch (cloneError) {
        if (debug) {
          console.error(
            chalk.red(
              `❌ Git clone failed: ${cloneError instanceof Error ? cloneError.message : cloneError}`
            )
          );
        }

        // For SSH URLs or private repos, provide helpful error message
        if (
          repoUrl.startsWith('git@') ||
          (cloneError instanceof Error &&
            cloneError.message.includes('Permission denied'))
        ) {
          const httpsUrl = repoUrl.replace(
            /^git@github\.com:/,
            'https://github.com/'
          );
          throw new Error(
            `Git clone failed for SSH URL: ${repoUrl}\n\n` +
              `Solutions:\n` +
              `1. Use HTTPS URL instead: ${httpsUrl}\n` +
              `2. Configure SSH keys: ssh-add ~/.ssh/id_rsa\n` +
              `3. For private repos, use local files with --local flag\n` +
              `4. Use --direct-fetch for public GitHub repos (uses raw.githubusercontent.com)`
          );
        }

        throw cloneError;
      }
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
            `🌐 Loading workflow config from Git: ${gitUrl}/${gitPath}`
          )
        );
      }

      const content = await downloadFromGit(
        gitUrl,
        gitPath,
        branch,
        isDebug,
        options.useCache ?? true,
        options.directFetch ?? false
      );
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
            `🌐 Loading templates config from Git: ${gitUrl}/${gitPath}`
          )
        );
      }

      const content = await downloadFromGit(
        gitUrl,
        gitPath,
        branch,
        isDebug,
        options.useCache ?? true,
        options.directFetch ?? false
      );
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
 * Find configuration files with Git-first approach
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
        `  Strategy: ${useLocalFirst ? 'Local first' : 'Git first (default)'}`
      )
    );
    console.log(
      chalk.gray(
        `  Cache mode: ${options.directFetch ? 'Direct fetch (no cache)' : options.useCache !== false ? 'Cache enabled' : 'Cache disabled'}`
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

    // Try Git as fallback if local not found
    if ((!configFiles.workflow || !configFiles.templates) && repoUrl) {
      if (isDebug) {
        console.log(chalk.gray('  🌐 Falling back to Git repository...'));
      }

      if (!configFiles.workflow) {
        for (const workflowPath of workflowPaths) {
          const content = await downloadFromGit(
            repoUrl,
            workflowPath,
            branch,
            isDebug,
            options.useCache ?? true,
            options.directFetch ?? false
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

      if (!configFiles.templates) {
        for (const templatesPath of templatesPaths) {
          const content = await downloadFromGit(
            repoUrl,
            templatesPath,
            branch,
            isDebug,
            options.useCache ?? true,
            options.directFetch ?? false
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
    }
  } else {
    // New default behavior: Check Git repository first
    const gitUrl = repoUrl || DEFAULT_CONFIG_REPO;

    if (isDebug) {
      console.log(chalk.gray(`  🌐 Checking Git repository first: ${gitUrl}`));
    }

    // Try Git first for workflow
    for (const workflowPath of workflowPaths) {
      const content = await downloadFromGit(
        gitUrl,
        workflowPath,
        branch,
        isDebug,
        options.useCache ?? true,
        options.directFetch ?? false
      );
      if (content) {
        configFiles.workflow = workflowPath;
        if (isDebug) {
          console.log(
            chalk.green(`    ✓ Found workflow in Git: ${workflowPath}`)
          );
        }
        break;
      }
    }

    // Try Git first for templates
    for (const templatesPath of templatesPaths) {
      const content = await downloadFromGit(
        gitUrl,
        templatesPath,
        branch,
        isDebug,
        options.useCache ?? true,
        options.directFetch ?? false
      );
      if (content) {
        configFiles.templates = templatesPath;
        if (isDebug) {
          console.log(
            chalk.green(`    ✓ Found templates in Git: ${templatesPath}`)
          );
        }
        break;
      }
    }

    // Fallback to local files if Git failed
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
 * Load configuration from multiple sources with Git-first approach
 */
export async function loadConfig(
  workflowPath?: string,
  templatesPath?: string,
  repoUrl?: string,
  branch?: string,
  useLocalFirst = false,
  options: { useCache?: boolean; directFetch?: boolean } = {}
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
        `  Strategy: ${useLocalFirst ? 'Local first' : 'Git first (default)'}`
      )
    );
    console.log(
      chalk.gray(
        `  Cache mode: ${options.directFetch ? 'Direct fetch (no cache)' : options.useCache !== false ? 'Cache enabled' : 'Cache disabled'}`
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
        branch,
        options
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
        branch,
        options
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
 * Download and extract templates from Git repository with caching support
 */
export async function downloadTemplatesFromGit(
  templatePath: string,
  targetDir: string,
  repoUrl = DEFAULT_CONFIG_REPO,
  branch = DEFAULT_BRANCH,
  debug = false,
  options: { useCache?: boolean; directFetch?: boolean } = {}
): Promise<void> {
  try {
    const cacheDir =
      options.useCache !== false
        ? getOptimalCacheDirectory()
        : path.join(os.tmpdir(), 'mvp-generate-template');
    const repoHash = Buffer.from(repoUrl).toString('base64').slice(0, 16);
    const tempDir = path.join(cacheDir, `repo-${repoHash}`);

    if (debug) {
      console.log(
        chalk.gray(
          `🌐 Downloading template from Git: ${repoUrl}/templates/${templatePath}`
        )
      );
      if (options.useCache !== false) {
        console.log(chalk.gray(`📁 Cache directory: ${cacheDir}`));
      }
    }

    // Ensure cache directory exists
    await fs.ensureDir(cacheDir);

    // Clone or pull repository to cache
    if (await fs.pathExists(tempDir)) {
      if (debug) {
        console.log(chalk.gray(`📁 Using cached repository: ${tempDir}`));
      }
      try {
        execSync(`git pull origin ${branch}`, {
          cwd: tempDir,
          stdio: debug ? 'inherit' : 'pipe',
        });
      } catch (pullError) {
        if (debug) {
          console.log(chalk.yellow(`⚠️ Git pull failed, using cached version`));
        }
      }
    } else {
      if (debug) {
        console.log(chalk.gray(`📦 Cloning repository to cache: ${tempDir}`));
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

    // Clean up temp directory if cache is disabled
    if (options.useCache === false && !debug) {
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
