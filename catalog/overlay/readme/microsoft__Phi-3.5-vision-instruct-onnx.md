# Phi-3.5 Vision Instruct ONNX models

<!-- Provide a quick summary of what the model is/does. -->
This repository hosts the optimized versions of [Phi-3.5-vision-instruct](https://huggingface.co/microsoft/Phi-3.5-vision-instruct) to accelerate inference with ONNX Runtime for your CPU and GPU.

Phi-3.5 Vision is a lightweight, state-of-the-art open multimodal model built upon datasets that include synthetic data and filtered publicly available web data with a focus on very high-quality, reasoning dense data both on text and vision. The model belongs to the Phi-3.5 model family, and the multimodal version supports up to 128K context length (in tokens). The base model has undergone a rigorous enhancement process, incorporating both supervised fine-tuning and direct preference optimization, to ensure precise instruction adherence and robust safety measures. 

Optimized variants of the Phi-3.5 Vision models are published here in [ONNX](https://onnx.ai) format to run with [ONNX Runtime](https://onnxruntime.ai/) on CPU and GPU across devices, including server platforms, Windows, Linux and Mac desktops, and mobile CPUs, with the precision best suited to each of these targets.

## ONNX Models 

Here are some of the optimized configurations we have added:  

1. ONNX model for INT4 CPU: ONNX model for CPUs using int4 quantization via RTN.
2. ONNX model for INT4 GPU: ONNX model for GPUs using int4 quantization via RTN.

## How to Get Started with the Model
To support the Phi-3.5 models across a range of devices, platforms, and EP backends, we introduce a new API to wrap several aspects of generative AI inferencing. This API makes it easy to drag and drop LLMs straight into your app. To run the early version of these models with ONNX, follow the steps [here](https://aka.ms/run-phi3-v-onnx).

## Hardware Supported

The models are tested on:
- Intel(R) Core(TM) i9-10920X CPU @ 3.50GHz 
- 1 A100 GPU, SKU: Standard_ND96amsr_A100_v4 (CUDA)
- GPU SKU: RTX 4080 (DirectML)

Minimum Configuration Required:
- CPU machine with 16GB RAM
- CUDA: NVIDIA GPU with [Compute Capability](https://developer.nvidia.com/cuda-gpus) >= 7.0
- Windows: DirectX 12-capable GPU and a minimum of 10GB of combined RAM

### Model Description

- **Developed by:**  Microsoft
- **Model type:** ONNX
- **Language(s) (NLP):** Python, C, C++
- **License:** MIT
- **Model Description:** This is a conversion of the Phi-3.5 Vision Instruct model for ONNX Runtime inference.
- **Disclaimer:** This model is only an optimization of the base model. Any risk associated with the model is the responsibility of the user of the model. Please verify and test for your scenarios. There may be a slight difference in output from the base model with the optimizations applied. We have conducted responsible AI evaluations and did not observe significant regressions compared to the base model.

## Additional Details
- [**Phi-3.5 Blog**](https://aka.ms/phi3_ONNXBuild24)
- [**Phi-3.5 Model Blog Link**](https://aka.ms/phi3.5-techblog)
- [**Phi-3.5 Model Card**](https://huggingface.co/microsoft/Phi-3.5-vision-instruct)
- [**Phi-3.5 Technical Report**](https://aka.ms/phi3-tech-report)
- [**Phi-3.5 on Azure AI Studio**](https://aka.ms/try-phi3.5vision)

## Performance Metrics
The performance of the ONNX vision model is similar to [Phi-3.5-mini-instruct-onnx](https://huggingface.co/microsoft/Phi-3.5-mini-instruct-onnx) during token generation.

## Base Model Usage and Considerations
For details and RAI considerations of the base model, please refer to [here](https://huggingface.co/microsoft/Phi-3.5-vision-instruct).

Please note that ONNX model output may vary slightly from the base model. The users are responsible for verifying the output for their scenarios and own responsibility of the usage.

## Appendix

## Model Card Contact
parinitarahi, kvaishnavi, natke, yunl, sunghcho

## Contributors
Kunal Vaishnavi, Sunghoon Choi, Yufeng Li, Baiju Meswani, Sheetal Arun Kadam, Rui Ren, Natalie Kershaw, Parinita Rahi, Patrice Vignola, Xiang Zhang, Chai Chaoweeraprasit, Logan Iyer, Vicente Rivera, Jacques Van Rhyn, Yun Liu

## Trademarks 

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft’s Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.
