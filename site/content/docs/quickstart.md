---
title: Quickstart
nav_label: Quickstart
summary: Download one model three ways, and check it.
group: Start
order: 1
updated: 2026-11-14
sections:
  - {id: pick, title: Pick a model}
  - {id: fw, title: Way 1, fw.py}
  - {id: hf, title: Way 2, Hugging Face tools}
  - {id: links, title: Way 3, plain links}
  - {id: check, title: Check what you got}
---
Examples use BAAI/bge-small-en-v1.5, a small embedding model (about 133 MB for the weights). Swap in any model id from the catalog. No account and no token are needed.

## Pick a model {#pick}

Open a model page and copy its id, for example `BAAI/bge-small-en-v1.5`. The manifest is at `/manifests/<org>/<repo>.json`.

## Way 1, fw.py {#fw}

`fw.py` is one Python file with no dependencies. It checks the manifest signature, downloads each file from the sources in order with resume, and checks size and sha256.

```
python3 fw.py get https://freeweights.allternit.com/manifests/BAAI/bge-small-en-v1.5.json --dir bge-small --pubkey spec/keys/freeweights-v0.pub
```

It needs the `minisign` program to check the signature (`brew install minisign` on macOS). Without it, fw.py stops. You can pass `--no-verify-sig`, but then the manifest is not authenticated. Get `fw.py` and the public key file from the repository.

## Way 2, Hugging Face tools {#hf}

Set one variable and use the tools you already have.

```
export HF_ENDPOINT=https://freeweights.allternit.com
export HF_HUB_DISABLE_IMPLICIT_TOKEN=1
hf download BAAI/bge-small-en-v1.5 --local-dir bge-small
```

Do not send a Hugging Face token. A request that carries one is refused with 401. See the HF_ENDPOINT page for what works.

## Way 3, plain links {#links}

Every file has a URL:

```
curl -L -O https://freeweights.allternit.com/BAAI/bge-small-en-v1.5/resolve/main/config.json
```

The server answers with a redirect to the best live source, so use `-L`. For large files `aria2c -x4 -s4 <url>` works, because range requests pass through the redirect.

## Check what you got {#check}

The Hugging Face tools and plain links do not check hashes for you. Check them against the manifest:

```
python3 fw.py verify bge-small manifests/BAAI__bge-small-en-v1.5.json --pubkey spec/keys/freeweights-v0.pub
```

Look for `VERDICT: PASS`. The Verify page explains each step and how to check by hand.
