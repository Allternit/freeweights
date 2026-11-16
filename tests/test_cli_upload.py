"""fw login / whoami / repo create / upload / repo status against a local fake hub (no network)."""
import hashlib, io, json, os, stat, sys, tempfile, threading, unittest
from contextlib import redirect_stderr, redirect_stdout
from http.server import BaseHTTPRequestHandler, HTTPServer
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from freeweights_cli import cli

KEY = "alt_testkey"


class Hub(BaseHTTPRequestHandler):
    log = []          # (method, path)
    puts = {}         # path -> bytes
    commits = []      # parsed NDJSON lines
    batch_error = None
    chunk = 4

    def log_message(self, *a): pass

    def _send(self, code, obj=None, headers=None):
        raw = json.dumps(obj).encode() if obj is not None else b""
        self.send_response(code)
        for k, v in (headers or {}).items(): self.send_header(k, v)
        self.send_header("Content-Length", str(len(raw))); self.end_headers(); self.wfile.write(raw)

    def _body(self): return self.rfile.read(int(self.headers.get("Content-Length") or 0))

    def do_GET(self):
        Hub.log.append(("GET", self.path))
        if self.headers.get("Authorization") != "Bearer " + KEY: return self._send(401, {"error": "bad key"})
        if self.path == "/api/whoami-v2": return self._send(200, {"type": "user", "id": "user_1", "name": "ada"})
        if self.path == "/api/fw/v1/repos":
            return self._send(200, {"repos": [{"id": "rp_1", "type": "model", "name": "ada/tiny", "status": "scanning", "bytes": 12,
                                               "scans": {"queued": 1, "scanning": 0, "clean": 2, "held": 1, "error": 0, "held_codes": ["pickle_unsafe"]}}]})
        self._send(404, {"error": "nope"})

    def do_PUT(self):
        Hub.log.append(("PUT", self.path)); Hub.puts[self.path] = self._body()
        self._send(200, None, {"ETag": '"etag-' + self.path.rsplit("/", 1)[-1] + '"'})

    def do_POST(self):
        Hub.log.append(("POST", self.path)); body = self._body()
        auth = self.headers.get("Authorization") == "Bearer " + KEY
        if self.path.startswith("/put/"): return self._send(404)
        if not auth: return self._send(401, {"error": "bad key"})
        base = "http://127.0.0.1:%d" % self.server.server_port
        if self.path == "/api/repos/create":
            req = json.loads(body)
            if req["name"] == "taken": return self._send(409, {"error": "exists"})
            return self._send(200, {"url": base + "/ada/" + req["name"], "id": "rp_1"})
        if self.path.endswith("/preupload/main"):
            req = json.loads(body)
            if any(f["path"].endswith(".exe") for f in req["files"]):
                return self._send(400, {"error": "file_type_not_allowed", "message": "Executables are not allowed.", "paths": ["run.exe"], "limit": "x"})
            return self._send(200, {"files": [{"path": f["path"], "uploadMode": "lfs" if f["size"] > 10 else "regular", "shouldIgnore": False} for f in req["files"]]})
        if self.path.endswith("/info/lfs/objects/batch"):
            objs = json.loads(body)["objects"]; out = []
            for o in objs:
                if Hub.batch_error: out.append({"oid": o["oid"], "size": o["size"], "error": {"code": 507, "message": Hub.batch_error}}); continue
                up = f"/put/{o['oid'][:8]}"
                if o["size"] > 20:
                    hdr = {"chunk_size": str(Hub.chunk)}
                    for n in range(1, -(-o["size"] // Hub.chunk) + 1): hdr["%05d" % n] = base + up + "/%05d" % n
                    act = {"upload": {"href": base + "/api/fw/v1/lfs/up_1/complete", "header": hdr}, "verify": {"href": base + "/api/fw/v1/lfs/up_1/verify"}}
                else:
                    act = {"upload": {"href": base + up, "header": {"x-test": "1"}}, "verify": {"href": base + "/api/fw/v1/lfs/up_2/verify"}}
                out.append({"oid": o["oid"], "size": o["size"], "actions": act})
            return self._send(200, {"transfer": "basic", "objects": out})
        if "/lfs/" in self.path: return self._send(200, {})
        if "/commit/main" in self.path:
            Hub.commits = [json.loads(l) for l in body.decode().splitlines()]
            return self._send(200, {"commitOid": "c" * 40, "commitUrl": base})
        self._send(404, {"error": "nope"})


class UploadCli(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.srv = HTTPServer(("127.0.0.1", 0), Hub)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.origin = "http://127.0.0.1:%d" % cls.srv.server_port

    @classmethod
    def tearDownClass(cls): cls.srv.shutdown()

    def setUp(self):
        Hub.log, Hub.puts, Hub.commits, Hub.batch_error = [], {}, [], None
        self.tmp = tempfile.mkdtemp()
        cli.ORIGIN = self.origin
        cli.TOKEN_PATH = os.path.join(self.tmp, "cfg", "token")
        os.environ.pop("FW_TOKEN", None)

    def run_cli(self, *argv):
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err): code = cli.main(list(argv))
        return code, out.getvalue(), err.getvalue()

    def test_login_saves_0600_and_rejects_bad_key(self):
        code, out, _ = self.run_cli("login", "--token", KEY)
        self.assertEqual(code, 0); self.assertIn("ada", out)
        self.assertEqual(stat.S_IMODE(os.stat(cli.TOKEN_PATH).st_mode), 0o600)
        self.assertEqual(open(cli.TOKEN_PATH).read().strip(), KEY)
        os.remove(cli.TOKEN_PATH)
        code, _, err = self.run_cli("login", "--token", "alt_wrong")
        self.assertEqual(code, 1); self.assertFalse(os.path.exists(cli.TOKEN_PATH)); self.assertIn("401", err)
        self.assertEqual(self.run_cli("login", "--token", "hf_abc")[0], 2)

    def test_whoami_needs_login(self):
        with self.assertRaises(SystemExit): self.run_cli("whoami")
        cli.write_token(KEY)
        self.assertIn("ada", self.run_cli("whoami")[1])

    def test_repo_create_and_exists(self):
        cli.write_token(KEY)
        code, out, _ = self.run_cli("repo", "create", "ada/tiny")
        self.assertEqual(code, 0); self.assertIn("/ada/tiny", out)
        self.assertIn("already exists", self.run_cli("repo", "create", "ada/taken")[1])

    def test_upload_small_basic_and_multipart(self):
        cli.write_token(KEY)
        d = os.path.join(self.tmp, "m"); os.makedirs(d)
        open(os.path.join(d, "README.md"), "w").write("hi")          # regular
        mid = b"m" * 15                                              # lfs, basic
        big = bytes(range(30))                                       # lfs, multipart in 4-byte parts
        open(os.path.join(d, "mid.bin"), "wb").write(mid); open(os.path.join(d, "big.bin"), "wb").write(big)
        code, out, err = self.run_cli("upload", d, "ada/tiny")
        self.assertEqual(code, 0, err)
        puts = Hub.puts
        self.assertEqual(puts["/put/" + hashlib.sha256(mid).hexdigest()[:8]], mid)
        base = "/put/" + hashlib.sha256(big).hexdigest()[:8] + "/%05d"
        self.assertEqual(b"".join(puts[base % n] for n in range(1, 9)), big)
        self.assertEqual(len([p for p in puts if p.startswith("/put/" + hashlib.sha256(big).hexdigest()[:8])]), 8)
        methods = [m + " " + p for m, p in Hub.log]
        self.assertLess(methods.index("POST /api/models/ada/tiny/preupload/main"), methods.index("POST /ada/tiny.git/info/lfs/objects/batch"))
        self.assertLess(methods.index("POST /ada/tiny.git/info/lfs/objects/batch"), methods.index("POST /api/models/ada/tiny/commit/main"))
        self.assertIn("POST /api/fw/v1/lfs/up_1/complete", methods); self.assertIn("POST /api/fw/v1/lfs/up_1/verify", methods)
        keys = [l["key"] for l in Hub.commits]
        self.assertEqual(keys[0], "header"); self.assertEqual(sorted(keys[1:]), ["file", "lfsFile", "lfsFile"])
        lf = {l["value"]["path"]: l["value"] for l in Hub.commits if l["key"] == "lfsFile"}
        self.assertEqual(lf["big.bin"]["oid"], hashlib.sha256(big).hexdigest()); self.assertEqual(lf["big.bin"]["size"], 30)

    def test_upload_refusals_are_plain(self):
        cli.write_token(KEY)
        d = os.path.join(self.tmp, "e"); os.makedirs(d); open(os.path.join(d, "run.exe"), "wb").write(b"MZ")
        code, _, err = self.run_cli("upload", d, "ada/tiny")
        self.assertEqual(code, 1); self.assertIn("Executables are not allowed", err); self.assertIn("run.exe", err)
        self.assertNotIn("/commit/main", " ".join(p for _, p in Hub.log))
        d2 = os.path.join(self.tmp, "f"); os.makedirs(d2); open(os.path.join(d2, "w.bin"), "wb").write(b"x" * 15)
        Hub.batch_error = "over your storage cap (storage_full)"
        code, _, err = self.run_cli("upload", d2, "ada/tiny")
        self.assertEqual(code, 1); self.assertIn("storage_full", err); self.assertEqual(Hub.puts, {})

    def test_repo_status(self):
        cli.write_token(KEY)
        code, out, _ = self.run_cli("repo", "status")
        self.assertEqual(code, 0); self.assertIn("ada/tiny  model  scanning", out)
        self.assertIn("2 clean, 1 waiting, 1 held", out); self.assertIn("pickle_unsafe", out)
        self.assertEqual(self.run_cli("repo", "status", "ada/none")[0], 1)


if __name__ == "__main__":
    unittest.main()
