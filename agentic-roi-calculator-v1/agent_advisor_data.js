/* ============================================================================
   ADVISOR_DATA · GitHub Copilot models & pricing (Usage-Based Billing)
   Source: https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
           https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises
   As of: 2026-06-04 · All token prices are US$ per 1M tokens · 1 AI Credit = US$ 0.01
   ============================================================================ */
window.ADVISOR_DATA = {

  /* Models for the Agent Advisor engine (shape: name, provider, tier, costInput, costOutput) */
  MODELS: [
    // Anthropic (cache write billed in addition to cached input)
    { name:'Claude Haiku 4.5',  provider:'Anthropic', tier:'economy', costInput:1.00, costOutput:5.00,  cachedInput:0.10,  cacheWrite:1.25, status:'GA' },
    { name:'Claude Sonnet 4.6', provider:'Anthropic', tier:'mid',     costInput:3.00, costOutput:15.00, cachedInput:0.30,  cacheWrite:3.75, status:'GA' },
    { name:'Claude Sonnet 4.5', provider:'Anthropic', tier:'mid',     costInput:3.00, costOutput:15.00, cachedInput:0.30,  cacheWrite:3.75, status:'GA' },
    { name:'Claude Opus 4.6',   provider:'Anthropic', tier:'premium', costInput:5.00, costOutput:25.00, cachedInput:0.50,  cacheWrite:6.25, status:'GA' },
    { name:'Claude Opus 4.8',   provider:'Anthropic', tier:'premium', costInput:5.00, costOutput:25.00, cachedInput:0.50,  cacheWrite:6.25, status:'GA' },
    // OpenAI
    { name:'GPT-5 mini',        provider:'OpenAI',    tier:'economy', costInput:0.25, costOutput:2.00,  cachedInput:0.025, status:'GA', included:true },
    { name:'GPT-5.4 nano',      provider:'OpenAI',    tier:'economy', costInput:0.20, costOutput:1.25,  cachedInput:0.02,  status:'GA' },
    { name:'GPT-4.1',           provider:'OpenAI',    tier:'mid',     costInput:2.00, costOutput:8.00,  cachedInput:0.50,  status:'GA', included:true },
    { name:'GPT-5.4',           provider:'OpenAI',    tier:'mid',     costInput:2.50, costOutput:15.00, cachedInput:0.25,  status:'GA' },
    { name:'GPT-5.3-Codex',     provider:'OpenAI',    tier:'premium', costInput:1.75, costOutput:14.00, cachedInput:0.175, status:'GA' },
    { name:'GPT-5.5',           provider:'OpenAI',    tier:'premium', costInput:5.00, costOutput:30.00, cachedInput:0.50,  status:'GA' },
  ],

  PRESETS: [],

  /* GitHub Copilot Usage-Based Billing · official dataset */
  GITHUB_COPILOT: {
    asOf: '2026-06-04',
    aiCreditUSD: 0.01,
    billingModel: 'Tokens consumed (input, output, cached) priced at per-model rates, converted to GitHub AI Credits (1 credit = US$ 0.01). Effective June 1, 2026.',
    completionsNote: 'Code completions and next edit suggestions are NOT billed in AI credits (unlimited on paid plans).',
    plans: {
      business:   { label:'Copilot Business',   usdPerSeat:19, includedCredits:1900, promoCredits:3000 },
      enterprise: { label:'Copilot Enterprise', usdPerSeat:39, includedCredits:3900, promoCredits:7000 },
      pro:        { label:'Copilot Pro',        usdPerSeat:10 },
      proPlus:    { label:'Copilot Pro+',       usdPerSeat:39 },
    },
    promoWindow: 'Existing Business/Enterprise customers: higher included credits from June 1 to September 1, 2026, then back to standard.',
    pooling: 'Included credits are pooled at the billing entity level (e.g., 100 Business users = shared 190,000 credits/month).',
    overage: 'Beyond the pooled credits: additional usage billed at published per-credit rates (if policy allows) or blocked until next cycle.',
    pricing: {
      openai: [
        { model:'GPT-4.1',        status:'GA', category:'Versatile',   input:2.00, cachedInput:0.50,  output:8.00,  note:'included model' },
        { model:'GPT-5 mini',     status:'GA', category:'Lightweight', input:0.25, cachedInput:0.025, output:2.00,  note:'included model' },
        { model:'GPT-5.2',        status:'GA', category:'Versatile',   input:1.75, cachedInput:0.175, output:14.00 },
        { model:'GPT-5.2-Codex',  status:'GA', category:'Powerful',    input:1.75, cachedInput:0.175, output:14.00 },
        { model:'GPT-5.3-Codex',  status:'GA', category:'Powerful',    input:1.75, cachedInput:0.175, output:14.00 },
        { model:'GPT-5.4',        status:'GA', category:'Versatile',   input:2.50, cachedInput:0.25,  output:15.00, note:'pricing for prompts ≤272K tokens' },
        { model:'GPT-5.4 mini',   status:'GA', category:'Lightweight', input:0.75, cachedInput:0.075, output:4.50 },
        { model:'GPT-5.4 nano',   status:'GA', category:'Lightweight', input:0.20, cachedInput:0.02,  output:1.25 },
        { model:'GPT-5.5',        status:'GA', category:'Powerful',    input:5.00, cachedInput:0.50,  output:30.00 },
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
        { model:'Gemini 2.5 Pro',  status:'GA',             category:'Powerful',    input:1.25, cachedInput:0.125, output:10.00, note:'pricing for prompts ≤200K tokens' },
        { model:'Gemini 3 Flash',  status:'Public preview', category:'Lightweight', input:0.50, cachedInput:0.05,  output:3.00,  note:'no long-context surcharge' },
        { model:'Gemini 3.1 Pro',  status:'Public preview', category:'Powerful',    input:2.00, cachedInput:0.20,  output:12.00, note:'pricing for prompts ≤200K tokens' },
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
    codeReview: 'Copilot code review: tokens billed in AI credits (model auto-selected, not disclosed) + agentic infrastructure consumes GitHub Actions minutes.',
    sources: [
      'https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing',
      'https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises',
      'https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/',
    ],
  },
};
/* backward-compat alias */
globalThis.AGENT_DATA = window.ADVISOR_DATA;
