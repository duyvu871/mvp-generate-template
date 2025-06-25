// Basic Node.js Application with TypeScript and ESBuild
console.log('Hello, TypeScript + ESBuild World!');

// Example of typed function
function greet(name: string = 'World'): string {
  return `Hello, ${name}!`;
}

// Example of interface
interface AppConfig {
  port: number;
  environment: string;
  buildTool: string;
}

// Example of async function with types
async function main(): Promise<void> {
  try {
    console.log(greet());
    console.log(greet('TypeScript + ESBuild'));
    
    // Example of working with typed configuration
    const config: AppConfig = {
      port: Number(process.env.PORT) || 3000,
      environment: process.env.NODE_ENV || 'development',
      buildTool: 'ESBuild'
    };
    
    console.log(`Server would run on port ${config.port}`);
    console.log(`Environment: ${config.environment}`);
    console.log(`Build tool: ${config.buildTool}`);
    
    // Example of basic error handling
    console.log('TypeScript + ESBuild application started successfully!');
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

// Run the main function
main();
