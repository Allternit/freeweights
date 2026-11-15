# explore-tis-temp10-60-8B

RL (SkyRL, agentic terminal-bench / Harbor + Daytona) checkpoint from the `explore-tis` sampling-parameter ablation.
This is the **temperature=1.0** arm (`explore-tis-temp10`).

- **Base model:** `laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink` (an 8B model)
- **Dataset:** `DCAgent/exp_rpt_pymethods2test-large`
- **Algorithm:** RLOO-n, no KL loss, `loss_reduction=seq_mean_token_sum_norm_global`, TIS on (`tis_imp_ratio_cap=2.0`)
- **Sampling:** temperature=1.0, top_p=0.95, top_k=20
- **Selected checkpoint:** `global_step_60` (best trailing-5 EMA, α=1/3, of `reward/avg_raw_reward` over saved exports with step ≤ 78; EMA ≈ 0.4635). The 78-step cutoff was applied to exclude a step-79+ greedy/eval-pass reward artifact.
- **Max training steps:** 80

## Training Traces

Rollout traces for this run: [open-athena/explore-tis-temp10](https://huggingface.co/datasets/open-athena/explore-tis-temp10)

## Training Logs

Parsed metrics, reward-vs-steps plots, and raw console logs are under `training_logs/` in this repo.
