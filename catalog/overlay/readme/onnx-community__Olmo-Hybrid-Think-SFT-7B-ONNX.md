## Model Details


# Model Card for Olmo Hybrid Think SFT

We expand on our Olmo model series by introducing Olmo Hybrid, a new 7B hybrid RNN model in the Olmo family. Olmo Hybrid dramatically outperforms Olmo 3 in final performance, consistently showing roughly 2x data
efficiency on core evals over the course of our pretraining run. We also show gains in performance on long-context benchmarks, as well as improved inference efficiency
(throughput and memory) on long-context lengths by a factor of 75%.

The core models released in this batch include the following:

| **Stage**               | **Olmo 3 7B Think** | **Olmo 3 32B Think** | **Olmo 3 7B Instruct** | **Olmo Hybrid Think 7B** | **Olmo Hybrid Instruct 7B** |
|--------------------------|-----------------------|------------------------|---------------------------|-------------------------------|----------------------------------|
| **Base Model**           | [Olmo-3-7B](https://huggingface.co/allenai/Olmo-3-1025-7B) | [Olmo-3-32B](https://huggingface.co/allenai/Olmo-3-1125-32B) | [Olmo-3-7B](https://huggingface.co/allenai/Olmo-3-1025-7B) | [Olmo-Hybrid-7B](https://huggingface.co/allenai/Olmo-Hybrid-7B) | [Olmo-Hybrid-7B](https://huggingface.co/allenai/Olmo-Hybrid-7B) |
| **SFT**                  | [Olmo-3-7B-Think-SFT](https://huggingface.co/allenai/Olmo-3-7B-Think-SFT) | [Olmo-3-32B-Think-SFT](https://huggingface.co/allenai/Olmo-3-32B-Think-SFT) | [Olmo-3-7B-Instruct-SFT](https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT) | [Olmo-Hybrid-Think-SFT-7B](https://huggingface.co/allenai/Olmo-Hybrid-Think-SFT-7B) | [Olmo-Hybrid-Instruct-SFT-7B](https://huggingface.co/allenai/Olmo-Hybrid-Instruct-SFT-7B) |
| **DPO**                  | [Olmo-3-7B-Think-DPO](https://huggingface.co/allenai/Olmo-3-7B-Think-DPO) | [Olmo-3-32B-Think-DPO](https://huggingface.co/allenai/Olmo-3-32B-Think-DPO) | [Olmo-3-7B-Instruct-DPO](https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO) | -- | [Olmo-Hybrid-Instruct-DPO-7B](https://huggingface.co/allenai/Olmo-Hybrid-Instruct-DPO-7B) |
| **Final Models (RLVR)**  | [Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think) | [Olmo-3-32B-Think](https://huggingface.co/allenai/Olmo-3-32B-Think) | [Olmo-3-7B-Instruct](https://huggingface.co/allenai/Olmo-3-7B-Instruct) | -- | -- |


Olmo is a series of **O**pen **l**anguage **mo**dels designed to enable the science of language models. 
These models are pre-trained on the Dolma 3 dataset and post-trained on the Dolci datasets. We are releasing all code, checkpoints, logs (coming soon), and associated training details. 
            

## Installation

Olmo Hybrid is supported in transformers 5.3.0 or higher
```bash
pip install transformers>=5.3.0
```

## Inference

You can use OLMo with the standard HuggingFace transformers library:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
olmo = AutoModelForCausalLM.from_pretrained("allenai/Olmo-Hybrid-Think-SFT-7B")
tokenizer = AutoTokenizer.from_pretrained("allenai/Olmo-Hybrid-Think-SFT-7B")
message = ["Who would win in a fight - a dinosaur or a cow named Moo Moo?"]
inputs = tokenizer(message, return_tensors='pt', return_token_type_ids=False)
# optional verifying cuda
# inputs = {k: v.to('cuda') for k,v in inputs.items()}
# olmo = olmo.to('cuda')
response = olmo.generate(**inputs, max_new_tokens=100, do_sample=True, top_k=50, top_p=0.95)
print(tokenizer.batch_decode(response, skip_special_tokens=True)[0])
>> '<think>Okay, so the question is who would win in a fight...'
```

For faster performance, you can quantize the model using the following method:
```python
AutoModelForCausalLM.from_pretrained("allenai/Olmo-Hybrid-Think-SFT-7B", 
    torch_dtype=torch.float16, 
    load_in_8bit=True)  # Requires bitsandbytes
```
The quantized model is more sensitive to data types and CUDA operations. To avoid potential issues, it's recommended to pass the inputs directly to CUDA using:
```python
inputs.input_ids.to('cuda')
```

We have released checkpoints for these models. For post-training, the naming convention is `step_XXXX`. 


To load a specific model revision with HuggingFace, simply add the argument `revision`:
```bash
olmo = AutoModelForCausalLM.from_pretrained("allenai/Olmo-Hybrid-Think-SFT-7B", revision="step11000")
```

Or, you can access all the revisions for the models via the following code snippet:
```python
from huggingface_hub import list_repo_refs
out = list_repo_refs("allenai/Olmo-Hybrid-Think-SFT-7B")
branches = [b.name for b in out.branches]
```

### Chat template

## Default System Message
The default system prompt for this model is:
```
<|im_start|>system
You are a helpful function-calling AI assistant. You do not currently have access to any functions. <functions></functions>
<|im_end|>
```

## Chat Format

The chat template for this model is formatted as:
```
<|im_start|>system
You are a helpful function-calling AI assistant. You do not currently have access to any functions. <functions></functions>
<|im_start|>user
Who would win in a fight - a dinosaur or a cow named Moo Moo?<|im_end|>
<|im_start|>assistant
<think>Okay, so the question is who would win in a fight between a dinosaur and a cow named Moo Moo.
Hmm, first I need to break this down. Let me think about the different factors involved here..... </think>
Moo Moo the cow would certinaly win.
<|endoftext|>
```

### Model Description

- **Developed by:** Allen Institute for AI (Ai2)
- **Model type:** a Transformer style autoregressive language model.
- **Language(s) (NLP):** English
- **License:** This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with Ai2's [Responsible Use Guidelines](https://allenai.org/responsible-use).
- **Contact:** Technical inquiries: `olmo@allenai.org`. Press: `press@allenai.org`
- **Date cutoff:** Dec. 2024.


### Model Sources

- **Project Page:** https://allenai.org/olmo
- **Repositories:**
    - Open-Instruct for DPO and RLVR: https://github.com/allenai/open-instruct
    - OLMo-Core for pre-training and SFT: https://github.com/allenai/OLMo-core
    - OLMo-Eval for evaluation: https://github.com/allenai/OLMo-Eval
- **Olmo 3 Paper:** https://allenai.org/papers/olmo3
- **Olmo Hybrid Paper:** https://allenai.org/papers/olmo-hybrid


## Evaluation

| Skill | Benchmark | **Olmo Hybrid Think SFT 7B** | Olmo 3 Think 7B SFT | Olmo 3 Think 7B DPO | Olmo 3 Think 7B | OpenThinker3-7B | Nemotron-Nano-9B-v2 | DeepSeek-R1-Distill-Qwen-7B | Qwen 3 8B (reasoning) | Qwen 3 VL 8B Thinker | OpenReasoning Nemotron 7B |
|-------|-----------|--------------------------|------------------|------------------|--------------|------------------|-----------------------|------------------------------|-------------------------|---------------------------|-----------------------------|
| **Math** | MATH | 93.8 | 94.4 | 92.4 | 95.1 | 94.5 | 94.4 | 87.9 | 95.1 | 95.2 | 94.6 |
|  | AIME 2024 | 66.2 | 69.6 | 74.6 | 71.6 | 67.7 | 72.1 | 54.9 | 74.0 | 70.9 | 77.0 |
|  | AIME 2025 | 55.2 | 57.6 | 62.7 | 64.6 | 57.2 | 58.9 | 40.2 | 67.8 | 61.5 | 73.1 |
|  | OMEGA | 35.1 | 45.0 | 40.5 | 37.8 | 38.4 | 42.4 | 28.5 | 43.4 | 38.1 | 43.2 |
| **Reasoning** | BBH | 84.6 | 84.1 | 83.7 | 86.6 | 77.1 | 86.2 | 73.5 | 84.4 | 86.8 | 81.3 |
|  | ZebraLogic | 55.1 | 57.9 | 60.6 | 66.5 | 34.9 | 60.8 | 26.1 | 85.2 | 91.2 | 22.4 |
|  | AGI Eval |  | 77.2 | 79.1 | 81.5 | 78.6 | 83.1 | 69.5 | 87.0 | 90.1 | 81.4 |
| **Coding** | HumanEval+ | 86.3 | 88.2 | 91.4 | 89.9 | 87.4 | 89.7 | 83.0 | 80.2 | 83.7 | 89.7 |
|  | MBPP+ | 63.7 | 63.2 | 63.0 | 64.7 | 61.4 | 66.1 | 63.5 | 69.1 | 63.0 | 61.2 |
|  | LCB v3 | 65.5 | 67.8 | 75.1 | 75.2 | 68.0 | 83.4 | 58.8 | 86.2 | 85.5 | 82.3 |
| **IF** | IFEval | 80.4 | 77.9 | 75.9 | 88.2 | 51.7 | 86.0 | 59.6 | 87.4 | 85.5 | 42.5 |
|  | IFBench | 31.6 | 30.0 | 28.3 | 41.6 | 23.0 | 34.6 | 16.7 | 37.1 | 40.4 | 23.4 |
| **Knowledge** | MMLU | 80.5 | 74.9 | 74.8 | 77.8 | 77.4 | 84.3 | 67.9 | 85.4 | 86.5 | 80.7 |
| **QA** | PopQA | 25.1 | 20.8 | 24.7 | 23.7 | 18.0 | 17.9 | 12.8 | 24.3 | 29.3 | 14.5 |
|  | GPQA | 47.0 | 45.8 | 48.6 | 46.2 | 47.6 | 56.2 | 54.4 | 57.7 | 61.5 | 56.6 |
| **Chat** | AE 2 | 49.0 | 43.9 | 50.6 | 52.1 | 24.0 | 58.0 | 7.7 | 60.5 | 73.5 | 8.6 |
| **Safety** |  |  | 65.8 | 67.7 | 70.7 | 31.3 | 72.1 | 54.0 | 68.3 | 82.9 | 30.3 |

## Model Details

#### SFT
- supervised fine-tuning on the Dolci-Think-SFT-7B dataset. This dataset consits of math, code, chat, and general knowledge queries.
- Datasets: [Dolci-Think-SFT-7B](https://huggingface.co/datasets/allenai/dolci-thinking-sft)

## Inference & Recommended Settings
We evaluated our models on the following settings. We also recommend using them for generation:
- **temperature:** `0.6`
- **top_p:** `0.95`
- **max_tokens:** `32768`

### ONNXRuntime

```py
from transformers import AutoConfig, AutoTokenizer
import onnxruntime
import numpy as np
from huggingface_hub import snapshot_download

# 1. Load config, processor, and model
model_id = "onnx-community/Olmo-Hybrid-Think-SFT-7B-ONNX"
config = AutoConfig.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)

model = "model_q4f16.onnx"
model_folder = snapshot_download(model_id, allow_patterns=[f"onnx/{model}*"])
session = onnxruntime.InferenceSession(f"{model_folder}/onnx/{model}")

## Set config values
num_key_value_heads = config.num_key_value_heads
head_dim = config.hidden_size // config.num_attention_heads
num_hidden_layers = config.num_hidden_layers
eos_token_id = config.eos_token_id

# 2. Prepare inputs
prompt = "Who would win in a fight - a dinosaur or a cow named Moo Moo?"
messages = [{"role": "user", "content": prompt}]
inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, tokenize=True, return_dict=True, return_tensors="np")
input_ids = inputs['input_ids']
attention_mask = inputs['attention_mask']
batch_size = input_ids.shape[0]
cache = {}
for inp in session.get_inputs():
  name = inp.name
  dtype = np.float16 if inp.type == "tensor(float16)" else np.float32
  if name.startswith("past_key_values"):
    cache[name] = np.zeros([batch_size, num_key_value_heads, 0, head_dim], dtype=dtype)
  elif name.startswith("past_conv") or name.startswith("past_recurrent"):
    shape = [batch_size if i == 0 else dim for i, dim in enumerate(inp.shape)]
    assert all(isinstance(dim, int) for dim in shape[1:]), f"Unexpected dynamic cache shape: {inp.shape}"
    cache[name] = np.zeros(shape, dtype=dtype)

# 3. Generation loop
max_new_tokens = 1024
generated_tokens = np.array([[]], dtype=np.int64)
for i in range(max_new_tokens):
  logits, *present_cache_values = session.run(None, dict(
    input_ids=input_ids,
    attention_mask=attention_mask,
    **cache,
  ))

  ## Update values for next generation loop
  input_ids = logits[:, -1].argmax(-1, keepdims=True)
  attention_mask = np.concatenate([attention_mask, np.ones_like(input_ids, dtype=np.int64)], axis=-1)
  for j, key in enumerate(cache):
    cache[key] = present_cache_values[j]
  generated_tokens = np.concatenate([generated_tokens, input_ids], axis=-1)
  if np.isin(input_ids, eos_token_id).any():
    break

  ## (Optional) Streaming
  print(tokenizer.decode(input_ids[0]), end='', flush=True)
print()

# 4. Output result
print(tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0])
```


## Bias, Risks, and Limitations
Like any base language model or fine-tuned model without safety filtering, these models can easily be prompted by users to generate harmful and sensitive content. Such content may also be produced unintentionally, especially in cases involving bias, so we recommend that users consider the risks when applying this technology. Additionally, many statements from OLMo or any LLM are often inaccurate, so facts should be verified.

## License
This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with [Ai2's Responsible Use Guidelines](https://allenai.org/responsible-use).


## Citation
Coming Soon!

## Model Card Contact
For errors in this model card, contact `olmo@allenai.org`.

