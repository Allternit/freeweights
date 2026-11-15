# Catalog overlays

One JSON file per enrichment (`cloud.json`, `readme.json`, `facets.json`, ...), shaped `{ "<model id>": { ... } }`. Keys starting with `_` are metadata. The site build attaches each entry to the row as `r.overlay.<file name>`. Overlays add display data only; they never change a signed manifest.

## device.json, device-siblings.json (on-device models)

`node scripts/build_device_overlay.mjs` writes both from the signed manifests (offline, deterministic; sizes are manifest file sizes). `device.json` maps a model id to `{quants:[{name, format, engine, files, size, best_for, repo?, mmproj?}], device_formats}`. `repo` is set when a quant comes from a sibling repo (a GGUF/MLX/ONNX build of the base model); `device-siblings.json` lists those siblings per base id. `_recommended` is the curated allowlist from `device-recommended.src.json`; the generator fails on a denylist match, a non-permissive licence, or a model with no 4-bit-or-better quant that fits the class. `ram_est` is omitted (manifests carry no config.json); clients use size x 1.2 + 0.4 GB. Run it after `build_catalog.py` and commit the output. `site/build.mjs` then writes `device/<id>.json` and `device/index.json` into the R2 tree for `sync_r2.py`; the Worker serves them at `/api/models/:org/:name/device` and `/api/device/index`.

Need rule: native engines use size x 1.2 + 0.4 GB; webgpu quants use size x 1.2 (the browser budget is a GPU buffer cap). `best_for` values: phone (need <= 1.8 GB), laptop (<= 12 GB), workstation (above), browser (webgpu need <= 1.6 GB, size <= ~1.33 GB) and `phone_browser` (webgpu need <= 0.36 GB, size <= 300 MB). `phone_browser` is a fifth value; in the `/api/device/index` mask it is bit 16 (phone 1, laptop 2, workstation 4, browser 8).
