// Basic Node.js Application with ESBuild
console.log('Hello, World from ESBuild!');

// Example of a simple function
function greet(name = 'World') {
  return `Hello, ${name}!`;
}

// Example of async function
async function main() {
  try {
    console.log(greet());
    console.log(greet('ESBuild + Node.js'));
    
    // Example of working with environment variables
    const port = process.env.PORT || 3000;
    console.log(`Server would run on port ${port}`);
    
    // Example of basic error handling
    console.log('Application built and started successfully with ESBuild!');
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

// Run the main function
main();
