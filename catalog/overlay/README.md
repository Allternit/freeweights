# Catalog overlays

One JSON file per enrichment (`cloud.json`, `readme.json`, `facets.json`, ...), shaped `{ "<model id>": { ... } }`. Keys starting with `_` are metadata. The site build attaches each entry to the row as `r.overlay.<file name>`. Overlays add display data only; they never change a signed manifest.
