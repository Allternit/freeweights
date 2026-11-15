"""What one file is checked with (plan U12, spec/accounts-v1.md 11.5) and the verdict.

  every file   sha256 == oid (sha256_mismatch); public and private blocklists (blocklisted)
  weights      header check with scripts/formats.py, plus a full-header check for safetensors and GGUF (bad_header)
  pickles      picklescan and modelscan (unsafe_pickle)
  other        clamscan, one process per job, no clamd (malware); gitleaks on text up to 5 MiB (secret_found)

A check that cannot finish adds a scan_failed finding. The verdict is `held` when any other finding is
present, `error` when the only findings are scan_failed (the Worker re-queues it, up to 3 attempts), and
`clean` with no findings. A finding's `detail` names rules, signatures and offsets, never file content or
a secret's value."""
from __future__ import annotations

import importlib.util
import json
import math
import os
import struct
import subprocess

GITLEAKS_TEXT_MAX = 5 * 1024 * 1024      # spec 11.5: gitleaks on text files up to 5 MiB
SNIFF_BYTES = 8192
DETAIL_MAX = 2000
FINDINGS_MAX = 50
# Extensions that are pickles (or numpy arrays that may hold one) whatever the job's file_class says.
PICKLE_EXT = (".pkl", ".pickle", ".pt", ".pth", ".ckpt", ".joblib", ".dill", ".npy")
EXTRA_WEIGHT_EXT = (".mlmodel",)


def load_lib(scripts_dir: str, name: str):
    """Load scripts/<name>.py by path under a private module name, so nothing else in scripts/ (it has its
    own classify.py) can shadow a module of ours."""
    path = os.path.join(scripts_dir, name + ".py")
    spec = importlib.util.spec_from_file_location(f"_fw_scripts_{name}", path)
    if spec is None or spec.loader is None:
        raise ImportError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def finding(scanner: str, code: str, detail: str = "") -> dict:
    out = {"scanner": scanner, "code": code}
    if detail:
        out["detail"] = detail[:DETAIL_MAX]
    return out


def verdict(findings: list) -> str:
    if not findings:
        return "clean"
    if all(f["code"] == "scan_failed" for f in findings):
        return "error"
    return "held"


def result_body(attempt: int, findings: list, version: str) -> dict:
    findings = findings[:FINDINGS_MAX]
    return {"attempt": attempt, "status": verdict(findings), "findings": findings, "scanner_version": version}


def is_text(head: bytes) -> bool:
    """No NUL byte and valid UTF-8 in the first bytes (a multibyte character cut at the end is fine)."""
    if b"\x00" in head:
        return False
    try:
        head.decode("utf-8")
        return True
    except UnicodeDecodeError as e:
        return e.start >= len(head) - 3 and len(head) >= SNIFF_BYTES


def kinds(path: str, head: bytes, job_class: str, formats) -> set:
    """Which check groups a file gets. A file can get two: a .safetensors that is really a pickle gets
    the weights check (and fails it) and the pickle scanners."""
    low = path.lower()
    pickle_ext = low.endswith(PICKLE_EXT)
    magic = formats.is_pickle_or_zip(head)
    out = set()
    if pickle_ext or job_class == "pickle" or magic:
        out.add("pickle")
    weightish = job_class == "weights" or low.endswith(tuple(formats.WEIGHT_EXT) + EXTRA_WEIGHT_EXT)
    if weightish and not pickle_ext and not (low.endswith(".bin") and magic):
        out.add("weights")
    if job_class == "other" and "weights" not in out:
        out.add("other")
    return out or {"other"}


# ---------------------------------------------------------------------------------------- weights
def _deep_safetensors(local: str, size: int):
    """Why the full safetensors header is wrong, or None. formats.py sees 64 bytes; here we have the file."""
    with open(local, "rb") as f:
        raw = f.read(8)
        if len(raw) < 8:
            return "shorter than the 8-byte header length"
        n = struct.unpack("<Q", raw)[0]
        if n > min(100_000_000, size - 8):
            return "header length runs past the file"
        try:
            header = json.loads(f.read(n).decode("utf-8"))
        except (UnicodeDecodeError, ValueError):
            return "header is not JSON"
    if not isinstance(header, dict):
        return "header is not a JSON object"
    data_len = size - 8 - n
    for name, t in header.items():
        if name == "__metadata__":
            if not isinstance(t, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in t.items()):
                return "__metadata__ is not a string map"
            continue
        if not isinstance(t, dict) or not isinstance(t.get("dtype"), str) or not isinstance(t.get("shape"), list):
            return f"tensor {name[:80]!r} has no dtype or shape"
        off = t.get("data_offsets")
        if not (isinstance(off, list) and len(off) == 2 and all(isinstance(x, int) for x in off)
                and 0 <= off[0] <= off[1] <= data_len):
            return f"tensor {name[:80]!r} has offsets outside the data"
    return None


def _deep_gguf(head: bytes):
    if len(head) < 8 or head[:4] != b"GGUF":
        return "no GGUF magic"
    version = struct.unpack("<I", head[4:8])[0]
    if version not in (1, 2, 3):
        return f"unknown GGUF version {version}"
    return None


def check_weights(path: str, local: str, size: int, formats):
    """(findings, raw) where raw means the file passed only as headerless tensors (OpenVINO-style .bin),
    so it also gets the ClamAV pass."""
    with open(local, "rb") as f:
        head = f.read(formats.HEAD_BYTES)
    low = path.lower()
    fmts = sorted(formats.candidates([path]))
    if not fmts and low.endswith(".bin"):
        fmts = ["ctranslate2", "ggml", "coreml"]
    passed = [fm for fm in fmts if formats.check_header(fm, head, path)]
    raw = False
    if not passed and low.endswith(".bin") and formats.check_header("openvino", head, path):
        passed, raw = ["openvino"], True
    if not passed:
        what = " or ".join(fmts) if fmts else "an accepted data-only format"
        return [finding("formats", "bad_header", f"the header is not {what}")], False
    if "safetensors" in passed:
        why = _deep_safetensors(local, size)
        if why:
            return [finding("formats", "bad_header", f"safetensors: {why}")], False
    if "gguf" in passed:
        why = _deep_gguf(head)
        if why:
            return [finding("formats", "bad_header", f"gguf: {why}")], False
    return [], raw


# ---------------------------------------------------------------------------------------- tools
class Tools:
    """External scanners, each a subprocess with a clean environment (SCANNER_SECRET never reaches one)."""

    def __init__(self, picklescan="picklescan", modelscan="modelscan", clamscan="clamscan",
                 gitleaks="gitleaks", clamav_db=None, timeout=600, path_env=None):
        self.picklescan, self.modelscan, self.clamscan, self.gitleaks = picklescan, modelscan, clamscan, gitleaks
        self.clamav_db = clamav_db
        self.timeout = timeout
        self.path_env = path_env or "/usr/local/bin:/usr/bin:/bin"

    def run(self, cmd, cwd):
        env = {"PATH": self.path_env, "HOME": cwd, "LANG": "C.UTF-8", "LC_ALL": "C.UTF-8", "TMPDIR": cwd}
        try:
            p = subprocess.run(cmd, cwd=cwd, env=env, stdin=subprocess.DEVNULL, capture_output=True,
                               timeout=self.timeout)
        except FileNotFoundError:
            return None, "", f"{os.path.basename(cmd[0])} is not installed"
        except subprocess.TimeoutExpired:
            return None, "", f"{os.path.basename(cmd[0])} ran past {self.timeout} s"
        return p.returncode, p.stdout.decode("utf-8", "replace"), p.stderr.decode("utf-8", "replace")

    def missing(self):
        """Names of tools that are not on disk (the service does not poll until every one is there)."""
        out = []
        for name in ("picklescan", "modelscan", "clamscan", "gitleaks"):
            exe = getattr(self, name)
            if not (os.path.isabs(exe) and os.access(exe, os.X_OK)) and not _which(exe, self.path_env):
                out.append(name)
        if self.clamav_db is not None and not _has_clamav_db(self.clamav_db):
            out.append("clamav database")
        return out


def _which(exe, path_env):
    if os.sep in exe:
        return os.access(exe, os.X_OK)
    return any(os.access(os.path.join(d, exe), os.X_OK) for d in path_env.split(os.pathsep) if d)


def _has_clamav_db(db_dir):
    try:
        return any(n.endswith((".cvd", ".cld")) for n in os.listdir(db_dir))
    except OSError:
        return False


def _strip(text: str, local: str) -> str:
    return text.replace(local, "<file>")


def run_picklescan(tools: Tools, local: str, workdir: str) -> list:
    rc, out, err = tools.run([tools.picklescan, "-p", local], workdir)
    if rc == 0:
        if "could not parse" in out + err:
            # pickle.load runs opcodes as it reads, so a "pickle" no parser can read is not passed as clean
            return [finding("picklescan", "unsafe_pickle", "not a parseable pickle or PyTorch zip")]
        return []
    if rc == 1:
        lines = [_strip(l, local) for l in out.splitlines() if "dangerous import" in l]
        return [finding("picklescan", "unsafe_pickle", "; ".join(lines) or "dangerous globals")]
    return [finding("picklescan", "scan_failed", err.strip()[-300:] if rc is not None else err)]


def run_modelscan(tools: Tools, local: str, workdir: str) -> list:
    report = os.path.join(workdir, "modelscan.json")
    rc, out, err = tools.run([tools.modelscan, "-p", local, "-r", "json", "-o", report], workdir)
    if rc in (0, 3):          # 3 = no file modelscan knows how to read; picklescan still ran
        return []
    if rc == 1:
        try:
            with open(report, encoding="utf-8") as f:
                issues = json.load(f).get("issues", [])
            detail = "; ".join(f"{i.get('module')}.{i.get('operator')} ({i.get('severity')})" for i in issues[:20])
        except (OSError, ValueError):
            detail = ""
        return [finding("modelscan", "unsafe_pickle", detail or "unsafe operators")]
    return [finding("modelscan", "scan_failed", f"exit {rc}: {err.strip()[-300:]}" if rc is not None else err)]


def run_clamscan(tools: Tools, local: str, workdir: str, size: int) -> list:
    mb = min(4000, max(25, math.ceil(size / (1 << 20)) + 1))
    cmd = [tools.clamscan, "--no-summary", "--infected", "--stdout", f"--tempdir={workdir}",
           f"--max-filesize={mb}M", f"--max-scansize={mb}M", "--alert-exceeds-max=yes"]
    if tools.clamav_db:
        cmd.append(f"--database={tools.clamav_db}")
    rc, out, err = tools.run(cmd + [local], workdir)
    if rc == 0:
        return []
    if rc == 1:
        names = [l.rsplit(":", 1)[-1].replace("FOUND", "").strip() for l in out.splitlines() if l.endswith("FOUND")]
        if names and all(n.startswith("Heuristics.Limits.Exceeded") for n in names):
            return [finding("clamav", "scan_failed", "over a ClamAV scan limit: " + ", ".join(names))]
        return [finding("clamav", "malware", ", ".join(names) or "infected")]
    return [finding("clamav", "scan_failed", f"exit {rc}: {err.strip()[-300:]}" if rc is not None else err)]


def run_gitleaks(tools: Tools, local: str, workdir: str) -> list:
    report = os.path.join(workdir, "gitleaks.json")
    ignore_dir = os.path.join(workdir, "gitleaks-ignore")
    os.makedirs(ignore_dir, exist_ok=True)
    rc, out, err = tools.run([tools.gitleaks, "dir", local, "--no-banner", "--redact", "--log-level", "error",
                              "-f", "json", "-r", report, "--exit-code", "1", "-i", ignore_dir], workdir)
    if rc == 0:
        return []
    leaks = None
    try:
        with open(report, encoding="utf-8") as f:
            leaks = json.load(f)
    except (OSError, ValueError):
        pass
    if rc == 1 and isinstance(leaks, list) and leaks:
        # Rule ids and line numbers only; the report is redacted and its secret fields are never read.
        detail = ", ".join(f"{l.get('RuleID')} at line {l.get('StartLine')}" for l in leaks[:20])
        return [finding("gitleaks", "secret_found", detail)]
    return [finding("gitleaks", "scan_failed", f"exit {rc}: {err.strip()[-300:]}" if rc is not None else err)]


# ---------------------------------------------------------------------------------------- one file
def check_file(path: str, local: str, size: int, job_class: str, formats, tools: Tools, workdir: str) -> list:
    """Findings for a file already downloaded and sha256-checked."""
    with open(local, "rb") as f:
        head = f.read(SNIFF_BYTES)
    groups = kinds(path, head, job_class, formats)
    found = []
    if "weights" in groups:
        weight_findings, raw = check_weights(path, local, size, formats)
        found += weight_findings
        if raw:
            groups.add("other")
    if "pickle" in groups:
        found += run_picklescan(tools, local, workdir)
        found += run_modelscan(tools, local, workdir)
    if "other" in groups:
        found += run_clamscan(tools, local, workdir, size)
        if size <= GITLEAKS_TEXT_MAX and is_text(head):
            found += run_gitleaks(tools, local, workdir)
    return found


def check_blocklists(sha256: str, blocklist, public_path: str, private_path=None) -> list:
    """The public list from the repo and, when configured, the private list on the scanner host.
    The Worker also checks blocked_hashes when it records the result."""
    found = []
    for label, path in (("public", public_path), ("private", private_path)):
        if not path or not os.path.exists(path):
            continue
        _, hashes = blocklist.index(blocklist.load(path))
        if sha256.lower() in hashes:
            # The private list's entry ids can describe the material, so only the list is named.
            found.append(finding("blocklist", "blocklisted", f"on the {label} blocklist"))
    return found
