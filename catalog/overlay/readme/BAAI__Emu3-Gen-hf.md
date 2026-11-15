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
Below is an example script to run generation in `float16` precision on a GPU device:

```python
import requests
from PIL import Image

import torch
from transformers import AutoProcessor, Emu3ForConditionalGeneration

model_id = "BAAI/Emu3-Gen-hf"
model = Emu3ForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    low_cpu_mem_usage=True,
    device_map="cuda:0",
)

processor = AutoProcessor.from_pretrained(model_id)
inputs = processor(
    text=["a portrait of young girl. masterpiece, film grained, best quality."],
    padding=True,
    return_tensors="pt",
    return_for_image_generation=True,
).to(model.device)

image_sizes = inputs.pop("image_sizes")
HEIGHT, WIDTH = image_sizes[0]
VISUAL_TOKENS = model.vocabulary_mapping.image_tokens

def prefix_allowed_tokens_fn(batch_id, input_ids):
    height, width = HEIGHT, WIDTH
    visual_tokens = VISUAL_TOKENS
    image_wrapper_token_id = torch.tensor([processor.tokenizer.image_wrapper_token_id], device=model.device)
    eoi_token_id = torch.tensor([processor.tokenizer.eoi_token_id], device=model.device)
    eos_token_id = torch.tensor([processor.tokenizer.eos_token_id], device=model.device)
    pad_token_id = torch.tensor([processor.tokenizer.pad_token_id], device=model.device)
    eof_token_id = torch.tensor([processor.tokenizer.eof_token_id], device=model.device)
    eol_token_id = processor.tokenizer.encode("<|extra_200|>", return_tensors="pt")[0]

    position = torch.nonzero(input_ids == image_wrapper_token_id, as_tuple=True)[0][0]
    offset = input_ids.shape[0] - position
    if offset % (width + 1) == 0:
        return (eol_token_id,)
    elif offset == (width + 1) * height + 1:
        return (eof_token_id,)
    elif offset == (width + 1) * height + 2:
        return (eoi_token_id,)
    elif offset == (width + 1) * height + 3:
        return (eos_token_id,)
    elif offset > (width + 1) * height + 3:
        return (pad_token_id,)
    else:
        return visual_tokens

out = model.generate(
    **inputs,
    max_new_tokens=9_000,
    prefix_allowed_tokens_fn=prefix_allowed_tokens_fn,
    do_sample=True,
)

image = model.decode_image_tokens(out.sequences[:, inputs.input_ids.shape[1]: ], height=HEIGHT, width=WIDTH)
images = processor.postprocess(list(image.float()), return_tensors="PIL.Image.Image")
for i, image in enumerate(images['pixel_values']):
    image.save(f"result{i}.png")
  
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