# Gemma 4 26B A4B it — QAT-aligned 4-bit for MLX

**TL;DR**: This is *not* a regular `mlx_lm convert -q` quantization. It is a
**QAT-lattice-aligned** 4-bit conversion of
[google/gemma-4-26B-A4B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized)
that **recovers Google's original QAT scales from the weights** instead of
re-deriving them from min/max statistics. Standard MLX affine layout
(group_size=32, 4-bit), loadable by stock `mlx-lm` — no patches needed.
52 GB → 15 GB (~5.0 bits/weight). Text-only (the vision tower is not included).

## Why a special conversion?

The `qat-q4_0-unquantized` checkpoints store weights already snapped to a
symmetric int4 lattice (codes ∈ [-8, 7], one scale per 32 input-dim elements).
For the MoE experts, dense MLPs, and the router, those scales are **learned
during QAT and cannot be recovered from weight min/max statistics**: only
26–38% of blocks touch an extreme code. Any quantizer that re-derives scales —
llama.cpp's naive Q4_0 (`d = extreme/-8`) *and* MLX's default affine mode
(`scale = (max-min)/15`, group_size 64) — re-snaps ~60–74% of MoE/MLP blocks
onto a misaligned grid. (This is the same effect Unsloth documented for
llama.cpp in their Gemma 4 QAT analysis.)

This conversion instead recovers the grid step of every 32-block directly from
the snapped weights (k-sweep over `absmax/k` + least-squares refinement) and
emits it as standard MLX affine parameters (`scale = s, bias = -8·s`).
The MoE router (`router.proj`) is kept in bf16 (~20 MB): top-8-of-128 expert
selection is the most perturbation-sensitive spot, and llama.cpp MoE GGUFs
never quantize `ffn_gate_inp` either.

## Fidelity vs. the bf16 QAT reference (26B A4B)

Weight space, relative RMSE to the original checkpoint:

| | default `mlx_lm convert -q` (affine, gs=64) | this conversion |
|---|---|---|
| relRMSE | 7.0–8.6% | **0.18–0.23%** (bf16 storage noise floor) |

Teacher-forced logits, 1600-token mixed EN/zh/code text, KL(bf16 ‖ quantized):

| variant | mean KL | top-1 agreement |
|---|---|---|
| default `mlx_lm convert -q` (gs=64) | 0.277 | 82.7% |
| MLX affine gs=32 | 0.353 | 80.1% |
| **this conversion** | **0.090** | **90.3%** |
| *control: bf16 + matched random noise σ=0.185% (no quantization)* | *0.151* | *87.7%* |

The noise control shows this conversion sits at the intrinsic sensitivity
floor of this 128-expert sparse-MoE architecture: the residual KL is fully
explained by ±1-ulp bf16 rounding noise amplified by discrete routing flips,
not by quantization error. (For reference, Unsloth's UD-Q4_K_XL GGUF reports
mean KLD 0.098 / top-1 85.6% on 26B on their own eval set.)

## Use

```bash
pip install mlx-lm
```

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/gemma-4-26B-A4B-it-qat-q4_0-mlx-aligned")
prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": "Explain quantization-aware training in two sentences."}],
    add_generation_prompt=True,
)
print(generate(model, tokenizer, prompt=prompt, max_tokens=256))
```

## Reproduce

The conversion scripts are included in this repo under `conversion/`:

- `qat_q4_recover.py` — lattice-scale recovery quantizer
  (`recover_grid_step`: per-32-block k-sweep with residual tolerance 0.075
  to absorb bf16 rounding of `code × scale` products, then least-squares refit)
- `convert_aligned.py` — end-to-end converter producing this repo's format
  (run against the `qat-q4_0-unquantized` checkpoint; `--quantize-router`
  to also quantize the router)

## Notes & limitations

- **Text-only.** The mlx-lm Gemma 4 implementation drops the vision tower
  (which Google did not QAT-quantize anyway).
- ~5.0 bits/weight vs. 4.5 for GGUF Q4_0: MLX's affine format stores a bias
  per group that is always `-8·scale` here. Redundant but required by the
  current kernels.
- Byte-exact recovery of the bf16 checkpoint is not possible with bf16 scales
  (Google's original QAT scales are fp32); this conversion reaches ~90%
  byte-exactness with the remainder at ±1 ulp — at, not above, the bf16
  noise floor that the KL control quantifies.

## License & attribution

Gemma is provided under and subject to the terms at
https://ai.google.dev/gemma/docs/gemma_4_license (Apache 2.0 for Gemma 4).
This is a quantized derivative of Google DeepMind's
[gemma-4-26B-A4B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized);
all credit for the model and the QAT pipeline goes to Google. Conversion
performed with [mlx-lm](https://github.com/ml-explore/mlx-lm) plus the
included scale-recovery quantizer.
