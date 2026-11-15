# mlx-community/Hy-Memory-30B-A3B-8bit

This model [mlx-community/Hy-Memory-30B-A3B-8bit](https://huggingface.co/mlx-community/Hy-Memory-30B-A3B-8bit)
was converted to MLX format from [tencent/Hy-Memory-30B-A3B](https://huggingface.co/tencent/Hy-Memory-30B-A3B)
(revision `64a460a9`) using mlx-lm 0.31.3 (mlx 0.31.2).

Hy-Memory-30B-A3B is Tencent Hunyuan's mixture-of-experts model (about 30B parameters in total,
about 3B active per token: 48 layers, 128 routed experts with 8 active plus one shared expert).
Its specialty seems to be a long-term memory writer: it is trained to run the write path of
external memory frameworks (Mem0, MemOS, Hy-Memory), deciding what to retain, how precisely to
represent it and how new evidence updates the memory bank. See the
[original model card](https://huggingface.co/tencent/Hy-Memory-30B-A3B) and
[arXiv 2610.22196](https://arxiv.org/abs/2610.22196).

## Quantization

| | |
|---|---|
| Method | affine, group size 64, 8-bit |
| Bits per weight | 8.503 |
| Kept in full precision | the MoE router (`mlp.router.gate`, bfloat16) and its expert-score correction bias (`mlp.router.expert_bias`, float32); norms |
| Size | 30 GB |

The router decides which 8 of the 128 experts run for each token. Its correction bias
deliberately tightens the selection margins, so the router is not quantized.

## The model class is bundled

mlx-lm has no `hy_v3` model module (an upstream pull request, ml-explore/mlx-lm#1211, was closed
unmerged). This repository therefore ships the model class as `hy_v3.py`, and `config.json`
points to it with `"model_file": "hy_v3.py"`; `mlx_lm.load` imports that file. Loading this model
runs that Python file, as with any `model_file` checkpoint.

`hy_v3.py` is AbstractCore's `abstractcore/providers/mlx_hy_v3.py`, written from transformers'
`HYV3ForCausalLM`: router logits in float32, sigmoid scores, the correction bias used only to
choose the experts (the combine weights are the unbiased scores, normalised and multiplied by
`router_scaling_factor`), the shared expert added in float32. The released checkpoint's experts
are 768 wide (`expert_hidden_dim`), although `moe_intermediate_size` in `config.json` says 1536;
the class uses `expert_hidden_dim`. Tensor names follow the mlx-lm MoE convention
(`mlp.switch_mlp.*`, `mlp.router.gate`, `mlp.router.expert_bias`, `mlp.shared_mlp.*`), as in
`mlx-community/Hy3-preview-*`.

Measured against transformers 5.8.0 on the bfloat16 weights (before quantization), on a
100-token prompt: the five most likely next tokens are the same and in the same order, the
correlation of the last-position logits is 0.9965, the most likely token agrees at 96 of 100
positions, and the 32-token greedy continuation decodes to the same text. On a small random
HY V3 model in float32 the class matches transformers to within 4e-6.

## Use with mlx-lm

```bash
pip install mlx-lm
python -m mlx_lm generate --model mlx-community/Hy-Memory-30B-A3B-8bit \
  --system-prompt 'Extract explicit user facts and preferences from the conversation. Return only a JSON object with a "memories" list of strings.' \
  --prompt "My name is Alex. I live in Seattle and I'm vegetarian." \
  --max-tokens 512 --temp 0.0
```

The chat template has one reasoning variable, `reasoning_effort`: `no_think` (the default),
`low` or `high`. With `low` or `high` the model writes its reasoning first and closes it with
`</think>`:

```bash
python -m mlx_lm generate --model mlx-community/Hy-Memory-30B-A3B-8bit \
  --chat-template-config '{"reasoning_effort": "high"}' \
  --prompt 'Memory bank: ["Alex lives in Seattle"]. New message: "I moved to Portland." Which memory changes, and to what?'
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Hy-Memory-30B-A3B-8bit")
messages = [
    {"role": "system", "content": 'Extract explicit user facts. Return only a JSON object with a "memories" list of strings.'},
    {"role": "user", "content": "My name is Alex. I live in Seattle and I'm vegetarian."},
]
prompt = tokenizer.apply_chat_template(
    messages, add_generation_prompt=True, tokenize=False, reasoning_effort="no_think"
)
print(generate(model, tokenizer, prompt=prompt, max_tokens=512))
```

For memory extraction the original card uses no reasoning and temperature 0.0; for general
sampling, temperature 0.7 and top-p 1.0.

Tool calls follow the template:
`<tool_calls><tool_call>name<tool_sep><arg_key>key</arg_key><arg_value>value</arg_value></tool_call></tool_calls>`.

## Use with AbstractCore

```python
from abstractcore import create_llm

llm = create_llm("mlx", model="mlx-community/Hy-Memory-30B-A3B-8bit")
resp = llm.generate("My name is Alex and I'm vegetarian.",
                    system_prompt='Return only a JSON object with a "memories" list of strings.',
                    thinking=False, temperature=0.0)
```

`thinking=False` sends `reasoning_effort=no_think`, `thinking=True` or `"high"` sends `high`, and
`"low"` sends `low`; the reasoning is returned separately from the answer, and tool calls are
parsed.

## License

Apache-2.0, as the base model.
