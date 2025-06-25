# Node.js CLI Application with TypeScript

A command-line interface application built with Commander.js and TypeScript for type safety and better development experience.

## Features

- Command-line interface with Commander.js
- TypeScript for type safety
- Interactive prompts with Inquirer.js
- Colored console output with Chalk
- Multiple commands and options
- Error handling and validation
- System information utilities
- Type definitions for CLI components

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

#### Development mode (TypeScript directly):
```bash
npm run dev
```

#### Build and run:
```bash
npm run build
npm start
```

#### Direct execution:
```bash
node dist/index.js [command] [options]
```

#### If linked globally:
```bash
mycli [command] [options]
```

#### Type checking only:
```bash
npm run typecheck
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
├── index.ts              # Main CLI entry point
├── commands/
│   └── hello.ts          # Hello command implementation
├── utils/
│   └── logger.ts         # Logging utilities
└── types/
    └── index.ts          # Type definitions
dist/                     # Compiled JavaScript output
├── index.js              # Compiled main file
├── index.d.ts            # Type declarations
└── index.js.map          # Source maps
tsconfig.json             # TypeScript configuration
```

## Type Definitions

### CLI Options
```typescript
interface CliOptions {
  uppercase?: boolean;
  count?: string;
}
```

### Interactive Answers
```typescript
interface InteractiveAnswers {
  name: string;
  uppercase: boolean;
  count: number;
}
```

## Environment Variables

- `DEBUG` - Enable debug logging

## Scripts

- `npm start` - Run the compiled CLI application
- `npm run dev` - Run TypeScript directly with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm run typecheck` - Check types without compilation

## Development

### Adding New Commands

1. Create a new file in `src/commands/`
2. Define proper TypeScript types
3. Export a function that handles the command logic
4. Import and register in `src/index.ts`
5. Rebuild with `npm run build`

Example:
```typescript
// src/commands/newcommand.ts
import { CliOptions } from '../types';

function newCommand(args: string, options: CliOptions): void {
  // Command logic here
}

export default newCommand;

// src/index.ts
import newCommand from './commands/newcommand';

program
  .command('newcmd')
  .description('Description of new command')
  .action(newCommand);
```

## License

MIT
