const chalk = require('chalk');

class Logger {
  info(message, ...args) {
    console.log(chalk.blue('ℹ'), message, ...args);
  }
  
  success(message, ...args) {
    console.log(chalk.green('✓'), message, ...args);
  }
  
  warning(message, ...args) {
    console.log(chalk.yellow('⚠'), message, ...args);
  }
  
  error(message, ...args) {
    console.error(chalk.red('✗'), message, ...args);
  }
  
  debug(message, ...args) {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message, ...args);
    }
  }
  
  log(message, ...args) {
    console.log(message, ...args);
  }
}

module.exports = new Logger();
