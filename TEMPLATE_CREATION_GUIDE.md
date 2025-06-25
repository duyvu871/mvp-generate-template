# Template Creation Guide

This guide explains how to create templates for the MVP Template Generator with the new structured approach.

## 📁 Template Structure

Templates follow a naming convention: `{lang}-{build}-{template-name}`

### Naming Convention

- **Language**: `js` | `ts`
- **Build Tool**: `default` | `esbuild`  
- **Template Name**: `express-hbs` | `express-api` | `node-cli` | `basic-node`

### Examples

```
templates/
├── js-default-express-hbs/     # JavaScript + No build tool + Express Handlebars
├── js-esbuild-express-hbs/     # JavaScript + ESBuild + Express Handlebars
├── ts-default-express-hbs/     # TypeScript + No build tool + Express Handlebars
├── ts-esbuild-express-hbs/     # TypeScript + ESBuild + Express Handlebars
├── js-default-express-api/     # JavaScript + No build tool + Express API
├── js-esbuild-express-api/     # JavaScript + ESBuild + Express API
├── ts-default-express-api/     # TypeScript + No build tool + Express API
├── ts-esbuild-express-api/     # TypeScript + ESBuild + Express API
├── js-default-node-cli/        # JavaScript + No build tool + Node CLI
├── js-esbuild-node-cli/        # JavaScript + ESBuild + Node CLI
├── ts-default-node-cli/        # TypeScript + No build tool + Node CLI
├── ts-esbuild-node-cli/        # TypeScript + ESBuild + Node CLI
├── js-default-basic-node/      # JavaScript + No build tool + Basic Node
├── js-esbuild-basic-node/      # JavaScript + ESBuild + Basic Node
├── ts-default-basic-node/      # TypeScript + No build tool + Basic Node
└── ts-esbuild-basic-node/      # TypeScript + ESBuild + Basic Node
```

## 🏗️ Template Components

Each template directory must contain:

### 1. Package.json

Base configuration that will be updated by the CLI:

```json
{
  "name": "template-project-name",
  "version": "1.0.0",
  "description": "Template description",
  "main": "src/index.js", // or "src/index.ts" for TypeScript
  "scripts": {
    // Base scripts, will be enhanced based on options
  },
  "dependencies": {
    // Template-specific dependencies
  },
  "devDependencies": {
    // Development dependencies based on template type
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=7.0.0"
  },
  "keywords": ["template", "mvp", "..."],
  "author": "",
  "license": "MIT"
}
```

### 2. Source Files

#### JavaScript Templates (`js-*`)
- `src/index.js` - Main entry point
- Additional `.js` files as needed

#### TypeScript Templates (`ts-*`)
- `src/index.ts` - Main entry point  
- `tsconfig.json` - TypeScript configuration
- Additional `.ts` files as needed

### 3. Build Configuration

#### Default Build (`*-default-*`)
- No additional build configuration
- Uses Node.js directly or basic npm scripts

#### ESBuild Templates (`*-esbuild-*`)
- `esbuild.config.mjs` - ESBuild configuration
- Enhanced build scripts in package.json

### 4. Template-Specific Files

#### Express Handlebars (`*-express-hbs`)
- `views/` - Handlebars templates
- `public/` - Static assets (CSS, JS, images)
- `src/routes/` - Express routes (if applicable)

#### Express API (`*-express-api`)
- `src/routes/` - API routes
- `src/middleware/` - Custom middleware
- `src/models/` - Data models (if applicable)

#### Node CLI (`*-node-cli`)
- `src/commands/` - CLI commands
- `src/utils/` - Utility functions

#### Basic Node (`*-basic-node`)
- Minimal structure with just main file

## 📝 Template Creation Steps

### Step 1: Choose Template Variant

Decide which combination you want to create:
- **Language**: JavaScript or TypeScript?
- **Build**: Default or ESBuild?
- **Template**: Which base template?

### Step 2: Create Directory

```bash
mkdir templates/{lang}-{build}-{template-name}
cd templates/{lang}-{build}-{template-name}
```

### Step 3: Create Package.json

#### JavaScript + Default
```json
{
  "name": "project-name",
  "version": "1.0.0",
  "description": "Project description",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    // Template specific dependencies
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

#### JavaScript + ESBuild
```json
{
  "name": "project-name", 
  "version": "1.0.0",
  "description": "Project description",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "node esbuild.config.mjs --watch",
    "build": "node esbuild.config.mjs",
    "build:prod": "NODE_ENV=production node esbuild.config.mjs"
  },
  "dependencies": {
    // Template specific dependencies
  },
  "devDependencies": {
    "esbuild": "^0.19.0"
  }
}
```

#### TypeScript + Default
```json
{
  "name": "project-name",
  "version": "1.0.0", 
  "description": "Project description",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    // Template specific dependencies
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0"
  }
}
```

#### TypeScript + ESBuild
```json
{
  "name": "project-name",
  "version": "1.0.0",
  "description": "Project description", 
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "node esbuild.config.mjs --watch",
    "build": "node esbuild.config.mjs",
    "build:prod": "NODE_ENV=production node esbuild.config.mjs", 
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    // Template specific dependencies
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "esbuild": "^0.19.0"
  }
}
```

### Step 4: Create Configuration Files

#### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext", 
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### ESBuild Configuration (esbuild.config.mjs)
```javascript
import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

const config = {
  entryPoints: ['src/index.ts'], // or .js for JavaScript
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: [], // Add external dependencies here
  sourcemap: !isProd,
  minify: isProd,
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(config);
  console.log('Build completed!');
}
```

### Step 5: Create Source Files

#### Basic Structure
```
src/
├── index.{js|ts}       # Main entry point
├── utils/              # Utility functions
├── types/              # TypeScript types (TS only)
└── [template-specific-dirs]
```

### Step 6: Add Template-Specific Content

Follow the patterns from existing templates but adapt for your language/build combination.

## 🧪 Testing Templates

### Manual Testing
```bash
# Test template creation
npm run build
node dist/cli.js init test-project --template express-hbs --typescript --esbuild

# Test the generated project
cd test-project
npm install
npm start
```

### Automated Testing
Add your template to the test suite in `tests/integration/cli.test.ts`:

```typescript
const expectedTemplates = [
  'js-default-express-hbs',
  'js-esbuild-express-hbs', 
  'ts-default-express-hbs',
  'ts-esbuild-express-hbs',
  // Add your new template here
];
```

## ✅ Template Checklist

Before submitting a new template:

- [ ] Follows naming convention: `{lang}-{build}-{template-name}`
- [ ] Contains valid package.json with proper scripts
- [ ] Has appropriate configuration files (tsconfig.json, esbuild.config.mjs)
- [ ] Source files use correct file extensions (.js/.ts)
- [ ] Dependencies are properly specified
- [ ] Scripts work correctly (`start`, `dev`, `build`, etc.)
- [ ] Template generates functional projects
- [ ] Added to test suite
- [ ] Documentation updated

## 📋 Template Requirements

### All Templates Must Have:
1. **package.json** with proper scripts and dependencies
2. **src/index.{js|ts}** as entry point
3. **README.md** with usage instructions
4. **Proper error handling** in main application
5. **Consistent code style** following project standards

### TypeScript Templates Must Have:
1. **tsconfig.json** with proper configuration
2. **Type definitions** for all major functions
3. **@types/* packages** for dependencies that need them

### ESBuild Templates Must Have:
1. **esbuild.config.mjs** with proper configuration
2. **Build scripts** that work in development and production
3. **Source maps** for development builds
4. **Minification** for production builds

## 🔄 Updating Existing Templates

When updating templates:

1. **Test all variants** of the template you're updating
2. **Maintain backward compatibility** where possible
3. **Update documentation** if interfaces change
4. **Run full test suite** before submitting

## 🎯 Best Practices

1. **Keep templates minimal** but functional
2. **Include essential dependencies only**
3. **Provide clear examples** in template code
4. **Use consistent file structure** across similar templates
5. **Include helpful comments** for complex configurations
6. **Test on multiple Node.js versions**
7. **Document any special requirements**

## 📚 Examples

See existing templates in the `templates/` directory for reference implementations of each pattern.

## 🆘 Getting Help

If you need help creating templates:

1. Check existing templates for patterns
2. Review the CLI source code in `src/`
3. Run tests to understand expected behavior
4. Open an issue for guidance

---

Happy template creation! 🚀 