# laion/jtd-d0-69-30B

GRPO control checkpoint (step 69 of 80; the run ended early at step 72 after its restart chain
exhausted) from the Jupiter TaskTrove DAPO campaign, arm **D0** — plain GRPO, symmetric clipping
(eps 0.2/0.2), token-level loss mean, no dynamic sampling, no reward shaping.

- **Base model**: Qwen/Qwen3-Coder-30B-A3B-Instruct
- **Training data**: `laion/codeforces-v2` (10,000 competitive-programming tasks, sandboxed agent
  rollouts via Harbor/Daytona, terminus-2 harness, FSDP2 fully-async GRPO on 16× GH200)
- **Checkpoint selection**: trailing-5 EMA of `reward/avg_raw_reward` (0.2755 at step 69 vs 0.2354
  at step 72)
- **Launch config**: `rl_config.yaml` in this repo
- **Metrics + logs**: `training_logs/` in this repo (per-link metrics CSVs, trial results, report)

## Training Traces
Training-time Daytona/Harbor rollouts: **[open-athena/jtd-d0](https://huggingface.co/datasets/open-athena/jtd-d0)**
(the `last` episode of each trial — the rollouts the policy trained on after rollback/truncation).
