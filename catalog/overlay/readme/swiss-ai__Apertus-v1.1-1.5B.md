# Apertus-v1.1-1.5B

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

Instead of standard pre-training, Apertus-v1.1 models were created using pre-training distillation (PD) from the [Apertus-8B-2509](https://huggingface.co/swiss-ai/Apertus-8B-2509) teacher model. They were trained on 1.7T tokens from Phase 5 of the original Apertus data pipeline—the highest quality tier of filtered documents, code, and instruction samples without introducing any new data sources or licenses. 

This model is a **base model** and has not undergone supervised fine-tuning (SFT) or alignment. It is well-suited for further fine-tuning on specific downstream tasks.

### Key features
- **Fully open model**: open weights + open data + full training details including all data and training recipes
- **Massively Multilingual**: 1811 natively supported languages
- **Compliant** Apertus is trained while respecting opt-out consent of data owners (even retrospectively), and avoiding memorization of training data
- **Cost-Effective Distillation**: Trained using a 90%/10% mix of KL-Divergence and label cross-entropy derived from the 8B teacher model, drastically reducing the required compute.

### Quantized Checkpoints

This model family includes base pre-trained models and instruction-tuned models. The full list of released checkpoints across the family is shown below:

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

As this is a base model, it does not support chat templates. You can use it for standard text completion tasks. The modeling code is available in transformers `v4.56.0` and later, so make sure to upgrade your transformers version. 
```bash
pip install -U transformers
```

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "swiss-ai/Apertus-v1.1-1.5B"
device = "cuda"  # for GPU usage or "cpu" for CPU usage

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
).to(device)

# prepare the model input
prompt = "In simple terms, gravity is"
model_inputs = tokenizer([prompt], return_tensors="pt").to(model.device)

# Generate the output
generated_ids = model.generate(**model_inputs, max_new_tokens=100)

# Get and decode the output
print(tokenizer.decode(generated_ids[0], skip_special_tokens=True))
```

---

## Evaluation

**Pre-Training Multilingual Evaluation:** Performance of the base Apertus-v1.1 models across multilingual benchmarks compared to base models in similar size classes.

| **Model** | **Avg** | **ARC** | **HellaSwag** | **WinoGrande** | **XNLI** | **XCOPA** | **PIQA** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Apertus-v1.1-0.5B** | 51.79 | 44.96 | 40.42 | 57.06 | 41.51 | 55.49 | 71.27 |
| **Apertus-v1.1-1.5B** | 56.66 | 52.66 | 48.31 | 61.72 | 42.94 | 59.76 | 74.54 |
| **Apertus-v1.1-4B** | 61.53 | 61.15 | 53.51 | 67.48 | 45.03 | 63.82 | 78.18 |
| **Apertus-8B** | 64.96 | 71.66 | 59.62 | 69.30 | 44.09 | 65.69 | 79.38 |
| EuroLLM-1.7B | 54.03 | 50.80 | 45.01 | 59.51 | 40.88 | 55.76 | 72.20 |
| SmolLM2-1.7B | 58.00 | 60.23 | 53.38 | 66.22 | 37.57 | 53.51 | 77.10 |
| SmolLM-3B-Base | 60.88 | 64.45 | 56.37 | 68.43 | 40.28 | 58.02 | 77.75 |
| Qwen3-0.6B-Base | 52.23 | 48.35 | 41.01 | 59.20 | 39.55 | 54.96 | 70.29 |
| Qwen3-1.7B-Base | 57.51 | 56.49 | 49.36 | 63.38 | 41.66 | 58.35 | 75.79 |
| Qwen3-4B-Base | 62.14 | 64.99 | 54.56 | 70.48 | 43.00 | 61.82 | 77.97 |

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
