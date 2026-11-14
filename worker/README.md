# Freeweights Worker (Stage 0, local only)

Cloudflare Worker + D1 implementing the read part of `../spec/hub-api.yaml`. Nothing here is deployed.

## Run locally

```sh
cd worker
npm install
npm run build:data                       # bundles ../manifests (else ../spec/samples) into src/data.generated.ts
npx wrangler d1 execute freeweights --local --file=schema.sql
npx wrangler dev --local                 # http://127.0.0.1:8787  (wrangler dev also runs build:data)
```

```sh
curl -sI http://127.0.0.1:8787/BAAI/bge-small-en-v1.5/resolve/main/model.safetensors
curl -s  'http://127.0.0.1:8787/api/models?search=bge'
curl -sI -H 'Authorization: Bearer hf_x' http://127.0.0.1:8787/api/models      # 401
```

Tests (start their own `wrangler dev` on port 8799 in offline check mode with a temp D1): `npm test`.
Typecheck: `npm run typecheck`.

## Behavior

- **Routes**: `/api/models`, `/api/models/{org}/{repo}` (also `/revision/{rev}`), `/api/models/{org}/{repo}/tree/{rev}`, `GET|HEAD /{org}/{repo}/resolve/{rev}/{path}`, `/api/catalog`, `/manifests/{org}/{repo}.json[.minisig]` (exact stored bytes).
- **Resolve**: 302 to the first live source in priority order, with `X-Repo-Commit`, `ETag`, `X-Linked-Size`/`X-Linked-Etag` (LFS files), and `Content-Length` on HEAD. HEAD does not count a download. Magnet-only sources are not redirect targets.
- **Check on read (F4)**: a stale source gets a HEAD, 1500 ms each and 3000 ms total; size must equal the manifest. Results go to D1 (`source_state`) and are reused for `FRESH_MS` (10 min; failed results for 2 min). Timeout gives 503 with `Retry-After`; all sources failed gives 404 `model_wanted`.
- **Hugging Face limit**: checks against `huggingface.co` take a slot from a D1 5-minute window (`HF_CHECK_CAP`, default 2000, under the 3,000 anonymous / 5,000 free-user resolver limits). Over the cap, the last known state is used and HF is not contacted.
- **Origin guard (F11, stub)**: `ORIGIN_BUDGET_BYTES` (0 = off) vs a monthly D1 counter of file bytes redirected to hosts in `PAID_ORIGIN_HOSTS`. When used, those hosted sources are skipped, `X-Freeweights-Origin-Guard: on` is set, and seeded sources list first in model detail.
- **Counts**: `downloads` table, one row per model per UTC day. No IP, user agent or token is stored.
- **Auth**: any `hf_` token (Authorization, `X-HF-Token`, or a token query parameter) gives 401 `hf_token_rejected`; only the fact is counted. `alt_` gives 401 `alt_tokens_not_yet`.
- **Free-tier fit**: D1 writes (100k/day) happen on a download start, a check, or a rejected token. CPU per request is JSON filtering and one D1 read; keep it under the 10 ms Workers Free limit (measure before deploy).
- **Data**: the catalog and manifests are bundled at build time. `CHECK_MODE=offline` trusts the manifest (tests only).

Deploy needs `wrangler d1 create freeweights`, the real `database_id`, and `CLOUDFLARE_ACCOUNT_ID` in the environment. Do not commit them.
