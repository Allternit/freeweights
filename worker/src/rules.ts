// Pure rules with no imports, so the tests can load this file directly with Node.

// ---- Download counting --------------------------------------------------------------------------
// One download is counted per entry download, not per file. A full repo download fetches every file,
// and counting each one cost one D1 write per file (a 156-file repo = 156 writes). Each counted
// download now costs two writes (the per-day row and the running total), once per entry download:
//   - repos with .gguf files: each .gguf GET counts, except split shards after the first
//     (people pick one quant, so each quant pull is one download);
//   - else the root config.json, else the root model_index.json (every library load fetches it once);
//   - else the largest file.
export interface CountFile { path: string; size: number }

const laterShard = (p: string) => {
  const m = p.match(/-(\d+)-of-\d+\.gguf$/);
  return !!m && Number(m[1]) > 1;
};

export function countRule(files: CountFile[]): (path: string) => boolean {
  if (files.some((f) => f.path.endsWith('.gguf'))) return (p) => p.endsWith('.gguf') && !laterShard(p);
  const anchor = ['config.json', 'model_index.json'].find((a) => files.some((f) => f.path === a))
    ?? [...files].sort((a, b) => b.size - a.size || a.path.localeCompare(b.path))[0]?.path;
  return (p) => p === anchor;
}

// ---- Pause at the daily cap -----------------------------------------------------------------------
// On the free plan D1 refuses queries after the daily row read or write limit, until 00:00 UTC
// ("Your account has reached its daily D1 Free tier row read limit."). The API then pauses with a
// public note; the site, the manifests and the source URLs in them do not use D1 and stay up.
const CAP_RE = /daily[^.]*\blimit|free tier[^.]*\blimit/i;

export function isDailyCapError(e: unknown): boolean {
  const parts: string[] = [];
  for (let x: unknown = e, i = 0; x && i < 3; i++) {
    parts.push(x instanceof Error ? x.message : String(x));
    x = x instanceof Error ? (x as Error & { cause?: unknown }).cause : null;
  }
  return CAP_RE.test(parts.join(' '));
}

export const nextUtcMidnight = (now: number) => {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
};

export function pausedBody(now: number) {
  const until = nextUtcMidnight(now);
  return {
    body: {
      error: 'api_paused_daily_cap',
      message: 'The Freeweights API is paused until 00:00 UTC because a daily free-tier limit was reached. '
        + 'The site, the manifests (/manifests/{org}/{repo}.json) and the source URLs listed in them stay up.',
      resumes_at: new Date(until).toISOString(),
    },
    retryAfter: Math.max(1, Math.ceil((until - now) / 1000)),
  };
}
