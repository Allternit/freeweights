#!/usr/bin/env python3
"""Build the per-model pin history from this repo's git log: catalog/overlay/history.json.

  python3 scripts/history_index.py            # write catalog/overlay/history.json
  python3 scripts/history_index.py --check    # exit 1 when the file is out of date

Every commit that changed manifests/<org>__<repo>.json is one version of the pin: the manifest's created_at
date, the upstream commit it pins, the file count, the total size, and the short id of the commit in this repo
that recorded it. Newest first. `same_pin` is true when the upstream commit did not change from the version
before it (the manifest changed for another reason, for example its license field). Display data only.
"""
import json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "catalog", "overlay", "history.json")


def git(*a, inp=None):
    return subprocess.run(["git", "-C", ROOT, *a], input=inp, capture_output=True, check=True).stdout


def build():
    log = git("log", "--no-renames", "--diff-filter=AM", "--format=%x00%H%x09%cI", "--name-only", "--", "manifests").decode()
    per = {}  # path -> [(commit, committed_at)] newest first
    for block in log.split("\x00")[1:]:
        head, *files = block.strip("\n").split("\n")
        sha, when = head.split("\t")
        for f in files:
            if f.endswith(".json") and f.startswith("manifests/"):
                per.setdefault(f, []).append((sha, when))
    want = [f"{sha}:{p}" for p, vs in per.items() for sha, _ in vs]
    blob = git("cat-file", "--batch", inp=("\n".join(want) + "\n").encode())
    contents, pos = {}, 0
    for spec in want:
        nl = blob.index(b"\n", pos)
        hdr = blob[pos:nl].split()
        if hdr[-1] == b"missing":
            pos = nl + 1
            continue
        n = int(hdr[2])
        contents[spec] = blob[nl + 1: nl + 1 + n]
        pos = nl + 1 + n + 1
    out = {}
    for p, vs in sorted(per.items()):
        versions = []
        for sha, when in vs:
            raw = contents.get(f"{sha}:{p}")
            if raw is None:
                continue
            m = json.loads(raw)
            files = m.get("files", [])
            versions.append({"commit": m["upstream"]["commit"], "date": m.get("created_at") or when,
                             "files": len(files), "size": sum(f.get("size", 0) for f in files), "repo_commit": sha[:10], "same_pin": False})
        for i, v in enumerate(versions[:-1]):
            v["same_pin"] = v["commit"] == versions[i + 1]["commit"]
        if versions:
            out[json.loads(contents[f"{vs[0][0]}:{p}"])["id"]] = versions
    return out


def main():
    data = build()
    text = json.dumps(data, sort_keys=True, separators=(",", ":")) + "\n"
    if "--check" in sys.argv:
        cur = open(OUT).read() if os.path.exists(OUT) else ""
        sys.exit(0 if cur == text else 1)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, "w").write(text)
    multi = sum(1 for v in data.values() if len([x for x in v if not x["same_pin"]]) > 1)
    print(f"{len(data)} models, {sum(len(v) for v in data.values())} versions, {multi} with more than one pin, {len(text)} bytes")


if __name__ == "__main__":
    main()
