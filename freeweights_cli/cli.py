#!/usr/bin/env python3
"""Freeweights day-one downloader and verifier (stdlib only).

  fw.py get <model-id | manifest-url-or-path> [--dir D] [--pubkey spec/keys/freeweights-v0.pub] [--no-verify-sig]
  fw.py verify <dir> <model-id | manifest> [--pubkey ...] [--no-verify-sig]
  fw.py info <model-id | manifest-path> [--remote] [--width N]
  fw.py search <words...> [--remote] [--width N] [--limit N]

Verifies the minisign signature of the manifest (needs the minisign binary), then downloads
every file from the sources in priority order with resume, and checks size and sha256.
info and search print a model's card in the terminal: a dot-letter family monogram, the
newsgroup header lines (the RECORD face), key facts and the get/verify commands (the ACTION
face). Link-only models print the license link instead of commands."""
import argparse, hashlib, json, os, re, shutil, subprocess, sys, tempfile, textwrap, unicodedata, urllib.error, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL = os.path.isdir(os.path.join(ROOT, "catalog"))  # true in a repository checkout, false when pip/brew installed
DEFAULT_PUB = next((p for p in (os.path.join(ROOT, "spec", "keys", "freeweights-v0.pub"), os.path.join(os.path.dirname(os.path.abspath(__file__)), "keys", "freeweights-v0.pub")) if os.path.exists(p)), "freeweights-v0.pub")
UA = {"User-Agent": "freeweights-fw/0.1"}
ORIGIN = "https://freeweights.allternit.com"
KEY_ID = "2DC28CC7B26A283B"

def fetch_bytes(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: return r.read()

def load_manifest(src, workdir, pubkey, no_verify):
    """Returns (manifest dict, manifest path on disk, signature verdict string)."""
    src = resolve_manifest(src)
    if src.startswith(("http://", "https://")):
        path = os.path.join(workdir, os.path.basename(urllib.parse.urlparse(src).path))
        open(path, "wb").write(fetch_bytes(src))
        try: open(path + ".minisig", "wb").write(fetch_bytes(src + ".minisig"))
        except urllib.error.URLError: pass
    else: path = src
    raw = open(path, "rb").read()
    m = json.loads(raw)
    if raw.decode("utf-8") != json.dumps(m, sort_keys=True, indent=2, ensure_ascii=False) + "\n":
        sys.exit("REJECT: manifest bytes are not canonical JSON")
    if no_verify:
        print("WARNING: signature check skipped (--no-verify-sig); the manifest is NOT authenticated"); return m, path, "skipped"
    if not shutil.which("minisign"):
        sys.exit("minisign not found. Install it (brew install minisign) or pass --no-verify-sig to skip authentication.")
    if not os.path.exists(path + ".minisig"): sys.exit("REJECT: no .minisig next to the manifest")
    r = subprocess.run(["minisign", "-V", "-m", path, "-x", path + ".minisig", "-p", pubkey], capture_output=True, text=True)
    if r.returncode: sys.exit("REJECT: manifest signature failed: " + (r.stderr or r.stdout).strip())
    print("manifest signature: OK"); return m, path, "ok"

def resolve_manifest(src):
    """A model id (org/name) means its manifest: the local copy in manifests/ when this is a
    checkout of the repository, otherwise the one on the Freeweights site."""
    if src.startswith(("http://", "https://")) or os.path.exists(src) or src.count("/") != 1 or src.endswith(".json"):
        return src
    local = os.path.join(ROOT, "manifests", src.replace("/", "__") + ".json")
    return local if os.path.exists(local) else f"{ORIGIN}/manifests/{src}.json"

def sha_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while c := f.read(1 << 20): h.update(c)
    return h.hexdigest()

def file_ok(path, f): return os.path.isfile(path) and os.path.getsize(path) == f["size"] and sha_of(path) == f["sha256"]

def download(url, part, size):
    have = os.path.getsize(part) if os.path.exists(part) else 0
    if have > size: os.remove(part); have = 0
    if have == size: return
    hdr = dict(UA)
    if have: hdr["Range"] = f"bytes={have}-"
    with urllib.request.urlopen(urllib.request.Request(url, headers=hdr), timeout=60) as r:
        if have and r.status != 206: have = 0  # server ignored Range; restart
        with open(part, "ab" if have else "wb") as out:
            done = have
            while c := r.read(1 << 20):
                out.write(c); done += len(c)
                print(f"\r  {done * 100 // max(size, 1):3d}% {done}/{size}", end="", flush=True)
    print()

def sources_of(m):
    return sorted((s for s in m["sources"] if s.get("url")), key=lambda s: (s["priority"], s["url"]))

def cmd_get(a):
    work = tempfile.mkdtemp(prefix="fw-")
    m, mpath, sig = load_manifest(a.manifest, work, a.pubkey, a.no_verify_sig)
    dest = a.dir or m["id"].replace("/", "__")
    os.makedirs(dest, exist_ok=True)
    shutil.copy(mpath, os.path.join(dest, "freeweights-manifest.json"))
    if os.path.exists(mpath + ".minisig"): shutil.copy(mpath + ".minisig", os.path.join(dest, "freeweights-manifest.json.minisig"))
    srcs = sources_of(m)
    if not srcs: sys.exit("no downloadable source (magnet-only manifests need a torrent client)")
    print(f"{m['id']} @ {m['upstream']['commit'][:12]}  license {m['license']['id']}  {len(m['files'])} files")
    for f in m["files"]:
        target = os.path.join(dest, f["path"])
        os.makedirs(os.path.dirname(target) or ".", exist_ok=True)
        if file_ok(target, f): print(f"have {f['path']}"); continue
        print(f"get  {f['path']} ({f['size']} bytes)")
        for s in srcs:
            url = s["url"] + urllib.parse.quote(f["path"])
            part = target + ".part"
            try: download(url, part, f["size"])
            except (urllib.error.URLError, OSError) as e: print(f"  source failed ({e}); next"); continue
            if file_ok(part, f): os.replace(part, target); break
            print("  hash/size mismatch; discarding, next source"); os.remove(part)
    return cmd_verify_dir(dest, m, sig)

def cmd_verify_dir(dest, m, sig="ok"):
    bad = []
    for f in m["files"]:
        p = os.path.join(dest, f["path"])
        if not os.path.isfile(p): bad.append((f["path"], "missing"))
        elif os.path.getsize(p) != f["size"]: bad.append((f["path"], "size"))
        elif sha_of(p) != f["sha256"]: bad.append((f["path"], "sha256"))
    for p, why in bad: print(f"FAIL {p}: {why}")
    ok = not bad
    print(f"VERDICT: {'PASS' if ok else 'FAIL'}  {len(m['files']) - len(bad)}/{len(m['files'])} files verified, signature {sig}, {m['id']}")
    return 0 if ok else 1

def cmd_verify(a):
    work = tempfile.mkdtemp(prefix="fw-")
    m, _, sig = load_manifest(a.manifest, work, a.pubkey, a.no_verify_sig)
    return cmd_verify_dir(a.dir, m, sig)


# ---------- info / search: the model card in the terminal ----------
# Same dot lettering as the site (5-row glyphs), drawn with braille characters.
FONT = {
    "A": ["..#..", ".#.#.", "#####", "#...#", "#...#"], "B": ["####.", "#...#", "####.", "#...#", "####."],
    "C": [".####", "#....", "#....", "#....", ".####"], "D": ["####.", "#...#", "#...#", "#...#", "####."],
    "E": ["#####", "#....", "####.", "#....", "#####"], "F": ["#####", "#....", "####.", "#....", "#...."],
    "G": [".####", "#....", "#.###", "#...#", ".###."], "H": ["#...#", "#...#", "#####", "#...#", "#...#"],
    "I": ["###", ".#.", ".#.", ".#.", "###"], "J": ["..###", "...#.", "...#.", "#..#.", ".##.."],
    "K": ["#...#", "#..#.", "###..", "#..#.", "#...#"], "L": ["#....", "#....", "#....", "#....", "#####"],
    "M": ["#...#", "##.##", "#.#.#", "#...#", "#...#"], "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#"],
    "O": [".###.", "#...#", "#...#", "#...#", ".###."], "P": ["####.", "#...#", "####.", "#....", "#...."],
    "Q": [".###.", "#...#", "#.#.#", "#..#.", ".##.#"], "R": ["####.", "#...#", "####.", "#.#..", "#..##"],
    "S": [".####", "#....", ".###.", "....#", "####."], "T": ["#####", "..#..", "..#..", "..#..", "..#.."],
    "U": ["#...#", "#...#", "#...#", "#...#", ".###."], "V": ["#...#", "#...#", "#...#", ".#.#.", "..#.."],
    "W": ["#...#", "#...#", "#.#.#", "##.##", "#...#"], "X": ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    "Y": ["#...#", ".#.#.", "..#..", "..#..", "..#.."], "Z": ["#####", "...#.", "..#..", ".#...", "#####"],
    "0": [".###.", "#..##", "#.#.#", "##..#", ".###."], "1": [".#.", "##.", ".#.", ".#.", "###"],
    "2": ["####.", "....#", ".###.", "#....", "#####"], "3": ["####.", "....#", ".###.", "....#", "####."],
    "4": ["#..#.", "#..#.", "#####", "...#.", "...#."], "5": ["#####", "#....", "####.", "....#", "####."],
    "6": [".###.", "#....", "####.", "#...#", ".###."], "7": ["#####", "....#", "...#.", "..#..", "..#.."],
    "8": [".###.", "#...#", ".###.", "#...#", ".###."], "9": [".###.", "#...#", ".####", "....#", ".###."],
}
# Same family codes as the site (site/build.mjs MONO).
MONO = {"qwen": "QW", "deepseek": "DS", "kimi": "KM", "glm": "GL", "minimax": "MX", "mimo": "MO", "gemma": "GM", "gpt-oss": "GO",
        "olmo": "OL", "nemotron": "NV", "phi": "PH", "mistral": "MS", "speech": "SP", "embed": "EM", "image": "IM", "ocr": "OC",
        "datasets": "DT", "tools": "TL", "abliterated": "AB", "video": "VI", "music": "MU", "allternit": "AT"}
LC = {"permissive": "permissive", "custom": "custom terms", "non-commercial": "non-commercial", "gated": "gated"}
BRAILLE = [(0, 0, 0x01), (0, 1, 0x02), (0, 2, 0x04), (1, 0, 0x08), (1, 1, 0x10), (1, 2, 0x20), (0, 3, 0x40), (1, 3, 0x80)]

def monogram(code, big=False):
    """Two-letter code -> dot lettering. big: 5 lines, one braille block per glyph dot (the card).
    Otherwise 3 lines, each glyph dot a 2x2 group of braille dots (search results)."""
    rows = [""] * 5
    for i, ch in enumerate(code.upper()[:2]):
        g = FONT.get(ch, ["...", "...", "...", "...", "..."])
        for r in range(5): rows[r] += ("." if i else "") + g[r]
    if big: return ["".join("\u28ff" if c == "#" else "\u2800" for c in line) for line in rows]
    w = len(rows[0]); dots = [[False] * (w * 2) for _ in range(12)]
    for r in range(5):
        for c in range(w):
            if rows[r][c] == "#":
                for dy in (0, 1):
                    for dx in (0, 1): dots[r * 2 + dy][c * 2 + dx] = True
    out = []
    for cr in range(3):
        line = ""
        for cc in range(w):
            v = 0
            for dx, dy, bit in BRAILLE:
                y, x = cr * 4 + dy, cc * 2 + dx
                if y < 12 and dots[y][x]: v |= bit
            line += chr(0x2800 + v)
        out.append(line)
    return out

def human(n):
    if n is None: return "size unknown"
    u, i, v = ["B", "KB", "MB", "GB", "TB"], 0, float(n)
    while v >= 1000 and i < len(u) - 1: v /= 1000; i += 1
    return (f"{round(v):,}" if v >= 100 or i == 0 else f"{v:.1f}" if v >= 10 else f"{v:.2f}") + " " + u[i]

def params_str(n):
    if not n: return ""
    return f"{n / 1e12:.2f}".rstrip("0").rstrip(".") + "T" if n >= 1e12 else f"{n / 1e9:.1f}".rstrip("0").rstrip(".") + "B" if n >= 1e9 else f"{round(n / 1e6)}M"

def catalog_rows(remote):
    if remote:
        data = json.loads(fetch_bytes(f"{ORIGIN}/api/catalog"))
    else:
        data = json.load(open(os.path.join(ROOT, "catalog", "catalog.json")))
    rows = data if isinstance(data, list) else data.get("models") or data.get("rows") or []
    seen = {r["id"]: r for r in rows if isinstance(r, dict) and r.get("id")}
    if not remote:
        rdir = os.path.join(ROOT, "catalog", "rows")
        for f in sorted(os.listdir(rdir)) if os.path.isdir(rdir) else []:
            if f.endswith(".json"):
                try: r = json.load(open(os.path.join(rdir, f)))
                except ValueError: continue
                if isinstance(r, dict) and r.get("id"): seen.setdefault(r["id"], r)
    return list(seen.values())

def manifest_for(row, remote):
    """(manifest or None, sha256 of its bytes, signed?) for a catalog row."""
    rid = row["id"]
    if remote:
        url = row.get("manifest_url")
        if not url: return None, "", False
        try: raw = fetch_bytes(url)
        except (urllib.error.URLError, OSError): return None, "", False
        try: fetch_bytes(url + ".minisig"); signed = True
        except (urllib.error.URLError, OSError): signed = False
        return json.loads(raw), hashlib.sha256(raw).hexdigest(), signed
    path = os.path.join(ROOT, "manifests", rid.replace("/", "__") + ".json")
    if not os.path.exists(path): return None, "", False
    raw = open(path, "rb").read()
    return json.loads(raw), hashlib.sha256(raw).hexdigest(), os.path.exists(path + ".minisig")

def card_data(row, remote, fetch=True):
    m, sha, signed = manifest_for(row, remote) if fetch else (None, "", False)
    lc = row.get("license_class")
    link_only = lc in ("non-commercial", "gated", "territory", "unreviewed") or not row.get("manifest_url")
    fam = row["section"].replace("alt.freeweights.", "")  # the site's monogram follows the section
    files = (m or {}).get("files") or []
    tasks = row.get("tasks") or []
    size = row.get("total_size") if row.get("total_size") is not None else (sum(f.get("size", 0) for f in files) if files else None)
    up = (m or {}).get("upstream") or {}
    host = up.get("host") or urllib.parse.urlparse(row.get("upstream_url") or "").netloc or "huggingface.co"
    what = "Dataset" if row["section"] == "alt.freeweights.datasets" else (tasks[0].replace("-", " ").capitalize() + " model") if tasks else "Model"
    p = params_str(row.get("params"))
    fmts = row.get("formats") or []
    summary = row.get("summary") or f"{what}{' with ' + p + ' parameters' if p else ''}. {(' and '.join(fmts) or 'files').capitalize()}, {human(size)} in all. Published by {row['id'].split('/')[0]} under {row.get('license_id') or 'see card'}."
    return {"id": row["id"], "name": row.get("display_name") or row["id"].split("/")[-1], "org": row["id"].split("/")[0], "section": row["section"],
            "mono": MONO.get(fam) or "".join(c for c in fam if c.isalnum())[:2].upper() or "FW", "added": str(row.get("added_at") or "")[:10],
            "commit": (up.get("commit") or "")[:7], "signed": signed and not link_only, "sha": sha[:12], "files": len(files), "size": size, "params": p,
            "formats": fmts, "task": tasks[0].replace("-", " ") if tasks else "", "license": row.get("license_id") or "see card", "lc": lc or "",
            "terms": bool(row.get("requires_terms")), "link_only": link_only, "host": host, "summary": summary,
            "license_url": row.get("license_url") or row.get("upstream_url") or f"https://{host}/{row['id']}"}

class Paint:
    def __init__(self, on): self.on = on
    def __call__(self, code, s): return f"\033[{code}m{s}\033[0m" if self.on and s else s

def cols(s):  # display width: braille and box drawing are one column; wide East Asian chars are two
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 0 if unicodedata.combining(c) else 1 for c in s)

def fit(s, w):
    if cols(s) <= w: return s + " " * (w - cols(s))
    out = ""
    for c in s:
        if cols(out + c) > w - 1: break
        out += c
    return out + "…" + " " * (w - 1 - cols(out))

def term_width(arg):
    if arg: return max(60, arg)
    return max(60, min(100, shutil.get_terminal_size((80, 24)).columns))

def render_card(d, width, paint):
    """The card as box-drawn lines: RECORD header with the monogram, summary, facts, ACTION."""
    inner = width - 4
    dim, bold, acc, ok, warn = (lambda s: paint("2", s)), (lambda s: paint("1", s)), (lambda s: paint("38;5;173", s)), (lambda s: paint("32", s)), (lambda s: paint("33", s))
    def row(text, painted=None):  # pad on the plain text, then paint
        f = fit(text, inner)
        if painted is None: return f"│ {f} │"
        return f"│ {painted(f.rstrip())}{' ' * (inner - cols(f.rstrip()))} │"
    title = f" {d['section']} "; tag = " link only " if d["link_only"] else " fw "
    top = "┌─" + title + "─" * max(1, width - 4 - cols(title) - cols(tag)) + tag + "─┐"
    sep = "├" + "─" * (width - 2) + "┤"
    out = [dim(top)]
    head = [("From:", f"{d['org']} <{d['host']}/{d['org']}>"), ("Newsgroups:", d["section"]), ("Subject:", d["name"]), ("Date:", d["added"] or "unknown")]
    if d["commit"]: head.append(("Commit:", d["commit"]))
    if d["signed"]: head.append(("Signed:", f"{KEY_ID} ✓"))
    mono = monogram(d["mono"], big=True); mw = cols(mono[0]) + 3
    while len(head) < len(mono): head.append(("", ""))
    for i, (k, v) in enumerate(head):
        left = mono[i] if i < len(mono) else ""
        plain = fit(left, mw) + f"{k:<12}" + v
        f = fit(plain, inner)
        lp, rest = f[:len(fit(left, mw))], f[len(fit(left, mw)):]
        key, val = rest[:12], rest[12:]
        val_p = bold(val.rstrip()) + val[len(val.rstrip()):] if k == "Subject:" else ok(val.rstrip()) + val[len(val.rstrip()):] if k == "Signed:" else val
        out.append(dim("│ ") + acc(lp) + dim(key) + val_p + dim(" │"))
    out.append(dim(sep))
    for line in textwrap.wrap(d["summary"], inner) or [""]:
        out.append(dim("│ ") + fit(line, inner) + dim(" │"))
    out.append(dim(sep))
    facts = [f"params {d['params'] or 'not stated'}", f"size {human(d['size'])}", " ".join(d["formats"]) or "files", f"{d['license']} ({LC.get(d['lc'], d['lc'] or 'see card')})"]
    if d["task"]: facts.insert(3, d["task"])
    for line in textwrap.wrap("  ·  ".join(facts), inner):
        out.append(dim("│ ") + fit(line, inner) + dim(" │"))
    out.append(dim(sep))
    if d["link_only"]:
        out.append(dim("│ ") + warn(fit("link only — read the license:", inner)) + dim(" │"))
        for line in textwrap.wrap(d["license_url"], inner, break_long_words=True, break_on_hyphens=False):
            out.append(dim("│ ") + fit(line, inner) + dim(" │"))
    else:
        if d["terms"]: out.append(dim("│ ") + warn(fit("# custom terms: read the license before you download", inner)) + dim(" │"))
        repo = d["id"].split("/", 1)[1]
        cmds = [("$ ", f"fw get {d['id']}"), ("# ", f"manifest sha256 {d['sha'] or 'pending'}… · {d['files']} files"), ("$ ", f"fw verify ./{repo} {d['id']}")]
        for pre, c in cmds:
            if pre == "# ":
                out.append(dim("│ ") + dim(fit(pre + c, inner)) + dim(" │")); continue
            # commands wrap instead of being cut, so they stay copyable
            for j, part in enumerate(textwrap.wrap(c, inner - 2, break_long_words=True, break_on_hyphens=False)):
                out.append(dim("│ ") + (acc("$ ") if j == 0 else "  ") + fit(part, inner - 2) + dim(" │"))
    out.append(dim("└" + "─" * (width - 2) + "┘"))
    return out

def find_row(rows, key):
    if os.path.isfile(key):  # a manifest path
        m = json.load(open(key)); key = m.get("id", key)
    k = key.lower()
    for r in rows:
        if r["id"].lower() == k: return r
    hits = [r for r in rows if r["id"].lower().endswith("/" + k) or (r.get("display_name") or "").lower() == k]
    return hits[0] if len(hits) == 1 else None

def color_on():
    return sys.stdout.isatty() and not os.environ.get("NO_COLOR")

def cmd_info(a):
    a.remote = a.remote or not LOCAL
    rows = catalog_rows(a.remote)
    r = find_row(rows, a.model)
    if not r:
        print(f"no model {a.model} in the catalog. Try: fw search {a.model.split('/')[-1]}", file=sys.stderr); return 1
    print("\n".join(render_card(card_data(r, a.remote), term_width(a.width), Paint(color_on()))))
    return 0

TIER_RANK = {"T0": 0, "T1": 1, "T2": 2}
REL_RANK = {"base": 0, "finetune": 1, "merge": 1, "quant": 2, "adapter": 2}
def rank_of(r):
    """Same order as the site and the API: official lab repos and base models first, then
    fine-tunes, then quants and adapters. Order is never for sale."""
    rel = (r.get("relation") or {}).get("type") or "base"
    t = TIER_RANK.get(r.get("tier") or "")
    if t is None:
        norm = lambda x: re.sub(r"[^a-z0-9]", "", str(x or "").lower())
        o, f = norm(r["id"].split("/")[0]), norm(r.get("family"))
        t = 0.5 if rel == "base" and f and o and (f in o or o in f) else 2.5 if rel == "base" else 3
    return round(t * 10) + REL_RANK.get(rel, 1)

def api_get(path):
    return json.loads(fetch_bytes(ORIGIN + path))

def api_search(words, limit=1000):
    """Ask the live hub API (GET /api/models?search=) for models matching every word. The API
    matches one text needle on id and display name, so send the longest word and keep the
    models whose id, name, task, format, section or license contain all words."""
    needle = max(words, key=len)
    hits = api_get("/api/models?" + urllib.parse.urlencode({"search": needle, "limit": limit, "sort": "rank"}))
    def text(h): return " ".join([h.get("id", ""), h.get("pipeline_tag") or "", h.get("library_name") or "", h.get("section") or "", h.get("license") or ""]).lower()
    ids = [h["id"] for h in hits if all(w in text(h) for w in words)]
    if not ids: return []
    rows = {r["id"]: r for r in catalog_rows(True)}  # one request; the cards need the catalog fields
    return [rows[i] for i in ids if i in rows]

def cmd_search(a):
    words = [w.lower() for w in a.words]
    if a.local:
        if not LOCAL: print("fw search --local needs a repository checkout.", file=sys.stderr); return 2
        rows = catalog_rows(False)
        def text(r): return " ".join([r["id"], r.get("display_name") or "", r["section"], " ".join(r.get("tasks") or []), " ".join(r.get("formats") or []), r.get("license_id") or "", r.get("license_class") or ""]).lower()
        hits = sorted((r for r in rows if all(w in text(r) for w in words)), key=lambda r: str(r.get("added_at") or ""), reverse=True)
        hits.sort(key=rank_of)  # stable: rank first, newest first within a rank
    else:
        try: hits = api_search(words)
        except (urllib.error.URLError, OSError, ValueError) as e:
            print(f"fw search: cannot reach {ORIGIN} ({getattr(e, 'reason', e)}). Check your connection and try again.", file=sys.stderr); return 2
    a.remote = not a.local
    width, paint = term_width(a.width), Paint(color_on())
    q = " ".join(a.words)
    if not hits:
        print(f'no model matches "{q}"'); return 1
    print(paint("2", f'fw search: {len(hits)} match{"es" if len(hits) != 1 else ""} for "{q}"'))
    if len(hits) <= a.cards:
        for r in hits: print("\n".join(render_card(card_data(r, a.remote), width, paint)))
        return 0
    for r in hits[: a.limit]:
        d = card_data(r, a.remote, fetch=False)
        mono = monogram(d["mono"])
        facts = f"{human(d['size'])} · {LC.get(d['lc'], d['lc'] or 'see card')}"
        line1 = fit(f"{d['name']}", width - 16 - cols(facts)) + "  " + facts
        line2 = fit(f"From: {d['org']}  in {d['section']}  {d['added']}", width - 14)
        cmd = "link only — read the license: " + d["license_url"] if d["link_only"] else f"$ fw get {d['id']}"
        print(paint("38;5;173", mono[0]) + "  " + paint("1", line1))
        print(paint("38;5;173", mono[1]) + "  " + paint("2", line2))
        parts = textwrap.wrap(cmd, width - 13, break_long_words=True, break_on_hyphens=False)
        print(paint("38;5;173", mono[2]) + "  " + (paint("33", parts[0]) if d["link_only"] else parts[0]))
        for part in parts[1:]: print(" " * 13 + (paint("33", part) if d["link_only"] else part))
    more = len(hits) - a.limit
    print(paint("2", (f"{more} more. " if more > 0 else "") + "fw info <id> shows the full card."))
    return 0

def main(argv=None):
    ap = argparse.ArgumentParser(prog="fw"); sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("get", help="download and verify a model"); g.add_argument("manifest", help="model id, manifest URL or manifest path"); g.add_argument("--dir")
    v = sub.add_parser("verify", help="check a downloaded folder"); v.add_argument("dir"); v.add_argument("manifest", help="model id, manifest URL or manifest path")
    for p in (g, v): p.add_argument("--pubkey", default=DEFAULT_PUB); p.add_argument("--no-verify-sig", action="store_true")
    i = sub.add_parser("info", help="print a model's card"); i.add_argument("model", help="model id (org/name), its name, or a manifest path")
    se = sub.add_parser("search", help="find models and print their cards"); se.add_argument("words", nargs="+")
    se.add_argument("--limit", type=int, default=20, help="most matches to list (default 20)"); se.add_argument("--cards", type=int, default=3, help="print full cards when there are at most this many matches (default 3)")
    se.add_argument("--local", action="store_true", help="search the catalog in this repository checkout instead of the live API")
    for p in (i, se): p.add_argument("--remote", action="store_true", help=f"read from {ORIGIN} (the default when installed; search always uses the live API unless --local)"); p.add_argument("--width", type=int, help="card width in columns (at least 60; default: the terminal, up to 100)")
    a = ap.parse_args(argv)
    return {"get": cmd_get, "verify": cmd_verify, "info": cmd_info, "search": cmd_search}[a.cmd](a)

if __name__ == "__main__": sys.exit(main())
