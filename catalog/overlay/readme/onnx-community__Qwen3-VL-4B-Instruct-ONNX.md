# Qwen3-VL-4B-Instruct ONNX models

## Introduction
This repository hosts the optimized versions of the Qwen3-VL-4B-Instruct models to accelerate inference with ONNX Runtime.

Optimized models are published here in ONNX format to run with ONNX Runtime on CPU and GPU across devices with the precision best suited to each of these targets.

Here are some of the optimized configurations we have added:  

1. ONNX model for int4 CPU: ONNX model for CPU and mobile using int4 quantization via RTN.
2. ONNX model for int4 CUDA: ONNX model for CUDA using int4 quantization via RTN.

## Model Create
You can see how to create the ONNX models by following the Olive recipes [here](https://github.com/microsoft/olive-recipes/tree/main/Qwen-Qwen3-VL-4B-Instruct) for your target hardware.

## Model Run
You can see how to run the examples with ORT GenAI [here](https://github.com/microsoft/onnxruntime-genai/blob/main/examples/python/model-mm.py).

For CPU:

```bash
# Download the model directly using the Hugging Face CLI
hf download onnx-community/Qwen3-VL-4B-Instruct-ONNX --include onnxruntime/cpu_and_mobile/cpu-int4-rtn-block-32/* --local-dir .

# Install the CPU package of ONNX Runtime GenAI
pip install --pre onnxruntime-genai

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-mm.py -o model-mm.py
python model-mm.py -m onnxruntime/cpu_and_mobile/cpu-int4-rtn-block-32/ -e cpu
```

For CUDA:

```bash
# Download the model directly using the Hugging Face CLI
hf download onnx-community/Qwen3-VL-4B-Instruct-ONNX --include onnxruntime/cuda/cuda-int4-rtn-block-32/* --local-dir .

# Install the CUDA package of ONNX Runtime GenAI
pip install --pre onnxruntime-genai-cuda

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-mm.py -o model-mm.py
python model-mm.py -m onnxruntime/cuda/cuda-int4-rtn-block-32/ -e cuda
```

## Model Description
- Developed by: Microsoft
- Model type: ONNX
- License: Apache 2.0
- Model Description: This is a conversion of the Qwen3-VL-4B-Instruct models for ONNX Runtime inference.

**Disclaimer:** Model is only an optimization of the base model. Any risk associated with the model is the responsibility of the user of the model. Please verify and test for your scenarios. There may be a slight difference in output from the base model with the optimizations applied.
