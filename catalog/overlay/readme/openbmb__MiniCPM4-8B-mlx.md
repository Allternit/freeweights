<div align="center">
<img src="https://github.com/OpenBMB/MiniCPM/blob/main/assets/minicpm_logo.png?raw=true" width="500em" ></img> 
</div>

<p align="center">
<a href="https://github.com/OpenBMB/MiniCPM/" target="_blank">GitHub Repo</a> |
<a href="https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf" target="_blank">Technical Report</a> 
</p>
<p align="center">
👋 Join us on <a href="https://discord.gg/3cGQn9b3YM" target="_blank">Discord</a> and <a href="https://github.com/OpenBMB/MiniCPM/blob/main/assets/wechat.jpg" target="_blank">WeChat</a>
</p>

## What's New
- [2025.06.06] **MiniCPM4** series are released! This model achieves ultimate efficiency improvements while maintaining optimal performance at the same scale! It can achieve over 5x generation acceleration on typical end-side chips! You can find the technical report [here](https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf).🔥🔥🔥
- [2025.06.09] **MiniCPM4-8B-mlx** and **MiniCPM4-0.5B-mlx** are available and you can run MiniCPM4 on your Apple devices! Thanks to [pzc163](https://huggingface.co/pzc163) for providing this converted model version and related usage instructions.

## MiniCPM4 Series
MiniCPM4 series are highly efficient large language models (LLMs) designed explicitly for end-side devices, which achieves this efficiency through systematic innovation in four key dimensions: model architecture, training data, training algorithms, and inference systems.
- [MiniCPM4-8B-mlx](https://huggingface.co/openbmb/MiniCPM4-8B-mlx): MiniCPM4-8B in mlx format, which can used for Apple silicon. (**<-- you are here**)
- [MiniCPM4-0.5B-mlx](https://huggingface.co/openbmb/MiniCPM4-0.5B-mlx): MiniCPM4-0.5B in mlx format, which can used for Apple silicon.
- [MiniCPM4-8B](https://huggingface.co/openbmb/MiniCPM4-8B): The flagship of MiniCPM4, with 8B parameters, trained on 8T tokens.
- [MiniCPM4-0.5B](https://huggingface.co/openbmb/MiniCPM4-0.5B): The small version of MiniCPM4, with 0.5B parameters, trained on 1T tokens.
- [MiniCPM4-8B-Eagle-FRSpec](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-FRSpec): Eagle head for FRSpec, accelerating speculative inference for MiniCPM4-8B.
- [MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu): Eagle head trained with QAT for FRSpec, efficiently integrate speculation and quantization to achieve ultra acceleration for MiniCPM4-8B.
- [MiniCPM4-8B-Eagle-vLLM](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-vLLM): Eagle head in vLLM format, accelerating speculative inference for MiniCPM4-8B.
- [MiniCPM4-8B-marlin-Eagle-vLLM](https://huggingface.co/openbmb/MiniCPM4-8B-marlin-Eagle-vLLM): Quantized Eagle head for vLLM format, accelerating speculative inference for MiniCPM4-8B.
- [BitCPM4-0.5B](https://huggingface.co/openbmb/BitCPM4-0.5B): Extreme ternary quantization applied to MiniCPM4-0.5B compresses model parameters into ternary values, achieving a 90% reduction in bit width.
- [BitCPM4-1B](https://huggingface.co/openbmb/BitCPM4-1B): Extreme ternary quantization applied to MiniCPM3-1B compresses model parameters into ternary values, achieving a 90% reduction in bit width.
- [MiniCPM4-Survey](https://huggingface.co/openbmb/MiniCPM4-Survey): Based on MiniCPM4-8B, accepts users' quiries as input and autonomously generate trustworthy, long-form survey papers.
- [MiniCPM4-MCP](https://huggingface.co/openbmb/MiniCPM4-MCP): Based on MiniCPM4-8B, accepts users' queries and available MCP tools as input and autonomously calls relevant MCP tools to satisfy users' requirements.

## Introduction
MiniCPM 4 is an extremely efficient edge-side large model that has undergone efficient optimization across four dimensions: model architecture, learning algorithms, training data, and inference systems, achieving ultimate efficiency improvements.

- 🏗️ **Efficient Model Architecture:**
  - InfLLM v2 -- Trainable Sparse Attention Mechanism: Adopts a trainable sparse attention mechanism architecture where each token only needs to compute relevance with less than 5% of tokens in 128K long text processing, significantly reducing computational overhead for long texts

- 🧠 **Efficient Learning Algorithms:**
  - Model Wind Tunnel 2.0 -- Efficient Predictable Scaling: Introduces scaling prediction methods for performance of downstream tasks, enabling more precise model training configuration search
  - BitCPM -- Ultimate Ternary Quantization: Compresses model parameter bit-width to 3 values, achieving 90% extreme model bit-width reduction
  - Efficient Training Engineering Optimization: Adopts FP8 low-precision computing technology combined with Multi-token Prediction training strategy

- 📚 **High-Quality Training Data:**
  - UltraClean -- High-quality Pre-training Data Filtering and Generation: Builds iterative data cleaning strategies based on efficient data verification, open-sourcing high-quality Chinese and English pre-training dataset [UltraFinweb](https://huggingface.co/datasets/openbmb/Ultra-FineWeb)
  - UltraChat v2 -- High-quality Supervised Fine-tuning Data Generation: Constructs large-scale high-quality supervised fine-tuning datasets covering multiple dimensions including knowledge-intensive data, reasoning-intensive data, instruction-following data, long text understanding data, and tool calling data

- ⚡ **Efficient Inference System:**
  - CPM.cu -- Lightweight and Efficient CUDA Inference Framework: Integrates sparse attention, model quantization, and speculative sampling to achieve efficient prefilling and decoding
  - ArkInfer -- Cross-platform Deployment System: Supports efficient deployment across multiple backend environments, providing flexible cross-platform adaptation capabilities


## How to Run MiniCPM4-8B-mlx

Here is a guide on how to run the `MiniCPM4-8B-mlx` model from the command line using `mlx-lm`. You can use mlx-lm to interact with the `MiniCPM4-8B-mlx` model directly from your command line. This is a powerful tool that allows you to quickly test and use LLMs in the MLX format.

### Basic Usage
Here is a specific example. This command will load the `openbmb/MiniCPM4-8B-mlx` model and generate text based on the prompt you provide: "hello, pls tell me which one is the most powerful LLM in the World".
```Bash
mlx_lm.generate --model openbmb/MiniCPM4-8B-mlx --prompt "hello, pls tell me which one is the most powerful LLM in the World"
```

### MLX-LM Command Line Parameters
- `mlx_lm.generate`: This is the primary command in the mlx-lm toolkit used for text generation. 
- `--model openbmb/MiniCPM4-8B-mlx`: This parameter specifies the model to be loaded. `openbmb/MiniCPM4-8B-mlx` is the model's identifier on the Hugging Face Hub. mlx-lm will automatically download and cache the model from there. 
- `--prompt "..."`: This parameter is used to provide the initial text that you want the model to respond to or complete.
- `--max-tokens`: Sets the maximum number of tokens to generate. For example, `--max-tokens 200` will limit the output to 200 tokens.
- `--temp`: Controls the randomness of the output. Higher temperature values (like 0.8) will produce more diverse and creative outputs, while lower values (like 0.2) will make the output more deterministic and focused. The default value is usually 0.6.
- `--seed`: Sets a random seed to ensure reproducible results.

### Example with Parameters

The following command will use a higher temperature value and limit the output length:
```bash
mlx_lm.generate --model openbmb/MiniCPM4-8B-mlx \
                --prompt "tell me a story about a robot who discovered music" \
                --max-tokens 500 \
                --temp 0.8
```

## Evaluation Results
On two typical end-side chips, Jetson AGX Orin and RTX 4090, MiniCPM4 demonstrates significantly faster processing speed compared to similar-size models in long text processing tasks. As text length increases, MiniCPM4's efficiency advantage becomes more pronounced. On the Jetson AGX Orin platform, compared to Qwen3-8B, MiniCPM4 achieves approximately 7x decoding speed improvement.

![benchmark](https://github.com/OpenBMB/MiniCPM/blob/main/assets/minicpm4/efficiency.png?raw=true)

#### Comprehensive Evaluation
MiniCPM4 launches end-side versions with 8B and 0.5B parameter scales, both achieving best-in-class performance in their respective categories.

![benchmark](https://github.com/OpenBMB/MiniCPM/blob/main/assets/minicpm4/benchmark.png?raw=true)

#### Long Text Evaluation
MiniCPM4 is pre-trained on 32K long texts and achieves length extension through YaRN technology. In the 128K long text needle-in-a-haystack task, MiniCPM4 demonstrates outstanding performance.

![long-niah](https://github.com/OpenBMB/MiniCPM/blob/main/assets/minicpm4/128k-niah.png?raw=true)

## Statement
- As a language model, MiniCPM generates content by learning from a vast amount of text. 
- However, it does not possess the ability to comprehend or express personal opinions or value judgments. 
- Any content generated by MiniCPM does not represent the viewpoints or positions of the model developers. 
- Therefore, when using content generated by MiniCPM, users should take full responsibility for evaluating and verifying it on their own.

## LICENSE
- This repository and MiniCPM models are released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License. 

## Citation
- Please cite our [paper](https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf) if you find our work valuable.

```bibtex
@article{minicpm4,
  title={{MiniCPM4}: Ultra-Efficient LLMs on End Devices},
  author={MiniCPM Team},
  year={2025}
}
```
