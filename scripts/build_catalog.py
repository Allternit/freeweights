#!/usr/bin/env python3
"""Build the full Freeweights catalog (Phase 0.8) from catalog/_audit/licenses.csv.

  build_catalog.py [--only org/repo ...] [--no-sign]

Per CSV row: redistribution yes -> signed manifest + row (From source badge);
custom licenses and gated sets -> manifest + row with requires_terms; non-commercial ->
row only (never hosted); US-excluded, unclear and pickle-only -> catalog/refused.json.
Writes catalog/rows/*.json, catalog/catalog.json, catalog/refused.json, manifests/*.
Resumable: a repo whose manifest already matches the pinned commit is not rebuilt.
Stdlib only. HF token is used only by make_manifest.http on 401/403, never printed."""
import argparse, csv, datetime, glob, json, os, subprocess, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_manifest as mm
import licenses  # the one license table (policy/licenses.json)

ROOT = mm.ROOT
CAT = os.path.join(ROOT, "catalog")
MAN = os.path.join(ROOT, "manifests")
SITE = "https://freeweights.allternit.com"
# Rows not in the CSV that Phase 0 already manifested and the plan keeps.
EXTRA = [{"repo": "onnx-community/Kokoro-82M-v1.0-ONNX", "kind": "model", "section": "alt.freeweights.speech", "license_id": "Apache-2.0",
          "redistribution": "yes", "gated": "no", "license_file": "", "pinned_commit": "",
          "upstream_url": "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX", "notes": "Replaces hexgrad/Kokoro-82M (pickle-only weights)."}]
NONCOMM_NOTE = ("Freeweights never hosts a copy of this model, and Allternit does not run it commercially. "
                "The license allows non-commercial use only. Listed with a link to the source.")
# Source-only rows whose reason is not "non-commercial" (redistribution "no" in the CSV).
SOURCE_ONLY = {
    "tencent/HunyuanVideo-1.5": ("custom", "Freeweights does not host a copy. The Tencent Hunyuan Community License covers only its Territory, "
                                 "which excludes the European Union, the United Kingdom and South Korea, and a worldwide hub cannot limit "
                                 "who downloads. Listed with a link to the source; read the license there before you download."),
}
GATED_MODEL_NOTE = ("Gated at the source: listed as a link only, and no copy is hosted. Accept the license on the model page "
                    "at the source, then download from there.")
# Abliterated rows: family of the base model and what the uploader changed (from each model card).
ABLITERATED = {
    "huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF": ("qwen",
        "Refusal directions removed from Qwen/Qwen3.8-27B by abliteration (huihui-ai; layers 22 to 52 on the newer series). "
        "Also ships patch files that apply the change to unsloth/Qwen3.8-27B-GGUF quants, and series built from community fine-tunes."),
    "alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF": ("qwen",
        "Weights are ISTA-DASLab's GSQ-RCO quants of Qwen3.8-Flash-Next, unchanged. Adds one 480 KB control vector, the refusal "
        "direction taken from huihui-ai's abliterated checkpoint, that the Strata engine subtracts at run time."),
    "alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF": ("glm",
        "Weights are Project Maya's Maya-M quant of GLM-5.3-Flash, unchanged. Adds a 2.2 MB vector (3 refusal directions per layer, "
        "layers 1 to 44) and a Maya engine patch that removes them at run time."),
    "huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF": ("deepseek",
        "Refusal directions removed from deepseek-ai/DeepSeek-V4.1-Flash-1017 by abliteration (huihui-ai, llama.cpp cvector method). "
        "Several series are built on ISTA-DASLab and unsloth quants of the same model."),
}
DS_EXT = {".parquet": "parquet", ".jsonl": "jsonl", ".json": "json", ".csv": "csv", ".arrow": "arrow", ".txt": "text"}

def now(): return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
def fname(repo): return repo.replace("/", "__")
def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8", newline="\n").write(mm.canonical(obj))

def formats_of(paths, dataset, lib_mlx):
    low = [p.lower() for p in paths]
    if dataset:
        f = {DS_EXT[e] for p in low for e in DS_EXT if p.endswith(e) or p.endswith(e + ".gz")}
        return sorted(f) or ["other"]
    f = set()
    if any(p.endswith(".safetensors") for p in low): f.add("safetensors")
    if any(p.endswith(".gguf") for p in low): f.add("gguf")
    if any(p.endswith(".onnx") for p in low): f.add("onnx")
    if lib_mlx or any(p.endswith(".npz") for p in low):
        f.discard("safetensors"); f.add("mlx")
    return sorted(f)

def first(x):
    if isinstance(x, list): return first(x[0]) if x else None
    return x if isinstance(x, str) else None

def meta(repo, commit, dataset):
    kind = "datasets" if dataset else "models"
    return mm.http(f"https://huggingface.co/api/{kind}/{repo}/revision/{commit}")

def family_of(sec, repo):
    name = sec.rsplit(".", 1)[1]
    if repo in ABLITERATED: return ABLITERATED[repo][0]
    return repo.split("/")[0] if name in ("speech", "embed", "image", "video", "music", "ocr", "datasets") else name

def make_row(c, man, info, now_ts, cls, terms, note=None, link_only=False, total=None, fmts=None):
    repo, dataset = c["repo"], c["kind"] == "dataset"
    card = info.get("cardData") or {}
    if dataset:
        tasks = [t for t in (card.get("task_categories") or []) if isinstance(t, str)] or ["dataset"]
    else:
        tasks = [info["pipeline_tag"]] if info.get("pipeline_tag") else ["text-generation"]
    params = (info.get("safetensors") or {}).get("total")
    sec = c["section"]
    row = {"id": repo, "display_name": repo.split("/")[1], "section": sec, "family": family_of(sec, repo), "tasks": tasks,
           "license_id": c["license_id"], "redistribution": c["_redis"],
           "formats": fmts, "total_size": total, "params": params if isinstance(params, int) else None,
           "base_model": first(card.get("base_model")), "abliterated": repo in ABLITERATED,
           "what_changed": ABLITERATED[repo][1] if repo in ABLITERATED else None, "badges": ["source"],
           "upstream_url": c["upstream_url"], "added_at": now_ts, "license_class": cls, "requires_terms": terms}
    if man: row["manifest_url"] = f"{SITE}/manifests/{repo}.json"
    lf = c.get("license_file", "")
    if terms: row["license_url"] = f"{c['upstream_url']}/blob/{c['pinned_commit'] or 'main'}/{lf}" if lf and lf != "none" and not dataset else c["upstream_url"]
    if note: row["note"] = note
    return row

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only", nargs="*"); ap.add_argument("--no-sign", action="store_true")
    a = ap.parse_args()
    cands = list(csv.DictReader(open(os.path.join(CAT, "_audit", "licenses.csv"), encoding="utf-8"))) + EXTRA
    check, mschema = mm.load_validator()
    cschema = json.load(open(os.path.join(ROOT, "spec", "catalog-schema.json")))
    key = os.path.expanduser("~/.config/freeweights/minisign.key")
    seen, rows, refused = set(), [], []
    ts = now()
    # Keep added_at for rows that already exist; only new rows get today's date.
    prev_added = {}
    for old in glob.glob(os.path.join(CAT, "rows", "*.json")):
        d = json.load(open(old, encoding="utf-8")); prev_added[d["id"]] = d.get("added_at")
    for c in cands:
        repo = c["repo"]
        if repo in seen: print("dup skip", repo); continue
        seen.add(repo)
        if a.only and repo not in a.only: continue
        dataset = c["kind"] == "dataset"
        red, lid = c["redistribution"], c["license_id"]
        def refuse(reason): refused.append({"id": repo, "license_id": lid, "upstream_url": c["upstream_url"], "reason": reason}); print("REFUSED", repo, reason)
        if red == "no":
            if "excludes the united states" in (c["notes"] + c["quoted_clause"]).lower() or "territory" in c["notes"].lower() and "United States" in c["notes"] or repo.startswith("MiniMaxAI/MiniMax-H3"):
                refuse("License excludes the United States (Applicable Territory is worldwide except the EU, UK, South Korea and the US). Distribution from a US host is outside the grant."); continue
            c["_redis"] = "no"
            info = meta(repo, c["pinned_commit"], False)
            sib = mm.http(f"https://huggingface.co/api/models/{repo}/revision/{c['pinned_commit']}?blobs=true").get("siblings", [])
            total = sum(int((s.get("lfs") or {}).get("size", s.get("size") or 0)) for s in sib)
            fm = formats_of([s["rfilename"] for s in sib], False, info.get("library_name") == "mlx") or ["safetensors"]
            cls, note = SOURCE_ONLY.get(repo, ("non-commercial", NONCOMM_NOTE))
            rows.append(make_row(c, False, info, ts, cls, True, note, total=total, fmts=fm)); print("source-only row", repo); time.sleep(1); continue
        if red == "unclear": refuse("license unclear — needs review"); continue
        if repo == "hexgrad/Kokoro-82M": refuse("pickle-only weights; replaced by onnx-community/Kokoro-82M-v1.0-ONNX"); continue
        if c["gated"] == "yes" and not dataset:
            # Gated model: the public file listing gives size and formats; no manifest, no copy.
            c["_redis"] = "click-through"
            info = mm.http(f"https://huggingface.co/api/models/{repo}/revision/{c['pinned_commit']}?blobs=true")
            sib = info.get("siblings", [])
            total = sum(int((s.get("lfs") or {}).get("size", s.get("size") or 0)) for s in sib)
            fm = formats_of([s["rfilename"] for s in sib], False, info.get("library_name") == "mlx")
            rows.append(make_row(c, False, info, ts, "gated", True, GATED_MODEL_NOTE, total=total, fmts=fm)); print("gated model row", repo); time.sleep(1); continue
        if red == "click-through" and c["gated"] == "yes":
            c["_redis"] = "click-through"
            info = mm.http(f"https://huggingface.co/api/datasets/{repo}")
            rows.append(make_row(c, False, info, ts, "gated", True, "Gated dataset: listed as a link only, with no file listing and no copy hosted. Accept the gate terms at the source (do not reveal examples in plain text or images online).", total=0, fmts=[])); print("gated row", repo); time.sleep(1); continue
        # downloadable: manifest + row
        out = os.path.join(MAN, fname(repo) + ".json")
        commit = c["pinned_commit"] or None
        have = None
        if os.path.exists(out) and os.path.exists(out + ".minisig"):
            have = json.load(open(out))
            if (commit and have["upstream"]["commit"] != commit) or have["section"] != c["section"]: have = None
            elif repo in mm.subsets() and not all(mm.included(f["path"], mm.subsets()[repo]) for f in have["files"]): have = None
        if have: m = have
        else:
            try: m = mm.build(repo, commit, dataset, c["section"])
            except mm.Refused as e: refuse(str(e)); continue
            time.sleep(1)
        permissive = licenses.is_permissive(lid)
        c["_redis"] = "yes" if permissive else "click-through"
        m["license"]["id"] = lid
        m["license"]["name"] = licenses.name(lid)
        m["license"]["redistribution"] = c["_redis"]
        errs = check(m, mschema)
        if errs: print("MANIFEST ERRORS", repo, errs); sys.exit(1)
        write(out, m)
        sig = out + ".minisig"
        if os.path.exists(sig): os.remove(sig)
        if not a.no_sign:
            subprocess.run(["minisign", "-S", "-m", out, "-s", key, "-x", sig, "-t", f"freeweights manifest {repo} {m['upstream']['commit'][:12]}"], check=True, capture_output=True)
        info = meta(repo, m["upstream"]["commit"], dataset)
        paths = [f["path"] for f in m["files"]]
        fm = formats_of(paths, dataset, info.get("library_name") == "mlx" or repo.startswith("mlx-community/"))
        c["pinned_commit"] = m["upstream"]["commit"]
        row = make_row(c, True, info, ts, "permissive" if permissive else "custom", not permissive, fmts=fm, total=sum(f["size"] for f in m["files"]))
        rows.append(row); print("ok", repo, len(m["files"]), "files", row["total_size"], "bytes"); time.sleep(1)
    if a.only: return
    # validate + write
    secs = json.load(open(os.path.join(ROOT, "spec", "catalog-schema.json")))["x-sections"]
    bad = 0
    for r in rows:
        e = check(r, cschema)
        if e: bad += 1; print("ROW ERRORS", r["id"], e)
    if bad: sys.exit(1)
    for r in rows:
        if prev_added.get(r["id"]): r["added_at"] = prev_added[r["id"]]
    for old in glob.glob(os.path.join(CAT, "rows", "*.json")): os.remove(old)
    for r in rows: write(os.path.join(CAT, "rows", fname(r["id"]) + ".json"), r)
    rows.sort(key=lambda r: (r["section"], r["id"]))
    cat = {"sections": [dict(s, count=sum(r["section"] == s["id"] for r in rows)) for s in secs], "models": rows}
    e = check(cat, cschema)
    if e: print("CATALOG ERRORS", e); sys.exit(1)
    write(os.path.join(CAT, "catalog.json"), cat)
    write(os.path.join(CAT, "refused.json"), sorted(refused, key=lambda r: r["id"]))
    print("\nlisted", len(rows), "refused", len(refused), "total bytes", sum(r["total_size"] for r in rows))
    for s in cat["sections"]: print(f"  {s['id']}: {s['count']}")

if __name__ == "__main__": main()
