#!/usr/bin/env python3
"""Tests for classify.py, the license table and the format header check.

  python3 -m unittest discover -s scripts -p 'test_*.py'"""
import json, os, struct, subprocess, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import classify, formats, inclusion, licenses  # noqa: E402

NOW = "2026-11-14T00:00:00Z"
CARD = {"rfilename": "README.md", "size": 4000}

def rec(rid, lic="apache-2.0", tags=(), files=("model.safetensors",), base=None, rel=None, dl=50_000, likes=10, **kw):
    t = list(tags) + ([f"base_model:{rel}:{base}"] if base and rel else [])
    card = {"license": lic} if lic else {}
    if base: card["base_model"] = base
    return dict({"id": rid, "tags": t, "cardData": card, "downloads": dl, "likes": likes,
                 "siblings": [CARD] + [{"rfilename": f, "size": 10_000} for f in files]}, **kw)

def run(*recs, catalog=None, reviewed=None):
    res, queue = classify.Classifier(list(recs), reviewed or {}, catalog or {}, watch=set(), now=NOW).run()
    return {r["id"]: r for r in res}, queue

class LicenseTable(unittest.TestCase):
    def test_one_permissive_set(self):
        # the defect this fixes: build_catalog and make_manifest disagreed on ODC-BY
        self.assertTrue(licenses.is_permissive("ODC-BY-1.0"))
        self.assertTrue(licenses.is_permissive("Apache-2.0"))
        self.assertEqual(licenses.verdict("LicenseRef-Qwen-Research"), "non-commercial")
        self.assertEqual(licenses.verdict("LicenseRef-MiniMax-H3-Community"), "refused")
        self.assertEqual(licenses.verdict("something-new"), "queue")

    def test_custom_ids_never_pass_on_a_tag(self):
        self.assertEqual(licenses.tag_verdict("openmdw-1.1")[0], "queue")
        self.assertEqual(licenses.tag_verdict("llama3")[0], "queue")

    def test_docs_match_table(self):
        self.assertTrue(all(ok for _, ok in licenses.docs_status()), "run scripts/licenses.py --write-docs")

class Lineage(unittest.TestCase):
    def test_quant_of_refused_base_is_refused(self):
        r, _ = run(rec("lab/Base", lic="LicenseRef-MiniMax-H3-Community"),
                   rec("quanter/Base-GGUF", files=("base.Q4_K_M.gguf",), base="lab/Base", rel="quantized"))
        self.assertEqual(r["lab/Base"]["verdict"], "queue")  # LicenseRef ids are not tag-listable
        r, _ = run(rec("lab/Base", lic="x"), rec("quanter/Base-GGUF", files=("b.gguf",), base="lab/Base", rel="quantized"),
                   reviewed={"lab/Base": {"verdict": "refused", "license_id": "LicenseRef-MiniMax-H3-Community"}})
        q = r["quanter/Base-GGUF"]
        self.assertEqual(q["verdict"], "refused")
        self.assertEqual(q["audit"]["method"], "inherited")
        self.assertEqual(q["license_governed_by"], "lab/Base")

    def test_strictest_wins_across_three_levels(self):
        r, _ = run(rec("lab/Base", lic="cc-by-nc-4.0"),
                   rec("tuner/Tune", lic="mit", base="lab/Base", rel="finetune"),
                   rec("quanter/Tune-GGUF", lic="apache-2.0", files=("t.gguf",), base="tuner/Tune", rel="quantized"))
        self.assertEqual(r["tuner/Tune"]["verdict"], "non-commercial")
        self.assertEqual(r["quanter/Tune-GGUF"]["verdict"], "non-commercial")
        self.assertEqual(r["quanter/Tune-GGUF"]["audit"]["method"], "inherited")
        self.assertEqual(r["quanter/Tune-GGUF"]["relation"], {"type": "quant", "parent": "tuner/Tune"})

    def test_looser_parent_does_not_loosen_child(self):
        r, _ = run(rec("lab/Base", lic="mit"), rec("t/Tune", lic="cc-by-nc-4.0", base="lab/Base", rel="finetune"))
        self.assertEqual(r["t/Tune"]["verdict"], "non-commercial")
        self.assertEqual(r["t/Tune"]["audit"]["method"], "tag")

    def test_unknown_parent_goes_to_queue_unless_catalog_knows_it(self):
        r, q = run(rec("q/X-GGUF", files=("x.gguf",), base="lab/Unknown", rel="quantized"))
        self.assertEqual(r["q/X-GGUF"]["verdict"], "queue")
        self.assertEqual(q[0]["key"], "parent:lab/Unknown")
        r, _ = run(rec("q/X-GGUF", files=("x.gguf",), base="lab/Known", rel="quantized"), catalog={"lab/Known": "permissive"})
        self.assertEqual(r["q/X-GGUF"]["verdict"], "permissive")
        self.assertEqual(r["q/X-GGUF"]["tier"], "variant")

    def test_bare_quant_inherits_base_verdict(self):
        # a quantization with no license tag of its own takes its base model's verdict
        res, _ = run(rec("lab/base", lic="mit"), rec("q/base-GGUF", lic=None, base="lab/base", rel="quantized", files=("m.gguf",)))
        self.assertEqual(res["q/base-GGUF"]["verdict"], "permissive")
        self.assertEqual(res["q/base-GGUF"]["audit"]["method"], "inherited")
        self.assertEqual(res["q/base-GGUF"]["verdict_license_id"], "mit")
        self.assertEqual(res["q/base-GGUF"]["tier"], "variant")
        # but a fine-tune with no license stays refused
        res, _ = run(rec("lab/base", lic="mit"), rec("ft/base-chat", lic=None, base="lab/base", rel="finetune"))
        self.assertEqual(res["ft/base-chat"]["verdict"], "refused")

    def test_unlicensed_parent_queues_child(self):
        # a base with no declared license is unknown: the child waits for a person, it is not refused
        res, q = run(rec("u/base", lic=None), rec("lab/ft", lic="apache-2.0", base="u/base", rel="finetune"))
        self.assertEqual(res["lab/ft"]["verdict"], "queue")
        self.assertEqual(res["lab/ft"]["queue_key"], "parent-unlicensed:u/base")
        self.assertEqual(res["u/base"]["verdict"], "refused")

    def test_lineage_cycle_terminates(self):
        r, _ = run(rec("a/A", base="b/B", rel="finetune"), rec("b/B", base="a/A", rel="finetune"))
        self.assertEqual(r["a/A"]["verdict"], "permissive")

class Queue(unittest.TestCase):
    def test_unknown_texts_cluster_by_hash(self):
        r, q = run(rec("a/One", lic="other", license_text_sha256="ab" * 32, dl=5000),
                   rec("b/Two", lic="other", license_text_sha256="ab" * 32, dl=7000),
                   rec("c/Three", lic="other", license_text_sha256="cd" * 32, dl=100))
        self.assertEqual([x["key"] for x in q], ["text:" + "ab" * 32, "text:" + "cd" * 32])
        self.assertEqual(sorted(q[0]["repos"]), ["a/One", "b/Two"])
        self.assertEqual(q[0]["downloads_30d"], 12000)
        self.assertEqual(r["a/One"]["audit"]["method"], "queue")

    def test_reviewed_text_hash_lists(self):
        sha = next(iter(licenses.REVIEWED_TEXTS))
        r, q = run(rec("lab/M", lic="other", license_text_sha256=sha))
        self.assertEqual(r["lab/M"]["verdict"], licenses.REVIEWED_TEXTS[sha]["verdict"])
        self.assertEqual(r["lab/M"]["audit"]["method"], "text-hash")
        self.assertEqual(q, [])

    def test_held_license_queues_under_its_id(self):
        r, q = run(rec("meta/L", lic="llama3"))
        self.assertEqual(r["meta/L"]["verdict"], "queue")
        self.assertEqual(q[0]["key"], "held:llama3")

    def test_no_license_is_refused(self):
        r, _ = run(rec("x/NoLic", lic=None))
        self.assertEqual(r["x/NoLic"]["verdict"], "refused")

class Gates(unittest.TestCase):
    def test_pickle_only_refused_at_format_gate(self):
        r, _ = run(rec("x/P", files=("pytorch_model.bin",)))
        self.assertEqual((r["x/P"]["verdict"], r["x/P"]["gate"]), ("refused", "format"))
        self.assertIn("pickle", r["x/P"]["reasons"][0])

    def test_extra_formats_pass_names_pending_header_check(self):
        r, _ = run(rec("x/W", files=("ggml-base.en.bin",)), rec("x/O", files=("openvino_model.xml", "openvino_model.bin")),
                   rec("x/T", files=("model.tflite",)), rec("x/C", files=("config.json", "model.bin")))
        self.assertEqual(r["x/W"]["formats"], ["ggml"])
        self.assertEqual(r["x/O"]["formats"], ["openvino"])
        self.assertEqual(r["x/T"]["formats"], ["tflite"])
        self.assertEqual(r["x/C"]["formats"], ["ctranslate2"])
        self.assertEqual(r["x/C"]["header_check"], "pending")

    def test_content_gate(self):
        r, _ = run(rec("x/nsfw-gen"), rec("x/Chat", tags=("not-for-all-audiences",)),
                   rec("huihui-ai/Model-abliterated"), rec("x/Rev", tags=("not-for-all-audiences",), content_reviewed=True))
        self.assertEqual((r["x/nsfw-gen"]["verdict"], r["x/nsfw-gen"]["gate"]), ("refused", "content"))
        self.assertEqual(r["x/Chat"]["verdict"], "out")
        self.assertEqual(r["huihui-ai/Model-abliterated"]["verdict"], "permissive")
        self.assertEqual(r["x/Rev"]["verdict"], "permissive")

    def test_hygiene_gate(self):
        thin = rec("x/Thin"); thin["siblings"][0] = {"rfilename": "README.md", "size": 120}
        r, _ = run(rec("hf-internal-testing/tiny-random-llama"), thin)
        self.assertEqual(r["hf-internal-testing/tiny-random-llama"]["gate"], "hygiene")
        self.assertEqual(r["x/Thin"]["gate"], "hygiene")

    def test_tag_label_and_tiers(self):
        r, _ = run(rec("x/Big", dl=20_000), rec("x/Mid", dl=2_000), rec("x/Small", dl=10))
        self.assertIn("license as declared by the publisher", r["x/Big"]["reasons"])
        self.assertEqual([r[k]["tier"] for k in ("x/Big", "x/Mid", "x/Small")], ["T1", "T2", None])
        self.assertFalse(r["x/Small"]["listable"])
        t0 = inclusion.tier({"id": "lab/New", "downloads": 0, "createdAt": "2026-01-01T00:00:00Z"}, watch={"lab"})
        self.assertEqual(t0, "T0")

    def test_cli_writes_jsonl_and_queue(self):
        with tempfile.TemporaryDirectory() as d:
            src = os.path.join(d, "c.jsonl")
            with open(src, "w") as f: f.write("\n".join(json.dumps(x) for x in (rec("a/A"), rec("b/B", lic="other", license_text_sha256="ef" * 32))))
            out, q = os.path.join(d, "v.jsonl"), os.path.join(d, "q.json")
            subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "classify.py"), src, "--out", out, "--queue", q,
                            "--catalog", os.path.join(d, "none.json"), "--reviewed", os.path.join(d, "none.csv"), "--now", NOW], check=True, capture_output=True)
            with open(out) as f: lines = [json.loads(l) for l in f]
            self.assertEqual({l["id"]: l["verdict"] for l in lines}, {"a/A": "permissive", "b/B": "queue"})
            self.assertEqual(lines[0]["audit"], {"method": "tag", "at": NOW})
            with open(q) as f: self.assertEqual(json.load(f)[0]["repos"], ["b/B"])

class HeaderCheck(unittest.TestCase):
    def test_magic_bytes(self):
        st = struct.pack("<Q", 120) + b'{"__metadata__":{}}'
        self.assertTrue(formats.check_header("safetensors", st))
        self.assertTrue(formats.check_header("gguf", b"GGUF\x03\x00\x00\x00"))
        self.assertTrue(formats.check_header("ggml", b"lmgg" + b"\x00" * 8))
        self.assertTrue(formats.check_header("tflite", b"\x1c\x00\x00\x00TFL3"))
        ct2 = struct.pack("<I", 6) + struct.pack("<H", 16) + b"TransformerSpec\x00" + struct.pack("<I", 7)
        self.assertTrue(formats.check_header("ctranslate2", ct2))
        self.assertTrue(formats.check_header("onnx", b"\x08\x07\x12\x07pytorch"))

    def test_pickle_fails_every_bin_format(self):
        pk, zp = b"\x80\x02}q\x00(X", b"PK\x03\x04\x14\x00"
        for fmt in ("ggml", "ctranslate2", "openvino", "onnx", "safetensors"):
            self.assertFalse(formats.check_header(fmt, pk), fmt)
            self.assertFalse(formats.check_header(fmt, zp), fmt)

    def test_decide_reads_one_file_per_format(self):
        heads = {"openvino_model.bin": b"\x80\x02}q", "openvino_model.xml": b"<?xml"}
        reads = []
        fm, why = formats.decide(["openvino_model.xml", "openvino_model.bin"], lambda p, n: reads.append(p) or heads[p])
        self.assertEqual((fm, reads), ([], ["openvino_model.bin"]))
        self.assertIn("header check failed", why)
        fm, _ = formats.decide(["model.safetensors"], lambda p, n: struct.pack("<Q", 40) + b"{")
        self.assertEqual(fm, ["safetensors"])

if __name__ == "__main__": unittest.main()
