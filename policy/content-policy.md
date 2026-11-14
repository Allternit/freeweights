# Freeweights Content Policy

Status: Draft. Owner: Allternit. Published at /ethos with the takedown counts.

## Allowed

- All open model types: language, vision, speech, image, embedding, and others. Each needs a license on the allow-list (license-allowlist.md) and a checksum for every file.
- Abliterated models. The card must say what was changed, from which base model, and by which method. This is the what-changed card.
- Repos tagged not-for-all-audiences are out by default and listed only after a person reviews them.
- Data-only file formats: safetensors, GGUF, MLX and ONNX, and after a header check CoreML, CTranslate2, TFLite, OpenVINO and ggml (see inclusion-policy.md). No pickle-only weights.
- General speech models, such as Kokoro, that do not copy one real person.

## Banned

We never list or host:

1. A model made for sexual content. Not now, not later.
2. Child sexual abuse material, or a model built to make it.
3. A face or voice model of a real person without that person's documented consent.
4. A model marketed for fraud, malware or attacks.
5. Malware or secrets (keys, tokens, credentials) in any file or card.
6. Leaked weights, meaning weights the owner did not release.
7. Doxxing data, or datasets of private personal information.
8. Spam: listings made to sell, advertise or game search.

## Presentation-and-intent standard

We judge a listing by how it is presented and what it is for, not only by what it can do.

- A general model that can be misused is allowed. A model that is named, tuned or marketed for a banned use is not.
- Read the card, the name, the author's description and the training data notes. If they point at a banned use, we do not list it.
- If intent is unclear, we ask the author. No answer in 7 days means we do not list it.
- An abliterated model is allowed because it is open and the card is honest. A card that sells it as a tool for a banned use is not.

## Enforcement

Banned items are removed through the takedown process (takedown.md). Every removal is counted on the public page.

## DECISION (Allternit)

- DECISION (Allternit): Who rules on unclear cases in the first 90 days. Draft default: Allternit, with counsel for anything involving a real person.
- DECISION (Allternit): Whether to allow models for adult-themed text that are not made for sexual content (for example general role-play models). Draft default: allowed only if the card and marketing do not present sexual content as the purpose.
- DECISION (Allternit), made: CoreML, CTranslate2, TFLite, OpenVINO and ggml are allowed after a header check of each format. Pickle-only stays refused.

## Verify with counsel

- Wording of the real-person consent standard and what counts as "documented".
- Reporting duties for CSAM and for any model built to make it.
- Whether the sexual-content ban and the abliterated-model welcome conflict anywhere in the terms.
- Liability position for hosting models we did not train.
