---
title: What gets listed
nav_label: What gets listed
summary: If Hugging Face lists a model we list it, hosted or from the publisher; the four gates (format, license, content, hygiene) and the tiers.
group: Policy
order: 7.5
updated: 2026-11-14
sections:
  - {id: list-all, title: "If Hugging Face lists it, we list it"}
  - {id: gates, title: The four gates}
  - {id: formats, title: Formats and the header check}
  - {id: tiers, title: Tiers}
  - {id: record, title: What each entry records}
  - {id: queue, title: The review queue}
---
Rules decide what gets listed, not one person reading every repo. The same rules are code in the public repo: `scripts/inclusion.py`, `scripts/formats.py`, `policy/licenses.json` and `scripts/classify.py`, which applies them with no network.

## If Hugging Face lists it, we list it {#list-all}

Every repo that discovery finds on Hugging Face gets a catalog entry, unless a gate below refuses it. The review queue is no longer a hold list: a license no person has read does not keep a model off the catalog. The license decides only how the entry works:

- **Hosted (signed).** The license allows copies with no click-through or acceptance gate at the source and no territory limit. The entry has a signed manifest and our sources, and the license file is one of the manifest's files when the repo has one. Permissive licenses, the custom licenses a person read, and three families whose terms show on the entry: OpenMDW 1.1 (keep the agreement and copyright notices with the files), LFM 1.0 (commercial use only for organisations under US$10M annual revenue) and OpenRAIL++-M (the use restrictions in Attachment A pass on to you).
- **From the publisher (link only).** The entry shows the facts and sends the download to the publisher's Hugging Face page. No manifest, no copy. Every such entry says why:
  - *Gated:* the license must be accepted at the source (Llama 2, 3.x and 4, Gemma, DINOv3), or Hugging Face marks the repo gated.
  - *Non-commercial:* Qwen Research, FLUX non-commercial, FLUX Kommunity, CC BY-NC and any declared license name that says non-commercial.
  - *Territory-limited:* the grant covers only some countries (Tencent Hunyuan community, MiniMax-H3), and a worldwide hub cannot limit who downloads.
  - *License not reviewed:* no person has read the license yet (held ids such as `other`, unknown license texts, a base model that declares no license). The entry says "License not reviewed. Read it on the publisher's page."

Never listed, whatever Hugging Face shows: a model made for sexual content; pickle-only weights (refused at the format gate because the file can run code on your machine, not because of hosting); a repo with no license at all; and a repo the content gate holds for a person (a real person's face or voice, fraud or attack tools) until a person decides.

## The four gates {#gates}

Every candidate passes four gates, in this order. The first gate that fails decides.

| Gate | Rule |
| --- | --- |
| 1 Format | Data-only weights. Pickle-only weights are refused. |
| 2 License | A verdict from the [license table](licenses.md): hosted, link only (with the reason) or refused (no license). The strictest verdict along base model, fine-tune and quantization wins. |
| 3 Content | A model made for sexual content is refused. A real-person face or voice model, or a tool for fraud or attacks, goes to a person. Tagged not-for-all-audiences: out unless a person reviews it. Abliterated models are allowed, labeled with what changed. |
| 4 Hygiene | A model card over 500 bytes. No CI or test fixtures. An exact re-upload becomes `same_as` the first copy, and the lab's own copy wins. |

## Formats and the header check {#formats}

Accepted: safetensors, GGUF, MLX and ONNX, and after a header check CoreML, CTranslate2, TFLite, OpenVINO and ggml.

Several of these formats use `.bin`, the same extension PyTorch pickles use, so a file name proves nothing. The build reads the first 64 bytes of one file per format and checks its magic bytes or structure: `GGUF` for GGUF, the ggml magics, `TFL3` for TFLite, the version and spec name of a CTranslate2 model, a JSON header for safetensors, the paired `.xml` for OpenVINO. A file that starts like a pickle or a zip fails every `.bin` format.

## Tiers {#tiers}

| Tier | Rule |
| --- | --- |
| T0 Lab | Publisher on the watch list, and released in the last 36 months, or 1,000+ downloads a month, or 100+ likes. |
| T1 Proven | 10,000+ downloads a month, or 200+ likes, or in the trending top 1,000 on two runs. |
| T2 Used | 1,000+ downloads a month, with a rule-based license verdict. |
| Variants | Quantizations and adapters attach to their base model as a Variants row. |
| Benchmark override | Top 50 of a named public leaderboard, shown with the source and the date. |

Popularity never delists. Once listed, an entry stays when its numbers drop, so links do not rot.

## What each entry records {#record}

- `kind`: model, dataset or tool. It is part of the key, because model and dataset names collide at the source.
- `relation`: base, fine-tune, quantization, adapter or merge, with the parent id.
- `tier`, and `signals`: downloads in the last 30 days, likes and trending rank when known.
- `audit`: how the license verdict was reached and when. `tag` means the publisher's own license tag, with no person reading it, and the page says "license as declared by the publisher".

## How the catalog is ordered {#order}

The catalog and search list official lab repos first, then base models, then fine-tunes, then downloads in the last 30 days. Tier T0 comes before T1 and T2, and a base model comes before a fine-tune, a quantization or an adapter. A quantization or adapter whose base is listed does not get its own card in the catalog. It shows as a row under Variants on its base's page, and a search for its name still finds it. Order is never for sale.

## The review queue {#queue}

A license text that is not on the table is listed as a link only, labelled "License not reviewed", until a person reads it. Texts are grouped by their sha256, so one read clears every repo that ships the same text. Only the content gate still holds a repo back for a person.
