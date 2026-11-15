# laion/jtd-d2-20-30B

Jupiter TaskTrove DAPO campaign, arm **D2** — full-DAPO arm — D1 + DAPO §3.4 overlong shaping (per-trajectory, l_max 12288 / l_cache 3072), filter on unshaped rewards.
Dataset: `laion/codeforces-v2` (10,000 competitive-programming tasks; ckpt_interval 1).
Base model Qwen/Qwen3-Coder-30B-A3B-Instruct; FSDP2 fully-async trainer, 16 policy GPUs
(4 nodes x 4 GH200) + 4 vLLM engines (TP2); Harbor/Daytona sandboxed terminus-2 rollouts.

- Checkpoint: step 20 of 80, selected by trailing-5 EMA of `reward/avg_raw_reward`
  over the arm's full step series (campaign ended early on platform degradation +
  data-quality grounds; final banked step 20).
- Launch config: `rl_config.yaml` in this repo; metrics + per-link logs in `training_logs/`.
- pass@8 reads 1.0 on the dynamic-sampling arms (d1/d2/d4) are post-filter by construction;
  use `reward/avg_raw_reward` series in `training_logs/` for cross-arm comparison.

## Training Traces
Training-time Daytona/Harbor rollouts: **[open-athena/jtd-d2](https://huggingface.co/datasets/open-athena/jtd-d2)**
— the `last` episode of each trial, **conserved at a 25% subsample**: every 4th trial dir of
the arm's full trace store (28495 enumerated at upload; 143 shards, 25433 rows).
Owner-instructed conservation quota for this campaign's cleanup, not the uploader default.
