# tt-x2_clip-hi0p05 -- step 10 (PPO upper-clip = 0.05)

GRPO checkpoint from the TaskTrove X2 (upper PPO clip) sweep. Base model **Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile** with SkyRL + Terminus-2; campaign verifier is `pass_ratio` shaping.

## Checkpoint selection

`global_step_10` was selected by the **trailing-5 reward EMA** (alpha = 1/3) over the full restart chain -- the highest-EMA aligned checkpoint (EMA 0.2094; step reward 0.2344; pass@8 0.4516; entropy 0.1184), per `parse_skyrl_metrics.py --run_dir --save_every 5`.

## Run status -- terminated near-horizon (elevated entropy)

Terminated by the owner at step 76/80. Reward peaked early (step 10) then declined as policy entropy climbed ~8x (0.11 -> 0.90) -- approaching the campaign entropy stop rule (10x). Step 10 is the best saved checkpoint. Not a horizon result.

See `training_logs/` for metrics.csv, report.md, reward_plot.png, rl_config.json, and the gzipped .out chain.

## Training Traces

**[open-athena/tt-x2_clip-hi0p05](https://huggingface.co/datasets/open-athena/tt-x2_clip-hi0p05)** -- 1/4 systematic subsample (every 4th trial, uniform coverage; 24,125 rows from ~103k trials across 4 run roots). The full set was GPFS-read-bound on the Jupiter login node; subsample is a documented deviation for this terminated (76/80) arm.
