#!/usr/bin/env python3
"""Fetch each publisher's own avatar once, into site/assets/orgs/ (stdlib + macOS sips).

  python3 scripts/fetch_org_logos.py [--force] [--only ORG ...]

For every org in catalog/catalog.json: the Hugging Face organization avatar
(api/organizations/<org>/overview -> avatarUrl), else the user avatar (api/users/<name>/overview).
For every GitHub tool in catalog/tools.json: https://github.com/<owner>.png.
Files are saved as site/assets/orgs/<name>.<ext> and listed in site/assets/orgs/sources.json
as {name: {file, source_url, fetched}}. The site serves these copies itself: it never hotlinks a
third-party image. An org with no avatar gets no entry, and the site shows the monogram alone.
Raster images are shrunk to 64 px with sips when it is installed (macOS)."""
import argparse, datetime, json, os, shutil, subprocess, sys, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "orgs")
UA = {"User-Agent": "freeweights-logos/0.1"}
EXT = {"image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg"}


def get(url, timeout=30):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read(), (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()


def hf_avatar(name):
    for kind in ("organizations", "users"):
        try:
            body, _ = get(f"https://huggingface.co/api/{kind}/{urllib.parse.quote(name)}/overview")
            url = json.loads(body).get("avatarUrl")
        except (urllib.error.URLError, ValueError, OSError):
            continue
        if url:
            return urllib.parse.urljoin("https://huggingface.co/", url)
    return None


def shrink(path):
    if not shutil.which("sips") or path.endswith((".svg", ".gif")):
        return path
    png = os.path.splitext(path)[0] + ".png"
    r = subprocess.run(["sips", "-s", "format", "png", "-Z", "64", path, "--out", png], capture_output=True)
    if r.returncode == 0 and os.path.exists(png):
        if png != path:
            os.remove(path)
        return png
    return path


def main():
    ap = argparse.ArgumentParser(prog="fetch_org_logos.py")
    ap.add_argument("--force", action="store_true", help="fetch again even when a file exists")
    ap.add_argument("--only", nargs="*", help="only these names")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    src_file = os.path.join(OUT, "sources.json")
    sources = json.load(open(src_file)) if os.path.exists(src_file) else {}

    cat = json.load(open(os.path.join(ROOT, "catalog", "catalog.json")))
    want = {r["id"].split("/")[0]: "hf" for r in cat.get("models", [])}
    try:
        for t in json.load(open(os.path.join(ROOT, "catalog", "tools.json"))).get("tools", []):
            u = urllib.parse.urlparse(t.get("url", ""))
            if u.netloc == "github.com" and u.path.strip("/"):
                want.setdefault(u.path.strip("/").split("/")[0], "gh")
    except FileNotFoundError:
        pass

    for name, kind in sorted(want.items(), key=lambda x: x[0].lower()):
        if a.only and name not in a.only:
            continue
        have = sources.get(name)
        if have and not a.force and os.path.exists(os.path.join(OUT, have["file"])):
            print(f"have {name}")
            continue
        url = hf_avatar(name) if kind == "hf" else f"https://github.com/{urllib.parse.quote(name)}.png?size=128"
        if not url:
            print(f"none {name}: no avatar, monogram only")
            continue
        try:
            body, ctype = get(url)
        except (urllib.error.URLError, OSError) as e:
            print(f"fail {name}: {e}")
            continue
        ext = EXT.get(ctype) or os.path.splitext(urllib.parse.urlparse(url).path)[1].lstrip(".").lower() or "png"
        if ext not in EXT.values():
            print(f"skip {name}: not an image ({ctype})")
            continue
        safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in name)
        for old in os.listdir(OUT):
            if os.path.splitext(old)[0] == safe:
                os.remove(os.path.join(OUT, old))
        path = os.path.join(OUT, f"{safe}.{ext}")
        open(path, "wb").write(body)
        path = shrink(path)
        sources[name] = {"file": os.path.basename(path), "source_url": url, "fetched": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        print(f"got  {name} -> {os.path.basename(path)} ({os.path.getsize(path)} bytes)")

    with open(src_file, "w") as f:
        json.dump(dict(sorted(sources.items(), key=lambda x: x[0].lower())), f, indent=2, sort_keys=False)
        f.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
