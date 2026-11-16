import { KEY_ID } from './env.mjs';
import { licName, plural } from './util.mjs';
import { TOOLS, logoOf, minisig, modelUrl } from './catalog.mjs';
import { FWC } from './faces.mjs';
import { inline } from './markdown.mjs';
import { HOW, SRC_LABEL, hostOf, isData, sizeBucket, summary, taskName } from './rows.mjs';
import { TOP, byRank, bySection } from './paging.mjs';
import { FACETS_OVERLAY, FACET_LABELS_OVERLAY, FACET_LABEL_FN, FACET_ORDER_OVERLAY } from './facets.mjs';


export const FACETS = [
  ['kind', 'Kind', (r) => [r.kind === 'tool' ? 'tool' : isData(r) ? 'dataset' : 'model']],
  ['sec', 'Section', (r) => [r.fam]],
  ['task', 'Task', (r) => (r.tasks.length ? r.tasks : ['not tagged'])],
  ['lc', 'License class', (r) => [r.licClass || 'unknown']],
  ['fmt', 'Format', (r) => (r.formats.length ? r.formats : ['other'])],
  ['sz', 'Size', (r) => [sizeBucket(r.size)]],
  ['how', 'Listing', (r) => [HOW(r)]],
  ['src', 'Bytes from', (r) => [SRC_LABEL(r)]],
  ['rt', 'Terms', (r) => [r.requiresTerms ? 'yes' : 'no']],
  ...FACETS_OVERLAY,
];
// Tools have no size, parameters, format, task or terms: those facets give them no value, so a
// filter on one of them leaves tools out instead of mislabelling them.
export const TOOL_FV = { kind: () => ['tool'], sec: () => ['tools'], lc: (r) => [r.licClass || 'unknown'], src: () => ['Links to the project'] };
export const facetVals = (k, f, r) => (r.kind === 'tool' ? (TOOL_FV[k] ? TOOL_FV[k](r) : []) : f(r));
export const FACET_LABEL = {
  kind: { model: 'Models', dataset: 'Datasets', tool: 'Tools' },
  lc: { copyleft: 'Copyleft (link only)', permissive: 'Permissive', custom: 'Custom terms', 'non-commercial': 'Non-commercial (link only)', gated: 'Gated (link only)', territory: 'Territory-limited (link only)', restricted: 'Barred derivative (link only)', unreviewed: 'License not reviewed (link only)', unknown: 'Not stated' },
  sz: { s: 'Under 4 GB', m: '4 to 40 GB', l: '40 to 200 GB', xl: '200 GB and up' },
  ...FACET_LABELS_OVERLAY,
  rt: { yes: 'Requires accepting terms', no: 'No extra terms' },
};
export const FACET_ORDER = { kind: ['model', 'dataset', 'tool'], sz: ['s', 'm', 'l', 'xl'], rt: ['no', 'yes'], ...FACET_ORDER_OVERLAY };
export const facetLabel = (k, v) => (FACET_LABEL[k] && FACET_LABEL[k][v]) || (k === 'task' ? taskName(v) : FACET_LABEL_FN[k] ? FACET_LABEL_FN[k](v) : v);
export function cardRow(r) {
  if (r.kind === 'tool') return toolCardRow(r);
  const m = r.manifest; const up = (m && m.upstream) || {};
  return { kind: isData(r) ? 'dataset' : 'model', id: r.id, key: r.key, n: r.name, org: r.org, sec: r.section, fam: r.fam, mono: r.mono, url: modelUrl(r), size: r.size || 0, params: r.params || 0, fmt: r.formats, task: r.tasks, lc: r.licClass, lic: licName(r.license), rt: r.requiresTerms, src: SRC_LABEL(r), how: HOW(r), nc: r.linkOnly, added: r.added, sha: r.mSha ? r.mSha.slice(0, 12) : '', files: m ? (m.files || []).length : 0, host: up.host || hostOf(r.upstream), commit: up.commit || '', sum: r.summary, logo: logoOf(r.org), sig: r.manifest && minisig[r.id] ? KEY_ID : '', licUrl: r.licenseUrl || r.upstream || '', fv: Object.fromEntries(FACETS.map(([k, , f]) => [k, facetVals(k, f, r)])) };
}
// ---------- Tools as catalog entries ----------
// catalog/tools.json, filled from GitHub by scripts/enrich_tools.py. Each tool gets the same four
// faces and a detail page. Freeweights links to the project and does not host tool binaries.
export const TOOL_LC = (spdx) => (/^(MIT|Apache-2\.0|BSD|ISC|Zlib|Unlicense|MPL)/i.test(spdx || '') ? 'permissive' : /GPL/i.test(spdx || '') ? 'copyleft' : 'unknown');
export const TOOL_KIND = { inference: 'inference', training: 'training', ui: 'app', format: 'format', ours: 'ours' };
// A tool's category (catalog/tools/<id>.json) is its kind label on cards and pages.
export const TOOL_CAT = { inference: 'inference engine', apps: 'app or UI', training: 'training', quantization: 'quantization and conversion', eval: 'evaluation', agents: 'agents and gateways', data: 'data and documents', retrieval: 'retrieval', distribution: 'distribution', speech: 'speech', safety: 'safety scanner' };
export const toolKind = (t) => TOOL_CAT[t.category] || TOOL_KIND[t.kind] || t.kind;
// How a tool relates to catalog entries: label on a model page, heading on the tool's Use tab.
export const TOOL_ROLE = { runs: ['Runs with', 'Run a catalog model'], trains: ['Fine-tune with', 'Fine-tune a catalog model'], converts: ['Convert with', 'Convert a catalog model'], evals: ['Evaluate with', 'Evaluate a catalog model'], scans: ['Scan with', 'Scan a downloaded model'], uses: ['Works with', 'Use a catalog model'], gets: ['Downloads with', 'Download any hosted model'] };
export const TOOL_ROWS = TOOLS.map((t) => {
  const g = t.github || {}; const repo = g.repo || (t.id === 'fw-py' ? 'allternit/fw.py' : 'allternit/' + t.id); const [owner, name] = repo.split('/');
  const rel = g.release || {}; const spdx = g.license || t.license;
  return { kind: 'tool', tool: t, id: repo, key: repo.replace(/\//g, '__'), org: owner, repo: name, name: t.name, section: 'alt.freeweights.tools', fam: 'tools',
    mono: t.name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase(), rk: 26, dl: 0, license: spdx, licClass: TOOL_LC(spdx), tasks: [], formats: [], size: null, params: null,
    added: rel.date || g.fetched || null, tag: rel.tag || '', summary: g.description && g.description.length > (t.what || '').length ? g.description : t.what,
    upstream: /^https?:/.test(t.url) ? `https://github.com/${repo}` : t.url, linkOnly: false, requiresTerms: false, badges: [], sample: false, lastByType: {} };
});
export const LOGO_OWNER = (r) => logoOf(r.org) || (r.tool && /^https:\/\/github\.com\/([^/]+)/.test(r.tool.url) ? logoOf(r.tool.url.match(/^https:\/\/github\.com\/([^/]+)/)[1]) : '');
export function toolCardRow(r) {
  const t = r.tool; const g = t.github || {}; const rel = g.release || {};
  return { kind: 'tool', id: r.id, key: r.key, n: r.name, org: r.org, sec: r.section, fam: 'tools', mono: r.mono, url: modelUrl(r), size: 0, params: 0, fmt: [], task: [],
    lc: r.licClass, lic: r.license, rt: false, src: 'Links to the project', nc: false, added: r.added, sha: '', files: 0, host: 'github.com', commit: rel.commit || g.branch_commit || '',
    sum: r.summary, logo: LOGO_OWNER(r), sig: '', licUrl: r.upstream, tag: rel.tag || '', relDate: rel.date || '', lang: g.language || '', tkind: toolKind(t),
    platforms: t.platforms || [], install: t.install_verified ? t.install || [] : [], installDocs: t.install_docs || r.upstream, use: t.use || '', role: (t.works_with || {}).role || '',
    fv: Object.fromEntries(FACETS.map(([k, , f]) => [k, facetVals(k, f, r)])) };
}
// Which catalog entries a tool runs or trains (works_with in tools.json).
export function toolFits(t, r) {
  const w = t.works_with || {}; if (r.kind === 'tool') return false;
  if (w.all_hosted) return !r.linkOnly && !!r.manifest;
  if (w.match) return new RegExp(w.match, 'i').test(r.id);
  if ((w.sections || []).includes(r.fam)) return true;
  if (w.formats && !w.formats.some((f) => r.formats.includes(f))) return false;
  if (w.tasks && !w.tasks.some((x) => r.tasks.includes(x))) return false;
  return !!(w.formats || w.tasks);
}
export const runsWith = (r) => TOOL_ROWS.filter((tr) => tr.tool.works_with && tr.tool.works_with.role !== 'gets' && toolFits(tr.tool, r));
export const kindCount = (rows) => { const c = { model: 0, dataset: 0, tool: 0 }; rows.forEach((r) => c[r.kind === 'tool' ? 'tool' : isData(r) ? 'dataset' : 'model']++); return [['model', 'model'], ['dataset', 'dataset'], ['tool', 'tool']].filter(([k]) => c[k]).map(([k, w]) => plural(c[k], w)).join(' · ') || '0 models'; };
export const rowsJson = (rows) => `<script type="application/json" id="fw-rows">${JSON.stringify(rows.map(cardRow)).replace(/</g, '\\u003c')}</script>`;
// Catalog cards in shards and inline: the facet values travel in the search index, not on each card.
export const shardCard = (r) => { const c = cardRow(r); delete c.fv; if (r.sample) c.smp = 1; return c; };
export const catalogJson = (rows) => `<script type="application/json" id="fw-rows">${JSON.stringify(rows.map(shardCard)).replace(/</g, '\\u003c')}</script>`;
// Tiles (IDENTITY front, FACTS back, RECORD strip) for home, related models and the grid.
export const cards = (rows) => `<div class="cards tiles">${rows.map((r) => FWC.tile(cardRow(r))).join('')}</div>`;
// The old single-face styles A to D, kept as references on /design/cards/ only.
export const refCards = (rows, style) => `<div class="cards" data-fixed="${style}">${rows.map((r) => FWC.card(style, cardRow(r))).join('')}</div>`;
export const secCount = (s) => s.id === 'alt.freeweights.tools' ? TOOLS.length : bySection(s.id).length;
export const ENTRIES = () => [...TOP, ...TOOL_ROWS].sort(byRank);
