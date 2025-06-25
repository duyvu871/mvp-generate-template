#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

async function packageTemplates() {
  console.log('📦 Packaging templates using adm-zip...\n');

  // Read templates configuration
  const templatesConfigPath = path.join(rootDir, 'config', 'templates.json');
  if (!await fs.pathExists(templatesConfigPath)) {
    throw new Error('Templates configuration not found: config/templates.json');
  }

  const templatesConfig = await fs.readJson(templatesConfigPath);
  const templates = templatesConfig.templates;

  // Templates directory where zip files will be saved
  const templatesDir = path.join(rootDir, 'templates');
  await fs.ensureDir(templatesDir);

  // Clean existing zip files in templates directory
  const existingFiles = await fs.readdir(templatesDir).catch(() => []);
  for (const file of existingFiles) {
    if (file.endsWith('.zip')) {
      await fs.remove(path.join(templatesDir, file));
      console.log(`🗑️  Removed old zip: ${file}`);
    }
  }

  let successCount = 0;
  let skipCount = 0;

  for (const template of templates) {
    const templatePath = template.path;
    const templateDir = path.join(templatesDir, templatePath);
    
    console.log(`📁 Processing template: ${templatePath}`);

    // Check if template directory exists
    if (!await fs.pathExists(templateDir)) {
      console.log(`   ⚠️  Directory not found, skipping: ${templatePath}`);
      skipCount++;
      continue;
    }

    // Create zip file in templates directory
    const zipFileName = `${templatePath}.zip`;
    const zipFilePath = path.join(templatesDir, zipFileName);

    try {
      // Create zip archive using adm-zip (dynamic import)
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip();
      
      // Recursively add all files and folders from template directory
      await addDirectoryToZip(zip, templateDir, '');
      
      // Write zip file
      zip.writeZip(zipFilePath);

      // Verify zip file was created and get stats
      if (await fs.pathExists(zipFilePath)) {
        const stats = await fs.stat(zipFilePath);
        console.log(`   ✅ Created: ${zipFileName} (${(stats.size / 1024).toFixed(1)} KB)`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to create: ${zipFileName}`);
      }

    } catch (error) {
      console.log(`   ❌ Error creating zip: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully packaged: ${successCount} templates`);
  console.log(`   ⚠️  Skipped: ${skipCount} templates`);
  console.log(`   📁 Output directory: templates/`);

  // Create index file with template list in templates directory
  const indexData = {
    version: templatesConfig.version,
    packagedAt: new Date().toISOString(),
    templates: templates
      .filter(template => {
        const zipPath = path.join(templatesDir, `${template.path}.zip`);
        return fs.existsSync(zipPath);
      })
      .map(template => ({
        ...template,
        zipFile: `${template.path}.zip`,
        downloadUrl: `templates/${template.path}.zip`,
      })),
  };

  const indexPath = path.join(templatesDir, 'templates-index.json');
  await fs.writeJson(indexPath, indexData, { spaces: 2 });
  console.log(`   📝 Created index: templates-index.json`);
}

/**
 * Recursively add directory contents to zip archive
 */
async function addDirectoryToZip(zip, dirPath, zipPath) {
  const items = await fs.readdir(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const itemZipPath = zipPath ? `${zipPath}/${item}` : item;
    
    // Skip zip files to avoid recursion
    if (item.endsWith('.zip') || item === 'templates-index.json') {
      continue;
    }
    
    const stats = await fs.stat(itemPath);
    
    if (stats.isDirectory()) {
      // Add directory (adm-zip will create it automatically when we add files)
      await addDirectoryToZip(zip, itemPath, itemZipPath);
    } else if (stats.isFile()) {
      // Add file
      const fileData = await fs.readFile(itemPath);
      zip.addFile(itemZipPath, fileData);
    }
  }
}

// Run if called directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('package-templates.js');

if (isMainModule) {
  console.log('Starting template packaging...');
  packageTemplates().catch(error => {
    console.error('❌ Error packaging templates:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

export { packageTemplates }; 