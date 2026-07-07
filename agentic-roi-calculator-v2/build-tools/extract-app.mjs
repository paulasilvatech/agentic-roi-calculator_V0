// One-off surgery: extract the in-browser Babel React block into src/app.jsx
// and rewire calculator.html to load the prebuilt dist/app.js (no CDN, no Babel).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const HTML = 'calculator.html';
const raw = readFileSync(HTML, 'utf8');
const lines = raw.split('\n');

// Locate the single Babel block.
const boIdx = lines.findIndex((l) => l.includes('<script type="text/babel"'));
if (boIdx === -1) throw new Error('Babel <script> open not found.');
let bcIdx = -1;
for (let i = boIdx + 1; i < lines.length; i++) {
    if (/^\s*<\/script>\s*$/.test(lines[i])) { bcIdx = i; break; }
}
if (bcIdx === -1) throw new Error('Babel </script> close not found.');

// Assert exactly three CDN lines (react, react-dom, babel standalone).
const cdnRe = /unpkg\.com.*(react|babel)/i;
const cdnCount = lines.filter((l) => cdnRe.test(l)).length;
if (cdnCount !== 3) throw new Error(`Expected 3 CDN script lines, found ${cdnCount}.`);

// Extract inner JS -> src/app.jsx with module imports for React 18 (prod bundle).
const inner = lines.slice(boIdx + 1, bcIdx).join('\n');
const header = "import React from 'react';\nimport * as ReactDOM from 'react-dom/client';\n\n";
mkdirSync('src', { recursive: true });
writeFileSync('src/app.jsx', header + inner + '\n', 'utf8');

// Replace the Babel block with a single prebuilt-script tag, then drop CDN lines.
const indent = (lines[boIdx].match(/^\s*/) || [''])[0];
const replacement = indent + '<script src="dist/app.js"></script>';
let out = [...lines.slice(0, boIdx), replacement, ...lines.slice(bcIdx + 1)];
out = out.filter((l) => !cdnRe.test(l));
writeFileSync(HTML, out.join('\n'), 'utf8');

console.log(JSON.stringify({
    babelOpenLine: boIdx + 1,
    babelCloseLine: bcIdx + 1,
    extractedInnerLines: bcIdx - boIdx - 1,
    cdnRemoved: cdnCount,
    htmlLinesBefore: lines.length,
    htmlLinesAfter: out.length,
}, null, 2));
