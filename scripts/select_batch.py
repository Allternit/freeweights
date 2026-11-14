#!/usr/bin/env python3
"""Pick one catalog batch from discovery and classify output. No network. Stdlib only.

  select_batch.py catalog/_audit/batches/batch1-waves.json work/candidates-batch1.jsonl work/verdicts-batch1.jsonl
                  [--out catalog/_audit/batches/batch1.jsonl] [--queue catalog/_review/queue.json]
                  [--queue-head work/review-queue-head.md] [--texts work/license-texts]

Only repos classify.py marked listable are picked: verdict permissive, custom or non-commercial and a tier.
A repo joins the first wave whose orgs (and tasks or name pattern, when given) match. Inside a wave the orgs
take turns, best 30-day downloads first, until the wave target. A quantization is picked only when its parent
is already listed or picked, and takes its parent's section. Exact re-uploads (same_as, not canonical) are
skipped. Gated, non-commercial, link-only licenses and the wave's link_only_orgs become link-only rows.

The review queue (queue verdicts from repos in the batch's orgs that reach a tier hint) is grouped by the
license-text sha256 when the text was read, else by the license name. The public file lists license facts
only: key, license tag and name, repo count, downloads and example repos. The head (top 30 clusters with a
short excerpt of each text) goes to a work/ file for the person who reads the queue."""
import argparse, collections, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import licenses  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEECH = {"automatic-speech-recognition", "text-to-speech", "audio-classification", "zero-shot-audio-classification", "text-to-audio", "audio-to-audio"}
EMBED = {"sentence-similarity", "feature-extraction", "text-ranking"}
IMAGE = {"text-to-image", "image-to-image", "unconditional-image-generation"}
VIDEO = {"text-to-video", "image-to-video", "video-to-video"}
VISION = {"image-classification", "object-detection", "image-segmentation", "zero-shot-image-classification", "zero-shot-object-detection",
          "image-feature-extraction", "depth-estimation", "mask-generation", "keypoint-detection", "video-classification", "image-to-text",
          "time-series-forecasting", "fill-mask", "token-classification", "text2text-generation", "translation", "summarization",
          "question-answering", "text-classification", "zero-shot-classification"}
MUSIC_NAME = re.compile(r"ace-?step|music|song|yue", re.I)
VIDEO_NAME = re.compile(r"wan|video|hunyuan|ltx|mochi|cogvideo|i2v|t2v", re.I)

def load_jsonl(p): return [json.loads(l) for l in open(p, encoding="utf-8") if l.strip()]

def modality_section(task, name):
    if task in SPEECH: return "alt.freeweights.speech"
    if task in VIDEO: return "alt.freeweights.video"
    if task in IMAGE: return "alt.freeweights.image"
    if task in EMBED: return "alt.freeweights.embed"
    if task in VISION: return "alt.freeweights.vision"
    return None

def wave_of(rec, ver, waves):
    org, task, name = rec["org"], rec.get("pipeline_tag"), rec["name"]
    for w in waves:
        if org not in w["orgs"]: continue
        if w.get("relation") and ver["relation"]["type"] != w["relation"]: continue
        if not w.get("relation") and ver["relation"]["type"] == "quant" and org.lower() in {o.lower() for o in waves[0]["orgs"]}: continue
        if "tasks" in w and task not in w["tasks"]: continue
        if task in w.get("exclude_tasks", []): continue
        if w.get("name_match") and not re.search(w["name_match"], name, re.I): continue
        return w
    return None

def section_for(rec, ver, w, fam, listed_sections):
    if w["id"] == "quants": return listed_sections.get(ver["relation"]["parent"])
    if w.get("section"): return w["section"]
    task, name = rec.get("pipeline_tag"), rec["name"]
    if w["id"] == "image-video":
        if task in ("text-to-audio", "text-to-music") or MUSIC_NAME.search(name): return "alt.freeweights.music"
        return "alt.freeweights.video" if task in VIDEO or (task not in IMAGE and VIDEO_NAME.search(name)) else "alt.freeweights.image"
    f = fam.get(rec["org"].lower())
    if f and (not f.get("name_match") or re.search(f["name_match"], name, re.I)): return f["section"]
    return modality_section(task, name)

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("waves"); ap.add_argument("candidates"); ap.add_argument("verdicts")
    ap.add_argument("--out"); ap.add_argument("--queue"); ap.add_argument("--queue-head"); ap.add_argument("--texts", default=os.path.join(ROOT, "work", "license-texts"))
    ap.add_argument("--catalog", default=os.path.join(ROOT, "catalog", "catalog.json"))
    a = ap.parse_args(argv)
    cfg = json.load(open(a.waves, encoding="utf-8"))
    waves, fam = cfg["waves"], {k.lower(): v for k, v in cfg.get("family_sections", {}).items()}
    recs = {r["id"]: r for r in load_jsonl(a.candidates)}
    vers = {v["id"]: v for v in load_jsonl(a.verdicts)}
    cat = json.load(open(a.catalog, encoding="utf-8"))["models"]
    listed = {r["id"]: r for r in cat}
    listed_sections = {r["id"]: r["section"] for r in cat}
    batch_orgs = {o for w in waves for o in w["orgs"]}
    # earlier batches already committed are listed too
    out_name = os.path.basename(a.out or "")
    for p in sorted(os.listdir(os.path.dirname(a.waves))):
        if p.endswith(".jsonl") and p != out_name:
            for e in load_jsonl(os.path.join(os.path.dirname(a.waves), p)):
                listed[e["repo"]] = e; listed_sections[e["repo"]] = e["section"]

    pools, skipped = collections.defaultdict(lambda: collections.defaultdict(list)), collections.Counter()
    for rid, v in vers.items():
        r = recs.get(rid)
        if not r or r.get("missing") or r["org"] not in batch_orgs or "parent" in r.get("sources", []) and len(r["sources"]) == 1: continue
        if rid in listed: skipped["already listed"] += 1; continue
        if not v.get("listable"): skipped["below tier" if v["verdict"] in ("permissive", "custom", "non-commercial") else "verdict " + v["verdict"]] += 1; continue
        if r.get("same_as") and not r.get("canonical"): skipped["exact re-upload (same_as)"] += 1; continue
        w = wave_of(r, v, waves)
        if not w: skipped["no wave matches"] += 1; continue
        pools[w["id"]][r["org"]].append(rid)

    picked, by_wave = [], collections.OrderedDict()
    VARIANT = ("quant", "adapter")
    # bases before variants inside an org, so a variant's parent can be picked first
    dl = lambda rid: (vers[rid]["relation"]["type"] in VARIANT, -(recs[rid].get("downloads") or 0), -(recs[rid].get("likes") or 0), rid)
    lower = {k.lower(): k for k in listed_sections}
    def listed_parent(pid):
        """The listed id of a parent (case and source renames resolved), or None."""
        if not pid: return None
        if pid in listed_sections: return pid
        if pid.lower() in lower: return lower[pid.lower()]
        ren = (recs.get(pid) or {}).get("renamed_to")
        return listed_parent(ren) if ren and ren != pid else None
    relations = {}
    # waves that need a listed parent pick last, after the waves that list the parents
    for w in sorted(waves, key=lambda w: bool(w.get("require_listed_parent"))):
        orgs = {o: sorted(ids, key=dl) for o, ids in pools[w["id"]].items()}
        got, nosec, noparent = [], 0, 0
        while len(got) < w["target"] and any(orgs.values()):
            for o in sorted(orgs):
                while orgs[o] and len(got) < w["target"]:
                    rid = orgs[o].pop(0)
                    r, v = recs[rid], vers[rid]
                    rel = dict(v["relation"])
                    if rel["type"] in VARIANT or w.get("require_listed_parent"):
                        # a quant or adapter shows as a Variants row on its base, so the base must be listed
                        par = listed_parent(rel["parent"])
                        if not par: noparent += 1; continue
                        rel["parent"] = par
                    sec = section_for(r, dict(v, relation=rel), w, fam, listed_sections)
                    if not sec: nosec += 1; continue
                    got.append((rid, sec)); listed_sections[rid] = sec; lower[rid.lower()] = rid; relations[rid] = rel
                    break
        by_wave[w["id"]] = {"picked": len(got), "target": w["target"], "skipped_no_section": nosec, "skipped_parent_not_listed": noparent}
        for rid, sec in got:
            r, v = recs[rid], vers[rid]
            lid = v.get("verdict_license_id") or v.get("license_id")
            gov = v.get("license_governed_by")
            if not lid and gov in listed: lid = listed[gov].get("license_id")
            entry = licenses.entry(lid) or {}
            gated = bool(r.get("gated"))
            forced = r["org"] in w.get("link_only_orgs", [])
            link_only = gated or forced or v["verdict"] == "non-commercial" or bool(entry.get("link_only"))
            note = None
            if forced: note = w.get("link_only_note")
            elif entry.get("link_only"): note = entry.get("note")
            picked.append({"repo": rid, "kind": v["kind"], "wave": w["id"], "section": sec,
                           "upstream_url": f"https://huggingface.co/{rid}", "pinned_commit": r.get("sha") or "",
                           "license_id": lid or "unknown", "verdict": v["verdict"], "audit": v["audit"], "tier": v["tier"],
                           "relation": relations[rid], "license_governed_by": gov, "gated": gated, "link_only": link_only,
                           "link_note": note, "license_file": r.get("license_file") or "",
                           "signals": {"downloads_30d": r.get("downloads"), "likes": r.get("likes"), "trending": None},
                           "pipeline_tag": r.get("pipeline_tag"), "library_name": r.get("library_name")})

    if a.out:
        os.makedirs(os.path.dirname(a.out), exist_ok=True)
        with open(a.out, "w", encoding="utf-8", newline="\n") as f:
            for e in sorted(picked, key=lambda e: (e["wave"], e["repo"])): f.write(json.dumps(e, sort_keys=True, ensure_ascii=False) + "\n")

    # review queue: queue verdicts among batch-org repos that reach a tier hint
    clusters = {}
    for rid, v in vers.items():
        r = recs.get(rid)
        if v["verdict"] != "queue" or not r or r["org"] not in batch_orgs or r.get("missing"): continue
        if not (r.get("tier_hint") or r.get("variant")): continue
        key = v.get("queue_key") or f"repo:{rid}"
        c = clusters.setdefault(key, {"key": key, "reason": v["reasons"][-1] if v["reasons"] else "", "repos": 0, "downloads_30d": 0,
                                       "license_tags": collections.Counter(), "license_names": collections.Counter(), "examples": []})
        c["repos"] += 1; c["downloads_30d"] += int(r.get("downloads") or 0)
        c["license_tags"][v.get("license_id") or "none"] += 1
        if r.get("license_name"): c["license_names"][r["license_name"]] += 1
        c["examples"].append((r.get("downloads") or 0, rid))
    queue = []
    for c in sorted(clusters.values(), key=lambda c: (-c["downloads_30d"], -c["repos"], c["key"])):
        c["examples"] = [rid for _, rid in sorted(c["examples"], reverse=True)[:5]]
        c["license_tags"] = dict(c["license_tags"].most_common()); c["license_names"] = dict(c["license_names"].most_common(3))
        queue.append(c)
    if a.queue:
        os.makedirs(os.path.dirname(a.queue), exist_ok=True)
        json.dump({"about": "License texts waiting for a person, grouped by the sha256 of the text (text:...), by a held license id (held:...), "
                            "by the license name when no text was found (name:...), or by an unclassified base model (parent:...). "
                            "Unreviewed means unlisted. Facts as declared at the source.",
                   "batch": cfg["batch"], "clusters": queue}, open(a.queue, "w", encoding="utf-8", newline="\n"), indent=2, sort_keys=True, ensure_ascii=False)
    if a.queue_head:
        lines = [f"# Review queue head, {cfg['batch']}", "",
                 f"{len(queue)} clusters, {sum(c['repos'] for c in queue)} repos. Top 30 by 30-day downloads. One decision clears a cluster.", ""]
        for i, c in enumerate(queue[:30], 1):
            lines += [f"## {i}. {c['key']}", "", f"- repos: {c['repos']}, downloads (30 days): {c['downloads_30d']:,}",
                      f"- license tags: {', '.join(f'{k} ({n})' for k, n in c['license_tags'].items())}",
                      f"- license names: {', '.join(c['license_names']) or 'none'}", f"- why: {c['reason']}",
                      f"- examples: {', '.join(c['examples'])}"]
            if c["key"].startswith("text:"):
                tp = os.path.join(a.texts, c["key"][5:] + ".txt")
                if os.path.exists(tp):
                    raw = open(tp, "rb").read()
                    txt = raw.decode("utf-8", errors="replace")
                    binary = raw[:5] == b"%PDF-" or txt.count("\ufffd") > len(txt) // 50
                    first = "(a PDF or binary file: read it on the repo page)" if binary else " ".join(txt.split())[:400]
                    lines += [f"- text: {os.path.relpath(tp, ROOT)} ({len(txt):,} chars)", f"- starts: {first}"]
            lines.append("")
        os.makedirs(os.path.dirname(a.queue_head), exist_ok=True)
        open(a.queue_head, "w", encoding="utf-8").write("\n".join(lines))

    tally = collections.Counter((e["wave"], e["verdict"], "link-only" if e["link_only"] else "manifest") for e in picked)
    print(json.dumps({"picked": len(picked), "waves": by_wave, "by_wave_verdict": {" / ".join(k): n for k, n in sorted(tally.items())},
                      "skipped": dict(skipped.most_common()), "queue_clusters": len(queue), "queue_repos": sum(c["repos"] for c in queue)}, indent=1))
    return 0

if __name__ == "__main__": sys.exit(main())
