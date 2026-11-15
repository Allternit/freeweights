// CSP on pages the Worker proxies from Cloudflare Pages (PASSTHROUGH=1): a fake Pages origin answers HTML, CSS and
// a page that already has its own CSP; the Worker must add the shared policy to HTML only and never overwrite one.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSP } from '../../site/lib/csp.mjs';

const here = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.CSP_TEST_PORT || '8797', PAGES_PORT = Number(PORT) + 1;
const BASE = `http://127.0.0.1:${PORT}`;
let proc, pages;

before(async () => {
  pages = createServer((req, res) => {
    if (req.url.startsWith('/assets/')) { res.writeHead(200, { 'content-type': 'text/css' }); return res.end('body{}'); }
    const h = { 'content-type': 'text/html; charset=utf-8' };
    if (req.url.startsWith('/own/')) h['content-security-policy'] = "default-src 'none'";
    res.writeHead(200, h); res.end('<!doctype html><title>pages</title>');
  }).listen(PAGES_PORT);
  proc = spawn('npx', ['wrangler', 'dev', '--local', '--port', PORT, '--persist-to', mkdtempSync(join(tmpdir(), 'fw-csp-')),
    '--var', 'CHECK_MODE:offline', '--var', 'PASSTHROUGH:1', '--var', `PAGES_ORIGIN:http://127.0.0.1:${PAGES_PORT}`], { cwd: here, stdio: 'ignore' });
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(BASE + '/alt.freeweights/')).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('wrangler dev did not start');
});
after(() => { proc?.kill('SIGTERM'); pages?.close(); });

test('CSP: a Pages-proxied HTML page carries the shared policy and companion headers', async () => {
  const r = await fetch(BASE + '/alt.freeweights/');
  assert.equal(r.headers.get('content-security-policy'), CSP);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
});
test('CSP: non-HTML passthrough is untouched and an existing CSP is never overwritten', async () => {
  assert.equal((await fetch(BASE + '/assets/fw.css')).headers.get('content-security-policy'), null);
  assert.equal((await fetch(BASE + '/own/')).headers.get('content-security-policy'), "default-src 'none'");
});
