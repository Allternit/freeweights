# tt-x10-fsdp2-fa2 — step 117 (X10b training backend: FSDP2 vs Megatron)

GRPO checkpoint from the TaskTrove X10b backend experiment, trained on **Iris / CoreWeave (cw-rno2a,
4x8 H100)**. Base model **Qwen/Qwen3-Coder-30B-A3B-Instruct**, trained on **DCAgent/exp_rpt_multifile**
with SkyRL + Terminus-2. Single variable vs the X8 longclip base: `trainer.strategy=fsdp2`
(+ flash-attention-2, async). Campaign verifier is `pass_ratio` shaping.

## Checkpoint selection

`global_step_117` was selected by the **trailing-5 reward EMA** (alpha = 1/3) over the stitched
6-generation curve (steps 1-131, no gaps) — the highest-EMA checkpoint (EMA 0.2535; step reward 0.2793;
pass@8 0.3906; entropy 0.0215), inside the reward plateau. Export performed on-Iris from the sharded
FSDP checkpoint bank via the checkpoint-export job (`hf_upload_mode=latest`).

## Run status — question ANSWERED; stopped at 131/400 (plateau)

X10b's question — does FSDP2 survive the X8 schedule that collapsed every Megatron arm — is answered
**yes**: 131 stable steps with entropy falling 0.284 -> 0.0129 (~22x, exploration exhausted) and response
length held (11.9k -> 13.5k tokens; no length collapse). Reward plateaued from ~step 40
(20-step windows 40-131 flat within noise; peak raw 0.332 at step 116); the remaining horizon buys
nothing. Stopped by owner decision 2026-08-15 at logged step 131, banked 129.

See `training_logs/` for metrics.csv (stitched per-step curve + trailing-5 EMA), report.md,
reward_plot.png, and the launch rl_config.yaml. W&B (dogml/OpenThoughts-Agent): base `jjjhduya`,
final gen r7 `0s0kinwg`.

## Training Traces

**[open-athena/tt-x10-fsdp2-fa2](https://huggingface.co/datasets/open-athena/tt-x10-fsdp2-fa2)** —
**1/8 systematic subsample** (every 8th trial of 89,425 across 5 run generations, uniform coverage of
steps 1-131). Full-set transfer from CoreWeave object storage was ~430 GB; the subsample is a
documented deviation, approved by the owner, for an arm whose question was answered before horizon.
