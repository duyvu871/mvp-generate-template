import chalk from 'chalk';

class Logger {
  info(message: string, ...args: any[]): void {
    console.log(chalk.blue('ℹ'), message, ...args);
  }
  
  success(message: string, ...args: any[]): void {
    console.log(chalk.green('✓'), message, ...args);
  }
  
  warning(message: string, ...args: any[]): void {
    console.log(chalk.yellow('⚠'), message, ...args);
  }
  
  error(message: string, ...args: any[]): void {
    console.error(chalk.red('✗'), message, ...args);
  }
  
  debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message, ...args);
    }
  }
  
  log(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
}

export default new Logger();
