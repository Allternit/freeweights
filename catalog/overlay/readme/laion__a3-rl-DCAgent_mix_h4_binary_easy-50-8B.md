# a3-rl-DCAgent_mix_h4_binary_easy-50-8B

RL (SkyRL) checkpoint trained on the **DCAgent/mix_h4_binary_easy** task mix,
starting from the a3 GLM-SFT base
**laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink**.

- **Run**: `a3-rl-DCAgent_mix_h4_binary_easy` (Jupiter chain 573271→573276)
- **Training**: 2 epochs, completed at global_step 67 (`max_steps=80` was a ceiling;
  67 = epoch-data completion, a legit deployable endpoint — not collapse).
- **Checkpoint selected**: **global_step 50** by trailing-5 EMA (α=1/3) of
  `reward/avg_raw_reward` across the full chain.
  - EMA at step 50 = **0.4991** (highest of all aligned eligible checkpoints)
  - raw `avg_raw_reward` at step 50 = **0.529**
  - **pass@8 at step 50 = 0.672**
- `hf_save_interval=5`

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/a3-rl-DCAgent_mix_h4_binary_easy](https://huggingface.co/datasets/open-athena/a3-rl-DCAgent_mix_h4_binary_easy)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.

## Training Logs

See `training_logs/` for the parsed metrics (`metrics.csv`, `report.md`,
`reward_plot.png`) and the raw chain `.out` logs (Jupiter has no W&B network access).
