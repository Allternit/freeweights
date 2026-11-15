# laion/jtd-d5-69-30B

GSPO checkpoint (step 69; the run closed at step 73 of 80 when its restart chain was sealed at
close-out — the final links ran through the 2026-08-28 GPFS/Daytona platform degradation) from the
Jupiter TaskTrove DAPO campaign, arm **D5** — the D0 plain-GRPO control with the objective swapped
to GSPO: `policy_loss_type: gspo`, eps 3e-4/4e-4 (paper range), `loss_reduction: sequence_mean`,
`use_tis: false`, no dynamic sampling, no KL.

- **Base model**: Qwen/Qwen3-Coder-30B-A3B-Instruct
- **Training data**: `laion/codeforces-v2` (10,000 competitive-programming tasks, sandboxed agent
  rollouts via Harbor/Daytona, terminus-2 harness, FSDP2 fully-async trainer on 16x GH200)
- **Checkpoint selection**: trailing-5 EMA of `reward/avg_raw_reward` (0.2784 at step 69 vs 0.2481
  at step 72; the same step wins on EMA of `reward/avg_pass_at_8`, 0.4845 vs 0.4723)
- **Launch config**: `rl_config.yaml` in this repo
- **Metrics + logs**: `training_logs/` in this repo (per-link metrics CSVs, trial results, report,
  all 17 job logs + the checkpoint-export job log)

## Training Traces
Training-time Daytona/Harbor rollouts: **[open-athena/jtd-d5](https://huggingface.co/datasets/open-athena/jtd-d5)**
(the `last` episode of each trial — the rollouts the policy trained on after rollback/truncation).
This trace dataset conserves a **deterministic 25% subsample** of the full trial set (17,722 of
70,886 trials; every 4th trial of the sorted list) = 15,880 rows / 93 shards, per a
storage-conservation decision at cleanup time.
