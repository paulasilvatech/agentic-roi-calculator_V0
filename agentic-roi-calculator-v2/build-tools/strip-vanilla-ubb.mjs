// One-off: remove the now-dead inline vanilla UBB panel script from calculator.html.
// UBBTab now renders the React <UBBCalculator/>, so window.renderUBBPanel and its
// setLocale override are obsolete.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'calculator.html';
const lines = readFileSync(FILE, 'utf8').split('\n');

let start = -1;
for (let i = 0; i < lines.length - 1; i++) {
  if (lines[i].trim() === '<script>' && lines[i + 1].includes('GitHub Copilot UBB pricing panel')) {
    start = i;
    break;
  }
}
if (start === -1) throw new Error('Vanilla UBB panel <script> not found (already removed?).');

let end = -1;
for (let j = start + 1; j < lines.length; j++) {
  if (lines[j].trim() === '</script>') { end = j; break; }
}
if (end === -1) throw new Error('Closing </script> for vanilla UBB panel not found.');

// Drop a single blank separator line before the block if present.
let from = start;
if (from > 0 && lines[from - 1].trim() === '') from -= 1;

const removed = end - from + 1;
lines.splice(from, removed);
writeFileSync(FILE, lines.join('\n'), 'utf8');
console.log(`Removed dead vanilla UBB panel: ${removed} lines (was ${start + 1}-${end + 1}).`);
