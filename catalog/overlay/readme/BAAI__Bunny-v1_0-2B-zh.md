# Model Card

<p align="center">
  <img src="./icon.png" alt="Logo" width="350">
</p>

📖 [Technical report](https://arxiv.org/abs/2402.11530) | 🏠 [Code](https://github.com/BAAI-DCAI/Bunny) | 🐰 [Demo](http://bunny.baai.ac.cn)

Bunny is a family of lightweight but powerful multimodal models. It offers multiple plug-and-play vision encoders, like EVA-CLIP, SigLIP and language backbones, including Llama-3-8B, Phi-1.5, StableLM-2, Qwen1.5, MiniCPM and Phi-2. To compensate for the decrease in model size, we construct more informative training data by curated selection from a broader data source. Remarkably, our Bunny-v1.0-3B model built upon SigLIP and Phi-2 outperforms the state-of-the-art MLLMs, not only in comparison with models of similar size but also against larger MLLM frameworks (7B), and even achieves performance on par with 13B models.

Bunny-v1.0-2B-zh employs [Qwen1.5-1.8B](https://huggingface.co/Qwen/Qwen1.5-1.8B) as the language model and [SigLIP](https://huggingface.co/google/siglip-so400m-patch14-384) as the vision encoder.
The model focuses on Chinese and achieves 59.5 on MMBench-CN test split.

The model is pretrained on LAION-2M and finetuned on Bunny-695K.
More details about this model can be found in [GitHub](https://github.com/BAAI-DCAI/Bunny).

# Quickstart

Here we show a code snippet to show you how to use the model with transformers.

Before running the snippet, you need to install the following dependencies:

```shell
pip install torch transformers accelerate pillow
```

If the CUDA memory is enough, it would be faster to execute this snippet by setting `CUDA_VISIBLE_DEVICES=0`.

Users especially those in Chinese mainland may want to refer to a HuggingFace [mirror site](https://hf-mirror.com).


```python
import torch
import transformers
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
import warnings

# disable some warnings
transformers.logging.set_verbosity_error()
transformers.logging.disable_progress_bar()
warnings.filterwarnings('ignore')

# set device
device = 'cuda'  # or cpu
torch.set_default_device(device)

# create model
model = AutoModelForCausalLM.from_pretrained(
    'BAAI/Bunny-v1_0-2B-zh',
    torch_dtype=torch.float16, # float32 for cpu
    device_map='auto',
    trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained(
    'BAAI/Bunny-v1_0-2B-zh',
    trust_remote_code=True)

# text prompt
prompt = 'Why is the image funny?'
text = f"A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions. USER: <image>\n{prompt} ASSISTANT:"
text_chunks = [tokenizer(chunk).input_ids for chunk in text.split('<image>')]
input_ids = torch.tensor(text_chunks[0] + [-200] + text_chunks[1], dtype=torch.long).unsqueeze(0).to(device)

# image, sample images can be found in images folder
image = Image.open('example_2.png')
image_tensor = model.process_images([image], model.config).to(dtype=model.dtype, device=device)

# generate
output_ids = model.generate(
    input_ids,
    images=image_tensor,
    max_new_tokens=100,
    use_cache=True,
    repetition_penalty=1.0 # increase this to avoid chattering
)[0]

print(tokenizer.decode(output_ids[input_ids.shape[1]:], skip_special_tokens=True).strip())
```

# License
This project utilizes certain datasets and checkpoints that are subject to their respective original licenses. Users must comply with all terms and conditions of these original licenses.
The content of this project itself is licensed under the Apache license 2.0.
