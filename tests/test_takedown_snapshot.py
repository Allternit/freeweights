"""B8 snapshots and B9 takedowns: the snapshot root recomputes and verifies, a blocklisted weight hash is
refused by the build and by discover, and fw_admin takedown writes the blocklist, counter and registry line.
Signing uses a throwaway minisign key, never the Freeweights key."""
import contextlib
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import blocklist  # noqa: E402
import build_catalog  # noqa: E402
import discover  # noqa: E402
import fw_admin  # noqa: E402
import registry_chain as rc  # noqa: E402
import verify_ledger as vl  # noqa: E402

HAVE_MINISIGN = shutil.which("minisign") is not None
W1, W2 = "a" * 64, "b" * 64


def manifest(mid, weight):
    return {"id": mid, "section": "alt.freeweights.embed", "files": [
        {"path": "config.json", "size": 10, "sha256": "c" * 64, "lfs": False},
        {"path": "model.safetensors", "size": 5 << 20, "sha256": weight, "lfs": True}]}


def rd(path):
    with open(path, encoding="utf-8") as f: return f.read()


def jl(path): return json.loads(rd(path))


def wr(path, text):
    with open(path, "w", encoding="utf-8") as f: f.write(text)


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps(obj, sort_keys=True, indent=2) + "\n")


@unittest.skipUnless(HAVE_MINISIGN, "minisign not installed")
class Signed(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.key, self.pub = os.path.join(self.tmp, "k.key"), os.path.join(self.tmp, "k.pub")
        subprocess.run(["minisign", "-G", "-W", "-p", self.pub, "-s", self.key], check=True, capture_output=True)
        self.man, self.ledger = os.path.join(self.tmp, "manifests"), os.path.join(self.tmp, "ledger")
        write(os.path.join(self.man, "org__one.json"), manifest("org/one", W1))
        write(os.path.join(self.man, "org__two.json"), manifest("org/two", W2))

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def verify(self):
        p = rc.paths(self.ledger)
        reg, err = vl.check_chain(p["chain"], p["head"], self.pub, "registry")
        self.assertIsNone(err)
        snap, err = vl.check_snapshot(p["snap"], reg, self.pub)
        self.assertIsNone(err)
        return reg, snap

    def test_snapshot_root_recomputes_and_verifies(self):
        rc.snapshot(True, self.key, self.man, self.ledger)
        reg, snap = self.verify()
        self.assertEqual([e["type"] for e in reg], ["snapshot"])
        # anyone can recompute the root from the manifest bytes
        self.assertEqual(rc.snapshot_root(rc.listing_from_dir(self.man)), snap["root"])
        self.assertEqual(snap["count"], 2)
        # an unchanged run appends nothing; an unsigned run never writes
        rc.snapshot(True, self.key, self.man, self.ledger)
        self.assertEqual(len(rc.read_chain(self.ledger)), 1)
        write(os.path.join(self.man, "org__two.json"), manifest("org/two", "d" * 64))
        rc.snapshot(False, self.key, self.man, self.ledger)
        self.assertEqual(len(rc.read_chain(self.ledger)), 1)
        # an edited manifest no longer matches the signed root
        self.assertNotEqual(rc.snapshot_root(rc.listing_from_dir(self.man)), snap["root"])
        rc.snapshot(True, self.key, self.man, self.ledger)
        reg, snap2 = self.verify()
        self.assertEqual(len(reg), 2)
        self.assertEqual(rc.snapshot_root(rc.listing_from_dir(self.man)), snap2["root"])

    def test_tampered_snapshot_fails(self):
        rc.snapshot(True, self.key, self.man, self.ledger)
        p = rc.paths(self.ledger)
        snap = jl(p["snap"])
        snap["entries"][0][1] = "e" * 64
        wr(p["snap"], json.dumps(snap))
        reg, _ = vl.check_chain(p["chain"], p["head"], self.pub, "registry")
        _, err = vl.check_snapshot(p["snap"], reg, self.pub)
        self.assertIn("do not hash to its root", err)

    def test_takedown_writes_blocklist_counter_registry_and_removes_entry(self):
        root = self.tmp
        rows = [{"id": "org/one", "kind": "model", "section": "alt.freeweights.embed"},
                {"id": "org/two", "kind": "model", "section": "alt.freeweights.embed"}]
        write(os.path.join(root, "catalog", "catalog.json"),
              {"sections": [{"id": "alt.freeweights.embed", "count": 2}], "models": rows})
        for r in rows: write(os.path.join(root, "catalog", "rows", r["id"].replace("/", "__") + ".json"), r)
        wr(os.path.join(self.man, "org__one.json.minisig"), "sig")
        write(os.path.join(root, "policy", "takedowns.json"), {"schema_version": 0, "totals": {"copyright": 0}, "entries": []})
        rc.snapshot(True, self.key, self.man, self.ledger)
        before = {p: rd(os.path.join(root, p)) for p in ("catalog/catalog.json", "policy/takedowns.json")}
        args = ["--root", root, "takedown", "org/one", "--reason", "copyright", "--key", self.key]
        with contextlib.redirect_stdout(io.StringIO()) as out:
            fw_admin.main(args + ["--dry-run"])
        self.assertIn("INSERT INTO takedowns", out.getvalue())
        self.assertIn("nothing written", out.getvalue())
        for p, body in before.items(): self.assertEqual(rd(os.path.join(root, p)), body)
        self.assertFalse(os.path.exists(os.path.join(root, "policy", "blocklist.json")))
        with contextlib.redirect_stdout(io.StringIO()):
            fw_admin.main(args)
        bl = jl(os.path.join(root, "policy", "blocklist.json"))
        self.assertEqual(bl["entries"][0]["sha256"], [W1])  # the LFS weight, not the config
        cat = jl(os.path.join(root, "catalog", "catalog.json"))
        self.assertEqual([r["id"] for r in cat["models"]], ["org/two"])
        self.assertEqual(cat["sections"][0]["count"], 1)
        self.assertFalse(os.path.exists(os.path.join(root, "catalog", "rows", "org__one.json")))
        self.assertFalse(os.path.exists(os.path.join(self.man, "org__one.json")))
        self.assertFalse(os.path.exists(os.path.join(self.man, "org__one.json.minisig")))
        td = jl(os.path.join(root, "policy", "takedowns.json"))
        self.assertEqual(td["totals"]["copyright"], 1)
        self.assertEqual(td["entries"][0]["id"], "org/one")
        reg, snap = self.verify()
        line = [e for e in reg if e["type"] == "takedown"][0]
        self.assertEqual({k: line[k] for k in ("id", "kind", "reason_class")}, {"id": "org/one", "kind": "model", "reason_class": "copyright"})
        self.assertEqual(snap["count"], 1)  # the new snapshot no longer holds the removed manifest
        with self.assertRaises(SystemExit):  # a second takedown of the same id stops
            with contextlib.redirect_stdout(io.StringIO()):
                fw_admin.main(args)


class Blocklist(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.path = os.path.join(self.tmp, "blocklist.json")
        blocklist.write({"schema_version": 0, "entries": [
            {"id": "bad/model", "kind": "model", "date": "2026-11-14", "reason_class": "copyright", "sha256": [W1]}]}, self.path)
        self.old, blocklist.PATH = blocklist.PATH, self.path

    def tearDown(self):
        blocklist.PATH = self.old
        shutil.rmtree(self.tmp)

    def test_build_refuses_blocklisted_weight_hash_under_another_name(self):
        self.assertIn("weight hash", build_catalog.blocked("someone/renamed-copy", manifest("someone/renamed-copy", W1)))
        self.assertIn("removed after a takedown", build_catalog.blocked("Bad/Model"))  # the id itself, any case
        self.assertIsNone(build_catalog.blocked("someone/other", manifest("someone/other", W2)))

    def test_discover_drops_blocklisted_records(self):
        recs = {"model:a/copy": {"id": "a/copy", "siblings": [{"rfilename": "m.safetensors", "lfs": {"sha256": W1}}]},
                "model:bad/model": {"id": "bad/model"},
                "model:ok/fine": {"id": "ok/fine", "siblings": [{"rfilename": "m.safetensors", "lfs": {"sha256": W2}}]}}
        self.assertEqual(sorted(discover.drop_blocked(recs)), ["model:a/copy", "model:bad/model"])
        self.assertEqual(list(recs), ["model:ok/fine"])


if __name__ == "__main__":
    unittest.main()
