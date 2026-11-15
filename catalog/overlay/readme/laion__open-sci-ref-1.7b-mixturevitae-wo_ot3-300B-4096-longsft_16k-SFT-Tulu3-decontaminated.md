# Tulu3 SFT on MixtureVitae wo_ot3 300B (16k), for OT3 Phase-2 post-training

## Recipe

Standard Tulu3 recipe (SFT then DPO), same hyperparameters used throughout this study
(matches `configs/trl/sft-mxv.yaml` in OpenEuroLLM/post-training, and
`recipes/dpo/generate_jupiter.py` in alignment-handbook for DPO, which has no
post-training-repo equivalent).

- **SFT**: lr 5e-6, linear schedule, 2 epochs, warmup 0.03, effective batch 128
  (16 x 4 GPU x 2 nodes), bf16, seed 42, max_length 4096.
  Dataset: `ali-elganzory/tulu-3-sft-mixture-decontaminated`.
- **DPO**: lr 5e-7, linear schedule, 1 epoch, warmup 0.1, beta 5, effective batch 128
  (32 x 4 GPU x 1 node), bf16, seed 42, max_length 2048. Starts from the SFT checkpoint.
  Dataset: `ali-elganzory/llama-3.1-tulu-3-8b-preference-mixture-decontaminated`.

Deviation from the reference config: `attn_implementation: sdpa` instead of
`flash_attention_2` (no aarch64 flash-attn wheel on JUPITER).

## Base model

`laion/open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k` -- MixtureVitae v1
decontaminated with only OpenThoughts3 removed (93 of 96 shards), 300B tokens, extended
to 16k context. Produced for the NeurIPS 2026 rebuttal of *Strong Post-Training from
Permissive, Reasoning-Dominant, Web-Scale Pretraining*, to test whether OpenThoughts3 is
critical for reasoning-boosting post-training at the paper's main 300B pretraining scale.

## Training signal

Reported per-step (not the summary `train_loss`, which is distorted by resuming training
across separate SLURM job submissions and only reflects the final micro-segment).

- 14,634 / 14,634 steps (2.0 epochs). Converged loss ~0.92-1.0, mean token accuracy ~0.76.

