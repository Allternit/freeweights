// Report and removal vocabulary, pure so node --test can load it (spec/accounts-v1.md 11.7).

export const REPORT_TARGETS = ['user', 'org', 'repo', 'discussion', 'comment', 'post', 'collection', 'paper'] as const;
export const REPORT_REASONS = ['copyright', 'csam', 'real_person_likeness', 'crime_marketing', 'malware_or_secrets', 'license_violation', 'spam', 'abuse', 'other'] as const;
/** Reasons an admin may remove a repo for (a takedown class), a superset of REPORT_REASONS. */
export const REMOVE_REASONS = ['copyright', 'csam', 'ncii', 'personal_data', 'real_person_likeness', 'crime_marketing', 'malware_or_secrets', 'license_violation', 'publisher_request', 'spam', 'abuse', 'other'] as const;
/** removed_reason values that are not takedowns: resolve answers 404, not 451. */
export const QUIET_REMOVALS = ['owner', 'account_deleted'] as const;

/** 451 for a takedown class, 404 for an owner or account deletion. */
export const removalStatus = (removedReason: string | null): 451 | 404 => (removedReason && !(QUIET_REMOVALS as readonly string[]).includes(removedReason) ? 451 : 404);

export interface ReportInput { target_type: string; target_id: string; reason_class: string; body: string | null }

/** Returns the clean report, or a plain-language reason it is malformed. */
export function validateReport(b: unknown): { ok: ReportInput } | { problem: string } {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { problem: 'Send a JSON object.' };
  const o = b as Record<string, unknown>;
  const t = o.target as Record<string, unknown> | undefined;
  if (!t || typeof t !== 'object' || typeof t.type !== 'string' || !(REPORT_TARGETS as readonly string[]).includes(t.type)) return { problem: `target.type must be one of ${REPORT_TARGETS.join(', ')}.` };
  if (typeof t.id !== 'string' || !t.id.trim() || t.id.trim().length > 200) return { problem: 'target.id must be a string of 1 to 200 characters.' };
  if (typeof o.reason_class !== 'string' || !(REPORT_REASONS as readonly string[]).includes(o.reason_class)) return { problem: `reason_class must be one of ${REPORT_REASONS.join(', ')}.` };
  let body: string | null = null;
  if (o.body !== undefined && o.body !== null) {
    if (typeof o.body !== 'string' || o.body.length > 5000) return { problem: 'body must be a string of at most 5000 characters.' };
    body = o.body.trim() || null;
  }
  return { ok: { target_type: t.type, target_id: t.id.trim(), reason_class: o.reason_class, body } };
}

/** Reports a person may file in a rolling day. `limit` null = the key is unset (no per-day cap beyond the request rate). */
export function reportsAllowed(filedLast24h: number, limit: number | null): boolean {
  return limit === null || filedLast24h < limit;
}

// ---- Restore ----------------------------------------------------------------------------------------------

/** The status a removed repo returns to: held if any head scan is held or errored, scanning if any is still open, else live. */
export function restoreStatus(headCommit: string | null, headScans: readonly string[]): 'draft' | 'live' | 'held' | 'scanning' {
  if (!headCommit) return 'draft';
  if (headScans.some((s) => s === 'held' || s === 'error')) return 'held';
  if (headScans.some((s) => s === 'queued' || s === 'scanning')) return 'scanning';
  return 'live';
}

// ---- Limits -----------------------------------------------------------------------------------------------

export const CAP_KEYS = ['site_cap_bytes', 'user_cap_bytes', 'file_max_bytes', 'repos_per_user', 'repo_creates_per_day', 'commits_per_hour', 'files_per_commit'] as const;
/** Every key the admin route accepts: the contract keys plus reports_per_day. A typo is refused, never stored. */
export const LIMIT_KEYS = ['uploads_open', ...CAP_KEYS, 'reports_per_day'] as const;
export const SCAN_LATE_MS = 10 * 60_000;

/** Body of GET /api/fw/v1/limits (spec Limits): `open` needs uploads_open = 1 and every cap key set. */
export function limitsView(rows: Record<string, number>, siteBytes: number, lastPollAt: string | null, nowMs = Date.now()) {
  const cap = (k: string) => (typeof rows[k] === 'number' ? rows[k] : null);
  const limits = Object.fromEntries(CAP_KEYS.map((k) => [k, cap(k)]));
  const site = cap('site_cap_bytes');
  const polled = lastPollAt ? Date.parse(lastPollAt) : NaN;
  return {
    open: rows.uploads_open === 1 && CAP_KEYS.every((k) => cap(k) !== null),
    limits,
    site: { used_bytes: siteBytes, cap_bytes: site, full: site === null || siteBytes >= site },
    scanning_delayed: !(Number.isFinite(polled) && nowMs - polled < SCAN_LATE_MS),
  };
}

// ---- Usage reconcile --------------------------------------------------------------------------------------

export interface Usage { public_bytes: number; private_bytes: number; quarantine_bytes: number; repos: number }
export const ZERO_USAGE: Usage = { public_bytes: 0, private_bytes: 0, quarantine_bytes: 0, repos: 0 };
const same = (a: Usage, b: Usage) => a.public_bytes === b.public_bytes && a.private_bytes === b.private_bytes && a.quarantine_bytes === b.quarantine_bytes && a.repos === b.repos;

/** Owners whose stored row differs from the recomputed one (a missing row counts as zeros), and the recomputed site total. */
export function diffUsage(computed: Map<string, Usage>, stored: Map<string, Usage>) {
  const changes: { user_id: string; usage: Usage }[] = [];
  for (const id of new Set([...computed.keys(), ...stored.keys()])) {
    const want = computed.get(id) ?? ZERO_USAGE;
    if (!same(want, stored.get(id) ?? ZERO_USAGE)) changes.push({ user_id: id, usage: want });
  }
  let site = 0;
  for (const u of computed.values()) site += u.public_bytes + u.private_bytes + u.quarantine_bytes;
  return { changes, site };
}
