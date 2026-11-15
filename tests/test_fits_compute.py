""""Run at home" shows only when some build fits the biggest Compute box (site/lib/actions.mjs fitsCompute)."""
import json, os, shutil, subprocess, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@unittest.skipUnless(shutil.which("node"), "node not installed")
class FitsCompute(unittest.TestCase):
    def test_uses_need_not_best_for(self):
        p = subprocess.run(["node", os.path.join(ROOT, "tests", "fits_compute_check.mjs")], capture_output=True, text=True, cwd=ROOT, timeout=60)
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertEqual(json.loads(p.stdout), [])


if __name__ == "__main__":
    unittest.main()
