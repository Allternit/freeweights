#!/usr/bin/env python3
"""The takedown blocklists. Stdlib only.

Two files with the same shape, {schema_version, entries: [{id, kind, date, reason_class, sha256: [...]}]}:
  policy/blocklist.json                     public, in the repo: non-sensitive classes only (copyright,
                                            license_violation, publisher_request, malware_or_secrets, ...)
  ~/.config/freeweights/blocklist-private.json   never committed: sensitive classes (SENSITIVE). Override the
                                            path with FREEWEIGHTS_PRIVATE_BLOCKLIST. Hashes from it are shared
                                            on request only (policy/takedown.md).
Both hold hashes and identifiers, never content. discover.py drops and build_catalog.py refuses a candidate
whose id or weight hashes are on EITHER list, so a re-upload of the same weights under another name is not
listed. Written only by scripts/fw_admin.py takedown."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "policy", "blocklist.json")
PRIVATE_DEFAULT = os.path.expanduser("~/.config/freeweights/blocklist-private.json")
# Sensitive classes: hashes go to the private list only, and the public counter and registry line carry
# the class and date but not the entry id (the id can name the person or describe the material).
SENSITIVE = ("csam", "ncii", "personal_data", "real_person_likeness")
EMPTY = {"schema_version": 0, "entries": []}
_cache = {}


def private_path():
    return os.environ.get("FREEWEIGHTS_PRIVATE_BLOCKLIST") or PRIVATE_DEFAULT


def path_for(reason_class, public_path=None):
    return private_path() if reason_class in SENSITIVE else (public_path or PATH)


def load(path=None):
    path = path or PATH
    if not os.path.exists(path): return dict(EMPTY, entries=[])
    st = os.stat(path)
    hit = _cache.get(path)
    if hit and hit[0] == (st.st_mtime_ns, st.st_size): return hit[1]
    with open(path, encoding="utf-8") as f: data = json.load(f)
    _cache[path] = ((st.st_mtime_ns, st.st_size), data)
    return data


def load_all(public_path=None):
    """Entries of the public and the private list together (the private one may not exist)."""
    return {"schema_version": 0, "entries": load(public_path or PATH).get("entries", []) + load(private_path()).get("entries", [])}


def index(data=None):
    """({id lowercased}, {sha256: removed id})."""
    data = data or load_all()
    ids, hashes = set(), {}
    for e in data.get("entries", []):
        if e.get("id"): ids.add(e["id"].lower())
        for h in e.get("sha256", []): hashes[h.lower()] = e.get("id") or "a removed entry"
    return ids, hashes


def match(entry_id, sha256s=(), data=None):
    """Why entry_id (with these file hashes) is blocked by either list, or None."""
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
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(data, sort_keys=True, indent=2, ensure_ascii=False) + "\n")
    os.replace(tmp, path)
    if path == private_path():
        os.chmod(path, 0o600)
    _cache.pop(path, None)
