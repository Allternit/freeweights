// Pure check (no server): the shared CSP lets the site read plan perks and PUT upload parts, and nothing wider.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CSP } from '../../site/lib/csp.mjs';

const directive = (name) => CSP.split('; ').find((d) => d.startsWith(name + ' ')).split(' ').slice(1);

test('CSP connect-src names the billing API and R2 presigned hosts, and no wildcard host beyond R2', () => {
  const c = directive('connect-src');
  for (const h of ["'self'", 'https://clerk.allternit.com', 'https://api.allternit.com', 'https://*.r2.cloudflarestorage.com']) assert.ok(c.includes(h), h);
  assert.deepEqual(c.filter((x) => x.includes('*')), ['https://*.r2.cloudflarestorage.com']);
});
test('CSP script-src gains no new host', () => {
  assert.ok(!directive('script-src').some((x) => x.includes('allternit.com') && x !== 'https://clerk.allternit.com'));
});
