# Phi-3 Small-8K-Instruct ONNX CUDA models

<!-- Provide a quick summary of what the model is/does. -->
This repository hosts the optimized versions of [Phi-3-small-8k-instruct](https://aka.ms/phi3-Small-8k-instruct) to accelerate inference with ONNX Runtime for your machines with NVIDIA GPUs.

Phi-3 Small is a 7B parameter, lightweight, state-of-the-art open model trained with the Phi-3 datasets, which include both synthetic data and filtered publicly available website data, with a focus on high-quality and reasoning-dense properties. The model belongs to the Phi-3 family with the small version in two variants: [8K](https://huggingface.co/microsoft/Phi-3-small-8k-instruct) and [128K](https://huggingface.co/microsoft/Phi-3-small-128k-instruct), which are the context lengths (in tokens) that they can support.

The base model has undergone a post-training process that incorporates both supervised fine-tuning and direct preference optimization for the instruction following and safety measures. When assessed against benchmarks testing common sense, language understanding, math, code, long context, and logical reasoning, Phi-3-Small-8K-Instruct showcased a robust and state-of-the-art performance among models of the same-size and next-size-up.

Optimized variants of the Phi-3 Small models are published here in [ONNX](https://onnx.ai) format and run with [ONNX Runtime](https://onnxruntime.ai/) on GPU across devices, including server platforms, Windows, and Linux.

## ONNX Models 

Here are some of the optimized configurations we have added:  
1. ONNX model for FP16 CUDA: ONNX model for NVIDIA GPUs.
2. ONNX model for INT4 CUDA: ONNX model for NVIDIA GPUs using int4 quantization via RTN.

Note: Using the Hugging Face CLI, you can download sub folders and not all models if you are limited on disk space. The FP16 model is recommended for larger batch sizes, while the INT4 model optimizes performance for lower batch sizes.

Example:
```
# Download just the FP16 model
$ huggingface-cli download microsoft/Phi-3-small-8k-instruct-onnx-cuda --include cuda-fp16/* --local-dir .  --local-dir-use-symlinks False
```

## How to Get Started with the Model
To support the Phi-3 models across a range of devices, platforms, and EP backends, we introduce a new API to wrap several aspects of generative AI inferencing. This API makes it easy to drag and drop LLMs straight into your app. To run the early version of these models with ONNX, follow the steps [here](http://aka.ms/generate-tutorial).

## Hardware Supported

The ONNX models are tested on:
- 1 A100 GPU, SKU: Standard_ND96amsr_A100_v4 (CUDA)

Minimum Configuration Required:
- CUDA: NVIDIA GPU with [Compute Capability](https://developer.nvidia.com/cuda-gpus) >= 7.5

### Model Description

- **Developed by:**  Microsoft
- **Model type:** ONNX
- **Language(s) (NLP):** Python, C, C++
- **License:** MIT
- **Model Description:** This is a conversion of the Phi-3 Small-8K-Instruct model for ONNX Runtime inference.

## Additional Details
- [**Phi-3 Small, Medium, and Vision Blog**](https://aka.ms/phi3_ONNXBuild24) and [**Phi-3 Mini Blog**](https://aka.ms/phi3-optimizations) 
- [**Phi-3 Model Blog Link**](https://aka.ms/phi3blog-april)
- [**Phi-3 Model Card**]( https://aka.ms/phi3-Small-8K-instruct)
- [**Phi-3 Technical Report**](https://aka.ms/phi3-tech-report)
- [**Phi-3 on Azure AI Studio**](https://aka.ms/phi3-azure-ai)

## Performance Metrics

Phi-3 Small-8K-Instruct performs better with ONNX Runtime compared to PyTorch for all batch size, prompt length combinations. For FP16 CUDA, ORT performs up to 4X faster than PyTorch, while with INT4 CUDA, it's up to 10.9X faster than PyTorch. 

The table below shows the average throughput of the first 256 tokens generated (tps) for FP16 and INT4 precisions on CUDA as measured on [1 A100 80GB GPU, SKU: Standard_ND96amsr_A100_v4](https://learn.microsoft.com/en-us/azure/virtual-machines/ndm-a100-v4-series).

| Batch Size, Prompt Length | ORT FP16 CUDA | PyTorch Eager FP16 CUDA | Speed Up ORT/PyTorch | 
|---------------------------|---------------|-------------------------|----------------------|
| 1, 16 | 74.62   | 16.81  | 4.44 |
| 4, 16 | 290.36  | 65.56  | 4.43 | 
| 16,16 | 1036.93 | 267.33 | 3.88 | 


| Batch Size, Prompt Length | ORT INT4 CUDA | PyTorch Eager INT4 CUDA | Speed Up ORT/PyTorch | 
|---------------------------|---------------|-------------------------|----------------------|
| 1, 16  | 140.68 | 12.93  | 10.88 |
| 4, 16  | 152.90 | 44.04  | 3.47  | 
| 16,16  | 582.07 | 160.57 | 3.62  | 


### Package Versions

| Pip package name | Version |
|------------------|---------|
| torch            | 2.3.0   |
| triton           | 2.3.0   |
| onnxruntime-gpu  | 1.18.0  |
| transformers     | 4.40.2  |
| bitsandbytes     | 0.43.1  |

## Appendix

## Model Card Contact
parinitarahi, kvaishnavi, natke

## Contributors
Kunal Vaishnavi, Sunghoon Choi, Yufeng Li, Tianlei Wu, Sheetal Arun Kadam, Rui Ren, Baiju Meswani, Natalie Kershaw, Parinita Rahi
