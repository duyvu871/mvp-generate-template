import { build } from 'esbuild';

const isDev = process.argv.includes('--dev');

const buildOptions = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: ['express', 'express-handlebars'],
  format: 'esm',
  sourcemap: isDev,
  minify: !isDev,
  keepNames: true,
  loader: {
    '.js': 'js'
  }
};

if (isDev) {
  // Watch mode for development
  const ctx = await build({
    ...buildOptions,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('Watch build failed:', error);
        else console.log('Watch build succeeded:', result);
      }
    }
  });
  
  console.log('Watching for changes...');
} else {
  // Production build
  try {
    await build(buildOptions);
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}
