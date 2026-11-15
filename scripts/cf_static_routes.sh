#!/bin/zsh
# Zone routes with NO Worker for static prefixes on freeweights.allternit.com, so site traffic
# is served by Pages directly and does not count against Workers requests. More specific
# routes win over the Worker's freeweights.allternit.com/* route. Safe to re-run (skips existing).
set -u
ZONE=5ebf34ee08d574ea107bbeb83395723a   # allternit.com
TOK=$(npx wrangler@4.160.0 auth token 2>/dev/null | tail -1)
H="freeweights.allternit.com"
# /manifests/* and the detail pages under /alt.freeweights.<section>/ are served by the Worker from R2 (B6),
# so they are not carved out; /alt.freeweights/* (the all-catalog list pages) still is.
PREFIXES=("/assets/*" "/data/*" "/keys/*" "/alt.freeweights" "/alt.freeweights/*" "/docs/*" "/collections/*" "/design/*" "/ledger/*" "/operating-statement/*" "/wanted/*" "/mirrors/*" "/studio/*" "/ethos*" "/charter*")
existing=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE/workers/routes" -H "Authorization: Bearer $TOK" | python3 -c 'import json,sys;print("\n".join(r["pattern"] for r in json.load(sys.stdin).get("result") or []))')
# Carve-outs that must NOT exist any more (those paths now reach the Worker). Removed if present.
REMOVE=("/manifests/*" "/alt.freeweights*")
routes_json=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE/workers/routes" -H "Authorization: Bearer $TOK")
for p in "${REMOVE[@]}"; do
  rid=$(print -r -- "$routes_json" | python3 -c 'import json,sys;print(next((r["id"] for r in json.load(sys.stdin).get("result") or [] if r["pattern"]==sys.argv[1] and not r.get("script")),""))' "$H$p")
  if [ -z "$rid" ]; then echo "absent  $H$p"; continue; fi
  curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE/workers/routes/$rid" -H "Authorization: Bearer $TOK" \
    | python3 -c 'import json,sys;d=json.load(sys.stdin);print("removed" if d.get("success") else "FAIL   ", sys.argv[1], "" if d.get("success") else d.get("errors"))' "$H$p"
done
for p in "${PREFIXES[@]}"; do
  pat="$H$p"
  if print -r -- "$existing" | grep -qxF "$pat"; then echo "exists  $pat"; continue; fi
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/workers/routes" -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" --data "{\"pattern\":\"$pat\"}" \
    | python3 -c 'import json,sys;d=json.load(sys.stdin);print("ok     " if d.get("success") else "FAIL   ", sys.argv[1], "" if d.get("success") else d.get("errors"))' "$pat"
done
