# Phi-3 Mini-4K-Instruct ONNX model for in-browser inference

<!-- Provide a quick summary of what the model is/does. -->
Running Phi3-mini-4K entirely in the browser! Check out this [demo](https://guschmue.github.io/ort-webgpu/chat/index.html).

This repository hosts the optimized Web version of ONNX Phi-3-mini-4k-instruct model to accelerate inference in the browser with ONNX Runtime Web.

[The Phi-3-Mini-4K-Instruct](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct) is a 3.8B parameters, lightweight, state-of-the-art open model trained with the Phi-3 datasets that includes both synthetic data and the filtered publicly available websites data with a focus on high-quality and reasoning dense properties. When assessed against benchmarks testing common sense, language understanding, math, code, long context and logical reasoning, Phi-3 Mini-4K-Instruct showcased a robust and state-of-the-art performance among models with less than 13 billion parameters. 

## How to run

[ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/build-web-app.html) is a JavaScript library to enable web developers to deploy machine learning models directly in web browsers, offering multiple backends leveraging hardware acceleration. WebGPU backend is recommended to run Phi-3-mini efficiently. 


Here is an [E2E example](https://github.com/microsoft/onnxruntime-inference-examples/tree/main/js/chat) for running this optimized  Phi3-mini-4K for the web, with ONNX Runtime harnessing WebGPU.


**Supported devices and browser with WebGPU**: Chrome 113+ and Edge 113+ for Mac, Windows, ChromeOS, and Chrome 121+ for Android. Pls visit [here](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status#safari-in-progress) for tracking WebGPU support in browsers

## Performance Metrics
Performance vary between GPUs. The more powerful the GPU, the faster the speed. On a NVIDIA GeForce RTX 4090: ~42 tokens/second 


## Additional Details

To obtain other optimized Phi3-mini-4k ONNX models for server platforms, Windows, Linux, Mac desktops, and mobile, please visit [Phi-3-mini-4k-instruct onnx model](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx). The model differences in the web version compared to other versions:

1. the model is fp16 with int4 block quantization for weights
2. the 'logits' output is fp32 
3. the model uses MHA instead of GQA
4. onnx and external data file need to stay below 2GB to be cacheable in chromium

To optimize a fine-tuned Phi3-mini-4k model to run with ONNX Runtime Web, please follow [this Olive example](https://github.com/microsoft/Olive/tree/main/examples/phi3). [Olive](https://github.com/microsoft/OLive) is an easy-to-use model optimization tool for generating an optimized ONNX model to efficiently run with ONNX Runtime across platforms.


## Model Description

- **Developed by:**  Microsoft
- **Model type:** ONNX
- **Inference Language(s) (NLP):** JavaScript
- **License:** MIT
- **Model Description:** This is the web version of the Phi-3 Mini-4K-Instruct model for ONNX Runtime inference.


## Model Card Contact
guschmue, qining
