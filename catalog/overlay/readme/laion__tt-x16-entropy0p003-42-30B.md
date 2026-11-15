# tt-x16-entropy0p003 — step 42 (X16 entropy bonus 0.003)

GRPO checkpoint from the TaskTrove X16 exploration sweep (entropy-bonus lever on the X14 Megatron
recipe), trained on **Iris / CoreWeave (cw-rno2a, 4x8 H100, Megatron runtime `6a25520f`)**. Base model
**Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile** with SkyRL +
Terminus-2. This arm added `entropy_loss_coef 0.003` to test whether an entropy bonus holds
exploration on the collapsing Megatron schedule (relaunch r2 on the #404 entropy-loss fix).

## Checkpoint selection

`global_step_42` — highest trailing-5 reward EMA (alpha=1/3) over the stitched two-generation W&B
curve (steps 1-92, no gaps): EMA **0.2268**; step reward 0.2520; pass@8 0.375; entropy 0.0237. This
matches the owner's "best single reads 42-43" note. All 31 banked checkpoints (steps 3-90) were
retained, so the true EMA-best was available (unlike the Jupiter KL arms). Exported on-Iris via the
checkpoint-export job at the saved policy geometry (2x8 H100, Megatron profile).

## Run status — killed at 92/400 after COLLAPSE (POLICY stop condition met)

The arm cleared its early gate and improved to ~0.25 reward, then collapsed in epoch 2 from ~step 77:
reward 0.02-0.05 for steps 77-88, entropy at 0.06x step 1, grad norm decaying — the POLICY stop
condition. Verdict: an entropy bonus of 0.003 does NOT hold exploration on this schedule. Not an
admissible horizon result; preserved as the entropy-lever negative control. Stopped by owner decision
2026-08-18 (job killed at logged step 92; banked 90).

See `training_logs/` for metrics.csv (stitched per-step curve + trailing-5 EMA), report.md,
reward_plot.png, and the launch rl_config.yaml. W&B: dogml/OpenThoughts-Agent runs `zgyhu8oc` +
`vne6jh9g` (r2 generations).

## Training Traces

**[open-athena/tt-x16-entropy0p003](https://huggingface.co/datasets/open-athena/tt-x16-entropy0p003)** —
**1/16 systematic subsample** (every 16th trial of 51,701, uniform coverage of steps 1-92). The full
set (~248 GB) and 1/8 (~31 GB) exceeded the sync host's free disk (28 Gi); smallest-stride-that-fits
per the owner-precedented deviation rule (x10/x15 used 1/8 under more headroom).
