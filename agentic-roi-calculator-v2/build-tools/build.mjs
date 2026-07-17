// Production bundler for the Agentic AI ROI Calculator (v2).
// Bundles the React app + React 18 (production) into a single dist/app.js,
// then stamps a content hash into calculator.html asset URLs so browsers and
// GitHub Pages always fetch the freshly built files (cache busting).
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

await esbuild.build({
  entryPoints: ['src/app.jsx'],
  bundle: true,
  outfile: 'dist/app.js',
  format: 'iife',
  minify: true,
  sourcemap: false,
  target: ['es2018'],
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
});

// Content hash over the built bundle plus the global data/i18n scripts.
const hash = createHash('sha256');
for (const file of ['dist/app.js', 'i18n.js', 'agent_advisor_data.js']) {
  hash.update(readFileSync(file));
}
const v = hash.digest('hex').slice(0, 10);

let html = readFileSync('calculator.html', 'utf8');
for (const asset of ['i18n.js', 'agent_advisor_data.js', 'dist/app.js']) {
  const re = new RegExp(String.raw`(src=")(${asset})(\?v=[0-9a-zA-Z]+)?(")`, 'g');
  html = html.replace(re, `$1$2?v=${v}$4`);
}
writeFileSync('calculator.html', html, 'utf8');

console.log(`Stamped asset version ?v=${v}`);
