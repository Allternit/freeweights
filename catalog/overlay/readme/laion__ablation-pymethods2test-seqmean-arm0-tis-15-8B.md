# ablation-pymethods2test-seqmean-arm0-tis (step 15)

RLOO length-bias A/B ablation, **arm0 = sequence_mean loss reduction WITH TIS**
(truncated importance sampling). Trained with SkyRL (RLOO-n, FSDP2) on
`DCAgent/exp_rpt_pymethods2test-large` from the Qwen3-8B pre-RL base
`laion/GLM-4_7-swesmith-...-fixthink`.

Checkpoint selected at **global_step 15** by trailing-5 EMA (alpha=1/3) of
`reward/avg_raw_reward` over the full training chain (cap step <= 80).

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/ablation-pymethods2test-seqmean-arm0-tis](https://huggingface.co/datasets/open-athena/ablation-pymethods2test-seqmean-arm0-tis)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.
