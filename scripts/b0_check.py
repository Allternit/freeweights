#!/usr/bin/env python3
"""B0 preview checks: request the key Freeweights URLs on one base URL and fail on any wrong status. Stdlib only.

  python3 scripts/b0_check.py https://freeweights.allternit.com
  python3 scripts/b0_check.py https://<version>-freeweights-worker.<sub>.workers.dev   # a Worker preview with PAGES_ORIGIN

Run it after every deploy (preview and production). Entries come from catalog/catalog.json: one hosted entry
(detail page, manifest, signature, API detail, tree, HEAD resolve) and one link-only entry (detail page, API
detail). The signature is checked with minisign against spec/keys/freeweights-v0.pub when minisign is installed.
Exit 1 when a check fails. Prints one line per URL with the status and the time.
"""
import json, os, random, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "freeweights-b0-check/1"}


def req(base, path, method="GET", headers=None):
    url = base.rstrip("/") + path
    r = urllib.request.Request(url, method=method, headers={**UA, **(headers or {})})
    t = time.monotonic()
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k): return None
    op = urllib.request.build_opener(NoRedirect)
    try:
        with op.open(r, timeout=30) as resp: body, code, hdr = resp.read(), resp.status, resp.headers
    except urllib.error.HTTPError as e: body, code, hdr = e.read(), e.code, e.headers
    except Exception as e: return 0, b"", {}, f"{type(e).__name__}: {e}", time.monotonic() - t  # noqa: BLE001
    return code, body, hdr, None, time.monotonic() - t


def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    base = sys.argv[1]
    rows = json.load(open(os.path.join(ROOT, "catalog", "catalog.json")))["models"]
    hosted = [r for r in rows if r.get("manifest_url")]
    link = [r for r in rows if not r.get("manifest_url")]
    rnd = random.Random(int(os.environ.get("B0_SEED", "0")) or None)
    h = rnd.choice(hosted); l = rnd.choice(link)
    man = json.load(open(os.path.join(ROOT, "manifests", h["id"].replace("/", "__") + ".json")))
    f = sorted(man["files"], key=lambda x: x["size"])[0]
    q = lambda s: urllib.parse.quote(s, safe="/")
    fails = []

    def check(path, want=200, method="GET", ctype=None, contains=None, name=None):
        code, body, hdr, e, dt = req(base, path, method)
        ok = (code in want if isinstance(want, tuple) else code == want) and not e
        if ok and ctype and ctype not in (hdr.get("content-type") or ""): ok, e = False, f"content-type {hdr.get('content-type')}"
        if ok and contains and contains.encode() not in body: ok, e = False, f"missing {contains!r}"
        print(f"{'ok  ' if ok else 'FAIL'} {code:>3} {dt*1000:6.0f} ms  {method:<4} {path}{'' if ok else '  <- ' + str(e or f'want {want}')}")
        if not ok: fails.append(name or path)
        return body

    check("/", ctype="text/html", contains="Freeweights")
    check("/alt.freeweights/", ctype="text/html")
    check(f"/{h['section']}/", ctype="text/html")
    check(f"/{h['section']}/{q(h['id'])}/", ctype="text/html", contains=h["id"])
    check(f"/{l['section']}/{q(l['id'])}/", ctype="text/html", contains=l["id"])
    check(f"/{h['section']}/{q(h['id'])}", want=(301, 308), name="bare detail URL redirects")
    check("/docs/", ctype="text/html")
    check("/keys/freeweights-v0.pub")
    check("/data/search/index.json", ctype="json")
    check("/data/catalog.json", ctype="json")
    mj = check(f"/manifests/{q(h['id'])}.json", ctype="application/json", contains=man["upstream"]["commit"])
    ms = check(f"/manifests/{q(h['id'])}.json.minisig", contains="untrusted comment")
    check(f"/manifests/{q(h['id'])}.json", method="HEAD")
    check("/manifests/nobody/none.json", want=404)
    check("/api/models?limit=2", ctype="json")
    check(f"/api/models?search={q(h['id'].split('/')[1][:12])}&limit=5", ctype="json", contains=h["id"])
    check(f"/api/models/{q(h['id'])}", ctype="json", contains=man["upstream"]["commit"])
    check(f"/api/models/{q(l['id'])}", ctype="json", contains=l["id"])
    check(f"/api/models/{q(h['id'])}/tree/main", ctype="json", contains=f["sha256"])
    check(f"/{q(h['id'])}/resolve/main/{q(f['path'])}", method="HEAD")
    check("/api/catalog", ctype="json")
    check("/alt.freeweights.text/nobody/none/", want=404)
    if mj and ms and shutil.which("minisign"):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "m.json"); open(p, "wb").write(mj); open(p + ".minisig", "wb").write(ms)
            r = subprocess.run(["minisign", "-Vm", p, "-p", os.path.join(ROOT, "spec", "keys", "freeweights-v0.pub")], capture_output=True, text=True)
            ok = r.returncode == 0
            print(f"{'ok  ' if ok else 'FAIL'} minisign verify of the served manifest ({h['id']})")
            if not ok: fails.append("minisign")
    print(f"\nB0 {base}: {'PASS' if not fails else 'FAIL ' + ', '.join(fails)}  (hosted {h['id']}, link-only {l['id']})")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
