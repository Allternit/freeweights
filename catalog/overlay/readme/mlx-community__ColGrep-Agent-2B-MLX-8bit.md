# ColGrep-Agent-2B - MLX 8BIT

Native Apple Silicon MLX conversion of [LightOn's ColGrep-Agent-2B](https://huggingface.co/lightonai/colgrep-agent-2B), a specialized repository code-localization agent built on MiniCPM5-2B.

- Upstream checkpoint: `lightonai/colgrep-agent-2B` at `f798a61129c6decb5166864e0a3c98373e62c764`
- Conversion: MLX-LM 0.32.0, 8-bit affine, group size 64
- Compatibility: source `chat_template.jinja` preserved; top-level `rope_theta=5000000` added so MLX-LM's Llama RoPE implementation matches the source configuration.
- Original model authors: LightOn AI; original model license: Apache-2.0.

## Usage

```bash
pip install 'mlx-lm==0.32.0' 'transformers>=5.6.2,<6'
mlx_lm.generate --model . --prompt 'Hello' --max-tokens 128
```

**This is not a general coding assistant.** It was trained for iterative code search with `colgrep`, `terminal`, and `finish`. Use the upstream chat template, system prompt, tool schemas, and thinking disabled. The official `colgrep --agent` CLI currently runs GGUF through llama.cpp; this MLX checkpoint is **not** a drop-in replacement for that CLI. An MLX-backed harness is separate integration work.

This checkpoint is not claimed to match upstream BF16 on benchmarks until an apples-to-apples evaluation of full search trajectories is reported. The smoke test validates basic load, format, and first tool-call structure only.

- Upstream blog: https://huggingface.co/blog/lightonai/colgrep-agent
- Upstream harness: https://github.com/lightonai/next-plaid
- MLX-LM: https://github.com/ml-explore/mlx-lm
