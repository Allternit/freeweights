# Qwen3-32B-SweSmith-20step

RL-trained Qwen3-32B on SWEsmith.

## Training Details

- **Base model**: [Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
- **Training method**: rloo_n
- **Training data**: 2,500 SWEsmith tasks
- **Steps**: 20 global steps
- **Infrastructure**: 16x4 GH200 GPU nodes (GCP), FSDP2 with TP=2 for inference engines (24 inference engines + 4 policy/ref nodes)
- **Sandbox environment**: Beta9/Beam containers for code execution

## Training Curve

| Metric | Step 1 | Step 10 | Step 20 |
|--------|--------|---------|---------|
| Avg Raw Reward | 0.031 | 0.041 | 0.072 |
| Pass@8 | 0.141 | 0.156 | 0.234 |