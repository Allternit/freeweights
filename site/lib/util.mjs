import fs from 'node:fs';
import path from 'node:path';
import { esc } from './md-core.mjs';

export const rd = (p) => fs.readFileSync(p, 'utf8');
export const exists = (p) => fs.existsSync(p);
export const readJSON = (p) => JSON.parse(rd(p));
export const ls = (d, re) => (exists(d) ? fs.readdirSync(d).filter((f) => re.test(f)).sort().map((f) => path.join(d, f)) : []);
export { esc } from './md-core.mjs';
export const fmtBytes = (n) => {
  if (n == null || isNaN(n)) return 'size unknown';
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; let v = Number(n);
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return (v >= 100 || i === 0 ? Math.round(v).toLocaleString('en-US') : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + u[i];
};
export const fmtParams = (n) => (!n ? '' : n >= 1e9 ? +(n / 1e9).toFixed(1) + 'B' : +(n / 1e6).toFixed(0) + 'M') + ' params';
export const fmtTime = (t) => { if (!t) return 'never'; const d = new Date(t); return isNaN(d) ? esc(t) : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; };
export const usd = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' USD';
export const LICENSE_NAMES = { 'apache-2.0': 'Apache-2.0', mit: 'MIT', 'bsd-2-clause': 'BSD-2-Clause', 'bsd-3-clause': 'BSD-3-Clause', 'cc-by-4.0': 'CC-BY-4.0', 'cc0-1.0': 'CC0-1.0' };
export const licName = (id) => (!id ? 'see card' : LICENSE_NAMES[String(id).toLowerCase()] || String(id).replace(/^LicenseRef-/, '') + (String(id).startsWith('LicenseRef-') ? ' (custom)' : ''));
export const isCustom = (id) => String(id || '').startsWith('LicenseRef-');
export const BADGE = { hosted: 'host', host: 'host', allternit: 'host', seeded: 'seed', seed: 'seed', community: 'seed', source: 'src', src: 'src' };
export const BADGE_KEY = { host: 'hosted', seed: 'seeded', src: 'source' };
export const SUPPORT_LINE = 'Support goes to Allternit LLC. It is not a charitable gift and is not tax-deductible.';

export function csv(text) {
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
export function mdSection(md, heading) {
  const m = md.split('\n'); const i = m.findIndex((l) => l.replace(/^#+\s*/, '').trim() === heading);
  if (i < 0) return [];
  const o = []; for (let j = i + 1; j < m.length && !/^#{1,2}\s/.test(m[j]); j++) o.push(m[j]);
  return o;
}
export const mdBullets = (lines) => lines.filter((l) => /^\s*(-|\d+\.)\s/.test(l)).map((l) => l.replace(/^\s*(-|\d+\.)\s+/, ''));
export const mdInline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
export const plural = (n, w) => `${n} ${n === 1 ? w : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's'}`;
