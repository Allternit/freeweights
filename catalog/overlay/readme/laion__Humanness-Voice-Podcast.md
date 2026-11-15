# Humanness Voice Podcast

**Generate natural, reference-conditioned speech and assemble it into a podcast.** This is the complete Podcast full fine-tune of [Humaneness Voice Large 1.7](https://huggingface.co/laion/Humaneness-Voice-Large-1.7), at training update **9,874**. It contains full BF16 weights, not a LoRA. The model speaks a supplied script; an optional API-based or local language model can write the script and its performance directions.

## 🎧 Listen: five languages, two reference voices

**[Open the public Podcast listening Space →](https://huggingface.co/spaces/laion/Humanness-Voice-Podcast)**

Reference audios, an exact prompt example, and **Best-of-4 → Best-of-2 → Single Take** episodes in **German, English, Dutch, French and Spanish**. The same conversation and reference pair make the variants easy to compare; scripts, measured generation times and review notes are included. No installation or paid API is required to listen.

The full fine-tune uses real podcasts from these five languages — approximately **300 source hours per language** — with a training mixture of **80% podcast and 20% synthetic voice-acting presentations**. The source-hour estimate is distinct from the packed target-token hours reported in [training details and provenance](TRAINING.md).

The current recommended pipeline uses **sparse spontaneous, relaxed and gentle inline directions**, fixed reference voices, and complete-turn Best-of-N. The listener approved this style on 8 November 2026. N=4 is the default; N=2 and N=1 offer cheaper comparisons. Voice conversion, DPO adapters and internal pause compaction are off.

**Start here:** [Prompting templates and LLM-writing guide](guides/PROMPTING.md) · [Single-speaker guide](guides/SINGLE_SPEAKER.md) · [Multi-speaker guide](guides/MULTI_SPEAKER.md) · [Pipeline, rewards and speed details](guides/PIPELINE.md) · [Agent quick reference](guides/AGENT_GUIDE.md) · [Machine-readable defaults](guides/recipe.json) · [Runnable optimized code](optimized_pipeline/)

[Earlier listening study](https://laion-humaneness-podcast-segment-block-pilot.static.hf.space/editing/index.html) · [Training and provenance](TRAINING.md) · [Validation status](VALIDATION.md) · [GitHub implementation](https://github.com/LAION-AI/Humaneness-Voice/tree/main/podcast_pipeline)

## Model and inference at a glance

The MOSS Local Transformer architecture combines a Qwen-family semantic backbone with a local acoustic transformer. It generates twelve acoustic codebook tokens per 80-ms frame. The separately downloaded MOSS-v2 codec renders 48-kHz mono audio. The full Podcast policy has approximately 4.13 billion parameters / 8.26 GB of BF16 weights; codec, judges, KV caches and CUDA graphs need additional memory.

Supply literal speech, a short delivery direction, and one clean fixed reference per voice. The recommended pipeline generates each speaker turn independently, optionally samples several candidates in parallel, selects a winner, audits its words, and assembles lossless turns before exporting MP3, subtitles, timeline JSON and a listening page.

```mermaid
flowchart LR
  A[Human or LLM writes script and sparse cues] --> B[Fixed reference per speaker]
  B --> C[Podcast policy: N candidates per turn]
  C --> D[Native MOSS-v2 audio decoder]
  D --> E[For N above 1: genuineness + ECAPA selection]
  E --> F[Independent transcript and boundary audit]
  F --> G[400 ms word-clock assembly]
  G --> H[MP3 + HTML + JSON + subtitles]
```

N=1 keeps its first and only take and skips online ranking. Each generation uses only its intended speaker's reference. Several different turns can share a GPU batch without sharing their generated histories.

The optimized CLI supports **English, German, Dutch, French and Spanish**. Bundled scripts translate the same twenty-turn conversation; the public Space compares N=4, N=2 and N=1 for each language using the same approved German reference pair. This small fixed-script comparison is not a broad multilingual quality benchmark. Automated content/alignment flags remain visible. The English N4 complete listening edition has one explicitly documented candidate replacement, with the strict original still available.

## Quick start: recommended pipeline

Use a CUDA/BF16-capable GPU; the measured setup is an **RTX 3090 with 24 GB**, Python 3.12, PyTorch 2.6.0+cu124 and Transformers 5.15.0. Install system `ffmpeg` and `libsndfile`, then use a separate environment. Keep enough disk space for all model assets and candidates. No LLM API key is needed.

```bash
hf download laion/Humanness-Voice-Podcast --local-dir humanness-podcast
cd humanness-podcast
python3.12 -m venv .venv
source .venv/bin/activate
pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt

# Fetch the pinned reference/codec/judge assets and record their local paths.
python optimized_pipeline/prepare.py

# One English episode, approved sparse prompting, four takes per speaker turn.
python infer.py --model . \
  --script optimized_pipeline/script-spontaneous-en.json \
  --n 4 --groups 2 --device cuda:0 --output runs/en-best4

# Same German script, two takes per turn; N=1 is a true single take.
python infer.py --model . \
  --script optimized_pipeline/script-spontaneous-de.json \
  --n 2 --groups 4 --device cuda:0 --output runs/de-best2
```

Open `runs/en-best4/index.html`. Without `--script`, the bundled English **and** German episodes are generated. Use `--n 1 --groups 8` for single takes, or omit `--groups` to run the small automatic batch-size pilot. Groups × N must not exceed 16; reduce groups if VRAM is insufficient. The example group settings keep eight simultaneous candidates.

For Dutch, French or Spanish, pass `optimized_pipeline/script-spontaneous-nl.json`, `script-spontaneous-fr.json` or `script-spontaneous-es.json` respectively. Repeat `--script` to generate several languages. The [five-language reproduction commands](guides/PIPELINE.md#reproduce-the-additional-dutch-french-and-spanish-episodes) also show the phased token/codec runner and shared final audit for N=4/2/1 on a GPU with limited free VRAM.

`infer.py` now runs the optimized generation → audit → export route. The former native single/pair driver remains available explicitly as **`infer_legacy.py`**, with its own [legacy guide](guides/LEGACY_PIPELINE.md) and `requirements-legacy.txt` environment. Its identity×inverse-WER reward and Photon ASR differ from the current defaults; the two workflows are deliberately labeled. No old model weights, training code or examples were removed.

## Single-speaker and multi-speaker prompting

Use `GENERAL` for consistent delivery and parenthesized directions for local expression. Keep the literal text separate from acting cues. A single-turn generation gets only that turn's reference. For a multi-speaker episode, keep a stable speaker-to-reference mapping and alternate independently generated turns; see the [full JSON contract](guides/PROMPTING.md).

```text
GENERAL:
A warm, emotionally thoughtful two-host podcast conversation. Very authentic, very genuine.
Natural, intimate, spontaneous spoken delivery with clear words, subtle emotion,
relaxed conversational pacing and brief meaningful pauses.
Be sincere, without an exaggerated announcer voice or forced laughter.
Perform only the current speaker turn and speak exactly the SCRIPT.
Keep the same speaker identity as the reference audio.

SCRIPT:
(warm, curious; relaxed, spontaneous, gently spoken) What if meaning is something we practise?
(gently, as a spontaneous thought) Maybe it begins with noticing who needs us today.
```

Do not include the parentheses in the literal `text` passed to the processor. Do not add speaker labels to the words to be spoken. No “very pleasant/nice to listen to” instruction is used in this approved recipe. Use **one short cue per turn and at most one extra cue at an existing sentence boundary**; do not repeatedly demand strong emotion before every sentence.

The preserved native two-speaker path is different: `infer_legacy.py --mode pairs` uses `(speaker=S1, ...)` and `(speaker=S2, ...)` plus two labeled reference slots in a single call. Its wrapper, prior-context limits and caveats are documented in the [multi-speaker guide](guides/MULTI_SPEAKER.md). Do not mix that wrapper with the optimized one-speaker-per-call route.

## Have a language model write the directions

We recommend using an **API-based or local LLM** to write the dialogue and its sparse cues. Manually formatting every turn and direction is unnecessarily time-consuming. The [prompting guide](guides/PROMPTING.md#use-an-llm-as-the-script-and-direction-writer) includes a reusable writing instruction, JSON templates and validation rules.

Tell the writing model the topic, audience, speaker roles and intended length. Ask for natural conversation, subtle contextual emotion, exact preservation of any supplied transcript, and no more than two delivery chunks per turn. Keep each turn comfortably below 25.6 seconds; split longer explanations. The TTS pipeline does not call an LLM itself or bind you to a particular provider.

For custom scripts use `--script my-script.json`; for your own voices use `--references my-references.json`. Reference paths are relative to the mapping JSON. Keep clean single-speaker anchors of roughly **5–15 seconds**. The approved S1/S2 clips supply 181/163 codec frames (14.48/13.04 s of conditioning), with no old three-second truncation. The [reference provenance](examples/references/PROVENANCE.json) and original source terms remain applicable. Remove or update cached reference codes when replacing a recording.

## Model assets and reproducibility

| Component | Role | Source |
|---|---|---|
| Humanness Voice Podcast, full FT step 9874 | Speech policy | [This repository](https://huggingface.co/laion/Humanness-Voice-Podcast), weight revision `a1f8946bd654db1c19b6c476ed6b4acde384e882` |
| MOSS Audio Tokenizer v2 | Reference encoding and waveform decoding | [OpenMOSS-Team/MOSS-Audio-Tokenizer-v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2) |
| Humaneness Ears Medium | Genuineness, additional diagnostic scores | [laion/humaneness-ears-base-medium](https://huggingface.co/laion/humaneness-ears-base-medium) |
| SpeechBrain ECAPA, 192D | Similarity to the intended reference | [speechbrain/spkrec-ecapa-voxceleb](https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb) |
| Parakeet TDT 0.6B v3 | Final transcript diagnostic | [nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) |
| Qwen3 ForcedAligner | Approximate script-word boundaries for EN/DE/FR/ES; Dutch uses conservative Parakeet TDT estimates | [Qwen/Qwen3-ForcedAligner-0.6B-hf](https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B-hf) |

All asset revisions and commands are in [the pipeline guide](guides/PIPELINE.md). Use fixed model snapshots, script/reference hashes and separate output folders for different recipes. Preserve batch grouping and seeds. Fixed seeds do not imply identical audio across different batch sizes, hardware, precision or software versions. Model weight hashes remain in `EXPORT_PROOF.json`; no model weights changed in this pipeline update.

## Detailed defaults and selection

| Setting | Current value |
|---|---|
| Prompt style | `spontaneous`: restrained, relaxed, gentle, sparse inline cues |
| Precision | BF16 |
| Temperature / CFG | 1.0 / 2.5 |
| Top-p / top-k | 0.95 / 50 |
| Timing | Free timing: `tokens=None`, no inline duration request |
| Maximum per turn | 320 semantic frames = 25.6 seconds |
| Default selection | Best-of-4 complete raw turns |
| Voice conversion / added adapters | Off / none |
| Internal pause compaction | Off |

For N>1:

```text
G = clip(native Humaneness Ears genuineness / 6, 0, 1)
S = clip(cosine(ECAPA(candidate), ECAPA(correct reference)), 0, 1)
reward = 0.5 * G + 0.5 * S
```

Use fixed scales, not per-batch min/max. Compute the correct reference embedding once and reuse it. Select the maximum separately for each turn; exact ties choose the lowest candidate index. **Content Enjoyment and WER do not enter this reward.** N=1 keeps its sole take and does not run online ranking.

Every selected output gets an independent final transcript/alignment audit. The boundary edit preserves up to 80 ms before the first word and 150 ms after the last, with small fades outside those words. Uncertain alignment remains untrimmed and flagged. Reassembly uses a **400-ms word-to-word gap**, including the retained guards, then exports mono 48-kHz / 192-kbps MP3 with a lossless master and audit records. Internal timing is preserved.

A high genuineness/identity score can still select an incomplete sentence. In the approved Best-of-4 sample set, English turn 6's strict winner stopped after its first sentence. The experiment preserves that strict output. An additional full listening copy replaces only that turn with an existing complete alternative, explicitly adding a content eligibility check. It must not be described as unchanged strict reward argmax. See [the exact failure and repair record](optimized_pipeline/benchmarks/spontaneous-2026-11-08.json).

## Speed on RTX 3090 and practical optimizations

These are measured **single-GPU** results for the current sparse-prompt Best-of-4 run. The English row describes the strict experiment, including the flagged incomplete turn; its separately repaired listening copy lasts 201.22 s.

| Language | Final audio | Generation + ranking | Useful RTF | Genuineness / 6 | ECAPA cosine | Mean turn WER |
|---|---:|---:|---:|---:|---:|---:|
| German, N=4 | 219.38 s | 179.98 s | 0.821 | 3.943 | 0.640 | 1.98% |
| English, N=4, strict | 193.30 s | 195.83 s | 1.013 | 3.880 | 0.407 | 5.50% |

RTF = generation/ranking time divided by final edited audio duration; lower is faster. It excludes model loading, correctness checks, final audit and MP3 encoding and is not browser first-audio latency. Both languages together required 380.10 s of production including archival/cleanup, or 645.59 s from process start to exports with an existing compiler cache. The extra listening repair and live-service restoration are excluded.

Implemented optimizations:

- BF16 policy, layerwise semantic CUDA graphs, reusable local-decoder graphs, fast sampling and fused codec kernels. Real-model tests verify the checked codec/token/PCM paths.
- Batch different turns together while preserving independent candidate histories. Two turns × four candidates produced eight simultaneous takes in this run.
- Reuse identical candidate-prompt prefill only after exact valid-KV/hidden-state checks pass. A two-group check measured 2.009 s normally versus 0.518 s with reuse.
- Keep the unused reference codec encoder in CPU RAM after reference codes are ready; keep the decoder on the GPU.
- Cache reference embeddings, batch candidate judges, and reserve ASR for the final audit.
- Use one bounded CPU writer alongside the next GPU batch. Archival consumed 24.87 CPU seconds but blocked production for only 1.08 s; all takes remain available for later reranking.
- Reuse a known group size to skip repeated timing sweeps, and reuse a warmed model/compilation cache when generating several episodes. `optimized_pipeline/compare_n.py` shares one model load across N=2 and N=1.

Policy token prediction remains the main cost: 324.85 s across both episodes, versus 24.85 s codec decoding and 21.25 s scoring including preprocessing. These stages total 375.80 s with remaining generation overhead. Of 160 takes, 37 reached the 25.6-s ceiling; 19 of 20 batches waited for at least one capped take. Safely recognizing complete lagging takes, grouping similar lengths or compacting finished rows are future opportunities. Simply shortening the ceiling risks losing actual speech.

Timing depends on prompts, batch grouping, graph bucket settings, cache warmth and other GPU workloads. Overall production time was about the same as the preceding run; the archival overlap is measured, but this is not evidence of a controlled aggregate speedup. Fresh N=2/N=1 results are documented below. Full receipts and limitations: [pipeline guide](guides/PIPELINE.md), [benchmark JSON](optimized_pipeline/benchmarks/spontaneous-2026-11-08.json).

## Training, earlier evidence and limitations

Training used two epochs, approximately 80% real-podcast / 20% original-format acting replay by presentation count, 32 GPUs and 9,874 optimizer updates. Peak learning rates were 2e-5 for the semantic backbone and 4e-5 for the local/acoustic parameters; 5% warm-up followed by cosine decay to 10% of peak. Development loss was 4.4653 versus 4.5745 before training. This is not a human quality rating. See [TRAINING.md](TRAINING.md) for counts, manifests and continued-training instructions. The public weights are deployment weights, not the original 32-rank optimizer resume state.

The earlier segment/native-block experiment and its original metrics remain accessible in the [archived model card](guides/LEGACY_README.md), [study summary](stats/segment_block_pilot.json) and [listening grid](https://laion-humaneness-podcast-segment-block-pilot.static.hf.space/index.html). Those Ears-identity/Parakeet-Redux measurements must not be compared as identical metrics to the new ECAPA/Parakeet-v3 pipeline. Legacy optional VC and internal-pause compaction retain their original experimental status.

Speaker identities can drift; words can be omitted or repeated; ASR, alignment and quality judges can be wrong. The listener-approved prompt is a useful recipe, not a universal guarantee. Inspect flags and listen before publishing an episode. Reference recordings, third-party implementations and external models retain their own licenses. LAION model weights and newly authored release materials are **CC BY 4.0**; see [NOTICE.md](NOTICE.md). Use voices with appropriate permission and disclose synthetic speech where appropriate.

## Fresh N=1 and N=2 comparison with the approved prompts

Both episodes were freshly generated at N=2 and N=1 after publishing the new defaults. Same literal scripts, cues, reference pair, temperature 1.0 and CFG 2.5. N1 keeps its sole take and skips online ranking. N2 uses the same 50/50 reward as N4; there is no WER gate or hidden retry.

| Language | N | Final audio | Generate + rank | Useful RTF ↓ | Genuineness / 6 ↑ | ECAPA cosine ↑ | Mean turn WER ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| DE | 1 | 220.75 s | 55.24 s | 0.250 | 3.916 | 0.553 | 1.21% |
| DE | 2 | 222.26 s | 115.80 s | 0.521 | 3.897 | 0.630 | 2.56% |
| DE | 4 | 219.38 s | 179.98 s | 0.821 | 3.943 | 0.640 | 1.98% |
| EN | 1 | 199.30 s | 68.56 s | 0.344 | 3.863 | 0.352 | 2.12% |
| EN | 2 | 199.54 s | 122.77 s | 0.615 | 3.904 | 0.383 | 2.93% |
| EN | 4 | 193.30 s | 195.83 s | 1.013 | 3.880 | 0.407 | 5.50% |

In this sample, **N=2 is a useful speed/identity compromise**: German speaker cosine rises from 0.553 at N1 to 0.630 at N2, close to N4's 0.640. English rises from 0.352 to 0.383; N4 is 0.407. Genuineness stays roughly 3.9/6. N1 is faster but less consistent in speaker identity. These are twenty turns per language, not evidence of a universal optimum. The old English N4 row includes its documented incomplete turn; the repaired listening copy is separate.

All 80 new selected turns passed the configured review checks (per-turn WER threshold 15% and usable forced alignment); none was regenerated or replaced. This is not a guarantee of perfect speech. Both candidate counts passed artifact validation, exact prompt/reference routing, strict selection and PCM equality checks. The token/full-prefill checks and optional fused decoding were bit-identical on their tested inputs. Fourteen CPU tests pass.

**Timing scope:** N2 production across both languages totals 238.57 s; N1 totals 123.80 s; old N4 totals 375.80 s. Token prediction accounts for 209.57 / 113.22 / 324.85 s respectively. N2 codec/ranking take 18.18/10.07 s; N1 codec takes 9.91 s and online ranking zero. Loading, correctness probes, final audit and export are excluded from these production sums. The complete successful N2+N1 experiment, from process start to all four MP3s, took **660.70 s**. The failed earlier OOM attempt and live-service restoration are excluded.

N2/N1 used phased execution under additional unrelated GPU training; N4 used integrated execution with a different background load. The other training ended before final auditing. Do not claim these are controlled percentage speedups from N alone. N2 uses four turns per batch and N1 eight (final partial batches smaller), maintaining up to eight simultaneous candidates. Different groups/seeds mean these are fresh runs, not nested subsets of the N4 pool.

See [aggregate results](optimized_pipeline/benchmarks/n-comparison-2026-11-08.json) and [all per-turn candidate scores, seeds and audits](optimized_pipeline/benchmarks/n-comparison-2026-11-08-turns.json). Recreate the listening HTML with `compare_report.py`; the six strict episodes and additional labeled N4 English listening copy are independently selectable.

<!-- FIVE_LANGUAGE_RESULTS -->
## Five-language listening release: additional NL / FR / ES results

[Open the public listening Space](https://huggingface.co/spaces/laion/Humanness-Voice-Podcast). The nine additional episodes use the same fixed reference pair, approved sparse prompting and translated twenty-turn story as the DE/EN examples. All N2/N4 reward winners and all N1 sole takes are retained; no retries, content re-selection or voice conversion.

| Language | N | Final audio | Production | Useful RTF | Genuineness / 6 | ECAPA cosine | Mean turn WER | Transcript / boundary flags, of 20 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| NL | 4 | 303.00 s | 261.95 s | 0.865 | 3.969 | 0.388 | 14.4% | 8 / 10 |
| NL | 2 | 298.90 s | 134.25 s | 0.449 | 3.884 | 0.352 | 13.5% | 5 / 8 |
| NL | 1 | 280.82 s | 73.28 s | 0.261 | 3.897 | 0.333 | 15.1% | 6 / 9 |
| FR | 4 | 238.82 s | 242.20 s | 1.014 | 4.021 | 0.420 | 21.9% | 8 / 4 |
| FR | 2 | 231.62 s | 131.62 s | 0.568 | 4.032 | 0.385 | 14.2% | 6 / 3 |
| FR | 1 | 238.10 s | 65.74 s | 0.276 | 3.906 | 0.362 | 14.5% | 5 / 4 |
| ES | 4 | 234.02 s | 250.40 s | 1.070 | 4.008 | 0.450 | 2.2% | 0 / 0 |
| ES | 2 | 233.78 s | 134.51 s | 0.575 | 4.018 | 0.385 | 2.6% | 0 / 0 |
| ES | 1 | 232.66 s | 57.90 s | 0.249 | 4.020 | 0.392 | 2.1% | 1 / 0 |

Flags are materially more frequent in Dutch and French than Spanish in this fixed-reference run. Some recognized transcripts omit words or drift across languages. ASR itself is fallible, and a boundary warning alone does not imply missing speech. Dutch uses conservative Parakeet TDT boundaries because the Qwen aligner does not support Dutch. Uncertain clips remain untrimmed, so some episodes include longer tails. These examples are not endorsed as error-free multilingual outputs. Scripts and detailed diagnostics are available next to every player.

Production is the sum of policy, codec and online selection time, excluding loading, correctness probes, final audit and encoding. Phased inference used one RTX 3090 alongside unrelated jobs; cross-run GPU loads differ. N4/N2/N1 use separate draws and grouping, not nested subsets. Do not interpret these measurements as a controlled speed or quality ablation.

[Aggregate measurements](optimized_pipeline/benchmarks/five-language-extension-2026-11-08.json) · [All candidate scores and selected-turn audits](optimized_pipeline/benchmarks/five-language-extension-2026-11-08-turns.json).
