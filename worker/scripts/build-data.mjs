// Bundles the static catalog into src/data.generated.ts, plus a small map of hosted ids to their pinned
// commit. Manifests and signatures are NOT bundled (B3): the Worker reads them from R2 by key
// (manifests/<org>/<repo>.json[.minisig], uploaded by scripts/sync_r2.py), so the bundle stays the same
// size as the catalog grows. .data/manifest-files.json lists each manifest's local file for the tests,
// which seed a local R2. Local dev: ../manifests + ../catalog/catalog.json if present, else ../spec/samples.
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifests = {}; // id -> {json, sig, file}
let origin = 'samples';

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const mdir = join(root, 'manifests');
if (existsSync(mdir) && walk(mdir).some((p) => p.endsWith('.json'))) {
  origin = 'manifests';
  for (const p of walk(mdir).filter((p) => p.endsWith('.json'))) {
    const json = readFileSync(p, 'utf8');
    const m = JSON.parse(json);
    manifests[m.id] = { json, file: p, sig: existsSync(p + '.minisig') ? p + '.minisig' : null };
  }
} else {
  const sdir = join(root, 'spec', 'samples');
  for (const n of readdirSync(sdir).filter((n) => n.endsWith('.manifest.json'))) {
    const json = readFileSync(join(sdir, n), 'utf8');
    const m = JSON.parse(json);
    const sigp = join(sdir, n.replace('.manifest.json', '.manifest.json.minisig'));
    manifests[m.id] = { json, file: join(sdir, n), sig: existsSync(sigp) ? sigp : null };
  }
}

let catalog;
const cpath = join(root, 'catalog', 'catalog.json');
if (existsSync(cpath)) {
  catalog = JSON.parse(readFileSync(cpath, 'utf8'));
} else {
  const sdir = join(root, 'spec', 'samples');
  const schema = JSON.parse(readFileSync(join(root, 'spec', 'catalog-schema.json'), 'utf8'));
  const sampleRows = Object.fromEntries(
    readdirSync(sdir).filter((n) => n.endsWith('.catalog-row.json')).map((n) => JSON.parse(readFileSync(join(sdir, n), 'utf8'))).map((r) => [r.id, r]));
  // No catalog.json yet: use a sample row when one exists, else derive a row from the manifest.
  const models = Object.values(manifests).map(({ json }) => {
    const m = JSON.parse(json);
    if (sampleRows[m.id]) return sampleRows[m.id];
    const fam = m.section.split('.').pop();
    const fmts = [...new Set(m.files.map((f) => (f.path.endsWith('.gguf') ? 'gguf' : f.path.endsWith('.safetensors') ? 'safetensors' : null)).filter(Boolean))];
    return {
      id: m.id, display_name: m.id.split('/')[1], section: m.section, family: fam, tasks: [fam],
      license_id: m.license.id, redistribution: m.license.redistribution, formats: fmts.length ? fmts : ['safetensors'],
      total_size: m.files.reduce((a, f) => a + f.size, 0), params: null, base_model: null, abliterated: false, what_changed: null,
      badges: [...new Set(m.sources.map((s) => s.type))],
      manifest_url: `https://freeweights.allternit.com/manifests/${m.id}.json`, upstream_url: `https://huggingface.co/${m.id}`,
      added_at: m.created_at,
    };
  });
  const sections = (schema['x-sections'] || []).map((s) => ({ ...s, count: models.filter((m) => m.section === s.id).length }));
  catalog = { sections, models };
}
// Publisher logos, the same lookup the site uses (site/assets/orgs/sources.json, only files that exist).
const logos = {};
const odir = join(root, 'site', 'assets', 'orgs');
if (existsSync(join(odir, 'sources.json'))) {
  for (const [org, v] of Object.entries(JSON.parse(readFileSync(join(odir, 'sources.json'), 'utf8')))) {
    if (v && v.file && existsSync(join(odir, v.file))) logos[org] = v.file;
  }
}
// Allternit Cloud map (catalog/overlay/cloud.json, written by scripts/cloud_map.py): id -> cloud entry. A few entries.
const cloud = {};
const cloudPath = join(root, 'catalog', 'overlay', 'cloud.json');
if (existsSync(cloudPath)) for (const [id, v] of Object.entries(JSON.parse(readFileSync(cloudPath, 'utf8')))) if (!id.startsWith('_')) cloud[id] = v;
const SITE_ORIGIN = 'https://freeweights.allternit.com';
catalog = { ...catalog, models: catalog.models.map((r) => {
  const f = logos[r.id.split('/')[0]];
  return f ? { ...r, publisher_logo: `${SITE_ORIGIN}/assets/orgs/${encodeURIComponent(f)}` } : r;
}) };
const catalogJson = JSON.stringify(catalog);
const etag = '"' + createHash('sha256').update(catalogJson).digest('hex').slice(0, 32) + '"';

// Filter facets for /api/models (library, language, apps, parameters): id -> [libraries, languages, apps, params_bin, params_est],
// from catalog/overlay/facets.json when it exists. Empty arrays and '' stay as is; about 40 bytes per entry before gzip.
const facets = {};
const fpath = join(root, 'catalog', 'overlay', 'facets.json');
if (existsSync(fpath)) {
  for (const [id, v] of Object.entries(JSON.parse(readFileSync(fpath, 'utf8')))) {
    if (id.startsWith('_')) continue;
    facets[id] = [v.libraries || [], v.languages || [], v.apps || [], v.params_bin || '', v.params_est || 0];
  }
}

// id -> pinned upstream commit, for every manifest (hosted entry). About 100 bytes per entry.
const hosted = Object.fromEntries(Object.entries(manifests).map(([id, { json }]) => [id, JSON.parse(json).upstream.commit]));
// Pin history (catalog/overlay/history.json, scripts/history_index.py): only models whose pin changed are
// bundled, as [commit, date, files, size] newest first. The commits route answers every other model from its manifest.
const hpath = join(root, 'catalog', 'overlay', 'history.json');
const history = {};
if (existsSync(hpath)) {
  for (const [id, vs] of Object.entries(JSON.parse(readFileSync(hpath, 'utf8')))) {
    const pins = vs.filter((v) => !v.same_pin);
    if (pins.length > 1) history[id] = pins.map((v) => [v.commit, v.date, v.files, v.size]);
  }
}
// Entitlement claim public keys (spec/accounts-v1.md section 3): spec/keys/entitlement-<n>.pub -> kid
// "entitlement-<n>" -> base64 SPKI DER. A file with no PEM block (the placeholder) adds no key, so no claim verifies.
const entitlementKeys = {};
const kdir = join(root, 'spec', 'keys');
for (const n of existsSync(kdir) ? readdirSync(kdir).filter((n) => /^entitlement-v\d+\.pub$/.test(n)) : []) {
  const pem = readFileSync(join(kdir, n), 'utf8').split('\n').filter((l) => !l.startsWith('#')).join('\n');
  const m = pem.match(/-----BEGIN PUBLIC KEY-----([A-Za-z0-9+/=\s]+)-----END PUBLIC KEY-----/);
  if (m) entitlementKeys[n.replace(/\.pub$/, '')] = m[1].replace(/\s+/g, '');
}
writeFileSync(
  join(root, 'worker', 'src', 'data.generated.ts'),
  '// GENERATED by scripts/build-data.mjs. Do not edit.\n' +
    `export const DATA_ORIGIN = ${JSON.stringify(origin)};\n` +
    `export const CATALOG_JSON = ${JSON.stringify(catalogJson)};\n` +
    `export const CATALOG_ETAG = ${JSON.stringify(etag)};\n` +
    `export const LOGOS: Record<string, string> = ${JSON.stringify(logos)};\n` +
    `export const CLOUD: Record<string, { model: string; provider: string | null; context_length: number | null; via_parent?: boolean }> = ${JSON.stringify(cloud)};\n` +
    `export const HOSTED: Record<string, string> = ${JSON.stringify(hosted)};\n` +
    `export const HISTORY: Record<string, [string, string, number, number][]> = ${JSON.stringify(history)};\n` +
    `export const FACETS: Record<string, [string[], string[], string[], string, number]> = ${JSON.stringify(facets)};\n` +
    `export const ENTITLEMENT_KEYS: Record<string, string> = ${JSON.stringify(entitlementKeys)};\n`,
);
mkdirSync(join(root, 'worker', '.data'), { recursive: true });
writeFileSync(join(root, 'worker', '.data', 'manifest-files.json'),
  JSON.stringify(Object.fromEntries(Object.entries(manifests).map(([id, { file, sig }]) => [id, { file, sig }])), null, 1));
console.log(`build-data: ${Object.keys(hosted).length} hosted ids (manifests read from R2), ${catalog.models.length} catalog rows, ${Object.keys(logos).length} logos, ${Object.keys(entitlementKeys).length} entitlement keys (${origin})`);
