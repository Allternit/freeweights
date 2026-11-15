import path from 'node:path';
import { ROOT } from './env.mjs';
import { csv, exists, ls, mdSection, rd, readJSON } from './util.mjs';
import { manifests } from './catalog.mjs';

// ledger: ledger/*.csv. Columns are read loosely: date, direction (in/out) or a signed amount, type, description, amount*, invoice.
export const LEDGER = ls(path.join(ROOT, 'ledger'), /\.csv$/).flatMap((f) => csv(rd(f)).map((r) => ({ ...r, _file: path.basename(f) })));
export const amt = (r) => { const k = Object.keys(r).find((x) => /amount/.test(x)); return k ? Number(String(r[k]).replace(/[^0-9.-]/g, '')) || 0 : 0; };
export const dir = (r) => { const d = String(r.direction || r.flow || r.kind || '').toLowerCase(); if (/^(in|income|money in)$/.test(d)) return 'in'; if (/^(out|cost|expense|money out)$/.test(d)) return 'out'; return amt(r) < 0 ? 'out' : 'in'; };
export const months = [...new Set(LEDGER.map((r) => String(r.date || r._file).slice(0, 7)))].sort();
export const curMonth = months[months.length - 1] || null;
export const inMonth = LEDGER.filter((r) => curMonth && String(r.date || r._file).slice(0, 7) === curMonth);
export const costMonth = inMonth.filter((r) => dir(r) === 'out').reduce((a, r) => a + Math.abs(amt(r)), 0);
export const inMonthSum = inMonth.filter((r) => dir(r) === 'in').reduce((a, r) => a + Math.abs(amt(r)), 0);
export const shareMonth = inMonth.filter((r) => dir(r) === 'in' && /allternit/i.test(r.type || r.category || '')).reduce((a, r) => a + Math.abs(amt(r)), 0);
export const totalIn = LEDGER.filter((r) => dir(r) === 'in').reduce((a, r) => a + Math.abs(amt(r)), 0);

export let MIRRORS = [];
export const mreg = path.join(ROOT, 'mirrors/registry.json');
if (exists(mreg)) { try { const j = readJSON(mreg); MIRRORS = Array.isArray(j) ? j : j.mirrors || []; } catch (e) { console.warn('mirrors/registry.json unreadable:', e.message); } }
export let TAKEDOWNS = [];
for (const f of [path.join(ROOT, 'catalog/_takedowns.json'), path.join(ROOT, 'policy/takedowns.json')]) if (exists(f)) { try { const j = readJSON(f); TAKEDOWNS = Array.isArray(j) ? j : j.takedowns || j.entries || []; } catch (e) {} }
export let REFUSED = [];
for (const f of [path.join(ROOT, 'catalog/_refused.json'), path.join(ROOT, 'catalog/refused.json')]) if (exists(f)) { try { const j = readJSON(f); REFUSED = Array.isArray(j) ? j : j.refused || []; } catch (e) {} }

export const ethosMd = rd(path.join(ROOT, 'policy/ethos.md'));
export const MISSION = mdSection(ethosMd, 'Mission').join(' ').trim();
export const ETHOS = mdSection(ethosMd, 'We always / We never').filter((l) => /^\|/.test(l) && !/---|We always/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
export const policyMd = rd(path.join(ROOT, 'policy/content-policy.md'));
export const licMd = rd(path.join(ROOT, 'policy/license-allowlist.md'));
export const manMd = rd(path.join(ROOT, 'spec/manifest-v0.md'));
export const MAN_FIELDS = mdSection(manMd, 'Fields').filter((l) => /^\|/.test(l) && !/---|Field \| Meaning/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
export const PUBKEY = (manMd.match(/Public key: `([^`]+)`/) || [])[1] || (exists(path.join(ROOT, 'spec/keys/freeweights-v0.pub')) ? rd(path.join(ROOT, 'spec/keys/freeweights-v0.pub')).trim().split('\n').pop() : '');

export let GOALS = [
  ['Goal 1', 'Stage 1: our own tracker and hub, up to 1 TB hosted', 45, '45 USD, or a verified free VM'],
  ['Goal 2', 'Stage 2: a 6 TB web-seed origin; permissive models move to Hosted; uploads open', 126, '126 to 270 USD prepaid'],
  ['Goal 3', 'Stage 3: 50 TB for community repos and more quants', 1050, '1,050 to 2,250 USD prepaid, or a sponsor or credits'],
];

export const gj = path.join(ROOT, 'ledger/goals.json');
if (exists(gj)) { try { GOALS = readJSON(gj).goals.map((g) => [`Goal ${g.stage}`, `Stage ${g.stage}: ${g.name}`, g.amount_usd_min, `${g.amount_usd_min === g.amount_usd_max ? g.amount_usd_min.toLocaleString('en-US') : g.amount_usd_min.toLocaleString('en-US') + ' to ' + g.amount_usd_max.toLocaleString('en-US')} USD, ${g.amount_note}`, g.raised_usd || 0, g.unlocks]); } catch (e) { console.warn('ledger/goals.json unreadable:', e.message); } }
GOALS = GOALS.map((g) => (g.length > 4 ? g : [...g, totalIn, '']));
// refusals logged by the manifest tool: "<time> <repo> <reason>"
export const refusedLog = path.join(ROOT, 'manifests/refused.log');
if (exists(refusedLog)) rd(refusedLog).split('\n').filter(Boolean).forEach((l) => { const [t, repo, ...why] = l.split(' '); REFUSED.push({ time: t, repo, reason: why.join(' ') }); });
export const REFUSED_LAST = Object.values(Object.fromEntries(REFUSED.map((r) => [r.repo, r])));

