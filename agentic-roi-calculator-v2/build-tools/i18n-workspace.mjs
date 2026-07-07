// One-off: insert the Workspace overview-card i18n keys after the PT and ES
// ovCardAgentB4 lines (EN was already added). Idempotent: skips if already present.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'i18n.js';
let text = readFileSync(FILE, 'utf8');
const lines = text.split('\n');

const blocks = {
  pt: [
    "      ovCardWorkspaceDesc: 'Custo em tokens de um repositório governado: como instruções, prompt files, agentes customizados, ferramentas MCP e skills moldam cada request.',",
    "      ovCardWorkspaceB1: 'Overhead de tokens: repo governado vs repo cru',",
    "      ovCardWorkspaceB2: 'Perfis de tokens dos modos Ask, Edit, Plan e Agent',",
    "      ovCardWorkspaceB3: 'Economia de roteamento por tipo de tarefa',",
    "      ovCardWorkspaceB4: 'Custo por tier de modelo e por modo de execução',",
  ],
  es: [
    "      ovCardWorkspaceDesc: 'Costo en tokens de un repositorio gobernado: cómo instrucciones, prompt files, agentes personalizados, herramientas MCP y skills moldean cada request.',",
    "      ovCardWorkspaceB1: 'Overhead de tokens: repo gobernado vs repo desnudo',",
    "      ovCardWorkspaceB2: 'Perfiles de tokens de los modos Ask, Edit, Plan y Agent',",
    "      ovCardWorkspaceB3: 'Ahorro de enrutamiento por tipo de tarea',",
    "      ovCardWorkspaceB4: 'Costo por tier de modelo y por modo de ejecución',",
  ],
};

// Find all ovCardAgentB4 occurrences; 1=EN(done),2=PT,3=ES.
const idxs = [];
lines.forEach((l, i) => { if (l.includes('ovCardAgentB4:')) idxs.push(i); });
if (idxs.length !== 3) throw new Error(`Expected 3 ovCardAgentB4 lines, found ${idxs.length}.`);

// Insert ES first (higher index) then PT so earlier indices stay valid.
const plan = [[idxs[2], blocks.es], [idxs[1], blocks.pt]];
for (const [at, block] of plan) {
  if (lines[at + 1] && lines[at + 1].includes('ovCardWorkspaceDesc')) continue; // idempotent
  lines.splice(at + 1, 0, ...block);
}
writeFileSync(FILE, lines.join('\n'), 'utf8');
console.log('Inserted Workspace overview-card keys for PT and ES.');
