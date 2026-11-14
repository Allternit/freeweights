#!/usr/bin/env python3
"""Thin shim: the fw CLI lives in freeweights_cli/cli.py. This keeps `python3 scripts/fw.py ...` working from a checkout."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from freeweights_cli.cli import main
if __name__ == "__main__": sys.exit(main())
