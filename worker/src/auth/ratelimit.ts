import type { Caller } from '../types';
import { authErr } from '../http';

// Signed-in request limit (spec/accounts-v1.md section 10): requests per account per 5-minute window, where
// the number is the claim perk `api_requests_5m`. Freeweights holds no limit value of its own: with no claim
// yet (a session on a route that needs no plan) or no such perk, nothing is counted here and only the
// platform's own limits apply. Counting is per isolate, so it is a soft cap, not an exact global count.
// Anonymous limits are unchanged and do not pass through this file.

export const RATE_PERK = 'api_requests_5m';
export const WINDOW_S = 300;
const MAX_KEYS = 10_000;
const windows = new Map<string, { start: number; n: number }>(); // account id -> current window

/** Counts one request. Returns a 429 reply when the account is over its limit, else null. */
export function checkRate(caller: Caller, nowS = Math.floor(Date.now() / 1000)): Response | null {
  const limit = caller.claim?.perks?.[RATE_PERK];
  if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) return null;
  const start = nowS - (nowS % WINDOW_S);
  let w = windows.get(caller.userId);
  if (!w || w.start !== start) {
    w = { start, n: 0 };
    windows.delete(caller.userId);
    windows.set(caller.userId, w);
    if (windows.size > MAX_KEYS) windows.delete(windows.keys().next().value!);
  }
  w.n += 1;
  if (w.n <= limit) return null;
  return authErr(429, 'rate_limited', 'Too many requests for this account. Try again after the window resets.', { 'retry-after': String(start + WINDOW_S - nowS) });
}
