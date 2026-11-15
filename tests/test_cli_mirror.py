"""fw --mirror: mirrors come before the manifest's own sources, pinned commit before main."""
import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from freeweights_cli import cli


class MirrorOrder(unittest.TestCase):
    def tearDown(self):
        cli.MIRRORS.clear()

    def test_mirror_first_commit_then_main(self):
        cli.MIRRORS.extend(["https://hub.example"])
        m = {"id": "org/model", "upstream": {"commit": "a" * 40},
             "sources": [{"type": "source", "priority": 2, "url": "https://huggingface.co/org/model/resolve/x/"},
                         {"type": "hosted", "priority": 1, "url": "https://freeweights.example/org/model/resolve/x/"}]}
        urls = [s["url"] for s in cli.sources_of(m)]
        self.assertEqual(urls[:2], ["https://hub.example/org/model/resolve/" + "a" * 40 + "/",
                                    "https://hub.example/org/model/resolve/main/"])
        self.assertEqual(urls[2:], ["https://freeweights.example/org/model/resolve/x/",
                                    "https://huggingface.co/org/model/resolve/x/"])

    def test_no_mirror_keeps_manifest_order(self):
        m = {"id": "o/m", "sources": [{"priority": 2, "url": "b/"}, {"priority": 1, "url": "a/"}]}
        self.assertEqual([s["url"] for s in cli.sources_of(m)], ["a/", "b/"])


if __name__ == "__main__":
    unittest.main()
