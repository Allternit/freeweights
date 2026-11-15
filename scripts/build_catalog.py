#!/usr/bin/env python3
"""Build the full Freeweights catalog (Phase 0.8) from catalog/_audit/licenses.csv.

  build_catalog.py [--only org/repo ...] [--no-sign] [--offline]

Per CSV row: redistribution yes -> signed manifest + row (From source badge);
custom licenses -> manifest + row with requires_terms (and license_terms when the table has terms);
gated, territory-limited, non-commercial and unclear licenses -> link-only row ("From the publisher",
link_reason gated | territory | non-commercial | not-reviewed, never hosted); pickle-only -> catalog/refused.json.
Every row and manifest carries the license id in SPDX case (licenses.spdx), so filters match one id.
Writes catalog/rows/*.json, catalog/catalog.json, catalog/refused.json, manifests/*.
Resumable: a repo whose manifest already matches the pinned commit is not rebuilt.
Signing: only a manifest whose content changed is signed again (the signature is replaced
atomically). --no-sign never deletes or touches a signature: a signed manifest that would change
is written to .pending/manifests/ (git-ignored, never served) instead, and the signed pair stays as it was.
--offline makes no network call: repo facts come from the existing manifests and catalog rows.
License verdicts come from policy/licenses.json (scripts/licenses.py); a row whose base model has a
stricter verdict inherits it. Every row carries kind, relation and audit {method, at}.
Batches: every catalog/_audit/batches/*.jsonl line (written by select_batch.py from classify.py verdicts)
is a candidate too, with its own audit method, tier and relation. A batch repo's network work (repo info,
small-file hashes, the format header check) runs in --jobs threads first and is cached under
work/build-cache/, so an interrupted run resumes; weights are never downloaded (their sha256 comes from
the Hugging Face lfs data). Gated, non-commercial and link-only batch repos get a row with no manifest.
Stdlib only. HF_TOKEN (env) raises rate limits; it is never printed."""
import argparse, concurrent.futures, csv, datetime, glob, json, os, re, subprocess, sys, threading, time, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_manifest as mm
import licenses  # the one license table (policy/licenses.json)
import classify, formats

ROOT = mm.ROOT
CAT = os.path.join(ROOT, "catalog")
MAN = os.path.join(ROOT, "manifests")
PENDING = os.path.join(ROOT, ".pending", "manifests")
SITE = "https://freeweights.allternit.com"
# Rows not in the CSV that Phase 0 already manifested and the plan keeps.
EXTRA = [{"repo": "onnx-community/Kokoro-82M-v1.0-ONNX", "kind": "model", "section": "alt.freeweights.speech", "license_id": "Apache-2.0",
          "redistribution": "yes", "gated": "no", "license_file": "", "pinned_commit": "",
          "upstream_url": "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX", "notes": "Replaces hexgrad/Kokoro-82M (pickle-only weights)."}]
NONCOMM_NOTE = ("Freeweights never hosts a copy of this model, and Allternit does not run it commercially. "
                "The license allows non-commercial use only. Listed with a link to the source.")
TERRITORY_NOTE = ("Freeweights does not host a copy: the license covers only some countries, and a worldwide hub cannot limit "
                  "who downloads. Listed with a link to the source; read the license there before you download.")
UNREVIEWED_NOTE = "License not reviewed. Read it on the publisher's page. Freeweights does not host a copy."
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
BATCH_DIR = os.path.join(CAT, "_audit", "batches")
CACHE = os.path.join(ROOT, "work", "build-cache")
INFO_KEYS = ("pipeline_tag", "library_name", "cardData", "safetensors", "tags", "gated", "sha", "downloads", "likes")
INHERIT_NOTE = "The license of the base model {} applies: the strictest license along the lineage wins."
DS_EXT = {".parquet": "parquet", ".jsonl": "jsonl", ".json": "json", ".csv": "csv", ".arrow": "arrow", ".txt": "text"}


# ---------- batches (select_batch.py output) ----------
def load_batches():
    out = []
    for p in sorted(glob.glob(os.path.join(BATCH_DIR, "*.jsonl"))):
        for l in open(p, encoding="utf-8"):
            if l.strip(): e = json.loads(l); e["_batch"] = os.path.basename(p)[:-6]; out.append(e)
    return out

def cache_path(e): return os.path.join(CACHE, f"{fname(e['repo'])}@{e['pinned_commit'] or 'main'}.json")

def slim(info):
    d = {k: info.get(k) for k in INFO_KEYS if k in info}
    if isinstance(d.get("safetensors"), dict): d["safetensors"] = {"total": d["safetensors"].get("total")}
    card = d.get("cardData") or {}
    d["cardData"] = {k: card[k] for k in ("base_model", "license", "task_categories") if k in card}
    return d

def prefetch(e):
    """Network work for one batch repo, cached: repo info, then the manifest (or link-only size and formats)."""
    cp = cache_path(e)
    if os.path.exists(cp): return "cached"
    repo, commit = e["repo"], e["pinned_commit"] or None
    info = mm.http(f"https://huggingface.co/api/models/{repo}" + (f"/revision/{commit}" if commit else "") + "?blobs=true")
    sib = info.get("siblings", [])
    res = {"info": slim(info), "commit": info.get("sha")}
    if e["link_only"] or info.get("gated"):
        res.update(link_only=True, gated=bool(info.get("gated")) or e["gated"],
                   total=sum(int((s.get("lfs") or {}).get("size", s.get("size") or 0)) for s in sib),
                   formats=formats_of([s["rfilename"] for s in sib], False, info.get("library_name") == "mlx"))
    else:
        mo = {}
        try:
            res["manifest"] = mm.build(repo, commit, False, e["section"], info=info, license_id=e["license_id"], meta_out=mo)
            res["formats"] = mo.get("formats")
        except mm.Refused as x: res["refused"] = str(x)
    os.makedirs(CACHE, exist_ok=True)
    tmp = cp + ".tmp"
    open(tmp, "w", encoding="utf-8").write(json.dumps(res))
    os.replace(tmp, cp)
    return "refused" if "refused" in res else "link-only" if res.get("link_only") else "manifest"

def prefetch_all(entries, jobs):
    todo = [e for e in entries if not os.path.exists(cache_path(e))]
    print(f"batch prefetch: {len(entries) - len(todo)} cached, {len(todo)} to fetch with {jobs} threads", flush=True)
    lock, done, errs = threading.Lock(), [0], []
    def one(e):
        try: r = prefetch(e)
        except Exception as x: r = f"error {type(x).__name__}: {x}"; errs.append((e["repo"], r))
        with lock:
            done[0] += 1
            if done[0] % 25 == 0 or r.startswith("error"): print(f"  {done[0]}/{len(todo)} {e['repo']}: {r}", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as ex: list(ex.map(one, todo))
    if errs:
        os.makedirs(CACHE, exist_ok=True)
        with open(os.path.join(CACHE, "_errors.log"), "a") as f:
            for repo, r in errs: f.write(f"{now()} {repo} {r}\n")
    return errs

def join(*xs): return " ".join(x for x in xs if x) or None

def link_terms(v, ent=None, inh=None):
    """(license_class, redistribution, requires_terms, note, link_reason) for a link-only verdict, else None."""
    ent = ent or {}
    if v == "gated": return "gated", "click-through", True, join(GATED_MODEL_NOTE, inh), "gated"
    if v == "non-commercial": return "non-commercial", "no", True, join(NONCOMM_NOTE, inh), "non-commercial"
    if v == "territory": return "territory", "no", True, join(ent.get("note"), TERRITORY_NOTE, inh), "territory"
    if v == "unreviewed": return "unreviewed", "no", True, join(UNREVIEWED_NOTE, inh), "not-reviewed"
    return None

def batch_terms(e, res):
    """(license_class, redistribution, requires_terms, note, link_reason) for a batch row. link_reason is None
    for a hosted row. The table's verdict for the row's license wins when it is a stricter link-only one, and
    Hugging Face's gate makes a hostable row link only."""
    v = e["verdict"]
    ent = licenses.entry(e["license_id"]) or {}
    ev = ent.get("verdict")
    if ev in licenses.LINK_ONLY and licenses.stricter(ev, v) == ev: v = ev
    if (res or {}).get("gated") and licenses.hosted(v): v = "gated"
    inh = INHERIT_NOTE.format(e["license_governed_by"]) if e["audit"]["method"] == "inherited" and e.get("license_governed_by") else None
    lt = link_terms(v, ent, inh)
    if lt: return lt
    if e["link_only"]: return v, licenses.redistribution(v), True, join(e.get("link_note") or UNREVIEWED_NOTE, inh), "not-reviewed"
    return v, licenses.redistribution(v), v != "permissive", inh, None

def batch_row(c, res, man, ts, total, fmts):
    cls, red, terms, note, reason = batch_terms(c, res)
    c["_redis"] = red
    row = make_row(c, man and not reason, res["info"], ts, cls, terms, note, total=total, fmts=fmts, reason=reason)
    row["relation"] = {"type": c["relation"]["type"], "parent": c["relation"]["parent"]}
    row["base_model"] = c["relation"]["parent"]
    row["audit"] = {"method": c["audit"]["method"], "at": c["audit"]["at"]}
    row["tier"] = c["tier"]
    row["signals"] = {k: (int(v) if isinstance(v, (int, float)) else None) for k, v in (c.get("signals") or {}).items()}
    if c.get("pipeline_tag"): row["tasks"] = [c["pipeline_tag"]]
    return row

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
    # formats added after a header check (make_manifest.build range-reads one file per format)
    f |= {k for k in formats.candidates(paths) if k in ("coreml", "ctranslate2", "tflite", "openvino", "ggml")}
    return sorted(f)

def first(x):
    if isinstance(x, list): return first(x[0]) if x else None
    return x if isinstance(x, str) else None

class Offline(Exception): pass

def offline_info(prev):
    """The repo facts make_row needs, rebuilt from the previous catalog row (no network)."""
    if not prev: raise Offline()
    tasks = prev.get("tasks") or []
    return {"pipeline_tag": tasks[0] if tasks and tasks != ["dataset"] else None, "library_name": "mlx" if "mlx" in (prev.get("formats") or []) else None,
            "cardData": {"base_model": prev.get("base_model"), "task_categories": [t for t in tasks if t != "dataset"]},
            "safetensors": {"total": prev["params"]} if prev.get("params") else {}, "tags": [],
            "_relation": prev.get("relation"), "_signals": prev.get("signals")}

def meta(repo, commit, dataset):
    kind = "datasets" if dataset else "models"
    return mm.http(f"https://huggingface.co/api/{kind}/{repo}/revision/{commit}")

def family_of(sec, repo):
    name = sec.rsplit(".", 1)[1]
    if repo in ABLITERATED: return ABLITERATED[repo][0]
    return repo.split("/")[0] if name in ("speech", "embed", "image", "video", "music", "ocr", "datasets", "vision") else name

# Same weights in another packaging (quantization, format conversion, ComfyUI repack) count as "quant".
QUANT_HINT = re.compile(r"gguf|mlx|onnx|comfy|gsq|awq|gptq|exl2|fp8|mxfp|nvfp4|int[48]|bnb|[-_.]q[2-8]", re.I)
QUANT_ORGS = {"comfy-org", "onnx-community", "unsloth", "lmstudio-community", "mlx-community", "bartowski", "ista-daslab", "thebloke", "mradermacher", "ggml-org"}

def relation_for(repo, info, base, dataset):
    """relation {type, parent}: from the Hugging Face lineage tags when present, else from base_model."""
    if dataset: return {"type": "base", "parent": None}
    r = classify.relation_of({"tags": info.get("tags") or [], "cardData": {"base_model": base}})
    if any(str(t).startswith("base_model:") for t in info.get("tags") or []): return {"type": r["type"], "parent": r["parent"]}
    if info.get("_relation"): return info["_relation"]
    if not base: return {"type": "base", "parent": None}
    quant = repo not in ABLITERATED and (QUANT_HINT.search(repo.split("/")[1]) or repo.split("/")[0].lower() in QUANT_ORGS)
    return {"type": "quant" if quant else "finetune", "parent": base}

def signals_of(info):
    if info.get("_signals"): return info["_signals"]
    if info.get("downloads") is None and info.get("likes") is None: return None
    return {"downloads_30d": info.get("downloads"), "likes": info.get("likes"), "trending": None}

# Name hints used only when the publisher sets no pipeline tag. Otherwise leave the task empty
# ("not tagged" on the site) rather than guessing text-generation for a speech or image repo.
TASK_HINTS = [(r"tts|text-to-speech", "text-to-speech"), (r"asr|whisper|speech-recognition", "automatic-speech-recognition"),
              (r"embed", "feature-extraction"), (r"rerank", "text-ranking"), (r"tokenizer", None)]
def guess_task(repo):
    name = repo.split("/")[1].lower()
    for pat, task in TASK_HINTS:
        if re.search(pat, name): return [task] if task else []
    return []

def make_row(c, man, info, now_ts, cls, terms, note=None, link_only=False, total=None, fmts=None, reason=None):
    repo, dataset = c["repo"], c["kind"] == "dataset"
    card = info.get("cardData") or {}
    if dataset:
        tasks = [t for t in (card.get("task_categories") or []) if isinstance(t, str)] or ["dataset"]
    else:
        tasks = [info["pipeline_tag"]] if info.get("pipeline_tag") else guess_task(repo)
    params = (info.get("safetensors") or {}).get("total")
    sec = c["section"]
    base = first(card.get("base_model"))
    row = {"id": repo, "kind": c["kind"], "display_name": repo.split("/")[1], "section": sec, "family": family_of(sec, repo), "tasks": tasks,
           "license_id": c["license_id"], "redistribution": c["_redis"],
           "formats": fmts, "total_size": total, "params": params if isinstance(params, int) else None,
           "base_model": base, "relation": relation_for(repo, info, base, dataset), "abliterated": repo in ABLITERATED,
           "what_changed": ABLITERATED[repo][1] if repo in ABLITERATED else None, "badges": ["source"],
           "upstream_url": c["upstream_url"], "added_at": now_ts, "license_class": cls, "requires_terms": terms,
           # every CSV row is a license a person read and recorded (catalog/_audit/licenses.csv)
           "audit": {"method": "reviewed", "at": now_ts}}
    sig = signals_of(info)
    if sig: row["signals"] = sig
    if man: row["manifest_url"] = f"{SITE}/manifests/{repo}.json"
    lf = c.get("license_file", "")
    if terms: row["license_url"] = f"{c['upstream_url']}/blob/{c['pinned_commit'] or 'main'}/{lf}" if lf and lf != "none" and not dataset else c["upstream_url"]
    if note: row["note"] = note
    if reason: row["link_reason"] = reason
    elif man and licenses.terms(c["license_id"]): row["license_terms"] = licenses.terms(c["license_id"])
    return row

def class_rank(r):
    """Strictness of a row's license class for inheritance. A row gated only by Hugging Face's flag (its own
    license is hostable) does not pass "gated" on: its children's files are open."""
    lc = r.get("license_class") or "permissive"
    if lc == "gated" and licenses.hosted(licenses.verdict(r.get("license_id"))): lc = "custom"
    return licenses.STRICTNESS.index(lc) if lc in licenses.STRICTNESS else 0

def inherit(rows):
    """The strictest license class along base -> fine-tune -> quant wins (a quant of a stricter base
    may not list looser). A row that inherits a link-only class loses its manifest_url. Returns the ids that changed."""
    by_id, changed = {r["id"]: r for r in rows}, []
    def chain(r, seen=()):
        best = r
        p = by_id.get((r.get("relation") or {}).get("parent") or "")
        if p and p["id"] not in seen and p["id"] != r["id"]:
            pb = chain(p, seen + (r["id"],))
            if class_rank(pb) > class_rank(best): best = pb
        return best
    for r in rows:
        b = chain(r)
        if b is not r and class_rank(b) > class_rank(r):
            lc = b["license_class"] if not (b["license_class"] == "gated" and class_rank(b) == licenses.STRICTNESS.index("custom")) else "custom"
            lt = link_terms(lc, licenses.entry(b.get("license_id")))
            r["license_class"], r["requires_terms"] = lc, True
            r["redistribution"] = lt[1] if lt else b["redistribution"]
            r["license_url"] = b.get("license_url") or b["upstream_url"]
            r["audit"]["method"] = "inherited"
            r["note"] = join(lt[3] if lt else None, f"The license of the base model {b['id']} applies: the strictest license along the lineage wins.")
            if lt:
                r["link_reason"] = lt[4]; r.pop("manifest_url", None); r.pop("license_terms", None)
            changed.append(r["id"])
    return changed

def migrate(r, c):
    """Bring a row written before kind/relation/audit up to the current schema (kind from the audit CSV, never the section)."""
    r = dict(r)
    r.setdefault("kind", c["kind"])
    r.setdefault("relation", relation_for(r["id"], {}, r.get("base_model"), r["kind"] == "dataset"))
    r.setdefault("audit", {"method": "reviewed", "at": r.get("added_at")})
    return r

def row_file(r, ids):
    """catalog/rows/<org>__<repo>.json; a non-model entry whose id collides with another kind gets a kind prefix."""
    return fname(r["id"]) + ".json" if r["kind"] == "model" or ids[r["id"]] == 1 else f"{r['kind']}__{fname(r['id'])}.json"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only", nargs="*"); ap.add_argument("--no-sign", action="store_true")
    ap.add_argument("--offline", action="store_true", help="no network: reuse existing manifests and catalog rows")
    ap.add_argument("--key", default=os.path.expanduser("~/.config/freeweights/minisign.key"))
    ap.add_argument("--jobs", type=int, default=4, help="threads for batch prefetch (network)")
    ap.add_argument("--prefetch-only", action="store_true", help="fill work/build-cache for batch repos, then stop")
    a = ap.parse_args()
    cands = list(csv.DictReader(open(os.path.join(CAT, "_audit", "licenses.csv"), encoding="utf-8"))) + EXTRA
    batch = [e for e in load_batches() if not (a.only and e["repo"] not in a.only)]
    csv_ids = {c["repo"] for c in cands}
    batch = [e for e in batch if e["repo"] not in csv_ids]  # a person's audit row wins over a rule verdict
    for c in cands + batch: c["license_id"] = licenses.spdx(c["license_id"]) or "unknown"  # one id per license (SPDX case)
    if batch and not a.offline:
        errs = prefetch_all(batch, a.jobs)
        if errs: print(f"batch prefetch: {len(errs)} errors (rerun to retry; work/build-cache/_errors.log)")
    if a.prefetch_only: return
    cands += batch
    check, mschema = mm.load_validator()
    cschema = json.load(open(os.path.join(ROOT, "spec", "catalog-schema.json")))
    key = a.key
    seen, rows, refused = set(), [], []
    signed, unchanged, pending, offline_skip = [], [], [], []
    ts = now()
    # Keep added_at and the audit date for rows that already exist; only new rows get today's date.
    prev = {}
    for old in glob.glob(os.path.join(CAT, "rows", "*.json")):
        d = json.load(open(old, encoding="utf-8")); prev[d["id"]] = d
    def net(fn, repo):
        if not a.offline: return fn()
        return offline_info(prev.get(repo))
    for c in cands:
        repo = c["repo"]
        if repo in seen: print("dup skip", repo); continue
        seen.add(repo)
        if a.only and repo not in a.only: continue
        dataset = c["kind"] == "dataset"
        red, lid = c.get("redistribution"), c["license_id"]  # batch rows get redistribution from batch_terms
        pr = prev.get(repo) or {}
        def refuse(reason): refused.append({"id": repo, "license_id": lid, "upstream_url": c["upstream_url"], "reason": reason}); print("REFUSED", repo, reason)
        if c.get("_batch"):
            res = json.load(open(cache_path(c), encoding="utf-8")) if os.path.exists(cache_path(c)) else None
            if res is None:
                if pr: rows.append(migrate(pr, c)); offline_skip.append(repo); print("kept previous row (no cache)", repo)
                else: print("skipped, needs network:", repo)
                continue
            if res.get("refused"): refuse(res["refused"]); continue
            if res.get("link_only"):
                rows.append(batch_row(c, res, False, ts, res["total"], res["formats"])); continue
            if batch_terms(c, res)[4]:  # cached as hosted, but its license is link only now: no manifest
                mf = res["manifest"]["files"]
                rows.append(batch_row(c, res, False, ts, sum(f["size"] for f in mf), res.get("formats") or formats_of([f["path"] for f in mf], False, False))); continue
            out = os.path.join(MAN, fname(repo) + ".json"); sig = out + ".minisig"
            m = res["manifest"]
            if os.path.exists(out) and os.path.exists(sig):
                have = json.load(open(out, encoding="utf-8"))
                if have["upstream"]["commit"] == m["upstream"]["commit"] and have["section"] == m["section"]: m = have
            cls, red, terms, note, _ = batch_terms(c, res)
            m["license"]["id"], m["license"]["name"], m["license"]["redistribution"] = c["license_id"], licenses.name(c["license_id"]), red
            errs = check(m, mschema)
            if errs: print("MANIFEST ERRORS", repo, errs); sys.exit(1)
            body = mm.canonical(m)
            old = open(out, encoding="utf-8").read() if os.path.exists(out) else None
            if body == old and os.path.exists(sig): unchanged.append(repo)
            elif a.no_sign:
                if os.path.exists(sig): write(os.path.join(PENDING, fname(repo) + ".json"), m); pending.append(repo)
                elif body != old: write(out, m)
            else:
                if body != old: write(out, m)
                mm.sign(out, repo, m["upstream"]["commit"], key); signed.append(repo)
            c["pinned_commit"] = m["upstream"]["commit"]
            rows.append(batch_row(c, res, True, ts, sum(f["size"] for f in m["files"]), res.get("formats") or formats_of([f["path"] for f in m["files"]], False, repo.startswith("mlx-community/"))))
            continue
        try:
            lv = licenses.verdict(lid)
            if lv == "refused":
                refuse(licenses.NO_LICENSE["note"] if licenses.entry(lid) is None else f"License {lid} is on the refused list."); continue
            if red in ("no", "unclear") or lv in licenses.LINK_ONLY:
                # link only, "From the publisher": no manifest, no copy. The table says why; unclear = not reviewed.
                lv = "unreviewed" if red == "unclear" or lv not in licenses.LINK_ONLY else lv
                cls, c["_redis"], _, note, reason = link_terms(lv, licenses.entry(lid))
                info = net(lambda: meta(repo, c["pinned_commit"] or "main", dataset), repo)
                if a.offline: total, fm = pr["total_size"], pr["formats"]
                else:
                    kind = "datasets" if dataset else "models"
                    sib = mm.http(f"https://huggingface.co/api/{kind}/{repo}/revision/{c['pinned_commit'] or 'main'}?blobs=true").get("siblings", [])
                    total = sum(int((s.get("lfs") or {}).get("size", s.get("size") or 0)) for s in sib)
                    fm = formats_of([s["rfilename"] for s in sib], dataset, info.get("library_name") == "mlx") or (["other"] if dataset else ["safetensors"])
                rows.append(make_row(c, False, info, ts, cls, True, note, total=total, fmts=fm, reason=reason)); print("link-only row", repo, reason); a.offline or time.sleep(1); continue
            if repo == "hexgrad/Kokoro-82M": refuse("pickle-only weights; replaced by onnx-community/Kokoro-82M-v1.0-ONNX"); continue
            if c["gated"] == "yes" and not dataset:
                # Gated model: the public file listing gives size and formats; no manifest, no copy.
                c["_redis"] = "click-through"
                info = net(lambda: mm.http(f"https://huggingface.co/api/models/{repo}/revision/{c['pinned_commit']}?blobs=true"), repo)
                if a.offline: total, fm = pr["total_size"], pr["formats"]
                else:
                    sib = info.get("siblings", [])
                    total = sum(int((s.get("lfs") or {}).get("size", s.get("size") or 0)) for s in sib)
                    fm = formats_of([s["rfilename"] for s in sib], False, info.get("library_name") == "mlx")
                rows.append(make_row(c, False, info, ts, "gated", True, GATED_MODEL_NOTE, total=total, fmts=fm, reason="gated")); print("gated model row", repo); a.offline or time.sleep(1); continue
            if red == "click-through" and c["gated"] == "yes":
                c["_redis"] = "click-through"
                info = net(lambda: mm.http(f"https://huggingface.co/api/datasets/{repo}"), repo)
                rows.append(make_row(c, False, info, ts, "gated", True, "Gated dataset: listed as a link only, with no file listing and no copy hosted. Accept the gate terms at the source (do not reveal examples in plain text or images online).", total=0, fmts=[], reason="gated")); print("gated row", repo); a.offline or time.sleep(1); continue
            # downloadable: manifest + row
            out = os.path.join(MAN, fname(repo) + ".json")
            sig = out + ".minisig"
            commit = c["pinned_commit"] or None
            have = None
            if os.path.exists(out) and (os.path.exists(sig) or a.offline):
                have = json.load(open(out))
                if (commit and have["upstream"]["commit"] != commit) or have["section"] != c["section"]: have = None
                elif repo in mm.subsets() and not all(mm.included(f["path"], mm.subsets()[repo]) for f in have["files"]): have = None
            if have: m = have
            elif a.offline: raise Offline()
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
            body = mm.canonical(m)
            old = open(out, encoding="utf-8").read() if os.path.exists(out) else None
            if body == old and os.path.exists(sig): unchanged.append(repo)
            elif a.no_sign:
                if os.path.exists(sig):
                    # never break a signed pair without signing: park the new content for the next signed run
                    write(os.path.join(PENDING, fname(repo) + ".json"), m); pending.append(repo)
                elif body != old: write(out, m)
            else:
                if body != old: write(out, m)
                mm.sign(out, repo, m["upstream"]["commit"], key); signed.append(repo)
                if os.path.exists(os.path.join(PENDING, fname(repo) + ".json")): os.remove(os.path.join(PENDING, fname(repo) + ".json"))
            info = net(lambda: meta(repo, m["upstream"]["commit"], dataset), repo)
            paths = [f["path"] for f in m["files"]]
            fm = formats_of(paths, dataset, info.get("library_name") == "mlx" or repo.startswith("mlx-community/"))
            c["pinned_commit"] = m["upstream"]["commit"]
            row = make_row(c, True, info, ts, "permissive" if permissive else "custom", not permissive, fmts=fm, total=sum(f["size"] for f in m["files"]))
            rows.append(row); print("ok", repo, len(m["files"]), "files", row["total_size"], "bytes"); a.offline or time.sleep(1)
        except Offline:
            if pr: rows.append(migrate(pr, c)); offline_skip.append(repo); print("offline: kept previous row", repo)
            else: print("offline: skipped, needs network", repo)
    print(f"\nmanifests: {len(signed)} signed, {len(unchanged)} unchanged, {len(pending)} pending a signature (.pending/manifests/, not served)")
    if a.only: return
    # validate + write
    for r in rows:
        p = prev.get(r["id"]) or {}
        if p.get("added_at"): r["added_at"] = p["added_at"]
        if r.get("audit") and r is not p: r["audit"]["at"] = (p.get("audit") or {}).get("at") or r["added_at"]
    for rid in inherit(rows): print("inherited a stricter base license:", rid)
    # a row with no manifest_url is link only: a manifest left from an earlier build is no longer served
    stale = [r["id"] for r in rows if not r.get("manifest_url") and os.path.exists(os.path.join(MAN, fname(r["id"]) + ".json"))]
    for rid in stale:
        for ext in (".json", ".json.minisig"):
            fp = os.path.join(MAN, fname(rid) + ext)
            if os.path.exists(fp): os.remove(fp)
        print("link only now, removed its manifest:", rid)
    secs = json.load(open(os.path.join(ROOT, "spec", "catalog-schema.json")))["x-sections"]
    bad = 0
    for r in rows:
        e = check(r, cschema)
        if e: bad += 1; print("ROW ERRORS", r["id"], e)
    if bad: sys.exit(1)
    for old in glob.glob(os.path.join(CAT, "rows", "*.json")): os.remove(old)
    keys = [(r["kind"], r["id"]) for r in rows]
    if len(set(keys)) != len(keys): print("DUPLICATE (kind, id)", sorted(k for k in keys if keys.count(k) > 1)); sys.exit(1)
    ids = {}
    for r in rows: ids[r["id"]] = ids.get(r["id"], 0) + 1
    for r in rows: write(os.path.join(CAT, "rows", row_file(r, ids)), r)
    rows.sort(key=lambda r: (r["section"], r["id"], r["kind"]))
    cat = {"sections": [dict(s, count=sum(r["section"] == s["id"] for r in rows)) for s in secs], "models": rows}
    e = check(cat, cschema)
    if e: print("CATALOG ERRORS", e); sys.exit(1)
    write(os.path.join(CAT, "catalog.json"), cat)
    write(os.path.join(CAT, "refused.json"), sorted(refused, key=lambda r: r["id"]))
    print("\nlisted", len(rows), "refused", len(refused), "total bytes", sum(r["total_size"] for r in rows))
    for s in cat["sections"]: print(f"  {s['id']}: {s['count']}")

if __name__ == "__main__": main()
