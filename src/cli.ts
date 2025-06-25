#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('mvp-gen')
  .description(
    'MVP Template Generator - Create projects quickly with beautiful templates'
  )
  .version('1.0.0');

// Register commands
initCommand(program);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

// Parse command line arguments
program.parse(process.argv);
