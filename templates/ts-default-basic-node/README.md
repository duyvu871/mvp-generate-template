# Basic Node.js Application with TypeScript

A simple Node.js application template with TypeScript for type safety and better development experience.

## Features

- TypeScript for type safety
- Basic Node.js setup
- Type definitions included
- Development with ts-node
- Build to JavaScript

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

### Installation

1. Install dependencies:
```bash
npm install
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

#### Type checking only:
```bash
npm run typecheck
```

## Project Structure

```
src/
├── index.ts          # Main application entry point
dist/                 # Compiled JavaScript output
├── index.js          # Compiled main file
├── index.d.ts        # Type declarations
└── index.js.map      # Source maps
tsconfig.json         # TypeScript configuration
```

## Environment Variables

- `PORT` - Port number for the application (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Run the compiled application
- `npm run dev` - Run TypeScript directly with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm run typecheck` - Check types without compilation

## License

MIT
