---
title: Licenses
nav_label: Licenses
summary: The license allow-list, how custom and non-commercial licenses are handled, and what we refuse.
group: Policy
order: 7
updated: 2026-11-14
sections:
  - {id: allow-list, title: The allow-list}
  - {id: custom, title: Custom licenses}
  - {id: non-commercial, title: Non-commercial and restricted licenses}
  - {id: refused, title: What we refuse}
  - {id: every-listing, title: Rules for every listing}
---
A model needs a license we can read, and one that lets us serve it. The list is v0 and is a draft that counsel reviews.

## The allow-list {#allow-list}

These are listed without further review: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, CC-BY-4.0 and CC0-1.0.

## Custom licenses {#custom}

A custom or community license (for example a model-specific license) is allowed only after:

1. A person reads it and records the audit result.
2. The model page shows a click-through of the license text before download.
3. The license lets a third party redistribute. If it does not, we serve from the source only.

The manifest records `redistribution` as `yes`, `no` or `click-through`, with the hash of the license text.

## Non-commercial and restricted licenses {#non-commercial}

Some licenses limit use, for example research only, or an acceptable-use clause. They are not on the allow-list. If one passes a person's audit, it shows with a click-through, and the model card says the use limit in plain words. A use restriction passes only with a click-through and counsel sign-off (draft default). A license that bans redistribution means source-only. Llama-style community licenses stay off until counsel reads them. GPL, LGPL, MPL and OpenRAIL-M are not in v0.

Always read the license yourself before you build on a model. The checks here help; they are not legal advice.

## What we refuse {#refused}

- A model whose license is not on the list and did not pass the audit.
- A license that cannot be identified, or that is unspecified. It goes to Wanted as "needs review".
- A license whose grant excludes where we host from. One real example in the log: a community license that excludes the United States.
- Gated repos: behind a login, an access form or an acceptance gate at the source. We skip them. We do not copy gated files and we do not bypass a gate.
- Pickle-based weights.
- Content banned by the content policy, whatever its license.

Every refusal is logged with model, source, license text found, date, reason and who decided. The summary is on the Wanted page.

## Rules for every listing {#every-listing}

- The license text and a checksum appear with every file.
- A license change at the source is checked on each sync. A change to a license that is off the list moves the model to review.
