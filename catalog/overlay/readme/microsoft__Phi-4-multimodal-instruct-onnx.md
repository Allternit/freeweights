## Phi-4 Multimodal Instruct ONNX models

### Introduction

This is an ONNX version of the Phi-4 multimodal model that is quantized to int4 precision to accelerate inference with ONNX Runtime.

## Model Run
For CPU: stay tuned or follow [this tutorial](https://github.com/microsoft/onnxruntime-genai/blob/main/examples/python/phi-4-multi-modal.md) to generate your own ONNX models for CPU!

<!-- ```bash
# Download the model directly using the Hugging Face CLI
huggingface-cli download microsoft/Phi-4-multimodal-instruct-onnx --include cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4/* --local-dir .

# Install the CPU package of ONNX Runtime GenAI
pip install --pre onnxruntime-genai

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-mm.py -o model-mm.py
python model-mm.py -m cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4 -e cpu
``` -->

For CUDA:

```bash
# Download the model directly using the Hugging Face CLI
huggingface-cli download microsoft/Phi-4-multimodal-instruct-onnx --include gpu/* --local-dir .

# Install the CUDA package of ONNX Runtime GenAI
pip install --pre onnxruntime-genai-cuda

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-mm.py -o model-mm.py
python model-mm.py -m gpu/gpu-int4-rtn-block-32 -e cuda
```

For DirectML:

```bash
# Download the model directly using the Hugging Face CLI
huggingface-cli download microsoft/Phi-4-multimodal-instruct-onnx --include gpu/* --local-dir .

# Install the DML package of ONNX Runtime GenAI
pip install --pre onnxruntime-genai-directml

# Please adjust the model directory (-m) accordingly
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py -o common.py
curl https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/model-mm.py -o model-mm.py
python model-mm.py -m gpu/gpu-int4-rtn-block-32 -e dml
```

You will be prompted to provide any images, audios, and a prompt.

The performance of the text component is similar to the [Phi-4 mini ONNX models](https://huggingface.co/microsoft/Phi-4-mini-instruct-onnx/blob/main/README.md)

### Model Description

- Developed by: Microsoft
- Model type: ONNX
- License: MIT
- Model Description: This is a conversion of Phi4 multimodal model for ONNX Runtime inference.

Disclaimer: Model is only an optimization of the base model, any risk associated with the model is the responsibility of the user of the model. Please verify and test for you scenarios. There may be a slight difference in output from the base model with the optimizations applied.

### Base Model

Phi-4-multimodal-instruct is a lightweight open multimodal foundation model that leverages the language, vision, and speech research and datasets used for Phi-3.5 and 4.0 models. The model processes text, image, and audio inputs, generating text outputs, and comes with 128K token context length. The model underwent an enhancement process, incorporating both supervised fine-tuning, and direct preference optimization to support precise instruction adherence and safety measures.

See details [here](https://huggingface.co/microsoft/Phi-4-multimodal-instruct/blob/main/README.md)