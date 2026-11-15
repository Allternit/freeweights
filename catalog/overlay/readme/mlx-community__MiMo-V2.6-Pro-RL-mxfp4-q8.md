# mlx-community/MiMo-V2.6-Pro-RL-mxfp4-q8

This model [mlx-community/MiMo-V2.6-Pro-RL-mxfp4-q8](https://huggingface.co/mlx-community/MiMo-V2.6-Pro-RL-mxfp4-q8) was
converted to MLX format from [XiaomiMiMo/MiMo-V2.6-Pro-RL](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL)
using mlx-lm version **0.32.0** ([PR #1219](https://github.com/ml-explore/mlx-lm/pull/1219)).

## Quantization

- MoE expert weights are the original checkpoint's native **MXFP4** (4-bit, group size 32), loaded directly without requantization.
- Attention, dense MLP, embeddings and `lm_head` are **8-bit affine**, group size 64.
- 4.339 bits per weight overall, 516 GB on disk.

This is a text-only conversion: the vision and audio encoders and the MTP/DFlash draft weights are not included.

## Requirements

MiMo-V2 support is in [mlx-lm PR #1219](https://github.com/ml-explore/mlx-lm/pull/1219). Until it is merged, install mlx-lm from that branch:

```bash
pip install git+https://github.com/kernelpool/mlx-lm.git@add-mimo-v2
```

At 1.02T total parameters (42B active) this model does not fit on a single Mac. It is meant to run tensor-parallel across two 512 GB machines with mlx-lm's distributed support, for example:

```bash
mlx.launch --backend jaccl --hostfile hosts.json -- \
  python -m mlx_lm.examples.sharded_generate \
  --model mlx-community/MiMo-V2.6-Pro-RL-mxfp4-q8 --prompt "hello" -m 256
```

See the mlx-lm distributed inference documentation for the hostfile format and backend setup.

## Use with mlx

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/MiMo-V2.6-Pro-RL-mxfp4-q8")

prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_dict=False,
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
```

Thinking is enabled by default in the chat template; pass `enable_thinking=False` to `apply_chat_template` to disable it. Tool calls use the Qwen3-Coder format (`<tool_call><function=...>`), which the `qwen3_coder` tool parser in mlx-lm handles.
