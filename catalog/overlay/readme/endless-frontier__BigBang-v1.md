# BigBang-V1

## Introduction

As Large Language Models (LLMs) approach human expert performance, their continued development is increasingly constrained by training tasks conceived within the limits of human knowledge. We argue that open-ended capability growth requires verifiable frontier tasks: problems at the boundary of current knowledge whose solutions can be objectively evaluated through formal methods, computation, simulation, or domain-specific tools. To this end, we introduce BigBang, a general-purpose LLM evolved from Qwen 3.6 35B-A3B through efficient post-training with an adversarial, self-evolving synthetic data framework. The framework contains two core components: (1) generator agents that continually propose and solve increasingly challenging scientific and technical problems, and (2) critic agents that evaluate correctness, difficulty, scalability, and diversity, while using held-out real research tasks to calibrate the evolving synthetic-data distribution. Through iterative generator–critic interaction, the framework constructs approximately 10,000 high-difficulty post-training examples across multiple domains. Despite the modest data scale, BigBang substantially outperforms its base model across scientific research, reasoning, coding, and tool-use benchmarks, achieving aggregate performance between DeepSeek V4 Flash (284B) and DeepSeek V4 Pro (1.6T). These results demonstrate that self-evolving synthesis of verifiable frontier tasks provides a promising path toward scalable and open-ended intelligence.

## Main Results

BigBang-V1 on eight representative benchmarks spanning long-horizon search, software engineering, scientific research, and AI research. BigBang-V1 obtains the highest reported score among the selected 35B models on all eight benchmarks. It even exceeds DeepSeek V4 Pro Preview (1.6T) on FrontierScience Research, Humanity's Last Exam, PaperBench(Code-Dev) and BioMysteryBench-HD.

<p align="center">
  <a href="./bigbang_main_figure.pdf">
    <img src="./bigbang_main_figure.png" alt="BigBang-V1 on eight representative benchmarks" width="100%">
  </a>
</p>

<p align="center"><em>BigBang-V1 on eight representative benchmarks. Click the figure to view the PDF.</em></p>

## Benchmark Results

Comparison of BigBang-V1 with representative closed- and open-source frontier models, together with models at the 35B scale, across benchmarks for long-horizon search, coding, scientific research, and AI research. The "`-`" indicates the score is not publicly available or not tested.

| Benchmark | Claude<br>Opus 4.8 | Gemini<br>3.1 Pro | GPT<br>5.5 | GLM<br>5.2 | DeepSeek V4<br>Flash Preview | DeepSeek V4<br>Pro Preview | Step-3.7<br>Flash | Qwen3.6<br>35B-A3B | Nex-N2<br>mini | Agents<br>A1 | Apodex<br>1.0-mini | BigBang<br>V1 |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **Long-horizon Search** |  |  |  |  |  |  |  |  |  |  |  |  |
| BrowseComp | 84.3 | 85.9 | 84.4 | 68.7 | 73.2 | 83.4 | 75.8 | 67.9 | 74.1 | 48.5 | 73.9 | **76.5** |
| XBench | 61.4 | - | 72.4 | 65.8 | 62.2 | 64.8 | 50.8 | 32.6 | 57.2 | 52.4 | 61.8 | **58.4** |
| **Coding Tasks** |  |  |  |  |  |  |  |  |  |  |  |  |
| SWE-Bench Pro | 69.2 | 54.2 | 58.6 | 62.1 | 52.6 | 55.4 | 56.3 | 43.6 | 50.2 | 42.3 | 38.7 | **54.2** |
| SciCode-V-Sub | 92.3 | - | 95.1 | 84.3 | 83.7 | 90.2 | - | 56.5 | 39.0 | 64.1 | - | **68.6** |
| SciCode-V-Main | 78.1 | - | 90.6 | 70.3 | 68.6 | 78.1 | - | 26.6 | 15.6 | 50.0 | - | **50.0** |
| **Scientific Research** |  |  |  |  |  |  |  |  |  |  |  |  |
| FS-R | 45.2 | 24.8 | 58.3 | 52.4 | 37.7 | 40.7 | 37.2 | 11.9 | 36.8 | 38.4 | 29.6 | **46.2** |
| HLE | 57.9 | 51.4 | 52.2 | 54.7 | 45.1 | 48.2 | 47.2 | 36.2 | 38.4 | 46.3 | 45.3 | **50.3** |
| BioMystery-HS | 88.5 | - | 76.7 | 75.3 | 68.0 | 64.4 | 57.5 | 44.8 | 42.9 | 48.9 | 50.2 | **57.5** |
| BioMystery-HD | 42.4 | - | 23.5 | 21.6 | 23.5 | 13.7 | 11.8 | 2.0 | 5.9 | 2.0 | 5.9 | **15.7** |
| **AI Research** |  |  |  |  |  |  |  |  |  |  |  |  |
| MLE-Bench(Lite) | 63.6 | - | 59.1 | 72.7 | 40.9 | 59.1 | 40.9 | 31.8 | 18.2 | 27.3 | 27.3 | **59.1** |
| PaperBench(Code-Dev) | - | - | 64.2 | 63.6 | 40.4 | 50.4 | 36.7 | 30.7 | 14.8 | 17.3 | 20.5 | **53.6** |

## Quickstart

For streamlined integration, we recommend using BigBang-V1 via APIs. Below is a guide to use BigBang-V1 via OpenAI-compatible API. 

### Serving BigBang-V1

BigBang-V1 can be served via APIs with popular inference frameworks.
In the following, we show example commands to launch OpenAI-Compatible API servers for BigBang-V1 models.

> [!Important]
> Inference efficiency and throughput vary significantly across frameworks. 
> We recommend using the latest framework versions to ensure optimal performance and compatibility.
> For production workloads or high-throughput scenarios, dedicated serving engines such as SGLang, KTransformers or vLLM are strongly recommended.

> [!Important]
> The model has a default context length of 262,144 tokens.
> If you encounter out-of-memory (OOM) errors, consider reducing the context window. 
> However, because BigBang-V1 leverages extended context for complex tasks, we advise maintaining a context length of at least 128K tokens to preserve thinking capabilities.

#### SGLang

[SGLang](https://github.com/sgl-project/sglang) is a fast serving framework for large language models and vision language models.
`sglang>=0.5.10` is recommended for BigBang-V1, which can be installed using the following command in a fresh environment:
```shell
uv pip install sglang[all]
```
See [its documentation](https://docs.sglang.ai/get_started/install.html) for more details.

The following will create API endpoints at `http://localhost:8000/v1`:

- **Standard Version**: The following command can be used to create an API endpoint with maximum context length 262,144 tokens using tensor parallel on 8 GPUs.
    
    ```shell
    python -m sglang.launch_server --model-path endless-frontier/BigBang-v1 --port 8000 --tp-size 8 --mem-fraction-static 0.8 --context-length 262144 --reasoning-parser qwen3
    ```

- **Tool Use**: To support tool use, you can use the following command.
    
    ```shell
    python -m sglang.launch_server --model-path endless-frontier/BigBang-v1 --port 8000 --tp-size 8 --mem-fraction-static 0.8 --context-length 262144 --reasoning-parser qwen3 --tool-call-parser qwen3_coder
    ```

- **Multi-Token Prediction (MTP)**: The following command is recommended for MTP:
    
    ```shell
    python -m sglang.launch_server --model-path endless-frontier/BigBang-v1 --port 8000 --tp-size 8 --mem-fraction-static 0.8 --context-length 262144 --reasoning-parser qwen3 --speculative-algo NEXTN --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4
    ```

For detailed deployment guide, see the [SGLang Qwen3.5 Cookbook](https://lmsysorg.mintlify.app/cookbook/llm/Qwen/Qwen3.5).

#### vLLM

[vLLM](https://github.com/vllm-project/vllm) is a high-throughput and memory-efficient inference and serving engine for LLMs.
`vllm>=0.19.0` is recommended for BigBang-V1, which can be installed using the following command in a fresh environment:
```shell
uv pip install vllm --torch-backend=auto
```
See [its documentation](https://docs.vllm.ai/en/stable/getting_started/installation/index.html) for more details. 


The following will create API endpoints at `http://localhost:8000/v1`:

- **Standard Version**: The following command can be used to create an API endpoint with maximum context length 262,144 tokens using tensor parallel on 8 GPUs.

    ```shell
    vllm serve endless-frontier/BigBang-v1 --port 8000 --tensor-parallel-size 8 --max-model-len 262144 --reasoning-parser qwen3 
    ```

- **Tool Call**: To support tool use, you can use the following command.
    
    ```shell
    vllm serve endless-frontier/BigBang-v1 --port 8000 --tensor-parallel-size 8 --max-model-len 262144 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder 
    ```

- **Multi-Token Prediction (MTP)**: The following command is recommended for MTP:

    ```shell
    vllm serve endless-frontier/BigBang-v1 --port 8000 --tensor-parallel-size 8 --max-model-len 262144 --reasoning-parser qwen3 --speculative-config '{"method":"qwen3_next_mtp","num_speculative_tokens":2}'
    ```

- **Text-Only**: The following command skips the vision encoder and multimodal profiling to free up memory for additional KV cache:
    
    ```shell
    vllm serve endless-frontier/BigBang-v1 --port 8000 --tensor-parallel-size 8 --max-model-len 262144 --reasoning-parser qwen3 --language-model-only
    ```

For detailed deployment guide, see the [vLLM Qwen3.5 Recipe](https://docs.vllm.ai/projects/recipes/en/latest/Qwen/Qwen3.5.html).

#### KTransformers
 
[KTransformers](https://github.com/kvcache-ai/ktransformers) is a flexible framework for experiencing cutting-edge LLM inference optimizations with CPU-GPU heterogeneous computing.
For running BigBang-V1 with KTransformers, see the [KTransformers Deployment Guide](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/Qwen3.5.md).
 
#### Hugging Face Transformers

Hugging Face Transformers contains a _lightweight_ server which can be used for quick testing and moderate load deployment.
The latest `transformers` is required for BigBang-V1:
```shell
pip install "transformers[serving]"
```
See [its documentation](https://huggingface.co/docs/transformers/main/serving) for more details. Please also make sure torchvision and pillow are installed.

Then, run `transformers serve` to launch a server with API endpoints at `http://localhost:8000/v1`; it will place the model on accelerators if available:
```shell
transformers serve endless-frontier/BigBang-v1 --port 8000 --continuous-batching
```
