// Runs against a local `wrangler dev` that this file starts itself (offline check mode, temp D1).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
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
const gen = readFileSync(join(here, 'src', 'data.generated.ts'), 'utf8');
const MANIFESTS = JSON.parse(gen.match(/export const MANIFESTS[^=]*= (.*);\n$/s)[1]);
const [id, { json }] = Object.entries(MANIFESTS).find(([, v]) => JSON.parse(v.json).files.some((f) => f.lfs));
const man = JSON.parse(json);
const lfs = man.files.find((f) => f.lfs);
const plain = man.files.find((f) => !f.lfs);
const rpath = (f, rev = 'main') => `/${id}/resolve/${rev}/${f.path.split('/').map(encodeURIComponent).join('/')}`;
const get = (p, init = {}) => fetch(BASE + p, { redirect: 'manual', ...init });

before(async () => {
  const wr = (...a) => execFileSync('npx', ['wrangler', ...a, '--persist-to', persist], { cwd: here, stdio: 'pipe' });
  wr('d1', 'execute', 'freeweights', '--local', '--file=schema.sql');
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

test('hf_ token is rejected with 401 on every route; alt_ is reserved', async () => {
  for (const p of [rpath(lfs), '/api/models', `/api/models/${id}`, '/api/catalog']) {
    const r = await get(p, { headers: { authorization: 'Bearer hf_x' } });
    assert.equal(r.status, 401, p);
    const b = await r.json();
    assert.equal(b.error, 'hf_token_rejected');
    assert.ok(!JSON.stringify(b).includes('hf_x'));
  }
  assert.equal((await get('/api/models?token=hf_abc')).status, 401);
  const a = await get('/api/models', { headers: { authorization: 'Bearer alt_x' } });
  assert.equal(a.status, 401);
  assert.equal((await a.json()).error, 'alt_tokens_not_yet');
  assert.equal((await get('/api/models', { headers: { 'user-agent': 'hf_xet/1.0' } })).status, 200);
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
  const all = await get('/api/models?limit=1000');
  assert.equal(all.status, 200);
  assert.equal((await all.json()).length, cat.models.length);
  const linkOnly = cat.models.find((r) => !r.manifest_url);
  if (!linkOnly) return; // sample data has none
  const d = await get(`/api/models/${linkOnly.id}`);
  assert.equal(d.status, 200);
  const body = await d.json();
  assert.equal(body.sha, null);
  assert.deepEqual(body.siblings, []);
  assert.equal(body.upstream_url, linkOnly.upstream_url);
});
