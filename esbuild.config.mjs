import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const isDev = process.argv.includes('--dev');

// Clean dist directory
const distDir = join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

const buildOptions = {
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  format: 'esm',
  outfile: 'dist/cli.js',
  external: [
    'inquirer',
    'chalk',
    'commander',
    'fs-extra',
    'ora'
  ],
//   banner: {
//     js: '#!/usr/bin/env node\n'
//   },
  sourcemap: !isProduction,
  minify: isProduction,
  keepNames: true,
  tsconfig: 'tsconfig.json',
  logLevel: 'info'
};

async function build() {
  try {
    if (isDev) {
      // Development mode with watch
      console.log('🔄 Starting development build with watch mode...\n');
      
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      
      console.log('👀 Watching for changes... Press Ctrl+C to stop.\n');
      
      // Keep the process alive
      process.on('SIGINT', async () => {
        console.log('\n🛑 Stopping watch mode...');
        await ctx.dispose();
        process.exit(0);
      });
      
    } else {
      // Production build
      console.log(`🚀 Building CLI tool for ${isProduction ? 'production' : 'development'}...\n`);
      
      const result = await esbuild.build(buildOptions);
      
      if (result.errors.length > 0) {
        console.error('❌ Build failed with errors:');
        result.errors.forEach(error => console.error(error));
        process.exit(1);
      }
      
      // Make the output file executable
      if (process.platform !== 'win32') {
        fs.chmodSync('dist/cli.js', '755');
      }
      
      console.log('✅ Build completed successfully!');
      console.log(`📦 Output: dist/cli.js`);
      console.log(`🗜️  Size: ${(fs.statSync('dist/cli.js').size / 1024).toFixed(2)} KB\n`);
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();