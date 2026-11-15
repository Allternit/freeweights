import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { Sha256, sha256File } from '../assets/vendor/sha256-stream.js';

const hex = (s) => new Sha256().update(new TextEncoder().encode(s)).hex();

test('FIPS 180-4 / NIST vectors', () => {
  assert.equal(hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  assert.equal(hex('abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'), 'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1');
});

test('one million "a" fed in odd-sized pieces', () => {
  const h = new Sha256();
  const a = new Uint8Array(1000).fill(97);
  for (let i = 0; i < 1000; i++) h.update(i % 3 === 0 ? a : a.subarray(0, 1000));
  assert.equal(h.hex(), 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
});

test('padding edges (55, 56, 63, 64, 65 bytes) and any split match node crypto', () => {
  for (const n of [0, 1, 54, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129, 1000]) {
    const data = randomBytes(n);
    const want = createHash('sha256').update(data).digest('hex');
    assert.equal(new Sha256().update(new Uint8Array(data)).hex(), want, `whole ${n}`);
    for (const cut of [1, 7, 63, 64, 65]) {
      const h = new Sha256();
      for (let o = 0; o < n; o += cut) h.update(new Uint8Array(data.subarray(o, o + cut)));
      assert.equal(h.hex(), want, `${n} bytes in ${cut}-byte pieces`);
    }
  }
});

test('sha256File reads a Blob in slices and reports progress', async () => {
  const data = randomBytes(9 * 1024 * 1024 + 123);
  const seen = [];
  const got = await sha256File(new Blob([data]), { onProgress: (d, t) => seen.push([d, t]) });
  assert.equal(got, createHash('sha256').update(data).digest('hex'));
  assert.equal(seen.length, 3);
  assert.deepEqual(seen.at(-1), [data.length, data.length]);
});

test('finished hashes refuse more input', () => {
  const h = new Sha256(); h.hex();
  assert.throws(() => h.update(new Uint8Array(1)));
});
