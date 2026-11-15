# Freeweights accounts v1

Accounts add uploads, private repos, discussions, likes, collections, follows, posts, papers, webhooks and
org features to Freeweights. One Allternit account works here and on every other Allternit surface. This
file is the contract every part of the account work builds against: credentials, the entitlement claim,
scopes, sign-in, handles, repos and storage, privacy, the page slot and island interface, and catalog
overlays.

Routes and shapes: `parts/write-api.yaml` (a part of `hub-api.yaml`). Database:
`worker/migrations-accounts/0001_accounts.sql`, with the launch limits, scan claims and moderation columns in
`0003_launch_limits.sql`. Shared types: `worker/src/types.ts`. Section 11 is the launch contract for community
uploads: limits, scanning, promotion and moderation.

## 1. What stays anonymous

Every public read and every download works with no account, no cookie and no token, as today. This is the
Operating Statement promise and accounts do not change it:

- search, model and dataset detail, file trees, manifests and signatures, `/api/catalog`, and the site;
- `resolve` for every public file, catalog or community;
- public profiles, org pages, collections, discussions, papers and posts (read only).

A request without `Authorization` is never refused because it has no account. Anonymous rate limits stay
as they are. Accounts are needed only to write, and to read private repos.

A Clerk session token or `alt_` key sent on a public read is ignored: the read is served exactly as an
anonymous one, the credential is not checked, and nothing ties the request to the caller. This is what lets
`HF_TOKEN=alt_...` stay set for downloads. Only the routes in `parts/write-api.yaml` read a credential.

## 2. Credentials

Every authenticated request sends `Authorization: Bearer <credential>`. The Worker never reads a cookie
for auth, so a page on another site cannot make a signed-in request by riding a cookie (no CSRF surface).
Two kinds of credential are accepted:

| Credential | Looks like | Who uses it | How the Worker checks it |
| --- | --- | --- | --- |
| Clerk session JWT | three base64url parts, header `alg` `RS256` | the site, Desktop, ai.allternit.com, the phone apps | verified in the Worker (section 2.1) |
| Allternit key | `alt_` prefix | `huggingface_hub`, the `fw` CLI, scripts, CI | verified by cloud-api when the Worker fetches the claim (section 3) |

A Hugging Face token (`hf_` prefix) in any header or query is refused with 401 `hf_token_rejected`, as on
the read API. A credential is never logged, stored or forwarded anywhere except to cloud-api's entitlement
endpoint. The database holds no token and no token hash.

### 2.1 Clerk session JWT rules

The Worker verifies the session token itself with WebCrypto. No Clerk SDK runs in the Worker.

1. The token is at most 8 KB and has three parts. The header has `alg: "RS256"` and a `kid`. Any other
   `alg` (including `none` and `HS256`) is refused.
2. The key comes from the JWKS at `https://clerk.allternit.com/.well-known/jwks.json` (`CLERK_JWKS_URL`),
   cached for 1 hour. An unknown `kid` refetches the JWKS at most once a minute, then fails.
3. The signature is RSASSA-PKCS1-v1_5 with SHA-256 over `header.payload`.
4. `iss` is exactly one of `CLERK_ISSUERS`: `https://clerk.allternit.com` or `https://allternit.com/__clerk`.
5. `exp` is in the future, allowing 60 seconds of clock skew. `nbf`, when present, is in the past, with the
   same 60 seconds.
6. `azp`, when present, is exactly one of `CLERK_AZP` (the Freeweights site, its preview host,
   ai.allternit.com and m.allternit.com). A token whose `azp` is not on the list is refused. Native apps
   that send no `azp` are accepted on the other checks.
7. `sub` is a Clerk user id (`user_...`). It is the account id everywhere in Freeweights.

Failure answers 401 `auth_required` with no detail about which check failed. When the JWKS cannot be
fetched and no keys are known, the answer is 503 `entitlement_unavailable` with `Retry-After`.

A Clerk session can do everything its user can do: its scopes are `freeweights.read` and
`freeweights.write`. Community writes that need no plan (like, comment, follow, discussion, collection)
need only this check, with no call to cloud-api.

### 2.2 Allternit keys and scopes

Keys are cloud-api `alt_` keys, made on the console key page (`/api/v1/api-keys`). Freeweights adds three
scopes:

| Scope | Allows |
| --- | --- |
| `freeweights.read` | Reading private repos the key owner can see. |
| `freeweights.write` | Every write the key owner can make. Implies `freeweights.read`. |
| `freeweights.repo:<repo id>` | Reads and writes to that one repo only. `<repo id>` is the stable `rp_...` id, which survives renames and moves. |

A key with none of these scopes is refused on Freeweights write routes with 403 `insufficient_scope`.
In `whoami-v2` a key shows as `auth.type: "access_token"` with role `write`, `read` or `fineGrained` (for
`repo:` scopes), so Hugging Face clients read it the way they read their own tokens. A fine-grained key lists
each repo as `{"entity": {"type": "repo", "name": "rp_..."}, "permissions": ["repo.content.read",
"repo.write"]}`. A key with no Freeweights scope gets 403 `insufficient_scope` from `whoami-v2` too.

`whoami-v2` always reads the claim (also for a session) for `isPro` (true when `plan` is not `free`), `orgs`
(claim `orgs[]`: `slug` as the name, `admin` as `admin`, `member` as `contributor`) and the `allternit`
block. `name` is the handle from the accounts database; a signed-in user with no handle yet gets 404
`profile_not_found`.

## 3. Entitlement claim

The plan, add-ons, org seats and perks are decided by cloud-api, which holds billing. Freeweights never
holds a perk value or a price; it reads them from a signed claim.

**Request.** `GET https://api.allternit.com/api/v1/freeweights/entitlement` (`ENTITLEMENT_URL`), sent by
the Worker with the caller's own `Authorization` header (Clerk JWT or `alt_` key). cloud-api checks the
credential, and for a key also checks that it is not revoked.

**Reply.** `200` with `Content-Type: application/jose` and a compact JWS:

- header `{"alg":"EdDSA","typ":"JWT","kid":"entitlement-v1"}` (Ed25519);
- payload, all fields required:

| Field | Meaning |
| --- | --- |
| `iss` | `https://api.allternit.com` |
| `aud` | `freeweights` |
| `sub` | Clerk user id. For a key, the key owner. |
| `plan` | The plan id, as cloud-api names it. |
| `orgs[]` | One entry per Clerk org of the user: `clerk_org_id`, `slug`, `role` (`admin` or `member`), the org's `plan`, `perks`, `addon_bytes`, and `seats` when the org has a team plan. |
| `perks{}` | Perk name to value (number, boolean or string). A missing name means not included. Unknown names are ignored, so cloud-api can add perks without a Worker release. |
| `addon_bytes` | `{public, private}` bytes bought as add-ons, on top of the plan's included storage. |
| `scopes[]` | Scopes of the credential. A session gets `["freeweights.read","freeweights.write"]`. |
| `cred` | `session` or `key`. |
| `iat`, `exp` | Issued at; expires 10 minutes later. |

**Verify.** The Worker checks the signature with the Ed25519 public key in `spec/keys/entitlement-v1.pub`
(bundled at build time; the optional `ENTITLEMENT_PUBKEY` var can add a public key, as `[kid=]<PEM or base64
SPKI>`), `kid`, `iss`, `aud`, every payload field's presence and type, `exp` (60 seconds skew), `cred`
against the credential sent, and for a session that `sub` equals the JWT's `sub`. A claim that does not
verify answers 503 `entitlement_unavailable`; a claim for another user answers 401 `auth_required`.

**Cache.** Claims are cached by `sha256(bearer)`, in isolate memory and the Workers Cache API, until 30
seconds before `exp` and never longer than 5 minutes. A cached claim is verified again when read. The
credential itself is never a cache key. A revoked key or a plan change can take up to 5 minutes to show.

**When it is fetched.** Always for `alt_` keys (it is how the key is checked). For a Clerk session, only
when the route needs a plan, perk, storage limit or org seat: create repo, upload, private settings,
webhooks, private collections, endpoints, account page.

**When cloud-api is down.** Routes that need a claim answer 503 `entitlement_unavailable` with
`Retry-After`. Public reads and downloads never wait on cloud-api.

**Keys.** A new signing key gets a new file (`entitlement-v2.pub`) and `kid`; the Worker accepts both
during the change-over. Until the PEM block in `entitlement-v1.pub` is filled (and while `ENTITLEMENT_URL`
is unset), no claim verifies and those routes answer 503 `accounts_not_configured`, as does every `alt_` key
and `whoami-v2`. The credential is never sent to cloud-api while no key could verify the answer. Every write
route also answers 503 `accounts_not_configured` while the accounts database (`ACC`) or the Clerk settings
are missing. A Clerk session that fails its checks still gets 401 first.

**Perks in replies.** When a plan does not include something, or its limit is used, the reply is 402
`perk_required` or `perk_limit` with the perk name and a link to `/plans/`. The plans page reads its
numbers from cloud-api (`GET /api/v1/billing/plans`) when it is viewed; no number is built into the site.

## 4. Sign-in

There is no sign-in screen on Freeweights and no satellite domain. Freeweights is a subdomain of the
Allternit Clerk primary domain.

1. Anonymous pages load no third-party script. clerk-js (served by `clerk.allternit.com`) loads only after
   the visitor clicks **Sign in**, or when the `__client_uat` cookie on `.allternit.com` says a session may
   exist.
2. **Sign in** sends the browser to `https://ai.allternit.com/sign-in?redirect_url=<the current Freeweights
   URL, encoded>`. The Freeweights origin is on the ai sign-in page's redirect allowlist, so it returns
   there after sign-in.
3. Back on Freeweights, clerk-js reads the session and gives the islands a short-lived session token, which
   they send as `Authorization: Bearer` to the API. The first signed-in visit asks for a handle
   (`POST /api/fw/v1/account`).
4. Sign-out goes through clerk-js and clears the session for every Allternit surface.

Desktop, ai.allternit.com, the phone apps and Gizzi call the same API with their own Clerk session token
or an `alt_` key.

## 5. Handles

User handles and org slugs share one namespace, compared without case. A handle is 2 to 42 characters of
`A-Z a-z 0-9 . _ -`, starts with a letter or digit, and has no `..` or `--`.

Reserved handles (`reserved_handles`) cannot be taken:

- every catalog publisher (the org part of each catalog id);
- every catalog section id (`alt.freeweights.qwen`) and its short name (`qwen`);
- site route words (`api`, `docs`, `models`, `plans`, `account`, ...) and the product names.

`scripts/reserved_handles.py` generates the seed (`0002_reserved_handles.sql`) from the catalog. After a
catalog batch, `--only-new --out worker/migrations-accounts/00NN_reserved_handles.sql` writes a migration
with only the new names, and `--check` fails while any catalog name is unreserved. A publisher claims its
own name after verification: an admin removes the reserved row and creates the verified org in one batch.
Database triggers refuse a taken or reserved handle (`handle_taken`) and a community repo under a reserved
namespace (`namespace_reserved`).

## 6. Repos and storage

- **Kinds:** `model`, `dataset`, `app` (an MCP app; Hugging Face clients call it a space). URL segments are
  `models`, `datasets`, `spaces`, with `apps` as an alias.
- **Ids:** each repo has a stable id (`rp_...`) that survives renames and moves. `namespace/name` is the
  public address.
- **Catalog entries** keep living in `catalog/catalog.json`. When someone likes, discusses, collects or
  links a paper to a catalog entry, a `repos` row with `source = catalog` and no owner is made for it, so
  every feature has one foreign key.
- **States:** `draft` (created, no commit) → `scanning` (new files are being scanned) → `live`, or `held`
  when a scan finds a problem. `removed` after a takedown or deletion.
- **Uploads** go from the client straight to R2 by presigned URL; bytes never pass through the Worker.
  New objects land in the quarantine bucket. After the scanner clears them they move to the public bucket
  (public repos) or the private bucket (private repos). At launch only public model and dataset repos under
  the caller's own handle can be created (section 11); private repos answer 402 `perk_required`.
- **R2 keys:** blobs at `repos/<repo id>/blobs/<sha256>` (the same key in quarantine and in the public
  bucket), commit trees at `repos/<repo id>/trees/<commit>.json`
  (same file shape as a manifest `files` list), community detail pages at
  `alt.freeweights.community/<namespace>/<name>/index.html`. The catalog sync never deletes these prefixes.
- **Private reads:** an access check, then a 302 to a presigned URL valid for 5 minutes, with
  `Cache-Control: private, no-store`. Nothing private is put in the edge cache.
- **Storage limits:** until perks are offered, the per-account cap is the operator's `user_cap_bytes`
  limit and the site cap `site_cap_bytes` (section 11.1). When perks are offered, the claim's storage perk
  plus `addon_bytes` replaces `user_cap_bytes`; the site cap stays. Usage is kept in `storage_usage` per
  owner and in the one-row `site_usage` total. Over a cap, the LFS batch answers error 507 for each new
  object.

## 7. Privacy

- The accounts database (`freeweights-accounts`, binding `ACC`) is separate from the catalog database
  (`freeweights`, binding `DB`). They are never joined. The catalog database keeps its promise of no
  personal data.
- No download is logged per person, signed in or not. Download counts stay aggregate per model per day.
- No email address, IP address, user agent, token or token hash is stored. Email and sessions stay in
  Clerk; keys stay in cloud-api.
- The audit log records account actions (who changed what) with no IP address.
- Webhook secrets are stored encrypted. Webhook delivery rows are kept 30 days.
- Deleting an account removes its profile, repos, likes, follows, collections and webhooks. Discussion
  posts stay and show a deleted account.

## 8. Page slots and islands

Catalog pages stay static files in R2. Account features reach them through the two extension points the
site already has, so each feature adds files instead of editing shared ones. The full contracts are in
`site/pages/model/slots/README.md` and `site/assets/islands/README.md`; this section adds only what
accounts need.

**Model page slots (build time).** Each `site/pages/model/slots/NN-<name>.mjs` exports `region` (`head`,
`tab`, `side` or `after`), `tab` (`[id, label]`, tab slots only) and a default function `(r, ctx) => string`.
Files load in numeric prefix order. A slot is pure: no network, no clock, nothing personal, no price. A
slot for an account feature renders only static text and an island mount point.

**Islands (view time).** A mount point carries a text fallback and string inputs:

```html
<div data-fw-island="likes" data-model="org/name" data-kind="model">Likes load when the page does.</div>
```

`/assets/fw-islands.js` imports `/assets/islands/<name>.js` and calls `mount(el, props, api)`. `props` is
the element's `dataset`. Accounts add the third argument, which islands that do not need it ignore:

| `api` member | Meaning |
| --- | --- |
| `signedIn()` | `true` when a session exists. Does not load clerk-js by itself. |
| `token()` | Promise of a fresh session token, or `null` when signed out. |
| `fetch(path, init)` | Same-origin `fetch` to the Freeweights API that adds `Authorization: Bearer` when signed in. |
| `signIn()` | Starts the sign-in redirect (section 4). |

Rules for account islands: render a useful signed-out state (public counts, a **Sign in** link) and never
block the page; no inline script and no `eval`, so the page CSP holds; insert user text as text, never as
HTML.

**Pages the Worker renders.** Community repo pages are rendered by the Worker at commit time and written
to R2 under the same key scheme as catalog pages. Profiles, orgs and collections are served by the Worker
by filling the shell the build emits (`site/lib/shell.mjs`). Private repo pages are an app shell that reads
the API with the user's token.

## 9. Catalog overlays

Enrichment that is not part of the catalog row (clouds, libraries, languages, apps that use a model, eval
results, paper links) lives in `catalog/overlay/<name>.json`, one file per kind of data, each with one
owner (see `catalog/overlay/README.md`):

```json
{
  "_meta": { "source": "apps-registry", "generated_at": "2026-11-15T00:00:00Z" },
  "org/name": { "apps": ["app-id"] }
}
```

- Keys are catalog ids. Keys that start with `_` are metadata, not rows.
- The site build attaches each entry to its row as `r.overlay.<name>`, so an overlay can never overwrite a
  catalog field or another overlay.
- Overlays add display data only. They never change a signed manifest, and they hold nothing personal and
  no price.
- The search index and the API read the same join.

## 10. Errors and limits

Errors use the read API's body: `{"error": "<code>", "message": "..."}`. Codes: `auth_required`,
`hf_token_rejected`, `insufficient_scope`, `forbidden`, `repo_not_found` (also for a private repo the
caller cannot see), `repo_exists`, `handle_taken`, `namespace_reserved`, `perk_required`, `perk_limit`,
`xet_not_supported`, `entitlement_unavailable`, `accounts_not_configured`, `rate_limited`,
`profile_not_found`, `method_not_allowed`, `not_implemented`. Upload, scan and moderation codes are listed
in section 11.2.

Signed-in API request limits per 5 minutes are the claim perk `api_requests_5m` (a number), counted per
account per Worker isolate once a claim is in hand. With no such perk Freeweights counts nothing itself. Over
the limit: 429 `rate_limited` with `Retry-After`. Anonymous limits are unchanged.

Every reply on an auth route (success or error) carries `Cache-Control: private, no-store`,
`Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`,
`X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`.

Methods: each route answers only its listed methods. Any other method answers 405 `method_not_allowed` with
`Allow` (paths no route owns are read-only: `Allow: GET, HEAD`). A CORS preflight on an auth route lists that
route's methods and allows the `Authorization` header. A write route that is specified but not built yet
checks the credential and then answers 501 `not_implemented`.

## 11. Community uploads at launch

Any Allternit account with a handle can create a public model or dataset repo under its own handle and
upload to it through the Hugging Face path (`HF_HUB_DISABLE_XET=1`), the `fw` CLI or the site. Every file
is scanned before anyone can download it. Org namespaces, `app` repos, private repos, pull requests,
discussions, likes, follows, collections and webhooks are not part of the launch: each answers a clear error
(`forbidden`, `perk_required` or `not_implemented`), never a silent success.

### 11.1 Limits

Every limit is a row of the `limits` table (migration 0003), key to integer. The operator sets them with
`scripts/fw_admin.py limits set <key> <value>` (admin route `PUT /api/fw/v1/admin/limits`). No limit value
is written in this repo, and changing one needs no deploy. `GET /api/fw/v1/limits` shows the values in
force to anyone.

| Key | Meaning |
| --- | --- |
| `uploads_open` | 1 = uploads on. 0 = off for everyone but staff (`users.staff = 1`). The migration seeds 0. |
| `site_cap_bytes` | All community bytes together: reserved, in quarantine, held and live. |
| `user_cap_bytes` | One account's community bytes, counted the same way. Replaced by the claim's storage perk once perks are offered. |
| `file_max_bytes` | One file. |
| `repos_per_user` | Repos an account may hold (any state but `removed`). |
| `repo_creates_per_day` | Repos an account may create in a rolling 24 hours (deleted ones count). |
| `commits_per_hour` | Commits an account may make in a rolling hour. |
| `files_per_commit` | Files one commit (and one preupload call) may add or change. |

A key that is missing fails closed: while any key above is unset, uploads are paused for everyone but
staff, and `GET /api/fw/v1/limits` reads `open: false`. Unknown keys in the table are ignored.

### 11.2 Where each limit answers

The earliest call that can know answers, so a client fails before it sends bytes.

| Code | Status | Answered by |
| --- | --- | --- |
| `uploads_paused` | 403 | repo create, preupload, LFS batch, commit (staff pass) |
| `rules_not_accepted` | 403 | the same four, while `users.rules_accepted_at` is null (accept with `acceptRules: true` on `POST`/`PATCH /api/fw/v1/account`) |
| `account_suspended` | 403 | every write of a suspended account |
| `repo_limit` | 403 | repo create, at `repos_per_user` |
| `rate_limited` | 429 + `Retry-After` | repo create (`repo_creates_per_day`), commit (`commits_per_hour`), report |
| `perk_required` | 402 | repo create or settings asking for a private repo (perk `private_storage`) |
| `too_many_files` | 400 | preupload and commit, over `files_per_commit` |
| `file_type_not_allowed` | 400 | preupload: executables and archives, by extension or by the magic bytes in `sample` |
| `file_too_large` | 413 at preupload; per-object 413 at the LFS batch | over `file_max_bytes` |
| `storage_full` | 413 at preupload; per-object 507 at the LFS batch | over the account's cap |
| `site_full` | 413 at preupload; per-object 507 at the LFS batch | over `site_cap_bytes` |
| `size_mismatch` | 422 | LFS verify or complete: the stored size differs from the size given |
| `file_not_ready` | 404 | resolve of a community file that is not `live` yet (scanning or held) |
| `removed_after_takedown` | 451 | resolve and repo reads of a repo removed after a takedown |
| `bad_signature` | 401 | scanner and admin routes (section 11.4) |
| `scan_not_found`, `scan_not_claimed` | 404, 409 | scan result for an unknown scan, or for a claim that ran out |

400 and 413 bodies about files carry `paths` (the refused paths) and `limit` (the key). A per-object LFS
error names the code in `message`. Hugging Face clients show `message` as is, so it says in plain words
what to change.

### 11.3 Upload flow

1. **Preupload** answers the limits in 11.2 for the whole set of files before any byte moves.
2. **LFS batch** reserves each new object's bytes in one conditional D1 statement that checks
   `file_max_bytes`, the account cap and the site cap together, and adds the bytes to the owner's
   `storage_usage.quarantine_bytes` and to `site_usage.bytes` in the same batch. Objects up to 64 MiB get
   one presigned PUT that signs `content-length`; larger ones get multipart with 32 MiB parts (S3 Create,
   Complete and Abort through signed fetch). URLs last 1 hour.
3. **Verify** (and multipart complete) HEADs the quarantine object. A size that differs from the reserved
   size deletes the object, releases the bytes and answers 422 `size_mismatch`. The sha256 is checked by
   the scanner, because the Worker's CPU limit rules it out.
4. **Commit** writes the tree, sets the repo to `scanning` and queues one `scans` row per new file.

Bytes are released when an upload expires (1 hour) or aborts, on a size mismatch, when a held file is
deleted (14 days), and when a repo is deleted or purged. `fw_admin.py usage reconcile` recomputes every
total from `uploads` and `repos`.

### 11.4 Signed requests (scanner and admin)

The scanner (`/api/fw/v1/scan/*`) and the operator (`/api/fw/v1/admin/*`) send no Bearer credential. Each
request carries:

- `X-FW-Timestamp`: Unix seconds, within 300 seconds of the Worker clock;
- `X-FW-Signature`: `v1=<hex>`, HMAC-SHA256 over
  `<timestamp>\n<METHOD>\n<path and query>\n<sha256 hex of the body>` (the hash of the empty string for no
  body).

The key is `SCANNER_SECRET` for scan routes and `ADMIN_SECRET` for admin routes; one never works on the
other's routes. The Worker compares in constant time. A missing, wrong or stale signature answers 401
`bad_signature` with no detail. While the secret is unset the routes answer 503 `accounts_not_configured`.
Every write these routes make is safe to repeat, so a replay inside the 300-second window changes nothing.
Admin actions are written to `audit_log`.

### 11.5 Scanning

- **Jobs.** The scanner runs in its own container on allternit-standby and polls
  `POST /api/fw/v1/scan/claim` every 30 to 60 seconds. A claim sets the scan to `scanning`, adds 1 to
  `attempts` and sets `claimed_until` to 30 minutes on. Each job carries a presigned GET on the quarantine
  object, valid 15 minutes. The scanner holds no R2 or Cloudflare credential.
- **Sweep.** Every poll first records the heartbeat (`scanner_state`) and sweeps: pending uploads expire
  after 1 hour; a scan whose claim ran out goes back to `queued`, or to `error` after its third attempt;
  held files are deleted from quarantine 14 days after the scan. There is no cron job. An R2 lifecycle rule
  on the quarantine bucket backs this up (incomplete multipart uploads aborted after 1 day, objects expired
  after 15 days).
- **What is checked.** Every file: its sha256 must equal the oid (`sha256_mismatch`), and it must not be on
  the public blocklist or in `blocked_hashes` (`blocklisted`; the Worker checks `blocked_hashes` itself
  when it records the result, so the scanner never needs the private list). Weights: a header check with
  `scripts/formats.py` (`bad_header`). Pickles: picklescan and modelscan (`unsafe_pickle`). Everything
  else: ClamAV (`malware`), plus gitleaks on text files up to 5 MiB (`secret_found`). A scanner that
  cannot finish reports `error` (finding `scan_failed`).
- **Results.** `POST /api/fw/v1/scan/{id}/result` with the `attempt` from the job. Any finding holds the
  file. Findings name the scanner and code; `detail` is for admins and never holds file content or a
  secret's value.
- **Scanner down.** Files stay `scanning` and are never promoted on a timeout. `GET /api/fw/v1/scan/health`
  answers 200 while the last poll is under 10 minutes old, else 503, and `GET /api/fw/v1/limits` reads
  `scanning_delayed: true`. The upload UIs then show "Scanning is delayed".

### 11.6 Promotion and downloads

- **Promotion.** On a clean result the Worker copies the object from quarantine to the public bucket at the
  same key, then deletes the quarantine copy. The repo goes `live` only when every scan of the commit is
  clean; one held file makes the repo `held`, and nothing of that commit is served. If a stream copy of a
  file near `file_max_bytes` fails on the free plan, the fallback is a server-side S3 CopyObject by the
  scanner into a separate community bucket (plan U8); the key scheme does not change.
- **Downloads.** Resolve of a community file serves only the head commit and the commits before it (the head
  moves only when a whole commit is clean, so a commit that is scanning or held is never reachable, and the
  last clean head stays downloadable meanwhile). A file not in a served commit yet answers 404
  `file_not_ready`; a takedown answers 451 `removed_after_takedown`. Otherwise it answers 302 to a presigned GET valid 5 minutes, with
  `Cache-Control: private, no-store`. A takedown therefore takes effect within 5 minutes. Community blob
  keys are never linked directly.

### 11.7 Reports and moderation

- **Reports.** `POST /api/fw/v1/reports` (signed in, rate-limited). Legal notices without an account go to
  the takedown mailbox (`docs/takedowns.md`).
- **Admin routes** (`/api/fw/v1/admin/*`, signed with `ADMIN_SECRET`, driven by `scripts/fw_admin.py`):
  list and close reports; list held and errored scans; remove a repo (`status = removed`,
  `removed_reason = <reason_class>`, optionally its hashes into `blocked_hashes`, optionally purge its
  files); restore a removed repo or release a reviewed held one; suspend or reinstate an account and set
  its staff flag; get and set limits; reconcile usage; and sum the bound buckets' bytes (`r2-usage`). The
  Worker cannot see the R2 account total, so `fw_admin.py r2-usage` adds the other buckets from the
  Cloudflare API on the operator's machine and is run at each deploy.
- **Removed repos.** `removed_reason` is a takedown class (resolve answers 451) or `owner` /
  `account_deleted` (404).

### 11.8 Staged open

The migration leaves `uploads_open = 0`. The operator sets every other limit, marks the test account staff,
checks the whole path on production (Hugging Face, `fw` and browser uploads, the scan corpus, a download,
a lowered cap, a report and removal, a stopped scanner), and only then sets `uploads_open` to 1.

## 12. Versions

This is v1. A change that breaks a client (a field removed or renamed, a route moved, a claim field
changed) makes v2 and keeps v1 working until every client has moved. Adding a field, a perk name or a
route is not a breaking change.
