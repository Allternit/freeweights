# Islands

An island is a small piece of client behaviour on an otherwise static page. The build writes plain HTML; an island adds interaction only where a page needs it.

## Contract

1. The page holds a static mount point, with a text fallback inside it so the page reads without JavaScript:

   ```html
   <div data-fw-island="name" data-model="owner/repo" data-other="value">Fallback text.</div>
   ```

   `name` is the island's file name here, without the extension. Every `data-*` attribute is a string input to that island.

2. Pages that carry at least one island load one script, with `defer`: `/assets/fw-islands.js`. Pages with no island load no island script.

3. `assets/fw-islands.js` finds each `[data-fw-island]`, imports `/assets/islands/<name>.js` the first time that name appears, and calls its default export as `mount(el, props)`. `props` is the element's `dataset`. An island that throws leaves its fallback text in place.

4. An island file is one self-hosted ES module in this folder. It may call the Freeweights API with `fetch` on the same origin.

## Rules

- Anonymous pages load no third-party script, font, image or request. Islands are same-origin files.
- A heavy dependency (for example a SQL engine) is self-hosted and loaded only when the user opens the feature that needs it, never at page load.
- Islands respect `prefers-reduced-motion` and work by keyboard.
- Signed-in or account features call the API at view time. Nothing personal or priced is baked into the static build.
