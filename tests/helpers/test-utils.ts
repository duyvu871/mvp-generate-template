import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TEST_ROOT = path.join(__dirname, '..');
export const PROJECT_ROOT = path.join(TEST_ROOT, '..');
export const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'templates');
export const CLI_PATH = path.join(PROJECT_ROOT, 'dist', 'cli.js');

/**
 * Create a temporary test directory
 */
export async function createTestDir(name: string): Promise<string> {
  const testDir = path.join(PROJECT_ROOT, 'test-projects', name);
  await fs.ensureDir(testDir);
  return testDir;
}

/**
 * Clean up test directory
 */
export async function cleanupTestDir(testDir: string): Promise<void> {
  if (await fs.pathExists(testDir)) {
    await fs.remove(testDir);
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

/**
 * Read and parse JSON file
 */
export async function readJsonFile(filePath: string): Promise<any> {
  return fs.readJson(filePath);
}

/**
 * Get available templates
 */
export async function getAvailableTemplates(): Promise<string[]> {
  const templates = await fs.readdir(TEMPLATES_DIR);
  return templates.filter(async (template) => {
    const templatePath = path.join(TEMPLATES_DIR, template);
    const stat = await fs.stat(templatePath);
    return stat.isDirectory();
  });
}

/**
 * Validate template structure
 */
export async function validateTemplate(templateName: string): Promise<{
  hasPackageJson: boolean;
  hasSrcDir: boolean;
  packageJsonValid: boolean;
}> {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  const packageJsonPath = path.join(templatePath, 'package.json');
  const srcPath = path.join(templatePath, 'src');

  const hasPackageJson = await fileExists(packageJsonPath);
  const hasSrcDir = await fileExists(srcPath);

  let packageJsonValid = false;
  if (hasPackageJson) {
    try {
      const packageJson = await readJsonFile(packageJsonPath);
      packageJsonValid = !!(
        packageJson.name &&
        packageJson.version &&
        packageJson.scripts &&
        packageJson.scripts.start
      );
    } catch {
      packageJsonValid = false;
    }
  }

  return {
    hasPackageJson,
    hasSrcDir,
    packageJsonValid,
  };
}

/**
 * Mock console for testing
 */
export function mockConsole() {
  const originalLog = console.log;
  const originalError = console.error;
  const logs: string[] = [];
  const errors: string[] = [];

  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
  };

  console.error = (...args: any[]) => {
    errors.push(args.join(' '));
  };

  return {
    logs,
    errors,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
    },
  };
} 