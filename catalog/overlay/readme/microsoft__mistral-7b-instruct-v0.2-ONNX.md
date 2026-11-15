# Mistral-7B-Instruct-v0.2 ONNX models

<!-- Provide a quick summary of what the model is/does. -->
This repository hosts the optimized versions of [Mistral-7B-Instruct-v0.2](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2) to accelerate inference with ONNX Runtime.

The Mistral-7B-Instruct-v0.2 Large Language Model (LLM) is an instruct fine-tuned version of the Mistral-7B-v0.2.

Optimized Mistral models are published here in [ONNX](https://onnx.ai) format to run with [ONNX Runtime](https://onnxruntime.ai/) on CPU and GPU across devices, including server platforms and Windows, Linux, and Mac desktops, with the precision best suited to each of these targets.

[DirectML](https://aka.ms/directml) support lets developers bring hardware acceleration to Windows devices at scale across AMD, Intel, and NVIDIA GPUs. Along with DirectML, ONNX Runtime provides cross platform support for Mistral across a range of devices for CPU and GPU.

To easily get started with Mistral, you can use [Olive](https://github.com/microsoft/Olive), our easy-to-use, hardware-aware model optimization tool. See [here](https://github.com/microsoft/Olive/tree/main/examples/mistral) for instructions on how to run it with Mistral.

## ONNX Models 

Here are some of the optimized configurations we have added:  

1. ONNX model for int4 DML: ONNX model for AMD, Intel, and NVIDIA GPUs on Windows, quantized to int4 using [AWQ](https://arxiv.org/abs/2306.00978).
2. ONNX model for fp16 CUDA: ONNX model you can use to run for your NVIDIA GPUs.
3. ONNX model for int4 CUDA: ONNX model for NVIDIA GPUs using int4 quantization via RTN.
4. ONNX model for int4 CPU: ONNX model for your CPU, using int4 quantization via RTN.

## Hardware Supported

The models are tested on:
- GPU SKU: RTX 4090 (DirectML)
- GPU SKU: 1 A100 80GB GPU, SKU: Standard_ND96amsr_A100_v4 (CUDA)
- CPU SKU: Standard F64s v2 (64 vcpus, 128 GiB memory)

Minimum Configuration Required:
- Windows: DirectX 12-capable GPU and a minimum of 4GB of combined RAM
- CUDA: Streaming Multiprocessors (SMs) >= 70 (i.e. V100 or newer)

### Model Description

- **Developed by:**  Microsoft
- **Model type:** ONNX
- **Language(s) (NLP):** Python, C, C++
- **License:** Apache License Version 2.0
- **Model Description:** This is a conversion of the Mistral-7B-Instruct-v0.2 model for ONNX Runtime inference.

## Additional Details
- [**Mistral Model Announcement Link**](https://mistral.ai/news/announcing-mistral-7b/)
- [**Mistral Model Card**](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2)
- [**Mistral Technical Report**](https://arxiv.org/abs/2310.06825)

## Appendix

### Activation Aware Quantization

AWQ works by identifying the top 1% most salient weights that are most important for maintaining accuracy and quantizing the remaining 99% of weights. This leads to less accuracy loss from quantization compared to many other quantization techniques. For more on AWQ, see [here](https://arxiv.org/abs/2306.00978).


## Model Card Contact
sschoenmeyer, sunghcho, kvaishnavi
