# Phi-4 Reasoning Plus ONNX models

## Introduction
This repository hosts the optimized versions of the Phi-4 reasoning plus models to accelerate inference with ONNX Runtime.

Optimized models are published here in ONNX format to run with ONNX Runtime on CPU and GPU across devices, including server platforms, Windows, Linux and Mac desktops, and mobile CPUs, with the precision best suited to each of these targets.

Here are some of the optimized configurations we have added:  

1. ONNX model for int4 CPU: ONNX model for CPU and mobile using int4 quantization via RTN.
2. ONNX model for int4 GPU: ONNX model for GPU using int4 quantization via RTN.

## Model Run
You can see how to run examples with ORT GenAI [here](https://github.com/microsoft/onnxruntime-genai/blob/main/examples/python/phi-3-tutorial.md)

For CPU:

```bash
# Download the model directly using the Hugging Face CLI
huggingface-cli download microsoft/Phi-4-reasoning-plus-onnx --include cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4/* --local-dir .

# Install the CPU package of ONNX Runtime GenAI
pip install --pre onnxruntime-genai

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-qa.py -o model-qa.py
python model-qa.py -m cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4 -e cpu
```

For CUDA:

```bash
# Download the model directly using the Hugging Face CLI
huggingface-cli download microsoft/Phi-4-reasoning-plus-onnx --include gpu/* --local-dir .

# Install the CUDA package of ONNX Runtime GenAI
pip install --pre onnxruntime-genai-cuda

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-qa.py -o model-qa.py
python model-qa.py -m gpu/gpu-int4-rtn-block-32 -e cuda
```

For DirectML:

```bash
# Download the model directly using the Hugging Face CLI
huggingface-cli download microsoft/Phi-4-reasoning-plus-onnx --include gpu/* --local-dir .

# Install the DML package of ONNX Runtime GenAI
onnxruntime-genai-directml

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-qa.py -o model-qa.py
python model-qa.py -m gpu/gpu-int4-rtn-block-32 -e dml
```

## Model Description
- Developed by: Microsoft
- Model type: ONNX
- License: MIT
- Model Description: This is a conversion of the Phi-4 reasoning plus model for ONNX Runtime inference.

**Disclaimer:** Model is only an optimization of the base model, any risk associated with the model is the responsibility of the user of the model. Please verify and test for your scenarios. There may be a slight difference in output from the base model with the optimizations applied.

## Base Model
Phi-4 reasoning plus is a state-of-the-art open model built upon a blend of synthetic datasets, data from filtered public domain websites, and acquired academic books and Q&A datasets. The goal of this approach was to ensure that small capable models were trained with data focused on high quality and advanced reasoning.
See details at [https://huggingface.co/microsoft/Phi-4-reasoning-plus/blob/main/README.md](https://huggingface.co/microsoft/Phi-4-reasoning-plus/blob/main/README.md).