import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import facets_extract as fx  # noqa: E402


class ParamsBin(unittest.TestCase):
    def test_unknown(self):
        for v in (None, 0, -5, float("nan"), "7B", True, False):
            self.assertEqual(fx.params_bin(v), "", v)

    def test_edges_are_lower_inclusive(self):
        cases = [(1, "lt1"), (999_999_999, "lt1"), (1e9, "1-3"), (2.99e9, "1-3"), (3e9, "3-6"), (6e9, "6-9"), (6.06e9, "6-9"),
                 (9e9, "9-12"), (12e9, "12-24"), (24e9, "24-32"), (32e9, "32-64"), (64e9, "64-128"), (128e9, "128-500"),
                 (499_999_999_999, "128-500"), (500e9, "gt500"), (1.6e12, "gt500")]
        for n, want in cases:
            self.assertEqual(fx.params_bin(n), want, n)

    def test_every_bin_reachable(self):
        self.assertEqual({fx.params_bin(lo + 1) for _, _, lo in fx.BINS}, {c for c, _, _ in fx.BINS})

    def test_from_name(self):
        self.assertEqual(fx.params_from_name("org/Llama-3-8B-Instruct"), 8e9)
        self.assertEqual(fx.params_from_name("org/SmolLM-135M"), 135e6)
        self.assertEqual(fx.params_from_name("org/model-1.5B"), 1.5e9)
        self.assertIsNone(fx.params_from_name("org/Mixtral-8x7B"))        # MoE shape
        self.assertIsNone(fx.params_from_name("org/Qwen3-30B-A3B"))       # active-size token
        self.assertIsNone(fx.params_from_name("org/llama-7b-vs-13b"))     # two sizes
        self.assertEqual(fx.params_from_name("org/Yi-1.5-6B-Chat-v2.1"), 6e9)  # 1.5 and v2.1 are not sizes
        self.assertIsNone(fx.params_from_name("org/plain-model"))
        self.assertIsNone(fx.params_from_name("org/tiny-3M"))             # 3M is under the 10M floor


class Apps(unittest.TestCase):
    def test_gguf_text(self):
        self.assertEqual(fx.apps_for(["gguf"], ["text-generation"]), ["llama.cpp", "LM Studio", "Ollama", "Jan"])

    def test_gguf_untagged_is_a_language_model(self):
        self.assertEqual(fx.apps_for(["gguf"], []), ["llama.cpp", "LM Studio", "Ollama", "Jan"])

    def test_gguf_embeddings_not_jan(self):
        self.assertEqual(fx.apps_for(["gguf"], ["feature-extraction"]), ["llama.cpp", "LM Studio", "Ollama"])

    def test_mlx(self):
        self.assertEqual(fx.apps_for(["mlx"], ["text-generation"]), ["LM Studio", "MLX LM"])

    def test_safetensors_text_and_image(self):
        self.assertEqual(fx.apps_for(["safetensors"], ["text-generation"]), ["vLLM", "SGLang"])
        self.assertEqual(fx.apps_for(["safetensors"], ["image-text-to-text"]), ["vLLM", "SGLang"])
        self.assertEqual(fx.apps_for(["safetensors"], ["text-to-image"]), ["Draw Things", "DiffusionBee"])

    def test_no_claims_without_evidence(self):
        self.assertEqual(fx.apps_for(["safetensors"], []), [])             # untagged safetensors: unknown
        self.assertEqual(fx.apps_for(["onnx"], ["text-generation"]), [])
        self.assertEqual(fx.apps_for(["safetensors"], ["image-classification"]), [])
        self.assertEqual(fx.apps_for(["gguf"], ["image-classification"]), [])

    def test_multi_format_unions(self):
        got = fx.apps_for(["gguf", "safetensors"], ["text-generation"])
        self.assertEqual(got, ["llama.cpp", "LM Studio", "Ollama", "Jan", "vLLM", "SGLang"])

    def test_asr(self):
        self.assertEqual(fx.apps_for(["ggml"], ["automatic-speech-recognition"]), ["whisper.cpp"])


class LibrariesAndLanguages(unittest.TestCase):
    def test_formats_and_files(self):
        self.assertEqual(fx.libs_for(["safetensors"], ["model_index.json"], None), ["diffusers", "safetensors"])
        self.assertEqual(fx.libs_for(["safetensors"], ["modules.json"], {"t": [], "lib": None}), ["sentence-transformers", "safetensors"])
        self.assertEqual(fx.libs_for(["gguf"], [], None), ["GGUF"])

    def test_api_tags_win_over_the_config_guess(self):
        self.assertEqual(fx.libs_for(["safetensors"], ["config.json"], {"t": ["safetensors"], "lib": None}), ["safetensors"])
        self.assertEqual(fx.libs_for(["safetensors"], ["config.json"], None), ["transformers", "safetensors"])
        self.assertEqual(fx.libs_for(["safetensors"], [], {"t": ["transformers", "peft"], "lib": "transformers"}), ["transformers", "PEFT", "safetensors"])

    def test_languages(self):
        self.assertEqual(fx.langs_from_tags(["en", "zh", "gguf", "mlx", "language:fr", "multilingual", "zh", "license:mit", "arxiv:1"]),
                         ["en", "fr", "multilingual", "zh"])
        self.assertEqual(fx.langs_from_tags([]), [])


if __name__ == "__main__":
    unittest.main()
