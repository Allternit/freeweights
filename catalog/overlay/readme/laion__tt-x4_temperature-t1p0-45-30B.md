# tt-x4_temperature-t1p0 -- step 45 (X4 rollout temperature 1.0)

GRPO checkpoint from the TaskTrove X4 (rollout temperature) sweep. Base model **Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile** with SkyRL + Terminus-2; campaign verifier is `pass_ratio` shaping.

## Checkpoint selection

`global_step_45` was selected by the **trailing-5 reward EMA** (alpha = 1/3) over the full restart chain -- the highest-EMA aligned checkpoint (EMA 0.2328; step reward 0.2305; pass@8 0.375; entropy 0.078), per `parse_skyrl_metrics.py --run_dir --save_every 5`.

## Run status -- COMPLETED at its two-epoch horizon

The temp-1.0 arm finished both dataset epochs (step 66, matching sibling arm temp 0.7) with a **healthy profile: policy entropy declined** ~0.25x (0.21 -> 0.05) -- no entropy runaway. The post-horizon extension (to max_steps 80) was stopped by the owner at step 68. Exports 55-65 were lost to infra chain-stalls before saving; step 45 is the best *saved* export (the FSDP checkpoint banked at 66 but was not HF-exported).

See `training_logs/` for metrics.csv, report.md, reward_plot.png, rl_config.json, and the gzipped .out chain.

## Training Traces

**[open-athena/tt-x4_temperature-t1p0](https://huggingface.co/datasets/open-athena/tt-x4_temperature-t1p0)** -- 1/4 systematic subsample (every 4th trial, uniform coverage of the full 66-step horizon; 15,258 rows from 68,768 trials). The full set was GPFS-read-bound on the Jupiter login node (~6h); subsample is a documented, owner-approved deviation.
