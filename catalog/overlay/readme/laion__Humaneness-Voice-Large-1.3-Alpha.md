# Humaneness Voice Large 1.3 Alpha

**Final checkpoint: step 9,799, completed on 22 October 2026.** This repository
contains the complete model, not a LoRA or a reinforcement-learning adapter.
It generates expressive speech from literal text and English performance
directions, optionally with a separate voice reference or a registered
fictional voice name. Supported training languages are English, German,
French, Dutch and Spanish. This is the **Large** model, not Humaneness Voice Small.

[Listen: matched 1.2 / final 1.3 predictions](https://laion-humaneness-voice-large-1-2-alpha-listening.static.hf.space/)
· [Additional five-language emotion-masking study](https://laion-humaneness-voice-large-1-2-alpha-listening.static.hf.space/masking.html)
· [Prompting guide](PROMPTING.md) · [Exact training recipe and reproduction](TRAINING.md)
· [Voice names](VOICE_ALIASES.md) · [Inference code](infer.py)

## What changed from 1.2?

We started from the **released Large 1.2 Alpha final checkpoint, step 7,851**,
and fully fine-tuned both the semantic backbone and the local Talker. All
data were mixed throughout one continuous learning-rate schedule. The run
combines five-language real speech, the existing Gemini acting data, a new
English set with emotion masking and physical-performance situations,
French-accent characters, and add-on voices. Eligible new English recordings
appear twice; the other eligible targets appear once. There is **no separate
English-only or Gemini-only final phase**, and no LR restart between sources.

All synthetic prompts use the new **Detailed Prompts** conversion: scene
intent is kept in `GENERAL`, and supported local performance beats are
attached to aligned speech chunks in `SCRIPT`. Literal words, existing
duration/pause annotations and vocal-burst instructions are preserved.
Uncertain local beat alignment stays global rather than inventing timing.
Intended or hidden emotions are not proof that those emotions are audible.
Real-speech prompts retain their observed descriptions and timed scripts.

| Release fact | Value |
|---|---|
| Parent | [Humaneness Voice Large 1.2 Alpha](https://huggingface.co/laion/Humaneness-Voice-Large-1.2-Alpha), final step 7,851 |
| Final optimizer update | 9,799 |
| Unique training targets | 1,025,886 |
| Non-padding presentations | 1,254,191 |
| Weighted codec exposure | About 6,808 hours; repeated English targets counted twice |
| Fixed 99-case validation loss | 4.516756 at first saved checkpoint → **4.422540** at final |
| Hardware / elapsed | 64 GH200 GPUs on 16 JUPITER nodes; 5 h 40 min 9 s |
| Export | Complete BF16 model, three safetensors shards, about 8.26 GB |
| Training method | Full supervised fine-tuning; **no DPO, LoRA or RL in 1.3** |

Validation sets differ from 1.2, so the loss values are not a cross-release
quality comparison. The listening page provides matched prompts, references
and seeds. No new objective CE, WER or speaker-similarity improvement is
claimed solely from training loss. Future RL with CE/emotion/genuineness is
a separate proposal, not part of these weights.

## Quick start: generate a WAV

Use a CUDA GPU. The tested stack uses PyTorch 2.9+, Transformers 5.14.1,
Accelerate 1.14.0 and BF16. Review the Python files before enabling
`trust_remote_code=True`. Download only this complete model and the separate
MOSS Audio Tokenizer v2 codec; loading an additional parent model is unnecessary.

```bash
python -m pip install 'huggingface_hub>=1.29,<2'
hf download laion/Humaneness-Voice-Large-1.3-Alpha --local-dir ./humaneness-large-1.3
cd humaneness-large-1.3
python -m pip install -r requirements.txt

python infer.py --model . --language en --seconds 6 --seed 20261022 \
  --text "You stayed with me through every doubtful evening. I will never forget that." \
  --prompt 'GENERAL: Warm, grateful and naturally conversational.\nSCRIPT:\n(sincere gratitude) [3.6 seconds duration] You stayed with me through every doubtful evening.\n[0.3 seconds pause]\n(warm, quietly smiling) [2.1 seconds duration] I will never forget that.' \
  --output gratitude.wav
```

For reference-conditioned speech, add `--reference-wav another_utterance.wav`.
Use clean, single-speaker audio with a different transcript, ideally 8–15
seconds. The helper requires at least **5.04 seconds** and caps the encoded
crop at **14.96 seconds**. It does **not** silently truncate to the old 2.96
seconds. The reference supplies voice identity; the script supplies the
words and requested performance. Identity transfer is approximate, not guaranteed.

For a trained named voice instead, add `--voice-name Aurora` (or another
exact name from [the catalog](voices.json)). Do not provide a reference at
the same time. Leave both options absent for unanchored prompt-only generation.
There are 55 registered fictional aliases; they are not tokens to insert
into the spoken text. The helper places them in the exact trained wrapper.

`--prompt-file directions.txt` accepts a UTF-8 GENERAL/SCRIPT file instead
of `--prompt`. `--text` always contains only words to speak. Output is
48 kHz mono PCM WAV. `--seconds` is a conditioning target, not a hard guarantee
of exact duration. The helper refuses to overwrite an existing output.

## Architecture in plain language

A Qwen3-family semantic transformer reads the words, directions and any
reference audio codes. Its state conditions a small local autoregressive
Talker, which predicts the acoustic codebooks for each frame. A separate
frozen MOSS Audio Tokenizer v2 decoder converts the codes into sound.

| Component | Exact size / role |
|---|---|
| Semantic backbone | 4,022,468,096 parameters; 36 layers; hidden width 2,560 |
| Talker and audio-side parameters | 107,522,048 parameters; one local transformer layer, width 2,560 |
| Unique model total | **4,129,990,144** parameters, excluding the external codec |
| Codec output | 12 codebooks × one index each per 80 ms frame; 1,024 entries/codebook |
| Token rate | 12.5 frames/s × 12 indices = **150 codec indices/s** |

Twelve codebooks do **not** mean 12 tokens per second. This trained model
uses the first 12-codebook representation, not a claim that all 32 codec
books were supervised. The supplied helper explicitly encodes/decodes the
trained 12-book layout. See `config.json` and `stats/MODEL_PREFLIGHT.json`.

## Repository contents and verification

* Root: complete weights, configuration, tokenizer, model/processor code,
  portable `infer.py`, voice catalog and dependency pins.
* `training/jupiter/`: frozen runtime source for the actual 1.3 run,
  including prompt conversion, data-map preparation, training and Slurm scripts.
* `training/legacy/`: imported shared training, packing, loss and model helpers.
* `stats/`: original run/data contracts, loss traces, checkpoint metadata,
  optimizer-resume smoke proof, BF16 export hashes and public-inference checks.
* `evaluation/`: exact listening tasks, reference provenance and generation code.

All exported tensors were compared with the final FP32 source after BF16
conversion through the public model loader. Thirteen tied output heads are
verified explicitly. The public CLI is additionally tested with reference
WAV encoding, a registered alias and prompt-only generation; see
`stats/PUBLIC_INFERENCE_CANARY.json`. The three small canary outputs are
packaged together in `evaluation/public_cli_canary.tar`.

The BF16 export does not include the original AdamW/RNG checkpoint payload.
Those complete training states remain in the original run. Starting a new
fine-tune from these public weights uses a new optimizer; it is not a
bit-for-bit resume. [TRAINING.md](TRAINING.md) explains data availability,
original paths and the changes required outside JUPITER.

## Data, attribution and intended use

Synthetic acting sources and fictional voice catalog:
[laion/german-english-voice-acting-challenges](https://huggingface.co/datasets/laion/german-english-voice-acting-challenges).
The exact newly annotated five-language real-speech cohort is locally
prepared; this model release does not claim that the complete cohort or
new prompt sidecars are already mirrored publicly. See the source manifests
and [training notes](TRAINING.md) for the distinction between raw counts,
approved prompts, held-outs and actual training exposure.

Released model and LAION-authored materials: **CC BY 4.0**. Attribute LAION
contributors, Humaneness Voice Large 1.3 Alpha, 2026. The model continues the
MOSS Local Transformer / SFT3 lineage. The external codec is
[OpenMOSS-Team/MOSS-Audio-Tokenizer-v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2).
Preserve upstream notices and comply with each dependency's and dataset's
own terms; this release does not relicense third-party code or recordings.

This is an experimental research release intended for expressive speech
research, authorized voice work and dataset augmentation. Test quality,
language coverage and identity behavior before deployment. Use only voices
and recordings you are authorized to use. We oppose deceptive impersonation,
fraud and non-consensual voice cloning. These are use recommendations, not
additional restrictions on CC BY 4.0. LAION does not endorse downstream
misuse or guarantee fitness, factual correctness or exact identity transfer.
