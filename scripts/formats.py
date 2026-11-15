#!/usr/bin/env python3
"""Data-only weight formats and the header check that decides them.

Accepted: safetensors, GGUF, MLX, ONNX, and after a header check CoreML, CTranslate2, TFLite,
OpenVINO and ggml. Pickle-only weights stay refused. A file name alone never proves a format:
several of these formats use ".bin", which is also what PyTorch pickles use. So a format counts
only when a small range read of one file per format passes `check_header`.

  formats.py <file> ...     header-check local files (prints the format each one passes as)

Stdlib only. No network here: callers pass a `fetch(path, nbytes) -> bytes` function."""
import json, os, re, struct, sys

HEAD_BYTES = 64                       # one small range read per checked file
ACCEPTED = ("safetensors", "gguf", "mlx", "onnx", "coreml", "ctranslate2", "tflite", "openvino", "ggml")
PICKLE_EXT = (".bin", ".pt", ".pth", ".pkl", ".pickle", ".ckpt")
MAX_CHECKS = 4                        # range reads per repo, at most

WEIGHT_EXT = (".safetensors", ".gguf", ".onnx", ".tflite", ".bin", ".pt", ".pth", ".ckpt", ".ggml", ".npz", ".h5", ".msgpack", ".mlmodel", ".ot")

def weight_sha_set(files):
    """sha256 set of the weight files in a manifest's file list; READMEs, configs and tokenizers are ignored."""
    return frozenset(f["sha256"] for f in files or [] if f.get("sha256") and f.get("lfs") and f["path"].lower().endswith(WEIGHT_EXT))

def _low(p): return p.lower()

def candidates(paths):
    """{format: [weight file paths]} that could be each format, judged by name and repo layout only.
    A path may appear under several formats (ambiguous .bin files)."""
    low = {p: _low(p) for p in paths}
    names = set(low.values())
    out = {}
    add = lambda f, p: out.setdefault(f, []).append(p)
    for p, l in low.items():
        base = l.rsplit("/", 1)[-1]
        if l.endswith(".safetensors"): add("safetensors", p)
        elif l.endswith(".gguf"): add("gguf", p)
        elif l.endswith(".npz"): add("mlx", p)
        elif l.endswith(".onnx"): add("onnx", p)
        elif l.endswith(".tflite"): add("tflite", p)
        elif l.endswith(".mlmodel"): add("coreml", p)
        elif ".mlpackage/" in l and l.endswith("/weight.bin"): add("coreml", p)
        elif ".mlmodelc/" in l and l.endswith("/weight.bin"): add("coreml", p)
        elif l.endswith(".bin"):
            stem = l[:-4]
            if stem + ".xml" in names: add("openvino", p)
            if base == "model.bin" and (l[:-len(base)] + "config.json") in names: add("ctranslate2", p)
            if base.startswith("ggml") or "ggml" in base: add("ggml", p)
    return out

# ---------- header checks: each gets the first HEAD_BYTES bytes of one file ----------
def is_pickle_or_zip(head):
    """PyTorch pickles start with the pickle PROTO opcode; torch.save zips start with PK."""
    return (len(head) >= 2 and head[0] == 0x80 and 2 <= head[1] <= 5) or head[:4] == b"PK\x03\x04"

def _safetensors(head):
    if len(head) < 9: return False
    n = struct.unpack("<Q", head[:8])[0]
    return 2 <= n <= 100_000_000 and head[8:9] == b"{"

def _gguf(head): return head[:4] == b"GGUF"

def _ggml(head):
    # legacy ggml/ggmf/ggjt/ggla magics, written as little-endian uint32 ("lmgg"...) or big-endian
    return head[:4] in (b"lmgg", b"fmgg", b"tjgg", b"algg", b"ggml", b"ggmf", b"ggjt", b"ggla") or _gguf(head)

def _protobuf_first_field(head):
    # ONNX ModelProto and CoreML Model both start with field 1 as a varint (tag byte 0x08)
    return len(head) >= 2 and head[0] == 0x08 and head[1] < 0x80 and not is_pickle_or_zip(head)

def _tflite(head): return len(head) >= 8 and head[4:8] == b"TFL3"

def _coreml_weight(head):
    # mlpackage weight.bin: blob storage, little-endian uint32 count then uint32 version, no pickle
    if len(head) < 8 or is_pickle_or_zip(head): return False
    count, version = struct.unpack("<II", head[:8])
    return 0 < count < 1_000_000 and version in (1, 2)

def _ctranslate2(head):
    # model.bin: uint32 binary version, uint16 length, spec name (ascii, NUL-terminated)
    if len(head) < 8 or is_pickle_or_zip(head): return False
    ver = struct.unpack("<I", head[:4])[0]
    if not 1 <= ver <= 16: return False
    if ver == 1: return True
    n = struct.unpack("<H", head[4:6])[0]
    name = head[6:6 + n]
    return 1 <= n <= HEAD_BYTES - 6 and name.endswith(b"\x00") and re.fullmatch(rb"[A-Za-z0-9_.]+", name[:-1] or b"-") is not None

def _openvino_bin(head):
    # IR weights are raw tensors with no header; the structure check is the paired .xml (in
    # candidates) plus "not a pickle or zip"
    return len(head) > 0 and not is_pickle_or_zip(head)

CHECKS = {"safetensors": _safetensors, "gguf": _gguf,
          "onnx": _protobuf_first_field, "tflite": _tflite, "ctranslate2": _ctranslate2, "openvino": _openvino_bin, "ggml": _ggml}

def check_header(fmt, head, path=""):
    """True when `head` (the first bytes of `path`) looks like `fmt`."""
    if fmt == "coreml":
        return _protobuf_first_field(head) if _low(path).endswith(".mlmodel") else _coreml_weight(head)
    if fmt == "mlx":
        # MLX ships .npz (a zip of .npy arrays, no pickle when loaded with allow_pickle=False) or safetensors
        return head[:4] == b"PK\x03\x04" or _safetensors(head)
    return CHECKS[fmt](head)

def decide(paths, fetch=None):
    """Decide the weight formats of a repo.
    Returns (formats, reason). formats is a sorted list of accepted formats that passed;
    an empty list means refused, and reason says why (pickle-only, no data-only weights, header check failed).
    With fetch=None no file is read and every name-based candidate counts (offline use)."""
    cand = candidates(paths)
    passed, failed, reads = set(), [], 0
    for fmt in sorted(cand):
        if fetch is None: passed.add(fmt); continue
        if reads >= MAX_CHECKS: break
        p = sorted(cand[fmt], key=len)[0]
        head = fetch(p, HEAD_BYTES); reads += 1
        if check_header(fmt, head, p): passed.add(fmt)
        else: failed.append(f"{p} is not {fmt}")
    if passed: return sorted(passed), None
    low = [_low(p) for p in paths]
    if failed: return [], "header check failed: " + "; ".join(failed)
    if any(l.endswith(PICKLE_EXT) for l in low): return [], "pickle-only weights"
    return [], "no data-only weights (safetensors, GGUF, MLX, ONNX, CoreML, CTranslate2, TFLite, OpenVINO or ggml)"

def main(argv):
    for p in argv:
        head = open(p, "rb").read(HEAD_BYTES)
        ok = [f for f in ACCEPTED if check_header(f, head, p)]
        print(p, ", ".join(ok) or ("pickle or zip" if is_pickle_or_zip(head) else "no accepted format"))
    return 0

if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
