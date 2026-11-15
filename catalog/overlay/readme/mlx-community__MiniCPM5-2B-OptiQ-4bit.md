# MiniCPM5-2B-OptiQ-4bit

> **Built with [mlx-optiq](https://mlx-optiq.com)**, the MLX-native toolkit to quantize, prune, fine-tune, and serve LLMs locally on Apple Silicon, no PyTorch and no cloud. [Try the Lab](https://mlx-optiq.com/docs/lab/) · [All OptiQ quants](https://mlx-optiq.com/models) · [Docs](https://mlx-optiq.com/docs/)

Mixed-precision MLX quantization of [openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B), OpenBMB's 2B-class Llama-architecture model with hybrid reasoning, tool calling and a 128k context. Apache-2.0 from the base model.

- **Base:** openbmb/MiniCPM5-2B (42 layers, Llama architecture, hybrid reasoning, 128k context)
- **Quantization:** OptiQ sensitivity-aware mixed precision (4-bit + 8-bit)
- **Disk size:** 1,837 MB
- **Calibration:** the bundled `optiq.jsonl` mix (40 samples across prose, reasoning, code, agent loops, tool-calling, instructions)

The OptiQ optimizer measured every linear layer against the bf16 model and kept **112 of 295 at 8-bit** (the ones whose output moved most under 4-bit: output projections, the last blocks, lm_head) and **183 at 4-bit**. The full per-layer assignment is in `optiq/metadata.json` next to the safetensors.

## Capability Score

Six benchmarks, one number, the same recipe as every mlx-optiq quant (non-thinking mode, for cross-family comparability).

| Benchmark | Score |
|---|---:|
| MMLU (5-shot, 1000) | 59.8% |
| GSM8K (1000, 3-shot CoT) | 82.1% |
| IFEval (full set, strict) | 86.7% |
| BFCL V3 (simple AST, 200 calls) | 82.5% |
| HumanEval (164, pass@1) | 81.1% |
| HashHop (long-context retrieval) | 24.0% |
| **Capability Score** | **69.36** |

For scale: this 1.8 GB file scores level with the 2.8 GB [Qwen3.5-4B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.5-4B-OptiQ-4bit) (68.76), ahead on instruction following, GSM8K and HumanEval, behind on MMLU and tool-call format.

## Loading

```python
from mlx_lm import load, generate

model, tok = load("mlx-community/MiniCPM5-2B-OptiQ-4bit")

prompt = tok.apply_chat_template(
    [{"role": "user", "content": "Summarize the plot of The Iliad in three sentences."}],
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False,
)
print(generate(model, tok, prompt=prompt, max_tokens=300))
```

## Hybrid reasoning: think or no-think

The chat template takes an `enable_thinking` flag. On, the model emits a `<think>...</think>` block before answering, which helps on math, planning and multi-step code. The scores above are with thinking **off**.

| Mode | temperature | top_p | Use when |
|---|---:|---:|---|
| No-think (default) | 0.7 | 0.95 | Fast assistant, rewriting, conversational |
| Think | 0.9 | 0.95 | Math, code, multi-hop reasoning |

`optiq serve` forwards `chat_template_kwargs` verbatim, and also accepts the model name with a `:think` / `:no-think` suffix:

```bash
optiq serve --model mlx-community/MiniCPM5-2B-OptiQ-4bit --port 8000

curl -s http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"mlx-community/MiniCPM5-2B-OptiQ-4bit:think",
       "messages":[{"role":"user","content":"What is 17 * 23?"}]}'
```

## Tool calling

MiniCPM5 uses its own `<function name="..."><param name="...">` call format. `optiq serve` parses it into OpenAI `tool_calls`, so agents that speak the OpenAI or Anthropic protocol (OptiQ Code, Claude Code via the Anthropic endpoint, OpenCode, Codex) work unchanged.

## KV cache

`kv_config.json` in this repo is a per-layer mixed-precision KV-cache plan from `optiq kv-cache`. Pass it to `optiq serve --kv-config` for a smaller cache at long context without the quality loss of uniform 4-bit KV.

## Fine-tuning

Small enough to LoRA-train on a 24 GB Mac at `max_seq_length=2048`. The [sensitivity-aware LoRA](https://mlx-optiq.com/blog/sensitivity-aware-lora) overlay reads `optiq/metadata.json` and gives 8-bit layers twice the adapter rank of 4-bit layers at the same parameter budget.

```bash
optiq lora train mlx-community/MiniCPM5-2B-OptiQ-4bit \
  --data ./my_training_data \
  --preset default \
  --max-seq-length 2048
```

## Reproducibility

```bash
optiq convert openbmb/MiniCPM5-2B --target-bpw 5.0 --candidate-bits 4,8 --reference bf16
```

Deterministic given the same calibration mix.

## Quantize your own

```bash
pip install mlx-optiq
optiq convert <hf-model-id> --target-bpw 5.0 --candidate-bits 4,8
optiq lab   # local workbench: chat, compare, quantize, fine-tune
```

## License + provenance

Apache-2.0, inherited from [openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B). Quantized with [mlx-optiq](https://mlx-optiq.com).
