# sera-subset-mixed-10000-axolotl__Qwen3-8B-v8

SFT of Qwen/Qwen3-8B on a 10000-row random mixed subset of `ethanlshen/sera-subset` (stage1 unresolved + stage2 resolved), trained with axolotl following the upstream SERA recipe.

See `baselines/sera/README.md` in the open-thoughts/OpenThoughts-Agent repo for the full reproduction details, hyperparameters, and iteration history (this is iteration i9, version v8).

## Hyperparameters

- learning_rate: 1e-5
- batch_size: 32 (global; micro=1, grad_accum=1, dp=32)
- num_epochs: 3
- warmup_steps: 48
- adam_beta1: 0.9, adam_beta2: 0.95
- weight_decay: 0.01
- sequence_len: 32768
- chat_template: chatml
- bf16, deepspeed zero3 (no CPU offload)
