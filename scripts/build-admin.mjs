import { build } from 'esbuild';
import { mkdir, cp } from 'node:fs/promises';
await mkdir('public/admin/generated', { recursive: true });
await build({ entryPoints: ['src/admin/preview-runtime.js'], bundle: true,
  format: 'esm', platform: 'browser', target: 'es2022', minify: true,
  outfile: 'public/admin/generated/preview-runtime.js' });
await cp('node_modules/katex/dist/katex.min.css', 'public/admin/generated/katex.min.css');
await cp('node_modules/katex/dist/fonts', 'public/admin/generated/fonts', { recursive: true });
