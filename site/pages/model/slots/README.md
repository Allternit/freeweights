# Model page slots

Each `.mjs` file here adds one section to every model detail page. The loader (`../index.mjs`) imports every file whose name starts with digits and a dash, in numeric prefix order (`10-`, `20-`, ...), so the order is the same on every build. To add a section, add a file; do not edit the page function.

A slot file exports:

- `region`: where the HTML goes. `head` (under the title, one per line), `tab` (a panel with its own tab), `side` (the right column) or `after` (below the grid).
- `tab`: only for `region = 'tab'`. A pair `[id, label]`, for example `['files', 'Files']`.
- a default function `(r, ctx) => string` that returns the HTML for model `r`. Return `''` to show nothing.

`ctx` comes from `../context.mjs`: `m` (manifest), `files`, `srcs`, `commit`, `treeUrl`, `mf`, `signed`, `licLink`, `lic`, `ncNote`, `rel`. Shared helpers live in `../helpers.mjs` and `../../../lib/`.

Current prefixes: 10-13 head, 20-24 tabs, 30-32 side, 40-42 after. Leave gaps so a new slot fits between two old ones.
