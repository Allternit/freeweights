#!/usr/bin/env python3
"""Freeweights discover: collect facts about Hugging Face repos. Stdlib only.

Writes one JSONL record per repo to work/candidates-<date>.jsonl. It collects
facts and tier hints only. License verdicts belong to scripts/classify.py.

  python3 scripts/discover.py --limit 2000 --org-limit 100
  python3 scripts/discover.py --dry-run
  python3 scripts/discover.py --kind dataset --limit 1000 --orgs Qwen,allenai

HF_TOKEN (env) raises the rate limit; it is never printed or stored.
"""
from __future__ import annotations

import argparse
import collections
import datetime as dt
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WATCHLIST = os.path.join(ROOT, "catalog", "watchlist.json")
WORK = os.path.join(ROOT, "work")
API = "https://huggingface.co/api"
PAGE = 1000
FIELDS = ["author", "createdAt", "lastModified", "downloads", "likes", "tags", "pipeline_tag",
          "library_name", "cardData", "gated", "disabled", "sha", "trendingScore"]
SAFE_FORMAT_TAGS = {"safetensors", "gguf", "onnx", "mlx", "tflite", "coreml", "openvino", "ggml"}
VARIANT_RELATIONS = {"quantized", "adapter"}
MAX_CALLS_PER_WINDOW = 450  # headroom under 500 / 5 min anonymous
WINDOW = 300.0


# ---------- pure logic (tested) ----------

def parse_next(link_header):
    """Return the rel="next" URL from a Link header, or None."""
    if not link_header:
        return None
    for part in link_header.split(","):
        m = re.match(r'\s*<([^>]+)>\s*;\s*rel="?next"?', part)
        if m:
            return m.group(1)
    return None


def parse_base_models(tags, card_base=None):
    """Return [{'id', 'relation'}] from base_model:* tags (plus cardData.base_model).

    Tags look like base_model:quantized:org/x, base_model:finetune:org/x,
    base_model:adapter:org/x, base_model:merge:org/x, and plain base_model:org/x.
    A typed tag wins over the plain tag for the same id.
    """
    typed, plain = {}, []
    for t in tags or []:
        if not t.startswith("base_model:"):
            continue
        rest = t[len("base_model:"):]
        m = re.match(r"(quantized|adapter|finetune|merge):(.+)$", rest)
        if m:
            typed[m.group(2)] = m.group(1)
        else:
            plain.append(rest)
    out = [{"id": i, "relation": r} for i, r in typed.items()]
    seen = set(typed)
    for i in plain:
        if i not in seen:
            out.append({"id": i, "relation": "declared"})
            seen.add(i)
    if isinstance(card_base, str):
        card_base = [card_base]
    for i in card_base or []:
        if isinstance(i, str) and i not in seen:
            out.append({"id": i, "relation": "declared"})
            seen.add(i)
    return out


def relation_of(base_models, library_name=None, tags=None):
    """Overall lineage: quantized | adapter | merge | finetune | declared | none."""
    rels = {b["relation"] for b in base_models}
    for r in ("quantized", "adapter", "merge", "finetune", "declared"):
        if r in rels:
            return r
    if library_name == "peft":
        return "adapter"
    return "none"


def license_facts(card, tags):
    """Raw license facts only. No verdict."""
    card = card if isinstance(card, dict) else {}
    lic = card.get("license")
    if isinstance(lic, list):
        lic = ",".join(str(x) for x in lic)
    tag_lics = [t[len("license:"):] for t in tags or [] if t.startswith("license:")]
    return {
        "license": lic if isinstance(lic, str) else None,
        "license_tags": tag_lics,
        "license_name": card.get("license_name") if isinstance(card.get("license_name"), str) else None,
        "license_link": card.get("license_link") if isinstance(card.get("license_link"), str) else None,
    }


def months_ago(iso, now):
    try:
        d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except Exception:
        return None
    return (now - d).days / 30.44


def tier_hint(rec, watch, now=None):
    """T0 watch-list / T1 >=10k dl or >=200 likes / T2 >=1k dl / else None."""
    now = now or dt.datetime.now(dt.timezone.utc)
    dl, likes = rec.get("downloads") or 0, rec.get("likes") or 0
    if rec.get("org", "").lower() in watch:
        age = months_ago(rec.get("created_at") or "", now)
        if (age is not None and age <= 36) or dl >= 1000 or likes >= 100:
            return "T0"
    if dl >= 10000 or likes >= 200:
        return "T1"
    if dl >= 1000:
        return "T2"
    return None


def normalize(raw, kind, watch, now=None):
    """Turn one API listing item into a candidate record."""
    rid = raw.get("id") or raw.get("modelId")
    if not rid:
        return None
    tags = raw.get("tags") or []
    card = raw.get("cardData") if isinstance(raw.get("cardData"), dict) else {}
    org = rid.split("/")[0] if "/" in rid else ""
    bases = parse_base_models(tags, card.get("base_model"))
    rel = relation_of(bases, raw.get("library_name"), tags)
    gated = raw.get("gated")
    rec = {
        "key": "%s:%s" % (kind, rid.lower()),
        "kind": kind,
        "id": rid,
        "org": org,
        "name": rid.split("/")[-1],
        "author": raw.get("author") or org,
        "created_at": raw.get("createdAt"),
        "last_modified": raw.get("lastModified"),
        "downloads": raw.get("downloads"),
        "likes": raw.get("likes"),
        "trending_score": raw.get("trendingScore"),
        "pipeline_tag": raw.get("pipeline_tag"),
        "library_name": raw.get("library_name") or card.get("library_name"),
        "tags": tags,
        "gated": gated if gated in (False, None) else (gated or True),
        "disabled": bool(raw.get("disabled")),
        "sha": raw.get("sha"),
        "base_models": bases,
        "relation": rel,
        "variant": rel in VARIANT_RELATIONS,
        "has_safe_format_tag": bool(SAFE_FORMAT_TAGS & set(tags)),
        "not_for_all_audiences": "not-for-all-audiences" in tags,
        "watchlist": org.lower() in watch,
        "sources": [],
    }
    rec.update(license_facts(card, tags))
    if "siblings" in raw:
        rec["siblings"] = [
            {k: v for k, v in s.items() if k in ("rfilename", "size", "lfs")}
            for s in raw["siblings"] or []]
    rec["tier_hint"] = tier_hint(rec, watch, now)
    return rec


def merge_records(a, b):
    """Merge two records of the same key: max counters, union sources."""
    out = dict(a)
    for f in ("downloads", "likes", "trending_score"):
        vals = [v for v in (a.get(f), b.get(f)) if v is not None]
        out[f] = max(vals) if vals else None
    if (b.get("last_modified") or "") > (a.get("last_modified") or ""):
        for f in ("last_modified", "sha", "tags", "base_models", "relation", "variant", "gated",
                  "disabled", "license", "license_tags", "license_name", "license_link"):
            if f in b:
                out[f] = b[f]
    if "siblings" in b and "siblings" not in out:
        out["siblings"] = b["siblings"]
    out["sources"] = sorted(set(a.get("sources", [])) | set(b.get("sources", [])))
    out["tier_hint"] = better_tier(a.get("tier_hint"), b.get("tier_hint"))
    return out


def better_tier(x, y):
    order = {"T0": 0, "T1": 1, "T2": 2, None: 3}
    return x if order[x] <= order[y] else y


def weight_hashes(rec):
    """sha256 set from siblings lfs data, only when the listing returned it."""
    hs = set()
    for s in rec.get("siblings") or []:
        lfs = s.get("lfs") or {}
        h = lfs.get("sha256") or lfs.get("oid")
        if h:
            hs.add(h)
    return frozenset(hs)


def link_same_as(records):
    """Group exact re-uploads by weight sha256 set (or identical commit sha).

    Sets canonical=True on the winner (watch list first, then oldest) and
    same_as=[keys of the others] on every member. Works on a dict key->record.
    """
    groups = collections.defaultdict(list)
    for r in records.values():
        hs = weight_hashes(r)
        if hs:
            groups[("w", hs)].append(r)
        elif r.get("sha"):
            groups[("c", r["sha"])].append(r)
    n = 0
    for g in groups.values():
        if len(g) < 2:
            continue
        g.sort(key=lambda r: (not r.get("watchlist"), r.get("created_at") or "9", r["key"]))
        keys = [r["key"] for r in g]
        for r in g:
            r["same_as"] = [k for k in keys if k != r["key"]]
            r["canonical"] = r is g[0]
            r["same_as_basis"] = "weights" if weight_hashes(r) else "commit"
        n += 1
    return n


def plan_jobs(kind, limit, orgs, org_limit, sorts):
    """Return the list of listing jobs. A job = one sorted listing to page through."""
    jobs = []
    for s in sorts:
        jobs.append({"id": "%s/%s" % (kind, s), "kind": kind, "sort": s, "max": limit})
    for o in orgs:
        jobs.append({"id": "%s/org/%s" % (kind, o), "kind": kind, "sort": "createdAt",
                     "author": o, "max": org_limit})
    for j in jobs:
        j["pages"] = max(1, math.ceil(j["max"] / PAGE))
    return jobs


def build_url(job, page_size):
    q = [("sort", job["sort"]), ("direction", "-1"), ("limit", str(page_size))]
    if job.get("author"):
        q.append(("author", job["author"]))
    q += [("expand[]", f) for f in FIELDS]
    if job.get("siblings"):
        q.append(("expand[]", "siblings"))
    return "%s/%s?%s" % (API, "models" if job["kind"] == "model" else "datasets", urllib.parse.urlencode(q))


# ---------- network ----------

class Client:
    """HTTP with a sliding-window limiter, header-aware waits and 429 backoff."""

    def __init__(self, token=None, sleep=time.sleep, clock=time.monotonic, opener=None):
        self._token = token
        self.sleep, self.clock = sleep, clock
        self.opener = opener or self._urlopen
        self.stamps = collections.deque()
        self.calls = 0
        self.retries = 0
        self.max_calls = MAX_CALLS_PER_WINDOW * (2 if token else 1)

    def _urlopen(self, url, headers):
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, dict((k.lower(), v) for k, v in r.getheaders()), r.read()

    def get(self, url):
        headers = {"User-Agent": "freeweights-discover/1"}
        if self._token:
            headers["Authorization"] = "Bearer " + self._token
        delay = 5.0
        for attempt in range(8):
            now = self.clock()
            while self.stamps and now - self.stamps[0] > WINDOW:
                self.stamps.popleft()
            if len(self.stamps) >= self.max_calls:
                self.sleep(WINDOW - (now - self.stamps[0]) + 1)
            self.stamps.append(self.clock())
            self.calls += 1
            try:
                status, hdr, body = self.opener(url, headers)
            except urllib.error.HTTPError as e:
                status, hdr, body = e.code, dict((k.lower(), v) for k, v in e.headers.items()), b""
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                status, hdr, body = 0, {}, b""
            if status == 200:
                m = re.search(r"\br=(\d+);t=(\d+)", hdr.get("ratelimit", ""))
                if m and int(m.group(1)) <= 2:
                    self.sleep(int(m.group(2)) + 1)
                return json.loads(body), hdr
            if status == 429 or status >= 500 or status == 0:
                self.retries += 1
                m = re.search(r"t=(\d+)", hdr.get("ratelimit", ""))
                wait = float(hdr.get("retry-after") or (m.group(1) if m else delay))
                self.sleep(min(wait + 1, 320))
                delay = min(delay * 2, 120)
                continue
            raise RuntimeError("HTTP %s for %s" % (status, url.split("?")[0]))
        raise RuntimeError("gave up after retries: " + url.split("?")[0])


# ---------- run ----------

def load_state(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {"jobs": {}}


def save_state(path, state):
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=1)
    os.replace(tmp, path)


def run_job(client, job, raw_path, state, state_path, watch, since, now=None):
    st = state["jobs"].setdefault(job["id"], {"done": False, "count": 0, "cursor": None})
    if st["done"]:
        return st
    n_pages = 0
    with open(raw_path, "a") as out:
        while st["count"] < job["max"]:
            url = st["cursor"] or build_url(job, min(PAGE, job["max"] - st["count"]))
            items, hdr = client.get(url)
            n_pages += 1
            stop = False
            for raw in items:
                rec = normalize(raw, job["kind"], watch, now)
                if not rec:
                    continue
                if since and (rec.get("created_at") or "") < since and job["sort"] == "createdAt":
                    stop = True
                    break
                if since and job["sort"] != "createdAt" and (rec.get("created_at") or "") < since:
                    continue
                rec["sources"] = [job["id"]]
                out.write(json.dumps(rec, separators=(",", ":")) + "\n")
                st["count"] += 1
            out.flush()
            nxt = parse_next(hdr.get("link"))
            st["cursor"] = nxt
            if stop or not nxt or not items:
                st["done"] = True
                break
            save_state(state_path, state)
    if st["count"] >= job["max"]:
        st["done"] = True
    save_state(state_path, state)
    st["pages"] = n_pages
    return st


def merge_raw(raw_path):
    recs = {}
    with open(raw_path) as f:
        for line in f:
            r = json.loads(line)
            recs[r["key"]] = merge_records(recs[r["key"]], r) if r["key"] in recs else r
    return recs


def link_variants(recs):
    """Set variant_of (a key) when the base repo is present in the candidates."""
    for r in recs.values():
        r["variant_of"] = None
        if r["variant"]:
            for b in r["base_models"]:
                if b["relation"] in VARIANT_RELATIONS:
                    r["variant_of"] = "%s:%s" % (r["kind"], b["id"].lower())
                    break


def summarize(recs, client, jobs_state):
    tiers = collections.Counter(r["tier_hint"] or "none" for r in recs.values())
    kinds = collections.Counter(r["kind"] for r in recs.values())
    rel = collections.Counter(r["relation"] for r in recs.values())
    lic = collections.Counter((r["license"] or (r["license_tags"][0] if r["license_tags"] else "none")) for r in recs.values())
    return {
        "records": len(recs), "kinds": dict(kinds), "tiers": dict(tiers), "relations": dict(rel),
        "variants": sum(1 for r in recs.values() if r["variant"]),
        "watchlist_repos": sum(1 for r in recs.values() if r["watchlist"]),
        "gated": sum(1 for r in recs.values() if r["gated"]),
        "disabled": sum(1 for r in recs.values() if r["disabled"]),
        "no_safe_format_tag": sum(1 for r in recs.values() if not r["has_safe_format_tag"]),
        "not_for_all_audiences": sum(1 for r in recs.values() if r["not_for_all_audiences"]),
        "same_as_groups": sum(1 for r in recs.values() if r.get("canonical")),
        "top_licenses": lic.most_common(8),
        "api_calls": client.calls, "retries": client.retries,
        "jobs": {k: {"count": v["count"], "done": v["done"]} for k, v in jobs_state["jobs"].items()},
    }


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--limit", type=int, default=40000, help="repos per global listing (downloads, likes, trending)")
    ap.add_argument("--org-limit", type=int, default=100, help="newest repos per watch-list org")
    ap.add_argument("--orgs", help="comma list; replaces the watch list for per-org listings")
    ap.add_argument("--kind", choices=["model", "dataset"], action="append", help="repeatable; default model")
    ap.add_argument("--since", help="ISO date; only repos created on/after it")
    ap.add_argument("--sorts", default="downloads,likes,trendingScore")
    ap.add_argument("--siblings", action="store_true", help="also fetch file lists (about 10x the bytes)")
    ap.add_argument("--no-orgs", action="store_true", help="skip per-org listings")
    ap.add_argument("--out", help="output JSONL path (default work/candidates-<date>.jsonl)")
    ap.add_argument("--fresh", action="store_true", help="ignore saved progress and start over")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args(argv)

    with open(WATCHLIST) as f:
        wl = json.load(f)
    watch_all = [o for o in wl["labs"] + wl["quants"]]
    watch = {o.lower() for o in watch_all}
    orgs = [] if a.no_orgs else ([o.strip() for o in a.orgs.split(",") if o.strip()] if a.orgs else watch_all)
    sorts = [s for s in a.sorts.split(",") if s]
    jobs = []
    for kind in (a.kind or ["model"]):
        jobs += plan_jobs(kind, a.limit, orgs, a.org_limit, sorts)
    for j in jobs:
        j["siblings"] = a.siblings
    total = sum(j["pages"] for j in jobs)
    token = os.environ.get("HF_TOKEN") or None

    if a.dry_run:
        print("planned jobs: %d, max API calls: %d (token: %s)" % (len(jobs), total, "yes" if token else "no"))
        for j in jobs:
            print("  %-34s up to %6d repos, %2d call(s)  %s" % (j["id"], j["max"], j["pages"], build_url(j, min(PAGE, j["max"])).split("?")[1][:60]))
        return 0

    os.makedirs(WORK, exist_ok=True)
    today = dt.date.today().isoformat()
    state_path = os.path.join(WORK, "discover-state-%s.json" % today)
    raw_path = os.path.join(WORK, "discover-raw-%s.jsonl" % today)
    out_path = a.out or os.path.join(WORK, "candidates-%s.jsonl" % today)
    if a.fresh:
        for p in (state_path, raw_path):
            if os.path.exists(p):
                os.remove(p)
    state = load_state(state_path)
    client = Client(token)
    for j in jobs:
        try:
            st = run_job(client, j, raw_path, state, state_path, watch, a.since)
        except Exception as e:  # keep progress; rerun resumes
            print("stopped at %s: %s (rerun to resume)" % (j["id"], e), file=sys.stderr)
            return 1
        print("%-34s %6d repos%s" % (j["id"], st["count"], "" if st["done"] else " (partial)"), file=sys.stderr)

    if not os.path.exists(raw_path):
        print("no records")
        return 0
    recs = merge_raw(raw_path)
    link_variants(recs)
    link_same_as(recs)
    with open(out_path, "w") as f:
        for r in sorted(recs.values(), key=lambda r: r["key"]):
            f.write(json.dumps(r, separators=(",", ":")) + "\n")
    summary = summarize(recs, client, state)
    summary["output"] = os.path.relpath(out_path, ROOT)
    print(json.dumps(summary, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
