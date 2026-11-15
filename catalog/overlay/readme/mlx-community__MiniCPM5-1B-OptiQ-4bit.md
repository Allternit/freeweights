# MiniCPM5-1B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

Mixed-precision MLX quantization of [openbmb/MiniCPM5-1B](https://huggingface.co/openbmb/MiniCPM5-1B) built with [mlx-optiq](https://mlx-optiq.com). Apache-2.0 from the base model.

- **Base:** openbmb/MiniCPM5-1B (1.08 B params, Llama architecture, hybrid reasoning)
- **Quantization:** OptiQ sensitivity-aware mixed-precision (4-bit + 8-bit)
- **Achieved bits-per-weight:** 5.81 (target 5.0)
- **Disk size:** 875 MB (vs 2,062 MB bf16, 2.4× compression)
- **Calibration:** the bundled `optiq.jsonl` mix (40 samples across prose, reasoning, code, agent loops, tool-calling, instructions)

The OptiQ optimizer kept **67 of 169 linears at 8-bit** (output projections, gate, last block, lm_head) and **102 at 4-bit** (most of MLP). The full per-layer assignment is in `optiq_metadata.json` next to the safetensors.

## Headline numbers, 6-benchmark Capability Score

| Benchmark | **OptiQ-4 (mixed)** | uniform-4 | Δ |
|---|---:|---:|---:|
| MMLU (5-shot, 1000) | **52.4%** | 49.0% | +3.4 |
| GSM8K (no thinking) | 2.7% | 1.7% | +1.0 |
| IFEval (strict, full) | **64.7%** | 58.6% | +6.1 |
| BFCL V3 (simple AST) | 0.0% | 0.0% | 0.0 |
| HumanEval (pass@1) | **57.9%** | 45.7% | **+12.2** |
| HashHop (overall) | **4.0%** | 0.0% | +4.0 |
| **Capability Score** | **30.28** | **25.84** | **+4.44** |
| KL vs bf16 (mean) | 0.136 | 0.350 | 2.6× closer |

Same recipe and benchmark suite as the rest of the mlx-optiq family (Qwen3.5, Qwen3.6, Gemma-4). MMLU + IFEval + HumanEval are the strong scores. GSM8K and BFCL are weak in the *non-thinking-mode* configuration the benchmark recipe uses for cross-family comparability, see "Hybrid reasoning" below for how to unlock them.

## Loading

```python
from mlx_lm import load, generate

model, tok = load("mlx-community/MiniCPM5-1B-OptiQ-4bit")

prompt = tok.apply_chat_template(
    [{"role": "user", "content": "Summarize the plot of The Iliad in three sentences."}],
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False,
)
print(generate(model, tok, prompt=prompt, max_tokens=300))
```

## Hybrid reasoning: think or no-think

MiniCPM5's chat template accepts an `enable_thinking` flag. With it on, the model emits a `<think>...</think>` block before answering, useful for math, multi-step planning, or any chain-of-thought task. The benchmark numbers above are with thinking **off** (the OptiQ framework forces it off for cross-family comparability).

| Mode | temperature | top_p | Use when |
|---|---:|---:|---|
| No-think (default) | 0.7 | 0.95 | Fast assistant, rewriting, conversational |
| Think | 0.9 | 0.95 | Math, code, multi-hop reasoning |

Pass via `chat_template_kwargs` at the OpenAI endpoint level or as a keyword to `apply_chat_template` directly. `optiq serve` forwards `chat_template_kwargs` verbatim:

```bash
optiq serve --model mlx-community/MiniCPM5-1B-OptiQ-4bit --port 8000

curl -s http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"mlx-community/MiniCPM5-1B-OptiQ-4bit",
       "messages":[{"role":"user","content":"What is 17 * 23?"}],
       "chat_template_kwargs":{"enable_thinking":true}}'
```

## Why HumanEval and HashHop jump so much

Sensitivity-aware allocation puts 8-bit precision on the layers OptiQ measured as most fragile (output projection, gate, the last few blocks). For a 1B model with limited redundancy, that targeting matters disproportionately. HumanEval +12.2 and HashHop recovering from a 0% floor to 4.0% are both consequences of that. Same pattern shows up on small Gemma quants, see the [mlx-optiq sensitivity-aware research](https://mlx-optiq.com/blog/sensitivity-aware-lora).

## Fine-tuning

The 1B size makes MiniCPM5 the smallest base in mlx-optiq that's still capable enough to fine-tune for real tasks. On a 24 GB Mac, LoRA training fits comfortably at `max_seq_length=2048` with all 7 Unsloth target modules adapted (peak ~3 GB during training, observed). The [sensitivity-aware LoRA](https://mlx-optiq.com/blog/sensitivity-aware-lora) overlay reads `optiq_metadata.json` and gives 8-bit layers 2× the adapter rank of 4-bit layers at the same parameter budget.

```bash
optiq lora train mlx-community/MiniCPM5-1B-OptiQ-4bit \
  --data ./my_training_data \
  --preset default \
  --max-seq-length 2048
```

## Reproducibility

```bash
optiq convert openbmb/MiniCPM5-1B --target-bpw 5.0 --candidate-bits 4,8
```

Bit-for-bit deterministic given the same calibration mix.


## Quantize your own

This quant was produced by [mlx-optiq](https://mlx-optiq.com). Point it at any Hugging Face model to get the same sensitivity-aware mixed precision:

```bash
pip install mlx-optiq
optiq convert <hf-model-id> --target-bpw 5.0 --candidate-bits 4,8
optiq lab   # full local workbench: chat, compare, quantize, fine-tune
```

## License + provenance

Apache-2.0, inherited from [openbmb/MiniCPM5-1B](https://huggingface.co/openbmb/MiniCPM5-1B). Quantized with [mlx-optiq](https://mlx-optiq.com).
