---
title: fw reference
nav_label: fw.py
summary: Every fw.py command and option, including the info and search cards and the upload commands.
group: Tools
order: 3
updated: 2026-11-14
sections:
  - {id: install, title: Install}
  - {id: get, title: fw.py get}
  - {id: verify, title: fw.py verify}
  - {id: info, title: fw.py info}
  - {id: search, title: fw.py search}
  - {id: upload, title: Upload commands}
  - {id: behavior, title: How it behaves}
  - {id: exit, title: Exit codes and messages}
---
`fw.py` is the day-one downloader and verifier. It uses only the Python standard library. The only outside program is `minisign`, for signatures.

## Install {#install}

```
brew install allternit/tap/fw
pipx install allternit-freeweights
pip install allternit-freeweights
```

Each gives you the `fw` command. Install minisign for signature checks: `brew install minisign` (macOS) or your package manager. The Homebrew formula installs it for you.

From a checkout of the repository you can run the same program as `python3 scripts/fw.py`. The examples below write `fw.py`; with an installed package, type `fw` instead.

An installed `fw` has no local catalog, so `info` reads the catalog from freeweights.allternit.com. `fw search` always asks the live API at `https://freeweights.allternit.com/api/models`. If it cannot reach the site it prints one error line and exits with code 2. In a checkout, `fw.py search --local` searches the files in `catalog/` instead.

## fw.py get {#get}

```
fw.py get <model-id | manifest-url-or-path> [--dir D] [--pubkey FILE] [--no-verify-sig] [--origin URL] [--mirror URL ...]
```

| Part | Meaning |
| --- | --- |
| `manifest` | A model id such as `Qwen/Qwen3.6-27B`, a manifest URL or a local path. For an id, fw.py uses the copy in `manifests/` when it runs from the repository, otherwise the manifest on freeweights.allternit.com. For a URL, it also fetches the `.minisig` next to it. |
| `--dir D` | Where to put the files. Default: the model id with `/` replaced by `__`. |
| `--pubkey FILE` | The minisign public key. Default: `spec/keys/freeweights-v0.pub` in the repository. |
| `--no-verify-sig` | Skip the signature check. fw.py prints a warning that the manifest is not authenticated. |
| `--origin URL` | The catalog and manifest server. Default: `$FREEWEIGHTS_URL`, else https://freeweights.allternit.com. Also on verify, info and search. |
| `--mirror URL` | A Hugging Face-compatible hub to try first for file bytes, such as a self-hosted mirror. Repeat it for more than one, or set `$FREEWEIGHTS_MIRROR` (comma-separated). fw.py asks the mirror for the pinned commit, then `main`. A file from a mirror is kept only when its size and sha256 match the signed manifest; otherwise fw.py tries the next source. fw.py prints `from mirror <host>` for each file a mirror served. |

## fw.py verify {#verify}

```
fw.py verify <dir> <model-id | manifest> [--pubkey FILE] [--no-verify-sig]
```

Checks the manifest, then every file in `<dir>` for presence, size and sha256. Use it after any download method.

## fw.py info {#info}

```
fw.py info <model-id | name | manifest-path> [--remote] [--width N]
```

Prints the model's card in the terminal, the same card the site shows. The header has the family monogram in dot lettering and the newsgroup lines: From, Newsgroups, Subject, Date, Commit, and Signed when the manifest has a signature. Then come a one-line summary, the key facts (parameters, size, formats, task, license) and the commands: `fw get`, the manifest sha256 prefix and `fw verify`. A link-only model (non-commercial or gated) prints `link only — read the license:` and the license link instead. It never prints download commands for one.

| Part | Meaning |
| --- | --- |
| `model` | A model id, a repo name that matches one model, or a local manifest path. |
| `--remote` | Read the catalog from `https://freeweights.allternit.com/api/catalog` (and the manifest from the site) instead of this checkout. |
| `--width N` | Card width in columns. At least 60. Default: the terminal width, up to 100. |

Color is used only when the output is a terminal and `NO_COLOR` is not set. Piped output is plain text.

## fw.py search {#search}

```
fw.py search <words...> [--local] [--width N] [--limit N] [--cards N]
```

Asks the live hub API for models whose id contains the longest word, then keeps those whose id, name, section, task, format or license contain every word. With three matches or fewer (change it with `--cards`) it prints a full card for each. With more, it prints three lines per model: the name with size and license class, the From and group line, and the `fw get` command (or the license link for a link-only model). `--limit` caps the list (default 20). Exit code 1 means nothing matched. Exit code 2 means the API could not be reached.

## Upload commands {#upload}

These need an `alt_` key with the `freeweights.write` scope. The Uploads guide has the whole flow and the scan states.

- `fw login [--token KEY]` checks the key against the hub and saves it to `~/.config/freeweights/token` with mode 600. `$FW_TOKEN` overrides the file.
- `fw whoami` prints the handle the saved key belongs to.
- `fw repo create <handle>/<name> [--type model|dataset]` creates a public repo under your handle. An existing repo is not an error.
- `fw upload <folder> <handle>/<name> [--type model|dataset] [--message TEXT]` runs preupload, the LFS batch call, the file transfers (one request up to the hub's limit, parts above it) and one commit. It prints the hub's message and stops if a call is refused.
- `fw repo status [<handle>/<name>]` lists your repos with their state and scan counts (clean, waiting, held, error) and any hold codes.

## How it behaves {#behavior}

1. Reads the manifest. If its bytes are not canonical JSON, it stops with REJECT.
2. Checks the signature, unless told not to. A missing `.minisig` or a bad signature stops it.
3. For each file, it skips a file that is already complete and correct.
4. Otherwise it tries sources in priority order. It resumes a partial download with a Range request, and starts over if the server ignores Range.
5. It checks size and sha256. On a mismatch it discards the file and tries the next source.
6. At the end it checks all files and prints the verdict.

## Exit codes and messages {#exit}

| Result | Meaning |
| --- | --- |
| Exit 0, `VERDICT: PASS` | All files verified. |
| Exit 1, `VERDICT: FAIL` | At least one file is missing, the wrong size or the wrong hash. Each is listed. |
| `REJECT: manifest bytes are not canonical JSON` | The manifest was changed or re-serialized. |
| `REJECT: no .minisig next to the manifest` | There is no signature file. |
| `REJECT: manifest signature failed` | The signature does not match. Do not use the files. |
| `minisign not found` | Install minisign, or pass `--no-verify-sig`. |
