#!/usr/bin/env bash
# Zone routes with NO Worker for static prefixes on freeweights.allternit.com, so site traffic is served by Pages
# (or, for the two connector routes, by Cloud Connector from R2) and does not count against Workers requests.
# More specific routes win over the Worker's freeweights.allternit.com/* route. Safe to re-run (skips existing).
#
#   scripts/cf_static_routes.sh                      # DRY RUN: the static-prefix routes it would ensure
#   scripts/cf_static_routes.sh --connector-on       # DRY RUN: also add no-Worker routes for /manifests/* and
#                                                    #   /alt.freeweights* (Cloud Connector serves them; the switch)
#   scripts/cf_static_routes.sh --connector-off      # DRY RUN: remove those two (the Worker serves them; the reverse)
#   add --apply to send. Needs CF_API_TOKEN (zone token: Workers Routes edit) and CF_ZONE_ID (allternit.com).
#
# Without --connector-on/--connector-off the two connector routes are left as they are. cf_cloud_connector.sh
# runs --connector-on after its rules and --connector-off before removing them.
set -euo pipefail
APPLY=0; MODE=""
for a in "$@"; do
  case "$a" in
    --apply) APPLY=1 ;; --connector-on) MODE=on ;; --connector-off) MODE=off ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) echo "cf_static_routes: unknown option $a" >&2; exit 2 ;;
  esac
done
ZONE="${CF_ZONE_ID:-}"
H="${FW_HOST:-freeweights.allternit.com}"
API="https://api.cloudflare.com/client/v4"
PREFIXES=("/assets/*" "/data/*" "/keys/*" "/alt.freeweights" "/alt.freeweights/*" "/docs/*" "/collections/*" "/design/*" "/ledger/*" "/operating-statement/*" "/wanted/*" "/mirrors/*" "/studio/*" "/ethos*" "/charter*")
# Served by the Worker from R2 (B6) unless Cloud Connector is switched on.
CONNECTOR=("/manifests/*" "/alt.freeweights*")
ADD=("${PREFIXES[@]}"); REMOVE=()
[ "$MODE" = on ] && ADD+=("${CONNECTOR[@]}")
[ "$MODE" = off ] && REMOVE=("${CONNECTOR[@]}")

if [ "$APPLY" = 0 ]; then
  Z="${ZONE:-\$CF_ZONE_ID}"
  echo "DRY RUN: nothing sent. Routes for $H (no script = no Worker):"
  echo "GET    $API/zones/$Z/workers/routes   # existing patterns are skipped"
  for p in "${REMOVE[@]+"${REMOVE[@]}"}"; do echo "DELETE $API/zones/$Z/workers/routes/{id of $H$p, only if it has no script}"; done
  for p in "${ADD[@]}"; do echo "POST   $API/zones/$Z/workers/routes {\"pattern\":\"$H$p\"}"; done
  exit 0
fi
[ -n "${CF_API_TOKEN:-}" ] && [ -n "$ZONE" ] || { echo "cf_static_routes: --apply needs CF_API_TOKEN and CF_ZONE_ID" >&2; exit 2; }
AUTH=(-H "Authorization: Bearer $CF_API_TOKEN")
routes_json=$(curl -sf "$API/zones/$ZONE/workers/routes" "${AUTH[@]}")
for p in "${REMOVE[@]+"${REMOVE[@]}"}"; do
  rid=$(printf '%s' "$routes_json" | python3 -c 'import json,sys;print(next((r["id"] for r in json.load(sys.stdin).get("result") or [] if r["pattern"]==sys.argv[1] and not r.get("script")),""))' "$H$p")
  if [ -z "$rid" ]; then echo "absent  $H$p"; continue; fi
  curl -s -X DELETE "$API/zones/$ZONE/workers/routes/$rid" "${AUTH[@]}" \
    | python3 -c 'import json,sys;d=json.load(sys.stdin);print("removed" if d.get("success") else "FAIL   ", sys.argv[1], "" if d.get("success") else d.get("errors"))' "$H$p"
done
existing=$(printf '%s' "$routes_json" | python3 -c 'import json,sys;print("\n".join(r["pattern"] for r in json.load(sys.stdin).get("result") or []))')
for p in "${ADD[@]}"; do
  pat="$H$p"
  if printf '%s\n' "$existing" | grep -qxF "$pat"; then echo "exists  $pat"; continue; fi
  curl -s -X POST "$API/zones/$ZONE/workers/routes" "${AUTH[@]}" -H "Content-Type: application/json" --data "{\"pattern\":\"$pat\"}" \
    | python3 -c 'import json,sys;d=json.load(sys.stdin);print("ok     " if d.get("success") else "FAIL   ", sys.argv[1], "" if d.get("success") else d.get("errors"))' "$pat"
done
