#!/usr/bin/env python3
"""Decide from facts whether a catalog row is abliterated (refusal behavior removed). Stdlib only, no network.

A repo is abliterated when any of these holds:
  name      its own repo name says so: abliterat* (also gabliterated), obliterat*, heretic, lorablat* (LoRA abliteration)
  tag       a Hugging Face tag says so: abliterated, abliteration, obliterated, heretic
  lineage   it is a quant (same weights, other packaging) of a repo that passes name or tag, or of a listed abliterated repo
Never enough on their own: "uncensored", "dolphin", "jailbreak", "unfiltered". Those name fine-tunes and detectors that
leave the refusal mechanism alone, so they stay in their family section.
Detectors and classifiers (pipeline tag or name) never count: a model that detects jailbreaks is not one."""
import re

SECTION = "alt.freeweights.abliterated"
NAME = re.compile(r"abliterat|obliterat|heretic|lorablat", re.I)
TAGS = {"abliterated", "abliteration", "obliterated", "heretic"}
NOT_A_GENERATOR = re.compile(r"classif|detector|moderat|guard|safety|toxic", re.I)
CLASSIFY_TASKS = {"text-classification", "token-classification", "zero-shot-classification", "image-classification"}


def _name(repo): return (repo or "").split("/", 1)[-1]


def by_name(repo): return bool(NAME.search(_name(repo)))


def by_tag(tags): return bool(TAGS & {str(t).lower() for t in tags or ()})


def excluded(repo, pipeline_tag=None):
    return pipeline_tag in CLASSIFY_TASKS or bool(NOT_A_GENERATOR.search(_name(repo)))


def direct(repo, tags=(), pipeline_tag=None):
    """Abliterated by its own name or tags."""
    return not excluded(repo, pipeline_tag) and (by_name(repo) or by_tag(tags))


def detect(rows):
    """rows: iterable of dicts {repo, tags, pipeline_tag, parent, relation_type}. Returns {repo: reason} for abliterated rows.
    reason is 'name', 'tag' or 'lineage'."""
    rows = list(rows)
    out = {}
    for r in rows:
        if excluded(r["repo"], r.get("pipeline_tag")): continue
        if by_name(r["repo"]): out[r["repo"]] = "name"
        elif by_tag(r.get("tags")): out[r["repo"]] = "tag"
    changed = True
    while changed:
        changed = False
        for r in rows:
            p = r.get("parent")
            if r["repo"] in out or r.get("relation_type") != "quant" or not p or excluded(r["repo"], r.get("pipeline_tag")): continue
            if by_name(p) or p in out:
                out[r["repo"]] = "lineage"; changed = True
    return out


def what_changed(repo, reason, parent):
    """A factual line for a row with no hand-written text. It claims only what the name, tag or lineage shows."""
    if reason == "lineage":
        return (f"A repackaged copy (same weights, other format) of {parent}, which is abliterated: its refusal behavior was removed by its uploader. "
                "Read the model card at the source for the method.")
    how = "named abliterated" if by_name(repo) else "tagged abliterated"
    base = f" from {parent}" if parent else ""
    return (f"The uploader's repo is {how}: refusal behavior was removed{base} by the uploader. "
            "Read the model card at the source for the method and the layers touched.")
