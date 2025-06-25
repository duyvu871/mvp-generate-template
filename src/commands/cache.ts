import { Command } from 'commander';
import chalk from 'chalk';
import { cleanCache, getCacheInfo } from '../utils/config.js';

export function cacheCommand(program: Command) {
  const cache = program
    .command('cache')
    .description('Manage template and configuration cache');

  // Cache info command
  cache
    .command('info')
    .description('Show cache information')
    .option('--debug', 'Show detailed debug information')
    .action(async (options) => {
      try {
        const info = await getCacheInfo();

        console.log(chalk.cyan('\n📁 Cache Information'));
        console.log(chalk.gray(`Location: ${info.cacheDir}`));
        console.log(chalk.gray(`Exists: ${info.exists ? '✅ Yes' : '❌ No'}`));

        if (info.exists) {
          if (info.size) {
            console.log(chalk.gray(`Size: ${info.size}`));
          }

          if (info.repositories && info.repositories.length > 0) {
            console.log(
              chalk.gray(`Cached repositories: ${info.repositories.length}`)
            );
            if (options.debug) {
              console.log(chalk.gray('\nRepository details:'));
              info.repositories.forEach((repo, index) => {
                console.log(chalk.gray(`  ${index + 1}. ${repo}`));
              });
            }
          } else {
            console.log(chalk.gray('Cached repositories: 0'));
          }
        }

        console.log(chalk.gray('\nCache types:'));
        console.log(
          chalk.gray('  • Git repositories (configurations and templates)')
        );
        console.log(chalk.gray('  • Configuration files (YAML/JSON)'));
        console.log(chalk.gray('  • Template files'));

        console.log(chalk.cyan('\n💡 Cache Management:'));
        console.log(chalk.gray('  mvp-gen cache clean    # Clean all cache'));
        console.log(
          chalk.gray(
            '  mvp-gen init --no-cache # Disable cache for one command'
          )
        );
        console.log(
          chalk.gray(
            '  mvp-gen init --direct-fetch # Fetch directly without cache'
          )
        );
      } catch (error) {
        console.error(
          chalk.red('Error getting cache info:'),
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  // Cache clean command
  cache
    .command('clean')
    .description('Clean cache directory')
    .option('--debug', 'Show detailed debug information')
    .option('-f, --force', 'Force clean without confirmation')
    .action(async (options) => {
      try {
        if (!options.force) {
          const { default: inquirer } = await import('inquirer');

          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Are you sure you want to clean the cache?',
              default: false,
            },
          ]);

          if (!confirm) {
            console.log(chalk.yellow('Cache clean cancelled.'));
            return;
          }
        }

        await cleanCache(options.debug);
      } catch (error) {
        console.error(
          chalk.red('Error cleaning cache:'),
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  // Cache path command
  cache
    .command('path')
    .description('Show cache directory path')
    .action(async () => {
      try {
        const info = await getCacheInfo();
        console.log(info.cacheDir);
      } catch (error) {
        console.error(
          chalk.red('Error getting cache path:'),
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });
}
