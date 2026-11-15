# tt-x2_clip-hi0p01 — step 15 (PPO upper-clip = 0.01)

GRPO checkpoint from the TaskTrove X2 (upper PPO clip) hyperparameter sweep. Base model
**Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile** with SkyRL +
Terminus-2. This is the clip-0.01 arm; the campaign verifier is `pass_ratio` shaping.

## Checkpoint selection

`global_step_15` was selected by the **trailing-5 reward EMA** (alpha = 1/3) over the full restart
chain — the highest-EMA aligned checkpoint (EMA 0.1642; step reward 0.191; pass@8 0.359; entropy
0.127). hf_save_interval was 5; the first save (step 5) is excluded.

## ⚠ This run collapsed — not a valid X2 result

The clip-0.01 arm was **killed by the entropy stop rule at step 62** (banked 60, horizon 80). Reward
flatlined around 0.13–0.22 (pass@8 ~0.19–0.44) with no clear upward trend for steps 1–54, policy
entropy climbed monotonically (0.11 at step 1 -> 0.75 at step 50), then entropy blew up to 3.0 and
reward/pass@8 crashed to ~0 at steps 55–62. Step 15 is the EMA-best checkpoint, taken before the
entropy-driven decline; later checkpoints (50/55/60) are post-decline or post-collapse. This arm did
not reach its horizon and is not a valid X2 sweep result on the same terms as the killed X1 lr-4e-6
arm.

See `training_logs/` for `metrics.csv`, `report.md`, `reward_plot.png`, the resolved `rl_config.json`,
and the gzipped `.out` chain.

## Training Traces

Training-time Daytona/Harbor rollouts: **[open-athena/tt-x2_clip-hi0p01](https://huggingface.co/datasets/open-athena/tt-x2_clip-hi0p01)**
(the `last` episode of each trial — the rollouts the policy trained on after rollback/truncation).
