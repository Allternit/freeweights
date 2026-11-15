# Video-XL-2
[\[📰 Blog\]](https://unabletousegit.github.io/video-xl2.github.io/) [\[📂 GitHub\]](https://github.com/VectorSpaceLab/Video-XL)   [\[📜 Tech Report(comming soon)\]]()


## How to use the model
Video-XL-2 supply two efficiency optimization strategy: chunk-based prefill and bi-level kvs decoding. You can flexibly choose them based on your needs.
<!-- # 这里画一个表格说明开启模式带来的影响
# 这里加一个 TODO List -->

TODO
- [X] Release model weights.
- [X] Release the inference code w/o. efficiency optimization.
- [X] Release the inference code w. chunk-based prefill.
- [ ] Release the inference code w. chunk-based prefill & bi-level kvs decoding.

**Tips: Our inference code still under updating, you could update it by assign "--include '\*.py'" in huggingface-cli to only update the inference code, avoid downloading the whole model.*

---
### 0. Installing Required Packages
```bash
pip install transformers==4.43.0
pip install torch==2.1.2 torchvision==0.16.2 torchaudio==2.1.2 --index-url https://download.pytorch.org/whl/cu121
pip install decord
pip install einops
pip install opencv-python
pip install accelerate==0.30.0
pip install numpy==1.26.4
# optional
pip install flash-attn --no-build-isolation
```

---
### 1. Inference w/o. Efficiency Optimization
```python
from transformers import AutoTokenizer, AutoModel, AutoConfig, BitsAndBytesConfig, AutoModelForCausalLM
import torch

# load model 
model_path = '/root/Models/Video-XL-2'
tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = AutoModelForCausalLM.from_pretrained(model_path, trust_remote_code=True, device_map=device,quantization_config=None, attn_implementation="sdpa", torch_dtype=torch.float16, low_cpu_mem_usage=True)

gen_kwargs = {
    "do_sample": False,
    "temperature": 0.01,
    "top_p": 0.001,
    "num_beams": 1,
    "use_cache": True,
    "max_new_tokens": 256
}

model.config.enable_sparse = False

# input data
video_path = "/asset/demo.mp4"
question1 = "How many people in the video? (A)3 people (B)6 people. Please only respone the letter"

# params
max_num_frames = 150
sample_fps = 1  # extract frame at 1fps
max_sample_fps = 4

with torch.inference_mode():
    response = model.chat(video_path, tokenizer, question1, chat_history=None, return_history=False,max_num_frames=max_num_frames, sample_fps=sample_fps, max_sample_fps=max_sample_fps, generation_config=gen_kwargs)
    
print(response)
```

---
### 2. Inference w. Chunk-based Pre-filling
Chunk-based prefill significantly reduces memory demands and response latency by encoding video input in a streaming manner. This advantage becomes particularly noticeable with longer videos.

To enable this mode, you need to set `enable_chunk_prefill` to `True` and configure the `prefill_config` parameters:
* **`chunk_prefill_mode`**: This defines the mode of chunk-based prefill. We currently support two modes:
    * **`streaming`**: This mode encodes video chunks streamingly.
    * **`mask`**: This mode achieves an equivalent effect using an attention mask. However, due to a lack of underlying optimized operators, the `mask` mode doesn't offer any efficiency improvements at this time. We recommend using the `streaming` mode.
* **`chunk_size`**: This parameter specifies the size of each chunk processed in a single forward pass. The unit for `chunk_size` is **4 frames** (e.g., `chunk_size = 4` means processing visual tokens from **4×4 = 16 frames** at once). A larger `chunk_size` will gradually approach full attention, resulting in a higher peak memory usage.
* **`step_size`**: This controls the step size between chunks. A smaller `step_size` leads to more continuous information transfer between chunks but may slightly decrease inference speed.
* **`offload`**: This boolean parameter determines whether to offload the key-value states (KVs) of each chunk to the CPU during forwarding. While this can reduce memory usage, it will also lower the inference speed.
* **`chunk_size_for_vision_tower`**: For longer video inputs, the vision tower can become a memory bottleneck during forwarding. To mitigate this, we also support a streaming mode for the vision tower, which is controlled by this parameter. The unit for `chunk_size_for_vision_tower` is **1 frames**. And, the value of `chunk_size_for_vision_tower` must be **a multiple of 4**.

**Tip: Currently, chunk-based prefill only supports the 'sdpa' attention implementation.*

```python
from transformers import AutoTokenizer, AutoModel, AutoConfig, BitsAndBytesConfig, AutoModelForCausalLM
import torch
import pdb
import argparse

torch.cuda.reset_peak_memory_stats()
# load model 
model_path = '/root/Models/Video-XL-2'
tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
model = AutoModelForCausalLM.from_pretrained(model_path, trust_remote_code=True, device_map=device,quantization_config=None, attn_implementation="sdpa", torch_dtype=torch.float16, low_cpu_mem_usage=True) # sdpa

gen_kwargs = {"do_sample": False, "temperature": 0.01, "top_p": 0.001, "num_beams": 1, "use_cache": True, "max_new_tokens": 128}

model.config.enable_chunk_prefill = True
prefill_config = {
    'chunk_prefill_mode': 'streaming',
    'chunk_size': 4,
    'step_size': 1,
    'offload': True,
    'chunk_size_for_vision_tower': 24,
}
model.config.prefill_config = prefill_config

# input data
video_path = "/asset/demo.mp4"
question1 = "How many people in the video? (A)3 people (B)6 people. Please only respone the letter"

# params
max_num_frames = 1300
sample_fps = None  # uniform sampling
max_sample_fps = None

with torch.inference_mode():
    response = model.chat(video_path, tokenizer, question1, chat_history=None, return_history=False,max_num_frames=max_num_frames, sample_fps=sample_fps, max_sample_fps=max_sample_fps, generation_config=gen_kwargs)
    

peak_memory_allocated = torch.cuda.max_memory_allocated()
print(f"Memory Peak: {peak_memory_allocated / (1024**3):.2f} GB")
print(response)
```

---
### 3. Inference w. Chunk-based Pre-filling & Bi-level KVs Decoding
coming soon
```python

```



## ✏️ Citation

```bibtex
@article{shu2024video,
  title={Video-XL: Extra-Long Vision Language Model for Hour-Scale Video Understanding},
  author={Shu, Yan and Zhang, Peitian and Liu, Zheng and Qin, Minghao and Zhou, Junjie and Huang, Tiejun and Zhao, Bo},
  journal={arXiv preprint arXiv:2409.14485},
  year={2024}
}

@article{liu2025video,
  title={Video-XL-Pro: Reconstructive Token Compression for Extremely Long Video Understanding},
  author={Liu, Xiangrui and Shu, Yan and Liu, Zheng and Li, Ao and Tian, Yang and Zhao, Bo},
  journal={arXiv preprint arXiv:2503.18478},
  year={2025}
}
```