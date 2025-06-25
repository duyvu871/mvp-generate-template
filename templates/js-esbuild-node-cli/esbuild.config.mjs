import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

const config = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: ['commander', 'chalk', 'inquirer'], // Keep CLI dependencies external
  sourcemap: !isProd,
  minify: isProd,
  logLevel: 'info',
  banner: {
    js: '#!/usr/bin/env node'
  }
};

if (watch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(config);
  console.log('Build completed!');
}
