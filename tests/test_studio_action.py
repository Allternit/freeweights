"""Fine-tune in Studio shows only for bases Studio can train (site/lib/actions.mjs, mirrors isTrainableBase)."""
import json, os, shutil, subprocess, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@unittest.skipUnless(shutil.which("node"), "node not installed")
class StudioAction(unittest.TestCase):
    def test_only_trainable_bases(self):
        p = subprocess.run(["node", os.path.join(ROOT, "tests", "studio_action_check.mjs")], capture_output=True, text=True, cwd=ROOT, timeout=60)
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertEqual(json.loads(p.stdout), [])


if __name__ == "__main__":
    unittest.main()
