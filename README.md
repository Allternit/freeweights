# Allternit Freeweights

open models, free to download. — freeweights.allternit.com

Allternit Freeweights is the open source alternative's commons for open AI model weights:
a public catalog where every file has a license, a checksum and a signed manifest, and every
model says where its bytes come from (Hosted by Allternit, Community seeded, From source).

Status: live at https://freeweights.allternit.com (Stage 0, 0 USD). Run by Allternit, the open source alternative. Rules: site/content/mission.md (Operating Statement) and policy/.

| Path | What |
|---|---|
| spec/ | manifest-v0, catalog schema, hub API contract |
| scripts/ | manifest builder, fw.py downloader/verifier, catalog builder, discover.py (Hugging Face facts), classify.py (inclusion gates, no network), select_batch.py (batch picks), select_listall.py (lists every repo the review queue held: hosted or from the publisher), select_batch3.py (lists the hostable discovered repos the batch-1 wave caps left out), licenses.py, formats.py, registry_chain.py (signed catalog snapshots), fw_admin.py (takedown, stats), blocklist.py |
| catalog/ | generated catalog rows; _audit/ license audit |
| worker/ | Cloudflare Worker (read API, redirects, counts) |
| site/ | static site (freeweights.allternit.com) |
| policy/ | ethos, content and inclusion policy, takedown, license table (licenses.json), support terms |
| ledger/, mirrors/ | public cost ledger (chain.jsonl), registry chain of catalog snapshots and takedowns (registry.jsonl, snapshot.json), mirror registry |


## Install the fw CLI

```
brew install allternit/tap/fw          # macOS and Linux (Homebrew)
pipx install allternit-freeweights     # any platform with pipx
pip install allternit-freeweights      # into the current Python environment
```

Then `fw search qwen`, `fw info <model-id>`, `fw get <model-id>`. `fw get` checks the signed manifest with `minisign` (`brew install minisign`). The CLI uses only the Python standard library. From a checkout you can also run `python3 scripts/fw.py ...`. Reference: https://freeweights.allternit.com/docs/fw. Maintainers: see RELEASING.md.

Checks: `python3 scripts/validate_spec.py` (schemas, catalog rows, license table), `python3 -m unittest discover -s scripts -p 'test_*.py'`,
`python3 -m unittest discover -s tests`, `python3 scripts/build_catalog.py --offline --no-sign` (rebuild rows with no network; never touches a signature), `python3 scripts/verify_ledger.py` (money and registry chains; add `--snapshot-against manifests/` to recompute the snapshot root).
Takedowns: `python3 scripts/fw_admin.py takedown <org/repo> --reason <class> --dry-run` (process: site/content/docs/takedowns.md, policy/takedown.md).
After editing policy/licenses.json, run `python3 scripts/licenses.py --write-docs`.

Code: Apache-2.0 (LICENSE). Catalog, manifests and ledger data: CC0 (LICENSE-CC0.txt in each folder). Future C tools: MIT. Model weights keep their own licenses, listed per model.
