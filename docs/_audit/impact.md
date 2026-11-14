# Impact and websites stack (Phase 0.5)

## 1. dependency-map impact

Script: `/Users/joe/Desktop/allternit-workspace/allternit/scripts/dependency-map.py` (found, runs under `python3.11`).

Requested command, as written:

```
python3.11 scripts/dependency-map.py --impact services/local-engine cmd/gizzi-code/src/runtime/sidecar services/model-training --summary
```

Result: fails. The script needs repo-prefixed paths. The platform repo prefix is `allternit/` (`dependency-map.py` line 51, `roots = {'allternit': ROOT, 'allternit-ai': ai}`). The first unmapped path stops the run with `No mapped path: ...`. The script is not changed here.

Rerun with the prefix, one path at a time, `--fresh` (no cache):

```
python3.11 scripts/dependency-map.py --impact allternit/services/local-engine --summary --fresh
```
```
Impact of allternit/services/local-engine
  Part of: none
  Features: none named; if this is a feature, add it to docs/dependency-map/features.json
  Shipped surfaces reached: none
  Products reached: none
  Could be affected: 0 components (run without --summary for the list)
```

```
python3.11 scripts/dependency-map.py --impact allternit/services/model-training --summary --fresh
```
```
No mapped path: allternit/services/model-training
```

```
python3.11 scripts/dependency-map.py --impact allternit/cmd/gizzi-code/src/runtime/sidecar --summary --fresh
```
```
Impact of allternit/cmd/gizzi-code/src/runtime/sidecar
  Part of: Allternit Desktop, Gizzi Code (gizzi CLI/TUI)
  Features: Bot Mode threads and templates [live], Chat attachments open in their editor pane; the agent edits them [live], Guard local read-only connector [building], One-task grants (Allow for this task) [building]
  Shipped surfaces reached: ai.allternit.com, Allternit Desktop app, gizzi CLI (brew, npm), m.allternit.com PWA
  Products reached: 29 (through shared code; Part of is the direct list)
  Could be affected: 406 components (run without --summary for the list)
```

Findings:
- `services/local-engine` maps but reaches nothing: 0 components, no feature. Either it is not linked from any file the map reads, or it is dead. It has 32 tracked files. Treat the map as blind to it until a link is added.
- `services/model-training` is not mapped at all, though it has 17 tracked files (`git ls-files services/model-training`). It is a gap in the map, not an empty result.
- `cmd/gizzi-code/src/runtime/sidecar` is the one that matters: 406 components, 4 features, 4 shipped surfaces. Any change there is a cross-surface change.
- The combined requested run cannot succeed while `model-training` is unmapped. Map it (`docs/dependency-map/` in allternit) before a plan relies on this command.

## 2. Websites stack

Root: `/Users/joe/Desktop/Allternit/Allternit Websites/` (read only). Projects live in `projects/` (19 entries).

Finding: the sites are static, client-rendered Vite SPAs built to `dist/` and deployed to Cloudflare Pages. No Astro or Next.

- Framework: Vite. `compute.allternit.com/source/app/package.json` and `www.allternit.com/source/app/package.json`: `vite ^7.2.4`, `react ^19.2.0`, `react-dom ^19.2.5`, TypeScript. `try.allternit.com/source/package.json`: `vite ^8.2.2`, no React in its package.json.
- Build commands: `tsc -b && vite build` in the `app/` folder (compute, www). A `prebuild` runs `node scripts/generate-static.js` first (compute, www). `try.allternit.com` runs `tsc && vite build`. `labs`, `docs`, `docs.gizziio.com` run `npm run build` at the source folder (their `vite.config.ts` files exist).
- Vite configs found: 12 `vite.config.*` files under `projects/` (depth 4). No `astro.config.*` and no `next.config.*`.
- Cloudflare Pages: `.github/workflows/deploy-pages.yml` at the repo root. It runs `npm ci && npm run build` in each project's working directory, then `wrangler pages deploy <folder>/dist --project-name=<project> --branch=main`. Example projects: `allternit` (www), `allternit-compute`, `allternit-robotics`, `allternit-spaces`, `allternit-manufacturing`, `allternit-learning-labs`, `allternit-docs`, `gizzi-code-docs`, `try-allternit`. The `install.*` and `services.allternit.com` sites deploy their source folders directly, with no build.
- SPA routing: `_redirects` with `/* /index.html 200` (compute.allternit.com/source/_redirects).
- Exception: `services.allternit.com/worker/wrangler.toml` and `www.allternit.com/newsletter-worker/wrangler.toml` are Cloudflare Workers, not Pages.
- Deploy script `deploy-labs-and-main.sh` is marked deprecated; production deploys run from the GitHub workflow on push to main.

Not checked: the `docs.allternit.com` and `install.allternit.com` framework details (only their package.json names were seen).
