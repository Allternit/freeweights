---
title: API
nav_label: API
summary: Routes of the read API, with example requests and responses.
group: Reference
order: 6
updated: 2026-11-14
sections:
  - {id: basics, title: Basics}
  - {id: search, title: Search models}
  - {id: model, title: Model detail}
  - {id: tree, title: File tree}
  - {id: resolve, title: Resolve a file}
  - {id: catalog, title: Catalog and manifests}
  - {id: errors, title: Errors and source states}
  - {id: guard, title: Check on read and the origin budget guard}
---
The full contract is `spec/hub-api.yaml` (OpenAPI 3.1, Apache-2.0). The Stage 0 Worker implements the read routes. At Stage 1 the hub keeps the same routes. Base URL: `https://freeweights.allternit.com`. Public reads need no token. Shapes below are abridged. The spec has the full schemas.

## Basics {#basics}

- No account, no token. A request with an `hf_` token is refused with 401 `hf_token_rejected`.
- Browsers can call it from any origin. A CORS preflight (`OPTIONS`) on `/api/*`, `/manifests/*` and the resolve routes answers 204 and allows `GET`, `HEAD`, the headers `If-None-Match`, `Authorization`, `Range` and `Content-Type`, cached for a day. The token rules apply to the real request.
- Later stages add `Authorization: Bearer alt_...` for accounts.
- Counts read "download starts", because a redirect cannot see a finished download.

## Search models {#search}

`GET /api/models` has the Hugging Face response shape. Order is by `sort`, never paid.

| Query | Meaning |
| --- | --- |
| `search` | Text match on id and display name. |
| `section` | For example `alt.freeweights.qwen`. |
| `author` | The organization part of the id. |
| `pipeline_tag` | Task tag. |
| `license` | License id, for example `Apache-2.0`. Rows carry SPDX case; the filter matches either case. |
| `library` | `safetensors`, `gguf` or `mlx`. |
| `source` | `hosted`, `seeded` or `source`. |
| `max_size` | Total size limit in bytes. |
| `sort` | `added` (default), `downloads`, `size`, `name` or `rank`. `rank` is the site's Best first order: official lab repos and base models first, then fine-tunes, then quantizations and adapters, then 30-day downloads at the source. With `search` and no `sort`, the order is `rank`. |
| `limit`, `cursor` | Page size 1 to 1000 (default 50), and a cursor. A `Link` header with `rel="next"` appears when more exist. |

```
curl 'https://freeweights.allternit.com/api/models?search=bge&library=safetensors&limit=5'
```

The reply is a JSON array of model summaries. Each has `publisher_logo`: the absolute URL of the publisher's logo, or `null` when there is none.

## Model detail {#model}

`GET /api/models/{org}/{repo}` returns the model with the state of each source (`live`, `stale`, `failed` or `skipped`).

```
curl https://freeweights.allternit.com/api/models/BAAI/bge-small-en-v1.5
```

## File tree {#tree}

`GET /api/models/{org}/{repo}/tree/{rev}` lists the files in the manifest, in the Hugging Face tree shape. `rev` is the pinned commit or `main`, which maps to the pinned commit. LFS entries carry `oid`, `size` and `pointerSize`.

```
curl https://freeweights.allternit.com/api/models/BAAI/bge-small-en-v1.5/tree/main
```

## Resolve a file {#resolve}

`GET /{org}/{repo}/resolve/{rev}/{path}` counts one download start and replies 302 to the first live source. Use `-L`.

```
curl -L -O https://freeweights.allternit.com/BAAI/bge-small-en-v1.5/resolve/main/config.json
```

`HEAD` on the same path answers 200 with metadata from the manifest: `X-Repo-Commit`, `ETag`, `X-Linked-Size`, `X-Linked-Etag` and `Content-Length`.

| Status | Meaning |
| --- | --- |
| 302 | Redirect to the best live source. |
| 401 | An `hf_` token was sent. |
| 404 | Unknown model, or code `model_wanted` when no source is live. |
| 451 | Removed after a takedown. It is counted on the public page. |
| 503 | No live source within the time limit. Has `Retry-After`. The model moves to Wanted. |

## Catalog and manifests {#catalog}

| Route | Returns |
| --- | --- |
| `GET /api/catalog` | The whole catalog (sections and model rows), a static file with an `ETag`. |
| `GET /manifests/{org}/{repo}.json` | The signed manifest, exactly as signed. Never re-serialized. |
| `GET /manifests/{org}/{repo}.json.minisig` | The detached signature, as plain text. |

```
curl -O https://freeweights.allternit.com/manifests/Qwen/Qwen3-Embedding-0.6B.json
curl -O https://freeweights.allternit.com/manifests/Qwen/Qwen3-Embedding-0.6B.json.minisig
```

## Errors and source states {#errors}

Errors use one JSON shape with a code and a message, for example `{"error": "model_wanted", ...}`; see the `Error` schema in the spec.

| State | Meaning |
| --- | --- |
| `live` | The last check passed within the freshness window. |
| `stale` | The last check is older than the window. It is re-checked on the next read. |
| `failed` | The last check failed: a HEAD error, a size mismatch with the manifest, or the commit is gone. |
| `skipped` | Not used on purpose, for example upstream while the origin budget guard is off. |

## Check on read and the origin budget guard {#guard}

There is no cron checker. On `resolve`, the Worker takes sources in priority order. For each `stale` source it runs a HEAD (hosted and source) or a tracker lookup (seeded), with a 1500 ms limit per source and 3000 ms in total. It compares size with the manifest and records the result. The first `live` source wins. Results are reused for 10 minutes by default.

The Worker tracks origin egress against a monthly budget. When the budget is used, paid-origin `hosted` sources are skipped, upstream and torrents come first, and replies carry `X-Freeweights-Origin-Guard: on`. Mirrors with their own capacity are not affected. It resets with the month.
