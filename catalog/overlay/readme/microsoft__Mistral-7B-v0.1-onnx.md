#### This is an optimized version of the Mistral 7B model, available on this repository: https://huggingface.co/mistralai/Mistral-7B-v0.1 and under the license on such repository.  Microsoft permits you to use, modify, redistribute, and create derivatives of Microsoft's contributions to the optimized version subject to the restrictions and disclaimers of warranty and liability in license agreement.

# Mistral-7b for ONNX Runtime

## Introduction

This repository hosts the optimized versions of **Mistral-7B-v0.1** to accelerate inference with ONNX Runtime CUDA execution provider.

See the [usage instructions](#usage-example) for how to inference this model with the ONNX files hosted in this repository.

## Model Description

- **Developed by:** MistralAI
- **Model type:** Pretrained generative text model
- **License:** Apache 2.0 License
- **Model Description:** This is a conversion of the [Mistral-7B-v0.1](https://huggingface.co/mistralai/Mistral-7B-v0.1) for [ONNX Runtime](https://github.com/microsoft/onnxruntime) inference with CUDA execution provider.


## Performance Comparison

#### Latency for token generation

Below is average latency of generating a token using a prompt of varying size using NVIDIA A100-SXM4-80GB GPU, taken from the [ORT benchmarking script for Mistral](https://github.com/microsoft/onnxruntime/blob/main/onnxruntime/python/tools/transformers/models/llama/README.md#benchmark-mistral)

| Prompt Length      | Batch Size | PyTorch 2.1 torch.compile    | ONNX Runtime CUDA |
|-------------|------------|----------------|-------------------|
| 32      | 1          | 32.58ms            | 12.08ms           |
| 256      | 1          | 54.54ms            | 23.20ms       |
| 1024     | 1          | 100.6ms        | 77.49ms         |
| 2048     | 1          | 236.8ms       | 144.99ms         |
| 32      | 4          | 63.71ms           | 15.32ms           |
| 256      | 4          | 86.74ms            | 75.94ms         |
| 1024     | 4          | 380.2ms        | 273.9ms           |
| 2048     | 4          | N/A       | 554.5ms          |

## Usage Example

Following the [benchmarking instructions](https://github.com/microsoft/onnxruntime/blob/main/onnxruntime/python/tools/transformers/models/llama/README.md#mistral). Example steps:

1. Clone onnxruntime repository.
```shell
git clone https://github.com/microsoft/onnxruntime
cd onnxruntime
```

2. Install required dependencies
```shell
python3 -m pip install -r onnxruntime/python/tools/transformers/models/llama/requirements-cuda.txt
```

5. Inference using manual model API, or use Hugging Face's ORTModelForCausalLM
```python
from optimum.onnxruntime import ORTModelForCausalLM
from onnxruntime import InferenceSession
from transformers import AutoConfig, AutoTokenizer

sess = InferenceSession("Mistral-7B-v0.1.onnx", providers = ["CUDAExecutionProvider"])
config = AutoConfig.from_pretrained("mistralai/Mistral-7B-v0.1")

model = ORTModelForCausalLM(sess, config, use_cache = True, use_io_binding = True)

tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-v0.1")

inputs = tokenizer("Instruct: What is a fermi paradox?\nOutput:", return_tensors="pt")

outputs = model.generate(**inputs)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```
