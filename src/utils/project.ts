import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

type ProjectConfig = {
  typescript: boolean;
  esbuild: boolean;
};

export async function updatePackageJson(
  targetDir: string,
  projectName: string,
  config: ProjectConfig
) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Update project name
  packageJson.name = projectName;

  // Add TypeScript dependencies if needed
  if (config.typescript) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      'ts-node': '^10.9.0',
    };

    packageJson.scripts = {
      ...packageJson.scripts,
      build: 'tsc',
      dev: 'ts-node src/index.ts',
    };
  }

  // Add ESBuild dependencies if needed
  if (config.esbuild) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      esbuild: '^0.19.0',
    };

    packageJson.scripts = {
      ...packageJson.scripts,
      'build:fast':
        'esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js',
    };
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

export async function setupTypeScript(targetDir: string) {
  const tsConfigPath = path.join(targetDir, 'tsconfig.json');
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules'],
  };

  await fs.writeJson(tsConfigPath, tsConfig, { spaces: 2 });
}

export async function setupESBuild(targetDir: string) {
  const esbuildConfigPath = path.join(targetDir, 'esbuild.config.js');
  const esbuildConfig = `const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: ['express', 'handlebars'],
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production'
}).catch(() => process.exit(1));
`;

  await fs.writeFile(esbuildConfigPath, esbuildConfig);
}

export function printNextSteps(projectName: string, config: ProjectConfig) {
  console.log(chalk.green('\n✅ Project created successfully!\n'));
  console.log(chalk.yellow('Next steps:'));
  console.log(chalk.white(`  cd ${projectName}`));
  console.log(chalk.white('  npm install'));

  if (config.typescript) {
    console.log(chalk.white('  npm run dev    # Start development server'));
  } else {
    console.log(chalk.white('  npm start      # Start the application'));
  }

  console.log(chalk.cyan('\n🎉 Happy coding!\n'));
}
