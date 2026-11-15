"""The poll loop: claim one job, scan it, post the result; 30 s after a job, 60 s when idle."""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time

from . import VERSION, scan
from .api import Api, ApiError
from .fetch import FetchError, TooLarge, download

SHA256 = re.compile(r"^[0-9a-f]{64}$")
HERE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))   # the repo root


def log(event: str, **fields):
    """One JSON line to stdout (journald). Never a URL: presigned URLs carry a signature."""
    print(json.dumps({"t": int(time.time()), "event": event, **fields}, separators=(",", ":")), flush=True)


class Config:
    def __init__(self, env=None):
        env = os.environ if env is None else env
        self.api_base = env.get("FW_API_BASE", "https://freeweights.allternit.com")
        self.secret = env.get("SCANNER_SECRET", "")
        self.work = env.get("FW_SCANNER_WORK", "/var/lib/fw-scanner/work")
        self.scripts_dir = env.get("FW_SCRIPTS_DIR", os.path.join(HERE, "scripts"))
        self.public_blocklist = env.get("FW_PUBLIC_BLOCKLIST",
                                        os.path.join(os.path.dirname(self.scripts_dir), "policy", "blocklist.json"))
        self.private_blocklist = env.get("FREEWEIGHTS_PRIVATE_BLOCKLIST") or None
        bindir = os.path.dirname(sys.executable)          # the venv's bin holds picklescan and modelscan
        self.path_env = env.get("FW_SCANNER_PATH", f"{bindir}:/usr/local/bin:/usr/bin:/bin")
        self.clamav_db = env.get("CLAMAV_DB", "/var/lib/fw-scanner/clamav") or None
        self.freshclam = env.get("FRESHCLAM_BIN", "freshclam")
        self.freshclam_config = env.get("FRESHCLAM_CONFIG", "/etc/fw-scanner/freshclam.conf")
        self.freshclam_every_s = float(env.get("FRESHCLAM_EVERY_HOURS", "12")) * 3600
        self.busy_s = float(env.get("POLL_BUSY_S", "30"))
        self.idle_s = float(env.get("POLL_IDLE_S", "60"))
        self.not_ready_s = float(env.get("NOT_READY_S", "300"))
        self.tool_timeout = float(env.get("TOOL_TIMEOUT_S", "600"))
        self.tools = scan.Tools(
            picklescan=env.get("PICKLESCAN_BIN", "picklescan"), modelscan=env.get("MODELSCAN_BIN", "modelscan"),
            clamscan=env.get("CLAMSCAN_BIN", "clamscan"), gitleaks=env.get("GITLEAKS_BIN", "gitleaks"),
            clamav_db=self.clamav_db, timeout=self.tool_timeout, path_env=self.path_env)


class Service:
    def __init__(self, cfg: Config, api: Api = None, clock=time.time):
        self.cfg = cfg
        self.api = api or Api(cfg.api_base, cfg.secret, VERSION)
        self.clock = clock
        self.formats = scan.load_lib(cfg.scripts_dir, "formats")
        self.blocklist = scan.load_lib(cfg.scripts_dir, "blocklist")
        self._cap = None
        self._cap_at = -1e18
        self._freshclam_at = -1e18
        os.makedirs(cfg.work, exist_ok=True)

    # ------------------------------------------------------------------ caps
    def file_cap(self):
        """file_max_bytes from GET /api/fw/v1/limits, re-read hourly. None while unknown: the job's size
        and the free disk still bound the download."""
        if self.clock() - self._cap_at > 3600:
            try:
                value = (self.api.limits().get("limits") or {}).get("file_max_bytes")
                self._cap = int(value) if value is not None else None
                self._cap_at = self.clock()
            except (ApiError, ValueError, TypeError):
                pass
        return self._cap

    # ------------------------------------------------------------------ one job
    def scan_job(self, job: dict) -> dict:
        attempt = int(job.get("attempt") or 0)
        size, sha, path = job.get("size"), str(job.get("sha256", "")).lower(), str(job.get("path", ""))
        fail = lambda why: scan.result_body(attempt, [scan.finding("scanner", "scan_failed", why)], VERSION)
        if not isinstance(size, int) or size < 0 or not SHA256.match(sha) or not job.get("url"):
            return fail("the job is missing size, sha256 or url")
        cap = self.file_cap()
        if cap is not None and size > cap:
            return fail(f"size {size} is over file_max_bytes {cap}")
        if size + (64 << 20) > shutil.disk_usage(self.cfg.work).free:
            return fail("not enough free disk for this file")
        workdir = tempfile.mkdtemp(prefix="job-", dir=self.cfg.work)
        try:
            suffix = re.sub(r"[^a-z0-9.]", "", os.path.splitext(path.lower())[1])[:16]
            local = os.path.join(workdir, "blob" + suffix)
            try:
                got, n = download(job["url"], local, size)
            except TooLarge as e:
                return scan.result_body(attempt, [scan.finding("sha256", "sha256_mismatch", str(e))], VERSION)
            except FetchError as e:
                return fail(str(e))
            if n != size:
                return scan.result_body(attempt, [scan.finding("sha256", "sha256_mismatch",
                                                               f"got {n} bytes, expected {size}")], VERSION)
            if got != sha:
                return scan.result_body(attempt, [scan.finding("sha256", "sha256_mismatch",
                                                               f"sha256 is {got}")], VERSION)
            found = scan.check_blocklists(sha, self.blocklist, self.cfg.public_blocklist, self.cfg.private_blocklist)
            tool_dir = os.path.join(workdir, "tools")
            os.makedirs(tool_dir)
            found += scan.check_file(path, local, size, str(job.get("file_class", "other")), self.formats,
                                     self.cfg.tools, tool_dir)
            return scan.result_body(attempt, found, VERSION)
        except OSError as e:
            return fail(f"scanner I/O error: {e.strerror or e}")
        finally:
            shutil.rmtree(workdir, ignore_errors=True)

    def post_result(self, job: dict, body: dict, waits=(5, 15, 45)):
        for i in range(len(waits) + 1):
            try:
                reply = self.api.result(job["id"], body)
                log("result", id=job["id"], status=body["status"], codes=[f["code"] for f in body["findings"]],
                    repo_status=reply.get("repo_status"))
                return reply
            except ApiError as e:
                if e.status in (400, 401, 404, 409):
                    # 409: the claim ran out and the scan was re-queued; the next claim scans it again.
                    log("result_refused", id=job["id"], status=e.status, code=e.code)
                    return None
                log("result_retry", id=job["id"], status=e.status, code=e.code)
                if i < len(waits):
                    time.sleep(waits[i])
        return None

    # ------------------------------------------------------------------ loop
    def maybe_freshclam(self):
        """Refresh the ClamAV database every FRESHCLAM_EVERY_HOURS from inside the loop (no cron, no daemon)."""
        if not self.cfg.clamav_db or self.clock() - self._freshclam_at < self.cfg.freshclam_every_s:
            return
        self._freshclam_at = self.clock()
        cmd = [self.cfg.freshclam, f"--config-file={self.cfg.freshclam_config}", f"--datadir={self.cfg.clamav_db}",
               "--quiet"]
        try:
            p = subprocess.run(cmd, capture_output=True, timeout=900, stdin=subprocess.DEVNULL,
                               env={"PATH": self.cfg.path_env, "LANG": "C.UTF-8"})
            log("freshclam", rc=p.returncode, err=p.stderr.decode("utf-8", "replace")[-300:])
        except (OSError, subprocess.TimeoutExpired) as e:
            log("freshclam", rc=None, err=str(e)[:300])

    def run_once(self) -> int:
        """One poll. Returns the number of jobs handled, or -1 when the poll failed."""
        try:
            reply = self.api.claim(1)
        except ApiError as e:
            log("claim_failed", status=e.status, code=e.code)
            return -1
        sweep = reply.get("sweep")
        if sweep and any(sweep.values()):
            log("sweep", **{k: v for k, v in sweep.items() if isinstance(v, int)})
        jobs = reply.get("jobs") or []
        for job in jobs[:1]:
            started = time.monotonic()
            body = self.scan_job(job)
            log("scanned", id=job.get("id"), file_class=job.get("file_class"), size=job.get("size"),
                status=body["status"], codes=[f["code"] for f in body["findings"]],
                seconds=round(time.monotonic() - started, 1))
            self.post_result(job, body)
        return len(jobs[:1])

    def run_forever(self, stop: threading.Event):
        for name in os.listdir(self.cfg.work):           # leftovers from a crash or a restart
            shutil.rmtree(os.path.join(self.cfg.work, name), ignore_errors=True)
        log("start", version=VERSION, api=self.cfg.api_base)
        while not stop.is_set():
            self.maybe_freshclam()
            missing = self.cfg.tools.missing()
            if missing:
                # Not polling keeps /scan/health at 503, so the upload UIs say "Scanning is delayed".
                log("not_ready", missing=missing)
                self._freshclam_at = -1e18 if "clamav database" in missing else self._freshclam_at
                stop.wait(self.cfg.not_ready_s)
                continue
            handled = self.run_once()
            stop.wait(self.cfg.busy_s if handled > 0 else self.cfg.idle_s)
        log("stop")
