# Phi-3 Vision-128k-Instruct ONNX CPU models

**NOTE: This repository has been deprecated. Please refer to the new repository [here](https://huggingface.co/microsoft/Phi-3-vision-128k-instruct-onnx) for the latest models.**

<!-- Provide a quick summary of what the model is/does. -->
This repository hosts the optimized versions of [Phi-3-vision-128k-instruct](https://aka.ms/phi3-vision-128k-instruct) to accelerate inference with ONNX Runtime for your CPU.

Phi-3 Vision is a lightweight, state-of-the-art open multimodal model built upon datasets that include synthetic data and filtered publicly available web data with a focus on very high-quality, reasoning dense data both on text and vision. The model belongs to the Phi-3 model family, and the multimodal version supports up to 128K context length (in tokens). The base model has undergone a rigorous enhancement process, incorporating both supervised fine-tuning and direct preference optimization, to ensure precise instruction adherence and robust safety measures. 

Optimized variants of the Phi-3 Vision models are published here in [ONNX](https://onnx.ai) format to run with [ONNX Runtime](https://onnxruntime.ai/) on CPU and GPU across devices, including server platforms, Windows, Linux and Mac desktops, and mobile CPUs, with the precision best suited to each of these targets.

## ONNX Models 

Here are some of the optimized configurations we have added:  

1. ONNX model for INT4 CPU: ONNX model for CPUs using int4 quantization via RTN.

How do you know which is the best ONNX model for you:
- Are you on a Windows machine with GPU?
    - I don't know → Review this [guide](https://www.microsoft.com/en-us/windows/learning-center/how-to-check-gpu) to see whether you have a GPU in your Windows machine.
    - Yes → Access the Hugging Face DirectML ONNX models and instructions at [Phi-3-vision-128k-instruct-onnx-directml](https://huggingface.co/microsoft/Phi-3-vision-128k-instruct-onnx-directml).
    - No → Do you have a NVIDIA GPU?
        - I don't know → Review this [guide](https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html#verify-you-have-a-cuda-capable-gpu) to see whether you have a CUDA-capable GPU.
        - Yes → Access the Hugging Face CUDA ONNX models and instructions at [Phi-3-vision-128k-instruct-onnx-cuda](https://huggingface.co/microsoft/Phi-3-vision-128k-instruct-onnx-cuda) for NVIDIA GPUs.
        - No → Access the Hugging Face ONNX models for CPU devices and instructions at [Phi-3-vision-128k-instruct-onnx-cpu](https://huggingface.co/microsoft/Phi-3-vision-128k-instruct-onnx-cpu)

## How to Get Started with the Model
To support the Phi-3 models across a range of devices, platforms, and EP backends, we introduce a new API to wrap several aspects of generative AI inferencing. This API makes it easy to drag and drop LLMs straight into your app. To run the early version of these models with ONNX, follow the steps [here](https://aka.ms/run-phi3-v-onnx).

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
- **Model Description:** This is a conversion of the Phi-3 Vision-128K-Instruct model for ONNX Runtime inference.

## Additional Details
- [**Phi-3 Small, Medium, and Vision Blog**](https://aka.ms/phi3_ONNXBuild24) and [**Phi-3 Mini Blog**](https://aka.ms/phi3-optimizations) 
- [**Phi-3 Model Blog Link**](https://aka.ms/phi3blog-april)
- [**Phi-3 Model Card**](https://aka.ms/phi3-vision-128k-instruct)
- [**Phi-3 Technical Report**](https://aka.ms/phi3-tech-report)
- [**Phi-3 on Azure AI Studio**](https://aka.ms/phi3-azure-ai)

## Performance Metrics
The performance of the ONNX vision model is similar to [Phi-3-mini-128k-instruct-onnx](https://huggingface.co/microsoft/Phi-3-mini-128k-instruct-onnx) during token generation.

## Base Model Usage and Considerations
**Primary use cases**

The model is intended for broad commercial and research use in English. The model provides uses for general purpose AI systems and applications with visual and text input capabilities which require 

1) memory/compute constrained environments;
2) latency bound scenarios;
3) general image understanding;
4) OCR;
5) chart and table understanding.

Our model is designed to accelerate research on efficient language and multimodal models, for use as a building block for generative AI powered features.

**Use case considerations**

Our models are not specifically designed or evaluated for all downstream purposes. Developers should consider common limitations of language models as they select use cases, and evaluate and mitigate for accuracy, safety, and fairness before using within a specific downstream use case, particularly for high-risk scenarios.

Developers should be aware of and adhere to applicable laws or regulations (including privacy, trade compliance laws, etc.) that are relevant to their use case. 

Nothing contained in this Model Card should be interpreted as or deemed a restriction or modification to the license the model is released under.

## Appendix

## Model Card Contact
parinitarahi, kvaishnavi, natke

## Contributors
Kunal Vaishnavi, Sunghoon Choi, Yufeng Li, Baiju Meswani, Sheetal Arun Kadam, Rui Ren, Natalie Kershaw, Parinita Rahi
