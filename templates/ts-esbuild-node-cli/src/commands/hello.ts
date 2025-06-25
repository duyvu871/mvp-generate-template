import chalk from 'chalk';
import logger from '../utils/logger';
import { CliOptions } from '../types';

function helloCommand(name: string = 'World', options: CliOptions = {}): void {
  try {
    let displayName = name;
    
    // Apply uppercase option
    if (options.uppercase) {
      displayName = name.toUpperCase();
    }
    
    // Get count option
    const count = parseInt(options.count || '1') || 1;
    
    // Validate count
    if (count <= 0) {
      logger.error('Count must be greater than 0');
      return;
    }
    
    // Generate greetings
    for (let i = 0; i < count; i++) {
      const greeting = `Hello, ${displayName}! (TypeScript + ESBuild)`;
      
      // Color the output
      if (count > 1) {
        console.log(chalk.green(`${i + 1}. ${greeting}`));
      } else {
        console.log(chalk.green(greeting));
      }
    }
    
    // Show additional info if multiple greetings
    if (count > 1) {
      logger.info(`Generated ${count} greetings for ${displayName}`);
    }
    
  } catch (error) {
    logger.error('Hello command failed:', (error as Error).message);
  }
}

export default helloCommand;
