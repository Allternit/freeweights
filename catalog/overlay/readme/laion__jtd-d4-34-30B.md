# laion/jtd-d4-34-30B

Jupiter TaskTrove DAPO campaign, arm **D4** — DAPO + partial-credit arm — D1 + Harbor threshold reward shaper (1.0/0.3), filter on shaped rewards.
Dataset: `laion/codeforces-v2` (10,000 competitive-programming tasks; late steps trained on the TaskTrove codeforces-v3 snapshot after laion/codeforces-v2 was deleted).
Base model Qwen/Qwen3-Coder-30B-A3B-Instruct; FSDP2 fully-async trainer, 16 policy GPUs
(4 nodes x 4 GH200) + 4 vLLM engines (TP2); Harbor/Daytona sandboxed terminus-2 rollouts.

- Checkpoint: step 34 of 80, selected by trailing-5 EMA of `reward/avg_raw_reward`
  over the arm's full step series (campaign ended early on platform degradation +
  data-quality grounds; final banked step 35).
- Launch config: `rl_config.yaml` in this repo; metrics + per-link logs in `training_logs/`.
- pass@8 reads 1.0 on the dynamic-sampling arms (d1/d2/d4) are post-filter by construction;
  use `reward/avg_raw_reward` series in `training_logs/` for cross-arm comparison.

## Training Traces
Training-time Daytona/Harbor rollouts: **[open-athena/jtd-d4](https://huggingface.co/datasets/open-athena/jtd-d4)**
— the `last` episode of each trial, **conserved at a 25% subsample**: every 4th trial dir of
the arm's full trace store (33231 enumerated at upload; 167 shards, 21824 rows).
Owner-instructed conservation quota for this campaign's cleanup, not the uploader default.
