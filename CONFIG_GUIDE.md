# Configuration Guide

This guide explains how to configure the MVP Template Generator CLI using YAML workflow files and JSON template definitions.

## 📁 Configuration Structure

The CLI supports two types of configuration files:

1. **Workflow Configuration (YAML)** - Defines the prompt flow and steps
2. **Templates Configuration (JSON)** - Defines available templates and their metadata

## 🔧 Configuration Discovery

The CLI automatically searches for configuration files in these locations:

### Workflow Configuration (YAML)
- `mvp-gen.yml`
- `mvp-gen.yaml`
- `.mvp-gen.yml`
- `.mvp-gen.yaml`
- `config/workflow.yml`
- `config/workflow.yaml`

### Templates Configuration (JSON)
- `templates.json`
- `.templates.json`
- `config/templates.json`
- `templates/config.json`

## 📝 Workflow Configuration (YAML)

### Basic Structure

```yaml
version: "1.0.0"
name: "My Custom Workflow"
description: "Custom workflow for generating projects"

steps:
  - type: list
    name: template
    message: "Select a project template:"
    required: false

  - type: confirm
    name: typescript
    message: "Add TypeScript support?"
    default: true
    required: false

postProcess:
  updatePackageJson: true
  installDependencies: false
  customScripts: []
```

### Step Types

#### List
```yaml
- type: list
  name: template
  message: "Select a project template:"
  required: false
  # Choices will be loaded from templates.json automatically
```

#### Confirm
```yaml
- type: confirm
  name: typescript
  message: "Add TypeScript support?"
  default: true
  required: false
```

#### Input
```yaml
- type: input
  name: projectName
  message: "What is your project name?"
  validate: isValidProjectName
  filter: toKebabCase
  required: true
```

#### Checkbox
```yaml
- type: checkbox
  name: features
  message: "Select additional features:"
  choices:
    - name: "Docker support"
      value: docker
      description: "Add Docker configuration files"
    - name: "Database integration"
      value: database
      description: "Add database setup"
  required: false
```

#### Password
```yaml
- type: password
  name: apiKey
  message: "Enter your API key:"
  required: true
```

### Conditional Steps

Use the `when` property to conditionally show steps:

```yaml
- type: confirm
  name: esbuild
  message: "Add ESBuild for fast compilation?"
  default: true
  when: hasTypeScript
  required: false
```

Available condition functions:
- `hasTypeScript` - Show if TypeScript is enabled
- `hasESBuild` - Show if ESBuild is enabled
- `hasDatabase` - Show if database feature is selected
- `isExpressTemplate` - Show if Express template is selected

### Validation Functions

Use the `validate` property for input validation:

```yaml
- type: input
  name: projectName
  message: "What is your project name?"
  validate: isValidProjectName
  required: true
```

Available validation functions:
- `required` - Field cannot be empty
- `isValidProjectName` - Valid project name format

### Filter Functions

Use the `filter` property to transform input:

```yaml
- type: input
  name: projectName
  message: "What is your project name?"
  filter: toKebabCase
  required: true
```

Available filter functions:
- `trim` - Remove whitespace
- `toLowerCase` - Convert to lowercase
- `toKebabCase` - Convert to kebab-case

### Post-Processing

Configure what happens after template copy:

```yaml
postProcess:
  updatePackageJson: true      # Update package.json with project name
  installDependencies: false   # Don't auto-install (controlled by prompt)
  customScripts:               # Run custom commands
    - "git init"
    - "git add ."
    - "git commit -m 'Initial commit'"
```

## 📋 Templates Configuration (JSON)

### Basic Structure

```json
{
  "version": "1.0.0",
  "templates": [
    {
      "path": "ts-esbuild-express-hbs",
      "name": "Express + Handlebars (TypeScript + ESBuild)",
      "description": "Full-stack web application with Express, Handlebars, TypeScript, and ESBuild",
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

### Template Properties

- **path** (required) - Directory name in templates folder
- **name** (required) - Display name for the template
- **description** (optional) - Detailed description
- **options** (optional) - Array of supported options
- **category** (optional) - Template category for grouping
- **priority** (optional) - Display order (higher = first)
- **deprecated** (optional) - Hide from selection if true
- **experimental** (optional) - Mark as experimental

### Template Options

Standard options:
- `ts` - TypeScript support
- `esbuild` - ESBuild support
- `nextjs` - Next.js framework
- `react` - React library
- `vue` - Vue.js framework
- `docker` - Docker configuration
- `mongodb` - MongoDB database
- `postgresql` - PostgreSQL database

### Default Options

Set global defaults for prompts:

```json
{
  "defaultOptions": {
    "typescript": true,
    "esbuild": true,
    "npmInstall": true
  }
}
```

## 🚀 Usage Examples

### Custom Workflow File

Create `mvp-gen.yml`:

```yaml
version: "1.0.0"
name: "Company Project Generator"
description: "Generates projects with company standards"

steps:
  - type: input
    name: projectName
    message: "Project name:"
    validate: isValidProjectName
    filter: toKebabCase
    required: true

  - type: list
    name: template
    message: "Select template:"
    required: false

  - type: checkbox
    name: features
    message: "Additional features:"
    choices:
      - name: "Docker"
        value: docker
      - name: "CI/CD"
        value: cicd
      - name: "Documentation"
        value: docs
    required: false

  - type: confirm
    name: typescript
    message: "TypeScript?"
    default: true
    required: false

postProcess:
  updatePackageJson: true
  installDependencies: false
  customScripts:
    - "git init"
    - "npm install"
```

### Custom Templates File

Create `templates.json`:

```json
{
  "version": "1.0.0",
  "templates": [
    {
      "path": "company-web-app",
      "name": "Company Web App",
      "description": "Standard company web application",
      "options": ["ts", "esbuild", "docker"],
      "category": "web",
      "priority": 100,
      "deprecated": false,
      "experimental": false
    },
    {
      "path": "company-api",
      "name": "Company API",
      "description": "Standard company REST API",
      "options": ["ts", "esbuild", "docker", "postgresql"],
      "category": "api",
      "priority": 90,
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

## 🎯 CLI Usage

### Default Configuration
```bash
# Uses auto-discovered config files
mvp-gen init my-project
```

### Specific Configuration Files
```bash
# Use specific workflow file
mvp-gen init my-project --workflow ./custom-workflow.yml

# Use specific templates file
mvp-gen init my-project --templates ./custom-templates.json

# Use both custom configs
mvp-gen init my-project --workflow ./workflow.yml --templates ./templates.json
```

### Override with CLI Options
```bash
# CLI options override config prompts
mvp-gen init my-project --template express-api --typescript --esbuild --install
```

## 🔧 Advanced Features

### Custom Validation Functions

Register custom validation in your CLI extension:

```typescript
import { registerValidationFunction } from '@ssit-hub/mvp-generate-template';

registerValidationFunction('isValidEmail', (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) || 'Please enter a valid email address';
});
```

### Custom Condition Functions

```typescript
import { registerConditionFunction } from '@ssit-hub/mvp-generate-template';

registerConditionFunction('isProduction', (answers) => {
  return answers.environment === 'production';
});
```

### Custom Filter Functions

```typescript
import { registerFilterFunction } from '@ssit-hub/mvp-generate-template';

registerFilterFunction('toUpperCase', (value: string) => {
  return value.toUpperCase();
});
```

## 📊 Schema Validation

Configuration files are validated using Zod schemas. Invalid configurations will show helpful error messages:

```
❌ Invalid YAML configuration:
  • steps.0.name: Required
  • steps.1.type: Invalid enum value. Expected 'list' | 'confirm' | 'input' | 'checkbox' | 'password', received 'invalid'
```

## 🐛 Troubleshooting

### Configuration Not Found
- Check file names and locations
- Ensure YAML syntax is valid
- Verify JSON is properly formatted

### Validation Errors
- Check required fields are present
- Verify enum values are correct
- Ensure function references exist

### Template Not Found
- Verify template path exists in templates directory
- Check template naming matches configuration
- Ensure template has required files (package.json, src/)

## 📚 Examples

See the included example files:
- `mvp-gen.yml` - Simple workflow example
- `config/workflow.yml` - Advanced workflow example
- `templates.json` - Templates configuration example

## 🔄 Migration

### From Legacy CLI
Existing templates work with fallback support. To upgrade:

1. Create `templates.json` with your template definitions
2. Create `mvp-gen.yml` for custom workflows
3. Update template directories to follow new naming convention

### Version Compatibility
- Version 1.0.0+ supports configuration files
- Legacy templates remain supported
- New features require updated configuration format

---

For more examples and advanced usage, see the [Template Creation Guide](TEMPLATE_CREATION_GUIDE.md). 