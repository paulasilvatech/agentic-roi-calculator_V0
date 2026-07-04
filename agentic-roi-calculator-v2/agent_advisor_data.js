/* ============================================================================
   ADVISOR_DATA · GitHub Copilot models & pricing (Usage-Based Billing)
   Source: https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
           https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises
   As of: 2026-06-04 · All token prices are US$ per 1M tokens · 1 AI Credit = US$ 0.01

   Single source of truth: every per-token price lives once in
   GITHUB_COPILOT.pricing. The Agent Advisor engine array (MODELS) is DERIVED
   from those tables via ENGINE_CATALOG (which only assigns a routing tier),
   so prices can never drift between the advisor and the pricing panel.
   ============================================================================ */
(function () {

  /* GitHub Copilot Usage-Based Billing · official dataset (the price source of truth) */
  const GITHUB_COPILOT = {
    asOf: '2026-06-08',
    aiCreditUSD: 0.01,
    billingModel: 'Tokens consumed (input, output, cached) priced at per-model rates, converted to GitHub AI Credits (1 credit = US$ 0.01). Effective June 1, 2026.',
    completionsNote: 'Code completions and next edit suggestions are NOT billed in AI credits (unlimited on paid plans).',
    plans: {
      business:   { label:'GitHub Copilot Business',   usdPerSeat:19, includedCredits:1900, promoCredits:3000 },
      enterprise: { label:'GitHub Copilot Enterprise', usdPerSeat:39, includedCredits:3900, promoCredits:7000 },
      pro:        { label:'GitHub Copilot Pro',        usdPerSeat:10 },
      proPlus:    { label:'GitHub Copilot Pro+',       usdPerSeat:39 },
    },
    promoWindow: 'Existing Business/Enterprise customers: higher included credits from June 1 to September 1, 2026, then back to standard.',
    pooling: 'Included credits are pooled at the billing entity level (e.g., 100 Business users = shared 190,000 credits/month).',
    overage: 'Beyond the pooled credits: additional usage billed at published per-credit rates (if policy allows) or blocked until next cycle.',
    pricing: {
      openai: [
        // GPT-4.1 removed: it is NOT in the GitHub Copilot UBB catalog (docs.github.com models-and-pricing).
        // The "included model / 0x" concept belonged to the legacy premium-request system, retired 2026-06-01.
        { model:'GPT-5 mini',     status:'GA', category:'Lightweight', input:0.25, cachedInput:0.025, output:2.00 },
        { model:'GPT-5.3-Codex',  status:'GA', category:'Powerful',    input:1.75, cachedInput:0.175, output:14.00 },
        { model:'GPT-5.4',        status:'GA', category:'Versatile',   input:2.50, cachedInput:0.25,  output:15.00, note:'pricing for prompts ≤272K tokens', longContext:{ threshold:272000, input:5.00, cachedInput:0.50, output:22.50 } },
        { model:'GPT-5.4 mini',   status:'GA', category:'Lightweight', input:0.75, cachedInput:0.075, output:4.50 },
        { model:'GPT-5.4 nano',   status:'GA', category:'Lightweight', input:0.20, cachedInput:0.02,  output:1.25 },
        { model:'GPT-5.5',        status:'GA', category:'Powerful',    input:5.00, cachedInput:0.50,  output:30.00, note:'pricing for prompts ≤272K tokens', longContext:{ threshold:272000, input:10.00, cachedInput:1.00, output:45.00 } },
      ],
      anthropic: [
        { model:'Claude Haiku 4.5',  status:'GA', category:'Versatile', input:1.00, cachedInput:0.10, cacheWrite:1.25, output:5.00 },
        { model:'Claude Sonnet 4',   status:'GA', category:'Versatile', input:3.00, cachedInput:0.30, cacheWrite:3.75, output:15.00 },
        { model:'Claude Sonnet 4.5', status:'GA', category:'Versatile', input:3.00, cachedInput:0.30, cacheWrite:3.75, output:15.00 },
        { model:'Claude Sonnet 4.6', status:'GA', category:'Versatile', input:3.00, cachedInput:0.30, cacheWrite:3.75, output:15.00 },
        { model:'Claude Opus 4.5',   status:'GA', category:'Powerful',  input:5.00, cachedInput:0.50, cacheWrite:6.25, output:25.00 },
        { model:'Claude Opus 4.6',   status:'GA', category:'Powerful',  input:5.00, cachedInput:0.50, cacheWrite:6.25, output:25.00 },
        { model:'Claude Opus 4.7',   status:'GA', category:'Powerful',  input:5.00, cachedInput:0.50, cacheWrite:6.25, output:25.00 },
        { model:'Claude Opus 4.8',   status:'GA', category:'Powerful',  input:5.00, cachedInput:0.50, cacheWrite:6.25, output:25.00 },
      ],
      google: [
        { model:'Gemini 2.5 Pro',  status:'GA',             category:'Powerful',    input:1.25, cachedInput:0.125, output:10.00 },
        { model:'Gemini 3 Flash',  status:'Public preview', category:'Lightweight', input:0.50, cachedInput:0.05,  output:3.00,  note:'no long-context surcharge' },
        { model:'Gemini 3.1 Pro',  status:'Public preview', category:'Powerful',    input:2.00, cachedInput:0.20,  output:12.00, note:'pricing for prompts ≤200K tokens', longContext:{ threshold:200000, input:4.00, cachedInput:0.40, output:18.00 } },
        { model:'Gemini 3.5 Flash',status:'GA',             category:'Lightweight', input:1.50, cachedInput:0.15,  output:9.00 },
      ],
      github: [
        { model:'Raptor mini', status:'Public preview', category:'Versatile', input:0.25, cachedInput:0.025, output:2.00, note:'uses GPT-5 mini pricing' },
      ],
      microsoft: [
        { model:'MAI-Code-1-Flash', status:'GA', category:'Lightweight', input:0.75, cachedInput:0.075, output:4.50 },
      ],
    },
    /* Interaction modes: same official per-token rates; what changes is the token profile.
       Presets are planning defaults (editable in the simulator). Agent modes re-read context every model call. */
    modes: {
      ask:   { label:'Ask (chat Q&A)',        iterations:1,  freshIn:2000,  context:10000,  outTotal:1500 },
      plan:  { label:'Plan (spec & planning)', iterations:2,  freshIn:6000,  context:40000,  outTotal:4000 },
      agent: { label:'Agent mode (IDE)',       iterations:6,  freshIn:12000, context:120000, outTotal:8000 },
      cloud: { label:'Cloud agent (async PR)', iterations:15, freshIn:20000, context:150000, outTotal:12000, note:'also consumes GitHub Actions minutes' },
    },
    codeReview: 'GitHub Copilot code review: tokens billed in AI credits (model auto-selected, not disclosed) + agentic infrastructure consumes GitHub Actions minutes.',
    sources: [
      'https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing',
      'https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises',
      'https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/',
    ],
  };

  /* ---- Derive the Agent Advisor MODELS from the pricing tables (no price duplication) ---- */

  // Flatten every pricing row into a name -> row lookup, tagged with its provider.
  const PRICE = {};
  Object.entries(GITHUB_COPILOT.pricing).forEach(function (entry) {
    const prov = entry[0], rows = entry[1];
    rows.forEach(function (r) { PRICE[r.model] = Object.assign({ _provider: prov }, r); });
  });

  const PROVIDER_LABEL = { anthropic:'Anthropic', openai:'OpenAI', google:'Google', github:'GitHub', microsoft:'Microsoft' };

  // Parse a long-context threshold from a row: prefer the explicit longContext.threshold,
  // else read it from the note ("\u2264272K", "\u2264200K").
  function parseLongCtx(p) {
    if (p && p.longContext && p.longContext.threshold) return p.longContext.threshold;
    const note = p && p.note;
    if (!note) return null;
    const m = note.match(/\u2264\s*(\d+)\s*K/i) || note.match(/<=\s*(\d+)\s*K/i);
    return m ? parseInt(m[1], 10) * 1000 : null;
  }

  // Note: under Usage-Based Billing there is no "included / zero-cost" model.
  // Every model interaction (chat, agent) draws from the pooled AI Credits at its
  // per-token rate. Only code completions and next edit suggestions are unbilled.

  /* Curated routing catalog: model name -> engine tier. Prices come from PRICE above.
     Tier is the advisor's cost/capability lane (economy < mid < premium), which is
     intentionally distinct from the marketing "category". Add a row here to expose a
     model to the advisor; its prices are pulled automatically from the pricing tables. */
  const ENGINE_CATALOG = [
    // Anthropic
    { name:'Claude Haiku 4.5',  tier:'economy' },
    { name:'Claude Sonnet 4.6', tier:'mid' },
    { name:'Claude Sonnet 4.5', tier:'mid' },
    { name:'Claude Opus 4.6',   tier:'premium' },
    { name:'Claude Opus 4.8',   tier:'premium' },
    // OpenAI
    { name:'GPT-5 mini',        tier:'economy' },
    { name:'GPT-5.4 nano',      tier:'economy' },
    { name:'GPT-5.4',           tier:'mid' },
    { name:'GPT-5.3-Codex',     tier:'premium' },
    { name:'GPT-5.5',           tier:'premium' },
    // Google
    { name:'Gemini 3 Flash',    tier:'economy' },
    { name:'Gemini 3.5 Flash',  tier:'mid' },
    { name:'Gemini 3.1 Pro',    tier:'premium' },
    // GitHub
    { name:'Raptor mini',       tier:'economy' },
    // Microsoft
    { name:'MAI-Code-1-Flash',  tier:'economy' },
  ];

  const MODELS = ENGINE_CATALOG.map(function (e) {
    const p = PRICE[e.name];
    if (!p) { console.warn('ADVISOR_DATA: no pricing row for engine model "' + e.name + '"'); return null; }
    const longCtx = parseLongCtx(p);
    const m = {
      name: e.name,
      provider: PROVIDER_LABEL[p._provider] || p._provider,
      tier: e.tier,
      costInput: p.input,
      costOutput: p.output,
      cachedInput: p.cachedInput,
      status: p.status || 'GA',
      note: p.note || null,
    };
    if (p.cacheWrite != null) m.cacheWrite = p.cacheWrite;
    if (longCtx) m.longCtxThreshold = longCtx;
    if (p.longContext) m.longContext = p.longContext;
    return m;
  }).filter(Boolean);

  const PRESETS = [
    { category:'Document Processing', name:'Contract review assistant', complexity:2, volume:40, volumeUnit:'week', stakes:3, accuracy:2, inputType:'docs', wfSteps:5, extTools:2, taskChars:['extract','summarize','reason','struct'], inFmt:'PDF / Documents', outFmt:'Report / Document' },
    { category:'Document Processing', name:'Invoice exception triage', complexity:1, volume:250, volumeUnit:'day', stakes:2, accuracy:2, inputType:'docs', wfSteps:4, extTools:3, taskChars:['extract','classify','struct'], inFmt:'PDF / Documents', outFmt:'JSON / Structured' },
    { category:'Engineering', name:'Pull request risk reviewer', complexity:2, volume:80, volumeUnit:'week', stakes:2, accuracy:2, inputType:'code', wfSteps:4, extTools:4, taskChars:['code','reason','struct'], inFmt:'Mixed', outFmt:'Report / Document' },
    { category:'Engineering', name:'Legacy modernization planner', complexity:3, volume:12, volumeUnit:'week', stakes:3, accuracy:2, inputType:'code', wfSteps:7, extTools:5, taskChars:['code','reason','logic','summarize','struct'], inFmt:'Mixed', outFmt:'Report / Document' },
    { category:'Customer Operations', name:'Support ticket routing', complexity:1, volume:500, volumeUnit:'day', stakes:1, accuracy:1, inputType:'email', wfSteps:3, extTools:2, taskChars:['classify','summarize','conv'], inFmt:'Plain Text', outFmt:'JSON / Structured' },
    { category:'Customer Operations', name:'Executive escalation brief', complexity:2, volume:30, volumeUnit:'week', stakes:3, accuracy:2, inputType:'mixed', wfSteps:5, extTools:4, taskChars:['summarize','reason','generate','struct'], inFmt:'Mixed', outFmt:'Report / Document' },
    { category:'Finance and Risk', name:'Policy compliance checker', complexity:2, volume:100, volumeUnit:'week', stakes:3, accuracy:3, inputType:'docs', wfSteps:6, extTools:4, taskChars:['extract','reason','logic','struct'], inFmt:'PDF / Documents', outFmt:'Report / Document' },
    { category:'Finance and Risk', name:'Spend anomaly explainer', complexity:2, volume:60, volumeUnit:'week', stakes:2, accuracy:2, inputType:'data', wfSteps:4, extTools:3, taskChars:['reason','struct','generate'], inFmt:'JSON', outFmt:'Report / Document' }
  ];

  function personaConfig(id, label, domain) {
    const agentSlug = id.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    return {
      ag: [
        { n:'@'+agentSlug+'-intake', d:'Classifies the request, captures constraints, and builds a scoped work packet for '+label+'.', h:'@'+agentSlug+'-analyst', t:['read-context','classify','summarize'] },
        { n:'@'+agentSlug+'-analyst', d:'Runs the core '+domain+' analysis, produces assumptions, and flags risks that require human review.', h:'@'+agentSlug+'-validator', t:['reason','retrieve','compare'] },
        { n:'@'+agentSlug+'-validator', d:'Validates outputs against policy, source constraints, and acceptance criteria before handoff.', h:0, t:['validate','cite-sources','quality-gate'] },
      ],
      mc: [
        { n:'github', d:'Repository, issue, pull request, and workflow context.', f:'Source control and delivery workflow lookup.' },
        { n:'docs', d:'Curated internal and official product documentation.', f:'Grounded retrieval for policy and product claims.' },
        { n:'work-items', d:'Planning records, backlog, and delivery status.', f:'Connects recommendations to current execution state.' },
      ],
      sk: [
        { n:agentSlug+'-workflow', p:'.github/skills/'+agentSlug+'-workflow/SKILL.md', d:'Persona-specific workflow rules, acceptance checks, and reusable prompts.' },
        { n:'source-audit', p:'.github/skills/source-audit/SKILL.md', d:'Requires sourced claims, explicit assumptions, and validation notes.' },
      ],
      wf: [
        'Receive '+label+' request',
        '@'+agentSlug+'-intake captures context and constraints',
        '@'+agentSlug+'-analyst generates the recommendation or artifact',
        '@'+agentSlug+'-validator checks policy, evidence, and quality',
        'Human owner approves and ships the result',
      ],
      ca: [
        { n:'Request classification', y:'Aut', i:'M', t:'Planning assumption, validate with customer data', p:45 },
        { n:'Evidence-backed recommendation', y:'Val', i:'H', t:'Planning assumption, validate with customer data', p:35 },
        { n:'Draft artifact generation', y:'Gen', i:'M', t:'Planning assumption, validate with customer data', p:40 },
      ],
      ba: [
        { f:'Context preparation', b:'Manual gathering across systems', a:'Structured work packet with linked sources', p:35, s:'Explicit planning assumption' },
        { f:'Quality review', b:'Reviewer checks from scratch', a:'Pre-checks highlight gaps and risky assumptions', p:30, s:'Explicit planning assumption' },
      ],
    };
  }

  const PERSONA_AGENT_ARCHITECTURES = {
    'gestor-negocio': personaConfig('gestor-negocio','Business Manager','business outcome'),
    'gestor-projeto': personaConfig('gestor-projeto','Project Manager','delivery planning'),
    'analista-requisitos': personaConfig('analista-requisitos','Requirements Engineer','requirements'),
    'arquiteto': personaConfig('arquiteto','Solution Architect','architecture'),
    'desenvolvedor': personaConfig('desenvolvedor','Modern Developer','software engineering'),
    'dev-legacy': personaConfig('dev-legacy','Legacy Developer','legacy modernization'),
    'devops': personaConfig('devops','DevOps / Platform','platform engineering'),
    'qa': personaConfig('qa','QA Engineer','quality engineering'),
    'product-owner': personaConfig('product-owner','Product Owner','product discovery'),
    'tech-lead': personaConfig('tech-lead','Tech Lead','technical leadership'),
    'uat': personaConfig('uat','UAT Analyst','acceptance testing'),
    'sre': personaConfig('sre','SRE / Operations','reliability'),
    'infosec': personaConfig('infosec','InfoSec / Compliance','security and compliance'),
    'dba': personaConfig('dba','DBA','database operations'),
    'appsec': personaConfig('appsec','AppSec / Secure Code','application security'),
    'scrum-master': personaConfig('scrum-master','Scrum Master','agile facilitation'),
    'dev-cobol': personaConfig('dev-cobol','COBOL Developer','mainframe modernization'),
    'dev-natural': personaConfig('dev-natural','Natural/ADABAS Developer','mainframe modernization'),
    'compliance': personaConfig('compliance','Compliance Officer','compliance'),
    'release-manager': personaConfig('release-manager','Release Manager','release governance'),
    'data-engineer': personaConfig('data-engineer','Data Engineer','data engineering'),
    'ml-engineer': personaConfig('ml-engineer','ML / AI Engineer','machine learning engineering'),
    'ux-designer': personaConfig('ux-designer','UX / Product Designer','product design'),
    'eng-manager': personaConfig('eng-manager','Engineering Manager','engineering management'),
  };

  window.ADVISOR_DATA = {
    MODELS: MODELS,
    PRESETS: PRESETS,
    GITHUB_COPILOT: GITHUB_COPILOT,
    PERSONA_AGENT_ARCHITECTURES: PERSONA_AGENT_ARCHITECTURES,
  };
  /* backward-compat alias for the Agent Advisor tab */
  globalThis.AGENT_DATA = PERSONA_AGENT_ARCHITECTURES;
  window.AGENT_ARCHITECTURE_DATA = PERSONA_AGENT_ARCHITECTURES;

})();
