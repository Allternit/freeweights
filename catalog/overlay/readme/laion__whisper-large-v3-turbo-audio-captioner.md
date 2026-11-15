# Whisper Large v3 Turbo - Audio Captioner (Intermediate Checkpoint)

> **This is an intermediate checkpoint and is NOT fully trained.** It is released to enable further fine-tuning, experimentation, and community collaboration. Expect imperfect outputs, especially on non-speech environmental sounds.

## Model Description

This model is a fine-tuned version of [openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo) (809M parameters) trained for **audio captioning** — generating natural language descriptions of audio content rather than transcription.

- **Architecture**: Whisper encoder-decoder (32 encoder layers, 4 decoder layers, d_model=1280)
- **Parameters**: 809M total (663M encoder, 172M decoder) — all parameters were trained (nothing frozen)
- **Precision**: BF16
- **Max audio length**: 30 seconds
- **Max caption length**: 448 tokens

## Training

### Datasets (~3.1M audio-caption pairs)

| Dataset | Pairs | Size | Caption Key |
|---------|------:|-----:|-------------|
| [mitermix/audioset-with-grounded-captions](https://huggingface.co/datasets/mitermix/audioset-with-grounded-captions) | 1,760k | 207 GB | `comprehensive_caption` |
| [laion/captioned-ai-music-snippets](https://huggingface.co/datasets/laion/captioned-ai-music-snippets) | 236k | 49 GB | `comprehensive_caption` |
| freesound | 372k | 91 GB | caption |
| [laion/laions_got_talent_clean_with_captions](https://huggingface.co/datasets/laion/laions_got_talent_clean_with_captions) | 178k | 36 GB | `detailed_caption` |
| [laion/majestrino-data](https://huggingface.co/datasets/laion/majestrino-data) | 327k | 64 GB | `detailed_caption` |
| [TTS-AGI/majestrino-unified-detailed-captions-temporal](https://huggingface.co/datasets/TTS-AGI/majestrino-unified-detailed-captions-temporal) | 175k | 37 GB | `caption` |
| synthetic-vocal-bursts | 72k | 23 GB | caption |

### Training Phases

The model was trained across multiple phases. This checkpoint is from the final phase:

| Phase | Epochs | LR | Schedule | Warmup | Data | Steps |
|-------|-------:|---:|----------|--------|------|------:|
| 1–4 | 1 | 1e-5 | linear | 5% | 895k pairs (subset) | ~154k |
| 5 | 1 | 4e-5 | linear | 5% | 3.13M pairs (full) | 48,836 |
| **6 (this checkpoint)** | **3** | **5e-5** | **linear** | **5%** | **3.13M pairs (full)** | **146,508** |

### Training Details

- **Hardware**: 8x NVIDIA H100 80GB GPUs
- **Effective batch size**: 64 (8 GPUs x 8 per-device)
- **Optimizer**: AdamW (weight decay 0.0)
- **Gradient norm clipping**: 1.0
- **Throughput**: ~127 samples/second
- **Phase 6 duration**: ~21.5 hours
- **Framework**: Hugging Face Transformers 4.57.6 with `Seq2SeqTrainer`

### Metrics

- **Best validation loss**: 0.7498 (step 143,797)
- **Final training loss**: 0.34
- **Total samples seen (all phases)**: ~19M+

### Known Limitations

- **Environmental sounds**: Captions for non-speech audio (environmental sounds, sound effects) can hallucinate or produce incorrect descriptions. Speech and music captioning tends to be more reliable.
- **Not converged**: This is an intermediate checkpoint. Further training with more data and careful data balancing is expected to improve quality significantly.
- **Whisper encoder bias**: The Whisper encoder was pre-trained on speech, so it has a natural bias toward speech-like features.

## Usage

### Quick Inference

```python
import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor

model_id = "laion/whisper-large-v3-turbo-audio-captioner"

processor = WhisperProcessor.from_pretrained(model_id)
model = WhisperForConditionalGeneration.from_pretrained(
    model_id, torch_dtype=torch.float16, device_map="auto"
)

# Load your audio (16kHz mono)
import librosa
audio, sr = librosa.load("your_audio.wav", sr=16000)

# Process
input_features = processor(audio, sampling_rate=16000, return_tensors="pt").input_features
input_features = input_features.to(model.device, dtype=torch.float16)

# Generate caption
with torch.no_grad():
    predicted_ids = model.generate(
        input_features,
        max_new_tokens=448,
        language="en",
        task="transcribe",
    )

caption = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
print(caption)
```

### Continue Training

The repository includes the full training code used to produce this checkpoint:

- `train.py` — Main training script (Seq2SeqTrainer-based, supports streaming and local data)
- `prefetcher.py` — Resilient tar streaming with prefetching for webdataset-style data
- `monitor.py` — HTTP dashboard for real-time training monitoring (loss curves, eval samples, throughput)
- `watchdog.sh` — Auto-restart wrapper for training robustness

To continue training:

```bash
# Install dependencies
pip install transformers datasets torch librosa soundfile safetensors accelerate

# Set environment variables and launch
WHISPER_STREAM=1 \
WHISPER_RESUME_FROM=./best \
WHISPER_LR=5e-5 \
WHISPER_LR_SCHEDULE=linear \
WHISPER_WARMUP_RATIO=0.05 \
WHISPER_WEIGHTS_ONLY_RESUME=1 \
torchrun --nproc_per_node=8 train.py
```

Key environment variables:
- `WHISPER_RESUME_FROM` — Path to checkpoint directory to resume from
- `WHISPER_LR` — Peak learning rate (default: 5e-4)
- `WHISPER_LR_SCHEDULE` — `linear` or `cosine` (default: cosine)
- `WHISPER_MAX_STEPS` — Override total training steps
- `WHISPER_EPOCHS` — Number of epochs (default: 1)
- `WHISPER_WARMUP_RATIO` — Warmup fraction (default: 0.05)
- `WHISPER_WEIGHTS_ONLY_RESUME` — Set to `1` to load only weights (fresh optimizer/scheduler)
- `WHISPER_PER_DEVICE_BATCH` — Per-GPU batch size (default: 8)

## Citation

If you use this model, please cite:

```bibtex
@misc{laion-whisper-audio-captioner-2026,
  title={Whisper Large v3 Turbo Audio Captioner},
  author={LAION},
  year={2026},
  url={https://huggingface.co/laion/whisper-large-v3-turbo-audio-captioner}
}
```

## License

Apache 2.0
