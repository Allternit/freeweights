// Pure rules for scans, promotion and the sweep (spec/accounts-v1.md 11.5-11.6). No D1, no R2: promote.ts,
// sweep.ts and routes/scan.ts do the I/O and ask these functions what to do, so the rules are tested alone.
// Only type imports, so `node --test` can load this file directly.
import type { RepoStatus, ScanFinding, ScanFindingCode, ScanResultBody, ScanStatus } from '../types';

/** The third claim that runs out (or the third error result) leaves the scan in 'error'. */
export const MAX_ATTEMPTS = 3;
export const CLAIM_MS = 30 * 60_000;
export const JOB_URL_S = 15 * 60;
export const HELD_KEEP_MS = 14 * 24 * 3600_000;
export const HEALTH_MS = 10 * 60_000;
/** Rows each part of one sweep may touch, so a poll stays inside the Worker's limits. */
export const SWEEP_BATCH = 25;

/** ISO 8601 UTC without milliseconds: the format the migrations' strftime defaults write, so text compares work. */
export const iso = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');

// ---- Result ----------------------------------------------------------------------------------------

const CODES: readonly ScanFindingCode[] = ['sha256_mismatch', 'blocklisted', 'bad_header', 'unsafe_pickle', 'malware', 'secret_found', 'scan_failed'];

/** Checks a result body. Returns the body or a message for 400 bad_request. */
export function parseResultBody(raw: unknown): ScanResultBody | string {
  if (!raw || typeof raw !== 'object') return 'Body must be a JSON object.';
  const b = raw as Record<string, unknown>;
  if (!Number.isInteger(b.attempt) || (b.attempt as number) < 1) return 'attempt must be the job attempt (integer >= 1).';
  if (b.status !== 'clean' && b.status !== 'held' && b.status !== 'error') return 'status must be clean, held or error.';
  if (typeof b.scanner_version !== 'string' || !b.scanner_version || b.scanner_version.length > 100) return 'scanner_version must be a string of 1-100 characters.';
  if (!Array.isArray(b.findings) || b.findings.length > 50) return 'findings must be an array of at most 50 items.';
  const findings: ScanFinding[] = [];
  for (const f of b.findings as unknown[]) {
    const o = f as Record<string, unknown>;
    if (!o || typeof o.scanner !== 'string' || !o.scanner || o.scanner.length > 100) return 'Each finding needs a scanner name.';
    if (!CODES.includes(o.code as ScanFindingCode)) return `Finding code must be one of ${CODES.join(', ')}.`;
    if (o.detail !== undefined && (typeof o.detail !== 'string' || o.detail.length > 2000)) return 'Finding detail must be a string of at most 2000 characters.';
    findings.push({ scanner: o.scanner, code: o.code as ScanFindingCode, ...(o.detail !== undefined ? { detail: o.detail as string } : {}) });
  }
  if (b.status === 'held' && !findings.length) return 'A held result needs at least one finding.';
  return { attempt: b.attempt as number, status: b.status, findings, scanner_version: b.scanner_version };
}

export interface ResultDecision { status: ScanStatus; findings: ScanFinding[]; promote: boolean }

/**
 * What a result does to a scan claimed under attempt `attempts`:
 * - a hash on blocked_hashes is held as `blocklisted` whatever the scanner said;
 * - any finding holds the file (a "clean" with findings is held);
 * - error goes back to queued until the third attempt, then stays error;
 * - only a clean scan promotes.
 */
export function decideResult(body: ScanResultBody, attempts: number, blocked: boolean): ResultDecision {
  const findings = [...body.findings];
  if (blocked) {
    if (!findings.some((f) => f.code === 'blocklisted')) findings.push({ scanner: 'worker', code: 'blocklisted' });
    return { status: 'held', findings, promote: false };
  }
  if (body.status === 'error') return { status: attempts >= MAX_ATTEMPTS ? 'error' : 'queued', findings, promote: false };
  if (findings.length || body.status === 'held') return { status: 'held', findings, promote: false };
  return { status: 'clean', findings: [], promote: true };
}

export type ClaimCheck = 'accept' | 'repeat' | 'not_claimed';

/**
 * Whether a result may be recorded. `accept`: claimed under this attempt and the claim has not run out.
 * `repeat`: this attempt's result is already recorded (sending it twice is harmless). Anything else is
 * 409 scan_not_claimed: an older attempt, or a claim that ran out (swept or not yet swept).
 */
export function checkClaim(scan: { status: ScanStatus; attempts: number; claimed_until: string | null; finished_at: string | null }, attempt: number, nowMs: number): ClaimCheck {
  if (attempt !== scan.attempts) return 'not_claimed';
  if (scan.status === 'scanning') return scan.claimed_until && Date.parse(scan.claimed_until) > nowMs ? 'accept' : 'not_claimed';
  return scan.finished_at ? 'repeat' : 'not_claimed';
}

// ---- Promotion ---------------------------------------------------------------------------------------

export interface PendingCommit {
  oid: string;
  parent_oid: string | null;
  statuses: ScanStatus[];
  /** sha256 of the held files this commit brought (needed only for a commit with a held scan). */
  heldShas?: string[];
  /** sha256 of every file in this commit's tree (needed only for a commit after a held one), null if unreadable. */
  treeShas?: string[] | null;
}

/**
 * Commits (oldest first, every commit after the head) that can become the head now, in order. The head moves
 * to a commit only when every scan in it is clean AND no file in its tree is a held file. Commits chain on
 * the tip (routes/commit.ts), so the fix for a held file is a commit on top of the held one: the held commit
 * is passed over (never served), and the fix is served once its own scans are clean and its tree no longer
 * carries any held sha256 (the clean files the held commit brought were promoted by their own clean scans).
 * A commit with a scan still queued, scanning or in error stops the walk (it waits; later commits wait too).
 * A commit with no scans (only deletions or re-used blobs) counts as clean.
 */
export function promotableChain(pending: PendingCommit[], head: string | null): string[] {
  const out: string[] = [];
  let prev = head;
  const held = new Set<string>();
  for (const c of pending) {
    if ((c.parent_oid ?? null) !== prev) break;
    if (c.statuses.some((s) => s === 'queued' || s === 'scanning' || s === 'error')) break;
    if (c.statuses.includes('held')) {
      if (!c.heldShas?.length) break; // which files are held is unknown: pass nothing over
      for (const h of c.heldShas) held.add(h);
      prev = c.oid;
      continue;
    }
    if (held.size) {
      if (!c.treeShas) break; // tree unreadable: cannot prove no held file is in it
      prev = c.oid;
      if (c.treeShas.some((x) => held.has(x))) continue; // still carries a held file: not served
    } else prev = c.oid;
    out.push(c.oid);
  }
  return out;
}

/**
 * The repo state from the scans of the commits still waiting after promotion. `removed` never changes here.
 * One held scan -> held (nothing of that commit is served; the head stays where it was). Anything not
 * served yet (scans queued, scanning, or error waiting for an admin) -> scanning. Nothing waiting -> live with a
 * head, else the state it had (draft).
 */
export function repoStatusFrom(current: RepoStatus, waiting: ScanStatus[][], hasHead: boolean): RepoStatus {
  if (current === 'removed') return 'removed';
  const all = waiting.flat();
  if (all.includes('held')) return 'held';
  if (waiting.length) return 'scanning'; // a commit still waits (scans not clean, or its parent is not served yet)
  if (hasHead) return 'live';
  return current;
}

// ---- Sweep -------------------------------------------------------------------------------------------

export interface SweepRows {
  uploads: { id: string; status: string; expires_at: string }[];
  claims: { id: string; status: string; attempts: number; claimed_until: string | null }[];
  held: { id: string; status: string; finished_at: string | null }[];
  /** Uploads of removed repos, with the repo's removed_reason. */
  removed?: { id: string; status: string; removed_reason: string | null }[];
}
export interface SweepPlan { expire: string[]; requeue: string[]; error: string[]; deleteHeld: string[]; purge: string[] }

/** removed_reason values whose files are deleted by the sweep. A takedown keeps its files for review and appeal. */
export const PURGE_REASONS: readonly string[] = ['owner', 'account_deleted'];
const COUNTED = new Set(['pending', 'uploaded', 'verified', 'committed']);

const UNCOMMITTED = new Set(['pending', 'uploaded', 'verified']);

/**
 * Which rows one sweep acts on (each list at most SWEEP_BATCH). The SQL in sweep.ts selects with the same
 * cutoffs; this re-checks each row so a row that changed state in between is left alone.
 * - an upload not committed whose expires_at (created + 1 hour) has passed expires;
 * - a scan whose claim ran out is re-queued, or set to error once it has used MAX_ATTEMPTS;
 * - a held scan finished more than 14 days ago has its quarantine copy deleted;
 * - an upload of a repo removed by its owner or by account deletion (not a takedown) is deleted and its bytes
 *   released, whatever bucket it is in.
 */
export function planSweep(nowMs: number, rows: SweepRows): SweepPlan {
  const before = (t: string | null, ms: number) => !!t && Date.parse(t) < ms;
  const expire = rows.uploads.filter((u) => UNCOMMITTED.has(u.status) && before(u.expires_at, nowMs)).slice(0, SWEEP_BATCH).map((u) => u.id);
  const ran = rows.claims.filter((c) => c.status === 'scanning' && before(c.claimed_until, nowMs)).slice(0, SWEEP_BATCH);
  const deleteHeld = rows.held.filter((h) => h.status === 'held' && before(h.finished_at, nowMs - HELD_KEEP_MS)).slice(0, SWEEP_BATCH).map((h) => h.id);
  return {
    expire,
    requeue: ran.filter((c) => c.attempts < MAX_ATTEMPTS).map((c) => c.id),
    error: ran.filter((c) => c.attempts >= MAX_ATTEMPTS).map((c) => c.id),
    deleteHeld,
    purge: (rows.removed ?? []).filter((u) => COUNTED.has(u.status) && PURGE_REASONS.includes(u.removed_reason ?? '')).slice(0, SWEEP_BATCH).map((u) => u.id),
  };
}

/** /scan/health and limits.scanning_delayed: the scanner polled less than 10 minutes ago. */
export const scannerOk = (lastPollAt: string | null, nowMs: number) => !!lastPollAt && nowMs - Date.parse(lastPollAt) < HEALTH_MS;

// ---- Trees -------------------------------------------------------------------------------------------

export interface TreeFile { path: string; size: number; sha256: string; lfs: boolean }

/** A commit tree file (a manifest `files` list, or an object holding one) -> its files, or null when malformed. */
export function parseTree(raw: unknown): TreeFile[] | null {
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' && Array.isArray((raw as { files?: unknown }).files) ? (raw as { files: unknown[] }).files : null;
  if (!list) return null;
  const out: TreeFile[] = [];
  for (const f of list) {
    const o = f as Record<string, unknown>;
    if (!o || typeof o.path !== 'string' || typeof o.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(o.sha256) || !Number.isInteger(o.size)) return null;
    out.push({ path: o.path, size: o.size as number, sha256: o.sha256, lfs: o.lfs === true });
  }
  return out;
}
