# Links

- 📜 [Paper](https://arxiv.org/abs/2404.02078)
- 🤗 [Eurus Collection](https://huggingface.co/collections/openbmb/eurus-660bc40bec5376b3adc9d1c5)
- 🤗 UltraInteract
  - [SFT](https://huggingface.co/datasets/openbmb/UltraInteract_sft)
  - [Preference Learning](https://huggingface.co/datasets/openbmb/UltraInteract_pair) 
- [GitHub Repo](https://github.com/OpenBMB/Eurus)

# Introduction

Eurus-RM-7B is trained on a mixture of [UltraInteract](https://huggingface.co/datasets/openbmb/UltraInteract), [UltraFeedback](https://huggingface.co/datasets/openbmb/UltraFeedback), and [UltraSafety](https://huggingface.co/datasets/openbmb/UltraSafety), with a specifically designed reward modeling objective for reasoning to directly increase.

- EURUS-RM-7B stands out as the best 7B RM overall and achieves similar or better performance than much larger baselines. Particularly, it outperforms GPT-4 in certain tasks.
- Our training objective is beneficial in improving RM performance on hard problems and reasoning.
- ULTRAINTERACT is compatible with other datasets like UltraFeedback and UltraSafety, and mixing these datasets can balance different RM abilities.
- EURUS-RM-7B improves LLMs’ reasoning performance by a large margin through reranking.


## Usage
```python
from transformers import AutoTokenizer, AutoModel
import torch


def test(model_path):
    dataset = [  # cases in webgpt; we use the same template as Mistral-Instruct-v0.2
        {
            "chosen": "[INST] Sural relates to which part of the body? [/INST] The sural region is the muscular swelling of the back of the leg below the knee, formed chiefly by the bellies of the gastrocnemius and soleus muscles [1,2].",
            "rejected": "[INST] Sural relates to which part of the body? [/INST] The Sural nerve runs down the side of the leg near the small saphenous vein, then passes forward below the lateral malleolus and continues on the outside of the foot as the lateral dorsal cutaneous nerve, which then communicates with the intermediate dorsal cutaneous nerve, which branches off to the side of the foot. [1]",
        }
    ]

    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModel.from_pretrained(model_path, trust_remote_code=True)

    with torch.no_grad():
        for example in dataset:
            inputs = tokenizer(example["chosen"], return_tensors="pt")
            chosen_reward = model(**inputs).item()
            inputs = tokenizer(example["rejected"], return_tensors="pt")
            rejected_reward = model(**inputs).item()
            print(chosen_reward - rejected_reward)


test("openbmb/Eurus-RM-7b")
# Output: 47.4404296875
```

## Evaluation
 - Eurus-RM-7B stands out as the best 7B RM overall and achieves similar or better performance than much larger baselines. Particularly, it outperforms GPT-4 in certain tasks.
 - Our training objective is beneficial in improving RM performance on hard problems and reasoning.
 - ULTRAINTERACT is compatible with other datasets like UltraFeedback and UltraSafety, and mixing these datasets can balance different RM abilities.
 - Eurus-RM-7B improves LLMs’ reasoning performance by a large margin through reranking.
<img src="./figures/rm_exp.png" alt="stats" style="zoom: 40%;" />  


## Citation
```
@misc{yuan2024advancing,
      title={Advancing LLM Reasoning Generalists with Preference Trees}, 
      author={Lifan Yuan and Ganqu Cui and Hanbin Wang and Ning Ding and Xingyao Wang and Jia Deng and Boji Shan and Huimin Chen and Ruobing Xie and Yankai Lin and Zhenghao Liu and Bowen Zhou and Hao Peng and Zhiyuan Liu and Maosong Sun},
      year={2024},
      eprint={2404.02078},
      archivePrefix={arXiv},
}
```