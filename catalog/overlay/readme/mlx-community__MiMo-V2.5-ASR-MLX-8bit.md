Part of the [MiMo V2.5 ASR MLX](https://huggingface.co/collections/mlx-community/mimo-v25-asr-6a02cb99466d6a36475a4d70) collection.

# MiMo-V2.5-ASR-MLX-8bit (MLX)

Apple MLX weights for [XiaomiMiMo/MiMo-V2.5-ASR](https://github.com/XiaomiMiMo/MiMo-V2.5-ASR), converted for local ASR on Apple Silicon.

## TL;DR

| | |
|---|---|
| **Variant** | 8-bit |
| **Best for** | smaller checkpoint |
| **Official code** | [`XiaomiMiMo/MiMo-V2.5-ASR`](https://github.com/XiaomiMiMo/MiMo-V2.5-ASR) |
| **MLX helper** | [`ailuntx/MiMo-V2.5-ASR-MLX`](https://github.com/ailuntx/MiMo-V2.5-ASR-MLX) |
| **MLX runtime dependency** | [`ailuntx/mlx-audio`](https://github.com/ailuntx/mlx-audio) |
| **Audio tokenizer** | [`mlx-community/MiMo-Audio-Tokenizer`](https://huggingface.co/mlx-community/MiMo-Audio-Tokenizer) |
| **Hardware** | Apple Silicon recommended; HF Spaces CPU fallback is only a load smoke test |

## Quick Start

```bash
git clone https://github.com/ailuntx/MiMo-V2.5-ASR-MLX.git
cd MiMo-V2.5-ASR-MLX
python -m venv .venv
.venv/bin/pip install git+https://github.com/ailuntx/mlx-audio.git

hf download mlx-community/MiMo-Audio-Tokenizer --local-dir ./models/MiMo-Audio-Tokenizer
hf download mlx-community/MiMo-V2.5-ASR-MLX-8bit --local-dir ./models/MiMo-V2.5-ASR-MLX-8bit

.venv/bin/python run_mimo_asr_mlx.py \
  --model ./models/MiMo-V2.5-ASR-MLX-8bit \
  --audio path/to/audio.wav
```

## Variants

| Variant | Best for |
|---|---|
| [`MiMo-V2.5-ASR-MLX`](https://huggingface.co/mlx-community/MiMo-V2.5-ASR-MLX) | default entry |
| [`MiMo-V2.5-ASR-MLX-fp32`](https://huggingface.co/mlx-community/MiMo-V2.5-ASR-MLX-fp32) | high-precision baseline |
| [`MiMo-V2.5-ASR-MLX-bf16`](https://huggingface.co/mlx-community/MiMo-V2.5-ASR-MLX-bf16) | high-quality Apple Silicon use |
| [`MiMo-V2.5-ASR-MLX-8bit`](https://huggingface.co/mlx-community/MiMo-V2.5-ASR-MLX-8bit) | smaller local checkpoint |
| [`MiMo-V2.5-ASR-MLX-4bit`](https://huggingface.co/mlx-community/MiMo-V2.5-ASR-MLX-4bit) | smallest checkpoint |

## Layout

```text
MiMo-V2.5-ASR-MLX-8bit/
├── config.json
├── model.safetensors / shards
├── tokenizer files
└── mlx_manifest.json
```

## Conversion Notes

| Component | Source | MLX handling |
|---|---|---|
| ASR model | `XiaomiMiMo/MiMo-V2.5-ASR` | converted to MLX weights |
| audio tokenizer | `mlx-community/MiMo-Audio-Tokenizer` | downloaded separately and passed to the runtime |
| helper script | `ailuntx/MiMo-V2.5-ASR-MLX` | wraps `mlx-audio` loading/generation |

## Validation

Local Apple Silicon is the intended runtime. The HF Space can start and load the model on Linux CPU fallback, but full ASR on `cpu-basic` can exceed request timeouts.

## License

License follows the upstream MiMo release.

## Citation

```bibtex
@misc{mimo-v25-asr-mlx,
  title  = {MiMo-V2.5-ASR-MLX: Apple MLX port of MiMo-V2.5-ASR},
  author = {ailuntx},
  year   = {2026},
  url    = {https://github.com/ailuntx/MiMo-V2.5-ASR-MLX},
}

@misc{xiaomi2026mimov25asr,
  title  = {MiMo-V2.5-ASR},
  author = {{Xiaomi MiMo Team}},
  year   = {2026},
  url    = {https://github.com/XiaomiMiMo/MiMo-V2.5-ASR},
}
```
