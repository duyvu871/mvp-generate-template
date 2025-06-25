#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { cacheCommand } from './commands/cache.js';

const program = new Command();

program
  .name('mvp-gen')
  .description('🚀 MVP Template Generator - Rapid prototyping with style!')
  .version('0.3.0');

// Register commands
initCommand(program);
cacheCommand(program);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

// Parse command line arguments
program.parse(process.argv);
