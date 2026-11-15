# Freeweights Worker (Stage 0)

Cloudflare Worker + D1 implementing the read part of `../spec/hub-api.yaml`. Deployed as `freeweights-worker` (Gate G0, 2026-11-14).

## Run locally

```sh
cd worker
npm install
npm run build:data                       # bundles ../catalog/catalog.json + a hosted-id map into src/data.generated.ts
npx wrangler d1 execute freeweights --local --file=schema.sql
npx wrangler dev --local                 # http://127.0.0.1:8787  (wrangler dev also runs build:data)
```

```sh
curl -sI http://127.0.0.1:8787/BAAI/bge-small-en-v1.5/resolve/main/model.safetensors
curl -s  'http://127.0.0.1:8787/api/models?search=bge'
curl -sI -H 'Authorization: Bearer hf_x' http://127.0.0.1:8787/api/models      # 401
```

Tests (start their own `wrangler dev` in offline check mode with a temp D1; port 8799, or set `TEST_PORT`): `npm test`.

## Schema and migrations

`schema.sql` is the full current schema for a fresh database. An existing database gets the numbered files in
`migrations/` in order; each one is additive and safe to run more than once. Live database, after review:

```sh
npx wrangler@4.160.0 d1 execute freeweights --remote --file=migrations/0002_download_totals.sql
npx wrangler@4.160.0 d1 execute freeweights --remote --file=migrations/0003_takedowns.sql
```

`0003_takedowns.sql` adds the `takedowns` table (kind, entry_id, reason_class, at). Apply it before deploying the
Worker that reads it. The Worker tolerates a missing table (it treats it as no takedowns), so the order only
matters for when takedowns start to apply. Deploy order: migration, then Worker, then site.

`0002_download_totals.sql` backfills totals by setting them from the per-day rows, so run it again once after
the Worker that writes `download_totals` is deployed: that picks up downloads the old Worker counted in between.
Typecheck: `npm run typecheck`.
Stats (download totals, top entries, takedown count): `python3 ../scripts/fw_admin.py stats --local` (add `--persist-to <dir>` for a test database) or `--remote` (read-only queries against the live database; with neither flag the commands are printed).

## Behavior

- **Routes**: `/api/models`, `/api/models/{org}/{repo}` (also `/revision/{rev}`), `/api/models/{org}/{repo}/tree/{rev}`, `GET|HEAD /{org}/{repo}/resolve/{rev}/{path}`, `/api/catalog`, `/manifests/{org}/{repo}.json[.minisig]` (exact stored bytes).
- **Resolve**: 302 to the first live source in priority order, with `X-Repo-Commit`, `ETag`, `X-Linked-Size`/`X-Linked-Etag` (LFS files), and `Content-Length` on HEAD. HEAD does not count a download. Magnet-only sources are not redirect targets.
- **Check on read (F4)**: a stale source gets a HEAD, 1500 ms each and 3000 ms total; size must equal the manifest. Results go to D1 (`source_state`) and are reused for `FRESH_MS` (10 min; failed results for 2 min). Timeout gives 503 with `Retry-After`; all sources failed gives 404 `model_wanted`.
- **Hugging Face limit**: checks against `huggingface.co` take a slot from a D1 5-minute window (`HF_CHECK_CAP`, default 2000, under the 3,000 anonymous / 5,000 free-user resolver limits). Over the cap, the last known state is used and HF is not contacted.
- **Origin guard (F11, stub)**: `ORIGIN_BUDGET_BYTES` (0 = off) vs a monthly D1 counter of file bytes redirected to hosts in `PAID_ORIGIN_HOSTS`. When used, those hosted sources are skipped, `X-Freeweights-Origin-Guard: on` is set, and seeded sources list first in model detail.
- **Counts**: one count per entry download, not per file (`src/rules.ts`): each `.gguf` GET in a GGUF repo (split shards after the first do not count), else the root `config.json`, else the root `model_index.json`, else the largest file. A count writes the per-day row in `downloads` and the running total in `download_totals` in one batch. Search and detail read `download_totals` (one row per entry; only the page's rows unless sorting by downloads) and never aggregate `downloads`. No IP, user agent or token is stored.
- **Daily cap pause**: when D1 refuses a query because a free daily limit is used, search, detail and resolve reply 503 `api_paused_daily_cap` with `Retry-After` and `resumes_at` (next 00:00 UTC); the isolate stops calling D1 until then. Catalog, manifests, tree and the Xet token pass do not use D1 and stay up; the site is served by Pages.
- **Takedowns (B9)**: `scripts/fw_admin.py takedown <id> --reason <class> --apply` writes a row to D1 `takedowns`, then deletes the entry's R2 copies and purges their URLs (step 1b; see Cloud Connector below). The Worker reads the whole table at most once per 60 s per isolate (`TAKEDOWN_TTL_MS`, one row per takedown) and answers 451 `removed_after_takedown` (no-store) on the entry's API detail, tree, Xet token, resolve (GET and HEAD), manifest, signature and detail page, checked before any R2 read or edge-cache hit, and leaves it out of search. No redeploy needed. A failed read (table missing, daily cap) keeps the last known set and never fails the route. `/api/catalog` is bundled and drops the row at the next deploy; `sync_r2.py --delete` removes the R2 page and manifest after the site rebuild. The check is by id across kinds (routes do not carry the kind yet).
- **Auth**: any `hf_` token (Authorization, `X-HF-Token`, or a token query parameter) gives 401 `hf_token_rejected`; only the fact is counted. On public reads an `alt_` key or Clerk token is ignored (served as anonymous). Auth routes (`/api/whoami-v2` and the write API in `spec/parts/write-api.yaml`) verify a Clerk session JWT in the Worker (`src/auth/clerk.ts`) or an `alt_` key through the signed entitlement claim from cloud-api (`src/auth/entitlement.ts`); see `spec/accounts-v1.md`. Routes declare their methods; others get 405 with `Allow`. Tests: `test/auth.test.mjs`.
- **Free-tier fit**: D1 writes (100k/day) happen on a counted download (2 rows, once per entry download instead of 1 per file), a check, or a rejected token. D1 reads (5M/day): search reads one `download_totals` row per page entry (all entries only for `sort=downloads`), detail reads one; the takedown set adds one row per takedown per isolate per minute. CPU per request is JSON filtering and one D1 read; keep it under the 10 ms Workers Free limit (measure before deploy).
- **Data**: the catalog is bundled at build time with a small map of hosted ids to pinned commits (about 3.5 MiB raw, 0.26 MiB gzip at 3,761 rows; about 1 KB raw per row, so roughly 10 MiB at 10,000 rows). Manifests and signatures are NOT bundled (B3): the Worker reads `manifests/<org>/<repo>.json[.minisig]` from the R2 bucket `freeweights` (binding `FW`) and keeps the last 512 parsed manifests per isolate, so the bundle does not grow with manifests. Past about 25,000 rows the bundled catalog should move to D1 entries with FTS5 search (B2). `CHECK_MODE=offline` trusts the manifest (tests only).
- **R2 objects (B4, B5, B6)**: `cd site && node build.mjs` writes model and tool detail pages plus manifests to `site/r2/` (keys = URL paths); `python3 scripts/sync_r2.py` uploads only changed files (MD5 against the bucket listing; safe to re-run; `--delete` removes objects the tree no longer has). The Worker serves `/manifests/...` and `/<section>/<org>/<repo>/` from R2 with a 5-minute edge cache and ETag/304; a bare `/<section>/<org>/<repo>` gets a 301 to the slash URL; anything not in R2 (section list pages, docs) passes through to Pages. `scripts/cf_static_routes.sh` keeps no-Worker routes for the other static prefixes; the two for `/manifests/*` and `/alt.freeweights*` are added or removed only by the Cloud Connector switch below.
- **Preview**: `wrangler versions upload --var PAGES_ORIGIN:https://<branch>.allternit-freeweights.pages.dev` gives a preview URL that serves the whole site (Pages paths pass through to that Pages preview); then `python3 ../scripts/b0_check.py <preview URL>`.

## Cloud Connector (static paths without the Worker)

Manifests, signatures and model/tool detail pages can be served straight from the R2 bucket by Cloudflare Cloud
Connector, so those requests cost no Worker request. The Worker stays deployed and is the fallback: one command
switches the paths over, one switches them back. Both scripts print every API call and rule body and send nothing
unless `--apply` is given.

```sh
scripts/cf_cloud_connector.sh                     # dry run: rules + the Worker-route switch
scripts/cf_cloud_connector.sh --apply             # rules first, then cf_static_routes.sh --connector-on
B0_STATIC=connector python3 scripts/b0_check.py https://freeweights.allternit.com
scripts/cf_cloud_connector.sh --rollback --apply  # cf_static_routes.sh --connector-off first, then remove the rules
```

What it creates (each ruleset rule has a `ref` starting `fw_cc_`, the connector rule a description starting
`freeweights-cc:`; `--rollback` removes exactly those): a URL rewrite from `/<section>/<org>/<repo>/` to the R2 key
`…/index.html`; a 301 from the bare `…/<repo>` to `…/<repo>/` that keeps the query string; response-header rules
that set the CSP and security headers built by `site/lib/csp.mjs` (read at run time, never copied) plus CORS; a
cache rule (5 minutes, as the Worker); and the Cloud Connector rule (provider Cloudflare R2) for `/manifests/*` and
the detail-page keys. Section list pages (`/<section>/page/<n>/`) are excluded and keep going to Pages.
`--rules-only` leaves the Worker routes alone; `--format json` prints the plan as JSON.

Before `--apply` (once):
- The bucket `freeweights` needs a public custom domain in the allternit.com zone, proxied (R2 → bucket → Settings →
  Custom Domains). Cloud Connector does not support r2.dev. Default name `freeweights-r2.allternit.com`; another
  goes in `FW_R2_HOST`. Everything in the bucket becomes public on that domain, so private-repo objects never go in it.
- Environment, never committed: `CF_API_TOKEN` (a zone token for allternit.com with edit on Cloud Connector,
  Transform Rules, Single Redirects, Cache Rules, Workers Routes and Cache Purge, and account R2 edit for takedowns),
  `CF_ZONE_ID`, and `CLOUDFLARE_ACCOUNT_ID` for `fw_admin.py` and `sync_r2.py`. The wrangler OAuth token cannot edit zone rules.
- Upload with `python3 scripts/sync_r2.py` and confirm `python3 scripts/sync_r2.py --check-types` reports 0:
  the connector serves each object's stored Content-Type.

Trade-offs while the connector serves these paths:
- `hf_` tokens are not refused there (no Worker runs); the API routes still answer 401 `hf_token_rejected`.
- A taken-down entry answers 404 on the static paths (its R2 objects are deleted and purged by
  `fw_admin.py takedown --apply`), not 451. The API keeps 451. Until that step runs, the static copies stay up.
- Downloads are not counted on these paths (they never were: counts happen on resolve).

Deploy needs `wrangler d1 create freeweights`, the real `database_id`, and `CLOUDFLARE_ACCOUNT_ID` in the environment. Do not commit them.
