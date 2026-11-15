# mlx-community/Devstral-Small-2-24B-Instruct-2512-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A 4-bit mixed-precision MLX quant produced by [mlx-optiq](https://mlx-optiq.com/), the sensitivity-aware quantization toolkit for Apple Silicon. Beats stock uniform 4-bit on the six-metric Capability Score, with a standout +9 points on long-context retrieval.

A 4-bit mixed-precision MLX quant of [Devstral-Small-2-24B-Instruct-2512](https://huggingface.co/mistralai/Devstral-Small-2507). Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose · reasoning · code · agent · tool-call · constraint-bearing instructions). Sensitive layers go to 8-bit; robust ones stay at 4-bit. This is the first OptiQ quant of a Mistral-family model.

## Quantization details

| Property | Value |
|---|---|
| Predominant precision | 4-bit |
| Layers at 8-bit (sensitive) | 179 |
| Layers at 4-bit (robust) | 102 |
| Total quantized layers | 281 |
| Achieved bits-per-weight | 5.01 |
| Group size | 64 |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) (40 samples × 6 domains) |
| Reference for sensitivity | uniform-4-bit (24B does not fit bf16 in typical RAM) |

We follow the same naming convention `llama.cpp` uses for Q4_K_M and similar mixed-precision quants: the "4-bit" label is for the predominant precision, not the weighted average. The mixed allocation puts more bits where the sensitivity pass says they matter, which is what lets this build win the Capability Score below.

## Usage

Load it with `mlx-lm` and use it as usual:

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Devstral-Small-2-24B-Instruct-2512-OptiQ-4bit")
response = generate(
    model, tokenizer,
    prompt="Write a Python function that returns the nth Fibonacci number.",
    max_tokens=200,
)
```

Devstral is a tool-calling, agentic coding model. For multi-step tool use, serve it with [`mlx-optiq`](https://mlx-optiq.com/) (OpenAI + Anthropic-compatible server, mixed-precision KV-cache, sensitivity-aware LoRA):

```bash
pip install mlx-optiq
optiq serve --model mlx-community/Devstral-Small-2-24B-Instruct-2512-OptiQ-4bit
```

`optiq serve` captures Mistral/Devstral tool calls correctly. They end on EOS with no closing marker, which stock servers drop after the first call, and it normalizes tool-call arguments before chat templating.

See the [Mistral family guide](https://mlx-optiq.com/docs/mistral) on [mlx-optiq.com](https://mlx-optiq.com/) for sampling defaults, agent recipes, and family-specific caveats.

## Benchmarks

Six-metric Capability Score (mean of MMLU + GSM8K + IFEval + BFCL + HumanEval + HashHop). Apples-to-apples comparison against stock uniform 4-bit:

| Metric | OptiQ | Uniform 4-bit | Δ |
|---|---:|---:|---:|
| MMLU (5-shot, 1000 samples) | **80.8%** | 79.4% | +1.4 |
| GSM8K (1000 samples, 3-shot CoT) | 87.2% | **88.1%** | -0.9 |
| IFEval (full set, strict) | **68.6%** | 68.0% | +0.6 |
| BFCL-V3 (tool calls) | **89.5%** | 88.5% | +1.0 |
| HumanEval (164 problems, pass@1) | **83.5%** | 82.9% | +0.6 |
| HashHop (long-context retrieval) | **62.0%** | 53.0% | +9.0 |
| **Capability Score** (mean of 6) | **78.60** | 76.65 | **+1.95** |
| On-disk size | 15.4 GB | 12.3 GB | +3.1 |

Every metric gets one equal vote. Disk size is reported next to the score as an honest second axis instead of being folded into the score. OptiQ wins 5 of 6 metrics; the win concentrates on HashHop (long-context multi-hop retrieval), exactly where uniform 4-bit degrades most. See the [eval-framework writeup](https://mlx-optiq.com/blog/capability-score) for methodology.

## License

Apache-2.0, inherited from the base model.
