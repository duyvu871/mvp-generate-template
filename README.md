# 🚀 MVP Template Generator

[![CI](https://github.com/your-username/mvp-generate-template/workflows/CI/badge.svg)](https://github.com/your-username/mvp-generate-template/actions)
[![codecov](https://codecov.io/gh/your-username/mvp-generate-template/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/mvp-generate-template)
[![npm version](https://badge.fury.io/js/mvp-generate-template.svg)](https://badge.fury.io/js/mvp-generate-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A beautiful CLI tool to quickly generate MVP project templates with modern frameworks and best practices.

## ✨ Features

- 🎨 **Beautiful ASCII Art Welcome** - Eye-catching CLI interface
- 📋 **Interactive Template Selection** - Choose from multiple project types
- ⚡ **Express + Handlebars** - Full web server with real-time time display
- 🔧 **TypeScript Support** - Optional TypeScript configuration
- 📦 **ESBuild Integration** - Fast compilation setup
- 🎭 **Modern UI** - Beautiful responsive designs
- 🔄 **Real-time Features** - Live updates and animations
- ⚡ **Lightning Fast Build** - Uses ESBuild for ultra-fast compilation
- 🧪 **Comprehensive Testing** - Unit and integration tests with Vitest
- 🔍 **Code Quality Tools** - ESLint, Prettier, and automated CI/CD

## 🛠️ Installation

### Global Installation
```bash
npm install -g mvp-generate-template
```

### Local Development
```bash
git clone <repository-url>
cd mvp-generate-template
npm install
npm run build
```

## 🚀 Usage

### Basic Usage
```bash
mvp-gen init my-awesome-project
```

### With Options
```bash
mvp-gen init my-project --template express-hbs --typescript --esbuild
```

## 📋 Available Templates

### 🌐 Express + Handlebars
- Full-featured web server
- Real-time server time display
- Beautiful responsive UI
- Handlebars templating
- Auto-refresh functionality

### ⚡ Express API
- REST API server
- Security middleware (Helmet, CORS)
- Request logging
- Health check endpoints

### 🏗️ Basic Node.js
- Simple Node.js project
- Minimal setup
- Perfect for learning

## 🎯 CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <name>` | Project template to use | Interactive selection |
| `-ts, --typescript` | Add TypeScript support | Interactive prompt |
| `-es, --esbuild` | Add ESBuild configuration | Interactive prompt |

## 🎨 Interactive Features

When you run the CLI, you'll see:

1. **Beautiful ASCII Art** - MVP-GEN logo with colorful display
2. **Template Selection** - Interactive list with descriptions and emojis
3. **Configuration Options** - TypeScript and ESBuild setup prompts
4. **Progress Indicators** - Spinning loaders during project creation
5. **Success Messages** - Clear next steps and instructions

## 📁 Project Structure

```
mvp-generate-template/
├── src/
│   ├── commands/
│   │   └── init.ts           # Main init command
│   ├── utils/
│   │   ├── ascii.ts          # ASCII art display
│   │   ├── prompts.ts        # Interactive prompts
│   │   └── project.ts        # Project setup utilities
│   └── cli.ts                # CLI entry point
├── tests/
│   ├── helpers/              # Test utilities
│   └── integration/          # Integration tests
├── templates/
│   ├── express-hbs/          # Express + Handlebars template
│   ├── express-api/          # Express API template
│   └── basic-node/           # Basic Node.js template
├── scripts/
│   └── test-build.mjs        # Build testing script
├── .github/workflows/        # GitHub Actions CI/CD
├── esbuild.config.mjs        # ESBuild configuration
├── vitest.config.ts          # Vitest configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc.json         # Prettier configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🎭 Express + Handlebars Template Features

The flagship template includes:

- **Real-time Clock Display** - Shows server time in multiple formats
- **Beautiful Gradient Design** - Modern UI with animations
- **Interactive Time Refresh** - Manual and automatic updates
- **Responsive Layout** - Mobile-friendly design
- **Error Pages** - Custom 404 and 500 error pages
- **API Endpoints** - JSON time API for frontend integration

### Template Pages
- **Home Page** - Time display with feature showcase
- **API Endpoint** - `/api/time` for JSON responses
- **Error Handling** - Graceful error pages

## 🔧 Development & Build

### Available Scripts

```bash
# Development with watch mode (auto-rebuild)
npm run dev

# Build for development
npm run build

# Build for production (minified)
npm run build:prod

# Test the build
npm run test-build

# Clean build directory
npm run clean

# Run tests
npm test
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage

# Code quality
npm run lint              # Lint code
npm run lint:fix          # Fix linting issues
npm run format            # Format code
npm run format:check      # Check formatting
npm run typecheck         # Type checking

# Full CI pipeline
npm run ci                # Run all checks

# Quick test (build + help)
npm run test-build
```

### Development Workflow

```bash
# Start development with auto-reload
npm run dev

# In another terminal, test your changes
node dist/cli.js init test-project

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run format:check
```

### Testing

The project includes comprehensive testing:

- **Unit Tests** - For individual functions and utilities
- **Integration Tests** - For CLI functionality and templates
- **Coverage Reports** - Minimum 80% coverage required
- **Cross-platform Testing** - Tested on Linux, Windows, and macOS

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Test CLI build process
npm run test-build
```

### Code Quality

- **ESLint** - Catches potential bugs and enforces code style
- **Prettier** - Consistent code formatting
- **TypeScript** - Type safety and better IDE support
- **Vitest** - Fast testing framework with coverage
- **GitHub Actions** - Automated CI/CD pipeline

## 🚀 Performance

Thanks to ESBuild, the CLI tool offers:

- **Build Speed**: ~10x faster than traditional TypeScript compiler
- **Bundle Size**: Optimized output with tree-shaking
- **Startup Time**: Near-instant CLI execution
- **Watch Mode**: Lightning-fast rebuilds during development

## 🔄 CI/CD Pipeline

The project includes automated workflows for:

### Continuous Integration
- **Code Quality Checks** - Linting, formatting, type checking
- **Testing** - Unit and integration tests with coverage
- **Cross-platform Testing** - Linux, Windows, macOS
- **Security Analysis** - CodeQL security scanning
- **Build Verification** - Ensure CLI builds and works correctly

### Continuous Deployment
- **Automated Releases** - Create GitHub releases on version tags
- **NPM Publishing** - Automatic package publishing
- **Release Notes** - Generated from commits and changes

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with `npm run dev` for auto-rebuild
4. **Write tests** for your changes
5. **Run the full CI pipeline** (`npm run ci`)
6. **Test the build** (`npm run test-build`)
7. **Commit your changes** (`git commit -m 'Add amazing feature'`)
8. **Push to the branch** (`git push origin feature/amazing-feature`)
9. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (enforced by ESLint and Prettier)
- Write tests for new functionality
- Ensure all CI checks pass
- Update documentation as needed
- Test your changes across different platforms

## 📊 Quality Metrics

- **Test Coverage**: Minimum 80% required
- **Build Time**: < 5 seconds for development builds
- **CLI Startup**: < 500ms for command execution
- **Cross-platform**: Tested on Node.js 16, 18, and 20

## 📄 License

MIT License - feel free to use this project for your awesome MVPs!

## 🎉 Happy Coding!

Created with ❤️ for developers who want to build MVPs quickly and beautifully. 