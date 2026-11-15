# vocalburst-captioning-whisper

A fine-tune of [`laion/sound-effect-captioning-whisper`](https://huggingface.co/laion/sound-effect-captioning-whisper)
(Whisper-small encoder–decoder) specialised for **captioning vocal bursts** — laughs, sighs, screams,
coughs, crying, panting, throat-clearing, etc. Given a short audio clip it generates a free-text
description of the non-speech vocalisation.


> 🔗 **Ensemble:** use together with the detector [`laion/vocalburst-locator`](https://huggingface.co/laion/vocalburst-locator) — that model finds *where* the vocal bursts are (timestamps); this model captions each detected segment. See the [threshold study](#vocal-burst-captioning-ensemble--detection-threshold-study) below.

## Training

- **Data:** [`laion/improved_synthetic_vocal_burts`](https://huggingface.co/datasets/laion/improved_synthetic_vocal_burts)
  (15,480 train / 200 val). **Target = the `Flash 2.5 Annotation.caption` field** (the long descriptive caption).
- **Recipe (best of a 5-epoch × 2-LR sweep):** peak **LR 1e-5**, **3 epochs**, **cosine** decay with **10 % warmup**,
  bf16, batch 8, AdamW. Labels masked with `-100`; `forced_decoder_ids = None`.
- **Selection:** every ~2000 seen samples the model captioned the 200 val clips and was scored by
  **cosine( caption, audio )** using [`laion/voiceclap-small-v2`](https://huggingface.co/laion/voiceclap-small-v2);
  the best checkpoint by this `clap_sim` was kept.

### Results (val clap_sim — higher = caption matches audio better)

| | clap_sim |
|---|---|
| untuned base (`sound-effect-captioning-whisper`) | 0.190 |
| **this model (lr 1e-5, 3 epochs)** | **0.2506** |

Full sweep (all beat the 0.190 baseline; lr 1e-5 dominates, 3 epochs is the peak):

| run | clap_sim | | run | clap_sim |
|---|---|---|---|---|
| **lr1e-5 · ep3** | **0.2506** | | lr5e-5 · ep1 | 0.2431 |
| lr1e-5 · ep4 | 0.2492 | | lr5e-5 · ep4 | 0.2427 |
| lr1e-5 · ep5 | 0.2471 | | lr5e-5 · ep5 | 0.2425 |
| lr1e-5 · ep2 | 0.2460 | | lr5e-5 · ep3 | 0.2413 |
| lr1e-5 · ep1 | 0.2450 | | lr5e-5 · ep2 | 0.2413 |

Example predictions on 100 val clips (audio + greedy & temperature-0.5 captions) are in
[`vb_finetune_predictions.html`](./vb_finetune_predictions.html). Mean clap_sim over those 100:
greedy 0.248, temperature-0.5 0.236.

## Vocal-burst captioning ensemble & detection-threshold study

This detector is designed to be used **as an ensemble** with the fine-tuned captioner
[`laion/vocalburst-locator`](https://huggingface.co/laion/vocalburst-locator): the **locator** finds *where* vocal bursts
occur (start/end timestamps); each detected segment is then cut and described by the **captioner**
(this locator). Together they turn raw audio into timestamped, captioned vocal-burst events that feed
the LAION [Universal Audio Annotation Pipeline](https://github.com/LAION-AI/univeral-audio-annotation-pipeline).

### How the study was run
We swept the detector's **confidence threshold from 0.85 to 0.92 (1% steps)** on **150 audio samples**
(clean-speech false-positive checks + clips with inserted bursts + isolated bursts), with
`merge_gap = 0.3 s`, `min_dur = 0.5 s`. For **every (sample × threshold)** the detector's segments were
captioned by `laion/vocalburst-captioning-whisper` and the **audio + (start, end, caption)** list was sent to **Gemini 3.1 Pro**, which
rated three axes 0–5 (5 = perfect): **caption quality**, **timestamp accuracy**, and **completeness**
(do the detections cover ALL real vocal bursts, penalizing both misses and false positives). That is
**1,200 independent LLM judgments**; *overall* = mean of the three axes.

### Results — average Gemini-3.1-Pro scores per threshold (ranked)
| rank | threshold | overall | completeness | caption quality | timestamp accuracy |
|------|-----------|---------|--------------|-----------------|--------------------|
| 🥇 | **0.88** | **3.475** | 3.11 | 3.24 | 4.07 |
| 🥈 | 0.89 | 3.469 | 3.15 | 3.18 | 4.08 |
| 🥉 | 0.85 | 3.466 | 3.11 | 3.22 | 4.07 |
| 4 | 0.90 | 3.445 | 3.10 | 3.24 | 4.00 |
| 5 | 0.86 | 3.411 | 3.05 | 3.14 | 4.04 |
| 6 | 0.87 | 3.390 | 3.07 | 3.10 | 4.00 |
| 7 | 0.91 | 3.364 | 3.05 | 3.14 | 3.91 |
| 8 | 0.92 | 3.363 | 3.02 | 3.15 | 3.92 |

**Findings:** scores are tightly clustered across 0.85–0.92 (the detections change little in that band);
**threshold ≈ 0.88 is the sweet spot** (best overall). **Timestamp accuracy is consistently strong (~4.0)**,
caption quality is moderate (~3.2), and **completeness is the weakest axis (~3.0–3.15)** — it degrades at
the highest thresholds (0.91–0.92) as real bursts start being missed. Recommended operating point for the
ensemble: **threshold 0.85–0.89** (default 0.88).

📊 **Full interactive report** (stats table + audio players + predictions + per-clip Gemini scores for the
top-3 thresholds): [`vocalburst_threshold_report.html`](https://huggingface.co/laion/vocalburst-captioning-whisper/blob/main/vocalburst_threshold_report.html).

## Usage

```python
import torch, librosa
from transformers import WhisperProcessor, WhisperForConditionalGeneration

proc = WhisperProcessor.from_pretrained("openai/whisper-small")
model = WhisperForConditionalGeneration.from_pretrained("laion/vocalburst-captioning-whisper").eval().cuda()
model.generation_config.forced_decoder_ids = None

wav = librosa.load("burst.wav", sr=16000, mono=True)[0]
feat = proc.feature_extractor(wav, sampling_rate=16000, return_tensors="pt").input_features.cuda()
ids = model.generate(feat, max_new_tokens=256)   # greedy; add do_sample=True, temperature=0.5 to sample
print(proc.batch_decode(ids, skip_special_tokens=True)[0])
```
