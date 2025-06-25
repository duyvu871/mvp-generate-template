# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional template validation and error handling
- GitHub Actions workflow templates for generated projects
- React + Vite template
- Next.js template
- Docker configuration options
- Database integration templates (MongoDB, PostgreSQL)
- Plugin system for custom templates
- Interactive template customization

## [0.3.0] - 2025-06-25

### Added
- **Git-Based Configuration System**: Remote configuration and template loading
  - Load workflow configurations from Git repositories
  - Load templates configurations from Git repositories  
  - Download templates directly from Git repositories
  - Support for custom Git repository URLs with `--repo` option
  - Support for specific Git branches with `--branch` option
  - Automatic fallback to local files when Git access fails

- **Enhanced CLI Options**: Git repository integration
  - `--repo <url>`: Git repository URL for configurations and templates
  - `--branch <name>`: Git branch to use (default: main)
  - Smart temporary directory management for Git operations
  - Comprehensive Git operation logging in debug mode

- **Advanced Template Management**: Complete template coverage
  - 18+ template variants with all language/build combinations
  - Comprehensive templates configuration with full metadata
  - Enhanced template discovery from Git repositories
  - Graceful fallback from Git to local templates

- **Configuration Priority System**: Intelligent configuration loading
  - Local files checked first, then Git repository
  - Graceful fallback when Git operations fail
  - Comprehensive error handling and user feedback
  - Debug logging for configuration discovery process

- **Repository Structure Support**: Organized configuration repositories
  - Support for `config/` directory structure
  - Root level configuration files
  - Custom template directories in Git repositories
  - Flexible path resolution for configurations

### Changed
- **Configuration Loading**: Enhanced with Git support
  - All configuration functions now support Git URLs
  - Automatic repository cloning and caching
  - Smart pull operations for existing repositories
  - Temporary directory cleanup management

- **Template Discovery**: Multi-source template resolution
  - Git repositories as primary template source
  - Local templates as fallback option
  - Enhanced error messages with Git suggestions
  - Performance optimizations for Git operations

### Technical Details
- **Git Integration**: Native git commands for repository operations
- **Temporary Files**: Smart temporary directory management for Git operations
- **Error Handling**: Comprehensive Git operation error handling
- **Performance**: Shallow clones and reusable temp directories for efficiency

### Example Usage

#### Using Git Repository for Configurations
```bash
# Use default Git repository (https://github.com/duyvu871/mvp-generate-template.git)
mvp-gen init my-project --repo https://github.com/duyvu871/mvp-generate-template.git

# Use custom Git repository with specific branch
mvp-gen init my-app --repo https://github.com/user/custom-configs.git --branch develop

# Use specific configuration files from Git
mvp-gen init my-project --workflow config/advanced-workflow.yml --repo https://github.com/user/configs.git

# Debug Git operations
mvp-gen init my-app --repo https://github.com/user/configs.git --debug
```

#### Local + Git Hybrid Approach
```bash
# Try local first, fallback to Git
mvp-gen init my-project --repo https://github.com/user/configs.git

# Use local workflow, Git templates
mvp-gen init my-app --workflow ./local-workflow.yml --repo https://github.com/user/templates.git
```

### Repository Structure for Git-Based Configurations
```
your-config-repo/
├── config/
│   ├── workflow.yml          # Workflow configuration
│   ├── templates.json        # Templates configuration
│   └── advanced-workflow.yml # Alternative workflow
├── templates/
│   ├── ts-esbuild-express-hbs/
│   ├── js-default-express-api/
│   └── custom-template/
├── mvp-gen.yml              # Root level workflow
└── templates.json           # Root level templates config
```

### Migration Guide for 0.3.0
- **Existing Projects**: Continue to work without any changes
- **New Git Features**: Add `--repo` option to download templates and configurations from Git
- **Configuration Files**: Can be stored locally or in Git repositories
- **Templates**: Available locally and from Git repositories with automatic fallback
- **Debug Mode**: Use `--debug` flag to troubleshoot Git operations and configuration loading

## [0.2.0] - 2025-06-25

### Added
- **Configuration System**: Complete YAML workflow and JSON templates configuration support
  - YAML workflow configuration (`mvp-gen.yml`, `.mvp-gen.yml`, `config/workflow.yml`)
  - JSON templates configuration (`templates.json`, `.templates.json`, `config/templates.json`)
  - Zod schema validation for all configuration files
  - Auto-discovery of configuration files in standard locations

- **Dynamic Prompts Engine**: Execute custom prompt workflows based on configuration
  - Support for all inquirer prompt types: `list`, `confirm`, `input`, `checkbox`, `password`
  - Conditional prompts with `when` conditions (`hasTypeScript`, `hasESBuild`, `hasDatabase`, `isExpressTemplate`)
  - Input validation functions (`required`, `isValidProjectName`)
  - Input filters (`trim`, `toLowerCase`, `toKebabCase`)
  - Template auto-population from templates configuration

- **Enhanced Template System**: Rich template metadata and display
  - Template categories: `web`, `api`, `cli`, `basic`
  - Template options: `ts`, `esbuild`, `nextjs`, `react`, `vue`, `docker`, `mongodb`, `postgresql`
  - Template priorities for ordering
  - Experimental and deprecated template flags
  - Configurable template display with descriptions and options

- **CLI Options**: New command-line flags for enhanced control
  - `--config <path>`: Use specific configuration file
  - `--workflow <path>`: Use specific workflow YAML file
  - `--templates <path>`: Use specific templates JSON file
  - `--debug`: Show detailed debug information
  - `--verbose`: Show verbose output

- **Post-Processing**: Execute custom scripts after template generation
  - Custom script execution with environment variable support
  - Git initialization and commit support
  - Configurable package.json updates

- **Debug Mode**: Comprehensive debugging capabilities
  - Configuration discovery and loading details
  - Template selection information
  - Workflow execution tracing
  - Environment variable: `NODE_ENV=development`

### Changed
- **Template Structure**: Templates now determine TypeScript/ESBuild settings automatically
  - No separate prompts for TypeScript/ESBuild when using configured templates
  - Template configurations override CLI prompt answers
  - Backward compatibility maintained with fallback prompts

- **Build System**: Optimized bundle size and dependencies
  - Externalized `yaml` and `zod` dependencies in esbuild configuration
  - Reduced bundle size from 417KB to 27KB
  - Added debug script: `npm run start:debug`

- **Template Display**: Enhanced choice formatting
  - Category badges: `[WEB]`, `[API]`, `[CLI]`, `[BASIC]`
  - Options display: `(TypeScript + ESBuild)`
  - Multi-line descriptions with gray color
  - Configurable display options: `showDescription`, `showCategory`, `showOptions`

### Fixed
- **Linting**: Resolved ESLint and TypeScript errors
  - Fixed unused imports and variables
  - Proper type annotations for all functions
  - Consistent code formatting and style

- **Testing**: Updated test expectations
  - Fixed ESBuild default value test (now defaults to `true`)
  - Updated template directory validation for new structure
  - All tests now passing

### Technical Details
- **Dependencies**: Added `yaml@2.3.4`, `zod@3.22.4`
- **TypeScript**: Updated to `5.3.3`
- **ESBuild**: Updated to `0.19.9`
- **Schema Validation**: Complete Zod schemas for all configuration types
- **Type Safety**: Full TypeScript coverage for configuration system

### Example Configurations

#### Basic Workflow (`mvp-gen.yml`)
```yaml
version: "1.0.0"
name: "Simple MVP Generator Workflow"
description: "Basic workflow for generating MVP projects"

steps:
  - type: list
    name: template
    message: "Select a project template:"
    required: false
    pageSize: 20
    loop: false
    templateDisplay:
      showDescription: true
      showCategory: true
      showOptions: true

  - type: confirm
    name: npmInstall
    message: "Install dependencies automatically?"
    default: true
    required: false

postProcess:
  updatePackageJson: true
  installDependencies: false
  customScripts: []
```

#### Templates Configuration (`templates.json`)
```json
{
  "version": "1.0.0",
  "templates": [
    {
      "path": "ts-esbuild-express-hbs",
      "name": "Express + Handlebars",
      "description": "Full-stack web application with Express and Handlebars",
      "options": ["ts", "esbuild"],
      "category": "web",
      "priority": 100,
      "deprecated": false,
      "experimental": false
    }
  ],
  "defaultOptions": {
    "typescript": true,
    "esbuild": true,
    "npmInstall": true
  }
}
```

### Migration Guide
- Existing projects will continue to work without configuration files
- To use new features, add `mvp-gen.yml` and/or `templates.json` to your project root
- Templates now auto-configure TypeScript/ESBuild based on template options
- Use `--debug` flag to troubleshoot configuration loading

## [0.1.6] - 2025-06-25

### Added
- Initial project structure
- Basic template generation
- TypeScript and ESBuild support
- Template variants: js/ts + default/esbuild combinations

### Fixed
- Template directory structure
- Package.json generation
- Dependency installation

## [0.1.5] - 2025-06-25

### Fixed
- Package configuration and build improvements
- Repository URL normalization
- Release workflow enhancements

## [0.1.0] - 2025-06-25

### Added
- 🎨 **Beautiful ASCII art welcome screen** with MVP-GEN branding and colorful display
- 📋 **Interactive template selection** with 4 comprehensive project types:
  - **Express + Handlebars** - Full-featured web server with real-time features
  - **Express API** - RESTful API server with security middleware
  - **Node.js CLI Tool** - Command-line application template
  - **Basic Node.js** - Minimal Node.js project setup
- 🔧 **Optional TypeScript configuration** with automatic setup and dependencies
- 📦 **Optional ESBuild integration** for lightning-fast compilation
- ⚡ **Express + Handlebars template features**:
  - Real-time server time display in multiple formats (UTC, Local, ISO)
  - Beautiful gradient UI with responsive design
  - Interactive time refresh functionality with manual and auto-refresh
  - Modern CSS with animations and Font Awesome icons
  - Custom error pages (404/500) with consistent styling
  - JSON API endpoint at `/api/time` for frontend integration
  - Auto-refresh every 30 seconds with visual indicators
- 🧪 **Comprehensive testing setup**:
  - Vitest for unit and integration testing
  - Test coverage reporting with 80% minimum threshold
  - Test helpers and utilities for CLI testing
  - Integration tests for template generation
  - Cross-platform testing support
- 🔍 **Code quality tools**:
  - ESLint with TypeScript support and modern rules
  - Prettier for consistent code formatting
  - Pre-configured settings for professional development
  - Git hooks for automated code quality checks
- ⚡ **Ultra-fast build system** with ESBuild:
  - Development builds with watch mode
  - Production builds with minification
  - Source maps for debugging
  - Cross-platform executable generation
  - Build time optimization (~5x faster than tsc)
- 🚀 **Professional development workflow**:
  - Cross-platform compatibility (Windows, macOS, Linux)
  - NPM scripts for all development tasks
  - CI-ready configuration
  - Professional package structure

### Technical Implementation
- **Core Framework**: TypeScript with ESM modules
- **CLI Framework**: Commander.js for robust command parsing
- **Interactive Prompts**: Inquirer.js with beautiful interfaces
- **Terminal Styling**: Chalk for colorful output and Ora for loading spinners
- **File Operations**: fs-extra for enhanced file system operations
- **Build System**: ESBuild for ultra-fast compilation and bundling
- **Testing Framework**: Vitest with coverage reporting
- **Code Quality**: ESLint + Prettier with TypeScript support

### Project Structure
- Clean separation of concerns with modular architecture
- Template system with easy extensibility
- Utility functions for project setup and configuration
- Comprehensive test coverage for all core functionality
- Professional documentation and examples

### Package Configuration
- **Package Name**: `@ssit-hub/mvp-generate-template` (scoped package)
- **Binary**: `mvp-gen` command globally available
- **Dependencies**: Minimal runtime dependencies for fast installation
- **Files**: Optimized package size with only necessary files
- **Cross-platform**: Node.js 16+ and npm 7+ support

### Templates Included
1. **Express + Handlebars**: Complete web application with UI
2. **Express API**: REST API server with middleware
3. **Node.js CLI**: Command-line tool template
4. **Basic Node.js**: Minimal project setup

### Documentation
- Comprehensive README with usage examples
- Professional changelog following Keep a Changelog format
- Clear installation and setup instructions
- Template documentation with feature descriptions
- Contributing guidelines preparation

---

## Version History Summary

- **v0.1.6**: Current directory support and template path fixes
- **v0.1.5**: Package configuration and workflow improvements  
- **v0.1.0**: Initial release with core functionality and 4 templates

## Migration Guide

### New Installation (v0.1.6)
Install the latest version globally:
```bash
npm install -g @ssit-hub/mvp-generate-template
```

### Migration from v0.1.5
Update to the latest version:
```bash
npm update -g @ssit-hub/mvp-generate-template
```

### New Features Available
- Use `mvp-gen init .` to create projects in current directory
- Improved template resolution for npx usage

## Upcoming Features (v0.2.0)

- Template validation and error recovery
- Custom template creation tools
- Additional framework templates (React, Vue, Next.js)
- Docker integration options
- Database setup automation
- Plugin architecture for extensibility

## Support

For questions, bug reports, or feature requests:
- 📧 Email: dubuicp123@gmail.com
- 🐛 GitHub Issues: [Report a bug](https://github.com/duyvu871/mvp-generate-template/issues)
- 💡 Feature Requests: [Request a feature](https://github.com/duyvu871/mvp-generate-template/issues)
- 📖 Documentation: [GitHub Repository](https://github.com/duyvu871/mvp-generate-template)

## Contributors

- **Bùi An Du** ([@duyvu871](https://github.com/duyvu871)) - Creator and maintainer

## Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Inspired by modern CLI tools and development workflows
- Built with love for developers who want to build MVPs quickly

---

**Note**: This changelog will be updated with each release. Please check back for the latest changes and updates. 