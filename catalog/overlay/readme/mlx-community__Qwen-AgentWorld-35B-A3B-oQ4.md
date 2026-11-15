# Qwen-AgentWorld-35B-A3B-oQ4

oQ4 (data-driven mixed-precision, ≈4.6 bpw) MLX quantization of
[Qwen/Qwen-AgentWorld-35B-A3B](https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B),
produced with [oMLX](https://github.com/jundot/omlx)'s `quantize_oq_streaming`.

For Apple Silicon. Runs in `mlx-lm`, oMLX, or any MLX app. Siblings:
[oQ3.5](https://huggingface.co/mlx-community/Qwen-AgentWorld-35B-A3B-oQ3.5)
(smaller/faster, ≈3.5 bpw) and
[bf16](https://huggingface.co/mlx-community/Qwen-AgentWorld-35B-A3B-bf16) (full precision).

## Notes

- **Text-only.** The base checkpoint declares a `vision_config` and MTP heads in
  `config.json`, but ships **no** vision or `mtp.*` weights (693 tensors, 0 vision,
  0 MTP) — both are vestigial skeleton inherited from the Qwen3.5 base. This quant
  is the faithful language model; nothing multimodal was dropped.
- **≈19 GB** on disk (from ≈69 GB bf16). Peak memory ≈20 GB generating.
- Mixed-precision: per-layer bit allocation from oQ's sensitivity measurement;
  most weights are 4-bit-class with sensitive layers boosted.

## Performance

Measured with [oMLX](https://github.com/jundot/omlx) (Auto engine) on an
M5 Max (40-core GPU, 128 GB RAM). Single request:

| Context (pp/tg) | TTFT | decode | prefill | peak mem |
|---|---|---|---|---|
| 1024 / 128  | 463 ms | 136 tok/s | 2213 tok/s | 20.1 GB |
| 4096 / 128  | 1.18 s | 129 tok/s | 3469 tok/s | 20.8 GB |
| 8192 / 128  | 2.19 s | 125 tok/s | 3733 tok/s | 21.2 GB |
| 32768 / 128 | 11.5 s | 111 tok/s | 2844 tok/s | 23.2 GB |

Continuous batching (pp1024/tg128): 1×→136 · 2×→181 · 4×→252 · 8×→325 tok/s
aggregate decode (2.40× at 8 concurrent requests).

### Reference: BF16 source

Same setup, full-precision
[Qwen/Qwen-AgentWorld-35B-A3B](https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B):

| Context (pp/tg) | TTFT | decode | prefill | peak mem |
|---|---|---|---|---|
| 1024 / 128  | 644 ms | 77 tok/s | 1591 tok/s | 65.6 GB |
| 4096 / 128  | 1.68 s | 76 tok/s | 2434 tok/s | 66.4 GB |
| 8192 / 128  | 2.39 s | 75 tok/s | 3428 tok/s | 66.7 GB |
| 32768 / 128 | 12.0 s | 67 tok/s | 2730 tok/s | 68.7 GB |

**Takeaway:** oQ4 gives ≈1.8× the single-request decode throughput at ≈⅓ the
memory (20 GB vs 66 GB), and scales to 2.40× under 8-way batching.

## Accuracy (quick reference)

A quick, **non-representative** sanity check — 100-question samples per
benchmark with thinking enabled, run via oMLX's accuracy bench. Not enough
to draw firm conclusions, but it gives a rough idea of quality retention
across precisions.

| Benchmark | BF16 | oQ4 | oQ3.5 |
|---|---|---|---|
| MathQA | 85.0% | 84.0% | 83.0% |
| MMLU-Pro | 76.0% | 77.0% | 72.0% |

At this sample size oQ4 tracks the BF16 source within ≈1 pp (it even edges it
on MMLU-Pro — noise at 100 questions).

## Usage

```bash
mlx_lm.generate --model mlx-community/Qwen-AgentWorld-35B-A3B-oQ4 \
  --system-prompt "You are a language world model simulating a Linux terminal. Given the user's command, predict the terminal output." \
  --prompt $'Action: execute_bash\nCommand: ls -la /home/user/project/' \
  --max-tokens 512 --temp 0.6
```

The model uses thinking mode (`<think>...</think>`) by default. Recommended
sampling: `temperature=0.6`, `top_p=0.95`, `top_k=20`. See the
[base model card](https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B) for the
seven agent domains and domain-specific system prompts.
