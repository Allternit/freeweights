# a3-rl-DCAgent_mix_h2_language_proportional (global_step 65, 8B)

RL (SkyRL/GRPO) fine-tune of the a3 GLM-SFT Qwen3-8B base
(`laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink`)
on the **DCAgent/mix_h2_language_proportional** task mixture.

The run reached `max_steps=80` (winner). This checkpoint is the
**EMA-best** selection (α=1/3, 5-period EMA over `reward/avg_raw_reward`),
constrained to `global_step ≤ 80` (the intended run; the post-80 save is a
resume-past-max-step artifact and was excluded).

- **Selected checkpoint:** `global_step_65`
- **EMA(reward):** 0.4924
- **Reward at step 65:** 0.6816
- **pass@8 at step 65:** 0.7344

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/a3-rl-DCAgent_mix_h2_language_proportional](https://huggingface.co/datasets/open-athena/a3-rl-DCAgent_mix_h2_language_proportional)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.
