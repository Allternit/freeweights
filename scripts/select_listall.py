#!/usr/bin/env python3
"""List every repo the review queue held: "if Hugging Face lists it, Freeweights lists it". No network. Stdlib only.

  select_listall.py catalog/_audit/batches/batch1-waves.json work/candidates-batch1.jsonl work/verdicts-batch2.jsonl
                    --held work/verdicts-batch1.jsonl --batch batch2
                    [--out catalog/_audit/batches/batch2.jsonl] [--queue catalog/_review/queue.json]

Picks the repos the earlier batch held in the review queue (old verdict "queue", in the batch's orgs, with a tier
hint or as a variant), re-read with the current license table (classify.py output). Each becomes one entry:
  - hosted (signed manifest) when the verdict is permissive or custom (the license allows copies with no
    acceptance gate and no territory limit; terms such as OpenMDW, LFM or OpenRAIL++ show on the entry);
  - link only ("From the publisher") otherwise, with link_reason gated | territory | non-commercial | not-reviewed.
Still not listed: a repo the content gate holds for a person (verdict queue) and any refusal (sexual content,
pickle-only weights, no license). Those stay in the review queue file, which now lists only what is held.
Sections: a quantization or adapter takes its listed parent's section; else the org or name family; else the
task; else alt.freeweights.text. Exact re-uploads (same_as, not canonical) are skipped as before."""
import argparse, collections, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import licenses  # noqa: E402
from select_batch import load_jsonl, modality_section, IMAGE, VIDEO, MUSIC_NAME, VIDEO_NAME  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# name families, checked in order (whole-word-ish, on the repo name)
NAME_FAMILY = [(r"qwen|qwq", "qwen"), (r"deepseek", "deepseek"), (r"kimi|moonlight", "kimi"), (r"glm|chatglm|cogview", "glm"),
               (r"minimax", "minimax"), (r"mimo", "mimo"), (r"gemma", "gemma"), (r"gpt-oss", "gpt-oss"), (r"olmo|tulu|molmo", "olmo"),
               (r"nemotron", "nemotron"), (r"(^|[-_.])phi[-_.]?\d", "phi"), (r"mistral|ministral|magistral|devstral|codestral|pixtral|voxtral", "mistral"),
               (r"granite", "granite"), (r"smollm|smolvlm", "smollm"), (r"minicpm", "minicpm"), (r"llama", "llama"), (r"lfm\d", "lfm")]
VARIANT = ("quant", "adapter")
IMAGE_VIDEO_ORGS = {"Comfy-Org", "stabilityai", "black-forest-labs", "Wan-AI"}

def section_of(rec, ver, fam, sections, listed_sections, lower):
    name, task = rec["name"], rec.get("pipeline_tag")
    if ver.get("kind") == "dataset": return "alt.freeweights.datasets", None
    rel = ver["relation"]
    if rel["type"] in VARIANT and rel.get("parent"):
        pid = rel["parent"]
        par = pid if pid in listed_sections else lower.get(pid.lower())
        if par: return listed_sections[par], par
    f = fam.get(rec["org"].lower())
    if f and (not f.get("name_match") or re.search(f["name_match"], name, re.I)): return f["section"], None
    for pat, sec in NAME_FAMILY:
        if re.search(pat, name, re.I) and f"alt.freeweights.{sec}" in sections: return f"alt.freeweights.{sec}", None
    if task in ("text-to-audio", "text-to-music") or (task in IMAGE | VIDEO and MUSIC_NAME.search(name)): return "alt.freeweights.music", None
    if rec["org"] in IMAGE_VIDEO_ORGS and not task:
        # image and video labs that set no task: the same name rule as batch 1's image-video wave
        if MUSIC_NAME.search(name) or re.search(r"audio", name, re.I): return "alt.freeweights.music", None
        return ("alt.freeweights.video" if VIDEO_NAME.search(name) else "alt.freeweights.image"), None
    if task in VIDEO or (task in IMAGE and VIDEO_NAME.search(name)): return "alt.freeweights.video", None
    return modality_section(task, name) or "alt.freeweights.text", None

def entry_license(v, rec):
    """The license id the entry shows: the id the verdict rests on, else the declared name for tag "other"."""
    lid = v.get("verdict_license_id") or v.get("license_id") or ""
    if licenses.norm(lid) in ("", "other") and rec.get("license_name"): lid = rec["license_name"]
    return licenses.spdx(lid) or "unknown"

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("waves"); ap.add_argument("candidates"); ap.add_argument("verdicts")
    ap.add_argument("--held", required=True, help="the verdicts file of the batch whose review queue is being listed")
    ap.add_argument("--batch", default="batch2"); ap.add_argument("--out"); ap.add_argument("--queue")
    ap.add_argument("--catalog", default=os.path.join(ROOT, "catalog", "catalog.json"))
    a = ap.parse_args(argv)
    cfg = json.load(open(a.waves, encoding="utf-8"))
    fam = {k.lower(): v for k, v in cfg.get("family_sections", {}).items()}
    batch_orgs = {o for w in cfg["waves"] for o in w["orgs"]}
    sections = {s["id"] for s in json.load(open(os.path.join(ROOT, "spec", "catalog-schema.json")))["x-sections"]}
    recs = {r["id"]: r for r in load_jsonl(a.candidates)}
    vers = {v["id"]: v for v in load_jsonl(a.verdicts)}
    held = {v["id"] for v in load_jsonl(a.held) if v["verdict"] == "queue"}
    cat = json.load(open(a.catalog, encoding="utf-8"))["models"]
    listed_sections = {r["id"]: r["section"] for r in cat}
    bdir = os.path.dirname(a.waves)
    for p in sorted(os.listdir(bdir)):
        if p.endswith(".jsonl") and p != os.path.basename(a.out or ""):
            for e in load_jsonl(os.path.join(bdir, p)): listed_sections[e["repo"]] = e["section"]
    lower = {k.lower(): k for k in listed_sections}

    todo, skipped, still_held = [], collections.Counter(), []
    for rid in sorted(held):
        r, v = recs.get(rid), vers.get(rid)
        if not r or not v or r.get("missing") or r["org"] not in batch_orgs: continue
        if not (r.get("tier_hint") or r.get("variant")): continue
        if rid in listed_sections or rid.lower() in lower: skipped["already listed"] += 1; continue
        if v["verdict"] == "queue": still_held.append(v); continue
        if v["verdict"] not in licenses.LISTED: skipped["verdict " + v["verdict"] + " (" + str(v.get("gate")) + ")"] += 1; continue
        if r.get("same_as") and not r.get("canonical"): skipped["exact re-upload (same_as)"] += 1; continue
        todo.append(rid)
    # bases first, so a variant finds its parent's section
    todo.sort(key=lambda rid: (vers[rid]["relation"]["type"] in VARIANT, -(recs[rid].get("downloads") or 0), rid))
    picked = []
    for rid in todo:
        r, v = recs[rid], vers[rid]
        sec, par = section_of(r, v, fam, sections, listed_sections, lower)
        rel = dict(v["relation"])
        if par: rel["parent"] = par
        listed_sections[rid] = sec; lower[rid.lower()] = rid
        verdict = v["verdict"]
        lid = entry_license(v, r)
        picked.append({"repo": rid, "kind": v["kind"], "wave": "listall", "section": sec,
                       "upstream_url": f"https://huggingface.co/{rid}", "pinned_commit": r.get("sha") or "",
                       "license_id": lid, "verdict": verdict, "audit": v["audit"], "tier": v.get("tier"),
                       "relation": rel, "license_governed_by": v.get("license_governed_by"), "gated": bool(r.get("gated")),
                       "link_only": not licenses.hosted(verdict), "link_reason": licenses.link_reason(verdict), "link_note": None,
                       "license_file": r.get("license_file") or "", "queue_key": v.get("queue_key"),
                       "signals": {"downloads_30d": r.get("downloads"), "likes": r.get("likes"), "trending": None},
                       "pipeline_tag": r.get("pipeline_tag"), "library_name": r.get("library_name")})
    if a.out:
        with open(a.out, "w", encoding="utf-8", newline="\n") as f:
            for e in sorted(picked, key=lambda e: e["repo"]): f.write(json.dumps(e, sort_keys=True, ensure_ascii=False) + "\n")
    if a.queue:
        clusters = {}
        for v in still_held:
            key = v.get("queue_key") or f"repo:{v['id']}"
            c = clusters.setdefault(key, {"key": key, "reason": v["reasons"][-1] if v["reasons"] else "", "repos": 0, "downloads_30d": 0, "examples": []})
            c["repos"] += 1; c["downloads_30d"] += int(recs[v["id"]].get("downloads") or 0); c["examples"].append(v["id"])
        json.dump({"about": "Repos held for a person before they are listed. Since the list-all rule, a license no person has read no longer "
                            "holds a repo: it is listed as a link only with \"License not reviewed\". Only the content gate holds a repo here "
                            "(real-person likeness, voice cloning, fraud or attack tools). Facts as declared at the source.",
                   "batch": a.batch, "clusters": sorted(clusters.values(), key=lambda c: (-c["downloads_30d"], c["key"]))},
                  open(a.queue, "w", encoding="utf-8", newline="\n"), indent=2, sort_keys=True, ensure_ascii=False)
    tally = collections.Counter("hosted" if not e["link_only"] else "link-only: " + e["link_reason"] for e in picked)
    print(json.dumps({"picked": len(picked), "by_listing": dict(tally.most_common()), "by_verdict": dict(collections.Counter(e["verdict"] for e in picked)),
                      "sections": dict(collections.Counter(e["section"] for e in picked).most_common()),
                      "still_held": len(still_held), "skipped": dict(skipped.most_common())}, indent=1))
    return 0

if __name__ == "__main__": sys.exit(main())
