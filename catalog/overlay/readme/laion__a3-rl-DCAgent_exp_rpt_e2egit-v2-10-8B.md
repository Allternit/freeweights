# a3-rl-DCAgent_exp_rpt_e2egit-v2 (step 10, 8B)

RL checkpoint from SkyRL (RLOO_n, FSDP2) trained on the `exp_rpt_e2egit-v2`
terminal-bench task set. This is the EMA-best checkpoint (`global_step_10`)
selected from a legitimately-completed run (2 epochs x 7 steps/epoch = 14
training steps; lead SLURM job 515469, exit 0).

- **Base model:** `laion/GLM-4_7-swesmith-sandboxes-with_tests-oracle_verified_120s-maxeps-131k-fixthink` (Qwen3-8B architecture)
- **Dataset:** `DCAgent/exp_rpt_e2egit-v2`
- **Algorithm:** RLOO_n, no KL loss, eps_clip 0.2/0.05, lr 8e-6, train_batch_size 64
- **Selection:** EMA (alpha=1/3, 5-period) of `reward/avg_raw_reward`, step 10 EMA=0.6787

## Training Traces

Training-time Daytona/Harbor rollouts for this run are uploaded as a
companion dataset:

- **Traces:** [`open-athena/a3-rl-DCAgent_exp_rpt_e2egit-v2`](https://huggingface.co/datasets/open-athena/a3-rl-DCAgent_exp_rpt_e2egit-v2)
