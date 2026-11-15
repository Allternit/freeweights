# a2-rl-e2egit_large — step 50

RL fine-tune of Qwen3-32B on the e2egit-large task distribution (end-to-end git operations).
Training via SkyRL/GRPO on Jupiter (GH200, 16 nodes). Best-reward exported checkpoint.

## Training metrics (step 50)
- reward/avg_raw_reward: 0.8828
- reward/avg_pass_at_8: 0.891 (estimated)
- Peak reward across run: 0.9238 @ step 41

## Hyperparameters
- Algorithm: RLOO-N (GRPO variant)
- LR: 9e-6, epochs: 2, max_steps: 60
- train_batch_size: 64, n_samples_per_prompt: 8
- max_prompt_length: 32768, strategy: fsdp2
- Dataset: exp_rpt_e2egit-large
