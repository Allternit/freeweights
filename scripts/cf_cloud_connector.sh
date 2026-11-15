#!/usr/bin/env bash
# Serve manifests and model/tool detail pages from the R2 bucket through Cloudflare Cloud Connector, with no Worker
# request. The Worker stays deployed as the fallback: --rollback puts the paths back on it.
#
#   scripts/cf_cloud_connector.sh                 # DRY RUN (default): print every API call and rule body; no network
#   scripts/cf_cloud_connector.sh --apply         # create/update the rules, then switch the Worker routes off
#   scripts/cf_cloud_connector.sh --rollback      # DRY RUN of the rollback
#   scripts/cf_cloud_connector.sh --rollback --apply
#   options: --rules-only (leave the Worker routes alone)  --format json (print the plan as JSON; for tests)
#
# Rules on the zone (every ruleset rule carries a `ref` starting fw_cc_, the connector rule a description starting
# "freeweights-cc:", so --rollback removes exactly these and nothing else):
#   fw_cc_index_rewrite  URL rewrite   /<alt.freeweights.*>/<org>/<repo>/ -> .../index.html (the R2 key)
#   fw_cc_bare_301       redirect      /<alt.freeweights.*>/<org>/<repo> -> .../<repo>/ (301, query string kept)
#   fw_cc_page_headers   resp headers  CSP + security headers from site/lib/csp.mjs, CORS, on detail pages
#   fw_cc_manifest_headers resp headers CORS + nosniff on /manifests/*
#   fw_cc_cache          cache rule    eligible for cache, edge and browser TTL 5 minutes (same as the Worker)
#   Cloud Connector      provider cloudflare_r2 -> FW_R2_HOST for /manifests/* and the detail-page index.html keys
# Section list pages (/<section>/page/<n>/) and deeper paths are excluded, so they keep going to Pages.
# Order on --apply: rewrite, redirect, headers, cache, connector, then cf_static_routes.sh --connector-on.
# Order on --rollback: cf_static_routes.sh --connector-off first (the Worker takes the paths back), then the rules.
#
# Environment (never committed): CF_API_TOKEN (zone token: Cloud Connector, Transform Rules, Single Redirects,
# Cache Rules, Workers Routes; edit), CF_ZONE_ID (allternit.com). FW_HOST (default freeweights.allternit.com).
# FW_R2_HOST: the bucket's public custom domain in the same zone, proxied (r2.dev is not supported by the
# connector); default freeweights-r2.allternit.com.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
HEADERS_JSON="$(node --input-type=module -e "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(m.SECURITY_HEADERS))" "$ROOT/site/lib/csp.mjs")"
export HEADERS_JSON
APPLY=0; ROLLBACK=0; RULES_ONLY=0
for a in "$@"; do
  case "$a" in
    --apply) APPLY=1 ;; --rollback) ROLLBACK=1 ;; --rules-only) RULES_ONLY=1 ;; --format) ;; json) ;;
    -h|--help) sed -n '2,26p' "$0"; exit 0 ;;
    *) echo "cf_cloud_connector: unknown option $a" >&2; exit 2 ;;
  esac
done
if [ "$APPLY" = 1 ] && { [ -z "${CF_API_TOKEN:-}" ] || [ -z "${CF_ZONE_ID:-}" ]; }; then
  echo "cf_cloud_connector: --apply needs CF_API_TOKEN and CF_ZONE_ID in the environment" >&2; exit 2
fi
routes() { # the Worker-route switch, same mode (dry run unless --apply)
  [ "$RULES_ONLY" = 1 ] && return 0
  local args=("$1"); [ "$APPLY" = 1 ] && args+=(--apply)
  echo "== Worker routes: scripts/cf_static_routes.sh ${args[*]}"
  bash "$HERE/cf_static_routes.sh" "${args[@]}"
}
[ "$ROLLBACK" = 1 ] && routes --connector-off
python3 - "$@" <<'PY'
import json, os, sys, urllib.error, urllib.request

args = sys.argv[1:]
APPLY, ROLLBACK, AS_JSON = "--apply" in args, "--rollback" in args, "json" in args
API = "https://api.cloudflare.com/client/v4"
ZONE = os.environ.get("CF_ZONE_ID") or "$CF_ZONE_ID"
HOST = os.environ.get("FW_HOST") or "freeweights.allternit.com"
R2_HOST = os.environ.get("FW_R2_HOST") or "freeweights-r2.allternit.com"
SECURITY = json.loads(os.environ["HEADERS_JSON"])
CORS = {"access-control-allow-origin": "*", "access-control-expose-headers": "Link, ETag, X-Repo-Commit, X-Total-Count"}  # worker/src/http.ts CORS
CC_MARK = "freeweights-cc:"

P = "http.request.uri.path"
host = f'http.host eq "{HOST}"'
not_list = f'not {P} strict wildcard "/alt.freeweights.*/page/*" and not {P} strict wildcard "/alt.freeweights.*/*/*/*/*"'
slash = f'{P} strict wildcard "/alt.freeweights.*/*/*/"'
index = f'{P} strict wildcard "/alt.freeweights.*/*/*/index.html"'
bare = f'{P} strict wildcard "/alt.freeweights.*/*/*" and not {P} strict wildcard "/alt.freeweights.*/*/*/*" and not {P} strict wildcard "/alt.freeweights.*/page/*"'
manifests = f'starts_with({P}, "/manifests/")'
detail = f"({slash} or {index}) and {not_list}"
hdr = lambda d: {k: {"operation": "set", "value": v} for k, v in d.items()}

RULES = [  # (phase, rule) in apply order
    ("http_request_transform", {"ref": "fw_cc_index_rewrite", "description": "Freeweights: detail page URL -> R2 key index.html",
        "expression": f"({host} and {slash} and {not_list})", "action": "rewrite",
        "action_parameters": {"uri": {"path": {"expression": f'concat({P}, "index.html")'}}}}),
    ("http_request_dynamic_redirect", {"ref": "fw_cc_bare_301", "description": "Freeweights: bare detail URL -> trailing slash",
        "expression": f"({host} and {bare})", "action": "redirect",
        "action_parameters": {"from_value": {"status_code": 301, "target_url": {"expression": f'concat({P}, "/")'}, "preserve_query_string": True}}}),
    ("http_response_headers_transform", {"ref": "fw_cc_page_headers", "description": "Freeweights: CSP and security headers on detail pages (site/lib/csp.mjs)",
        "expression": f"({host} and {detail})", "action": "rewrite",
        "action_parameters": {"headers": hdr({**SECURITY, **CORS})}}),
    ("http_response_headers_transform", {"ref": "fw_cc_manifest_headers", "description": "Freeweights: CORS on manifests",
        "expression": f"({host} and {manifests})", "action": "rewrite",
        "action_parameters": {"headers": hdr({**CORS, "x-content-type-options": SECURITY["x-content-type-options"]})}}),
    ("http_request_cache_settings", {"ref": "fw_cc_cache", "description": "Freeweights: cache R2 static paths 5 minutes",
        "expression": f"({host} and ({manifests} or ({detail})))", "action": "set_cache_settings",
        "action_parameters": {"cache": True, "edge_ttl": {"mode": "override_origin", "default": 300}, "browser_ttl": {"mode": "override_origin", "default": 300}}}),
]
CONNECTOR = {"description": f"{CC_MARK} manifests and detail pages from R2 bucket freeweights", "enabled": True,
             "expression": f"({host} and ({manifests} or ({index} and {not_list})))", "provider": "cloudflare_r2",
             "parameters": {"host": R2_HOST}}
for _, r in RULES: r["enabled"] = True

plan = []  # what is (or would be) sent, in order
def step(method, path, body=None, note=""): plan.append({"method": method, "url": API + path, "body": body, "note": note})

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + os.environ["CF_API_TOKEN"], "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")

def ok(status, d, what):
    if status >= 300 or not d.get("success", True): sys.exit(f"cf_cloud_connector: {what} failed: HTTP {status} {d.get('errors')}")
    return d

def entry(phase):
    """Live: the phase entrypoint ruleset (or None). Dry run: a placeholder."""
    if not APPLY: return {"id": "{ruleset_id:" + phase + "}", "rules": []}
    s, d = call("GET", f"/zones/{ZONE}/rulesets/phases/{phase}/entrypoint")
    return None if s == 404 else ok(s, d, f"read {phase}")["result"]

def put_rule(phase, rule):
    path = f"/zones/{ZONE}/rulesets/phases/{phase}/entrypoint"
    step("GET", path, note=f"read the {phase} entrypoint ruleset")
    rs = entry(phase)
    if rs is None:
        step("PUT", path, {"rules": [rule]}, note=f"{rule['ref']}: create the entrypoint with this rule (phase had none)")
        if APPLY: ok(*call("PUT", path, {"rules": [rule]}), rule["ref"])
        return
    old = next((r for r in rs.get("rules") or [] if r.get("ref") == rule["ref"]), None)
    if old:
        step("PATCH", f"/zones/{ZONE}/rulesets/{rs['id']}/rules/{old['id']}", rule, note=f"{rule['ref']}: update in place")
        if APPLY: ok(*call("PATCH", f"/zones/{ZONE}/rulesets/{rs['id']}/rules/{old['id']}", rule), rule["ref"])
    else:
        step("POST", f"/zones/{ZONE}/rulesets/{rs['id']}/rules", rule,
             note=f"{rule['ref']}: add" + ("" if APPLY else " (PATCH .../rules/{rule_id} instead if a rule with this ref exists)"))
        if APPLY: ok(*call("POST", f"/zones/{ZONE}/rulesets/{rs['id']}/rules", rule), rule["ref"])

def drop_rule(phase, ref):
    path = f"/zones/{ZONE}/rulesets/phases/{phase}/entrypoint"
    step("GET", path, note=f"read the {phase} entrypoint ruleset")
    rs = entry(phase)
    if rs is None: return
    hits = [r for r in rs.get("rules") or [] if r.get("ref") == ref] if APPLY else [{"id": "{rule_id:" + ref + "}"}]
    for r in hits:
        step("DELETE", f"/zones/{ZONE}/rulesets/{rs['id']}/rules/{r['id']}", note=f"{ref}: remove" + ("" if APPLY else " (only if present)"))
        if APPLY: ok(*call("DELETE", f"/zones/{ZONE}/rulesets/{rs['id']}/rules/{r['id']}"), f"remove {ref}")

def connector(add):
    path = f"/zones/{ZONE}/cloud_connector/rules"
    step("GET", path, note="read the Cloud Connector rules (PUT replaces the whole list)")
    keep = []
    if APPLY:
        keep = [r for r in ok(*call("GET", path), "read connector rules").get("result") or [] if not str(r.get("description", "")).startswith(CC_MARK)]
    body = keep + ([CONNECTOR] if add else [])
    shown = (["<every existing rule whose description does not start with " + json.dumps(CC_MARK) + ", unchanged>"] if not APPLY else []) + body
    step("PUT", path, shown if not APPLY else body, note=("add" if add else "remove") + " the freeweights-cc rule, keep the others")
    if APPLY: ok(*call("PUT", path, body), "write connector rules")

if ROLLBACK:
    connector(False)
    for phase, r in reversed(RULES): drop_rule(phase, r["ref"])
else:
    for phase, r in RULES: put_rule(phase, r)
    connector(True)

if AS_JSON:
    print(json.dumps({"mode": ("apply" if APPLY else "dry-run") + (" rollback" if ROLLBACK else ""), "zone": ZONE, "host": HOST,
                      "r2_host": R2_HOST, "rules": [dict(r, phase=p) for p, r in RULES], "connector": CONNECTOR, "calls": plan}, indent=2))
else:
    print(f"== Cloud Connector rules for {HOST} -> R2 custom domain {R2_HOST} ({'APPLIED' if APPLY else 'DRY RUN: nothing sent'}{', rollback' if ROLLBACK else ''})")
    for i, c in enumerate(plan, 1):
        print(f"\n[{i}] {c['method']} {c['url']}" + (f"\n    # {c['note']}" if c["note"] else ""))
        if c["body"] is not None: print("    " + json.dumps(c["body"], indent=2).replace("\n", "\n    "))
PY
[ "$ROLLBACK" = 1 ] || routes --connector-on
