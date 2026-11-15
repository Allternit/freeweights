<h1>A GPT-4o Level MLLM for Vision, Speech and Multimodal Live Streaming on Your Phone</h1>

[GitHub](https://github.com/OpenBMB/MiniCPM-o) | [MiniCPM Wiki(Chinese)](https://openbmb.cn/docs/) | [Online Demo](https://minicpm-omni-webdemo-us.modelbest.cn) | [Technical Blog](https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone-185ede1b7a558042b5d5e45e6b237da9) | [Join Us](https://mp.weixin.qq.com/mp/wappoc_appmsgcaptcha?poc_token=HAV8UWijqB3ImPSXecZHlOns7NRgpQw9y9EI2_fE&target_url=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2FKIhH2nCURBXuFXAtYRpuXg%3F)


## MiniCPM-o 2.6 int4
This is the int4 quantized version of [**MiniCPM-o 2.6**](https://github.com/RanchiZhao/AutoGPTQ).   
Running with int4 version would use lower GPU memory (about 9GB).

### Prepare code and install AutoGPTQ

We are submitting PR to officially support minicpm-o 2.6 inference

```python
git clone https://github.com/RanchiZhao/AutoGPTQ.git && cd AutoGPTQ
git checkout minicpmo

# install AutoGPTQ
pip install -vvv --no-build-isolation -e .
```

### Usage of **MiniCPM-o-2_6-int4**

Change the model initialization part to `AutoGPTQForCausalLM.from_quantized`

```python
import torch
from transformers import AutoModel, AutoTokenizer
from auto_gptq import AutoGPTQForCausalLM

model = AutoGPTQForCausalLM.from_quantized(
    'openbmb/MiniCPM-o-2_6-int4',
    torch_dtype=torch.bfloat16,
    device="cuda:0",
    trust_remote_code=True,
    disable_exllama=True,
    disable_exllamav2=True
)
tokenizer = AutoTokenizer.from_pretrained(
    'openbmb/MiniCPM-o-2_6-int4',
    trust_remote_code=True
)

model.init_tts()

```

Usage reference [MiniCPM-o-2_6#usage](https://huggingface.co/openbmb/MiniCPM-o-2_6#usage)