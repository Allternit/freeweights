# MuseTalk 1.5 — MLX (fp16)

Apple-MLX port of **[MuseTalk 1.5](https://github.com/TMElyralab/MuseTalk)** (TMElyralab / Tencent
Music) — realtime, high-quality lip-sync via **single-step latent-space inpainting** (not diffusion).
Runs natively on Apple Silicon. MIT-licensed, commercial use OK.

**This variant:** Full **fp16** (VAE + UNet + Whisper encoder).
Decoded-face error vs the PyTorch reference: mean |Δ| ≈ **0.32/255**.

## Components (all in this repo, self-contained, torch-free)

| File | What |
|------|------|
| `unet.safetensors` | SD1.x `UNet2DConditionModel` (in=8, out=4, cross_attn=384), single-step t=0 |
| `vae.safetensors` | `sd-vae-ft-mse` AutoencoderKL (fp16) |
| `whisper_encoder.safetensors` | whisper-tiny audio encoder (fp16) |
| `config.json` | dtype / quantization / scaling factor |

## Performance

Realtime on an M-series GPU: **~34 generated 256² faces/sec** at batch 8 (>25 fps video rate),
~7 GB peak. fp16 inference.

## Usage

```python
from musetalk_mlx.pipeline_mlx import MuseTalkPipeline
pipe = MuseTalkPipeline.from_pretrained_mlx("MuseTalk-1.5-MLX-fp16")
# crop_bgr: a 256x256 face crop; chunks: (N,50,384) whisper audio features
latents = pipe.get_latents_for_unet(crop_bgr)
faces = pipe.generate_faces(latents, audio_chunks)   # BGR uint8 lip-synced faces
```

Face detection / cropping / paste-back blending use the upstream
([MuseTalk](https://github.com/TMElyralab/MuseTalk)) CPU preprocessing.

## Parity (vs PyTorch, cpu fp32)

VAE encode 1.7e-5 · decode 3.4e-5 · UNet forward **1.4e-6** · whisper encoder 1.6e-5 ·
face-level e2e recon ≤ 2/255.

## License

MIT (mirrors upstream MuseTalk). Dependency models keep their own permissive licenses.
Port by MVS Collective (xocialize-code).
