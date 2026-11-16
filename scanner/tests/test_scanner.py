"""fw-scanner: the U12 corpus end to end, the request signature, and the classification edge cases."""
from __future__ import annotations

import hashlib
import json
import os
import pickle
import struct

import pytest

from conftest import REPO, corpus, eicar, fake_aws_key_text, safetensors_bytes
from fw_scanner import VERSION, scan
from fw_scanner.api import sign

formats = scan.load_lib(os.path.join(REPO, "scripts"), "formats")


def test_signature_matches_the_contract_vector():
    # spec/accounts-v1.md 11.4: "<ts>\n<METHOD>\n<path and query>\n<sha256 hex of the body>", sent as v1=<hex>.
    # The same vector can check the Worker's verifier (auth/hmac.ts).
    body = b'{"scanner_version":"fw-scanner/0.1.0","max":1}'
    assert sign(b"test-scanner-secret", 1763200000, "post", "/api/fw/v1/scan/claim", body) == \
        "v1=a4355ccbcc8a478b7d67e95a5efebec620baae0216fbccf96bc228b1daee50e6"
    assert sign(b"test-scanner-secret", 1763200000, "GET", "/api/fw/v1/scan/health?x=1", b"") == \
        "v1=50131519e71d55ef2b8ff55d5066fba12ac455859edf1635286391c1097f2096"


def test_corpus_four_held_one_clean(worker, make_service):
    """Plan step 11 done check: the five generated files go through claim -> download -> scan -> result."""
    files = corpus()
    for i, (name, (path, file_class, data, _, _)) in enumerate(files.items()):
        worker.queue(f"sc_{i}{name}", path, file_class, data)
    svc = make_service(worker)
    assert [svc.run_once() for _ in files] == [1] * len(files)
    assert svc.run_once() == 0                       # queue empty: an idle poll, not an error
    assert worker.bad_signatures == 0                # every claim and result was signed correctly

    got = {sid.split("_", 1)[1][1:]: body for sid, body in worker.results.items()}
    assert set(got) == set(files)
    for name, (_, _, _, status, codes) in files.items():
        body = got[name]
        assert body["status"] == status, (name, body)
        assert {f["code"] for f in body["findings"]} == codes, (name, body)
        assert body["attempt"] == 1 and body["scanner_version"] == VERSION
    assert sum(b["status"] == "held" for b in got.values()) == 4
    # Findings never carry the secret or the file's path on the scanner host.
    dumped = json.dumps(got)
    assert "Q7ZK3M5V2XWJ4T6R" not in dumped and "/work/" not in dumped


def test_sha256_and_size_are_checked_before_any_scan(worker, make_service):
    data = safetensors_bytes()
    worker.queue("sc_wrongsha", "model.safetensors", "weights", data, sha256="0" * 64)
    worker.queue("sc_larger", "model.safetensors", "weights", data, size=len(data) - 1)
    worker.queue("sc_shorter", "model.safetensors", "weights", data, size=len(data) + 5)
    svc = make_service(worker)
    for _ in range(3):
        svc.run_once()
    for sid in ("sc_wrongsha", "sc_larger", "sc_shorter"):
        body = worker.results[sid]
        assert body["status"] == "held" and [f["code"] for f in body["findings"]] == ["sha256_mismatch"], sid


def test_private_blocklist_holds_a_clean_file(worker, make_service, tmp_path):
    data = safetensors_bytes()
    private = tmp_path / "blocklist-private.json"
    private.write_text(json.dumps({"schema_version": 0, "entries": [
        {"id": "x/y", "kind": "model", "date": "2026-11-15", "reason_class": "ncii",
         "sha256": [hashlib.sha256(data).hexdigest()]}]}))
    worker.queue("sc_blocked", "model.safetensors", "weights", data)
    make_service(worker, FREEWEIGHTS_PRIVATE_BLOCKLIST=str(private)).run_once()
    body = worker.results["sc_blocked"]
    assert body["status"] == "held"
    assert body["findings"] == [{"scanner": "blocklist", "code": "blocklisted", "detail": "on the private blocklist"}]


def test_a_scanner_that_cannot_run_reports_error_not_clean(worker, make_service, tmp_path):
    worker.queue("sc_noclam", "notes/readme.txt", "other", b"plain text\n")
    make_service(worker, CLAMSCAN_BIN=str(tmp_path / "no-such-clamscan")).run_once()
    body = worker.results["sc_noclam"]
    assert body["status"] == "error"
    assert [f["code"] for f in body["findings"]] == ["scan_failed"]


def test_job_over_file_max_is_not_downloaded(worker, make_service):
    worker.file_max = 10
    worker.queue("sc_big", "model.safetensors", "weights", safetensors_bytes())
    make_service(worker).run_once()
    body = worker.results["sc_big"]
    assert body["status"] == "error" and "file_max_bytes" in body["findings"][0]["detail"]


def test_disguised_files_get_the_stricter_checks(worker, make_service):
    """A pickle named .safetensors fails the header check; a PyTorch .bin pickle goes to the pickle scanners
    even when the job says weights; a raw .bin with no pickle magic passes as tensors but still gets ClamAV."""
    evil = corpus()["pickle"][2]
    assert scan.kinds("model.safetensors", evil, "weights", formats) == {"weights", "pickle"}
    assert scan.kinds("pytorch_model.bin", evil, "weights", formats) == {"pickle"}
    assert scan.kinds("README.md", evil, "other", formats) == {"pickle", "other"}
    assert scan.kinds("model.safetensors", safetensors_bytes(), "weights", formats) == {"weights"}

    worker.queue("sc_fake", "model.safetensors", "weights", evil)
    worker.queue("sc_rawbin", "openvino_model.bin", "weights", eicar())
    svc = make_service(worker)
    svc.run_once(), svc.run_once()
    assert {f["code"] for f in worker.results["sc_fake"]["findings"]} == {"bad_header", "unsafe_pickle"}
    assert {f["code"] for f in worker.results["sc_rawbin"]["findings"]} == {"malware"}


@pytest.mark.parametrize("header, why", [
    (b"GGUX" + struct.pack("<I", 3) + bytes(56), "not gguf"),
    (b"GGUF" + struct.pack("<I", 99) + bytes(56), "unknown GGUF version 99"),
])
def test_bad_gguf_headers(tmp_path, header, why):
    p = tmp_path / "m.gguf"
    p.write_bytes(header)
    found, _ = scan.check_weights("m.gguf", str(p), len(header), formats)
    assert [f["code"] for f in found] == ["bad_header"] and why in found[0]["detail"]


def test_safetensors_with_offsets_past_the_data(tmp_path):
    header = json.dumps({"w": {"dtype": "F32", "shape": [4], "data_offsets": [0, 16]}}).encode()
    data = struct.pack("<Q", len(header)) + header + bytes(8)        # 8 data bytes, tensor claims 16
    p = tmp_path / "m.safetensors"
    p.write_bytes(data)
    found, _ = scan.check_weights("m.safetensors", str(p), len(data), formats)
    assert found and found[0]["code"] == "bad_header" and "offsets" in found[0]["detail"]


def test_verdict_rules():
    held = scan.result_body(2, [scan.finding("clamav", "scan_failed", "x"), scan.finding("gitleaks", "secret_found")], VERSION)
    assert held["status"] == "held" and held["attempt"] == 2
    assert scan.result_body(1, [scan.finding("clamav", "scan_failed")], VERSION)["status"] == "error"
    assert scan.result_body(1, [], VERSION)["status"] == "clean"
    many = scan.result_body(1, [scan.finding("x", "malware", "d" * 5000)] * 80, VERSION)
    assert len(many["findings"]) == 50 and len(many["findings"][0]["detail"]) == 2000


# --------------------------------------------------------------------- the real scanners, when installed
REAL_CASES = {
    "picklescan": (lambda t, f, d: scan.run_picklescan(t, f, d), "evil.pkl", lambda: corpus()["pickle"][2], "unsafe_pickle"),
    "modelscan": (lambda t, f, d: scan.run_modelscan(t, f, d), "evil.pkl", lambda: corpus()["pickle"][2], "unsafe_pickle"),
    "clamscan": (lambda t, f, d: scan.run_clamscan(t, f, d, 100), "readme.txt", eicar, "malware"),
    "gitleaks": (lambda t, f, d: scan.run_gitleaks(t, f, d), "creds.txt", fake_aws_key_text, "secret_found"),
}


@pytest.mark.parametrize("tool", sorted(REAL_CASES))
def test_real_tool(tool, tool_bins, tmp_path):
    binary, real = tool_bins[tool]
    if not real:
        pytest.skip(f"{tool} is not installed here; the corpus test used a stand-in with its command line "
                    f"and exit codes. The container has the real one (deploy/install.sh).")
    run, name, make, code = REAL_CASES[tool]
    f = tmp_path / name
    f.write_bytes(make())
    work = tmp_path / "w"
    work.mkdir()
    tools = scan.Tools(**{tool: binary}, path_env=os.pathsep.join([os.path.dirname(binary), "/usr/bin", "/bin"]))
    found = run(tools, str(f), str(work))
    assert [x["code"] for x in found][:1] == [code], found
    if tool == "gitleaks":
        assert "Q7ZK3M5V2XWJ4T6R" not in json.dumps(found)
