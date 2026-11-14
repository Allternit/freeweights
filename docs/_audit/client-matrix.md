# Phase 0.15: client compatibility matrix

Date: 2026-11-14. Worker run locally with `npx wrangler dev --local --port 8787` (Stage 0, not deployed). Model: BAAI/bge-small-en-v1.5, manifest `manifests/BAAI__bge-small-en-v1.5.json`, pinned commit `5c38ec7c405ec4b44b94cc5a9bb96e735b38267a`.

Clients ran with `HF_TOKEN` unset, `HF_HUB_DISABLE_IMPLICIT_TOKEN=1` and `HF_HOME` pointing at a scratch directory, so no user token was sent. Downloads were deleted after the run.

Expected sha256 values come from the manifest: `config.json` = `094f8e891b932f2000c92cfc663bac4c62069f5d8af5b5278c4306aef3084750`, `model.safetensors` = `3c9f31665447c8911517620762200d2245a2518d6e7208acc78cd9db317e21ad`.

| # | Client | Command (through `http://127.0.0.1:8787`) | Result | sha256 vs manifest | Notes |
|---|---|---|---|---|---|
| 1 | hf CLI 2.2.0, full repo | `HF_ENDPOINT=... hf download BAAI/bge-small-en-v1.5 --local-dir <dir>` | FAIL | n/a, no files fetched | Dies in `list_repo_tree` with `KeyError: 'pointerSize'` (Worker bug B1). Xet: not attempted. The Worker sends no `X-Xet-Hash`, so the client would use plain HTTP. |
| 1b | hf CLI 2.2.0, one file | `hf download BAAI/bge-small-en-v1.5 config.json --local-dir <dir>` | PASS | match (`094f8e...`) | Single-file path skips the tree call. |
| 2a | huggingface_hub 2.x `snapshot_download(endpoint=...)` | Python, hf tool venv | FAIL | n/a | Same `KeyError: 'pointerSize'` (B1). |
| 2b | huggingface_hub `hf_hub_download(endpoint=...)` | Python, hf tool venv | PASS | match (`094f8e...`) | |
| 2c | transformers `AutoTokenizer` / `AutoConfig` | `from_pretrained` with `HF_ENDPOINT` | NOT TESTED | n/a | transformers is not installed in the hf tool venv. Not installed here, per the step's no-install rule. |
| 3 | curl 8.x `-L` | `curl -L .../resolve/main/config.json` | PASS | match (`094f8e...`) | Two redirects (Worker 302, then HF resolve-cache). |
| 4a | aria2c, one file | `aria2c -x4 -s4 .../resolve/main/config.json` | PASS | match (`094f8e...`) | |
| 4b | aria2c, LFS file | `aria2c -x4 -s4 .../resolve/main/model.safetensors` (133 MB) | PASS | match (`3c9f31...`) | Multi-connection range requests through the 302 work. HEAD returns `x-linked-size` and `x-linked-etag`. |
| 5 | fw.py (sources upstream, no Worker) | `python3 scripts/fw.py get manifests/BAAI__bge-small-en-v1.5.json --dir <scratch> --no-verify-sig`, then `fw.py verify <scratch> <manifest> --pubkey spec/keys/freeweights-v0.pub` | PASS | 14/14 files verified | Manifest signature OK. The get step used `--dir` and `--no-verify-sig`. The verify step checked the signature separately. |
| 6 | Torrent with web seed | n/a | NOT TESTED | n/a | No torrents exist in Stage 0 yet. |

## Worker bugs found (not fixed, per step scope)

- **B1 (blocks full-repo clients). `/api/models/{org}/{repo}/tree/{rev}` omits `lfs.pointerSize`.** Each LFS entry returns only `{oid, size}`. Hugging Face includes `pointerSize`, and huggingface_hub reads it unconditionally, so `hf download <repo>` and `snapshot_download` both crash. Fix: add `pointerSize` to the tree's LFS objects, matching what HF returns. Retest rows 1 and 2a after the fix.
- **B2 (observation, harmless).** `GET /api/agent-harnesses` returns 404 in the wrangler log. It appeared during the hf CLI run, so it is probably a client probe. No action needed unless a client depends on it.

No 5xx responses appeared in the wrangler log during the run.

## Summary

Passing: hf single file, `hf_hub_download`, curl, aria2c (small and LFS), fw.py.
Failing: full-repo `hf download` and `snapshot_download`, both because of B1.
Not tested: transformers (not installed in the hf venv), torrent web seed (no torrents yet).

## Retest 2026-11-14 (after Worker fixes)

| # | Client | Result | sha256 vs manifest |
|---|---|---|---|
| 1 | `hf download BAAI/bge-small-en-v1.5` (full repo) | PASS | 14/14 match (`fw.py verify`) |
| 2a | `snapshot_download` (full repo) | PASS | 14/14 match |

Fixes in `worker/src/index.ts`:
- **B1:** tree LFS entries now carry `pointerSize` (125 + digits of size), which huggingface_hub reads unconditionally. Regression assertion added to the tree test.
- **Xet follow-on:** HEAD on `/resolve` now answers metadata itself (200 with ETag, X-Repo-Commit, X-Linked-Size/Etag, Content-Length; no Location). With a HEAD redirect, huggingface_hub 2.x followed it to huggingface.co, picked up Xet headers and failed. GET still redirects to the source, so bytes come from upstream. Tests updated.
- **Xet token pass-through:** `/api/models/{org}/{repo}/xet-read-token/{rev}` proxies the anonymous public token request to huggingface.co for catalog models, pinned to the manifest commit. Not needed after the HEAD change in this retest; kept for clients that still ask.
- **B2** (`/api/agent-harnesses` 404) left as 404: the client tolerates 404, and an empty list made it crash.

Note: port 8787 was taken by another local process during the retest, so the retest ran on port 8797.
