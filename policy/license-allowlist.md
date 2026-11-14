# Freeweights License Allow-list (v0)

Status: Draft. Owner: Allternit. Published at /docs.

## Allowed licenses

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- CC-BY-4.0
- CC0-1.0

## Custom licenses

A custom or community license (for example a model-specific license) is allowed only after:

1. A person reads it and records the audit result.
2. The model page shows a click-through of the license text before download.
3. The license allows redistribution by a third party. If it does not, we serve from the source only.

## Refusals

- A model with a license not on the list, and not passed through the audit, is not listed.
- Every refusal is logged: model, source, license text found, date, reason, and who decided.
- The log is public in summary form so authors can see why.

## Gated repos

Repos behind a login, an access form or an acceptance gate at the source are skipped. We do not copy gated files and we do not bypass a gate.

## Rules for every listing

- The license text and a checksum are shown with every file.
- A license change at the source is checked on each sync. A change to a license off the list moves the model to review.

## DECISION (Allternit)

- DECISION (Allternit): Add Llama-style community licenses after audit, or keep them off. Draft default: off until counsel reads them.
- DECISION (Allternit): Add GPL, LGPL, MPL and OpenRAIL-M to the list. Draft default: not in v0.
- DECISION (Allternit): Whether a license with a use restriction (for example an acceptable use clause) may pass the audit. Draft default: only with click-through and counsel sign-off.

## Verify with counsel

- Whether each listed license allows hosting and mirroring of weights as we do it.
- Click-through wording and how we record acceptance without storing personal data.
- Treatment of licenses that cover code and weights differently.
