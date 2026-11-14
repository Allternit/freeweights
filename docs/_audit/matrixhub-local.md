# MatrixHub local test (Phase 0.14)

Date: 2026-11-14. Local only, nothing published. Plan reference: the Freeweights hub plan, section F.

## Versions

| Item | Value |
| MatrixHub | Apache-2.0, `main` at b2992e45d68b09a43a00bff3153eefcff6dc22ee (2026-11-13), shallow clone, no release tag used |
| Go | 1.27.3 darwin/arm64, CGO_ENABLED=1 (SQLite needs cgo) |
| hf CLI / huggingface_hub | 2.2.0 (2.4.0 available, not tried) |
| hf_xet | 1.7.0 |
| git / git-lfs | 2.54.0 / 3.7.1 |
| Host | macOS arm64, Docker not installed |

## Setup that worked (no Docker, no S3, no cloud)

1. `git clone --depth 1 https://github.com/matrixhub-ai/matrixhub` (own copy; the audit clone was untouched).
2. `CGO_ENABLED=1 go build -o matrixhub ./cmd/matrixhub` (about 47 s cold).
3. Copy `config/config-sqlite.yaml`, set absolute `dataDir`, absolute `migrationPath` (`<repo>/db/migrations`), `ui.staticDir: ""`.
4. `matrixhub apiserver -c config.yaml`; listens on :3001 (HTTP, gRPC and git on one port; SSH not started).
5. Seed over the REST API (session cookie from login):
   - `POST /api/v1alpha1/login` with `{"username":"admin","password":"changeme"}` (default admin from migration 0_init).
   - `POST /api/v1alpha1/projects` `{"name":"fwtest","type":"PROJECT_TYPE_PRIVATE"}`
   - `POST /api/v1alpha1/models` `{"project":"fwtest","name":"big"}`
   - `POST /api/v1alpha1/current-user/access-tokens` `{"name":"fwtok"}` returns a token shaped `mh_...` (32 chars after prefix).
6. `export HF_ENDPOINT=http://localhost:3001 HF_TOKEN=<mh_ token>`; an isolated `HF_HOME` was used so the real HF login was never touched.

Storage is the local filesystem under `dataDir` (git bare repos plus LFS objects) plus a SQLite file. No object store is needed in this mode. The 2 GB repo used 2.0 GB of dataDir (no dedup, no compression).

## Test matrix

Repo `fwtest/big`: two 1,073,741,910-byte random safetensors-like files plus config.json (2.0 GiB).

| Command | Result | Notes |
| `hf upload fwtest/big dir .` (Xet on, the default) | FAIL | Client calls `GET /api/models/fwtest/big/xet-write-token/main`, gets 404, raises `ConnectionError`. No fallback to LFS in hf 2.2.0 / hf_xet 1.7.0. |
| `HF_HUB_DISABLE_XET=1 hf upload ...` | OK, 2.8 s | Via preupload, LFS batch, commit. About 600 MB/s on loopback. |
| `hf download fwtest/big --local-dir dl` (Xet on) | OK, 2.2 s | Server never advertises Xet, so the client uses plain `/resolve/` HTTP. No Xet fallback needed on read. |
| `huggingface_hub.snapshot_download(..., local_dir=)` | OK | Same path as hf download. |
| `git clone http://user:<mh_ token>@host/fwtest/big` (git-lfs) | OK | 2.00 GiB at about 270 MiB/s. Smart HTTP and LFS both work. |
| `hf_`-looking token on private repo read | FAIL 403 | `{"error":...}` 30 byte body; hf prints "permission denied". Not a crash, not a 401. |
| `hf_` token on upload (`/api/repos/create`) | FAIL 403 | Same. |
| No token, private repo | FAIL 403 | |
| Bad `mh_` token | FAIL 403 | Same body as no token. |
| `hf auth whoami` with `mh_` token | OK | `/api/whoami-v2` returns user `admin`. |
| Direct `curl /api/whoami-v2` with `hf_x` | 401 `{"error":"Unauthorized"}` | whoami says 401, repo routes say 403. |
| `GET /api/models/<repo>/xet-read-token/main` | 404 | Xet routes do not exist. |

## sha256 comparison (2 GB repo)

```
source        = hf download = snapshot_download = git clone   (diff against src.sha: empty for all three)
model-00001-of-00002.safetensors  matches in all 3 round trips
model-00002-of-00002.safetensors  matches in all 3 round trips
config.json                       matches in all 3 round trips
```

Verdict: DL_MATCH, SNAP_MATCH, GIT_MATCH printed by `diff` against the source `shasum -a 256` list. The raw hashes of the 2 GB files were not kept because the files were random and deleted; a second 20 MB repo repeated the check with hashes 399f6475...b729 (model.safetensors) and ca3d163b...2356 (config.json) identical before and after.

## Request log excerpts

The server's own log has no HTTP access lines (only SQL). A small logging proxy on :3002 captured the 20 MB repo run (tokens redacted by the proxy):

```
GET  /api/models/fwtest/small/xet-write-token/main                 auth=Bearer mh_*** -> 404
POST /api/repos/create                                              auth=Bearer mh_*** -> 200
POST /api/models/fwtest/small/preupload/main                        auth=Bearer mh_*** -> 200
POST /fwtest/small.git/info/lfs/objects/batch                       auth=Bearer mh_*** -> 200
POST /api/models/fwtest/small/commit/main                           auth=Bearer mh_*** -> 200
GET  /api/models/fwtest/small/revision/main                         auth=Bearer mh_*** -> 200
GET  /api/models/fwtest/small/tree/<sha>?recursive=true&expand=false -> 200
HEAD /fwtest/small/resolve/<sha>/model.safetensors                  -> 200 len=20000000
GET  /fwtest/small/resolve/<sha>/model.safetensors                  -> 200 len=20000000
GET  /api/models/fwtest/small/revision/main auth=Bearer hf_***      -> 403
GET  /api/models/fwtest/small/revision/main auth=-                  -> 403
POST /api/repos/create                       auth=Bearer hf_***     -> 403
GET  /api/whoami-v2                          auth=Bearer mh_***     -> 200
```

Every hf invocation also sends `GET /api/agent-harnesses` (404, harmless). Downloads are direct 200s from the hub (no redirect to a signed object-store URL in the local filesystem mode).

## Gaps against Freeweights (plan section F)

| Need | Finding |
| Stock hf upload works | Only with `HF_HUB_DISABLE_XET=1`. With defaults it hard-fails on the missing `xet-write-token` route. Freeweights needs either the env var in our docs and CLI wrapper, or a server stub that returns a non-Xet answer the client accepts (untested). Same risk for any user who just runs `hf upload`. |
| Stock hf download, snapshot_download, git clone | Work, hashes match, fast. |
| S3 storage layer (kept in plan) | Not exercised: the local config uses the filesystem. Whether an S3 backend exists in this commit was not checked; the S3 path and signed-URL redirects are untested. Needed before Stage 1. |
| Token model | Tokens are `mh_`-prefixed, hash-stored. `hf_` tokens are refused with 403, no leak, no proxying to Hugging Face. Fine for a mirror; users must create a hub token rather than reuse an HF one. Plan should say so. |
| Anonymous read of public repos | Not tested (only a private project). Required for the public mirror and the Stage 0 Worker. |
| Access logs | None built in. We need request logging and counts (plan: counts, license ledger) in internal/freeweights/. |
| Default credentials | `admin` / `changeme` seeded by migration; must be changed or removed for any public deployment. Token signing secret for git temp tokens is hard-coded (`secret-xxxxxx` in apiserver.go). Fix before public exposure. |
| Dedup / Xet / torrent | No chunk dedup (2.0 GB stored for 2.0 GB). Torrent metadata, signed manifests, license ledger, source states: all absent, as expected (plan Add list). |
| Single-process SQLite | Docs say SQLite is for dev and single-node only; the Helm chart does not support it. Production uses MySQL. Not tested here. |
| Docker path | Not tested (Docker not installed). The compose files in deploy/ were read, not run. |

## Cleanup

Server and proxy stopped; dataDir, 2 GB source, download, snapshot and clone directories deleted. Scratch binary, config and request log remain in the session scratchpad (`mh-out/`), outside the repo.
