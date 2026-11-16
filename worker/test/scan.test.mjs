// Scanner API rules (plan steps 8-9, spec/accounts-v1.md 11.4-11.6): signed requests, the result and claim
// rules, promotion order and the sweep. Pure functions only: no wrangler, no network (Node strips the types
// when it loads the .ts files).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hmacHex, sha256Hex, signingMessage, verifySignature } from '../src/auth/hmac.ts';
import {
  CLAIM_MS, HELD_KEEP_MS, MAX_ATTEMPTS, SWEEP_BATCH,
  checkClaim, decideResult, iso, parseResultBody, parseTree, planSweep, promotableChain, repoStatusFrom, scannerOk,
} from '../src/storage/scan-state.ts';

// ---- signed requests -----------------------------------------------------------------------------------

const SECRET = 'scanner-secret-for-tests';
const NOW = 1_763_200_000;
async function signed({ secret = SECRET, ts = NOW, method = 'POST', path = '/api/fw/v1/scan/claim', body = '{"scanner_version":"1"}' } = {}) {
  const sig = await hmacHex(secret, signingMessage(String(ts), method, path, await sha256Hex(body)));
  return { secret: SECRET, timestamp: String(ts), signature: `v1=${sig}`, method, pathQuery: path, body, nowS: NOW };
}

test('a correct signature inside the window verifies, at both edges of the 300 s skew', async () => {
  assert.equal(await verifySignature(await signed()), true);
  assert.equal(await verifySignature(await signed({ ts: NOW - 300 })), true);
  assert.equal(await verifySignature(await signed({ ts: NOW + 300 })), true);
});

test('a stale or future timestamp fails even with a correct signature', async () => {
  assert.equal(await verifySignature(await signed({ ts: NOW - 301 })), false);
  assert.equal(await verifySignature(await signed({ ts: NOW + 301 })), false);
});

test('the signature binds the body, method, path and key', async () => {
  const p = await signed();
  assert.equal(await verifySignature({ ...p, body: '{"scanner_version":"2"}' }), false);
  assert.equal(await verifySignature({ ...p, method: 'GET' }), false);
  assert.equal(await verifySignature({ ...p, pathQuery: '/api/fw/v1/scan/sc_1/result' }), false);
  // signed with the admin key: never accepted on a scan route (each route passes its own secret)
  assert.equal(await verifySignature({ ...(await signed({ secret: 'admin-secret' })), secret: SECRET }), false);
  assert.equal(await verifySignature({ ...p, signature: p.signature.replace('v1=', 'v2=') }), false);
  assert.equal(await verifySignature({ ...p, timestamp: `${NOW}.0` }), false);
});

// ---- result body and decision ----------------------------------------------------------------------------

const body = (o) => parseResultBody({ attempt: 1, status: 'clean', findings: [], scanner_version: 'fw-scanner 1.0', ...o });

test('result bodies: held needs a finding, codes are the stable set', () => {
  assert.equal(typeof body({ status: 'held' }), 'string');
  assert.equal(typeof body({ findings: [{ scanner: 'clamav', code: 'virus' }] }), 'string');
  assert.equal(typeof body({ attempt: 0 }), 'string');
  assert.deepEqual(body({ status: 'held', findings: [{ scanner: 'picklescan', code: 'unsafe_pickle' }] }).findings, [{ scanner: 'picklescan', code: 'unsafe_pickle' }]);
});

test('any finding holds; a blocked hash is held as blocklisted whatever the scanner said; only clean promotes', () => {
  const clean = body({});
  assert.deepEqual(decideResult(clean, 1, false), { status: 'clean', findings: [], promote: true });
  const sneaky = body({ findings: [{ scanner: 'gitleaks', code: 'secret_found' }] }); // "clean" with a finding
  assert.equal(decideResult(sneaky, 1, false).status, 'held');
  assert.equal(decideResult(sneaky, 1, false).promote, false);
  const b = decideResult(clean, 1, true);
  assert.equal(b.status, 'held');
  assert.deepEqual(b.findings.map((f) => f.code), ['blocklisted']);
});

test('error results re-queue until the third attempt, then stay error', () => {
  const e = body({ status: 'error', findings: [{ scanner: 'clamav', code: 'scan_failed' }] });
  assert.equal(decideResult(e, 1, false).status, 'queued');
  assert.equal(decideResult(e, MAX_ATTEMPTS - 1, false).status, 'queued');
  assert.equal(decideResult(e, MAX_ATTEMPTS, false).status, 'error');
});

test('a result is accepted only for the live claim of that attempt; a repeat is harmless', () => {
  const now = Date.parse('2026-11-15T12:00:00Z');
  const live = { status: 'scanning', attempts: 2, claimed_until: iso(now + 60_000), finished_at: null };
  assert.equal(checkClaim(live, 2, now), 'accept');
  assert.equal(checkClaim(live, 1, now), 'not_claimed'); // an older attempt
  assert.equal(checkClaim({ ...live, claimed_until: iso(now - 1000) }, 2, now), 'not_claimed'); // ran out, not swept yet
  assert.equal(checkClaim({ ...live, status: 'queued', claimed_until: null }, 2, now), 'not_claimed'); // swept back to queued
  assert.equal(checkClaim({ status: 'clean', attempts: 2, claimed_until: null, finished_at: iso(now) }, 2, now), 'repeat');
});

// ---- promotion -------------------------------------------------------------------------------------------

const A = 'a'.repeat(40), B = 'b'.repeat(40), C = 'c'.repeat(40);

test('all clean -> the head moves and the repo is live', () => {
  const pending = [{ oid: A, parent_oid: null, statuses: ['clean', 'clean'] }];
  assert.deepEqual(promotableChain(pending, null), [A]);
  assert.equal(repoStatusFrom('scanning', [], true), 'live');
});

test('one held file -> the head does not move, the repo is held, and later commits wait', () => {
  const pending = [
    { oid: A, parent_oid: null, statuses: ['clean', 'held'] },
    { oid: B, parent_oid: A, statuses: ['clean'] },
  ];
  assert.deepEqual(promotableChain(pending, null), []);
  assert.equal(repoStatusFrom('scanning', pending.map((p) => p.statuses), false), 'held');
});

test('a held update leaves the last clean head served', () => {
  // head is A; B (child of A) holds -> head stays A, repo held
  const pending = [{ oid: B, parent_oid: A, statuses: ['held'] }];
  assert.deepEqual(promotableChain(pending, A), []);
  assert.equal(repoStatusFrom('live', [['held']], true), 'held');
});

test('a clean commit on top of an unscanned parent waits for the parent; then both move in order', () => {
  const pending = [
    { oid: A, parent_oid: null, statuses: ['scanning'] },
    { oid: B, parent_oid: A, statuses: ['clean'] },
  ];
  assert.deepEqual(promotableChain(pending, null), []);
  assert.equal(repoStatusFrom('scanning', pending.map((p) => p.statuses), false), 'scanning');
  pending[0].statuses = ['clean'];
  assert.deepEqual(promotableChain(pending, null), [A, B]);
});

test('a commit whose parent is not the head never moves it; errors keep the repo scanning', () => {
  assert.deepEqual(promotableChain([{ oid: C, parent_oid: B, statuses: ['clean'] }], A), []);
  assert.equal(repoStatusFrom('scanning', [['clean', 'error']], true), 'scanning');
  assert.equal(repoStatusFrom('removed', [], true), 'removed');
  assert.equal(repoStatusFrom('draft', [], false), 'draft');
  assert.deepEqual(promotableChain([{ oid: A, parent_oid: null, statuses: [] }], null), [A]); // deletions only
});

// ---- sweep -----------------------------------------------------------------------------------------------

test('sweep selection: 1 h uploads, 30 min claims (3 attempts -> error), 14 d held, owner purges, bounded', () => {
  const now = Date.parse('2026-11-15T12:00:00Z');
  const plan = planSweep(now, {
    uploads: [
      { id: 'up_old', status: 'pending', expires_at: iso(now - 1000) },
      { id: 'up_verified', status: 'verified', expires_at: iso(now - 1000) },
      { id: 'up_fresh', status: 'pending', expires_at: iso(now + 1000) },
      { id: 'up_committed', status: 'committed', expires_at: iso(now - 1000) },
    ],
    claims: [
      { id: 'sc_ran1', status: 'scanning', attempts: 1, claimed_until: iso(now - 1000) },
      { id: 'sc_ran3', status: 'scanning', attempts: MAX_ATTEMPTS, claimed_until: iso(now - 1000) },
      { id: 'sc_live', status: 'scanning', attempts: 1, claimed_until: iso(now - 1000 + CLAIM_MS) },
      { id: 'sc_done', status: 'clean', attempts: 1, claimed_until: iso(now - 1000) },
    ],
    held: [
      { id: 'sc_h_old', status: 'held', finished_at: iso(now - HELD_KEEP_MS - 1000) },
      { id: 'sc_h_new', status: 'held', finished_at: iso(now - HELD_KEEP_MS + 60_000) },
    ],
    removed: [
      { id: 'up_owner', status: 'committed', removed_reason: 'owner' },
      { id: 'up_gone', status: 'committed', removed_reason: 'account_deleted' },
      { id: 'up_takedown', status: 'committed', removed_reason: 'copyright' },
      { id: 'up_done', status: 'expired', removed_reason: 'owner' },
    ],
  });
  assert.deepEqual(plan.expire, ['up_old', 'up_verified']);
  assert.deepEqual(plan.requeue, ['sc_ran1']);
  assert.deepEqual(plan.error, ['sc_ran3']);
  assert.deepEqual(plan.deleteHeld, ['sc_h_old']);
  assert.deepEqual(plan.purge, ['up_owner', 'up_gone']);

  const many = Array.from({ length: SWEEP_BATCH + 10 }, (_, i) => ({ id: `up_${i}`, status: 'pending', expires_at: iso(now - 1000) }));
  assert.equal(planSweep(now, { uploads: many, claims: [], held: [] }).expire.length, SWEEP_BATCH);
});

test('scanner health: ok under 10 minutes since the last poll, else delayed', () => {
  const now = Date.parse('2026-11-15T12:00:00Z');
  assert.equal(scannerOk(iso(now - 9 * 60_000), now), true);
  assert.equal(scannerOk(iso(now - 10 * 60_000), now), false);
  assert.equal(scannerOk(null, now), false);
});

test('commit trees: a manifest files list, plain or wrapped; anything malformed is refused', () => {
  const f = { path: 'model.safetensors', size: 10, sha256: 'e'.repeat(64), lfs: true };
  assert.deepEqual(parseTree([f]), [f]);
  assert.deepEqual(parseTree({ files: [f] }), [f]);
  assert.equal(parseTree([{ ...f, sha256: 'nothex' }]), null);
  assert.equal(parseTree({ nope: 1 }), null);
});
