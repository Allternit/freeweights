# VoxCPM2 - BFloat16 (full precision)

MLX port of [openbmb/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2) — a 2B-parameter multilingual TTS model with 48kHz studio-quality output, voice cloning, and voice design.

Full precision BFloat16 weights. Best quality, largest size.

## Features
- **30 languages** — including English, Chinese, Indonesian, Japanese, Korean, and more
- **48kHz output** — studio-quality audio
- **Voice Design** — create voices from text descriptions (no reference audio needed)
- **Voice Cloning** — clone any voice from a short audio reference
- **4 generation modes** — zero-shot, continuation, reference cloning, combined

## Usage

```bash
pip install mlx-audio

# Zero-shot
python -m mlx_audio.tts.generate --model mlx-community/VoxCPM2-bf16 --text "Hello world" --verbose

# Voice design
python -m mlx_audio.tts.generate --model mlx-community/VoxCPM2-bf16 \
  --text "Hello world" \
  --instruct "A young woman, gentle and sweet voice"

# Voice cloning
python -m mlx_audio.tts.generate --model mlx-community/VoxCPM2-bf16 \
  --text "Hello world" \
  --ref_audio speaker.wav --ref_text "reference text"
```

### Python API

```python
from mlx_audio.tts import load_model

model = load_model("mlx-community/VoxCPM2-bf16")

# Generate
for result in model.generate(
    text="Hello, this is VoxCPM2 on Apple Silicon.",
    inference_timesteps=7,
    cfg_value=2.0,
):
    print(f"Duration: {result.audio_duration}")
```

## Performance (Apple Silicon)

| Variant | Size | RTF (7 timesteps) |
|---------|------|--------------------|
| bf16 | 4.96 GB | 0.48x |
| **8-bit** | **3.23 GB** | **0.85x** |
| **4-bit** | **2.30 GB** | **0.90x** |

*RTF = Real-Time Factor (>1.0 = faster than realtime)*

## Original Model
- [openbmb/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2)
- Apache 2.0 License

Converted with [mlx-audio](https://github.com/Blaizzy/mlx-audio).
