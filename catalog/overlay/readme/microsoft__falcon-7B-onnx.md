#### This is an optimized version of the Falcon 7B model, available on this repository: https://huggingface.co/tiiuae/falcon-7b and under the license on such repository.  Microsoft permits you to use, modify, redistribute and create derivatives of Microsoft's contributions to the optimized version subject to the restrictions and disclaimers of warranty and liability in license agreement.
# falcon-7b for ONNX Runtime

## Introduction

This repository hosts the optimized version of **falcon-7b** to accelerate inference with ONNX Runtime CUDA execution provider.

See the [usage instructions](#usage-example) for how to inference this model with the ONNX files hosted in this repository.

## Model Description

- **Developed by:** TIIUAE
- **Model type:** Pretrained generative text model
- **License:** Apache 2.0 License
- **Model Description:** This is a conversion of the [falcon-7b](https://huggingface.co/tiiuae/falcon-7b) for [ONNX Runtime](https://github.com/microsoft/onnxruntime) inference with CUDA execution provider.


## Performance Comparison

#### Latency for token generation

Below is average latency of generating a token using a prompt of varying size using NVIDIA A100-SXM4-80GB GPU:

| Prompt Length      | Batch Size | PyTorch 2.1 torch.compile    | ONNX Runtime CUDA |
|-------------|------------|----------------|-------------------|
| 32      | 1          | 53.64ms            | 15.68ms           |
| 256      | 1          | 59.55ms            | 26.05ms       |
| 1024     | 1          | 89.82ms        | 99.05ms          |
| 2048     | 1          | 208.0ms      | 227.0ms         |
| 32      | 4          | 70.8ms            | 19.62ms           |
| 256      | 4          | 78.6ms            | 81.29ms       |
| 1024     | 4          | 373.7ms        | 369.6ms           |
| 2048     | 4          | N/A       | 879.2ms          |

## Usage Example

1. Clone onnxruntime repository.
```shell
git clone https://github.com/microsoft/onnxruntime
cd onnxruntime
```

2. Install required dependencies
```shell
python3 -m pip install -r onnxruntime/python/tools/transformers/models/llama/requirements-cuda.txt
```

5. Inference using custom model API, or use Hugging Face's ORTModelForCausalLM
```python
from optimum.onnxruntime import ORTModelForCausalLM
from onnxruntime import InferenceSession
from transformers import AutoConfig, AutoTokenizer

sess = InferenceSession("falcon-7b.onnx", providers = ["CUDAExecutionProvider"])
config = AutoConfig.from_pretrained("tiiuae/falcon-7b")

model = ORTFalconForCausalLM(sess, config, use_cache = True, use_io_binding = True)

tokenizer = AutoTokenizer.from_pretrained("tiiuae/falcon-7b")

inputs = tokenizer("Instruct: What is a fermi paradox?\nOutput:", return_tensors="pt")

outputs = model.generate(**inputs)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

