# Seed-Coder-8B-Reasoning

<div align="left" style="line-height: 1;">
  <a href="https://bytedance-seed-coder.github.io/" target="_blank" style="margin: 2px;">
    <img alt="Homepage" src="https://img.shields.io/badge/Seed--Coder-Homepage-a468fe?color=a468fe&logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>

  <a href="https://arxiv.org/abs/2506.03524" target="_blank" style="margin: 2px;">
    <img alt="Technical Report" src="https://img.shields.io/badge/arXiv-Technical%20Report-brightgreen?logo=arxiv&logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>
  
  <a href="https://huggingface.co/ByteDance-Seed" target="_blank" style="margin: 2px;">
      <img alt="Hugging Face" src="https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-ByteDance%20Seed-536af5?color=536af5&logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>
  
  <a href="https://github.com/ByteDance-Seed/Seed-Coder/blob/master/LICENSE" style="margin: 2px;">
      <img alt="License" src="https://img.shields.io/badge/License-MIT-f5de53?color=f5de53&logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>
</div>


## Introduction
We are thrilled to introduce Seed-Coder, a powerful, transparent, and parameter-efficient family of open-source code models at the 8B scale, featuring base, instruct, and reasoning variants. Seed-Coder contributes to promote the evolution of open code models through the following highlights.

- **Model-centric:** Seed-Coder predominantly leverages LLMs instead of hand-crafted rules for code data filtering, minimizing manual effort in pretraining data construction.
- **Transparent:** We openly share detailed insights into our model-centric data pipeline, including methods for curating GitHub data, commits data, and code-related web data.
- **Powerful:** Seed-Coder achieves state-of-the-art performance among open-source models of comparable size across a diverse range of coding tasks.

<p align="center">
  <img width="100%" src="imgs/seed-coder_intro_performance.png">
</p>

This repo contains the **Seed-Coder-8B-Reasoning** model, which has the following features:
- Type: Causal language models
- Training Stage: Pretraining & Post-training
- Data Source: Public datasets
- Context Length: 65,536


## Model Downloads
| Model Name                  | Length | Download   |    Notes |
|---------------------------------------------------------|-----------|------------------------------------|-----------------------|
| Seed-Coder-8B-Base           | 32K    | 🤗 [Model](https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Base)   |  Pretrained on our model-centric code data.  |
| Seed-Coder-8B-Instruct             | 32K    | 🤗 [Model](https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Instruct)   |  Instruction-tuned for alignment with user intent. |
| 👉 **Seed-Coder-8B-Reasoning**            | 64K    | 🤗 [Model](https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Reasoning)   |  RL trained to boost reasoning capabilities.  |
| Seed-Coder-8B-Reasoning-bf16 | 64K    | 🤗 [Model](https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Reasoning-bf16)   |  RL trained to boost reasoning capabilities. |


## Requirements
You will need to install the latest versions of `transformers` and `accelerate`:

```bash
pip install -U transformers accelerate
```

## Quickstart

Here is a simple example demonstrating how to load the model and perform code generation using the Hugging Face `pipeline` API:

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "ByteDance-Seed/Seed-Coder-8B-Reasoning"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map="auto", trust_remote_code=True)

messages = [
    {"role": "user", "content": "Write a quick sort algorithm."},
]

input_ids = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    return_tensors="pt",
    add_generation_prompt=True,  
).to(model.device)

outputs = model.generate(input_ids, max_new_tokens=16384)
response = tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
print(response)
```

## Evaluation
Seed-Coder-8B-Reasoning strikes impressive performance on competitive programming, demonstrating that smaller LLMs can also be competent on complex reasoning tasks. Our model surpasses QwQ-32B and DeepSeek-R1 on IOI'2024, and achieves an ELO rating comparable to o1-mini on Codeforces contests.

<div style="display: flex; justify-content: center;">
    <img src="imgs/reasoning-ioi.jpg" width="61%" />
    <img src="imgs/reasoning-codeforces.jpg" width="39%" />
</div>


For detailed benchmark performance, please refer to our [📑 Technical Report](https://github.com/ByteDance-Seed/Seed-Coder/blob/master/Seed-Coder.pdf).

## License

This project is licensed under the MIT License. See the [LICENSE file](https://github.com/ByteDance-Seed/Seed-Coder/blob/master/LICENSE) for details.

## Citation

If you find our work helpful, feel free to give us a cite.

```
@misc{seed2025seedcoderletcodemodel,
      title={{Seed-Coder}: Let the Code Model Curate Data for Itself}, 
      author={{ByteDance Seed} and Yuyu Zhang and Jing Su and Yifan Sun and Chenguang Xi and Xia Xiao and Shen Zheng and Anxiang Zhang and Kaibo Liu and Daoguang Zan and Tao Sun and Jinhua Zhu and Shulin Xin and Dong Huang and Yetao Bai and Lixin Dong and Chao Li and Jianchong Chen and Hanzhi Zhou and Yifan Huang and Guanghan Ning and Xierui Song and Jiaze Chen and Siyao Liu and Kai Shen and Liang Xiang and Yonghui Wu},
      year={2025},
      eprint={2506.03524},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2506.03524}, 
}
```
