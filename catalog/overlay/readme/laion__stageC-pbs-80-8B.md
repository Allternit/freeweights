# stageC-pbs-80-8B

Agentic RL (SkyRL, FSDP2) checkpoint from the **stageC** cell of the a3 / pymethods2test
agentic-RL family. This is the `global_step_80` (max_steps) export — the legitimate end of
training (`trainer.max_steps=80`).

- **Base model:** `laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink` (a Qwen3-8B SFT)
- **Dataset:** `DCAgent/exp_rpt_pymethods2test-large`
- **Algorithm:** RLOO-N (`advantage_estimator=rloo_n_pbs`), per-batch-shaped reward channel
  (`enable_token_reward_channel=true`), `loss_reduction=seq_mean_token_sum_norm_global` (seqnorm),
  TIS on (`use_tis=true`, `tis_imp_ratio_cap=2.0`), `eps_clip=0.2/0.2`, no KL loss.
- **Training:** 14 nodes, `train_batch_size=64`, 2 epochs, `max_steps=80`, `ckpt_interval=2`,
  `hf_save_interval=5`. WANDB offline (Jupiter).
- **Sibling cells:** `laion/stageB-channel-80-8B`, `open-athena/stageD-thinkbudget-80-8B`.

## Final training metrics (global_step_80)

| metric | value |
|---|---|
| reward (avg_raw) | 0.5645 |
| pass@8 | 0.672 |
| entropy | 0.290 |
| raw_grad_norm | ~3.6e-5 (seqnorm global-denom artifact) |
| tis_imp_ratio_mean | 0.987 |
| tis_imp_ratio_capped_fraction | ~1e-5 |

## Training Traces
Training-time Daytona/Harbor rollouts: **[open-athena/stageC-pbs](https://huggingface.co/datasets/open-athena/stageC-pbs)**
(the `last` episode of each trial — the rollouts the policy trained on after rollback/truncation).

## Contents
4-shard safetensors weights + config + tokenizer/chat_template + `generation_config` +
`rl_config.json` (the launch config) + `training_logs/` (per-step metrics CSVs + vLLM metrics +
raw `.out` chain logs — the W&B-equivalent, since Jupiter runs WANDB offline).
