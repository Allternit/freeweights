#!/usr/bin/env python3
"""Fetch the publisher's README for every hosted model at the commit its manifest pins.

  python3 scripts/readme_fetch.py [--limit N] [--workers 4] [--delay 0.2] [--tiers T0,T1]

For each manifest with a README.md entry: GET https://huggingface.co/<id>/raw/<commit>/README.md, check the
size and sha256 against the manifest entry (a mismatch is skipped, never stored), strip the YAML front matter,
cap the text at CAP bytes and write catalog/overlay/readme/<key>.md. Resumable: files already written and rows
already recorded in readme/_state.json are skipped. Order: tier, then 30-day downloads, so a stopped run has
covered the most visited pages. No token, polite rate, User-Agent freeweights-build. Display data only; the
signed manifest is never changed.
"""
import argparse, hashlib, json, os, re, sys, threading, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "catalog", "overlay", "readme")
STATE = os.path.join(OUT, "_state.json")
CAP = 60 * 1024
UA = "freeweights-build"
TIER = {"T0": 0, "T1": 1, "T2": 2, "variant": 3}
FRONT = re.compile(r"\A﻿?---[ \t]*\r?\n.*?\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|\Z)", re.S)


def strip_front(text):
    return FRONT.sub("", text, count=1).lstrip("\r\n")


def cap(text):
    b = text.encode("utf-8")
    if len(b) <= CAP:
        return text
    cut = b[:CAP].decode("utf-8", "ignore")
    nl = cut.rfind("\n")
    if nl > CAP // 2:
        cut = cut[:nl]
    return cut.rstrip() + "\n\n_The publisher's README is longer; it is cut here. Read the rest at the source._\n"


def key(mid):
    return mid.replace("/", "__")


def fetch(url, tries=4):
    for n in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.status, r.read(8 * 1024 * 1024)
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                time.sleep(min(60, 3 * 2 ** n * (1 + n)))
                continue
            return e.code, b""
        except Exception:
            time.sleep(2 * (n + 1))
    return 0, b""


def jobs():
    rows = {}
    for f in os.listdir(os.path.join(ROOT, "catalog", "rows")):
        r = json.load(open(os.path.join(ROOT, "catalog", "rows", f)))
        rows[r["id"]] = r
    out = []
    for f in os.listdir(os.path.join(ROOT, "manifests")):
        if not f.endswith(".json"):
            continue
        m = json.load(open(os.path.join(ROOT, "manifests", f)))
        ent = next((x for x in m.get("files", []) if x["path"] == "README.md"), None)
        commit = (m.get("upstream") or {}).get("commit")
        if not ent or not commit:
            continue
        r = rows.get(m["id"], {})
        out.append((TIER.get(r.get("tier"), 4), -((r.get("signals") or {}).get("downloads_30d") or 0), m["id"], commit, ent, r.get("tier")))
    out.sort()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--delay", type=float, default=0.2)
    ap.add_argument("--tiers", default="")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    todo = [j for j in jobs() if (not a.tiers or j[5] in a.tiers.split(",")) and not os.path.exists(os.path.join(OUT, key(j[2]) + ".md")) and key(j[2]) not in state]
    if a.limit:
        todo = todo[: a.limit]
    print(f"{len(todo)} to fetch", flush=True)
    lock = threading.Lock(); done = [0]

    def work(j):
        _, _, mid, commit, ent, _t = j
        time.sleep(a.delay)
        st, body = fetch(f"https://huggingface.co/{mid}/raw/{commit}/README.md")
        k = key(mid); res = None
        if st != 200:
            res = f"http-{st}"
        elif len(body) != ent["size"] or hashlib.sha256(body).hexdigest() != ent["sha256"]:
            res = "mismatch"
        else:
            try:
                text = cap(strip_front(body.decode("utf-8")))
            except UnicodeDecodeError:
                res = "not-utf8"
            else:
                if text.strip():
                    with open(os.path.join(OUT, k + ".md"), "w", encoding="utf-8", newline="\n") as f:
                        f.write(text)
                else:
                    res = "empty"
        with lock:
            if res:
                state[k] = res
            done[0] += 1
            if done[0] % 100 == 0:
                json.dump(state, open(STATE, "w"), indent=0, sort_keys=True)
                print(done[0], "done", flush=True)

    with ThreadPoolExecutor(a.workers) as ex:
        list(ex.map(work, todo))
    json.dump(state, open(STATE, "w"), indent=0, sort_keys=True)
    print("finished", done[0], "skipped", len(state), file=sys.stderr)


if __name__ == "__main__":
    main()
