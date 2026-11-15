# Qwen3-32B-NL2Bash-31step

RL-trained Qwen3-32B on NL2Bash terminal tasks.

## Training Details

- **Base model**: [Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
- **Training method**: RLOO (async)
- **Training data**: 1,570 NL2Bash tasks ([DCAgent2/nl2bash-tasks-cleaned-oracle](https://huggingface.co/datasets/DCAgent2/nl2bash-tasks-cleaned-oracle))
- **Steps**: 31 global steps (3 epochs)
- **Infrastructure**: 17x4 GH200 GPU nodes (JSC), FSDP2 with TP=2 for inference engines (26 inference engines + 4 policy/ref nodes)
- **Sandbox environment**: Beta9/Beam containers for code execution
- **Batch size**: 64, 8 samples per prompt
- **Learning rate**: 1e-5

## Training Curve

| Metric | Step 1 | Step 10 | Step 20 | Step 31 |
|--------|--------|---------|---------|---------|
| Avg Raw Reward | 0.214 | 0.314 | 0.416 | 0.264 |
| Pass@8 | 0.563 | 0.563 | 0.594 | 0.422 |

## License

Apache 2.0
