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
- **Git-First Configuration System**: Default Git repository integration for configurations and templates
  - **NEW DEFAULT BEHAVIOR**: Automatically loads configurations and templates from Git repository
  - Load workflow configurations from Git repositories by default
  - Load templates configurations from Git repositories by default  
  - Download templates directly from Git repositories automatically
  - Support for custom Git repository URLs with `--repo` option
  - Support for specific Git branches with `--branch` option
  - Graceful fallback to local files when Git access fails

- **Smart Cache Management**: Optimized caching system with multiple storage strategies
  - **Optimal Cache Directory**: Uses npm cache directory or OS-appropriate cache locations
  - **Platform-specific cache locations**:
    - Windows: `%LOCALAPPDATA%\mvp-generate-template\cache`
    - macOS: `~/Library/Caches/mvp-generate-template`
    - Linux: `~/.cache/mvp-generate-template` (or `$XDG_CACHE_HOME`)
  - **npm cache integration**: Automatically uses npm cache directory when available
  - **No workspace pollution**: Never saves cache files in current working directory

- **Enhanced CLI Options**: Git repository integration with cache control
  - `--repo <url>`: Custom Git repository URL for configurations and templates
  - `--branch <name>`: Specific Git branch to use (default: main)
  - `--local`: **NEW FLAG** - Use local files first instead of Git (legacy v0.2.0 behavior)
  - `--no-cache`: Disable caching and use temporary directories
  - `--direct-fetch`: Fetch content directly from Git without any local storage (fastest)
  - Smart temporary directory management for Git operations
  - Comprehensive Git operation logging in debug mode

- **Cache Management Commands**: Complete cache control system
  - `mvp-gen cache info`: Show cache information and statistics
  - `mvp-gen cache clean`: Clean all cached repositories and configurations
  - `mvp-gen cache path`: Show cache directory path
  - Cache size reporting and repository listing
  - Force clean option with `--force` flag

- **Direct Git Fetching**: Multiple content retrieval strategies
  - **Git Archive**: Direct file content fetching without local cloning
  - **GitHub API**: Fallback for GitHub repositories using REST API
  - **Fallback curl**: Command-line fallback for maximum compatibility
  - **Smart fallback chain**: Automatically tries multiple methods for reliability

- **Default Git Repository**: Seamless configuration loading
  - Default repository: `https://github.com/duyvu871/mvp-generate-template.git`
  - Automatic configuration discovery from Git when no local files found
  - Zero-configuration setup for new users
  - Backward compatibility maintained with `--local` flag

- **Advanced Template Management**: Complete template coverage with Git integration
  - 18+ template variants automatically available from Git
  - Git-first template discovery and downloading
  - Enhanced template resolution with intelligent fallback
  - Local template support maintained with `--local` flag

- **Configuration Priority System**: Smart Git-first loading
  - **Default**: Git repository → Local files → Built-in defaults
  - **With --local**: Local files → Git repository → Built-in defaults
  - Graceful error handling and automatic fallback
  - Comprehensive debug logging for troubleshooting

### Changed
- **Default Behavior**: Git-first approach for all operations
  - **BREAKING**: Default behavior now downloads from Git repository first
  - **MIGRATION**: Use `--local` flag to maintain v0.2.0 behavior
  - Zero-configuration experience for new users
  - Automatic access to latest templates and configurations

- **Storage Strategy**: No more workspace pollution
  - **REMOVED**: No temporary files in current working directory
  - **IMPROVED**: All cache files stored in appropriate system locations
  - **OPTIMIZED**: Repository cloning uses optimal cache directories
  - **PERFORMANCE**: Smart cache reuse and management

- **Configuration Loading**: Git repository as primary source
  - All configuration functions use Git by default
  - Repository cloning and caching handled automatically
  - Local files used as fallback when Git fails
  - Enhanced error messages with clear fallback information

- **Template Discovery**: Multi-source with Git priority
  - Git repositories checked first for templates
  - Local templates used as fallback
  - Enhanced error messages with Git suggestions
  - Performance optimizations for Git operations

- **CLI Help**: Updated examples and documentation
  - Clear distinction between Git-first and local-first modes
  - Examples showing both approaches
  - Migration guidance for existing users
  - Comprehensive usage patterns

### Technical Details
- **Cache Architecture**: Multi-tier caching with platform optimization
- **Git Integration**: Native git commands with multiple fallback strategies
- **Memory Efficiency**: Direct content fetching option to minimize storage
- **Cross-Platform**: OS-specific cache directory detection and management
- **Network Optimization**: Shallow clones and smart content fetching
- **Error Handling**: Comprehensive Git operation error handling with graceful fallbacks

### Example Usage

#### New Default Behavior (Git-First with Smart Caching)
```bash
# Uses Git repository by default with optimal caching (NEW DEFAULT)
mvp-gen init my-project

# Check cache information
mvp-gen cache info

# Clean cache when needed
mvp-gen cache clean

# Use different caching strategies
mvp-gen init my-app --no-cache        # Use temp directories
mvp-gen init my-project --direct-fetch # Direct fetch, no storage
```

#### Cache Management
```bash
# View cache information
mvp-gen cache info

# Show detailed cache information
mvp-gen cache info --debug

# Get cache directory path
mvp-gen cache path

# Clean cache with confirmation
mvp-gen cache clean

# Force clean without confirmation
mvp-gen cache clean --force
```

#### Legacy Behavior (Local-First)
```bash
# Use local files first (v0.2.0 behavior)
mvp-gen init my-project --local

# Local workflow with Git templates
mvp-gen init my-app --workflow ./local-workflow.yml

# Specify local configuration files explicitly
mvp-gen init my-project --workflow ./config/workflow.yml --templates ./config/templates.json --local
```

#### Hybrid Approaches
```bash
# Git configs, local templates
mvp-gen init my-project --templates ./local-templates.json

# Specific Git configurations
mvp-gen init my-app --workflow config/advanced-workflow.yml --repo https://github.com/user/configs.git
```

### Migration Guide for 0.3.0

#### Cache Storage Changes
- **No Impact**: Cache files automatically stored in optimal locations
- **Workspace Clean**: Current working directory no longer polluted with temp files
- **Performance**: Faster subsequent operations due to smart caching
- **Cross-Platform**: Cache locations follow OS conventions

#### Cache Directory Locations
- **Windows**: `%LOCALAPPDATA%\mvp-generate-template\cache`
- **macOS**: `~/Library/Caches/mvp-generate-template`
- **Linux**: `~/.cache/mvp-generate-template`
- **npm users**: Automatically uses npm cache directory when available

#### For Existing Users (v0.2.0)
- **No breaking changes**: Your existing local configurations will continue to work
- **Better performance**: Automatic caching improves operation speed
- **New behavior**: Add `--local` flag to maintain exact v0.2.0 behavior
- **Cache benefits**: Faster template downloads and configuration loading

#### For New Users
- **Zero setup**: Just run `mvp-gen init my-project` for automatic Git integration
- **Latest templates**: Always get the most up-to-date templates and configurations
- **Smart caching**: Optimal performance with automatic cache management
- **No configuration needed**: Default repository provides comprehensive setup

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

### Performance Improvements
- **Smart Caching**: Git repositories cached in optimal system locations
- **Direct Fetching**: Option to fetch content without any local storage
- **Shallow Clones**: Minimal Git operations for faster downloads
- **Cache Reuse**: Intelligent cache management and reuse
- **Network Optimization**: Multiple content retrieval strategies for reliability

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