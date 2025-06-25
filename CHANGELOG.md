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

## [0.1.6] - 2024-12-25

### Added
- 🎯 **Current Directory Support** - Initialize projects in current directory using `mvp-gen init .` or `mvp-gen init ./`
  - Automatically uses current directory name as project name
  - Smart directory validation (allows only safe files like .git, .gitignore, README.md)
  - Customized next steps instructions for current directory initialization
  - Enhanced help documentation with examples

### Fixed
- 🔧 **Template Path Resolution** - Fixed critical issue where templates couldn't be found when using npx
  - Improved package root detection algorithm
  - Works correctly with npm global installs, npx, and local development
  - Added template existence verification with clear error messages
  - Robust fallback mechanism for different installation contexts

### Enhanced
- 📖 **Documentation Updates**
  - Updated CLI usage examples with current directory options
  - Added comprehensive examples for different initialization methods
  - Improved help text with clear usage patterns
  - Enhanced README with new features and use cases

### Technical Improvements
- Better error handling for template resolution
- More robust path detection across different environments
- Improved user experience with contextual next steps
- Enhanced code formatting and structure

## [0.1.5] - 2024-12-25

### Fixed
- Package configuration and build improvements
- Repository URL normalization
- Release workflow enhancements

## [0.1.0] - 2024-12-25

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