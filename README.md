# 🚀 MVP Template Generator

[![npm version](https://badge.fury.io/js/@ssit-hub%2Fmvp-generate-template.svg)](https://badge.fury.io/js/@ssit-hub/mvp-generate-template)
[![downloads](https://img.shields.io/npm/dm/@ssit-hub/mvp-generate-template.svg)](https://npmjs.org/package/@ssit-hub/mvp-generate-template)
[![CI](https://github.com/duyvu871/mvp-generate-template/workflows/CI/badge.svg)](https://github.com/duyvu871/mvp-generate-template/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A beautiful CLI tool to quickly generate MVP project templates with modern frameworks and best practices.

Generate production-ready projects in seconds with interactive prompts, TypeScript support, and beautiful templates.

![CLI Demo](https://raw.githubusercontent.com/duyvu871/mvp-generate-template/main/assets/demo.gif)

## ✨ Features

- 🎨 **Beautiful CLI Interface** - Interactive prompts with ASCII art
- 📋 **Multiple Templates** - Express, APIs, CLI tools, and more
- ⚡ **Express + Handlebars** - Full web server with real-time features
- 🔧 **TypeScript Ready** - Optional TypeScript configuration
- 📦 **ESBuild Integration** - Lightning-fast compilation
- 🎭 **Modern UI Components** - Responsive designs out of the box
- 🧪 **Testing Setup** - Vitest, ESLint, Prettier included
- 🚀 **Production Ready** - CI/CD pipelines and best practices

## 📦 Installation

```bash
# Install globally (recommended)
npm install -g @ssit-hub/mvp-generate-template

# Or use with npx (no installation required)
npx @ssit-hub/mvp-generate-template init my-project
```

## 🚀 Quick Start

```bash
# Create a new project
mvp-gen init my-awesome-project

# Follow the interactive prompts to:
# 1. Choose your template
# 2. Select TypeScript support
# 3. Configure build tools
```

## 📋 Available Templates

### 🌐 Express + Handlebars
Perfect for full-stack web applications
- Real-time server time display
- Beautiful responsive UI with gradients
- Handlebars templating engine
- Auto-refresh functionality
- Error pages (404/500)

### ⚡ Express API
RESTful API server template
- Security middleware (Helmet, CORS)
- Request logging with Morgan
- Health check endpoints
- JSON response handling

### 📦 Node.js CLI Tool
Command-line application template
- Commander.js integration
- Inquirer prompts
- Chalk for colored output
- Build scripts included

### 🏗️ Basic Node.js
Minimal Node.js project
- Simple entry point
- Package.json setup
- NPM scripts configured

## 🎯 CLI Usage

### Basic Command
```bash
mvp-gen init <project-name>
```

### With Options
```bash
mvp-gen init my-project --template express-hbs --typescript --esbuild
```

### Available Options
| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--template <name>` | `-t` | Template to use | Interactive selection |
| `--typescript` | `-ts` | Add TypeScript support | Prompted |
| `--esbuild` | `-es` | Add ESBuild config | Prompted |
| `--help` | `-h` | Show help | - |
| `--version` | `-V` | Show version | - |

### Template Names
- `express-hbs` - Express + Handlebars
- `express-api` - Express API server
- `node-cli` - Node.js CLI tool
- `basic-node` - Basic Node.js project

## 🎨 Interactive Experience

The CLI provides a beautiful interactive experience:

```
 ███╗   ███╗██╗   ██╗██████╗       ██████╗ ███████╗███╗   ██╗
 ████╗ ████║██║   ██║██╔══██╗     ██╔════╝ ██╔════╝████╗  ██║
 ██╔████╔██║██║   ██║██████╔╝     ██║  ███╗█████╗  ██╔██╗ ██║
 ██║╚██╔╝██║╚██╗ ██╔╝██╔═══╝      ██║   ██║██╔══╝  ██║╚██╗██║
 ██║ ╚═╝ ██║ ╚████╔╝ ██║          ╚██████╔╝███████╗██║ ╚████║
 ╚═╝     ╚═╝  ╚═══╝  ╚═╝           ╚═════╝ ╚══════╝╚═╝  ╚═══╝

          🚀 Project Template Generator 🚀

? Select a project template:
❯ 🌐 Express + Handlebars (Node.js web server)
  ⚡ Express API (REST API server)
  📦 Node.js CLI Tool
  🏗️ Basic Node.js Project
```

## 📖 Examples

### Create an Express Web App
```bash
mvp-gen init my-webapp
# Select: Express + Handlebars
# TypeScript: Yes
# ESBuild: Yes
```

### Create an API Server
```bash
mvp-gen init my-api --template express-api --typescript
```

### Create a CLI Tool
```bash
npx @ssit-hub/mvp-generate-template init my-cli-tool --template node-cli
```

## 🔧 Generated Project Structure

```
my-project/
├── src/
│   ├── index.ts          # Main entry point
│   ├── routes/           # Express routes (if applicable)
│   ├── views/            # Handlebars templates (if applicable)
│   └── public/           # Static assets (if applicable)
├── tests/
│   └── index.test.ts     # Test files
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config (if selected)
├── esbuild.config.mjs    # ESBuild config (if selected)
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
└── README.md             # Project documentation
```

## 🚀 After Generation

Once your project is generated:

```bash
cd my-project
npm install

# Development
npm run dev        # Start development server
npm run build      # Build for production
npm test           # Run tests

# Code Quality
npm run lint       # Lint code
npm run format     # Format code
```

## 🛠️ Requirements

- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher

## 🔄 Updates

Keep your global installation up to date:

```bash
npm update -g @ssit-hub/mvp-generate-template

# Check current version
mvp-gen --version
```

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT © [Bùi An Du](https://github.com/duyvu871)

## 🔗 Links

- [npm package](https://www.npmjs.com/package/@ssit-hub/mvp-generate-template)
- [GitHub repository](https://github.com/duyvu871/mvp-generate-template)
- [Report issues](https://github.com/duyvu871/mvp-generate-template/issues)
- [Changelog](CHANGELOG.md)

## ⭐ Support

If this tool helps you build amazing projects, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 📖 Improving documentation

---

**Happy coding!** 🎉 Build your MVP faster with beautiful, production-ready templates. 