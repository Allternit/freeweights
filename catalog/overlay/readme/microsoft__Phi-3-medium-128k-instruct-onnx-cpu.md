# Phi-3 Medium-128K-Instruct ONNX CPU models

<!-- Provide a quick summary of what the model is/does. -->
This repository hosts the optimized versions of [Phi-3-medium-128k-instruct](https://aka.ms/phi3-medium-128K-instruct) to accelerate inference with ONNX Runtime for your CPU.

Phi-3 Medium is a 14B parameter, lightweight, state-of-the-art open model trained with the Phi-3 datasets, which include both synthetic data and the filtered publicly available websites data, with a focus on high-quality and reasoning dense properties. The model belongs to the Phi-3 family with the medium version in two variants: [4K](https://huggingface.co/microsoft/Phi-3-medium-4K-instruct) and [128K](https://huggingface.co/microsoft/Phi-3-medium-128k-instruct), which are the context lengths (in tokens) that they can support.

The base model has undergone a post-training process that incorporates both supervised fine-tuning and direct preference optimization for the instruction following and safety measures. When assessed against benchmarks testing common sense, language understanding, math, code, long context, and logical reasoning, Phi-3-Medium-128K-Instruct showcased a robust and state-of-the-art performance among models of the same-size and next-size-up.

Optimized variants of the Phi-3 Medium models are published here in [ONNX](https://onnx.ai) format and run with [ONNX Runtime](https://onnxruntime.ai/) on CPU and GPU across devices, including server platforms, Windows, and Linux, with the precision best suited to each of these targets.

## ONNX Models 

Here are some of the optimized configurations we have added:  

1. ONNX model for INT4 CPU: ONNX model for CPUs using int4 quantization via RTN. 

How do you know which is the best ONNX model for you:
- Are you on a Windows machine with GPU?
	- I don't know → Review this [guide](https://www.microsoft.com/en-us/windows/learning-center/how-to-check-gpu) to see whether you have a GPU in your Windows machine.
	- Yes → Access the Hugging Face DirectML ONNX models and instructions at [Phi-3-medium-128k-instruct-onnx-directml](https://huggingface.co/microsoft/Phi-3-medium-128k-instruct-onnx-directml).
	- No → Do you have a NVIDIA GPU?
		- I don't know → Review this [guide](https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html#verify-you-have-a-cuda-capable-gpu) to see whether you have a CUDA-capable GPU.
		- Yes → Access the Hugging Face CUDA ONNX models and instructions at [Phi-3-medium-128k-instruct-onnx-cuda](https://huggingface.co/microsoft/Phi-3-medium-128k-instruct-onnx-cuda) for NVIDIA GPUs.
		- No → Access the Hugging Face ONNX models for CPU devices and instructions at [Phi-3-medium-128k-instruct-onnx-cpu](https://huggingface.co/microsoft/Phi-3-medium-128k-instruct-onnx-cpu).

## How to Get Started with the Model
To support the Phi-3 models across a range of devices, platforms, and EP backends, we introduce a new API to wrap several aspects of generative AI inferencing. This API makes it easy to drag and drop LLMs straight into your app. To run the early version of these models with ONNX, follow the steps [here](http://aka.ms/generate-tutorial).

## Hardware Supported

The models are tested on:
- Intel(R) Core(TM) i9-10920X CPU @ 3.50GHz 

Minimum Configuration Required:
- CPU machine with 16GB RAM

### Model Description

- **Developed by:**  Microsoft
- **Model type:** ONNX
- **Language(s) (NLP):** Python, C, C++
- **License:** MIT
- **Model Description:** This is a conversion of the Phi-3 Medium-128K-Instruct model for ONNX Runtime inference.

## Additional Details
- [**Phi-3 Small, Medium, and Vision Blog**](https://aka.ms/phi3_ONNXBuild24) and [**Phi-3 Mini Blog**](https://aka.ms/phi3-optimizations) 
- [**Phi-3 Model Blog Link**](https://aka.ms/phi3blog-april)
- [**Phi-3 Model Card**]( https://aka.ms/phi3-medium-128K-instruct)
- [**Phi-3 Technical Report**](https://aka.ms/phi3-tech-report)
- [**Phi-3 on Azure AI Studio**](https://aka.ms/phi3-azure-ai)

## Performance Metrics

The model runs at ~20 tokens/sec on a Intel(R) Core(TM) i9-10920X CPU @ 3.50GHz.

## Appendix

## Model Card Contact
parinitarahi, kvaishnavi, natke

## Contributors
Kunal Vaishnavi, Sunghoon Choi, Yufeng Li, Akshay Sonawane, Sheetal Arun Kadam, Rui Ren, Edward Chen, Scott McKay, Emma Ning, Natalie Kershaw, Parinita Rahi
