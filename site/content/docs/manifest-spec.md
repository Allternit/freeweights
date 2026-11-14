---
title: Manifest spec v0
nav_label: Manifest spec
summary: The signed JSON manifest that is the trust root for a model.
group: Reference
order: 5
updated: 2026-11-14
sections:
  - {id: overview, title: Overview}
  - {id: fields, title: Fields}
  - {id: canonical, title: Canonical JSON}
  - {id: signing, title: Signing}
  - {id: verifying, title: Verifying a download}
  - {id: formats, title: Allowed formats}
  - {id: urls, title: Source URLs}
---
One JSON manifest per model, pinned to one upstream commit. It names the exact files, their sizes and sha256 hashes, the license, and where the bytes can be fetched. The schema is `spec/manifest-v0.schema.json` and samples are in `spec/samples/`.

## Overview {#overview}

Torrent hashes are an extra source. They are never the trust root. The manifest is.

## Fields {#fields}

| Field | Meaning |
| --- | --- |
| `schema_version` | Integer `0`. |
| `id` | `org/repo`, the same as the upstream repo name. |
| `section` | `alt.freeweights.<family>`, for example `alt.freeweights.qwen`. |
| `upstream` | `host`, `repo`, `commit` (40 hex characters, pinned), `url`. |
| `license` | `id` (SPDX or a Freeweights id), `name`, `file_path`, `file_sha256`, `redistribution` (`yes`, `no` or `click-through`). |
| `files` | One entry per file: `path`, `size` in bytes, `sha256`, `lfs` (true if stored in Git LFS upstream). For non-LFS files we compute the sha256 from the bytes at the pinned commit. |
| `sources` | Ordered places to get the bytes. `type` is `hosted`, `seeded` or `source`. Each has `url` or `magnet`, `priority` (lower first) and `last_checked` (UTC time or null). |
| `torrent` | Optional. `infohash_v1`, `infohash_v2`, `magnet`, `web_seeds`. Present only when someone holds the bytes. |
| `created_at` | UTC time, `YYYY-MM-DDTHH:MM:SSZ`. |
| `generator` | The tool and version that wrote the file. |
| `sample` | Optional. True only for hand-written samples. Real manifests never carry it. |

## Canonical JSON {#canonical}

A signature covers exact bytes, so the bytes must be stable:

1. UTF-8, no byte order mark.
2. Object keys sorted by Unicode code point, at every level.
3. Indent of 2 spaces, `": "` after keys, a comma at line end, and no trailing spaces.
4. Arrays keep their meaning order: `files` sorted by `path`, `sources` sorted by `priority` then `url` or `magnet`.
5. No floating-point numbers. Sizes are integers.
6. Strings escaped as in RFC 8259, with non-ASCII written as raw UTF-8.
7. One newline at the end, and no other blank lines.

In Python: `json.dumps(obj, sort_keys=True, indent=2, ensure_ascii=False) + "\n"`.

## Signing {#signing}

Each manifest has a detached minisign signature (Ed25519) at `<manifest>.minisig`. The key id is `2DC28CC7B26A283B` and the public key is in `spec/keys/freeweights-v0.pub`. Maintainers sign with `minisign -Sm manifest.json -s <key>`. CI never holds the key. Key rotation: a new key signs a `keys.json` that the old key also signs, and both stay listed for 90 days.

## Verifying a download {#verifying}

1. Verify the manifest signature.
2. Download each file from any source.
3. Check `size` and `sha256` for every file. A mismatch means discard it and try the next source.

A client must reject a manifest whose signature fails or whose bytes are not canonical.

## Allowed formats {#formats}

Safetensors, GGUF, MLX or ONNX weights. ONNX is data only and allowed. Pickle-only repos (`.bin`, `.pt`, `.pkl`, `.ckpt` with no safe weights) are refused by `scripts/make_manifest.py` with a logged reason. Datasets use their own formats.

## Source URLs {#urls}

A `source` or `hosted` entry's `url` is a base URL. The file URL is the base plus the percent-encoded `path`. For upstream sources the base is `https://huggingface.co/<repo>/resolve/<commit>/`.
