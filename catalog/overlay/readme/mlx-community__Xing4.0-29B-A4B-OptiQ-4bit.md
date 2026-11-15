# mlx-community/Xing4.0-29B-A4B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Family guide](https://mlx-optiq.com/docs/xing4) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A mixed-precision MLX quant of [XingChen-AGI/Xing4.0-29B-A4B](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B). Sensitive layers are kept at 8-bit and robust ones at 4-bit, rather than crushing everything to a uniform width.

## Requires mlx-optiq

Stock `mlx-lm` has no `xing4_0` class — support is an unmerged pull request, so a plain install answers `ValueError: Model type xing4_0 not supported`. OptiQ ships a vendored, mlx-native port that registers with mlx-lm on `import optiq`.

```bash
pip install "mlx-optiq>=0.5.13"
```

## Use it

```bash
optiq serve --model mlx-community/Xing4.0-29B-A4B-OptiQ-4bit
```

Or with `mlx-lm` directly:

```python
import optiq  # registers the xing4_0 arch with mlx-lm
from mlx_lm import load, generate

model, tok = load("mlx-community/Xing4.0-29B-A4B-OptiQ-4bit")
prompt = tok.apply_chat_template(
    [{"role": "user", "content": "Explain write-ahead logging in two sentences."}],
    add_generation_prompt=True, tokenize=False)
print(generate(model, tok, prompt=prompt, max_tokens=256))
```

## Quantization details

| Property | Value |
|---|---|
| Predominant precision | 4-bit |
| Layers at 8-bit | 303 |
| Bits per weight | 5.00 |
| Size on disk | 19.6 GB (from ~58 GB bf16) |
| Group size | 64 |

The per-layer allocation was measured on this model: a KL-divergence sensitivity
pass over all 395 quantizable tensors — the 64 routed experts included — against
a six-domain calibration mix, then a knapsack over the bit budget. The per-layer
bit map is in `optiq/metadata.json` and in the `quantization` block of
`config.json`.

## Capability Score

Measured on this quant, not inherited from the parent. Xing4.0 is a new family
with no scored sibling, so the full six-metric suite was run.

| Metric | Score |
|---|---|
| MMLU (5-shot, 1000 samples) | 71.7% |
| GSM8K (1000 samples) | 90.1% |
| IFEval (strict, prompt-level) | 61.2% |
| BFCL-V3 simple | 74.5% |
| HumanEval pass@1 | 84.8% |
| HashHop (~8.9k context) | 18.0% |
| **Capability Score** | **66.71** |

**Read the HashHop row in context.** 18% on long-context hash retrieval sits far
below the rest, and it is the architecture rather than the quantization:
multi-head latent attention compresses the KV cache into a low-rank latent
(`kv_lora_rank: 512`), which is what needle-in-a-haystack recall over thousands
of random keys pays for. The model answers immediately with a well-formed but
wrong hash — it is not running out of tokens and it is not being mis-scored.
Reasoning, instruction-following, tool use and coding are unaffected.

## The architecture

DeepSeek-V3's attention — multi-head latent attention, 64 routed experts and one
shared expert, about 4B parameters active per token — plus one thing of its own:
the **hyper-connection**. Instead of a single residual stream running through the
network, it carries four in parallel, and every block reads from and writes back
to a mix of them decided per layer by a Sinkhorn-normalised routing matrix.

## Notes

- A bf16 reference comparison was not possible on the machine that built this
  (the parent is 58 GB against 36 GB of RAM), so the port was verified by a
  line-by-line reading against the reference implementation plus generation
  against the quant, not by a bit-exact check.
