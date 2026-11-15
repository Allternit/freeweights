# tt-x1_lr-lr8e6 -- step 60 (X1 learning rate 8e-6)

GRPO checkpoint from the TaskTrove X1 (learning rate) sweep. Base model **Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile** with SkyRL + Terminus-2; campaign verifier is `pass_ratio` shaping.

## Checkpoint selection

`global_step_60` was selected by the **trailing-5 reward EMA** (alpha = 1/3) over the full restart chain -- the highest-EMA aligned checkpoint (EMA 0.1894; step reward 0.1973; pass@8 0.3125; entropy 0.2878), per `parse_skyrl_metrics.py --run_dir --save_every 5`.

## Run status -- terminated mid-horizon (elevated entropy)

Terminated by the owner at step 71/80. Policy entropy climbed ~3.2x (0.11 -> 0.36) -- elevated and rising (entropy stop rule fires at 10x). Step 60 is the best saved checkpoint. Not a horizon result.

See `training_logs/` for metrics.csv, report.md, reward_plot.png, rl_config.json, and the gzipped .out chain.

## Training Traces

**[open-athena/tt-x1_lr-lr8e6](https://huggingface.co/datasets/open-athena/tt-x1_lr-lr8e6)** -- 1/4 systematic subsample (every 4th trial, uniform coverage of steps 1-71; 22,169 rows). The full ~96k-trial set was GPFS-read-bound (~9h on the login node); subsample is a documented deviation for this terminated (71/80) arm.
