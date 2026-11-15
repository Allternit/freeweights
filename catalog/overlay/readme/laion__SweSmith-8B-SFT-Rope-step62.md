# SweSmith-8B-SFT-Rope-step62

RL-trained Qwen3-8B on SWEsmith tasks (65k context with YaRN rope scaling factor=4.0, 62 steps). Best evaluated at 65k context.

## Training Details

- **Base model**: [laion/r2egym-nl2bash-stack-bugsseq-fixthink-again](https://huggingface.co/laion/r2egym-nl2bash-stack-bugsseq-fixthink-again) (Qwen3-8B SFT)
- **Training method**: RLOO-N 
- **Training data**: 2,500 SWEsmith tasks (oracle-verified, 120s timeout)
- **Framework**: BenSkyRL + Harbor 
- **Sandbox**: Apptainer containers with proxychains for internet access


