#!/usr/bin/env node
// Freeweights static site builder. Zero dependencies (Node 18+).
// Reads the same data the Worker serves: catalog rows, manifests, the ledger CSVs and the
// mirror registry, plus the spec and policy files, and writes plain HTML into site/dist.
//   node site/build.mjs            (or: cd site && npm run build)
// FW_ROOT points at another repo root (used to test empty and error states); FW_OUT changes dist.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const SITE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.env.FW_ROOT || path.join(SITE, '..'));
const OUT = path.resolve(process.env.FW_OUT || path.join(SITE, 'dist'));
const ORIGIN = 'https://freeweights.allternit.com';
const KEY_ID = '2DC28CC7B26A283B';

// ---------- helpers ----------
const rd = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);
const readJSON = (p) => JSON.parse(rd(p));
const ls = (d, re) => (exists(d) ? fs.readdirSync(d).filter((f) => re.test(f)).sort().map((f) => path.join(d, f)) : []);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtBytes = (n) => {
  if (n == null || isNaN(n)) return 'size unknown';
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; let v = Number(n);
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return (v >= 100 || i === 0 ? Math.round(v).toLocaleString('en-US') : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + u[i];
};
const fmtParams = (n) => (!n ? '' : n >= 1e9 ? +(n / 1e9).toFixed(1) + 'B' : +(n / 1e6).toFixed(0) + 'M') + ' params';
const fmtTime = (t) => { if (!t) return 'never'; const d = new Date(t); return isNaN(d) ? esc(t) : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; };
const usd = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' USD';
const LICENSE_NAMES = { 'apache-2.0': 'Apache-2.0', mit: 'MIT', 'bsd-2-clause': 'BSD-2-Clause', 'bsd-3-clause': 'BSD-3-Clause', 'cc-by-4.0': 'CC-BY-4.0', 'cc0-1.0': 'CC0-1.0' };
const licName = (id) => (!id ? 'see card' : LICENSE_NAMES[String(id).toLowerCase()] || String(id).replace(/^LicenseRef-/, '') + (String(id).startsWith('LicenseRef-') ? ' (custom)' : ''));
const isCustom = (id) => String(id || '').startsWith('LicenseRef-');
const BADGE = { hosted: 'host', host: 'host', allternit: 'host', seeded: 'seed', seed: 'seed', community: 'seed', source: 'src', src: 'src' };
const BADGE_KEY = { host: 'hosted', seed: 'seeded', src: 'source' };
const SUPPORT_LINE = 'Support goes to Allternit LLC. It is not a charitable gift and is not tax-deductible.';

function csv(text) {
  const out = []; let row = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.some((x) => x !== '')) out.push(row); row = []; }
    else f += c;
  }
  row.push(f); if (row.some((x) => x !== '')) out.push(row);
  const [h, ...rest] = out; if (!h) return [];
  return rest.map((r) => Object.fromEntries(h.map((k, i) => [k.trim().toLowerCase(), (r[i] ?? '').trim()])));
}
function mdSection(md, heading) {
  const m = md.split('\n'); const i = m.findIndex((l) => l.replace(/^#+\s*/, '').trim() === heading);
  if (i < 0) return [];
  const o = []; for (let j = i + 1; j < m.length && !/^#{1,2}\s/.test(m[j]); j++) o.push(m[j]);
  return o;
}
const mdBullets = (lines) => lines.filter((l) => /^\s*(-|\d+\.)\s/.test(l)).map((l) => l.replace(/^\s*(-|\d+\.)\s+/, ''));
const mdInline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

// ---------- data ----------
const schema = readJSON(path.join(ROOT, 'spec/catalog-schema.json'));
const SECTIONS = (schema['x-sections'] || []).map((s) => ({ ...s, family: s.id.replace(/^alt\.freeweights\./, '') }));

let dataSource = 'catalog';
function loadRows() {
  const found = [];
  const add = (v) => { if (Array.isArray(v)) v.forEach(add); else if (v && Array.isArray(v.rows)) v.rows.forEach(add); else if (v && Array.isArray(v.models)) v.models.forEach(add); else if (v && v.id && v.section) found.push(v); };
  const cat = path.join(ROOT, 'catalog');
  for (const f of [...ls(cat, /\.json$/), ...ls(path.join(cat, 'rows'), /\.json$/)]) { try { add(readJSON(f)); } catch (e) { console.warn('skip unreadable row file', f, e.message); } }
  if (!found.length && REAL_MANIFESTS) { dataSource = 'manifests'; Object.values(manifests).forEach((m) => add(rowFromManifest(m))); }
  if (!found.length) { dataSource = 'samples'; loadManifests(ls(path.join(ROOT, 'spec/samples'), /\.manifest\.json$/)); ls(path.join(ROOT, 'spec/samples'), /\.catalog-row\.json$/).forEach((f) => add(readJSON(f))); }
  const seen = new Set(); return found.filter((r) => !seen.has(r.id) && seen.add(r.id));
}
const manifests = {}; const minisig = {}; const manifestFile = {};
function loadManifests(files) {
  for (const f of files) {
    try { const m = readJSON(f); if (m.id) { manifests[m.id] = m; manifestFile[m.id] = f; minisig[m.id] = exists(f + '.minisig') ? f + '.minisig' : null; } } catch (e) { console.warn('skip unreadable manifest', f, e.message); }
  }
}
loadManifests(ls(path.join(ROOT, 'manifests'), /\.json$/));
const REAL_MANIFESTS = Object.keys(manifests).length;
const FMT = [[/\.safetensors$/, 'safetensors'], [/\.gguf$/, 'gguf'], [/\.onnx$/, 'onnx']];
function rowFromManifest(m) {
  const files = m.files || []; const formats = new Set();
  files.forEach((f) => FMT.forEach(([re, n]) => re.test(f.path) && formats.add(n)));
  if (/mlx/i.test(m.id) && formats.has('safetensors')) { formats.delete('safetensors'); formats.add('mlx'); }
  return { id: m.id, section: m.section, display_name: m.id.split('/').pop(), license_id: m.license && m.license.id, redistribution: m.license && m.license.redistribution,
    formats: [...formats], tasks: [], total_size: files.reduce((a, f) => a + (f.size || 0), 0), upstream_url: `https://${(m.upstream && m.upstream.host) || 'huggingface.co'}/${m.id}`,
    manifest_url: `${ORIGIN}/manifests/${m.id}.json`, added_at: m.created_at, sample: !!m.sample, badges: [] };
}
function sourceState(m) {
  const srcs = (m && m.sources) || [];
  const failed = (s) => s.status === 'failed' || s.ok === false || s.check === 'failed';
  const times = srcs.map((s) => s.last_checked).filter(Boolean).sort();
  return { srcs, failed, allFailed: srcs.length > 0 && srcs.every(failed), last: times[times.length - 1] || null };
}
const ROWS = loadRows().map((r) => {
  const m = manifests[r.id]; const st = sourceState(m);
  const badges = [...new Set([...(r.badges || []), ...st.srcs.filter((s) => !st.failed(s)).map((s) => s.type)].map((b) => BADGE[b]).filter(Boolean))];
  const lastByType = {}; st.srcs.forEach((s) => { const k = BADGE[s.type]; if (k && s.last_checked && (!lastByType[k] || s.last_checked > lastByType[k])) lastByType[k] = s.last_checked; });
  const seeders = st.srcs.filter((s) => BADGE[s.type] === 'seed').reduce((a, s) => a + (Number(s.seeders) || 0), 0) || null;
  return {
    id: r.id, key: r.id.replace(/\//g, '__'), org: r.id.split('/')[0], repo: r.id.split('/').slice(1).join('/'),
    name: r.display_name || r.id.split('/').pop(), section: r.section, family: r.family || r.section.replace(/^alt\.freeweights\./, ''),
    badges, lastByType, seeders, license: r.license_id || (m && m.license && m.license.id) || null, redistribution: r.redistribution || (m && m.license && m.license.redistribution) || null,
    formats: r.formats || [], tasks: r.tasks || [], size: r.total_size ?? (m ? (m.files || []).reduce((a, f) => a + (f.size || 0), 0) : null),
    params: r.params, upstream: r.upstream_url, manifestUrl: r.manifest_url, sample: !!r.sample, abliterated: !!r.abliterated,
    licClass: r.license_class || null, requiresTerms: !!r.requires_terms, licenseUrl: r.license_url || null, note: r.note || null,
    linkOnly: r.license_class === 'non-commercial' || r.license_class === 'gated' || !r.manifest_url,
    sourceOnly: r.license_class === 'non-commercial' || !m,
    base: r.base_model, changed: r.what_changed, added: r.added_at, manifest: m || null,
    unsigned: !!(m && !m.sample && !minisig[r.id]),
    wanted: r.status === 'wanted' || st.allFailed || !!(m && !m.sample && !minisig[r.id]), failedAt: st.allFailed ? st.last : null, lastCheck: st.last,
  };
}).sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')) || a.name.localeCompare(b.name));
// Publisher avatars, fetched once by scripts/fetch_org_logos.py into site/assets/orgs/ and served
// from this site (never hotlinked). An org without one shows the monogram alone.
const LOGOS = (() => { try { const j = readJSON(path.join(SITE, 'assets/orgs/sources.json')); return Object.fromEntries(Object.entries(j).filter(([, v]) => v && v.file && exists(path.join(SITE, 'assets/orgs', v.file))).map(([k, v]) => [k, '/assets/orgs/' + v.file])); } catch (e) { return {}; } })();
const logoOf = (org) => LOGOS[org] || '';
const LOGO_LINE = 'Logos belong to their owners and identify the publisher. No partnership or endorsement is implied.';
const TOOLS = (() => { try { return readJSON(path.join(ROOT, 'catalog', 'tools.json')).tools || []; } catch (e) { return []; } })();
const secCount = (s) => s.id === 'alt.freeweights.tools' ? TOOLS.length : bySection(s.id).length;
const LISTED = ROWS.filter((r) => !r.wanted);
const WANTED = ROWS.filter((r) => r.wanted);
const modelUrl = (r) => `/${r.section}/${r.id}/`;
const sectionUrl = (id) => `/${id}/`;
const bySection = (id) => LISTED.filter((r) => r.section === id);
const ENTRIES = () => [...LISTED, ...TOOL_ROWS];

// ledger: ledger/*.csv. Columns are read loosely: date, direction (in/out) or a signed amount, type, description, amount*, invoice.
const LEDGER = ls(path.join(ROOT, 'ledger'), /\.csv$/).flatMap((f) => csv(rd(f)).map((r) => ({ ...r, _file: path.basename(f) })));
const amt = (r) => { const k = Object.keys(r).find((x) => /amount/.test(x)); return k ? Number(String(r[k]).replace(/[^0-9.-]/g, '')) || 0 : 0; };
const dir = (r) => { const d = String(r.direction || r.flow || r.kind || '').toLowerCase(); if (/^(in|income|money in)$/.test(d)) return 'in'; if (/^(out|cost|expense|money out)$/.test(d)) return 'out'; return amt(r) < 0 ? 'out' : 'in'; };
const months = [...new Set(LEDGER.map((r) => String(r.date || r._file).slice(0, 7)))].sort();
const curMonth = months[months.length - 1] || null;
const inMonth = LEDGER.filter((r) => curMonth && String(r.date || r._file).slice(0, 7) === curMonth);
const costMonth = inMonth.filter((r) => dir(r) === 'out').reduce((a, r) => a + Math.abs(amt(r)), 0);
const inMonthSum = inMonth.filter((r) => dir(r) === 'in').reduce((a, r) => a + Math.abs(amt(r)), 0);
const shareMonth = inMonth.filter((r) => dir(r) === 'in' && /allternit/i.test(r.type || r.category || '')).reduce((a, r) => a + Math.abs(amt(r)), 0);
const totalIn = LEDGER.filter((r) => dir(r) === 'in').reduce((a, r) => a + Math.abs(amt(r)), 0);

let MIRRORS = [];
const mreg = path.join(ROOT, 'mirrors/registry.json');
if (exists(mreg)) { try { const j = readJSON(mreg); MIRRORS = Array.isArray(j) ? j : j.mirrors || []; } catch (e) { console.warn('mirrors/registry.json unreadable:', e.message); } }
let TAKEDOWNS = [];
for (const f of [path.join(ROOT, 'catalog/_takedowns.json'), path.join(ROOT, 'policy/takedowns.json')]) if (exists(f)) { try { const j = readJSON(f); TAKEDOWNS = Array.isArray(j) ? j : j.takedowns || []; } catch (e) {} }
let REFUSED = [];
for (const f of [path.join(ROOT, 'catalog/_refused.json'), path.join(ROOT, 'catalog/refused.json')]) if (exists(f)) { try { const j = readJSON(f); REFUSED = Array.isArray(j) ? j : j.refused || []; } catch (e) {} }

const ethosMd = rd(path.join(ROOT, 'policy/ethos.md'));
const MISSION = mdSection(ethosMd, 'Mission').join(' ').trim();
const ETHOS = mdSection(ethosMd, 'We always / We never').filter((l) => /^\|/.test(l) && !/---|We always/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
const policyMd = rd(path.join(ROOT, 'policy/content-policy.md'));
const licMd = rd(path.join(ROOT, 'policy/license-allowlist.md'));
const manMd = rd(path.join(ROOT, 'spec/manifest-v0.md'));
const MAN_FIELDS = mdSection(manMd, 'Fields').filter((l) => /^\|/.test(l) && !/---|Field \| Meaning/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
const PUBKEY = (manMd.match(/Public key: `([^`]+)`/) || [])[1] || (exists(path.join(ROOT, 'spec/keys/freeweights-v0.pub')) ? rd(path.join(ROOT, 'spec/keys/freeweights-v0.pub')).trim().split('\n').pop() : '');

let GOALS = [
  ['Goal 1', 'Stage 1: our own tracker and hub, up to 1 TB hosted', 45, '45 USD, or a verified free VM'],
  ['Goal 2', 'Stage 2: a 6 TB web-seed origin; permissive models move to Hosted; uploads open', 126, '126 to 270 USD prepaid'],
  ['Goal 3', 'Stage 3: 50 TB for community repos and more quants', 1050, '1,050 to 2,250 USD prepaid, or a sponsor or credits'],
];

const gj = path.join(ROOT, 'ledger/goals.json');
if (exists(gj)) { try { GOALS = readJSON(gj).goals.map((g) => [`Goal ${g.stage}`, `Stage ${g.stage}: ${g.name}`, g.amount_usd_min, `${g.amount_usd_min === g.amount_usd_max ? g.amount_usd_min.toLocaleString('en-US') : g.amount_usd_min.toLocaleString('en-US') + ' to ' + g.amount_usd_max.toLocaleString('en-US')} USD, ${g.amount_note}`, g.raised_usd || 0, g.unlocks]); } catch (e) { console.warn('ledger/goals.json unreadable:', e.message); } }
GOALS = GOALS.map((g) => (g.length > 4 ? g : [...g, totalIn, '']));
// refusals logged by the manifest tool: "<time> <repo> <reason>"
const refusedLog = path.join(ROOT, 'manifests/refused.log');
if (exists(refusedLog)) rd(refusedLog).split('\n').filter(Boolean).forEach((l) => { const [t, repo, ...why] = l.split(' '); REFUSED.push({ time: t, repo, reason: why.join(' ') }); });
const REFUSED_LAST = Object.values(Object.fromEntries(REFUSED.map((r) => [r.repo, r])));

// ---------- shared renderers ----------
const FWC = (() => { const ctx = {}; new Function('window', 'globalThis', rd(path.join(SITE, 'assets/fw-cards.js')))(undefined, ctx); return ctx.FWCards; })();
const ICON = {
  search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  down: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  alert: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></svg>',
  ext: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="display:inline;vertical-align:-1px"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  sun: '<svg class="sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg class="moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  list: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  grid: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  deck: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M3 7v10M21 7v10"/></svg>',
  filter: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  left: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
};

// ---------- content (site/content/**, written by the content lane) ----------
const CONTENT_DIR = path.join(ROOT, 'site/content');
function parseFront(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/); const fm = {}; let body = src;
  if (m) { body = src.slice(m[0].length); m[1].split('\n').forEach((l) => { const k = l.match(/^([A-Za-z0-9_-]+):\s*(.*)$/); if (k && k[2] !== '') fm[k[1]] = k[2].replace(/^["']|["']$/g, '').trim(); }); }
  return { fm, body };
}
const content = (rel) => { const f = path.join(CONTENT_DIR, rel); if (!exists(f)) return null; try { return parseFront(rd(f)); } catch (e) { console.warn('content unreadable', rel, e.message); return null; } };
// Internal links written as repo paths or .md files map to site pages.
function mapHref(u) {
  if (/^(https?:|mailto:|#)/.test(u)) return u;
  const s = u.replace(/^\.?\//, '');
  if (/^(ethos|mission|charter|operating-statement)(\.md)?\/?$/.test(s)) return CHARTER_PATH;
  const d = s.match(/^(?:site\/content\/)?docs\/([\w-]+)\.md(#.*)?$/) || s.match(/^([\w-]+)\.md(#.*)?$/);
  if (d) { const slug = d[1]; if (['ledger', 'wanted', 'mirrors'].includes(slug)) return `/${slug}/${d[2] || ''}`; if (slug === 'home') return '/'; return `/docs/${slug === 'index' ? '' : slug + '/'}${d[2] || ''}`; }
  if (/^\/alt\.freeweights$/.test(u)) return '/alt.freeweights/';
  return u;
}
let codeSeq = 0;
function codeHtml(code, lang) {
  const id = 'cb' + (++codeSeq);
  return `<div class="code-block"><pre class="block"><code id="${id}"${lang ? ` data-lang="${esc(lang)}"` : ''}>${esc(code)}</code></pre><button class="copy" type="button" data-copy="${id}">${ICON.copy}Copy</button></div>`;
}
function inline(s) {
  const codes = [];
  s = String(s).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, t, u) => { const h = mapHref(u.replace(/&amp;/g, '&')); return `<a class="link" href="${esc(h)}"${/^https?:/.test(h) ? ' rel="noopener"' : ''}>${t}</a>`; });
  s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a class="link" href="$1" rel="noopener">$1</a>');
  s = s.replace(/\b([\w.+-]+@allternit\.com)\b/g, '<a class="link" href="mailto:$1">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<i>$2</i>').replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<i>$2</i>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, n) => `<code>${esc(codes[n])}</code>`);
}
const plain = (s) => String(s).replace(/`([^`]+)`/g, '$1').replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
function listHtml(lines) {
  const base = lines[0].match(/^\s*/)[0].length; const ordered = /^\s*\d+[.)]\s/.test(lines[0]); const items = [];
  for (const l of lines) {
    const ind = l.match(/^\s*/)[0].length; const mk = l.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    if (mk && ind <= base + 1) items.push({ text: [mk[2]], sub: [] });
    else if (items.length) { const it = items[items.length - 1]; if (mk || it.sub.length) it.sub.push(l); else if (l.trim()) it.text.push(l.trim()); }
  }
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((it) => { const sub = it.sub.filter((x) => x.trim()); return `<li>${inline(it.text.join(' '))}${sub.length ? listHtml(sub) : ''}</li>`; }).join('')}</${tag}>`;
}
// Small Markdown renderer: headings with {#id}, paragraphs, lists, tables, fences, quotes, rules.
function md(src, opts = {}) {
  const lines = String(src).replace(/\r/g, '').replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const out = []; const toc = []; let title = null; const ids = opts.ids || new Set();
  const slug = (t, want) => { let s = want || plain(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 's'; const b = s; let i = 2; while (ids.has(s)) s = b + '-' + i++; ids.add(s); return s; };
  const isStart = (l) => /^(#{1,6})\s|^```|^\s*>|^\s*([-*+]|\d+[.)])\s|^\s*\|.*\|\s*$|^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l);
  let i = 0;
  while (i < lines.length) {
    const l = lines[i]; let m;
    if (!l.trim()) { i++; continue; }
    if ((m = l.match(/^```\s*([\w+-]*)/))) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(codeHtml(buf.join('\n'), m[1])); continue; }
    if ((m = l.match(/^(#{1,6})\s+(.*?)\s*$/))) {
      const lv = m[1].length; let text = m[2]; let want = null; const a = text.match(/\s*\{#([\w-]+)\}\s*$/); if (a) { want = a[1]; text = text.slice(0, a.index); }
      if (lv === 1 && !title && !opts.keepH1) { title = text; i++; continue; }
      const id = slug(text, want); if (lv <= 3) toc.push({ lv, id, text: plain(text) });
      out.push(`<h${lv} id="${id}">${inline(text)}<a class="anchor" href="#${id}" aria-label="Link to ${esc(plain(text))}">#</a></h${lv}>`); i++; continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\s*>/.test(l)) { const buf = []; while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, '')); out.push(`<blockquote>${md(buf.join('\n'), { ids }).html}</blockquote>`); continue; }
    if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const row = (x) => x.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = row(l); i += 2; const body = []; while (i < lines.length && /^\s*\|/.test(lines[i])) body.push(row(lines[i++]));
      out.push(`<div class="box tblbox"><div class="tbl-wrap"><table class="tbl"><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`); continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s/.test(l)) {
      const buf = [];
      while (i < lines.length && (lines[i].trim() === '' ? (i + 1 < lines.length && /^(\s+\S|\s*([-*+]|\d+[.)])\s)/.test(lines[i + 1])) : (/^\s*([-*+]|\d+[.)])\s/.test(lines[i]) || /^\s+\S/.test(lines[i])))) buf.push(lines[i++]);
      out.push(listHtml(buf.filter((x) => x.trim()))); continue;
    }
    const buf = []; while (i < lines.length && lines[i].trim() && !isStart(lines[i])) buf.push(lines[i++]);
    if (!buf.length) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc, title };
}
// Split a body into "## Heading {#id}" sections. fields=true reads "key: value" lines (home.md style).
function mdSections(body, fields = false) {
  const secs = []; let cur = { id: '_intro', title: '', lines: [] };
  let fence = false;
  for (const l of String(body).replace(/\r/g, '').split('\n')) {
    if (/^```/.test(l)) fence = !fence;
    const m = !fence && l.match(/^##\s+(.*?)\s*(?:\{#([\w-]+)\})?\s*$/);
    if (m) { secs.push(cur); cur = { id: m[2] || m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'), title: m[1], lines: [] }; } else cur.lines.push(l);
  }
  secs.push(cur);
  return secs.map((s) => {
    const f = {}; let lines = s.lines;
    if (fields) lines = lines.filter((l) => { const k = l.match(/^([a-z_]+):\s+(.+)$/); if (!k) return true; let v = k[2].trim(); const o = v.match(/^\{(.*)\}$/); if (o) { v = {}; o[1].split(/,\s*(?=\w+:)/).forEach((p) => { const kv = p.match(/^(\w+):\s*(.*)$/); if (kv) v[kv[1]] = kv[2].trim(); }); } f[k[1]] = v; return false; });
    return { ...s, fields: f, md: lines.join('\n') };
  }).filter((s) => s.id !== '_intro' || s.md.trim());
}
// Render a content page; inject[id](html) can add generated parts to a section.
function renderContent(doc, inject = {}) {
  const ids = new Set(); const toc = []; let html = '';
  for (const s of mdSections(doc.body)) {
    let inner = md(s.md, { ids }); toc.push(...inner.toc);
    let h = inner.html;
    if (inject[s.id]) h = inject[s.id](h);
    if (s.id === '_intro') { html += `<div class="intro">${h}</div>`; continue; }
    ids.add(s.id); toc.push({ lv: 2, id: s.id, text: plain(s.title) });
    html += `<section class="csec" id="${esc(s.id)}"><h2 class="h2">${inline(s.title)}<a class="anchor" href="#${esc(s.id)}" aria-label="Link to ${esc(plain(s.title))}">#</a></h2>${h}</section>`;
  }
  const order = toc.filter((t) => t.lv === 2); // keep h2 order as written
  const sorted = []; for (const s of mdSections(doc.body)) { if (s.id === '_intro') continue; const t = order.find((x) => x.id === s.id); if (t) sorted.push(t); const sub = md(s.md, { ids: new Set() }).toc.filter((x) => x.lv === 3); sub.forEach((x) => sorted.push({ ...x, lv: 3 })); }
  return { html, toc: sorted };
}
const tocHtml = (toc, label = 'On this page') => toc.length ? `<nav class="otp" aria-label="${esc(label)}"><div class="otp-h">${esc(label)}</div>${toc.filter((t) => t.lv <= 2 || toc.length < 18).map((t) => `<a class="lv${t.lv}" href="#${esc(t.id)}">${esc(t.text)}</a>`).join('')}</nav>` : '';

const HOME = content('home.md');
const MISSION_DOC = content('mission.md');
const LEDGER_DOC = content('ledger.md');
const WANTED_DOC = content('wanted.md');
const MIRRORS_DOC = content('mirrors.md');
const CHARTER_LABEL = (MISSION_DOC && MISSION_DOC.fm.nav_label) || 'Operating Statement';
// The page path follows the nav label; old paths (/ethos, /charter) redirect to it.
const CHARTER_PATH = '/' + CHARTER_LABEL.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';
const OLD_CHARTER = ['/ethos/', '/charter/', '/operating-statement/'].filter((o) => o !== CHARTER_PATH);
const DOCS = ls(path.join(CONTENT_DIR, 'docs'), /\.md$/).map((f) => { const d = parseFront(rd(f)); const slug = path.basename(f, '.md'); return { ...d, slug, url: slug === 'index' ? '/docs/' : `/docs/${slug}/`, title: d.fm.title || slug, label: d.fm.nav_label || d.fm.title || slug, group: d.fm.group || '', order: Number(d.fm.order) || 99 }; })
  .sort((a, b) => (a.slug === 'index' ? -1 : b.slug === 'index' ? 1 : a.order - b.order || a.title.localeCompare(b.title)));

// ---------- derived row data: monogram, weights, summary, collections ----------
const MONO = { qwen: 'QW', deepseek: 'DS', kimi: 'KM', glm: 'GL', minimax: 'MX', mimo: 'MO', gemma: 'GM', 'gpt-oss': 'GO', olmo: 'OL', nemotron: 'NV', phi: 'PH', mistral: 'MS', speech: 'SP', embed: 'EM', image: 'IM', ocr: 'OC', datasets: 'DT', tools: 'TL', abliterated: 'AB', video: 'VI', music: 'MU', allternit: 'AT' };
const isData = (r) => r.section === 'alt.freeweights.datasets' || (r.formats.length > 0 && r.formats.every((f) => f === 'parquet' || f === 'jsonl'));
const hostOf = (u) => { try { return new URL(u).host; } catch (e) { return 'huggingface.co'; } };
// Weight bytes from the manifest: all safetensors; for GGUF and ONNX, the smallest variant.
function weightInfo(r) {
  const files = (r.manifest && r.manifest.files) || []; if (!files.length || isData(r)) return { bytes: null, label: '' };
  const group = (re, keyFn) => { const g = {}; files.filter((f) => re.test(f.path) && !/mmproj/i.test(f.path)).forEach((f) => { const k = keyFn(f.path); (g[k] = g[k] || []).push(f); }); const arr = Object.entries(g).map(([k, fs]) => ({ k, fs, sum: fs.reduce((a, f) => a + (f.size || 0), 0) })).sort((a, b) => a.sum - b.sum); return arr; };
  if (r.formats.includes('gguf')) {
    const arr = group(/\.gguf$/i, (p) => (p.includes('/') ? p.split('/').slice(0, -1).join('/') + '/' : p.replace(/-\d{5}-of-\d{5}\.gguf$/i, '').replace(/\.gguf$/i, '')));
    if (arr.length) return { bytes: arr[0].sum, label: arr.length > 1 ? `smallest of ${arr.length} GGUF variants` : 'GGUF', variant: arr[0].k, first: arr[0].fs.map((f) => f.path).sort()[0], variants: arr.length };
  }
  let st = files.filter((f) => /\.safetensors$/i.test(f.path));
  if (st.some((f) => /consolidated/i.test(f.path)) && st.some((f) => !/consolidated/i.test(f.path))) st = st.filter((f) => !/consolidated/i.test(f.path));
  if (st.length) return { bytes: st.reduce((a, f) => a + (f.size || 0), 0), label: 'safetensors' };
  const ox = group(/\.onnx(_data)?$/i, (p) => p.replace(/\.onnx(_data)?$/i, ''));
  if (ox.length) return { bytes: ox[0].sum, label: ox.length > 1 ? `smallest of ${ox.length} ONNX variants` : 'ONNX' };
  return { bytes: null, label: '' };
}
const taskName = (t) => String(t).replace(/-/g, ' ');
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function summary(r) {
  const c = content(`models/${r.key}.md`); if (c && (c.fm.summary || c.body.trim())) return plain(c.fm.summary || c.body.trim().split('\n\n')[0]);
  const what = isData(r) ? 'Dataset' : r.tasks.length ? capital(taskName(r.tasks[0])) + ' model' : 'Model';
  const p = r.params ? ` with ${FWC.params(r.params)} parameters` : '';
  const fmt = r.formats.length ? `${r.formats.join(' and ')} ${isData(r) ? 'files' : 'weights'}` : 'files';
  return `${what}${p}. ${capital(fmt)}, ${fmtBytes(r.size)} in all. Published by ${r.org} under ${licName(r.license)}.${r.abliterated || r.changed ? ' Changed from the base model.' : ''}`;
}
const sizeBucket = (n) => { const gb = (n || 0) / 1e9; return gb < 4 ? 's' : gb < 40 ? 'm' : gb < 200 ? 'l' : 'xl'; };
const paramBucket = (n) => (!n ? 'none' : n < 3e9 ? 'p1' : n < 15e9 ? 'p2' : n < 70e9 ? 'p3' : n < 300e9 ? 'p4' : 'p5');
const SRC_LABEL = (r) => (r.failedAt ? 'Source check failed' : r.sourceOnly ? 'From the publisher' : r.badges.includes('host') ? 'Hosted by Allternit' : r.badges.includes('seed') ? 'Community seeded' : 'From source');
for (const r of ROWS) {
  r.fam = r.section.replace(/^alt\.freeweights\./, ''); r.mono = MONO[r.fam] || r.fam.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase();
  const wi = weightInfo(r); r.weight = wi.bytes; r.weightLabel = wi.label; r.wi = wi;
  r.summary = summary(r);
  r.mSha = r.manifest && manifestFile[r.id] ? crypto.createHash('sha256').update(fs.readFileSync(manifestFile[r.id])).digest('hex') : null;
}
const COLLECTIONS = [
  { slug: 'mac-256', name: 'Runs on a 256 GB Mac', blurb: 'Weights of 200 GB or less, counted from each signed manifest (the smallest GGUF or ONNX variant when a repo has several), so the model fits in 256 GB of unified memory with room for context.', test: (r) => !isData(r) && r.weight && r.weight <= 200e9 },
  { slug: 'laptop', name: 'Small enough for a laptop', blurb: 'Weights of 12 GB or less, counted from each signed manifest, so the model loads in 16 GB of memory with room to run.', test: (r) => !isData(r) && r.weight && r.weight <= 12e9 },
  { slug: 'embeddings', name: 'Embeddings and rerankers', blurb: 'Models that turn text or images into vectors, and models that rank search results.', test: (r) => r.section === 'alt.freeweights.embed' || r.tasks.some((t) => ['feature-extraction', 'sentence-similarity', 'text-ranking'].includes(t)) },
  { slug: 'speech', name: 'Speech', blurb: 'Speech recognition, text to speech and audio models.', test: (r) => r.section === 'alt.freeweights.speech' || r.tasks.some((t) => /speech|audio/.test(t)) },
  { slug: 'gguf', name: 'GGUF for llama.cpp and Ollama', blurb: 'Repos with GGUF files, ready for llama.cpp, Ollama and LM Studio.', test: (r) => r.formats.includes('gguf') },
  { slug: 'datasets', name: 'Open datasets', blurb: 'Training and evaluation datasets with a license that allows sharing.', test: isData },
].map((c) => ({ ...c, rows: LISTED.filter(c.test) }));
for (const r of ROWS) r.coll = COLLECTIONS.filter((c) => c.test(r)).map((c) => c.slug);

const FACETS = [
  ['kind', 'Kind', (r) => [r.kind === 'tool' ? 'tool' : isData(r) ? 'dataset' : 'model']],
  ['sec', 'Section', (r) => [r.fam]],
  ['task', 'Task', (r) => (r.tasks.length ? r.tasks : ['not tagged'])],
  ['lc', 'License class', (r) => [r.licClass || 'unknown']],
  ['fmt', 'Format', (r) => (r.formats.length ? r.formats : ['other'])],
  ['sz', 'Size', (r) => [sizeBucket(r.size)]],
  ['pb', 'Parameters', (r) => [paramBucket(r.params)]],
  ['src', 'Bytes from', (r) => [SRC_LABEL(r)]],
  ['rt', 'Terms', (r) => [r.requiresTerms ? 'yes' : 'no']],
];
// Tools have no size, parameters, format, task or terms: those facets give them no value, so a
// filter on one of them leaves tools out instead of mislabelling them.
const TOOL_FV = { kind: () => ['tool'], sec: () => ['tools'], lc: (r) => [r.licClass || 'unknown'], src: () => ['Links to the project'] };
const facetVals = (k, f, r) => (r.kind === 'tool' ? (TOOL_FV[k] ? TOOL_FV[k](r) : []) : f(r));
const FACET_LABEL = {
  kind: { model: 'Models', dataset: 'Datasets', tool: 'Tools' },
  lc: { copyleft: 'Copyleft (GPL)', permissive: 'Permissive', custom: 'Custom terms', 'non-commercial': 'Non-commercial (link only)', gated: 'Gated (link only)', unknown: 'Not stated' },
  sz: { s: 'Under 4 GB', m: '4 to 40 GB', l: '40 to 200 GB', xl: '200 GB and up' },
  pb: { p1: 'Under 3B', p2: '3B to 15B', p3: '15B to 70B', p4: '70B to 300B', p5: '300B and up', none: 'Not stated' },
  rt: { yes: 'Requires accepting terms', no: 'No extra terms' },
};
const FACET_ORDER = { kind: ['model', 'dataset', 'tool'], sz: ['s', 'm', 'l', 'xl'], pb: ['p1', 'p2', 'p3', 'p4', 'p5', 'none'], rt: ['no', 'yes'] };
const facetLabel = (k, v) => (FACET_LABEL[k] && FACET_LABEL[k][v]) || (k === 'task' ? taskName(v) : v);
function cardRow(r) {
  if (r.kind === 'tool') return toolCardRow(r);
  const m = r.manifest; const up = (m && m.upstream) || {};
  return { kind: isData(r) ? 'dataset' : 'model', id: r.id, key: r.key, n: r.name, org: r.org, sec: r.section, fam: r.fam, mono: r.mono, url: modelUrl(r), size: r.size || 0, params: r.params || 0, fmt: r.formats, task: r.tasks, lc: r.licClass, lic: licName(r.license), rt: r.requiresTerms, src: SRC_LABEL(r), nc: r.linkOnly, added: r.added, sha: r.mSha ? r.mSha.slice(0, 12) : '', files: m ? (m.files || []).length : 0, host: up.host || hostOf(r.upstream), commit: up.commit || '', sum: r.summary, logo: logoOf(r.org), sig: r.manifest && minisig[r.id] ? KEY_ID : '', licUrl: r.licenseUrl || r.upstream || '', fv: Object.fromEntries(FACETS.map(([k, , f]) => [k, facetVals(k, f, r)])) };
}
// ---------- Tools as catalog entries ----------
// catalog/tools.json, filled from GitHub by scripts/enrich_tools.py. Each tool gets the same four
// faces and a detail page. Freeweights links to the project and does not host tool binaries.
const TOOL_LC = (spdx) => (/^(MIT|Apache-2\.0|BSD|ISC|Zlib|Unlicense|MPL)/i.test(spdx || '') ? 'permissive' : /GPL/i.test(spdx || '') ? 'copyleft' : 'unknown');
const TOOL_KIND = { inference: 'inference', training: 'training', ui: 'app', format: 'format', ours: 'ours' };
const TOOL_ROWS = TOOLS.map((t) => {
  const g = t.github || {}; const repo = g.repo || (t.id === 'fw-py' ? 'allternit/fw.py' : 'allternit/' + t.id); const [owner, name] = repo.split('/');
  const rel = g.release || {}; const spdx = g.license || t.license;
  return { kind: 'tool', tool: t, id: repo, key: repo.replace(/\//g, '__'), org: owner, repo: name, name: t.name, section: 'alt.freeweights.tools', fam: 'tools',
    mono: t.name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase(), license: spdx, licClass: TOOL_LC(spdx), tasks: [], formats: [], size: null, params: null,
    added: rel.date || g.fetched || null, tag: rel.tag || '', summary: g.description && g.description.length > (t.what || '').length ? g.description : t.what,
    upstream: /^https?:/.test(t.url) ? `https://github.com/${repo}` : t.url, linkOnly: false, requiresTerms: false, badges: [], sample: false, lastByType: {} };
});
const LOGO_OWNER = (r) => logoOf(r.org) || (r.tool && /^https:\/\/github\.com\/([^/]+)/.test(r.tool.url) ? logoOf(r.tool.url.match(/^https:\/\/github\.com\/([^/]+)/)[1]) : '');
function toolCardRow(r) {
  const t = r.tool; const g = t.github || {}; const rel = g.release || {};
  return { kind: 'tool', id: r.id, key: r.key, n: r.name, org: r.org, sec: r.section, fam: 'tools', mono: r.mono, url: modelUrl(r), size: 0, params: 0, fmt: [], task: [],
    lc: r.licClass, lic: r.license, rt: false, src: 'Links to the project', nc: false, added: r.added, sha: '', files: 0, host: 'github.com', commit: rel.commit || g.branch_commit || '',
    sum: r.summary, logo: LOGO_OWNER(r), sig: '', licUrl: r.upstream, tag: rel.tag || '', relDate: rel.date || '', lang: g.language || '', tkind: TOOL_KIND[t.kind] || t.kind,
    platforms: t.platforms || [], install: t.install_verified ? t.install || [] : [], installDocs: t.install_docs || r.upstream, use: t.use || '', role: (t.works_with || {}).role || '',
    fv: Object.fromEntries(FACETS.map(([k, , f]) => [k, facetVals(k, f, r)])) };
}
// Which catalog entries a tool runs or trains (works_with in tools.json).
function toolFits(t, r) {
  const w = t.works_with || {}; if (r.kind === 'tool') return false;
  if (w.all_hosted) return !r.linkOnly && !!r.manifest;
  if (w.match) return new RegExp(w.match, 'i').test(r.id);
  if ((w.sections || []).includes(r.fam)) return true;
  if (w.formats && !w.formats.some((f) => r.formats.includes(f))) return false;
  if (w.tasks && !w.tasks.some((x) => r.tasks.includes(x))) return false;
  return !!(w.formats || w.tasks);
}
const runsWith = (r) => TOOL_ROWS.filter((tr) => tr.tool.works_with && tr.tool.works_with.role !== 'gets' && toolFits(tr.tool, r));
const kindCount = (rows) => { const c = { model: 0, dataset: 0, tool: 0 }; rows.forEach((r) => c[r.kind === 'tool' ? 'tool' : isData(r) ? 'dataset' : 'model']++); return [['model', 'model'], ['dataset', 'dataset'], ['tool', 'tool']].filter(([k]) => c[k]).map(([k, w]) => plural(c[k], w)).join(' · ') || '0 models'; };
const rowsJson = (rows) => `<script type="application/json" id="fw-rows">${JSON.stringify(rows.map(cardRow)).replace(/</g, '\\u003c')}</script>`;
// Tiles (IDENTITY front, FACTS back, RECORD strip) for home, related models and the grid.
const cards = (rows) => `<div class="cards tiles">${rows.map((r) => FWC.tile(cardRow(r))).join('')}</div>`;
// The old single-face styles A to D, kept as references on /design/cards/ only.
const refCards = (rows, style) => `<div class="cards" data-fixed="${style}">${rows.map((r) => FWC.card(style, cardRow(r))).join('')}</div>`;

// ---------- ledger chain ----------
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',')}}` : JSON.stringify(v));
const CHAIN = (() => { const f = path.join(ROOT, 'ledger/chain.jsonl'); if (!exists(f)) return []; try { return rd(f).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)); } catch (e) { console.warn('ledger/chain.jsonl unreadable:', e.message); return []; } })();
const HEAD = (() => { const f = path.join(ROOT, 'ledger/head.json'); try { return exists(f) ? readJSON(f) : null; } catch (e) { return null; } })();
const CHAIN_CHECK = (() => {
  let prev = '0'.repeat(64); let ok = 0;
  for (const [i, e] of CHAIN.entries()) { const { entry_hash, ...rest } = e; const h = crypto.createHash('sha256').update(canon(rest), 'utf8').digest('hex'); if (e.seq !== i + 1 || e.prev_hash !== prev || h !== entry_hash) return { ok, bad: i + 1 }; ok++; prev = entry_hash; }
  return { ok, bad: null, last: prev, headMatch: !!(HEAD && HEAD.entry_hash === prev && HEAD.seq === CHAIN.length) };
})();
const HEAD_SIG = (() => {
  const h = path.join(ROOT, 'ledger/head.json'); const sig = h + '.minisig'; const pub = path.join(ROOT, 'spec/keys/freeweights-v0.pub');
  if (!exists(h) || !exists(sig)) return { state: 'missing', text: 'No signed head yet.' };
  try { execFileSync('minisign', ['-V', '-m', h, '-x', sig, '-p', pub], { stdio: 'pipe' }); return { state: 'ok', text: `Signature checked when this page was built: valid, key ${KEY_ID}.` }; }
  catch (e) { if (e.code === 'ENOENT') return { state: 'unchecked', text: 'Signature file present. minisign was not installed on the build machine, so check it yourself below.' }; return { state: 'bad', text: 'Signature check FAILED when this page was built. Do not trust this head until it is re-signed.' }; }
})();
const short = (h) => (h ? `${h.slice(0, 8)}…${h.slice(-4)}` : '');

// ---------- layout ----------
const NAV = [['catalog', 'Catalog', '/alt.freeweights/'], ['wanted', 'Wanted', '/wanted/'], ['mirrors', 'Mirrors', '/mirrors/'], ['ledger', 'Ledger', '/ledger/'], ['charter', CHARTER_LABEL, CHARTER_PATH], ['docs', 'Docs', '/docs/']];
const sampleTag = (t = 'sample') => `<span class="sample">${t}</span>`;
function badge(k, r) {
  const t = r && r.lastByType && r.lastByType[k] ? ` title="Last checked ${fmtTime(r.lastByType[k])}"` : '';
  if (k === 'host') return `<span class="b"${t}><i class="d"></i>Hosted by Allternit</span>`;
  if (k === 'seed') return `<span class="b seed"${t}><i class="d"></i>Community seeded${r && r.seeders ? `<span class="n mono">${r.seeders}</span>` : ''}</span>`;
  return `<span class="b src"${t}><i class="d"></i>From source</span>`;
}
const PUBLISHER_LINE = "From the publisher: downloads come from the publisher's own release. Freeweights never hosts a copy.";
const badges = (r) => r.failedAt ? '<span class="b fail"><i class="d"></i>Source check failed</span>' : r.sourceOnly ? '<span class="b src"><i class="d"></i>From the publisher</span>' : r.badges.map((k) => badge(k, r)).join('');
const lcTag = (r) => `<span class="lc lc-${esc(r.licClass || 'unknown')}">${esc(facetLabel('lc', r.licClass || 'unknown').replace(' (link only)', ''))}</span>`;
const codeBlock = (id, html) => `<div class="code mono"><code id="${id}">${html}</code><button class="copy" type="button" data-copy="${id}">${ICON.copy}Copy</button></div>`;
const hfLine = (repo) => `<span class="c">$ </span><span class="k">HF_ENDPOINT</span>=${ORIGIN} hf download ${esc(repo)}`;
const later = (label, phase) => `<div class="later"><b>${esc(label)}</b><span class="when mono">coming in ${phase}</span></div>`;
const plural = (n, w) => `${n} ${n === 1 ? w : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's'}`;

function layout({ path: p, title, desc, nav, body, wide, bodyClass, redirect }) {
  const full = title ? `${title} · Allternit Freeweights` : 'Allternit Freeweights: open models, free to download';
  const links = NAV.map(([k, l, h]) => `<a href="${h}"${k === nav ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc || 'Open AI models, free to download with no account. Every file has a license and a checksum. Run by Allternit, the open source alternative.')}">
<link rel="canonical" href="${ORIGIN}${p}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:url" content="${ORIGIN}${p}">
<meta name="color-scheme" content="light dark">${redirect ? `\n<meta http-equiv="refresh" content="0; url=${redirect}">\n<meta name="robots" content="noindex">` : ''}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<script>(function(d){d.classList.add('js');try{var t=localStorage.getItem('fw-theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(e){}})(document.documentElement)</script>
<link rel="stylesheet" href="/assets/fw.css">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
  <a class="brand" href="/" aria-label="Allternit Freeweights home">${FWC.lockup('inline', 13, 'lockup inline hide-ph')}${FWC.lockup('stack', 26, 'lockup stack show-ph')}</a>
  <nav class="nav" aria-label="Main">${links}</nav>
  <details class="menu"><summary class="iconbtn" aria-label="Menu">${ICON.menu}</summary><div class="panel">${links}<a href="/studio/">Studio status</a><a href="/design/cards/">Card system</a></div></details>
  <button class="iconbtn theme" type="button" data-theme-toggle aria-label="Change theme">${ICON.sun}${ICON.moon}</button>
</div></header>
<main id="main"${wide ? ' class="wide"' : ''}>
${body}
</main>
<footer class="foot"><div class="wrap">
  <div class="f-top"><a class="f-brand" href="/" aria-label="Allternit Freeweights home">${FWC.lockup('stack', 34, 'lockup stack')}</a>
  <nav aria-label="Footer"><a href="/alt.freeweights/">Catalog</a><a href="/collections/mac-256/">Collections</a><a href="${CHARTER_PATH}">${esc(CHARTER_LABEL)}</a><a href="${CHARTER_PATH}#takedown-counter">Takedowns</a><a href="/ledger/">Ledger</a><a href="/mirrors/">Mirrors</a><a href="/docs/">Docs</a><a href="/studio/">Studio status</a><a href="/design/cards/">Card system</a></nav></div>
  ${/class="org[ "]/.test(body) ? `<p class="f-logos small">${esc(LOGO_LINE)}</p>` : ''}
  <div class="f-line"><b>Allternit, the open source alternative.</b> Freeweights code is published under an open license. ${esc(SUPPORT_LINE)} Support never buys ranking, placement or access.</div>
</div></footer>
<script src="/assets/fw-cards.js" defer></script>
<script src="/assets/fw.js" defer></script>
</body>
</html>
`;
}

const pages = [];
const page = (o) => pages.push(o);
const goal = GOALS[0]; const goalPct = Math.min(100, Math.round((goal[4] / goal[2]) * 100));
const filesVerified = LISTED.reduce((a, r) => a + (r.manifest && minisig[r.id] ? (r.manifest.files || []).length : 0), 0);

function sectionCard(s) {
  const ms = bySection(s.id); const nTools = s.id === 'alt.freeweights.tools' ? TOOLS.length : 0;
  return `<a class="g" href="${sectionUrl(s.id)}"><span class="g-top"><span class="g-mono">${FWC.word(MONO[s.family] || s.family.slice(0, 2), 14, 'mono-svg')}</span><span class="p mono">alt.freeweights.<i>${esc(s.family)}</i></span></span><p>${esc(s.description)}</p><span class="m">${nTools ? `${plural(nTools, 'tool')}: ${esc(TOOLS.slice(0, 2).map((m) => m.name).join(', '))}` : ms.length ? `${plural(ms.length, 'model')}: ${esc(ms.slice(0, 2).map((m) => m.name).join(', '))}` : 'No models yet'}</span></a>`;
}
const collTile = (c) => `<a class="coll" href="/collections/${c.slug}/"><b>${esc(c.name)}</b><span class="sub small">${esc(c.blurb.split('. ')[0].replace(/\.$/, ''))}.</span><span class="mono small coll-n">${plural(c.rows.length, 'model')}</span></a>`;

// ---------- Home ----------
{
  const hs = HOME ? Object.fromEntries(mdSections(HOME.body, true).map((s) => [s.id, s])) : {};
  const hero = (hs.hero && hs.hero.fields) || {};
  const tagline = hero.tagline || 'Open models, free to download.';
  const subline = hero.subline || 'Find, check and download open AI models. Free. No account. By Allternit, the open source alternative.';
  const cta1 = hero.cta_primary || { label: 'Browse the catalog', href: '/alt.freeweights/' };
  const cta2 = hero.cta_secondary || { label: `Read the ${CHARTER_LABEL.toLowerCase()}`, href: CHARTER_PATH };
  const first = ['Qwen/Qwen3-Embedding-0.6B', 'onnx-community/Kokoro-82M-v1.0-ONNX'].map((id) => LISTED.find((r) => r.id === id)).find(Boolean) || LISTED[0];
  const steps = hs['how-it-works'] ? mdSections(hs['how-it-works'].md.replace(/^###/gm, '##')).filter((s) => s.id !== '_intro') : [
    { title: '1. Find', md: 'Search by name, task, license, format or size.' }, { title: '2. Check', md: 'Every model has a license and a signed manifest.' }, { title: '3. Download', md: 'Use fw.py, the Hugging Face tools with one setting, or plain links.' }];
  const trust = hs.trust ? md(hs.trust.md).html : '';
  const explore = hs.explore || null;
  const sorted = [...SECTIONS].sort((a, b) => secCount(b) - secCount(a));
  const latest = [...LISTED].sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')) || a.name.localeCompare(b.name)).slice(0, 6);
  const mission = MISSION_DOC ? (mdSections(MISSION_DOC.body).find((s) => s.id === 'mission') || {}).md || '' : MISSION;
  const verifyEx = LISTED.find((r) => r.manifest && minisig[r.id] && !r.requiresTerms) || first;
  page({ path: '/', nav: 'home', file: 'index.html', desc: HOME && HOME.fm.summary, body: `
<div class="wrap hero">
  <div class="hero-mark">${FWC.lockup('stack', 92, 'lockup stack hero-lockup')}</div>
  <p class="tag">${esc(tagline)}</p>
  <p class="lead hero-sub">${esc(subline)}</p>
  <form class="search" action="/alt.freeweights/" method="get" role="search">${ICON.search}<label class="sr" for="q">Search models</label><input id="q" name="q" data-search placeholder="${esc(hero.search_placeholder || 'Search ' + LISTED.length + ' models')}" autocomplete="off"><i class="kbd mono" aria-hidden="true">/</i><button class="btn pri sm" type="submit">Search</button></form>
  <div class="hero-cta"><a class="btn pri" href="${esc(mapHref(cta1.href))}">${esc(cta1.label)}</a><a class="btn" href="${esc(mapHref(cta2.href))}">${esc(cta2.label)}</a></div>
  ${first ? codeBlock('hf-home', hfLine(first.id)) : ''}
</div>
<div class="wrap sec">
  <div class="stats">
    <div class="stat"><div class="v mono">${LISTED.length}</div><div class="l">Models listed</div><div class="n">Listed means downloadable. Read from the catalog.</div></div>
    <div class="stat"><div class="v mono">${filesVerified.toLocaleString('en-US')}</div><div class="l">Files with a signed sha256</div><div class="n">Every file in a signed manifest.</div></div>
    <div class="stat"><div class="v mono">Not live</div><div class="l">Download starts</div><div class="n">Counted by the download Worker from launch day. No number until then.</div></div>
  </div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">How it works</h2></div>
  <div class="steps">${steps.map((s) => `<div class="step"><b>${inline(s.title)}</b>${md(s.md).html}</div>`).join('')}</div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">Collections</h2><a class="more" href="/alt.freeweights/">Full catalog →</a></div>
  <p class="sub" style="margin-top:6px">Worked out from the real files in each signed manifest, not from model names.</p>
  <div class="colls">${COLLECTIONS.map(collTile).join('')}</div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">Latest additions</h2><a class="more" href="/alt.freeweights/?sort=new">Newest first →</a></div>
  ${cards(latest)}
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">Sections</h2><a class="more" href="/alt.freeweights/">All ${SECTIONS.length} sections →</a></div>
  ${explore && explore.fields.intro ? `<p class="sub" style="margin-top:6px;max-width:720px">${esc(explore.fields.intro)}</p>` : ''}
  <div class="groups">${sorted.slice(0, 6).map(sectionCard).join('')}</div>
</div>
<div class="wrap sec">
  <div class="two-wide">
    <div>
      <h2 class="h2">Check every byte</h2>
      <p class="sub" style="margin:6px 0 14px">A model is three things you can check with stock tools: a signed manifest, the sha256 of each file, and the license text.</p>
      <ol class="verify-steps">
        <li><b>The manifest is signed.</b> minisign, Ed25519, key <span class="mono">${KEY_ID}</span>.</li>
        <li><b>Every file has a size and sha256.</b> A file that does not match is thrown away and the next source is tried.</li>
        <li><b>The upstream commit is pinned.</b> The bytes are the publisher's release at that commit.</li>
      </ol>
      ${verifyEx ? `<pre class="block">curl -O ${ORIGIN}/manifests/${esc(verifyEx.id)}.json
curl -O ${ORIGIN}/manifests/${esc(verifyEx.id)}.json.minisig
minisign -Vm ${esc(verifyEx.repo)}.json -P ${esc(PUBKEY)}</pre>` : ''}
      <a class="link" href="/docs/verify/">How to verify a download</a>
    </div>
    <div>${trust ? `<h2 class="h2">Why you can trust it</h2><div class="prose trust">${trust}</div>` : ''}</div>
  </div>
</div>
<div class="wrap sec">
  <div class="snap">
    <a class="snap-c" href="/ledger/"><span class="box-h">Ledger</span><b class="mono">${usd(costMonth)}</b><span class="sub small">Costs${curMonth ? ', ' + curMonth : ''}. ${CHAIN.length ? `${plural(CHAIN.length, 'entry')} in the signed hash chain, head ${esc(short(HEAD && HEAD.entry_hash))}.` : 'No entries yet.'}</span></a>
    <a class="snap-c" href="/ledger/#goals"><span class="box-h">${esc(goal[0])}</span><b class="mono">${usd(goal[4])} <span class="sub">of ${usd(goal[2])}</span></b><span class="meter" role="img" aria-label="${goalPct}% funded"><i style="width:${goalPct}%"></i></span><span class="sub small">${esc(goal[1])}. Support is not open yet.</span></a>
    <a class="snap-c" href="/mirrors/"><span class="box-h">Mirrors</span><b class="mono">${MIRRORS.length}</b><span class="sub small">${MIRRORS.length ? 'Hosts carrying Freeweights files.' : 'No mirrors yet. Have spare disk and bandwidth? Run the first one.'}</span></a>
  </div>
</div>
<div class="wrap sec">
  <div class="sec-h"><h2 class="h2">The ${esc(CHARTER_LABEL.toLowerCase())}</h2><a class="more" href="${CHARTER_PATH}">Read the ${esc(CHARTER_LABEL.toLowerCase())} →</a></div>
  <p class="mission">${inline(String(mission).trim().split('\n\n')[0] || '')}</p>
</div>
${rowsJson(latest)}` });
}

// ---------- Catalog, section and collection pages ----------
function facetsHtml(rows, skipSec) {
  return FACETS.filter(([k]) => !(skipSec && k === 'sec')).map(([k, label, f]) => {
    const counts = {}; rows.forEach((r) => facetVals(k, f, r).forEach((v) => (counts[v] = (counts[v] || 0) + 1)));
    let vals = Object.keys(counts); if (vals.length < 2 && k !== 'lc') return '';
    vals = FACET_ORDER[k] ? FACET_ORDER[k].filter((v) => counts[v]) : vals.sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
    const opt = (v) => `<label class="opt"><input type="checkbox" name="${k}" value="${esc(v)}"><span class="ol">${esc(facetLabel(k, v))}</span><span class="oc mono" data-oc>${counts[v]}</span></label>`;
    return `<fieldset class="facet" data-facet="${k}"><legend>${esc(label)}</legend>${vals.slice(0, 6).map(opt).join('')}${vals.length > 6 ? `<details class="more-opts"><summary>Show ${vals.length - 6} more</summary>${vals.slice(6).map(opt).join('')}</details>` : ''}</fieldset>`;
  }).join('');
}
function listRow(r, first) {
  // RECORD face as one newsreader line: From and group under the subject, then size, params, license, date.
  const lg = r.kind === 'tool' ? LOGO_OWNER(r) : logoOf(r.org);
  return `<a class="msg" href="${modelUrl(r)}" data-id="${esc(r.id)}"${first ? ' data-sel' : ''}><span class="s">${lg ? `<img class="org msg-org" src="${lg}" alt="" width="22" height="22" loading="lazy" decoding="async">` : `<span class="msg-org msg-mono">${FWC.word(r.mono, 9, 'mono-svg')}</span>`}<span class="s-t"><span class="s-n">${esc(r.name)}${r.sample ? sampleTag() : ''}</span><small><b>From:</b> ${esc(r.org)} <b>in</b> ${esc(r.section)}</small></span></span><span class="z mono">${r.kind === 'tool' ? esc(r.tag || 'no release') : fmtBytes(r.size)}</span><span class="pp mono">${r.params ? FWC.params(r.params) : '—'}</span><span class="lcc">${lcTag(r)}</span><span class="dt mono">${r.added ? String(r.added).slice(0, 10) : ''}</span></a>`;
}
function preview(r) {
  const c = cardRow(r);
  return FWC.combined(c, { cls: 'fwk-pv', open: true });
}
function catalogPage({ sec, coll }) {
  const rows = sec ? (sec.id === 'alt.freeweights.tools' ? TOOL_ROWS : bySection(sec.id)) : coll ? coll.rows : ENTRIES();
  const label = sec ? sec.id : coll ? coll.name : 'alt.freeweights.*';
  const base = sec ? sectionUrl(sec.id) : coll ? `/collections/${coll.slug}/` : '/alt.freeweights/';
  const secDoc = sec && content(`sections/${sec.family}.md`);
  const intro = sec && sec.id === 'alt.freeweights.tools' ? `<p>${esc(sec.description)} ${plural(TOOL_ROWS.length, 'tool')}, newest release first. Freeweights links to the project and does not host tool binaries.</p>` : secDoc ? md(secDoc.body).html : sec ? `<p>${esc(sec.description)} ${rows.length ? `${plural(rows.length, 'model')}, newest first.` : ''} Order is never for sale.</p>` : coll ? `<p>${esc(coll.blurb)}</p>` : '<p>Sections are families; modality is a filter. Newest first. Order is never for sale.</p>';
  const tree = `<a href="/alt.freeweights/"${!sec && !coll ? ' aria-current="page"' : ''} class="mono"><span>alt.freeweights.*</span><span class="c">${ENTRIES().length}</span></a>` +
    SECTIONS.map((s) => { const n = secCount(s); return `<a href="${sectionUrl(s.id)}" class="d mono${n ? '' : ' zero'}"${sec && sec.id === s.id ? ' aria-current="page"' : ''}><span>${esc(s.family)}</span><span class="c">${n || ''}</span></a>`; }).join('');
  const collLinks = COLLECTIONS.map((c) => `<a href="/collections/${c.slug}/"${coll && coll.slug === c.slug ? ' aria-current="page"' : ''}><span>${esc(c.name)}</span><span class="c">${c.rows.length}</span></a>`).join('');
  const chips = `<nav class="chips" aria-label="Sections"><a class="chip mono" href="/alt.freeweights/"${!sec && !coll ? ' aria-current="page"' : ''}>all ${ENTRIES().length}</a>${COLLECTIONS.map((c) => `<a class="chip" href="/collections/${c.slug}/"${coll && coll.slug === c.slug ? ' aria-current="page"' : ''}>${esc(c.name)} ${c.rows.length}</a>`).join('')}${SECTIONS.filter((s) => secCount(s)).map((s) => `<a class="chip mono" href="${sectionUrl(s.id)}"${sec && sec.id === s.id ? ' aria-current="page"' : ''}>${esc(s.family)} ${secCount(s)}</a>`).join('')}</nav>`;
  const KIND = { inference: 'Inference', training: 'Training', ui: 'App', format: 'Format', ours: 'Ours' };
  const emptyMsg = sec
    ? `<div class="empty"><b>No models in ${esc(sec.id)} yet.</b><span>A model shows up here only after its license passes the audit and every file has a size and sha256 in a signed manifest. Listed means downloadable, so there are no placeholder rows.</span><span><a class="link" href="/wanted/">See what is wanted</a> &nbsp;·&nbsp; <a class="link" href="/docs/licenses/">What gets listed</a></span></div>`
    : `<div class="empty"><b>No models here yet.</b><span>Rows appear when the license audit and the manifests are done.</span><span><a class="link" href="/docs/licenses/">What gets listed</a></span></div>`;
  const seg = (attr, items) => items.map(([v, l, ic]) => `<button type="button" class="segb" data-${attr}="${v}" aria-pressed="false" title="${esc(l)}">${ic || ''}<span${ic ? ' class="segl"' : ''}>${esc(l)}</span></button>`).join('');
  return {
    path: base, nav: 'catalog', file: base.slice(1) + 'index.html', wide: true,
    title: label, desc: sec ? `${sec.name} models on Allternit Freeweights: ${sec.description}` : coll ? `${coll.name}: ${coll.blurb}` : 'Every open model on Allternit Freeweights, by section, with license, size and where the bytes come from.',
    body: `
<div class="wrap page-head cat-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.* &nbsp;·&nbsp; ${SECTIONS.length} sections &nbsp;·&nbsp; ${plural(LISTED.length, 'model')} listed${coll ? ' &nbsp;·&nbsp; collection' : ''}</div>
  <h1 class="ph1${coll ? '' : ' mono'}">${esc(label)}</h1>
  <div class="lead">${intro}</div>
</div>
<div class="cat" data-catalog data-base="${base}" data-total="${rows.length}">
  <aside class="rail" aria-label="Sections and filters">
    <div class="rail-h"><b>Filters</b><button type="button" class="btn sm" data-rail-toggle>Done</button></div>
    <div class="pane-h">Sections</div><div class="tree">${tree}</div>
    <div class="pane-h h2x">Collections</div><div class="tree">${collLinks}</div>
    ${rows.length > 1 ? `<form class="facets" data-facets data-needs-js aria-label="Filter models"><div class="pane-h h2x">Filter</div>${facetsHtml(rows, !!sec)}</form>` : ''}
  </aside>
  <div class="cat-main">
    ${chips}
    ${rows.length ? `<div class="toolbar" data-needs-js>
      <label class="q">${ICON.search}<span class="sr">Search models</span><input type="search" name="q" data-search data-q placeholder="Search ${rows.length} ${rows.every((r) => r.kind === 'tool') ? 'tools' : 'entries'}" autocomplete="off"><i class="kbd mono hide-ph" aria-hidden="true">/</i></label>
      <div class="tools">
        <button type="button" class="btn sm show-ph" data-rail-toggle>${ICON.filter}Filters<span class="mono" data-fcount></span></button>
        <label class="sort"><span class="sr">Sort</span><select data-sort><option value="new">Newest</option><option value="size">Size: largest</option><option value="small">Size: smallest</option><option value="params">Parameters: most</option><option value="name">Name A to Z</option><option value="dl" disabled>Downloads (counted from launch)</option></select></label>
        <div class="seg" role="group" aria-label="View">${seg('view-btn', [['list', 'List', ICON.list], ['grid', 'Grid', ICON.grid], ['deck', 'Deck', ICON.deck]])}</div>
      </div>
    </div>
    <div class="results-h"><span data-count aria-live="polite">${kindCount(rows)}</span><div class="fchips" data-chips></div></div>
    <div class="view-list" data-list>
      <div class="list-h"><span>Subject</span><span class="r">Size</span><span class="r">Params</span><span>License</span><span>Date</span></div>
      ${rows.map((r, i) => listRow(r, i === 0)).join('')}
    </div>
    <div class="view-grid cards tiles" data-grid hidden></div>
    <div class="view-deck" data-deck hidden>
      <div class="deck-nav"><button type="button" class="iconbtn" data-deck-prev aria-label="Previous model">${ICON.left}</button><span class="mono deck-count" data-deck-count aria-live="polite"></span><button type="button" class="iconbtn" data-deck-next aria-label="Next model">${ICON.right}</button></div>
      <div class="deck-stage" data-deck-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="Models, one card at a time"><div class="deck-track" data-deck-track></div></div>
      <p class="sub small deck-hint">Slide, drag, or use the arrow keys.</p>
    </div>
    <div class="empty" data-nomatch hidden><b>No model matches these filters.</b><span>Remove a filter or search for something shorter.</span><span><button type="button" class="btn sm" data-clear>Clear all filters</button></span></div>
    <p class="sub small list-foot">Every row is downloadable or links to its source.<span class="hide-ph"> Press / to search, n and p to move in the list.</span></p>` : emptyMsg}
  </div>
  <aside class="pane preview" data-preview aria-live="polite" aria-label="Preview">${rows[0] ? preview(rows[0]) : '<p class="sub small">Nothing to preview yet.</p>'}</aside>
</div>
${rowsJson(rows)}
<div class="statusbar mono"><span>${esc(goal[0])}: ${esc(goal[3])}</span><span class="meter"><i style="width:${goalPct}%"></i></span><span>${goalPct}% funded</span><a class="end" href="${CHARTER_PATH}">README: ${esc(CHARTER_LABEL.toLowerCase())}</a><span>Allternit, the open source alternative</span></div>`,
  };
}
page(catalogPage({}));
SECTIONS.forEach((s) => page(catalogPage({ sec: s })));
COLLECTIONS.forEach((c) => page(catalogPage({ coll: c })));

// ---------- Model pages ----------
function useSnippets(r) {
  const m = r.manifest || {}; const files = m.files || []; const commit = (m.upstream && m.upstream.commit) || '';
  const has = (n) => files.some((f) => f.path === n); const t = r.tasks[0] || '';
  const env = `<span class="k">HF_ENDPOINT</span>=${ORIGIN}`;
  const out = [];
  if (r.manifest) out.push(['fw.py', 'Checks the signature and every sha256, tries each source in order, resumes.', `<span class="c">$ </span>python3 fw.py get ${ORIGIN}/manifests/${esc(r.id)}.json --dir ./${esc(r.repo)}\n<span class="c">$ </span>python3 fw.py verify ./${esc(r.repo)} ./${esc(r.key)}.json`]);
  out.push(['hf', 'The Hugging Face CLI with one setting. Same repo id.', `<span class="c">$ </span>${env} hf download ${esc(r.id)}${commit ? ` --revision ${esc(commit)}` : ''} --local-dir ./${esc(r.repo)}`]);
  if (isData(r)) out.push(['datasets', 'Load it with the datasets library.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> datasets <span class="c">import</span> load_dataset\nds = load_dataset("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})`]);
  else if (r.formats.includes('safetensors') && has('config.json')) {
    const cls = t === 'text-generation' ? ['AutoModelForCausalLM', 'AutoTokenizer', 'tok'] : t === 'image-text-to-text' ? ['AutoModelForImageTextToText', 'AutoProcessor', 'processor'] : ['feature-extraction', 'sentence-similarity'].includes(t) ? ['AutoModel', 'AutoTokenizer', 'tok'] : null;
    if (t === 'automatic-speech-recognition') out.push(['transformers', 'Speech recognition with the transformers pipeline.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> transformers <span class="c">import</span> pipeline\nasr = pipeline("automatic-speech-recognition", model="${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})\nprint(asr("audio.wav")["text"])`]);
    else if (cls) out.push(['transformers', 'Load the weights in Python.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> transformers <span class="c">import</span> ${cls[0]}, ${cls[1]}\n${cls[2]} = ${cls[1]}.from_pretrained("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})\nmodel = ${cls[0]}.from_pretrained("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''}, device_map="auto")`]);
  }
  if (r.formats.includes('safetensors') && has('model_index.json') && /text-to-image|image-to-image/.test(t)) out.push(['diffusers', 'Run the pipeline with diffusers.', `<span class="c">import</span> os\nos.environ[<span class="k">"HF_ENDPOINT"</span>] = "${ORIGIN}"\n<span class="c">from</span> diffusers <span class="c">import</span> DiffusionPipeline\npipe = DiffusionPipeline.from_pretrained("${esc(r.id)}"${commit ? `, revision="${esc(commit)}"` : ''})`]);
  if (r.formats.includes('gguf') && r.wi && r.wi.first) {
    const inc = r.wi.variant.endsWith('/') ? r.wi.variant + '*' : r.wi.variant + '*';
    out.push(['llama.cpp', `Download one GGUF variant (${esc(r.wi.variant.replace(/\/$/, ''))}, ${fmtBytes(r.weight)}), then serve it.`, `<span class="c">$ </span>${env} hf download ${esc(r.id)} --include "${esc(inc)}" --local-dir ./${esc(r.repo)}\n<span class="c">$ </span>llama-server -m ./${esc(r.repo)}/${esc(r.wi.first)}`]);
    out.push(['Ollama', 'Make an Ollama model from the downloaded file.', `<span class="c">$ </span>printf 'FROM ./${esc(r.repo)}/${esc(r.wi.first)}\\n' &gt; Modelfile\n<span class="c">$ </span>ollama create ${esc(r.repo.toLowerCase().replace(/[^a-z0-9.-]+/g, '-'))} -f Modelfile`]);
  }
  if (r.formats.includes('safetensors') && has('config.json') && ['text-generation', 'image-text-to-text'].includes(t)) out.push(['vLLM', 'Serve an OpenAI-compatible API.', `<span class="c">$ </span>${env} vllm serve ${esc(r.id)}${commit ? ` --revision ${esc(commit)}` : ''}`]);
  if (r.formats.includes('mlx')) out.push(['MLX', 'Run on Apple silicon with mlx-lm.', `<span class="c">$ </span>pip install mlx-lm\n<span class="c">$ </span>${env} mlx_lm.generate --model ${esc(r.id)} --prompt "Hello"`]);
  return out;
}
function toolChip(tr) { const lg = LOGO_OWNER(tr); return `<a class="tchip" href="${modelUrl(tr)}">${lg ? `<img class="org" src="${lg}" alt="" width="16" height="16" loading="lazy" decoding="async">` : ''}${esc(tr.name)}</a>`; }
function runsWithHtml(r) {
  const tools = runsWith(r); if (!tools.length) return '';
  const run = tools.filter((t) => t.tool.works_with.role === 'runs'); const train = tools.filter((t) => t.tool.works_with.role === 'trains');
  return `<div class="runs">${run.length ? `<span class="runs-l">Runs with</span>${run.map(toolChip).join('')}` : ''}${train.length ? `<span class="runs-l">Fine-tune with</span>${train.map(toolChip).join('')}` : ''}</div>`;
}
function modelPage(r) {
  const m = r.manifest || {}; const files = m.files || []; const srcs = (m.sources || []).slice().sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  const commit = (m.upstream && m.upstream.commit) || ''; const treeUrl = (m.upstream && m.upstream.url) || r.upstream;
  const mf = `${r.id}.json`; const signed = !!minisig[r.id]; const licLink = r.licenseUrl || r.upstream; const lic = m.license || {};
  const total = files.reduce((a, f) => a + (f.size || 0), 0);
  const kind = { host: 'Allternit origin or registered mirror', seed: 'Peers (community seeded)', src: 'Publisher at the pinned commit' };
  const srcRows = srcs.map((s) => { const k = BADGE[s.type]; let host = s.url || s.magnet || ''; try { host = new URL(s.url).host; } catch (e) {} const bad = s.status === 'failed' || s.ok === false || s.check === 'failed';
    return `<tr><td>${k ? badge(k) : esc(s.type)}</td><td class="path">${esc(host)}</td><td>${fmtTime(s.last_checked)}</td><td>${bad ? '<span style="color:var(--bad)">failed</span>' : s.last_checked ? '<span style="color:var(--ok)">passed</span>' : 'not checked'}</td></tr>`; }).join('');
  const facts = [['Size', fmtBytes(r.size)], ['Weights', r.weight ? `${fmtBytes(r.weight)} (${r.weightLabel})` : isData(r) ? 'dataset' : 'see files'], ['Parameters', r.params ? FWC.params(r.params) : 'not stated'], ['Formats', r.formats.join(', ') || 'see files'], ['Task', r.tasks.map(taskName).join(', ') || 'not tagged'], ['License', `${licName(r.license)} (${r.licClass || 'see card'})`], ['Files', r.manifest ? `${files.length}, each with a sha256` : 'link only'], ['Publisher', r.org], ['Added', r.added ? String(r.added).slice(0, 10) : 'unknown'], ['Section', r.section]];
  const ncNote = `<div class="notice" role="note">${ICON.info}<div><b>${r.licClass === 'gated' ? 'Gated at the source.' : r.licClass === 'non-commercial' ? 'Non-commercial license.' : 'Link only.'}</b> ${esc(PUBLISHER_LINE)} ${esc(r.note || '')}</div></div>`;
  const snippets = r.linkOnly ? [] : useSnippets(r);
  const snipHtml = snippets.map(([name, what, code], i) => `<div class="snip"><div class="snip-h"><b class="mono">${esc(name)}</b><span class="sub small">${what}</span></div>${codeBlock(`use-${i}`, code)}</div>`).join('');
  const gate = (html) => `<details class="box gate"><summary class="pad"><b>Custom license (${esc(r.licClass || 'custom')}).</b> <span class="sub">Read the <a class="link" href="${esc(licLink)}" rel="noopener">license text</a> first. Open this panel to show the commands once you accept its terms.</span></summary><div class="pad">${html}</div></details>`;
  const comfy = TOOLS.find((t) => t.id === 'comfyui');
  const comfyNote = comfy && (/^alt\.freeweights\.(video|music|image)$/.test(r.section) || r.tasks.some((t) => /text-to-(image|video)|image-to-(image|video)|text-to-audio/.test(t)) || /comfy/i.test(r.id)) ? `<div class="notice" role="note" style="margin-top:12px">${ICON.info}<div><b>Packaged for ComfyUI.</b> Most image, video and music models run in <a class="link" href="${esc(comfy.url)}" rel="noopener">ComfyUI ${ICON.ext}</a>. Check the publisher's page for the workflow. Freeweights does not host it.</div></div>` : '';
  const useHtml = (r.linkOnly ? `${ncNote}<p style="margin-top:14px"><a class="btn pri" href="${esc(licLink)}" rel="noopener">Read the license</a> <a class="btn" href="${esc(r.upstream)}" rel="noopener">Open the source ${ICON.ext}</a></p>`
    : (r.requiresTerms || isCustom(r.license)) ? gate(snipHtml) : snipHtml) + comfyNote;
  const filesTable = files.length ? (() => { const t = `<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>File</th><th class="r">Size</th><th>sha256</th></tr></thead><tbody>${files.map((f) => `<tr><td class="path">${esc(f.path)}</td><td class="r mono">${fmtBytes(f.size)}</td><td class="hash full">${esc(f.sha256)}</td></tr>`).join('')}</tbody></table></div>`;
    return `<details class="files"${files.length <= 20 ? ' open' : ''}><summary class="pad">${files.length <= 20 ? 'Hide' : 'Show'} all ${files.length} files with their sha256</summary>${t}</details>`; })() : '';
  const tabs = [
    ['overview', 'Overview', `
      <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <div class="box pad"><div class="box-h">Lineage</div>${r.abliterated || r.changed ? `<p><b>Changed from the base model.</b> ${esc(r.changed || 'The card does not say what changed yet.')}</p>` : '<p class="sub">Original release from the publisher.</p>'}${r.base ? `<p class="sub small" style="margin-top:6px">Base model: <span class="mono">${esc(r.base)}</span></p>` : ''}</div>
      ${r.linkOnly ? ncNote : `<div class="box pad"><div class="box-h">Where these bytes come from</div><div class="flow">${srcs.map((s) => `<span class="n">${esc(kind[BADGE[s.type]] || s.type)}</span>`).join('→')}${srcs.length ? '→' : ''}<span class="n">You</span></div><p class="sub small" style="margin-top:10px">Sources are tried in order. A file counts only when its size and sha256 match the manifest. Sources are checked when you ask for them, not on a timer.</p></div>
      ${srcs.length ? `<div class="box"><div class="pad"><b>Sources</b></div><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Badge</th><th>Host</th><th>Last check</th><th>Result</th></tr></thead><tbody>${srcRows}</tbody></table></div></div>` : ''}`}`],
    ['files', 'Files', r.linkOnly ? `${ncNote}<p class="sub" style="margin-top:12px">There is no manifest and no file list for a link-only model.</p>` : files.length ? `<div class="box"><div class="pad files-h"><b>${plural(files.length, 'file')} · ${fmtBytes(total)}</b><span class="sub small">${r.weight ? `Weights ${fmtBytes(r.weight)} (${esc(r.weightLabel)}).` : ''} Sizes and sha256 from the ${signed ? 'signed ' : ''}manifest.</span></div>${filesTable}</div>` : '<div class="empty"><b>No manifest yet.</b><span>No files are listed until a manifest exists.</span></div>'],
    ['use', 'Use it', `<div class="lead-face">${FWC.action(cardRow(r))}</div>${useHtml}<div class="later-row">${r.linkOnly ? '' : later('Run in Allternit Desktop', 'Phase 1') + later('Fine-tune in Freeweights Studio', 'Phase 3')}</div>`],
    ['license', 'License', `<div class="box pad"><dl class="kv"><dt>Name</dt><dd>${esc(lic.name || licName(r.license))}</dd><dt>Id</dt><dd class="mono">${esc(lic.id || r.license || 'see card')}</dd><dt>Class</dt><dd>${lcTag(r)}</dd><dt>Redistribution</dt><dd>${esc(r.redistribution || 'see card')}</dd>${lic.file_path ? `<dt>Text in</dt><dd class="mono">${esc(lic.file_path)}</dd>` : ''}${lic.file_sha256 ? `<dt>Text sha256</dt><dd class="mono small" style="word-break:break-all">${esc(lic.file_sha256)}</dd>` : ''}<dt>Terms gate</dt><dd>${r.requiresTerms ? 'Yes. The commands stay folded until you open them after reading the license.' : 'No extra terms beyond the license.'}</dd></dl>
      <p style="margin-top:14px"><a class="btn" href="${esc(licLink)}" rel="noopener">Read the license text ${ICON.ext}</a></p></div>
      ${r.linkOnly ? ncNote : ''}
      <p class="sub small" style="margin-top:12px">Licenses are checked against the <a class="link" href="/docs/licenses/">license list</a>. A custom license passes only after a recorded human audit.</p>`],
    ['provenance', 'Provenance', `<div class="lead-face">${FWC.record(cardRow(r), 'head', { link: false })}</div>` + (r.manifest ? `<div class="box pad"><dl class="kv"><dt>Upstream</dt><dd><a class="link mono small" href="${esc(treeUrl)}" rel="noopener">${esc((m.upstream && m.upstream.repo) || r.id)} ${ICON.ext}</a></dd><dt>Pinned commit</dt><dd class="mono small" style="word-break:break-all">${esc(commit || 'not pinned')}</dd><dt>Manifest</dt><dd><a class="link mono small" href="/manifests/${esc(mf)}">${esc(r.repo)}.json</a>${signed ? ` · <a class="link mono small" href="/manifests/${esc(mf)}.minisig">.minisig</a>` : ' (not signed yet)'}</dd><dt>Manifest sha256</dt><dd class="mono small" style="word-break:break-all">${esc(r.mSha || '')}</dd><dt>Signature</dt><dd>${signed ? `minisign, Ed25519, key <span class="mono">${KEY_ID}</span>` : 'not signed yet'}</dd><dt>Created</dt><dd>${fmtTime(m.created_at)}</dd>${m.generator ? `<dt>Generator</dt><dd class="mono small">${esc(typeof m.generator === 'string' ? m.generator : JSON.stringify(m.generator))}</dd>` : ''}<dt>Takedowns</dt><dd>None.</dd></dl></div>
      <h3 class="h3" style="margin:18px 0 8px">How to verify</h3>
      ${codeBlock('verify-cmd', `<span class="c">$ </span>curl -O ${ORIGIN}/manifests/${esc(mf)}${signed ? `\n<span class="c">$ </span>curl -O ${ORIGIN}/manifests/${esc(mf)}.minisig\n<span class="c">$ </span>minisign -Vm ${esc(r.repo)}.json -P ${esc(PUBKEY)}` : ''}\n<span class="c">$ </span>shasum -a 256 &lt;file&gt;   <span class="c"># compare with the Files tab</span>`)}
      <p class="sub small" style="margin-top:10px">${signed ? 'A manifest whose signature fails must be rejected. ' : 'This manifest is not signed yet, so only the sha256 check applies. '}A file whose size or sha256 does not match must be discarded. <a class="link" href="/docs/verify/">Verify a download</a></p>`
      : `${ncNote}<div class="box pad" style="margin-top:12px"><dl class="kv"><dt>Source</dt><dd><a class="link mono small" href="${esc(r.upstream)}" rel="noopener">${esc(String(r.upstream || '').replace(/^https?:\/\//, ''))} ${ICON.ext}</a></dd><dt>Manifest</dt><dd>None: Freeweights does not pin or sign link-only models.</dd><dt>Takedowns</dt><dd>None.</dd></dl></div>`)],
  ];
  const related = LISTED.filter((x) => x.section === r.section && x.id !== r.id).slice(0, 6);
  const rel = related.length >= 2 ? related : [...related, ...LISTED.filter((x) => x.id !== r.id && !related.includes(x) && r.tasks[0] && x.tasks[0] === r.tasks[0])].slice(0, 6);
  return {
    path: modelUrl(r), nav: 'catalog', file: `${r.section}/${r.id}/index.html`, title: r.name,
    desc: `${r.name} (${r.id}): free download with license, sha256 for every file and a manifest. ${licName(r.license)}.`,
    body: `
<div class="wrap page-head m-head">
  <div class="eyebrow mono"><a class="more" href="${sectionUrl(r.section)}">${esc(r.section)}</a> / <b>${esc(r.name)}</b></div>
  ${FWC.combined(cardRow(r), { h1: true, cls: 'fwk-hero' })}
  <div class="meta m-meta"><span class="badges">${badges(r)}</span><span class="mono m-id">${esc(r.id)}</span>${r.sample ? sampleTag() : ''}${r.sourceOnly ? '' : `<span>Last check: ${fmtTime(r.lastCheck)}</span>`}</div>
  ${runsWithHtml(r)}
  ${r.unsigned && !r.failedAt ? `<div class="notice err" role="alert" style="margin-top:16px">${ICON.alert}<div><b>Manifest not signed yet.</b> This model stays off the catalog and on the <a class="link" href="/wanted/">Wanted</a> list until its manifest is signed.</div></div>` : ''}
  ${r.failedAt ? `<div class="notice err" role="alert" style="margin-top:16px">${ICON.alert}<div><b>Source check failed at ${fmtTime(r.failedAt)}.</b> The source did not answer, or its file no longer matches the manifest. This model is on the <a class="link" href="/wanted/">Wanted</a> list until a source passes again.</div></div>` : ''}
</div>
<div class="wrap mgrid">
  <div class="col">
    <div class="mtabs" role="tablist" aria-label="Model details" data-tabs>${tabs.map(([id, l], i) => `<a role="tab" href="#${id}" id="tab-${id}" aria-controls="${id}" aria-selected="${i === 0}">${l}</a>`).join('')}</div>
    ${tabs.map(([id, l, h]) => `<section class="mpanel" id="${id}" role="tabpanel" aria-labelledby="tab-${id}"><h2 class="panel-h h2">${l}</h2>${h}</section>`).join('')}
  </div>
  <div class="col side">
    <div class="box pad act">
      <div class="box-h" style="margin:0">Get it</div>
      <a class="btn pri" href="#use" data-tab-link="use">${r.linkOnly ? 'License and source' : r.requiresTerms ? 'Read license, then download' : ICON.down + 'Download'}</a>
      ${r.linkOnly ? '' : codeBlock('side-cmd', hfLine(r.id))}
      ${r.linkOnly ? '' : later('Run in Allternit Desktop', 'Phase 1')}
    </div>
    ${r.linkOnly ? '' : `<div class="notice">${ICON.shield}<div><b>${signed ? 'Signed manifest' : r.manifest ? 'Manifest (not signed yet)' : 'No manifest yet'}</b><div class="small">${signed ? `minisign, key <span class="mono">${KEY_ID}</span>. ` : ''}${r.manifest ? `<a class="link" href="/manifests/${esc(mf)}">${esc(r.repo)}.json</a>. <a class="link" href="#provenance" data-tab-link="provenance">Provenance</a>. ` : ''}Takedown history: none.</div></div></div>`}
    <div class="box pad"><div class="box-h">Source</div><a class="link mono small" href="${esc(r.upstream)}" rel="noopener" style="overflow-wrap:anywhere">${esc(String(r.upstream || '').replace(/^https?:\/\//, ''))} ${ICON.ext}</a></div>
  </div>
</div>
${rel.length ? `<div class="wrap sec"><div class="sec-h"><h2 class="h2">Related models</h2><a class="more" href="${sectionUrl(r.section)}">All of ${esc(r.section)} →</a></div>${cards(rel)}</div>` : ''}
${rowsJson(rel)}`,
  };
}
ROWS.forEach((r) => page(modelPage(r)));

// ---------- Tool pages ----------
function toolPage(r) {
  const t = r.tool; const g = t.github || {}; const rel = g.release || {}; const c = cardRow(r); const ext = /^https?:/.test(r.upstream);
  const fits = LISTED.filter((x) => toolFits(t, x)); const role = (t.works_with || {}).role;
  const note = `<p class="sub small" style="margin-top:12px">Freeweights links to the project and does not host tool binaries.</p>`;
  const facts = [['Kind', TOOL_KIND[t.kind] || t.kind], ['License', r.license || 'see project'], ['Language', g.language || 'not stated'], ['Platforms', (t.platforms || []).join(', ') || 'see project'], ['Latest release', rel.tag ? `${rel.tag} (${rel.date})` : 'no release'], ['Repository', g.repo || 'not published yet']];
  const installHtml = (t.install_verified && t.install && t.install.length) ? `${codeBlock('t-install', t.install.map((l) => `<span class="c">$ </span>${esc(l)}`).join('\n'))}<p class="sub small" style="margin-top:10px">Checked against the project's README on ${esc(g.fetched || 'the last fetch')}. The project's own instructions win when they differ: <a class="link" href="${esc(t.install_docs || r.upstream)}" rel="noopener">install docs ${ICON.ext}</a></p>`
    : `<div class="box pad"><p>${t.id === 'fw-py' ? 'Copy <span class="mono">scripts/fw.py</span> from the Freeweights repository. See the <a class="link" href="/docs/fw/">fw.py reference</a>.' : `Follow the project's install instructions: <a class="link" href="${esc(t.install_docs || r.upstream)}" rel="noopener">install docs ${ICON.ext}</a>`}</p></div>`;
  const fitList = fits.length ? `<div class="runs runs-list">${fits.slice(0, 60).map((x) => `<a class="tchip" href="${modelUrl(x)}">${esc(x.name)}</a>`).join('')}</div>${fits.length > 60 ? `<p class="sub small">and ${fits.length - 60} more.</p>` : ''}` : '<p class="sub">No catalog model matches yet.</p>';
  const tabs = [
    ['overview', 'Overview', `<p class="m-sum">${esc(t.what)}</p><dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${(g.topics || []).length ? `<div class="runs"><span class="runs-l">Topics</span>${g.topics.slice(0, 12).map((x) => `<span class="tchip mono">${esc(x)}</span>`).join('')}</div>` : ''}${note}`],
    ['install', 'Install', `<div class="lead-face">${FWC.action(c)}</div>${installHtml}${note}`],
    ['use', 'Use with Freeweights', `<div class="box pad"><div class="box-h">${role === 'trains' ? 'Fine-tune a catalog model' : role === 'gets' ? 'Download any hosted model' : 'Run a catalog model'}</div>${t.use ? codeBlock('t-use', `<span class="c">$ </span>${esc(t.use)}`) : ''}<p class="sub small" style="margin-top:8px">Download the weights from Freeweights first (<a class="link" href="/docs/hf-endpoint/">HF_ENDPOINT</a> or <a class="link" href="/docs/fw/">fw.py</a>), then point the tool at the folder.</p></div><h3 class="h3" style="margin:18px 0 8px">${role === 'trains' ? 'Catalog models it can fine-tune' : 'Catalog models it can run'} (${fits.length})</h3>${fitList}`],
    ['license', 'License', `<div class="box pad"><dl class="kv"><dt>License</dt><dd class="mono">${esc(r.license || 'see project')}</dd><dt>Class</dt><dd>${lcTag(r)}</dd></dl>${ext ? `<p style="margin-top:14px"><a class="btn" href="${esc(r.upstream)}/blob/${esc(g.default_branch || 'main')}/LICENSE" rel="noopener">Read the license ${ICON.ext}</a></p>` : ''}</div>${note}`],
    ['provenance', 'Provenance', `<div class="lead-face">${FWC.record(c, 'head', { link: false })}</div><div class="box pad"><dl class="kv"><dt>Repository</dt><dd>${ext ? `<a class="link mono small" href="${esc(r.upstream)}" rel="noopener">${esc(g.repo)} ${ICON.ext}</a>` : 'Not published yet'}</dd><dt>Pinned release</dt><dd class="mono small">${rel.tag ? `<a class="link" href="${esc(rel.url)}" rel="noopener">${esc(rel.tag)}</a>, ${esc(rel.date)}` : 'none'}</dd><dt>Release commit</dt><dd class="mono small" style="word-break:break-all">${esc(rel.commit || 'not known')}</dd><dt>Default branch</dt><dd class="mono small" style="word-break:break-all">${esc(g.default_branch || '')} ${esc(g.branch_commit || '')}</dd><dt>Fetched</dt><dd>${esc(g.fetched || 'not fetched')}</dd><dt>Takedowns</dt><dd>None.</dd></dl></div>${note}`],
  ];
  return {
    path: modelUrl(r), nav: 'catalog', file: `${r.section}/${r.id}/index.html`, title: r.name,
    desc: `${r.name}: ${t.what} Install, the catalog models it ${role === 'trains' ? 'fine-tunes' : 'runs'}, license and the pinned release.`,
    body: `
<div class="wrap page-head m-head">
  <div class="eyebrow mono"><a class="more" href="${sectionUrl(r.section)}">${esc(r.section)}</a> / <b>${esc(r.name)}</b></div>
  ${FWC.combined(c, { h1: true, cls: 'fwk-hero' })}
</div>
<div class="wrap mgrid">
  <div class="col">
    <div class="mtabs" role="tablist" aria-label="Tool details" data-tabs>${tabs.map(([id, l], i) => `<a role="tab" href="#${id}" id="tab-${id}" aria-controls="${id}" aria-selected="${i === 0}">${l}</a>`).join('')}</div>
    ${tabs.map(([id, l, h]) => `<section class="mpanel" id="${id}" role="tabpanel" aria-labelledby="tab-${id}"><h2 class="panel-h h2">${l}</h2>${h}</section>`).join('')}
  </div>
  <div class="col side">
    <div class="box pad act"><div class="box-h" style="margin:0">Get it</div><a class="btn pri" href="#install" data-tab-link="install">Install</a>${ext ? `<a class="btn" href="${esc(r.upstream)}" rel="noopener">Project repository ${ICON.ext}</a>` : `<a class="btn" href="/docs/fw/">fw.py reference</a>`}</div>
    <div class="box pad"><div class="box-h">Works with</div><p class="small">${fits.length} catalog ${fits.length === 1 ? 'model' : 'models'}. <a class="link" href="#use" data-tab-link="use">See the list</a></p></div>
  </div>
</div>
${rowsJson([])}`,
  };
}
TOOL_ROWS.forEach((r) => page(toolPage(r)));

// ---------- content page shell ----------
function contentShell({ eyebrow, title, lead, doc, inject, before = '', after = '', toc = true }) {
  const c = doc ? renderContent(doc, inject) : { html: '', toc: [] };
  return `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.${esc(eyebrow)}</div>
  <h1 class="ph1">${esc(title)}</h1>
  ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
</div>
${before}
<div class="wrap cpage${toc && c.toc.length ? '' : ' notoc'}">
  ${toc && c.toc.length ? `<aside class="cside">${tocHtml(c.toc.filter((t) => t.lv === 2))}</aside>` : ''}
  <div class="prose cbody">${c.html}${after}</div>
</div>`;
}

// ---------- Wanted ----------
{
  const wantedTable = WANTED.length ? `<div class="box"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Model</th><th>Section</th><th class="r">Size</th><th>Why</th></tr></thead><tbody>${WANTED.map((r) => `<tr><td><a class="link" href="${modelUrl(r)}">${esc(r.name)}</a>${r.sample ? sampleTag() : ''}<div class="mono small sub">${esc(r.id)}</div></td><td class="mono small">${esc(r.section)}</td><td class="r mono">${fmtBytes(r.size)}</td><td class="small">${r.failedAt ? `Source check failed at ${fmtTime(r.failedAt)}` : !r.manifest ? 'No manifest yet' : r.unsigned ? 'Manifest not signed yet' : 'Marked wanted'}</td></tr>`).join('')}</tbody></table></div></div>`
    : `<div class="empty"><b>Nothing is wanted right now.</b><span>Every listed model passed its last source check. When a source changes or disappears, the model moves here with the reason and the time.</span></div>`;
  const refusedTable = REFUSED.length ? `<div class="box tblbox"><div class="pad"><b>${plural(REFUSED.length, 'refusal')}</b> <span class="sub small">from catalog/refused.json at build time</span></div><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Model</th><th>License found</th><th>Reason</th></tr></thead><tbody>${REFUSED.map((x) => `<tr><td class="path small full">${x.upstream_url ? `<a class="link" href="${esc(x.upstream_url)}" rel="noopener">${esc(x.id || x.repo)}</a>` : esc(x.id || x.repo)}</td><td class="small">${esc(x.license_id || '')}</td><td class="small full">${esc(x.reason || '')}</td></tr>`).join('')}</tbody></table></div></div>`
    : '<div class="empty"><b>No refusals logged.</b></div>';
  const live = `<h3 class="h3" style="margin:18px 0 10px">Wanted now (${WANTED.length})</h3>${wantedTable}`;
  const fallback = `<section class="csec"><h2 class="h2">Wanted now</h2>${wantedTable}</section><section class="csec" id="refused"><h2 class="h2">Refused, with reasons</h2>${refusedTable}</section>`;
  page({ path: '/wanted/', nav: 'wanted', file: 'wanted/index.html', title: 'Wanted', desc: (WANTED_DOC && WANTED_DOC.fm.summary) || 'Models that failed a source check or lost their source, and how to help seed them.',
    body: contentShell({ eyebrow: 'wanted', title: 'Wanted', lead: WANTED_DOC ? WANTED_DOC.fm.summary : 'Models that failed a check or lost their source.', doc: WANTED_DOC,
      inject: { 'what-wanted-means': (h) => h + live, refused: (h) => h.replace(/<div class="box tblbox">[\s\S]*?<\/table><\/div><\/div>/, refusedTable) },
      after: WANTED_DOC ? '' : fallback }) });
}

// ---------- Mirrors ----------
{
  const reg = MIRRORS.length ? `<div class="box tblbox"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Host</th><th>Region</th><th class="r">Capacity</th><th>Protocols</th><th>Since</th></tr></thead><tbody>${[...MIRRORS].sort((a, b) => String(a.name).localeCompare(String(b.name))).map((x) => `<tr><td style="font-weight:600">${x.url ? `<a class="link" href="${esc(x.url)}" rel="noopener">${esc(x.name)}</a>` : esc(x.name)}</td><td>${esc(x.region || '')}</td><td class="r mono">${x.capacity_tb != null ? esc(x.capacity_tb) + ' TB' : ''}</td><td class="mono small">${esc([].concat(x.protocols || []).join(', '))}</td><td class="mono small">${esc(x.since || '')}</td></tr>`).join('')}</tbody></table></div></div>`
    : `<div class="empty"><b>No mirrors yet.</b><span>The registry (mirrors/registry.json) is empty. Each mirror is listed here with name, capacity, region and start date once its agreement is signed and its files pass the checksum check.</span><span><a class="btn sm" href="#join">How to join</a></span></div>`;
  const stats = `<div class="wrap"><div class="stats" style="margin-top:0;margin-bottom:8px"><div class="stat"><div class="v mono">${MIRRORS.length}</div><div class="l">Mirrors</div></div><div class="stat"><div class="v mono">${MIRRORS.reduce((a, x) => a + (Number(x.capacity_tb) || 0), 0)} TB</div><div class="l">Pledged capacity</div></div><div class="stat"><div class="v mono">${new Set(MIRRORS.map((x) => x.region).filter(Boolean)).size}</div><div class="l">Regions</div></div></div></div>`;
  page({ path: '/mirrors/', nav: 'mirrors', file: 'mirrors/index.html', title: 'Mirrors', desc: (MIRRORS_DOC && MIRRORS_DOC.fm.summary) || 'Organizations that carry Freeweights files, and how to run a mirror.',
    body: contentShell({ eyebrow: 'mirrors', title: 'Mirrors', lead: MIRRORS_DOC ? MIRRORS_DOC.fm.summary : 'Partners carry the bytes; Freeweights keeps the list, the rules and the checksums.', doc: MIRRORS_DOC, before: stats,
      inject: { list: (h) => (MIRRORS.length ? reg + h.replace(/<p><b>No mirrors yet[\s\S]*?<\/p>/, '') : reg) },
      after: MIRRORS_DOC ? '' : `<section class="csec" id="list"><h2 class="h2">Mirror list</h2>${reg}</section>` }) });
}

// ---------- Ledger ----------
{
  const stats = `<div class="wrap"><div class="stats four" style="margin-top:0;margin-bottom:8px">
    <div class="stat"><div class="v mono">${usd(costMonth)}</div><div class="l">Costs${curMonth ? ', ' + curMonth : ' this month'}</div></div>
    <div class="stat"><div class="v mono">${usd(inMonthSum)}</div><div class="l">Money in${curMonth ? ', ' + curMonth : ' this month'}</div></div>
    <div class="stat"><div class="v mono">${usd(Math.max(0, costMonth - inMonthSum))}</div><div class="l">Gap, paid by Allternit</div></div>
    <div class="stat"><div class="v mono">${CHAIN.length}</div><div class="l">Entries in the hash chain</div></div></div></div>`;
  const sigCls = HEAD_SIG.state === 'ok' ? 'ok' : HEAD_SIG.state === 'bad' ? 'err' : '';
  const chainBox = CHAIN.length ? `<div class="box tblbox chain"><div class="pad chain-h"><b>Hash chain</b><span class="sub small">ledger/chain.jsonl · ${plural(CHAIN.length, 'entry')}</span></div><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th class="r">Seq</th><th>Date</th><th>Item</th><th class="r">Amount</th><th>prev_hash</th><th>entry_hash</th></tr></thead><tbody>${CHAIN.map((e) => `<tr><td class="r mono">${esc(e.seq)}</td><td class="mono small">${esc(e.date)}</td><td class="full"><b>${esc(e.vendor_or_source || '')}</b> <span class="sub">${esc(e.item || '')}</span><div class="sub small">${esc(e.direction || '')} · ${esc(e.type || '')}</div></td><td class="r mono">${usd(Math.abs(Number(e.amount_usd) || 0))}</td><td class="hash" title="${esc(e.prev_hash)}">${esc(short(e.prev_hash))}</td><td class="hash" title="${esc(e.entry_hash)}">${esc(short(e.entry_hash))}</td></tr>`).join('')}</tbody></table></div>
    <div class="pad chain-foot"><div class="notice ${sigCls}">${ICON.shield}<div><b>Head: seq ${esc(HEAD ? HEAD.seq : '?')}, ${esc(short(HEAD && HEAD.entry_hash))}</b><div class="small">${esc(HEAD_SIG.text)} Links and hashes checked at build: ${CHAIN_CHECK.bad ? `<b style="color:var(--bad)">broken at seq ${CHAIN_CHECK.bad}</b>` : `${CHAIN_CHECK.ok} of ${CHAIN.length} ok${CHAIN_CHECK.headMatch ? ', head matches the last entry' : ', <b>head does not match the last entry</b>'}`}.${HEAD && HEAD.updated ? ` Head updated ${fmtTime(HEAD.updated)}.` : ''}</div></div></div></div></div>`
    : `<div class="empty"><b>No hash chain yet.</b><span>The ledger rows are below. The chain file appears when the ledger is first chained and signed.</span></div>`;
  const verifyBox = `<h3 class="h3" style="margin:18px 0 8px">Verify it yourself, from this site</h3>${codeBlock('ledger-verify', `<span class="c">$ </span>curl -O ${ORIGIN}/ledger/chain.jsonl -O ${ORIGIN}/ledger/head.json -O ${ORIGIN}/ledger/head.json.minisig\n<span class="c">$ </span>minisign -Vm head.json -P ${esc(PUBKEY)}\n<span class="c">$ </span>python3 - &lt;&lt;'PY'\nimport json, hashlib\nprev = "0" * 64\nfor line in open("chain.jsonl"):\n    e = json.loads(line); h = e.pop("entry_hash")\n    body = json.dumps(e, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()\n    assert e["prev_hash"] == prev and hashlib.sha256(body).hexdigest() == h, e["seq"]\n    prev = h\nprint("chain ok, last entry_hash", prev)\nprint("head says", json.load(open("head.json"))["entry_hash"])\nPY`)}<p class="sub small">The last two lines must print the same hash, and minisign must say the signature is valid for key <span class="mono">${KEY_ID}</span>.</p>`;
  const csvRows = LEDGER.length ? `<div class="box tblbox"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>In or out</th><th>Type</th><th>Who</th><th>What</th><th class="r">Amount</th></tr></thead><tbody>${LEDGER.map((x) => `<tr><td class="mono small">${esc(x.date || x._file.replace('.csv', ''))}</td><td>${dir(x)}</td><td>${esc(x.type || x.category || '')}</td><td>${esc(x.vendor_or_source || x.vendor || '')}</td><td>${esc(x.item || x.description || '')}</td><td class="r mono">${usd(Math.abs(amt(x)))}</td></tr>`).join('')}</tbody></table></div></div>` : '';
  const goalsHtml = `<div class="goals">${GOALS.map((g) => { const p = Math.min(100, Math.round((g[4] / g[2]) * 100)); return `<div class="fund"><div class="row"><b style="font-weight:600">${esc(g[0])}: ${esc(g[1])}</b><span class="mono small">${esc(g[3])}</span></div><div class="meter" role="img" aria-label="${p}% funded"><i style="width:${p}%"></i></div><div class="sub small">${usd(g[4])} of ${usd(g[2])} so far</div></div>`; }).join('')}</div>`;
  page({ path: '/ledger/', nav: 'ledger', file: 'ledger/index.html', title: 'Ledger', desc: (LEDGER_DOC && LEDGER_DOC.fm.summary) || 'What Freeweights costs, the money that comes in, and the funding goals.',
    body: contentShell({ eyebrow: 'ledger', title: 'Ledger', lead: LEDGER_DOC ? LEDGER_DOC.fm.summary : `Downloads stay free. ${SUPPORT_LINE}`, doc: LEDGER_DOC, before: stats,
      inject: { 'tamper-evident': (h) => h + chainBox, verify: (h) => h + verifyBox, goals: (h) => goalsHtml + h },
      after: LEDGER_DOC ? '' : `<section class="csec"><h2 class="h2">Hash chain</h2>${chainBox}${verifyBox}</section><section class="csec"><h2 class="h2">Ledger rows</h2>${csvRows}</section><section class="csec" id="goals"><h2 class="h2">Goals</h2>${goalsHtml}</section>` }) });
}

// ---------- Charter (mission.md; replaces Ethos) ----------
{
  const counter = `<div class="stats" style="margin:14px 0"><div class="stat"><div class="v mono">${TAKEDOWNS.length}</div><div class="l">Removals, all time</div></div><div class="stat"><div class="v mono">${TAKEDOWNS.filter((t) => /copyright|dmca/i.test(t.reason || t.type || '')).length}</div><div class="l">Copyright notices acted on</div></div><div class="stat"><div class="v mono">${TAKEDOWNS.filter((t) => /appeal/i.test(t.status || '')).length}</div><div class="l">Appeals</div></div></div>`;
  const allowed = mdBullets(mdSection(policyMd, 'Allowed')); const banned = mdBullets(mdSection(policyMd, 'Banned'));
  const legacy = `<section class="csec"><h2 class="h2">Mission</h2><p class="mission">${esc(MISSION)}</p></section><section class="csec"><div class="two"><div class="card"><h3>We always</h3><ul>${ETHOS.map((r) => `<li>${esc(r[0])}</li>`).join('')}</ul></div><div class="card never"><h3>We never</h3><ul>${ETHOS.map((r) => `<li>${esc(r[1])}</li>`).join('')}</ul></div></div></section><section class="csec"><h2 class="h2">Content policy</h2><div class="two"><div class="card"><h3>Allowed</h3><ul>${allowed.map((t) => `<li>${mdInline(t)}</li>`).join('')}</ul></div><div class="card never"><h3>Never listed or hosted</h3><ul>${banned.map((t) => `<li>${mdInline(t)}</li>`).join('')}</ul></div></div></section><section class="csec" id="takedowns"><h2 class="h2">Takedowns</h2>${counter}</section>`;
  page({ path: CHARTER_PATH, nav: 'charter', file: CHARTER_PATH.slice(1) + 'index.html', title: CHARTER_LABEL, desc: (MISSION_DOC && MISSION_DOC.fm.summary) || 'Why Freeweights exists, what we always do and never do.',
    body: contentShell({ eyebrow: CHARTER_PATH.replace(/\//g, ''), title: (MISSION_DOC && MISSION_DOC.fm.title) || CHARTER_LABEL, lead: MISSION_DOC ? MISSION_DOC.fm.summary : '', doc: MISSION_DOC,
      inject: { 'we-always': (h) => `<div class="pledge ok">${h}</div>`, 'we-never': (h) => `<div class="pledge never">${h}</div>` },
      after: MISSION_DOC ? `<section class="csec" id="takedown-counter"><h2 class="h2">Takedown counter<a class="anchor" href="#takedown-counter" aria-label="Link to Takedown counter">#</a></h2><p>Every removal is counted here, read from policy/takedowns.json when this page was built.</p>${counter}</section>${MISSION_DOC.fm.updated ? `<p class="sub small" style="margin-top:24px">Updated ${esc(MISSION_DOC.fm.updated)}.</p>` : ''}` : legacy }) });
  // Old paths keep working without the _redirects file (meta refresh fallback).
  for (const old of OLD_CHARTER) page({ path: old, nav: '', file: old.slice(1) + 'index.html', title: CHARTER_LABEL, redirect: CHARTER_PATH, body: `<div class="wrap page-head" style="padding-bottom:60px"><h1 class="ph1">${esc(CHARTER_LABEL)}</h1><p class="lead">This page moved to <a class="link" href="${CHARTER_PATH}">${esc(CHARTER_LABEL)}</a>.</p></div>` });
}

// ---------- Docs ----------
if (DOCS.length) {
  const groups = []; for (const d of DOCS.filter((x) => x.slug !== 'index')) { let g = groups.find((x) => x.name === d.group); if (!g) groups.push((g = { name: d.group, items: [] })); g.items.push(d); }
  const seq = DOCS.filter((x) => x.slug !== 'index');
  const side = (cur) => `<nav class="dside" aria-label="Docs"><a class="dtop${cur.slug === 'index' ? ' on' : ''}" href="/docs/"${cur.slug === 'index' ? ' aria-current="page"' : ''}>Overview</a>${groups.map((g) => `<div class="dg">${g.name ? `<div class="dg-h">${esc(g.name)}</div>` : ''}${g.items.map((d) => `<a href="${d.url}"${d === cur ? ' aria-current="page"' : ''}>${esc(d.label)}</a>`).join('')}</div>`).join('')}</nav>`;
  const phoneNav = (cur) => `<details class="dnav-ph"><summary>${esc(cur.slug === 'index' ? 'Docs overview' : cur.label)}<span class="sub small">All docs</span></summary>${side(cur)}</details>`;
  for (const d of DOCS) {
    const r = md(d.body); const toc = r.toc.filter((t) => t.lv === 2 || t.lv === 3);
    const i = seq.indexOf(d); const prev = i > 0 ? seq[i - 1] : d.slug === 'index' ? null : null; const next = d.slug === 'index' ? seq[0] : seq[i + 1];
    const index = d.slug === 'index' ? `<div class="doc-cards">${groups.map((g) => g.items.map((x) => `<a class="g" href="${x.url}"><span class="p mono">${esc(g.name || 'Docs')}</span><b>${esc(x.title)}</b><p>${esc(x.fm.summary || '')}</p></a>`).join('')).join('')}</div>` : '';
    page({ path: d.url, nav: 'docs', file: d.url.slice(1) + 'index.html', title: d.slug === 'index' ? 'Docs' : `${d.title} · Docs`, desc: d.fm.summary, body: `
<div class="wrap docs3">
  <aside class="dcol">${side(d)}</aside>
  <article class="dmain">
    ${phoneNav(d)}
    <div class="eyebrow mono"><b>alt</b>.freeweights.docs${d.group ? ' / ' + esc(d.group.toLowerCase()) : ''}</div>
    <h1 class="ph1">${esc(r.title || d.title)}</h1>
    ${d.fm.summary ? `<p class="lead">${esc(d.fm.summary)}</p>` : ''}
    <div class="prose dprose">${r.html}${index}</div>
    <nav class="pn" aria-label="Previous and next">${prev ? `<a href="${prev.url}"><span class="sub small">Previous</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}${next ? `<a class="nx" href="${next.url}"><span class="sub small">Next</span><b>${esc(next.title)}</b></a>` : ''}</nav>
    ${d.fm.updated ? `<p class="sub small">Updated ${esc(d.fm.updated)}.</p>` : ''}
  </article>
  <aside class="tcol">${tocHtml(toc)}</aside>
</div>` });
  }
} else {
  page({ path: '/docs/', nav: 'docs', file: 'docs/index.html', title: 'Docs', body: `<div class="wrap page-head"><div class="eyebrow mono"><b>alt</b>.freeweights.docs</div><h1 class="ph1">Docs</h1><p class="lead">Everything works with no account.</p></div><div class="wrap prose" style="padding-bottom:40px"><h2 class="h2">The HF_ENDPOINT line</h2>${codeBlock('d-hf', hfLine((LISTED[0] || { id: 'Qwen/Qwen3-Embedding-0.6B' }).id))}<h2 class="h2">Manifest spec (v0)</h2><div class="box"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Field</th><th>Meaning</th></tr></thead><tbody>${MAN_FIELDS.map((f) => `<tr><td class="mono small">${mdInline(f[0])}</td><td class="small">${mdInline(f[1])}</td></tr>`).join('')}</tbody></table></div></div><p style="margin-top:12px">Public key: <code>${esc(PUBKEY)}</code></p></div>` });
}

// ---------- Card system: one card, four faces ----------
{
  const pick = ['Qwen/Qwen3.6-27B', 'openai/whisper-large-v3-turbo'].map((id) => LISTED.find((r) => r.id === id)).filter(Boolean);
  const lo = LISTED.find((r) => r.linkOnly); if (lo) pick.push(lo);
  while (pick.length < 3 && LISTED.find((r) => !pick.includes(r))) pick.push(LISTED.find((r) => !pick.includes(r)));
  const STYLES = [['a', 'Spec sheet', 'Now the FACTS face. Params, size, formats, license class, source badge and the terms flag.'], ['b', 'Newsgroup post', 'Now the RECORD face. From, Newsgroups, Subject, Date, Commit and Signed lines in mono, then a one-line summary.'], ['c', 'Element tile', 'Now the IDENTITY face. The family monogram in dot lettering, a big size figure and a small facts row.'], ['d', 'Terminal', 'Now the ACTION face. The fw get command, the manifest sha256 prefix and fw verify. Link-only rows say so instead.']];
  // The CLI example is real fw.py output, made when the site is built.
  let cli = '';
  try { cli = execFileSync('python3', [path.join(ROOT, 'scripts/fw.py'), 'info', pick[0].id, '--width', '68'], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' }, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { cli = ''; }
  const anat = (r) => `<div class="anat">${FWC.combined(cardRow(r), { open: true })}</div>`;
  page({ path: '/design/cards/', nav: '', file: 'design/cards/index.html', title: 'Card system', desc: 'One Freeweights card with four faces: Identity, Facts, Record and Action. Where each face shows, on desktop, phone and in the terminal.', wide: true, body: `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.design</div>
  <h1 class="ph1">One card, four faces</h1>
  <p class="lead">Every model has one card. It has four faces that share the same data and the same dot lettering. <b>Identity</b> is the element tile, <b>Facts</b> is the spec sheet, <b>Record</b> is the newsgroup header and <b>Action</b> is the terminal. Each view shows the faces that fit it.</p>
</div>
<div class="wrap sec">
  <div class="faces-key">
    <div><b class="mono">Identity</b><span>Grid front, home, related models. Monogram, size, publisher logo.</span></div>
    <div><b class="mono">Facts</b><span>Grid back (hover, tap or Enter flips it). Next to Identity in the deck and on the model page.</span></div>
    <div><b class="mono">Record</b><span>The list rows, the strip under each tile, the top of every combined card and the Provenance tab.</span></div>
    <div><b class="mono">Action</b><span>The foot of the combined card, the Use it tab and <span class="mono">fw.py info</span> in the terminal.</span></div>
  </div>
  <h2 class="h2" style="margin-top:28px">Anatomy, desktop</h2>
  <div class="anat-row">${pick.map(anat).join('')}</div>
  <h2 class="h2" style="margin-top:28px">Phone, 390 px</h2>
  <div class="anat-phones">${pick.map((r) => `<div class="phone-frame">${anat(r)}${cards([r])}</div>`).join('')}</div>
  <h2 class="h2" style="margin-top:28px">Tools and datasets</h2>
  <p class="sub" style="margin:6px 0 12px">Every catalog entry is built the same way. A tool shows its latest release where a model shows its size, and its Action face is the install command. A dataset's Action face is <span class="mono">load_dataset</span>.</p>
  <div class="anat-row two">${[TOOL_ROWS.find((t) => t.tool.id === 'llama-cpp'), LISTED.find((r) => isData(r) && !r.linkOnly)].filter(Boolean).map(anat).join('')}</div>
  ${cards([...TOOL_ROWS.slice(0, 3), ...LISTED.filter((r) => isData(r)).slice(0, 2)])}
  <h2 class="h2" style="margin-top:28px">In the terminal</h2>
  <p class="sub" style="margin:6px 0 12px">The same card in <span class="mono">fw.py info</span> and <span class="mono">fw.py search</span>: Record lines, key facts and the Action commands. Color only on a terminal, never when NO_COLOR is set. <a class="link" href="/docs/fw/#info">fw.py reference</a></p>
  ${cli ? `<div class="code-block cli-ex"><pre class="block"><code id="cli-ex">${esc(cli)}</code></pre><button class="copy" type="button" data-copy="cli-ex">${ICON.copy}Copy</button></div>` : `<p class="sub small">Run <span class="mono">python3 fw.py info ${esc(pick[0].id)}</span> to see it.</p>`}
</div>
<div class="wrap sec refs">
  <div class="sec-h"><h2 class="h2">The four original styles</h2><div class="seg" role="group" aria-label="Show reference style" data-needs-js>${[['all', 'All'], ['a', 'A'], ['b', 'B'], ['c', 'C'], ['d', 'D']].map(([k, l]) => `<button type="button" class="segb" data-ref-btn="${k}" aria-pressed="${k === 'all'}">${l}</button>`).join('')}</div></div>
  <p class="sub" style="margin:6px 0 4px">Kept as references. Each one became a face of the card above.</p>
</div>
${STYLES.map(([k, name, d]) => `<div class="wrap sec dstyle" id="style-${k}" data-ref="${k}">
  <div class="sec-h"><h3 class="h2"><span class="mono style-k">${k.toUpperCase()}</span> ${esc(name)}</h3></div>
  <p class="sub" style="margin:6px 0 16px">${esc(d)}</p>
  <div class="dstyle-row"><div class="dstyle-desk"><div class="box-h">Desktop</div>${refCards(pick, k)}</div><div class="dstyle-phone"><div class="box-h">Phone, 390 px</div><div class="phone-frame">${refCards(pick.slice(0, 2), k)}</div></div></div>
</div>`).join('')}
${rowsJson(pick)}` });
}

// ---------- Studio status ----------
{
  const engines = [['Allternit Tune (our fork)', 'training'], ['Upstream Unsloth (unmodified)', 'training'], ['Axolotl', 'training'], ['TRL + PEFT', 'training'], ['LLaMA-Factory', 'training'], ['torchtune', 'training'], ['mlx-lm', 'training on Mac'], ['Allternit engine', 'local inference'], ['llama.cpp', 'local inference'], ['MLX', 'local inference'], ['Ollama', 'local inference'], ['vLLM', 'server inference'], ['SGLang', 'server inference']];
  page({ path: '/studio/', nav: 'studio', file: 'studio/index.html', title: 'Studio status', desc: 'Freeweights Studio: fine-tuning and running open models. Honest status per engine.', body: `
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.studio</div>
  <h1 class="ph1">Freeweights Studio</h1>
  <p class="lead">Studio fine-tunes and runs Freeweights models on your computer, a paired computer or a Compute box, from one job file for every engine. It arrives in Phase 3. Until then this page shows the honest status of each engine.</p>
  <div style="margin-top:16px;max-width:520px">${later('Fine-tune in Freeweights Studio', 'Phase 3')}</div>
</div>
<div class="wrap sec">
  <h2 class="h2">Engines</h2>
  <div class="box" style="margin-top:14px"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Engine</th><th>Kind</th><th>Status</th></tr></thead><tbody>${engines.map((e) => `<tr><td style="font-weight:600">${esc(e[0])}</td><td>${esc(e[1])}</td><td class="sub">Not started</td></tr>`).join('')}</tbody></table></div></div>
</div>` });
}

// 404
page({ path: '/404.html', nav: '', file: '404.html', title: 'Not found', body: `
<div class="wrap page-head" style="padding-bottom:60px">
  <div class="eyebrow mono"><b>alt</b>.freeweights.404</div>
  <h1 class="ph1">Not found</h1>
  <p class="lead">This page or model is not in the catalog. If a model lost its source, it may be on the <a class="link" href="/wanted/">Wanted</a> list.</p>
  <p style="margin-top:16px"><a class="btn pri" href="/alt.freeweights/">Browse the catalog</a></p>
</div>` });

// ---------- write ----------
// Empty dist in place (a preview server may be serving from inside it), then write.
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
const write = (rel, s) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
for (const p of pages) write(p.file, layout(p));
fs.cpSync(path.join(SITE, 'assets'), path.join(OUT, 'assets'), { recursive: true });
for (const r of ROWS) if (r.manifest) {
  fs.mkdirSync(path.join(OUT, 'manifests', r.org), { recursive: true });
  fs.copyFileSync(manifestFile[r.id], path.join(OUT, 'manifests', `${r.id}.json`));
  if (minisig[r.id]) fs.copyFileSync(minisig[r.id], path.join(OUT, 'manifests', `${r.id}.json.minisig`));
}
for (const f of ['chain.jsonl', 'head.json', 'head.json.minisig']) if (exists(path.join(ROOT, 'ledger', f))) fs.copyFileSync(path.join(ROOT, 'ledger', f), path.join(OUT, 'ledger', f));
if (exists(path.join(ROOT, 'spec/keys/freeweights-v0.pub'))) { fs.mkdirSync(path.join(OUT, 'keys'), { recursive: true }); fs.copyFileSync(path.join(ROOT, 'spec/keys/freeweights-v0.pub'), path.join(OUT, 'keys/freeweights-v0.pub')); }
write('data/catalog.json', JSON.stringify({ generated_from: dataSource, sections: SECTIONS.map((s) => ({ ...s, count: secCount(s) })), collections: COLLECTIONS.map(({ test, rows, ...c }) => ({ ...c, ids: rows.map((r) => r.id) })), rows: ROWS.map(({ manifest, wi, ...r }) => r) }, null, 2));
write('_redirects', [...['/alt.freeweights', ...SECTIONS.map((s) => s.id)].map((s) => `/${s} /${s}/ 301`), ...OLD_CHARTER.flatMap((o) => [`${o.slice(0, -1)} ${CHARTER_PATH} 301`, `${o} ${CHARTER_PATH} 301`])].join('\n') + '\n');
console.log(`Freeweights site: ${pages.length} pages, ${LISTED.length} listed, ${WANTED.length} wanted, ${DOCS.length} docs, chain ${CHAIN.length} (${CHAIN_CHECK.bad ? 'BROKEN at ' + CHAIN_CHECK.bad : 'ok'}), head sig ${HEAD_SIG.state}, data from ${dataSource} -> ${path.relative(process.cwd(), OUT) || OUT}`);
