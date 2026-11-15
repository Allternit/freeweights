# Fara-7B ONNX models

## Introduction
This repository hosts the optimized versions of the Fara-7B models to accelerate inference with ONNX Runtime.

Optimized models are published here in ONNX format to run with ONNX Runtime on NPU.

Here are some of the optimized configurations we have added:  

1. ONNX model for int4 NPU: ONNX model for Qualcomm NPU using int4 quantization.

## Model Run
You can see how to run this model with ORT GenAI [here](https://github.com/microsoft/onnxruntime-genai/blob/main/examples/python/model-mm.py).

For NPU:

```bash
# Download the model directly using the Hugging Face CLI
hf download microsoft/Fara-7B-onnx --include npu/qnn-int4/* --local-dir .

# Install ONNX Runtime GenAI
pip install --pre onnxruntime-genai

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-mm.py -o model-mm.py
python model-mm.py -m npu/qnn-int4 --max_length 4096 --use_winml
```

## Model Description
- Developed by: Microsoft
- Model type: ONNX
- License: MIT
- Model Description: This is a conversion of the Fara-7B model for ONNX Runtime inference.

**Disclaimer:** Model is only an optimization of the base model. Any risk associated with the model is the responsibility of the user of the model. Please verify and test for your scenarios. There may be a slight difference in output from the base model with the optimizations applied.