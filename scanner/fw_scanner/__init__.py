"""fw-scanner: the Freeweights upload scanner (spec/accounts-v1.md 11.5, plan U7 and U10 to U12).

It polls POST /api/fw/v1/scan/claim with an HMAC-signed request, downloads each job's presigned GET into a
temp dir, checks the sha256 against the oid, runs the checks for the file's type and posts the result to
POST /api/fw/v1/scan/{id}/result. One job at a time. It holds no R2 or Cloudflare credential: the only
secret is SCANNER_SECRET. Standard library only; picklescan, modelscan, clamscan and gitleaks run as
subprocesses with a clean environment."""

VERSION = "fw-scanner/0.1.0"
