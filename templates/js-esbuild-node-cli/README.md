# Node.js CLI Application with ESBuild

A command-line interface application built with Commander.js and ESBuild for fast development and production builds.

## Features

- Command-line interface with Commander.js
- ESBuild for fast bundling
- Interactive prompts with Inquirer.js
- Colored console output with Chalk
- Multiple commands and options
- Error handling and validation
- System information utilities
- Development with watch mode
- Production builds with minification

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. (Optional) Link globally for system-wide access:
```bash
npm link
```

### Running the Application

#### Development mode (with watch):
```bash
npm run dev
```

#### Build for production:
```bash
npm run build:prod
```

#### Direct execution:
```bash
node dist/index.js [command] [options]
```

#### If linked globally:
```bash
mycli [command] [options]
```

## Available Commands

### Basic Commands

#### Show help:
```bash
mycli --help
```

#### Show version:
```bash
mycli --version
```

#### Hello command:
```bash
mycli hello [name]
mycli hello John --uppercase
mycli hello World --count 3
```

#### Interactive mode:
```bash
mycli interactive
```

#### System information:
```bash
mycli info
```

### Command Options

#### Hello Command Options:
- `-u, --uppercase` - Convert name to uppercase
- `-c, --count <number>` - Number of greetings (default: 1)

## Examples

```bash
# Basic greeting
mycli hello

# Greet specific person
mycli hello John

# Uppercase greeting with multiple counts
mycli hello john --uppercase --count 5

# Interactive mode
mycli interactive

# Show system info
mycli info
```

## Project Structure

```
src/
├── index.js              # Main CLI entry point
├── commands/
│   └── hello.js          # Hello command implementation
└── utils/
    └── logger.js         # Logging utilities
dist/
├── index.js              # Built CLI application (generated)
esbuild.config.mjs        # ESBuild configuration
```

## Environment Variables

- `DEBUG` - Enable debug logging
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Run the built CLI application
- `npm run dev` - Run in development mode with watch
- `npm run build` - Build for development
- `npm run build:prod` - Build for production with minification

## Development

### Adding New Commands

1. Create a new file in `src/commands/`
2. Export a function that handles the command logic
3. Import and register in `src/index.js`
4. Rebuild with `npm run build`

Example:
```javascript
// src/commands/newcommand.js
function newCommand(args, options) {
  // Command logic here
}

module.exports = newCommand;

// src/index.js
const newCommand = require('./commands/newcommand');

program
  .command('newcmd')
  .description('Description of new command')
  .action(newCommand);
```

## License

MIT
