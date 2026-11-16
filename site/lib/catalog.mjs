import path from 'node:path';
import { ORIGIN, ROOT, SITE } from './env.mjs';
import { BADGE, exists, ls, readJSON } from './util.mjs';
import { overlayOf } from './overlay.mjs';

// ---------- data ----------
export const schema = readJSON(path.join(ROOT, 'spec/catalog-schema.json'));
export const SECTIONS = (schema['x-sections'] || []).map((s) => ({ ...s, family: s.id.replace(/^alt\.freeweights\./, '') }));

export let dataSource = 'catalog';
export function loadRows() {
  const found = [];
  const add = (v) => { if (Array.isArray(v)) v.forEach(add); else if (v && Array.isArray(v.rows)) v.rows.forEach(add); else if (v && Array.isArray(v.models)) v.models.forEach(add); else if (v && v.id && v.section) found.push(v); };
  const cat = path.join(ROOT, 'catalog');
  for (const f of [...ls(cat, /\.json$/), ...ls(path.join(cat, 'rows'), /\.json$/)]) { try { add(readJSON(f)); } catch (e) { console.warn('skip unreadable row file', f, e.message); } }
  if (!found.length && REAL_MANIFESTS) { dataSource = 'manifests'; Object.values(manifests).forEach((m) => add(rowFromManifest(m))); }
  if (!found.length) { dataSource = 'samples'; loadManifests(ls(path.join(ROOT, 'spec/samples'), /\.manifest\.json$/)); ls(path.join(ROOT, 'spec/samples'), /\.catalog-row\.json$/).forEach((f) => add(readJSON(f))); }
  const seen = new Set(); return found.filter((r) => !seen.has(r.id) && seen.add(r.id));
}
export const manifests = {}; export const minisig = {}; export const manifestFile = {};
export function loadManifests(files) {
  for (const f of files) {
    try { const m = readJSON(f); if (m.id) { manifests[m.id] = m; manifestFile[m.id] = f; minisig[m.id] = exists(f + '.minisig') ? f + '.minisig' : null; } } catch (e) { console.warn('skip unreadable manifest', f, e.message); }
  }
}
loadManifests(ls(path.join(ROOT, 'manifests'), /\.json$/));
export const REAL_MANIFESTS = Object.keys(manifests).length;
export const FMT = [[/\.safetensors$/, 'safetensors'], [/\.gguf$/, 'gguf'], [/\.onnx$/, 'onnx']];
export function rowFromManifest(m) {
  const files = m.files || []; const formats = new Set();
  files.forEach((f) => FMT.forEach(([re, n]) => re.test(f.path) && formats.add(n)));
  if (/mlx/i.test(m.id) && formats.has('safetensors')) { formats.delete('safetensors'); formats.add('mlx'); }
  return { id: m.id, section: m.section, display_name: m.id.split('/').pop(), license_id: m.license && m.license.id, redistribution: m.license && m.license.redistribution,
    formats: [...formats], tasks: [], total_size: files.reduce((a, f) => a + (f.size || 0), 0), upstream_url: `https://${(m.upstream && m.upstream.host) || 'huggingface.co'}/${m.id}`,
    manifest_url: `${ORIGIN}/manifests/${m.id}.json`, added_at: m.created_at, sample: !!m.sample, badges: [] };
}
export function sourceState(m) {
  const srcs = (m && m.sources) || [];
  const failed = (s) => s.status === 'failed' || s.ok === false || s.check === 'failed';
  const times = srcs.map((s) => s.last_checked).filter(Boolean).sort();
  return { srcs, failed, allFailed: srcs.length > 0 && srcs.every(failed), last: times[times.length - 1] || null };
}
// Hosted (signed manifest) vs From the publisher (link only), and why a row is link only.
export const LINK_CLASSES = new Set(['non-commercial', 'gated', 'territory', 'copyleft', 'restricted', 'unreviewed']);
export const CLASS_REASON = { 'non-commercial': 'non-commercial', gated: 'gated', territory: 'territory', copyleft: 'copyleft', restricted: 'restricted', unreviewed: 'not-reviewed' };
export const LINK_REASON = {
  gated: ['Gated', 'Gated at the source.', 'The license must be accepted on the publisher\'s page before you download.'],
  'non-commercial': ['Non-commercial', 'Non-commercial license.', 'The license allows non-commercial use only.'],
  territory: ['Territory-limited', 'Territory-limited license.', 'The license covers only some countries, and a worldwide hub cannot limit who downloads.'],
  copyleft: ['Copyleft', 'Copyleft license: link only.', 'The license is GPL, LGPL or AGPL. Freeweights lists the model and links to the publisher, and never hosts a copy.'],
  restricted: ['Barred derivative', 'Barred derivative: link only.', 'The license of the original does not allow this kind of derivative to be copied. Freeweights links to the publisher and never hosts a copy.'],
  'not-reviewed': ['License not reviewed', 'License not reviewed.', 'Read it on the publisher\'s page.'],
};
export const ROWS = loadRows().map((r) => {
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
    linkOnly: LINK_CLASSES.has(r.license_class) || !r.manifest_url,
    sourceOnly: LINK_CLASSES.has(r.license_class) || !m,
    linkReason: r.link_reason || CLASS_REASON[r.license_class] || (r.manifest_url ? null : 'not-reviewed'), terms: r.license_terms || null,
    base: r.base_model, changed: r.what_changed, added: r.added_at, manifest: m || null,
    overlay: overlayOf(r.id),
    kind: r.kind || null, relation: r.relation || null, audit: r.audit || null, tier: r.tier || null, dl: (r.signals && r.signals.downloads_30d) || 0,
    unsigned: !!(m && !m.sample && !minisig[r.id]),
    wanted: r.status === 'wanted' || st.allFailed || !!(m && !m.sample && !minisig[r.id]), failedAt: st.allFailed ? st.last : null, lastCheck: st.last,
  };
}).sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')) || a.name.localeCompare(b.name));
// Publisher avatars, fetched once by scripts/fetch_org_logos.py into site/assets/orgs/ and served
// from this site (never hotlinked). An org without one shows the monogram alone.
export const LOGOS = (() => { try { const j = readJSON(path.join(SITE, 'assets/orgs/sources.json')); return Object.fromEntries(Object.entries(j).filter(([, v]) => v && v.file && exists(path.join(SITE, 'assets/orgs', v.file))).map(([k, v]) => [k, '/assets/orgs/' + v.file])); } catch (e) { return {}; } })();
export const logoOf = (org) => LOGOS[org] || '';
export const LOGO_LINE = 'Logos belong to their owners and identify the publisher. No partnership or endorsement is implied.';
export const TOOLS = (() => { try { return readJSON(path.join(ROOT, 'catalog', 'tools.json')).tools || []; } catch (e) { return []; } })();
export const LISTED = ROWS.filter((r) => !r.wanted);
export const WANTED = ROWS.filter((r) => r.wanted);
export const modelUrl = (r) => `/${r.section}/${r.id}/`;
export const sectionUrl = (id) => `/${id}/`;
