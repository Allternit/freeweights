# a3-rl-DCAgent_exp_rpt_unitsyn-python-large (step 10, 8B)

RL (GRPO / rloo_n, SkyRL) fine-tune of
`laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink`
(Qwen3-8B architecture) on the agentic task set
**`DCAgent/exp_rpt_unitsyn-python-large`**.

This checkpoint is **global_step_10**, the highest-EMA *saved/aligned*
checkpoint per the standard trailing-5-step EMA selection rule. Note that the
EMA at step 10 is only 0.0098 and the raw reward there is **0.0000**.

## ⚠️ Run status: COLLAPSED / FAILED — reward never left the floor

This run **never learned**. `reward/avg_raw_reward` started at ~0.08 at step 1
and decayed to a flat 0.0 within the first ~10 steps, with `policy_entropy`
collapsing to 0.0 in lockstep. It stayed at reward ≈ 0 for the remainder of
training (a brief blip to 0.035 at step 16, then back to 0).

| step | avg_raw_reward | pass@8 | policy_entropy |
|------|----------------|--------|----------------|
| 1    | 0.080          | 0.266  | 0.0219         |
| 4    | 0.041          | 0.156  | 0.0097         |
| 8    | 0.023          | 0.109  | 0.0040         |
| 10   | 0.000 (best EMA) | 0.000 | 0.0000        |
| 15   | 0.000          | 0.000  | 0.0000         |
| 16   | 0.035          | 0.156  | 0.0067         |
| 17   | 0.000 (final)  | 0.000  | 0.0000         |

**No checkpoint in this run is a usable, reward-positive model.** Step 10 is
published only to satisfy the standard cleanup-checklist EMA selection (highest
EMA among saved steps ≥ 10); its actual reward is zero. The single
highest-reward step (step 1, reward 0.08) was not a saved/aligned checkpoint
and is below any useful threshold anyway.

**Treat this as a failed / collapsed RL run preserved for the record — NOT a
model anyone should deploy or evaluate as a winner.**

## Training config
- Algorithm: GRPO (rloo_n advantage), SkyRL fully-async trainer, FSDP2
- Base: `laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink`
- Dataset: `DCAgent/exp_rpt_unitsyn-python-large`
- hf_save_interval = 5, max_steps = 80 (run collapsed/exhausted at step ~17)
- 14 nodes × 4 GH200 (Jupiter), TP=1

See `rl_config.json` and `training_logs/` (metrics CSVs, reward plot, per-trial
results from `parse_skyrl_metrics.py`) in this repo.

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/a3-rl-DCAgent_exp_rpt_unitsyn-python-large](https://huggingface.co/datasets/open-athena/a3-rl-DCAgent_exp_rpt_unitsyn-python-large)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.
