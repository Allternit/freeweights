# Music Popularity Predictor (Full Fine-Tune)

Predicts **play count** and **upvote/like count** of AI-generated music tracks from audio alone.

This is the **full fine-tuned** variant where both the Whisper encoder and the MLP head were trained jointly. For the frozen-encoder variant, see [laion/music-popularity](https://huggingface.co/laion/music-popularity).

## Architecture

| Component | Details |
|-----------|---------|
| **Encoder** | Whisper Small, initialized from [laion/music-whisper](https://huggingface.co/laion/music-whisper), then **fine-tuned end-to-end** |
| **Pooling** | Encoder output (1500x768) → 10 segments of 150 frames → mean/max/min pool → 23,040-dim |
| **MLP Head** | 23040 → 1024 → 256 (LayerNorm) → two prediction heads (play count + upvote count) |
| **Output** | log1p-scaled: `log(1 + count)` — use `math.expm1()` to convert back |

## Training

- **Initialized from**: [laion/music-popularity](https://huggingface.co/laion/music-popularity) (frozen MLP, epoch 2, val_loss=4.004)
- **Data**: ~39,000 stratified samples from [LAION-Tunes](https://huggingface.co/datasets/ai-music/ai-music-deduplicated) (Suno, Udio, Mureka, Riffusion, Sonauto), cut into ~343K training segments (10-30s each)
- **Loss**: Huber Loss
- **Optimizer**: AdamW — encoder LR 5e-6, MLP LR 5e-5, cosine schedule, 2 epochs
- **Batch size**: 3 x 6 gradient accumulation = 18 effective
- **Encoder params**: 88.2M (unfrozen), **MLP params**: 23.9M
- **Best checkpoint**: Epoch 1 (val_loss=3.043)

### Evaluation (200 validation samples)

| Metric | Play Count | Upvote Count |
|--------|-----------|--------------|
| Pearson r | 0.192 | 0.236 |
| Log-Pearson r | **0.665** | **0.654** |
| Log MAE | **2.118** | **1.416** |

### Comparison vs Frozen Encoder

| Metric | Frozen ([laion/music-popularity](https://huggingface.co/laion/music-popularity)) | Full Fine-Tune (this model) | Improvement |
|--------|--------|----------------|-------------|
| Val Loss | 4.004 | **3.043** | -24% |
| Play Log-r | 0.414 | **0.665** | +61% |
| Upvote Log-r | 0.413 | **0.654** | +58% |
| Play Log MAE | 2.981 | **2.118** | -29% |
| Upvote Log MAE | 1.923 | **1.416** | -26% |

## Usage

```python
import torch
import torch.nn as nn
import numpy as np
import librosa
import math
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from huggingface_hub import hf_hub_download


# --- Define the MLP head ---

class PopularityMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.bottleneck = nn.Sequential(
            nn.Linear(23040, 1024), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(1024, 256), nn.ReLU(), nn.LayerNorm(256),
        )
        self.play_head = nn.Sequential(nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, 1))
        self.upvote_head = nn.Sequential(nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, 1))

    def forward(self, x):
        feat = self.bottleneck(x)
        return self.play_head(feat).squeeze(-1), self.upvote_head(feat).squeeze(-1)


# --- Load models ---

# Fine-tuned Whisper encoder (includes encoder weight updates from popularity training)
processor = WhisperProcessor.from_pretrained("laion/music-popularity-full-ft")
whisper = WhisperForConditionalGeneration.from_pretrained(
    "laion/music-popularity-full-ft", torch_dtype=torch.float16
).cuda().eval()
encoder = whisper.get_encoder()

# Popularity MLP head
head_path = hf_hub_download("laion/music-popularity-full-ft", "popularity_head.pt")
mlp = PopularityMLP().cuda()
mlp.load_state_dict(torch.load(head_path, map_location="cuda")["mlp_state_dict"])
mlp.eval()


# --- Run inference ---

audio, sr = librosa.load("song.mp3", sr=16000, mono=True)
audio = audio[:30 * 16000]  # first 30 seconds
if len(audio) < 30 * 16000:
    audio = np.pad(audio, (0, 30 * 16000 - len(audio)))

inputs = processor(audio, sampling_rate=16000, return_tensors="pt")

with torch.no_grad():
    enc_out = encoder(inputs.input_features.cuda().half()).last_hidden_state  # (1, 1500, 768)

    # Segment pooling: 10 segments, mean/max/min
    segments = enc_out.view(1, 10, 150, 768)
    pooled = torch.cat([segments.mean(2), segments.max(2).values, segments.min(2).values], dim=2)
    pooled = pooled.view(1, -1).float()  # (1, 23040)

    pred_play, pred_upvote = mlp(pooled)

print(f"Estimated plays:   {math.expm1(pred_play.item()):,.0f}")
print(f"Estimated upvotes: {math.expm1(pred_upvote.item()):,.0f}")
```

## Files

| File | Description |
|------|-------------|
| `model.safetensors` | Full Whisper Small weights (encoder fine-tuned for popularity) |
| `popularity_head.pt` | MLP head weights |
| `config.json` | Whisper model config |
| `preprocessor_config.json` | Audio preprocessor config |
| `tokenizer.json` | Tokenizer |
| `evaluation_report.html` | Detailed evaluation with per-bucket breakdowns and audio samples |

## License

CC BY 4.0 — Christoph Schuhmann / LAION

## Acknowledgments

- Base encoder: [laion/music-whisper](https://huggingface.co/laion/music-whisper) (OpenAI Whisper Small, fine-tuned for music captioning)
- Frozen-encoder baseline: [laion/music-popularity](https://huggingface.co/laion/music-popularity)
- Dataset: [LAION-Tunes](https://huggingface.co/datasets/ai-music/ai-music-deduplicated) (AI-generated music from Suno, Udio, Mureka, Riffusion, Sonauto)
- Developed by Christoph Schuhmann and the LAION community
