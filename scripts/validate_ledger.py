#!/usr/bin/env python3
"""Validate ledger/*.csv, ledger/goals.json, mirrors/registry.json and mirrors/partners.json shapes."""
import csv
import glob
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HEADER = ["date", "direction", "type", "vendor_or_source", "item", "amount_usd", "invoice_or_ref", "notes"]
IN_TYPES = {"support", "sponsor", "allternit_share", "credit", "in_kind"}
OUT_TYPES = {"hosting", "storage", "email", "code", "other"}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
AMOUNT_RE = re.compile(r"^\d+(\.\d{1,2})?$")
REGISTRY_FIELDS = ["id", "host_name", "url", "region", "capacity_tb", "since", "contact", "logo_url", "sync_method", "models_served"]
GOAL_FIELDS = ["id", "stage", "name", "unlocks", "amount_usd_min", "amount_usd_max", "raised_usd"]


def err(errors, where, msg):
    errors.append(f"{where}: {msg}")


def check_csv(path, errors):
    rel = os.path.relpath(path, ROOT)
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.reader(fh))
    if not rows:
        return err(errors, rel, "file is empty")
    if rows[0] != HEADER:
        err(errors, rel, f"header must be {','.join(HEADER)}")
    for n, row in enumerate(rows[1:], start=2):
        where = f"{rel}:{n}"
        if len(row) != len(HEADER):
            err(errors, where, f"expected {len(HEADER)} columns, got {len(row)}")
            continue
        rec = dict(zip(HEADER, row))
        if not DATE_RE.match(rec["date"]):
            err(errors, where, "date must be YYYY-MM-DD")
        if rec["direction"] not in ("in", "out"):
            err(errors, where, "direction must be in or out")
        allowed = IN_TYPES if rec["direction"] == "in" else OUT_TYPES
        if rec["type"] not in allowed:
            err(errors, where, f"type '{rec['type']}' not allowed for direction {rec['direction']}")
        if not rec["vendor_or_source"].strip():
            err(errors, where, "vendor_or_source is required")
        if not rec["item"].strip():
            err(errors, where, "item is required")
        if not AMOUNT_RE.match(rec["amount_usd"]):
            err(errors, where, "amount_usd must be a non-negative decimal with at most 2 places")


def load_json(path, errors):
    rel = os.path.relpath(path, ROOT)
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, json.JSONDecodeError) as exc:
        err(errors, rel, f"invalid JSON: {exc}")
        return None


def check_goals(path, errors):
    data = load_json(path, errors)
    if data is None:
        return
    rel = os.path.relpath(path, ROOT)
    goals = data.get("goals") if isinstance(data, dict) else None
    if not isinstance(goals, list) or not goals:
        return err(errors, rel, "goals must be a non-empty list")
    for g in goals:
        gid = g.get("id", "?") if isinstance(g, dict) else "?"
        if not isinstance(g, dict):
            err(errors, rel, "each goal must be an object")
            continue
        for f in GOAL_FIELDS:
            if f not in g:
                err(errors, rel, f"goal {gid} missing {f}")
        if all(f in g for f in ("amount_usd_min", "amount_usd_max")):
            if not (isinstance(g["amount_usd_min"], (int, float)) and isinstance(g["amount_usd_max"], (int, float))):
                err(errors, rel, f"goal {gid} amounts must be numbers")
            elif g["amount_usd_min"] > g["amount_usd_max"]:
                err(errors, rel, f"goal {gid} min exceeds max")
        if "raised_usd" in g and not (isinstance(g["raised_usd"], (int, float)) and g["raised_usd"] >= 0):
            err(errors, rel, f"goal {gid} raised_usd must be a number >= 0")


def check_registry(path, errors):
    data = load_json(path, errors)
    if data is None:
        return
    rel = os.path.relpath(path, ROOT)
    mirrors = data.get("mirrors") if isinstance(data, dict) else None
    if not isinstance(mirrors, list):
        return err(errors, rel, "mirrors must be a list")
    for m in mirrors:
        if not isinstance(m, dict):
            err(errors, rel, "each mirror must be an object")
            continue
        for f in REGISTRY_FIELDS:
            if f not in m:
                err(errors, rel, f"mirror {m.get('id', '?')} missing {f}")
        if "models_served" in m and not isinstance(m["models_served"], list):
            err(errors, rel, f"mirror {m.get('id', '?')} models_served must be a list")


def check_partners(path, errors):
    data = load_json(path, errors)
    if data is None:
        return
    rel = os.path.relpath(path, ROOT)
    partners = data.get("partners") if isinstance(data, dict) else None
    if not isinstance(partners, list):
        return err(errors, rel, "partners must be a list")
    for p in partners:
        if not isinstance(p, dict) or not p.get("name"):
            err(errors, rel, "each partner needs a name")
            continue
        if p.get("status") not in ("candidate", "contacted", "partner"):
            err(errors, rel, f"partner {p['name']} has invalid status")
        if p.get("status") == "candidate" and p.get("contacted") is True:
            err(errors, rel, f"partner {p['name']} is a candidate but marked contacted")


def main():
    errors = []
    csvs = sorted(glob.glob(os.path.join(ROOT, "ledger", "*.csv")))
    if not csvs:
        err(errors, "ledger", "no CSV files found")
    for path in csvs:
        check_csv(path, errors)
    check_goals(os.path.join(ROOT, "ledger", "goals.json"), errors)
    check_registry(os.path.join(ROOT, "mirrors", "registry.json"), errors)
    check_partners(os.path.join(ROOT, "mirrors", "partners.json"), errors)
    if errors:
        print("\n".join(errors))
        print(f"FAIL: {len(errors)} problem(s)")
        return 1
    print(f"OK: {len(csvs)} ledger file(s), goals, registry and partners validated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
