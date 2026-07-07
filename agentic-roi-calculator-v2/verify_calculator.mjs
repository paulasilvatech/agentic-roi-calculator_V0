import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.dirname(new URL(import.meta.url).pathname);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function runBrowserScript(relativePath) {
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(relativePath), sandbox, { filename: relativePath });
  return sandbox;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const dataSandbox = runBrowserScript('agent_advisor_data.js');
const i18nSandbox = runBrowserScript('i18n.js');
const advisorData = dataSandbox.window.ADVISOR_DATA;
const personaArchitectures = dataSandbox.window.AGENT_ARCHITECTURE_DATA;
const i18n = i18nSandbox.window.I18N_STRINGS;
const staticCopy = i18nSandbox.window.I18N_STATIC_COPY;
const html = read('calculator.html');
const app = read('src/app.jsx');
const appAll = `${html}\n${app}`;

assert(advisorData, 'ADVISOR_DATA must be defined.');
assert(advisorData.GITHUB_COPILOT?.asOf, 'GitHub Copilot pricing asOf is required.');
assert(advisorData.GITHUB_COPILOT.asOf === '2026-07-06', 'GitHub Copilot pricing must reflect the July 6, 2026 official-docs refresh.');
assert(advisorData.MODELS.length >= 19, 'Expected at least 19 model pricing entries.');
assert(advisorData.PRESETS.length >= 8, 'Expected at least 8 Architecture Advisor presets.');
assert(Object.keys(personaArchitectures || {}).length === 24, 'Expected 24 persona architecture records.');
assert(staticCopy, 'I18N_STATIC_COPY must be defined in i18n.js.');
assert(Object.keys(staticCopy).length >= 60, 'Expected broad static-copy bridge coverage.');
assert(staticCopy['AI Agent ROI Calculator']?.['pt-BR'], 'Static-copy bridge must include ROI title translations.');

const pricingRows = Object.values(advisorData.GITHUB_COPILOT.pricing || {}).flat();
for (const requiredModel of ['Claude Sonnet 5', 'Claude Fable 5', 'Claude Opus 4.8 (fast mode) (preview)', 'Kimi K2.7 Code']) {
  assert(pricingRows.some((row) => row.model === requiredModel), `${requiredModel} must be present in GitHub Copilot pricing.`);
  assert(advisorData.MODELS.some((row) => row.name === requiredModel), `${requiredModel} must be exposed to the advisor engine.`);
}

for (const [personaId, personaConfig] of Object.entries(personaArchitectures)) {
  assert(personaConfig.ag?.length >= 3, `${personaId} must have at least 3 agents.`);
  assert(personaConfig.mc?.length >= 3, `${personaId} must have at least 3 MCP servers.`);
  assert(personaConfig.sk?.length >= 2, `${personaId} must have at least 2 skills.`);
  assert(personaConfig.wf?.length >= 5, `${personaId} must have a workflow.`);
}

const requiredKeys = [
  'roiStatusTitle',
  'roiScenarioManagerTitle',
  'roiExportJson',
  'roiExportCsv',
  'roiExportMarkdown',
  'roiFormulaLedgerTitle',
  'roiLedgerLaborFormula',
  'roiSourceOfficial',
];

for (const locale of ['en', 'pt-BR', 'es']) {
  assert(i18n[locale], `${locale} dictionary is required.`);
  for (const key of requiredKeys) {
    assert(i18n[locale][key], `${locale}.${key} is required.`);
  }
}

assert(!/[\u2013\u2014]/.test(html), 'HTML must not contain en dash or em dash characters.');
assert(!/[\u2013\u2014]/.test(app), 'src/app.jsx must not contain en dash or em dash characters.');
assert(!/[\u2013\u2014]/.test(read('i18n.js')), 'i18n.js must not contain en dash or em dash characters.');
assert(!/[\u2013\u2014]/.test(read('agent_advisor_data.js')), 'agent_advisor_data.js must not contain en dash or em dash characters.');
assert(!html.includes('NaN'), 'HTML must not contain a literal NaN string.');
assert(!appAll.includes('const STATIC_COPY = {'), 'Static-copy dictionary must not be duplicated in the app source.');
assert(appAll.includes('window.I18N_STATIC_COPY'), 'App must consume I18N_STATIC_COPY from i18n.js.');
assert(!/exact replica|andyhayes/i.test(appAll), 'App must not reference external replica wording.');
assert(appAll.includes('ROI_FORMULA_VERSION'), 'ROI formula version must be rendered from code.');
assert(appAll.includes('agentic-roi-scenarios.json'), 'Scenario JSON export must exist.');
assert(appAll.includes('agentic-roi-scenarios.csv'), 'Scenario CSV export must exist.');
assert(appAll.includes('agentic-roi-scenarios.md'), 'Scenario Markdown export must exist.');

// Build-layout guards: the app must be prebuilt (no in-browser Babel, no CDN React).
assert(html.includes('dist/app.js'), 'calculator.html must load the prebuilt dist/app.js.');
assert(!html.includes('type="text/babel"'), 'calculator.html must not use in-browser Babel.');
assert(!/unpkg\.com.*(react|babel)/i.test(html), 'calculator.html must not load React or Babel from a CDN.');
assert(fs.existsSync(path.join(root, 'dist/app.js')), 'dist/app.js must be built (run: npm run build).');

// Parity guards: v2 must match v1 scope (8 modules) with the ported calculators.
for (const locale of ['en', 'pt-BR', 'es']) {
  for (let i = 0; i <= 7; i++) {
    assert(i18n[locale]?.[`nav${i}Label`], `Locale ${locale} must define nav${i}Label (8 modules).`);
  }
}
assert(app.includes('function UBBCalculator'), 'Ported UBBCalculator component must be present.');
assert(app.includes('function WorkspaceCalculator'), 'Ported WorkspaceCalculator component must be present.');
assert(app.includes('tab === 7'), 'App must route the 8th (Workspace) tab.');
assert(app.includes('const WS_MODES') && app.includes('const WS_TIERS') && app.includes('const WS_TASKS'), 'Workspace token datasets must be present.');
assert(app.includes('const UBB_DEFAULT_RATES') && app.includes('const UBB_PLANS'), 'UBB rate card and plans must be present.');
assert(app.includes('Active license'), 'UBB must render the active-license banner.');
assert(!app.includes('GPT-4.1'), 'Stale GPT-4.1 model name must not appear in the app.');
assert(!html.includes('renderUBBPanel'), 'Dead vanilla UBB panel must be removed from calculator.html.');
assert(fs.existsSync(path.join(root, 'src/ported-i18n.js')), 'Ported-tab translation dictionary must exist.');
assert(app.includes('useLocalizeSubtree'), 'Ported tabs must use the localization hook for trilingual support.');
const ported = read('src/ported-i18n.js');
assert(!/[\u2013\u2014]/.test(ported), 'ported-i18n.js must not contain en dash or em dash characters.');

// No legacy premium-request unit (PRU): only the current AI Credits model is modeled.
assert(!/premium request/i.test(app), 'App must not reference the legacy premium-request unit.');
assert(!/premium request/i.test(ported), 'Dictionary must not reference the legacy premium-request unit.');
assert(!app.includes('legacyTotal') && !app.includes('Legacy PRU'), 'Legacy PRU comparison must be fully removed.');

console.log('Calculator verification passed.');
console.log(`Models: ${advisorData.MODELS.length}`);
console.log(`Presets: ${advisorData.PRESETS.length}`);
console.log(`Persona architectures: ${Object.keys(personaArchitectures).length}`);
console.log(`Pricing as of: ${advisorData.GITHUB_COPILOT.asOf}`);