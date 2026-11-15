# Mellum2.1 12B A2.5B Thinking - 6-bit MLX

This is a 6-bit affine MLX quantization of
[JetBrains/Mellum2.1-12B-A2.5B-Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking),
a reasoning Mixture-of-Experts coding model (12B total, 2.5B active, 64 experts with 8 active per token).
It emits reasoning in `<think>...</think>` blocks before the final answer.

The weights are byte-identical to
[imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-6bit-g64](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-6bit-g64);
`conversion.json` and `validation.json` record the source revision, software versions and SHA-256 checksums.

## Conversion details

- Source: `JetBrains/Mellum2.1-12B-A2.5B-Thinking`, revision `92ddae9fc7665e9f801d141d2e5a6b2caf2460c4`
- Quantization: affine, 6 bits, group size 64; MoE routers 8-bit (upstream policy)
- Converted with `mlx==0.32.3`, `mlx-lm==0.32.0`
- EOS token: `<|im_end|>` (token ID 28)

## Benchmarks

Full 164-task HumanEval+, greedy, 8,192-token budget including reasoning: **146/164** (BF16 original: 153/164).
On a 16 GB M4 MacBook Pro it decodes at 47 / 46 / 43 tok/s at 1K / 4K / 16K context and peaks at 10.5 GB MLX memory,
so 24 GB or more is recommended. On a 16 GB Mac, use the [NVFP4 build](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-nvfp4) (6.84 GB). Raw results and a comparison with other quantizations:
[github.com/imaddde867/mellum-mlx](https://github.com/imaddde867/mellum-mlx).

## Usage

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Mellum2.1-12B-A2.5B-Thinking-6bit")
messages = [{"role": "user", "content": "Find the bug: def mean(xs): return sum(xs) / len(xs) - 1"}]
prompt = tokenizer.apply_chat_template(messages, add_generation_prompt=True)
print(generate(model, tokenizer, prompt=prompt, max_tokens=16384, verbose=True))
```

JetBrains recommends `temperature=0.6, top_p=0.95, top_k=20` for chat.
