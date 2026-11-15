# captioning-whisper-large-turbo-wip

**⚠️ Work in progress.** This is a mid-training checkpoint uploaded while the full 3-epoch run is still going. A final checkpoint will replace these weights once training completes.

Fine-tune of [`openai/whisper-large-v3-turbo`](https://huggingface.co/openai/whisper-large-v3-turbo) repurposed for **audio captioning** (not just speech transcription). The model takes 30s of audio and emits a long, descriptive natural-language caption covering speech, music, sound events, vocal bursts, and non-speech audio.

## Checkpoint

- **Step:** 561,118 (out of an estimated 822,054 total steps over 3 epochs)
- **Samples seen:** ~35.9M (≈ 2.05 epochs)
- **Best validation loss so far:** ~0.679 (held-out set of 100 pairs per dataset, 896 total after divisibility trim)
- **Precision:** bf16
- **Global batch size:** 64 (8 GPUs × per-device 8)

## Training setup

### Hardware
- 8× A100/H100-class GPUs (80 GB each), single node, DDP

### Hyperparameters
- `learning_rate`: 5e-4, cosine schedule, 5% warmup
- `weight_decay`: 0.0
- `max_grad_norm`: 1.0
- `per_device_train_batch_size`: 8
- `gradient_accumulation_steps`: 1
- `bf16`: true (fp16 was discarded because of grad-scaler overflows)
- `max_audio_seconds`: 30
- `max_label_tokens`: 448

### Datasets (round-robin, each batch draws from all 9)
- `laion/majestrino-data` — speech + detailed captions
- `laion/captioned-ai-music-snippets` — music with comprehensive captions
- `mitermix/audioset-with-grounded-captions` — general audio events
- `TTS-AGI/majestrino-unified-detailed-captions-temporal` — speech with temporal/emotion descriptions
- `laion/laions_got_talent_clean_with_captions` — performance speech/music
- `laion/freesound-commercially-permissive-subset-with-captions`
- `laion/generated-sound-events`
- `laion/in-the-wild-sound-events`
- `laion/synthetic_vocal_bursts`

Total ~2.83M train pairs, 100 held out per dataset for validation.

## Inference

```python
import torch, librosa
from transformers import WhisperProcessor, WhisperForConditionalGeneration

model_id = "laion/captioning-whisper-large-turbo-wip"
processor = WhisperProcessor.from_pretrained(model_id)
model = WhisperForConditionalGeneration.from_pretrained(
    model_id, torch_dtype=torch.bfloat16
).to("cuda").eval()

audio, sr = librosa.load("clip.wav", sr=16000, mono=True, duration=30.0)
feats = processor.feature_extractor(
    audio, sampling_rate=16000, return_tensors="pt"
).input_features.to("cuda", torch.bfloat16)

with torch.no_grad():
    out = model.generate(
        feats,
        max_new_tokens=448,
        num_beams=4,
        do_sample=False,
    )
caption = processor.batch_decode(out, skip_special_tokens=True)[0]
print(caption)
```

The model emits long, multi-sentence descriptions. Keep `max_new_tokens` near 448 and prefer beam search over greedy for quality.

## What's in this repo

- **Model weights** (`model.safetensors`) — bf16 Whisper-large-v3-turbo checkpoint at step 561,118
- **Processor / tokenizer** files — copied from the base model (vocab unchanged)
- **`code/`** — the exact training pipeline used:
  - `train.py` — Seq2SeqTrainer-based fine-tuner with custom round-robin streaming dataset, manual rank-0 eval (HF distributed eval deadlocks here), and live monitor integration
  - `prefetcher.py` — tar-level background downloader that keeps ~2 tars per dataset hot on disk, with age-aware LRU eviction (`MIN_EVICT_AGE_S = 600`) to prevent in-flight eviction races
  - `monitor.py` — HTTP dashboard (port 8077) with live loss, eval, audio playback
  - `watchdog.sh` — auto-restart wrapper
  - `download_data.py` — one-shot HF → local extractor with post-extract delete
  - `phase2_launcher.sh` — phase-2 launch helper

## Caveats

- **No optimizer / scheduler state** is included. The training script saves via `save_pretrained` only. Resuming optimizer-state-aware training from this checkpoint is **not possible** without starting a fresh optimizer (what we did for the in-flight resume: reduced peak LR to 1e-4 with a short 1% warmup since the cosine schedule had already decayed most of the way).
- **No RNG / data-iterator state.** The streaming dataset is round-robin across tars and workers but resuming won't replay the exact same sample order.
- **This is mid-training.** Expect captions to still be underfit on rarer datasets and to sometimes leak artifacts from base-model speech transcription behaviors.
- **Languages:** English-heavy. The base model is multilingual, but the fine-tuning data is mostly English.

## Training code commit / state

The `code/` directory in this repo is a snapshot of the exact scripts running at the time of this checkpoint. The Seq2SeqTrainer in `transformers>=4.57` requires a few API tweaks (`processing_class=` not `tokenizer=`, `eval_strategy=` not `evaluation_strategy=`, `_get_train_sampler(train_dataset)` etc.) — those are wired up in `train.py`.

## License

Apache 2.0 (inherited from base model; verify downstream dataset licenses before redistribution).
