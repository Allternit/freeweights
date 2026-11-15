#!/usr/bin/env python3
"""Cloudflare Pages budget for site/dist (A14): file count, largest file, total size, and projected counts.

  python3 scripts/site_budget.py [dist-dir] [--strict]   # default site/dist; exit 1 when this dist is over a Pages limit;
                                                          # --strict also fails when a projection is over

Pages Free limits: 20,000 files per deployment, 25 MiB per file. The script reads data/catalog.json for the
entry count, splits the files into per-entry (model/dataset/tool detail pages, manifests and signatures), paged
(list pages and JSON shards, which grow with entries / page size) and fixed (docs, assets, home), then projects
each class to 1k / 10k / 50k entries. Detail pages stay one folder per entry until B5 moves them to R2, so the
projection shows that cost plainly. The per-entry class uses the measured ratio on this dist.
"""
import json, math, os, sys

FILE_LIMIT = 20000; BYTE_LIMIT = 25 * 1024 * 1024
PAGE = 100; CARD_SHARD = 100; IDX_SHARD = 3000


def classify(rel):
    p = rel.split("/")
    if p[0] == "manifests": return "entry"
    if p[0].startswith("alt.freeweights.") and len(p) >= 4 and p[1] != "page": return "entry"       # <section>/<org>/<repo>/index.html
    if "page" in p[:3] and p[-1] == "index.html": return "paged"
    if p[0] == "data" and len(p) > 1 and p[1] in ("catalog", "search"): return "paged"
    return "fixed"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; strict = '--strict' in sys.argv
    dist = os.path.abspath(args[0] if args else os.path.join(os.path.dirname(__file__), "..", "site", "dist"))
    files = []
    for d, _, fs in os.walk(dist):
        for f in fs:
            fp = os.path.join(d, f); files.append((os.path.relpath(fp, dist), os.path.getsize(fp)))
    if not files: print("no files in", dist); return 1
    cls = {}
    for rel, sz in files:
        c = classify(rel); a = cls.setdefault(c, [0, 0]); a[0] += 1; a[1] += sz
    total = sum(s for _, s in files); big = max(files, key=lambda x: x[1])
    meta = json.load(open(os.path.join(dist, "data", "catalog.json")))
    n = meta["entries"] + meta["variants"]; secs = len(meta["sections"]); colls = len(meta["collections"])
    print(f"dist            {dist}")
    print(f"files           {len(files):,}  (limit {FILE_LIMIT:,})")
    print(f"total size      {total/1e6:.1f} MB")
    print(f"largest file    {big[1]/1e6:.2f} MB  {big[0]}  (limit {BYTE_LIMIT/1048576:.0f} MiB)")
    print(f"entries         {n:,} ({meta['entries']:,} top level, {meta['variants']:,} variants), {secs} sections, {colls} collections")
    for c in ("entry", "paged", "fixed"):
        a = cls.get(c, [0, 0]); print(f"  {c:<6} files {a[0]:>7,}  {a[1]/1e6:8.1f} MB")
    per_entry = cls.get("entry", [0, 0])[0] / max(1, n); bytes_entry = cls.get("entry", [0, 0])[1] / max(1, n)
    fixed = cls.get("fixed", [0, 0])[0]
    print(f"per entry       {per_entry:.2f} files, {bytes_entry/1024:.0f} KB (detail page, manifest, signature)")
    bad = len(files) > FILE_LIMIT or big[1] > BYTE_LIMIT
    print("\nprojection (detail pages as static folders, as today)")
    print(f"{'entries':>9} {'files':>9} {'of limit':>9} {'size MB':>9}  note")
    top_share = meta["entries"] / max(1, n)
    for e in (1000, 10000, 50000):
        top = e * top_share
        lists = [top] + [top / secs] * secs + [top * 0.4 / colls] * colls
        paged_html = sum(max(1, math.ceil(x / PAGE)) for x in lists) - len(lists)   # page 1 of each list is fixed
        shards = math.ceil(top / CARD_SHARD) + math.ceil((e - top) / CARD_SHARD) + math.ceil(e / IDX_SHARD) + secs//2 + 1
        files_e = fixed + e * per_entry + paged_html + shards
        paged_mb = cls.get("paged", [0, 0])[1] / 1e6 * e / max(1, n)
        size = bytes_entry * e / 1e6 + paged_mb + cls.get("fixed", [0, 0])[1] / 1e6
        ok = files_e <= FILE_LIMIT; bad = bad or (strict and not ok)
        print(f"{e:>9,} {files_e:>9,.0f} {files_e/FILE_LIMIT:>8.0%} {size:>9.0f}  {'ok' if ok else 'OVER the 20,000 file limit unless detail pages move to R2 (B5)'}")
    print("\nWith detail pages on R2 (B5): files = fixed + paged only")
    for e in (1000, 10000, 50000):
        top = e * top_share; lists = [top] + [top / secs] * secs + [top * 0.4 / colls] * colls
        paged_html = sum(max(1, math.ceil(x / PAGE)) for x in lists) - len(lists)
        shards = math.ceil(top / CARD_SHARD) + math.ceil((e - top) / CARD_SHARD) + math.ceil(e / IDX_SHARD) + secs//2 + 1
        print(f"{e:>9,} {fixed + paged_html + shards:>9,.0f}")
    print("\nRESULT:", "FAIL (over a Pages limit)" if bad else "ok")
    return 1 if bad else 0


sys.exit(main())
