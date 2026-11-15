"""fw_admin signed requests: the signature matches the Worker's scheme (spec/accounts-v1.md 11.4), the request
carries the right path, query, body and headers, and a Worker error exits with its code and message."""
import hashlib
import hmac
import io
import json
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import fw_admin  # noqa: E402

SECRET = "test-secret"


def expected(ts, method, pq, body=b""):
    """Independent restatement of the scheme, byte for byte."""
    msg = "\n".join([str(ts), method, pq, hashlib.sha256(body).hexdigest()]).encode()
    return "v1=" + hmac.new(SECRET.encode(), msg, hashlib.sha256).hexdigest()


class FakeResp(io.BytesIO):
    def __enter__(self): return self
    def __exit__(self, *a): return False


class Sign(unittest.TestCase):
    def test_vector(self):
        # sha256("") is the body hash of a bodyless request; the hex digest is pinned so a change in the message layout fails.
        self.assertEqual(hashlib.sha256(b"").hexdigest(), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
        self.assertEqual(fw_admin.sign(SECRET, 1800000000, "get", "/api/fw/v1/admin/limits"), expected(1800000000, "GET", "/api/fw/v1/admin/limits"))
        a = fw_admin.sign(SECRET, 1, "POST", "/p", b'{"a":1}')
        self.assertEqual(a, expected(1, "POST", "/p", b'{"a":1}'))
        self.assertNotEqual(a, fw_admin.sign(SECRET, 1, "POST", "/p", b'{"a":2}'))
        self.assertNotEqual(a, fw_admin.sign(SECRET, 2, "POST", "/p", b'{"a":1}'))
        self.assertNotEqual(a, fw_admin.sign(SECRET, 1, "PUT", "/p", b'{"a":1}'))
        self.assertNotEqual(a, fw_admin.sign("other", 1, "POST", "/p", b'{"a":1}'))


class Request(unittest.TestCase):
    def call(self, *a, **k):
        seen = {}
        def fake(req, timeout=0):
            seen["req"] = req
            return FakeResp(b'{"ok": true}')
        with mock.patch.object(fw_admin.urllib.request, "urlopen", fake):
            out = fw_admin.api(*a, secret=SECRET, now=1800000000, base="https://h.test", **k)
        return out, seen["req"]

    def test_get_with_query(self):
        out, req = self.call("GET", "reports", query={"status": "open", "cursor": "2026-11-15T10:00:00Z|rpt_1"})
        pq = "/api/fw/v1/admin/reports?status=open&cursor=2026-11-15T10%3A00%3A00Z%7Crpt_1"
        self.assertEqual(out, {"ok": True})
        self.assertEqual(req.full_url, "https://h.test" + pq)
        self.assertEqual(req.get_method(), "GET")
        self.assertIsNone(req.data)
        self.assertEqual(req.get_header("X-fw-signature"), expected(1800000000, "GET", pq))
        self.assertEqual(req.get_header("X-fw-timestamp"), "1800000000")

    def test_post_body_is_signed_exactly_as_sent(self):
        _, req = self.call("POST", "repos/rp_ABC/remove", {"reason_class": "copyright", "purge": True})
        pq = "/api/fw/v1/admin/repos/rp_ABC/remove"
        self.assertEqual(req.get_header("X-fw-signature"), expected(1800000000, "POST", pq, req.data))
        self.assertEqual(json.loads(req.data), {"reason_class": "copyright", "purge": True})

    def test_path_segments_are_escaped(self):
        _, req = self.call("POST", "users/a b/c", {"staff": True})
        self.assertTrue(req.full_url.endswith("/api/fw/v1/admin/users/a%20b/c"))

    def test_worker_error_exits_with_its_message(self):
        import urllib.error
        def fake(req, timeout=0):
            raise urllib.error.HTTPError(req.full_url, 401, "x", {}, io.BytesIO(b'{"error":"bad_signature","message":"Bad signature."}'))
        with mock.patch.object(fw_admin.urllib.request, "urlopen", fake):
            with self.assertRaises(SystemExit) as cm:
                fw_admin.api("GET", "limits", secret=SECRET, now=1)
        self.assertIn("401 bad_signature", str(cm.exception))

    def test_missing_secret_stops(self):
        with mock.patch.dict(os.environ, {"FW_ADMIN_SECRET": ""}), mock.patch.object(fw_admin, "SECRET_FILE", "/nonexistent/x"):
            with self.assertRaises(SystemExit):
                fw_admin.admin_secret()


class Commands(unittest.TestCase):
    def test_limits_set_refuses_a_non_number(self):
        with self.assertRaises(SystemExit):
            fw_admin.main(["limits", "set", "uploads_open", "yes"])

    def test_user_needs_an_action(self):
        with self.assertRaises(SystemExit):
            fw_admin.main(["user", "alice"])

    def test_remove_loops_until_purged_then_blocklists(self):
        replies = [{"id": "rp_A", "sha256": ["a" * 64], "purged": False, "static_paths": []},
                   {"id": "rp_A", "sha256": ["a" * 64], "purged": True, "static_paths": ["/alt.freeweights.community/alice/m/"]}]
        calls = []
        def fake_api(method, path, body=None, **k):
            calls.append((method, path)); return replies[len(calls) - 1]
        import tempfile
        root = tempfile.mkdtemp(); os.makedirs(os.path.join(root, "policy"))
        with mock.patch.object(fw_admin, "api", fake_api), mock.patch.object(fw_admin, "purge_cache") as pc:
            self.assertEqual(fw_admin.main(["--root", root, "remove", "rp_A", "--reason", "copyright", "--blocklist", "--purge"]), 0)
        self.assertEqual(len(calls), 2)
        pc.assert_called_once_with(["/alt.freeweights.community/alice/m/"])
        with open(os.path.join(root, "policy", "blocklist.json")) as f:
            self.assertEqual(json.load(f)["entries"][0]["sha256"], ["a" * 64])


if __name__ == "__main__":
    unittest.main()
