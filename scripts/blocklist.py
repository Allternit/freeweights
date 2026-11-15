#!/usr/bin/env python3
"""The takedown blocklist (policy/blocklist.json). Stdlib only.

Each entry is one removed item: {id, kind, date, reason_class, sha256: [weight file hashes]}. It holds hashes
and identifiers, never content. discover.py drops a candidate whose id or weight hashes are on the list, and
build_catalog.py refuses to list it, so a re-upload of the same weights under another name is not listed.
Written only by scripts/fw_admin.py takedown."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "policy", "blocklist.json")
EMPTY = {"schema_version": 0, "entries": []}
_cache = {}


def load(path=None):
    path = path or PATH
    if not os.path.exists(path): return dict(EMPTY, entries=[])
    st = os.stat(path)
    hit = _cache.get(path)
    if hit and hit[0] == (st.st_mtime_ns, st.st_size): return hit[1]
    with open(path, encoding="utf-8") as f: data = json.load(f)
    _cache[path] = ((st.st_mtime_ns, st.st_size), data)
    return data


def index(data=None):
    """({id lowercased}, {sha256: removed id})."""
    data = data or load()
    ids, hashes = set(), {}
    for e in data.get("entries", []):
        ids.add(e["id"].lower())
        for h in e.get("sha256", []): hashes[h.lower()] = e["id"]
    return ids, hashes


def match(entry_id, sha256s=(), data=None):
    """Why entry_id (with these file hashes) is blocked, or None."""
    ids, hashes = index(data)
    if entry_id.lower() in ids: return f"{entry_id} was removed after a takedown"
    for h in sha256s or ():
        if h and h.lower() in hashes: return f"a file has the weight hash {h} of {hashes[h.lower()]}, removed after a takedown"
    return None


def weight_hashes(files):
    """The hashes a takedown blocks: LFS files (the weights). A repo with no LFS file blocks every file
    over 1 MiB, and failing that every file, so the list is never empty for a manifest with files."""
    lfs = [f for f in files if f.get("lfs")]
    big = [f for f in files if (f.get("size") or 0) > 1 << 20]
    return sorted({f["sha256"] for f in (lfs or big or files) if f.get("sha256")})


def write(data, path=None):
    path = path or PATH
    data["entries"].sort(key=lambda e: (e["date"], e["id"]))
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(data, sort_keys=True, indent=2, ensure_ascii=False) + "\n")
    os.replace(tmp, path)
    _cache.pop(path, None)
