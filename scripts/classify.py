#!/usr/bin/env python3
"""Classify candidate repos with no network: gates, license verdict along the lineage, tier.

  classify.py candidates.jsonl [--out verdicts.jsonl] [--queue review-queue.json] [--catalog catalog/catalog.json]
                               [--reviewed catalog/_audit/licenses.csv] [--now 2026-11-14T00:00:00Z]

Input: one Hugging Face model info record per line: id, tags, cardData (license, license_name,
base_model), downloads (last 30 days), likes, siblings [{rfilename, size}], optional createdAt,
kind (model|dataset), license_text_sha256 (sha256 of the LICENSE file, when the discovery step read
it), trending_runs, benchmark, content_reviewed.

Output: one line per candidate with verdict (permissive | custom | gated | territory | non-commercial |
unreviewed | refused | queue | out), hosted (true: signed manifest) and link_reason (gated | territory |
non-commercial | not-reviewed for a link-only row),
the gate that decided, audit {method, at} where method is tag | text-hash | inherited | reviewed | queue,
relation {type, parent}, tier and signals. Gates run in order: format, license, content, hygiene.
The strictest license verdict along base model -> fine-tune -> quantization wins, so a quantization of
a refused base model is refused whatever its own tag says. A license no person has read (held ids, unknown
text hashes, a base model with no license) is listed as a link only with "License not reviewed"; its
queue_key still groups it by the sha256 of the text so one later read clears the cluster. A repo Hugging Face
marks gated is link only as gated. Only the content gate still holds a repo for a person (verdict queue).
Stdlib only."""
import argparse, csv, datetime, hashlib, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import formats, inclusion, licenses  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RELATIONS = ("base", "finetune", "quant", "adapter", "merge")
# Hugging Face lineage tags: base_model:<type>:<parent id>; a bare base_model:<id> is a fine-tune.
TAG_RELATION = {"quantized": "quant", "finetune": "finetune", "adapter": "adapter", "merge": "merge"}
LISTED = tuple(sorted(licenses.LISTED))

def _ids(x):
    if isinstance(x, str): return [x] if "/" in x else []
    if isinstance(x, list): return [i for v in x for i in _ids(v)]
    return []

def relation_of(rec):
    """{"type": base|finetune|quant|adapter|merge, "parent": id or None, "parents": [ids]}."""
    tags = [str(t) for t in rec.get("tags") or []]
    found = {}
    for t in tags:
        if not t.startswith("base_model:"): continue
        rest = t[len("base_model:"):]
        kind, _, pid = rest.partition(":")
        if kind in TAG_RELATION and "/" in pid: found.setdefault(TAG_RELATION[kind], []).append(pid)
        elif "/" in rest and ":" not in rest: found.setdefault("finetune", []).append(rest)
    card = _ids((rec.get("cardData") or {}).get("base_model"))
    for typ in ("merge", "adapter", "quant", "finetune"):
        if found.get(typ):
            parents = list(dict.fromkeys(found[typ] + [c for c in card if c not in found[typ]] if typ == "merge" else found[typ]))
            return {"type": typ, "parent": parents[0], "parents": parents}
    if card:
        return {"type": "merge" if len(card) > 1 else "finetune", "parent": card[0], "parents": card}
    return {"type": "base", "parent": None, "parents": []}

def license_tag(rec):
    card = rec.get("cardData") or {}
    lic = card.get("license")
    if isinstance(lic, list): lic = lic[0] if lic else None
    if lic: return str(lic)
    for t in rec.get("tags") or []:
        if str(t).startswith("license:"): return str(t)[len("license:"):]
    return ""

def load_reviewed(path):
    """Repo decisions a person made (catalog/_audit/licenses.csv): {repo: verdict}."""
    out = {}
    try: rows = list(csv.DictReader(open(path, encoding="utf-8")))
    except OSError: return out
    for c in rows:
        red, lid = c.get("redistribution", ""), c.get("license_id", "")
        if red == "unclear": v = "queue"
        elif red == "no": v = licenses.verdict(lid) if licenses.verdict(lid) in ("non-commercial", "refused", "custom") else "non-commercial"
        else: v = licenses.verdict(lid)
        if v == "queue": v = "unreviewed"
        out[c["repo"]] = {"verdict": v, "license_id": lid}
    return out

def load_catalog(path):
    """Already-listed rows act as known parents: {id: verdict}."""
    try: rows = json.load(open(path, encoding="utf-8")).get("models", [])
    except (OSError, ValueError): return {}
    out = {}
    for r in rows:
        lc = r.get("license_class")
        # a row gated only by Hugging Face's flag does not pass "gated" to its children: their files are open
        out[r["id"]] = lc if lc in ("non-commercial", "territory", "unreviewed", "permissive", "custom") else "custom" if lc == "gated" else licenses.verdict(r.get("license_id"))
    return out

class Classifier:
    def __init__(self, records, reviewed=None, catalog=None, watch=None, now=None):
        self.recs = {r["id"]: r for r in records}
        self.reviewed = reviewed or {}
        self.catalog = catalog or {}
        self.watch = watch
        self.now = now or datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        self._own, self._lineage = {}, {}

    def own_license(self, rid):
        """Verdict from the repo's own license alone: (verdict, method, queue_key, license_id, reason)."""
        if rid in self._own: return self._own[rid]
        rec = self.recs.get(rid)
        if rec is not None and rec.get("missing"):  # an ancestor discovery could not read (deleted or private)
            rec = None
        if rec is None:
            v = self.catalog.get(rid)
            res = (v, "reviewed", None, None, "listed in the catalog") if v else ("unreviewed", "queue", f"parent:{rid}", None, f"base model {rid} is not classified yet")
        elif rid in self.reviewed:
            r = self.reviewed[rid]
            res = (r["verdict"], "reviewed" if r["verdict"] != "unreviewed" else "queue", f"repo:{rid}" if r["verdict"] == "unreviewed" else None, r["license_id"], "recorded audit")
        else:
            tag = license_tag(rec)
            sha = rec.get("license_text_sha256") or (hashlib.sha256(rec["license_text"].encode()).hexdigest() if rec.get("license_text") else None)
            v, why = licenses.tag_verdict(tag)
            if v != "queue": res = (v, "tag", None, tag, why)
            else:
                hit = licenses.text_verdict(sha) if sha else None
                lname = (rec.get("cardData") or {}).get("license_name") or rec.get("license_name")
                # a declared license_name (tag "other"), or an unknown tag that is itself a known name
                byname = (licenses.name_verdict(lname) if licenses.norm(tag) in ("other", "") else None) or licenses.name_verdict(tag)
                if hit: res = (hit[0], "text-hash", None, hit[1], "license text matches one a person read")
                elif byname: res = (byname[0], "tag", None, byname[1], byname[2])
                else:
                    if sha: key = f"text:{sha}"
                    elif licenses.norm(tag) == "other" and lname: key = f"name:{lname}"  # no text found: group by the declared name
                    elif licenses.norm(tag) in licenses.HELD: key = f"held:{licenses.norm(tag)}"
                    else: key = f"name:{lname or licenses.norm(tag) or 'none'}"
                    res = ("unreviewed", "queue", key, tag, why)
        self._own[rid] = res
        return res

    def lineage_license(self, rid, seen=()):
        """Strictest verdict over the repo and every ancestor: (verdict, method, queue_key, governing id, reason)."""
        if rid in self._lineage: return self._lineage[rid]
        own = self.own_license(rid)
        best, src = own, rid
        rec = self.recs.get(rid)
        rel = relation_of(rec) if rec is not None else None
        # A quantization carries its base model's license (a quantizer cannot relicense the weights).
        # With no license tag of its own it takes the base's verdict instead of "no license".
        bare_quant = rec is not None and rel["type"] == "quant" and rel["parents"] and not license_tag(rec) and rid not in self.reviewed
        if bare_quant:
            pid = rel["parents"][0]
            best, src = (self.lineage_license(pid, seen + (rid,)), pid) if pid != rid and pid not in seen else (own, rid)
            if best[0] == "refused" and best[4] == licenses.NO_LICENSE["note"]:
                best = ("unreviewed", "queue", f"parent-unlicensed:{pid}", pid, f"base model {pid} declares no license")
        if rec is not None and rid not in seen:
            for pid in rel["parents"]:
                if pid == rid or pid in seen: continue
                pv = self.lineage_license(pid, seen + (rid,))
                if pv[0] == "refused" and pv[4] == licenses.NO_LICENSE["note"]:
                    # an ancestor with no declared license is unknown, not refused: a person decides
                    pv = ("unreviewed", "queue", f"parent-unlicensed:{pid}", pid, f"base model {pid} declares no license")
                if licenses.stricter(pv[0], best[0]) == pv[0] and pv[0] != best[0]:
                    best, src = pv, pid
        if src != rid:
            v, _, key, _, reason = best
            res = (v, "queue" if best[1] == "queue" else "inherited", key, src, f"inherited from {src}: {reason}")
        else:
            res = own[:3] + (rid,) + own[4:]
        self._lineage[rid] = res
        return res

    def classify(self, rid):
        rec = self.recs[rid]
        kind = rec.get("kind") or "model"
        rel = relation_of(rec)
        out = {"id": rid, "kind": kind, "relation": {"type": rel["type"], "parent": rel["parent"]},
               "license_id": license_tag(rec) or None, "gate": None, "reasons": [],
               "signals": {"downloads_30d": rec.get("downloads"), "likes": rec.get("likes"), "trending": rec.get("trending_rank")}}
        def done(verdict, gate, method, reason, key=None):
            out.update(verdict=verdict, gate=gate, audit={"method": method, "at": self.now})
            if reason: out["reasons"].append(reason)
            if key: out["queue_key"] = key
            out["tier"] = inclusion.tier(rec, rel["type"], method, self.watch) if verdict in LISTED else None
            out["listable"] = verdict in LISTED and out["tier"] is not None
            out["hosted"] = licenses.hosted(verdict)
            out["link_reason"] = licenses.link_reason(verdict)
            if verdict in LISTED and out["tier"] is None: out["reasons"].append("below every tier threshold")
            return out
        # the license verdict is worked out first so every result carries its audit method
        v, method, key, gov, reason = self.lineage_license(rid)
        if gov and gov != rid: out["license_governed_by"] = gov
        # the license id the verdict rests on (for text-hash, the id a person gave that text)
        out["verdict_license_id"] = self.own_license(gov)[3] if gov in self.recs or gov in self.reviewed else out["license_id"]
        # 1 format (names only here; the build step range-reads one file per format for the header check)
        if kind == "model":
            paths = [s.get("rfilename", "") for s in rec.get("siblings") or []]
            fm, why = formats.decide(paths)
            if not fm: return done("refused", "format", method, why)
            out["formats"] = fm
            out["header_check"] = "pending"
        # 2 license, strictest along the lineage
        if v in ("refused", "queue"): return done(v, "license", method, reason, key)
        # a repo behind an acceptance gate at the source is link only, whatever its license says
        if licenses.hosted(v) and rec.get("gated") not in (None, False, "", "false"):
            v, reason = "gated", "gated at the source (Hugging Face asks you to accept terms first)"
        # 3 content
        c, why = inclusion.content_gate(rec)
        if c == "refused": return done("refused", "content", method, why)
        if c == "out": return done("out", "content", method, why)
        if c == "queue": return done("queue", "content", "queue", why, f"content:{rid}")
        # 4 hygiene
        h, why = inclusion.hygiene_gate(rec)
        if h != "pass": return done("refused", "hygiene", method, why)
        return done(v, None, method, reason if method != "tag" else "license as declared by the publisher", key)

    def run(self):
        results = [self.classify(rid) for rid in self.recs]
        queue = {}
        for r in results:
            # texts no person has read yet (listed as link only) and content holds (not listed), grouped for one read
            if r["verdict"] in ("queue", "unreviewed"):
                q = queue.setdefault(r.get("queue_key") or f"repo:{r['id']}", {"key": r.get("queue_key"), "reason": r["reasons"][-1] if r["reasons"] else "", "repos": [], "downloads_30d": 0,
                                                                              "held": r["verdict"] == "queue"})
                q["repos"].append(r["id"]); q["downloads_30d"] += int(r["signals"].get("downloads_30d") or 0)
        # biggest clusters first: one read clears the most downloads
        return results, sorted(queue.values(), key=lambda q: (-q["downloads_30d"], -len(q["repos"]), q["key"] or ""))

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("candidates"); ap.add_argument("--out"); ap.add_argument("--queue")
    ap.add_argument("--catalog", default=os.path.join(ROOT, "catalog", "catalog.json"))
    ap.add_argument("--reviewed", default=os.path.join(ROOT, "catalog", "_audit", "licenses.csv"))
    ap.add_argument("--now")
    a = ap.parse_args(argv)
    recs = [json.loads(l) for l in open(a.candidates, encoding="utf-8") if l.strip()]
    c = Classifier(recs, load_reviewed(a.reviewed), load_catalog(a.catalog), now=a.now)
    results, queue = c.run()
    out = open(a.out, "w", encoding="utf-8") if a.out else sys.stdout
    for r in results: out.write(json.dumps(r, sort_keys=True, ensure_ascii=False) + "\n")
    if a.out: out.close()
    if a.queue: json.dump(queue, open(a.queue, "w", encoding="utf-8"), indent=2, sort_keys=True)
    tally = {}
    for r in results: tally[r["verdict"]] = tally.get(r["verdict"], 0) + 1
    print("classified", len(results), json.dumps(tally, sort_keys=True), "queue clusters", len(queue), file=sys.stderr)
    return 0

if __name__ == "__main__": sys.exit(main())
