# INTELLECT-3

<div align="center">
<img src="banner.png" alt="Prime Intellect Logo" />
</div>

<p align="center">
    <strong>INTELLECT-3: A 100B+ MoE trained with large-scale RL</strong>
    <br><br>
    Trained with <a href="https://github.com/PrimeIntellect-ai/prime-rl">prime-rl</a> and <a href="https://github.com/PrimeIntellect-ai/verifiers">verifiers</a>
    <br>
    Environments released on <a href="https://app.primeintellect.ai/dashboard/environments">Environments Hub</a> 
    <br>
    Read the <a href="https://primeintellect.ai/blog/intellect-3">Blog</a> & <a href="https://storage.googleapis.com/intellect-3-paper/INTELLECT_3_Technical_Report.pdf">Technical Report</a>
    <br>
    <a href="https://x.com/primeintellect">X</a>  | <a href="https://discord.gg/RC5GvMbfDf">Discord</a> | <a href="https://app.primeintellect.ai/dashboard/create-cluster">Prime Intellect Platform</a>
</p>

## Introduction

**INTELLECT-3** is a 106B (A12B) parameter Mixture-of-Experts reasoning model post-trained from [GLM-4.5-Air-Base](https://huggingface.co/zai-org/GLM-4.5-Air-Base) using supervised fine-tuning (SFT) followed by large-scale reinforcement learning (RL).

![bench](bench.png)

Training was performed with [prime-rl](https://github.com/PrimeIntellect-ai/prime-rl) using environments built with the [verifiers](https://github.com/PrimeIntellect-ai/verifiers) library.
All training and evaluation environments are available on the [Environments Hub](https://app.primeintellect.ai/dashboard/environments).

The model, training frameworks, and environments are open-sourced under fully-permissive licenses (MIT and Apache 2.0).

For more details, see the [technical report](https://storage.googleapis.com/intellect-3-paper/INTELLECT_3_Technical_Report.pdf).

## Evaluation

INTELLECT-3 achieves best-in-class performance on math, coding, and reasoning benchmarks:

| Benchmark | MATH-500 | AIME24 | AIME25 | LCB | GPQA | HLE | MMLU-Pro |
|-----------|----------|---------|---------|--------|------|-----|----------|
| INTELLECT-3 | **98.1** | **90.8** | **88.0** | 69.3 | 74.4 | 14.6 | 81.9 |
| GLM-4.5-Air | 97.8 | 84.6 | 82.0 | 61.5 | 73.3 | 13.3 | 73.9 |
| GLM-4.5 | 97.0 | 85.8 | 83.3 | 64.5 | 77.0 | 14.8 | 83.5 |
| DeepSeek R1 0528 | 87.3 | 83.2 | 73.4 | 62.5 | 77.5 | 15.9 | 75.3 |
| DeepSeek v3.2 | 96.8 | 88.1 | 84.7 | **71.6** | **81.4** | **17.9** | **84.6** |
| GPT-O5S 120B | 96.0 | 75.8 | 77.7 | 69.9 | 70.0 | 10.6 | 67.1 |

## Model Variants

| Model | HuggingFace |
|-------|-------------|
| INTELLECT-3 | [PrimeIntellect/INTELLECT-3](https://huggingface.co/PrimeIntellect/INTELLECT-3) |
| INTELLECT-3-FP8 | [PrimeIntellect/INTELLECT-3-FP8](https://huggingface.co/PrimeIntellect/INTELLECT-3-FP8) |

## Serving with vLLM

The BF16 version can be served on 2x H200s:
```bash
vllm serve PrimeIntellect/INTELLECT-3 \
    --tensor-parallel-size 2 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder \
    --reasoning-parser deepseek_r1
```

The FP8 version can be served on a single H200:

```bash
vllm serve PrimeIntellect/INTELLECT-3-FP8 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder \
    --reasoning-parser deepseek_r1
```

## Citation

```bibtex
@misc{intellect3,
  title={INTELLECT-3: Technical Report},
  author={Prime Intellect Team},
  year={2025},
  url={https://huggingface.co/PrimeIntellect/INTELLECT-3}
}
```
