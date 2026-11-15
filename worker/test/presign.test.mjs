// SigV4 signing for the R2 S3 API (worker/src/storage/presign.ts, plan U4/U5). Pure: no server, no network.
// The vectors are AWS's published examples: the SigV4 test suite (get-vanilla), the derived signing key
// example, and the S3 "Signature Version 4" examples (header auth GET/PUT/lifecycle/list, query presign).
// Node strips the TypeScript types itself, so the source file is imported as is.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sign, signingKeyHex, presignUrl, r2Presign, partUrls, partCount, partSize, completeXml,
  lfsUploadObject, lfsActionOk, BASIC_MAX_BYTES, PART_BYTES, EMPTY_SHA256, sha256Hex, uriEncode,
} from '../src/storage/presign.ts';

const SUITE = { accessKeyId: 'AKIDEXAMPLE', secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY' };
const S3 = { accessKeyId: 'AKIAIOSFODNN7EXAMPLE', secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' };
const S3_HOST = 'examplebucket.s3.amazonaws.com';
const S3_DATE = '20130524T000000Z';

test('derived signing key matches the AWS example (20120215 / us-east-1 / iam)', async () => {
  assert.equal(await signingKeyHex(SUITE.secretAccessKey, '20120215', 'us-east-1', 'iam'),
    'f4780e2d9f65fa895f9c67b32ce1baf0b0d8a43505a000a1a9e090d414db404d');
});

test('SigV4 test suite: get-vanilla', async () => {
  const r = await sign(SUITE, { method: 'GET', host: 'example.amazonaws.com', path: '/', headers: { 'X-Amz-Date': '20150830T123600Z' },
    payloadHash: EMPTY_SHA256, region: 'us-east-1', service: 'service', amzDate: '20150830T123600Z' });
  assert.equal(r.canonical, 'GET\n/\n\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\n\nhost;x-amz-date\n' + EMPTY_SHA256);
  assert.equal(r.signature, '5fa00fa31553b73ebf1942676e86291e8372ff2a2260956d9b8aae1d763fbf31');
});

const s3 = (method, path, headers, payloadHash, query) => sign(S3, { method, host: S3_HOST, path, query, payloadHash, region: 'us-east-1', service: 's3', amzDate: S3_DATE,
  headers: { 'x-amz-content-sha256': payloadHash, 'x-amz-date': S3_DATE, ...headers } });

test('S3 example: GET object with Range (header auth)', async () => {
  const r = await s3('GET', '/test.txt', { Range: 'bytes=0-9' }, EMPTY_SHA256);
  assert.equal(r.signedHeaders, 'host;range;x-amz-content-sha256;x-amz-date');
  assert.equal(r.signature, 'f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41');
});

test('S3 example: PUT object, a key with "$" (path encoded once)', async () => {
  const body = await sha256Hex('Welcome to Amazon S3.');
  assert.equal(body, '44ce7dd67c959e0d3524ffac1771dfbba87d2b6b4b4e99e42034a8b803f8b072');
  const r = await s3('PUT', '/test$file.text', { Date: 'Fri, 24 May 2013 00:00:00 GMT', 'x-amz-storage-class': 'REDUCED_REDUNDANCY' }, body);
  assert.match(r.canonical, /^PUT\n\/test%24file\.text\n/);
  assert.equal(r.signature, '98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd');
});

test('S3 example: GET ?lifecycle (a query key with no value)', async () => {
  const r = await s3('GET', '/', {}, EMPTY_SHA256, [['lifecycle', '']]);
  assert.equal(r.signature, 'fea454ca298b7da1c68078a5d1bdbfbbe0d65c699e0f91ac7a200a0136783543');
});

test('S3 example: GET ?max-keys=2&prefix=J (query sorted)', async () => {
  const r = await s3('GET', '/', {}, EMPTY_SHA256, [['prefix', 'J'], ['max-keys', '2']]);
  assert.equal(r.signature, '34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69dc6f7');
});

test('S3 example: presigned GET URL (query auth, 86400 s)', async () => {
  const url = await presignUrl(S3, { method: 'GET', host: S3_HOST, path: '/test.txt', region: 'us-east-1', service: 's3', amzDate: S3_DATE, expiresS: 86400 });
  assert.equal(url, 'https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    + '&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z'
    + '&X-Amz-Expires=86400&X-Amz-SignedHeaders=host'
    + '&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404');
});

test('uriEncode: unreserved kept, UTF-8 and reserved percent-encoded upper case', () => {
  assert.equal(uriEncode('a-b_c.d~e/f g+é', true), 'a-b_c.d~e/f%20g%2B%C3%A9');
  assert.equal(uriEncode('a/b'), 'a%2Fb');
});

// ---- R2 ------------------------------------------------------------------------------------------------
const R2 = { accountId: 'acc123', accessKeyId: 'AK', secretAccessKey: 'SK' };
const NOW = new Date('2026-11-15T12:00:00Z');
const KEY = 'repos/rp_01ABC/blobs/' + 'a'.repeat(64);

test('R2 presigned PUT signs content-length, region auto, path-style bucket', async () => {
  const u = new URL(await r2Presign(R2, { method: 'PUT', bucket: 'quarantine', key: KEY, expiresS: 3600, contentLength: 1234, now: NOW }));
  assert.equal(u.host, 'acc123.r2.cloudflarestorage.com');
  assert.equal(u.pathname, '/freeweights-quarantine/' + KEY);
  assert.equal(u.searchParams.get('X-Amz-SignedHeaders'), 'content-length;host');
  assert.equal(u.searchParams.get('X-Amz-Credential'), 'AK/20261115/auto/s3/aws4_request');
  assert.equal(u.searchParams.get('X-Amz-Expires'), '3600');
  // A different size is a different signature: R2 rejects a body whose length was not the signed one.
  const other = new URL(await r2Presign(R2, { method: 'PUT', bucket: 'quarantine', key: KEY, expiresS: 3600, contentLength: 1235, now: NOW }));
  assert.notEqual(u.searchParams.get('X-Amz-Signature'), other.searchParams.get('X-Amz-Signature'));
});

test('multipart part URLs: one per 32 MiB part, last part sized to the remainder', async () => {
  const size = 500 * 1024 * 1024 + 7;
  const parts = await partUrls(R2, { bucket: 'quarantine', key: KEY, uploadId: 'up-xyz', size, chunk: PART_BYTES, expiresS: 3600, now: NOW });
  const keys = Object.keys(parts);
  assert.equal(keys.length, 16);
  assert.deepEqual(keys.slice(0, 2), ['00001', '00002']);
  assert.equal(partSize(size, PART_BYTES, 16), size - 15 * PART_BYTES);
  const last = new URL(parts['00016']);
  assert.equal(last.searchParams.get('partNumber'), '16');
  assert.equal(last.searchParams.get('uploadId'), 'up-xyz');
  assert.equal(last.searchParams.get('X-Amz-SignedHeaders'), 'content-length;host');
  assert.equal(partCount(0, PART_BYTES), 1);
  assert.equal(partCount(PART_BYTES, PART_BYTES), 1);
  assert.equal(partCount(PART_BYTES + 1, PART_BYTES), 2);
});

test('16-part presign is cheap (done check: under 5 ms CPU in the Worker)', async () => {
  const size = 512 * 1024 * 1024;
  await partUrls(R2, { bucket: 'quarantine', key: KEY, uploadId: 'warm', size, chunk: PART_BYTES, expiresS: 3600, now: NOW });
  const t = performance.now();
  await partUrls(R2, { bucket: 'quarantine', key: KEY, uploadId: 'u2', size, chunk: PART_BYTES, expiresS: 3600, now: NOW });
  const ms = performance.now() - t;
  console.log(`# 16-part presign: ${ms.toFixed(2)} ms`);
  assert.ok(ms < 20, `16-part presign took ${ms} ms`);
});

test('CompleteMultipartUpload XML: parts sorted, ETags quoted once, escaped', () => {
  assert.equal(completeXml([{ partNumber: 2, etag: '"b"' }, { partNumber: 1, etag: 'a<' }]),
    '<CompleteMultipartUpload><Part><PartNumber>1</PartNumber><ETag>&quot;a&lt;&quot;</ETag></Part>'
    + '<Part><PartNumber>2</PartNumber><ETag>&quot;b&quot;</ETag></Part></CompleteMultipartUpload>');
});

// ---- LFS batch object shape (what huggingface_hub lfs.py accepts) ----------------------------------------
// lfs.py: _validate_batch_actions needs oid str + size int; _validate_lfs_action needs href str and header,
// when present, a dict; chunk_size in header means multipart, and the digit keys sorted by int() must number
// exactly ceil(size / chunk_size). The completion POST carries no Authorization, so its href is signed.
function assertHfValid(o, size) {
  assert.equal(typeof o.oid, 'string');
  assert.equal(o.size, size);
  assert.equal(typeof o.actions.upload.href, 'string');
  assert.equal(typeof o.actions.verify.href, 'string');
  const h = o.actions.upload.header;
  if (h) {
    assert.equal(typeof h, 'object');
    const chunk = Number.parseInt(h.chunk_size, 10);
    const digits = Object.keys(h).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    assert.equal(digits.length, Math.ceil(size / chunk));
    for (const k of digits) assert.equal(typeof h[k], 'string');
  }
}
const ORIGIN = 'https://freeweights.allternit.com';
const expS = Math.floor(NOW.getTime() / 1000) + 3600;

test('LFS batch object: basic up to 64 MiB, a presigned PUT with the exact size', async () => {
  const o = await lfsUploadObject(R2, { oid: 'a'.repeat(64), size: BASIC_MAX_BYTES, uploadId: 'up_01', key: KEY, expS, origin: ORIGIN }, NOW);
  assertHfValid(o, BASIC_MAX_BYTES);
  assert.equal(o.actions.upload.header, undefined);
  const put = new URL(o.actions.upload.href);
  assert.equal(put.host, 'acc123.r2.cloudflarestorage.com');
  assert.equal(put.searchParams.get('X-Amz-SignedHeaders'), 'content-length;host');
  assert.equal(o.actions.upload.expires_in, 3600);
  const v = new URL(o.actions.verify.href);
  assert.equal(v.pathname, '/api/fw/v1/lfs/up_01/verify');
  assert.ok(await lfsActionOk(R2.secretAccessKey, 'verify', 'up_01', v.searchParams.get('exp'), v.searchParams.get('sig'), expS - 10));
});

test('LFS batch object: multipart above 64 MiB, signed completion href', async () => {
  const size = BASIC_MAX_BYTES + 1;
  const o = await lfsUploadObject(R2, { oid: 'b'.repeat(64), size, uploadId: 'up_02', key: KEY, expS, origin: ORIGIN, s3UploadId: 's3-up' }, NOW);
  assertHfValid(o, size);
  assert.equal(o.actions.upload.header.chunk_size, String(PART_BYTES));
  assert.equal(Object.keys(o.actions.upload.header).length, 1 + 3);
  const done = new URL(o.actions.upload.href);
  assert.equal(done.pathname, '/api/fw/v1/lfs/up_02/complete');
  const [e, s] = [done.searchParams.get('exp'), done.searchParams.get('sig')];
  assert.ok(await lfsActionOk(R2.secretAccessKey, 'complete', 'up_02', e, s, expS - 10));
  // The signature binds the step, the upload and the expiry, and runs out.
  assert.equal(await lfsActionOk(R2.secretAccessKey, 'verify', 'up_02', e, s, expS - 10), false);
  assert.equal(await lfsActionOk(R2.secretAccessKey, 'complete', 'up_03', e, s, expS - 10), false);
  assert.equal(await lfsActionOk(R2.secretAccessKey, 'complete', 'up_02', String(expS + 1), s, expS - 10), false);
  assert.equal(await lfsActionOk(R2.secretAccessKey, 'complete', 'up_02', e, s, expS + 1), false);
  assert.equal(await lfsActionOk('other-secret', 'complete', 'up_02', e, s, expS - 10), false);
});
