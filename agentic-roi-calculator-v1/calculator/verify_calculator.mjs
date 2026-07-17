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

assert(advisorData, 'ADVISOR_DATA must be defined.');
assert(advisorData.GITHUB_COPILOT?.asOf, 'GitHub Copilot pricing asOf is required.');
assert(advisorData.MODELS.length >= 10, 'Expected at least 10 model pricing entries.');
assert(advisorData.PRESETS.length >= 8, 'Expected at least 8 Architecture Advisor presets.');
assert(Object.keys(personaArchitectures || {}).length === 24, 'Expected 24 persona architecture records.');
assert(staticCopy, 'I18N_STATIC_COPY must be defined in i18n.js.');
assert(Object.keys(staticCopy).length >= 60, 'Expected broad static-copy bridge coverage.');
assert(staticCopy['AI Agent ROI Calculator']?.['pt-BR'], 'Static-copy bridge must include ROI title translations.');

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
assert(!/[\u2013\u2014]/.test(read('i18n.js')), 'i18n.js must not contain en dash or em dash characters.');
assert(!/[\u2013\u2014]/.test(read('agent_advisor_data.js')), 'agent_advisor_data.js must not contain en dash or em dash characters.');
assert(!html.includes('NaN'), 'HTML must not contain a literal NaN string.');
assert(!html.includes('const STATIC_COPY = {'), 'Static-copy dictionary must not be duplicated in calculator.html.');
assert(html.includes('window.I18N_STATIC_COPY'), 'calculator.html must consume I18N_STATIC_COPY from i18n.js.');
assert(!/exact replica|andyhayes/i.test(html), 'HTML must not reference external replica wording.');
assert(html.includes('ROI_FORMULA_VERSION'), 'ROI formula version must be rendered from code.');
assert(html.includes('agentic-roi-scenarios.json'), 'Scenario JSON export must exist.');
assert(html.includes('agentic-roi-scenarios.csv'), 'Scenario CSV export must exist.');
assert(html.includes('agentic-roi-scenarios.md'), 'Scenario Markdown export must exist.');

console.log('Calculator verification passed.');
console.log(`Models: ${advisorData.MODELS.length}`);
console.log(`Presets: ${advisorData.PRESETS.length}`);
console.log(`Persona architectures: ${Object.keys(personaArchitectures).length}`);
console.log(`Pricing as of: ${advisorData.GITHUB_COPILOT.asOf}`);