#!/usr/bin/env python3
"""Map Freeweights catalog ids to models served on Allternit Cloud.

Reads the public model list (GET https://api.allternit.com/v1/models), skips hidden entries and matches
catalog ids EXACTLY by `hugging_face_id` (then `canonical_slug` when it is itself a catalog id). A quantized
row whose `relation.parent` is a mapped id gets the parent's cloud model and `via_parent: true`.
Writes catalog/overlay/cloud.json. Use --from-file to read a saved list instead of the network.
"""
import argparse, glob, json, os, sys, urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://api.allternit.com/v1/models"
OUT = os.path.join(ROOT, "catalog", "overlay", "cloud.json")

def load_rows():
    rows = {}
    for f in glob.glob(os.path.join(ROOT, "catalog", "rows", "*.json")):
        try: r = json.load(open(f, encoding="utf-8"))
        except ValueError: continue
        if isinstance(r, dict) and r.get("id"): rows[r["id"]] = r
    return rows

def build_map(models, rows):
    out = {}
    for m in models:
        if m.get("hidden") or not m.get("id"): continue
        cid = next((c for c in (m.get("hugging_face_id"), m.get("canonical_slug")) if c and c in rows), None)
        if not cid: continue
        out.setdefault(cid, {"model": m["id"], "provider": m.get("provider"), "context_length": m.get("context_length")})
    for rid, r in sorted(rows.items()):
        rel = r.get("relation") or {}
        if rid in out or rel.get("type") != "quant" or rel.get("parent") not in out: continue
        out[rid] = {**out[rel["parent"]], "via_parent": True}
    return out

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--from-file", help="read a saved /v1/models JSON instead of the network")
    ap.add_argument("--out", default=OUT)
    a = ap.parse_args(argv)
    if a.from_file: data = json.load(open(a.from_file, encoding="utf-8"))
    else: data = json.load(urllib.request.urlopen(urllib.request.Request(URL, headers={"User-Agent": "freeweights-cloud-map"}), timeout=30))
    mapped = build_map(data.get("data", []), load_rows())
    doc = {"_meta": {"source": URL, "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}}
    doc.update(dict(sorted(mapped.items())))
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f: json.dump(doc, f, indent=1, ensure_ascii=False); f.write("\n")
    print(f"cloud_map: {len(mapped)} rows mapped ({sum(1 for v in mapped.values() if v.get('via_parent'))} via parent) -> {a.out}")
    return 0

if __name__ == "__main__": sys.exit(main())
