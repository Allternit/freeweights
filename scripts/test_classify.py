#!/usr/bin/env python3
"""Tests for classify.py, the license table and the format header check.

  python3 -m unittest discover -s scripts -p 'test_*.py'"""
import json, os, struct, subprocess, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import classify, formats, inclusion, licenses  # noqa: E402

NOW = "2026-11-14T00:00:00Z"
CARD = {"rfilename": "README.md", "size": 4000}

def rec(rid, lic="apache-2.0", tags=(), files=("model.safetensors",), base=None, rel=None, dl=50_000, likes=10, cardData_name=None, **kw):
    t = list(tags) + ([f"base_model:{rel}:{base}"] if base and rel else [])
    card = {"license": lic} if lic else {}
    if cardData_name: card["license_name"] = cardData_name
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
        self.assertEqual(licenses.verdict("LicenseRef-MiniMax-H3-Community"), "territory")
        self.assertEqual(licenses.verdict("something-new"), "queue")

    def test_custom_ids_never_pass_on_a_tag(self):
        self.assertEqual(licenses.tag_verdict("licenseref-qwen-research")[0], "queue")
        self.assertEqual(licenses.tag_verdict("bigscience-bloom-rail-1.0")[0], "queue")

    def test_openrail_m_tag_is_custom_with_terms(self):
        # read 2026-11-15: the Attachment A use restrictions pass on, so the hosted entry shows terms
        self.assertEqual(licenses.tag_verdict("creativeml-openrail-m")[0], "custom")
        self.assertIn("Attachment A", licenses.terms("creativeml-openrail-m"))

    def test_docs_match_table(self):
        self.assertTrue(all(ok for _, ok in licenses.docs_status()), "run scripts/licenses.py --write-docs")

class Lineage(unittest.TestCase):
    def test_quant_of_refused_base_is_refused(self):
        r, _ = run(rec("lab/Base", lic="LicenseRef-MiniMax-H3-Community"),
                   rec("quanter/Base-GGUF", files=("base.Q4_K_M.gguf",), base="lab/Base", rel="quantized"))
        self.assertEqual(r["lab/Base"]["verdict"], "unreviewed")  # LicenseRef ids are not tag-listable
        r, _ = run(rec("lab/Base", lic="x"), rec("quanter/Base-GGUF", files=("b.gguf",), base="lab/Base", rel="quantized"),
                   reviewed={"lab/Base": {"verdict": "refused", "license_id": "LicenseRef-Banned"}})
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
        self.assertEqual(r["q/X-GGUF"]["verdict"], "unreviewed")
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
        self.assertEqual(res["lab/ft"]["verdict"], "unreviewed")
        self.assertEqual(res["lab/ft"]["link_reason"], "not-reviewed")
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
        r, q = run(rec("x/R", lic="bigscience-bloom-rail-1.0"))
        self.assertEqual(r["x/R"]["verdict"], "unreviewed")
        self.assertEqual(q[0]["key"], "held:bigscience-bloom-rail-1.0")

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
            self.assertEqual({l["id"]: l["verdict"] for l in lines}, {"a/A": "permissive", "b/B": "unreviewed"})
            self.assertEqual(lines[0]["audit"], {"method": "tag", "at": NOW})
            with open(q) as f: self.assertEqual(json.load(f)[0]["repos"], ["b/B"])

class ListAll(unittest.TestCase):
    """The rule: every repo Hugging Face lists gets an entry; hosted only when the license allows copies
    with no acceptance gate and no territory limit; everything else is link only, labelled by reason."""
    def how(self, *recs, rid=None):
        r, _ = run(*recs)
        x = r[rid or recs[0]["id"]]
        return x["verdict"], x["hosted"], x["link_reason"]

    def test_hosted_families(self):
        self.assertEqual(self.how(rec("a/Perm")), ("permissive", True, None))
        self.assertEqual(self.how(rec("nv/M", lic="openmdw-1.1")), ("custom", True, None))
        self.assertEqual(self.how(rec("lf/M", lic="other", cardData_name="lfm1.0")), ("custom", True, None))
        self.assertEqual(self.how(rec("sd/M", lic="openrail++")), ("custom", True, None))
        self.assertIn("US$10M", licenses.terms("lfm1.0"))
        self.assertIn("Attachment A", licenses.terms("openrail++"))
        self.assertIn("notices", licenses.terms("openmdw-1.1"))

    def test_gated(self):
        for lic in ("llama3", "llama3.1", "llama3.2", "llama3.3", "gemma"):
            self.assertEqual(self.how(rec("m/L", lic=lic)), ("gated", False, "gated"), lic)
        self.assertEqual(self.how(rec("f/D", lic="other", cardData_name="dinov3-license")), ("gated", False, "gated"))
        # Hugging Face's own gate makes any license link only
        self.assertEqual(self.how(rec("g/Apache", gated="manual")), ("gated", False, "gated"))
        # a quant of a Llama model is gated through the lineage, whatever its own tag says
        self.assertEqual(self.how(rec("m/L", lic="llama3.1"), rec("q/L-GGUF", files=("l.gguf",), base="m/L", rel="quantized"), rid="q/L-GGUF")[2], "gated")

    def test_non_commercial(self):
        for name in ("qwen-research", "flux-1-dev-non-commercial-license", "flux-non-commercial-license", "flux-kommunity-license", "some-nc-license"):
            self.assertEqual(self.how(rec("x/N", lic="other", cardData_name=name)), ("non-commercial", False, "non-commercial"), name)
        self.assertEqual(self.how(rec("x/C", lic="cc-by-nc-sa-4.0")), ("non-commercial", False, "non-commercial"))

    def test_territory(self):
        self.assertEqual(self.how(rec("t/H", lic="other", cardData_name="tencent-hunyuan-community")), ("territory", False, "territory"))
        self.assertEqual(licenses.verdict("LicenseRef-MiniMax-H3-Image-Community"), "territory")

    def test_not_reviewed(self):
        self.assertEqual(self.how(rec("o/X", lic="other")), ("unreviewed", False, "not-reviewed"))
        self.assertEqual(self.how(rec("o/Y", lic="other", license_text_sha256="99" * 32)), ("unreviewed", False, "not-reviewed"))

    def test_exclusions_stay(self):
        r, _ = run(rec("x/nsfw-gen"), rec("x/P", files=("pytorch_model.bin",)), rec("x/NoLic", lic=None), rec("x/phishing-kit"))
        self.assertEqual(r["x/nsfw-gen"]["verdict"], "refused")
        self.assertEqual((r["x/P"]["verdict"], r["x/P"]["gate"]), ("refused", "format"))
        self.assertEqual(r["x/NoLic"]["verdict"], "refused")
        self.assertEqual(r["x/phishing-kit"]["verdict"], "queue")  # a person decides; not listed meanwhile

    def test_spdx_ids(self):
        self.assertEqual(licenses.spdx("apache-2.0"), "Apache-2.0")
        self.assertEqual(licenses.spdx("MIT"), "MIT")
        self.assertEqual(licenses.spdx("cc-by-nc-4.0"), "CC-BY-NC-4.0")
        self.assertEqual(licenses.spdx("odc-by"), "ODC-By-1.0")
        self.assertEqual(licenses.spdx("licenseref-qwen-research"), "LicenseRef-Qwen-Research")
        self.assertEqual(licenses.spdx("something-new"), "something-new")

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

NVIDIA_OML = dict(lic="other", cardData_name="nvidia-open-model-license")
CSV = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "catalog", "_audit", "licenses.csv")

class Decisions20261116(unittest.TestCase):
    """The six license-policy decisions of 2026-11-16, checked through the public classify path."""

    def test_1_register_before_commercial_use_stays_gated_link_only(self):
        for name in ("stabilityai-ai-community", "stability-ai-community"):
            r, _ = run(rec("x/Sd", lic="other", cardData_name=name))
            self.assertEqual((r["x/Sd"]["verdict"], r["x/Sd"]["hosted"], r["x/Sd"]["link_reason"]), ("gated", False, "gated"))
        for lid in ("licenseref-stability-ai-community", "licenseref-moonshine-community", "licenseref-glm-4", "licenseref-cogvideox", "licenseref-cogvlm", "licenseref-cogagent"):
            self.assertIn("Allternit has not registered; hosted only if Allternit registers.", licenses.LICENSES[lid]["note"])
            self.assertEqual(licenses.verdict(lid), "gated")

    def test_2_no_redistribution_licenses_are_link_only_non_commercial(self):
        for name in ("exaone", "msrla", "polyform-strict-1-0-0"):
            r, _ = run(rec("x/N", lic="other", cardData_name=name))
            n = r["x/N"]
            self.assertEqual((n["verdict"], n["hosted"], n["link_reason"], n["listable"]), ("non-commercial", False, "non-commercial", True), name)
        # a quantization of one is link only too, not refused
        r, _ = run(rec("x/B", lic="other", cardData_name="exaone"), rec("x/B-GGUF", lic="apache-2.0", base="x/B", rel="quantized"))
        self.assertEqual((r["x/B-GGUF"]["verdict"], r["x/B-GGUF"]["hosted"]), ("non-commercial", False))

    def test_3_copyleft_weights_are_link_only_with_their_own_reason(self):
        for lic in ("gpl-3.0", "lgpl-3.0", "agpl-3.0"):
            r, q = run(rec("x/G", lic=lic))
            g = r["x/G"]
            self.assertEqual((g["verdict"], g["hosted"], g["link_reason"], g["listable"]), ("copyleft", False, "copyleft", True), lic)
            self.assertEqual(q, [])
        # a quantization of a GPL base is never hosted
        r, _ = run(rec("x/G", lic="gpl-3.0"), rec("x/G-GGUF", lic="apache-2.0", base="x/G", rel="quantized"))
        self.assertEqual((r["x/G-GGUF"]["verdict"], r["x/G-GGUF"]["hosted"]), ("copyleft", False))
        self.assertEqual(licenses.VERDICTS["copyleft"]["label"], "Copyleft license: link only")
        self.assertFalse(licenses.hosted("copyleft"))

    def test_4_by_nd_hosts_only_unchanged_originals(self):
        r, _ = run(rec("x/Orig", lic="cc-by-nd-4.0"))
        self.assertEqual((r["x/Orig"]["verdict"], r["x/Orig"]["hosted"]), ("custom", True))
        for rel, kind in (("quantized", "quant"), ("finetune", "ft"), ("merge", "mg"), ("adapter", "ad")):
            r, _ = run(rec("x/Orig", lic="cc-by-nd-4.0"), rec(f"x/Orig-{kind}", lic="apache-2.0", base="x/Orig", rel=rel))
            d = r[f"x/Orig-{kind}"]
            self.assertEqual((d["verdict"], d["hosted"], d["link_reason"]), ("restricted", False, "restricted"), rel)
            self.assertIn("derivative of a no-derivatives license", d["reasons"][-1])
        # a derivative that carries its own BY-ND tag is just as barred
        r, _ = run(rec("x/Orig", lic="cc-by-nd-4.0"), rec("x/Own-ft", lic="cc-by-nd-4.0", base="x/Orig", rel="finetune"))
        self.assertEqual((r["x/Own-ft"]["verdict"], r["x/Own-ft"]["hosted"]), ("restricted", False))

    def test_5_heimdallr_click_wrap_is_gated_link_only(self):
        # the audit row in licenses.csv decides (the tag says apache-2.0), and a child inherits it
        reviewed = classify.load_reviewed(CSV)
        r, _ = run(rec("ReadyArt/Heimdallr-26B-A4B-v0.35", lic="apache-2.0"), rec("x/Heimdallr-ft", lic="apache-2.0", base="ReadyArt/Heimdallr-26B-A4B-v0.35", rel="finetune"), reviewed=reviewed)
        for rid in ("ReadyArt/Heimdallr-26B-A4B-v0.35", "x/Heimdallr-ft"):
            self.assertEqual((r[rid]["verdict"], r[rid]["hosted"]), ("gated", False), rid)

    def test_6_abliterated_nvidia_open_model_derivative_is_never_hosted(self):
        base = rec("nvidia/Base-8B", **NVIDIA_OML)
        r, _ = run(base)
        self.assertEqual((r["nvidia/Base-8B"]["verdict"], r["nvidia/Base-8B"]["hosted"]), ("custom", True))
        abl = rec("u/Base-8B-abliterated", lic="apache-2.0", base="nvidia/Base-8B", rel="finetune")
        r, _ = run(base, abl)
        a = r["u/Base-8B-abliterated"]
        self.assertEqual((a["verdict"], a["hosted"], a["link_reason"]), ("restricted", False, "restricted"))
        self.assertIn("safety guardrail", a["reasons"][-1])
        self.assertIn("automatically terminate", a["reasons"][-1])
        # an abliterated quantization of it too, found by the tag instead of the name
        q = rec("u/Base-8B-q4", lic="apache-2.0", tags=["abliterated"], base="u/Base-8B-abliterated", rel="quantized")
        r, _ = run(base, abl, q)
        self.assertEqual((r["u/Base-8B-q4"]["verdict"], r["u/Base-8B-q4"]["hosted"]), ("restricted", False))
        # a plain fine-tune of the same model is still hosted, and so is an abliterated model of another license
        r, _ = run(base, rec("u/Base-8B-chat", lic="apache-2.0", base="nvidia/Base-8B", rel="finetune"), rec("u/Other-abliterated", lic="apache-2.0"))
        self.assertEqual((r["u/Base-8B-chat"]["verdict"], r["u/Base-8B-chat"]["hosted"]), ("custom", True))
        self.assertEqual((r["u/Other-abliterated"]["verdict"], r["u/Other-abliterated"]["hosted"]), ("permissive", True))
        # a parent already in the catalog counts through its license id
        res, _ = classify.Classifier([abl], {}, {"nvidia/Base-8B": "custom"}, watch=set(), now=NOW, catalog_licenses={"nvidia/Base-8B": "LicenseRef-NVIDIA-Open-Model"}).run()
        self.assertEqual((res[0]["verdict"], res[0]["hosted"]), ("restricted", False))

if __name__ == "__main__": unittest.main()
