#!/usr/bin/env python3
"""Build catalog/tools.json from the curated tool files in catalog/tools/<id>.json (stdlib + the gh CLI).

  python3 scripts/enrich_tools.py [--only ID ...] [--offline]

One curated file per tool. A person writes the curated fields; this script adds the GitHub facts and
writes them back into the same file, then regenerates catalog/tools.json for the site and the Worker.

Curated fields: id, name, kind ("tool"), category, repo, homepage, license (SPDX, OSI approved),
description, install (lines copied from the project's README or docs), install_check (strings that must
appear in the README or install_docs_paths files, which is how an install line counts as verified),
install_docs_paths, platforms, works_with (which catalog entries it runs, trains, converts, evaluates,
scans or uses), runs_with (ids of tools it runs with), use (the "use with Freeweights" line).

GitHub facts (field `github`): description, language, topics, default branch, license, stars,
pushed_at, the latest release (tag, date, url) and the commit that tag points at, the default branch
head, and a `fetched` date. `pinned` is the release tag and commit shown as Provenance: the latest
release when there is one, otherwise the default branch head.

Checks that fail the run: no license, license not OSI approved, license differs from the repository's,
no pinned commit, repository unreadable. Stale (no push or release in 12 months) is an error too.
Fewer than 1,000 stars is a warning unless the tool file says why in `gap` (a format or task gap)."""
import argparse, concurrent.futures as cf, datetime, glob, json, os, subprocess, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "catalog", "tools")
OUT = os.path.join(ROOT, "catalog", "tools.json")

# SPDX ids of OSI approved licenses that tool repositories use. Add an id only after checking opensource.org.
OSI = {"MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "Zlib", "MPL-2.0", "GPL-2.0", "GPL-3.0", "AGPL-3.0",
       "LGPL-2.1", "LGPL-3.0", "PostgreSQL", "Unlicense", "BSL-1.0"}
CATEGORIES = ["inference", "apps", "training", "quantization", "eval", "agents", "data", "retrieval", "distribution", "speech", "safety"]
STALE_DAYS = 366


def gh(path, raw=False):
    cmd = ["gh", "api", path] + (["-H", "Accept: application/vnd.github.raw"] if raw else [])
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        return None
    return r.stdout if raw else json.loads(r.stdout)


def today():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")


def facts(t):
    """Fetch the GitHub facts for one tool. Returns (github dict, readme text) or (None, "")."""
    owner, repo = t["repo"].split("/")
    info = gh(f"repos/{owner}/{repo}")
    if not info:
        return None, ""
    owner, repo = info["owner"]["login"], info["name"]  # follows a moved repository
    g = {"repo": f"{owner}/{repo}", "description": info.get("description") or "", "homepage": info.get("homepage") or "",
         "language": info.get("language") or "", "topics": info.get("topics") or [], "default_branch": info.get("default_branch") or "",
         "license": ((info.get("license") or {}).get("spdx_id") or "").replace("NOASSERTION", ""),
         "stars": info.get("stargazers_count", 0), "pushed_at": (info.get("pushed_at") or "")[:10], "archived": bool(info.get("archived"))}
    head = gh(f"repos/{owner}/{repo}/commits/{g['default_branch']}") if g["default_branch"] else None
    g["branch_commit"] = (head or {}).get("sha", "")
    rel = gh(f"repos/{owner}/{repo}/releases/latest")
    if rel:
        g["release"] = {"tag": rel.get("tag_name", ""), "date": (rel.get("published_at") or "")[:10], "url": rel.get("html_url", "")}
        ref = gh(f"repos/{owner}/{repo}/commits/{urllib.parse.quote(rel.get('tag_name', ''), safe='')}")
        g["release"]["commit"] = (ref or {}).get("sha", "")
    text = gh(f"repos/{owner}/{repo}/readme", raw=True) or ""
    for d in t.get("install_docs_paths", []):
        text += "\n" + (gh(f"repos/{owner}/{repo}/contents/{d}", raw=True) or "")
    g["fetched"] = today()
    return g, text


def pin(g):
    r = g.get("release") or {}
    if r.get("tag") and r.get("commit"):
        return {"source": "release", "tag": r["tag"], "commit": r["commit"], "date": r.get("date", "")}
    return {"source": "branch", "tag": "", "commit": g.get("branch_commit", ""), "date": g.get("pushed_at", "")}


def enrich(t):
    g, text = facts(t)
    if g is None:
        return t, ["repository not readable"]
    errs = []
    t["github"] = g
    checks = t.get("install_check", [])
    t["install_verified"] = bool(checks) and all(c in text for c in checks)
    t["pinned"] = pin(g)
    gl, cl = g["license"], t.get("license", "")
    if gl and cl and gl != cl:
        errs.append(f"license {cl} in the file but {gl} on GitHub")
    t["license"] = gl or cl
    return t, errs


def validate(t, errs):
    errs = list(errs)
    g = t.get("github") or {}
    if t.get("kind") != "tool":
        errs.append("kind must be tool")
    if t.get("category") not in CATEGORIES:
        errs.append(f"category {t.get('category')!r} unknown")
    if not t.get("license"):
        errs.append("no license")
    elif t["license"] not in OSI:
        errs.append(f"license {t['license']} is not on the OSI list")
    if not (t.get("pinned") or {}).get("commit"):
        errs.append("no pinned commit")
    if g.get("archived"):
        errs.append("repository is archived")
    last = max((g.get("pushed_at") or ""), ((g.get("release") or {}).get("date") or ""))
    if last and (datetime.date.today() - datetime.date.fromisoformat(last)).days > STALE_DAYS:
        errs.append(f"stale: last push or release {last}")
    warns = []
    if g.get("stars", 0) < 1000 and not t.get("gap"):
        warns.append(f"{g.get('stars', 0)} stars and no gap reason")
    if not t.get("install_verified") and t.get("install_check"):
        warns.append("install not verified against the README")
    return errs, warns


def derive(t):
    """The shape the site and the Worker read (catalog/tools.json)."""
    g = t.get("github") or {}
    keep = {"id": t["id"], "name": t["name"], "url": f"https://github.com/{t['repo']}", "license": t["license"], "what": t["description"],
            "kind": t["kind"], "category": t["category"], "install": t["install"], "use": t.get("use", ""), "platforms": t.get("platforms", []),
            "works_with": t.get("works_with", {}), "runs_with": t.get("runs_with", []), "install_verified": t.get("install_verified", False),
            "install_docs": t.get("homepage") or g.get("homepage") or f"https://github.com/{t['repo']}#readme", "github": g, "pinned": t.get("pinned", {})}
    if t.get("license_note"):
        keep["license_note"] = t["license_note"]
    return keep


def main():
    ap = argparse.ArgumentParser(prog="enrich_tools.py")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--offline", action="store_true", help="regenerate tools.json from the files without calling GitHub")
    a = ap.parse_args()
    files = sorted(glob.glob(os.path.join(DIR, "*.json")))
    tools = [json.load(open(f)) for f in files]
    ids = {t["id"] for t in tools}
    bad = 0
    work = [t for t in tools if not a.offline and (not a.only or t["id"] in a.only)]
    with cf.ThreadPoolExecutor(8) as ex:
        results = {t["id"]: r for t, r in zip(work, ex.map(enrich, work))}
    for t, f in zip(tools, files):
        errs = []
        if t["id"] in results:
            t, errs = results[t["id"]]
            with open(f, "w") as fh:
                json.dump(t, fh, indent=2, ensure_ascii=False)
                fh.write("\n")
        for r in t.get("runs_with", []):
            if r not in ids:
                errs.append(f"runs_with {r} is not a tool id")
        errs, warns = validate(t, errs)
        g = t.get("github", {})
        print(f"{t['id']:22} {t['category']:12} {t.get('license', ''):12} {g.get('stars', 0):>7} {(t.get('pinned') or {}).get('tag') or 'branch':14} install {'verified' if t.get('install_verified') else 'NOT verified'}"
              + "".join(f"  WARN {w}" for w in warns) + "".join(f"  ERROR {e}" for e in errs))
        bad += bool(errs)
    out = {"tools": [derive(t) for t in tools]}
    with open(OUT, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"{len(tools)} tools, {bad} with errors")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
