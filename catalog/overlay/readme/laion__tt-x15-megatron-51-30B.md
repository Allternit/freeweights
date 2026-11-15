# tt-x15-megatron — step 51 (X15 Megatron entropy rescue)

GRPO checkpoint from the TaskTrove X15 experiment, trained on **Iris / CoreWeave (cw-rno2a, 4x8 H100,
Megatron runtime)**. Base model **Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on
**DCAgent/exp_rpt_multifile** with SkyRL + Terminus-2. X15 tested whether lr 8e-6 + `eps_clip_low` 0.3 +
temp 1.2 prevents the X14 Megatron late collapse; the answer is **negative** — the arm collapsed the
same way.

## Checkpoint selection

`global_step_51` — the owner-confirmed campaign selection (trailing-5 0.2199; step reward 0.2441;
pass@8 0.4219; entropy 0.0194), the best pre-collapse saved checkpoint (near-tie with step 39 within
smoothing flavor). Exported on-Iris from the sharded Megatron checkpoint bank (427.7 GB distcp,
30 objects) via the checkpoint-export job at the saved policy geometry (2x8 H100).

## Run status — KILLED at 101/400 (COLLAPSED)

Reward peaked ~0.2273 trailing-5, collapsed to ~0 at steps 84/86 and held ~8% of peak for 13+ steps
while tokens shrank 9.2k -> 7.6k. Mechanism (first identified for this family): entropy collapse
shortened per-turn output until agents exhausted `max_turns: 30` unfinished (cap-hitters 23% -> 100%,
tokens/turn 572 -> 281). Not infrastructure. Not an admissible horizon result; the arm is preserved
as the collapse-family negative control. Confound: three hyperparameters moved at once.

See `training_logs/` for metrics.csv (stitched per-step curve + trailing-5 EMA), report.md,
reward_plot.png, and the launch rl_config.yaml. W&B: dogml/OpenThoughts-Agent `v5dzu6fw`.

## Training Traces

**[open-athena/tt-x15-megatron](https://huggingface.co/datasets/open-athena/tt-x15-megatron)** —
**1/8 systematic subsample** (every 8th trial of 53,411 = 6,677 selected, uniform coverage of steps
1-101). The full set (~256 GB) exceeded the sync host's free disk (47 Gi); 1/4 (~64 GB) also did not
fit. Documented, owner-precedented deviation (same rule as tt-x10-fsdp2-fa2: smallest stride that
fits).
