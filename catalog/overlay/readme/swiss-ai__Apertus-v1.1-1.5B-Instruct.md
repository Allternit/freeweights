# Apertus-v1.1-1.5B-Instruct

![image/jpeg](https://cdn-uploads.huggingface.co/production/uploads/6639f08490b7db8dcbf1a2aa/YKux3SpTciL4O60L3Ol-6.jpeg)

##  Table of Contents

1. [Model Summary](#model-summary)
2. [How to use](#how-to-use)
3. [Evaluation](#evaluation)
4. [Training](#training)
5. [Limitations](#limitations)
6. [Legal Aspects](#legal-aspects)

---

## Model Summary

Apertus-v1.1 is a series of highly efficient, 0.5-4B billion parameter language models designed to extend the fully-open and compliant Apertus ecosystem to highly constrained hardware environments. 

The models rely on a dense transformer architecture featuring grouped-query attention and xIELU activations.

Instead of standard pre-training, Apertus-v1.1 models were created using pre-training distillation (PD) from the [Apertus-8B-2509](https://huggingface.co/swiss-ai/Apertus-8B-2509) teacher model. They were trained on 1.7T tokens from Phase 5 of the original Apertus data pipeline—the highest quality tier of filtered documents, code, and instruction samples without introducing any new data sources or licenses. Post-training included supervised fine-tuning (SFT) and alignment similar to that of the original Apertus.

### Key features
- **Fully open model**: open weights + open data + full training details including all data and training recipes
- **Massively Multilingual**: 1811 natively supported languages
- **Compliant** Apertus is trained while respecting opt-out consent of data owners (even retrospectively), and avoiding memorization of training data
- **Cost-Effective Distillation**: Trained using a 90%/10% mix of KL-Divergence and label cross-entropy derived from the 8B teacher model, drastically reducing the required compute.
- **Hardware Optimized**: Specifically optimized for memory-limited scenarios like mobile and edge deployments, with quantized checkpoints available for Apple devices (MLX) in INT2, INT3, INT4, and INT6 formats.

### Quantized Checkpoints

This model family includes base pre-trained models and instruction-tuned models.

For instruction-tuned models, we additionally provide high-quality quantization-aware distillation (QAD) checkpoints, obtained via the official [`qat-suite`](https://github.com/swiss-ai/qat-suite). We provide FP8 and NVFP4A16 checkpoints with vLLM inference in mind and INT3-6 checkpoints optimized for mobile usage on Apple devices.

The full list of released checkpoints is shown below:

|   | BF16 | BF16 | FP8 | NVFP4A16 | INT3 | INT4 | INT6 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|   | Base | Instruct | Instruct | Instruct | Instruct | Instruct | Instruct |
| **0.5B** | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct-vLLM-FP8) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct-vLLM-NVFP4A16) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct-MLX-INT3) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct-MLX-INT4) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-0.5B-Instruct-MLX-INT6) |
| **1.5B** | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct-vLLM-FP8) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct-vLLM-NVFP4A16) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct-MLX-INT3) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct-MLX-INT4) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct-MLX-INT6) |
| **4B** | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-4B) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct-vLLM-FP8) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct-vLLM-NVFP4A16) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct-MLX-INT3) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct-MLX-INT4) | [✅](https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct-MLX-INT6) |
| **8B** | [✅](https://huggingface.co/swiss-ai/Apertus-8B-2509) | [✅](https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509) | [✅](https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509-vLLM-FP8) | [✅](https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509-vLLM-NVFP4A16) | ❌ | [✅](https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509-MLX-INT4) | ❌ |


For more details refer to the original Apertus [technical report](https://arxiv.org/abs/2509.14233) and the new Apertus [distillation technical report](https://arxiv.org/abs/2605.29128).

---

## How to use

The modeling code for Apertus is available in transformers `v4.56.0` and later, so make sure to upgrade your transformers version. You can also load the model with the latest `vLLM` which uses transformers as a backend.
```bash
pip install -U transformers
```

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "swiss-ai/Apertus-v1.1-1.5B-Instruct"
device = "cuda"  # for GPU usage or "cpu" for CPU usage

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
).to(device)

# prepare the model input
prompt = "Give me a brief explanation of gravity in simple terms."
messages_think = [
    {"role": "user", "content": prompt}
]

text = tokenizer.apply_chat_template(
    messages_think,
    tokenize=False,
    add_generation_prompt=True,
)
model_inputs = tokenizer([text], return_tensors="pt", add_special_tokens=False).to(model.device)

# Generate the output
generated_ids = model.generate(**model_inputs, max_new_tokens=32768)

# Get and decode the output
output_ids = generated_ids[0][len(model_inputs.input_ids[0]) :]
print(tokenizer.decode(output_ids, skip_special_tokens=True))
```

>[!TIP]
> We recommend setting `temperature=0.8` and `top_p=0.9` in the sampling parameters.

---

## Evaluation

**Post-Training Multilingual Evaluation:** Performance of the Apertus-v1.1 models across multilingual benchmarks compared to models in similar size classes.

| *Model* | *Average* | MMLU | TruthfulQA | Arc | IF | LogiQA |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Apertus-v1.1-0.5B-Instruct** | 0.318 | 0.258 | 0.461 | 0.225 | 0.328 | 0.279 |
| **Apertus-v1.1-1.5B-Instruct** | 0.382 | 0.377 | 0.451 | 0.266 | 0.434 | 0.276 |
| **Apertus-v1.1-4B-Instruct** | 0.473 | 0.504 | 0.506 | 0.332 | 0.550 | 0.296 |
| **Apertus-8B-Instruct-2509** | 0.534 | 0.553 | 0.524 | 0.368 | 0.689 | 0.290 |
| EuroLLM-1.7B-Instruct | 0.291 | 0.260 | 0.433 | 0.250 | 0.222 | 0.269 |
| EuroLLM-9B-Instruct | 0.480 | 0.520 | 0.465 | 0.322 | 0.613 | 0.345 |
| gemma-3-270m-it | 0.289 | 0.242 | 0.465 | 0.215 | 0.236 | 0.205 |
| gemma-3-1b-it | 0.406 | 0.409 | 0.457 | 0.250 | 0.509 | 0.379 |
| gemma-3-4b-it | 0.497 | 0.547 | 0.492 | 0.316 | 0.635 | 0.411 |
| SmolLM2-1.7B-Instruct | 0.348 | 0.365 | 0.452 | 0.213 | 0.364 | 0.246 |
| SmolLM3-3B | 0.479 | 0.507 | 0.500 | 0.270 | 0.637 | 0.365 |
| Qwen3-0.6B | 0.401 | 0.377 | 0.464 | 0.222 | 0.541 | 0.353 |
| Qwen3-1.7B | 0.457 | 0.477 | 0.490 | 0.251 | 0.611 | 0.414 |
| Qwen3-4B | 0.521 | 0.581 | 0.497 | 0.274 | 0.733 | 0.500 |

While Apertus-v1.1 demonstrates competitive baseline multilingual chatting performance, it may lack in specific capabilities such as advanced math and complex instruction following.

---

## Training

### Model Architecture

**Apertus-v1.1-1.5B**

* **Architecture Type:** Dense transformer decoder with grouped-query attention.
* **Layers:** 16.
* **Model Dimension:** 2048.
* **MLP Dimension:** 12288.
* **Heads (Q/KV):** 32/8.
* **Tied Embeddings:** No.
* **Activation Function:** xIELU.
* **Compute / Storage Size:** 1.5B/2.0B parameters.

### Pre-Training Details

* **Training Tokens:** 1.7T.
* **Optimizer:** AdEMAMix with WSD schedule and weight decay.
* **Sequence Handling:** Documents packed into chunks of 4096 tokens with cross-document attention masked.
* **Total Compute:** 0.8E22 FLOPs.

### Software & hardware

- **GPUs:** 64 GH200
- **Pre-Training Distillation Framework:** [Megatron-LM](https://github.com/swiss-ai/Megatron-LM-Distill)
- **Post-Training Framework:** [posttraining](https://github.com/swiss-ai/posttraining)
- **Quantization Suite:** [qat-suite](https://github.com/swiss-ai/qat-suite)

### Open resources
All elements used in the training process are made openly available
- **Training data reconstruction scripts:** [github.com/swiss-ai/pretrain-data](https://github.com/swiss-ai/pretrain-data)

---

## Limitations

Apertus can produce text on a variety of topics, but the generated content may not always be factually accurate, logically consistent, or free from biases present in the training data. These models should be used as assistive tools rather than definitive sources of information. Users should always verify important information and critically evaluate any generated content.

---

## Legal Aspects

The Apertus-v1.1 fully reuses the data of the original Apertus release, meaning the original data summary is representative of this release as well.

#### EU AI Act Transparency Documentation and Code of Practice
- [Apertus_EU_Public_Summary.pdf](https://huggingface.co/swiss-ai/Apertus-70B-2509/blob/main/Apertus_EU_Public_Summary.pdf)
- [Apertus_EU_Code_of_Practice.pdf](https://huggingface.co/swiss-ai/Apertus-70B-2509/blob/main/Apertus_EU_Code_of_Practice.pdf)

#### Data Protection and Copyright Requests
For removal requests of personally identifiable information (PII) or of copyrighted content, please contact the respective dataset owners or us directly
- llm-privacy-requests@swiss-ai.org
- llm-copyright-requests@swiss-ai.org
  
#### Output Filter for PII
- Currently no output filter is provided.
- Please check this site regularly for an output filter that can be used on top of the Apertus LLM. The filter reflects data protection deletion requests which have been addressed to us as the developer of the Apertus LLM. It allows you to remove Personal Data contained in the model output. We strongly advise downloading and applying this output filter from this site every six months.

## Contact
To contact us, please send an email to
llm-requests@swiss-ai.org

## Citation
```bash
@misc{panferov2026apertusllmfamilyexpansion,
      title={Apertus LLM Family Expansion via Distillation and Quantization}, 
      author={Andrei Panferov and Davit Melikidze and Martin Jaggi and Dan Alistarh},
      year={2026},
      eprint={2605.29128},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={[https://arxiv.org/abs/2605.29128](https://arxiv.org/abs/2605.29128)}, 
}
```
