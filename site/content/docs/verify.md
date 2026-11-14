---
title: Verify a download
nav_label: Verify
summary: How to check a manifest signature, a file hash and a whole download with stock tools.
group: Start
order: 2
updated: 2026-11-14
sections:
  - {id: trust-chain, title: The trust chain}
  - {id: key, title: The signing key}
  - {id: manifest-sig, title: Check a manifest}
  - {id: sha256, title: Check a file}
  - {id: fw-verify, title: Check everything with fw.py}
  - {id: on-failure, title: If a check fails}
---
Never trust a download because of where it came from. Check it. Freeweights gives you what you need for that.

## The trust chain {#trust-chain}

1. The **manifest** names every file with its size and sha256 and the license. It is signed.
2. The **signature** proves the manifest came from the Freeweights key.
3. The **hashes** prove your files are the files in the manifest.

Torrent hashes are never the trust root. They are only another way to get the bytes.

## The signing key {#key}

- Key id: `2DC28CC7B26A283B` (key name freeweights-v0, made 2026-11-14)
- Public key: `RWQ7KGqyx4zCLXtUFOqvfv8L3g+8fpKJ1FsuxPyOYMF+4KufbUxKq1Oq`
- File: `spec/keys/freeweights-v0.pub` in the repository

The v0 secret key has no password and is kept outside the repository. We rotate to an offline, password-protected key before Stage 1. A new key signs a `keys.json` that the old key also signs, and both stay listed for 90 days. Compare the key shown here with the one in the repository and the README. If they differ, stop.

## Check a manifest {#manifest-sig}

Install minisign. Then:

```
curl -O https://freeweights.allternit.com/manifests/Qwen/Qwen3-Embedding-0.6B.json
curl -O https://freeweights.allternit.com/manifests/Qwen/Qwen3-Embedding-0.6B.json.minisig
minisign -Vm Qwen3-Embedding-0.6B.json -P RWQ7KGqyx4zCLXtUFOqvfv8L3g+8fpKJ1FsuxPyOYMF+4KufbUxKq1Oq
```

The signature covers the exact bytes. Do not reformat the file. Clients must reject a manifest whose signature fails or whose bytes are not canonical.

## Check a file {#sha256}

Find the file in the manifest's `files` list. Compare size and sha256.

```
shasum -a 256 model.safetensors     # macOS
sha256sum model.safetensors         # Linux
```

The hex must equal the manifest's `sha256`, and the size in bytes must equal `size`.

## Check everything with fw.py {#fw-verify}

```
python3 fw.py verify <dir> <manifest> --pubkey spec/keys/freeweights-v0.pub
```

It checks the signature, then every file. It prints `VERDICT: PASS` and the count (for example 14 of 14 files verified), or lists each file that is missing, the wrong size or the wrong hash.

## If a check fails {#on-failure}

Discard the file and try the next source. If every source fails, tell us at freeweights@allternit.com with the model id and the file. A failed signature may mean a bad copy or a bad key. Do not use the files.
