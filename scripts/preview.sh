#!/usr/bin/env bash
# Build the site and serve site/dist the way production serves it (static files, folder index.html).
# Usage: scripts/preview.sh [port] [dist-dir]   (default 8811 and site/dist). Ctrl-C stops it.
# Python's http.server with a deeper accept queue: the stock queue of 5 resets connections when a page
# fetches many files at once.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8811}"; DIST="${2:-$HERE/site/dist}"
if [ -z "${2:-}" ]; then (cd "$HERE/site" && node build.mjs); fi
echo "Preview: http://127.0.0.1:${PORT}/  (serving $DIST)"
exec python3 - "$PORT" "$DIST" <<'PY'
import functools, http.server, sys
class S(http.server.ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True
port, root = int(sys.argv[1]), sys.argv[2]
h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
S(("127.0.0.1", port), h).serve_forever()
PY
