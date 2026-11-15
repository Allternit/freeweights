# fw-scanner

The upload scanner for Freeweights community repos (spec/accounts-v1.md section 11.5, plan U7 and U10 to U12).
Every uploaded file is scanned before anyone can download it. The scanner runs in its own Incus container,
`fw-scanner`, on allternit-standby.

## What it does

1. Every 30 seconds after a job, or 60 seconds when idle, it calls `POST /api/fw/v1/scan/claim` with
   `{"scanner_version", "max": 1}`. The call is HMAC-signed with `SCANNER_SECRET`:
   `X-FW-Timestamp: <unix s>` and `X-FW-Signature: v1=<hex>` over
   `<ts>\n<METHOD>\n<path?query>\n<sha256 hex of the body>`. Each call is also the heartbeat that
   `GET /api/fw/v1/scan/health` reads, and it runs the Worker's sweep.
2. It downloads the job's presigned GET (valid 15 minutes) into `/var/lib/fw-scanner/work/job-*`. It never
   writes more than the job's `size`. It refuses a job over `file_max_bytes` (read from
   `GET /api/fw/v1/limits`, so no number is built in) or over the free disk.
3. It checks the file:

| Files | Check | Code when it fails |
|---|---|---|
| all | sha256 equals the oid, and the size matches | `sha256_mismatch` |
| all | public blocklist (`policy/blocklist.json`) and the private one on the host | `blocklisted` |
| weights | `scripts/formats.py` header check, plus a full header check for safetensors and GGUF | `bad_header` |
| pickles (by extension or by pickle/zip magic) | picklescan and modelscan | `unsafe_pickle` |
| everything else | `clamscan`, one process per job, no clamd | `malware` |
| text up to 5 MiB | gitleaks, redacted | `secret_found` |
| a check that cannot finish | | `scan_failed` |

   A file can get two groups. A pickle named `.safetensors` gets the weights check, fails it, and also
   goes through the pickle scanners. A `.bin` that passes only as raw tensors also gets ClamAV.
4. It posts `{attempt, status, findings[], scanner_version}` to `POST /api/fw/v1/scan/{id}/result`. The
   status is `held` when any finding is present, `error` when the only findings are `scan_failed` (the
   Worker re-queues it, up to 3 attempts), and `clean` otherwise. A finding's `detail` names rules,
   signatures and offsets. It never holds file content, a secret's value or a host path.

It holds no R2 or Cloudflare credential. The tools run as subprocesses with a clean environment, so
`SCANNER_SECRET` never reaches them. While a tool or the ClamAV database is missing, it does not poll.
`/scan/health` then turns 503 and the upload pages say "Scanning is delayed". freshclam runs from the loop
every 12 hours. There is no cron job and no ClamAV daemon.

## Layout

| Path | What |
|---|---|
| `fw_scanner/api.py` | signed Worker calls |
| `fw_scanner/fetch.py` | capped download with sha256 |
| `fw_scanner/scan.py` | file groups, the checks, the verdict |
| `fw_scanner/service.py` | config, one job, the poll loop |
| `requirements.txt` | pinned picklescan, modelscan and modelscan's dependencies |
| `deploy/fw-scanner.service` | hardened systemd unit |
| `deploy/install.sh` | container + install, dry run by default |
| `deploy/freshclam.conf`, `deploy/env.example` | `/etc/fw-scanner/` files |
| `tests/` | the generated corpus and a local fake of the Worker's scan API |

## Tests

```sh
python3.12 -m venv /tmp/fwscan && /tmp/fwscan/bin/pip install -r scanner/requirements.txt pytest
/tmp/fwscan/bin/python -m pytest scanner/tests -q -rs
```

The corpus is generated at test time: a pickle whose reduce calls `os.system`, the EICAR string, a text
file with a made-up AWS key, a GGUF with a bad header and a clean safetensors. The expected result is 4 held
with their codes and 1 clean. A real tool is used when it is installed. A missing one is replaced by a small
stand-in with the same command line and exit codes, and `test_real_tool[<tool>]` shows as skipped.
`FW_SCANNER_FAKE_TOOLS=1` forces the stand-ins.

## Operating it

Install and update: `scanner/deploy/install.sh` prints each step. `--apply` runs them. This needs EOJ GO,
because standby hosts paying customers' computers. The runbook, with checks, rotation and
troubleshooting, is in the Brain at `Infra/freeweights-scanner.md`.

```sh
ssh root@31.220.95.165 incus exec fw-scanner -- systemctl status fw-scanner
ssh root@31.220.95.165 incus exec fw-scanner -- journalctl -u fw-scanner -n 50 --no-pager
curl -s https://freeweights.allternit.com/api/fw/v1/scan/health
```
