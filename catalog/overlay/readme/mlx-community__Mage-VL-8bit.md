# Mage-VL-8bit

[**microsoft/Mage-VL**](https://huggingface.co/microsoft/Mage-VL) (4B codec-native multimodal
model, Apache-2.0) quantized to **8-bit** for [MLX](https://github.com/ml-explore/mlx) on Apple
Silicon.

Converted with `mlx_vlm.convert` (affine, group size 64, **9.023 bits/weight**): the Qwen3-4B
language model — embeddings, attention/MLP projections, lm_head — is int8; the Mage-ViT vision
tower stays bf16. **5.0 GB** on disk vs 9.5 GB upstream.

## Quality

Gated against the bf16 checkpoint and the PyTorch reference on the model's own
`examples/dog.jpg`, greedy decoding:

| comparison | result |
|---|---|
| int8 vs PyTorch reference | **48/48 tokens identical** |
| int8 vs bf16 MLX | 48/48 tokens identical |
| final-position logits vs reference | cos 0.9982 (bf16 baseline: 0.9996) |

Measured on an M5 Max (macOS 27), one process per number, floor read post-load, at the default
4096-token budget:

| | resident floor | activation | decode |
|---|---|---|---|
| int8 · image | 5.0 GB | 3.0 GB | 85.7 tok/s |
| int8 · video 16f | 5.0 GB | 5.8 GB | 80.0 tok/s |
| bf16 · image | 8.85 GB | 2.85 GB | 51.2 tok/s |
| bf16 · video 16f | 8.85 GB | 5.8 GB | 50.2 tok/s |

Activation is unchanged by quantization (5.77 vs 5.79 GB) — only the resident floor moves.

The **token budget**, not the frame count, is the memory lever: at a fixed budget, 32 frames
costs slightly less than 16 because per-frame resolution drops to compensate. Raising the budget
is what costs — the same clip at an 8192-token budget needs **14.2 GB** of activation.

> **Corrected 2026-07-29.** This section previously read "~14 GB for 16-frame video QA at a
> 4096-token budget". That 14 GB figure is real but belongs to the *8192*-token budget: it was
> measured before per-frame video resolution was derived from the token budget, and was not
> re-measured when the default changed. Swift package `v0.3.0` re-declares its footprint
> accordingly.

## Use

**Python** — the `mage_vl` architecture is **merged into mlx-vlm**
([PR #1745](https://github.com/Blaizzy/mlx-vlm/pull/1745), merged 2026-07-29), so no fork or
branch install is needed:

```bash
pip install "mlx-vlm>=0.6.9"
# 0.6.9 is the first release containing mage_vl. Until it lands on PyPI, install from main:
#   pip install git+https://github.com/Blaizzy/mlx-vlm
```

No `trust_remote_code` needed — the port ships a torch-free processor, and **no torch or
torchvision install is required**.

> If you installed from the old `xocialize/mlx-vlm@mage-vl` branch, switch to upstream — that
> branch is retired and will not receive fixes. Anything installed from it before `bf9ca87`
> (2026-07-28) also carries a bug where torchvision-free setups silently fell back to the
> checkpoint's torch-based remote processor and failed with `ones_like(): argument 'input' must be
> Tensor`. Details in [discussion #1](https://huggingface.co/mlx-community/Mage-VL-8bit/discussions/1).

```python
from mlx_vlm import load, generate
from mlx_vlm.prompt_utils import apply_chat_template

model, processor = load("mlx-community/Mage-VL-8bit")
prompt = apply_chat_template(processor, model.config, "Describe this image in detail.", num_images=1)
print(generate(model, processor, prompt, image=["dog.jpg"], max_tokens=64).text)
```

**Swift** — [`xocialize/mage-vl-swift`](https://github.com/xocialize/mage-vl-swift) (≥ v0.3.0)
serves this checkpoint as an MLXEngine package (`imageAnalysis` + `videoAnalysis`):

```swift
try await engine.register(
    MageVLPackage.registration,
    configuration: MageVLConfiguration(quant: .int8))
```

## Provenance

Upstream weights: [microsoft/Mage-VL](https://huggingface.co/microsoft/Mage-VL), Apache-2.0.
This repo excludes the DCVC neural-codec runtime and the StreamMind gate weights (CUDA-only /
not used by the MLX ports). The `neural_codec` Python sources are retained verbatim from
upstream for `trust_remote_code` completeness.
