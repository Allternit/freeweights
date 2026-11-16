// Pure-function tests for report/removal/limits/usage logic (src/moderation.ts). Starts no server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateReport, reportsAllowed, removalStatus, restoreStatus, limitsView, diffUsage, LIMIT_KEYS, CAP_KEYS } from '../src/moderation.ts';

const good = { target: { type: 'repo', id: 'alice/model' }, reason_class: 'malware_or_secrets', body: ' hi ' };

test('validateReport accepts a good report and trims, rejects every malformed shape', () => {
  assert.deepEqual(validateReport(good), { ok: { target_type: 'repo', target_id: 'alice/model', reason_class: 'malware_or_secrets', body: 'hi' } });
  assert.equal(validateReport({ ...good, body: undefined }).ok.body, null);
  for (const bad of [null, [], 'x', {}, { ...good, target: { type: 'planet', id: 'x' } }, { ...good, target: { type: 'repo', id: '' } },
    { ...good, target: { type: 'repo', id: 'x'.repeat(201) } }, { ...good, reason_class: 'ncii' }, { ...good, reason_class: 5 }, { ...good, body: 'x'.repeat(5001) }, { ...good, body: 7 }]) {
    assert.ok('problem' in validateReport(bad), JSON.stringify(bad).slice(0, 60));
  }
});

test('reportsAllowed: unset key never refuses, a set key refuses at the limit, 0 refuses all', () => {
  assert.equal(reportsAllowed(999, null), true);
  assert.equal(reportsAllowed(4, 5), true);
  assert.equal(reportsAllowed(5, 5), false);
  assert.equal(reportsAllowed(0, 0), false);
});

test('removalStatus: takedown classes are 451, owner and account deletions are 404', () => {
  assert.equal(removalStatus('copyright'), 451);
  assert.equal(removalStatus('csam'), 451);
  assert.equal(removalStatus('owner'), 404);
  assert.equal(removalStatus('account_deleted'), 404);
  assert.equal(removalStatus(null), 404);
});

test('restoreStatus: held beats scanning beats live; no commit is a draft', () => {
  assert.equal(restoreStatus(null, []), 'draft');
  assert.equal(restoreStatus('c', ['clean', 'clean']), 'live');
  assert.equal(restoreStatus('c', ['clean', 'queued']), 'scanning');
  assert.equal(restoreStatus('c', ['clean', 'scanning', 'held']), 'held');
  assert.equal(restoreStatus('c', ['error']), 'held');
});

test('limitsView: open needs the switch and every cap; missing caps fail closed; scanner lateness', () => {
  const all = Object.fromEntries(CAP_KEYS.map((k, i) => [k, i + 1]));
  const now = Date.parse('2026-11-15T12:00:00Z');
  const v = limitsView({ ...all, uploads_open: 1 }, 0, '2026-11-15T11:55:00Z', now);
  assert.equal(v.open, true); assert.equal(v.scanning_delayed, false); assert.equal(v.site.full, false);
  assert.equal(limitsView({ ...all, uploads_open: 0 }, 0, null, now).open, false);
  const { repos_per_user, ...partial } = all;
  const p = limitsView({ ...partial, uploads_open: 1 }, 0, null, now);
  assert.equal(p.open, false); assert.equal(p.limits.repos_per_user, null); assert.equal(p.scanning_delayed, true);
  assert.equal(limitsView({ uploads_open: 1 }, 0, null, now).site.full, true); // cap unset = full
  assert.equal(limitsView({ ...all, uploads_open: 1, site_cap_bytes: 5 }, 5, null, now).site.full, true);
  assert.equal(limitsView({ ...all, uploads_open: 1 }, 0, '2026-11-15T11:49:00Z', now).scanning_delayed, true);
  assert.ok(LIMIT_KEYS.includes('reports_per_day') && !CAP_KEYS.includes('reports_per_day'));
});

test('diffUsage reports only owners that differ, zeroes owners with no uploads left, and sums the site total', () => {
  const U = (p, q, r, n) => ({ public_bytes: p, private_bytes: 0, quarantine_bytes: q, repos: n });
  const computed = new Map([['a', U(10, 5, 0, 1)], ['b', U(0, 0, 0, 0)]]);
  const stored = new Map([['a', U(10, 5, 0, 1)], ['b', U(0, 7, 0, 1)], ['c', U(3, 0, 0, 1)]]);
  const d = diffUsage(computed, stored);
  assert.deepEqual(d.changes.map((c) => c.user_id).sort(), ['b', 'c']);
  assert.deepEqual(d.changes.find((c) => c.user_id === 'c').usage, { public_bytes: 0, private_bytes: 0, quarantine_bytes: 0, repos: 0 });
  assert.equal(d.site, 15);
});
