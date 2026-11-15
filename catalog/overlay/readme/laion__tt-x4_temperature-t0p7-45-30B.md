# tt-x4_temperature-t0p7 -- step 45 (X4 rollout temperature 0.7)

GRPO checkpoint from the TaskTrove hyperparameter sweep. Base model
**Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile** with SkyRL +
Terminus-2; campaign verifier is `pass_ratio` shaping.

## Checkpoint selection

`global_step_45` was selected by the **trailing-5 reward EMA** (alpha = 1/3) over the full
restart chain -- the highest-EMA aligned checkpoint (EMA 0.1962; step reward 0.2656; pass@8 0.4531;
entropy 0.2981) among saved exports (hf_save_interval 5; first save excluded), per
`parse_skyrl_metrics.py --run_dir --save_every 5`.

## Run status -- terminated mid-horizon (elevated entropy)

The arm was **terminated by the owner at step 66/80** (mid-horizon). Policy entropy had
climbed to 4.40xx its step-1 value -- elevated and rising (the campaign entropy stop rule fires at
10x), i.e. the policy was degenerating before the kill. Step 45 is the best saved checkpoint
before that decline. This is not a horizon result.

See `training_logs/` for `metrics.csv`, `report.md`, `reward_plot.png`, the resolved
`rl_config.json`, and the gzipped `.out` chain.

## Training Traces

Training-time Daytona/Harbor rollouts: **[open-athena/tt-x4_temperature-t0p7](https://huggingface.co/datasets/open-athena/tt-x4_temperature-t0p7)**
(the `last` episode of each trial -- the rollouts the policy trained on after rollback/truncation).
