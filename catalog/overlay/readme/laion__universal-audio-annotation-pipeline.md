# Universal Audio Annotation Pipeline — self-contained model mirror

This repository is a **complete, self-contained mirror** of the LAION *Universal Audio
Annotation Pipeline*: **all model weights** for every stage **plus all the code** needed to
run it. If any of the upstream model repositories ever disappears, cloning this single repo
gives you everything required to reproduce the pipeline end-to-end.

- 💻 **Code (GitHub):** https://github.com/LAION-AI/univeral-audio-annotation-pipeline
- 🌐 **Live example predictions:** https://laion-ai.github.io/univeral-audio-annotation-pipeline/predictions/
  (also bundled here under [`predictions/`](./predictions))

---

## What it does

Given **any audio file** (a movie scene, a podcast, a field recording…), the pipeline produces
a single **structured JSON annotation** of *everything audible*, second by second across the
whole clip:

- **Speech** — transcription, speaker diarization (who speaks when), language, accent,
  speaking rate, age, gender, voice timbre, and **expressive captions** for the speaker's
  **emotion** and **speaking style** (e.g. *"clearly intense anger laced with wounded
  disappointment"*, *"low conspiratorial whisper"*); **singing** is flagged explicitly.
- **Vocal bursts** — laughs, gasps, sighs, screams, scoffs, etc., with emotion.
- **Sound events** — every non-speech sound and the musical/ambient background, with
  timestamps and loudness, covering the **full timeline** (silence is labelled too).

### What it's good for

Building rich audio datasets and captions for TTS / audio-LM training, content understanding,
media indexing, accessibility, emotion & paralinguistic research, and soundscape analysis.

### What it produces

A JSON array of segments (`speech`, `vocal_burst`, `sound_event`, `music`) — see the
[output schema](https://github.com/LAION-AI/univeral-audio-annotation-pipeline#output-format).
A self-contained HTML report (base64 audio + annotations) can be generated for inspection;
an example is in [`predictions/`](./predictions).

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                    INPUT: Audio File (any length)                      │
└───────────────────────────────────┬───────────────────────────────────┘
                                     │
        ┌──────────────────────────┴──────────────────┐
        ▼                                              ▼
  ┌──────────────┐                          ┌────────────────────┐
  │ VibeVoice    │                          │ Nemotron 3.5 ASR + │
  │ ASR          │                          │ Sortformer         │
  │ (diarization │                          │ (words + secondary │
  │  & timing    │                          │  diarization)      │
  │  authority)  │                          │                    │
  └──────┬───────┘                          └─────────┬──────────┘
         │   diarization / timing      words / what is said
         └──────────────┬──────────────────────┬───────┘
              ▼                        ▼
  ┌──────────────────────┐  ┌──────────────────────────────┐
  │ Whisper experts (x3) │  │ Specialist sound-event prepass│
  │ emotion · timbre ·   │  │ • SFX LoRA (MOSS-8B-Instruct  │
  │ speaking-style        │  │   + laion sfx-lora r=128)     │
  │ (per utterance)      │  │ • Vocal-burst locator @0.7    │
  └──────────┬───────────┘  │   + sound-effect captioner    │
             │              └───────────────┬──────────────┘
             └───────────────┬──────────────┘
                             ▼
        ┌──────────────────────────────────────────────┐
        │   Gemma-4-12B — TEXT-ONLY fusion (no audio)   │
        │  (+ pyannote overlap + DiCoW per-speaker ASR) │
        │  Nemotron words on VibeVoice timeline         │
        │  DETAILED sound-event + dedicated music caps  │
        │  legacy: MOSS-Audio-8B (audio, --fusion moss) │
        └───────────────────────┬──────────────────────┘
                                │  + deterministic gap-fill
                                ▼     (non-speech background only)
        ┌──────────────────────────────────────────────┐
        │   OUTPUT: Structured JSON (covers full clip)  │
        │   [speech · vocal_burst · sound_event · music]│
        └──────────────────────────────────────────────┘
```

> **Default configuration** (`Gemma-12B + DiCoW`): Nemotron 3.5 words + VibeVoice/Sortformer
> diarization + **pyannote** overlap detection + **DiCoW** overlap-aware per-speaker ASR, fused by a
> **text-only Gemma-4-12B** LLM (no audio in the final step). Highest-Reward pipeline on
> [SoundScape-Bench](https://huggingface.co/datasets/laion/soundscape-bench) (**0.253**, rank 3 of all
> systems, ~Gemini 3.5 Flash). It trades precision for recall (hallucination ~43% vs the audio MOSS
> config's 27%); the legacy audio **MOSS-Audio-8B** annotator stays available via `--fusion moss`.
> 🎧 [Audio demo (20 samples vs ground truth)](https://projects.laion.ai/univeral-audio-annotation-pipeline/gemma12_dicow_demo.html)
> · 📊 [Full model comparison](https://projects.laion.ai/univeral-audio-annotation-pipeline/soundscape_comparison.html)

---

## What is mirrored here

### `models/` — all weights

Default (`Gemma-12B + DiCoW`) models marked ⭐:

| Subfolder | Stage | Original repo |
|-----------|-------|---------------|
| `vibevoice-asr` ⭐ | diarization / timing authority | `microsoft/VibeVoice-ASR` |
| `nemotron-3.5-asr-streaming-0.6b` ⭐ | words (default ASR) | `nvidia/nemotron-3.5-asr-streaming-0.6b` |
| `diar_sortformer_4spk-v1` ⭐ | diarization (Nemotron) | `nvidia/diar_sortformer_4spk-v1` |
| `pyannote-segmentation-3.0` ⭐ | overlap/segmentation | `pyannote/segmentation-3.0` |
| `pyannote-speaker-diarization-3.1` ⭐ | diarization pipeline config | `pyannote/speaker-diarization-3.1` |
| `pyannote-wespeaker-voxceleb-resnet34-LM` ⭐ | speaker embedding (for pyannote) | `pyannote/wespeaker-voxceleb-resnet34-LM` |
| `dicow-v3_3` ⭐ | overlap-aware per-speaker ASR | `BUT-FIT/DiCoW_v3_3` |
| `gemma-4-12b-it-gguf` ⭐ | **TEXT-only final fusion** (Q8 GGUF) | `unsloth/gemma-4-12b-it-GGUF` |
| `bud-e-whisper` ⭐ | voice: emotion | `laion/BUD-E-Whisper` |
| `timbre-whisper` ⭐ | voice: timbre | `laion/timbre-whisper` |
| `voice-tagging-whisper` ⭐ | voice: speaking style | `laion/voice-tagging-whisper` |
| `moss-audio-8b-instruct` ⭐ | SFX LoRA base | `OpenMOSS-Team/MOSS-Audio-8B-Instruct` |
| `moss-audio-sfx-lora-v4` ⭐ | SFX LoRA adapter | `laion/moss-audio-sfx-lora-v4` |
| `vocalburst-locator` ⭐ | vocal-burst locator | `laion/vocalburst-locator` |
| `sound-effect-captioning-whisper` ⭐ | SFX captioner | `laion/sound-effect-captioning-whisper` |
| `whisper-small` ⭐ | base for locator/captioner/experts | `openai/whisper-small` |
| `moss-audio-8b-thinking` | legacy final annotator (`--fusion moss`) | `OpenMOSS-Team/MOSS-Audio-8B-Thinking` |
| `parakeet-tdt-0.6b-v3` | legacy ensemble ASR | `nvidia/parakeet-tdt-0.6b-v3` |
| `qwen3-asr-1.7b` / `qwen3-forcedaligner-0.6b` | legacy ensemble ASR | `Qwen/Qwen3-ASR-1.7B` (+aligner) |

### `code/` — everything needed to run

| Subfolder | Contents |
|-----------|----------|
| `universal-audio-annotation-pipeline` | the pipeline repo (`default_pipeline/`, `pipeline/`, docs) |
| `MOSS-Audio` | MOSS-Audio source (`src.*`, required by the MOSS stages) |
| `VibeVoice` | VibeVoice source (the ASR modeling code) |

### `predictions/` — an example report (open `predictions/index.html`)

---

## How to run inference

Full setup and run instructions:
[`docs/default_pipeline.md`](https://github.com/LAION-AI/univeral-audio-annotation-pipeline/blob/main/docs/default_pipeline.md).

The three ASR packages pin **incompatible `transformers` versions**, so each ASR stage runs in
its own virtual-env; the Whisper experts, SFX LoRA, vocal-burst pre-pass and MOSS annotator
share a base env. The helper script builds all of them:

```bash
# from code/universal-audio-annotation-pipeline/default_pipeline
bash setup_environments.sh ./envs                 # 4 venvs + clones of the sources
export UAAP_MOSS_SRC="$(pwd)/envs/MOSS-Audio"     # (or code/MOSS-Audio from this mirror)
huggingface-cli login                             # only needed if pulling the gated LoRA upstream

bash run_all.sh --audio /path/to/clips --workdir ./uaap_work --envs ./envs
#   --no-sfx          skip the SFX LoRA stage
```

To run **entirely offline from this mirror**, point each stage at the local `models/<name>`
folder instead of the HF hub id, and set `UAAP_MOSS_SRC=<this repo>/code/MOSS-Audio`.

Outputs: `<audio>_pred.json` next to every input, all intermediates under `uaap_work/<stem>/`,
and a self-contained `uaap_work/report.html`.

### Key parameters

| Parameter | Default | Meaning |
|-----------|---------|---------|
| fusion | `--fusion gemma` (default) | Gemma-4-12B text-only fusion + pyannote/DiCoW overlap (best Reward); `--fusion moss` = legacy audio MOSS-Audio-8B (higher precision) |
| decoding | greedy (`do_sample=False`) | ASR reconciliation + final annotation |
| vocal-burst threshold | `0.7` | locator confidence cutoff (`UAAP_VB_THRESHOLD`) |
| `--no-sfx` | off | skip the gated SFX LoRA stage |
| GPUs | 2× 24 GB recommended | VibeVoice-ASR is sharded across both |

Models load/unload sequentially → peak VRAM ≈ one large model (~18–23 GB) at a time.

**Efficiency:** with ≥2 GPUs the heavy stages (Gemma fusion ~30 s/clip, SFX, ASR…) are auto-sharded
across GPUs over disjoint clips (`--gpus 0,1`), ≈N× faster with identical output. A quality-neutral
lower-VRAM fuser is available via `export GEMMA_FILE=gemma-4-12b-it-UD-Q6_K_XL.gguf`.

---

## Hardware

~68 GB disk for the weights; 2× 24 GB GPUs recommended (VibeVoice-ASR is sharded across two,
the rest fit on a single 24 GB GPU).

## Licensing & attribution

This is a **mirror for resilience**. Each mirrored model keeps the license of its original
repository (linked in the table above) — please consult and comply with each. The pipeline
code is Apache-2.0. Mirrored by LAION.
