#!/usr/bin/env bash
# Uploads step 4 (operator): CORS and lifecycle on the R2 bucket freeweights-quarantine, where browser uploads land.
#
#   scripts/r2_quarantine_setup.sh            # DRY RUN (default): print the CORS JSON and the wrangler commands; nothing sent
#   scripts/r2_quarantine_setup.sh --apply    # run them (needs a wrangler login or CLOUDFLARE_API_TOKEN with R2 edit)
#
# CORS: the /new/ upload page (freeweights.allternit.com) and the app upload screens (ai.allternit.com,
# m.allternit.com) PUT file bytes straight to presigned quarantine URLs. Multipart needs the part's ETag back,
# so ETag is exposed. Only PUT: reads never go to quarantine from a browser (the scanner reads with presigned
# GETs server side, downloads come from the public bucket through the Worker). The presigned URL still limits
# each PUT to one object and one exact size; CORS only decides which pages may send it.
# Lifecycle: abort unfinished multipart uploads after 1 day; expire every quarantine object after 15 days
# (held files are deleted at 14 days by the sweep; nothing should live there longer).
#
# Never run by CI or any other script. Run once at step 4, after the bucket exists; repeat after changing it.
set -euo pipefail
BUCKET="${FW_QUARANTINE_BUCKET:-freeweights-quarantine}"
APPLY=0
for a in "$@"; do
  case "$a" in
    --apply) APPLY=1 ;;
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "r2_quarantine_setup: unknown option $a" >&2; exit 2 ;;
  esac
done

CORS_FILE="$(mktemp -t fw-quarantine-cors.XXXXXX)"
trap 'rm -f "$CORS_FILE"' EXIT
cat > "$CORS_FILE" <<'JSON'
{
  "rules": [
    {
      "allowed": {
        "origins": ["https://freeweights.allternit.com", "https://ai.allternit.com", "https://m.allternit.com"],
        "methods": ["PUT"],
        "headers": ["content-type"]
      },
      "exposeHeaders": ["ETag"],
      "maxAgeSeconds": 3600
    }
  ]
}
JSON

CMDS=(
  "npx wrangler r2 bucket cors set $BUCKET --file $CORS_FILE --force"
  "npx wrangler r2 bucket lifecycle add $BUCKET fw-abort-multipart --abort-multipart-days 1 --force"
  "npx wrangler r2 bucket lifecycle add $BUCKET fw-expire-quarantine --expire-days 15 --force"
  "npx wrangler r2 bucket cors list $BUCKET"
  "npx wrangler r2 bucket lifecycle list $BUCKET"
)

echo "== R2 quarantine bucket $BUCKET ($([ "$APPLY" = 1 ] && echo APPLY || echo 'DRY RUN: nothing sent'))"
echo "-- CORS JSON:"
cat "$CORS_FILE"
for c in "${CMDS[@]}"; do
  echo "-- $c"
  if [ "$APPLY" = 1 ]; then (cd "$(dirname "$0")/../worker" && eval "$c"); fi
done
[ "$APPLY" = 1 ] || echo "-- check after --apply: a browser PUT from each origin gets Access-Control-Allow-Origin and Access-Control-Expose-Headers: ETag"
