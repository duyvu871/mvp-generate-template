import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');
const testProjectsDir = path.join(rootDir, 'test-projects');

describe('CLI Integration Tests', () => {
  beforeEach(async () => {
    // Ensure test projects directory exists
    await fs.ensureDir(testProjectsDir);
    
    // Build CLI before tests
    try {
      execSync('npm run build', { 
        cwd: rootDir, 
        stdio: 'pipe' 
      });
    } catch (error) {
      console.error('Failed to build CLI:', error);
      throw error;
    }
  });

  afterEach(async () => {
    // Clean up test projects
    if (await fs.pathExists(testProjectsDir)) {
      await fs.remove(testProjectsDir);
    }
  });

  describe('CLI Help and Version', () => {
    it('should display help when --help flag is used', () => {
      const output = execSync('node dist/cli.js --help', { 
        cwd: rootDir,
        encoding: 'utf8'
      });

      expect(output).toContain('MVP Template Generator');
      expect(output).toContain('init <project-name>');
      expect(output).toContain('Initialize a new project');
    });

    it('should display version when --version flag is used', () => {
      const output = execSync('node dist/cli.js --version', { 
        cwd: rootDir,
        encoding: 'utf8'
      });

      expect(output.trim()).toBe('1.0.0');
    });

    it('should display help when no arguments are provided', () => {
      const output = execSync('node dist/cli.js', { 
        cwd: rootDir,
        encoding: 'utf8'
      });

      expect(output).toContain('Usage:');
      expect(output).toContain('init');
    });
  });

  describe('CLI Build Verification', () => {
    it('should have built CLI file', async () => {
      const cliPath = path.join(rootDir, 'dist', 'cli.js');
      expect(await fs.pathExists(cliPath)).toBe(true);
    });

    it('should have executable shebang', async () => {
      const cliPath = path.join(rootDir, 'dist', 'cli.js');
      const content = await fs.readFile(cliPath, 'utf8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should be a valid Node.js file', () => {
      expect(() => {
        execSync('node -c dist/cli.js', { 
          cwd: rootDir,
          stdio: 'pipe'
        });
      }).not.toThrow();
    });
  });

  describe('Template Directory Validation', () => {
    it('should have all required template directories', async () => {
      const templatesDir = path.join(rootDir, 'templates');
      
      const expectedTemplates = [
        'express-hbs',
        'express-api', 
        'basic-node'
      ];

      for (const template of expectedTemplates) {
        const templatePath = path.join(templatesDir, template);
        expect(await fs.pathExists(templatePath)).toBe(true);
        
        // Check for package.json in each template
        const packageJsonPath = path.join(templatePath, 'package.json');
        expect(await fs.pathExists(packageJsonPath)).toBe(true);
      }
    });

    it('should have valid package.json in each template', async () => {
      const templatesDir = path.join(rootDir, 'templates');
      const templates = await fs.readdir(templatesDir);

      for (const template of templates) {
        const packageJsonPath = path.join(templatesDir, template, 'package.json');
        
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          
          expect(packageJson.name).toBeDefined();
          expect(packageJson.version).toBeDefined();
          expect(packageJson.scripts).toBeDefined();
          expect(packageJson.scripts.start).toBeDefined();
        }
      }
    });
  });
}); 