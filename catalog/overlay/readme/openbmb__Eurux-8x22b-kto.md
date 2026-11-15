<div align="center">

<img src="https://huggingface.co/openbmb/Eurus-7b-sft/resolve/main/figures/Eurus-logo.png" width="200px">

**Eurus: A suite of open-source LLMs optimized for reasoning**

<p align="center">
 <a href="#introduction"> Introduction</a> •
  <a href="#evaluation">Evaluation</a>
</p>


</div>

# Links

- 📜 [Paper](https://arxiv.org/abs/2404.02078)
- 🤗 [Eurus Collection](https://huggingface.co/collections/openbmb/eurus-660bc40bec5376b3adc9d1c5)
- 🤗 UltraInteract
  - [SFT](https://huggingface.co/datasets/openbmb/UltraInteract_sft)
  - [Preference Learning](https://huggingface.co/datasets/openbmb/UltraInteract_pair) 
- [GitHub Repo](https://github.com/OpenBMB/Eurus)

# Introduction

Eurux-8x22B-KTO is SFT and [KTO](https://arxiv.org/abs/2402.01306) fine-tuned from [Mixtral-8x22B](https://huggingface.co/mistral-community/Mixtral-8x22B-v0.1) on all multi-turn trajectory pairs in [UltraInteract](https://huggingface.co/openbmb/UltraInteract) and all pairs in [UltraFeedback](https://huggingface.co/openbmb/UltraFeedback).

It achieves superb reasoning performance as well as exellent chat & instruction-following capabilities.

## Evaluation
We conducted overall coding, math, reasoning, knowledge, instruction-following and chat benchmarking. Results are shown below, with the best scores in open-source models **bolded**:

| Models/Benchmarks |   Coding  |           |           |    Math   |           |           | Reasoning | Knowledge | Ins-Following |    Chat   |
|-------------------|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|:-------------:|:---------:|
|                   | HumanEval |    MBPP   |  LeetCode |  GSMPLUS  |    MATH   | TheoremQA | BBH (CoT) |    MMLU   |     IFEval    |  MT-Bench |
| GPT-3.5-Turbo     |   76.8    |   82.5    |   23.3    |   61.2    |   37.8    |   35.6    |   70.1    |   70.0    |     56.6      |   7.94    |
| GPT-4             |   85.4    |   83.5    |   41.8    |   85.6    |   69.7    |   52.4    |   86.7    |   86.4    |     79.7      |   8.96    |
| Mixtral-8x7B-Ins  |   50.6    |   50.1    |    5.6    |   49.6    |   25.9    |   20.4    |   73.5    |   70.3    |     48.8      |   8.30    |
| DS-LM-67B-Chat    |   70.7    |   65.7    |   20.0    |   65.0    |   41.0    |   17.9    |   78.9    |   72.3    |     52.7      |    8.35   |
| QWen-1.5-72B      |   71.3    |   56.9    |   15.6    |   65.4    |   43.4    |   18.5    |   78.0    |   72.9    |     53.4      | **8.61** |
| Eurus-70b-NCA     | **79.3** | **71.9** |   33.3    |   62.8    |   41.7    |   32.6    |   80.0    |   59.4    |     49.2      |   7.54    |
| Eurux-8x22b-KTO   |   71.3    |   68.9    |   29.4    | **68.3** |   48.4    |   35.3    | **83.6** | **75.9** |   **67.1**   |   8.58    |
| Eurux-8x22b-NCA   |   75.0    |   69.7    | **35.0** |   68.1    | **49.0** | **35.5** |   83.5    |   75.6    |   **67.1**   |   8.46    |



## Usage

```python
# pip install 'transformers>=4.39.3'
# pip install accelerate

import torch
from transformers import pipeline

pipe = pipeline(
    "text-generation",
    model="openbmb/Eurux-8x22b-kto",
    device_map="auto",
    torch_dtype=torch.bfloat16,
)
messages = [
    {"role": "user", "content": "What does Eurus mean?"},
]
outputs = pipe(
    messages,
    max_new_tokens=512,
    do_sample=True,
    temperature=0.7,
    top_k=50,
    top_p=0.95,
)
print(outputs[0]["generated_text"][-1]["content"])
```

We apply tailored prompts for coding and math, consistent with UltraInteract data formats:

**Coding**

```
[INST] Write Python code to solve the task:
{Instruction} [/INST]
```
**Math-CoT**

```
[INST] Solve the following math problem step-by-step.
Simplify your answer as much as possible. Present your final answer as \\boxed{Your Answer}.
{Instruction} [/INST]
```

**Math-PoT**

```
[INST] Tool available:
[1] Python interpreter
When you send a message containing Python code to python, it will be executed in a stateful Jupyter notebook environment.
Solve the following math problem step-by-step.
Simplify your answer as much as possible.
{Instruction} [/INST]
```


## Citation
```
@misc{yuan2024advancing,
      title={Advancing LLM Reasoning Generalists with Preference Trees}, 
      author={Lifan Yuan and Ganqu Cui and Hanbin Wang and Ning Ding and Xingyao Wang and Jia Deng and Boji Shan and Huimin Chen and Ruobing Xie and Yankai Lin and Zhenghao Liu and Bowen Zhou and Hao Peng and Zhiyuan Liu and Maosong Sun},
      year={2024},
      eprint={2404.02078},
      archivePrefix={arXiv},
      primaryClass={cs.AI}
}
```