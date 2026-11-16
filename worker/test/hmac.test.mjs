// Pure-function tests for the shared HMAC verify (src/auth/hmac.ts). Starts no server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, createHash } from 'node:crypto';
import { verifySignature, signingMessage, sha256Hex, timingSafeEqual, SKEW_S } from '../src/auth/hmac.ts';

const SECRET = 'test-secret';
const NOW = 1_800_000_000;
const sign = (ts, method, pq, body, secret = SECRET) =>
  'v1=' + createHmac('sha256', secret).update(`${ts}\n${method}\n${pq}\n${createHash('sha256').update(body).digest('hex')}`).digest('hex');
const parts = (o = {}) => ({ secret: SECRET, timestamp: String(NOW), signature: sign(NOW, 'POST', '/api/fw/v1/admin/limits?x=1', '{"a":1}'),
  method: 'POST', pathQuery: '/api/fw/v1/admin/limits?x=1', body: '{"a":1}', nowS: NOW, ...o });

test('a correct signature verifies, and matches an independent node:crypto implementation', async () => {
  assert.equal(await verifySignature(parts()), true);
  assert.equal(await sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(signingMessage('1', 'post', '/p?q', 'h'), '1\nPOST\n/p?q\nh');
});

test('wrong secret, method, path, query, body or format fail', async () => {
  assert.equal(await verifySignature(parts({ secret: 'other' })), false);
  assert.equal(await verifySignature(parts({ method: 'PUT' })), false);
  assert.equal(await verifySignature(parts({ pathQuery: '/api/fw/v1/admin/limits?x=2' })), false);
  assert.equal(await verifySignature(parts({ body: '{"a":2}' })), false);
  assert.equal(await verifySignature(parts({ signature: parts().signature.replace('v1=', 'v2=') })), false);
  assert.equal(await verifySignature(parts({ signature: null })), false);
  assert.equal(await verifySignature(parts({ timestamp: null })), false);
  assert.equal(await verifySignature(parts({ secret: '' })), false);
});

test('the timestamp window is +/- SKEW_S and a signature does not carry to another timestamp', async () => {
  const at = (ts) => parts({ timestamp: String(ts), signature: sign(ts, 'POST', '/api/fw/v1/admin/limits?x=1', '{"a":1}') });
  assert.equal(await verifySignature(at(NOW - SKEW_S)), true);
  assert.equal(await verifySignature(at(NOW + SKEW_S)), true);
  assert.equal(await verifySignature(at(NOW - SKEW_S - 1)), false);
  assert.equal(await verifySignature(at(NOW + SKEW_S + 1)), false);
  assert.equal(await verifySignature(parts({ timestamp: String(NOW + 1) })), false); // old signature, new timestamp
  assert.equal(await verifySignature(parts({ timestamp: 'abc' })), false);
});

test('timingSafeEqual', () => {
  assert.equal(timingSafeEqual('abc', 'abc'), true);
  assert.equal(timingSafeEqual('abc', 'abd'), false);
  assert.equal(timingSafeEqual('abc', 'ab'), false);
});
