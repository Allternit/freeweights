---
title: Upload a model or dataset
nav_label: Uploads
summary: Create a repo and upload to it with the Hugging Face tools or fw. How scanning works, what the states mean, and where to read the current limits.
group: Tools
order: 3.5
updated: 2026-11-15
sections:
  - {id: before, title: Before you start}
  - {id: hf, title: With the Hugging Face tools}
  - {id: fw, title: With fw}
  - {id: scanning, title: Scanning and states}
  - {id: limits, title: Current limits}
  - {id: errors, title: When an upload is refused}
  - {id: not-yet, title: What is not available}
---
Any Allternit account with a Freeweights handle can create a public model or dataset repo under its own handle and upload to it. Every file is scanned before anyone can download it.

## Before you start {#before}

1. Sign in at freeweights.allternit.com and pick your handle.
2. Accept the upload rules (`policy/community-rules.md` in the repository). Uploads stay closed to your account until you do.
3. Make a key at `https://platform.allternit.com/api-keys?create=freeweights` with the `freeweights.write` scope. It starts with `alt_`. Treat it like a password.

Uploads can be switched off while we open them up. The limits endpoint (below) says whether they are on. A refused call says why in plain words.

## With the Hugging Face tools {#hf}

Point the client at Freeweights, use your `alt_` key as the token, and turn Xet off. Freeweights does not support Xet, so a client that tries it gets a clear 501 `xet_not_supported`.

```
export HF_ENDPOINT=https://freeweights.allternit.com
export HF_TOKEN=alt_...
export HF_HUB_DISABLE_XET=1
hf upload your-handle/your-model ./folder .
```

For a dataset add `--repo-type dataset`. `hf repo create` works too. The Hugging Face client prints our error message as written, so read it before you retry.

## With fw {#fw}

`fw` is the Python script from the Tools section. It uses only the standard library.

```
fw login                                   # paste the alt_ key; saved to ~/.config/freeweights/token, mode 600
fw whoami
fw repo create your-handle/your-model      # add --type dataset for a dataset
fw upload ./folder your-handle/your-model  # preupload, then storage, then one commit
fw repo status your-handle/your-model
```

`fw upload` asks the hub which files need the large-file path, hashes them, asks for upload URLs, sends each file (large ones in parts), and then makes one commit. It stops with the hub's message if anything is refused, before it sends bytes where it can. Run it again after a fix: files the hub already has are skipped.

## Scanning and states {#scanning}

After the commit the repo is **scanning**. Each new file is checked for a matching checksum, unsafe weight or pickle content, malware and secrets, and a match to the blocklists.

| State | Meaning |
| --- | --- |
| `draft` | The repo exists and has no commit yet. |
| `scanning` | The commit is in. Files are waiting for or going through a scan. Nothing is downloadable yet. |
| `live` | Every file in the commit scanned clean. Downloads work. |
| `held` | A file failed a scan. It is not served. You see the reason code in `fw repo status` and on your account page. |
| `removed` | The repo was removed, by you or after a report. |

A file that is still scanning answers 404 `file_not_ready` on download. If scanning is delayed, the upload pages say so and the files wait; they are never published without a scan. Held files are deleted after 14 days. Fix the file and upload it again.

## Current limits {#limits}

The caps change without a release, so they are not written here. Read the values in force:

```
curl https://freeweights.allternit.com/api/fw/v1/limits
```

The reply gives whether uploads are open, the site total and what is used, and the per-account and per-file caps, the number of repos you may hold, how many repos you may create per day, commits per hour and files per commit. A value of `null` means that limit is not set, and uploads are paused for everyone but staff until it is.

## When an upload is refused {#errors}

The hub answers before any byte moves when it can.

| Code | What to do |
| --- | --- |
| `uploads_paused` (403) | Uploads are closed for now. Check the limits endpoint later. |
| `rules_not_accepted` (403) | Accept the upload rules on your account page. |
| `repo_limit` (403), `rate_limited` (429) | You are at a repo or request limit. `Retry-After` says when to try again. |
| `too_many_files` (400) | Split the upload into several commits. |
| `file_type_not_allowed` (400) | Executables and archives are not accepted. The error names the paths. |
| `file_too_large` (413) | A file is over the per-file cap. |
| `storage_full`, `site_full` (413 or 507) | Your account or the site is over its cap. |
| `size_mismatch` (422) | The stored size differs from the one you sent. Upload the file again. |
| `perk_required` (402) | Private repos are not available. |

## What is not available {#not-yet}

Each of these answers a clear error, not a silent failure: private repos, organization namespaces, app repos, pull requests, discussions, likes, follows, collections, webhooks and Xet.
