#!/bin/zsh
# Zone routes with NO Worker for static prefixes on freeweights.allternit.com, so site traffic
# is served by Pages directly and does not count against Workers requests. More specific
# routes win over the Worker's freeweights.allternit.com/* route. Safe to re-run (skips existing).
set -u
ZONE=5ebf34ee08d574ea107bbeb83395723a   # allternit.com
TOK=$(npx wrangler@4.160.0 auth token 2>/dev/null | tail -1)
H="freeweights.allternit.com"
PREFIXES=("/assets/*" "/manifests/*" "/data/*" "/keys/*" "/alt.freeweights*" "/docs/*" "/collections/*" "/design/*" "/ledger/*" "/operating-statement/*" "/wanted/*" "/mirrors/*" "/studio/*" "/ethos*" "/charter*")
existing=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE/workers/routes" -H "Authorization: Bearer $TOK" | python3 -c 'import json,sys;print("\n".join(r["pattern"] for r in json.load(sys.stdin).get("result") or []))')
for p in "${PREFIXES[@]}"; do
  pat="$H$p"
  if print -r -- "$existing" | grep -qxF "$pat"; then echo "exists  $pat"; continue; fi
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/workers/routes" -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" --data "{\"pattern\":\"$pat\"}" \
    | python3 -c 'import json,sys;d=json.load(sys.stdin);print("ok     " if d.get("success") else "FAIL   ", sys.argv[1], "" if d.get("success") else d.get("errors"))' "$pat"
done
