"""python -m fw_scanner            run the poll loop (systemd runs this)
python -m fw_scanner --check    print which tools are missing and exit 1 if any are, 0 if ready"""
import signal
import sys
import threading

from .service import Config, Service, log


def main(argv):
    cfg = Config()
    if "--check" in argv:
        missing = cfg.tools.missing()
        print("ready" if not missing else "missing: " + ", ".join(missing))
        return 1 if missing else 0
    if not cfg.secret:
        log("config_error", message="SCANNER_SECRET is not set")
        return 2
    stop = threading.Event()
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    Service(cfg).run_forever(stop)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
