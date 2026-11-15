# AlchemistCoder: Harmonizing and Eliciting Code Capability by Hindsight Tuning on Multi-source Data

[[🤗 HuggingFace](https://huggingface.co/internlm/AlchemistCoder-DS-6.7B)]
[[📃 Paper](https://arxiv.org/abs/2405.19265)]
[[🌐 Project Page](https://internlm.github.io/AlchemistCoder/)]


## ✨ Highlights
> **Abstract:** *Open-source Large Language Models (LLMs) and their specialized variants, particularly Code LLMs, have recently delivered impressive performance. However, previous Code LLMs are typically fine-tuned on single-source data with limited quality and diversity, which may insufficiently elicit the potential of pre-trained Code LLMs. In this paper, we present AlchemistCoder, a series of Code LLMs with enhanced code generation and generalization capabilities fine-tuned on multi-source data. To achieve this, we pioneer to unveil inherent conflicts among the various styles and qualities in multi-source code corpora and introduce data-specific prompts with hindsight relabeling, termed AlchemistPrompts, to harmonize different data sources and instruction-response pairs. Additionally, we propose incorporating the data construction process into the fine-tuning data as code comprehension tasks, including instruction evolution, data filtering, and code review. Extensive experiments demonstrate that AlchemistCoder holds a clear lead among all models of the same size (6.7B/7B) and rivals or even surpasses larger models (15B/33B/70B), showcasing the efficacy of our method in refining instruction-following capabilities and advancing the boundaries of code intelligence.* 

- **AlchemistPrompts**: Designed as data-specific prompts for harmonizing inherent conflicts in multi-source data and mitigating the instruction/response misalignment at a fined-grained level.
- **Code Comprehenstion Tasks**: Sourced from the process of data construction, consisting of instruction evolution, data filtering, and code review.
- **Harmonized Multi-source Data**: Instruction tuned on 200M tokens, including 6 types of high-quality data.
- **Superior Model Performance**: Surpassing all the open-source models of the same size (6.7/7B), and rivaling or even beating larger models (15B/33B/70B/ChatGPT) on 6 code benchmarks.
- **Advanced generic capabilities**: Demonstrated by the significant improvements on MMLU, BBH, and GSM8K.
  

## 🚀 Quick Start
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("internlm/AlchemistCoder-L-7B", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("internlm/AlchemistCoder-L-7B", trust_remote_code=True, torch_dtype=torch.bfloat16).cuda()
model = model.eval()

input_text = "Implement the Dijkstra algorithm in Python"
inputs = tokenizer(input_text, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_length=128)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```


## 🧪 Evaluation and Fine-tune
Please refer to [**AlchemistCoder**](https://github.com/InternLM/AlchemistCoder) and [**InternLM**](https://github.com/InternLM/InternLM/tree/main).

## 😃 Acknowledgments
*AlchemistCoder* is built with [**InternLM**](https://github.com/InternLM) and [**OpenCompass**](https://github.com/open-compass). Thanks for their awesome work!

## 📧 Contact
If you have any questions, please create an issue on this repository or contact us at:
- sugger@tongji.edu.cn
- zhangwenwei@pjlab.org.cn

## 🌟 Citation
If you find our work useful, please consider citing:

```bibtex
@misc{song2024alchemistcoder,
      title={AlchemistCoder: Harmonizing and Eliciting Code Capability by Hindsight Tuning on Multi-source Data}, 
      author={Zifan Song and Yudong Wang and Wenwei Zhang and Kuikun Liu and Chengqi Lyu and Demin Song and Qipeng Guo and Hang Yan and Dahua Lin and Kai Chen and Cairong Zhao},
      year={2024},
      eprint={2405.19265},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```