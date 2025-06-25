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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type InitOptions = {
  template?: string;
  typescript?: boolean;
  esbuild?: boolean;
};

export function initCommand(program: Command) {
  program
    .command('init <project-name>')
    .description('Initialize a new project')
    .option('-t, --template <template>', 'Project template to use')
    .option('-ts, --typescript', 'Add TypeScript support')
    .option('-es, --esbuild', 'Add ESBuild configuration')
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
  const targetDir = path.resolve(process.cwd(), projectName);

  // Kiểm tra thư mục tồn tại
  if (await fs.pathExists(targetDir)) {
    throw new Error(`Directory "${targetDir}" already exists!`);
  }

  // Xác định template
  const template = options.template || (await determineTemplate());
  const useTypeScript = options.typescript ?? (await confirmTypeScript());
  const useESBuild = options.esbuild ?? (await confirmESBuild());

  const spinner = ora('Creating project...').start();

  try {
    // Tạo thư mục dự án
    await fs.ensureDir(targetDir);

    // Copy template
    const templatePath = path.join(__dirname, '../../templates', template);
    await fs.copy(templatePath, targetDir);

    // Cập nhật package.json
    await updatePackageJson(targetDir, projectName, {
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
      chalk.green(`Project "${projectName}" created successfully!`)
    );
    printNextSteps(projectName, {
      typescript: useTypeScript,
      esbuild: useESBuild,
    });
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    throw error;
  }
}

// ... (Các hàm hỗ trợ khác tương tự như trước)
