# Releasing the fw CLI

Version lives in `pyproject.toml` and `freeweights_cli/__init__.py`. Keep them equal.

1. Bump both version strings, update `url` in `packaging/homebrew/fw.rb`, merge to main.
2. Tag and push: `git tag v0.1.0 && git push origin v0.1.0`. Create the GitHub release for the tag.
3. Tarball checksum:
   `curl -sL https://github.com/Allternit/freeweights/archive/refs/tags/v0.1.0.tar.gz | shasum -a 256`
   Put it in the `sha256` line of `packaging/homebrew/fw.rb` and commit.
4. Tap PR: copy `packaging/homebrew/fw.rb` to `Formula/fw.rb` in `Allternit/homebrew-tap`, open a PR, then check
   `brew install --build-from-source allternit/tap/fw && brew test fw && brew audit --strict allternit/tap/fw`.
5. PyPI (needs the project PyPI token):
   ```
   python3 -m venv /tmp/rel && /tmp/rel/bin/pip install build twine
   /tmp/rel/bin/python -m build
   /tmp/rel/bin/twine upload dist/*     # user: __token__, password: the PyPI token
   ```
6. Smoke test in a fresh venv: `pip install allternit-freeweights && fw --help && fw search qwen`.
