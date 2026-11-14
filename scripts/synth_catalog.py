#!/usr/bin/env python3
"""Make a synthetic site root for scale tests (A14). Nothing is written into the repo.

  python3 scripts/synth_catalog.py 5000 /tmp/fw-synth      # then: FW_ROOT=/tmp/fw-synth FW_OUT=/tmp/fw-synth-dist node site/build.mjs

The root holds symlinks to the real spec, policy, ledger, mirrors, manifests and site, plus a catalog/ with the
real rows and N - (real rows) synthetic ones: about half quantized builds of a listed base, some fine-tunes,
tiers on a share of the bases, and 30-day downloads that fall off like the measured distribution.
"""
import json, os, random, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    n = int(sys.argv[1]); out = os.path.abspath(sys.argv[2])
    if os.path.exists(out):
        shutil.rmtree(out)
    os.makedirs(os.path.join(out, "catalog", "rows"))
    for d in ("spec", "policy", "ledger", "mirrors", "manifests", "site", "docs"):
        if os.path.exists(os.path.join(ROOT, d)):
            os.symlink(os.path.join(ROOT, d), os.path.join(out, d))
    cat = os.path.join(ROOT, "catalog")
    for f in ("tools.json",):
        if os.path.exists(os.path.join(cat, f)):
            shutil.copy(os.path.join(cat, f), os.path.join(out, "catalog", f))
    real = []
    rd = os.path.join(cat, "rows")
    for f in sorted(os.listdir(rd)):
        if f.endswith(".json"):
            row = json.load(open(os.path.join(rd, f))); real.append(row)
            shutil.copy(os.path.join(rd, f), os.path.join(out, "catalog", "rows", f))
    secs = [s["id"] for s in json.load(open(os.path.join(ROOT, "spec", "catalog-schema.json"))).get("x-sections", []) if s["id"] != "alt.freeweights.tools"]
    rnd = random.Random(7); tpl = real[0]; bases = []; tasks = ["text-generation", "feature-extraction", "automatic-speech-recognition", "image-text-to-text", "text-to-image", "sentence-similarity"]
    fmts = [["safetensors"], ["gguf"], ["onnx"], ["safetensors", "gguf"], ["mlx"]]
    for i in range(max(0, n - len(real))):
        sec = rnd.choice(secs); fam = sec.replace("alt.freeweights.", ""); org = rnd.choice([fam + "-ai", "community" + str(rnd.randrange(300)), "quanter" + str(rnd.randrange(12)), fam.capitalize()])
        isq = bases and rnd.random() < 0.46
        parent = rnd.choice(bases) if isq else None
        kind = rnd.random()
        rel = {"type": "quant", "parent": parent["id"]} if isq else ({"type": "finetune", "parent": rnd.choice(bases)["id"]} if bases and kind < 0.15 else {"type": "base", "parent": None})
        name = f"{fam.capitalize()}-{i:05d}-{rnd.choice(['7B', '14B', '32B', 'Base', 'Instruct'])}" + ("-GGUF" if isq else "")
        r = dict(tpl)
        r.update(id=f"{org}/{name}", display_name=name, section=sec, family=fam, tasks=[rnd.choice(tasks)], formats=rnd.choice(fmts), total_size=rnd.randrange(5 * 10**8, 6 * 10**11),
                 params=rnd.choice([0, 135 * 10**6, 8 * 10**9, 32 * 10**9, 70 * 10**9]), relation=rel, abliterated=False, added_at=f"2026-{rnd.randrange(1, 12):02d}-{rnd.randrange(1, 28):02d}T06:00:00Z",
                 tier=("T0" if (not isq and org.endswith("-ai")) else rnd.choice([None, "T1", "T2", "variant"] if isq else [None, "T1", "T2"])),
                 signals={"downloads_30d": int(3.5e5 / (1 + i) ** 0.5 * rnd.random()), "likes": rnd.randrange(0, 900), "trending": None},
                 upstream_url=f"https://huggingface.co/{org}/{name}", manifest_url=None, license_class=rnd.choice(["permissive", "permissive", "custom", "gated"]),
                 license_id=rnd.choice(["apache-2.0", "mit", "LicenseRef-Custom"]), base_model=parent["id"] if parent else None)
        if not isq and rel["type"] == "base":
            bases.append(r)
        json.dump(r, open(os.path.join(out, "catalog", "rows", f"synth-{i:05d}.json"), "w"))
    print(f"{out}: {len(real)} real + {max(0, n - len(real))} synthetic rows")


main()
