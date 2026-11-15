"""Test harness for fw-scanner.

The corpus is generated at test time (nothing malicious is committed, and the EICAR string and the AWS key
are assembled from pieces so no antivirus or secret scanner trips on the repo). The network edge is a
local fake of the Worker's scan API that checks every HMAC signature itself. The external scanners are
the real binaries when installed; a missing one is replaced by a small stand-in with the same command line
and exit codes, and test_real_tool reports it as skipped."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import pickle
import shutil
import stat
import struct
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

SCANNER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(SCANNER)
sys.path.insert(0, SCANNER)

SECRET = "test-scanner-secret"


# ------------------------------------------------------------------------------------------ corpus
class _Reduce:
    def __reduce__(self):
        return (os.system, ("echo pwned",))     # pickled, never loaded


def eicar() -> bytes:
    return ("X5O!P%@AP[4\\PZX54(P^)7CC)7}$" + "EICAR-STANDARD-" + "ANTIVIRUS-TEST-FILE!$H+H*").encode()


def fake_aws_key_text() -> bytes:
    key_id = "AK" + "IA" + "Q7ZK3M5V2XWJ4T6R"
    secret = "wJalrXUtnFEMI/K7MDENG/" + "bPxRfiCYZq8v3Lm2Np"
    return f"[default]\naws_access_key_id = {key_id}\naws_secret_access_key = {secret}\n".encode()


def safetensors_bytes() -> bytes:
    header = json.dumps({"__metadata__": {"format": "pt"},
                         "w": {"dtype": "F32", "shape": [2], "data_offsets": [0, 8]}}).encode()
    return struct.pack("<Q", len(header)) + header + struct.pack("<2f", 1.0, 2.0)


def corpus() -> dict:
    """name -> (path in the repo, file_class, bytes, expected status, expected codes)."""
    return {
        "pickle": ("weights/evil.pkl", "pickle", pickle.dumps(_Reduce(), protocol=4), "held", {"unsafe_pickle"}),
        "eicar": ("notes/readme.txt", "other", eicar(), "held", {"malware"}),
        "aws": ("config/creds.txt", "other", fake_aws_key_text(), "held", {"secret_found"}),
        "gguf": ("model.gguf", "weights", b"GGUF" + struct.pack("<I", 99) + bytes(56), "held", {"bad_header"}),
        "safetensors": ("model.safetensors", "weights", safetensors_bytes(), "clean", set()),
    }


# ------------------------------------------------------------------------------------------ tools
FAKE_TOOL = r'''
import json, os, pickletools, re, sys
name, args = sys.argv[1], sys.argv[2:]
def unsafe_globals(path):
    try:
        ops = list(pickletools.genops(open(path, "rb").read()))
    except Exception:
        return None
    out, strings = [], []
    for op, arg, _ in ops:
        if op.name in ("SHORT_BINUNICODE", "BINUNICODE", "UNICODE"): strings.append(arg)
        if op.name == "GLOBAL": out.append(tuple(arg.split(" ", 1)))
        if op.name == "STACK_GLOBAL" and len(strings) >= 2: out.append((strings[-2], strings[-1]))
    return [g for g in out if g[0] in ("os", "posix", "nt", "subprocess", "builtins")]
if name == "clamscan":
    path = args[-1]
    if b"EICAR-STANDARD-ANTIVIRUS-TEST-FILE" in open(path, "rb").read():
        print(f"{path}: Eicar-Test-Signature FOUND"); sys.exit(1)
    sys.exit(0)
if name == "gitleaks":
    path, report = args[1], args[args.index("-r") + 1]
    text = open(path, "rb").read().decode("utf-8", "replace")
    leaks = [{"RuleID": "aws-access-token", "StartLine": i + 1, "Secret": "REDACTED"}
             for i, line in enumerate(text.splitlines()) if re.search(r"\bAKIA[A-Z2-7]{16}\b", line)]
    json.dump(leaks, open(report, "w")); sys.exit(1 if leaks else 0)
if name == "picklescan":
    path = args[args.index("-p") + 1]; bad = unsafe_globals(path)
    if bad is None: print(f"could not parse {path} as pickle"); sys.exit(0)
    for m, f in bad: print(f"{path}: dangerous import '{m} {f}' FOUND")
    sys.exit(1 if bad else 0)
if name == "modelscan":
    path, report = args[args.index("-p") + 1], args[args.index("-o") + 1]
    if not path.endswith((".pkl", ".pickle", ".pt", ".pth", ".bin", ".ckpt", ".npy")): sys.exit(3)
    bad = unsafe_globals(path) or []
    json.dump({"issues": [{"module": m, "operator": f, "severity": "CRITICAL"} for m, f in bad]}, open(report, "w"))
    sys.exit(1 if bad else 0)
sys.exit(4)
'''

TOOL_NAMES = ("picklescan", "modelscan", "clamscan", "gitleaks")


def _search_path():
    return os.pathsep.join([os.path.dirname(sys.executable), "/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"])


def real_tool(name):
    return shutil.which(name, path=_search_path())


@pytest.fixture(scope="session")
def tool_bins(tmp_path_factory):
    """{tool: (binary, is_real)}."""
    d = tmp_path_factory.mktemp("fake-tools")
    script = d / "fake_tool.py"
    script.write_text(FAKE_TOOL)
    out = {}
    for name in TOOL_NAMES:
        real = None if os.environ.get("FW_SCANNER_FAKE_TOOLS") else real_tool(name)   # =1: stand-ins only
        if real:
            out[name] = (real, True)
            continue
        wrapper = d / name
        wrapper.write_text(f"#!/bin/sh\nexec {sys.executable} {script} {name} \"$@\"\n")
        wrapper.chmod(wrapper.stat().st_mode | stat.S_IEXEC)
        out[name] = (str(wrapper), False)
    return out


# ------------------------------------------------------------------------------------------ fake Worker
class FakeWorker:
    """The Worker's scan routes, enough for the scanner: it checks the HMAC exactly as spec 11.4 says."""

    def __init__(self, secret=SECRET, file_max=64 << 20):
        self.secret, self.file_max = secret.encode(), file_max
        self.jobs, self.blobs, self.results, self.bad_signatures = [], {}, {}, 0
        worker = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def _body(self):
                return self.rfile.read(int(self.headers.get("Content-Length") or 0))

            def _send(self, code, obj=None, raw=None):
                data = raw if raw is not None else json.dumps(obj).encode()
                self.send_response(code)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def _signed(self, body):
                ts, sig = self.headers.get("X-FW-Timestamp", ""), self.headers.get("X-FW-Signature", "")
                if not ts.isdigit() or abs(int(ts) - time.time()) > 300:
                    return False
                msg = f"{ts}\n{self.command}\n{self.path}\n{hashlib.sha256(body).hexdigest()}".encode()
                want = "v1=" + hmac.new(worker.secret, msg, hashlib.sha256).hexdigest()
                return hmac.compare_digest(want, sig)

            def do_GET(self):
                if self.path == "/api/fw/v1/limits":
                    return self._send(200, {"open": False, "limits": {"file_max_bytes": worker.file_max},
                                            "site": {"used_bytes": 0, "cap_bytes": None, "full": True},
                                            "scanning_delayed": False})
                if self.path.startswith("/blob/") and self.path[6:] in worker.blobs:
                    return self._send(200, raw=worker.blobs[self.path[6:]])
                self._send(404, {"error": "not_found"})

            def do_POST(self):
                body = self._body()
                if not self._signed(body):
                    worker.bad_signatures += 1
                    return self._send(401, {"error": "bad_signature"})
                if self.path == "/api/fw/v1/scan/claim":
                    jobs = [worker.jobs.pop(0)] if worker.jobs else []
                    return self._send(200, {"jobs": jobs, "sweep": {"expired_uploads": 0, "requeued": 0,
                                                                    "errored": 0, "held_deleted": 0}})
                parts = self.path.split("/")
                if len(parts) == 7 and parts[5].startswith("sc_") and parts[6] == "result":
                    result = json.loads(body)
                    worker.results[parts[5]] = result
                    return self._send(200, {"id": parts[5], "status": result["status"], "repo_status": "scanning"})
                self._send(404, {"error": "not_found"})

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.base = f"http://127.0.0.1:{self.server.server_address[1]}"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def queue(self, scan_id, path, file_class, data, sha256=None, size=None, serve=None):
        self.blobs[scan_id] = data if serve is None else serve
        self.jobs.append({"id": scan_id, "repo_id": "rp_test", "commit_oid": None, "path": path,
                          "sha256": sha256 or hashlib.sha256(data).hexdigest(),
                          "size": len(data) if size is None else size, "file_class": file_class,
                          "attempt": 1, "url": f"{self.base}/blob/{scan_id}",
                          "url_expires_at": "2026-11-15T00:15:00Z", "claimed_until": "2026-11-15T00:30:00Z"})

    def close(self):
        self.server.shutdown()


@pytest.fixture
def worker():
    w = FakeWorker()
    yield w
    w.close()


@pytest.fixture
def make_service(tmp_path, tool_bins):
    from fw_scanner.service import Config, Service

    def make(worker, **env_extra):
        env = {"FW_API_BASE": worker.base, "SCANNER_SECRET": SECRET, "FW_SCANNER_WORK": str(tmp_path / "work"),
               "FW_SCRIPTS_DIR": os.path.join(REPO, "scripts"),
               "FW_PUBLIC_BLOCKLIST": os.path.join(REPO, "policy", "blocklist.json"),
               "FW_SCANNER_PATH": _search_path(), "CLAMAV_DB": "",
               **{f"{n.upper()}_BIN": tool_bins[n][0] for n in TOOL_NAMES}}
        env.update(env_extra)
        return Service(Config(env))

    return make
