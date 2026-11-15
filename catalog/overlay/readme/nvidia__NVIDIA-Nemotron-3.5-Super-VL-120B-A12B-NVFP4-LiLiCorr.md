# Model Overview

## Description:

The NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr model is the LiLiCorr speculative decoding checkpoint for NVIDIA's Nemotron-3.5-Super-VL-120B-A12B model family, which is a hybrid LatentMoE vision-language model designed for reasoning, chat, visual understanding, and agentic workflows. For details about the target model, see the [BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16) and [NVFP4](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4) model cards. The NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr model is intended for LiLiCorr speculative decoding deployments tuned for DGX Spark and low-concurrency data center workflows.

This model was built through our [ModelOpt](https://github.com/NVIDIA/Model-Optimizer) library which is a library of model optimization techniques including quantization, pruning, Neural Architecture Search (NAS), distillation, speculative decoding and sparsity to accelerate models.

This model is ready for commercial or non-commercial use.

## License/Terms of Use:

**GOVERNING DOWNLOAD TERMS:** Use of this model is governed by the [OpenMDW-1.1 model license](https://openmdw.ai/license/1-1/).

## Deployment Geography:

Global

## Use Case:

Developers deploying Nemotron-3.5-Super-VL-120B-A12B for reasoning, chat, RAG, and agentic workflows that benefit from lower-latency speculative decoding on DGX Spark and data center GPUs. Load this draft checkpoint alongside the Nemotron-3.5-Super-VL-120B-A12B target model to enable LiLiCorr-assisted serving.

## Release Date:

Hugging Face - 10/15/2026 via [https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr)

## References

- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- [NVIDIA Nemotron-3.5-Super-VL-120B-A12B-BF16 reasoning model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16)
- [NVIDIA Nemotron-3.5-Super-VL-120B-A12B-NVFP4 reasoning model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4)
- [LiLiCorr: Lightweight Likelihood Correlation of Parallel Drafts for Speculative Decoding](https://arxiv.org/abs/2608.20530)

## Model Architecture:

The LiLiCorr model architecture is as follows:

**Architecture Type:** Dense GQA (Dense MLP + GQA Attention)  
**Network Architecture:** Dense FFN MLP, and GQA Attention layers; the LiLiCorr drafter's attention uses bidirectional grouped-query attention (GQA), with 32 query heads, 8 key-value heads, within the draft block and sliding-window attention over the most recent 8,192 context positions on all layers, with a grouped dynamic convolution around each attention and MLP sublayer. A separate two-layer LiLiCorr head correlates the drafter's top-8 candidates at each draft slot.
**Number of Model Parameters:** 1.13B trained parameters (37M in the LiLiCorr head), plus a 0.54B NVFP4 copy of the target’s LM head.

For details about the target model's architecture, see the [Nemotron-3.5-Super-VL-120B-A12B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16), [Nemotron-3.5-Super-VL-120B-A12B-NVFP4](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4).


## Input:

The inputs below describe the target-model serving interface. LiLiCorr drafts tokens using representations from the target model.

**Input Type(s):** Text  
**Input Format(s):** Text: String  
**Input Parameters:** Text: One-Dimensional (1D)  
**Other Properties Related to Input:** The target model supports up to 1M tokens of context. The serving configuration below sets a 114,688-token limit. Supported languages include English, French, Spanish, Italian, German, Japanese, Hindi, Korean, Brazilian Portuguese, and Chinese.  


## Output:

**Output Type(s):** Text  
**Output Format:** String  
**Output Parameters:** One-Dimensional (1D): Sequences  
**Other Properties Related to Output:** Input and generated output share the configured context window. The target model supports JSON output, reasoning output, and tool calling.  

Our AI models are designed and/or optimized to run on NVIDIA GPU-accelerated systems. By leveraging NVIDIA's hardware (e.g. GPU cores) and software frameworks (e.g., CUDA libraries), the model achieves faster training and inference times compared to CPU-only solutions.

## Software Integration:

**Supported Runtime Engine(s):**
- vLLM
- SGLang
- TensorRT-LLM

**Supported Hardware Microarchitecture Compatibility:**
- NVIDIA Blackwell - including DGX Spark (GB10)
- NVIDIA Hopper

**Preferred Operating System(s):**
- Linux

The integration of foundation and fine-tuned models into AI systems requires additional testing using use-case-specific data to ensure safe and effective deployment. Following the V-model methodology, iterative testing and validation at both unit and system levels are essential to mitigate risks, meet technical and functional requirements, and ensure compliance with safety and ethical standards before deployment.

## Model Version(s):

* v1.0 - LiLiCorr GA

## Training and Evaluation Datasets:

## Training Dataset:
For more information about the underlying Nemotron-3.5-Super-VL-120B-A12B model, please visit the model card - [Nemotron-3.5-Super-VL-120B-A12B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16), [Nemotron-3.5-Super-VL-120B-A12B-NVFP4](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4).

**Link**: [Nemotron-Post-Training-Dataset-v2](https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2), [Nemotron-RL-Super-Training-Blends](https://huggingface.co/datasets/nvidia/Nemotron-RL-Super-Training-Blends), [Nemotron-Post-Training-v3](https://huggingface.co/collections/nvidia/nemotron-post-training-v3), [Nemotron-Instruction-Following-Chat-v1](https://huggingface.co/datasets/nvidia/Nemotron-Instruction-Following-Chat-v1), and [Nemotron-Science-v1](https://huggingface.co/datasets/nvidia/Nemotron-Science-v1). Prompts and conversation context from these datasets were used to synthesize training data. The final assistant response was regenerated with Nemotron-3.5-Super and used as the training target; earlier conversation turns and tool context were retained.  
**Data Modality:** Text  
**Text Training Data Size:** 22.6 Billion Tokens (4,096-token training windows), repeated for 3 epochs, followed by 35.6 Billion Tokens (8,192-token training windows), for 2.9 epochs (500K steps) 
**Data Collection Method by dataset:** Hybrid: Automated, manually-collected, Synthetic  
**Labeling Method by dataset:** Hybrid: Automated, manually-labelled, Synthetic  
**Properties:** The Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr model was trained exclusively on a post-training corpus that includes synthetic data for reasoning, math, code, science, tool use, agentic and software-engineering tasks, instruction following, chat, structured outputs, and multilingual tasks. Each final assistant response used as a training target was generated by Nemotron-3.5-Super at temperature 1.0: the model was first trained on responses from a Nemotron-3.5-Super post-training checkpoint, then finetuned on responses from the released checkpoint. Dataset disclosures are published in the linked Hugging Face datasets and the `nvidia/nemotron-post-training-v3` collection.  

For more information about the datasets used to train the target model, please see the [Public Summary of Training Content](https://assets.ngc.nvidia.com/products/api-catalog/nemotron-3.5-super-vl/Nemotron_3.5_Super_VL_EU_Training_Content_Summary.pdf)


## Evaluation Dataset:

The model is evaluated on the [SPEED-Bench](https://huggingface.co/datasets/nvidia/SPEED-Bench) dataset for speculative decoding benchmarking.

**Data Collection Method by dataset:** Hybrid: Automated, manually-collected, Synthetic
**Labeling Method by dataset:** Hybrid: Automated, manually-labelled, Synthetic
**Properties:** This corpus comprises a mix of high-quality standard benchmarks and test suites for LLMs. These benchmarks prompt the underlying model on a diverse set of tasks such as coding, math, writing, translation, etc., and speculative-decoding acceptance length is measured over the generated responses.  


## Inference:

**Acceleration Engine:** vLLM; SGLang; TensorRT-LLM
**Test Hardware:** NVIDIA Blackwell - DGX Spark (GB10)  


## LiLiCorr Speculative Decoding

Nemotron-3.5-Super-VL-120B-A12B supports two speculative decoding paths, including native MTP and LiLiCorr for DGX Spark and low-concurrency data center workflows. This release is the LiLiCorr speculative decoding checkpoint intended to be paired with the Nemotron-3.5-Super-VL-120B-A12B target model. LiLiCorr is designed to improve accepted length while preserving the latency benefits of block drafting on compact Blackwell systems such as DGX Spark.

## Usage

To serve the checkpoint with [vLLM](https://github.com/vllm-project/vllm), refer to the LiLiCorr recipes in the [NVIDIA Nemotron-3.5-Super-VL-120B-A12B Model Card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4#quick-start)

To serve the checkpoint with [SGLang](https://github.com/sgl-project/sglang), refer to the LiLiCorr recipes in the [NVIDIA Nemotron-3.5-Super-VL-120B-A12B Model Card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4#sglang)

To serve the checkpoint with [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM), refer to the LiLiCorr recipes in the [NVIDIA Nemotron-3.5-Super-VL-120B-A12B Model Card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4#tensorrt-llm)

## Evaluation

Acceptance rate on [SPEED-Bench](https://huggingface.co/datasets/nvidia/SPEED-Bench) with draft length 7:

| Category | Acceptance Length - T=0 | Acceptance Length - T=1 |
|---|---:|---:|
| coding | **5.65** | **5.29** |
| humanities | **3.94** | **3.51** |
| math | **4.93** | **4.56** |
| multilingual | **5.53** | **5.04** |
| qa | **4.37** | **4.03** |
| rag | **5.69** | **5.33** |
| reasoning | **4.87** | **4.54** |
| roleplay | **3.78** | **3.46** |
| stem | **4.11** | **3.69** |
| summarization | **5.37** | **4.96** |
| writing | **3.92** | **3.58** |
| **Overall Average** | **4.74** | **4.36** |

> Baseline: [Nemotron-3.5-Super-VL-120B-A12B-NVFP4](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4)
> Benchmarked on SPEED-Bench Qualitative split (880 prompts) with a draft length of 7, concurrency 64, and a mean over 3 seeds. `temperature=1.0` uses `top_p=0.95`.

## Model Limitations:

The target model may generate inaccurate, incomplete, or otherwise undesirable responses, even when prompts are benign. It may reflect biases or content artifacts present in its training data, and output quality can vary by domain, language, reasoning depth, and context length. Developers should add application-specific safeguards and evaluate the system in the intended deployment environment before production use.

## Ethical Considerations

NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications. Developers should work with their internal model team to ensure this model meets requirements for the relevant industry and use case and addresses unforeseen product misuse.

For more detailed information on ethical considerations for this model, please see the Model Card++ Bias, Explainability, Safety & Security, and Privacy Subcards.

Please report model quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://www.nvidia.com/en-us/support/submit-security-vulnerability/).

SUBCARDS:

# **Explainability**

| Field | Response |
| --- | --- |
| Intended Task/Domain | Speculative decoding for text generation, reasoning, tool use, and agentic workflows; text, image, and video inputs are handled by the paired target model |
| Model Type | Dense GQA draft model paired with a hybrid LatentMoE vision-language target model |
| Intended Users | Developers deploying Nemotron-3.5-Super-VL-120B-A12B for reasoning, chat, RAG, visual understanding, and agentic workflows that benefit from lower-latency speculative decoding on data center GPUs and high-end local GPU systems.  |
| Output | Draft token candidates; the paired target model verifies candidates and produces the final text |
| Describe how the model works | Nemotron-3.5-Super-VL-120B-A12B uses interleaved Mamba-2, MoE, and Attention layers for the target model, while LiLiCorr proposes candidate token blocks to improve generation speed during verification |
| Name the adversely impacted groups this has been tested to deliver comparable outcomes regardless of | Not Applicable |
| Technical Limitations & Mitigation | With correct target-model verification, speculative decoding preserves the target model's output distribution. Acceptance length and latency depend on the workload, sampling settings, hardware, and serving configuration. |
| Verified to have met prescribed quality standards? | Yes |
| Performance Metrics | Speculative-decoding acceptance length; accuracy, throughput, and latency of the paired serving system |
| Potential Known Risk | The target model was trained on data that contains toxic language and societal biases originally crawled from the internet. Therefore, the model may amplify those biases and return toxic responses especially when prompted with toxic prompts. Therefore, before deploying any applications of this model, developers should perform safety testing and tuning tailored to their specific applications of the model.<br>Developers should validate task accuracy, latency, and safety in their own deployment environment and add application-specific safeguards before production use.  |
| Licensing | **Governing Terms:** Use of this model is governed by the [OpenMDW-1.1 model license](https://openmdw.ai/license/1-1/) |

# **Bias**

| Field | Response |
| --- | --- |
| Participation considerations from adversely impacted groups [protected classes](https://www.senate.ca.gov/content/protected-classes) in model design and testing | None |
| Measures taken to mitigate against unwanted bias | None |
| Bias Metric | None |

# **Safety & Security**

| Field | Response |
| --- | --- |
| Model Application(s) | Chat, instruction following, RAG, reasoning, visual understanding, and agentic AI workflows |
| Describe life critical application (if present) | Not Applicable |
| Use Case Restrictions | Use must comply with the [OpenMDW-1.1 model license](https://openmdw.ai/license/1-1/) and applicable laws and regulations |
| Model and Dataset Restrictions | The Principle of least privilege (PoLP) is applied limiting access for dataset generation and model development. Restrictions enforce dataset access during training, and dataset license constraints adhered to. |

# **Privacy**

| Field | Response |
| --- | --- |
| Generatable or Reverse engineerable personal data? | No |
| Personal data used to create this model? | No |
| Was consent obtained for any personal data used? | Not Applicable |
| How often is dataset reviewed? | Before Release |
| Was data from user interactions with the AI model (e.g. user input and prompts) used to train the model? | No |
| Is there provenance for all datasets used in training? | Yes |
| Does data labeling (annotation, metadata) comply with privacy laws? | Yes |
| Is data compliant with data subject requests for data correction or removal, if such a request was made? | Not Applicable |
| Applicable NVIDIA Privacy Policy | [https://www.nvidia.com/en-us/about-nvidia/privacy-policy/](https://www.nvidia.com/en-us/about-nvidia/privacy-policy/) |
