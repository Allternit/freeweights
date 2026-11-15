"""fw run: Allternit Cloud snippet when the model is mapped, local command when not. No network."""
import contextlib, io, json, os, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from freeweights_cli import cli

OVERLAY = {"_meta": {"source": "fixture"}, "org/Big": {"model": "big-1", "provider": "x", "context_length": 8192},
           "org/Big-GGUF": {"model": "big-1", "via_parent": True}}

def run(*argv, overlay):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f: json.dump(overlay, f)
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            code = cli.main(["run", *argv, "--overlay", f.name])
    finally: os.unlink(f.name)
    return code, out.getvalue()

class Run(unittest.TestCase):
    def setUp(self):
        rows = [{"id": "org/Big", "formats": ["safetensors"], "tasks": ["text-generation"]},
                {"id": "org/Big-GGUF", "formats": ["gguf"], "tasks": ["text-generation"]},
                {"id": "org/Small", "formats": ["gguf"], "tasks": ["text-generation"]}]
        self._orig = cli.catalog_rows; cli.catalog_rows = lambda remote: rows
    def tearDown(self): cli.catalog_rows = self._orig

    def test_mapped_prints_curl_and_chat_link(self):
        code, out = run("org/Big", overlay=OVERLAY)
        self.assertEqual(code, 0)
        self.assertIn('"model": "big-1"', out); self.assertIn("$ALLTERNIT_API_KEY", out)
        self.assertIn("https://ai.allternit.com/?model=big-1", out)

    def test_via_parent_says_so(self):
        self.assertIn("made from", run("org/Big-GGUF", overlay=OVERLAY)[1])

    def test_unmapped_says_not_on_cloud_and_prints_local_command(self):
        code, out = run("org/Small", overlay=OVERLAY)
        self.assertEqual(code, 0)
        self.assertIn("not on Allternit Cloud", out); self.assertIn("llama-server", out); self.assertNotIn("curl", out)

    def test_unknown_model_fails(self):
        self.assertEqual(run("org/Nope", overlay=OVERLAY)[0], 1)

if __name__ == "__main__": unittest.main()
