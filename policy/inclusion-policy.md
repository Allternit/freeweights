# Freeweights Inclusion Policy (v2)

Status: Draft. Owner: Allternit. Published at /docs/inclusion. Version 2 (2026-11-14): the list-all rule.

This is what decides whether an open model gets listed. The same rules live in code in `scripts/inclusion.py` (gates and tiers), `scripts/formats.py` (formats), `policy/licenses.json` (licenses) and `scripts/classify.py`, which applies them with no network. Keep this page and the code in step.

## If Hugging Face lists it, we list it

Decided by Allternit on 2026-11-14. Every repo that discovery finds on Hugging Face gets a catalog entry, unless a gate below refuses it. The review queue is no longer a hold list: a license no person has read does not keep a model off the catalog. The license decides only how the entry works:

- **Hosted (signed).** The license allows copies with no click-through or acceptance gate at the source and no territory limit. The entry has a signed manifest and our sources, and the license file is one of the manifest's files when the repo has one. Permissive licenses, the custom licenses a person read, and three families whose terms show on the entry: OpenMDW 1.1 (keep the agreement and copyright notices with the files), LFM 1.0 (commercial use only for organisations under US$10M annual revenue) and OpenRAIL++-M (the use restrictions in Attachment A pass on to you).
- **From the publisher (link only).** The entry shows the facts and sends the download to the publisher's Hugging Face page. No manifest, no copy. Every such entry says why:
  - *Gated:* the license must be accepted at the source (Llama 2, 3.x and 4, Gemma, DINOv3), or Hugging Face marks the repo gated.
  - *Non-commercial:* Qwen Research, FLUX non-commercial, FLUX Kommunity, CC BY-NC and any declared license name that says non-commercial.
  - *Territory-limited:* the grant covers only some countries (Tencent Hunyuan community, MiniMax-H3), and a worldwide hub cannot limit who downloads.
  - *License not reviewed:* no person has read the license yet (held ids such as `other`, unknown license texts, a base model that declares no license). The entry says "License not reviewed. Read it on the publisher's page."

Never listed, whatever Hugging Face shows: a model made for sexual content; pickle-only weights (refused at the format gate because the file can run code on your machine, not because of hosting); a repo with no license at all; and a repo the content gate holds for a person (a real person's face or voice, fraud or attack tools) until a person decides.

## Gates

Every candidate passes four gates, in this order. The first gate that fails decides.

1. **Format.** Data-only weights. Accepted: safetensors, GGUF, MLX and ONNX, and, after a header check, CoreML, CTranslate2, TFLite, OpenVINO and ggml. The header check reads the first 64 bytes of one file per format and checks its magic bytes or structure, because several of these formats use `.bin`, the same extension PyTorch pickles use. Pickle-only weights are refused.
2. **License.** A verdict from the license table. Hosted: permissive or custom. Link only: gated, territory-limited, non-commercial, copyleft (GPL, LGPL, AGPL), a barred derivative, or license not reviewed. Refused: no license declared. The strictest verdict along base model, fine-tune and quantization wins. A quantization with no license tag of its own takes its base model's verdict, because a quantizer cannot relicense the weights. A base model that declares no license makes its derivatives link only as not reviewed. A license that is off the table is listed as a link only, not held. See the license page.
3. **Content.** A model made for sexual content is refused, now and later. A real-person face or voice model without documented consent, and a tool marketed for fraud or attacks, go to a person and are refused when that is what they are. A repo tagged not-for-all-audiences is out unless a person reviews it. Abliterated models are allowed, with a card that says what changed. Exception: an abliterated derivative of a model whose governing license is the NVIDIA Open Model License is never hosted, only linked, because that license ends your rights if you "bypass, disable, reduce the efficacy of, or circumvent any ... safety guardrail". A derivative of a CC BY-ND 4.0 model (quantization, fine-tune, merge, adapter) is link only for the same reason: only the unchanged original is hosted. A person's decision on a held repo (list or refuse) is recorded in `catalog/_review/content-decisions.json` and published with the code. It cannot override the refusal for sexual content.
4. **Hygiene.** A model card over 500 bytes. No CI or test fixtures. An exact re-upload (the same weight sha256s as a listed repo) becomes `same_as` the first copy, and the lab's own copy wins.

## Tiers

A candidate that passes every gate is listed when it reaches a tier. Repos the review queue held before the list-all rule are listed whatever their tier. Popularity never delists: once listed, an entry stays when its numbers drop, so links do not rot.

| Tier | Rule |
| --- | --- |
| T0 Lab | Publisher on the watch list, and released in the last 36 months, or 1,000+ downloads a month, or 100+ likes. New releases list at once. |
| T1 Proven | 10,000+ downloads a month, or 200+ likes, or in the trending top 1,000 on two discovery runs. |
| T2 Used | 1,000+ downloads a month, with a rule-based license verdict (`tag`, `text-hash`, `inherited` or `reviewed`). |
| Variants | Quantizations and adapters attach to their base model as a Variants row, not a card of their own. |
| Benchmark override | Top 50 of a named public leaderboard, shown with the source and the date. |

## What each entry records

- `kind`: model, dataset or tool. The kind is part of the key, because model and dataset names collide at the source.
- `relation`: base, fine-tune, quantization, adapter or merge, and the parent id.
- `tier`, and `signals`: downloads in the last 30 days, likes and trending rank when known.
- `audit`: how the license verdict was reached (`tag`, `text-hash`, `inherited`, `reviewed` or `queue`) and when. For `tag` the page says "license as declared by the publisher".
- `license_class` and, for a link-only entry, `link_reason` (`gated`, `territory`, `non-commercial`, `copyleft`, `restricted` or `not-reviewed`). A hosted entry with terms carries `license_terms`. The site shows "Hosted (signed)" or "From the publisher" and the reason on every list row and detail page.

## Review queue

Unknown license texts are grouped by the sha256 of the text. A person reads each text once, and the decision clears every repo that ships it. Until then those repos are listed as a link only ("License not reviewed"). The queue file (`catalog/_review/queue.json`) now holds only the repos the content gate keeps for a person.
