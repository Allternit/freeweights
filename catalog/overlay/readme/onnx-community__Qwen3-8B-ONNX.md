## Qwen3-8B ONNX Models
This repository hosts the optimized versions of [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) to accelerate inference with ONNX Runtime. Model optimizations refer to techniques and methods used to improve the runtime performance, efficiency, and resource utilization of machine learning models.

Optimized models are published here in [ONNX](https://onnx.ai) format to run with [ONNX Runtime](https://onnxruntime.ai) with the precision best suited to this target.

Here are some of the optimized configurations we have added:

1. ONNX model for CPU and mobile using int4 quantization via KLD gradient and block size 128.

2. ONNX model for CUDA using int4 quantization via KLD gradient and block size 128.

3. ONNX model for WebGPU using int4 quantization via KLD gradient and block size 32.

## Model Create
You can see how to create the ONNX models by following the Olive recipes [here](https://github.com/microsoft/olive-recipes/tree/main/Qwen-Qwen3-8B) for your target hardware.

## Model Run
You can install [ONNX Runtime GenAI](https://onnxruntime.ai/docs/genai/) to run the model. You can then run the inference example [here](https://github.com/microsoft/onnxruntime-genai/blob/main/examples/python/model-chat.py).

For CPU:

```bash
# Download the model directly using the Hugging Face CLI
hf download onnx-community/Qwen3-8B-ONNX --include onnxruntime/cpu_and_mobile/cpu-int4-kld-block-128/* --local-dir .

# Install the CPU package of ONNX Runtime GenAI
pip install onnxruntime-genai

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-chat.py -o model-chat.py
python model-chat.py -m onnxruntime/cpu_and_mobile/cpu-int4-kld-block-128/ -e follow_config
```

For CUDA:

```bash
# Download the model directly using the Hugging Face CLI
hf download onnx-community/Qwen3-8B-ONNX --include onnxruntime/cuda/cuda-int4-kld-block-128/* --local-dir .

# Install the CUDA package of ONNX Runtime GenAI
pip install onnxruntime-genai-cuda

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-chat.py -o model-chat.py
python model-chat.py -m onnxruntime/cuda/cuda-int4-kld-block-128 -e follow_config
```

For WebGPU:

```bash
# Download the model directly using the Hugging Face CLI
hf download onnx-community/Qwen3-8B-ONNX --include onnxruntime/webgpu/webgpu-int4-kld-block-32/* --local-dir .

# Install the WebGPU packages of ONNX Runtime and ONNX Runtime GenAI
pip install onnxruntime-webgpu
pip install onnxruntime-genai --no-deps

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-chat.py -o model-chat.py
python model-chat.py -m onnxruntime/webgpu/webgpu-int4-kld-block-32 -e follow_config
```

## Model Description

- **Developed by:** Microsoft
- **Model type:** ONNX
- **License:** Apache 2.0
- **Model Description:** This is a conversion of the Qwen3-8B model for local inference on CPUs and GPUs.
- **Disclaimer:** Model is only an optimization of the base model. Any risk associated with the model is the responsibility of the user of the model. Please verify and test for your scenarios. There may be a slight difference in output from the base model with the optimizations applied. Note that optimizations applied are distinct from fine tuning and thus do not alter the intended uses or capabilities of the model.
