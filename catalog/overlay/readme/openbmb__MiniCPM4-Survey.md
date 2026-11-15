<div align="center">
<img src="https://github.com/OpenBMB/MiniCPM/blob/main/assets/minicpm_logo.png?raw=true" width="500em" ></img> 
</div>

<p align="center">
<a href="https://github.com/OpenBMB/MiniCPM/\" target="_blank">GitHub Repo</a> |
<a href="https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf" target="_blank">Technical Report</a> |
<a href="https://huggingface.co/papers/2506.07900" target="_blank">Paper</a>
</p>
<p align="center">
👋 Join us on <a href="https://discord.gg/3cGQn9b3YM" target="_blank">Discord</a> and <a href="https://github.com/OpenBMB/MiniCPM/blob/main/assets/wechat.jpg" target="_blank">WeChat</a>
</p>

This repository contains the model described in the paper [MiniCPM4: Ultra-Efficient LLMs on End Devices](https://huggingface.co/papers/2506.07900).

## What's New

* [2025-06-05] 🚀🚀🚀 We have open-sourced **MiniCPM4-Survey**, a model built upon MiniCPM4-8B that is capable of generating trustworthy, long-form survey papers while maintaining competitive performance relative to significantly larger models.

## MiniCPM4 Series
MiniCPM4 series are highly efficient large language models (LLMs) designed explicitly for end-side devices, which achieves this efficiency through systematic innovation in four key dimensions: model architecture, training data, training algorithms, and inference systems.
- [MiniCPM4-8B](https://huggingface.co/openbmb/MiniCPM4-8B): The flagship of MiniCPM4, with 8B parameters, trained on 8T tokens.
- [MiniCPM4-0.5B](https://huggingface.co/openbmb/MiniCPM4-0.5B): The small version of MiniCPM4, with 0.5B parameters, trained on 1T tokens.
- [MiniCPM4-8B-Eagle-FRSpec](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-FRSpec): Eagle head for FRSpec, accelerating speculative inference for MiniCPM4-8B.
- [MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu): Eagle head trained with QAT for FRSpec, efficiently integrate speculation and quantization to achieve ultra acceleration for MiniCPM4-8B.
- [MiniCPM4-8B-Eagle-vLLM](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-vLLM): Eagle head in vLLM format, accelerating speculative inference for MiniCPM4-8B.
- [MiniCPM4-8B-marlin-Eagle-vLLM](https://huggingface.co/openbmb/MiniCPM4-8B-marlin-Eagle-vLLM): Quantized Eagle head for vLLM format, accelerating speculative inference for MiniCPM4-8B.
- [BitCPM4-0.5B](https://huggingface.co/openbmb/BitCPM4-0.5B): Extreme ternary quantization applied to MiniCPM4-0.5B compresses model parameters into ternary values, achieving a 90% reduction in bit width.
- [BitCPM4-1B](https://huggingface.co/openbmb/BitCPM4-1B): Extreme ternary quantization applied to MiniCPM3-1B compresses model parameters into ternary values, achieving a 90% reduction in bit width.
- [MiniCPM4-Survey](https://huggingface.co/openbmb/MiniCPM4-Survey): Based on MiniCPM4-8B, accepts users' quiries as input and autonomously generate trustworthy, long-form survey papers. (**<-- you are here**)
- [MiniCPM4-MCP](https://huggingface.co/openbmb/MiniCPM4-MCP): Based on MiniCPM4-8B, accepts users' queries and available MCP tools as input and autonomously calls relevant MCP tools to satisfy users' requirements.

## Overview

**MiniCPM4-Survey** is an open-source LLM agent model jointly developed by [THUNLP](https://nlp.csai.tsinghua.edu.cn), Renmin University of China and [ModelBest](https://modelbest.cn/en). Built on [MiniCPM4](https://github.com/OpenBMB/MiniCPM4) with 8 billion parameters, it accepts users' quiries as input and autonomously generate trustworthy, long-form survey papers.

Key features include:

- **Plan-Retrieve-Write Survey Generation Framework** — We propose a multi-agent generation framework, which operates through three core stages: planning (defining the overall structure of the survey), retrieval (generating appropriate retrieval keywords), and writing (synthesizing the retrieved information to generate coherent section-level content).

- **High-Quality Dataset Construction** — We gather and process lots of expert-written survey papers to construct a high-quality training dataset. Meanwhile, we collect a large number of research papers to build a retrieval database.

- **Multi-Aspect Reward Design** — We carefully design a reward system with three aspects (structure, content, and citations) to evaluate the quality of the surveys, which is used as the reward function in the RL training stage.

- **Multi-Step RL Training Strategy** — We propose a *Context Manager* to ensure retention of essential information while facilitating efficient reasoning, and we construct *Parallel Environment* to maintain efficient RL training cycles.  


## Quick Start

### Download the model

Download [MiniCPM4-Survey](https://huggingface.co/openbmb/MiniCPM4-Survey) from Hugging Face and place it in `model/MiniCPM4-Survey`.
We recommend using [MiniCPM-Embedding-Light](https://huggingface.co/openbmb/MiniCPM-Embedding-Light) as the embedding model, which can be downloaded from Hugging Face and placed in `model/MiniCPM-Embedding-Light`.
### Prepare the environment

You can download the [paper data](https://www.kaggle.com/datasets/Cornell-University/arxiv) from Kaggle, then extract it. You can run `python data_process.py` to process the data and generate the retrieval database. Then you can run `python build_index.py` to build the retrieval database.

```
cd ./code
curl -L -o ~/Downloads/arxiv.zip\
   https://www.kaggle.com/api/v1/datasets/download/Cornell-University/arxiv
unzip ~/Downloads/arxiv.zip -d .
mkdir data
python ./src/preprocess/data_process.py
mkdir index
python ./src/preprocess/build_index.py
```

### Model Inference

You can run the following command to build the retrieval environment and start the inference:

```bash
cd ./code
python ./src/retriever.py
bash ./scripts/run.sh
```

If you want to run with the frontend, you can run the following command:

```bash
cd ./code
python ./src/retriever.py
bash ./scripts/run_with_frontend.sh
cd frontend/minicpm4-survey
npm install
npm run dev
```

Then you can visit `http://localhost:5173` in your browser to use the model.

## Performance Evaluation

| Method                                      | Relevance | Coverage | Depth | Novelty | Avg.  | Fact Score |
|---------------------------------------------|-----------|----------|-------|---------|-------|------------|
| Naive RAG (driven by G2FT)                  | 3.25      | 2.95     | 3.35  | 2.60    | 3.04  | 43.68      |
| AutoSurvey (driven by G2FT)                 | 3.10      | 3.25     | 3.15  | **3.15**| 3.16  | 46.56      |
| Webthinker (driven by WTR1-7B)              | 3.30      | 3.00     | 2.75  | 2.50    | 2.89  | --         |
| Webthinker (driven by QwQ-32B)              | 3.40      | 3.30     | 3.30  | 2.50    | 3.13  | --         |
| OpenAI Deep Research (driven by GPT-4o)     | 3.50      |**3.95**  | 3.55  | 3.00    | **3.50**  | --         |
| MiniCPM4-Survey                            | 3.45      | 3.70     | **3.85** | 3.00    | **3.50**  | **68.73**  |
| &nbsp;&nbsp;&nbsp;*w/o* RL                  | **3.55**  | 3.35     | 3.30  | 2.25    | 3.11  | 50.24      |

*Performance comparison of the survey generation systems. "G2FT" stands for Gemini-2.0-Flash-Thinking, and "WTR1-7B" denotes Webthinker-R1-7B. FactScore evaluation was omitted for Webthinker, as it does not include citation functionality, and for OpenAI Deep Research, which does not provide citations when exporting the results.*

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

# 中文
## News

* [2025-06-05] 🚀🚀🚀我们开源了基于MiniCPM4-8B构建的MiniCPM4-Survey，能够生成可信的长篇调查报告，性能比肩更大模型。

## 概览

MiniCPM4-Survey是由[THUNLP](https://nlp.csai.tsinghua.edu.cn)、中国人民大学和[ModelBest](https://modelbest.cn)联合开发的开源大语言模型智能体。它基于[MiniCPM4](https://github.com/OpenBMB/MiniCPM4) 80亿参数基座模型，接受用户质量作为输入，自主生成可信的长篇综述论文。

主要特性包括：
- 计划-检索-写作生成框架 — 我们提出了一个多智能体生成框架，包含三个核心阶段：计划（定义综述的整体结构）、检索（生成合适的检索关键词）和写作（利用检索到的信息，生成连贯的段落）。
- 高质量数据集构建——我们收集并处理大量人类专家写作的综述论文，构建高质量训练集。同时，我们收集大量研究论文，构建检索数据库。
- 多方面奖励设计 — 我们精心设计了包含结构、内容和引用的奖励，用于评估综述的质量，在强化学习训练阶段作奖励函数。
- 多步强化学习训练策略 — 我们提出了一个上下文管理器，以确保在促进有效推理的同时保留必要的信息，并构建了并行环境，维持强化学习训练高效。


## 使用

### 下载模型
从 Hugging Face 下载[MiniCPM4-Survey](https://huggingface.co/openbmb/MiniCPM4-Survey)并将其放在model/MiniCPM4-Survey中。
我们建议使用[MiniCPM-Embedding-Light](https://huggingface.co/openbmb/MiniCPM-Embedding-Light)作为表征模型，放在model/MiniCPM-Embedding-Light中。

### 准备环境
从 Kaggle 下载论文数据，然后解压。运行`python data_process.py`，处理数据并生成检索数据库。然后运行`python build_index.py`，构建检索数据库。
``` bash
cd ./code
curl -L -o ~/Downloads/arxiv.zip\
   https://www.kaggle.com/api/v1/datasets/download/Cornell-University/arxiv
unzip ~/Downloads/arxiv.zip -d .
mkdir data
python ./src/preprocess/data_process.py
mkdir index
python ./src/preprocess/build_index.py
```

### 模型推理
运行以下命令来构建检索环境并开始推理：
``` bash
cd ./code
python ./src/retriever.py
bash ./scripts/run.sh
```
如果您想使用前端运行，可以运行以下命令：
``` bash
cd ./code
python ./src/retriever.py
bash ./scripts/run_with_frontend.sh
cd frontend/minicpm4-survey
npm install
npm run dev
```
然后你可以在浏览器中访问`http://localhost:5173`使用。

## 性能

| Method                                      | Relevance | Coverage | Depth | Novelty | Avg.  | Fact Score |
|---------------------------------------------|-----------|----------|-------|---------|-------|------------|
| Naive RAG (driven by G2FT)                  | 3.25      | 2.95     | 3.35  | 2.60    | 3.04  | 43.68      |
| AutoSurvey (driven by G2FT)                 | 3.10      | 3.25     | 3.15  | **3.15**| 3.16  | 46.56      |
| Webthinker (driven by WTR1-7B)              | 3.30      | 3.00     | 2.75  | 2.50    | 2.89  | --         |
| Webthinker (driven by QwQ-32B)              | 3.40      | 3.30     | 3.30  | 2.50    | 3.13  | --         |
| OpenAI Deep Research (driven by GPT-4o)     | 3.50      |**3.95**  | 3.55  | 3.00    | **3.50**  | --         |
| MiniCPM4-Survey                            | 3.45      | 3.70     | **3.85** | 3.00    | **3.50**  | **68.73**  |
| &nbsp;&nbsp;&nbsp;*w/o* RL                  | **3.55**  | 3.35     | 3.30  | 2.25    | 3.11  | 50.24      |

*GPT-4o对综述生成系统的性能比较。“G2FT”代表Gemini-2.0-Flash-Thinking，“WTR1-7B”代表Webthinker-R1-7B。由于Webthinker不包括引用功能，OpenAI Deep Research在导出结果时不提供引用，因此省略了对它们的FactScore评估。我们的技术报告中包含评测的详细信息。*