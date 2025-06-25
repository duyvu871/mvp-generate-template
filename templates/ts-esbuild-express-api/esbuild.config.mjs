import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: ['express', 'cors', 'helmet'], // Keep external dependencies
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
