import datetime as dt
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import discover as d  # noqa: E402

FIX = os.path.join(os.path.dirname(__file__), "fixtures", "listing_sample.json")
NOW = dt.datetime(2026, 11, 14, tzinfo=dt.timezone.utc)
WATCH = {"qwen", "sentence-transformers"}


def items():
    with open(FIX) as f:
        return json.load(f)


class FakeOpener:
    """Serves the fixture as pages of `size`, with Link headers. No network."""

    def __init__(self, data, size, fail_429_first=0):
        self.data, self.size, self.urls, self.fail = data, size, [], fail_429_first

    def __call__(self, url, headers):
        self.urls.append(url)
        if self.fail:
            self.fail -= 1
            return 429, {"retry-after": "1"}, b""
        start = int(url.split("cursor=")[1]) if "cursor=" in url else 0
        page = self.data[start:start + self.size]
        hdr = {"ratelimit": '"api";r=400;t=100'}
        if start + self.size < len(self.data):
            hdr["link"] = '<https://hf.test/api/models?cursor=%d>; rel="next"' % (start + self.size)
        return 200, hdr, json.dumps(page).encode()


class Logic(unittest.TestCase):
    def test_parse_next(self):
        self.assertEqual(d.parse_next('<https://x/y?cursor=ab>; rel="next"'), "https://x/y?cursor=ab")
        self.assertIsNone(d.parse_next(None))
        self.assertIsNone(d.parse_next('<https://x>; rel="prev"'))

    def test_base_models_typed_beats_plain(self):
        b = d.parse_base_models(["base_model:a/b", "base_model:quantized:a/b", "base_model:c/d"])
        self.assertEqual(b, [{"id": "a/b", "relation": "quantized"}, {"id": "c/d", "relation": "declared"}])
        self.assertEqual(d.relation_of(b), "quantized")

    def test_normalize_and_variants(self):
        a, b = [d.normalize(x, "model", WATCH, NOW) for x in items()[:2]]
        self.assertTrue(a["variant"])
        self.assertEqual(a["license"], "apache-2.0")
        self.assertTrue(b["variant"] and b["relation"] == "adapter")
        self.assertEqual(b["gated"], "manual")
        self.assertTrue(b["not_for_all_audiences"])
        self.assertFalse(b["has_safe_format_tag"])
        self.assertEqual(b["license_name"], "custom")
        self.assertEqual(a["key"], "model:sentence-transformers/all-minilm-l6-v2")

    def test_tiers(self):
        r = [d.normalize(x, "model", WATCH, NOW) for x in items()]
        self.assertEqual([x["tier_hint"] for x in r], ["T0", "T2", "T0", None, None])

    def test_tier_thresholds(self):
        base = {"org": "zz", "created_at": "2020-01-01T00:00:00Z"}
        for dl, likes, want in [(10000, 0, "T1"), (0, 200, "T1"), (1000, 0, "T2"), (999, 99, None)]:
            self.assertEqual(d.tier_hint(dict(base, downloads=dl, likes=likes), WATCH, NOW), want)
        old_lab = {"org": "Qwen", "created_at": "2020-01-01T00:00:00Z", "downloads": 5, "likes": 0}
        self.assertIsNone(d.tier_hint(old_lab, WATCH, NOW))

    def test_merge_and_same_as(self):
        recs = {}
        for x in items():
            r = d.normalize(x, "model", WATCH, NOW)
            r["sources"] = ["s1"]
            recs[r["key"]] = r
        dup = d.normalize(items()[2], "model", WATCH, NOW)
        dup["sources"] = ["s2"]
        dup["downloads"] = 1
        m = d.merge_records(recs[dup["key"]], dup)
        self.assertEqual(m["sources"], ["s1", "s2"])
        self.assertEqual(m["downloads"], 9000000)
        self.assertEqual(d.link_same_as(recs), 1)
        q, mir = recs["model:qwen/qwen3-8b"], recs["model:mirror/qwen3-8b"]
        self.assertTrue(q["canonical"] and not mir["canonical"])
        self.assertEqual(mir["same_as"], [q["key"]])
        self.assertEqual(q["same_as_basis"], "commit")

    def test_same_as_by_weight_hashes(self):
        a = {"key": "model:a/x", "watchlist": False, "created_at": "2025", "sha": "1",
             "siblings": [{"rfilename": "m.safetensors", "lfs": {"sha256": "H"}}]}
        b = {"key": "model:b/x", "watchlist": False, "created_at": "2024", "sha": "2",
             "siblings": [{"rfilename": "m.safetensors", "lfs": {"sha256": "H"}}]}
        recs = {"model:a/x": a, "model:b/x": b}
        self.assertEqual(d.link_same_as(recs), 1)
        self.assertTrue(b["canonical"])
        self.assertEqual(a["same_as_basis"], "weights")

    def test_plan_jobs(self):
        jobs = d.plan_jobs("model", 40000, ["A", "B"], 100, ["downloads"])
        self.assertEqual([j["pages"] for j in jobs], [40, 1, 1])
        self.assertEqual(jobs[1]["author"], "A")


def hot(key, score, sources=("model/trendingScore",)):
    return {"key": key, "trending_score": score, "sources": list(sources)}


class Trending(unittest.TestCase):
    def recs(self, *rs):
        return {r["key"]: r for r in rs}

    def test_two_consecutive_runs_needed(self):
        run1 = self.recs(hot("model:a/x", 90), hot("model:b/y", 80), hot("model:c/z", 0))
        st = d.apply_trending(run1, {}, "2026-11-14", top=2)
        self.assertEqual([r["trending_runs"] for r in run1.values()], [1, 1, 0])
        run2 = self.recs(hot("model:a/x", 70), hot("model:d/w", 60), hot("model:b/y", 5))
        st = d.apply_trending(run2, st, "2026-11-15", top=2)
        self.assertEqual(run2["model:a/x"]["trending_runs"], 2)
        self.assertEqual(run2["model:d/w"]["trending_runs"], 1)
        self.assertEqual(run2["model:b/y"]["trending_runs"], 0)
        self.assertEqual(run2["model:a/x"]["trending_rank"], 1)
        self.assertEqual(st["prev_keys"], ["model:a/x", "model:b/y"])

    def test_same_day_rerun_does_not_count_as_second_run(self):
        st = d.apply_trending(self.recs(hot("model:a/x", 9)), {}, "2026-11-14")
        again = self.recs(hot("model:a/x", 9))
        d.apply_trending(again, st, "2026-11-14")
        self.assertEqual(again["model:a/x"]["trending_runs"], 1)

    def test_only_trending_listing_counts(self):
        r = self.recs(hot("model:a/x", 50, ("model/downloads",)))
        d.apply_trending(r, {}, "2026-11-14")
        self.assertEqual(r["model:a/x"]["trending_runs"], 0)


class Reupload(unittest.TestCase):
    def files(self, weight_sha, readme_sha="r1"):
        return [{"lfs": False, "path": "README.md", "sha256": readme_sha, "size": 2100},
                {"lfs": False, "path": "config.json", "sha256": "c" + readme_sha, "size": 800},
                {"lfs": True, "path": "model-00001-of-00002.safetensors", "sha256": weight_sha + "1", "size": 4_000_000_000},
                {"lfs": True, "path": "model-00002-of-00002.safetensors", "sha256": weight_sha + "2", "size": 1_500_000_000}]

    def test_same_weights_other_readme_is_reupload(self):
        import build_catalog as b
        listed = {b.formats.weight_sha_set(self.files("aa")): "org/orig"}
        self.assertEqual(b.exact_reupload(self.files("aa", "r2"), "copy/orig", listed), "org/orig")

    def test_different_weights_or_itself_is_not(self):
        import build_catalog as b
        listed = {b.formats.weight_sha_set(self.files("aa")): "org/orig"}
        self.assertIsNone(b.exact_reupload(self.files("bb"), "copy/orig", listed))
        self.assertIsNone(b.exact_reupload(self.files("aa"), "org/orig", listed))
        self.assertIsNone(b.exact_reupload([{"lfs": False, "path": "README.md", "sha256": "x", "size": 9}], "copy/orig", listed))


class Paging(unittest.TestCase):
    def run_job(self, size, mx, since=None, fail=0, state=None, tmp=None):
        tmp = tmp or tempfile.mkdtemp()
        sleeps = []
        c = d.Client(opener=FakeOpener(items(), size, fail), sleep=sleeps.append)
        job = {"id": "model/downloads", "kind": "model", "sort": "downloads", "max": mx}
        state = state if state is not None else {"jobs": {}}
        st = d.run_job(c, job, os.path.join(tmp, "raw.jsonl"), state, os.path.join(tmp, "s.json"), WATCH, since, NOW)
        return c, st, tmp, sleeps

    def test_follows_cursor_to_end(self):
        c, st, tmp, _ = self.run_job(2, 100)
        self.assertEqual(st["count"], 5)
        self.assertTrue(st["done"])
        self.assertEqual(c.calls, 3)
        with open(os.path.join(tmp, "raw.jsonl")) as f:
            self.assertEqual(len(f.read().splitlines()), 5)

    def test_max_stops_early(self):
        c, st, _, _ = self.run_job(2, 4)
        self.assertEqual(st["count"], 4)
        self.assertEqual(c.calls, 2)

    def test_backoff_on_429(self):
        c, st, _, sleeps = self.run_job(5, 100, fail=2)
        self.assertEqual(st["count"], 5)
        self.assertEqual(c.retries, 2)
        self.assertTrue(sleeps)

    def test_since_filter(self):
        _, st, tmp, _ = self.run_job(5, 100, since="2025-01-01")
        self.assertEqual(st["count"], 3)

    def test_resume_skips_done_job(self):
        _, st, tmp, _ = self.run_job(2, 100)
        state = {"jobs": {"model/downloads": st}}
        c, st2, _, _ = self.run_job(2, 100, state=state, tmp=tmp)
        self.assertEqual(c.calls, 0)

    def test_resume_from_cursor(self):
        tmp = tempfile.mkdtemp()
        state = {"jobs": {"model/downloads": {"done": False, "count": 2, "cursor": "https://hf.test/api/models?cursor=2"}}}
        c, st, _, _ = self.run_job(2, 100, state=state, tmp=tmp)
        self.assertEqual(st["count"], 5)
        self.assertEqual(c.calls, 2)

    def test_token_never_in_url(self):
        c = d.Client(token="secret", opener=FakeOpener(items(), 5))
        c.get("https://hf.test/api/models")
        self.assertNotIn("secret", c.opener.urls[0])


if __name__ == "__main__":
    unittest.main()
