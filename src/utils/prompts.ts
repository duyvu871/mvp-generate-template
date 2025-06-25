import inquirer from 'inquirer';

export async function determineTemplate(): Promise<string> {
  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Select a project template:',
      choices: [
        {
          name: '🌐 Express + Handlebars (Node.js web server)',
          value: 'express-hbs',
        },
        {
          name: '⚡ Express API (REST API server)',
          value: 'express-api',
        },
        {
          name: '📦 Node.js CLI Tool',
          value: 'node-cli',
        },
        {
          name: '🏗️ Basic Node.js Project',
          value: 'basic-node',
        },
      ],
    },
  ]);
  return template;
}

export async function confirmTypeScript(): Promise<boolean> {
  const { useTypeScript } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useTypeScript',
      message: 'Add TypeScript support?',
      default: true,
    },
  ]);
  return useTypeScript;
}

export async function confirmESBuild(): Promise<boolean> {
  const { useESBuild } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useESBuild',
      message: 'Add ESBuild for fast compilation?',
      default: false,
    },
  ]);
  return useESBuild;
}
