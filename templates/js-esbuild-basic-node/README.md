# Basic Node.js Application with ESBuild

A simple Node.js application template with ESBuild for fast bundling and development.

## Features

- Basic Node.js setup
- ESBuild for fast bundling
- Development with watch mode
- Production builds with minification
- Source maps for development

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

#### Development mode (with watch):
```bash
npm run dev
```

#### Build for production:
```bash
npm run build:prod
```

#### Run production build:
```bash
npm start
```

## Project Structure

```
src/
├── index.js          # Main application entry point
dist/
├── index.js          # Built application (generated)
esbuild.config.mjs    # ESBuild configuration
```

## Environment Variables

- `PORT` - Port number for the application (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Run the built application
- `npm run dev` - Run in development mode with watch
- `npm run build` - Build for development
- `npm run build:prod` - Build for production with minification

## License

MIT
