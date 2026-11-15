# Humaneness Voice Large 1.2 Alpha

**A five-language, full-parameter speech-synthesis fine-tune of SFT3 Large.**
This release synthesizes English, German, Dutch, French and Spanish speech
from literal text, English performance directions, and optionally a separate
speaker recording. It is the **final step 7,851 checkpoint**, not an adapter,
not an intermediate checkpoint and not an RL merge.

**[Listen: seven emotional situations in five languages](https://laion-humaneness-voice-large-1-2-alpha-listening.static.hf.space/)**
— 35 scene/language cases, each with prompt-only and reference-conditioned
predictions. The requested scene duration is 34.8 seconds; actual durations and
exact prompts are displayed. [Audio and all duration-selection attempts](https://huggingface.co/datasets/laion/Humaneness-Voice-Large-1.2-Alpha-Demo-Audio)
are downloadable. This is a listening demonstration, not evidence of a
measured improvement in WER, speaker similarity or perceptual quality.

## What changed, and where this checkpoint comes from

The starting model is the original
[SFT3 checkpoint](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3).
We continued it with newly prepared high-quality real speech in five languages,
mixed with original and multilingual Gemini voice-acting data, then finished
with one Gemini-only polish pass. **This is not a continuation of 1.1 Alpha,
SFT6, a DPO adapter, or an RL adapter.** The 1.2 name identifies this new release,
not a claim about those other lineages.

After source-group held-outs, overlap checks and the explicitly excluded 39
unfinished annotations, the mixed phase contains **798,118 unique training
targets**: 591,441 RealSpeech, 36,754 original Gemini and 169,923 multilingual Gemini.
The second phase presents the 206,677 Gemini targets once more. Total exposure:
**1,004,795 non-padding presentations**, 7,851 optimizer updates, 64 GH200 GPUs,
about 5 hours 4 minutes of allocated wall time. Real targets are not repeated
in polish. There are no ElevenLabs or Gaston additions in this run.

The fixed 120-case validation diagnostic decreased from 4.6063 at the first
checkpoint to **4.5098 at the final checkpoint**. This is teacher-forced loss,
not a MOS or a language-quality benchmark. Detailed per-language exposure and
hyperparameters are in [TRAINING.md](TRAINING.md); exact contracts and complete
loss/validation histories are under [stats/](stats).

## Architecture

A 36-layer, 2,560-dimensional semantic transformer advances one 80 ms audio frame
at a time. A one-layer local Talker, also 2,560-dimensional, predicts the 12
residual codebook indices for that frame. Earlier audio frames remain in the
semantic context. The external
[MOSS Audio Tokenizer v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2)
turns the codes into 48 kHz mono audio.

| Component | Unique active parameters |
|---|---:|
| Semantic transformer |4,022,468,096|
| Local Talker/audio path |107,522,048|
| Total, counting tied weights once |**4,129,990,144**|

The historical 4.55B/4.6B label is not the measured count of this implementation.
The codec produces **12 codebook indices every 80 ms**: 12.5 frames/s × 12 = 150
indices/s. It is not 12 tokens/s, and these are not 32-codebook training targets.
The codec is an upstream dependency, not a component retrained in this run.

## Quick start

Download the whole repository, install the tested dependencies in
[requirements.txt](requirements.txt), and use a CUDA GPU. Model weights are
a complete BF16 Hugging Face export; no separate base-model download, adapter
merge or JUPITER-specific path is required for inference.

```bash
hf download laion/Humaneness-Voice-Large-1.2-Alpha --local-dir humaneness-large12
pip install -r humaneness-large12/requirements.txt

python humaneness-large12/infer.py \
  --model humaneness-large12 --language en \
  --text 'We actually made it. Thank you for staying.' \
  --prompt 'GENERAL: Natural, warm relief and gratitude.\nSCRIPT:\n(relieved, quietly smiling) [3.3 seconds duration] We actually made it.\n[0.3 seconds pause]\n(breathy giggle, 0.4 seconds)\n(sincere gratitude) [4.0 seconds duration] Thank you for staying.' \
  --seconds 8 --seed 777 --output example.wav
```

For speaker conditioning, add `--reference-wav clean-speaker.wav`.
Choose a clean, single-speaker, **5.04–14.96 second** recording of a different
utterance. Long inputs are cropped before encoding; the old 2.96 second cap is
not used. A reference helps identity but does not guarantee exact cloning.
Reference-free output uses the model's learned voice distribution and the
description; this release does not introduce a newly trained named-voice API.

`--language` accepts `en`, `de`, `nl`, `fr`, `es`. Keep performance directions
in English. `--prompt-file` avoids shell quoting for long scenes.
`--codec /path/to/local/MOSS-Audio-Tokenizer-v2` enables offline codec loading.
The default public codec is downloaded separately. `--seconds` specifies the
target frame budget; it is not a guarantee of exact spoken duration.

The demo uses the exact public [infer.py](infer.py). A separate end-to-end CLI
canary also loads the exported weights, encodes a real WAV reference, generates
speech and decodes the result. Proofs are under [stats/](stats).
The tested system is NVIDIA GH200, PyTorch 2.9 and Transformers 5.14.1;
portability and memory requirements on other hardware need testing.

The loader audit compares every exported tensor with the loaded model and
checks all 13 shared head/embedding aliases. Transformers may print missing-key
notices for omitted tied output heads; these are not randomly initialized
extra heads in this model. See `stats/PUBLIC_WEIGHT_LOAD_AUDIT.json` for the
complete parameter comparison.

## Prompting and training code

Read **[PROMPTING.md](PROMPTING.md)** for the field layout, sentence timing,
pauses, vocal bursts, five-language examples and reference policy.
Only literal words belong in the spoken `Text` field. English directions
belong in `Instruction`, as GENERAL/SCRIPT. The supplied helper keeps the two
separate; older SFT3 wrappers that duplicated directions into `Text` should
not be copied blindly.

[TRAINING.md](TRAINING.md) documents selection, references, held-outs, source
exposures, the continuous cosine recipe and limitations of exact reproduction.
[training/jupiter/](training/jupiter) contains the actual frozen trainer,
packed-reader/compiler and Slurm scripts, not pseudocode. The corresponding
legacy helpers are in [training/legacy/](training/legacy). Their original
JUPITER storage constants require adaptation elsewhere. Public model weights
do not include the 31 GB AdamW state or per-rank RNG states; those full resume
states remain retained with the original run.

The exact new five-language RealSpeech annotation cohort is locally prepared;
this model release does **not** assert that a matching complete public data
download is already available. Gemini's public source is linked above.
Code and contracts document the recipe, but bit-for-bit reproduction also
requires those exact packed data and their provenance/permissions.

## Limits and responsible use

This is an alpha research release. Long-form timing, pronunciation, emotional
strength and identity consistency may vary by language and prompt. Inspect
actual outputs; a low validation loss is not proof of naturalness or consent.
Training text includes ASR-derived transcripts, which may contain errors,
especially in expressive or multilingual speech. Tensor/codec integrity
checks are not an exhaustive linguistic review of every annotation.
Use consented voices for research, creative work and dataset augmentation.
Do not impersonate people, misrepresent synthetic speech as an authentic
recording, or deploy without appropriate safety and quality evaluation.
LAION does not endorse misuse. These are responsible-use recommendations,
not a replacement for the stated license or third-party rights.

Weights and newly authored release materials: **CC BY 4.0**, attribution to
LAION contributors, Humaneness Voice Large 1.2 Alpha, 2026. See [LICENSE](LICENSE)
and [NOTICE.md](NOTICE.md). Upstream model, codec, software, source-data and
personality rights remain applicable; this release does not relicense them.
