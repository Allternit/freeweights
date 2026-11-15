<div align='center'>
<h1>Emu3: Next-Token Prediction is All You Need</h1h1>
<h3></h3>

[Emu3 Team, BAAI](https://www.baai.ac.cn/english.html)

</div>


<div align='left'>
<img src="https://github.com/baaivision/Emu3/blob/main/assets/arch.png?raw=True" class="interpolation-image" alt="arch." height="80%" width="70%" />
</div>

Below is the model card of Emu3-Chat model, which is adapted from the original Emu3 model card that you can find [here](https://huggingface.co/BAAI/Emu3-Gen).


## Model details

**Model type:**
Emu3 is an open-source multimodal models trained  with next-token prediction task. By tokenizing images and text into a discrete space, Emu3 is trained as a single transformer from scratch on a mixture of multimodal sequences.
It is an auto-regressive language model, based on the transformer architecture.

**Paper or resources for more information:**
https://github.com/baaivision/Emu3


## Highlights

- **Emu3** is capable of generating high-quality images following the text input, by simply predicting the next vision token. The model naturally supports flexible resolutions and styles.
- **Emu3** shows strong vision-language understanding capabilities to see the physical world and provides coherent text responses. Notably, this capability is achieved without depending on a CLIP and a pretrained LLM.
- **Emu3** simply generates a video causally by predicting the next token in a video sequence, unlike the video diffusion model as in Sora. With a video in context, Emu3 can also naturally extend the video and predict what will happen next. 
- **Emu3** outperforms several well-established task-specific models in both generation and perception tasks, surpassing flagship open models such as SDXL, LLaVA-1.6 and OpenSora-1.2, while eliminating the need for diffusion or compositional architectures.

## How to use the model

First, make sure to have `transformers >= 4.48.0`. 
Make sure also to follow the correct prompt template (`USER: xxxASSISTANT:`) and add the token `<image>` to the location where you want to query images:


### Using `pipeline`:


```python
from transformers import pipeline

pipe = pipeline("image-text-to-text", model="BAAI/Emu3-Chat-hf")
messages = [
    {
      "role": "user",
      "content": [
          {"type": "image", "url": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/ai2d-demo.jpg"},
          {"type": "text", "text": "What does the label 15 represent? (1) lava (2) core (3) tunnel (4) ash cloud"},
        ],
    },
]

out = pipe(text=messages, max_new_tokens=20)
print(out)
>>> [{'input_text': [{'role': 'user', 'content': [{'type': 'image', 'url': 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/ai2d-demo.jpg'}, {'type': 'text', 'text': 'What does the label 15 represent? (1) lava (2) core (3) tunnel (4) ash cloud'}]}], 'generated_text': 'Lava'}]
```

### Using pure `transformers`:

Below is an example script to run generation in `float16` precision on a GPU device:

```python
import requests
from PIL import Image

import torch
from transformers import AutoProcessor, Emu3ForConditionalGeneration

model_id = "BAAI/Emu3-Chat-hf"
model = Emu3ForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    low_cpu_mem_usage=True,
    device_map="cuda:0",
)

processor = AutoProcessor.from_pretrained(model_id)

# Define a chat history and use `apply_chat_template` to get correctly formatted prompt
# Each value in "content" has to be a list of dicts with types ("text", "image") 
conversation = [
    {

      "role": "user",
      "content": [
          {"type": "image", "url": "http://images.cocodataset.org/val2017/000000039769.jpg"},
          {"type": "text", "text": "What are these?"},
        ],
    },
]
inputs_dict = processor.apply_chat_template(conversation, add_generation_prompt=True, tokenize=True, return_dict=True)
inputs_dict = inputs_dict.to(0, torch.float16)

output = model.generate(**inputs_dict, max_new_tokens=50, do_sample=False)
print(processor.decode(output[0][2:], skip_special_tokens=True))
```

### Model optimization


#### Use Flash-Attention 2 to further speed-up generation

First make sure to install `flash-attn`. Refer to the [original repository of Flash Attention](https://github.com/Dao-AILab/flash-attention) regarding that package installation. Simply change the snippet above with: 

```diff
model = Emu3ForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    low_cpu_mem_usage=True,
+   attn_implementation="flash_attention_2",
    device_map="cuda:0",
)
```

# Citation
```
@misc{wang2024emu3nexttokenpredictionneed,
      title={Emu3: Next-Token Prediction is All You Need}, 
      author={Xinlong Wang and Xiaosong Zhang and Zhengxiong Luo and Quan Sun and Yufeng Cui and Jinsheng Wang and Fan Zhang and Yueze Wang and Zhen Li and Qiying Yu and Yingli Zhao and Yulong Ao and Xuebin Min and Tao Li and Boya Wu and Bo Zhao and Bowen Zhang and Liangdong Wang and Guang Liu and Zheqi He and Xi Yang and Jingjing Liu and Yonghua Lin and Tiejun Huang and Zhongyuan Wang},
      year={2024},
      eprint={2409.18869},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2409.18869}, 
}
```