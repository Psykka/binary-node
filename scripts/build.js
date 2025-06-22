import { build } from 'esbuild';
import { fs } from 'zx';

// Ensure clean build directory
if (fs.existsSync('dist')) {
    console.log('Removing existing dist directory...');
    fs.removeSync('dist');
}

console.log('Building TypeScript project...');

build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: ['es2020'],
    outfile: 'dist/bundle.js',
    sourcemap: false,
    minify: true,
    external: [],
}).then(() => {
    console.log('Build completed successfully 📦')
}).catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
}).finally(() => {
    process.exit(0);
})