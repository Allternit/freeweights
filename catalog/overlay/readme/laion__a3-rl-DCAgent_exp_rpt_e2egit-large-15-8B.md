# a3-rl-DCAgent_exp_rpt_e2egit-large (step 15, 8B)

RL (GRPO/rloo_n via SkyRL) checkpoint trained from
`laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink`
on dataset `DCAgent/exp_rpt_e2egit-large`.

This is **global_step_15**, selected as the best checkpoint by 5-period EMA of
`reward/avg_raw_reward` (EMA 0.864, raw 0.842). The run trained the full 80 steps
but collapsed late (entropy 0.0961 -> 0.0215 from ~step 56), so an early-mid
checkpoint is correctly the best.

Launch config: `hpc/skyrl_yaml/jupiter/56GPU_base.yaml` (included as `rl_config.yaml`).

## Training Traces

Training-time Daytona/Harbor rollouts for this run are **deferred** — the
`make_and_upload_trace_dataset` script stalled in GPFS I/O (uninterruptible
disk-sleep, 33 min, zero output) and was killed past a 15 min time-box.
The companion dataset will live at
**[open-athena/a3-rl-DCAgent_exp_rpt_e2egit-large](https://huggingface.co/datasets/open-athena/a3-rl-DCAgent_exp_rpt_e2egit-large)**
once re-attempted (no partial upload was created).

## Training Metrics

`training_logs/` contains the per-chain-link `metrics_job_*.csv`, the merged
`metrics_table.csv` / `vllm_metrics_table.csv`, the markdown report
(`metrics_report.md`), and the reward/turn-count plots. Raw `.out` logs from
all 10 chain links are included too.
