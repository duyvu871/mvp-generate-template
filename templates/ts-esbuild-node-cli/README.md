# Node.js CLI Application with TypeScript and ESBuild

A command-line interface application built with Commander.js, TypeScript, and ESBuild for type safety and ultra-fast development builds.

## Features

- Command-line interface with Commander.js
- TypeScript for type safety and better development experience
- ESBuild for lightning-fast bundling and builds
- Interactive prompts with Inquirer.js
- Colored console output with Chalk
- Multiple commands and options
- Error handling and validation
- System information utilities
- Type definitions for CLI components
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
dist/                     # Built application (generated)
├── index.js              # Compiled and bundled output
esbuild.config.mjs        # ESBuild configuration
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
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Run the built CLI application
- `npm run dev` - Run in development mode with watch
- `npm run build` - Build for development
- `npm run build:prod` - Build for production with minification
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

### Build Process

The application uses ESBuild for:
- Fast TypeScript compilation
- Bundle optimization
- Development watch mode
- Production minification
- Source map generation

### Benefits of TypeScript + ESBuild

- **Type Safety**: Catch errors at compile time
- **Fast Builds**: ESBuild is 10-100x faster than alternatives
- **Modern JavaScript**: Target latest Node.js features
- **Developer Experience**: IntelliSense and autocompletion
- **Production Ready**: Optimized builds for deployment

## Performance

- **Build Speed**: Sub-second rebuilds with ESBuild
- **Bundle Size**: Optimized output with tree shaking
- **Runtime**: Fast startup and execution
- **Memory**: Efficient memory usage

## License

MIT
