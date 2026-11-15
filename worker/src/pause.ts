import type { Env } from './types';
import { isDailyCapError, pausedBody } from './rules';
import { json } from './http';

// ---- Pause at the daily cap -------------------------------------------------------------------
// After a D1 daily-limit error this isolate answers D1-backed routes with 503 until 00:00 UTC
// without trying D1 again. Catalog, manifests, tree and the Xet token pass do not use D1 and stay up.
let pausedUntil = 0;
const pause = () => {
  const now = Date.now();
  const { body, retryAfter } = pausedBody(now);
  pausedUntil = Date.parse(body.resumes_at);
  return json(body, 503, { 'retry-after': String(retryAfter), 'cache-control': 'no-store' });
};
export const notePause = (e: unknown) => { if (isDailyCapError(e)) pause(); else throw e; }; // for waitUntil work
export const d1 = async (run: () => Promise<Response>): Promise<Response> => {
  if (Date.now() < pausedUntil) return pause();
  try { return await run(); } catch (e) { if (isDailyCapError(e)) return pause(); throw e; }
};
