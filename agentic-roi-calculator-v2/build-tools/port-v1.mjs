// One-off: port the v1 UBBCalculator (+ helpers) and WorkspaceCalculator (+ WS data)
// into src/app.jsx. The v1 source is already in React.createElement form and reuses
// the same shared primitives (Slider, BarRow, $c, Nf, pct) that exist in v2 app.jsx.
import { readFileSync, writeFileSync } from 'node:fs';

const V1 = '../agentic-roi-calculator-v1/Agentic_AI_ROI_Toolkit_v3_0_0_2026-07-03.html';
const APP = 'src/app.jsx';

const v1 = readFileSync(V1, 'utf8').split('\n');
// 1-based inclusive ranges -> 0-based slice.
const ubb = v1.slice(7986 - 1, 8931).join('\n'); // UBB_DEFAULT_RATES..end of UBBCalculator
const ws = v1.slice(8932 - 1, 9867).join('\n'); // WS_MODES..end of WorkspaceCalculator

// Sanity checks on the extracted blocks.
const need = [
  ['UBB', ubb, ['const UBB_DEFAULT_RATES', 'function UBBCalculator', 'UBB_PLANS', 'creditsForCall']],
  ['WS', ws, ['const WS_MODES', 'const WS_TIERS', 'const WS_TASKS', 'function WorkspaceCalculator']],
];
for (const [name, block, markers] of need) {
  for (const m of markers) {
    if (!block.includes(m)) throw new Error(`${name} block missing marker: ${m}`);
  }
}
// Guard against accidentally pulling in the v1 App component.
if (ubb.includes('function App(') || ws.includes('function App(')) {
  throw new Error('Extraction overran into the v1 App component.');
}

let app = readFileSync(APP, 'utf8');
const anchor = '      function UBBTab() {';
if (!app.includes(anchor)) throw new Error('UBBTab anchor not found in app.jsx.');
if (app.includes('function UBBCalculator')) throw new Error('UBBCalculator already present; aborting to avoid duplicate.');

const banner = (t) => `\n/* ===== Ported from v1 (${t}) ===== */\n`;
const inject = banner('UBB advanced calculator') + ubb + '\n' + banner('Workspace token calculator') + ws + '\n\n';
// Use a replacement FUNCTION so `$` sequences in the ported code (e.g. c$ = n => '$')
// are inserted literally and NOT treated as String.replace special patterns.
app = app.replace(anchor, () => inject + anchor);
writeFileSync(APP, app, 'utf8');

console.log(JSON.stringify({
  ubbLines: ubb.split('\n').length,
  wsLines: ws.split('\n').length,
  appLinesAfter: app.split('\n').length,
}, null, 2));
