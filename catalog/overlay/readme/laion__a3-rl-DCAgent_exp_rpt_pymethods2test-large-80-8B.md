# a3-rl-DCAgent_exp_rpt_pymethods2test-large — global_step 80 (EMA winner)

RL (SkyRL) fine-tune of an 8B Qwen3 agent, trained from the a3 GLM-SFT base
`laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink`
on the task set **DCAgent/exp_rpt_pymethods2test-large**.

This is the **winner** checkpoint at `trainer/global_step 80` (`max_steps=80`),
selected by 5-period EMA (α=1/3) of `reward/avg_raw_reward` over the training
chain, **constrained to global_step ≤ 80**.

- EMA(step 80) = **0.4829**
- raw `avg_raw_reward` at step 80 = **0.5586** (mean over `n_samples_per_prompt=8`)
- `hf_save_interval=5`, `ckpt_interval=2`, `n_samples_per_prompt=8`

> Note: the run trained a few spurious extra steps (81–86) due to a
> resume-past-`max_steps` artifact (each resume past the cap trains one extra
> step). Those steps are **not** part of the legitimate run and were excluded
> from checkpoint selection; the legit run ends at global_step 80.

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as
a companion dataset:
**[open-athena/a3-rl-DCAgent_exp_rpt_pymethods2test-large](https://huggingface.co/datasets/open-athena/a3-rl-DCAgent_exp_rpt_pymethods2test-large)**

The dataset contains the `last` episode of each trial (per
`make_and_upload_trace_dataset --episodes last`) — the same rollouts
the policy was trained on after rollback / truncation.
