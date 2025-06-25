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
} from '../utils/prompts.js';
import {
  updatePackageJson,
  setupTypeScript,
  setupESBuild,
  printNextSteps,
} from '../utils/project.js';

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
    .addHelpText(
      'after',
      `
Examples:
  $ mvp-gen init my-project          Create project in new directory
  $ mvp-gen init .                   Create project in current directory
  $ mvp-gen init ./                  Create project in current directory
  $ mvp-gen init my-app -t express-hbs --typescript --esbuild
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

    // Kiểm tra thư mục tồn tại
    if (await fs.pathExists(targetDir)) {
      throw new Error(`Directory "${targetDir}" already exists!`);
    }
  }

  // Xác định template
  const template = options.template || (await determineTemplate());
  const useTypeScript = options.typescript ?? (await confirmTypeScript());
  const useESBuild = options.esbuild ?? (await confirmESBuild());

  const spinner = ora('Creating project...').start();

  try {
    // Tạo thư mục dự án (chỉ khi không phải current directory)
    if (projectName !== '.' && projectName !== './') {
      await fs.ensureDir(targetDir);
    }

    // Copy template - use the new template path resolution
    const templatesDir = getTemplatesPath();
    const templatePath = path.join(templatesDir, template);

    // Verify template exists
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template "${template}" not found at ${templatePath}`);
    }

    await fs.copy(templatePath, targetDir);

    // Cập nhật package.json với tên project thực tế
    await updatePackageJson(targetDir, actualProjectName, {
      typescript: useTypeScript,
      esbuild: useESBuild,
    });

    // Thêm cấu hình TypeScript nếu cần
    if (useTypeScript) {
      await setupTypeScript(targetDir);
    }

    // Thêm cấu hình ESBuild nếu cần
    if (useESBuild) {
      await setupESBuild(targetDir);
    }

    spinner.succeed(
      chalk.green(`Project "${actualProjectName}" created successfully!`)
    );

    // Print next steps với thông tin phù hợp
    if (projectName === '.' || projectName === './') {
      printCurrentDirectoryNextSteps(actualProjectName, {
        typescript: useTypeScript,
        esbuild: useESBuild,
      });
    } else {
      printNextSteps(actualProjectName, {
        typescript: useTypeScript,
        esbuild: useESBuild,
      });
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    throw error;
  }
}

// Function to print next steps for current directory initialization
function printCurrentDirectoryNextSteps(
  projectName: string,
  options: { typescript: boolean; esbuild: boolean }
) {
  console.log('\n' + chalk.cyan('🎉 Next steps:'));
  console.log(chalk.gray('  # Install dependencies'));
  console.log(chalk.white('  npm install'));
  console.log('');
  console.log(chalk.gray('  # Start development server'));
  if (options.esbuild) {
    console.log(chalk.white('  npm run dev'));
  } else {
    console.log(chalk.white('  npm start'));
  }
  console.log('');
  console.log(chalk.gray('  # Build for production (if ESBuild is enabled)'));
  if (options.esbuild) {
    console.log(chalk.white('  npm run build'));
  }
  console.log('');
  console.log(chalk.green('Happy coding! 🚀'));
}

// ... (Các hàm hỗ trợ khác tương tự như trước)
