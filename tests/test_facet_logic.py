"""Catalog facet counts follow the filter semantics: Apps and Language are AND, Library is OR."""
import json, os, shutil, subprocess, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@unittest.skipUnless(shutil.which("node"), "node not installed")
class FacetLogic(unittest.TestCase):
    def test_counts_match_semantics(self):
        p = subprocess.run(["node", os.path.join(ROOT, "tests", "facet_logic_check.mjs")], capture_output=True, text=True, cwd=ROOT, timeout=60)
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertEqual(json.loads(p.stdout), [])


if __name__ == "__main__":
    unittest.main()
