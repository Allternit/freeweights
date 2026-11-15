# a3-rl-laion_nemotron-gym-agent-calendar (step 80, 8B)

RL-trained (SkyRL) agent checkpoint, selected by 5-period EMA (alpha=1/3) of
`reward/avg_raw_reward` across all 80 steps of the training chain.

- **Selected checkpoint:** `global_step_80` (EMA = 0.9785, raw reward at step = 0.9727)
- **Final-step metrics:** `reward/avg_pass_at_8 = 1.0`, reached `max_steps = 80/80` (clean exit-0 completion)
- **Base model:** [laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink](https://huggingface.co/laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink) (Qwen3-8B architecture)
- **Training dataset:** [laion/nemotron-gym-agent-calendar](https://huggingface.co/datasets/laion/nemotron-gym-agent-calendar)
- **Training type:** RL (SkyRL)

The launch RL config is included as `rl_config.yaml`. Parsed training
metrics, plots, and raw logs are under `training_logs/`.

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/a3-rl-laion_nemotron-gym-agent-calendar](https://huggingface.co/datasets/open-athena/a3-rl-laion_nemotron-gym-agent-calendar)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.
