// Pure-function tests for handle rules (src/auth/handle.ts). Starts no server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleProblem, deletedHandle, HANDLE_RE } from '../src/auth/handle.ts';

test('good handles pass; length, charset, start and doubled separators fail', () => {
  for (const h of ['ab', 'Eoj', 'a.b_c-d', 'x'.repeat(42), 'user123']) assert.equal(handleProblem(h), null, h);
  for (const h of ['a', 'x'.repeat(43), '-ab', '.ab', 'a b', 'a/b', 'a..b', 'a--b', 'é1', '', 5, null, undefined]) assert.notEqual(handleProblem(h), null, String(h));
});

test('the deleted-account handle is always a valid, non-reserved-looking handle that frees the old one', () => {
  for (const id of ['user_2abcDEF123', 'user_', '', 'u'.repeat(200), 'user_!!!']) {
    const h = deletedHandle(id);
    assert.equal(handleProblem(h), null, h);
    assert.match(h, /^deleted\./);
    assert.ok(HANDLE_RE.test(h) && h.length <= 42);
  }
  assert.notEqual(deletedHandle('user_a1'), deletedHandle('user_b2'));
  assert.equal(deletedHandle('user_a1'), deletedHandle('user_a1'));
});
