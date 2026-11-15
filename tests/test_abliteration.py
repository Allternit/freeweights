import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import abliteration as ab  # noqa: E402


def row(repo, parent=None, rel="finetune", tags=(), task="text-generation"):
    return {"repo": repo, "tags": list(tags), "pipeline_tag": task, "parent": parent, "relation_type": rel}


class Detect(unittest.TestCase):
    def test_true_positives(self):
        got = ab.detect([
            row("OBLITERATUS/gemma-4-E4B-it-OBLITERATED", "google/gemma-4-E4B-it"),
            row("bartowski/Vortecks_LFM3-1.7B-Heretic-Abliterated-GGUF", "Vortecks/LFM3-1.7B-Heretic-Abliterated", "quant"),
            row("org/Plain-Name", tags=["abliterated"]),
            row("mlabonne/Hermes-3-Llama-3.1-8B-lorablated"),
        ])
        self.assertEqual(got["OBLITERATUS/gemma-4-E4B-it-OBLITERATED"], "name")
        self.assertEqual(got["bartowski/Vortecks_LFM3-1.7B-Heretic-Abliterated-GGUF"], "name")
        self.assertEqual(got["org/Plain-Name"], "tag")
        self.assertIn("mlabonne/Hermes-3-Llama-3.1-8B-lorablated", got)

    def test_quant_of_abliterated_repo_inherits_through_the_chain(self):
        got = ab.detect([
            row("org/Model-X", "org/Model-X-base", tags=["abliterated"]),
            row("q1/Model-X-4bit", "org/Model-X", "quant"),
            row("q2/Model-X-4bit-mlx", "q1/Model-X-4bit", "quant"),
            row("q3/Quant-of-unlisted", "huihui-ai/Some-abliterated", "quant"),
        ])
        self.assertEqual(got["q1/Model-X-4bit"], "lineage")
        self.assertEqual(got["q2/Model-X-4bit-mlx"], "lineage")
        self.assertEqual(got["q3/Quant-of-unlisted"], "lineage")

    def test_false_positive_guards(self):
        got = ab.detect([
            row("org/uncensored-content-detector", task="text-classification"),   # detector about uncensored content
            row("org/Llama-3.1-8B-Lexi-Uncensored", "meta-llama/Llama-3.1-8B"),    # uncensored fine-tune, no refusal removal named
            row("ibm-granite/granite-3.2-8b-lora-jailbreak"),                      # jailbreak adapter, not abliteration
            row("org/abliteration-safety-classifier", task="text-classification"),  # classifier even with the word in its name
            row("q/Dolphin3.0-GGUF", "dphn/Dolphin3.0", "quant"),                  # parent is a plain fine-tune
            row("org/Not-quant", "org/Base", "finetune"),
        ])
        self.assertEqual(got, {})

    def test_what_changed_is_non_empty_and_names_the_parent(self):
        self.assertIn("org/Base", ab.what_changed("q/x-GGUF", "lineage", "org/Base"))
        self.assertTrue(ab.what_changed("org/x-abliterated", "name", None))


if __name__ == "__main__":
    unittest.main()
