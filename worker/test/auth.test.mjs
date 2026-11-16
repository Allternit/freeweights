// Worker auth (plan step 0.6, spec/accounts-v1.md sections 2-3, 10). Runs two local `wrangler dev` Workers that
// this file starts itself, against a local stand-in for Clerk's JWKS and cloud-api's entitlement endpoint:
//   A: accounts on (ACC bound, Clerk vars, entitlement public key given as a var);
//   B: the same, but no entitlement public key (the placeholder spec/keys/entitlement-v1.pub only).
// Keys are generated here: RSA for Clerk session tokens, Ed25519 for entitlement claims. Nothing leaves the Mac.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT_A = process.env.TEST_PORT_AUTH_A || '8797';
const PORT_B = process.env.TEST_PORT_AUTH_B || '8796';
const ISS = 'https://clerk.test.allternit.com';
const AZP = 'https://freeweights.allternit.com';
const KID = 'test-kid-1';

// ---- keys -------------------------------------------------------------------------------------
const clerk = generateKeyPairSync('rsa', { modulusLength: 2048 });
const rogueRsa = generateKeyPairSync('rsa', { modulusLength: 2048 });
const ent = generateKeyPairSync('ed25519');
const rogueEd = generateKeyPairSync('ed25519');
const ENT_SPKI = ent.publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

const b64u = (b) => Buffer.from(b).toString('base64url');
const now = () => Math.floor(Date.now() / 1000);
function clerkJwt(claims = {}, { key = clerk.privateKey, header = {} } = {}) {
  const h = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: KID, ...header }));
  const p = b64u(JSON.stringify({ iss: ISS, sub: 'user_Alice', azp: AZP, iat: now(), exp: now() + 60, ...claims }));
  return `${h}.${p}.${b64u(sign('sha256', Buffer.from(`${h}.${p}`), key))}`;
}
function claimJws(payload, key = ent.privateKey) {
  const h = b64u(JSON.stringify({ alg: 'EdDSA', typ: 'JWT', kid: 'entitlement-v1' }));
  const p = b64u(JSON.stringify(payload));
  return `${h}.${p}.${b64u(sign(null, Buffer.from(`${h}.${p}`), key))}`;
}
const claimFor = (sub, cred, scopes, extra = {}) => ({
  iss: 'https://api.allternit.com', aud: 'freeweights', sub, plan: 'pro', cred, scopes,
  orgs: [{ clerk_org_id: 'org_1', slug: 'acme', role: 'member', plan: 'team', perks: {}, addon_bytes: { public: 0, private: 0 }, seats: 5 }],
  perks: {}, addon_bytes: { public: 0, private: 0 }, iat: now(), exp: now() + 600, ...extra,
});

// ---- stand-in for clerk.allternit.com JWKS and api.allternit.com entitlement ------------------
const SESSION = ['freeweights.read', 'freeweights.write'];
const KEYS = {
  alt_goodkey123: () => claimFor('user_Alice', 'key', SESSION),
  alt_repokey123: () => claimFor('user_Alice', 'key', ['freeweights.repo:rp_abc123']),
  alt_noscope123: () => claimFor('user_Alice', 'key', []),
  alt_ratekey123: () => claimFor('user_Alice', 'key', SESSION, { perks: { api_requests_5m: 2 } }),
};
const hits = { entitlement: 0, jwks: 0 };
const server = createServer((req, res) => {
  if (req.url === '/jwks') {
    hits.jwks++;
    const jwk = clerk.publicKey.export({ format: 'jwk' });
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ keys: [{ ...jwk, kid: KID, alg: 'RS256', use: 'sig' }] }));
  }
  if (req.url === '/entitlement') {
    hits.entitlement++;
    const bearer = (req.headers.authorization || '').replace(/^Bearer /, '');
    let jws;
    if (bearer === 'alt_badsig12345') jws = claimJws(claimFor('user_Alice', 'key', SESSION), rogueEd.privateKey);
    else if (KEYS[bearer]) jws = claimJws(KEYS[bearer]());
    else if (bearer.split('.').length === 3) {
      const sub = JSON.parse(Buffer.from(bearer.split('.')[1], 'base64url')).sub;
      jws = claimJws(claimFor(sub === 'user_Mismatch' ? 'user_Other' : sub, 'session', SESSION));
    } else { res.writeHead(401); return res.end('{"error":"invalid_key"}'); }
    res.writeHead(200, { 'content-type': 'application/jose' });
    return res.end(jws);
  }
  res.writeHead(404); res.end();
});

// ---- the two Workers ----------------------------------------------------------------------------
execFileSync('node', ['scripts/build-data.mjs'], { cwd: here, stdio: 'pipe' });
const FILES = JSON.parse(readFileSync(join(here, '.data', 'manifest-files.json'), 'utf8'));
const [id, mf] = Object.entries(FILES).find(([, v]) => JSON.parse(readFileSync(v.file, 'utf8')).files.some((f) => f.lfs));
const man = JSON.parse(readFileSync(mf.file, 'utf8'));
const lfs = man.files.find((f) => f.lfs);
const rpath = `/${id}/resolve/main/${lfs.path.split('/').map(encodeURIComponent).join('/')}`;

const procs = [];
function config(dir, srv, withKey) {
  const file = join(dir, 'wrangler.toml');
  writeFileSync(file, [
    'name = "freeweights-auth-test"', `main = ${JSON.stringify(join(here, 'src', 'index.ts'))}`, 'compatibility_date = "2025-01-01"',
    '[[d1_databases]]', 'binding = "DB"', 'database_name = "freeweights"', 'database_id = "local-freeweights"',
    '[[d1_databases]]', 'binding = "ACC"', 'database_name = "freeweights-accounts"', 'database_id = "local-accounts"',
    `migrations_dir = ${JSON.stringify(join(here, 'migrations-accounts'))}`,
    '[[r2_buckets]]', 'binding = "FW"', 'bucket_name = "freeweights"',
    '[vars]', 'CHECK_MODE = "offline"', 'PASSTHROUGH = "0"', 'FRESH_MS = "600000"', 'HF_CHECK_CAP = "2000"', 'ORIGIN_BUDGET_BYTES = "0"',
    `CLERK_ISSUERS = "${ISS},https://other.example"`, `CLERK_JWKS_URL = "${srv}/jwks"`,
    `CLERK_AZP = "${AZP},https://ai.allternit.com"`,
    // Worker B has no ENTITLEMENT_URL: entitlement not configured. (The repo now bundles the real
    // entitlement-v1 key, so "no key" can no longer be the unconfigured case.)
    ...(withKey ? [`ENTITLEMENT_URL = "${srv}/entitlement"`, `ENTITLEMENT_PUBKEY = "${ENT_SPKI}"`] : []),
  ].join('\n'));
  return file;
}
async function startWorker(port, inspector, withKey, srv) {
  const dir = mkdtempSync(join(tmpdir(), 'fw-auth-'));
  const cfg = config(dir, srv, withKey);
  const wr = (...a) => execFileSync('npx', ['wrangler', ...a, '--config', cfg, '--persist-to', dir], { cwd: here, stdio: 'pipe', env: { ...process.env, CI: '1' } });
  wr('d1', 'execute', 'freeweights', '--local', `--file=${join(here, 'schema.sql')}`);
  wr('d1', 'migrations', 'apply', 'freeweights-accounts', '--local');
  wr('d1', 'execute', 'freeweights-accounts', '--local', '--command',
    "INSERT INTO users (id, handle, name) VALUES ('user_Alice', 'alice-test', 'Alice'), ('user_Mismatch', 'mismatch-test', NULL)");
  wr('d1', 'execute', 'freeweights-accounts', '--local', '--command',
    "INSERT INTO users (id, handle, name, rules_accepted_at) VALUES ('user_Bob', 'bob-test', 'Bob', '2026-11-16T00:00:00Z'); " +
    "INSERT INTO repos (id, kind, source, namespace, name, owner_user_id) VALUES ('rp_BOBMODEL', 'model', 'community', 'bob-test', 'm', 'user_Bob')");
  wr('r2', 'object', 'put', `freeweights/manifests/${id}.json`, '--local', '--file', mf.file, '--content-type', 'application/json');
  const p = spawn('npx', ['wrangler', 'dev', '--local', '--config', cfg, '--port', port, '--inspector-port', inspector, '--persist-to', dir], { cwd: here, stdio: 'ignore' });
  procs.push(p);
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/api/catalog`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`wrangler dev on ${port} did not start`);
}

before(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const srv = `http://127.0.0.1:${server.address().port}`;
  await Promise.all([startWorker(PORT_A, '9331', true, srv), startWorker(PORT_B, '9332', false, srv)]);
});
after(() => { for (const p of procs) p.kill('SIGTERM'); server.close(); });

const A = (p, init = {}) => fetch(`http://127.0.0.1:${PORT_A}${p}`, { redirect: 'manual', ...init });
const B = (p, init = {}) => fetch(`http://127.0.0.1:${PORT_B}${p}`, { redirect: 'manual', ...init });
const bearer = (t) => ({ headers: { authorization: `Bearer ${t}` } });
const whoami = (t, at = A) => at('/api/whoami-v2', t === undefined ? {} : bearer(t));
async function refused(res, status, code) {
  assert.equal(res.status, status);
  assert.equal(res.headers.get('cache-control'), 'private, no-store');
  const body = await res.json();
  assert.equal(body.error, code);
  return body;
}

test('valid Clerk session: whoami-v2 in Hugging Face shape, private, no-store, CSP', async () => {
  const r = await whoami(clerkJwt());
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('cache-control'), 'private, no-store');
  assert.match(r.headers.get('content-security-policy'), /default-src 'none'.*frame-ancestors 'none'/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  const b = await r.json();
  assert.deepEqual(
    { type: b.type, id: b.id, name: b.name, fullname: b.fullname, isPro: b.isPro, auth: b.auth, allternit: b.allternit },
    { type: 'user', id: 'user_Alice', name: 'alice-test', fullname: 'Alice', isPro: true, auth: { type: 'session' }, allternit: { plan: 'pro', scopes: SESSION } });
  assert.deepEqual(b.orgs, [{ type: 'org', name: 'acme', fullname: null, avatarUrl: null, roleInOrg: 'contributor' }]);
});

test('Clerk session checks: bad signature, wrong issuer, expired, nbf, wrong azp, bad alg and sub all answer 401 auth_required', async () => {
  const cases = {
    'bad signature': clerkJwt({}, { key: rogueRsa.privateKey }),
    'wrong issuer': clerkJwt({ iss: 'https://evil.example' }),
    'expired past skew': clerkJwt({ exp: now() - 120 }),
    'nbf in the future': clerkJwt({ nbf: now() + 300 }),
    'wrong azp': clerkJwt({ azp: 'https://evil.example' }),
    'azp not a string': clerkJwt({ azp: 7 }),
    'alg HS256': clerkJwt({}, { header: { alg: 'HS256' } }),
    'alg none': `${b64u(JSON.stringify({ alg: 'none', kid: KID }))}.${b64u(JSON.stringify({ iss: ISS, sub: 'user_Alice', exp: now() + 60 }))}.`,
    'unknown kid': clerkJwt({}, { header: { kid: 'nope' } }),
    'sub not a Clerk user': clerkJwt({ sub: 'org_123' }),
    'garbage': 'not-a-token',
  };
  for (const [name, t] of Object.entries(cases)) {
    const r = await whoami(t);
    assert.equal(r.status, 401, name);
    const b = await refused(r, 401, 'auth_required');
    assert.ok(!JSON.stringify(b).includes(t.slice(0, 20)), `${name}: reply echoes the token`);
  }
  await refused(await whoami(undefined), 401, 'auth_required');
});

test('missing azp passes (native iOS); expiry inside the 60 s skew passes; second issuer accepted', async () => {
  assert.equal((await whoami(clerkJwt({ azp: undefined }))).status, 200);
  assert.equal((await whoami(clerkJwt({ exp: now() - 30 }))).status, 200);
  assert.equal((await whoami(clerkJwt({ iss: 'https://other.example' }))).status, 200);
  assert.equal((await whoami(clerkJwt({ azp: 'https://ai.allternit.com' }))).status, 200);
});

test('hf_ tokens are refused with 401 hf_token_rejected, also on auth routes', async () => {
  await refused(await whoami('hf_abcdef'), 401, 'hf_token_rejected');
  const r = await A('/api/repos/create', { method: 'POST', ...bearer('hf_abcdef') });
  await refused(r, 401, 'hf_token_rejected');
});

test('alt_ keys: whoami as an access token with the right role; revoked key 401; no scope 403; bad claim signature 503', async () => {
  const w = await whoami('alt_goodkey123');
  assert.equal(w.status, 200);
  const b = await w.json();
  assert.deepEqual(b.auth, { type: 'access_token', accessToken: { displayName: 'Allternit key', role: 'write' } });
  assert.equal(b.name, 'alice-test');
  const fg = await (await whoami('alt_repokey123')).json();
  assert.equal(fg.auth.accessToken.role, 'fineGrained');
  assert.deepEqual(fg.auth.accessToken.fineGrained.scoped[0].entity, { type: 'repo', name: 'rp_abc123' });
  await refused(await whoami('alt_revoked12345'), 401, 'auth_required');
  await refused(await whoami('alt_noscope123'), 403, 'insufficient_scope');
  await refused(await whoami('alt_badsig12345'), 503, 'entitlement_unavailable');
});

test('entitlement claim sub must match the Clerk session sub', async () => {
  await refused(await whoami(clerkJwt({ sub: 'user_Mismatch' })), 401, 'auth_required');
});

test('entitlement not configured (no ENTITLEMENT_URL): authed perk path answers 503, never fails open', async () => {
  const before = hits.entitlement;
  await refused(await whoami(clerkJwt(), B), 503, 'accounts_not_configured');
  await refused(await whoami('alt_goodkey123', B), 503, 'accounts_not_configured');
  assert.equal(hits.entitlement, before, 'a credential was sent to the entitlement endpoint with no key to verify the answer');
  // a bad session is still refused first
  await refused(await whoami(clerkJwt({ iss: 'https://evil.example' }), B), 401, 'auth_required');
});

test('anonymous download still 302; a credential on a public read is ignored and never checked', async () => {
  const r = await A(rpath);
  assert.equal(r.status, 302);
  assert.ok(r.headers.get('location'));
  const before = { ...hits };
  for (const t of ['alt_goodkey123', clerkJwt()]) {
    const k = await A(rpath, bearer(t));
    assert.equal(k.status, 302);
    assert.equal(k.headers.get('location'), r.headers.get('location'));
    assert.equal(k.headers.get('content-security-policy'), null); // not answered as an auth route
  }
  assert.equal((await A('/api/catalog', bearer('alt_goodkey123'))).status, 200);
  assert.equal(hits.entitlement, before.entitlement);
});

test('method routing: 405 with Allow, write routes check the credential, preflight lists the route methods', async () => {
  let r = await A('/api/models', { method: 'POST' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'GET, HEAD');
  r = await A('/api/repos/create', { method: 'DELETE' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'POST');
  r = await A('/api/repos/create', { method: 'GET' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'POST');
  r = await A('/api/models', { method: 'PROPFIND' });
  assert.equal(r.status, 405);
  r = await A('/some/static/page', { method: 'PUT' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'GET, HEAD');

  await refused(await A('/api/repos/create', { method: 'POST' }), 401, 'auth_required');
  // Built upload routes (plan step 7) answer for real: no body is a 400, and an account that has not
  // accepted the upload rules is refused before any repo is made.
  await refused(await A('/api/repos/create', { method: 'POST', ...bearer(clerkJwt()) }), 400, 'bad_request');
  const rules = await refused(await A('/api/repos/create', { method: 'POST', ...bearer(clerkJwt()), body: JSON.stringify({ name: 'm', type: 'model' }) }), 403, 'rules_not_accepted');
  assert.match(rules.message, /upload rules/);
  await refused(await A('/api/repos/create', { method: 'POST', ...bearer(clerkJwt()), body: JSON.stringify({ name: 'm', private: true }) }), 402, 'perk_required');
  await refused(await A('/datasets/org/name.git/info/lfs/objects/batch', { method: 'POST', ...bearer(clerkJwt()) }), 404, 'repo_not_found');
  await refused(await A('/api/models/org/name/like', { method: 'DELETE', ...bearer(clerkJwt()) }), 501, 'not_implemented');
  await refused(await A('/api/collections', { method: 'POST', ...bearer(clerkJwt()) }), 501, 'not_implemented');
  await refused(await A('/api/models/org/name/xet-write-token/main', bearer('alt_goodkey123')), 501, 'xet_not_supported');

  const pre = await A('/api/fw/v1/account', { method: 'OPTIONS', headers: { origin: AZP, 'access-control-request-method': 'PATCH' } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-methods'), 'GET, POST, PATCH, DELETE, OPTIONS');
  assert.match(pre.headers.get('access-control-allow-headers'), /Authorization/);
  const pub = await A('/api/catalog', { method: 'OPTIONS' });
  assert.equal(pub.headers.get('access-control-allow-methods'), 'GET, HEAD, OPTIONS');
});

// Regression (closed-mode deploy check, 2026-11-16): huggingface_hub create_repo(exist_ok=True) reads "url" from the
// 409 body (KeyError 'url' without it), so every second `hf upload` to an existing repo failed.
test('create of an existing own repo: 409 conflict with the repo url', async () => {
  const r = await A('/api/repos/create', { method: 'POST', ...bearer(clerkJwt({ sub: 'user_Bob' })), body: JSON.stringify({ name: 'm', type: 'model' }) });
  const body = await refused(r, 409, 'conflict');
  assert.match(body.url, /\/bob-test\/m$/);
});

test('signed in without a profile: whoami 404 profile_not_found', async () => {
  await refused(await whoami(clerkJwt({ sub: 'user_NoProfile' })), 404, 'profile_not_found');
});

test('rate limit perk: over api_requests_5m answers 429 rate_limited with Retry-After', async () => {
  assert.equal((await whoami('alt_ratekey123')).status, 200);
  assert.equal((await whoami('alt_ratekey123')).status, 200);
  const r = await whoami('alt_ratekey123');
  await refused(r, 429, 'rate_limited');
  assert.ok(Number(r.headers.get('retry-after')) > 0);
});
