# seqnorm-tis-shaped (step 40)

RL checkpoint from the **shaped-reward ablation** (seqnorm + TIS objective) on the
`pymethods2test-large` agentic coding dataset. This is the shaped-reward successor
to the a3 RLOO-n series.

- **Base model (RL-from):** [laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink](https://huggingface.co/laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink) (Qwen3-8B SFT)
- **Training dataset:** [DCAgent/exp_rpt_pymethods2test-large](https://huggingface.co/datasets/DCAgent/exp_rpt_pymethods2test-large)
- **Objective:** sequence-normalized RLOO-n + Truncated Importance Sampling (TIS), shaped reward (% tests passing)
- **Checkpoint:** global_step 40 of 80 (selected by trailing 5-step EMA of `reward/avg_raw_reward`; EMA=0.4749)
- **Trainer:** SkyRL (fully-async), Jupiter (56 GPU)

See `rl_config.yaml` for the full launch configuration and `training_logs/` for
parsed metrics, reward plots, and the raw SLURM logs.

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/seqnorm-tis-shaped](https://huggingface.co/datasets/open-athena/seqnorm-tis-shaped)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.
