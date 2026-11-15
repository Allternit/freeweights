---
title: Wanted
nav_label: Wanted
summary: Models that have no live source or were refused, with the reason for each, and how to help.
updated: 2026-11-14
sections:
  - {id: what-wanted-means, title: What Wanted means}
  - {id: refused, title: Refused, with reasons}
  - {id: how-to-help, title: How to help}
  - {id: request, title: Request a model}
  - {id: counter, title: Takedown counter}
---
Wanted is the honest page. A model sits here when we cannot offer it as downloadable today. We do not hide it and we do not show it as available.

## What Wanted means {#what-wanted-means}

A model is Wanted for one of two reasons.

1. **No live source.** We list a model only if at least one source is live: Hosted by Allternit, Community seeded, or From source. We check on read. If the publisher moved or removed the files, or the size no longer matches the manifest, the source is failed. With no live source left, the model moves here, and the API answers 404 with the code `model_wanted`.
2. **Refused.** No license at all, pickle-only weights, or a content-policy reason. We read the license or the files and decided we cannot list it. A license no person has read yet is not a refusal: that model is listed as a link only, "From the publisher", labelled "License not reviewed". Every refusal is logged with the model, source, license found, date and reason. This page shows the summary so authors can see why.

## Refused, with reasons {#refused}

The table below comes from `catalog/refused.json`, the refusal log at the time of this version. The site build fills it from that file, so the live page may hold more rows.

| Model | License found | Reason |
| --- | --- | --- |
| MiniMaxAI/MiniMax-H3 | MiniMax H3 community license | The license excludes the United States (the territory is worldwide except the EU, UK, South Korea and the US). Distribution from a US host is outside the grant. |
| MiniMaxAI/MiniMax-H3-Image | MiniMax H3 Image community license | Same territory exclusion. |
| hexgrad/Kokoro-82M | Apache-2.0 | The weights are pickle-only. We replaced it with onnx-community/Kokoro-82M-v1.0-ONNX. |
| allenai/tulu-3-sft-mixture | ODC-BY-1.0 for the mixture; subsets vary | License unclear. Needs review. |
| livecodebench/code_generation_lite | CC, variant not stated | License unclear. Needs review. |
| princeton-nlp/SWE-bench_Verified | Not stated | License unclear. Needs review. |
| teknium/OpenHermes-2.5 | Not stated | License unclear. Needs review. |

"Needs review" is not a final no. If the license is found or clarified, the item moves on.

## How to help {#how-to-help}

- **Seed it.** If you hold a full, verified copy of a Wanted model whose license allows sharing, seed it. See the seeding guide in the docs. A seeder with a full copy can move a model from Wanted to Community seeded.
- **Find the license.** Look at the publisher's repository, the model card, the release notes and the paper. Send us a link to the text, the date, and the commit it applies to. We read it ourselves, but a link saves days.
- **Ask the publisher.** Ask them to add a license file, to confirm that third parties may redistribute, or to add the Freeweights link to their release notes. We have a short draft you can copy. Be polite: publishers owe us nothing.
- **Report a moved or removed source.** If a model you know shows as available but is not, tell us. We do not want to show a model as available when it is not.

## Request a model {#request}

Open a GitHub issue at https://github.com/Allternit/freeweights/issues with the model id, the source link, the license and why it should be listed. You can also email freeweights@allternit.com.

We list only models that meet the content policy and the license list. Asking does not buy a place. Catalog order is never paid.

## Takedown counter {#counter}

Removals are never hidden. The counter (shown on the Operating Statement page, and repeated here) shows per month: reports received, items removed, items restored and reason categories. At launch it reads zero. The takedown process is on the Operating Statement page.
