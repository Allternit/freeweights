<div align="center">
<img src="https://github.com/OpenBMB/MiniCPM/blob/main/assets/minicpm_logo.png?raw=true" width="500em" ></img> 
</div>

<p align="center">
<a href="https://github.com/OpenBMB/MiniCPM/" target="_blank">GitHub Repo</a> |
<a href="https://github.com/OpenBMB/MiniCPM/blob/main/docs/BitCPM_CANN.pdf" target="_blank">Technical Report</a> 
</p>
<p align="center">
👋 Join us on <a href="https://discord.gg/3cGQn9b3YM" target="_blank">Discord</a> and <a href="https://github.com/OpenBMB/MiniCPM/blob/main/assets/wechat.jpg" target="_blank">WeChat</a>
</p>

> **This repository hosts the GGUF (llama.cpp) quantized version of [BitCPM-CANN-3B](https://huggingface.co/openbmb/BitCPM-CANN-3B/).** For the pseudo-quantized weights and the full model card, please refer to [BitCPM-CANN-3B](https://huggingface.co/openbmb/BitCPM-CANN-3B/).


## Introduction

BitCPM-CANN is the first end-to-end 1.58-bit (ternary) large language model training system natively built on Huawei Ascend NPU. The system integrates quantization-aware training (QAT) into the Megatron-LM framework with MindSpeed acceleration, covering the full training stack from custom ternary operators to distributed parallel training on Ascend 910B.

We train a family of four models—BitCPM-CANN-0.5B/1B/3B/8B—and evaluate them against their full-precision MiniCPM4 counterparts across 11 benchmarks. The 1B/3B/8B models retain **95.7%–97.2%** of full-precision performance, while enabling approximately **6× memory reduction** at inference time. QAT introduces only **5% training throughput overhead** (148 vs. 155 TFLOP/s per NPU).

### Key Features

- 🔬 **1.58-Bit Ternary Quantization**: Compresses model weights to ternary values {-1, 0, 1}, achieving ~90% bit-width reduction compared to BF16.
- 🖥️ **Native Ascend NPU Training**: First publicly reported 1.58-bit training effort on domestic NPU platform at 8B scale, establishing reusable low-bit training infrastructure for the Ascend ecosystem.
- ⚡ **Minimal Training Overhead**: Only 5% throughput degradation compared to full-precision training on Ascend 910B.
- 📦 **~6× Inference Memory Reduction**: Enables longer contexts, more serving replicas, and edge deployment on consumer devices.

### Important Note

> The models in this repository are in **pseudo-quantized (fake quantization) format**. This means the weights are stored in standard floating-point format with ternary values already applied during training. You can load and run inference with these models **exactly the same way as full-precision models**—no special quantization libraries or custom kernels are required.

## BitCPM-CANN Model Family

| Model | HuggingFace | GGUF |
|-------|-------------|------|
| BitCPM-CANN-0.5B | [openbmb/BitCPM-CANN-0.5B](https://huggingface.co/openbmb/BitCPM-CANN-0.5B) | [openbmb/BitCPM-CANN-0.5B-gguf](https://huggingface.co/openbmb/BitCPM-CANN-0.5B-gguf) |
| BitCPM-CANN-1B | [openbmb/BitCPM-CANN-1B](https://huggingface.co/openbmb/BitCPM-CANN-1B) | [openbmb/BitCPM-CANN-1B-gguf](https://huggingface.co/openbmb/BitCPM-CANN-1B-gguf) |
| BitCPM-CANN-3B | [openbmb/BitCPM-CANN-3B](https://huggingface.co/openbmb/BitCPM-CANN-3B) | [openbmb/BitCPM-CANN-3B-gguf](https://huggingface.co/openbmb/BitCPM-CANN-3B-gguf) |
| BitCPM-CANN-8B | [openbmb/BitCPM-CANN-8B](https://huggingface.co/openbmb/BitCPM-CANN-8B) | [openbmb/BitCPM-CANN-8B-gguf](https://huggingface.co/openbmb/BitCPM-CANN-8B-gguf) |

## Usage

### Inference with Transformers

Since BitCPM-CANN models are in pseudo-quantized format, you can use them exactly like standard full-precision models:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
torch.manual_seed(0)

path = 'openbmb/BitCPM-CANN-0.5B'
device = "cuda"
tokenizer = AutoTokenizer.from_pretrained(path)
model = AutoModelForCausalLM.from_pretrained(path, torch_dtype=torch.bfloat16, device_map=device, trust_remote_code=True)

# User can directly use the chat interface
responds, history = model.chat(tokenizer, "Write an article about Artificial Intelligence.", temperature=0.7, top_p=0.7)
print(responds)

# User can also use the generate interface
# messages = [
#     {"role": "user", "content": "Write an article about Artificial Intelligence."},
# ]
# prompt_text = tokenizer.apply_chat_template(
#     messages,
#     tokenize=False,
#     add_generation_prompt=True,
# )
# model_inputs = tokenizer([prompt_text], return_tensors="pt").to(device)

# model_outputs = model.generate(
#     **model_inputs,
#     max_new_tokens=1024,
#     top_p=0.7,
#     temperature=0.7
# )
# output_token_ids = [
#     model_outputs[i][len(model_inputs[i]):] for i in range(len(model_inputs['input_ids']))
# ]

# responses = tokenizer.batch_decode(output_token_ids, skip_special_tokens=True)[0]
# print(responses)
```

## Evaluation Results

### Main Results

BitCPM-CANN models are evaluated against their full-precision MiniCPM4 counterparts across 11 benchmarks spanning commonsense reasoning, domain knowledge, and mathematics & reasoning.


| Task | 8B FP | 8B Ternary | 3B FP | 3B Ternary | 1B FP | 1B Ternary | 0.5B FP | 0.5B Ternary |
|------|-------|------------|-------|------------|-------|------------|---------|--------------|
| ARC-c | 87.46 | 86.10 | 80.34 | 78.98 | 64.41 | 67.12 | 51.86 | 50.51 |
| ARC-e | 95.06 | 93.47 | 92.77 | 88.36 | 79.89 | 79.01 | 71.78 | 65.08 |
| BoolQ | 84.89 | 83.39 | 79.85 | 77.89 | 68.38 | 65.50 | 62.29 | 43.55 |
| PIQA | 80.52 | 78.78 | 70.57 | 72.69 | 66.16 | 65.45 | 60.99 | 58.49 |
| WinoGrande | 63.30 | 61.17 | 58.41 | 52.96 | 51.62 | 53.28 | 51.07 | 51.54 |
| CMMLU | 80.62 | 78.92 | 78.11 | 76.53 | 74.57 | 67.42 | 65.22 | 60.49 |
| C-Eval | 81.36 | 77.50 | 75.85 | 75.89 | 73.25 | 65.96 | 66.11 | 60.74 |
| MMLU | 75.83 | 70.65 | 66.95 | 64.41 | 57.71 | 57.71 | 55.55 | 50.73 |
| MMLU-Redux | 77.14 | 69.85 | 65.82 | 60.07 | 54.80 | 54.16 | 48.00 | 43.79 |
| BBH | 76.72 | 70.70 | 68.29 | 68.30 | 64.40 | 60.40 | 49.87 | 47.44 |
| GSM8K | 91.51 | 85.75 | 81.64 | 79.45 | 63.15 | 61.56 | 52.08 | 39.42 |
| **Average (11 tasks)** | **81.31** | **77.84** | **74.42** | **72.32** | **65.30** | **63.42** | **57.71** | **51.98** |
| **Retention** | | **95.7%** | | **97.2%** | | **97.1%** | | **90.1%** |

### Key Observations

- **1B and above achieve ≥95.7% retention**: The 3B model achieves the highest retention at 97.2%, demonstrating that ternary QAT at this scale introduces minimal capability loss.
- **0.5B reveals scale-dependent sensitivity**: The smallest model retains 90.1%, indicating that quantization perturbation is more damaging when model capacity is limited.
- **1:1 alignment with MiniCPM4**: The matched evaluation enables direct substitution decisions—deployments can replace specific full-precision models with their ternary counterparts with clearly quantified trade-offs.

### Training Efficiency

| Configuration | TFLOP/s per NPU | Overhead |
|---------------|-----------------|----------|
| Full-precision | 155 | — |
| Ternary QAT | 148 | 4.5% |

System-level throughput on 2-node 16-card Ascend 910B:
- 3B model: ~2700 tokens/s per card
- 8B model: ~1340 tokens/s per card

## Technical Approach

BitCPM-CANN uses a ternary quantizer that maps each weight group to {-1, 0, 1} scaled by a group-wise factor, trained with Straight-Through Estimator (STE) for gradient flow. The training follows a two-stage strategy: **complete QAT followed by post-training distillation**, which avoids amplifying training instability during early training.

The system is built as a four-layer vertical stack on Ascend NPU:
1. **QAT Training Logic**: Ternary quantizer with STE, pluggable quantization layers in Megatron-LM.
2. **Megatron-LM Quantized Model Layer**: Tensor-parallel linear layers with integrated weight/activation quantizers.
3. **Framework Entry Layer**: `torch_npu` and `mindspeed.megatron_adaptor` injection for NPU execution.
4. **Ascend Software-Hardware Stack**: MindSpeed, CANN, HCCL communication, Ascend 910B NPU hardware.

For full technical details, please refer to our [Technical Report](https://github.com/OpenBMB/MiniCPM/blob/main/docs/BitCPM_CANN.pdf).

## Statement
- As a language model, BitCPM-CANN generates content by learning from a vast amount of text. 
- However, it does not possess the ability to comprehend or express personal opinions or value judgments. 
- Any content generated by BitCPM-CANN does not represent the viewpoints or positions of the model developers. 
- Therefore, when using content generated by BitCPM-CANN, users should take full responsibility for evaluating and verifying it on their own.

## LICENSE
- This repository and BitCPM-CANN models are released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License. 

## Citation
- Please cite our technical report if you find our work valuable.

```bibtex
@article{bitcpmcann,
  title={{BitCPM-CANN}: Native 1.58-Bit Large Language Model Training on Ascend NPU},
  author={BitCPM Team},
  year={2026}
}
```
