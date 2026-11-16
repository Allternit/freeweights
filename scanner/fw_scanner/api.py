"""Signed calls to the Freeweights Worker (spec/accounts-v1.md 11.4).

Every scan route carries X-FW-Timestamp (Unix seconds) and X-FW-Signature: v1=<hex>, the HMAC-SHA256 with
SCANNER_SECRET over "<ts>\\n<METHOD>\\n<path and query>\\n<sha256 hex of the body>"."""
from __future__ import annotations

import hashlib
import hmac
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request

SCAN_ID = re.compile(r"^sc_[0-9A-Za-z]+$")


def sign(secret: bytes, ts: int, method: str, path_query: str, body: bytes) -> str:
    """The X-FW-Signature value for one request."""
    msg = f"{ts}\n{method.upper()}\n{path_query}\n{hashlib.sha256(body).hexdigest()}"
    return "v1=" + hmac.new(secret, msg.encode("utf-8"), hashlib.sha256).hexdigest()


class ApiError(Exception):
    """A Worker reply that is not 2xx. `status` is the HTTP status (0 for a network failure)."""

    def __init__(self, status: int, code: str = "", message: str = ""):
        super().__init__(f"{status} {code} {message}".strip())
        self.status, self.code = status, code


class Api:
    def __init__(self, base: str, secret: str, version: str, clock=time.time, timeout: float = 30.0):
        if not secret:
            raise ValueError("SCANNER_SECRET is not set")
        self.base = base.rstrip("/")
        self.secret = secret.encode("utf-8")
        self.version = version
        self.clock = clock
        self.timeout = timeout

    def _request(self, method: str, path: str, payload=None, signed: bool = True) -> dict:
        url = self.base + path
        body = b"" if payload is None else json.dumps(payload, separators=(",", ":")).encode("utf-8")
        headers = {"Accept": "application/json", "User-Agent": self.version}
        if payload is not None:
            headers["Content-Type"] = "application/json"
        if signed:
            parts = urllib.parse.urlsplit(url)
            path_query = parts.path + (("?" + parts.query) if parts.query else "")
            ts = int(self.clock())
            headers["X-FW-Timestamp"] = str(ts)
            headers["X-FW-Signature"] = sign(self.secret, ts, method, path_query, body)
        req = urllib.request.Request(url, data=body if payload is not None else None, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                raw = r.read(1 << 20)
        except urllib.error.HTTPError as e:
            code, message = "", ""
            try:
                err = json.loads(e.read(1 << 16) or b"{}")
                code, message = str(err.get("error", "")), str(err.get("message", ""))[:200]
            except (ValueError, OSError):
                pass
            raise ApiError(e.code, code, message) from None
        except (urllib.error.URLError, OSError) as e:
            raise ApiError(0, "network", str(getattr(e, "reason", e))[:200]) from None
        try:
            return json.loads(raw or b"{}")
        except ValueError:
            raise ApiError(0, "bad_json", "the reply is not JSON") from None

    def claim(self, max_jobs: int = 1) -> dict:
        """{jobs: [ScanJob], sweep: ScanSweep}. Each call is also the scanner's heartbeat."""
        return self._request("POST", "/api/fw/v1/scan/claim", {"scanner_version": self.version, "max": max_jobs})

    def result(self, scan_id: str, body: dict) -> dict:
        if not SCAN_ID.match(scan_id or ""):
            raise ApiError(400, "bad_scan_id", "scan id does not match ^sc_[0-9A-Za-z]+$")
        return self._request("POST", f"/api/fw/v1/scan/{scan_id}/result", body)

    def limits(self) -> dict:
        """GET /api/fw/v1/limits (public, unsigned)."""
        return self._request("GET", "/api/fw/v1/limits", signed=False)
