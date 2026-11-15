# Humaneness Voice Large 1.7

**Expressive speech in English, German, French, Spanish and Dutch.**

Write the words and direct the performance: emotion, conversational delivery,
pauses and vocal reactions. Use a clean reference recording to guide the speaker
identity, or generate a voice without a reference.

**▶ [Watch the video: Humaneness Voice Large 1.7](https://youtu.be/rSRAkc1jAJQ)**

## Optimized streaming and batch serving

Large 1.7 now has a tested BF16 serving path with cached references, semantic
CUDA graphs/Inductor compilation, optimized acoustic-token and codec decoding,
and growing streaming chunks. The portable `infer.py` below remains a separate
full-utterance reference path; serving flags do not automatically modify it.

| Model | GPU | First PCM over local HTTP | On-device RTF | Audio seconds / compute second |
| --- | --- | ---: | ---: | ---: |
| Small 1.1 Alpha RL r128 v1 | RTX 3090, 24 GiB | 0.394 s | 0.1669 | 5.99 |
| Large 1.7 | RTX 3090, 24 GiB | 0.470 s | 0.2873 | 3.48 |

These are matched **single-stream** results on one RTX 3090: CFG 2,
temperature 0.8, the same structured prompt/reference and three warm repeats,
with final alignment disabled. First PCM is a local HTTP measurement; RTF is
TTS-plus-codec device time divided by generated duration. Browser playback,
ASR, LLM and cold loading are separate. Large reaches 15.45 audio seconds/s in
a short 16-candidate offline probe at CFG 2; the deployed batch cap remains 8.

**[Measured optimization recipes, Small/Large tables, hardware and reproducible
code](ROBBY_RTX3090.md)** · [Inference and batching notes](INFERENCE_OPTIMIZATIONS.md) ·
[Switch models in Robby](https://github.com/christophschuhmann/cartoon-face-generator/blob/main/robby/voice-assistant/LARGE17.md).
Historical Small measurements on Jetson Thor are labelled separately in the report.

## Listen and find your prompting recipe

| Start here | What you will find |
|---|---|
| **📖 [Prompting guide — the basic format](PROMPTING.md)** | Learn `GENERAL:` / `SCRIPT:`, inline directions, vocal bursts, timing, references and CFG. Start here to write your first prompt. |
| **🧪 [Interactive 1.7 prompting manual with audio](https://laion-humaneness-voice-large-1-7-prompting-manual.static.hf.space/)** | Find searched recipes for **40 emotions, 15 talking styles and 18 vocal-burst classes** in five languages. Hear selected recipes beside matched baselines, compare all six held-out takes and copy exact prompts and CFG settings. |
| **🤖 [Agent reference](manual/AGENT_GUIDE.md) · [Machine-readable recipes](manual/recipes.jsonl)** | Read the input contract and retrieve configurations by target and language. Only `usable: true` identifies a recipe that passed the declared held-out gates. |

The manual covers **455 target/language/condition combinations**. Its main audio
players are visible directly; starting a clip pauses the others. Expand a
condition for the remaining test takes, exact instructions and CFG comparison.
Exploratory results are labelled, so an audible example is not automatically
a validated recommendation.

## Prompting in one minute

Pass two separate inputs: **`text` is exactly what should be spoken**;
**`prompt` describes how to perform it**. The standard format is:

```text
GENERAL: A natural, close conversation. The speaker is trying to contain
strong anger rather than turning the whole line into a shout.
SCRIPT:
(intensely angry, held back) [3.2 seconds duration] You knew what this meant to me.
[0.4 seconds pause]
(quieter, the anger still present) [2.5 seconds duration] And you did it anyway.
```

The separate `text` is:

```text
You knew what this meant to me. And you did it anyway.
```

- **`GENERAL:`** describes the overall voice, scene and audible delivery.
- **`SCRIPT:`** repeats the spoken words and places directions at the relevant beat.
- **Round parentheses** contain local delivery or non-speech reactions, such as `(quietly angry)` or `(sharp gasp, 0.3 seconds)`. Keep these out of `text`.
- **Square brackets** can request duration and pauses. Some searched recipes instead place duration inside round parentheses; copy the recorded recipe's syntax when reproducing its results.
- Keep performance instructions in English where practical; dialogue can be in any of the five supported languages.

Requested timing is learned conditioning, not a guaranteed editing boundary.
For masking, hesitation, vocal bursts and complete examples, read the
**[prompting guide](PROMPTING.md)**. To choose wording and CFG for a particular
emotion or style, use the **[interactive manual](https://laion-humaneness-voice-large-1-7-prompting-manual.static.hf.space/)**.

## Quick start

This repository contains **complete merged 1.7 weights**. Ordinary inference
does not require attaching an adapter.

Install a CUDA-enabled PyTorch build for your server, then the dependencies:

```bash
hf download laion/Humaneness-Voice-Large-1.7 --local-dir humaneness-large17
cd humaneness-large17
pip install -r requirements.txt
python infer.py --language en --seconds 9.2 --seed 1701 \
  --text 'I thought you had forgotten. You remembered every little detail. I am so glad you came back.' \
  --prompt-file examples/prompt-en.txt --output example.wav
```

The custom implementation requires `trust_remote_code=True`; review the code
before loading. Root weights are stored in FP32. The supplied inference loader
uses BF16 weights and compute. The separate
[MOSS Audio Tokenizer v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2)
retains its upstream terms.

### Add a reference voice

Add `--reference-wav clean-speaker.wav` to the command above. Use clean speech
from one speaker, with different words from the requested output. Supply at
least **5.04 seconds**; the helper crops the waveform to **14.96 seconds before
encoding**. It does not use the historical 2.96-second cap. Reference audio
guides identity but does not guarantee exact voice preservation.

For repeated requests, keep the model and codec resident:

```python
from pathlib import Path
import infer

model, processor, api = infer.load()
api.load_codec(processor, "OpenMOSS-Team/MOSS-Audio-Tokenizer-v2")
reference = infer.reference_codes(processor, Path("clean-speaker.wav"))

codes = infer.generate_codes(
    model, processor, api,
    text="I am so glad you came back.",
    prompt="GENERAL: Warm, natural relief.\nSCRIPT:\n"
           "(quiet relief) [3.0 seconds duration] I am so glad you came back.",
    seconds=3.0, language="en", seed=1701, reference=reference,
)
waveform, sample_rate = api.decode(processor, codes)
```

### Adjust classifier-free guidance

For a guided take, try:

```bash
python infer.py --language en --seconds 9.2 --seed 1701 \
  --text 'I thought you had forgotten. You remembered every little detail. I am so glad you came back.' \
  --prompt-file examples/prompt-en.txt \
  --cfg 2.5 --neutral-prompt-file examples/neutral-en.txt \
  --output example-cfg.wav
```

The neutral branch must keep the same literal words, durations and reference;
remove only the emotional/style treatment. **CFG 1 means guidance off.** CFG 2.5
is the acting showcase setting, not an optimum for every condition. The manual
reports condition-specific CFG searches. Those searches used the **merged 1.7
model without reference audio or extra adapters**; preserve that setup when
reproducing them.

## Use the manual as a person or an agent

Choose a language and an emotion, talking style or vocal-burst condition in the
[interactive manual](https://laion-humaneness-voice-large-1-7-prompting-manual.static.hf.space/).
Listen to the selected recipe and paired baseline, then inspect the exact
conditional and neutral prompts. All six held-out takes remain available,
including failures; recipe selection does not cherry-pick a test recording.

For programmatic use, start with [manual/AGENT_GUIDE.md](manual/AGENT_GUIDE.md)
and [manual/recipes.jsonl](manual/recipes.jsonl). Match the target, language and,
for vocal bursts, surrounding-emotion condition. Check `usable` and the evidence
status before treating a recipe as a recommendation. The linked evidence
preserves prompts, sampling settings, raw scores and audio.

The earlier [1.5/1.6 manuals](https://laion-humaneness-voice-large-prompting-manuals.static.hf.space/synthesis/index.html)
document different weights. Their specialist adapters and preferred CFG values
are historical evidence; use the **1.7 manual above** for this model's measured
recipes.

## What is included

| Location | Purpose |
|---|---|
| Root config, tokenizer and safetensors shards | Complete merged **1.7** model; no adapter required |
| [PROMPTING.md](PROMPTING.md) | Basic human-readable prompting guide |
| [manual/](https://huggingface.co/laion/Humaneness-Voice-Large-1.7/tree/main/manual) | Agent guide and machine-readable search recipes |
| [infer.py](infer.py) | Reference inference, optionally with a speaker reference or CFG |
| [INFERENCE_OPTIMIZATIONS.md](INFERENCE_OPTIMIZATIONS.md) | Batching, true logit CFG and throughput guidance |
| [adapter/adapter.safetensors](adapter/adapter.safetensors) | Original selected rank-32 adapter, update 44,250 |
| [parent_model/](https://huggingface.co/laion/Humaneness-Voice-Large-1.7/tree/main/parent_model) | Exact High-8654 parent, rounded to BF16 as in the original evaluation |
| [runtime/native_adapters.py](runtime/native_adapters.py) | Original custom FP32 residual adapter implementation; not PEFT |
| [runtime/native_cfg.py](runtime/native_cfg.py) | Evaluated twelve-channel logit CFG implementation |
| [training/](https://huggingface.co/laion/Humaneness-Voice-Large-1.7/tree/main/training) | Portable reference trainer, recipes and original training snapshots |
| [TRAINING.md](TRAINING.md) · [provenance.json](provenance.json) | Training history and exact model provenance |
| [stats/](https://huggingface.co/laion/Humaneness-Voice-Large-1.7/tree/main/stats) · [examples/canary/](https://huggingface.co/laion/Humaneness-Voice-Large-1.7/tree/main/examples/canary) | Selection evidence, merge audit and canary audio |

**Do not apply the included adapter to the merged root model again.**
For the original unmerged arithmetic, `python infer.py --unmerged ...` loads
`parent_model/` plus the adapter exactly once. This native control is useful
because merging changes BF16 rounding and can change sampled speech.

## Training and model lineage

1.7 combines the **Acting High-8654 supervised checkpoint** with its selected
**rank-32 acting adapter at update 44,250, scale 1.0**. This is a supervised
branch from [Large 1.3 Alpha](https://huggingface.co/laion/Humaneness-Voice-Large-1.3-Alpha).
It does not contain the 1.4/1.5 RL adapter stack and is not Large 1.6 with
another adapter attached.

The 1.3 ancestor first received a full supervised acting continuation. The
High-8654 checkpoint then received a rank-32 adapter trained on a per-language
union of top 1% emotion/style takes and top 2% genuineness-plus-blend takes.
The adapter schedule ran for three epochs; 1.7 selects update 44,250 rather
than the final 58,944. Training covers EN, DE, FR, ES and NL. See
[TRAINING.md](TRAINING.md) for source mixture weights and the full recipe.

To fine-tune with compatible data, start with
[training/train_reference.py](training/train_reference.py).

### Architecture

The hierarchical MOSS Local Transformer TTS model has **4,129,990,144 unique
base parameters**: a Qwen3-family semantic transformer and a local Talker.
Each 80-ms frame produces 12 indices, one per codec codebook, each with 1,024
possible values: 12.5 frames/s × 12 = 150 codec indices/s. The separate codec
returns 48-kHz mono audio. The model does not generate all 32 codec books.

## Checkpoint selection results

Seven second-half adapter checkpoints were compared on the same **108 English/
German tasks**: 40 emotions and 14 edge cases, one seed, no reference, CFG 1.
Update **44,250** had the highest frozen composite among the seven complete
matrices:

| Development-selected update 44,250 | Mean |
|---|---:|
| Content Enjoyment, EARS predicted score | 6.3334 |
| Genuineness, EARS 0–6 | 4.2565 |
| Vocal Burst Blend, EARS 0–10 | 7.7503 |
| Requested emotion/style CDF diagnostic | 0.58566 |
| Composite: 40% target + 30% CE/10 + 30% genuineness/6 | 0.63709 |
| Mean per-clip ASR word error rate | 0.05787% |

The target diagnostic is not an accuracy percentage. WER is the arithmetic
mean of per-clip rates, not a corpus-token-weighted rate. Scores are model
predictions, not human listening ratings. The selected state does not maximize
every metric. This was development selection among seven checkpoints, not an
independent held-out confirmation. See [stats/selection.json](stats/selection.json)
for the selection record and paired uncertainty.

Those selection recordings use the original **unmerged BF16-parent/FP32-LoRA
path**. FP32 merging was checked algebraically. The merged BF16 deployment was
then tested against that native control on one fixed script in each language
and one English CFG 2.5 pair. Every take is retained. The
[merge audit](stats/inference_canary.json) does not claim bit-identical sampled
tokens or establish quality gains from five scripts. You can also hear the
[canary audio](https://huggingface.co/laion/Humaneness-Voice-Large-1.7/tree/main/examples/canary) or download its
[listening HTML](stats/merge-canary-listening.html).

The separate **1.7 evolutionary manual** tests recipes on the merged model;
its held-out recipe evidence should not be confused with the checkpoint
selection study above.

## Throughput and streaming

Reuse a resident model and codec, cache reference codes and batch compatible
candidate generations. Best-of-N selection must finish its candidates before
choosing a winner. Streaming latency and offline throughput are separate goals.

The [Humaneness-Voice server](https://github.com/LAION-AI/Humaneness-Voice)
contains batching, streaming and optional graph/kernel optimizations. Its
published 0.16-second onset is a **Small-model Jetson Thor result**, not a 1.7
measurement. This release provides a full-utterance reference path and batched
same-condition CFG helper; it does not claim that every historical server or
CUDA graph is validated for 1.7. Read the
[inference and optimization guide](INFERENCE_OPTIMIZATIONS.md) before reporting
speed measurements.

## License and use

New model contributions and release materials are **[CC BY 4.0](LICENSE)**.
Keep [NOTICE.md](NOTICE.md) and upstream notices. External codecs, software and
training datasets retain their own terms. CC BY does not grant rights over
another person's identity. Use consented references, identify synthetic
material appropriately and test the model before deployment.
