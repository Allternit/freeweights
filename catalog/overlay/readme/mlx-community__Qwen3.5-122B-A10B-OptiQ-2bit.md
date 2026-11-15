# mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Read the write-up](https://mlx-optiq.com/blog/stream-122b-on-a-mac) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

**A 122-billion-parameter model that runs on a 36 GB Mac.** This is a 2-bit mixed-precision MLX quant of Qwen3.5-122B-A10B (244 GB at bf16), produced by [mlx-optiq](https://mlx-optiq.com/). It is 44 GB on disk. While it generates, only ~12 GB sits in RAM: the attention, router and embeddings stay resident, and the 35 GB of mixture-of-experts weights stream off the SSD one expert at a time through `optiq serve --stream-experts`.

## Image input

It takes images. The SigLIP vision tower rides at **bf16 in a sidecar** (`optiq/optiq_vision.safetensors`, 0.90 GB), so the image path keeps full precision while the language tower runs at 2 bits. The tower stays resident; only the experts stream.

Verified on a 36 GB M3 Max with expert streaming on, 11.6 GB resident:

| image | output |
|---|---|
| a red circle on white | *"The image contains a red circle."* |
| a blue square on white | *"The image contains a blue square."* |

```python
from PIL import Image
from optiq.runtime.moe_stream import load_streaming
from optiq.runtime.engine import OptiqEngine

model, tok = load_streaming("mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit")
eng = OptiqEngine.from_loaded(model, tok, "mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit")
print(eng.generate("What is in this image?", images=[Image.open("photo.jpg")]).text)
```

Requires `mlx-optiq >= 0.3.3`.

Asked to write Flappy Bird in a single HTML file, the 2-bit model produced a complete, working game. Here it is playing it:

![Qwen3.5-122B-A10B 2-bit playing the Flappy Bird it wrote, on a 36 GB Mac](flappy.gif)

## What it is

| Property | Value |
|---|---|
| Base | Qwen3.5-122B-A10B (122 B total, ~10 B active per token, 256 experts/layer) |
| Method | OptiQ `static` — structural per-layer bit allocation, no calibration |
| Bit-widths | 4-bit on attention / router / embeddings / first+last block, 2-bit on the routed experts |
| Achieved bits-per-weight | 2.50 |
| On disk | 44 GB |
| Resident while running | ~12 GB (experts streamed) |
| Decode speed | ~5 tok/s on an M3 Max (36 GB) |

The allocation is rule-based: for a 122 B MoE, exact calibration-driven sensitivity would run for days and needs the full model resident as a reference, so OptiQ's `static` method assigns bits from architecture alone. On small models it matches the calibration method at a fraction of the cost (see the [methods comparison](https://mlx-optiq.com/docs/sensitivity)).

## Run it

This is a Qwen3.5 MoE (`model_type: qwen3_5_moe`), so it needs **mlx-lm from main** and **`import optiq`** (the MoE text tower postdates the 0.31.3 PyPI release; the main build also reports `0.31.3`, so install from git, not a version pin):

```bash
pip install -U mlx-optiq "mlx-lm @ git+https://github.com/ml-explore/mlx-lm.git"
```

Serve it with SSD expert streaming (auto-enabled for a MoE too big to fit resident; `--stream-experts` forces it):

```bash
optiq serve --model mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit --stream-experts
```

Then open the Lab, ask for a game, and watch it render in the Canvas pane. Streaming keeps the residency flat (~12 GB) no matter how large the model on disk is, at the cost of per-token expert reads (decode is I/O-bound).

## Notes

This is an **extreme quant**. 2-bit on the experts is lossy, and the point of this artifact is that a 122 B model runs at all on consumer Apple Silicon, with coherent output. For reference quality on this base, use a higher-bit quant (`Qwen3.5-122B-A10B-4bit` and up). The full story is in the [blog post](https://mlx-optiq.com/blog/stream-122b-on-a-mac).
