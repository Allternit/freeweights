// Byte reservation math (worker/src/storage/quota.ts, plan U3). The real statements run against SQLite with
// the real accounts migrations (0001 + 0003), through a small stand-in for the D1 binding (prepare / bind /
// first / all / batch in one transaction). No server, no network.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { reserve, release, releaseRepoStatements, readUsage, readLimits, limitsState, refusal, refuseSet } from '../src/storage/quota.ts';

const mig = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations-accounts');
const MiB = 1024 * 1024;

// ---- D1 stand-in (the vendor edge) -------------------------------------------------------------------
function d1(sqlite) {
  const exec = (sql, args, mode) => {
    const st = sqlite.prepare(sql);
    if (/^\s*SELECT/i.test(sql)) { const rows = st.all(...args); return mode === 'first' ? (rows[0] ?? null) : { results: rows, meta: { changes: 0 } }; }
    const r = st.run(...args);
    return { results: [], meta: { changes: Number(r.changes) } };
  };
  const stmt = (sql, args = []) => ({
    sql, args,
    bind: (...a) => stmt(sql, a),
    first: async () => exec(sql, args, 'first'),
    all: async () => exec(sql, args, 'all'),
    run: async () => exec(sql, args, 'run'),
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => {
      sqlite.exec('BEGIN');
      try { const out = stmts.map((s) => exec(s.sql, s.args, 'all')); sqlite.exec('COMMIT'); return out; }
      catch (e) { sqlite.exec('ROLLBACK'); throw e; }
    },
  };
}

let sql, db;
const setLimits = (o) => { for (const [k, v] of Object.entries(o)) sql.prepare('INSERT OR REPLACE INTO limits (key, value) VALUES (?, ?)').run(k, v); };
const ALL = { uploads_open: 1, site_cap_bytes: 100 * MiB, user_cap_bytes: 50 * MiB, file_max_bytes: 40 * MiB, repos_per_user: 5, repo_creates_per_day: 3, commits_per_hour: 20, files_per_commit: 100 };
let n = 0;
const res = (user, size, extra = {}) => ({ id: `up_${++n}`, repoId: `rp_${user}`, userId: user, oid: 'a'.repeat(64), size, transfer: 'basic', key: `k${n}`, parts: null, expiresAt: '2099-01-01T00:00:00Z', ...extra });
const usage = async (u) => readUsage(db, u);
const row = (id) => { const r = sql.prepare('SELECT status, bucket, size FROM uploads WHERE id = ?').get(id); return r && { ...r }; };

beforeEach(() => {
  sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys = ON');
  sql.exec(readFileSync(join(mig, '0001_accounts.sql'), 'utf8'));
  sql.exec(readFileSync(join(mig, '0003_launch_limits.sql'), 'utf8'));
  for (const u of ['alice', 'bob']) {
    sql.prepare('INSERT INTO users (id, handle) VALUES (?, ?)').run(u, u);
    sql.prepare("INSERT INTO repos (id, kind, namespace, name, owner_user_id) VALUES (?, 'model', ?, 'm', ?)").run(`rp_${u}`, u, u);
  }
  db = d1(sql);
});

test('a missing limit key refuses every reservation (fails closed) and moves no counter', async () => {
  // The migration seeds only uploads_open = 0.
  const l = await readLimits(db);
  assert.equal(l.open, false);
  assert.ok(l.missing.includes('site_cap_bytes'));
  setLimits({ file_max_bytes: 40 * MiB, user_cap_bytes: 50 * MiB }); // site cap still missing
  const [r] = await reserve(db, [res('alice', 1)]);
  assert.deepEqual(r, { id: r.id, ok: false, reason: 'site_full' });
  assert.deepEqual(await usage('alice'), { userBytes: 0, siteBytes: 0 });
  assert.equal(row(r.id), undefined);
});

test('within the caps: the upload row is pending and both counters grow by its size', async () => {
  setLimits(ALL);
  const [r] = await reserve(db, [res('alice', 10 * MiB)]);
  assert.equal(r.ok, true);
  assert.deepEqual(row(r.id), { status: 'pending', bucket: 'quarantine', size: 10 * MiB });
  assert.deepEqual(await usage('alice'), { userBytes: 10 * MiB, siteBytes: 10 * MiB });
});

test('exactly at each cap fits; one byte over does not', async () => {
  setLimits(ALL);
  const [a] = await reserve(db, [res('alice', 40 * MiB)]); // file max exactly
  assert.equal(a.ok, true);
  const [b] = await reserve(db, [res('alice', 40 * MiB + 1)]);
  assert.equal(b.reason, 'file_too_large');
  const [c] = await reserve(db, [res('alice', 10 * MiB)]); // user total = 50 MiB exactly
  assert.equal(c.ok, true);
  const [d] = await reserve(db, [res('alice', 1)]);
  assert.equal(d.reason, 'storage_full');
  assert.deepEqual(await usage('alice'), { userBytes: 50 * MiB, siteBytes: 50 * MiB });
});

test('objects in one batch see the bytes of the ones before them', async () => {
  setLimits(ALL);
  const out = await reserve(db, [res('alice', 20 * MiB), res('alice', 20 * MiB), res('alice', 20 * MiB), res('alice', 10 * MiB)]);
  assert.deepEqual(out.map((o) => o.ok || o.reason), [true, true, 'storage_full', true]);
  assert.deepEqual(await usage('alice'), { userBytes: 50 * MiB, siteBytes: 50 * MiB });
});

test('the site cap counts every account; the account cap counts quarantine, held and live bytes', async () => {
  setLimits({ ...ALL, site_cap_bytes: 60 * MiB });
  assert.equal((await reserve(db, [res('alice', 40 * MiB)]))[0].ok, true);
  const [b] = await reserve(db, [res('bob', 30 * MiB)]); // bob is under his own cap, the site is not
  assert.equal(b.reason, 'site_full');
  // Live (public) and held (still quarantine) bytes from earlier commits count against bob's cap.
  sql.prepare('UPDATE storage_usage SET public_bytes = ?, quarantine_bytes = ? WHERE owner_user_id = ?').run(30 * MiB, 15 * MiB, 'bob');
  setLimits({ site_cap_bytes: 1000 * MiB });
  const [c] = await reserve(db, [res('bob', 6 * MiB)]);
  assert.equal(c.reason, 'storage_full');
  assert.equal((await reserve(db, [res('bob', 5 * MiB)]))[0].ok, true);
});

test('release gives the bytes back once, however often it runs', async () => {
  setLimits(ALL);
  const [r] = await reserve(db, [res('alice', 12 * MiB)]);
  await reserve(db, [res('alice', 3 * MiB)]);
  await release(db, r.id);
  assert.deepEqual(await usage('alice'), { userBytes: 3 * MiB, siteBytes: 3 * MiB });
  assert.equal(row(r.id).status, 'aborted');
  await release(db, r.id);
  await release(db, r.id, 'expired');
  assert.deepEqual(await usage('alice'), { userBytes: 3 * MiB, siteBytes: 3 * MiB });
  assert.equal(row(r.id).status, 'aborted');
});

test('release of a promoted (public) upload takes it off public_bytes; counters never go below zero', async () => {
  setLimits(ALL);
  const [r] = await reserve(db, [res('alice', 8 * MiB)]);
  // Promotion (plan step 9) moves the bytes from quarantine to public and the row to bucket 'public'.
  sql.prepare("UPDATE uploads SET bucket = 'public', status = 'committed' WHERE id = ?").run(r.id);
  sql.prepare("UPDATE storage_usage SET quarantine_bytes = 0, public_bytes = 8 * 1048576 WHERE owner_user_id = 'alice'").run();
  sql.prepare('UPDATE site_usage SET bytes = 1 WHERE id = 1').run(); // out of step: reconcile fixes it later
  await release(db, r.id, 'expired');
  const u = sql.prepare("SELECT public_bytes, quarantine_bytes FROM storage_usage WHERE owner_user_id = 'alice'").get();
  assert.deepEqual({ ...u }, { public_bytes: 0, quarantine_bytes: 0 });
  assert.equal((await usage('alice')).siteBytes, 0);
});

test('repo release gives back every byte the repo holds, once', async () => {
  setLimits(ALL);
  const [a, b] = await reserve(db, [res('alice', 4 * MiB), res('alice', 6 * MiB)]);
  await reserve(db, [res('bob', 5 * MiB)]);
  sql.prepare("UPDATE uploads SET bucket = 'public', status = 'committed' WHERE id = ?").run(b.id);
  sql.prepare("UPDATE storage_usage SET quarantine_bytes = 4 * 1048576, public_bytes = 6 * 1048576 WHERE owner_user_id = 'alice'").run();
  await db.batch(releaseRepoStatements(db, 'rp_alice'));
  await db.batch(releaseRepoStatements(db, 'rp_alice'));
  assert.deepEqual(await usage('alice'), { userBytes: 0, siteBytes: 5 * MiB });
  assert.deepEqual(await usage('bob'), { userBytes: 5 * MiB, siteBytes: 5 * MiB });
  assert.equal(row(a.id).status, 'aborted');
});

test('pure helpers: limitsState, refusal order, refuseSet', () => {
  const s = limitsState([{ key: 'uploads_open', value: 1 }, { key: 'nonsense', value: 9 }]);
  assert.equal(s.open, false);
  assert.equal(s.missing.length, 7);
  assert.equal(limitsState(Object.entries(ALL).map(([key, value]) => ({ key, value }))).open, true);
  assert.equal(limitsState(Object.entries({ ...ALL, uploads_open: 0 }).map(([key, value]) => ({ key, value }))).open, false);
  const v = { file_max_bytes: 10, user_cap_bytes: 20, site_cap_bytes: 30 };
  assert.equal(refusal(11, v, 0, 0), 'file_too_large');
  assert.equal(refusal(10, v, 11, 0), 'storage_full');
  assert.equal(refusal(10, v, 10, 21), 'site_full');
  assert.equal(refusal(10, v, 10, 20), null);
  assert.deepEqual(refuseSet([5, 11, 3], v, 0, 0), { tooLarge: [1], total: null });
  assert.deepEqual(refuseSet([5, 6], v, 10, 0), { tooLarge: [], total: 'storage_full' });
  assert.deepEqual(refuseSet([5, 6], v, 0, 20), { tooLarge: [], total: 'site_full' });
});
