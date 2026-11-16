#!/usr/bin/env bash
# Install or update fw-scanner in its own Incus container on allternit-standby (plan U11, step 12).
#
#   scanner/deploy/install.sh            print every step and command; changes nothing (the default)
#   scanner/deploy/install.sh --apply    do it (EOJ GO first: standby hosts paying customers' computers)
#   --rotate-secret                      also replace /etc/fw-scanner/env when it already exists
#
# Run it from a Freeweights checkout on the operator's Mac. It needs ssh to root@31.220.95.165
# (override with FW_SCANNER_HOST) and the scanner secret, the same value as the Worker's SCANNER_SECRET,
# from FW_SCANNER_SECRET, else Keychain item "allternit-fw-scanner-secret", else a hidden prompt. The
# secret travels over ssh stdin, never on a command line.
#
# What it touches on the host: one container, fw-scanner (1 CPU, 2 GiB, 20 GB root disk), on the default
# profile. It does not change incusbr0, host sysctls, other containers or the host firewall. Before and
# after, it lists every container's IPv4 and stops with an error if a customer container lost its address.
set -euo pipefail

HOST="${FW_SCANNER_HOST:-root@31.220.95.165}"
CT=fw-scanner
IMAGE="${FW_SCANNER_IMAGE:-images:ubuntu/24.04}"   # Python 3.12: picklescan needs >= 3.11, modelscan < 3.13
GITLEAKS_VERSION=8.30.1
GITLEAKS_SHA256_AMD64=551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb
GITLEAKS_SHA256_ARM64=e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080
APPLY=0
ROTATE=0
for a in "$@"; do
  case "$a" in
    --apply) APPLY=1 ;;
    --rotate-secret) ROTATE=1 ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    *) echo "unknown option $a" >&2; exit 2 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
[ -f "$ROOT/scripts/formats.py" ] && [ -f "$ROOT/scanner/fw_scanner/service.py" ] || {
  echo "run this from a freeweights checkout (no scripts/formats.py or scanner/ under $ROOT)" >&2; exit 2; }

SSH=(ssh -o BatchMode=yes -o ConnectTimeout=15 "$HOST")
say() { printf '\n== %s\n' "$*"; }

# host_sh / ct_sh: run the script on stdin on the host / in the container. In dry-run, print it.
# The script itself is stdin, so any command in it that reads stdin (incus launch reads YAML config from a
# non-tty stdin; incus exec forwards it) must get </dev/null, or it eats the rest of the script.
host_sh() {
  if [ "$APPLY" = 1 ]; then "${SSH[@]}" "bash -euo pipefail -s"; else sed 's/^/    host$ /'; fi
}
ct_sh() {
  if [ "$APPLY" = 1 ]; then "${SSH[@]}" "incus exec $CT -- bash -euo pipefail -s"; else sed "s/^/    $CT# /"; fi
}

[ "$APPLY" = 1 ] || echo "DRY RUN: nothing changes. Re-run with --apply after EOJ GO."

# ------------------------------------------------------------------------------------ 1. preflight
say "1. preflight on the host (read-only): memory, disk, containers and their IPv4"
host_sh <<'EOF'
free -m | awk 'NR==2 {print "free RAM MiB: " $7}'
df -BG --output=avail / | tail -1 | sed 's/^/free disk: /'
nproc | sed 's/^/cpus: /'
incus storage list -f csv
incus list -f csv -c ns4 > /root/fw-scanner-ipv4-before.csv
cat /root/fw-scanner-ipv4-before.csv
avail_mb=$(free -m | awk 'NR==2 {print $7}')
avail_gb=$(df -BG --output=avail / | tail -1 | tr -dc 0-9)
if [ "$avail_mb" -lt 3072 ] || [ "$avail_gb" -lt 25 ]; then
  echo "STOP: standby needs 3 GiB free RAM and 25 GB free disk (plan step 1)"; exit 1
fi
EOF

# ------------------------------------------------------------------------------------ 2. container
say "2. container $CT: 1 CPU, 2 GiB hard, 20 GB root, unprivileged, no nesting"
host_sh <<EOF
if incus info $CT >/dev/null 2>&1; then
  echo "$CT exists; applying limits only"
else
  incus launch $IMAGE $CT -c limits.cpu=1 -c limits.memory=2GiB -c limits.memory.enforce=hard \\
    -c limits.processes=1000 -c security.privileged=false -c security.nesting=false -d root,size=20GiB </dev/null
fi
incus config set $CT limits.cpu=1 limits.memory=2GiB limits.memory.enforce=hard limits.processes=1000
incus config device override $CT root size=20GiB 2>/dev/null || incus config device set $CT root size=20GiB
for i in \$(seq 1 60); do incus exec $CT -- getent hosts archive.ubuntu.com </dev/null >/dev/null 2>&1 && break; sleep 2; done
incus exec $CT -- getent hosts archive.ubuntu.com </dev/null >/dev/null || { echo "STOP: $CT has no DNS/network"; exit 1; }
EOF

# ------------------------------------------------------------------------------------ 3. packages
say "3. packages (clamscan, no clamd), service user, gitleaks $GITLEAKS_VERSION (sha256 pinned)"
ct_sh <<EOF
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q --no-install-recommends python3 python3-venv ca-certificates curl clamav
# freshclam runs from the scanner's loop; no resident ClamAV daemon or updater.
systemctl disable --now clamav-freshclam.service 2>/dev/null || true
systemctl mask clamav-freshclam.service clamav-daemon.service 2>/dev/null || true
id fw-scanner >/dev/null 2>&1 || useradd --system --home-dir /var/lib/fw-scanner --no-create-home \\
  --shell /usr/sbin/nologin fw-scanner
install -d -m 0700 -o fw-scanner -g fw-scanner /var/lib/fw-scanner /var/lib/fw-scanner/clamav /var/lib/fw-scanner/work
install -d -m 0755 /opt/fw-scanner /etc/fw-scanner
arch=\$(dpkg --print-architecture)
case "\$arch" in
  amd64) ga=x64; gsum=$GITLEAKS_SHA256_AMD64 ;;
  arm64) ga=arm64; gsum=$GITLEAKS_SHA256_ARM64 ;;
  *) echo "STOP: no pinned gitleaks for \$arch"; exit 1 ;;
esac
if [ "\$(/usr/local/bin/gitleaks version 2>/dev/null)" != "$GITLEAKS_VERSION" ]; then
  t=\$(mktemp -d)
  curl -fsSL -o \$t/g.tgz "https://github.com/gitleaks/gitleaks/releases/download/v$GITLEAKS_VERSION/gitleaks_${GITLEAKS_VERSION}_linux_\$ga.tar.gz"
  echo "\$gsum  \$t/g.tgz" | sha256sum -c -
  tar -xzf \$t/g.tgz -C \$t gitleaks
  install -m 0755 \$t/gitleaks /usr/local/bin/gitleaks
  rm -rf \$t
fi
/usr/local/bin/gitleaks version
EOF

# ------------------------------------------------------------------------------------ 4. code
say "4. code: scanner/ + scripts/formats.py + scripts/blocklist.py + policy/blocklist.json -> /opt/fw-scanner (root-owned)"
FILES=(scanner/fw_scanner scanner/requirements.txt scanner/deploy scripts/formats.py scripts/blocklist.py policy/blocklist.json)
if [ "$APPLY" = 1 ]; then
  (cd "$ROOT" && COPYFILE_DISABLE=1 tar --exclude '__pycache__' -czf - "${FILES[@]}") |
    "${SSH[@]}" "incus exec $CT -- sh -c 'rm -rf /opt/fw-scanner/scanner/fw_scanner && tar -xzf - -C /opt/fw-scanner --no-same-owner && chown -R root:root /opt/fw-scanner && chmod -R go-w,a+rX /opt/fw-scanner'"
else
  echo "    local$ tar -czf - ${FILES[*]} | ssh $HOST incus exec $CT -- tar -xzf - -C /opt/fw-scanner"
fi
ct_sh <<'EOF'
[ -x /opt/fw-scanner/venv/bin/python ] || python3 -m venv /opt/fw-scanner/venv
/opt/fw-scanner/venv/bin/pip install -q --no-cache-dir --disable-pip-version-check -r /opt/fw-scanner/scanner/requirements.txt
site=$(/opt/fw-scanner/venv/bin/python -c 'import sysconfig; print(sysconfig.get_paths()["purelib"])')
echo /opt/fw-scanner/scanner > "$site/fw_scanner.pth"
install -m 0644 /opt/fw-scanner/scanner/deploy/freshclam.conf /etc/fw-scanner/freshclam.conf
install -m 0644 /opt/fw-scanner/scanner/deploy/fw-scanner.service /etc/systemd/system/fw-scanner.service
systemctl daemon-reload
EOF

# ------------------------------------------------------------------------------------ 5. secret
say "5. /etc/fw-scanner/env (root 0600): SCANNER_SECRET + FREEWEIGHTS_PRIVATE_BLOCKLIST"
if [ "$APPLY" = 1 ]; then
  has_env=$("${SSH[@]}" "incus exec $CT -- test -s /etc/fw-scanner/env && echo yes || echo no")
  if [ "$has_env" = no ] || [ "$ROTATE" = 1 ]; then
    secret="${FW_SCANNER_SECRET:-}"
    [ -n "$secret" ] || secret=$(security find-generic-password -s allternit-fw-scanner-secret -w 2>/dev/null || true)
    [ -n "$secret" ] || { read -r -s -p "SCANNER_SECRET (same as the Worker secret): " secret; echo; }
    [ ${#secret} -ge 32 ] || { echo "STOP: the secret is shorter than 32 characters" >&2; exit 1; }
    printf 'SCANNER_SECRET=%s\nFREEWEIGHTS_PRIVATE_BLOCKLIST=/etc/fw-scanner/blocklist-private.json\n' "$secret" |
      "${SSH[@]}" "incus exec $CT -- sh -c 'umask 077; cat > /etc/fw-scanner/env.new && chown root:root /etc/fw-scanner/env.new && mv /etc/fw-scanner/env.new /etc/fw-scanner/env'"
    unset secret
    echo "    written"
  else
    echo "    kept the existing env (use --rotate-secret to replace it)"
  fi
else
  echo "    local$ printf 'SCANNER_SECRET=<from Keychain>\\nFREEWEIGHTS_PRIVATE_BLOCKLIST=...' | ssh $HOST incus exec $CT -- sh -c 'umask 077; cat > /etc/fw-scanner/env'"
fi
ct_sh <<'EOF'
f=/etc/fw-scanner/blocklist-private.json
[ -f $f ] || echo '{"schema_version": 0, "entries": []}' > $f
chown root:fw-scanner $f && chmod 0640 $f
EOF

# ------------------------------------------------------------------------------------ 6. start
say "6. signatures, readiness check, start the unit"
ct_sh <<'EOF'
runuser -u fw-scanner -- freshclam --config-file=/etc/fw-scanner/freshclam.conf --datadir=/var/lib/fw-scanner/clamav --quiet || true
cd /var/lib/fw-scanner
runuser -u fw-scanner -- env CLAMAV_DB=/var/lib/fw-scanner/clamav GITLEAKS_BIN=/usr/local/bin/gitleaks \
  FW_SCRIPTS_DIR=/opt/fw-scanner/scripts /opt/fw-scanner/venv/bin/python -I -m fw_scanner --check
systemctl enable fw-scanner.service
systemctl restart fw-scanner.service
sleep 5
systemctl is-active fw-scanner.service
journalctl -u fw-scanner -n 20 --no-pager
EOF

# ------------------------------------------------------------------------------------ 7. verify
say "7. verify: customer containers still have IPv4; /scan/health"
host_sh <<'EOF'
incus list -f csv -c ns4 > /root/fw-scanner-ipv4-after.csv
lost=0
while IFS=, read -r name state ipv4; do
  [ "$state" = RUNNING ] && [ -n "$ipv4" ] || continue
  after=$(awk -F, -v n="$name" '$1 == n {print $3}' /root/fw-scanner-ipv4-after.csv)
  if [ -z "$after" ]; then echo "LOST IPv4: $name"; lost=1; fi
done < /root/fw-scanner-ipv4-before.csv
cat /root/fw-scanner-ipv4-after.csv
[ "$lost" = 0 ] || { echo "STOP: a container lost IPv4. Check incusbr0 and the inotify limit (Brain Infra/freeweights-scanner.md)"; exit 1; }
echo "every container that had IPv4 still has it"
EOF
if [ "$APPLY" = 1 ]; then
  echo "    waiting 70 s for the first poll"; sleep 70
  curl -s -o /dev/stderr -w '    /scan/health HTTP %{http_code}\n' https://freeweights.allternit.com/api/fw/v1/scan/health
else
  echo "    local$ curl -s https://freeweights.allternit.com/api/fw/v1/scan/health   # expect 200, ok: true"
fi
