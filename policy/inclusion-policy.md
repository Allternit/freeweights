# Freeweights Inclusion Policy (v1)

Status: Draft. Owner: Allternit. Published at /docs/inclusion.

This is what decides whether an open model gets listed. The same rules live in code in `scripts/inclusion.py` (gates and tiers), `scripts/formats.py` (formats), `policy/licenses.json` (licenses) and `scripts/classify.py`, which applies them with no network. Keep this page and the code in step.

## Gates

Every candidate passes four gates, in this order. The first gate that fails decides.

1. **Format.** Data-only weights. Accepted: safetensors, GGUF, MLX and ONNX, and, after a header check, CoreML, CTranslate2, TFLite, OpenVINO and ggml. The header check reads the first 64 bytes of one file per format and checks its magic bytes or structure, because several of these formats use `.bin`, the same extension PyTorch pickles use. Pickle-only weights are refused.
2. **License.** A verdict from the license table: permissive, custom (click-through), non-commercial (link only) or refused. The strictest verdict along base model, fine-tune and quantization wins. A quantization with no license tag of its own takes its base model's verdict, because a quantizer cannot relicense the weights. A base model that declares no license sends its derivatives to the review queue, not to the refusal log. A license that is off the table waits in the review queue and is not listed. See the license page.
3. **Content.** A model made for sexual content is refused, now and later. A real-person face or voice model without documented consent, and a tool marketed for fraud or attacks, go to a person and are refused when that is what they are. A repo tagged not-for-all-audiences is out unless a person reviews it. Abliterated models are allowed, with a card that says what changed.
4. **Hygiene.** A model card over 500 bytes. No CI or test fixtures. An exact re-upload (the same weight sha256s as a listed repo) becomes `same_as` the first copy, and the lab's own copy wins.

## Tiers

A candidate that passes every gate is listed when it reaches a tier. Popularity never delists: once listed, an entry stays when its numbers drop, so links do not rot.

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

## Review queue

Unknown license texts are grouped by the sha256 of the text. A person reads each text once, and the decision clears every repo that ships it. Unreviewed means unlisted.
