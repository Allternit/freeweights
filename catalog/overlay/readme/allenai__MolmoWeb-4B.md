<img src="molmoweb_logo.png" alt="Logo for the MolmoWeb Project" style="width: auto; height: 50px;">

# MolmoWeb-4B

<span style="color:red; font-weight: bold;">Important Update!</span> 
We made a few small but important updates to this HF/transformers-compatible checkpoint to ensure exact outputs to our native model checkpoint on **March 29, 2026 ~6PM PST**. 
If you downloaded this model checkpoint earlier than this time, we recommend re-downloading it. See PRs [2](https://huggingface.co/allenai/MolmoWeb-8B/discussions/2) and [3](https://huggingface.co/allenai/MolmoWeb-8B/discussions/3) for more details. Thanks for your understanding! 


MolmoWeb is a family of fully open multimodal web agents. MolmoWeb agents achieve state-of-the-art results outperforming similar scale open-weight-only
models such as Fara-7B, UI-Tars-1.5-7B, and Holo1-7B. MolmoWeb-8B also surpasses set-of-marks
(SoM) agents built on much larger closed frontier models like GPT-4o. We further demonstrate
consistent gains through test-time scaling via parallel rollouts with best-of-N selection, achieving 94.7%
and 60.5% pass@4 (compared to 78.2% and 35.3% pass@1)on WebVoyager and Online-Mind2Web
respectively. 

**Learn more** about the MolmoWeb family in our announcement [blog post](https://allenai.org/blog/molmoweb) and [tech report](https://allenai.org/papers/molmoweb).

MolmoWeb-4B is based on [Molmo2](https://arxiv.org/abs/2601.10611) architecture, which uses [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) and [SigLIP 2](https://huggingface.co/google/siglip-so400m-patch14-384) as vision backbone. 

Ai2 is committed to open science. The MolmoWeb datasets are available [here](https://huggingface.co/collections/allenai/molmoweb-data). 
All other artifacts used in creating MolmoWeb (training code, [evaluations](https://github.com/allenai/molmoweb), intermediate checkpoints) will be made available, furthering our commitment to open-source AI development and reproducibility.

Quick links:
- 💬 [Demo](https://molmoweb.allen.ai/)
- 📂 [All Models](https://huggingface.co/collections/allenai/molmoweb)
- 📚 [All Data](https://huggingface.co/collections/allenai/molmoweb-data)
- 📃 [Paper](https://allenai.org/papers/molmoweb)
- 🎥 [Blog with Videos](https://allenai.org/blog/molmoweb)

## Quick Start
```python
from transformers import AutoProcessor, AutoModelForImageTextToText
from PIL import Image
import requests
import torch
from jinja2 import Template

checkpoint_dir = "allenai/MolmoWeb-4B"

model = AutoModelForImageTextToText.from_pretrained(
    checkpoint_dir,
    trust_remote_code=True,
    torch_dtype=torch.float32, # we recommend using the default float32 precision 
    attn_implementation="sdpa",
    device_map="auto",
)

processor = AutoProcessor.from_pretrained(
    checkpoint_dir,
    trust_remote_code=True,
    padding_side="left",
)


MOLMOWEB_THINK_TEMPLATE = Template(
"""
# GOAL
{{ task_description }}

# PREVIOUS STEPS
{% for action in past_actions: -%}
## Step {{ action['index'] }}
THOUGHT: {{ action['thought'] }}
ACTION: {{ action['action'] }}
{% endfor %}
# CURRENTLY ACTIVE PAGE
Page {{ page_index }}: {{ page_title }} | {{ page_url }}

# NEXT STEP

"""
)

task_description = "Tell me about the Ai2 PIROR team's recent projects"
past_actions = []
user_message = MOLMOWEB_THINK_TEMPLATE.render(
    page_title=None,
    page_url="about:blank",
    page_index=0,
    task_description=task_description,
    past_actions=[]
)
system_message = "molmo_web_think"
prompt = f"{system_message}: {user_message}"

blank_image = Image.new("RGB", (1280, 720), color="white")

image_messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": prompt},
            {"type": "image", "image": blank_image},
        ]
    }
]

inputs = processor.apply_chat_template(
    image_messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt",
    return_dict=True,
    padding=True,
)

# Remove token_type_ids: HF uses it to enable bidirectional attention for image tokens; molmoweb is trained with causal attention only
inputs = {k: v.to("cuda") for k, v in inputs.items() if k != "token_type_ids"} 

with torch.inference_mode():
    output = model.generate(**inputs, max_new_tokens=200)

generated_tokens = output[0, inputs["input_ids"].size(1):]
print(processor.decode(generated_tokens, skip_special_tokens=True))
```

## License and Use

This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with Ai2’s [Responsible Use Guidelines](https://allenai.org/responsible-use).

## Citation

If you use this dataset, please cite:

[arXiv:2604.08516](https://arxiv.org/abs/2604.08516)

```bibtex
@misc{gupta2026molmowebopenvisualweb,
      title={MolmoWeb: Open Visual Web Agent and Open Data for the Open Web}, 
      author={Tanmay Gupta and Piper Wolters and Zixian Ma and Peter Sushko and Rock Yuren Pang and Diego Llanes and Yue Yang and Taira Anderson and Boyuan Zheng and Zhongzheng Ren and Harsh Trivedi and Taylor Blanton and Caleb Ouellette and Winson Han and Ali Farhadi and Ranjay Krishna},
      year={2026},
      eprint={2604.08516},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2604.08516}, 
}