#!/usr/bin/env python3
"""Batch 3: list every discovered repo whose license is hostable that the batch-1 wave caps left out. No network. Stdlib only.

  select_batch3.py catalog/_audit/batches/batch1-waves.json work/candidates-batch1.jsonl work/verdicts-batch2.jsonl
                   [--batch batch3] [--out catalog/_audit/batches/batch3.jsonl] [--queue catalog/_review/queue.json]
                   [--rehost catalog/_audit/batches/batch1.jsonl]

Picks every discovered repo (any org, any discovery source) whose current verdict (classify.py with the current
license table) is permissive or custom and that is not listed yet. The verdict already carries the gates: format
(pickle-only refused), license, content (sexual content refused, not-for-all-audiences out, a person decides on
likeness, voice clone, fraud or attack tools) and hygiene. On top of that, the same rules as batch 1:
  - a tier (inclusion.py) is needed; a repo below every tier is not listed;
  - exact re-uploads (same_as, not canonical) are skipped;
  - a quantization or adapter is picked only when its parent is listed or picked, and takes the parent's section;
  - sections as select_listall.py: parent, org family, name family, task, else alt.freeweights.text.
Each entry is hosted (signed manifest) unless the license table's verdict for the entry's license id is a link-only
one (then link only, with link_reason). Hugging Face's gate, seen at build time, still makes an entry link only.

--rehost re-reads the batch-1 entries that the image-video wave held link only by org ("until a person reads the
publisher's terms"). Since the list-all rule a declared permissive or custom license with no gate is hosted, so each
such entry that is not gated gets link_only false, link_note null and rehosted_in <batch>, in place.

--queue rewrites the review queue: every discovered repo the content gate holds for a person (verdict queue)."""
import argparse, collections, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import licenses  # noqa: E402
from select_batch import load_jsonl  # noqa: E402
from select_listall import section_of, entry_license, VARIANT  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOSTABLE = ("permissive", "custom")

def rehost(path, batch):
    """Lift the by-org link-only hold from batch-1 entries whose license is hostable and that are not gated."""
    lines, n, kept = [], 0, []
    for e in load_jsonl(path):
        if e.get("link_only") and e.get("link_note", "") and e["link_note"].startswith("Listed as a link only until a person reads") \
                and e["verdict"] in HOSTABLE:
            if e.get("gated"): kept.append(e["repo"])
            else:
                e["link_only"], e["link_note"], e["rehosted_in"] = False, None, batch; n += 1
        lines.append(json.dumps(e, sort_keys=True, ensure_ascii=False))
    with open(path, "w", encoding="utf-8", newline="\n") as f: f.write("\n".join(lines) + "\n")
    return n, kept

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("waves"); ap.add_argument("candidates"); ap.add_argument("verdicts")
    ap.add_argument("--batch", default="batch3"); ap.add_argument("--out"); ap.add_argument("--queue"); ap.add_argument("--rehost")
    ap.add_argument("--catalog", default=os.path.join(ROOT, "catalog", "catalog.json"))
    a = ap.parse_args(argv)
    cfg = json.load(open(a.waves, encoding="utf-8"))
    fam = {k.lower(): v for k, v in cfg.get("family_sections", {}).items()}
    sections = {s["id"] for s in json.load(open(os.path.join(ROOT, "spec", "catalog-schema.json")))["x-sections"]}
    recs = {r["id"]: r for r in load_jsonl(a.candidates)}
    vers = {v["id"]: v for v in load_jsonl(a.verdicts)}
    listed_sections = {r["id"]: r["section"] for r in json.load(open(a.catalog, encoding="utf-8"))["models"]}
    bdir = os.path.dirname(a.waves)
    for p in sorted(os.listdir(bdir)):
        if p.endswith(".jsonl") and p != os.path.basename(a.out or ""):
            for e in load_jsonl(os.path.join(bdir, p)): listed_sections[e["repo"]] = e["section"]
    lower = {k.lower(): k for k in listed_sections}

    def listed_parent(pid, seen=()):
        """The listed id of a parent (case and source renames resolved), or None."""
        if not pid or pid in seen: return None
        if pid in listed_sections: return pid
        if pid.lower() in lower: return lower[pid.lower()]
        ren = (recs.get(pid) or {}).get("renamed_to")
        return listed_parent(ren, seen + (pid,)) if ren and ren != pid else None

    pool, dropped, not_hostable, held = [], collections.Counter(), collections.Counter(), []
    for rid, v in vers.items():
        r = recs.get(rid)
        if not r or r.get("missing"): continue
        if rid in listed_sections or rid.lower() in lower: continue
        if v["verdict"] == "queue": held.append(v)
        if v["verdict"] not in HOSTABLE: not_hostable[v["verdict"] + (f" ({v['gate']})" if v.get("gate") else "")] += 1; continue
        if not v.get("tier"): dropped["below every tier"] += 1; continue
        if r.get("same_as") and not r.get("canonical"): dropped["exact re-upload (same_as)"] += 1; continue
        pool.append(rid)
    dl = lambda rid: (-(recs[rid].get("downloads") or 0), -(recs[rid].get("likes") or 0), rid)
    bases = sorted((rid for rid in pool if vers[rid]["relation"]["type"] not in VARIANT), key=dl)
    variants = sorted((rid for rid in pool if vers[rid]["relation"]["type"] in VARIANT), key=dl)

    picked = []
    def pick(rid, rel, par):
        r, v = recs[rid], vers[rid]
        sec, spar = section_of(r, dict(v, relation=rel), fam, sections, listed_sections, lower)
        if spar: rel["parent"] = spar
        listed_sections[rid] = sec; lower[rid.lower()] = rid
        lid = entry_license(v, r)
        ent = licenses.entry(lid) or {}
        verdict = v["verdict"]
        link_only = ent.get("verdict") in licenses.LINK_ONLY and licenses.stricter(ent["verdict"], verdict) == ent["verdict"]
        picked.append({"repo": rid, "kind": v["kind"], "wave": a.batch, "section": sec,
                       "upstream_url": f"https://huggingface.co/{rid}", "pinned_commit": r.get("sha") or "",
                       "license_id": lid, "verdict": verdict, "audit": v["audit"], "tier": v.get("tier"),
                       "relation": rel, "license_governed_by": v.get("license_governed_by"), "gated": bool(r.get("gated")),
                       "link_only": link_only, "link_reason": licenses.link_reason(ent["verdict"]) if link_only else None, "link_note": None,
                       "license_file": r.get("license_file") or "", "queue_key": v.get("queue_key"),
                       "signals": {"downloads_30d": r.get("downloads"), "likes": r.get("likes"), "trending": None},
                       "pipeline_tag": r.get("pipeline_tag"), "library_name": r.get("library_name")})
    for rid in bases: pick(rid, dict(vers[rid]["relation"]), None)
    # a variant may hang off another variant: pass until nothing new finds its parent
    left = variants
    while True:
        nxt = []
        for rid in left:
            rel = dict(vers[rid]["relation"])
            par = listed_parent(rel.get("parent"))
            if not par: nxt.append(rid); continue
            rel["parent"] = par
            pick(rid, rel, par)
        if len(nxt) == len(left): break
        left = nxt
    dropped["quant or adapter whose parent is not listed"] += len(left)

    if a.out:
        with open(a.out, "w", encoding="utf-8", newline="\n") as f:
            for e in sorted(picked, key=lambda e: e["repo"]): f.write(json.dumps(e, sort_keys=True, ensure_ascii=False) + "\n")
    rehosted = None
    if a.rehost:
        n, kept = rehost(a.rehost, a.batch)
        rehosted = {"hosted_now": n, "still_link_only_gated": kept}
    if a.queue:
        clusters = {}
        for v in held:
            key = v.get("queue_key") or f"repo:{v['id']}"
            c = clusters.setdefault(key, {"key": key, "reason": v["reasons"][-1] if v["reasons"] else "", "repos": 0, "downloads_30d": 0, "examples": []})
            c["repos"] += 1; c["downloads_30d"] += int(recs[v["id"]].get("downloads") or 0); c["examples"].append(v["id"])
        json.dump({"about": "Repos held for a person before they are listed. Since the list-all rule, a license no person has read no longer "
                            "holds a repo: it is listed as a link only with \"License not reviewed\". Only the content gate holds a repo here "
                            "(real-person likeness, voice cloning, fraud or attack tools). Facts as declared at the source.",
                   "batch": a.batch, "clusters": sorted(clusters.values(), key=lambda c: (-c["downloads_30d"], c["key"]))},
                  open(a.queue, "w", encoding="utf-8", newline="\n"), indent=2, sort_keys=True, ensure_ascii=False)
    tally = collections.Counter("hosted" if not e["link_only"] else "link-only: " + e["link_reason"] for e in picked)
    print(json.dumps({"hostable_not_listed": len(pool) + sum(dropped.values()) - dropped["quant or adapter whose parent is not listed"],
                      "picked": len(picked), "by_listing": dict(tally.most_common()),
                      "by_verdict": dict(collections.Counter(e["verdict"] for e in picked)),
                      "by_relation": dict(collections.Counter(e["relation"]["type"] for e in picked)),
                      "sections": dict(collections.Counter(e["section"] for e in picked).most_common()),
                      "dropped": dict(dropped.most_common()), "held_for_a_person": len(held),
                      "not_hostable_not_listed": dict(not_hostable.most_common()), "rehost": rehosted}, indent=1))
    return 0

if __name__ == "__main__": sys.exit(main())
