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
- [2025.06.06] **MiniCPM4** series are released! This model achieves ultimate efficiency improvements while maintaining optimal performance at the same scale! It can achieve over 5x generation acceleration on typical end-side chips! You can find technical report [here](https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf).🔥🔥🔥

## MiniCPM4 Series
MiniCPM4 series are highly efficient large language models (LLMs) designed explicitly for end-side devices, which achieves this efficiency through systematic innovation in four key dimensions: model architecture, training data, training algorithms, and inference systems.
- [MiniCPM4-8B](https://huggingface.co/openbmb/MiniCPM4-8B): The flagship of MiniCPM4, with 8B parameters, trained on 8T tokens. (**<-- you are here**)
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

## Usage

### Inference with [CPM.cu](https://github.com/OpenBMB/cpm.cu)

We recommend using [CPM.cu](https://github.com/OpenBMB/cpm.cu) for the inference of MiniCPM4. CPM.cu is a CUDA inference framework developed by OpenBMB, which integrates efficient sparse, speculative sampling, and quantization techniques, fully leveraging the efficiency advantages of MiniCPM4.

You can install CPM.cu by running the following command:

```bash
git clone https://github.com/OpenBMB/cpm.cu.git --recursive
cd cpm.cu
python3 setup.py install
```

MiniCPM4 natively supports context lengths of up to 32,768 tokens. To reproduce the long-text acceleration effect in the paper, we recommend using the LongRoPE factors that have been validated. Change the `rope_scaling` field in the `config.json` file as the following to enable LongRoPE.
```json
{
    ...,
    "rope_scaling": {
        "rope_type": "longrope", 
        "long_factor": [0.9977997200264581, 1.014658295992452, 1.0349680404997148, 1.059429246056193, 1.0888815016813513, 1.1243301355211495, 1.166977103606075, 1.2182568066927284, 1.2798772354275727, 1.3538666751582975, 1.4426259039919596, 1.5489853358570191, 1.6762658237220625, 1.8283407612492941, 2.0096956085876183, 2.225478927469756, 2.481536379650452, 2.784415934557119, 3.1413289096347365, 3.560047844772632, 4.048719380066383, 4.752651957515948, 5.590913044973868, 6.584005926629993, 7.7532214876576155, 9.119754865903639, 10.704443927019176, 12.524994176518703, 14.59739595363613, 16.93214476166354, 19.53823297353041, 22.417131025031697, 25.568260840911098, 28.991144156566317, 32.68408069090375, 36.65174474170465, 40.90396065611201, 45.4664008671033, 50.37147343433591, 55.6804490772103, 61.470816952306556, 67.8622707390618, 75.00516023410414, 83.11898235973767, 92.50044360202462, 103.57086856690864, 116.9492274587385, 118.16074567836519, 119.18497548708795, 120.04810876261652, 120.77352815196981, 121.38182790207875, 121.89094985353891, 122.31638758099915, 122.6714244963338, 122.9673822552567, 123.21386397019609, 123.41898278254268, 123.58957065488238, 123.73136519024158, 123.84917421274221, 123.94701903496814, 124.02825801299717, 124.09569231686116],
        "short_factor": [0.9977997200264581, 1.014658295992452, 1.0349680404997148, 1.059429246056193, 1.0888815016813513, 1.1243301355211495, 1.166977103606075, 1.2182568066927284, 1.2798772354275727, 1.3538666751582975, 1.4426259039919596, 1.5489853358570191, 1.6762658237220625, 1.8283407612492941, 2.0096956085876183, 2.225478927469756, 2.481536379650452, 2.784415934557119, 3.1413289096347365, 3.560047844772632, 4.048719380066383, 4.752651957515948, 5.590913044973868, 6.584005926629993, 7.7532214876576155, 9.119754865903639, 10.704443927019176, 12.524994176518703, 14.59739595363613, 16.93214476166354, 19.53823297353041, 22.417131025031697, 25.568260840911098, 28.991144156566317, 32.68408069090375, 36.65174474170465, 40.90396065611201, 45.4664008671033, 50.37147343433591, 55.6804490772103, 61.470816952306556, 67.8622707390618, 75.00516023410414, 83.11898235973767, 92.50044360202462, 103.57086856690864, 116.9492274587385, 118.16074567836519, 119.18497548708795, 120.04810876261652, 120.77352815196981, 121.38182790207875, 121.89094985353891, 122.31638758099915, 122.6714244963338, 122.9673822552567, 123.21386397019609, 123.41898278254268, 123.58957065488238, 123.73136519024158, 123.84917421274221, 123.94701903496814, 124.02825801299717, 124.09569231686116],
        "original_max_position_embeddings": 32768
    }
}
```

After modification, you can run the following command to reproduce the long-context acceleration effect (the script will automatically download the model weights from HuggingFace)
```bash
python3 tests/test_generate.py
```

For more details about CPM.cu, please refer to [the repo CPM.cu](https://github.com/OpenBMB/cpm.cu).

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
