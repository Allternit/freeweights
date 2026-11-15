<div align="center">

<img src="https://huggingface.co/openbmb/Eurus-7b-sft/resolve/main/figures/Eurus-logo.png" width="200px">

**Eurus: A suit of open-source LLMs optimized for reasoning**

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

Eurus-7B-KTO is [KTO](https://arxiv.org/abs/2402.01306) fine-tuned from [Eurus-7B-SFT](https://huggingface.co/openbmb/Eurus-7b-sft) on all multi-turn trajectory pairs in [UltraInteract](https://huggingface.co/openbmb/UltraInteract) and all pairs in [UltraFeedback](https://huggingface.co/openbmb/UltraFeedback).

It achieves the best overall performance among open-source models of similar sizes and even outperforms specialized models in corresponding domains in many cases. Notably, Eurus-7B-KTO outperforms baselines that are 5× larger.

## Usage

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

## Evaluation
 - Eurus, both the 7B and 70B variants, achieve the best overall performance among open-source models of similar sizes. Eurus even outperforms specialized models in corresponding domains in many cases. Notably, Eurus-7B outperforms baselines that are 5× larger, and Eurus-70B achieves better performance than GPT-3.5 Turbo.
 - Preference learning with UltraInteract can further improve performance, especially in math and the multi-turn ability.
<img src="./figures/main_exp.png" alt="stats" style="zoom: 40%;" />  


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