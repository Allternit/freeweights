// Scanner API (spec/accounts-v1.md 11.4-11.5, spec/parts/write-api.yaml "scanner"). The scanner on
// allternit-standby signs each request with SCANNER_SECRET and holds no R2 or Cloudflare credential: every
// job carries a presigned GET on its quarantine object.
//   POST /api/fw/v1/scan/claim         heartbeat, sweep, then claim up to `max` queued scans
//   POST /api/fw/v1/scan/{id}/result   record one result; clean files are promoted
//   GET  /api/fw/v1/scan/health        200 while the last poll is under 10 minutes old, else 503 (public)
import type { Env, ScanClaimReply, ScanFinding, ScanHealthReply, ScanJob, ScanResultReply, ScanStatus } from '../types';
import { authErr, authJson, json } from '../http';
import { d1 } from '../pause';
import type { Handler } from '../router';
import { requireSigned } from '../auth/hmac';
import { r2Creds, r2Presign } from '../storage/presign';
import { blobKey, promoteBlob, settleRepo } from '../storage/promote';
import { runSweep } from '../storage/sweep';
import { CLAIM_MS, JOB_URL_S, checkClaim, decideResult, iso, parseResultBody, scannerOk } from '../storage/scan-state';

const notConfigured = () => authErr(503, 'accounts_not_configured', 'Scanning is not turned on for this deployment.');
const ready = (env: Env) => !!(env.ACC && env.QUARANTINE && env.SCANNER_SECRET && r2Creds(env));

/** Signature check shared by claim and result. Returns the body text or the error reply. */
async function signed(req: Request, env: Env): Promise<string | Response> {
  if (!ready(env)) return notConfigured();
  const s = await requireSigned(req, env.SCANNER_SECRET);
  return s instanceof Response ? s : s.body;
}
const parseJson = (t: string): unknown => { try { return JSON.parse(t); } catch { return undefined; } };

// ---- claim ---------------------------------------------------------------------------------------------

async function claim(env: Env, body: string): Promise<Response> {
  const b = parseJson(body) as { scanner_version?: unknown; max?: unknown } | undefined;
  if (!b || typeof b !== 'object' || typeof b.scanner_version !== 'string' || !b.scanner_version || b.scanner_version.length > 100) {
    return authErr(400, 'bad_request', 'Send {"scanner_version": "<1-100 characters>", "max": 1-10}.');
  }
  const max = b.max === undefined ? 1 : b.max;
  if (!Number.isInteger(max) || (max as number) < 1 || (max as number) > 10) return authErr(400, 'bad_request', 'max must be an integer from 1 to 10.');
  const db = env.ACC!;
  const nowMs = Date.now();
  const now = iso(nowMs);

  await db.prepare(`UPDATE scanner_state SET last_poll_at = ?, scanner_version = ?, updated_at = ? WHERE id = 1`).bind(now, b.scanner_version, now).run();
  const sweep = await runSweep(env, nowMs);
  await db.prepare(`UPDATE scanner_state SET last_sweep_at = ?, last_sweep = ?, updated_at = ? WHERE id = 1`).bind(now, JSON.stringify(sweep), now).run();

  // One statement, so two pollers can never claim the same scan.
  const until = iso(nowMs + CLAIM_MS);
  const rows = (await db.prepare(`UPDATE scans SET status = 'scanning', attempts = attempts + 1, claimed_until = ?1, started_at = ?2,
      finished_at = NULL, updated_at = ?2
    WHERE id IN (SELECT s.id FROM scans s JOIN repos r ON r.id = s.repo_id
      WHERE s.status = 'queued' AND r.status <> 'removed' ORDER BY s.created_at, s.id LIMIT ?3)
    RETURNING id, repo_id, commit_oid, path, sha256, file_class, attempts`).bind(until, now, max)
    .all<{ id: string; repo_id: string; commit_oid: string | null; path: string; sha256: string; file_class: ScanJob['file_class']; attempts: number }>()).results;

  const jobs: ScanJob[] = [];
  const urlExpires = iso(nowMs + JOB_URL_S * 1000);
  for (const r of rows) {
    const key = blobKey(r.repo_id, r.sha256);
    const head = await env.QUARANTINE!.head(key);
    if (!head) { // nothing to scan: the same bytes were promoted already, or the object is gone
      await finishWithoutScan(env, r.id, r.attempts, r.repo_id, !!(await env.FW.head(key)));
      continue;
    }
    jobs.push({
      id: r.id, repo_id: r.repo_id, commit_oid: r.commit_oid, path: r.path, sha256: r.sha256, size: head.size,
      file_class: r.file_class, attempt: r.attempts, url: await r2Presign(r2Creds(env)!, { method: 'GET', bucket: 'quarantine', key, expiresS: JOB_URL_S, now: new Date(nowMs) }),
      url_expires_at: urlExpires, claimed_until: until,
    });
  }
  return authJson({ jobs, sweep } satisfies ScanClaimReply);
}

/**
 * A claimed scan whose quarantine object is missing. Present in FW: the same bytes in this repo were already
 * scanned clean and promoted (two paths, one blob), so this scan is clean too. Missing everywhere: error,
 * held for an admin (retrying cannot bring the object back).
 */
async function finishWithoutScan(env: Env, id: string, attempts: number, repoId: string, promoted: boolean) {
  const now = iso(Date.now());
  const findings: ScanFinding[] = promoted ? [] : [{ scanner: 'worker', code: 'scan_failed', detail: 'quarantine object missing' }];
  await env.ACC!.prepare(`UPDATE scans SET status = ?, findings = ?, finished_at = ?, claimed_until = NULL, updated_at = ?
    WHERE id = ? AND status = 'scanning' AND attempts = ?`).bind(promoted ? 'clean' : 'error', JSON.stringify(findings), now, now, id, attempts).run();
  await settleRepo(env, repoId);
}

// ---- result --------------------------------------------------------------------------------------------

interface ScanState { id: string; repo_id: string; sha256: string; status: ScanStatus; attempts: number; claimed_until: string | null; finished_at: string | null }

async function result(env: Env, id: string, body: string): Promise<Response> {
  const parsed = parseResultBody(parseJson(body));
  if (typeof parsed === 'string') return authErr(400, 'bad_request', parsed);
  const db = env.ACC!;
  const scan = await db.prepare(`SELECT id, repo_id, sha256, status, attempts, claimed_until, finished_at FROM scans WHERE id = ?`).bind(id).first<ScanState>();
  if (!scan) return authErr(404, 'scan_not_found', `No scan ${id}.`);

  const nowMs = Date.now();
  const check = checkClaim(scan, parsed.attempt, nowMs);
  if (check === 'not_claimed') return authErr(409, 'scan_not_claimed', 'This scan is not claimed under that attempt (the claim ran out or a newer claim exists). Claim it again.');
  if (check === 'repeat') return reply(env, scan.id, scan.status, await settleRepo(env, scan.repo_id));

  const blocked = !!(await db.prepare(`SELECT 1 FROM blocked_hashes WHERE sha256 = ?`).bind(scan.sha256).first());
  const d = decideResult(parsed, scan.attempts, blocked);
  let status = d.status;
  let findings = d.findings;
  if (d.promote && (await promoteBlob(env, scan.repo_id, scan.sha256, scan.id)) === 'missing') {
    status = 'error';
    findings = [{ scanner: 'worker', code: 'scan_failed', detail: 'quarantine object missing at promotion' }];
  }
  const now = iso(nowMs);
  await db.prepare(`UPDATE scans SET status = ?, findings = ?, scanner_version = ?, finished_at = ?, claimed_until = NULL, updated_at = ?
    WHERE id = ? AND status = 'scanning' AND attempts = ?`)
    .bind(status, JSON.stringify(findings), parsed.scanner_version, now, now, scan.id, scan.attempts).run();
  return reply(env, scan.id, status, await settleRepo(env, scan.repo_id));
}

const reply = (_env: Env, id: string, status: ScanStatus, repo_status: ScanResultReply['repo_status']) =>
  authJson({ id, status, repo_status } satisfies ScanResultReply);

// ---- health --------------------------------------------------------------------------------------------

async function health(env: Env): Promise<Response> {
  const nostore = { 'cache-control': 'no-store' };
  if (!env.ACC) return json({ ok: false, last_poll_at: null, queued: 0, oldest_queued_at: null } satisfies ScanHealthReply, 503, nostore);
  const [st, q] = await env.ACC.batch([
    env.ACC.prepare(`SELECT last_poll_at FROM scanner_state WHERE id = 1`),
    env.ACC.prepare(`SELECT COUNT(*) AS n, MIN(s.created_at) AS oldest FROM scans s JOIN repos r ON r.id = s.repo_id WHERE s.status IN ('queued', 'scanning') AND r.status <> 'removed'`),
  ]);
  const last = (st.results[0] as { last_poll_at: string | null } | undefined)?.last_poll_at ?? null;
  const qq = q.results[0] as { n: number; oldest: string | null } | undefined;
  const ok = scannerOk(last, Date.now());
  return json({ ok, last_poll_at: last, queued: qq?.n ?? 0, oldest_queued_at: qq?.oldest ?? null } satisfies ScanHealthReply, ok ? 200 : 503, nostore);
}

// ---- handlers ------------------------------------------------------------------------------------------

export const scanClaimRoute: Handler = async ({ req, env }) => {
  const body = await signed(req, env);
  if (body instanceof Response) return body;
  return d1(() => claim(env, body));
};
export const scanResultRoute: Handler = async ({ req, env }, m) => {
  const body = await signed(req, env);
  if (body instanceof Response) return body;
  const id = m[1];
  if (!/^sc_[0-9A-Za-z]+$/.test(id)) return authErr(404, 'scan_not_found', 'No such scan.');
  return d1(() => result(env, id, body));
};
export const scanHealthRoute: Handler = ({ env }) => d1(() => health(env));
