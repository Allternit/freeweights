# tt-x2_clip-hi0p2 -- step 60 (PPO upper-clip = 0.2)

GRPO checkpoint from the TaskTrove X2 (upper PPO clip) hyperparameter sweep. Base model
**Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile** with SkyRL +
Terminus-2. This is the clip-0.2 arm; the campaign verifier is `pass_ratio` shaping.

## Checkpoint selection

`global_step_60` was selected by the **trailing-5 reward EMA** (alpha = 1/3) over the full restart
chain -- the highest-EMA aligned checkpoint (EMA 0.226; step reward 0.229; pass@8 0.375; entropy
0.094) among saved exports (hf_save_interval 5; step 5 excluded as first save). Cross-validated by
both the inline EMA and `parse_skyrl_metrics.py --run_dir --save_every 5`.

## Run status -- terminated 2 steps short of horizon (healthy)

The clip-0.2 arm was **terminated by the owner at step 78/80** (it was still advancing; the chain was
scancelled). This is a **healthy, still-improving run**, not a collapse: reward trends up (~0.15 early
-> ~0.20-0.27 by steps 46-78), pass@8 rises (~0.25 -> ~0.30-0.48), and policy entropy is stable to
slightly declining (0.11 -> 0.083, 0.75x). A transient single-batch dip at steps 33-34 (reward -> 0)
recovered immediately at step 35 and is not a collapse. Step 60 is the best saved checkpoint; the
unsaved EMA peak was around steps 66-67 (the run kept improving past step 60).

See `training_logs/` for `metrics.csv`, `report.md`, `reward_plot.png`, the resolved `rl_config.json`,
and the gzipped `.out` chain.

## Training Traces

Training-time Daytona/Harbor rollouts: **[open-athena/tt-x2_clip-hi0p2](https://huggingface.co/datasets/open-athena/tt-x2_clip-hi0p2)**
(the `last` episode of each trial -- the rollouts the policy trained on after rollback/truncation).
