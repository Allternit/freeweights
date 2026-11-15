# mlx-community/Laguna-XS-2.1-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

A mixed-precision MLX quant of [poolside/Laguna-XS-2.1](https://huggingface.co/poolside/Laguna-XS-2.1), a sparse mixture-of-experts reasoning model built for coding and agentic work. Per-layer bit-widths come from a KL-divergence sensitivity pass on a [six-domain calibration mix](https://mlx-optiq.com/blog/calibration-mix) (prose · reasoning · code · agent · tool-call · constraint-bearing instructions): sensitive layers get more bits, robust ones fewer, at **~4.5 bits-per-weight** average (20 GB on disk).

## Needs mlx-optiq

Stock `mlx-lm` has no `laguna` class. OptiQ ships a vendored, mlx-native port of the Laguna architecture (sigmoid MoE with a shared expert, QK-norm, GLM partial-rotary, softplus attention gate, hybrid full/sliding attention with dual RoPE) that registers with `mlx-lm` on `import optiq`. Install and import it before loading:

```bash
pip install "mlx-optiq>=0.4.7"
```

```python
import optiq  # registers the laguna arch with mlx-lm
from mlx_lm import load, generate

model, tok = load("mlx-community/Laguna-XS-2.1-OptiQ-4bit")
prompt = tok.apply_chat_template(
    [{"role": "user", "content": "Write a Python function that returns the nth Fibonacci number."}],
    tokenize=False, add_generation_prompt=True,
)
print(generate(model, tok, prompt=prompt, max_tokens=400))
```

Laguna is a reasoning model. It thinks before answering, so give it a generous `max_tokens`. For an OpenAI + Anthropic-compatible server with mixed-precision KV cache, tool-call healing, and prompt caching, use `optiq serve`:

```bash
optiq serve --model mlx-community/Laguna-XS-2.1-OptiQ-4bit
```

## Quantization details

| Property | Value |
|---|---|
| Method | OptiQ mixed-precision (sensitivity-driven) |
| Average precision | ~4.5 bits-per-weight |
| Group size | 64 |
| Reference for sensitivity | uniform 4-bit |
| Calibration mix | [six-domain mix](https://mlx-optiq.com/blog/calibration-mix) (40 samples × 6 domains) |
| Layers | 40 · sigmoid MoE (shared expert, layer-0 dense) |
| On-disk size | 20 GB |

Following the naming `llama.cpp` uses for its mixed quants (Q4_K_M and friends), the "4bit" label denotes the family, not the weighted average. The mixed allocation is what preserves capability at this size.

## Benchmarks

Six-metric **Capability Score** (the unweighted mean of MMLU, GSM8K, IFEval, BFCL, HumanEval, and HashHop). Scored in reasoning mode (generative MMLU + a large think-token budget), the setting that measures an always-on thinking model fairly.

| Metric | OptiQ-4bit |
|---|---:|
| MMLU (reasoning, 969 samples) | 86.2% |
| GSM8K (1000 samples) | 95.6% |
| IFEval (full set, strict) | 76.5% |
| BFCL-V3 simple (200 calls) | 89.0% |
| HumanEval (164 problems, pass@1) | 82.9% |
| HashHop (long-context retrieval) | 84.0% |
| **Capability Score** (mean of 6) | **85.70** |

Every metric gets one equal vote. See the [eval-framework writeup](https://mlx-optiq.com/blog/eval-framework) for the full methodology.

## Links

- **Project website:** [mlx-optiq.com](https://mlx-optiq.com/)
- **All OptiQ quants:** [mlx-optiq.com/models](https://mlx-optiq.com/models)
- **PyPI:** [pypi.org/project/mlx-optiq](https://pypi.org/project/mlx-optiq/)
- **Base model:** [poolside/Laguna-XS-2.1](https://huggingface.co/poolside/Laguna-XS-2.1)
