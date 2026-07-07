import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { PORTED_I18N, PORTED_I18N_REVERSE } from './ported-i18n.js';

const { useState, useMemo, useCallback } = React;

/* ---- i18n: React side, single source (window.I18N_STRINGS) bridged to chrome + UBB ---- */
const I18N_STRINGS = window.I18N_STRINGS || { en: {} };
function i18nFmt(s, vars) { return (vars && typeof s === 'string') ? s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; }) : s; }
const LocaleContext = React.createContext('en');
function useT() {
  const loc = React.useContext(LocaleContext);
  return React.useCallback(function (key, vars) {
    const en = I18N_STRINGS.en || {};
    const dict = I18N_STRINGS[loc] || en;
    const val = (dict[key] != null) ? dict[key] : ((en[key] != null) ? en[key] : key);
    return i18nFmt(val, vars);
  }, [loc]);
}
/* ---- Localize a ported (English) subtree via exact-match dictionary ---- */
function useLocalizeSubtree(ref) {
  const locale = React.useContext(LocaleContext);
  React.useLayoutEffect(function () {
    const root = ref.current;
    if (!root) return;
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walk.nextNode())) {
      const raw = node.nodeValue;
      if (!raw) continue;
      const key = raw.trim();
      if (!key) continue;
      const en = PORTED_I18N[key] ? key : PORTED_I18N_REVERSE[key];
      if (!en) continue;
      const target = locale === 'en' ? en : ((PORTED_I18N[en] && PORTED_I18N[en][locale]) || en);
      if (key !== target) node.nodeValue = raw.replace(key, target);
    }
  });
}

function localeInit() {
  try { var s = localStorage.getItem('roi-locale'); if (s) return s; } catch (e) { }
  var n = (navigator.language || 'en').toLowerCase();
  return n.indexOf('pt') === 0 ? 'pt-BR' : n.indexOf('es') === 0 ? 'es' : 'en';
}
function LocaleProvider({ children }) {
  const [loc, setLoc] = React.useState(localeInit);
  React.useEffect(function () {
    function onChange(e) { setLoc((e && e.detail) || 'en'); }
    window.addEventListener('localechange', onChange);
    return function () { window.removeEventListener('localechange', onChange); };
  }, []);
  return <LocaleContext.Provider value={loc}>{children}</LocaleContext.Provider>;
}
const $c = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const Nf = n => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const pct = (v, t) => t > 0 ? Math.max(2, Math.round(v / t * 100)) : 0;

/* ── PERSONA DATA (24 profiles) ── */
const PERSONAS = [
  { id: "gestor-negocio", name: "Business Manager", emoji: "", wave: 1, phase: "Client & Contract", salary: 110000, prodGain: 30, timeSaved: 35, bugReduction: 0, costPerError: 5000, errRate: 5, compHrs: 10, agentCost: 468, implCost: 500, trainCost: 200, color: "var(--c-green)" },
  { id: "gestor-projeto", name: "Project Manager", emoji: "", wave: 1, phase: "Planning", salary: 105000, prodGain: 35, timeSaved: 40, bugReduction: 0, costPerError: 3000, errRate: 8, compHrs: 15, agentCost: 468, implCost: 500, trainCost: 200, color: "var(--c-blue)" },
  { id: "analista-requisitos", name: "Requirements Engineer", emoji: "", wave: 2, phase: "Planning", salary: 95000, prodGain: 40, timeSaved: 45, bugReduction: 20, costPerError: 5000, errRate: 15, compHrs: 10, agentCost: 668, implCost: 800, trainCost: 300, color: "#5C2D91" },
  { id: "arquiteto", name: "Solution Architect", emoji: "", wave: 2, phase: "Design", salary: 150000, prodGain: 60, timeSaved: 50, bugReduction: 15, costPerError: 15000, errRate: 5, compHrs: 20, agentCost: 2268, implCost: 1200, trainCost: 400, color: "#5C2D91" },
  { id: "desenvolvedor", name: "Modern Developer", emoji: "‍", wave: 1, phase: "Development", salary: 100000, prodGain: 35, timeSaved: 45, bugReduction: 40, costPerError: 500, errRate: 15, compHrs: 5, agentCost: 768, implCost: 600, trainCost: 200, color: "var(--c-green)" },
  { id: "dev-legacy", name: "Legacy Developer", emoji: "", wave: 2, phase: "Development", salary: 95000, prodGain: 25, timeSaved: 30, bugReduction: 30, costPerError: 800, errRate: 20, compHrs: 10, agentCost: 968, implCost: 1500, trainCost: 500, color: "var(--c-yellow-700)" },
  { id: "devops", name: "DevOps / Platform", emoji: "", wave: 2, phase: "CI/CD", salary: 120000, prodGain: 30, timeSaved: 87, bugReduction: 35, costPerError: 200, errRate: 10, compHrs: 15, agentCost: 3668, implCost: 2000, trainCost: 400, color: "var(--c-yellow-700)" },
  { id: "qa", name: "QA Engineer", emoji: "", wave: 1, phase: "Testing", salary: 90000, prodGain: 40, timeSaved: 70, bugReduction: 54, costPerError: 500, errRate: 20, compHrs: 5, agentCost: 1868, implCost: 800, trainCost: 300, color: "var(--c-red)" },
  { id: "product-owner", name: "Product Owner", emoji: "", wave: 1, phase: "Planning", salary: 110000, prodGain: 30, timeSaved: 60, bugReduction: 0, costPerError: 5000, errRate: 10, compHrs: 5, agentCost: 1668, implCost: 600, trainCost: 200, color: "var(--c-blue)" },
  { id: "tech-lead", name: "Tech Lead", emoji: "", wave: 1, phase: "Development", salary: 140000, prodGain: 35, timeSaved: 40, bugReduction: 25, costPerError: 2000, errRate: 8, compHrs: 15, agentCost: 1468, implCost: 800, trainCost: 300, color: "var(--c-green)" },
  { id: "uat", name: "UAT Analyst", emoji: "", wave: 3, phase: "Testing", salary: 80000, prodGain: 35, timeSaved: 50, bugReduction: 30, costPerError: 1000, errRate: 12, compHrs: 10, agentCost: 868, implCost: 500, trainCost: 200, color: "var(--c-red)" },
  { id: "sre", name: "SRE / Operations", emoji: "", wave: 2, phase: "Operations", salary: 125000, prodGain: 35, timeSaved: 81, bugReduction: 40, costPerError: 5000, errRate: 8, compHrs: 20, agentCost: 3668, implCost: 2000, trainCost: 400, color: "#008272" },
  { id: "infosec", name: "InfoSec / Compliance", emoji: "", wave: 2, phase: "Security", salary: 130000, prodGain: 50, timeSaved: 75, bugReduction: 46, costPerError: 15000, errRate: 5, compHrs: 40, agentCost: 7000, implCost: 3000, trainCost: 500, color: "#00188F" },
  { id: "dba", name: "DBA", emoji: "", wave: 1, phase: "Operations", salary: 100000, prodGain: 30, timeSaved: 40, bugReduction: 35, costPerError: 2000, errRate: 10, compHrs: 15, agentCost: 1268, implCost: 800, trainCost: 300, color: "#008272" },
  { id: "appsec", name: "AppSec / Secure Code", emoji: "", wave: 2, phase: "Security", salary: 125000, prodGain: 45, timeSaved: 70, bugReduction: 50, costPerError: 10000, errRate: 8, compHrs: 30, agentCost: 4500, implCost: 2000, trainCost: 400, color: "#00188F" },
  { id: "scrum-master", name: "Scrum Master", emoji: "", wave: 3, phase: "Planning", salary: 95000, prodGain: 25, timeSaved: 35, bugReduction: 0, costPerError: 2000, errRate: 5, compHrs: 5, agentCost: 468, implCost: 400, trainCost: 200, color: "var(--c-blue)" },
  { id: "dev-cobol", name: "COBOL Developer", emoji: "", wave: 2, phase: "Development", salary: 110000, prodGain: 20, timeSaved: 25, bugReduction: 25, costPerError: 5000, errRate: 10, compHrs: 20, agentCost: 1468, implCost: 3000, trainCost: 800, color: "var(--c-yellow-700)" },
  { id: "dev-natural", name: "Natural/ADABAS Dev", emoji: "", wave: 2, phase: "Development", salary: 105000, prodGain: 18, timeSaved: 22, bugReduction: 20, costPerError: 5000, errRate: 10, compHrs: 20, agentCost: 1468, implCost: 3000, trainCost: 800, color: "var(--c-yellow-700)" },
  { id: "compliance", name: "Compliance Officer", emoji: "", wave: 3, phase: "Security", salary: 115000, prodGain: 35, timeSaved: 50, bugReduction: 30, costPerError: 20000, errRate: 3, compHrs: 60, agentCost: 2500, implCost: 1500, trainCost: 400, color: "#00188F" },
  { id: "release-manager", name: "Release Manager", emoji: "", wave: 3, phase: "CI/CD", salary: 105000, prodGain: 30, timeSaved: 45, bugReduction: 25, costPerError: 3000, errRate: 8, compHrs: 10, agentCost: 1468, implCost: 1000, trainCost: 300, color: "var(--c-yellow-700)" },
  { id: "data-engineer", name: "Data Engineer", emoji: "", wave: 3, phase: "Development", salary: 115000, prodGain: 30, timeSaved: 40, bugReduction: 30, costPerError: 2000, errRate: 12, compHrs: 10, agentCost: 1868, implCost: 1200, trainCost: 400, color: "var(--c-green)" },
  { id: "ml-engineer", name: "ML / AI Engineer", emoji: "", wave: 3, phase: "Development", salary: 135000, prodGain: 25, timeSaved: 35, bugReduction: 20, costPerError: 3000, errRate: 10, compHrs: 10, agentCost: 2268, implCost: 1500, trainCost: 500, color: "#5C2D91" },
  { id: "ux-designer", name: "UX / Product Designer", emoji: "", wave: 3, phase: "Design", salary: 100000, prodGain: 30, timeSaved: 40, bugReduction: 15, costPerError: 2000, errRate: 8, compHrs: 5, agentCost: 868, implCost: 600, trainCost: 200, color: "#5C2D91" },
  { id: "eng-manager", name: "Engineering Manager", emoji: "", wave: 1, phase: "Planning", salary: 145000, prodGain: 30, timeSaved: 35, bugReduction: 0, costPerError: 5000, errRate: 5, compHrs: 15, agentCost: 868, implCost: 600, trainCost: 200, color: "var(--c-green)" },
];
const PERSONA_ICONS = {
  "gestor-negocio": "briefcase", "gestor-projeto": "clipboard", "analista-requisitos": "fileText",
  "arquiteto": "layers", "desenvolvedor": "code", "dev-legacy": "terminal", "devops": "refresh",
  "qa": "check", "product-owner": "target", "tech-lead": "users", "uat": "flask",
  "sre": "bell", "infosec": "lock", "dba": "database", "appsec": "shield", "scrum-master": "refresh",
  "dev-cobol": "terminal", "dev-natural": "database", "compliance": "scales", "release-manager": "rocket",
  "data-engineer": "database", "ml-engineer": "brain", "ux-designer": "paint", "eng-manager": "user"
};


const WAVES = [
  { n: 1, name: "Quick Win", time: "Months 1-3", color: "var(--c-green)", profiles: PERSONAS.filter(p => p.wave === 1) },
  { n: 2, name: "Expansion", time: "Months 4-6", color: "var(--c-blue)", profiles: PERSONAS.filter(p => p.wave === 2) },
  { n: 3, name: "Optimization", time: "Months 7-12", color: "#5C2D91", profiles: PERSONAS.filter(p => p.wave === 3) },
];

/* ── Shared Components ── */
function Slider({ label, value, min, max, step = 1, unit = "", onChange, color = "var(--c-blue)" }) {
  const p = Math.round((value - min) / (max - min) * 100);
  const f = v => unit === "$" ? $c(v) : `${Nf(v)}${unit}`;
  return (<div className="sldr">
    <div className="sldr-row"><span className="sldr-lbl">{label}</span><span className="sldr-val">{f(value)}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ background: `linear-gradient(to right,${color} ${p}%,#E1DFDD ${p}%)` }} />
    <div className="sldr-ends"><span>{f(min)}</span><span>{f(max)}</span></div>
  </div>);
}
function BarRow({ l, v, total, color }) {
  const p = pct(v, total);
  return (<div className="bar-row">
    <div className="bar-hd"><span><span className="bar-lbl">{l}</span><span className="bar-pct">{total > 0 ? Math.round(v / total * 100) : 0}%</span></span><span className="bar-val">{$c(v)}</span></div>
    <div className="bar-track"><div className="bar-fill" style={{ width: `${p}%`, background: color }} /></div>
  </div>);
}
function GartnerCallout({ title, body, type = "gartner" }) {
  const icons = { gartner: "", warning: "", critical: "" };
  return (<div className={`callout ${type}`}><div className="callout-icon">{icons[type]}</div><div className="callout-text"><div className="callout-title">{title}</div><div className="callout-body">{body}</div></div></div>);
}

/* ══════════ TAB 1: OVERVIEW, LANDING PAGE ══════════ */

function OverviewTab({ onNavigate }) {
  const tr = useT();
  const W = { maxWidth: 1140, margin: '0 auto' };

  const tabs = [
    { idx: 2, color: 'var(--c-green)', bg: '#F1FAF1', border: '#9FD99F', titleKey: 'nav2Label', descKey: 'ovCardArchDesc', bulletKeys: ['ovCardArchB1', 'ovCardArchB2', 'ovCardArchB3', 'ovCardArchB4'] },
    { idx: 3, color: '#008272', bg: '#F0FAF9', border: '#99D6CE', titleKey: 'nav3Label', descKey: 'ovCardRoiDesc', bulletKeys: ['ovCardRoiB1', 'ovCardRoiB2', 'ovCardRoiB3', 'ovCardRoiB4'] },
    { idx: 4, color: 'var(--c-yellow-700)', bg: '#FEF6F0', border: '#F4C9A8', titleKey: 'nav4Label', descKey: 'ovCardGartnerDesc', bulletKeys: ['ovCardGartnerB1', 'ovCardGartnerB2', 'ovCardGartnerB3', 'ovCardGartnerB4'] },
    { idx: 5, color: 'var(--c-blue)', bg: '#EFF6FC', border: '#C7E0F4', titleKey: 'nav5Label', descKey: 'ovCardPersonaDesc', bulletKeys: ['ovCardPersonaB1', 'ovCardPersonaB2', 'ovCardPersonaB3', 'ovCardPersonaB4'] },
    { idx: 6, color: '#5C2D91', bg: '#F5F0FF', border: '#D4B8F0', titleKey: 'nav6Label', descKey: 'ovCardAgentDesc', bulletKeys: ['ovCardAgentB1', 'ovCardAgentB2', 'ovCardAgentB3', 'ovCardAgentB4'] },
    { idx: 7, color: '#0A4A7A', bg: '#EAF3FB', border: '#C7E0F4', titleKey: 'nav7Label', descKey: 'ovCardWorkspaceDesc', bulletKeys: ['ovCardWorkspaceB1', 'ovCardWorkspaceB2', 'ovCardWorkspaceB3', 'ovCardWorkspaceB4'] },
  ];

  const steps = [
    { n: '1', titleKey: 'ovStep1Title', bodyKey: 'ovStep1Body' },
    { n: '2', titleKey: 'ovStep2Title', bodyKey: 'ovStep2Body' },
    { n: '3', titleKey: 'ovStep3Title', bodyKey: 'ovStep3Body' },
  ];

  const chips = [
    { key: 'ovChip1', clr: '#FFB900' },
    { key: 'ovChip2', clr: '#7FBA00' },
    { key: 'ovChip3', clr: '#00A4EF' },
    { key: 'ovChip4', clr: '#F25022' },
    { key: 'ovChip5', clr: '#B4A0FF' },
  ];

  return (
    <div style={W}>

      {/* GitHub Copilot UBB highlight */}
      <div onClick={() => onNavigate(1)} style={{ cursor: 'pointer', background: 'linear-gradient(135deg,#0078D4 0%,#00A4EF 100%)', borderRadius: 'var(--radius-md)', padding: '26px 36px', color: '#fff', marginBottom: 24, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ background: '#FFB900', color: '#1A1A1A', font: '700 10px Inter,sans-serif', letterSpacing: '.1em', padding: '3px 9px', borderRadius: 4 }}>{tr('ovUbbBadge')}</span>
          <span style={{ font: '600 11px Inter,sans-serif', letterSpacing: '.08em', opacity: .85 }}>{tr('ovUbbKicker')}</span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px', color: '#fff' }}>{tr('ovUbbTitle')}</h2>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 760, margin: 0, opacity: .92 }}>{tr('ovUbbDesc')}</p>
      </div>

      {/* Hero */}
      <div style={{ height: 5, display: 'flex', borderRadius: '6px 6px 0 0', overflow: 'hidden', maxWidth: '100%' }}>
        <span style={{ flex: 1, background: 'var(--c-red)' }} /><span style={{ flex: 1, background: 'var(--c-green)' }} />
        <span style={{ flex: 1, background: 'var(--c-blue)' }} /><span style={{ flex: 1, background: 'var(--c-yellow)' }} />
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '28px 36px', color: 'var(--text-primary)', marginBottom: 24, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', marginBottom: 10, lineHeight: 1.1, color: 'var(--text-primary)' }}>{tr('brandTopic')} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0 }}>v2.0</span></h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 680, marginBottom: 24 }}>{tr('ovHeroDesc')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chips.map((m, i) => (
            <span key={i} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid var(--border)', borderRadius: 100, padding: '5px 14px', fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', backdropFilter: 'blur(4px)' }}>
              <span style={{ color: m.clr, marginRight: 5 }}>●</span>{tr(m.key)}
            </span>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--c-blue-700)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 2, background: 'var(--c-blue)' }} />{tr('ovHowKicker')}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>{tr('ovHowSub')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '18px 20px', border: '1px solid var(--border-light)', borderTop: '3px solid ' + ['var(--c-blue)', 'var(--c-green)', 'var(--c-yellow)'][i % 3], position: 'relative', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: 'JetBrains Mono,monospace', fontSize: 20, fontWeight: 700, color: ['var(--c-blue)', 'var(--c-green)', 'var(--c-yellow-700)'][i % 3], opacity: .35 }}>{String(s.n).padStart(2, '0')}</div>
              <div style={{ fontSize: 22, marginBottom: 10 }}></div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>{tr(s.titleKey)}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tr(s.bodyKey)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab cards */}
      <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--c-green-700)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 2, background: 'var(--c-green)' }} />{tr('ovExploreKicker')}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{tr('ovExploreSub')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
        {tabs.slice(0, 3).map(t => (
          <TabCard key={t.idx} t={t} onNavigate={onNavigate} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {tabs.slice(3).map(t => (
          <TabCard key={t.idx} t={t} onNavigate={onNavigate} />
        ))}
      </div>

      {/* Gartner disclaimer */}
      <div className="note info" style={{ fontSize: 11.5 }}>
        <strong>{tr('ovDisclaimerStrong')}</strong> {tr('ovDisclaimerBody')}
        <span style={{ display: 'block', marginTop: 6, color: 'var(--text-subtle)', fontSize: 10.5 }}>{tr('ovSourcesPrefix')} G00837723 · G00799085 · G00841080 · G00846878 · G00823006 · G00825224</span>
      </div>

    </div>
  );
}


function TabCard({ t, onNavigate }) {
  const tr = useT();
  const [hover, setHover] = React.useState(false);
  const title = tr(t.titleKey);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onNavigate(t.idx)}
      style={{
        background: hover ? t.bg : '#fff',
        border: '1.5px solid ' + (hover ? t.color : t.border),
        borderRadius: 14, padding: '22px 24px', cursor: 'pointer',
        transition: 'all .18s cubic-bezier(.4,0,.2,1)',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? ('0 6px 24px ' + t.color + '28') : '0 1px 2px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.05)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}></span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</div>
            <div style={{ fontSize: 10, color: t.color, fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.5px' }}>{tr('ovTabLabel', { n: t.idx })}</div>
          </div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: t.color, transition: 'all .18s', transform: hover ? 'translateX(2px)' : 'none', flexShrink: 0 }}>→</div>
      </div>
      <div style={{ height: 2.5, background: t.color, borderRadius: 2, marginBottom: 14, color: 'var(--text-muted)' }} />
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, flex: 1 }}>{tr(t.descKey)}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {t.bulletKeys.map((b, i) => (
          <li key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 11.5, color: 'var(--text-secondary)' }}>
            <span style={{ color: t.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>
            <span>{tr(b)}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid ' + (hover ? t.border : 'var(--border-light)') }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: t.color }}>{tr('ovCardOpen', { title })}</span>
      </div>
    </div>
  );
}


/* ══════════ TAB 2: ROI BY PERSONA ══════════ */
function PersonaROI() {
  const [sel, setSel] = useState("desenvolvedor");
  const [headcount, setHeadcount] = useState(5);
  const [salaryMult, setSalaryMult] = useState(100);
  const [sub, setSub] = useState("calculator");
  const W = { maxWidth: 1140, margin: '0 auto' };
  const secH = { fontSize: 14, fontWeight: 700, color: '#201F1E', marginBottom: 4 };
  const secSub = { fontSize: 11.5, color: '#605E5C', marginBottom: 14, lineHeight: 1.5 };

  const p = PERSONAS.find(x => x.id === sel) || PERSONAS[4];
  const adjSalary = Math.round(p.salary * (salaryMult / 100));

  const R = useMemo(() => {
    const benProd = adjSalary * (p.prodGain / 100);
    const benErrors = p.bugReduction > 0 ? (p.errRate / 100) * 2080 * (p.costPerError) * (p.bugReduction / 100) : 0;
    const benComp = p.compHrs * 12 * (adjSalary / 2080) * 0.5;
    const totalBen = benProd + benErrors + benComp;
    const totalCost = p.agentCost + p.implCost + p.trainCost;
    const roi = totalCost > 0 ? Math.round((totalBen - totalCost) / totalCost * 100) : 0;
    const payback = totalBen > 0 ? Math.round((totalCost / (totalBen / 12)) * 10) / 10 : 0;
    const teamBen = totalBen * headcount;
    const teamCost = totalCost * headcount;
    const teamROI = teamCost > 0 ? Math.round((teamBen - teamCost) / teamCost * 100) : 0;
    return { benProd, benErrors, benComp, totalBen, totalCost, roi, payback, teamBen, teamCost, teamROI };
  }, [sel, headcount, salaryMult, adjSalary, p]);

  return (<div style={W}>
    {/* Sub-tab navigation */}
    <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
      {[["calculator", "ROI Calculator"], ["compare", "Compare All 24"]].map(([k, l]) => (
        <button key={k} className={`sub-tab ${sub === k ? "on" : ""}`} onClick={() => setSub(k)}>{l}</button>
      ))}
    </div>

    {sub === "calculator" && (<>
      {/* Persona selector */}
      <div className="card">
        <SectionTitle icon="users" color="var(--c-blue)">Select Persona</SectionTitle>
        <div style={secSub}>24 SDLC profiles across 8 delivery phases, each with individual ROI, cost, and benefit analysis</div>
        <div className="persona-grid">
          {PERSONAS.map(pr => (<button key={pr.id} className={`persona-btn ${sel === pr.id ? "on" : ""}`} onClick={() => setSel(pr.id)} style={{ borderColor: sel === pr.id ? pr.color : '#E1DFDD' }}>
            <span className="persona-icon" style={{ color: pr.color }}><Icon name={PERSONA_ICONS[pr.id] || "user"} size={18} /></span>
            <span className="persona-name">{pr.name}</span>
            <span className="persona-wave">Wave {pr.wave} · {pr.phase}</span>
          </button>))}
        </div>
      </div>

      {/* Hero ROI band */}
      <div className="hero-band" style={{ background: 'var(--bg-card)', borderLeft: `4px solid ${p.color}`, color: 'var(--text-primary)' }}>
        <div className="hb-top">
          <span className="hb-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ color: p.color, display: 'inline-flex' }}><Icon name={PERSONA_ICONS[p.id] || "user"} size={16} /></span>{p.name}, ROI Analysis</span>
          <span className="r-badge" style={{ background: R.roi >= 500 ? "#DFF6DD" : "#EFF6FC", color: R.roi >= 500 ? "var(--c-green)" : "var(--c-blue)" }}>{Nf(R.roi)}% ROI</span>
        </div>
        <div className="hb-inner">
          <div className="hb-cell"><div className="hb-lbl">Individual ROI</div><div className="hb-val">{Nf(R.roi)}<span className="u">%</span></div><div className="hb-sub">per person</div></div>
          <div className="hb-cell"><div className="hb-lbl">Payback Period</div><div className="hb-val">{R.payback < 1 ? "<1" : R.payback}<span className="u"> mo</span></div><div className="hb-sub">~{Math.round(R.payback * 30)} days</div></div>
          <div className="hb-cell"><div className="hb-lbl">Annual Benefit</div><div className="hb-val" style={{ fontSize: 26 }}>{$c(R.totalBen)}</div><div className="hb-sub">per person</div></div>
          <div className="hb-cell"><div className="hb-lbl">Team Net Value ({headcount})</div><div className="hb-val" style={{ fontSize: 26 }}>{$c(R.teamBen - R.teamCost)}</div><div className="hb-sub">annual net ROI</div></div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="card">
            <SectionTitle icon="gear" color="var(--c-blue)">Customize Parameters</SectionTitle>
            <div style={secSub}>Adjust team size and salary to match your organization's specific context</div>
            <Slider label={`Team size (${p.name}s)`} value={headcount} min={1} max={100} onChange={setHeadcount} color={p.color} />
            <Slider label="Salary adjustment (%)" value={salaryMult} min={50} max={200} unit="%" onChange={setSalaryMult} color={p.color} />
            <div className="pills">
              <div className="pill">Base salary: <strong>{$c(p.salary)}</strong></div>
              <div className="pill">Adjusted: <strong>{$c(adjSalary)}</strong></div>
              <div className="pill">Phase: <strong>{p.phase}</strong></div>
              <div className="pill">Wave: <strong>{p.wave}</strong></div>
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="trendUp" color="var(--c-green)">Annual Benefits Breakdown</SectionTitle>
            <div style={secSub}>Per-person value created by AI augmentation, three benefit streams</div>
            <BarRow l="Productivity gains" v={R.benProd} total={R.totalBen} color="var(--c-blue)" />
            <BarRow l="Error/defect reduction" v={R.benErrors} total={R.totalBen} color="var(--c-red)" />
            <BarRow l="Compliance savings" v={R.benComp} total={R.totalBen} color="#8764B8" />
            <div className="divider" />
            <div className="bar-hd"><span className="bar-lbl" style={{ fontWeight: 700 }}>Total Benefits</span><span className="bar-val" style={{ color: "var(--c-green)" }}>{$c(R.totalBen)}</span></div>
          </div>

          <div className="card">
            <SectionTitle icon="dollar" color="var(--c-red)">Annual Costs Breakdown</SectionTitle>
            <div style={secSub}>Total cost of ownership per person, licenses, implementation, and training</div>
            <BarRow l="Agent licenses & AI inference" v={p.agentCost} total={R.totalCost} color="var(--c-blue)" />
            <BarRow l="Implementation (amortized Y1)" v={p.implCost} total={R.totalCost} color="var(--c-yellow-700)" />
            <BarRow l="Training" v={p.trainCost} total={R.totalCost} color="#8A8886" />
            <div className="divider" />
            <div className="bar-hd"><span className="bar-lbl" style={{ fontWeight: 700 }}>Total Costs</span><span className="bar-val">{$c(R.totalCost)}</span></div>
          </div>
        </div>

        <div>
          <div className="card">
            <SectionTitle icon="chartBar" color="var(--c-blue)">Persona Metrics</SectionTitle>
            <div style={secSub}>Key performance indicators and baseline data for this SDLC role</div>
            <table className="tbl">
              <thead><tr><th>Metric</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Productivity Gain</td><td className="g">{p.prodGain}%</td></tr>
                <tr><td>Time Saved (automation rate)</td><td className="g">{p.timeSaved}%</td></tr>
                <tr><td>Bug/Error Reduction</td><td className="g">{p.bugReduction}%</td></tr>
                <tr><td>Current Error Rate</td><td>{p.errRate}%</td></tr>
                <tr><td>Cost per Error</td><td>{$c(p.costPerError)}</td></tr>
                <tr><td>Compliance Hours/Month</td><td>{p.compHrs} hrs</td></tr>
                <tr><td>SDLC Phase</td><td>{p.phase}</td></tr>
                <tr><td>Implementation Wave</td><td>Wave {p.wave}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <SectionTitle icon="users" color="var(--c-green)">Team Summary</SectionTitle>
            <div style={secSub}>{headcount} {p.name}{headcount > 1 ? "s" : ""}, aggregate investment and return</div>
            <div className="sc-strip">
              <div className="sc best" style={{ textAlign: "center" }}><div className="sc-tag">Team Benefits</div><div className="sc-roi">{$c(R.teamBen)}</div><div className="sc-data">/year</div></div>
              <div className="sc exp" style={{ textAlign: "center" }}><div className="sc-tag">Team Cost</div><div className="sc-roi">{$c(R.teamCost)}</div><div className="sc-data">/year</div></div>
              <div className="sc worst" style={{ textAlign: "center" }}><div className="sc-tag">Team Net ROI</div><div className="sc-roi">+{Nf(R.teamROI)}%</div><div className="sc-data">return</div></div>
            </div>
          </div>

          <GartnerCallout type="gartner" title="Gartner: Outcome-Driven Metrics (ODMs)" body={`For ${p.name}, connect operational metrics (time saved, errors reduced) to business outcomes above the line. Stop reporting just 'hours saved', show CFOs the $ impact on labor costs, revenue, or capacity. (G00799085)`} />

          <div className="note warn">Gartner recommends limiting dashboards to 10-18 metrics focused on strategic relevance. Use OGSIM (Objectives, Goals, Strategies, Initiatives, Metrics) to connect {p.name} KPIs to enterprise goals. (G00846878)</div>
        </div>
      </div>
    </>)}

    {sub === "compare" && (
      <div className="card">
        <SectionTitle icon="grid" color="var(--c-blue)">All 24 Personas, ROI Comparison</SectionTitle>
        <div style={secSub}>Sorted by benefit-to-cost ratio. Click any row to open the detailed calculator for that persona.</div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Persona</th><th>Wave</th><th>Phase</th><th>Prod Gain</th><th>Salary</th><th>Annual Benefit</th><th>Annual Cost</th><th>ROI</th><th>Payback</th></tr></thead>
            <tbody>{[...PERSONAS].sort((a, b) => {
              const ra = (a.salary * (a.prodGain / 100)) / (a.agentCost + a.implCost + a.trainCost);
              const rb = (b.salary * (b.prodGain / 100)) / (b.agentCost + b.implCost + b.trainCost);
              return rb - ra;
            }).map(pr => {
              const ben = pr.salary * (pr.prodGain / 100) + (pr.bugReduction > 0 ? (pr.errRate / 100) * 2080 * pr.costPerError * (pr.bugReduction / 100) : 0) + pr.compHrs * 12 * (pr.salary / 2080) * 0.5;
              const cost = pr.agentCost + pr.implCost + pr.trainCost;
              const roi = Math.round((ben - cost) / cost * 100);
              const pay = Math.round((cost / (ben / 12)) * 10) / 10;
              return (<tr key={pr.id} className={pr.id === sel ? "hi" : ""} style={{ cursor: "pointer" }} onClick={() => { setSel(pr.id); setSub("calculator") }}>
                <td><strong>{pr.name}</strong></td>
                <td><span style={{ background: WAVES[pr.wave - 1]?.color || "#999", color: 'var(--text-primary)', padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700 }}>W{pr.wave}</span></td>
                <td style={{ fontSize: 11 }}>{pr.phase}</td>
                <td className="g">{pr.prodGain}%</td>
                <td>{$c(pr.salary)}</td>
                <td className="g">{$c(ben)}</td>
                <td className="m">{$c(cost)}</td>
                <td className="g">{Nf(roi)}%</td>
                <td>{pay} mo</td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </div>
    )}
  </div>);
}


/* ══════════ TAB 3: GARTNER RESEARCH ══════════ */
function GartnerResearch() {
  const [section, setSection] = useState("paradox");
  const W = { maxWidth: 1140, margin: '0 auto' };
  const secH = { fontSize: 14, fontWeight: 700, color: '#201F1E', marginBottom: 4 };
  const secSub = { fontSize: 11.5, color: '#605E5C', marginBottom: 14, lineHeight: 1.5 };

  return (<div style={W}>
    {/* Section navigation */}
    <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
      {[["paradox", " Productivity Paradox"], ["odm", "ODM Framework"], ["headcount", "Headcount Impact"], ["capabilities", " 5 Capabilities"]].map(([k, l]) => (
        <button key={k} className={`sub-tab ${section === k ? "on" : ""}`} onClick={() => setSection(k)}>{l}</button>
      ))}
    </div>

    {section === "paradox" && (<>
      <div className="gartner-card">
        <div style={{ ...secH, color: 'var(--c-yellow-700)' }}>Productivity Gains Alone Won't Pay for AI</div>
        <div style={secSub}>G00837723 · By Emily Potosky, Patrick Quinlan · Gartner, Oct 2025</div>
        <p style={{ fontSize: 12.5, color: "#323130", lineHeight: 1.7 }}>AI promises increased productivity, yet many productivity-focused initiatives fail to achieve positive ROI. Service and support leaders looking to cut costs or drive growth by deploying AI need to learn about and account for the barriers keeping them from realizing value.</p>
      </div>

      <div className="insight-grid">
        <div className="insight-card" style={{ borderColor: "var(--c-red)", background: "#FDF3F4" }}>
          <div className="ic-num" style={{ color: "var(--c-red)" }}>5.47</div>
          <div className="ic-lbl" style={{ color: "var(--c-red)" }}>Hours Saved / Week</div>
          <div className="ic-sub">avg via AI/ML implementation</div>
        </div>
        <div className="insight-card" style={{ borderColor: "var(--c-yellow-700)", background: "#FFFBF0" }}>
          <div className="ic-num" style={{ color: "var(--c-yellow-700)" }}>2.1</div>
          <div className="ic-lbl" style={{ color: "var(--c-yellow-700)" }}>Hours Lost to Non-Value Work</div>
          <div className="ic-sub">rework (0.7h) + busywork (1.4h)</div>
        </div>
        <div className="insight-card" style={{ borderColor: "var(--c-green)", background: "#F1FAF1" }}>
          <div className="ic-num" style={{ color: "var(--c-green)" }}>2.7</div>
          <div className="ic-lbl" style={{ color: "var(--c-green)" }}>Hours Actually Recovered</div>
          <div className="ic-sub">skills (1h) + value work (1.7h)</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="card">
            <SectionTitle icon="refresh" color="var(--c-yellow-700)">How "Time Saved" Is Really Redistributed</SectionTitle>
            <div style={secSub}>Of 5.47 hrs saved weekly, less than half translates to recoverable value</div>
            {[
              { l: "Redoing Work", h: 0.7, c: "var(--c-red)", type: "Lost" },
              { l: "Developing New Skills", h: 1.0, c: "var(--c-blue)", type: "Valuable" },
              { l: "Taking On Value-Adding Work", h: 1.7, c: "var(--c-green)", type: "Valuable" },
              { l: "Reducing Work Hours", h: 0.7, c: "#8764B8", type: "Valuable" },
              { l: "Non-Value Additional Work", h: 1.4, c: "var(--c-yellow-700)", type: "Lost" },
            ].map(r => (<div key={r.l} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#323130" }}>{r.l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.c }}>{r.h} hrs</span>
              </div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.h / 5.47) * 100}%`, background: r.c }} /></div>
              <div style={{ fontSize: 10, color: r.type === "Lost" ? "var(--c-red)" : "var(--c-green)", fontWeight: 600, marginTop: 2 }}>{r.type === "Lost" ? "Lost Productivity" : "Necessary / Valuable Work"}</div>
            </div>))}
          </div>

          <div className="card">
            <SectionTitle icon="shield" color="var(--c-blue)">The Defend Case: Microsoft 365 Copilot Example</SectionTitle>
            <div style={secSub}>G00823006, Why a pure "Defend" pattern generates negative ROI</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "#EFF6FC", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#8A8886", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>Value Created</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--c-blue)" }}>$528</div>
                <div style={{ fontSize: 10, color: "#8A8886" }}>per user / year</div>
              </div>
              <div style={{ background: "#FDF3F4", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#8A8886", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>Total Cost</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--c-red)" }}>$1,091</div>
                <div style={{ fontSize: 10, color: "#8A8886" }}>per user / year</div>
              </div>
            </div>
            <div style={{ textAlign: "center", padding: 12, background: "#FDF3F4", borderRadius: 8, border: "1.5px solid #F1A7A9" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-red)" }}>Financial Return = -52%</div>
              <div style={{ fontSize: 10, color: "#8A8886", marginTop: 2 }}>When using "Defend" pattern only (3% daily time savings)</div>
            </div>
            <div className="note warn" style={{ marginTop: 12 }}>This is why moving to "Extend" patterns with Agentic AI (30-60% gains via custom agents, MCP, skills) is critical for positive ROI.</div>
          </div>
        </div>

        <div>
          <div className="card">
            <SectionTitle icon="star" color="var(--c-yellow-700)">Key Findings</SectionTitle>
            <div style={secSub}>Four critical insights for leaders evaluating AI productivity investments</div>
            {[
              { t: "Time saved is not money saved", d: "Without reducing headcount or reallocating capacity toward revenue, productivity gains fail to yield financial returns." },
              { t: "Productivity leakage is real", d: "Time saved often disappears due to task switching, coordination costs, or workflow bottlenecks elsewhere." },
              { t: "Scattered savings don't compound", d: "60 seconds saved per call × 1000 calls = 16.7 hours. But scattered across agents and shifts, it's unharvestable." },
              { t: "Reframe for CFO language", d: "Instead of 'we save 2 min per call', show 'we lowered annual costs by $4M' or 'we increased renewals by 15%'." },
            ].map((f, i) => (<div key={i} style={{ padding: "12px 0", borderBottom: i < 3 ? "1px solid #F3F2F1" : "none" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#201F1E", marginBottom: 4 }}>{f.t}</div>
              <div style={{ fontSize: 11.5, color: "#605E5C", lineHeight: 1.5 }}>{f.d}</div>
            </div>))}
          </div>

          <div className="card">
            <SectionTitle icon="bookOpen" color="var(--c-blue)">Gartner Recommendations</SectionTitle>
            <div style={secSub}>Three actions for converting AI productivity into measurable financial returns</div>
            {[
              { n: 1, t: "Evaluate workflows and incentives", d: "Understand what blocks productivity gains from becoming real savings.", c: "var(--c-blue)" },
              { n: 2, t: "Reallocate gains to financials", d: "Convert to reduced talent spend (headcount reduction, hiring freeze) or revenue generation.", c: "var(--c-blue)" },
              { n: 3, t: "Reframe in CFO language", d: "Concrete, auditable financial impact, not vague productivity projections.", c: "var(--c-blue)" },
            ].map(r => (<div key={r.n} style={{ display: "flex", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: r.n < 3 ? "1px solid #F3F2F1" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: r.c, color: '#FFFFFF', fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>{r.n}</div>
              <div><div style={{ fontSize: 12.5, fontWeight: 700, color: "#201F1E", marginBottom: 2 }}>{r.t}</div><div style={{ fontSize: 11.5, color: "#605E5C" }}>{r.d}</div></div>
            </div>))}
          </div>
        </div>
      </div>
    </>)}

    {section === "odm" && (<>
      <div className="gartner-card">
        <div style={{ ...secH, color: 'var(--c-yellow-700)' }}>Outcome-Driven Metrics for the Digital Era</div>
        <div style={secSub}>G00799085 · By Paul Proctor et al. · Gartner, Jul 2025</div>
        <p style={{ fontSize: 12.5, color: "#323130", lineHeight: 1.7 }}>ODMs link technology operational metrics to the business outcomes they support. Using ODMs, CIOs can more effectively partner with business stakeholders to drive technology priorities and investments that deliver business value.</p>
      </div>

      <div className="card">
        <SectionTitle icon="scales" color="var(--c-blue)">Above the Line vs Below the Line</SectionTitle>
        <div style={secSub}>Business outcomes (above) must be connected to IT operational metrics (below) through ODM bridges</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid #E1DFDD", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "#EFF6FC", padding: 16, borderRight: "1px solid #E1DFDD" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-blue)", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 10 }}>Above the Line: Business Outcomes</div>
            {["Profitability of loan portfolio", "Revenue per customer segment", "Customer satisfaction (CSAT/NPS)", "Time to market for new products", "Contract fulfillment rate"].map(m => (<div key={m} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#323130", padding: "5px 0" }}><span style={{ color: "var(--c-blue)", fontWeight: 700 }}>+</span>{m}</div>))}
          </div>
          <div style={{ background: "#FAF9F8", padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8886", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 10 }}>Below the Line: IT Operations</div>
            {["System uptime / availability", "Deployment frequency", "Mean time to repair (MTTR)", "API response time", "Infrastructure cost per user"].map(m => (<div key={m} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#605E5C", padding: "5px 0" }}><span style={{ color: "#8A8886" }}>-</span>{m}</div>))}
          </div>
        </div>
        <div className="note info" style={{ marginTop: 12 }}>The bridge: "Days to close a loan" (business) depends on "% unscheduled outages for online loan app" (technology).</div>
      </div>

      <div className="card">
        <SectionTitle icon="target" color="var(--c-green)">Applying ODMs to Agentic DevOps</SectionTitle>
        <div style={secSub}>How to connect SDLC technology metrics to business outcomes for each key persona</div>
        <table className="tbl">
          <thead><tr><th>Persona</th><th>Technology ODM (Below)</th><th>Business ODM (Above)</th><th>Business Outcome</th></tr></thead>
          <tbody>
            <tr><td>‍Developer</td><td>PR velocity, bugs/KLOC</td><td>Cycle time to production</td><td>Faster feature delivery</td></tr>
            <tr><td> DevOps/SRE</td><td>MTTR, deploy frequency</td><td>Service availability</td><td>Customer satisfaction</td></tr>
            <tr><td>QA Engineer</td><td>Test coverage, defect rate</td><td>Production incident rate</td><td>Product quality/trust</td></tr>
            <tr><td>Security</td><td>Vuln detection rate, MTTR</td><td>Compliance audit pass rate</td><td>Regulatory confidence</td></tr>
            <tr><td>Product Owner</td><td>Story quality (INVEST)</td><td>Rework rate from unclear reqs</td><td>Time to market</td></tr>
          </tbody>
        </table>
      </div>
    </>)}

    {section === "headcount" && (<>
      <div className="gartner-card">
        <div style={{ ...secH, color: 'var(--c-yellow-700)' }}>Setting Headcount Targets in the AI Era</div>
        <div style={secSub}>G00841080 · By Helen Poitevin, Lily Mok · Gartner, Jan 2026</div>
        <p style={{ fontSize: 12.5, color: "#323130", lineHeight: 1.7 }}>Executive leaders are under pressure to show ROI through AI-driven workforce reductions. They should take a realistic view of how AI will impact teams and align headcount targets to enterprise strategy and AI ambition.</p>
      </div>

      <div className="bcp-grid">
        <div className="bcp-card" style={{ borderColor: "var(--c-blue)", background: "#EFF6FC" }}>
          <div className="bcp-tag" style={{ color: "var(--c-blue)" }}> Defend</div>
          <div className="bcp-desc">Augment individual productivity</div>
          <div className="bcp-metric" style={{ color: "var(--c-blue)" }}>0-3% headcount decrease</div>
          <div style={{ fontSize: 10.5, color: "#605E5C", marginTop: 6 }}>0-1% increase (AI-related roles)</div>
          <div className="note" style={{ marginTop: 8, fontSize: 10 }}>Most business units will NOT see reduction. AI coding assistants alone don't change the nature of work enough.</div>
        </div>
        <div className="bcp-card" style={{ borderColor: "var(--c-green)", background: "#F1FAF1" }}>
          <div className="bcp-tag" style={{ color: "var(--c-green)" }}>Extend</div>
          <div className="bcp-desc">Transform existing processes</div>
          <div className="bcp-metric" style={{ color: "var(--c-green)" }}>0-10% headcount decrease</div>
          <div style={{ fontSize: 10.5, color: "#605E5C", marginTop: 6 }}>0-4% increase (transformation roles)</div>
          <div className="note" style={{ marginTop: 8, fontSize: 10 }}>Requires redesigns of jobs, work and processes. Where Agentic DevOps with custom agents makes real impact.</div>
        </div>
        <div className="bcp-card" style={{ borderColor: "#5C2D91", background: "#F5F0FF" }}>
          <div className="bcp-tag" style={{ color: "#5C2D91" }}>Upend</div>
          <div className="bcp-desc">Create new products and markets</div>
          <div className="bcp-metric" style={{ color: "#5C2D91" }}>0-30% headcount change</div>
          <div style={{ fontSize: 10.5, color: "#605E5C", marginTop: 6 }}>0-30% increase (new business roles)</div>
          <div className="note" style={{ marginTop: 8, fontSize: 10 }}>Few enterprises here yet. Both reductions and increases vary widely.</div>
        </div>
      </div>

      <GartnerCallout type="critical" title="Key Insight: Most business units will see NO net headcount change" body="A decline in one area is offset by an increase in another. Redesigning jobs requires 20× more organizational effort than simple headcount reductions. AI-driven job gains will outpace losses starting 2028-2029, but impacts affect less than 1% of workers." />

      <div className="card">
        <SectionTitle icon="calculator" color="var(--c-yellow-700)">{"Minimum Requirements for > 0% Headcount Decrease"}</SectionTitle>
        <div style={secSub}>Three conditions that must ALL be met simultaneously for meaningful workforce impact</div>
        {[
          { t: "High feasibility of using AI", d: "Technological, organizational, customer AND employee readiness must all be present." },
          { t: "High intensity of AI usage", d: "Multiple use cases, consistent usage throughout the workday, not just occasional help." },
          { t: "High degree of process transformation", d: "The nature, volume, speed of work, AND form of output must fundamentally change." },
        ].map((r, i) => (<div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? "1px solid #F3F2F1" : "none" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-red)", flexShrink: 0, marginTop: 6 }} />
          <div><div style={{ fontSize: 12.5, fontWeight: 700, color: "#201F1E", marginBottom: 3 }}>{r.t}</div><div style={{ fontSize: 11.5, color: "#605E5C", lineHeight: 1.5 }}>{r.d}</div></div>
        </div>))}
      </div>
    </>)}

    {section === "capabilities" && (<>
      <div className="gartner-card">
        <div style={{ ...secH, color: 'var(--c-yellow-700)' }}>Five Product Capabilities That Drive Agentic AI Adoption</div>
        <div style={secSub}>Gartner, 2025, Requirements for moving from POC to production with agentic AI</div>
        <p style={{ fontSize: 12.5, color: "#323130", lineHeight: 1.7 }}>To move from POC to production, products must embed these five capabilities into their agentic AI offerings.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
        {[
          { icon: "", t: "Productize Levels of Autonomy", d: "Expose clear autonomy tiers so customers can safely progress from assistive AI to full automation as trust builds.", c: "var(--c-blue)" },
          { icon: "", t: "Treat Workflows as Living Value Assets", d: "Continuously instrument workflows so every execution improves performance and shows where value is gained or lost.", c: "var(--c-green)" },
          { icon: "", t: "Design for Human+AI Collaboration", d: "Make agent decisions and confidence visible so humans can easily approve, correct, and guide execution.", c: "#5C2D91" },
          { icon: "", t: "Engineer for Low Cognitive Load", d: "Embed AI into existing tools to reduce context switching, decisions, and user effort as autonomy increases.", c: "var(--c-yellow-700)" },
          { icon: "", t: "Embed CS Best Practices into Runtime", d: "Embed health, value, and risk monitoring directly into the product to sustain adoption and outcomes.", c: "var(--c-red)" },
        ].map((cap, i) => (<div key={i} style={{ background: "#fff", border: "1px solid #E1DFDD", borderRadius: 10, padding: 16, textAlign: "center", borderTop: `3px solid ${cap.c}` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{cap.icon}</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#201F1E", marginBottom: 6, lineHeight: 1.3 }}>{cap.t}</div>
          <div style={{ fontSize: 10.5, color: "#605E5C", lineHeight: 1.5 }}>{cap.d}</div>
        </div>))}
      </div>

      <div className="card">
        <SectionTitle icon="rocket" color="var(--c-red)">Investment Posture for Agentic AI</SectionTitle>
        <div style={secSub}>Gartner 1Q25, n=3,412, Distribution of enterprise AI investment strategies</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { l: "High Investment", v: "19%", c: "var(--c-green)", bg: "#F1FAF1" },
            { l: "Conservative", v: "42%", c: "var(--c-yellow-700)", bg: "#FFFBF0" },
            { l: "Wait and See", v: "20%", c: "#605E5C", bg: "#FAF9F8" },
            { l: "No Investment / Unsure", v: "19%", c: "var(--c-red)", bg: "#FDF3F4" },
          ].map(r => (<div key={r.l} style={{ background: r.bg, borderRadius: 8, padding: 14, textAlign: "center", border: `1px solid ${r.c}30` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: r.c }}>{r.v}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: r.c }}>{r.l}</div>
          </div>))}
        </div>
        <div className="note info" style={{ marginTop: 12 }}>61% of enterprises are actively investing in agentic AI. The opportunity window for competitive differentiation is NOW, before it becomes table stakes.</div>
      </div>

      <GartnerCallout type="gartner" title="Critical Insight from Gartner" body="Misapplication is leading to stalling agentic AI projects from POCs to production. Target use cases where agentic AI could be most valuable and feasible by applying composite AI to customer pain points. Evaluate use-case feasibility by incorporating decision considerations for agentic AI. (G00825224)" />
    </>)}
  </div>);
}


/* ══════════ TAB 4: AGENT ADVISOR ══════════ */
/* ── AGENT ADVISOR DATA, loaded from external JSON DB ── */
/* Edit agent_advisor_data.js to add/modify persona configs without touching this HTML */
const AD = window.AGENT_DATA || {};

/* Architecture pattern scoring */
function getArchPattern(cfg) {
  if (!cfg) return { type: 'Single Agent', score: 3, color: 'var(--c-green)', reason: 'Simple task automation with minimal orchestration needs' };
  const n = cfg.ag.length;
  const hasHandoff = cfg.ag.some(a => a.h && a.h !== 0);
  const nMcps = cfg.mc.length;
  if (n >= 4 && hasHandoff && nMcps >= 4) return { type: 'Orchestration', score: Math.min(14, n * 2 + nMcps), color: '#5C2D91', reason: 'Complex multi-step workflows requiring coordination between specialized agents with external system integrations' };
  if (n >= 3 || hasHandoff) return { type: 'Multi-Agent Pipeline', score: Math.min(14, n * 2 + nMcps - 2), color: 'var(--c-blue)', reason: 'Sequential processing chain where each agent handles a specialized task and hands off to the next' };
  return { type: 'Single Agent', score: Math.min(14, n + nMcps), color: 'var(--c-green)', reason: 'Focused automation with direct tool access, minimal coordination overhead' };
}

function AgentAdvisor() {
  const [persona, setPersona] = useState("desenvolvedor");
  const [subTab, setSubTab] = useState(0);
  const W = { maxWidth: 1140, margin: '0 auto' };
  const secH = { fontSize: 14, fontWeight: 700, color: '#201F1E', marginBottom: 4 };
  const secSub = { fontSize: 11.5, color: '#605E5C', marginBottom: 14, lineHeight: 1.5 };

  const p = PERSONAS.find(x => x.id === persona) || PERSONAS[4];
  const cfg = AD[persona] || AD['desenvolvedor'] || { ag: [], mc: [], sk: [], wf: [], ca: [], ba: [] };
  const arch = getArchPattern(cfg);
  const avgTimeSave = cfg.ca && cfg.ca.length > 0 ? Math.round(cfg.ca.reduce((s, c) => s + c.p, 0) / cfg.ca.length) : 0;
  const totalAgents = cfg.ag ? cfg.ag.length : 0;
  const totalMcps = cfg.mc ? cfg.mc.length : 0;
  const totalSkills = cfg.sk ? cfg.sk.length : 0;
  const totalSteps = cfg.wf ? cfg.wf.length : 0;
  const typeMap = { Gen: 'Generation', Aut: 'Automation', Exp: 'Exploration', Val: 'Validation', Sug: 'Suggestion' };
  const impactMap = { H: 'High', M: 'Medium', L: 'Low' };
  const typeColors = { Gen: 'var(--c-green)', Aut: 'var(--c-blue)', Exp: '#5C2D91', Val: 'var(--c-red)', Sug: 'var(--c-yellow-700)' };

  return (<div style={W}>

    {/* Persona Selector */}
    <div className="card">
      <SectionTitle icon="bot" color="var(--c-blue)">Select Persona, Agent Architecture for 24 SDLC Profiles</SectionTitle>
      <div style={secSub}>Each persona has a fully designed agent architecture: custom agents with handoff chains, MCP server integrations, skills, workflow pipelines, and before/after capability analysis</div>
      <div className="persona-grid" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
        {PERSONAS.map(pr => (<button key={pr.id} className={`persona-btn ${persona === pr.id ? "on" : ""}`} onClick={() => setPersona(pr.id)} style={{ borderColor: persona === pr.id ? pr.color : '#E1DFDD' }}>
          <span className="persona-icon" style={{ color: pr.color }}><Icon name={PERSONA_ICONS[pr.id] || "user"} size={18} /></span>
          <span className="persona-name">{pr.name}</span>
          <span className="persona-wave">Wave {pr.wave}</span>
        </button>))}
      </div>
    </div>

    {/* Architecture Hero Band */}
    <div style={{ background: 'var(--bg-card)', borderLeft: `4px solid ${arch.color}`, color: 'var(--text-primary)', borderRadius: 10, padding: '22px 28px', marginBottom: 18, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)', marginBottom: 6 }}>Recommended Architecture</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'var(--bg-page)', borderRadius: 100, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>{arch.type}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>scores {arch.score}/14 on multi-agent criteria</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 500 }}>{arch.reason}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[{ l: 'Custom Agents', v: totalAgents, c: '#9FD99F' }, { l: 'MCP Servers', v: totalMcps, c: '#FFD875' }, { l: 'Skills', v: totalSkills, c: '#D4C5F0' }, { l: 'Workflow Steps', v: totalSteps, c: '#C7E0F4' }].map(k => (
            <div key={k.l} style={{ padding: '8px 18px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,.1)', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.c }}>{k.v}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-secondary)', letterSpacing: '.3px' }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Sub-tab navigation */}
    <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
      {['Agents & Pipeline', 'MCP Servers & Skills', 'Capabilities & Impact', ' Implementation'].map((t, i) => (
        <button key={i} className={`sub-tab ${subTab === i ? 'on' : ''}`} onClick={() => setSubTab(i)}>{t}</button>
      ))}
    </div>

    {/* SUB-TAB 0: Agents & Pipeline */}
    {subTab === 0 && <div className="two-col">
      <div>
        <div className="card">
          <SectionTitle icon="link" color="var(--c-green)">Custom Agents, Handoff Chain</SectionTitle>
          <div style={secSub}>Each agent specializes in one task and passes context to the next in the pipeline</div>
          {cfg.ag.map((a, i) => (<div key={i} style={{ padding: '14px 0', borderBottom: i < cfg.ag.length - 1 ? '1px solid #F3F2F1' : 'none' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: arch.color, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#201F1E', fontFamily: "'Cascadia Code',monospace" }}>{a.n}</span>
                  {a.h && a.h !== 0 && <span style={{ fontSize: 9.5, color: '#8A8886', background: '#F3F2F1', borderRadius: 100, padding: '2px 8px' }}>→ {a.h}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: '#605E5C', lineHeight: 1.5, marginBottom: 8 }}>{a.d}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {a.t.map((tool, ti) => (<span key={ti} style={{ fontSize: 10, color: 'var(--c-blue)', background: '#EFF6FC', border: '1px solid #C7E0F4', borderRadius: 4, padding: '2px 7px', fontFamily: 'monospace' }}>{tool}</span>))}
                </div>
                <div style={{ fontSize: 10, color: '#B0ADAB', marginTop: 4, fontFamily: 'monospace' }}>→ .github/agents/{a.n.replace('@', '')}.agent.md</div>
              </div>
            </div>
          </div>))}
        </div>
      </div>
      <div>
        <div className="card">
          <SectionTitle icon="refresh" color="var(--c-yellow-700)">{`Workflow Pipeline, ${totalSteps} Steps`}</SectionTitle>
          <div style={secSub}>End-to-end workflow showing where agents intercept and augment the process</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {cfg.wf.map((step, i) => {
              const isAgent = step.includes('@');
              return (<div key={i}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: isAgent ? arch.color : '#F3F2F1', color: isAgent ? '#fff' : '#605E5C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, border: isAgent ? 'none' : '1.5px solid #E1DFDD' }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: isAgent ? '#201F1E' : '#605E5C', fontWeight: isAgent ? 600 : 400, lineHeight: 1.4 }}>{step}</div>
                </div>
                {i < cfg.wf.length - 1 && <div style={{ marginLeft: 12, borderLeft: '2px solid #E1DFDD', height: 8 }} />}
              </div>);
            })}
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="layers" color="var(--c-blue)">Customization Hierarchy (5 Levels)</SectionTitle>
          <div style={secSub}>GitHub Copilot's layered customization system, from global to persona-specific</div>
          {[
            { n: 1, t: 'System Instructions', d: '.github/copilot-instructions.md', c: '#E1DFDD', cc: '#605E5C' },
            { n: 2, t: 'Repository Instructions', d: '.instructions.md per folder', c: '#C7E0F4', cc: 'var(--c-blue)' },
            { n: 3, t: 'Custom Agents', d: `.github/agents/, ${totalAgents} agents defined`, c: '#9FD99F', cc: 'var(--c-green)' },
            { n: 4, t: 'MCP Servers', d: `${totalMcps} external tool connections`, c: '#FFD875', cc: '#7A5700' },
            { n: 5, t: 'Skills', d: `.github/skills/, ${totalSkills} skills defined`, c: '#D4C5F0', cc: '#5C2D91' },
          ].map(l => (<div key={l.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F3F2F1' }}>
            <div style={{ width: 26, height: 26, borderRadius: 4, background: l.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: l.cc, flexShrink: 0 }}>L{l.n}</div>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: '#201F1E' }}>{l.t}</div><div style={{ fontSize: 10, color: '#8A8886', fontFamily: 'monospace' }}>{l.d}</div></div>
          </div>))}
        </div>
      </div>
    </div>}

    {/* SUB-TAB 1: MCP Servers & Skills */}
    {subTab === 1 && <div className="two-col">
      <div>
        <div className="card">
          <SectionTitle icon="plug" color="var(--c-yellow-700)">MCP Servers, External Integrations</SectionTitle>
          <div style={secSub}>{totalMcps} Model Context Protocol servers providing tool access to enterprise systems</div>
          {cfg.mc.map((m, i) => (<div key={i} style={{ padding: '12px 0', borderBottom: i < cfg.mc.length - 1 ? '1px solid #F3F2F1' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#F1FAF1', color: 'var(--c-green)', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', border: '1px solid #9FD99F' }}>{m.n}</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#323130', lineHeight: 1.5, marginBottom: 4 }}>{m.d}</div>
            <div style={{ fontSize: 10.5, color: '#8A8886', fontStyle: 'italic' }}>→ {m.f}</div>
          </div>))}
        </div>
      </div>
      <div>
        <div className="card">
          <SectionTitle icon="bookOpen" color="var(--c-green)">Skills, Prompt Templates & Knowledge</SectionTitle>
          <div style={secSub}>{totalSkills} reusable skill files under .github/skills/, define agent behavior and boundaries</div>
          {cfg.sk.map((s, i) => (<div key={i} style={{ padding: '12px 0', borderBottom: i < cfg.sk.length - 1 ? '1px solid #F3F2F1' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ background: '#F5F0FF', color: '#5C2D91', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, border: '1px solid #D4C5F0' }}>{s.n}</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#8A8886', fontFamily: 'monospace', marginBottom: 4 }}>{s.p}</div>
            <div style={{ fontSize: 11.5, color: '#605E5C', lineHeight: 1.5 }}>{s.d}</div>
          </div>))}
        </div>
        <GartnerCallout type="gartner" title="Gartner: Productize Levels of Autonomy" body="Expose clear autonomy tiers so customers can safely progress from assistive AI to full automation as trust builds. MCP servers provide the external tool access layer while Skills control the templates and knowledge boundaries." />
      </div>
    </div>}

    {/* SUB-TAB 2: Capabilities & Impact */}
    {subTab === 2 && <>
      <div className="hero-band" style={{ marginBottom: 18 }}>
        <div className="hb-top">
          <span className="hb-title">{p.name}, AI Capability Impact Analysis</span>
          <span className="r-badge" style={{ background: avgTimeSave >= 85 ? '#DFF6DD' : avgTimeSave >= 70 ? '#EFF6FC' : '#FFFBF0', color: avgTimeSave >= 85 ? 'var(--c-green)' : avgTimeSave >= 70 ? 'var(--c-blue)' : '#7A5700' }}>{avgTimeSave}% avg automation</span>
        </div>
        <div className="hb-inner">
          <div className="hb-cell"><div className="hb-lbl">Capabilities</div><div className="hb-val">{cfg.ca.length}</div><div className="hb-sub">AI-augmented</div></div>
          <div className="hb-cell"><div className="hb-lbl">High Impact</div><div className="hb-val">{cfg.ca.filter(c => c.i === 'H').length}</div><div className="hb-sub">critical improvements</div></div>
          <div className="hb-cell"><div className="hb-lbl">Avg Automation</div><div className="hb-val">{avgTimeSave}<span className="u">%</span></div><div className="hb-sub">time/effort reduction</div></div>
          <div className="hb-cell"><div className="hb-lbl">Evidence Sources</div><div className="hb-val">{cfg.ba.length}</div><div className="hb-sub">industry benchmarks</div></div>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="grid" color="var(--c-blue)">Capabilities Matrix</SectionTitle>
        <div style={secSub}>All AI-augmented capabilities for this persona, type, impact level, and time savings</div>
        <table className="tbl">
          <thead><tr><th>Capability</th><th>Type</th><th>Impact</th><th>Time Savings</th><th style={{ textAlign: 'right' }}>Automation %</th></tr></thead>
          <tbody>
            {cfg.ca.map((c, i) => (<tr key={i}>
              <td style={{ fontWeight: 600 }}>{c.n}</td>
              <td><span style={{ fontSize: 10, fontWeight: 700, color: typeColors[c.y] || '#605E5C', background: (typeColors[c.y] || '#605E5C') + '15', padding: '2px 8px', borderRadius: 100 }}>{typeMap[c.y] || c.y}</span></td>
              <td><span style={{ fontSize: 10, fontWeight: 700, color: c.i === 'H' ? 'var(--c-red)' : '#7A5700' }}>{impactMap[c.i] || c.i}</span></td>
              <td style={{ fontSize: 11, color: '#323130', fontFamily: 'monospace' }}>{c.t}</td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <div style={{ width: 60, height: 6, background: '#F3F2F1', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: `${c.p}%`, height: '100%', background: c.p >= 90 ? 'var(--c-green)' : c.p >= 75 ? 'var(--c-blue)' : 'var(--c-yellow-700)', borderRadius: 3 }} /></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.p >= 90 ? 'var(--c-green)' : c.p >= 75 ? 'var(--c-blue)' : 'var(--c-yellow-700)', minWidth: 30 }}>{c.p}%</span>
                </div>
              </td>
            </tr>))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <SectionTitle icon="refresh" color="var(--c-blue)">Before / After Analysis, Evidence-Based</SectionTitle>
        <div style={secSub}>Quantified impact of AI augmentation with industry source citations</div>
        <table className="tbl">
          <thead><tr><th>Function</th><th>Before (Manual)</th><th>After (AI-Augmented)</th><th style={{ textAlign: 'right' }}>Improvement</th><th>Source</th></tr></thead>
          <tbody>
            {cfg.ba.map((b, i) => (<tr key={i}>
              <td style={{ fontWeight: 600 }}>{b.f}</td>
              <td style={{ color: 'var(--c-red)', fontSize: 11 }}>{b.b}</td>
              <td style={{ color: 'var(--c-green)', fontSize: 11 }}>{b.a}</td>
              <td style={{ textAlign: 'right' }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-green)', background: '#DFF6DD', padding: '2px 8px', borderRadius: 100 }}>↑ {b.p}%</span></td>
              <td style={{ fontSize: 10, color: '#8A8886' }}>{b.s}</td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </>}

    {/* SUB-TAB 3: Implementation */}
    {subTab === 3 && <>
      <div className="card">
        <SectionTitle icon="map" color="var(--c-green)">{`Implementation Roadmap, ${p.name}`}</SectionTitle>
        <div style={secSub}>3-phase rollout plan: Foundation → Agent Setup → Production (6 weeks total)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { phase: 'Phase 1: Foundation', time: 'Week 1-2', color: 'var(--c-green)', steps: ['Configure API credentials and authentication', 'Set up .github/copilot-instructions.md with team context', 'Install and configure MCP servers: ' + cfg.mc.slice(0, 2).map(m => m.n).join(', '), 'Validate connectivity to all external systems'] },
            { phase: 'Phase 2: Agent Setup', time: 'Week 3-4', color: 'var(--c-blue)', steps: ['Create agent files: ' + cfg.ag.slice(0, 2).map(a => a.n).join(', '), 'Design prompt templates for each skill', 'Configure handoff chains between agents', 'Test with representative real-world scenarios'] },
            { phase: 'Phase 3: Production', time: 'Week 5-6', color: '#5C2D91', steps: ['Deploy remaining agents: ' + cfg.ag.slice(2).map(a => a.n).join(', '), 'Set up monitoring and feedback loops', 'Train team on new workflows', 'Schedule model reviews and optimization cycles'] }
          ].map(ph => (<div key={ph.phase} style={{ background: '#fff', border: '1px solid #E1DFDD', borderRadius: 10, padding: '16px', borderTop: `3px solid ${ph.color}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ph.color, marginBottom: 2 }}>{ph.phase}</div>
            <div style={{ fontSize: 10, color: '#8A8886', marginBottom: 10 }}>{ph.time}</div>
            {ph.steps.map((s, i) => (<div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${ph.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: ph.color, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 11, color: '#323130', lineHeight: 1.4 }}>{s}</div>
            </div>))}
          </div>))}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <SectionTitle icon="fileText" color="var(--text-muted)">File Structure</SectionTitle>
          <div style={secSub}>Repository layout for this persona's agent configuration</div>
          <div className="term">
            <div className="term-hdr"><div className="term-dots"><div className="term-dot" style={{ background: '#FF5F56' }} /><div className="term-dot" style={{ background: '#FFBD2E' }} /><div className="term-dot" style={{ background: '#27C93F' }} /></div><span className="term-title">repository structure</span></div>
            <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              <span className="acc">.github/</span>{'\n'}
              <span className="dim">├──</span> <span className="grn">copilot-instructions.md</span>  <span className="dim"># L1: System</span>{'\n'}
              <span className="dim">├──</span> <span className="acc">agents/</span>{'\n'}
              {cfg.ag.map((a, i) => <React.Fragment key={i}><span className="dim">│   {i < cfg.ag.length - 1 ? '├──' : '└──'}</span> <span className="yel">{a.n.replace('@', '')}.agent.md</span>{'\n'}</React.Fragment>)}
              <span className="dim">└──</span> <span className="acc">skills/</span>{'\n'}
              {cfg.sk.map((s, i) => <React.Fragment key={i}><span className="dim">    {i < cfg.sk.length - 1 ? '├──' : '└──'}</span> <span className="wht">{s.n}/</span><span className="grn">SKILL.md</span>{'\n'}</React.Fragment>)}
            </pre>
          </div>
        </div>
        <div>
          <div className="card">
            <div style={secH}>Cost Estimation, Year 1</div>
            <div style={secSub}>Investment breakdown per person for this persona's agent setup</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { l: 'Agent Licenses', v: $c(p.agentCost) + '/yr', c: 'var(--c-blue)' },
                { l: 'Implementation', v: $c(p.implCost) + ' one-time', c: 'var(--c-green)' },
                { l: 'Training', v: $c(p.trainCost) + ' one-time', c: 'var(--c-yellow-700)' },
                { l: 'Total Year 1', v: $c(p.agentCost + p.implCost + p.trainCost), c: '#5C2D91' }
              ].map(x => (<div key={x.l} style={{ background: '#FAF9F8', borderRadius: 6, padding: '10px 12px', textAlign: 'center', border: '1px solid #F3F2F1' }}>
                <div style={{ fontSize: 10, color: '#8A8886', marginBottom: 4 }}>{x.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: x.c }}>{x.v}</div>
              </div>))}
            </div>
          </div>

          <GartnerCallout type="warning" title="Gartner: 'Time Saved is Not Money Saved'" body={`For ${p.name}, ensure the ${avgTimeSave}% average automation translates into measurable outcomes, not just productivity leakage. Map each capability to an Outcome-Driven Metric (ODM) above the business line.`} />
        </div>
      </div>
    </>}
  </div>);
}


/* ══════════ TAB 5: ARCHITECTURE ADVISOR ══════════ */
function ArchitectureAdvisor() {
  const [mode, setMode] = React.useState('presets');
  const [inputType, setInputType] = React.useState(null);
  const [selCategory, setSelCategory] = React.useState('Document Processing');
  const [selPreset, setSelPreset] = React.useState(null);
  // Framework
  const [complexity, setComplexity] = React.useState(null);
  const [volNum, setVolNum] = React.useState(100);
  const [volFreq, setVolFreq] = React.useState('day');
  const [stakes, setStakes] = React.useState(null);
  const [accuracy, setAccuracy] = React.useState(null);
  // Task chars
  const [taskChars, setTaskChars] = React.useState([]);
  // Architecture
  const [wfSteps, setWfSteps] = React.useState(2);
  const [depSteps, setDepSteps] = React.useState(false);
  const [parSteps, setParSteps] = React.useState(false);
  const [humanLoop, setHumanLoop] = React.useState(false);
  const [inFmt, setInFmt] = React.useState('Plain Text');
  const [outFmt, setOutFmt] = React.useState('Plain Text');
  const [docSize, setDocSize] = React.useState(50);
  const [extTools, setExtTools] = React.useState(0);
  // Budget
  const [budget, setBudget] = React.useState('No constraint');
  const [latency, setLatency] = React.useState('Near real-time (<30s)');
  const [provPref, setProvPref] = React.useState('Any Provider');

  const AD = window.ADVISOR_DATA || { MODELS: [], PRESETS: [] };
  const MODELS = AD.MODELS || [];
  const PRESETS = AD.PRESETS || [];
  const CATS = [...new Set(PRESETS.map(p => p.category))];

  const INPUT_TYPES = [
    { id: 'docs', label: 'Documents', sub: 'PDFs, images, scans, contracts, invoices' },
    { id: 'email', label: 'Emails & Messages', sub: 'Inbound emails, tickets, Slack, chat' },
    { id: 'data', label: 'Structured Data', sub: 'APIs, JSON, CSV, databases, spreadsheets' },
    { id: 'code', label: 'Code & Technical', sub: 'Source code, PRs, configs, logs, docs' },
    { id: 'conv', label: 'Conversations', sub: 'Live chat, phone transcripts, support threads' },
    { id: 'mixed', label: 'Mixed / Multiple', sub: 'Documents + emails, multi-channel, end-to-end' },
  ];

  const COMPLEXITY = [
    { v: 0, l: 'Low', sub: 'Pattern matching, simple extraction' },
    { v: 1, l: 'Medium', sub: 'Judgment, context awareness' },
    { v: 2, l: 'High', sub: 'Analysis, reasoning, nuance' },
    { v: 3, l: 'Very High', sub: 'Multi-step logic, math, chains' },
  ];
  const STAKES = [
    { v: 0, l: 'Low', sub: 'Low cost of errors, easy to fix' },
    { v: 1, l: 'Medium', sub: 'Moderate impact, some rework' },
    { v: 2, l: 'High', sub: 'Significant impact, customer-facing' },
    { v: 3, l: 'Critical', sub: 'Regulatory, financial, legal exposure' },
  ];
  const ACCURACY = [
    { v: 0, l: 'Best Effort', sub: 'Good enough, speed matters' },
    { v: 1, l: 'High', sub: 'Reliable, occasional errors OK' },
    { v: 2, l: 'Near Perfect', sub: 'Very few errors, verify output' },
    { v: 3, l: 'Guaranteed', sub: 'Zero tolerance, must be correct' },
  ];
  const TASK_CHARS = [
    { id: 'classify', l: 'Text Classification', sub: 'Route, label, categorize inputs', prov: 'Claude' },
    { id: 'extract', l: 'Data Extraction', sub: 'Pull structured fields from unstructured text', prov: 'Claude' },
    { id: 'summarize', l: 'Document Summarization', sub: 'Condense long documents into key points', prov: 'Claude' },
    { id: 'generate', l: 'Content Generation', sub: 'Write emails, reports, structured responses', prov: 'Claude' },
    { id: 'code', l: 'Code Generation', sub: 'Write, review, or transform code', prov: 'OpenAI' },
    { id: 'reason', l: 'Reasoning & Analysis', sub: 'Complex inference, multi-step deduction', prov: 'OpenAI' },
    { id: 'logic', l: 'Multi-Step Logic', sub: 'Chained decisions, conditional flows', prov: 'OpenAI' },
    { id: 'vision', l: 'Image / Multimodal', sub: 'Analyze images, screenshots, diagrams', prov: 'OpenAI' },
    { id: 'struct', l: 'Structured Output', sub: 'JSON, tables, rigid schema outputs', prov: 'OpenAI' },
    { id: 'conv', l: 'Conversational', sub: 'Back-and-forth dialogue, follow-up handling', prov: 'Claude' },
  ];
  const IN_FMTS = ['Plain Text', 'JSON', 'PDF / Documents', 'Images', 'Mixed'];
  const OUT_FMTS = ['Plain Text', 'JSON / Structured', 'Email / Letter', 'Report / Document', 'Code'];
  const BUDGETS = ['Under $100/mo', '$100-$500/mo', '$500-$2K/mo', '$2K-$10K/mo', '$10K+/mo', 'No constraint'];
  const LATENCIES = ['Real-time (<2s)', 'Near real-time (<30s)', 'Batch (Minutes+)'];
  const PROVS = ['Any Provider', 'Prefer Claude', 'Prefer OpenAI'];

  // Monthly volume calc
  const monthlyVol = React.useMemo(() => {
    const m = { day: 30, week: 4.33, month: 1 };
    return Math.round(volNum * (m[volFreq] || 1));
  }, [volNum, volFreq]);

  // Architecture scoring (0-14)
  const archScore = React.useMemo(() => {
    let s = 0;
    const criteria = [];
    if (wfSteps >= 3) { s += 2; criteria.push({ t: '3+ distinct workflow steps', score: 2, met: true }); }
    else criteria.push({ t: '3+ distinct workflow steps', score: 2, met: false });
    if (wfSteps >= 6) { s += 1; criteria.push({ t: '6+ step workflow depth', score: 1, met: true }); }
    else criteria.push({ t: '6+ step workflow depth', score: 1, met: false });
    if (depSteps) { s += 1; criteria.push({ t: 'Step-to-step dependencies', score: 1, met: true }); }
    else criteria.push({ t: 'Step-to-step dependencies', score: 1, met: false });
    if (humanLoop) { s += 1; criteria.push({ t: 'Human-in-the-loop review', score: 1, met: true }); }
    else criteria.push({ t: 'Human-in-the-loop review', score: 1, met: false });
    if (extTools >= 3) { s += 2; criteria.push({ t: '3+ external tools / APIs', score: 2, met: true }); }
    else criteria.push({ t: '3+ external tools / APIs', score: 2, met: false });
    if (complexity !== null && complexity >= 2) { s += 2; criteria.push({ t: 'High complexity reasoning', score: 2, met: true }); }
    else criteria.push({ t: 'High complexity reasoning', score: 2, met: false });
    if (complexity === 3) { s += 1; criteria.push({ t: 'Very high reasoning chain', score: 1, met: true }); }
    else criteria.push({ t: 'Very high reasoning chain', score: 1, met: false });
    if (stakes !== null && stakes >= 2) { s += 1; criteria.push({ t: 'High/critical stakes', score: 1, met: true }); }
    else criteria.push({ t: 'High/critical stakes', score: 1, met: false });
    if (stakes === 3) { s += 1; criteria.push({ t: 'Critical stakes, verification required', score: 1, met: true }); }
    else criteria.push({ t: 'Critical stakes, verification required', score: 1, met: false });
    if (accuracy !== null && accuracy >= 2) { s += 1; criteria.push({ t: 'Near-perfect accuracy required', score: 1, met: true }); }
    else criteria.push({ t: 'Near-perfect accuracy required', score: 1, met: false });
    if (accuracy === 3) { s += 1; criteria.push({ t: 'Guaranteed accuracy, multi-check', score: 1, met: true }); }
    else criteria.push({ t: 'Guaranteed accuracy, multi-check', score: 1, met: false });
    if (taskChars.length >= 4) { s += 1; criteria.push({ t: 'Diverse task capability mix (4+)', score: 1, met: true }); }
    else criteria.push({ t: 'Diverse task capability mix (4+)', score: 1, met: false });
    return { score: s, max: 14, isMulti: s >= 6, criteria };
  }, [wfSteps, depSteps, humanLoop, extTools, complexity, stakes, accuracy, taskChars]);

  // Model selection
  const getModel = React.useCallback((role, prefer) => {
    const tier = complexity === null ? 'mid' :
      complexity === 0 ? 'economy' :
        complexity === 1 ? 'mid' : 'premium'; // High (2) and Very High (3) both route to premium
    const isHighStakes = (stakes !== null && stakes >= 2) || (accuracy !== null && accuracy >= 2);
    const effectiveTier = role === 'parser' ? 'economy' :
      role === 'qc' ? (isHighStakes ? 'premium' : 'mid') :
        role === 'formatter' ? 'mid' : tier;
    const pref = prefer || provPref;

    const TIER_ORDER = ['economy', 'mid', 'premium'];
    const blended = (m) => (m.costInput || 0) + (m.costOutput || 0);
    // Sort a pool so GA models come first, then the most cost-effective (cheapest blended) first.
    const gaFirstCheapest = (arr) => arr.slice().sort((a, b) =>
      ((a.status === 'GA' ? 0 : 1) - (b.status === 'GA' ? 0 : 1)) || (blended(a) - blended(b)));
    const inTier = (t) => MODELS.filter(m => m.tier === t);
    // Never return an empty pool: fall back to the nearest non-empty tier.
    const tierWithFallback = (t) => {
      if (inTier(t).length) return inTier(t);
      const i = TIER_ORDER.indexOf(t);
      for (let dd = 1; dd < TIER_ORDER.length; dd++) {
        const hi = TIER_ORDER[i + dd], lo = TIER_ORDER[i - dd];
        if (hi && inTier(hi).length) return inTier(hi);
        if (lo && inTier(lo).length) return inTier(lo);
      }
      return MODELS.slice();
    };

    let pool;
    if (pref === 'Prefer Claude' || pref === 'Prefer OpenAI') {
      const main = pref === 'Prefer Claude' ? 'Anthropic' : 'OpenAI';
      const tierPool = tierWithFallback(effectiveTier);
      pool = [
        ...gaFirstCheapest(tierPool.filter(m => m.provider === main)),
        ...gaFirstCheapest(tierPool.filter(m => m.provider !== main)),
      ];
    } else {
      // Any Provider: weigh every provider (Anthropic, OpenAI, Google, GitHub, Microsoft)
      // and pick the most cost-effective GA model in the tier.
      pool = gaFirstCheapest(tierWithFallback(effectiveTier));
    }
    // QC: verify with a model from a DIFFERENT provider than the core model (cross-provider check)
    if (role === 'qc') {
      const coreModel = getModel('core', provPref);
      const coreProv = coreModel ? coreModel.provider : null;
      const qcTier = isHighStakes ? 'premium' : 'mid';
      const crossProvider = gaFirstCheapest(
        MODELS.filter(m => m.provider !== coreProv && (m.tier === 'mid' || m.tier === 'premium')));
      const sameTier = crossProvider.filter(m => m.tier === qcTier);
      pool = sameTier.length ? sameTier : (crossProvider.length ? crossProvider : gaFirstCheapest(tierWithFallback(qcTier)));
    }
    return pool[0] || MODELS[0];
  }, [complexity, stakes, accuracy, provPref, MODELS]);

  // Build pipeline steps
  const steps = React.useMemo(() => {
    const addQC = stakes !== null && stakes >= 2 || accuracy !== null && accuracy >= 2;
    const addFormatter = wfSteps >= 4 || outFmt === 'Report / Document' || outFmt === 'Email / Letter';
    const all = [
      { id: 'parser', label: 'Input Parser', desc: 'Extract and structure data from raw inputs', temp: 0.1, tempNote: 'Precision critical for structured data extraction' },
      { id: 'core', label: 'Core Processor', desc: 'Main analysis and reasoning logic', temp: complexity === null || complexity <= 1 ? 0.2 : 0.3, tempNote: complexity !== null && complexity >= 2 ? 'Analytical reasoning needs balanced creativity' : 'Structured processing with light variability' },
      ...(addQC ? [{ id: 'qc', label: 'Quality Checker', desc: 'Verify accuracy and validate output against requirements', temp: 0.0, tempNote: 'Zero temperature for deterministic quality validation' }] : []),
      ...(addFormatter ? [{ id: 'formatter', label: 'Output Formatter', desc: 'Format and structure the final response', temp: 0.3, tempNote: 'Light variability for natural-sounding output' }] : []),
    ];
    return all.map(s => {
      const primary = getModel(s.id);
      const stepTier = s.id === 'parser' ? 'economy' : s.id === 'formatter' ? 'mid' : (complexity !== null && complexity >= 2 ? 'premium' : 'mid');
      const blended = (m) => (m.costInput || 0) + (m.costOutput || 0);
      const altPool = MODELS
        .filter(m => primary && m.provider !== primary.provider && m.tier === stepTier)
        .sort((a, b) => ((a.status === 'GA' ? 0 : 1) - (b.status === 'GA' ? 0 : 1)) || (blended(a) - blended(b)));
      const alt = altPool[0] || null;
      const costPerExec = primary ? ((500 / 1e6 * primary.costInput) + (200 / 1e6 * primary.costOutput)) : 0;
      return { ...s, primary, alt, costPerExec };
    });
  }, [archScore.isMulti, stakes, accuracy, wfSteps, outFmt, complexity, getModel, MODELS]);

  // Costs
  const costs = React.useMemo(() => {
    const execCost = steps.reduce((s, st) => s + (st.costPerExec || 0), 0);
    const monthly = execCost * monthlyVol;
    const annual = monthly * 12;
    const blended = (m) => (m.costInput || 0) + (m.costOutput || 0);
    // Cheapest economy model (lower anchor) vs most expensive premium model (upper anchor).
    const cheapModel = MODELS.filter(m => m.tier === 'economy').sort((a, b) => blended(a) - blended(b))[0];
    const cheapExec = cheapModel ? ((500 / 1e6 * cheapModel.costInput) + (200 / 1e6 * cheapModel.costOutput)) * steps.length : 0;
    const premModel = MODELS.filter(m => m.tier === 'premium').sort((a, b) => blended(b) - blended(a))[0];
    const premExec = premModel ? ((500 / 1e6 * premModel.costInput) + (200 / 1e6 * premModel.costOutput)) * steps.length : 0;
    return { execCost, monthly, annual, cheapMonthly: cheapExec * monthlyVol, premMonthly: premExec * monthlyVol };
  }, [steps, monthlyVol, MODELS]);

  const toggleChar = (id) => setTaskChars(tc => tc.includes(id) ? tc.filter(x => x !== id) : [...tc, id]);

  const loadPreset = (p) => {
    setSelPreset(p);
    setInputType(p.inputType || null);
    setComplexity(p.complexity);
    setVolNum(p.volume === 'continuous' ? 500 : p.volume);
    setVolFreq(p.volumeUnit === 'continuous' ? 'day' : p.volumeUnit);
    setStakes(p.stakes);
    setAccuracy(p.accuracy);
    setTaskChars(Array.isArray(p.taskChars) ? p.taskChars : []);
    setWfSteps(p.wfSteps || 2);
    setExtTools(p.extTools || 0);
    setInFmt(p.inFmt || 'Plain Text');
    setOutFmt(p.outFmt || 'Plain Text');
  };
  const reset = () => {
    setMode('presets'); setInputType(null); setSelPreset(null);
    setComplexity(null); setVolNum(100); setVolFreq('day');
    setStakes(null); setAccuracy(null); setTaskChars([]);
    setWfSteps(2); setDepSteps(false); setParSteps(false); setHumanLoop(false);
    setInFmt('Plain Text'); setOutFmt('Plain Text'); setDocSize(50); setExtTools(0);
    setBudget('No constraint'); setLatency('Near real-time (<30s)'); setProvPref('Any Provider');
  };

  const fmt$ = (n) => n < 0.01 ? `$${(n * 1000).toFixed(2)}m` : n < 1 ? `$${n.toFixed(4)}` : n < 100 ? `$${n.toFixed(2)}` : `$${Math.round(n).toLocaleString()}`;

  const confidence = (complexity !== null && stakes !== null && accuracy !== null) ? 'high' : (complexity !== null || stakes !== null) ? 'medium' : 'low';
  const confColor = { high: 'var(--c-green)', medium: '#7A5700', low: '#605E5C' };
  const confBg = { high: '#DFF6DD', medium: '#FFFBF0', low: '#FAF9F8' };

  const sectionStyle = { marginBottom: 20 };
  const cardStyle = { background: '#fff', border: '1px solid #E1DFDD', borderRadius: 10, padding: '20px 22px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)' };
  const secH = { fontSize: 14, fontWeight: 700, color: '#201F1E', marginBottom: 4 };
  const secSub = { fontSize: 11.5, color: '#605E5C', marginBottom: 14 };
  const labelSt = { fontSize: 12, fontWeight: 600, color: '#323130', marginBottom: 8, display: 'block' };
  const pill = (active, color = 'var(--c-blue)') => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: `1.5px solid ${active ? color : '#E1DFDD'}`,
    background: active ? color + '15' : '#fff',
    color: active ? color : '#605E5C',
    transition: 'all .15s',
  });
  const optBtn = (active, color = 'var(--c-blue)') => ({
    flex: 1, minWidth: 0, padding: '10px 8px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
    cursor: 'pointer', border: `1.5px solid ${active ? color : '#E1DFDD'}`,
    background: active ? color : '#fff', color: active ? '#fff' : '#323130',
    textAlign: 'center', transition: 'all .15s',
  });
  const provBadge = (p) => ({
    display: 'inline-block', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100,
    background: p === 'Claude' ? 'var(--c-blue)15' : '#10701015',
    color: p === 'Claude' ? 'var(--c-blue)' : 'var(--c-green)',
    border: `1px solid ${p === 'Claude' ? 'var(--c-blue)30' : 'var(--c-green)30'}`,
    marginLeft: 6,
  });

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#201F1E', margin: 0 }}> AI Agent Architecture Advisor</h2>
          <p style={{ fontSize: 12, color: '#605E5C', margin: '4px 0 0' }}>Determine the right architecture and model selection for any AI agent use case</p>
        </div>
        <button onClick={reset} style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid #E1DFDD', background: '#fff', fontSize: 12, fontWeight: 600, color: '#605E5C', cursor: 'pointer' }}>↺ Reset</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>

        {/* ── SECTION 1: USE CASE ── */}
        <div style={cardStyle}>
          <div style={secH}>Use Case</div>
          <div style={secSub}>Discover your use case or browse presets</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setMode('discover')} style={pill(mode === 'discover', 'var(--c-blue)')}>Help Me Discover</button>
            <button onClick={() => setMode('presets')} style={pill(mode === 'presets', 'var(--c-blue)')}>Browse Presets</button>
          </div>

          {mode === 'discover' && (
            <div>
              <label style={labelSt}>What are you receiving or processing?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {INPUT_TYPES.map(it => (
                  <button key={it.id} onClick={() => setInputType(it.id)} style={{
                    padding: '12px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${inputType === it.id ? 'var(--c-blue)' : '#E1DFDD'}`,
                    background: inputType === it.id ? '#EFF6FC' : '#fff',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: inputType === it.id ? 'var(--c-blue)' : '#201F1E' }}>{it.label}</div>
                    <div style={{ fontSize: 10.5, color: '#605E5C', marginTop: 3, lineHeight: 1.4 }}>{it.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'presets' && (
            <div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setSelCategory(c)} style={pill(selCategory === c, 'var(--c-blue)')}>{c}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: 8 }}>
                {PRESETS.filter(p => p.category === selCategory).map((p, i) => (
                  <button key={i} onClick={() => loadPreset(p)} style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${selPreset === p ? 'var(--c-blue)' : '#E1DFDD'}`,
                    background: selPreset === p ? '#EFF6FC' : '#FAFAFA',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selPreset === p ? 'var(--c-blue)' : '#201F1E' }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: '#8A8886', marginTop: 2 }}>
                      {['Low', 'Med', 'High', 'V.High'][p.complexity]} complexity · {['Low', 'Med', 'High', 'Critical'][p.stakes]} stakes
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 2: FRAMEWORK QUESTIONS ── */}
        <div style={cardStyle}>
          <div style={secH}>Framework Questions</div>
          <div style={secSub}>Complexity, volume, and stakes drive the recommendation</div>

          {/* Complexity */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>How much reasoning does this task require?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COMPLEXITY.map(c => (
                <button key={c.v} onClick={() => setComplexity(c.v)} style={{
                  ...optBtn(complexity === c.v, 'var(--c-blue)'), flex: 1, padding: '10px 6px',
                }}>
                  <div style={{ fontWeight: 700 }}>{c.l}</div>
                  <div style={{ fontSize: 9.5, marginTop: 3, opacity: .85, lineHeight: 1.3, fontWeight: 400 }}>{c.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>How often will this run?</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" value={volNum} min={1} onChange={e => setVolNum(Number(e.target.value))}
                style={{ width: 100, padding: '8px 10px', border: '1.5px solid #E1DFDD', borderRadius: 8, fontSize: 13, fontWeight: 600 }} />
              <span style={{ fontSize: 12, color: '#605E5C' }}>per</span>
              <select value={volFreq} onChange={e => setVolFreq(e.target.value)}
                style={{ padding: '8px 10px', border: '1.5px solid #E1DFDD', borderRadius: 8, fontSize: 12, color: '#323130', background: '#fff' }}>
                <option value="day">day</option>
                <option value="week">week</option>
                <option value="month">month</option>
              </select>
              <span style={{ fontSize: 12, color: 'var(--c-blue)', fontWeight: 600, background: '#EFF6FC', padding: '6px 12px', borderRadius: 100 }}>~{monthlyVol.toLocaleString()} executions/month</span>
            </div>
          </div>

          {/* Stakes */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>What's the cost of getting it wrong?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {STAKES.map(s => (
                <button key={s.v} onClick={() => setStakes(s.v)} style={{
                  ...optBtn(stakes === s.v, s.v >= 2 ? 'var(--c-red)' : s.v === 1 ? 'var(--c-yellow-700)' : 'var(--c-green)'), flex: 1, padding: '10px 6px',
                }}>
                  <div style={{ fontWeight: 700 }}>{s.l}</div>
                  <div style={{ fontSize: 9.5, marginTop: 3, opacity: .85, lineHeight: 1.3, fontWeight: 400 }}>{s.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accuracy */}
          <div>
            <label style={labelSt}>How accurate does the response need to be? <span style={{ fontWeight: 400, color: '#8A8886' }}>Higher accuracy favors breaking work into focused sub-tasks</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ACCURACY.map(a => (
                <button key={a.v} onClick={() => setAccuracy(a.v)} style={{
                  ...optBtn(accuracy === a.v, '#5C2D91'), flex: 1, padding: '10px 6px',
                }}>
                  <div style={{ fontWeight: 700 }}>{a.l}</div>
                  <div style={{ fontSize: 9.5, marginTop: 3, opacity: .85, lineHeight: 1.3, fontWeight: 400 }}>{a.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 3: TASK CHARACTERISTICS ── */}
        <div style={cardStyle}>
          <div style={secH}>Task Characteristics</div>
          <div style={secSub}>What does the agent need to do? Select all that apply.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {TASK_CHARS.map(tc => {
              const active = taskChars.includes(tc.id);
              return (
                <button key={tc.id} onClick={() => toggleChar(tc.id)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  border: `1.5px solid ${active ? 'var(--c-blue)' : '#E1DFDD'}`,
                  background: active ? '#EFF6FC' : '#FAFAFA',
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${active ? 'var(--c-blue)' : '#C8C6C4'}`, background: active ? 'var(--c-blue)' : '#fff', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {active && <span style={{ color: 'var(--text-primary)', fontSize: 10, fontWeight: 700 }}></span>}
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--c-blue)' : '#201F1E' }}>{tc.l}</span>
                    <span style={provBadge(tc.prov)}>{tc.prov}</span>
                    <div style={{ fontSize: 10.5, color: '#8A8886', marginTop: 2 }}>{tc.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 4: ARCHITECTURE ── */}
        <div style={cardStyle}>
          <div style={secH}>Architecture</div>
          <div style={secSub}>Workflow shape, dependencies, and format requirements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelSt}>Workflow Steps</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="range" min={1} max={10} value={wfSteps} onChange={e => setWfSteps(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--c-blue)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-blue)', minWidth: 90 }}>
                  {wfSteps} {wfSteps === 1 ? 'step' : 'distinct steps'}
                </span>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelSt}>Dependencies</label>
                {[
                  { k: 'dep', v: depSteps, s: setDepSteps, l: 'Steps depend on each other' },
                  { k: 'par', v: parSteps, s: setParSteps, l: 'Some steps can run in parallel' },
                  { k: 'hil', v: humanLoop, s: setHumanLoop, l: 'Human-in-the-loop review needed' },
                ].map(cb => (
                  <label key={cb.k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={cb.v} onChange={e => cb.s(e.target.checked)}
                      style={{ width: 15, height: 15, accentColor: 'var(--c-blue)' }} />
                    <span style={{ fontSize: 12, color: '#323130' }}>{cb.l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={labelSt}>Input Format</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                {IN_FMTS.map(f => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={inFmt === f} onChange={() => setInFmt(f)} style={{ accentColor: 'var(--c-blue)' }} />
                    <span style={{ fontSize: 12, color: '#323130' }}>{f}</span>
                  </label>
                ))}
              </div>
              <label style={labelSt}>Output Format</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {OUT_FMTS.map(f => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={outFmt === f} onChange={() => setOutFmt(f)} style={{ accentColor: 'var(--c-blue)' }} />
                    <span style={{ fontSize: 12, color: '#323130' }}>{f}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <label style={labelSt}>Avg Document Size per task</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="range" min={1} max={1000} value={docSize} onChange={e => setDocSize(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--c-blue)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-blue)', minWidth: 60 }}>{docSize < 1000 ? docSize + ' KB' : '1 MB+'}</span>
              </div>
              <div style={{ fontSize: 10, color: '#8A8886', marginTop: 4 }}>Larger documents increase token usage and cost</div>
            </div>
            <div>
              <label style={labelSt}>External Tools (APIs, databases, etc.)</label>
              <input type="number" min={0} max={20} value={extTools} onChange={e => setExtTools(Number(e.target.value))}
                style={{ width: 80, padding: '8px 10px', border: '1.5px solid #E1DFDD', borderRadius: 8, fontSize: 13, fontWeight: 600 }} />
              <div style={{ fontSize: 10, color: '#8A8886', marginTop: 4 }}>More tools add routing overhead and system prompt tokens</div>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: BUDGET & SCALE ── */}
        <div style={cardStyle}>
          <div style={secH}>Budget & Scale</div>
          <div style={secSub}>Monthly budget, latency, and provider preferences</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelSt}>Monthly AI Budget</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {BUDGETS.map(b => (
                  <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={budget === b} onChange={() => setBudget(b)} style={{ accentColor: 'var(--c-blue)' }} />
                    <span style={{ fontSize: 12, color: '#323130' }}>{b}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={labelSt}>Latency Requirement</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {LATENCIES.map(l => (
                  <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={latency === l} onChange={() => setLatency(l)} style={{ accentColor: 'var(--c-blue)' }} />
                    <span style={{ fontSize: 12, color: '#323130' }}>{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={labelSt}>Provider Preference</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {PROVS.map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={provPref === p} onChange={() => setProvPref(p)} style={{ accentColor: 'var(--c-blue)' }} />
                    <span style={{ fontSize: 12, color: '#323130' }}>{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ RESULTS ══════════════════════════════════════════════════════════ */}

        {/* ── RESULT 1: ARCHITECTURE RECOMMENDATION ── */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderLeft: archScore.isMulti ? '4px solid var(--c-blue)' : '4px solid var(--c-green)', color: 'var(--text-primary)',
          borderRadius: 'var(--radius-md)', padding: '24px 28px', marginBottom: 16, boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: .5 }}>RECOMMENDED ARCHITECTURE</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -.5 }}>{archScore.isMulti ? 'Multi-Agent Pipeline' : 'Single Agent'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Multi-agent criteria score</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{archScore.score}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/{archScore.max}</span></div>
              <span style={{ display: 'inline-block', background: confBg[confidence], color: confColor[confidence], borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                {confidence} confidence
              </span>
            </div>
          </div>

          {/* Criteria */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 18 }}>
            {archScore.criteria.map((c, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.1)', borderRadius: 6, padding: '6px 10px',
                display: 'flex', alignItems: 'center', gap: 6,
                border: c.met ? '1px solid rgba(255,255,255,.3)' : '1px solid rgba(255,255,255,.1)',
              }}>
                <span style={{ fontSize: 11, opacity: c.met ? 1 : .5 }}>{c.met ? '' : '○'}</span>
                <span style={{ fontSize: 10.5, opacity: c.met ? 1 : .5, lineHeight: 1.3 }}>{c.t} <span style={{ color: 'var(--text-muted)' }}>+{c.score}</span></span>
              </div>
            ))}
          </div>

          {/* Benefits & Considerations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Benefits</div>
              {archScore.isMulti ? [
                'Specialized models per step reduce cost',
                'Each agent optimized for its task',
                'Easier to debug and monitor individual steps',
                'Can mix Claude and OpenAI strengths',
              ] : [
                'Simpler to build, deploy, and maintain',
                'Lower latency, single model call',
                'Lower cost per execution',
                'Easier to test and iterate on prompts',
              ].map((b, i) => <div key={i} style={{ fontSize: 11, opacity: .9, marginBottom: 4 }}>• {b}</div>)}
            </div>
            <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}> Considerations</div>
              {archScore.isMulti ? [
                'More complex to implement and test',
                'Orchestration logic adds latency',
                'Need to handle inter-agent communication',
                'Higher initial development cost',
              ] : [
                'Single point of failure, one model does all',
                'Context window limits for complex tasks',
                'Harder to optimize individual steps',
                'May need premium model for high complexity',
              ].map((c, i) => <div key={i} style={{ fontSize: 11, opacity: .9, marginBottom: 4 }}>• {c}</div>)}
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
            Confidence: {confidence}, {confidence === 'high' ? 'Strong match between task characteristics and model capabilities' : confidence === 'medium' ? 'Configure more inputs for a stronger recommendation' : 'Complete the framework questions for a tailored recommendation'}
          </div>
        </div>

        {/* ── RESULT 2: PIPELINE STEPS ── */}
        <div style={cardStyle}>
          <div style={secH}>Pipeline Steps, Per-Step Model Selection</div>
          <div style={secSub}>{steps.length === 1 ? 'Single agent handles the full workflow' : `${steps.length}-agent pipeline with specialized roles`}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((st, idx) => (
              <div key={st.id} style={{
                border: '1.5px solid #E1DFDD', borderRadius: 10, padding: '16px 18px',
                borderLeft: `4px solid ${st.primary?.provider === 'Anthropic' ? 'var(--c-blue)' : 'var(--c-green)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#8A8886' }}>STEP {idx + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#201F1E' }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#605E5C', marginBottom: 10 }}>{st.desc}</div>
                    {st.primary && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                          background: st.primary.provider === 'Anthropic' ? '#EFF6FC' : '#DFF6DD',
                          color: st.primary.provider === 'Anthropic' ? 'var(--c-blue)' : 'var(--c-green)',
                          border: `1.5px solid ${st.primary.provider === 'Anthropic' ? 'var(--c-blue)' : 'var(--c-green)'}`,
                        }}>{st.primary.provider === 'Anthropic' ? '⬡ Claude' : '◎ OpenAI'}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#201F1E' }}>{st.primary.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--c-green)', fontWeight: 600 }}>{fmt$(st.costPerExec)}/exec</span>
                        <span style={{ fontSize: 10, color: '#8A8886' }}>| ${st.primary.costInput}/${st.primary.costOutput} per 1M tok in/out</span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    background: '#F8F7F6', borderRadius: 8, padding: '10px 14px', textAlign: 'center', minWidth: 140,
                  }}>
                    <div style={{ fontSize: 10, color: '#8A8886', marginBottom: 4 }}>TEMPERATURE</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-blue)' }}>{st.temp.toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: '#605E5C', marginTop: 4, lineHeight: 1.4, maxWidth: 120 }}>{st.tempNote}</div>
                  </div>
                </div>
                {st.alt && (
                  <div style={{
                    marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F2F1',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#605E5C',
                  }}>
                    <span style={{ fontWeight: 600 }}>Also consider:</span>
                    <span style={{
                      fontWeight: 600, color: st.alt.provider === 'Anthropic' ? 'var(--c-blue)' : 'var(--c-green)',
                    }}>{st.alt.name}</span>
                    <span style={{ color: '#8A8886' }}>· ${st.alt.costInput}/${st.alt.costOutput} per 1M tokens</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── RESULT 3: VISUAL PIPELINE DIAGRAM ── */}
        <div style={cardStyle}>
          <div style={secH}>Agent Pipeline</div>
          <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: steps.length * 200, padding: '12px 0' }}>
              <div style={{
                background: '#F3F2F1', border: '1.5px solid #E1DFDD', borderRadius: 8,
                padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#605E5C', textAlign: 'center', minWidth: 70,
              }}>Input</div>
              {steps.map((st, idx) => (
                <React.Fragment key={st.id}>
                  <div style={{ flex: '0 0 24px', textAlign: 'center', color: '#8A8886', fontSize: 16 }}>→</div>
                  <div style={{
                    background: st.primary?.provider === 'Anthropic' ? '#EFF6FC' : '#F1FAF1',
                    border: `2px solid ${st.primary?.provider === 'Anthropic' ? 'var(--c-blue)' : 'var(--c-green)'}`,
                    borderRadius: 8, padding: '10px 12px', textAlign: 'center', flex: '1 1 0',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#201F1E' }}>{st.label}</div>
                    <div style={{ fontSize: 10, color: st.primary?.provider === 'Anthropic' ? 'var(--c-blue)' : 'var(--c-green)', fontWeight: 600, marginTop: 2 }}>
                      {st.primary?.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#8A8886', marginTop: 2 }}>{fmt$(st.costPerExec)}/exec</div>
                  </div>
                </React.Fragment>
              ))}
              <div style={{ flex: '0 0 24px', textAlign: 'center', color: '#8A8886', fontSize: 16 }}>→</div>
              <div style={{
                background: '#DFF6DD', border: '1.5px solid var(--c-green)', borderRadius: 8,
                padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--c-green)', textAlign: 'center', minWidth: 70,
              }}>Output</div>
            </div>
          </div>
        </div>

        {/* ── RESULT 4: COST ESTIMATION ── */}
        <div style={cardStyle}>
          <div style={secH}>Cost Estimation</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { l: 'Per Execution', v: fmt$(costs.execCost), sub: 'based on ~700 tokens/step' },
              { l: 'Monthly', v: `$${Math.round(costs.monthly).toLocaleString()}`, sub: `${monthlyVol.toLocaleString()} executions` },
              { l: 'Annual', v: `$${Math.round(costs.annual).toLocaleString()}`, sub: 'at current volume' },
            ].map((c, i) => (
              <div key={i} style={{
                background: i === 1 ? 'var(--c-blue)' : 'var(--bg-page)',
                borderRadius: 10, padding: '16px', textAlign: 'center',
                border: i === 1 ? 'none' : '1px solid #E1DFDD',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: i === 1 ? 'rgba(255,255,255,.8)' : '#8A8886', marginBottom: 6 }}>{c.l}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: i === 1 ? '#fff' : '#201F1E' }}>{c.v}</div>
                <div style={{ fontSize: 10, color: i === 1 ? 'rgba(255,255,255,.7)' : '#8A8886', marginTop: 4 }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#FAF9F8', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#323130', marginBottom: 10 }}>Cost Range</div>
            {[
              { l: 'Using cheapest models', v: `$${Math.round(costs.cheapMonthly).toLocaleString()}/mo`, c: '#605E5C' },
              { l: 'Recommended configuration', v: `$${Math.round(costs.monthly).toLocaleString()}/mo`, c: 'var(--c-blue)', bold: true },
              { l: 'Using most capable models', v: `$${Math.round(costs.premMonthly).toLocaleString()}/mo`, c: 'var(--c-red)' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 10px', borderRadius: 6, marginBottom: 4,
                background: r.bold ? '#EFF6FC' : 'transparent',
                border: r.bold ? '1px solid var(--c-blue)30' : 'none',
              }}>
                <span style={{ fontSize: 12, color: r.bold ? '#201F1E' : '#605E5C', fontWeight: r.bold ? 600 : 400 }}>{r.bold && ''}{r.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.c }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RESULT 5: CLAUDE vs OPENAI ── */}
        <div style={cardStyle}>
          <div style={secH}>Claude vs OpenAI, Core Processor Comparison</div>
          {steps.length > 0 && steps[1] && (() => {
            const coreStep = steps.find(s => s.id === 'core') || steps[0];
            const claudeM = MODELS.find(m => m.provider === 'Anthropic' && m.tier === (complexity !== null && complexity >= 2 ? 'premium' : complexity === 3 ? 'frontier' : 'mid')) || MODELS.find(m => m.provider === 'Anthropic');
            const openaiM = MODELS.find(m => m.provider === 'OpenAI' && m.tier === (complexity !== null && complexity >= 2 ? 'premium' : complexity === 3 ? 'frontier' : 'mid')) || MODELS.find(m => m.provider === 'OpenAI');
            return (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th style={{ color: 'var(--c-blue)' }}>⬡ {claudeM?.name || 'Claude Sonnet 4.5'}</th>
                    <th style={{ color: 'var(--c-green)' }}>◎ {openaiM?.name || 'GPT-5.4'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Cost (in/out per 1M)', `$${claudeM?.costInput}/$${claudeM?.costOutput}`, `$${openaiM?.costInput}/$${openaiM?.costOutput}`],
                    ['Best for', 'Nuanced reasoning, document analysis, instruction following, safe content', 'Structured output, code generation, broad tool ecosystem, JSON mode'],
                    ['Context window', '200K tokens', '128K tokens'],
                    ['Speed', 'Fast (Sonnet) / Slower (Opus)', 'Fast (4.1/4o) / Slower (o-series)'],
                    ['Structured output', 'Good', 'Excellent (native JSON mode)'],
                    ['Reasoning models', 'Sonnet 4.5 hybrid thinking', 'o4-mini / o3 series'],
                  ].map(([crit, cl, oi], i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: '#323130' }}>{crit}</td>
                      <td style={{ color: '#323130', fontSize: 11 }}>{cl}</td>
                      <td style={{ color: '#323130', fontSize: 11 }}>{oi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>

        {/* ── RESULT 6: IMPLEMENTATION ROADMAP ── */}
        <div style={cardStyle}>
          <SectionTitle icon="map" color="var(--c-green)">Implementation Roadmap</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {[
              {
                phase: '1. Setup', color: 'var(--c-blue)', items: [
                  'Configure API credentials (Anthropic + OpenAI)',
                  'Set up environment variables and API keys',
                  'Install SDK: `npm install @anthropic-ai/sdk openai`',
                  'Design system and repository-level instructions',
                ]
              },
              {
                phase: '2. Development', color: 'var(--c-green)', items: [
                  'Write prompt templates for each pipeline step',
                  'Build orchestration logic and agent handoffs',
                  'Implement error handling and retry logic',
                  ...(archScore.isMulti ? ['Configure inter-agent communication format'] : []),
                ]
              },
              {
                phase: '3. Testing', color: '#5C2D91', items: [
                  'Test with representative real-world inputs',
                  'Benchmark recommended vs alternative models',
                  'Run A/B test: single agent vs multi-agent',
                  'Validate edge cases and failure modes',
                ]
              },
              {
                phase: '4. Deployment', color: 'var(--c-yellow-700)', items: [
                  'Deploy to production with gradual rollout',
                  'Set up monitoring and cost alerting',
                  'Schedule monthly model reviews',
                  'Track ODMs: accuracy, latency, cost per exec',
                ]
              },
            ].map((ph, pi) => (
              <div key={pi} style={{ border: '1px solid #E1DFDD', borderRadius: 8, padding: '14px 16px', borderTop: `3px solid ${ph.color}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ph.color, marginBottom: 10 }}>{ph.phase}</div>
                {ph.items.map((item, ii) => (
                  <div key={ii} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                    <input type="checkbox" style={{ marginTop: 2, accentColor: ph.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: '#323130', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── GARTNER CALLOUT ── */}
        <GartnerCallout
          type="gartner"
          title="Gartner: Measure Agent Value with ODMs"
          body="Gartner recommends Outcome-Driven Metrics (ODMs) for agentic AI: measure accuracy rate, cost per execution, latency P95, and human-override rate. These metrics help justify investment and guide model upgrade decisions. Source: Gartner G00837723."
        />

        {/* ── DISCLAIMER ── */}
        <div style={{ fontSize: 10.5, color: '#8A8886', lineHeight: 1.6, padding: '14px 0', borderTop: '1px solid #F3F2F1' }}>
          <strong>Disclaimer:</strong> Recommendations are based on general model capabilities and 2026 token pricing. Actual costs vary based on prompt length, caching, and usage patterns. Always benchmark with your specific workload before committing to an architecture. Model pricing updated April 2026.
        </div>

      </div>
    </div>
  );
}



/* ══════════ TAB 6: ROI CALCULATOR ══════════ */

/* ── Shared UI helpers (scoped to this tab) ── */
function SecPanel({ title, icon, open, onToggle, children, badge }) {
  return (
    <div style={{ marginBottom: 8, border: '1px solid #E1DFDD', borderRadius: 8, overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: '#FAF9F8', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#201F1E' }}>{title}</span>
          {badge && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-blue)', background: '#EFF6FC', padding: '1px 7px', borderRadius: 100, border: '1px solid var(--c-blue)80' }}>{badge}</span>}
        </div>
        <span style={{ fontSize: 12, color: '#8A8886', transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'none' }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && <div style={{ padding: '12px 14px', background: '#fff' }}>{children}</div>}
    </div>
  );
}

function HBarChart({ bars, height = 15 }) {
  const mx = Math.max(...bars.map(b => Math.max(b.val || 0, 0)), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {bars.map((b, i) => {
        const w = Math.max(b.val, 0) / mx * 100;
        const fmt = b.val >= 1000000 ? '$' + (b.val / 1000000).toFixed(2) + 'M'
          : b.val >= 1000 ? '$' + (b.val / 1000).toFixed(0) + 'K'
            : '$' + Math.round(b.val).toLocaleString();
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: '#605E5C' }}>{b.lbl}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: b.clr }}>{fmt}</span>
            </div>
            <div style={{ height, background: '#F3F2F1', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: w + '%', background: b.clr, borderRadius: 4, minWidth: w > 0.5 ? 3 : 0 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart5yr({ data, height = 130 }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.y);
  const minV = Math.min(0, ...vals);
  const maxV = Math.max(...vals, 1);
  const range = maxV - minV || 1;
  const pad = { l: 52, r: 8, t: 10, b: 22 };
  const svgW = 380, svgH = height;
  const W = svgW - pad.l - pad.r;
  const H = svgH - pad.t - pad.b;
  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * W,
    y: pad.t + H - ((d.y - minV) / range) * H,
  }));
  const polyPts = pts.map(p => `${p.x},${p.y}`).join(' ');
  const fillPts = `${pts[0].x},${pad.t + H} ${polyPts} ${pts[pts.length - 1].x},${pad.t + H}`;
  const fmtY = v => v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'K' : '$' + Math.round(v);
  const zeroY = pad.t + H - ((0 - minV) / range) * H;
  return (
    <svg width={svgW} height={svgH} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="lcGrad6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-blue)" stopOpacity=".18" />
          <stop offset="100%" stopColor="var(--c-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = pad.t + H * (1 - f);
        const v = minV + range * f;
        return <g key={i}>
          <line x1={pad.l} y1={y} x2={pad.l + W} y2={y} stroke="#F0EFEE" strokeWidth="1" />
          <text x={pad.l - 4} y={y + 3.5} fontSize="8" fill="#8A8886" textAnchor="end">{fmtY(v)}</text>
        </g>;
      })}
      {minV < 0 && (
        <line x1={pad.l} y1={zeroY} x2={pad.l + W} y2={zeroY} stroke="var(--c-red)" strokeWidth="1" strokeDasharray="4,3" opacity=".6" />
      )}
      <polygon points={fillPts} fill="url(#lcGrad6)" />
      <polyline points={polyPts} fill="none" stroke="var(--c-blue)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--c-blue)" stroke="#fff" strokeWidth="1.5" />
          <text x={p.x} y={pad.t + H + 15} fontSize="9" fill="#8A8886" textAnchor="middle">{data[i].lbl}</text>
        </g>
      ))}
    </svg>
  );
}

function ROICalculatorTab() {
  const tr = useT();
  const loc = React.useContext(LocaleContext);
  const W = { maxWidth: 1140, margin: '0 auto' };
  const secH = { fontSize: 14, fontWeight: 700, color: '#201F1E', marginBottom: 4 };
  const secSub = { fontSize: 11.5, color: '#605E5C', marginBottom: 12, lineHeight: 1.5 };
  const lbl = { fontSize: 11, fontWeight: 600, color: '#323130', display: 'block', marginBottom: 3 };
  const inp = { width: '100%', padding: '5px 8px', border: '1px solid #E1DFDD', borderRadius: 4, fontSize: 12, outline: 'none', boxSizing: 'border-box' };
  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
  const g3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 };
  const ROI_FORMULA_VERSION = '2026-06-16.1';
  const ADVISOR = window.ADVISOR_DATA || {};
  const GH_PRICING = ADVISOR.GITHUB_COPILOT || {};

  /* ── Collapsible state ── */
  const [open, setOpen] = useState({ team: true, proc: false, cplx: false, mdl: false, hitl: false, err: false, lic: false, impl: false, adv: false });
  const tog = k => setOpen(o => ({ ...o, [k]: !o[k] }));

  /* ── Inputs: Team ── */
  const [team, setTeam] = useState([
    { lvl: 'Junior/Entry (0-2 yrs)', count: 2, rate: 45, hrs: 40 },
    { lvl: 'Mid-Level (3-5 yrs)', count: 3, rate: 65, hrs: 40 },
    { lvl: 'Senior (6-10 yrs)', count: 1, rate: 110, hrs: 40 },
  ]);
  const updTeam = (i, fld, val) => setTeam(t => t.map((r, j) => j === i ? { ...r, [fld]: val } : r));

  /* ── Inputs: Process ── */
  const [nProc, setNProc] = useState(1);
  const [hRun, setHRun] = useState(2);
  const [rWk, setRWk] = useState(10);
  const [pEff, setPEff] = useState(75);
  const [hOvr, setHOvr] = useState(4);
  const [dOvr, setDOvr] = useState(15);
  const [tProc, setTProc] = useState(10);
  const [slaR, setSlaR] = useState(12);
  const [slaC, setSlaC] = useState(500);

  /* ── Inputs: Complexity ── */
  const [simp, setSimp] = useState(40);
  const [mod, setMod] = useState(40);
  const [cplx, setCplx] = useState(20);
  const adjCplx = (key, val) => {
    const rem = 100 - val;
    if (key === 'simp') { setSimp(val); const r = mod + cplx || 1; setMod(Math.round(mod / r * rem)); setCplx(rem - Math.round(mod / r * rem)); }
    else if (key === 'mod') { setMod(val); const r = simp + cplx || 1; setSimp(Math.round(simp / r * rem)); setCplx(rem - Math.round(simp / r * rem)); }
    else { setCplx(val); const r = simp + mod || 1; setSimp(Math.round(simp / r * rem)); setMod(rem - Math.round(simp / r * rem)); }
  };

  /* ── Inputs: AI Model ── */
  const [mTier, setMTier] = useState('mid');
  const [aCplx, setACplx] = useState('multi-step');
  const [inTok, setInTok] = useState(8500);
  const [outTok, setOutTok] = useState(1500);
  const [cache, setCache] = useState(20);

  /* ── Inputs: HITL ── */
  const [revPct, setRevPct] = useState(15);
  const [revMin, setRevMin] = useState(5);
  const [ops, setOps] = useState(1);
  const [opR, setOpR] = useState(35);
  const [opH, setOpH] = useState(40);

  /* ── Inputs: Error ── */
  const [eRate, setERate] = useState(8);
  const [eCost, setECost] = useState(250);
  const [cHrs, setCHrs] = useState(20);

  /* ── Inputs: Licensing ── */
  const [licM, setLicM] = useState('per-user');
  const [pUsr, setPUsr] = useState(50);
  const [nUsr, setNUsr] = useState(10);
  const [supp, setSupp] = useState('standard');
  const [conn, setConn] = useState(200);

  /* ── Inputs: Implementation ── */
  const [iCost, setICost] = useState(25000);
  const [tCost, setTCost] = useState(5000);
  const [mCost, setMCost] = useState(12000);
  const [amYrs, setAmYrs] = useState(3);

  /* ── Inputs: Advanced ── */
  const [disc, setDisc] = useState(10);
  const [grow, setGrow] = useState(4);
  const [scenarioName, setScenarioName] = useState('Expected scenario');
  const [savedRoiScenarios, setSavedRoiScenarios] = useState(() => {
    try {
      const raw = localStorage.getItem('agentic-roi-scenarios');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  });

  const MODS = useMemo(() => {
    const models = (ADVISOR.MODELS || []).slice();
    const blended = m => (m.costInput || 0) + (m.costOutput || 0);
    const tier = (key, fallback) => {
      const pool = models.filter(m => m.tier === key).sort((a, b) => ((a.status === 'GA' ? 0 : 1) - (b.status === 'GA' ? 0 : 1)) || (blended(a) - blended(b)));
      const primary = pool[0];
      return primary ? { nm: fallback.nm, ds: primary.name, ic: primary.costInput, oc: primary.costOutput, ac: fallback.ac } : fallback;
    };
    return {
      economy: tier('economy', { nm: 'Economy', ds: 'Source dataset fallback', ic: 0.25, oc: 2.00, ac: 0.85 }),
      mid: tier('mid', { nm: 'Mid-Tier', ds: 'Source dataset fallback', ic: 2.50, oc: 15.00, ac: 0.92 }),
      premium: tier('premium', { nm: 'Premium', ds: 'Source dataset fallback', ic: 5.00, oc: 25.00, ac: 0.98 }),
    };
  }, []);
  const CMUL = { single: 1, 'multi-step': 3, orchestration: 8 };

  /* ── Industry presets ── */
  const applyPreset = p => {
    const P = {
      banking: { nProc: 5, rWk: 50, slaR: 5, slaC: 5000, eRate: 2, eCost: 2000, hRun: 3, tProc: 15 },
      healthcare: { nProc: 8, rWk: 100, slaR: 3, slaC: 10000, eRate: 1, eCost: 5000, hRun: 4, tProc: 20 },
      legal: { nProc: 3, rWk: 20, slaR: 10, slaC: 3000, eRate: 3, eCost: 3000, hRun: 6, tProc: 8 },
      industrial: { nProc: 10, rWk: 200, slaR: 15, slaC: 1000, eRate: 5, eCost: 500, hRun: 1, tProc: 5 },
      retail: { nProc: 6, rWk: 80, slaR: 20, slaC: 500, eRate: 8, eCost: 200, hRun: 1, tProc: 12 },
    }[p];
    if (!P) return;
    setNProc(P.nProc); setRWk(P.rWk); setSlaR(P.slaR); setSlaC(P.slaC);
    setERate(P.eRate); setECost(P.eCost); setHRun(P.hRun); setTProc(P.tProc);
  };

  const resetAll = () => {
    setTeam([{ lvl: 'Junior/Entry (0-2 yrs)', count: 2, rate: 45, hrs: 40 }, { lvl: 'Mid-Level (3-5 yrs)', count: 3, rate: 65, hrs: 40 }, { lvl: 'Senior (6-10 yrs)', count: 1, rate: 110, hrs: 40 }]);
    setNProc(1); setHRun(2); setRWk(10); setPEff(75); setHOvr(4); setDOvr(15); setTProc(10); setSlaR(12); setSlaC(500);
    setSimp(40); setMod(40); setCplx(20); setMTier('mid'); setACplx('multi-step'); setInTok(8500); setOutTok(1500); setCache(20);
    setRevPct(15); setRevMin(5); setOps(1); setOpR(35); setOpH(40); setERate(8); setECost(250); setCHrs(20);
    setLicM('per-user'); setPUsr(50); setNUsr(10); setSupp('standard'); setConn(200);
    setICost(25000); setTCost(5000); setMCost(12000); setAmYrs(3); setDisc(10); setGrow(4);
  };

  const applyScenarioInputs = useCallback((inputs = {}) => {
    if (Array.isArray(inputs.team)) setTeam(inputs.team);
    const numberSetters = [
      [setNProc, 'nProc'], [setHRun, 'hRun'], [setRWk, 'rWk'], [setPEff, 'pEff'], [setHOvr, 'hOvr'], [setDOvr, 'dOvr'], [setTProc, 'tProc'], [setSlaR, 'slaR'], [setSlaC, 'slaC'],
      [setSimp, 'simp'], [setMod, 'mod'], [setCplx, 'cplx'], [setInTok, 'inTok'], [setOutTok, 'outTok'], [setCache, 'cache'], [setRevPct, 'revPct'], [setRevMin, 'revMin'],
      [setOps, 'ops'], [setOpR, 'opR'], [setOpH, 'opH'], [setERate, 'eRate'], [setECost, 'eCost'], [setCHrs, 'cHrs'], [setPUsr, 'pUsr'], [setNUsr, 'nUsr'], [setConn, 'conn'],
      [setICost, 'iCost'], [setTCost, 'tCost'], [setMCost, 'mCost'], [setAmYrs, 'amYrs'], [setDisc, 'disc'], [setGrow, 'grow']
    ];
    numberSetters.forEach(([setter, key]) => { if (inputs[key] !== undefined) setter(Number(inputs[key])); });
    const textSetters = [[setMTier, 'mTier'], [setACplx, 'aCplx'], [setLicM, 'licM'], [setSupp, 'supp']];
    textSetters.forEach(([setter, key]) => { if (inputs[key] !== undefined) setter(inputs[key]); });
  }, []);

  /* ── Core calculations ── */
  const R = useMemo(() => {
    const head = team.reduce((s, l) => s + l.count, 0);
    const annTeam = team.reduce((s, l) => s + l.count * l.rate * l.hrs * 52, 0);
    const blendHr = head > 0 ? annTeam / (head * 40 * 52) : 0;

    const bSave = (simp * 0.90 + mod * 0.65 + cplx * 0.35) / 100;
    const bErr = (simp * 0.95 + mod * 0.80 + cplx * 0.60) / 100;
    const bProd = bSave * 0.48;

    const annRuns = rWk * 52;
    const totTasks = annRuns * tProc * nProc;
    const baselineLaborHours = annRuns * nProc * hRun;
    const baselineLaborCost = baselineLaborHours * blendHr;

    const laborS = baselineLaborCost * bSave * (pEff / 100);
    const handS = hOvr * annRuns * nProc * (dOvr / 60) * blendHr * 0.8;
    const errS = totTasks * (eRate / 100) * bErr * eCost;
    const slaS = annRuns * nProc * (slaR / 100) * slaC * 0.70;
    const compS = cHrs * 12 * blendHr * 0.5;
    const prodS = baselineLaborCost * bProd * 0.25;
    const totSave = laborS + handS + errS + slaS + compS + prodS;

    const tmul = CMUL[aCplx] || 1;
    const mod0 = MODS[mTier];
    const cmul = 1 - (cache / 100) * 0.5;
    const apiCls = totTasks;
    const aiCost = apiCls * ((inTok * tmul / 1e6) * mod0.ic + (outTok * tmul / 1e6) * mod0.oc) * cmul;

    const revC = apiCls * (revPct / 100) * (revMin / 60) * opR;
    const opC = ops * opR * opH * 52;

    const smul = supp === 'premium' ? 1.20 : supp === 'enterprise' ? 1.35 : 1;
    const platC = licM === 'per-user' ? pUsr * nUsr * 12 * smul + conn * 12
      : licM === 'per-exec' ? apiCls * 0.03
        : nUsr * 2000;

    const implAm = (iCost + tCost) / Math.max(amYrs, 1);
    const totCostAnn = aiCost + revC + opC + platC + mCost + implAm;
    const fullY1 = totCostAnn + iCost + tCost;

    const roiY1 = fullY1 > 0 ? (totSave - fullY1) / fullY1 * 100 : 0;
    const roi3 = (() => {
      const s3 = totSave * 3; const c3 = fullY1 + (totCostAnn - implAm) * 2;
      return c3 > 0 ? (s3 - c3) / c3 * 100 : 0;
    })();
    const payMo = totSave > 0 ? fullY1 / totSave * 12 : 0;

    const di = disc / 100; const gr = grow / 100;
    let cumNPV = -(iCost + tCost);
    const yrs = [];
    for (let y = 1; y <= 5; y++) {
      const ys = totSave * Math.pow(1 + gr, y - 1);
      const yc = aiCost + revC + opC + platC + mCost + (y <= amYrs ? (iCost + tCost) / amYrs : 0);
      const net = ys - yc;
      cumNPV += net / Math.pow(1 + di, y);
      yrs.push({ yr: y, save: ys, cost: yc, net, cum: cumNPV });
    }

    const hrsSaved = baselineLaborHours * bSave;
    const fteEq = hrsSaved / (40 * 52);
    const errAvoid = totTasks * (eRate / 100) * bErr;
    const handElim = hOvr * annRuns * nProc * 0.8;
    const slaAvoid = annRuns * nProc * (slaR / 100) * 0.7;

    const ctBefore = totTasks > 0 ? (baselineLaborCost + totTasks * (eRate / 100) * eCost) / totTasks : 0;
    const ctAfter = totTasks > 0 ? totCostAnn / totTasks : 0;
    const validation = [];
    if (head <= 0 || blendHr <= 0) validation.push({ key: 'roiInvalidTeam' });
    if (baselineLaborHours <= 0 || annRuns <= 0 || nProc <= 0) validation.push({ key: 'roiInvalidNoBaseline' });
    if (simp + mod + cplx !== 100) validation.push({ key: 'roiInvalidDistribution' });

    const breakdown = [
      { lbl: 'Labor Savings', val: laborS, clr: 'var(--c-green)' },
      { lbl: 'Handover Savings', val: handS, clr: 'var(--c-blue)' },
      { lbl: 'Error Reduction', val: errS, clr: '#5C2D91' },
      { lbl: 'SLA Compliance', val: slaS, clr: 'var(--c-yellow-700)' },
      { lbl: 'Compliance Savings', val: compS, clr: '#00B294' },
      { lbl: 'Productivity Gains', val: prodS, clr: 'var(--c-yellow-700)' },
    ].filter(b => b.val > 0).sort((a, b) => b.val - a.val);

    const costBreak = [
      { lbl: 'AI Inference', val: aiCost, clr: 'var(--c-blue)' },
      { lbl: 'Human Review', val: revC, clr: '#5C2D91' },
      { lbl: 'Operators', val: opC, clr: 'var(--c-yellow-700)' },
      { lbl: 'Platform Licensing', val: platC, clr: 'var(--c-green)' },
      { lbl: 'Maintenance', val: mCost, clr: 'var(--c-yellow-700)' },
      { lbl: 'Impl (amortized)', val: implAm, clr: '#8A8886' },
    ].filter(b => b.val > 0);

    const scen = {
      best: { save: totSave * 1.15, cost: totCostAnn * 0.90 },
      expected: { save: totSave, cost: totCostAnn },
      worst: { save: totSave * 0.85, cost: totCostAnn * 1.20 },
    };
    for (const [k, s] of Object.entries(scen)) {
      const fc = s.cost + (k === 'best' ? iCost * 0.9 : k === 'worst' ? iCost * 1.1 : iCost) + tCost;
      s.roi = fc > 0 ? (s.save - fc) / fc * 100 : 0;
      s.pay = s.save > 0 ? fc / s.save * 12 : 0;
      s.npv = yrs.reduce((acc, yr, i) => {
        const ys = s.save * Math.pow(1 + gr, i);
        const yc = s.cost + (i < amYrs ? (iCost + tCost) / amYrs : 0);
        return acc + (ys - yc) / Math.pow(1 + di, i + 1);
      }, -(iCost + tCost));
    }

    const modComp = Object.entries(MODS).map(([k, m]) => {
      const mAI = apiCls * ((inTok * tmul / 1e6) * m.ic + (outTok * tmul / 1e6) * m.oc) * cmul;
      const mNet = totSave - mAI - revC - opC - platC - mCost - iCost - tCost;
      const mROI = (mAI + revC + opC + platC + mCost + iCost + tCost) > 0
        ? mNet / (mAI + revC + opC + platC + mCost + iCost + tCost) * 100 : 0;
      const mTrans = totTasks > 0 ? (mAI + revC + opC + platC + mCost) / totTasks : 0;
      return { key: k, nm: m.nm, aiC: mAI, acc: m.ac, net: mNet, roi: mROI, trans: mTrans, sel: k === mTier };
    });

    const sensi = [
      { lbl: 'Time Savings %', impact: totSave * 0.40 },
      { lbl: 'Team Hourly Rate', impact: totSave * 0.25 },
      { lbl: 'Headcount', impact: totSave * 0.20 },
      { lbl: 'SLA Breach Cost', impact: slaS * 1.5 },
      { lbl: 'Error Rate/Cost', impact: errS * 1.2 },
      { lbl: 'Handover Delays', impact: handS * 1.5 },
      { lbl: 'AI Token Usage', impact: aiCost * 2 },
      { lbl: 'Cache Hit Rate', impact: aiCost * 0.5 },
    ].sort((a, b) => b.impact - a.impact);

    return {
      head, annTeam, blendHr, baselineLaborHours, baselineLaborCost,
      bSave, bErr, totSave,
      laborS, handS, errS, slaS, compS, prodS,
      aiCost, revC, opC, platC, mCost, implAm, totCostAnn,
      roiY1, roi3, payMo,
      hrsSaved, fteEq, errAvoid, handElim, slaAvoid, apiCls,
      ctBefore, ctAfter,
      breakdown, costBreak, yrs, scen, modComp, sensi, validation,
      isValid: validation.length === 0,
      formulaVersion: ROI_FORMULA_VERSION,
      pricingAsOf: GH_PRICING.asOf || 'unknown',
      chartData: yrs.map(y => ({ y: y.cum, lbl: 'Y' + y.yr })),
    };
  }, [team, nProc, hRun, rWk, pEff, hOvr, dOvr, tProc, slaR, slaC, simp, mod, cplx, mTier, aCplx, inTok, outTok, cache, revPct, revMin, ops, opR, opH, eRate, eCost, cHrs, licM, pUsr, nUsr, supp, conn, iCost, tCost, mCost, amYrs, disc, grow]);

  const scenarioState = useMemo(() => ({
    team, nProc, hRun, rWk, pEff, hOvr, dOvr, tProc, slaR, slaC, simp, mod, cplx, mTier, aCplx, inTok, outTok, cache, revPct, revMin, ops, opR, opH, eRate, eCost, cHrs, licM, pUsr, nUsr, supp, conn, iCost, tCost, mCost, amYrs, disc, grow
  }), [team, nProc, hRun, rWk, pEff, hOvr, dOvr, tProc, slaR, slaC, simp, mod, cplx, mTier, aCplx, inTok, outTok, cache, revPct, revMin, ops, opR, opH, eRate, eCost, cHrs, licM, pUsr, nUsr, supp, conn, iCost, tCost, mCost, amYrs, disc, grow]);
  const scenarioSummary = useMemo(() => ({
    annualSavings: Math.round(R.totSave), annualOperatingCost: Math.round(R.totCostAnn), firstYearRoi: Math.round(R.roiY1), paybackMonths: Math.round(R.payMo * 10) / 10, fiveYearNpv: Math.round(R.yrs[R.yrs.length - 1]?.cum || 0), processHours: Math.round(R.baselineLaborHours), baselineProcessCost: Math.round(R.baselineLaborCost), valid: R.isValid, validation: R.validation.map(v => v.key)
  }), [R]);
  const currentScenarioPayload = useMemo(() => ({
    name: scenarioName.trim() || 'Current scenario',
    tool: 'Agentic ROI Calculator',
    formulaVersion: ROI_FORMULA_VERSION,
    pricingAsOf: R.pricingAsOf,
    locale: loc,
    inputs: scenarioState,
    outputs: scenarioSummary,
    sources: GH_PRICING.sources || []
  }), [scenarioName, R.pricingAsOf, scenarioState, scenarioSummary, loc]);
  React.useEffect(() => {
    try { localStorage.setItem('agentic-roi-current-scenario', JSON.stringify({ ...currentScenarioPayload, savedAt: new Date().toISOString() })); } catch (_) { }
  }, [currentScenarioPayload]);
  const persistScenarioList = useCallback((list) => {
    setSavedRoiScenarios(list);
    try { localStorage.setItem('agentic-roi-scenarios', JSON.stringify(list)); } catch (_) { }
  }, []);
  const downloadFile = (filename, mime, content) => {
    const blob = new Blob([content], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const saveCurrentScenario = useCallback(() => {
    const record = { ...currentScenarioPayload, savedAt: new Date().toISOString() };
    const next = [record, ...savedRoiScenarios.filter(item => item.name !== record.name)].slice(0, 20);
    persistScenarioList(next);
  }, [currentScenarioPayload, savedRoiScenarios, persistScenarioList]);
  const loadAutosavedDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem('agentic-roi-current-scenario');
      const record = raw ? JSON.parse(raw) : null;
      if (record && record.inputs) { setScenarioName(record.name || 'Autosaved draft'); applyScenarioInputs(record.inputs); }
    } catch (_) { }
  }, [applyScenarioInputs]);
  const loadSavedScenario = useCallback((record) => {
    if (!record || !record.inputs) return;
    setScenarioName(record.name || 'Loaded scenario');
    applyScenarioInputs(record.inputs);
  }, [applyScenarioInputs]);
  const deleteSavedScenario = useCallback((name) => {
    persistScenarioList(savedRoiScenarios.filter(item => item.name !== name));
  }, [savedRoiScenarios, persistScenarioList]);
  const scenarioRows = () => [currentScenarioPayload, ...savedRoiScenarios];
  const exportCurrentScenario = useCallback(() => {
    downloadFile('agentic-roi-current-scenario.json', 'application/json', JSON.stringify({ ...currentScenarioPayload, exportedAt: new Date().toISOString() }, null, 2));
  }, [currentScenarioPayload]);
  const exportScenarioPackJson = useCallback(() => {
    downloadFile('agentic-roi-scenarios.json', 'application/json', JSON.stringify({ tool: 'Agentic ROI Calculator', formulaVersion: ROI_FORMULA_VERSION, pricingAsOf: R.pricingAsOf, exportedAt: new Date().toISOString(), current: currentScenarioPayload, scenarios: savedRoiScenarios }, null, 2));
  }, [R.pricingAsOf, currentScenarioPayload, savedRoiScenarios]);
  const exportScenarioPackCsv = useCallback(() => {
    const columns = ['scenario', 'pricing_as_of', 'formula_version', 'valid', 'annual_savings', 'annual_operating_cost', 'first_year_roi', 'payback_months', 'five_year_npv', 'process_hours', 'baseline_process_cost', 'model_tier', 'agent_complexity'];
    const lines = [columns.join(';')].concat(scenarioRows().map(record => [
      record.name, record.pricingAsOf, record.formulaVersion, record.outputs?.valid, record.outputs?.annualSavings, record.outputs?.annualOperatingCost, record.outputs?.firstYearRoi,
      record.outputs?.paybackMonths, record.outputs?.fiveYearNpv, record.outputs?.processHours, record.outputs?.baselineProcessCost, record.inputs?.mTier, record.inputs?.aCplx
    ].map(value => String(value ?? '').replace(/;/g, ',')).join(';')));
    downloadFile('agentic-roi-scenarios.csv', 'text/csv;charset=utf-8', '\ufeff' + lines.join('\r\n'));
  }, [currentScenarioPayload, savedRoiScenarios]);
  const exportScenarioPackMarkdown = useCallback(() => {
    const rows = scenarioRows();
    const table = rows.map(record => `| ${record.name} | ${record.pricingAsOf} | ${cm(record.outputs?.annualSavings || 0)} | ${cm(record.outputs?.annualOperatingCost || 0)} | ${record.outputs?.firstYearRoi ?? ''}% | ${record.outputs?.paybackMonths ?? ''} | ${cm(record.outputs?.fiveYearNpv || 0)} |`).join('\n');
    const refs = (GH_PRICING.sources || []).map((source, index) => `${index + 1}. ${source}`).join('\n');
    const md = `# Agentic ROI Calculator scenarios\n\nGenerated: ${new Date().toISOString()}\nFormula version: ${ROI_FORMULA_VERSION}\nPricing as of: ${R.pricingAsOf}\n\n| Scenario | Pricing as of | Annual savings | Annual operating cost | First year ROI | Payback months | 5-year NPV |\n| --- | --- | ---: | ---: | ---: | ---: | ---: |\n${table}\n\n## References\n\n${refs}\n`;
    downloadFile('agentic-roi-scenarios.md', 'text/markdown;charset=utf-8', md);
  }, [R.pricingAsOf, currentScenarioPayload, savedRoiScenarios, GH_PRICING.sources]);
  const importScenarioPack = useCallback(async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const imported = Array.isArray(data.scenarios) ? data.scenarios : (data.inputs ? [data] : []);
      if (imported.length) {
        persistScenarioList([...imported, ...savedRoiScenarios].slice(0, 20));
        loadSavedScenario(imported[0]);
      }
    } catch (error) { alert('Import failed: ' + error.message); }
    event.target.value = '';
  }, [savedRoiScenarios, persistScenarioList, loadSavedScenario]);

  /* ── Format helpers ── */
  const currencyLocale = loc === 'pt-BR' ? 'pt-BR' : loc === 'es' ? 'es-ES' : 'en-US';
  const usd = new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const usdCompact = new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: 'USD', maximumFractionDigits: 1, notation: 'compact' });
  const c$ = n => usd.format(Math.round(n || 0));
  const cm = n => {
    const value = Number(n || 0);
    return Math.abs(value) >= 1000 ? usdCompact.format(value) : usd.format(Math.round(value));
  };
  const pct = n => (n >= 0 ? '+' : '') + Math.round(n) + '%';
  const mom = n => (Math.round(n * 10) / 10) + ' mo';
  const rclr = v => v >= 100 ? 'var(--c-green)' : v >= 0 ? 'var(--c-blue)' : 'var(--c-red)';
  const kpiC = (cl, bg) => ({ background: bg, borderRadius: 8, padding: '12px', border: '1px solid ' + cl + '28', textAlign: 'center' });

  const kpis = [
    { lbl: 'Annual Savings', icon: 'trendUp', val: cm(R.totSave), sub: 'before impl costs', clr: 'var(--c-green)', bg: '#F1FAF1' },
    { lbl: 'First Year ROI', icon: 'target', val: pct(R.roiY1), sub: 'net after impl costs', clr: rclr(R.roiY1), bg: R.roiY1 >= 0 ? '#EFF6FC' : '#FDF3F4' },
    { lbl: 'Payback Period', icon: 'zap', val: mom(R.payMo), sub: 'time to break even', clr: 'var(--c-yellow-700)', bg: '#FEF6F0' },
    { lbl: '3-Year ROI', icon: 'trendingUp', val: pct(R.roi3), sub: 'cumulative return', clr: rclr(R.roi3), bg: R.roi3 >= 0 ? '#F5F0FF' : '#FDF3F4' },
  ];
  const formulaLedgerRows = [
    { metric: tr('roiLedgerLaborMetric'), formula: tr('roiLedgerLaborFormula'), source: `${tr('roiSourceUser')} + ${tr('roiSourceAssumption')}` },
    { metric: tr('roiLedgerInferenceMetric'), formula: tr('roiLedgerInferenceFormula'), source: `${tr('roiSourceOfficial')} (${R.pricingAsOf}) + ${tr('roiSourceUser')}` },
    { metric: tr('roiLedgerReviewMetric'), formula: tr('roiLedgerReviewFormula'), source: tr('roiSourceUser') },
    { metric: tr('roiLedgerNpvMetric'), formula: tr('roiLedgerNpvFormula'), source: `${tr('roiSourceUser')} + ${tr('roiSourceAssumption')}` },
  ];

  const LVLS = ['Junior/Entry (0-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (6-10 yrs)', 'Lead/Principal', 'Manager/Director'];

  return (
    <div style={W}>

      {/* ── Header ── */}
      <div className="card">
        <SectionTitle icon="calculator" color="var(--c-blue)">AI Agent ROI Calculator</SectionTitle>
        <div style={secSub}>Model AI agent automation with live recalculation, sourced model pricing, scenario export, 5-year NPV, and savings by category.</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#605E5C' }}>Industry Preset:</span>
          <select onChange={e => applyPreset(e.target.value)} style={{ ...inp, width: 'auto', padding: '5px 10px' }}>
            <option value="">Custom / Manual</option>
            <option value="banking">Banking & Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="legal">Legal</option>
            <option value="industrial">Industrial / Manufacturing</option>
            <option value="retail">Retail / E-Commerce</option>
          </select>
          <button onClick={resetAll} style={{ fontSize: 11, padding: '5px 14px', border: '1px solid #E1DFDD', borderRadius: 6, background: '#FAF9F8', cursor: 'pointer', color: '#605E5C', fontWeight: 600 }}>↺ Reset Defaults</button>
          <button onClick={exportCurrentScenario} style={{ fontSize: 11, padding: '5px 14px', border: '1px solid var(--c-blue)', borderRadius: 6, background: '#EFF6FC', cursor: 'pointer', color: 'var(--c-blue)', fontWeight: 600 }}>{tr('roiExportScenario')}</button>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="check" color={R.isValid ? 'var(--c-green)' : 'var(--c-yellow-700)'}>{tr('roiStatusTitle')}</SectionTitle>
        <div style={secSub}>{tr('roiStatusSub')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
          {[{ l: tr('roiAutoOn'), v: R.isValid ? tr('roiValidationReady') : tr('roiValidationFix'), c: R.isValid ? 'var(--c-green)' : 'var(--c-yellow-700)' }, { l: tr('roiFormula'), v: R.formulaVersion, c: 'var(--c-blue)' }, { l: tr('roiPricingAsOf'), v: R.pricingAsOf, c: '#5C2D91' }, { l: tr('roiScenarioSaved'), v: 'localStorage', c: 'var(--c-green)' }].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderTop: '3px solid ' + m.c, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--text-muted)', marginBottom: 4 }}>{m.l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.c }}>{m.v}</div>
            </div>
          ))}
        </div>
        <div className={R.isValid ? 'note info' : 'note warn'}>{R.isValid ? tr('roiValidInputs') : R.validation.map(v => tr(v.key)).join(' ')}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>{tr('roiDataSourceOfficial')}</div>
      </div>

      <div className="card">
        <SectionTitle icon="scales" color="var(--c-green)">{tr('roiFormulaLedgerTitle')}</SectionTitle>
        <div style={secSub}>{tr('roiFormulaLedgerSub')}</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>{tr('roiLedgerMetric')}</th><th>{tr('roiLedgerFormula')}</th><th>{tr('roiLedgerSourceType')}</th></tr></thead>
            <tbody>{formulaLedgerRows.map((row, index) => (
              <tr key={index}><td><strong>{row.metric}</strong></td><td>{row.formula}</td><td>{row.source}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="fileText" color="var(--c-blue)">{tr('roiScenarioManagerTitle')}</SectionTitle>
        <div style={secSub}>{tr('roiScenarioManagerSub')}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <input type="text" value={scenarioName} placeholder={tr('roiScenarioName')} onChange={e => setScenarioName(e.target.value)} style={{ ...inp, width: 220 }} />
          <button onClick={saveCurrentScenario} className="ubb-btn" style={{ background: '#0078D4', color: '#fff', borderColor: '#0078D4' }}>{tr('roiSaveScenario')}</button>
          <button onClick={loadAutosavedDraft} className="ubb-btn">{tr('roiLoadDraft')}</button>
          <button onClick={exportScenarioPackJson} className="ubb-btn">{tr('roiExportJson')}</button>
          <button onClick={exportScenarioPackCsv} className="ubb-btn">{tr('roiExportCsv')}</button>
          <button onClick={exportScenarioPackMarkdown} className="ubb-btn">{tr('roiExportMarkdown')}</button>
          <label className="ubb-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{tr('roiImportJson')}<input type="file" accept=".json,application/json" onChange={importScenarioPack} style={{ display: 'none' }} /></label>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 700 }}>{tr('roiScenarioCount', { count: savedRoiScenarios.length })}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{tr('roiSavedScenarios')}</div>
        {savedRoiScenarios.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {savedRoiScenarios.map((record, index) => (
              <div key={record.name + '-' + index} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', background: 'var(--bg-page)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{record.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>ROI {record.outputs?.firstYearRoi ?? 0}% · savings {cm(record.outputs?.annualSavings || 0)} · {record.pricingAsOf}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => loadSavedScenario(record)} className="ubb-btn">{tr('roiLoadScenario')}</button>
                  <button onClick={() => deleteSavedScenario(record.name)} className="ubb-btn" style={{ color: 'var(--c-red-700)' }}>{tr('roiDeleteScenario')}</button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="note">{tr('roiNoSavedScenarios')}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>

        {/* ══ LEFT, Inputs ══ */}
        <div>

          {/* Team Composition */}
          <SecPanel title="Team Composition" icon="" open={open.team} onToggle={() => tog('team')} badge={R.head + ' FTEs · ' + cm(R.annTeam) + '/yr'}>
            <div style={{ fontSize: 10, color: '#8A8886', marginBottom: 10 }}>Annual cost: <strong style={{ color: '#201F1E' }}>{c$(R.annTeam)}</strong> · Blended: <strong>{c$(R.blendHr)}/hr</strong></div>
            {team.map((lv, i) => (
              <div key={i} style={{ border: '1px solid #F0EFEE', borderRadius: 6, padding: '9px 10px', marginBottom: 8, background: '#FAFAFA' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <select value={lv.lvl} onChange={e => updTeam(i, 'lvl', e.target.value)} style={{ ...inp, width: 'auto', fontSize: 11, padding: '3px 6px' }}>
                    {LVLS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  {team.length > 1 && <button onClick={() => setTeam(t => t.filter((_, j) => j !== i))} style={{ fontSize: 11, color: 'var(--c-red)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px' }}></button>}
                </div>
                <div style={g3}>
                  <div><label style={lbl}>Count</label><input type="number" value={lv.count} min={1} max={500} style={inp} onChange={e => updTeam(i, 'count', +e.target.value)} /></div>
                  <div><label style={lbl}>$/hr</label><input type="number" value={lv.rate} min={10} max={1000} style={inp} onChange={e => updTeam(i, 'rate', +e.target.value)} /></div>
                  <div><label style={lbl}>Hrs/wk</label><input type="number" value={lv.hrs} min={1} max={80} style={inp} onChange={e => updTeam(i, 'hrs', +e.target.value)} /></div>
                </div>
              </div>
            ))}
            <button onClick={() => setTeam(t => [...t, { lvl: 'Mid-Level (3-5 yrs)', count: 1, rate: 65, hrs: 40 }])} style={{ fontSize: 11, padding: '6px 14px', border: '1px dashed var(--c-blue)', borderRadius: 6, background: '#EFF6FC', cursor: 'pointer', color: 'var(--c-blue)', width: '100%', fontWeight: 600 }}>+ Add Resource Level</button>
          </SecPanel>

          {/* Process Details */}
          <SecPanel title="Process Details" icon="" open={open.proc} onToggle={() => tog('proc')} badge={nProc + ' proc · ' + rWk + ' runs/wk'}>
            <div style={g2}>
              <div><label style={lbl}>Number of Processes</label><input type="number" value={nProc} min={1} max={100} style={inp} onChange={e => setNProc(+e.target.value)} /></div>
              <div><label style={lbl}>Avg Hours per Run</label><input type="number" value={hRun} min={0.1} max={100} step={0.5} style={inp} onChange={e => setHRun(+e.target.value)} /></div>
              <div><label style={lbl}>Runs per Week</label><input type="number" value={rWk} min={1} max={10000} style={inp} onChange={e => setRWk(+e.target.value)} /></div>
              <div><label style={lbl}>Tasks per Process</label><input type="number" value={tProc} min={1} max={1000} style={inp} onChange={e => setTProc(+e.target.value)} /></div>
              <div><label style={lbl}>Handovers per Process</label><input type="number" value={hOvr} min={0} max={50} style={inp} onChange={e => setHOvr(+e.target.value)} /></div>
              <div><label style={lbl}>Avg Delay per Handover (min)</label><input type="number" value={dOvr} min={0} max={480} style={inp} onChange={e => setDOvr(+e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><label style={lbl}>Process Efficiency</label><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-blue)' }}>{pEff}%</span></div>
              <input type="range" value={pEff} min={10} max={100} step={5} style={{ width: '100%', accentColor: 'var(--c-blue)', marginBottom: 10 }} onChange={e => setPEff(+e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><label style={lbl}>SLA Breach Rate</label><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-red)' }}>{slaR}%</span></div>
              <input type="range" value={slaR} min={0} max={50} step={1} style={{ width: '100%', accentColor: 'var(--c-red)', marginBottom: 8 }} onChange={e => setSlaR(+e.target.value)} />
              <div><label style={lbl}>Cost per SLA Breach ($)</label><input type="number" value={slaC} min={0} max={100000} step={50} style={inp} onChange={e => setSlaC(+e.target.value)} /></div>
            </div>
          </SecPanel>

          {/* Task Complexity */}
          <SecPanel title="Task Complexity Distribution" icon="" open={open.cplx} onToggle={() => tog('cplx')} badge={'Save ' + Math.round(R.bSave * 100) + '% · Err -' + Math.round(R.bErr * 100) + '%'}>
            <div style={{ fontSize: 10, color: '#8A8886', marginBottom: 10 }}>
              Blended time savings: <strong style={{ color: 'var(--c-green)' }}>{Math.round(R.bSave * 100)}%</strong> · Error reduction: <strong style={{ color: '#5C2D91' }}>{Math.round(R.bErr * 100)}%</strong>
            </div>
            {[
              { lbl: 'Simple Tasks', desc: '90% savings · 95% error reduction', key: 'simp', val: simp, clr: 'var(--c-green)' },
              { lbl: 'Moderate Tasks', desc: '65% savings · 80% error reduction', key: 'mod', val: mod, clr: 'var(--c-blue)' },
              { lbl: 'Complex Tasks', desc: '35% savings · 60% error reduction', key: 'cplx', val: cplx, clr: '#5C2D91' },
            ].map(t => (
              <div key={t.key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div><span style={{ fontSize: 11, fontWeight: 600, color: '#323130' }}>{t.lbl}</span> <span style={{ fontSize: 10, color: '#8A8886' }}>({t.desc})</span></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.clr }}>{t.val}%</span>
                </div>
                <input type="range" value={t.val} min={0} max={100} step={5} style={{ width: '100%', accentColor: t.clr }} onChange={e => adjCplx(t.key, +e.target.value)} />
              </div>
            ))}
            <div style={{ fontSize: 10, color: simp + mod + cplx === 100 ? 'var(--c-green)' : 'var(--c-red)', fontWeight: 700 }}>
              Total: {simp + mod + cplx}% {simp + mod + cplx === 100 ? 'balanced' : '(must equal 100)'}
            </div>
          </SecPanel>

          {/* AI Model */}
          <SecPanel title="AI Model & Agent Configuration" icon="" open={open.mdl} onToggle={() => tog('mdl')} badge={MODS[mTier].nm + ' · ' + aCplx}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#323130', marginBottom: 6 }}>Model Tier</div>
              <div style={g3}>
                {Object.entries(MODS).map(([k, m]) => {
                  const clr = k === 'economy' ? 'var(--c-green)' : k === 'mid' ? 'var(--c-blue)' : '#5C2D91';
                  return (
                    <div key={k} onClick={() => setMTier(k)} style={{ border: '2px solid ' + (mTier === k ? clr : '#E1DFDD'), borderRadius: 7, padding: '9px 8px', cursor: 'pointer', background: mTier === k ? clr + '12' : '#fff', textAlign: 'center', transition: 'all .15s' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: mTier === k ? clr : '#605E5C' }}>{m.nm}</div>
                      <div style={{ fontSize: 9, color: '#8A8886', marginTop: 2 }}>{m.ds}</div>
                      <div style={{ fontSize: 9, color: '#A19F9D', marginTop: 2 }}>${m.ic}/${m.oc}/1M tk</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#323130', marginBottom: 6 }}>Agent Complexity</div>
              <div style={g3}>
                {[{ k: 'single', lbl: 'Single-Step', ds: '1× tokens', clr: 'var(--c-green)' }, { k: 'multi-step', lbl: 'Multi-Step', ds: '3× tokens', clr: 'var(--c-blue)' }, { k: 'orchestration', lbl: 'Orchestration', ds: '8× tokens', clr: '#5C2D91' }].map(a => (
                  <div key={a.k} onClick={() => setACplx(a.k)} style={{ border: '2px solid ' + (aCplx === a.k ? a.clr : '#E1DFDD'), borderRadius: 7, padding: '9px 8px', cursor: 'pointer', background: aCplx === a.k ? a.clr + '12' : '#fff', textAlign: 'center', transition: 'all .15s' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: aCplx === a.k ? a.clr : '#605E5C' }}>{a.lbl}</div>
                    <div style={{ fontSize: 9, color: '#8A8886', marginTop: 2 }}>{a.ds}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={g2}>
              <div><label style={lbl}>Avg Input Tokens</label><input type="number" value={inTok} min={100} max={200000} step={500} style={inp} onChange={e => setInTok(+e.target.value)} /></div>
              <div><label style={lbl}>Avg Output Tokens</label><input type="number" value={outTok} min={50} max={50000} step={100} style={inp} onChange={e => setOutTok(+e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><label style={lbl}>Cache Hit Rate</label><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-blue)' }}>{cache}%</span></div>
              <input type="range" value={cache} min={0} max={90} step={5} style={{ width: '100%', accentColor: 'var(--c-blue)' }} onChange={e => setCache(+e.target.value)} />
            </div>
            <div style={{ fontSize: 10, color: '#8A8886', marginTop: 8, background: '#F9F8F7', padding: '7px 10px', borderRadius: 5 }}>
              API calls/yr: <strong>{Math.round(R.apiCls).toLocaleString()}</strong> · Annual AI cost: <strong style={{ color: 'var(--c-blue)' }}>{c$(R.aiCost)}</strong>
            </div>
          </SecPanel>

          {/* Human-in-the-Loop */}
          <SecPanel title="Human-in-the-Loop" icon="" open={open.hitl} onToggle={() => tog('hitl')} badge={revPct + '% review · ' + ops + ' operator' + (ops !== 1 ? 's' : '')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><label style={lbl}>Tasks Requiring Review</label><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-blue)' }}>{revPct}%</span></div>
            <input type="range" value={revPct} min={0} max={100} step={5} style={{ width: '100%', accentColor: 'var(--c-blue)', marginBottom: 12 }} onChange={e => setRevPct(+e.target.value)} />
            <div style={g3}>
              <div><label style={lbl}>Review Time (min)</label><input type="number" value={revMin} min={1} max={120} style={inp} onChange={e => setRevMin(+e.target.value)} /></div>
              <div><label style={lbl}>Operators</label><input type="number" value={ops} min={0} max={100} style={inp} onChange={e => setOps(+e.target.value)} /></div>
              <div><label style={lbl}>$/hr</label><input type="number" value={opR} min={10} max={500} style={inp} onChange={e => setOpR(+e.target.value)} /></div>
            </div>
          </SecPanel>

          {/* Error & Quality */}
          <SecPanel title="Error & Quality Costs" icon="" open={open.err} onToggle={() => tog('err')} badge={eRate + '% error rate · ' + c$(eCost) + '/error'}>
            <div style={g3}>
              <div><label style={lbl}>Error Rate (%)</label><input type="number" value={eRate} min={0} max={100} step={0.5} style={inp} onChange={e => setERate(+e.target.value)} /></div>
              <div><label style={lbl}>Cost per Error ($)</label><input type="number" value={eCost} min={0} max={100000} step={50} style={inp} onChange={e => setECost(+e.target.value)} /></div>
              <div><label style={lbl}>Compliance Hrs/mo</label><input type="number" value={cHrs} min={0} max={500} style={inp} onChange={e => setCHrs(+e.target.value)} /></div>
            </div>
          </SecPanel>

          {/* Platform Licensing */}
          <SecPanel title="Platform Licensing" icon="" open={open.lic} onToggle={() => tog('lic')} badge={c$(R.platC) + '/yr'}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[{ k: 'per-user', lbl: 'Per User' }, { k: 'per-exec', lbl: 'Per Execution' }, { k: 'named', lbl: 'Named License' }].map(lm => (
                <div key={lm.k} onClick={() => setLicM(lm.k)} style={{ flex: 1, border: '2px solid ' + (licM === lm.k ? 'var(--c-blue)' : '#E1DFDD'), borderRadius: 6, padding: '7px 6px', cursor: 'pointer', background: licM === lm.k ? '#EFF6FC' : '#fff', textAlign: 'center', transition: 'all .15s' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: licM === lm.k ? 'var(--c-blue)' : '#605E5C' }}>{lm.lbl}</div>
                </div>
              ))}
            </div>
            <div style={g2}>
              <div><label style={lbl}>Price/User/mo ($)</label><input type="number" value={pUsr} min={0} max={5000} style={inp} onChange={e => setPUsr(+e.target.value)} /></div>
              <div><label style={lbl}>Number of Users</label><input type="number" value={nUsr} min={1} max={10000} style={inp} onChange={e => setNUsr(+e.target.value)} /></div>
              <div><label style={lbl}>Support Tier</label>
                <select value={supp} onChange={e => setSupp(e.target.value)} style={inp}>
                  <option value="standard">Standard (1×)</option>
                  <option value="premium">Premium (+20%)</option>
                  <option value="enterprise">Enterprise (+35%)</option>
                </select>
              </div>
              <div><label style={lbl}>Connector Costs/mo ($)</label><input type="number" value={conn} min={0} max={50000} style={inp} onChange={e => setConn(+e.target.value)} /></div>
            </div>
          </SecPanel>

          {/* Implementation */}
          <SecPanel title="Implementation & Ongoing Costs" icon="" open={open.impl} onToggle={() => tog('impl')} badge={'Impl: ' + c$(iCost + tCost) + ' · Amort: ' + amYrs + 'yr'}>
            <div style={g2}>
              <div><label style={lbl}>Implementation (one-time $)</label><input type="number" value={iCost} min={0} max={1000000} step={1000} style={inp} onChange={e => setICost(+e.target.value)} /></div>
              <div><label style={lbl}>Training (one-time $)</label><input type="number" value={tCost} min={0} max={500000} step={500} style={inp} onChange={e => setTCost(+e.target.value)} /></div>
              <div><label style={lbl}>Maintenance (annual $)</label><input type="number" value={mCost} min={0} max={500000} step={1000} style={inp} onChange={e => setMCost(+e.target.value)} /></div>
              <div><label style={lbl}>Amortization Period (yrs)</label><input type="number" value={amYrs} min={1} max={10} style={inp} onChange={e => setAmYrs(+e.target.value)} /></div>
            </div>
          </SecPanel>

          {/* Advanced Financial */}
          <SecPanel title="Advanced Financial Settings" icon="" open={open.adv} onToggle={() => tog('adv')} badge={'NPV ' + disc + '% · Growth ' + grow + '%'}>
            <div style={g2}>
              <div><label style={lbl}>Discount Rate / NPV (%)</label><input type="number" value={disc} min={0} max={50} step={0.5} style={inp} onChange={e => setDisc(+e.target.value)} /></div>
              <div><label style={lbl}>Annual Salary Growth (%)</label><input type="number" value={grow} min={0} max={20} step={0.5} style={inp} onChange={e => setGrow(+e.target.value)} /></div>
            </div>
            <div style={{ fontSize: 10, color: '#8A8886', marginTop: 6, background: '#F9F8F7', padding: '7px 10px', borderRadius: 5 }}>
              Savings compound at {grow}%/yr · NPV discounted at {disc}%/yr · Implementation amortized over {amYrs}yr
            </div>
          </SecPanel>

        </div>

        {/* ══ RIGHT, Results ══ */}
        <div style={{ position: 'sticky', top: 12 }}>

          {/* 4 KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {kpis.map((k, i) => (
              <div key={i} style={kpiC(k.clr, k.bg)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, color: 'var(--text-muted)' }}>{k.lbl}</span>
                  <span style={{ display: 'inline-flex', color: k.clr, opacity: .7 }}><Icon name={k.icon || 'chartBar'} size={14} /></span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: k.clr, lineHeight: 1, marginBottom: 3 }}>{k.val}</div>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Cost per transaction */}
          <div className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#201F1E' }}>Cost / Transaction</span>
              {R.ctBefore > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-green)' }}>▼ {Math.round((1 - R.ctAfter / R.ctBefore) * 100)}% reduction</span>}
            </div>
            <div style={g2}>
              <div style={{ background: '#FDF3F4', borderRadius: 6, padding: '9px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#8A8886', marginBottom: 2 }}>BEFORE AI</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-red)' }}>{cm(R.ctBefore)}</div>
              </div>
              <div style={{ background: '#F1FAF1', borderRadius: 6, padding: '9px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#8A8886', marginBottom: 2 }}>AFTER AI</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-green)' }}>{cm(R.ctAfter)}</div>
              </div>
            </div>
          </div>

          {/* Scenario Analysis */}
          <div className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#201F1E', marginBottom: 1 }}>Scenario Analysis</div>
            <div style={{ fontSize: 9.5, color: '#8A8886', marginBottom: 8 }}>Best: +15% savings, -10% cost · Worst: -15% savings, +20% cost</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ background: '#F3F2F1' }}>
                  {['Metric', 'Best Case', 'Expected', 'Worst Case'].map(h => (
                    <th key={h} style={{ padding: '5px 7px', textAlign: 'left', fontWeight: 700, color: '#605E5C', fontSize: 9.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: 'Savings', fmt: cm, vs: [R.scen.best.save, R.scen.expected.save, R.scen.worst.save] },
                  { m: 'ROI', fmt: pct, vs: [R.scen.best.roi, R.scen.expected.roi, R.scen.worst.roi] },
                  { m: 'Payback', fmt: mom, vs: [R.scen.best.pay, R.scen.expected.pay, R.scen.worst.pay] },
                  { m: '5-Yr NPV', fmt: cm, vs: [R.scen.best.npv, R.scen.expected.npv, R.scen.worst.npv] },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F3F2F1' }}>
                    <td style={{ padding: '5px 7px', color: '#605E5C', fontWeight: 500 }}>{row.m}</td>
                    <td style={{ padding: '5px 7px', color: 'var(--c-green)', fontWeight: 600 }}>{row.fmt(row.vs[0])}</td>
                    <td style={{ padding: '5px 7px', color: 'var(--c-blue)', fontWeight: 600 }}>{row.fmt(row.vs[1])}</td>
                    <td style={{ padding: '5px 7px', color: 'var(--c-red)', fontWeight: 600 }}>{row.fmt(row.vs[2])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5-Year NPV Chart */}
          <div className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#201F1E', marginBottom: 1 }}>Cumulative Cash Flow (NPV)</div>
            <div style={{ fontSize: 9.5, color: '#8A8886', marginBottom: 8 }}>{disc}% discount rate · {grow}% annual salary growth</div>
            <LineChart5yr data={R.chartData} height={128} />
          </div>

          {/* Savings + Cost breakdown side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#201F1E', marginBottom: 1 }}>Annual Savings Breakdown</div>
              <div style={{ fontSize: 9.5, color: '#8A8886', marginBottom: 10 }}>Total: <strong style={{ color: 'var(--c-green)' }}>{c$(R.totSave)}</strong></div>
              <HBarChart bars={R.breakdown} height={15} />
            </div>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#201F1E', marginBottom: 1 }}>Annual Operating Cost</div>
              <div style={{ fontSize: 9.5, color: '#8A8886', marginBottom: 10 }}>Total: <strong style={{ color: 'var(--c-red)' }}>{c$(R.totCostAnn)}</strong> · Net: <strong style={{ color: R.totSave - R.totCostAnn >= 0 ? 'var(--c-green)' : 'var(--c-red)' }}>{c$(R.totSave - R.totCostAnn)}</strong></div>
              <HBarChart bars={R.costBreak} height={15} />
            </div>
          </div>

        </div>
      </div>

      {/* ══ Full-width sections ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>

        {/* Impact Highlights */}
        <div className="card">
          <div style={secH}>Impact Highlights</div>
          <div style={secSub}>Operational outcomes from the configured scenario</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { ic: 'zap', lbl: 'Hours Saved/Year', val: Math.round(R.hrsSaved).toLocaleString(), sub: R.fteEq.toFixed(1) + ' FTE equivalent', clr: 'var(--c-blue)' },
              { ic: 'check', lbl: 'Errors Avoided/Year', val: Math.round(R.errAvoid).toLocaleString(), sub: c$(R.errS) + ' in error cost savings', clr: '#5C2D91' },
              { ic: 'link', lbl: 'Handovers Eliminated', val: Math.round(R.handElim).toLocaleString(), sub: c$(R.handS) + ' saved/yr', clr: 'var(--c-green)' },
              { ic: 'shield', lbl: 'SLA Breaches Avoided', val: Math.round(R.slaAvoid).toLocaleString(), sub: c$(R.slaS) + ' compliance savings', clr: 'var(--c-yellow-700)' },
              { ic: 'cpu', lbl: 'AI Model Selected', val: MODS[mTier].nm, sub: MODS[mTier].ds + ' · ' + aCplx, clr: '#201F1E' },
              { ic: 'refresh', lbl: 'API Calls/Year', val: Math.round(R.apiCls).toLocaleString(), sub: c$(R.aiCost) + ' inference cost/yr', clr: 'var(--c-yellow-700)' },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--bg-page)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'var(--bg-card)', color: h.clr, flexShrink: 0, border: '1px solid var(--border)' }}><Icon name={h.ic} size={16} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{h.lbl}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: h.clr, lineHeight: 1.2, margin: '2px 0' }}>{h.val}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{h.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Model Comparison */}
        <div className="card">
          <div style={secH}>AI Model Comparison</div>
          <div style={secSub}>Same scenario modeled across all model tiers, currently selected: <strong>{MODS[mTier].nm}</strong></div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: '#F3F2F1' }}>
                <th style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 700, color: '#605E5C', fontSize: 10 }}>Metric</th>
                {R.modComp.map(m => <th key={m.key} style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: m.sel ? 'var(--c-blue)' : '#605E5C', fontSize: 10, borderBottom: m.sel ? '2px solid var(--c-blue)' : undefined }}>{m.nm}{m.sel ? ' ' : ''}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { lbl: 'AI Cost/yr', fn: m => c$(m.aiC) },
                { lbl: 'Accuracy', fn: m => (m.acc * 100).toFixed(0) + '%' },
                { lbl: 'Net Savings Y1', fn: m => c$(m.net) },
                { lbl: 'First Yr ROI', fn: m => pct(m.roi) },
                { lbl: 'Cost/Task', fn: m => cm(m.trans) },
              ].map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F3F2F1' }}>
                  <td style={{ padding: '6px 8px', color: '#605E5C', fontWeight: 500 }}>{row.lbl}</td>
                  {R.modComp.map(m => <td key={m.key} style={{ padding: '6px 8px', textAlign: 'right', fontWeight: m.sel ? 700 : 400, color: m.sel ? 'var(--c-blue)' : '#201F1E' }}>{row.fn(m)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div className="card" style={{ marginTop: 12 }}>
        <div style={secH}>Sensitivity Analysis</div>
        <div style={secSub}>Variables ranked by impact magnitude, which inputs move the needle most on your ROI</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {R.sensi.map((s, i) => {
            const maxImpact = R.sensi[0].impact || 1;
            const wPct = Math.max(s.impact, 0) / maxImpact * 100;
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 10.5, color: '#323130', fontWeight: i === 0 ? 700 : 400 }}>{i + 1}. {s.lbl}</span>
                <div style={{ height: 16, background: '#F3F2F1', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: wPct + '%', background: i === 0 ? 'var(--c-blue)' : i === 1 ? '#5C2D91' : i === 2 ? 'var(--c-green)' : 'var(--c-yellow-700)', borderRadius: 4, opacity: 1 - i * 0.07 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#605E5C', textAlign: 'right' }}>{cm(s.impact)}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 9.5, color: '#8A8886', marginTop: 10 }}>Impact = estimated annual savings delta from a ±15% change in each variable.</div>
      </div>

      {/* 5-Year Projection Table */}
      <div className="card" style={{ marginTop: 12 }}>
        <div style={secH}>5-Year Financial Projection</div>
        <div style={secSub}>Includes {grow}% annual salary growth · {disc}% NPV discount rate · Implementation amortized over {amYrs} year{amYrs !== 1 ? 's' : ''}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#F3F2F1' }}>
              {['Year', 'Annual Savings', 'Annual Cost', 'Net Cash Flow', 'Cumulative NPV'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Year' ? 'left' : 'right', fontWeight: 700, color: '#605E5C', fontSize: 10.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {R.yrs.map((y, i) => (
              <tr key={i} style={{ borderTop: '1px solid #F3F2F1', background: i % 2 === 0 ? '#fff' : '#FAF9F8' }}>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#201F1E' }}>Year {y.yr}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--c-green)', fontWeight: 600 }}>{c$(y.save)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--c-red)' }}>{c$(y.cost)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: y.net >= 0 ? 'var(--c-green)' : 'var(--c-red)' }}>{c$(y.net)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: y.cum >= 0 ? 'var(--c-blue)' : 'var(--c-red)' }}>{c$(y.cum)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #E1DFDD', background: '#F9F8F7' }}>
              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#201F1E' }}>5-Year Total</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--c-green)', fontWeight: 700 }}>{c$(R.yrs.reduce((s, y) => s + y.save, 0))}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--c-red)', fontWeight: 700 }}>{c$(R.yrs.reduce((s, y) => s + y.cost, 0))}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--c-green)' }}>{c$(R.yrs.reduce((s, y) => s + y.net, 0))}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--c-blue)' }}>{c$(R.yrs[R.yrs.length - 1].cum)}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}



/* ── Icon component (paulasilva-ms canonical: 24x24 viewBox, 1.5 stroke, currentColor) ── */
const ICON_PATHS = {
  /* navigation + meta */
  arrowRight: <path d="M5 12h14M13 5l7 7-7 7" />,
  arrowDown: <path d="M12 5v14M19 12l-7 7-7-7" />,
  check: <path d="M20 6L9 17l-5-5" />,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  externalLink: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
  /* data + metrics */
  chartBar: <><line x1="3" y1="20" x2="21" y2="20" /><line x1="6" y1="20" x2="6" y2="11" /><line x1="11" y1="20" x2="11" y2="6" /><line x1="16" y1="20" x2="16" y2="14" /><line x1="21" y1="20" x2="21" y2="9" /></>,
  trendUp: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
  calculator: <><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="11" x2="8" y2="11" /><line x1="12" y1="11" x2="12" y2="11" /><line x1="16" y1="11" x2="16" y2="11" /><line x1="8" y1="15" x2="8" y2="15" /><line x1="12" y1="15" x2="12" y2="15" /><line x1="16" y1="15" x2="16" y2="15" /><line x1="8" y1="19" x2="16" y2="19" /></>,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  /* people + roles */
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  /* tech + agents */
  bot: <><rect x="3" y="9" width="18" height="11" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="9" /><line x1="8" y1="14" x2="8" y2="14.01" /><line x1="16" y1="14" x2="16" y2="14.01" /><path d="M9 18h6" /></>,
  brain: <><path d="M9.5 2A3.5 3.5 0 0 0 6 5.5v.55A3.5 3.5 0 0 0 4 9.5V11A3.5 3.5 0 0 0 6 14.05V14.5a3.5 3.5 0 0 0 3.5 3.5h.05A3 3 0 0 0 12 21a3 3 0 0 0 2.45-3h.05A3.5 3.5 0 0 0 18 14.5V14.05A3.5 3.5 0 0 0 20 11V9.5A3.5 3.5 0 0 0 18 6.05V5.5A3.5 3.5 0 0 0 14.5 2 3 3 0 0 0 12 4a3 3 0 0 0-2.5-2z" /></>,
  cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>,
  laptop: <><rect x="3" y="4" width="18" height="12" rx="1" /><line x1="2" y1="20" x2="22" y2="20" /></>,
  code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  terminal: <><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>,
  /* layout + structure */
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
  /* tools + work */
  construction: <><rect x="2" y="6" width="20" height="8" rx="1" /><path d="M17 14v8M7 14v8" /><path d="M2 14h20" /></>,
  wrench: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>,
  tools: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  /* security + governance */
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  key: <><circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></>,
  scales: <><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M3 6l3 8a4 4 0 0 1-3 0z" /><path d="M21 6l-3 8a4 4 0 0 1 0 0a4 4 0 0 1-3-8z" transform="translate(-15, 0)" /></>,
  alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  /* business + finance */
  dollar: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  pieChart: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>,
  trendingUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  /* content + docs */
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  bookOpen: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
  fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
  clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  /* settings */
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  /* misc */
  database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
  building: <><rect x="4" y="2" width="16" height="20" /><line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" /><line x1="8" y1="6" x2="10" y2="6" /><line x1="14" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="10" y2="10" /><line x1="14" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="10" y2="14" /><line x1="14" y1="14" x2="16" y2="14" /></>,
  flask: <><path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2" /><line x1="9" y1="2" x2="15" y2="2" /></>,
  refresh: <><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  plug: <><path d="M9 2v6M15 2v6M5 8h14M6 8v8a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8M11 20v2M13 20v2" /></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
  paint: <><path d="M19 11h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6a4 4 0 0 0-4 4v3a4 4 0 0 0 4 4h7" /><circle cx="9" cy="17" r="2" /><path d="M9 14V8h2v6" /></>,
  fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  handshake: <><path d="M11 17l-5-5 4-4M13 7l5 5-4 4" /><path d="M9 17h6" /></>,
};

function Icon({ name, size = 18, ...rest }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {path}
    </svg>
  );
}


/* SectionTitle helper, prepends a colored icon chip to any section header */
function SectionTitle({ icon, color, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.005em' }}>
      {icon && (
        <span style={{ display: 'inline-flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'var(--bg-page)', color: color || 'var(--c-blue)', flexShrink: 0 }}>
          <Icon name={icon} size={14} />
        </span>
      )}
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}

const STATIC_COPY = window.I18N_STATIC_COPY || {};

function applyStaticCopyLocale(loc) {
  const targetLoc = loc === 'pt-BR' ? 'pt-BR' : loc === 'es' ? 'es' : 'en';
  const reverse = new Map();
  Object.entries(STATIC_COPY).forEach(([en, translations]) => {
    reverse.set(en, en);
    Object.values(translations).forEach(value => reverse.set(value, en));
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const key = reverse.get(trimmed);
    if (!key) return;
    const replacement = targetLoc === 'en' ? key : (STATIC_COPY[key] && STATIC_COPY[key][targetLoc]) || key;
    node.nodeValue = raw.replace(trimmed, replacement);
  });
}


/* ===== Ported from v1 (UBB advanced calculator) ===== */
const UBB_DEFAULT_RATES = [{
  id: "included",
  nm: "GPT-5 mini / Raptor mini (included)",
  tier: "included",
  ic: 0,
  cc: 0,
  cw: 0,
  oc: 0,
  note: "No AI Credits consumed on paid plans"
}, {
  id: "nano",
  nm: "GPT-5.4 nano",
  tier: "light",
  ic: 0.20,
  cc: 0.02,
  cw: 0,
  oc: 1.25,
  note: "Cheapest OpenAI metered tier"
}, {
  id: "gflash",
  nm: "Gemini 3 Flash",
  tier: "light",
  ic: 0.50,
  cc: 0.05,
  cw: 0,
  oc: 3.00,
  note: "No long-context surcharge"
}, {
  id: "mai",
  nm: "MAI-Code-1-Flash",
  tier: "light",
  ic: 0.75,
  cc: 0.075,
  cw: 0,
  oc: 4.50,
  note: "Microsoft lightweight coding model"
}, {
  id: "haiku",
  nm: "Claude Haiku 4.5",
  tier: "mid",
  ic: 1.00,
  cc: 0.10,
  cw: 1.25,
  oc: 5.00,
  note: "Anthropic cache write applies"
}, {
  id: "sonnet",
  nm: "Claude Sonnet 4.6",
  tier: "mid",
  ic: 3.00,
  cc: 0.30,
  cw: 3.75,
  oc: 15.00,
  note: "Coding Agent default (Sonnet 5 promo 2.00/10.00 thru Aug 31 2026)"
}, {
  id: "g25pro",
  nm: "Gemini 2.5 Pro",
  tier: "mid",
  ic: 1.25,
  cc: 0.125,
  cw: 0,
  oc: 10.00,
  note: "Surcharge above 200K tokens"
}, {
  id: "codex",
  nm: "GPT-5.3-Codex",
  tier: "premium",
  ic: 1.75,
  cc: 0.175,
  cw: 0,
  oc: 14.00,
  note: "Codex chat default"
}, {
  id: "gpt54",
  nm: "GPT-5.4",
  tier: "premium",
  ic: 2.50,
  cc: 0.25,
  cw: 0,
  oc: 15.00,
  note: "Surcharge above 272K tokens"
}, {
  id: "opus",
  nm: "Claude Opus 4.8",
  tier: "frontier",
  ic: 5.00,
  cc: 0.50,
  cw: 6.25,
  oc: 25.00,
  note: "Frontier Anthropic tier"
}, {
  id: "gpt55",
  nm: "GPT-5.5",
  tier: "frontier",
  ic: 5.00,
  cc: 0.50,
  cw: 0,
  oc: 30.00,
  note: "Highest output rate on the menu"
}];
const UBB_PLANS = {
  business: {
    nm: "Copilot Business",
    seat: 19,
    inc: 1900,
    promo: 3000
  },
  enterprise: {
    nm: "Copilot Enterprise",
    seat: 39,
    inc: 3900,
    promo: 7000
  }
};
/* Representative model per mix bucket, used for blended credit math */
const UBB_MIX_REP = {
  included: "included",
  light: "nano",
  mid: "sonnet",
  frontier: "opus"
};
function creditsForCall(rate, inTok, outTok, cachedShare, cacheWriteShare) {
  const fresh = inTok * (1 - cachedShare - cacheWriteShare);
  const cached = inTok * cachedShare;
  const written = inTok * cacheWriteShare;
  const usd = fresh / 1e6 * rate.ic + cached / 1e6 * rate.cc + written / 1e6 * (rate.cw || rate.ic) + outTok / 1e6 * rate.oc;
  return usd * 100; /* 1 AI Credit = 0.01 USD */
}
function UBBCalculator() {
  const locRef = React.useRef(null);
  useLocalizeSubtree(locRef);
  const loc = React.useContext(LocaleContext);
  const LB = ({
    'pt-BR': { lic: 'Licença ativa: ', inc: ' créditos incluídos/usuário/mês', promo: ' (promo até 2026-09-01)', seats: ' seats · ', devs: ' devs ativos', pooled: 'pool de ', cmo: ' créditos/mês', emptyT: 'Informe a quantidade de seats para começar', emptyB: 'Este painel fica em branco até você definir quantos seats do Copilot possui. Preencha o plano e os seats abaixo, e o resumo da licença, o pool e a conta mensal aparecerão.' },
    'es': { lic: 'Licencia activa: ', inc: ' créditos incluidos/usuario/mes', promo: ' (promo hasta 2026-09-01)', seats: ' seats · ', devs: ' devs activos', pooled: 'pool de ', cmo: ' créditos/mes', emptyT: 'Ingresa la cantidad de seats para empezar', emptyB: 'Este panel queda en blanco hasta que definas cuántos seats de Copilot tienes. Completa el plan y los seats abajo, y el resumen de licencia, el pool y la factura mensual aparecerán.' }
  })[loc] || { lic: 'Active license: ', inc: ' included credits/user/mo', promo: ' (promo thru 2026-09-01)', seats: ' seats · ', devs: ' active devs', pooled: 'pooled ', cmo: ' credits/mo', emptyT: 'Enter your seat count to begin', emptyB: 'This panel stays blank until you set how many Copilot seats you have. Fill in the plan and seats below, and the license summary, pool and monthly bill will appear.' };
  const W = {
    maxWidth: 1140,
    margin: '0 auto'
  };
  const secH = {
    fontSize: 14,
    fontWeight: 700,
    color: '#201F1E',
    marginBottom: 4
  };
  const secSub = {
    fontSize: 11.5,
    color: '#605E5C',
    marginBottom: 12,
    lineHeight: 1.5
  };
  const inp = {
    width: '100%',
    padding: '5px 8px',
    border: '1px solid #E1DFDD',
    borderRadius: 4,
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box'
  };
  const lbl = {
    fontSize: 11,
    fontWeight: 600,
    color: '#323130',
    display: 'block',
    marginBottom: 3
  };

  /* ── Plan & population ── */
  const [plan, setPlan] = useState("business");
  const [seats, setSeats] = useState(0);
  const [adoption, setAdoption] = useState(70);
  const [promo, setPromo] = useState(true);
  const [workDays, setWorkDays] = useState(21);

  /* ── Editable rate card ── */
  const [rates, setRates] = useState(UBB_DEFAULT_RATES.map(r => ({
    ...r
  })));
  const [showRates, setShowRates] = useState(false);
  const updRate = (i, f, v) => setRates(rs => rs.map((r, j) => j === i ? {
    ...r,
    [f]: v
  } : r));
  const rateById = id => rates.find(r => r.id === id) || rates[0];

  /* ── Usage profile per ACTIVE developer per day ── */
  const [chatN, setChatN] = useState(20);
  const [chatIn, setChatIn] = useState(9000);
  const [chatOut, setChatOut] = useState(1200);
  const [agentN, setAgentN] = useState(3);
  const [agIter, setAgIter] = useState(8);
  const [agIn, setAgIn] = useState(14000);
  const [agOut, setAgOut] = useState(2500);
  const [revWk, setRevWk] = useState(5);
  const [revCr, setRevCr] = useState(45);
  const [cacheShare, setCacheShare] = useState(50);

  /* ── Model mix (auto-balancing to 100) ── */
  const [mixI, setMixI] = useState(35);
  const [mixL, setMixL] = useState(20);
  const [mixM, setMixM] = useState(35);
  const [mixF, setMixF] = useState(10);
  const setMix = (k, v) => {
    const others = {
      I: [mixL, mixM, mixF, setMixL, setMixM, setMixF],
      L: [mixI, mixM, mixF, setMixI, setMixM, setMixF],
      M: [mixI, mixL, mixF, setMixI, setMixL, setMixF],
      F: [mixI, mixL, mixM, setMixI, setMixL, setMixM]
    }[k];
    const rem = 100 - v,
      sum = others[0] + others[1] + others[2] || 1;
    const a = Math.round(others[0] / sum * rem),
      b = Math.round(others[1] / sum * rem),
      c = rem - a - b;
    ({
      I: setMixI,
      L: setMixL,
      M: setMixM,
      F: setMixF
    })[k](v);
    others[3](a);
    others[4](b);
    others[5](c);
  };

  /* ── Consumption concentration ── */
  const [conc, setConc] = useState("field"); /* uniform | field */

  /* ── Optimization levers (multiplicative, applied to metered credits) ── */
  const [lv, setLv] = useState({
    route: 0,
    cache: 0,
    context: 0,
    output: 0,
    agent: 0,
    review: 0
  });
  const setLever = (k, v) => setLv(o => ({
    ...o,
    [k]: v
  }));
  const LEVERS = [{
    k: "route",
    n: "L1 Route routine work to included models",
    d: "Move eligible chat and simple edits to GPT-5 mini and Raptor mini at zero credit cost",
    max: 40
  }, {
    k: "cache",
    n: "L2 Cache hygiene",
    d: "Keep sessions warm, avoid fresh chats that reset the prompt cache",
    max: 30
  }, {
    k: "context",
    n: "L3 Context curation",
    d: "Scoped instructions and precise attachments instead of dump-all context",
    max: 35
  }, {
    k: "output",
    n: "L4 Output discipline",
    d: "Ask for terse answers and diffs, not essays; output rate dominates the bill",
    max: 25
  }, {
    k: "agent",
    n: "L5 Agent scoping",
    d: "Reserve Agent mode for multi-step work, cap iterations, audit unused tools",
    max: 35
  }, {
    k: "review",
    n: "L6 Review policy",
    d: "Trigger GitHub Copilot code review on labeled PRs instead of every push",
    max: 30
  }];
  const R = useMemo(() => {
    const P = UBB_PLANS[plan];
    const active = Math.round(seats * adoption / 100);
    const cs = cacheShare / 100,
      cwS = Math.min(0.10, (1 - cs) * 0.3); /* cache write share of input */

    /* Blended credits per interaction across the mix */
    const mix = [["included", mixI], ["light", mixL], ["mid", mixM], ["frontier", mixF]];
    const blend = (inT, outT) => mix.reduce((s, [t, p]) => s + creditsForCall(rateById(UBB_MIX_REP[t]), inT, outT, cs, cwS) * (p / 100), 0);
    const chatCrDay = chatN * blend(chatIn, chatOut);
    /* Agent runs resend growing context each iteration; approximate growth 1.0,1.2,... */
    const agentInTot = agIter * agIn * (1 + 0.1 * (agIter - 1) / 2);
    const agentCrRun = blend(agentInTot, agOut * agIter);
    const agentCrDay = agentN * agentCrRun;
    const revCrDay = revWk * revCr / 5;
    const rawUserMo = (chatCrDay + agentCrDay + revCrDay) * workDays;

    /* Levers apply multiplicatively to the metered share (included-model share is already zero cost) */
    const leverMult = LEVERS.reduce((m, L) => m * (1 - (lv[L.k] || 0) / 100), 1);
    const userMo = rawUserMo * leverMult;
    const poolInc = seats * (promo ? P.promo : P.inc);
    const totalMo = userMo * active;
    const overCr = Math.max(0, totalMo - poolInc);
    const overUsd = overCr * 0.01;
    const seatUsd = seats * P.seat;
    const billMo = seatUsd + overUsd;
    const utilPct = poolInc > 0 ? totalMo / poolInc * 100 : 0;

    /* Pool exhaustion day (uniform vs field concentration where P99 users burn 46x median) */
    const dailyPool = totalMo / workDays;
    let exhaustDay = dailyPool > 0 ? poolInc / dailyPool : Infinity;
    if (conc === "field") exhaustDay = exhaustDay / 1.35; /* heavy-tail front-loads consumption */
    exhaustDay = Math.min(workDays, Math.round(exhaustDay * 10) / 10);

    const feat = [{
      lbl: "Chat interactions",
      val: chatCrDay * workDays * leverMult,
      clr: "#0078D4"
    }, {
      lbl: "Agent mode runs",
      val: agentCrDay * workDays * leverMult,
      clr: "#5C2D91"
    }, {
      lbl: "Code review (credits)",
      val: revCrDay * workDays * leverMult,
      clr: "#D19200"
    }];
    const savedMo = (rawUserMo - userMo) * active * 0.01;
    return {
      P,
      active,
      userMo,
      rawUserMo,
      poolInc,
      totalMo,
      overCr,
      overUsd,
      seatUsd,
      billMo,
      utilPct,
      exhaustDay,
      feat,
      leverMult,
      savedMo,
      agentCrRun,
      cs
    };
  }, [plan, seats, adoption, promo, workDays, rates, chatN, chatIn, chatOut, agentN, agIter, agIn, agOut, revWk, revCr, cacheShare, mixI, mixL, mixM, mixF, conc, lv]);
  const c$ = n => '$' + Math.round(n).toLocaleString();
  const cr = n => Math.round(n).toLocaleString();
  const hasInput = seats > 0;
  const kpiC = (cl, bg) => ({
    background: bg,
    borderRadius: 8,
    padding: '12px',
    border: '1px solid ' + cl + '28',
    textAlign: 'center'
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: locRef,
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      borderLeft: '4px solid #00A4EF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "GitHub Copilot Usage-Based Billing Calculator"), /*#__PURE__*/React.createElement("div", {
    style: secSub
  }, "Since 2026-06-01 every GitHub Copilot plan meters chat, Agent mode, the cloud coding agent and code review in GitHub AI Credits (1 credit = $0.01), computed from input, output and cached tokens at per-model rates. Code completions and Next Edit Suggestions stay unlimited on paid plans. Verify live rates at docs.github.com before quoting a client.")), hasInput && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      margin: '0 0 14px',
      border: '1px solid #C7E0F4',
      background: '#EAF3FB',
      borderRadius: 8,
      fontSize: 12.5,
      color: '#0A4A7A'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, LB.lic + R.P.nm), /*#__PURE__*/React.createElement("span", null, " \u00b7 " + cr(promo ? R.P.promo : R.P.inc) + LB.inc + (promo ? LB.promo : "")), /*#__PURE__*/React.createElement("span", null, " \u00b7 " + cr(seats) + LB.seats + cr(R.active) + LB.devs), /*#__PURE__*/React.createElement("span", null, " \u00b7 " + LB.pooled + cr(R.poolInc) + LB.cmo)), hasInput && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5,1fr)',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: kpiC('#0078D4', '#EFF6FC')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#0078D4',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Consumed / user / mo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#201F1E'
    }
  }, cr(R.userMo)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, "per active dev")), /*#__PURE__*/React.createElement("div", {
    style: kpiC(R.utilPct > 100 ? '#D13438' : '#107C10', R.utilPct > 100 ? '#FDF3F4' : '#F1FAF1')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: R.utilPct > 100 ? '#D13438' : '#107C10',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Pool utilization"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#201F1E'
    }
  }, Math.round(R.utilPct), "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, cr(R.totalMo), " of ", cr(R.poolInc))), /*#__PURE__*/React.createElement("div", {
    style: kpiC('#D19200', '#FFFBF0')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#7A5700',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Overage / mo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#201F1E'
    }
  }, c$(R.overUsd)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, cr(R.overCr), " credits")), /*#__PURE__*/React.createElement("div", {
    style: kpiC('#5C2D91', '#F5F0FF')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#5C2D91',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Monthly bill"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#201F1E'
    }
  }, c$(R.billMo)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, "seats + overage")), /*#__PURE__*/React.createElement("div", {
    style: kpiC('#00B294', '#F0FBF9')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#00745F',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Pool exhaustion"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#201F1E'
    }
  }, "day ", R.exhaustDay), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, "of ", workDays, " working days"))), !hasInput && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 22px',
      margin: '0 0 16px',
      border: '1px dashed #C7E0F4',
      background: '#F7FBFE',
      borderRadius: 10,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#0A4A7A',
      marginBottom: 6
    }
  }, LB.emptyT), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: '#605E5C'
    }
  }, LB.emptyB)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Plan and population"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Plan"), /*#__PURE__*/React.createElement("select", {
    style: inp,
    value: plan,
    onChange: e => setPlan(e.target.value)
  }, Object.entries(UBB_PLANS).map(([k, p]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, p.nm)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Seats"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    min: 0,
    placeholder: "0",
    value: seats || '',
    onChange: e => setSeats(Number(e.target.value) || 0)
  }))), /*#__PURE__*/React.createElement(Slider, {
    label: "Active developers",
    value: adoption,
    min: 10,
    max: 100,
    unit: "%",
    onChange: setAdoption,
    color: "#00A4EF"
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Working days / month",
    value: workDays,
    min: 18,
    max: 23,
    onChange: setWorkDays,
    color: "#00A4EF"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: promo,
    onChange: e => setPromo(e.target.checked),
    id: "ubb-promo"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "ubb-promo",
    style: {
      fontSize: 11.5,
      color: '#323130'
    }
  }, "Promotional allowance active (2026-06-01 to 2026-09-01: ", UBB_PLANS[plan].promo.toLocaleString(), " credits per user; standard ", UBB_PLANS[plan].inc.toLocaleString(), ")"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Usage profile, per active developer per day"), /*#__PURE__*/React.createElement(Slider, {
    label: "Chat interactions",
    value: chatN,
    min: 0,
    max: 60,
    onChange: setChatN,
    color: "#0078D4"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      margin: '6px 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Input tokens / chat"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: chatIn,
    onChange: e => setChatIn(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Output tokens / chat"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: chatOut,
    onChange: e => setChatOut(Number(e.target.value) || 0)
  }))), /*#__PURE__*/React.createElement(Slider, {
    label: "Agent mode runs",
    value: agentN,
    min: 0,
    max: 15,
    onChange: setAgentN,
    color: "#5C2D91"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8,
      margin: '6px 0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Iterations / run"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: agIter,
    onChange: e => setAgIter(Number(e.target.value) || 1)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Input / iteration"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: agIn,
    onChange: e => setAgIn(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Output / iteration"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: agOut,
    onChange: e => setAgOut(Number(e.target.value) || 0)
  }))), hasInput && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886',
      marginBottom: 8
    }
  }, "One agent run at this profile costs about ", Math.round(R.agentCrRun), " credits at the current mix. Each iteration resends prior context plus tool results; tool definitions alone add 50 to 200 tokens per tool per turn."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Code reviews / week"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: revWk,
    onChange: e => setRevWk(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Credits / review (est.)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: revCr,
    onChange: e => setRevCr(Number(e.target.value) || 0)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#7A5700',
      background: '#FFFBF0',
      border: '1px solid #F2E3B3',
      borderRadius: 6,
      padding: '8px 10px'
    }
  }, "Code review bills twice: AI Credits for tokens plus GitHub Actions minutes for the copilot-pull-request-reviewer workflow. Actions minutes are attributed to the repository, not modeled here."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Cached share of input tokens",
    value: cacheShare,
    min: 0,
    max: 90,
    unit: "%",
    onChange: setCacheShare,
    color: "#00B294"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886'
    }
  }, "Cached input reads at roughly one tenth of the fresh input rate. Field baseline: cache reads dominate token activity in warm sessions.")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Model mix"), /*#__PURE__*/React.createElement("div", {
    style: secSub
  }, "Share of interactions by tier. The blended rate drives everything above."), /*#__PURE__*/React.createElement(Slider, {
    label: "Included (GPT-5 mini, Raptor mini)",
    value: mixI,
    min: 0,
    max: 100,
    unit: "%",
    onChange: v => setMix('I', v),
    color: "#107C10"
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Lightweight metered",
    value: mixL,
    min: 0,
    max: 100,
    unit: "%",
    onChange: v => setMix('L', v),
    color: "#7FBA00"
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Mid tier (Sonnet class)",
    value: mixM,
    min: 0,
    max: 100,
    unit: "%",
    onChange: v => setMix('M', v),
    color: "#0078D4"
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Frontier (Opus class)",
    value: mixF,
    min: 0,
    max: 100,
    unit: "%",
    onChange: v => setMix('F', v),
    color: "#D13438"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 8
    }
  }, [["uniform", "Uniform usage"], ["field", "Field distribution"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setConc(k),
    style: {
      flex: 1,
      padding: '7px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
      border: `1.5px solid ${conc === k ? '#00A4EF' : '#E1DFDD'}`,
      background: conc === k ? '#EFF6FC' : '#fff',
      color: conc === k ? '#005A9E' : '#605E5C'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886',
      marginTop: 6
    }
  }, "Field distribution reflects observed concentration (consumption Gini 0.72 to 0.77; P99 developers consume about 46x the median), which front-loads pool exhaustion.")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer'
    },
    onClick: () => setShowRates(s => !s)
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Rate card, USD per 1M tokens ", showRates ? '▾' : '▸')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886',
      marginBottom: 8
    }
  }, "Defaults from the GitHub Docs models and pricing page as read on 2026-07-03. Rates are a moving target; every cell is editable."), showRates && /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 10.5,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: '1.5px solid #E1DFDD'
    }
  }, ["Model", "In", "Cached", "Write", "Out"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: h === "Model" ? 'left' : 'right',
      padding: '4px 4px',
      color: '#605E5C'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rates.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    style: {
      borderBottom: '1px solid #F3F2F1'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 4px',
      fontWeight: 600
    }
  }, r.nm), ["ic", "cc", "cw", "oc"].map(f => /*#__PURE__*/React.createElement("td", {
    key: f,
    style: {
      padding: '2px 2px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    value: r[f],
    onChange: e => updRate(i, f, Number(e.target.value) || 0),
    style: {
      ...inp,
      padding: '2px 4px',
      fontSize: 10.5,
      textAlign: 'right',
      height: 24
    }
  })))))))))), /*#__PURE__*/React.createElement("div", null, hasInput && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Where the credits go, per active developer per month"), R.feat.map(f => /*#__PURE__*/React.createElement(BarRow, {
    key: f.lbl,
    l: f.lbl,
    v: f.val * 0.01,
    total: R.userMo * 0.01,
    color: f.clr
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886',
      marginTop: 4
    }
  }, "Completions and Next Edit Suggestions are not in this chart because they never consume credits.")), hasInput && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Optimization levers, multiplicative"), /*#__PURE__*/React.createElement("div", {
    style: secSub
  }, "Each lever reduces metered consumption independently; the effects compound. Combined multiplier now: x", R.leverMult.toFixed(2), " on the raw bill of ", cr(R.rawUserMo), " credits per developer."), LEVERS.map(L => /*#__PURE__*/React.createElement("div", {
    key: L.k,
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: L.n,
    value: lv[L.k],
    min: 0,
    max: L.max,
    unit: "%",
    onChange: v => setLever(L.k, v),
    color: "#7FBA00"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886',
      marginTop: -4
    }
  }, L.d))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F1FAF1',
      border: '1px solid #9FD99F',
      borderRadius: 8,
      padding: '10px 12px',
      marginTop: 6,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#107C10'
    }
  }, "Savings from levers"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: '#107C10'
    }
  }, c$(R.savedMo), " / month"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Governance checklist"), ["Credits are pooled at the billing entity: one heavy agent session can drain the shared pool early in the cycle", "Budgets exist at four levels: user, cost center, organization and enterprise; set them before, not after, the first overage", "Stop usage at budget limit is OFF by default for enterprise and cost center budgets; enable it explicitly or charges continue past the limit", "Choose the additional usage policy deliberately: allowed bills overage at $0.01 per credit, blocked stops work until the next cycle", "Credits do not roll over, and the old fallback to a cheaper model when quota runs out no longer exists", "The promotional allowance ends 2026-09-01; treat that date as the mid program checkpoint and re baseline budgets then"].map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      padding: '7px 0',
      borderBottom: i < 5 ? '1px solid #F3F2F1' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#00A4EF',
      fontWeight: 700
    }
  }, "✓"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: '#323130',
      lineHeight: 1.5
    }
  }, t)))))));
}

/* ══════════ NEW TAB: Workspace & Repository Token Calculator ══════════ */

/* ===== Ported from v1 (Workspace token calculator) ===== */
const WS_MODES = [{
  id: "ask",
  nm: "Ask",
  icon: "💬",
  iters: 1,
  ctxMult: 1.0,
  outTok: 800,
  defTier: "included",
  when: "Questions, explanations, single answers. One turn, cheapest surface. If a chat turn answers it, never send an agent."
}, {
  id: "edit",
  nm: "Edit",
  icon: "✏️",
  iters: 1,
  ctxMult: 1.2,
  outTok: 1500,
  defTier: "mid",
  when: "Scoped edits across selected files. You choose the files, the model edits. Predictable cost, no tool loop."
}, {
  id: "plan",
  nm: "Plan",
  icon: "🗺️",
  iters: 2,
  ctxMult: 1.3,
  outTok: 2000,
  defTier: "mid",
  when: "Generate and refine a plan before touching code. Cheap insurance: a reviewed plan prevents runaway agent loops later."
}, {
  id: "agent",
  nm: "Agent",
  icon: "🤖",
  iters: 8,
  ctxMult: 1.6,
  outTok: 2500,
  defTier: "mid",
  when: "Multi step work: read, edit, test, iterate. Pays back on investigative and multi file tasks; about 10x a chat turn on single edits."
}, {
  id: "cloud",
  nm: "Coding Agent",
  icon: "☁️",
  iters: 15,
  ctxMult: 1.8,
  outTok: 3000,
  defTier: "mid",
  when: "Delegate an issue, receive a PR. Longest sessions, largest budgets. Defaults to Claude Sonnet 4.6; configure per repo."
}, {
  id: "review",
  nm: "Code Review",
  icon: "🔍",
  iters: 4,
  ctxMult: 1.4,
  outTok: 1200,
  defTier: "mid",
  when: "Automated PR review. Bills AI Credits plus GitHub Actions minutes; model is selected automatically and not disclosed."
}];
const WS_TIERS = {
  included: {
    nm: "Included",
    ic: 0,
    cc: 0,
    oc: 0,
    clr: "#107C10"
  },
  light: {
    nm: "Lightweight",
    ic: 0.20,
    cc: 0.02,
    oc: 1.25,
    clr: "#7FBA00"
  },
  mid: {
    nm: "Mid tier",
    ic: 3.00,
    cc: 0.30,
    oc: 15.00,
    clr: "#0078D4"
  },
  frontier: {
    nm: "Frontier",
    ic: 5.00,
    cc: 0.50,
    oc: 25.00,
    clr: "#D13438"
  }
};
const WS_TASKS = [{
  id: "quick",
  nm: "Quick question",
  mode: "ask",
  tier: "included",
  vol: 180
}, {
  id: "inline",
  nm: "Inline or single edit",
  mode: "edit",
  tier: "light",
  vol: 80
}, {
  id: "tests",
  nm: "Test generation",
  mode: "edit",
  tier: "mid",
  vol: 30
}, {
  id: "plan",
  nm: "Plan a change",
  mode: "plan",
  tier: "mid",
  vol: 15
}, {
  id: "refac",
  nm: "Multi file refactor",
  mode: "agent",
  tier: "mid",
  vol: 12
}, {
  id: "invest",
  nm: "Bug investigation",
  mode: "agent",
  tier: "mid",
  vol: 10
}, {
  id: "arch",
  nm: "Architecture analysis",
  mode: "agent",
  tier: "frontier",
  vol: 3
}, {
  id: "issue",
  nm: "Issue to PR delegation",
  mode: "cloud",
  tier: "mid",
  vol: 4
}, {
  id: "prrev",
  nm: "PR review",
  mode: "review",
  tier: "mid",
  vol: 20
}];
const tok = lines => Math.round(lines * 9); /* about 9 tokens per line of prose or config */

function WorkspaceCalculator() {
  const locRef = React.useRef(null);
  useLocalizeSubtree(locRef);
  const W = {
    maxWidth: 1140,
    margin: '0 auto'
  };
  const secH = {
    fontSize: 14,
    fontWeight: 700,
    color: '#201F1E',
    marginBottom: 4
  };
  const secSub = {
    fontSize: 11.5,
    color: '#605E5C',
    marginBottom: 12,
    lineHeight: 1.5
  };
  const inp = {
    width: '100%',
    padding: '5px 8px',
    border: '1px solid #E1DFDD',
    borderRadius: 4,
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box'
  };
  const lbl = {
    fontSize: 11,
    fontWeight: 600,
    color: '#323130',
    display: 'block',
    marginBottom: 3
  };

  /* ── Repository primitives ── */
  const [instrLines, setInstrLines] = useState(120);
  const [scopedN, setScopedN] = useState(4);
  const [scopedLines, setScopedLines] = useState(40);
  const [promptFiles, setPromptFiles] = useState(6);
  const [agentsN, setAgentsN] = useState(3);
  const [agentSys, setAgentSys] = useState(300);
  const [toolsPerAgent, setToolsPerAgent] = useState(6);
  const [toolTok, setToolTok] = useState(120);
  const [mcpN, setMcpN] = useState(3);
  const [mcpTools, setMcpTools] = useState(8);
  const [skillsN, setSkillsN] = useState(4);
  const [memory, setMemory] = useState(true);

  /* ── Context assembly per request ── */
  const [userPrompt, setUserPrompt] = useState(120);
  const [editorTok, setEditorTok] = useState(3000);
  const [wsTok, setWsTok] = useState(0);
  const [histTok, setHistTok] = useState(3000);
  const [turns, setTurns] = useState(6);
  const [cacheRead, setCacheRead] = useState(60);

  /* ── Task volumes and routing ── */
  const [tasks, setTasks] = useState(WS_TASKS.map(t => ({
    ...t
  })));
  const updTask = (i, f, v) => setTasks(ts => ts.map((t, j) => j === i ? {
    ...t,
    [f]: v
  } : t));
  const [naked, setNaked] = useState(false); /* compare against a repo with no primitives */

  const R = useMemo(() => {
    const SYS = 500; /* fixed platform system prompt */
    const instrTok = tok(instrLines);
    const scopedTok = tok(scopedLines); /* only the matching scope loads per request */
    const agentDefTok = agentSys + toolsPerAgent * toolTok; /* per invoked agent */
    const mcpSchemaTok = mcpN * mcpTools * toolTok; /* schemas ride along on agent turns */
    const skillTok = 0; /* skills load on demand; charged when triggered, not per request */

    /* Context tax: input tokens assembled before the model writes a single output token */
    const baseCtx = SYS + instrTok + scopedTok + userPrompt + editorTok + wsTok + histTok + (memory ? 0 : 400);
    const agentCtx = baseCtx + agentDefTok + mcpSchemaTok;
    const cs = cacheRead / 100;
    const rate = WS_TIERS.mid;
    const taxFreshCr = baseCtx / 1e6 * rate.ic * 100;
    const taxCachedCr = (baseCtx * (1 - cs) / 1e6 * rate.ic + baseCtx * cs / 1e6 * rate.cc) * 100;
    const agentTaxCr = (agentCtx * (1 - cs) / 1e6 * rate.ic + agentCtx * cs / 1e6 * rate.cc) * 100;

    /* Naked repo baseline: no instructions means the developer re explains context each session and attaches broadly */
    const nakedExtra = instrTok === 0 ? 0 : instrTok + 600; /* re typed context plus broader attachments */

    /* Per task cost: iterations x (context x mode multiplier as input, output per iteration), at the task tier */
    const rows = tasks.map(t => {
      const m = WS_MODES.find(x => x.id === t.mode);
      const tr = WS_TIERS[t.tier];
      const ctx = (t.mode === "agent" || t.mode === "cloud" ? agentCtx : baseCtx) * m.ctxMult + (naked ? nakedExtra : 0);
      const inTot = ctx * m.iters * (1 + 0.08 * (m.iters - 1) / 2); /* history grows across iterations */
      const outTot = m.outTok * m.iters;
      const usd = inTot * (1 - cs) / 1e6 * tr.ic + inTot * cs / 1e6 * tr.cc + outTot / 1e6 * tr.oc;
      const credits = usd * 100;
      return {
        ...t,
        m,
        tr,
        credits,
        moCredits: credits * t.vol
      };
    });
    const moTotal = rows.reduce((s, r) => s + r.moCredits, 0);

    /* Routing comparison: everything on frontier vs the routed table above */
    const allFrontier = tasks.reduce((s, t) => {
      const m = WS_MODES.find(x => x.id === t.mode);
      const tr = WS_TIERS.frontier;
      const ctx = (t.mode === "agent" || t.mode === "cloud" ? agentCtx : baseCtx) * m.ctxMult;
      const inTot = ctx * m.iters * (1 + 0.08 * (m.iters - 1) / 2);
      const usd = inTot * (1 - cs) / 1e6 * tr.ic + inTot * cs / 1e6 * tr.cc + m.outTok * m.iters / 1e6 * tr.oc;
      return s + usd * 100 * t.vol;
    }, 0);
    const routeSave = allFrontier - moTotal;

    /* Primitives ROI: read cost vs what they remove */
    const primReadMo = rows.reduce((s, r) => s + ((instrTok + scopedTok) * (1 - cs) / 1e6 * r.tr.ic + (instrTok + scopedTok) * cs / 1e6 * r.tr.cc) * 100 * r.m.iters * r.vol, 0);
    const primSaveMo = rows.reduce((s, r) => s + (nakedExtra * (1 - cs) / 1e6 * r.tr.ic + nakedExtra * cs / 1e6 * r.tr.cc) * 100 * r.m.iters * r.vol, 0);
    const sessionCr = taxFreshCr + (turns - 1) * taxCachedCr;
    return {
      SYS,
      instrTok,
      scopedTok,
      agentDefTok,
      mcpSchemaTok,
      baseCtx,
      agentCtx,
      taxFreshCr,
      taxCachedCr,
      agentTaxCr,
      rows,
      moTotal,
      allFrontier,
      routeSave,
      primReadMo,
      primSaveMo,
      sessionCr,
      cs,
      nakedExtra
    };
  }, [instrLines, scopedN, scopedLines, promptFiles, agentsN, agentSys, toolsPerAgent, toolTok, mcpN, mcpTools, skillsN, memory, userPrompt, editorTok, wsTok, histTok, turns, cacheRead, tasks, naked]);
  const cr = n => n >= 100 ? Math.round(n).toLocaleString() : n >= 1 ? n.toFixed(1) : n.toFixed(2);
  const c$ = n => '$' + (n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(2));
  const kpiC = (cl, bg) => ({
    background: bg,
    borderRadius: 8,
    padding: '12px',
    border: '1px solid ' + cl + '28',
    textAlign: 'center'
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: locRef,
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      borderLeft: '4px solid #7FBA00'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Workspace and Repository Token Calculator"), /*#__PURE__*/React.createElement("div", {
    style: secSub
  }, "Models the token bill of a GitHub Copilot workspace from its repository primitives up: what each request carries as context before any output, what each mode costs per task, and what routing the right model to the right task saves. Rates use the Sonnet class mid tier for the context tax and each task row's own tier for task costs.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5,1fr)',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: kpiC('#0078D4', '#EFF6FC')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#0078D4',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Context tax, fresh"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, cr(R.taxFreshCr), " cr"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, R.baseCtx.toLocaleString(), " tokens before output")), /*#__PURE__*/React.createElement("div", {
    style: kpiC('#00B294', '#F0FBF9')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#00745F',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Context tax, cached"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, cr(R.taxCachedCr), " cr"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, cacheRead, "% cache read share")), /*#__PURE__*/React.createElement("div", {
    style: kpiC('#5C2D91', '#F5F0FF')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#5C2D91',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Agent turn tax"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, cr(R.agentTaxCr), " cr"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, R.agentCtx.toLocaleString(), " tokens incl. tool schemas")), /*#__PURE__*/React.createElement("div", {
    style: kpiC('#D19200', '#FFFBF0')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#7A5700',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Monthly, per dev"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, cr(R.moTotal), " cr"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, c$(R.moTotal * 0.01), " at the task table")), /*#__PURE__*/React.createElement("div", {
    style: kpiC('#107C10', '#F1FAF1')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#107C10',
      textTransform: 'uppercase',
      letterSpacing: '.06em'
    }
  }, "Routing saves"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, c$(R.routeSave * 0.01)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#8A8886'
    }
  }, "vs everything on frontier"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Repository primitives"), /*#__PURE__*/React.createElement("div", {
    style: secSub
  }, "Versioned files that turn a naked repo into a governed workspace. Each has a read cost per request and removes a larger re explanation cost."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "copilot-instructions.md, lines"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: instrLines,
    onChange: e => setInstrLines(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Scoped .instructions.md files"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: scopedN,
    onChange: e => setScopedN(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Lines per scoped file"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: scopedLines,
    onChange: e => setScopedLines(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Prompt files"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: promptFiles,
    onChange: e => setPromptFiles(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Custom agents"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: agentsN,
    onChange: e => setAgentsN(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "System prompt tokens / agent"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: agentSys,
    onChange: e => setAgentSys(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Tools per agent"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: toolsPerAgent,
    onChange: e => setToolsPerAgent(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Tokens per tool schema"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: toolTok,
    onChange: e => setToolTok(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "MCP servers"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: mcpN,
    onChange: e => setMcpN(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Tools per MCP server"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: mcpTools,
    onChange: e => setMcpTools(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Skills (load on demand)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: skillsN,
    onChange: e => setSkillsN(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 6,
      paddingBottom: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    id: "ws-mem",
    checked: memory,
    onChange: e => setMemory(e.target.checked)
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "ws-mem",
    style: {
      fontSize: 11.5
    }
  }, "Copilot Memory active"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886'
    }
  }, "Skills are charged only when triggered, so they do not enter the per request tax. Tool schemas ride along on every agent turn: ", toolsPerAgent, " tools x ", toolTok, " tokens = ", (toolsPerAgent * toolTok).toLocaleString(), " tokens per agent, every iteration. Audit unused tools quarterly.")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Context assembly per request"), /*#__PURE__*/React.createElement("div", {
    style: secSub
  }, "What travels as input before the model writes anything."), [["Platform system prompt", R.SYS], ["Repository instructions", R.instrTok], ["Scoped instructions (matching path)", R.scopedTok], ["Conversation history", histTok], ["Editor context", editorTok], ["@workspace context", wsTok], ["User prompt", userPrompt]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11.5,
      padding: '5px 0',
      borderBottom: '1px solid #F3F2F1'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#323130'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono,monospace',
      fontWeight: 600,
      color: '#0078D4'
    }
  }, Number(v).toLocaleString(), " tok"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      padding: '7px 0',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", null, "Base context per turn"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono,monospace',
      color: '#201F1E'
    }
  }, R.baseCtx.toLocaleString(), " tok")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "User prompt tokens"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: userPrompt,
    onChange: e => setUserPrompt(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Editor context tokens"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: editorTok,
    onChange: e => setEditorTok(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "@workspace tokens"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: wsTok,
    onChange: e => setWsTok(Number(e.target.value) || 0)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "History tokens"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: inp,
    value: histTok,
    onChange: e => setHistTok(Number(e.target.value) || 0)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Cache read share after turn 1",
    value: cacheRead,
    min: 0,
    max: 90,
    unit: "%",
    onChange: setCacheRead,
    color: "#00B294"
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Turns per session",
    value: turns,
    min: 1,
    max: 20,
    onChange: setTurns,
    color: "#0078D4"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886'
    }
  }, "A ", turns, " turn session costs about ", cr(R.sessionCr), " credits of context alone: one fresh assembly, then ", turns - 1, " mostly cached turns. Starting a fresh chat for every related question resets the cache and pays the fresh tax again."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Execution surfaces: when to use Ask, Edit, Plan, Agent"), WS_MODES.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    style: {
      display: 'flex',
      gap: 10,
      padding: '9px 0',
      borderBottom: '1px solid #F3F2F1',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, m.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700
    }
  }, m.nm), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      color: '#8A8886',
      background: '#F3F2F1',
      borderRadius: 100,
      padding: '2px 8px'
    }
  }, m.iters, " iteration", m.iters > 1 ? 's' : '', " · ctx x", m.ctxMult)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#605E5C',
      lineHeight: 1.45
    }
  }, m.when))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Cost per task with model routing"), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      color: '#605E5C'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: naked,
    onChange: e => setNaked(e.target.checked)
  }), "Simulate naked repo")), /*#__PURE__*/React.createElement("div", {
    style: secSub
  }, "Volumes are per developer per month and editable. Tier is the routing decision; override any row."), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 11,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: '1.5px solid #E1DFDD'
    }
  }, ["Task", "Mode", "Tier", "Vol/mo", "Credits/task", "Credits/mo"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: h === "Task" ? 'left' : 'right',
      padding: '5px 6px',
      color: '#605E5C',
      fontWeight: 600
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, R.rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    style: {
      borderBottom: '1px solid #F3F2F1'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '5px 6px',
      fontWeight: 600
    }
  }, r.nm), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '5px 6px',
      textAlign: 'right',
      color: '#605E5C'
    }
  }, r.m.icon, " ", r.m.nm), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 4px',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: r.tier,
    onChange: e => updTask(i, 'tier', e.target.value),
    style: {
      ...inp,
      padding: '2px 4px',
      fontSize: 10.5,
      height: 24,
      width: 110,
      color: WS_TIERS[r.tier].clr,
      fontWeight: 600
    }
  }, Object.entries(WS_TIERS).map(([k, t]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, t.nm)))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 4px',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: r.vol,
    onChange: e => updTask(i, 'vol', Number(e.target.value) || 0),
    style: {
      ...inp,
      padding: '2px 4px',
      fontSize: 10.5,
      height: 24,
      width: 60,
      textAlign: 'right'
    }
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '5px 6px',
      textAlign: 'right',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, cr(r.credits)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '5px 6px',
      textAlign: 'right',
      fontFamily: 'JetBrains Mono,monospace',
      fontWeight: 700,
      color: '#0078D4'
    }
  }, cr(r.moCredits)))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 5,
    style: {
      padding: '7px 6px',
      fontWeight: 700
    }
  }, "Total per developer per month"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '7px 6px',
      textAlign: 'right',
      fontWeight: 800,
      fontFamily: 'JetBrains Mono,monospace',
      color: '#201F1E'
    }
  }, cr(R.moTotal)))))), naked && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#D13438',
      background: '#FDF3F4',
      border: '1px solid #F1BBBC',
      borderRadius: 6,
      padding: '8px 10px',
      marginTop: 8
    }
  }, "Naked repo simulation adds ", R.nakedExtra.toLocaleString(), " tokens of re explained context per turn: the improvisation tax that primitives remove.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Primitives read cost vs savings"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11.5,
      padding: '5px 0'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Instructions read cost / dev / mo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono,monospace',
      color: '#D13438'
    }
  }, cr(R.primReadMo), " cr")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11.5,
      padding: '5px 0'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Re explanation removed / dev / mo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono,monospace',
      color: '#107C10'
    }
  }, cr(R.primSaveMo), " cr")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: R.primSaveMo >= R.primReadMo ? '#F1FAF1' : '#FFFBF0',
      border: '1px solid ' + (R.primSaveMo >= R.primReadMo ? '#9FD99F' : '#F2E3B3'),
      borderRadius: 8,
      padding: '10px 12px',
      marginTop: 6,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#605E5C'
    }
  }, "Net effect of governed context"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: R.primSaveMo >= R.primReadMo ? '#107C10' : '#7A5700'
    }
  }, R.primSaveMo >= R.primReadMo ? 'saves' : 'costs', " ", cr(Math.abs(R.primSaveMo - R.primReadMo)), " cr / dev / mo")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886',
      marginTop: 6
    }
  }, "Instructions pay a small read cost on every turn and remove a larger improvisation cost. Keep them lean: dump all context is the most expensive anti pattern.")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Routing discipline"), [["All tasks on frontier", R.allFrontier, "#D13438"], ["Routed as configured", R.moTotal, "#107C10"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11.5,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", null, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: c
    }
  }, cr(v), " cr")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: '#F3F2F1',
      borderRadius: 4,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.min(100, v / Math.max(R.allFrontier, 1) * 100)}%`,
      height: '100%',
      background: c
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: '#8A8886',
      marginTop: 4
    }
  }, "Auto model selection is available on every GitHub Copilot plan. Override down for well structured repetitive work, override up for novel and high stakes work. A careless model picker is a billing bug."))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: secH
  }, "Field rules of thumb"), ["If a chat turn answers it, do not send an agent: the single edit premium in Agent mode is about 10x for zero added value", "Plan first on anything above trivial: a reviewed plan is the cheapest guardrail against runaway agent loops", "Cap agent conversations near 150,000 tokens, roughly 2x your P90 task, and alert at 50 and 80 percent of monthly budgets", "Write reusable prompts and instruction files in English: PT-BR and Spanish cost roughly 20 to 40 percent more tokens on the o200k tokenizer; the code stays in whatever language it is", "Output rate dominates the bill at 4 to 6x input on most models: ask for diffs and terse answers, not essays", "Every unused tool schema costs 50 to 200 tokens on every agent turn: audit the tool set quarterly"].map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      padding: '7px 0',
      borderBottom: i < 5 ? '1px solid #F3F2F1' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#7FBA00',
      fontWeight: 700
    }
  }, "→"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: '#323130',
      lineHeight: 1.5
    }
  }, t)))))));
}

function UBBTab() {
  return <UBBCalculator />;
}

function App() {
  const [tab, setTab] = useState(0);
  const tr = useT();
  const loc = React.useContext(LocaleContext);
  React.useEffect(() => {
    const id = setTimeout(() => applyStaticCopyLocale(loc), 0);
    return () => clearTimeout(id);
  }, [loc, tab]);
  const tabs = [
    { icon: "layers" },
    { icon: "calculator" },
    { icon: "construction" },
    { icon: "calculator" },
    { icon: "bookOpen" },
    { icon: "users" },
    { icon: "bot" },
    { icon: "database" },
  ];
  return (<>
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Toolkit sections">
        <div className="sidebar-eyebrow">{tr('navLabel')}</div>
        {tabs.map((t, i) => (
          <button key={i} className={`sidebar-link ${tab === i ? "on" : ""}`} onClick={() => setTab(i)}>
            <span className="sidebar-link__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="sidebar-link__icon"><Icon name={t.icon || "layers"} size={16} /></span>
            <span className="sidebar-link__label">{tr('nav' + i + 'Label')}</span>
          </button>
        ))}
      </aside>
      <main className="app-main">
        <header className="hdr">
          <div className="hdr-inner">
            <div className="hdr-eyebrow"><span className="dot-inline" /><span>{tr('brandTopic')}</span> &middot; v2.0.0</div>
            <h1>{tr('nav' + tab + 'Label')}</h1>
            <p>{tr('nav' + tab + 'Desc')}</p>
          </div>
        </header>
        <div className="wrap">
          {tab === 0 && <OverviewTab onNavigate={setTab} />}
          {tab === 1 && <UBBTab />}
          {tab === 2 && <ArchitectureAdvisor />}
          {tab === 3 && <ROICalculatorTab />}
          {tab === 4 && <GartnerResearch />}
          {tab === 5 && <PersonaROI />}
          {tab === 6 && <AgentAdvisor />}
          {tab === 7 && <WorkspaceCalculator />}
        </div>
      </main>
    </div>
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <svg width="22" height="22" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="0" y="0" width="8" height="8" fill="#F25022" /><rect x="9" y="0" width="8" height="8" fill="#7FBA00" /><rect x="0" y="9" width="8" height="8" fill="#00A4EF" /><rect x="9" y="9" width="8" height="8" fill="#FFB900" /></svg>
          <span>Paula Silva</span>
          <span className="footer-brand__div">|</span>
          <span>{tr('brandRole')}</span>
        </div>
        <h2 className="footer-title">{tr('closingTitle')}</h2>
        <p className="footer-sub">Paula Silva &middot; Software Global Black Belt</p>
        <div className="footer-cta">
          <a href="../index.html" className="footer-btn footer-btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9M5 10v10h14V10" /></svg>
            <span className="footer-btn-label">
              <span className="footer-btn-kicker">{tr('closingHubKicker')}</span>
              <span className="footer-btn-value">{tr('closingHub')}</span>
            </span>
          </a>
          <a href="landing.html" className="footer-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4zM4 16h16" /></svg>
            <span className="footer-btn-label">
              <span className="footer-btn-kicker">{tr('closingLandingKicker')}</span>
              <span className="footer-btn-value">{tr('closingLanding')}</span>
            </span>
          </a>
          <a href="mailto:paulasilva@microsoft.com" className="footer-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
            <span className="footer-btn-label">
              <span className="footer-btn-kicker">{tr('closingContactKicker')}</span>
              <span className="footer-btn-value">paulasilva@microsoft.com</span>
            </span>
          </a>
        </div>
        <div className="footer-meta">
          <span>paulasilva &middot; 2026-07-06</span>
          <span>Agentic AI ROI Toolkit &middot; v2.0.0</span>
        </div>
        <p className="footer-license">Sources: Gartner G00837723, G00799085, G00841080, G00846878, G00823006, G00825224</p>
      </div>
    </footer>
  </>);
}

ReactDOM.createRoot(document.getElementById("root")).render(<LocaleProvider><App /></LocaleProvider>);
