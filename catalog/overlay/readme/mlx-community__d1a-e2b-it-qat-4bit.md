<p align="center"><img src="https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4/resolve/main/d1a-avatar.png" width="200" alt="D1A avatar: an anime girl with silver-white and dark purple hair, round glasses and headphones on a round #D1A badge"></p>

# D1A-E2B-it QAT · MLX 4-bit

This repository mirrors [JohnP1/d1a-e2b-it-qat-mlx-q4](https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4) (revision `72cd92ff`) byte for byte (the same files, checked by LFS sha256); only this card differs. Its tags match the source's.

**What it does:** decisions (`/v1/systemone`), chat (OpenAI-format `/v1/chat/completions`, streaming included), and
**photos, voice clips and video** (`/v1/systemone/media`). One model on Apple Silicon (MLX), 2.7 GB plus 1.0 GB of encoders.

**A small decision model for Apple Silicon: give it a document and a few questions, and it picks the answers.** Each question
is yes/no, multiple choice or a score; D1A returns a calibrated probability for every option in one forward pass, with no
generated text, so every answer is a valid option.

## Versions

| version | date | what changed | load it with |
|---|---|---|---|
| **v0.7** (main) | 2026-10-30 | fine-tuned on English and Japanese dialogue acts and intents: better at "did they agree?", "is that just thanks, or a request?" and "a command or just talk?" | `mlx-community/d1a-e2b-it-qat-4bit` |
| v0.6 | 2026-10-25 | the D1A adapter retrained on Google's QAT int4 trunk | `mlx-community/d1a-e2b-it-qat-4bit@v0.6` |

Only the adapter, the pointer head and the calibration temperature differ between the two; the trunk, the encoders and every
file's shape are the same. The [v0.6 card](https://huggingface.co/mlx-community/d1a-e2b-it-qat-4bit/blob/v0.6/README.md) has v0.6's
scorecard and the QAT retrain's story.

## What v0.7 is better at, and what it is not

Measured on an Apple M1 Max, both versions as served, Δ in points with paired 95% intervals.

**Better: dialogue-act decisions in English and Japanese** (498 held-out questions written for D1A, by a different writer
than the training questions, in ten domains the training rows did not use, such as a video call, a library, gardening and a
museum guide; the closest pair is hotel services here and hotel booking in training):

| | v0.6 | v0.7 | Δ |
|---|---|---|---|
| all | 72.1 | **88.0** | **+15.9 [+12.2, +19.7]** |
| English | 73.9 | 90.8 | +16.9 [+12.0, +22.1] |
| Japanese | 70.3 | 85.1 | +14.9 [+9.2, +20.5] |

The questions: did the user agree to what the assistant asked (yes / no / unclear: a counter-question, a hedge, a
correction)? Is this only thanks or an acknowledgement, or is there a request after it? Which command did the user mean, or
were they just talking? Which listed item do they mean?

**Not better: intent classification.** On MASSIVE 1.1 (60 intents, English and Japanese, with a "none of these" option):
scenarios it trained on 70.8 → 69.7 (−1.2 [−3.7, +1.5]); scenarios held out of training 78.0 → 80.0 (+2.0 [−0.3, +4.3]). v0.7
picks "none of these" a little more often when a real intent fits (37 times against 30 in 600).

**Everything else** (every D1A suite: `scripts/quality_gate.py --all-suites`, `scripts/decide.py`):
- pooled over 22 suites: −0.38 [−0.87, +0.09]; one significant win (devtools-v1 +1.7 [+0.3, +3.0]), no significant loss;
- **calibration slightly worse on some suites:** the refitted temperature is 1.91 (v0.6: 1.55), and expected calibration error
  rose on typesafe (0.061 → 0.100), JGLUE test (0.027 → 0.048), WANLI (0.175 → 0.205, 0.187 → 0.215) and the hand-checked PRs
  (0.104 → 0.149); it fell on documents-v1 (0.045 → 0.026) and night2 dates (0.042 → 0.022);
- the demos: 3 answers changed across the 145 demo requests. One voice clip's intent is now right ("the customer is not home", which v0.6 read as
  "report a damaged parcel"); two `urgent` flags that were near ties flipped to urgent;
- **speed: unchanged.** v0.7 has v0.6's shape and does the same work per answer. decide.py's latency veto (V3) did fire
  (v0.7 against v0.6 1.018, line 1.016). A follow-up measurement put a byte-identical copy of v0.6 in the same slot and got
  1.032, so the gap comes from serving two different files, not from v0.7. That audit's own pre-set rule still kept the
  veto, and **v0.7 is released by the owner's decision of 2026-10-30.**

## What's inside

- **The trunk:** Gemma 4 E2B-it QAT ([google/gemma-4-E2B-it-qat-w4a16-ct](https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct),
  revision `971342c0`), its 276 int4 linear layers stored bit for bit as MLX 4-bit (the same packed words and scales,
  dequantization error 0.0); token and per-layer embeddings 4-bit in groups of 64. 2.7 GB.
- **The D1A adapter, unmerged** (`adapter/`, LoRA rank 16, 97 MB). With the adapter off the model is Gemma 4 E2B-it QAT
  itself, so the same weights also chat.
- **The pointer head** (`head.safetensors`).
- **Calibration temperature 1.91** in `d1a_config.json`, fitted on this build's own answers: 3,178 rows from the decision-v7
  calibration split and the PR-label development set, v0.6's recipe. Expected calibration error 0.084 → 0.030 out of fold. Both
  sets come from corpora the model trained on, which the fit records.
- **Routing temperature 1.59** in `d1a_config.json`, for requests that send `"use_case": "routing"` (jonpol01/d1a#385; tag
  `routing-t1.59`): fitted on this build's answers to 315 routing questions (270 generic development, 45 hand-labelled). On
  the 640 factory development questions, not used for the fit but from the same corpus as the training data, calibration
  error 0.027 → 0.018 and confident errors 0.022 → 0.011, accuracy unchanged (0.933). On the fit rows themselves the gain is
  within noise (90% interval for the temperature 1.05 to 1.91). No top answer changes: in the quality gate only the routing
  requests moved (largest change 0.043). Every other request uses 1.91.
- **`media/`**: Gemma 4's vision and audio encoders from the QAT checkpoint (bf16, 1.0 GB), unchanged from v0.6.
- **`media_pad_row.safetensors`** (jonpol01/d1a#394; tag `v0.7-media-pad-row`): the pad token's per-layer embedding row as the
  QAT checkpoint stores it (8,960 bf16 values, 18 KB), named `media_pad_row` in `d1a_config.json`. Photos, voice and video
  read it at their media positions instead of the 4-bit table's row, whose error added up over hundreds of positions. Text
  answers do not change. D1A reads it from jonpol01/d1a#394 on (main after 0.7.0); an older D1A ignores it and answers media
  as before, as do the `v0.7` and `routing-t1.59` tags, which predate it.

## Training (v0.7)

- warm start from v0.6's adapter, on the same exact QAT trunk;
- one epoch of 7,008 records: 2,100 from MASSIVE 1.1's training split (English and Japanese, 20 utterances per intent and
  language; every utterance for the four rarest intents), 1,248 dialogue-act questions written for D1A (English and
  Japanese; private), 60 amount-confirmation questions, and
  3,600 replayed from every earlier D1A training source (PR labels in English and Japanese, blast radius, hard, devtools,
  documents, JGLUE, routing, decision-v7), so no earlier skill went untrained;
- the evaluation questions are kept apart from training: different MASSIVE ids, two scenarios held out entirely (transport,
  email), and dialogue-act domains the training rows did not use, screened for near-duplicates;
- learning rate 2e-5, batch 8, 876 steps, 3.2 hours on an Apple M1 Max (MPS);
- **exactness:** 276 of 276 quantized linear layers identical to the QAT checkpoint (words, scales and biases).

## Run it

```bash
pip install "d1a[serve,mlx,media] @ git+https://github.com/jonpol01/d1a"
python -m d1a.serving.serve --run mlx-community/d1a-e2b-it-qat-4bit --port 8009
```

v0.6 instead: `--run mlx-community/d1a-e2b-it-qat-4bit@v0.6`.

A decision:

```bash
curl -s localhost:8009/v1/systemone -H 'content-type: application/json' -d '{
  "state": "Assistant: Shall I cancel the 3 pm meeting?\nUser: is that the one with the client?",
  "questions": {"answer": {"type": "choice", "instructions": "Did the user agree to the assistant'"'"'s question?",
                           "criteria": {"yes": "Agrees: go ahead", "no": "Refuses, wants to wait, or corrects it",
                                        "unclear": "Neither: a counter-question, a hedge, or something unrelated"}}}
}'
```

It answers `unclear` (0.62), a counter-question; "not yet, I need to check first" answers `no` (0.96) and "sure, why not"
`yes` (0.99). About 70 ms per decision on an Apple M1 Max.

A photo, voice clip or video: the same request with a `media` field. `type` is `image` (JPEG, PNG, WebP), `audio` (WAV, FLAC
or OGG, up to 30 s) or `video` (MP4, MOV or WebM, up to 32 MB; 16 frames sampled evenly, the sound track not used):

```bash
curl -s localhost:8009/v1/systemone/media -H 'content-type: application/json' -d '{
  "media": {"type": "image", "data": "'"$(base64 -i parcel.jpg)"'"},
  "questions": {"damaged": {"type": "noul", "instructions": "Is the parcel damaged?"}}
}'
```

Chat (the adapter is switched off for it, so this is Gemma 4 E2B-it QAT itself):

```bash
curl -s localhost:8009/v1/chat/completions -H 'content-type: application/json' -d '{
  "messages": [{"role": "user", "content": "Name three things to check when a parcel arrives damaged."}]
}'
```

or in-process: `from d1a import D1A; D1A.load("mlx-community/d1a-e2b-it-qat-4bit").decide(state, questions)`.

## Limits

- **Act on a "yes" only above a confidence threshold.** In dialogue-act tests v0.7 still reads some refusals and hedges as
  agreement; an app that acts on the answer should confirm when the top probability is below about 0.6.
- **Intent classification did not improve** (above), and calibration is a little worse on some suites. For task types far from
  D1A's own, the v0.6 card's transfer-v4 note still applies.
- **Photos, voice and video** were checked on the demo requests only, zero-shot as on every D1A-E2B-it build.
- **Against full precision** (fp32 PyTorch on a CUDA GPU, jonpol01/d1a#386): decisions within 0.051 (mean 0.008); photos, voice
  and video up to 0.085 (mean 0.019) with `media_pad_row.safetensors`, no top answer different (before it: 0.140, mean 0.034,
  2 of the 28 media answers' top choices different where full precision is sure). The PyTorch build is within 0.034 on the
  same media requests. Two long-video answers carry most of what is left (jonpol01/d1a#386).
- **`<bos>`:** the model was trained with id 2 at the start of every record; d1a adds it (`leading_ids: [2]`). An app that
  encodes requests itself must prepend it.
- Questions are in English; the documents can be English or Japanese.
- Everything on the [D1A-E2B-it card](https://huggingface.co/JohnP1/d1a-e2b-it) applies: experimental, and agent tool calls go
  through D1A's fail-safe thresholds (`d1a.agents.presets.advise`).

## License and data

Apache-2.0. Base model: Gemma 4 by Google (Apache-2.0). Code: [github.com/jonpol01/d1a](https://github.com/jonpol01/d1a), built
on Kev by Jared Palmer (Apache-2.0). Intent data from MASSIVE 1.1 by Amazon (FitzGerald et al., 2022; CC BY 4.0), English and
Japanese. Japanese decision data derived from JGLUE by Yahoo Japan Corporation and Waseda University (CC BY-SA 4.0).
Pull-request data from NousResearch/hermes-agent (MIT); the labelled PR dataset itself, including the recent PRs, is private.
