---
title: HF_ENDPOINT
nav_label: HF_ENDPOINT
summary: Use stock Hugging Face tools against Freeweights with one environment variable, what works, and what does not.
group: Tools
order: 4
updated: 2026-11-14
sections:
  - {id: setup, title: Set it up}
  - {id: works, title: What works}
  - {id: limits, title: Known limits}
  - {id: tokens, title: Tokens}
---
The model routes follow the Hugging Face Hub shape, so the Hugging Face tools can download from Freeweights.

## Set it up {#setup}

```
export HF_ENDPOINT=https://freeweights.allternit.com
export HF_HUB_DISABLE_IMPLICIT_TOKEN=1
hf download BAAI/bge-small-en-v1.5 --local-dir bge-small
```

In Python, `hf_hub_download(..., endpoint="https://freeweights.allternit.com")` works the same way.

## What works {#works}

We tested against the Stage 0 Worker on 2026-11-14 with BAAI/bge-small-en-v1.5, with no token sent. After the fixes in that round:

| Client | Result |
| --- | --- |
| `hf download <repo>` (full repository) | Pass. 14 of 14 files matched the manifest. |
| `huggingface_hub.snapshot_download` | Pass. |
| `hf download <repo> <file>` and `hf_hub_download` | Pass. |
| curl `-L` on a resolve URL | Pass. Two redirects. |
| aria2c, small and large files | Pass. Range requests work through the redirect. |
| `fw.py` | Pass. |

## Known limits {#limits}

- **Not tested yet:** transformers `from_pretrained` through the endpoint, and torrent web seeds (no torrents exist at Stage 0).
- **Hashes are not checked by the client.** Run `fw.py verify` afterward.
- **Bytes come from the source.** At Stage 0 the resolve route redirects to the publisher at the pinned commit. Hugging Face still serves the bytes for From source models.
- **HEAD on a file answers from the manifest.** It does not redirect, because a redirect made Xet clients follow it to Hugging Face and fail.
- **Xet:** the Worker sends no Xet headers, so clients use plain HTTP. The read-token route passes the public token request through for clients that ask.
- **Uploads are supported with limits.** Repo creation, preupload, the LFS batch path and commits work for public model and dataset repos under your own handle, with `HF_HUB_DISABLE_XET=1`. Likes, pull requests, discussions, private repos and Xet answer a clear error. See the Uploads guide.
- **Only listed models.** Anything else answers 404. A removed model answers 451. A model with no live source answers 404 `model_wanted`.
- **Probes:** `/api/agent-harnesses` returns 404. Clients tolerate this.

## Tokens {#tokens}

A request that carries a Hugging Face token (an `hf_` prefix) in any header or query is refused with 401 `hf_token_rejected`. We never log, store or forward it. Public reads need no token. Writes use an `alt_` key from `platform.allternit.com/api-keys` (scope `freeweights.write`), sent as the Hugging Face token. See the Uploads guide.
