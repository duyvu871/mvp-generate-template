#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version, description } from '../package.json';
import helloCommand from './commands/hello';
import logger from './utils/logger';
import inquirer from 'inquirer';

const program = new Command();

// Program configuration
program
  .name('mycli')
  .description(description)
  .version(version);

// Add commands
program
  .command('hello [name]')
  .description('Say hello to someone')
  .option('-u, --uppercase', 'Convert name to uppercase')
  .option('-c, --count <number>', 'Number of greetings', '1')
  .action(helloCommand);

// Interactive mode
program
  .command('interactive')
  .description('Run in interactive mode')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is your name?',
          default: 'World'
        },
        {
          type: 'confirm',
          name: 'uppercase',
          message: 'Convert to uppercase?',
          default: false
        },
        {
          type: 'number',
          name: 'count',
          message: 'How many greetings?',
          default: 1,
          validate: (input: number) => input > 0 || 'Count must be greater than 0'
        }
      ]);
      
      helloCommand(answers.name, {
        uppercase: answers.uppercase,
        count: answers.count.toString()
      });
    } catch (error) {
      logger.error('Interactive mode failed:', (error as Error).message);
    }
  });

// Example of a utility command
program
  .command('info')
  .description('Show system information')
  .action(() => {
    console.log(chalk.blue('System Information (TypeScript + ESBuild):'));
    console.log(`Node.js version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Current directory: ${process.cwd()}`);
    console.log(`Language: TypeScript`);
    console.log(`Build tool: ESBuild`);
    console.log(`Memory usage:`, process.memoryUsage());
  });

// Error handling
program.on('command:*', () => {
  logger.error(`Invalid command: ${program.args.join(' ')}`);
  logger.info('Use --help for available commands');
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
