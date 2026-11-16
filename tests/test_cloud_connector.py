"""Cloud Connector switch (step 10b): the dry runs print every rule with the right expression and target and send
nothing; the rule expressions route the same paths the Worker serves from R2 today (worker/src/routes/index.ts);
sync_r2's Content-Type map; fw_admin's static takedown targets. No network: dry runs only."""
import json
import os
import re
import subprocess
import sys
import unittest

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import fw_admin  # noqa: E402
import sync_r2  # noqa: E402

ENV = {k: v for k, v in os.environ.items() if k not in ("CF_API_TOKEN", "CF_ZONE_ID", "FW_HOST", "FW_R2_HOST")}
HOST = "freeweights.allternit.com"


def run(*args):
    r = subprocess.run(["bash", *args], cwd=ROOT, env=ENV, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return r.stdout


def csp_module():
    out = subprocess.run(["node", "--input-type=module", "-e", "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(m.SECURITY_HEADERS))",
                          os.path.join(ROOT, "site", "lib", "csp.mjs")], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def matcher(expr):
    """Evaluate the small subset of the Rules language these rules use, for one (host, path)."""
    py = re.sub(r'http\.request\.uri\.path strict wildcard "([^"]*)"', r'W("\1")', expr)
    py = re.sub(r'starts_with\(http\.request\.uri\.path, "([^"]*)"\)', r'SW("\1")', py)
    py = re.sub(r'http\.host eq "([^"]*)"', r'H("\1")', py)
    py = re.sub(r'http\.request\.uri\.path contains "([^"]*)"', r'C("\1")', py)
    assert not re.search(r"http\.|wildcard|matches", py), py  # nothing left untranslated (and no regex operator: Free plan)
    def f(host, path):
        W = lambda pat: re.fullmatch(".*".join(map(re.escape, pat.split("*"))), path) is not None
        return eval(py, {"W": W, "SW": path.startswith, "C": lambda s: s in path, "H": lambda h: h == host})  # noqa: S307 - test-only, our own strings
    return f


class CloudConnectorPlan(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        out = run("scripts/cf_cloud_connector.sh", "--rules-only", "--format", "json")
        cls.plan = json.loads(out)
        cls.rules = {r["ref"]: r for r in cls.plan["rules"]}

    def test_dry_run_sends_nothing_and_names_placeholders(self):
        self.assertEqual(self.plan["mode"], "dry-run")
        self.assertEqual(self.plan["zone"], "$CF_ZONE_ID")
        self.assertEqual(self.plan["r2_host"], "freeweights-files.allternit.com")
        self.assertNotIn("r2.dev", json.dumps(self.plan))

    def test_each_rule_has_phase_and_target(self):
        r = self.rules
        self.assertEqual(r["fw_cc_index_rewrite"]["phase"], "http_request_transform")
        self.assertEqual(r["fw_cc_index_rewrite"]["action_parameters"]["uri"]["path"]["expression"], 'concat(http.request.uri.path, "index.html")')
        fv = r["fw_cc_bare_301"]["action_parameters"]["from_value"]
        self.assertEqual((r["fw_cc_bare_301"]["phase"], fv["status_code"], fv["preserve_query_string"]), ("http_request_dynamic_redirect", 301, True))
        self.assertEqual(fv["target_url"]["expression"], 'concat(http.request.uri.path, "/")')
        self.assertEqual(r["fw_cc_cache"]["action_parameters"]["edge_ttl"]["default"], 300)
        c = self.plan["connector"]
        self.assertEqual((c["provider"], c["parameters"]["host"]), ("cloudflare_r2", "freeweights-files.allternit.com"))
        self.assertTrue(c["description"].startswith("freeweights-cc:"))

    def test_csp_comes_from_csp_mjs(self):
        want = csp_module()
        got = {k: v["value"] for k, v in self.rules["fw_cc_page_headers"]["action_parameters"]["headers"].items()}
        for k, v in want.items(): self.assertEqual(got[k], v)
        self.assertEqual(self.rules["fw_cc_page_headers"]["phase"], "http_response_headers_transform")

    def test_expressions_route_what_the_worker_serves(self):
        rw, bare = matcher(self.rules["fw_cc_index_rewrite"]["expression"]), matcher(self.rules["fw_cc_bare_301"]["expression"])
        cc, page_h = matcher(self.plan["connector"]["expression"]), matcher(self.rules["fw_cc_page_headers"]["expression"])
        man_h, cache = matcher(self.rules["fw_cc_manifest_headers"]["expression"]), matcher(self.rules["fw_cc_cache"]["expression"])
        d = "/alt.freeweights.text/BAAI/bge-small-en-v1.5"
        # path -> (rewritten, redirected, served from R2 after the rewrite)
        cases = {
            d + "/": (True, False, True), d + "/index.html": (False, False, True), d: (False, True, False),
            "/manifests/BAAI/bge-small-en-v1.5.json": (False, False, True), "/manifests/BAAI/bge-small-en-v1.5.json.minisig": (False, False, True),
            "/alt.freeweights.text/page/2/": (False, False, False), "/alt.freeweights.text/page/2": (False, False, False),
            "/alt.freeweights.text/": (False, False, False), "/alt.freeweights/page/2/": (False, False, False),
            "/alt.freeweights.text/a/b/c/": (False, False, False), "/api/models": (False, False, False),
            "/BAAI/bge-small-en-v1.5/resolve/main/config.json": (False, False, False), "/studio/": (False, False, False),
        }
        for path, (want_rw, want_301, want_r2) in cases.items():
            after = path + "index.html" if rw(HOST, path) else path
            self.assertEqual((rw(HOST, path), bare(HOST, path), cc(HOST, after)), (want_rw, want_301, want_r2), path)
            if want_r2: self.assertTrue(cache(HOST, after), path)
            if want_r2 and not path.startswith("/manifests/"): self.assertTrue(page_h(HOST, after) and page_h(HOST, path), path)
            if path.startswith("/manifests/"): self.assertTrue(man_h(HOST, path) and not page_h(HOST, path), path)
        self.assertFalse(cc("other.allternit.com", "/manifests/a/b.json"))

    def test_human_dry_run_prints_every_rule_and_the_route_switch(self):
        out = run("scripts/cf_cloud_connector.sh")
        self.assertIn("DRY RUN: nothing sent", out)
        for ref in self.rules: self.assertIn(f'"ref": "{ref}"', out)
        self.assertIn("PUT https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/cloud_connector/rules", out)
        self.assertRegex(out, r"POST\s+\S+/workers/routes \{\"pattern\":\"freeweights\.allternit\.com/manifests/\*\"\}")
        self.assertIn('"pattern":"freeweights.allternit.com/alt.freeweights*"', out)

    def test_rollback_removes_only_our_rules_routes_first(self):
        out = run("scripts/cf_cloud_connector.sh", "--rollback")
        self.assertLess(out.index("--connector-off"), out.index("cloud_connector/rules"))
        deleted = re.findall(r"DELETE \S+/rules/\{rule_id:(fw_cc_\w+)\}", out)
        self.assertEqual(sorted(deleted), sorted(set(self.rules) - {"fw_cc_bucket_guard"}))  # the guard stays

    def test_bucket_domain_serves_only_manifests_and_pages(self):
        g = self.rules["fw_cc_bucket_guard"]
        self.assertEqual((g["phase"], g["action"]), ("http_request_firewall_custom", "block"))
        block, r2 = matcher(g["expression"]), "freeweights-files.allternit.com"
        for path in ("/repos/rp_X/blobs/" + "a" * 64, "/repos/rp_X/trees/" + "b" * 40 + ".json", "/", "/index.html",
                     "/manifests/../repos/rp_X/blobs/x", "/alt.freeweights.community/../repos/x", "/policy/takedowns.json"):
            self.assertTrue(block(r2, path), path)
        for path in ("/manifests/BAAI/bge-small-en-v1.5.json", "/alt.freeweights.community/me/m/index.html", "/alt.freeweights.text/BAAI/bge/index.html"):
            self.assertFalse(block(r2, path), path)
        self.assertFalse(block(HOST, "/repos/rp_X/blobs/x"))  # the main host is the Worker's, not this rule's
        self.assertNotIn("POST https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/rulesets", out)


class StaticRoutes(unittest.TestCase):
    def test_switch_and_reverse(self):
        base, on, off = (run("scripts/cf_static_routes.sh", *a) for a in ((), ("--connector-on",), ("--connector-off",)))
        for out in (base, on, off): self.assertIn("DRY RUN", out)
        conn = ("/manifests/*", "/alt.freeweights*")
        for p in conn:
            pat = f'{{"pattern":"{HOST}{p}"}}'
            self.assertIn(pat, on); self.assertNotIn(pat, base); self.assertNotIn(pat, off)
            self.assertIn(f"{{id of {HOST}{p}", off); self.assertNotIn("DELETE", base + on)


class SyncR2Types(unittest.TestCase):
    def test_content_type_map(self):
        self.assertEqual(sync_r2.ctype_of("manifests/a/b.json"), "application/json")
        self.assertEqual(sync_r2.ctype_of("manifests/a/b.json.minisig"), "text/plain; charset=utf-8")
        self.assertEqual(sync_r2.ctype_of("alt.freeweights.text/a/b/index.html"), "text/html; charset=utf-8")

    def test_wrong_types_flags_only_managed_mismatches(self):
        remote = {"manifests/a/b.json": ("e", "application/json", 1), "manifests/a/b.json.minisig": ("e", "application/octet-stream", 1),
                  "alt.freeweights.text/a/b/index.html": ("e", None, 1), "alt.freeweights.community/x/y/index.html": ("e", "text/plain", 1)}
        self.assertEqual([k for k, _, _ in sync_r2.wrong_types(remote)], ["alt.freeweights.text/a/b/index.html", "manifests/a/b.json.minisig"])


class TakedownStatic(unittest.TestCase):
    def test_targets_cover_every_static_path(self):
        keys, urls = fw_admin.static_targets("org/my repo", "alt.freeweights.text", host=HOST)
        self.assertEqual(keys, ["manifests/org/my repo.json", "manifests/org/my repo.json.minisig", "alt.freeweights.text/org/my repo/index.html"])
        self.assertIn(f"https://{HOST}/manifests/org/my%20repo.json.minisig", urls)
        self.assertIn(f"https://{HOST}/alt.freeweights.text/org/my%20repo/", urls)
        self.assertIn(f"https://{HOST}/alt.freeweights.text/org/my%20repo", urls)


if __name__ == "__main__":
    unittest.main()
