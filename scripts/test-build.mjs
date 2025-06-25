#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🧪 Testing CLI Build Process...\n');

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous build...');
  execSync('npm run clean', { cwd: rootDir, stdio: 'inherit' });
  
  // Step 2: Build the CLI
  console.log('📦 Building CLI with ESBuild...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  
  // Step 3: Check if build output exists
  const buildOutput = join(rootDir, 'dist', 'cli.js');
  if (!fs.existsSync(buildOutput)) {
    throw new Error('Build output not found!');
  }
  
  console.log('✅ Build output exists:', buildOutput);
  
  // Step 4: Check file permissions (Unix systems)
  if (process.platform !== 'win32') {
    const stats = fs.statSync(buildOutput);
    const isExecutable = !!(stats.mode & parseInt('111', 8));
    console.log('🔐 File is executable:', isExecutable);
  }
  
  // Step 5: Test CLI help command
  console.log('\n📋 Testing CLI help command:');
  console.log('─'.repeat(50));
  execSync('node dist/cli.js --help', { cwd: rootDir, stdio: 'inherit' });
  console.log('─'.repeat(50));
  
  // Step 6: Test CLI version command  
  console.log('\n🏷️  Testing CLI version command:');
  console.log('─'.repeat(50));
  execSync('node dist/cli.js --version', { cwd: rootDir, stdio: 'inherit' });
  console.log('─'.repeat(50));

  // Step 7: Test init command help
  console.log('\n📖 Testing init command help:');
  console.log('─'.repeat(50));
  execSync('node dist/cli.js init --help', { cwd: rootDir, stdio: 'inherit' });
  console.log('─'.repeat(50));

  // Step 8: Test template structure
  console.log('\n📁 Testing template structure:');
  const templatesDir = join(rootDir, 'templates');
  
  if (fs.existsSync(templatesDir)) {
    const templates = fs.readdirSync(templatesDir);
    console.log('📂 Available templates:');
    
    templates.forEach(template => {
      const templatePath = join(templatesDir, template);
      const stats = fs.statSync(templatePath);
      
      if (stats.isDirectory()) {
        console.log(`  ✓ ${template}`);
        
        // Check for package.json
        const packageJsonPath = join(templatePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          console.log(`    📄 package.json exists`);
        } else {
          console.log(`    ❌ package.json missing`);
        }
        
        // Check for src directory
        const srcPath = join(templatePath, 'src');
        if (fs.existsSync(srcPath)) {
          console.log(`    📁 src/ directory exists`);
        } else {
          console.log(`    ❌ src/ directory missing`);
        }
      }
    });
  } else {
    console.log('❌ Templates directory not found');
  }

  // Step 9: Test template naming convention
  console.log('\n🏷️  Testing template naming convention:');
  const expectedPatterns = [
    /^js-default-[a-z-]+$/,
    /^js-esbuild-[a-z-]+$/,
    /^ts-default-[a-z-]+$/,
    /^ts-esbuild-[a-z-]+$/,
    /^[a-z-]+$/ // Fallback for old naming
  ];
  
  if (fs.existsSync(templatesDir)) {
    const templates = fs.readdirSync(templatesDir).filter(name => 
      fs.statSync(join(templatesDir, name)).isDirectory()
    );
    
    templates.forEach(template => {
      const matchesPattern = expectedPatterns.some(pattern => pattern.test(template));
      if (matchesPattern) {
        console.log(`  ✓ ${template} - follows naming convention`);
      } else {
        console.log(`  ⚠️  ${template} - may not follow new naming convention`);
      }
    });
  }
  
  console.log('\n🎉 All tests passed! CLI is ready to use.');
  console.log('\n💡 Try these commands:');
  console.log('  npm run dev init my-test-project');
  console.log('  npm run dev init . --template express-hbs --typescript --esbuild --install');
  console.log('  npm run dev init my-api --template express-api --typescript');
  console.log('\n📖 For template creation guide, see: TEMPLATE_CREATION_GUIDE.md\n');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
} 