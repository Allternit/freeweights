import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { KEY_ID, ROOT } from './env.mjs';
import { exists, rd, readJSON } from './util.mjs';

export const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',')}}` : JSON.stringify(v));
export const CHAIN = (() => { const f = path.join(ROOT, 'ledger/chain.jsonl'); if (!exists(f)) return []; try { return rd(f).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)); } catch (e) { console.warn('ledger/chain.jsonl unreadable:', e.message); return []; } })();
export const HEAD = (() => { const f = path.join(ROOT, 'ledger/head.json'); try { return exists(f) ? readJSON(f) : null; } catch (e) { return null; } })();
export const CHAIN_CHECK = (() => {
  let prev = '0'.repeat(64); let ok = 0;
  for (const [i, e] of CHAIN.entries()) { const { entry_hash, ...rest } = e; const h = crypto.createHash('sha256').update(canon(rest), 'utf8').digest('hex'); if (e.seq !== i + 1 || e.prev_hash !== prev || h !== entry_hash) return { ok, bad: i + 1 }; ok++; prev = entry_hash; }
  return { ok, bad: null, last: prev, headMatch: !!(HEAD && HEAD.entry_hash === prev && HEAD.seq === CHAIN.length) };
})();
export const HEAD_SIG = (() => {
  const h = path.join(ROOT, 'ledger/head.json'); const sig = h + '.minisig'; const pub = path.join(ROOT, 'spec/keys/freeweights-v0.pub');
  if (!exists(h) || !exists(sig)) return { state: 'missing', text: 'No signed head yet.' };
  try { execFileSync('minisign', ['-V', '-m', h, '-x', sig, '-p', pub], { stdio: 'pipe' }); return { state: 'ok', text: `Signature checked when this page was built: valid, key ${KEY_ID}.` }; }
  catch (e) { if (e.code === 'ENOENT') return { state: 'unchecked', text: 'Signature file present. minisign was not installed on the build machine, so check it yourself below.' }; return { state: 'bad', text: 'Signature check FAILED when this page was built. Do not trust this head until it is re-signed.' }; }
})();
export const short = (h) => (h ? `${h.slice(0, 8)}…${h.slice(-4)}` : '');
