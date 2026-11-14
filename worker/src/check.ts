import type { Env, Manifest, ManifestFile, ManifestSource } from './types';
import { effective, getStates, putState, takeHfSlot, isPaidOrigin, type StoredState } from './db';

export const PER_SOURCE_MS = 1500;
export const TOTAL_MS = 3000;

export const stateKey = (m: Manifest, s: ManifestSource, path: string) => `${m.id}|${s.type}|${s.priority}|${path}`;

export function sourceUrl(s: ManifestSource, path: string): string | null {
  if (!s.url) return null; // magnet-only: nothing to redirect to
  const enc = path.split('/').map(encodeURIComponent).join('/');
  return s.url.includes('{path}') ? s.url.replace('{path}', enc) : s.url.replace(/\/?$/, '/') + enc;
}

async function head(url: string, ms: number): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, { method: 'HEAD', redirect: 'manual', signal: ac.signal }); }
  finally { clearTimeout(t); }
}

type Result = { state: 'live' | 'failed'; reason: string | null } | { state: 'timeout' };

/** HEAD a source and compare size (and commit when the host reports it) with the manifest. */
async function probe(m: Manifest, s: ManifestSource, f: ManifestFile, ms: number): Promise<Result> {
  const url = sourceUrl(s, f.path);
  if (!url) return { state: 'failed', reason: 'magnet_only' };
  try {
    let r = await head(url, ms);
    let size: number | null = null;
    if (r.status >= 300 && r.status < 400) {
      const lk = r.headers.get('x-linked-size');
      const commit = r.headers.get('x-repo-commit');
      if (commit && s.type === 'source' && commit !== m.upstream.commit) return { state: 'failed', reason: 'commit_changed' };
      if (lk) size = Number(lk);
      else {
        const loc = r.headers.get('location');
        if (!loc) return { state: 'failed', reason: 'redirect_without_location' };
        r = await head(new URL(loc, url).toString(), ms);
      }
    }
    if (size === null) {
      if (r.status === 404 || r.status === 410 || r.status === 451) return { state: 'failed', reason: `http_${r.status}` };
      if (r.status < 200 || r.status >= 300) return { state: 'failed', reason: `http_${r.status}` };
      const cl = r.headers.get('content-length');
      if (cl === null) return { state: 'live', reason: 'size_unreported' };
      size = Number(cl);
    }
    return size === f.size ? { state: 'live', reason: null } : { state: 'failed', reason: `size_mismatch:${size}` };
  } catch (e) {
    return (e as Error).name === 'AbortError' ? { state: 'timeout' } : { state: 'failed', reason: 'fetch_error' };
  }
}

export interface Resolved {
  source?: ManifestSource;
  url?: string;
  outcome: 'ok' | 'wanted' | 'timeout';
}

/** Check-on-read (plan F4). First live source in priority order wins. */
export async function pickSource(env: Env, m: Manifest, f: ManifestFile, guardOn: boolean): Promise<Resolved> {
  const offline = env.CHECK_MODE === 'offline';
  const deadline = Date.now() + TOTAL_MS;
  const cands = [...m.sources].sort((a, b) => a.priority - b.priority).filter((s) => {
    if (!s.url) return false;                               // magnets cannot be a 302 target
    if (guardOn && s.type === 'hosted' && isPaidOrigin(env, s.url)) return false;
    return true;
  });
  const states = await getStates(env, cands.map((s) => stateKey(m, s, f.path)));
  let timedOut = false;
  for (const s of cands) {
    const key = stateKey(m, s, f.path);
    const url = sourceUrl(s, f.path)!;
    const stored: StoredState | undefined = states.get(key);
    let st = effective(stored, env);
    if (st === 'stale' && !offline) {
      const left = deadline - Date.now();
      if (left <= 0) { timedOut = true; continue; }
      const isHf = new URL(url).hostname.endsWith('huggingface.co');
      if (isHf && !(await takeHfSlot(env))) {
        // HF budget used: keep the last known answer; with none, serve unverified rather than hit HF.
        st = stored && stored.state === 'failed' ? 'failed' : 'live';
      } else {
        const r = await probe(m, s, f, Math.min(PER_SOURCE_MS, left));
        if (r.state === 'timeout') { timedOut = true; continue; }
        st = r.state;
        await putState(env, key, r.state, r.reason);
      }
    } else if (st === 'stale' && offline) st = 'live';
    if (st === 'live') return { source: s, url, outcome: 'ok' };
  }
  return { outcome: timedOut ? 'timeout' : 'wanted' };
}
