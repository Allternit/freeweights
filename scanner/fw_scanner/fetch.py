"""Download one quarantine object into the job's temp dir, hashing as it goes.

The cap: never more than the job's `size` bytes are written (the Worker reserved and HEAD-checked that
size at upload, spec 11.3), and the caller refuses a job over `file_max_bytes` or over the free disk."""
from __future__ import annotations

import hashlib
import ipaddress
import urllib.error
import urllib.parse
import urllib.request

CHUNK = 1 << 20


class TooLarge(Exception):
    """The object sent more bytes than the job's size."""


class FetchError(Exception):
    """The download failed (expired URL, network, a host that is not allowed)."""


def _allowed(url: str) -> bool:
    parts = urllib.parse.urlsplit(url)
    if parts.scheme == "https":
        return bool(parts.hostname)
    if parts.scheme == "http" and parts.hostname:
        # Plain http only to a loopback host (local tests). Presigned R2 URLs are https.
        try:
            return ipaddress.ip_address(parts.hostname).is_loopback
        except ValueError:
            return parts.hostname == "localhost"
    return False


def download(url: str, dest: str, size: int, timeout: float = 60.0):
    """Write the object to `dest`. Returns (sha256 hex, bytes written). Raises TooLarge or FetchError."""
    if not _allowed(url):
        raise FetchError("the job URL is not https")
    digest, written = hashlib.sha256(), 0
    req = urllib.request.Request(url, headers={"User-Agent": "fw-scanner"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r, open(dest, "wb") as out:
            while True:
                chunk = r.read(CHUNK)
                if not chunk:
                    break
                written += len(chunk)
                if written > size:
                    raise TooLarge(f"the object is larger than its size {size}")
                digest.update(chunk)
                out.write(chunk)
    except urllib.error.HTTPError as e:
        # Never log the URL: it carries a signature.
        raise FetchError(f"download answered {e.code}") from None
    except (urllib.error.URLError, OSError) as e:
        raise FetchError(f"download failed: {str(getattr(e, 'reason', e))[:200]}") from None
    return digest.hexdigest(), written
