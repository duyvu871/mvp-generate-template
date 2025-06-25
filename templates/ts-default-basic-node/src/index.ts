// Basic Node.js Application with TypeScript
console.log('Hello, TypeScript World!');

// Example of typed function
function greet(name: string = 'World'): string {
  return `Hello, ${name}!`;
}

// Example of interface
interface AppConfig {
  port: number;
  environment: string;
}

// Example of async function with types
async function main(): Promise<void> {
  try {
    console.log(greet());
    console.log(greet('TypeScript'));
    
    // Example of working with typed configuration
    const config: AppConfig = {
      port: Number(process.env.PORT) || 3000,
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.log(`Server would run on port ${config.port}`);
    console.log(`Environment: ${config.environment}`);
    
    // Example of basic error handling
    console.log('TypeScript application started successfully!');
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

// Run the main function
main();
