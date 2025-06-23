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
  
  console.log('\n🎉 All tests passed! CLI is ready to use.');
  console.log('\n💡 Try running: npm run dev init my-test-project\n');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
} 