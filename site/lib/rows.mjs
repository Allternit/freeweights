import fs from 'node:fs';
import crypto from 'node:crypto';
import { esc, fmtBytes, licName } from './util.mjs';
import { LINK_REASON, ROWS, manifestFile, schema } from './catalog.mjs';
import { FWC } from './faces.mjs';
import { content, plain } from './markdown.mjs';

export const MONO = { qwen: 'QW', deepseek: 'DS', kimi: 'KM', glm: 'GL', minimax: 'MX', mimo: 'MO', gemma: 'GM', 'gpt-oss': 'GO', olmo: 'OL', nemotron: 'NV', phi: 'PH', mistral: 'MS', speech: 'SP', embed: 'EM', image: 'IM', ocr: 'OC', datasets: 'DT', tools: 'TL', abliterated: 'AB', video: 'VI', music: 'MU', allternit: 'AT' };
// Kind is stored on the row (spec/catalog-schema.json). The section fallback is only for rows made from a bare manifest.
export const isData = (r) => (r.kind ? r.kind === 'dataset' : r.section === 'alt.freeweights.datasets' || (r.formats.length > 0 && r.formats.every((f) => f === 'parquet' || f === 'jsonl')));
// How the license verdict was reached (audit.method); "tag" carries the publisher-declared label.
export const AUDIT_LABEL = { tag: 'License as declared by the publisher. No person read it.', 'text-hash': 'Same license text as one a person already read.', reviewed: 'Checked and recorded in the license audit.', queue: 'Waiting for a person to read it.' };
export const auditLine = (r) => { const a = r.audit || {}; if (!a.method) return ''; const t = a.method === 'inherited' ? `Inherited from the base model${r.relation && r.relation.parent ? ' ' + r.relation.parent : ''}: the strictest license along the lineage applies.` : AUDIT_LABEL[a.method] || a.method; return `<dt>Decided</dt><dd>${esc(t)}${a.at ? ` <span class="sub small mono">${esc(String(a.at).slice(0, 10))}</span>` : ''}</dd>`; };
export const hostOf = (u) => { try { return new URL(u).host; } catch (e) { return 'huggingface.co'; } };
// Weight bytes from the manifest: all safetensors; for GGUF and ONNX, the smallest variant.
export function weightInfo(r) {
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
export const taskName = (t) => String(t).replace(/-/g, ' ');
export const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function summary(r) {
  const c = content(`models/${r.key}.md`); if (c && (c.fm.summary || c.body.trim())) return plain(c.fm.summary || c.body.trim().split('\n\n')[0]);
  const what = isData(r) ? 'Dataset' : r.tasks.length ? capital(taskName(r.tasks[0])) + ' model' : 'Model';
  const p = r.params ? ` with ${FWC.params(r.params)} parameters` : '';
  const fmt = r.formats.length ? `${r.formats.join(' and ')} ${isData(r) ? 'files' : 'weights'}` : 'files';
  return `${what}${p}. ${capital(fmt)}, ${fmtBytes(r.size)} in all. Published by ${r.org} under ${licName(r.license)}.${r.abliterated || r.changed ? ' Changed from the base model.' : ''}`;
}
export const sizeBucket = (n) => { const gb = (n || 0) / 1e9; return gb < 4 ? 's' : gb < 40 ? 'm' : gb < 200 ? 'l' : 'xl'; };
export const paramBucket = (n) => (!n ? 'none' : n < 3e9 ? 'p1' : n < 15e9 ? 'p2' : n < 70e9 ? 'p3' : n < 300e9 ? 'p4' : 'p5');
export const HOW = (r) => (r.sourceOnly ? `From the publisher · ${LINK_REASON[r.linkReason || 'not-reviewed'][0]}` : r.unsigned ? 'Hosted (not signed yet)' : 'Hosted (signed)');
// List rows: the license has its own column, so a link-only row says only who it comes from; the full text (with the reason) is the title.
export const howTag = (r) => `<span class="hw ${r.sourceOnly ? 'hw-pub' : 'hw-host'}" title="${esc(HOW(r))}">${esc(r.sourceOnly ? 'From the publisher' : HOW(r))}</span>`;
export const SRC_LABEL = (r) => (r.failedAt ? 'Source check failed' : r.sourceOnly ? 'From the publisher' : r.badges.includes('host') ? 'Hosted by Allternit' : r.badges.includes('seed') ? 'Community seeded' : 'From source');
for (const r of ROWS) {
  r.fam = r.section.replace(/^alt\.freeweights\./, ''); r.mono = MONO[r.fam] || r.fam.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase();
  const wi = weightInfo(r); r.weight = wi.bytes; r.weightLabel = wi.label; r.wi = wi;
  r.summary = summary(r);
  r.mSha = r.manifest && manifestFile[r.id] ? crypto.createHash('sha256').update(fs.readFileSync(manifestFile[r.id])).digest('hex') : null;
}
