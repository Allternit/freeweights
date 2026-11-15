# SweSmith-8B-SFT-NoRope-step58

RL-trained Qwen3-8B on SWEsmith tasks (32k context, no rope scaling, 58 steps). Beats the SFT base model on dev_set_71 (pass@1 0.227 vs 0.213) and SWE-bench 100 (0.220 vs 0.210).

## Training Details

- **Base model**: [laion/r2egym-nl2bash-stack-bugsseq-fixthink-again](https://huggingface.co/laion/r2egym-nl2bash-stack-bugsseq-fixthink-again) (Qwen3-8B SFT)
- **Training method**: RLOO-N (Reinforcement Learning with Leave-One-Out baselines)
- **Training data**: 2,500 SWEsmith tasks (oracle-verified, 120s timeout)
- **Framework**: BenSkyRL + Harbor 
