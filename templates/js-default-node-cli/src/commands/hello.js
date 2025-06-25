const chalk = require('chalk');
const logger = require('../utils/logger');

function helloCommand(name = 'World', options = {}) {
  try {
    let displayName = name;
    
    // Apply uppercase option
    if (options.uppercase) {
      displayName = name.toUpperCase();
    }
    
    // Get count option
    const count = parseInt(options.count) || 1;
    
    // Validate count
    if (count <= 0) {
      logger.error('Count must be greater than 0');
      return;
    }
    
    // Generate greetings
    for (let i = 0; i < count; i++) {
      const greeting = `Hello, ${displayName}!`;
      
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
    logger.error('Hello command failed:', error.message);
  }
}

module.exports = helloCommand;
