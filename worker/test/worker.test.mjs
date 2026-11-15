// Runs against a local `wrangler dev` that this file starts itself (offline check mode, temp D1).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { countRule, isDailyCapError, pausedBody } from '../src/rules.ts';

const here = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.TEST_PORT || '8799';
const BASE = `http://127.0.0.1:${PORT}`;
const persist = mkdtempSync(join(tmpdir(), 'fw-d1-'));
let proc;

// Pick the model + LFS file from what was bundled, so the test follows the data.
// Manifests are read from R2 (B3); build-data lists their local files, and before() seeds a local R2
// with the chosen manifest, its signature and one detail page.
execFileSync('node', ['scripts/build-data.mjs'], { cwd: here, stdio: 'pipe' });
const FILES = JSON.parse(readFileSync(join(here, '.data', 'manifest-files.json'), 'utf8'));
const [id, mf] = Object.entries(FILES).find(([, v]) => JSON.parse(readFileSync(v.file, 'utf8')).files.some((f) => f.lfs));
const json = readFileSync(mf.file, 'utf8');
const man = JSON.parse(json);
const PAGE_KEY = `${man.section}/${id}/index.html`;
const PAGE_HTML = '<!doctype html><title>detail page from R2</title>';
const lfs = man.files.find((f) => f.lfs);
const plain = man.files.find((f) => !f.lfs);
const rpath = (f, rev = 'main') => `/${id}/resolve/${rev}/${f.path.split('/').map(encodeURIComponent).join('/')}`;
const get = (p, init = {}) => fetch(BASE + p, { redirect: 'manual', ...init });
// B9: a second hosted entry, taken down in D1 only (its manifest and page are still in R2, as right after
// `fw_admin.py takedown --apply` and before `sync_r2.py --delete`).
const [gid, gmf] = Object.entries(FILES).find(([k, v]) => k !== id && JSON.parse(readFileSync(v.file, 'utf8')).files.length);
const gman = JSON.parse(readFileSync(gmf.file, 'utf8'));
const GONE_PAGE = `${gman.section}/${gid}/index.html`;

before(async () => {
  const wr = (...a) => execFileSync('npx', ['wrangler', ...a, '--persist-to', persist], { cwd: here, stdio: 'pipe' });
  wr('d1', 'execute', 'freeweights', '--local', '--file=schema.sql');
  const pageFile = join(persist, 'page.html'); writeFileSync(pageFile, PAGE_HTML);
  const put = (key, file, type) => wr('r2', 'object', 'put', `freeweights/${key}`, '--local', '--file', file, '--content-type', type);
  put(`manifests/${id}.json`, mf.file, 'application/json');
  if (mf.sig) put(`manifests/${id}.json.minisig`, mf.sig, 'text/plain');
  put(PAGE_KEY, pageFile, 'text/html');
  put(`manifests/${gid}.json`, gmf.file, 'application/json');
  if (gmf.sig) put(`manifests/${gid}.json.minisig`, gmf.sig, 'text/plain');
  put(GONE_PAGE, pageFile, 'text/html');
  wr('d1', 'execute', 'freeweights', '--local', '--command',
    `INSERT INTO takedowns (kind, entry_id, reason_class, at) VALUES ('model', '${gid}', 'copyright', '2026-11-14T00:00:00Z')`);
  proc = spawn('npx', ['wrangler', 'dev', '--local', '--port', PORT, '--persist-to', persist, '--var', 'CHECK_MODE:offline', '--var', 'PASSTHROUGH:0'], { cwd: here, stdio: 'ignore' });
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(BASE + '/api/catalog')).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('wrangler dev did not start');
});
after(() => { proc?.kill('SIGTERM'); });

// HEAD answers metadata itself (200, no Location) so huggingface_hub never follows to the upstream
// host's Xet headers — regression from the client matrix retest ("Xet headers have not been correctly set").
test('HEAD resolve: 200 with size and hash headers, no redirect', async () => {
  const r = await get(rpath(lfs), { method: 'HEAD' });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('x-repo-commit'), man.upstream.commit);
  assert.equal(r.headers.get('etag'), `"${lfs.sha256}"`);
  assert.equal(r.headers.get('x-linked-etag'), `"${lfs.sha256}"`);
  assert.equal(r.headers.get('x-linked-size'), String(lfs.size));
  assert.equal(r.headers.get('content-length'), String(lfs.size));
  assert.equal(r.headers.get('x-freeweights-source'), 'source');
  assert.equal(r.headers.get('location'), null);
});

test('GET resolve by pinned commit works; unknown rev and file are 404', async () => {
  const ok = await get(rpath(lfs, man.upstream.commit));
  assert.equal(ok.status, 302);
  assert.equal((await get(rpath(lfs, 'deadbeef'))).status, 404);
  const miss = await get(`/${id}/resolve/main/nope.bin`);
  assert.equal(miss.status, 404);
  assert.equal((await miss.json()).error, 'file_not_found');
  assert.equal((await get('/nobody/none/resolve/main/x')).status, 404);
});

test('non-LFS file has ETag but no X-Linked headers', async () => {
  if (!plain) return;
  const r = await get(rpath(plain), { method: 'HEAD' });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('etag'), `"${plain.sha256}"`);
  assert.equal(r.headers.get('x-linked-size'), null);
});

test('hf_ token is rejected with 401 on every route; alt_ on a public read is ignored (served anonymous)', async () => {
  for (const p of [rpath(lfs), '/api/models', `/api/models/${id}`, '/api/catalog']) {
    const r = await get(p, { headers: { authorization: 'Bearer hf_x' } });
    assert.equal(r.status, 401, p);
    const b = await r.json();
    assert.equal(b.error, 'hf_token_rejected');
    assert.ok(!JSON.stringify(b).includes('hf_x'));
  }
  assert.equal((await get('/api/models?token=hf_abc')).status, 401);
  const a = await get('/api/models', { headers: { authorization: 'Bearer alt_x' } });
  assert.equal(a.status, 200);
  assert.equal((await get('/api/models', { headers: { 'user-agent': 'hf_xet/1.0' } })).status, 200);
});

test('search ranks official lab base models above quants and fine-tunes', async () => {
  const hit = await (await get('/api/models?search=deepseek')).json();
  if (!hit.length) return; // catalog without DeepSeek rows (samples only)
  const rel = (m) => (m.relation && m.relation.type) || 'base';
  const firstNonBase = hit.findIndex((m) => rel(m) !== 'base');
  const lastBase = hit.map(rel).lastIndexOf('base');
  assert.ok(firstNonBase === -1 || lastBase < firstNonBase, hit.map((m) => m.id).join(', '));
  assert.ok(hit[0].id.startsWith('deepseek-ai/'), hit[0].id);
});

test('library, apps, language and params filters narrow /api/models', async () => {
  const all = await (await get('/api/models?limit=1000')).json();
  const gguf = await (await get('/api/models?library=GGUF&limit=1000')).json();
  // a row matches by format or by the library name Hugging Face lists for it (facets overlay), so every gguf-format row is in
  const fmt = all.filter((m) => m.tags.includes('gguf'));
  assert.ok(gguf.length > 0 && fmt.every((m) => gguf.some((g) => g.id === m.id)));
  assert.ok(gguf.length <= all.length || all.length === 1000);
  const both = await (await get('/api/models?library=gguf,mlx&limit=1000')).json();
  assert.ok(both.length >= gguf.length);
  const ollama = await (await get('/api/models?apps=Ollama&limit=1000')).json();
  assert.ok(ollama.every((m) => m.tags.includes('gguf')), 'Ollama rows are GGUF rows');
  // apps and language are "every value": adding a value can only remove rows
  const one = await (await get('/api/models?apps=Ollama&max_size=2000000000&limit=1000')).json();
  const two = await (await get('/api/models?apps=Ollama,vLLM&max_size=2000000000&limit=1000')).json();
  const oneIds = new Set(one.map((m) => m.id));
  assert.ok(one.length < 1000 && two.length <= one.length && two.every((m) => oneIds.has(m.id)), 'apps=Ollama,vLLM is a subset of apps=Ollama');
  const big = await (await get('/api/models?params_min=70000000000&limit=1000')).json();
  const small = await (await get('/api/models?params_max=1000000000&limit=1000')).json();
  const bigIds = new Set(big.map((m) => m.id));
  assert.ok(small.every((m) => !bigIds.has(m.id)), 'params_min and params_max ranges are disjoint');
  const cloud = await (await get('/api/models?cloud=1&limit=1000')).json();
  assert.ok(cloud.length > 0 && cloud.every((m) => m.allternit), 'cloud=1 keeps only rows with an allternit field');
  assert.equal((await (await get('/api/models?language=zz&limit=1000')).json()).length, 0);
});

test('sort=rank with no search is best first (rank, then 30-day downloads); no sort keeps the added order', async () => {
  const cat = await (await get('/api/catalog')).json();
  const rows = new Map(cat.models.map((r) => [r.id, r]));
  const ranked = await (await get('/api/models?sort=rank&limit=1000')).json();
  const dl = (id) => Number((rows.get(id).signals || {}).downloads_30d) || 0;
  const tierRel = (id) => { const r = rows.get(id); return ['T0', 'T1', 'T2'].includes(r.tier) ? `${r.tier}|${(r.relation || {}).type || 'base'}` : null; };
  // rows of one tier and relation share a rank: inside such a run, downloads never go up
  for (let i = 1; i < ranked.length; i++) {
    const c = tierRel(ranked[i].id);
    if (c && c === tierRel(ranked[i - 1].id)) assert.ok(dl(ranked[i - 1].id) >= dl(ranked[i].id), `${ranked[i - 1].id} before ${ranked[i].id}`);
  }
  // the best rank there is: a T0 base model; the most downloaded one comes first
  const t0 = cat.models.filter((r) => r.tier === 'T0' && ((r.relation || {}).type || 'base') === 'base');
  if (t0.length) assert.equal(dl(ranked[0].id), Math.max(...t0.map((r) => dl(r.id))), ranked[0].id);
  const plain = await (await get('/api/models?limit=50')).json();
  const added = await (await get('/api/models?sort=added&limit=50')).json();
  assert.deepEqual(plain.map((m) => m.id), added.map((m) => m.id));
  // every row says where its publisher's logo is, or null
  for (const m of ranked.slice(0, 200)) assert.ok(m.publisher_logo === null || /^https:\/\/freeweights\.allternit\.com\/assets\/orgs\/.+\.png$/.test(m.publisher_logo), m.publisher_logo);
  assert.ok(ranked.some((m) => m.publisher_logo), 'no row has a publisher logo');
});

test('CORS preflight: OPTIONS answers 204 with the allowed methods and headers; hf_ stays rejected on the real request', async () => {
  for (const path of ['/api/catalog', `/manifests/${id}.json`, rpath(lfs)]) {
    const r = await get(path, { method: 'OPTIONS', headers: { origin: 'https://example.com', 'access-control-request-method': 'GET', 'access-control-request-headers': 'authorization, if-none-match' } });
    assert.equal(r.status, 204, path);
    assert.equal(r.headers.get('access-control-allow-origin'), '*');
    assert.equal(r.headers.get('access-control-allow-methods'), 'GET, HEAD, OPTIONS');
    assert.equal(r.headers.get('access-control-allow-headers'), 'If-None-Match, Authorization, Range, Content-Type');
    assert.equal(r.headers.get('access-control-max-age'), '86400');
  }
  assert.equal((await get('/api/catalog', { headers: { authorization: 'Bearer hf_abc' } })).status, 401);
});

test('search and filters', async () => {
  const all = await (await get('/api/models')).json();
  assert.ok(all.length >= 2);
  const name = id.split('/')[1].toLowerCase();
  const hit = await (await get(`/api/models?search=${encodeURIComponent(name)}`)).json();
  assert.ok(hit.some((m) => m.id === id));
  assert.ok(hit.length < all.length);
  assert.deepEqual((await (await get('/api/models?search=zzzz-no-such')).json()), []);
  const one = await get('/api/models?limit=1');
  assert.equal((await one.json()).length, 1);
  assert.match(one.headers.get('link'), /rel="next"/);
  const sec = await (await get(`/api/models?section=${man.section}`)).json();
  assert.ok(sec.every((m) => m.section === man.section));
  assert.deepEqual(await (await get('/api/models?max_size=1')).json(), []);
  // license filter: rows carry SPDX case (Apache-2.0); either case matches the same rows
  const spdx = await (await get('/api/models?license=Apache-2.0&limit=1000')).json();
  const lower = await (await get('/api/models?license=apache-2.0&limit=1000')).json();
  assert.ok(spdx.length > 0);
  assert.ok(spdx.every((m) => m.license === 'Apache-2.0'));
  assert.deepEqual(lower.map((m) => m.id), spdx.map((m) => m.id));
});

test('commits: Hugging Face shaped list from the pinned history', async () => {
  const r = await get(`/api/models/${id}/commits/main`);
  assert.equal(r.status, 200);
  const list = await r.json();
  assert.equal(list[0].id, man.upstream.commit);
  assert.equal(r.headers.get('x-repo-commit'), man.upstream.commit);
  for (const k of ['id', 'authors', 'date', 'title', 'message', 'formatted_title', 'formatted_message']) assert.ok(k in list[0], k);
  assert.ok(Array.isArray(list[0].authors));
  assert.equal((await get(`/api/models/${id}/commits/${man.upstream.commit}`)).status, 200);
  assert.equal((await get(`/api/models/${id}/commits/deadbeef`)).status, 404);
  assert.equal((await get('/api/models/nobody/nothing/commits/main')).status, 404);
});

test('detail, tree, catalog, manifest passthrough', async () => {
  const d = await (await get(`/api/models/${id}`)).json();
  assert.equal(d.id, id);
  assert.equal(d.sha, man.upstream.commit);
  assert.ok(d.sources.length >= 1 && d.siblings.length === man.files.length);
  const t = await (await get(`/api/models/${id}/tree/main`)).json();
  assert.equal(t.length, man.files.length);
  // Regression B1 (client matrix): huggingface_hub crashed with KeyError 'pointerSize' on full-repo downloads.
  const lfsEntry = t.find((e) => e.path === lfs.path);
  assert.equal(lfsEntry.lfs.pointerSize, 125 + String(lfs.size).length);
  assert.equal((await get(`/api/models/${id}/tree/bad`)).status, 404);
  const c = await (await get('/api/catalog')).json();
  assert.ok(c.sections && c.models.length >= 2);
  const m = await get(`/manifests/${id}.json`);
  assert.equal(await m.text(), json); // exact bytes
  assert.equal((await get('/manifests/x/y.json')).status, 404);
});

test('B3/B6: manifest signature and detail pages come from R2; etag answers 304; list pages are not R2 pages', async () => {
  const m = await get(`/manifests/${id}.json`);
  const etag = m.headers.get('etag');
  assert.ok(etag);
  assert.equal((await get(`/manifests/${id}.json`, { headers: { 'if-none-match': etag } })).status, 304);
  if (mf.sig) {
    const sig = await get(`/manifests/${id}.json.minisig`);
    assert.equal(sig.status, 200);
    assert.equal(await sig.text(), readFileSync(mf.sig, 'utf8'));
  }
  const page = await get(`/${PAGE_KEY.replace(/index\.html$/, '')}`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.equal(await page.text(), PAGE_HTML);
  const bare = await get(`/${PAGE_KEY.replace(/\/index\.html$/, '')}`);
  assert.equal(bare.status, 301);
  assert.equal(new URL(bare.headers.get('location'), BASE).pathname, `/${PAGE_KEY.replace(/index\.html$/, '')}`);
  assert.equal((await get(`/${man.section}/page/2/`)).status, 404); // passthrough is off in tests: Pages would answer
  assert.equal((await get(`/${man.section}/nobody/none/`)).status, 404);
});

// Plan A8: one count per entry download (not per file), stored in download_totals and read by
// search (both the downloads sort and the page-only path) and detail.
test('download starts count once per entry download on GET, not on HEAD or other files', async () => {
  const counts = countRule(man.files);
  const anchor = man.files.find((f) => counts(f.path));
  const other = man.files.find((f) => !counts(f.path));
  const starts = async () => {
    const byDl = (await (await get('/api/models?sort=downloads&limit=1000')).json()).find((m) => m.id === id).downloads;
    const byName = (await (await get('/api/models?sort=name&limit=1000')).json()).find((m) => m.id === id).downloads;
    const detail = (await (await get(`/api/models/${id}`)).json()).downloads;
    assert.equal(byName, byDl);
    assert.equal(detail, byDl);
    return byDl;
  };
  const before = await starts();
  await get(rpath(anchor), { method: 'HEAD' });
  await get(rpath(anchor));
  if (other) await get(rpath(other));
  await new Promise((r) => setTimeout(r, 500));
  assert.equal(await starts(), before + 1);
  const top = (await (await get('/api/models?sort=downloads')).json())[0];
  assert.equal(top.id, id);
});

test('count rule: GGUF quants each count, later shards do not; else config.json, model_index.json, largest', () => {
  const g = countRule([{ path: 'config.json', size: 1 }, { path: 'a-Q4.gguf', size: 9 },
    { path: 'Q8/b-00001-of-00002.gguf', size: 9 }, { path: 'Q8/b-00002-of-00002.gguf', size: 9 }]);
  assert.deepEqual(['config.json', 'a-Q4.gguf', 'Q8/b-00001-of-00002.gguf', 'Q8/b-00002-of-00002.gguf'].map(g),
    [false, true, true, false]);
  const c = countRule([{ path: 'sub/config.json', size: 1 }, { path: 'config.json', size: 1 }, { path: 'model.safetensors', size: 9 }]);
  assert.deepEqual(['config.json', 'sub/config.json', 'model.safetensors'].map(c), [true, false, false]);
  const d = countRule([{ path: 'model_index.json', size: 1 }, { path: 'unet/config.json', size: 1 }]);
  assert.equal(d('model_index.json'), true);
  const l = countRule([{ path: 'b.parquet', size: 5 }, { path: 'a.parquet', size: 5 }, { path: 'README.md', size: 1 }]);
  assert.deepEqual(['a.parquet', 'b.parquet', 'README.md'].map(l), [true, false, false]);
});

// Eoj's decision: at the free-plan daily cap the API pauses until 00:00 UTC with a public note.
test('daily cap: D1 limit errors pause until the next 00:00 UTC; other errors do not', () => {
  assert.ok(isDailyCapError(new Error('D1_ERROR: Your account has reached its daily D1 Free tier row read limit.')));
  assert.ok(isDailyCapError(new Error('D1_ERROR', { cause: new Error('reached its daily D1 Free tier row write limit') })));
  assert.ok(!isDailyCapError(new Error('D1_ERROR: too many SQL variables')));
  assert.ok(!isDailyCapError(new Error('no such table: download_totals')));
  const now = Date.UTC(2026, 10, 14, 23, 59, 30);
  const { body, retryAfter } = pausedBody(now);
  assert.equal(body.error, 'api_paused_daily_cap');
  assert.equal(body.resumes_at, '2026-11-15T00:00:00.000Z');
  assert.equal(retryAfter, 30);
  assert.match(body.message, /00:00 UTC/);
});

// Regression (2026-11-14): link-only rows (non-commercial, territory-limited, gated) have no manifest,
// and the listing dereferenced one anyway, so any page holding such a row returned 500.
test('link-only rows list and show without a manifest', async () => {
  const cat = await (await get('/api/catalog')).json();
  // The API caps a page at 1000 rows; page through so every row (link-only included) is served.
  let seen = 0;
  for (let cursor = 0; ; cursor += 1000) {
    const page = await get(`/api/models?limit=1000&cursor=${cursor}`);
    assert.equal(page.status, 200);
    const rows = await page.json();
    seen += rows.length;
    if (rows.length < 1000) break;
  }
  assert.equal(seen, cat.models.filter((r) => r.id !== gid).length); // the taken-down entry (B9) is not listed
  const linkOnly = cat.models.find((r) => !r.manifest_url);
  if (!linkOnly) return; // sample data has none
  const d = await get(`/api/models/${linkOnly.id}`);
  assert.equal(d.status, 200);
  const body = await d.json();
  assert.equal(body.sha, null);
  assert.deepEqual(body.siblings, []);
  assert.equal(body.upstream_url, linkOnly.upstream_url);
});

// B9: a takedown in D1 answers 451 at once on every path of the entry, before R2 is read, with no redeploy.
test('taken-down entry: 451 on API detail, tree, resolve, manifest, signature and detail page; gone from search', async () => {
  const f = gman.files[0];
  const paths = [`/api/models/${gid}`, `/api/models/${gid}/revision/main`, `/api/models/${gid}/tree/main`,
    `/${gid}/resolve/main/${f.path.split('/').map(encodeURIComponent).join('/')}`, `/manifests/${gid}.json`, `/manifests/${gid}.json.minisig`];
  for (const p of paths) {
    for (const method of ['GET', 'HEAD']) {
      const r = await get(p, { method });
      assert.equal(r.status, 451, `${method} ${p}`);
      assert.equal(r.headers.get('cache-control'), 'no-store');
      if (method === 'GET') assert.equal((await r.json()).error, 'removed_after_takedown');
    }
  }
  const page = await get(`/${GONE_PAGE.replace(/index\.html$/, '')}`);
  assert.equal(page.status, 451);
  assert.match(await page.text(), /Removed after a takedown/);
  assert.equal((await get(`/${GONE_PAGE.replace(/\/index\.html$/, '')}`)).status, 451); // no 301 first
  const all = await (await get(`/api/models?search=${encodeURIComponent(gid.split('/')[1])}&limit=1000`)).json();
  assert.ok(!all.some((m) => m.id === gid));
  // the entry that was not taken down is still served
  assert.equal((await get(`/manifests/${id}.json`)).status, 200);
  assert.equal((await get(`/api/models/${id}`)).status, 200);
});
