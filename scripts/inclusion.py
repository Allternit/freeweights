#!/usr/bin/env python3
"""Freeweights inclusion policy as code: the gates, in order, and the tiers.
policy/inclusion-policy.md is the public text of the same rules; keep the two in step.
Other scripts import these constants (classify.py, discover and build steps). Stdlib only, no network."""
import datetime, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------- gates, applied in this order; the first gate that fails decides ----------
GATES = ("format", "license", "content", "hygiene")

# Content gate. Refused outright: a model made for sexual content (never listed, not later either).
# Matched on the repo id and tags as whole words. Abliterated models are allowed: they are labeled
# with what changed.
SEXUAL_PURPOSE = re.compile(r"(?<![a-z0-9])(nsfw|porn\w*|hentai|erotic\w*|lewd|nude|nudity|sexual|sex|xxx|r18|18\+|onlyfans|futanari)(?![a-z0-9])", re.I)
# Out by default: Hugging Face's own adult flag. Listed only after a person reviews it.
ADULT_TAG = "not-for-all-audiences"
# A person decides: real-person likeness, voice cloning of a named person, fraud and attack tools.
NEEDS_PERSON = re.compile(r"(?<![a-z0-9])(deepfake|face-?swap|faceswap|voice-?clone|undress|nudify|phishing|malware|keylogger|ransomware)(?![a-z0-9])", re.I)
ABLITERATED = re.compile(r"abliterat", re.I)

# Hygiene gate.
MIN_CARD_BYTES = 500                                    # model card (README.md) must be over this
CI_FIXTURE = re.compile(r"(^|/)(tiny-random|tiny-testing|dummy|test-?model|random-?init)|^(hf-internal-testing|trl-internal-testing|optimum-internal-testing|peft-internal-testing)/", re.I)
# Exact re-uploads (same weight sha256s as a listed repo) become same_as of the first copy; the
# lab's own copy wins. Decided at dedup time from manifests, not here.
SAME_AS_RULE = "weight sha256 set equal to a listed repo"

# ---------- tiers ----------
WATCH_LIST_FILE = os.path.join(ROOT, "catalog", "watchlist.json")   # {"labs": [...], "quants": [...]}; written for discover.py, shared here
T0_RECENT_MONTHS = 36
T0_MIN_DOWNLOADS_30D = 1_000
T0_MIN_LIKES = 100
T1_MIN_DOWNLOADS_30D = 10_000
T1_MIN_LIKES = 200
T1_TRENDING_TOP = 1_000
T1_TRENDING_RUNS = 2                                    # in the top 1,000 on two discovery runs
T2_MIN_DOWNLOADS_30D = 1_000
BENCHMARK_TOP = 50                                      # top 50 of a named public leaderboard
TIERS = ("T0", "T1", "T2", "variant", "benchmark")
VARIANT_RELATIONS = ("quant", "adapter")                 # attach to the base as a Variants row, not a card
RULE_METHODS = ("tag", "text-hash", "inherited", "reviewed")  # a "rule-based license verdict" for T2
# Popularity never delists: once listed, an entry stays when its numbers drop.

def watch_list():
    """T0 lab orgs. Trusted quant orgs ("quants") are not T0: their repos are variants of a base."""
    try: return {o.lower() for o in json.load(open(WATCH_LIST_FILE, encoding="utf-8")).get("labs", [])}
    except (OSError, ValueError): return set()

def _months_since(iso, now):
    try: d = datetime.datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
    except ValueError: return None
    if d.tzinfo is None: d = d.replace(tzinfo=datetime.timezone.utc)
    return (now - d).days / 30.44

def tier(rec, relation="base", method=None, watch=None, now=None):
    """Tier for one candidate, or None when it is below every bar.
    rec: HF model info (downloads = last 30 days, likes, createdAt, trending_runs, trending_rank, benchmark)."""
    now = now or datetime.datetime.now(datetime.timezone.utc)
    watch = watch_list() if watch is None else watch
    dl, likes = int(rec.get("downloads") or 0), int(rec.get("likes") or 0)
    b = rec.get("benchmark") or {}
    if b.get("source") and b.get("date") and isinstance(b.get("rank"), int) and b["rank"] <= BENCHMARK_TOP: return "benchmark"
    if relation in VARIANT_RELATIONS: return "variant"
    org = str(rec.get("id", "")).split("/")[0].lower()
    age = _months_since(rec.get("createdAt"), now) if rec.get("createdAt") else None
    if org in watch and ((age is not None and age <= T0_RECENT_MONTHS) or dl >= T0_MIN_DOWNLOADS_30D or likes >= T0_MIN_LIKES): return "T0"
    trending = int(rec.get("trending_runs") or 0) >= T1_TRENDING_RUNS
    if dl >= T1_MIN_DOWNLOADS_30D or likes >= T1_MIN_LIKES or trending: return "T1"
    if dl >= T2_MIN_DOWNLOADS_30D and method in RULE_METHODS: return "T2"
    return None

def content_gate(rec, decisions=None):
    """(result, reason): result is pass | refused | out | queue.

    decisions is catalog/_review/content-decisions.json: {repo: {"decision": "list" | "refuse", "why": ...}}.
    A person's decision clears or refuses a NEEDS_PERSON match. It never overrides the sexual-content refusal."""
    text = " ".join([str(rec.get("id", ""))] + [str(t) for t in rec.get("tags") or []])
    tags = {str(t).lower() for t in rec.get("tags") or []}
    m = SEXUAL_PURPOSE.search(text.replace("_", "-"))
    if m: return "refused", f"made for sexual content ({m.group(0)!r} in the name or tags)"
    m = NEEDS_PERSON.search(text.replace("_", "-"))
    if m:
        d = (decisions or {}).get(rec.get("id"))
        if isinstance(d, dict) and d.get("decision") == "list":
            return "pass", "a person reviewed it (content-decisions.json)"
        if isinstance(d, dict) and d.get("decision") == "refuse":
            return "refused", f"a person refused it (content-decisions.json): {d.get('why') or m.group(0)}"
        return "queue", f"a person decides ({m.group(0)!r}: real-person likeness, voice clone, fraud or attack tool)"
    if ADULT_TAG in tags:
        if rec.get("content_reviewed"): return "pass", "not-for-all-audiences, reviewed by a person"
        return "out", "tagged not-for-all-audiences: out unless a person reviews it"
    return "pass", None

def card_bytes(rec):
    """README.md size from the siblings listing, or None when it is not known."""
    if rec.get("card_bytes") is not None: return int(rec["card_bytes"])
    for s in rec.get("siblings") or []:
        if str(s.get("rfilename", "")).lower() == "readme.md":
            size = s.get("size") if s.get("size") is not None else (s.get("lfs") or {}).get("size")
            return int(size) if size is not None else None
    return None

def hygiene_gate(rec):
    """(result, reason): pass | refused."""
    if CI_FIXTURE.search(str(rec.get("id", ""))): return "refused", "CI or test fixture, not a model"
    n = card_bytes(rec)
    if n is not None and n <= MIN_CARD_BYTES: return "refused", f"model card is {n} bytes (needs more than {MIN_CARD_BYTES})"
    if n is None and rec.get("siblings") and not any(str(s.get("rfilename", "")).lower() == "readme.md" for s in rec["siblings"]):
        return "refused", "no model card"
    return "pass", None
