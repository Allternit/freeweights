# a3-rl-laion_exp_rpt_ghactions-v3 (step 20, 8B)

RL (GRPO / rloo_n, SkyRL) fine-tune of
`laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink`
(Qwen3-8B architecture) on the agentic task set
**`laion/exp_rpt_ghactions-v3`**.

This checkpoint is **global_step_20**, selected by the trailing-5-step EMA of
`reward/avg_raw_reward` (EMA = 0.6933, raw reward at step 20 = 0.826), which is
the sustained-best region of the run.

## ⚠️ Run status: COLLAPSED / NOT-CONVERGED

This run **collapsed after step 20** and did NOT exhaust to a healthy final
state. The reward trajectory rose to a strong plateau (~0.73–0.83, pass@8 ≈
1.0) around steps 16–23, then collapsed sharply:

| step | avg_raw_reward | pass@8 | policy_entropy |
|------|----------------|--------|----------------|
| 9    | 0.693          | 0.984  | 0.0844         |
| 16   | 0.777          | 1.000  | 0.0777         |
| 18   | 0.824          | 1.000  | 0.0830         |
| 20   | 0.826 (best)   | 1.000  | 0.0712         |
| 23   | 0.717          | 0.984  | 0.0568         |
| 25   | 0.430          | 0.938  | 0.0304         |
| 26   | 0.107          | 0.375  | 0.0070         |
| 27   | 0.002 (final)  | 0.016  | 0.0001         |

Entropy decayed toward zero alongside the reward crash — the classic
entropy-collapse signature. **The FINAL training step (27) was reward ≈ 0.002 /
near-zero entropy (fully collapsed).** This `-20-8B` checkpoint is the
pre-collapse peak, NOT the final state of training.

Other pre-collapse checkpoints also exist in the experiment exports
(`global_step_15` was a transient dip to 0.0; `global_step_25` was already
collapsing at reward 0.43). Step 20 is the highest-EMA aligned checkpoint and
is the one published here.

**Treat this as a low-quality / non-converged research artifact, not a clean
production model.**

## Training config
- Algorithm: GRPO (rloo_n advantage), SkyRL fully-async trainer, FSDP2
- Base: `laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink`
- Dataset: `laion/exp_rpt_ghactions-v3`
- hf_save_interval = 5, max_steps = 80 (run collapsed/exhausted at step ~27)
- 14 nodes × 4 GH200 (Jupiter), TP=1

See `rl_config.json` and `training_logs/` (metrics CSVs, reward plot, per-trial
results from `parse_skyrl_metrics.py`) in this repo.

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/a3-rl-laion_exp_rpt_ghactions-v3](https://huggingface.co/datasets/open-athena/a3-rl-laion_exp_rpt_ghactions-v3)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.
