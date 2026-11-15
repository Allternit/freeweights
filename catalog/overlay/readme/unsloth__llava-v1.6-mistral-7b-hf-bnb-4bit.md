# Finetune Llama 3.2, Qwen 2.5, Gemma 2, Mistral 2-5x faster with 70% less memory via Unsloth!

We have a free Google Colab Tesla T4 notebook for Llava 1.6 (7B) here: https://colab.research.google.com/drive/1Ys44kVvmeZtnICzWz0xgpRnrIOjZAuxp?usp=sharing

And a free notebook for [Llama 3.2 Vision (11B) here](https://colab.research.google.com/drive/1Ys44kVvmeZtnICzWz0xgpRnrIOjZAuxp?usp=sharing)

[<img src="https://raw.githubusercontent.com/unslothai/unsloth/main/images/Discord%20button.png" width="200"/>](https://discord.gg/unsloth)
[<img src="https://raw.githubusercontent.com/unslothai/unsloth/main/images/unsloth%20made%20with%20love.png" width="200"/>](https://github.com/unslothai/unsloth)


# unsloth/llava-v1.6-mistral-7b-hf-bnb-4bit
For more details on the model, please go to the original [model card](https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf)

## ✨ Finetune for Free

All notebooks are **beginner friendly**! Add your dataset, click "Run All", and you'll get a 2x faster finetuned model which can be exported to GGUF, vLLM or uploaded to Hugging Face.

| Unsloth supports          |    Free Notebooks                                                                                           | Performance | Memory use |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|-------------|----------|
| **Llama-3.2 (3B)**      | [▶️ Start on Colab](https://colab.research.google.com/drive/1Ys44kVvmeZtnICzWz0xgpRnrIOjZAuxp?usp=sharing)               | 2.4x faster | 58% less |
| **Llama-3.2 (11B vision)**      | [▶️ Start on Colab](https://colab.research.google.com/drive/1Ys44kVvmeZtnICzWz0xgpRnrIOjZAuxp?usp=sharing)               | 2x faster | 40% less |
| **Qwen2 VL (7B)**      | [▶️ Start on Colab](https://colab.research.google.com/drive/1Ys44kVvmeZtnICzWz0xgpRnrIOjZAuxp?usp=sharing)               | 1.8x faster | 40% less |
| **Qwen2.5 (7B)**      | [▶️ Start on Colab](https://colab.research.google.com/drive/1Kose-ucXO1IBaZq5BvbwWieuubP7hxvQ?usp=sharing)               | 2x faster | 60% less |
| **Llama-3.1 (8B)**      | [▶️ Start on Colab](https://colab.research.google.com/drive/1Ys44kVvmeZtnICzWz0xgpRnrIOjZAuxp?usp=sharing)               | 2.4x faster | 58% less |
| **Phi-3.5 (mini)** | [▶️ Start on Colab](https://colab.research.google.com/drive/1lN6hPQveB_mHSnTOYifygFcrO8C1bxq4?usp=sharing)               | 2x faster | 50% less |
| **Gemma 2 (9B)**      | [▶️ Start on Colab](https://colab.research.google.com/drive/1vIrqH5uYDQwsJ4-OO3DErvuv4pBgVwk4?usp=sharing)               | 2.4x faster | 58% less |
| **Mistral (7B)**    | [▶️ Start on Colab](https://colab.research.google.com/drive/1Dyauq4kTZoLewQ1cApceUQVNcnnNTzg_?usp=sharing)               | 2.2x faster | 62% less |
| **DPO - Zephyr**     | [▶️ Start on Colab](https://colab.research.google.com/drive/15vttTpzzVXv_tJwEk-hIcQ0S9FcEWvwP?usp=sharing)               | 1.9x faster | 19% less |

[<img src="https://raw.githubusercontent.com/unslothai/unsloth/refs/heads/main/images/documentation%20green%20button.png" width="200"/>](https://docs.unsloth.ai)

- This [conversational notebook](https://colab.research.google.com/drive/1Aau3lgPzeZKQ-98h69CCu1UJcvIBLmy2?usp=sharing) is useful for ShareGPT ChatML / Vicuna templates.
- This [text completion notebook](https://colab.research.google.com/drive/1ef-tab5bhkvWmBOObepl1WgJvfvSzn5Q?usp=sharing) is for raw text. This [DPO notebook](https://colab.research.google.com/drive/15vttTpzzVXv_tJwEk-hIcQ0S9FcEWvwP?usp=sharing) replicates Zephyr.
- \* Kaggle has 2x T4s, but we use 1. Due to overhead, 1x T4 is 5x faster.


# LLaVa-Next, leveraging [mistralai/Mistral-7B-Instruct-v0.2](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2) as LLM

The LLaVA-NeXT model was proposed in [LLaVA-NeXT: Improved reasoning, OCR, and world knowledge](https://llava-vl.github.io/blog/2024-01-30-llava-next/) by Haotian Liu, Chunyuan Li, Yuheng Li, Bo Li, Yuanhan Zhang, Sheng Shen, Yong Jae Lee. LLaVa-NeXT (also called LLaVa-1.6) improves upon [LLaVa-1.5](https://huggingface.co/transformers/main/model_doc/llava.html) by increasing the input image resolution and training on an improved visual instruction tuning dataset to improve OCR and common sense reasoning.

Disclaimer: The team releasing LLaVa-NeXT did not write a model card for this model so this model card has been written by the Hugging Face team.

## Model description

LLaVa combines a pre-trained large language model with a pre-trained vision encoder for multimodal chatbot use cases. LLaVA 1.6 improves on LLaVA 1.5 BY:
- Using [Mistral-7B](https://mistral.ai/news/announcing-mistral-7b/) (for this checkpoint) and [Nous-Hermes-2-Yi-34B](https://huggingface.co/NousResearch/Nous-Hermes-2-Yi-34B) which has better commercial licenses,
  and bilingual support
- More diverse and high quality data mixture
- Dynamic high resolution
  
![image/png](https://cdn-uploads.huggingface.co/production/uploads/62441d1d9fdefb55a0b7d12c/FPshq08TKYD0e-qwPLDVO.png)

## Intended uses & limitations

You can use the raw model for tasks like image captioning, visual question answering, multimodal chatbot use cases. See the [model hub](https://huggingface.co/models?search=llava-hf) to look for
other versions on a task that interests you.

### How to use

Here's the prompt template for this model:
```
"[INST] <image>\nWhat is shown in this image? [/INST]"
```
You can load and use the model like following:
```python
from transformers import LlavaNextProcessor, LlavaNextForConditionalGeneration
import torch
from PIL import Image
import requests

processor = LlavaNextProcessor.from_pretrained("llava-hf/llava-v1.6-mistral-7b-hf")

model = LlavaNextForConditionalGeneration.from_pretrained("llava-hf/llava-v1.6-mistral-7b-hf", torch_dtype=torch.float16, low_cpu_mem_usage=True) 
model.to("cuda:0")

# prepare image and text prompt, using the appropriate prompt template
url = "https://github.com/haotian-liu/LLaVA/blob/1a91fc274d7c35a9b50b3cb29c4247ae5837ce39/images/llava_v1_5_radar.jpg?raw=true"
image = Image.open(requests.get(url, stream=True).raw)

# Define a chat history and use `apply_chat_template` to get correctly formatted prompt
# Each value in "content" has to be a list of dicts with types ("text", "image") 
conversation = [
    {

      "role": "user",
      "content": [
          {"type": "text", "text": "What is shown in this image?"},
          {"type": "image"},
        ],
    },
]
prompt = processor.apply_chat_template(conversation, add_generation_prompt=True)

inputs = processor(images=image, text=prompt, return_tensors="pt").to("cuda:0")

# autoregressively complete prompt
output = model.generate(**inputs, max_new_tokens=100)

print(processor.decode(output[0], skip_special_tokens=True))
```

### Model optimization

#### 4-bit quantization through `bitsandbytes` library

First make sure to install `bitsandbytes`, `pip install bitsandbytes` and make sure to have access to a CUDA compatible GPU device. Simply change the snippet above with: 

```diff
model = LlavaNextForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    low_cpu_mem_usage=True,
+   load_in_4bit=True
)
```

#### Use Flash-Attention 2 to further speed-up generation

First make sure to install `flash-attn`. Refer to the [original repository of Flash Attention](https://github.com/Dao-AILab/flash-attention) regarding that package installation. Simply change the snippet above with: 

```diff
model = LlavaNextForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    low_cpu_mem_usage=True,
+   use_flash_attention_2=True
).to(0)
```

### BibTeX entry and citation info

```bibtex
@misc{liu2023improved,
      title={Improved Baselines with Visual Instruction Tuning}, 
      author={Haotian Liu and Chunyuan Li and Yuheng Li and Yong Jae Lee},
      year={2023},
      eprint={2310.03744},
      archivePrefix={arXiv},
      primaryClass={cs.CV}
}
```