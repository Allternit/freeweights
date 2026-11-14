#!/usr/bin/env python3
"""Build, validate and sign a Freeweights manifest v0 from a Hugging Face repo.

  make_manifest.py <org/repo> [--revision REV] [--dataset] [--section alt.freeweights.x]
                   [--out-dir manifests] [--key ~/.config/freeweights/minisign.key] [--no-sign]

Writes <out-dir>/<org>__<repo>.json (canonical JSON, spec/manifest-v0.md) and a
detached minisign signature <file>.minisig. Stdlib only. The HF token is read from
~/.cache/huggingface/token only after an unauthenticated 401/403, and never printed."""
import argparse, datetime, fnmatch, hashlib, json, os, re, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = "freeweights-manifest/0.1.0"
SLEEP = 0.4
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import formats, licenses  # noqa: E402  (the one format rule set and the one license table)
SECTION_BY_ORG = {"qwen": "qwen", "deepseek-ai": "deepseek", "moonshotai": "kimi", "zai-org": "glm", "thudm": "glm", "minimaxai": "minimax",
                  "xiaomimimo": "mimo", "google": "gemma", "baai": "embed", "hexgrad": "speech", "onnx-community": "speech",
                  "openai": "speech", "nvidia": "nemotron", "allenai": "olmo", "microsoft": "phi", "mistralai": "mistral"}

class Refused(Exception): pass

KEEP_ALWAYS = re.compile(r"(readme(\.md)?|licen[sc]e(\.(md|txt))?|copying)$", re.I)

def subsets():
    """Per-repo include globs from catalog/_audit/subsets.json: {repo: [glob, ...]}."""
    try: return json.load(open(os.path.join(ROOT, "catalog", "_audit", "subsets.json")))
    except OSError: return {}

def included(path, globs):
    return not globs or bool(KEEP_ALWAYS.match(path)) or any(fnmatch.fnmatchcase(path, g) for g in globs)

def token():
    try: return open(os.path.expanduser("~/.cache/huggingface/token")).read().strip()
    except OSError: return None

def http(url, binary=False, stream_hash=False):
    """GET with retry; falls back to the HF token only on 401/403."""
    hdr, tried_tok = {"User-Agent": VERSION}, False
    for attempt in range(6):
        try:
            time.sleep(SLEEP)
            with urllib.request.urlopen(urllib.request.Request(url, headers=hdr), timeout=60) as r:
                if stream_hash:
                    h, n = hashlib.sha256(), 0
                    while chunk := r.read(1 << 20): h.update(chunk); n += len(chunk)
                    return h.hexdigest(), n
                data = r.read()
                return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403) and not tried_tok and token():
                hdr["Authorization"] = "Bearer " + token(); tried_tok = True; continue
            if e.code == 429 or e.code >= 500: time.sleep(5 * (attempt + 1)); continue
            raise
        except (urllib.error.URLError, TimeoutError): time.sleep(3 * (attempt + 1))
    raise RuntimeError("giving up on " + url)

def head_bytes(url, n=formats.HEAD_BYTES):
    """First n bytes of a file by an HTTP range read (the format header check)."""
    hdr = {"User-Agent": VERSION, "Range": f"bytes=0-{n - 1}"}
    for attempt in range(4):
        try:
            time.sleep(SLEEP)
            with urllib.request.urlopen(urllib.request.Request(url, headers=hdr), timeout=60) as r: return r.read(n)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403) and "Authorization" not in hdr and token(): hdr["Authorization"] = "Bearer " + token(); continue
            if e.code == 429 or e.code >= 500: time.sleep(5 * (attempt + 1)); continue
            raise
        except (urllib.error.URLError, TimeoutError): time.sleep(3 * (attempt + 1))
    raise RuntimeError("giving up on " + url)

def canonical(obj): return json.dumps(obj, sort_keys=True, indent=2, ensure_ascii=False) + "\n"

def load_validator():
    src = open(os.path.join(ROOT, "scripts", "validate_spec.py"), encoding="utf-8").read()
    ns = {"__file__": os.path.join(ROOT, "scripts", "validate_spec.py")}
    exec(src.split("def canonical(path)")[0], ns)  # defs + schema engine only, no reporting
    return ns["check"], json.load(open(os.path.join(ROOT, "spec", "manifest-v0.schema.json")))

def build(repo, revision, dataset, section, include=None):
    kind = "datasets" if dataset else "models"
    base = f"https://huggingface.co/api/{kind}/{repo}"
    info = http(base + (f"/revision/{urllib.parse.quote(revision, safe='')}" if revision else "") + "?blobs=true")
    commit = info["sha"]
    if info.get("gated"): raise Refused("gated repo, skipped (plan C rules)")
    include = include if include is not None else subsets().get(repo)
    sibs = [s for s in info.get("siblings", []) if included(s["rfilename"], include)]
    paths = [s["rfilename"] for s in sibs]
    resolve = f"https://huggingface.co/{'datasets/' if dataset else ''}{repo}/resolve/{commit}/"
    if not dataset:
        fmts, why = formats.decide(paths, lambda p, n: head_bytes(resolve + urllib.parse.quote(p), n))
        if not fmts: raise Refused(why)
    lic_id = (info.get("cardData") or {}).get("license") or ""
    if not lic_id: raise Refused("no license in cardData")
    lic_id = str(lic_id)
    lic_path = next((p for p in paths if re.fullmatch(r"(licen[sc]e|copying)(\.(md|txt))?", p, re.I)), None)
    if not lic_path: lic_path = "README.md" if "README.md" in paths else None
    if not lic_path: raise Refused("no license file or README")
    files, lic_sha = [], None
    for s in sorted(sibs, key=lambda s: s["rfilename"]):
        p, lfs = s["rfilename"], s.get("lfs")
        if lfs: sha, size = lfs["sha256"], int(lfs.get("size", s.get("size")))
        else:
            sha, size = http(resolve + urllib.parse.quote(p), stream_hash=True)
            if s.get("size") is not None and int(s["size"]) != size: raise RuntimeError(f"size mismatch on {p}")
        files.append({"path": p, "size": size, "sha256": sha, "lfs": bool(lfs)})
        if p == lic_path: lic_sha = sha
    if not lic_sha: lic_sha = next(f["sha256"] for f in files if f["path"] == lic_path)
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    org = repo.split("/")[0].lower()
    section = section or "alt.freeweights." + ("datasets" if dataset else SECTION_BY_ORG.get(org, org.replace("_", "-")))
    return {"schema_version": 0, "id": repo, "section": section,
            "upstream": {"host": "huggingface.co", "repo": repo, "commit": commit,
                         "url": f"https://huggingface.co/{'datasets/' if dataset else ''}{repo}/tree/{commit}"},
            "license": {"id": lic_id, "name": licenses.name(lic_id), "file_path": lic_path,
                        "file_sha256": lic_sha, "redistribution": "yes" if licenses.is_permissive(lic_id) else "click-through"},
            "files": files,
            "sources": [{"type": "source", "url": resolve, "priority": 100, "last_checked": now}],
            "created_at": now, "generator": VERSION}

def sign(path, repo, commit, key):
    """Sign to a temp file, then replace: a signature is never removed before its replacement exists."""
    sig, tmp = path + ".minisig", path + ".minisig.tmp"
    if os.path.exists(tmp): os.remove(tmp)
    subprocess.run(["minisign", "-S", "-m", path, "-s", key, "-x", tmp, "-t", f"freeweights manifest {repo} {commit[:12]}"], check=True, capture_output=True)
    os.replace(tmp, sig)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo"); ap.add_argument("--revision"); ap.add_argument("--dataset", action="store_true")
    ap.add_argument("--section"); ap.add_argument("--include", action="append", help="glob of files to list (repeatable); README/LICENSE always kept"); ap.add_argument("--out-dir", default=os.path.join(ROOT, "manifests"))
    ap.add_argument("--key", default=os.path.expanduser("~/.config/freeweights/minisign.key")); ap.add_argument("--no-sign", action="store_true")
    a = ap.parse_args()
    try: m = build(a.repo, a.revision, a.dataset, a.section, a.include)
    except Refused as e:
        print(f"REFUSED {a.repo}: {e}", file=sys.stderr)
        os.makedirs(a.out_dir, exist_ok=True)
        with open(os.path.join(a.out_dir, "refused.log"), "a") as f:
            f.write(f"{datetime.datetime.now(datetime.timezone.utc).isoformat()} {a.repo} {e}\n")
        return 2
    check, schema = load_validator()
    errs = check(m, schema)
    if errs: print("schema errors:\n  " + "\n  ".join(errs), file=sys.stderr); return 1
    os.makedirs(a.out_dir, exist_ok=True)
    out = os.path.join(a.out_dir, a.repo.replace("/", "__") + ".json")
    if os.path.exists(out) and os.path.exists(out + ".minisig"):
        try: old = json.load(open(out, encoding="utf-8"))
        except ValueError: old = None
        def strip(d):  # run timestamps change every run; they are not content
            d = {k: v for k, v in d.items() if k != "created_at"}
            d["sources"] = [{k: v for k, v in x.items() if k != "last_checked"} for x in d.get("sources", [])]
            return d
        if old is not None and strip(old) == strip(m):
            print(f"unchanged {out} (kept existing signature)")
            return 0
    open(out, "w", encoding="utf-8", newline="\n").write(canonical(m))
    if not a.no_sign: sign(out, a.repo, m["upstream"]["commit"], a.key)
    print(f"wrote {out} ({len(m['files'])} files, {sum(f['size'] for f in m['files'])} bytes)")
    return 0

if __name__ == "__main__": sys.exit(main())
