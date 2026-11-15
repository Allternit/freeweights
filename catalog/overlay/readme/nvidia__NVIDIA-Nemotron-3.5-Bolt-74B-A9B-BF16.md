# NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16

<div align="center" style="line-height: 1;">
  <a href="https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets" target="_blank" style="margin: 2px;">
    <img alt="Pre-Training Datasets" src="https://img.shields.io/badge/🗄️_Pre--Training_Datasets-Available_Here-76B900?logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>
  <a href="https://developer.nvidia.com/nemotron" target="_blank" style="margin: 2px;">
    <img alt="Homepage" src="https://img.shields.io/badge/🏠Nemotron Developer Page-Learn More Here!-536af5?color=76B900&logoColor=white" style="display: inline-block; vertical-align: middle;"/>
  </a>
  <a href="https://discord.gg/9xpKQtVvrk" target="_blank" style="margin: 2px;">
    <img alt="Discord" src="https://img.shields.io/badge/Discord-NVIDIA%20AI%20Developer-7289da?logo=discord&logoColor=white&color=7289da" style="display: inline-block; vertical-align: middle;"/>
  </a>
</div>

<div style="text-align: center; line-height: 1;">
  <a href="https://openmdw.ai/license/1-1/" style="margin: 2px;">
    <img alt="License" src="https://img.shields.io/badge/License-OpenMDW--1.1-f5de53" style="display: inline-block; vertical-align: middle;"/>
  </a>
</div>

![Accuracy](./accuracy.png)

## Description

NVIDIA Nemotron 3.5 Bolt 74B-A9B is a vision-language model (VLM) designed to run everyday agentic tasks locally. This is the full-precision (BF16) release of this model, intended primarily for **customization and post-training** rather than direct production inference.

The 24GB version of this model uses a native 2-bit quantization to fit in 24GB of memory and run alongside other applications. It aims to achieve the optimal balance between speed and intelligence, being faster than most popular dense models while smarter than most popular MoE models with a similar memory footprint. For latency- and throughput-optimized inference, use this 24GB version for [llama.cpp](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF) or [vLLM](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB) instead.

This model is ready for commercial or non‑commercial use.

## Model Summary

| | |
|:---|:---|
| **Total Parameters** | 74B (9B active) |
| **Architecture** | Mamba-2–Transformer hybrid LatentMoE with a C-RADIO v4-H vision encoder |
| **Precision** | BF16 (full-precision weights) |
| **Context Length** | Up to 256K tokens |
| **Inputs / Outputs** | Text, images, and video / text |
| **Deployment** | vLLM on NVIDIA Ampere (A100), Hopper (H100-80GB), or Blackwell |
| **Speculative Decoding** | LiLiCorr drafter via DFlash; 7 speculative tokens in the supplied vLLM recipes |
| **Reasoning Mode** | Chat-template controls (`enable_thinking=True/False`), inherited from the Super 3.5 VL client |
| **Recommended Sampling** | Text: temperature 1.0, top_p 0.95 (inherited from the Super 3.5 VL client) |
| **Best For** | Customization, post-training, and producing quantized variants for local agentic tasks |
| **License** | [OpenMDW-1.1](https://openmdw.ai/license/1-1/) |

## Model Overview

**Model Developer:** NVIDIA Corporation

**Model Dates:** December 2025 - May 2026

**Data Freshness:**

* The post-training data has a cutoff date of May 2026.

### What is Nemotron?

NVIDIA Nemotron™ is a family of open models with open weights, training data, and recipes, delivering leading efficiency and accuracy for building specialized AI agents.

## Quick Start

This model requires the following vLLM version or newer. Please use this command.

```sh
wget https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16/resolve/main/ultra_v3_reasoning_parser.py

export VLLM_USE_V2_MODEL_RUNNER=1

vllm serve nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 \
  --trust-remote-code \
  --load-format auto \
  --tensor-parallel-size 1 \
  --max-model-len 262144 \
  --max-num-seqs 1 \
  --enable-chunked-prefill \
  --attention-backend FLASHINFER \
  --mamba-backend flashinfer \
  --mamba-cache-mode align \
  --seed 42 \
  --allowed-local-media-path / \
  --limit-mm-per-prompt '{"video":1,"image":1}' \
  --video-pruning-rate 0.5 \
  --media-io-kwargs '{"video":{"fps":2,"num_frames":256}}' \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --reasoning-parser-plugin ultra_v3_reasoning_parser.py \
  --reasoning-parser ultra_v3
```

For more details on how to deploy and use the model — see the [Quick Start Guide](#quick-start-guide) below!

## License/Terms of Use

**Governing Terms:** Use of the models is governed by the [OpenMDW License Agreement, version 1.1](https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1).

## Benchmarks

| Benchmark | Qwen3.6-35B-A3B-BF16 | Gemma4 26B-A4B-BF16 | Nemotron 3.5 Lightning 30B-A3B-BF16 | Nemotron 3.5 Bolt 74B-A9B-24GB (IQ2) | Nemotron 3.5 Bolt 74B-A9B (BF16) |
|---|---:|---:|---:|---:|---:|
| GDPVal-AA-V2 | 25.75 | 15.33 | 18.26 | **28.47** | 31.13 |
| Terminal-Bench 2.1 | 44.38 | 37.22 | 23.46 | **50.98** | 53.93 |
| Tau3 Banking | 10.52 | 14.02 | 9.48 | **17.01** | 17.01 |
| HLE (no tools) | 19.56 | 17.42 | 10.47 | **25.30** | 28.73 |
| AA-Omniscience accuracy | 19.47 | **22.17** | 16.63 | 16.90 | 21.80 |
| SciCode | 35.33 | 40.28 | 31.38 | **41.02** | 44.49 |
| GPQA Diamond | 83.40 | 79.61 | 75.57 | **86.43** | 88.83 |
| AA-LCR | 61.06 | 57.56 | 49.19 | **64.06** | 67.38 |
| AA-Omniscience non-hallucination | 65.85 | 14.22 | **68.81** | 61.27 | 56.14 |
| PinchBench | **88.07** | 74.70 | 83.43 | 87.82 | 90.35 |
| MCP-Atlas | 51.20* | 48.4 | 46.4 | **52.20** | 55.60 |
| BrowseComp | 48.74 | 26.30 | 36.81 | **66.75** | 70.00 |
| WebArena (vision) | 36.60 | 38.2 | — | **50.86** | 50.25 |

\*The reported MCP-Atlas score for Qwen3.6-35B-A3B-BF16 is 62.8; we measured 51.2 on the 500 public MCP-Atlas tasks.

### Deployment Geography: Global

### Use Case

Nemotron-3.5-Bolt-74B-A9B-BF16 is the full-precision (BF16) release of this model, intended primarily for **customization and post-training** rather than direct production inference. It is intended to be used by developers who want to: post-train the model on their own data (SFT, RL via [NeMo RL](https://github.com/NVIDIA-NeMo/RL) and [NeMo Gym](https://github.com/NVIDIA-NeMo/Gym), or distillation), adapt it to a domain or task, produce quantized variants (NVFP4, W4A16, GGUF) for their own deployment targets, or run full-precision research and evaluation. English and coding languages are the primary languages, with Spanish, French, German, Italian, and Japanese also being supported.

For latency- and throughput-optimized inference, use the 24GB version for [llama.cpp](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF) or [vLLM](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB) instead.

### Release Date

Hugging Face 10/15/2026 via https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16

## Reference(s)

* [NVIDIA Nemotron 3 model family on Hugging Face](https://huggingface.co/collections/nvidia/nvidia-nemotron-v3)
* [NVIDIA Nemotron 3.5 Bolt 74B A9B 24GB Technical Report](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-Technical-Report.pdf)
* [NVIDIA Nemotron 3.5 Bolt 74B A9B 24GB Technical Blog](https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/)

## Model Architecture

- **Architecture Type:** Mamba2-Transformer Hybrid Mixture of Experts (MoE) with vision encoder
- **Network Architecture:** Nemotron Hybrid LatentMoE
  - Nemotron 3.5 Super LLM — hybrid Mamba-2 + MoE + Attention backbone
  - [C-RADIO v4-H](https://huggingface.co/nvidia/C-RADIOv4-H) — vision encoder for image and video frames, connected to the backbone through an MLP projector
- **Number of model parameters:** 74B Total / 9B Active


## Model Design

The model was compressed from [Nemotron 3.5 Super VL 120B-A12B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16).
The model supports up to 256K tokens of context. The prompt, visual inputs, conversation history, tool results, and generated response share this context window. Individual deployment recipes may use a smaller context window to accommodate the available GPU memory and concurrency.

## Training Methodology

**Stage 1: Compression**

We compress the Nemotron 3.5 Super VL parent checkpoint (120B-A12B) to Nemotron 3.5 Bolt 74B-A9B 24GB using [Star Elastic](https://arxiv.org/pdf/2605.07182), a push-button, router-guided architecture search and end-to-end compression algorithm invented at NVIDIA.

A budget-conditioned router heterogeneously selects routed-expert counts and MoE intermediate widths across layers, while expert top-K is fixed at 9, down from 22 in the parent model. The router’s architecture search targets a deployment footprint below 24 GB at batch size 1 and 128K context. Its budget already accounts for subsequent quantization and the precision of weights and runtime states (such as 2-bit routed-expert weights and 16-bit SSM states, to name but two, with further details provided in the quantization section). The objective is to find the architecture with the lowest knowledge-distillation loss that satisfies this memory budget, jointly optimizing architecture and model weights through knowledge distillation and a model-size penalty.

Architecture search runs at 8K context, with the router converging during the first 8B tokens. Once the architecture is fixed, recovery continues at 8K to a total of 72B tokens, followed by 48B tokens at 128K context, for 120B tokens overall. Following Star Elastic’s schedule, this takes advantage of faster knowledge recovery at 8K rather than starting directly at 128K, before extending recovery to long contexts.

**Stage 2: Vision Adaptor Training:**

We constructed the Nemotron 3.5 Bolt 74B-A9B VL model by re-attaching the trained vision tower from the parent Super 3.5 VL model back to the compressed LLM. We then performed lightweight fine-tuning of only the vision-to-language projection layers (the vision adapter), using image-text datasets previously used to train the parent model’s vision adapter.
Training used an image-only blend of approximately 6.6M samples per epoch. The blend comprised a general English mix of captioning, visual question answering, counting, and document datasets (\~2M samples), CC3M images recaptioned by Qwen3-30B (\~1.7M samples), and Chinese document OCR data (\~2.5M samples). It also included PDF and table document data, along with datasets used to train NVCLIP OCR. No video or text-only data was used during vision adapter training.

**Stage 3: Supervised Fine-Tuning**

Post vision-adaptor training, the model is trained with vision heavy SFT training to recover vision capabilities further. Before moving to multi-turn agentic training, we applied checkpoint merging as it provided more well-rounded capabilities across text and vision capabilities. The model was further trained on agentic environments and RLHF, and a final checkpoint merging yielded the final BF16 checkpoint.

For vision, we used dataset blends targeting ScreenSpot Pro (\~10.1B tokens) and WebArena (\~9.5B tokens), supplemented with small amounts of MolmoWeb/WebVoyager browsing data, CharXiv chart data, HopChain multi-page document data, and BabyVision-targeted reasoning data. For text, we used a downsampled blend of Kimi-K3-generated synthetic datasets targeting the AIME, GPQA Diamond, Terminal Bench 2.1, SciCode, AA-LCR, APEX, and LMArena benchmarks. We also incorporated a very small proportion of GLM 5.2-generated trajectories targeting MCP-Atlas. During this stage, the LLM, vision-adaptor and the vision encoder were all trained.

Following the vision-heavy SFT stage, we performed model merge with the vision adaptor only trained checkpoint using SLERP interpolation. Vision adaptor training and SFT stage with vision heavy dataset is critical to recovering vision benchmarks, as compression was performed only on the text tower of the parent model with knowledge distillation applied to recover text only benchmarks during compression. There is little to no degradation in text accuracy.

**Stage 4: Reinforcement Learning**

The model was further trained with RLHF and several stages of E2E RL training to improve agentic capabilities and minimize task completion times for tool-heavy multi-turn workloads. During RLHF, we used the Nemotron 3 Ultra GenRM model which was also trained with a reasoning penalty for token efficiency.

For further training, we have used multiple agentic environments with full E2E GRPO to target MCP and SWE tasks. We use 32 prompts with 16 generations per prompt, giving a total of 512 batch size. For the Terminal environment, it was not used for RL training, but it has been used to generate on-policy rollouts to prevent regressions during quantization. Our MCP E2E RL environment includes a simulated MCP-server with tasks requiring multi-turn tool interactions to achieve the goals. Training on this environment improved MCP use capabilities and provided around 8 nominal point increase from \~48 to \~56 on 500 public task subset out of 1000 total tasks on the MCP-Atlas benchmark. The scoring mechanism for the MCP-Atlas benchmark uses a 0.75 threshold on coverage metric, i.e. the mean claim score (each task has multiple claims that are scored separately) and it provides a binary pass / fail score per task coverage in the end. We observed further RL training continued to provide improvement on coverage scores across tasks, but it did not translate to post-threshold based official score improvements. Whether longer RL training would have eventually provided improvements on the benchmark remains an open-question. SWE-RL E2E training also used some optimizations to improve efficiency in terms of generated tokens and tool-call efficiency. Training used 64 prompts with 16 generations per prompt, giving 1,024 trajectories per optimizer step, with a maximum total sequence length of 196,608 tokens. We used Adam at a learning rate of \$3 \\times 10^{-6}\$. This training also led to accuracy and efficiency improvements on PinchBench as a generalization benefit with scores up-to 90.4 across 10-repeat average.

Nemotron-3.5-Bolt-74B-A9B-BF16 is a result of the above work.


## Input

- **Input Type(s):** Image, Video, Text
- **Input Format(s):**
  - Image: Red, Green, Blue (RGB) (jpeg, png)
  - Video: mp4, up to 2 minutes. For 1080p videos, sample up to 1 FPS / 128 frames. For lower-resolution videos such as 720p, higher temporal sampling such as 2 FPS / 256 frames may be used.
  - Text: String
- **Input Parameters:**
  - Image: Two-Dimensional (2D)
  - Video: Three-Dimensional (3D)
  - Text: One-Dimensional (1D)
- **Other Properties Related to Input:** Maximum context length up to 256K tokens. Supported languages include English, French, Spanish, Italian, German, Japanese, Hindi, Korean, Brazilian Portuguese, and Chinese.

## Output

- **Output Type(s):** Text
- **Output Format:** String
- **Output Parameters:** One-Dimensional (1D): Sequences
- **Other Properties Related to Output:** Maximum context length up to 256K tokens. Supports JSON output format, reasoning output with chain-of-thought, and tool calling.

Our AI models are designed and/or optimized to run on NVIDIA GPU-accelerated systems. By leveraging NVIDIA's hardware (e.g. GPU cores) and software frameworks (e.g., CUDA libraries), the model achieves faster training and inference times compared to CPU-only solutions.

## Software Integration

- **Runtime Engine(s):** vLLM
- **Supported Operating System(s):** Linux
* **Test Hardware:**
    * NVIDIA Hopper
        * H100
        * H200
    * NVIDIA Grace Blackwell
        * GB200
        * GB300
    * NVIDIA Blackwell
        * B200
        * B300

The integration of foundation and fine-tuned models into AI systems requires additional testing using use-case-specific data to ensure safe and effective deployment. Following the V-model methodology, iterative testing and validation at both unit and system levels are essential to mitigate risks, meet technical and functional requirements, and ensure compliance with safety and ethical standards before deployment.

## Model Version(s)

* Nemotron-3.5-Bolt-74B-A9B-BF16

Other variants and drafter models are availble.
- [nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB)
- [nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF)
- [nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16)
- [nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr)
- [nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF)

## Quick Start Guide

### vLLM

```sh
export VLLM_USE_V2_MODEL_RUNNER=1

vllm serve nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 \
  --trust-remote-code \
  --load-format auto \
  --tensor-parallel-size 1 \
  --max-model-len 262144 \
  --max-num-seqs 1 \
  --enable-chunked-prefill \
  --attention-backend FLASHINFER \
  --mamba-backend flashinfer \
  --mamba-cache-mode align \
  --seed 42 \
  --allowed-local-media-path / \
  --limit-mm-per-prompt '{"video":1,"image":1}' \
  --video-pruning-rate 0.5 \
  --media-io-kwargs '{"video":{"fps":2,"num_frames":256}}' \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --reasoning-parser-plugin ultra_v3_reasoning_parser.py \
  --reasoning-parser ultra_v3
```

### API Client

Install the OpenAI-compatible client:

```bash
pip install openai
```

#### Text and reasoning

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")
model = "nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16"

response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": "Explain why binary search takes logarithmic time."}],
    temperature=1.0,
    top_p=0.95,
    max_tokens=16384,
    extra_body={"chat_template_kwargs": {"enable_thinking": True}},
)
choice = response.choices[0]
if choice.finish_reason == "length":
    raise RuntimeError("The response reached max_tokens; increase the output budget.")
print(choice.message.content)
```

Set `enable_thinking` to `False` to disable reasoning. For medium reasoning effort, use `{"enable_thinking": True, "medium_effort": True}`. Reasoning tokens and the final answer share the `max_tokens` budget.

#### Tool calling

The model requests a tool call; the application executes it and returns the result. This complete example uses a local inventory lookup.

```python
import json
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")
model = "nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16"
inventory = {"keyboard": 12, "monitor": 5}
tools = [{"type": "function", "function": {
    "name": "get_inventory",
    "description": "Return the inventory count for a product.",
    "parameters": {
        "type": "object",
        "properties": {"product": {"type": "string", "enum": ["keyboard", "monitor"]}},
        "required": ["product"],
        "additionalProperties": False,
    },
}}]
messages = [{"role": "user", "content": "How many keyboards are in stock?"}]

def complete(history, tool_choice="auto"):
    response = client.chat.completions.create(
        model=model,
        messages=history,
        tools=tools,
        tool_choice=tool_choice,
        temperature=1.0,
        top_p=0.95,
        max_tokens=16384,
        extra_body={"chat_template_kwargs": {"enable_thinking": True}},
    )
    choice = response.choices[0]
    if choice.finish_reason == "length":
        raise RuntimeError("The response was truncated; increase max_tokens.")
    return choice.message

message = complete(messages)
messages.append(message.model_dump(exclude_none=True))
if not message.tool_calls:
    print(message.content)
else:
    for call in message.tool_calls:
        arguments = json.loads(call.function.arguments)
        if (call.function.name != "get_inventory"
                or not isinstance(arguments, dict)
                or set(arguments) != {"product"}
                or not isinstance(arguments["product"], str)
                or arguments["product"] not in inventory):
            raise ValueError("Invalid inventory tool call")
        product = arguments["product"]
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps({"product": product, "count": inventory[product]}),
        })
    print(complete(messages, tool_choice="none").content)
```

## Training, Testing, and Evaluation Datasets

### Training

#### Dataset Overview

##### Parent Corpus

The parent NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 model card reports the following foundation and post-training corpus information. Foundation training size is separate from Bolt’s 80-billion-token compression training data described below.

**Data Modality:** Text, images, and video<br>
**Foundation Training Data Size:** More than 20 trillion tokens<br>
**Foundation Data Collection Period:** 2013 to December 2025<br>
**Data Collection Method:** Hybrid: automated, manually collected, and synthetic<br>
**Labeling Method:** Hybrid: automated, manually labeled, and synthetic

The foundation corpus contains curated and synthetic text covering English, 19 other spoken languages, and 43 programming languages. Sources include webpages, dialogue, articles, code, and other written materials across math, science, legal, finance, and general knowledge domains.

The post-training corpus includes reasoning, coding, tool use, instruction following, structured outputs, chat, safety, and long-context tasks, together with image and video understanding. Synthetic trajectories are filtered for structural correctness, repetition, and task validity.

##### Bolt Training

**Data Modality:** Image, Video, Text
**Training Data Size:** 80 Billion Tokens
**Dataset partition:** *Training [100%], testing [0%], validation [0%]*
**Time period for training data collection:** 2013 to February 24, 2026
**Time period for testing data collection:** 2013 to February 24, 2026
**Time period for validation data collection:** 2013 to February 24, 2026
**Data Collection Method by dataset:** Hybrid: Automated, Manually-Collected, Synthetic
**Labeling Method by dataset:** Hybrid: Automated, Manually-Labeled, Synthetic

Nemotron 3.5 Bolt 74B-A9B is a compressed version of the NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 model. The below describes the pre-training and post-training methodology used to develop the NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 model. Whereas Super VL had a training data size of more than 20T tokens, Nemotron 3.5 Bolt 74B-A9B has a training data size of 80B tokens.

The NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 language backbone is pre-trained on a large corpus of high-quality curated and synthetically-generated text data. Our sources cover a variety of document types such as: webpages, dialogue, articles, and other written materials. The corpus spans domains including legal, math, science, finance, and more. We also include a small portion of question-answering, and alignment style data to improve model accuracy.

Multimodal training data was assembled from a diverse collection of image, video, and text datasets. Raw datasets were first converted into a standardized JSONL format with unified conversation-turn structure. Image and video datasets were paired with question-answer annotations, often regenerated or refined using large vision-language models to improve quality and consistency. Quality filtering was applied using model-based judges to remove low-quality, unsafe, or off-topic samples. Deduplication and CSAM scanning were performed across all image datasets. Data was then packed into fixed-length sequences for efficient training.

Multiple safety measures were implemented throughout the data pipeline. All image/text datasets underwent CSAM (Child Sexual Abuse Material) scanning, with results tracked per dataset. Content safety filtering was applied using two independent safety judge models to flag and remove samples containing harmful content including weapons references, criminal planning, sexual content involving minors, harassment, hate speech, profanity, threats, violence, or suicide-related content. Synthetic data generation pipelines included explicit quality and safety filtering stages.

The post-training corpus for NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 consists of high-quality curated and synthetically-generated data across text+image, text+video, and text-only samples, structured to support document reasoning, computer use, and long-horizon workflows. During post-training, we generate synthetic data by distilling trajectories, solutions, and translations from strong teacher models and agent systems, often grounded in real tasks or documents and aggressively filtered for quality. Across all pipelines we stack automated verification — compilers, numerical checks, language identification, model-based judges — to ensure our data is high quality.

For all domains, we apply a unified data filtering pipeline to ensure that only high-quality, license-compliant, and verifiable samples are used for post-training. We first discard malformed examples using structural checks (e.g., missing tool definitions when tool calls are present). We then aggressively filter reasoning traces exhibiting pathological repetition, such as repeated n-grams within a sliding window or across the entire trajectory, which we found to be a strong indicator of malformed or low-quality reasoning. Finally, based on internal audits of synthetically generated datasets, we observed that some teacher models occasionally produce reasoning traces and final responses that implicitly align with specific political entities or promote nationalistic narratives. To mitigate this, we apply targeted keyword- and regex-based filters and remove all trajectories matching such behavior.

Prior to training this model, NVIDIA implemented measures to respect EU text and data mining opt-outs by (1) respecting robots.txt instructions to the extent such signals reflect valid rights reservations, and (2) filtering datasets on any actionable metadata identifiers provided by rightsholders.

For more information about the datasets used to train this model, please see the [Public Summary of Training Content](https://developer.download.nvidia.com/assets/nemo/docs/public-summary-of-training-content-for-nvidia-nemotron.pdf)

<details>
<summary>Detailed dataset information</summary>

#### **Base Pre-Training Corpus (Nemotron 3 Foundation)**

The foundation of the model is trained on the Nemotron 3 corpus, comprising the following datasets from the [Nemotron Pretraining Datasets collection](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets):

| Dataset Collection | Token Counts | Description |
| :--- | :--- | :--- |
| **Nemotron-CC-v2** & **v2.1** | 9.1T | A massive collection of English web data filtered from Common Crawl, including 2.5T+ tokens of new organic, translated, and synthetically rephrased content. |
| **Nemotron-CC-Code-v1** | 427.9B | High-quality code tokens extracted from Common Crawl using the Lynx + LLM pipeline to preserve structure and equations. |
| **Nemotron-Pretraining-Code-v1** & **v2** & **v3** | 1.7T | Curated GitHub code references with multi-stage filtering, deduplication, and large-scale synthetic code data. |
| **Nemotron-CC-Math-v1** | 133.3B | High-quality math pre-training dataset preserving LaTeX formatting and mathematical structures. |
| **Nemotron-Pretraining-Specialized-v1** & **v1.1** & **v1.2** & **Nemotron-Pretraining-SFT-v1** | 660.0B | Synthetic datasets targeting specialized domains such as STEM reasoning and scientific coding. |
| **Nemotron-Pretraining-Legal-v1** | 4.3B | Synthetic datasets targeting the legal domain. |

#### Public Datasets

| Dataset | Collection Period |
| :---- | :---- |
| [GSM8K](https://github.com/openai/grade-school-math) | 4/23/2025 |
| [CC-NEWS](https://commoncrawl.org/blog/news-dataset-available) | 4/23/2025 |
| [Common Crawl](https://commoncrawl.org/) | 4/23/2025 |
| [Wikimedia](https://dumps.wikimedia.org/) | 4/23/2025 |
| [Bespoke-Stratos-17k](https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k) | 4/23/2025 |
| [tigerbot-kaggle-leetcodesolutions-en-2k](https://huggingface.co/datasets/TigerResearch/tigerbot-kaggle-leetcodesolutions-en-2k) | 4/23/2025 |
| [glaive-function-calling-v2](https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2) | 4/23/2025 |
| [APIGen Function-Calling](https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k) | 4/23/2025 |
| [LMSYS-Chat-1M](https://huggingface.co/datasets/lmsys/lmsys-chat-1m) | 4/23/2025 |
| [Open Textbook Library - CC BY-SA & GNU subset](https://open.umn.edu/opentextbooks/textbooks/) and [OpenStax - CC BY-SA subset](https://openstax.org/) | 4/23/2025 |
| [Advanced Reasoning Benchmark](https://github.com/TheDuckAI/arb), [tigerbot-kaggle-leetcodesolutions-en-2k](https://huggingface.co/datasets/TigerResearch/tigerbot-kaggle-leetcodesolutions-en-2k), [PRM800K](https://github.com/openai/prm800k), and [SciBench](https://github.com/mandyyyyii/scibench) | 4/23/2025 |
| [FineWeb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2) | 4/23/2025 |
| [Court Listener](https://www.courtlistener.com/help/api/bulk-data/) | Legacy Download |
| [peS2o](https://huggingface.co/datasets/allenai/peS2o) | Legacy Download |
| [OpenWebMath](https://huggingface.co/datasets/open-web-math/open-web-math) | Legacy Download |
| [BioRxiv](https://www.biorxiv.org/tdm) | Legacy Download |
| [PMC Open Access Subset](https://pmc.ncbi.nlm.nih.gov/tools/openftlist/) | Legacy Download |
| [OpenWebText2](https://openwebtext2.readthedocs.io/en/latest/) | Legacy Download |
| [Stack Exchange Data Dump](https://archive.org/details/stackexchange) | Legacy Download |
| [PubMed Abstracts](https://github.com/thoppe/The-Pile-PubMed) | Legacy Download |
| [NIH ExPorter](https://exporter.nih.gov/ExPORTER_Catalog.aspx) | Legacy Download |
| [arXiv](https://info.arxiv.org/help/bulk_data/index.html) | Legacy Download |
| [BigScience Workshop Datasets](https://github.com/bigscience-workshop/bigscience/tree/master/train/tr11-176B-ml#datasets) | Legacy Download |
| [Reddit Dataset](https://files.pushshift.io/reddit/) | Legacy Download |
| [SEC's Electronic Data Gathering, Analysis, and Retrieval (EDGAR)](https://www.sec.gov/search-filings) | Legacy Download |
| [Advanced Mathematical Problem Solving](https://github.com/hendrycks/math?tab=readme-ov-file) | Legacy Download |
| [MathPile](https://github.com/GAIR-NLP/MathPile/) | Legacy Download |
| [NuminaMath CoT](https://huggingface.co/datasets/AI-MO/NuminaMath-CoT) | Legacy Download |
| [PMC Article](https://pmc.ncbi.nlm.nih.gov/tools/textmining/) | Legacy Download |
| [FLAN](https://github.com/google-research/FLAN) | Legacy Download |
| [Advanced Reasoning Benchmark](https://github.com/TheDuckAI/arb) | Legacy Download |
| [SciBench](https://github.com/mandyyyyii/scibench) | Legacy Download |
| [WikiTableQuestions](https://huggingface.co/datasets/wikitablequestions) | Legacy Download |
| [FinQA](https://finqasite.github.io/) | Legacy Download |
| [Riddles](https://github.com/crawsome/riddles) | Legacy Download |
| [Problems in Elementary Mathematics for Home Study](https://archive.org/details/AntonovVygodskyNikitinSankinProblemsInElementaryMathematicsForHomeStudyMir1982) | Legacy Download |
| [MedMCQA](https://huggingface.co/datasets/openlifescienceai/medmcqa) | Legacy Download |
| [Cosmos QA](https://huggingface.co/datasets/allenai/cosmos_qa) | Legacy Download |
| [MCTest](https://huggingface.co/datasets/sagnikrayc/mctest) | Legacy Download |
| [AI2's Reasoning Challenge](https://huggingface.co/datasets/ai2_arc) | Legacy Download |
| [OpenBookQA](https://github.com/allenai/OpenBookQA) | Legacy Download |
| [MMLU Auxiliary Train](https://huggingface.co/datasets/cais/mmlu/viewer/all/auxiliary_train) | Legacy Download |
| [social-chemestry-101](https://huggingface.co/datasets/tasksource/social-chemestry-101) | Legacy Download |
| [Moral Stories](https://huggingface.co/datasets/demelin/moral_stories) | Legacy Download |
| [The Common Pile v0.1](https://huggingface.co/common-pile) | Legacy Download |
| [FineMath](https://huggingface.co/datasets/HuggingFaceTB/finemath) | Legacy Download |
| [MegaMath](https://huggingface.co/datasets/LLM360/MegaMath) | Legacy Download |
| [MultiverseMathHard](https://huggingface.co/datasets/Nexusflow/MultiverseMathHard) | 10/2/2025 |
| [SWE-Gym](https://huggingface.co/datasets/SWE-Gym/SWE-Gym) | 10/2/2025 |
| [WorkBench](https://github.com/olly-styles/WorkBench/tree/main/data/raw) | 10/2/2025 |
| [WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M) | 10/2/2025 |
| [OpenCodeReasoning-2](https://huggingface.co/datasets/nvidia/OpenCodeReasoning-2) | 10/2/2025 |
| [HelpSteer3](https://huggingface.co/datasets/nvidia/HelpSteer3) | 10/2/2025 |
| [opc-sft-stage2](https://huggingface.co/datasets/OpenCoder-LLM/opc-sft-stage2) | 10/2/2025 |
| [Big-Math-RL-Verified](https://huggingface.co/datasets/SynthLabsAI/Big-Math-RL-Verified) | 10/2/2025 |
| [MetaMathQA](https://huggingface.co/datasets/meta-math/MetaMathQA) | 10/2/2025 |
| [simple-arithmetic-problems](https://huggingface.co/datasets/garrethlee/simple-arithmetic-problems) | 10/2/2025 |
| [arithmetic](https://huggingface.co/datasets/EleutherAI/arithmetic) | 10/2/2025 |
| [Skywork-OR1-RL-Data](https://huggingface.co/datasets/Skywork/Skywork-OR1-RL-Data) | 10/2/2025 |
| [FastChat](https://github.com/lm-sys/FastChat/blob/main/playground/data/dummy.json) | 10/2/2025 |
| [News Commentary](https://opus.nlpl.eu/News-Commentary.php) | 10/2/2025 |
| [Essential-Web](https://huggingface.co/datasets/EssentialAI/essential-web-v1.0) | 10/2/2025 |
| [finepdfs](https://huggingface.co/datasets/HuggingFaceFW/finepdfs) | 10/2/2025 |
| [HotpotQA](https://huggingface.co/hotpot_qa/datasets) | 10/2/2025 |
| [SQuAD2.0](https://rajpurkar.github.io/SQuAD-explorer/) | 10/2/2025 |
| [NLTK Words Lists](https://www.nltk.org/nltk_data/) | 10/2/2025 |

#### **Crawled and Scraped from Online Sources by NVIDIA**

The English Common Crawl data was downloaded from the Common Crawl Foundation (see their FAQ for details on their crawling) and includes the snapshots CC-MAIN-2013-20 through CC-MAIN-2025-13. The data was subsequently deduplicated and filtered in various ways used in the Nemotron-CC data pipeline. Additionally, we extracted data for fifteen languages from the following three Common Crawl snapshots: CC-MAIN-2024-51, CC-MAIN-2025-08, CC-MAIN-2025-18. The fifteen languages included were Arabic, Chinese, Danish, Dutch, French, German, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, Swedish, and Thai. As we did not have reliable multilingual model-based quality classifiers available, we applied just heuristic filtering instead—similar to what we did for lower quality English data in the Nemotron-CC pipeline, but selectively removing some filters for some languages that did not work well. Deduplication was done in the same way as for Nemotron-CC.

The GitHub Crawl was collected using the GitHub REST API and the Amazon S3 API. Each crawl was operated in accordance with the rate limits set by its respective source, either GitHub or S3. We collect raw source code and subsequently remove any having a license which does not exist in our permissive-license set.

| Dataset | Modality | Dataset Size | Collection Period | Collecting Organisation |
| :---- | :---- | :---- | :---- | :---- |
| English Common Crawl | Text | 3.36T | 4/8/2025 | NVIDIA Advanced Deep Learning Research |
| English Common Crawl 1.1 | Text | Not disclosed | 10/2/2025 | NVIDIA Advanced Deep Learning Research |
| Multilingual Common Crawl | Text | 812.7B | 5/1/2025 | NVIDIA Advanced Deep Learning Research |
| GitHub Crawl | Text | 747.4B | 4/29/2025 | NVIDIA Advanced Deep Learning Research |
| GitHub Crawl 1.1 | Text | 172.7B | 9/30/2025 | NVIDIA Advanced Deep Learning Research |

#### Private Non-publicly Accessible Datasets of Third Parties

| Dataset | Model(s) used |
|---------|---------------|
| Global Regulation | Unknown |
| TAUS Translation Memory | Unknown |
| Scale HLE | Unknown |
| HackerRank Coding | Unknown |
| RL data for Search | Gemini 3; GPT-5 |
| Mercor SWE-AgentsV1 | Undisclosed |

#### Private Non-publicly Accessible Datasets by NVIDIA

| Dataset | Model(s) used |
|---------|---------------|
| Simple Minesweeper | Undisclosed |
| Simple Sudoku | Undisclosed |
| Multitool Typewriter Hard | Undisclosed |
| Machine Translation of News Commentary and TAUS Translation Memory | Undisclosed |
| Machine Translation of STEM - | [Qwen2.5-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct) |
| Competitive Coding RL data from Nemotron Cascade | Undisclosed |
| Long context RL | Undisclosed |
| Single-step SWE RL for patch generation | Undisclosed |
| OpenHands SWE | Undisclosed |

#### User-Sourced Data (Collected by Provider including Prompts)

No user-sourced data, including user inputs, prompts, or interactions with the AI model, was used to train this model. Data point counts, modality sizes, and provider services/products for this category are not applicable.

#### NVIDIA-Sourced Synthetic Datasets (Pre-Training)

| Dataset | Modality | Dataset Size | Seed Dataset | Model(s) used for generation |
| :---- | :---- | :---- | :---- | :---- |
| Nemotron-Pretraining-Fact-Seeking | Text | 35.0B | [FineWiki](https://huggingface.co/datasets/HuggingFaceFW/finewiki) | [Qwen3-30B-A3B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507) |
| Nemotron-Pretraining-Legal | Text | 4.3B | CommonPile (caselaw_access_project_filtered); California Code of Regulations; Judicial Ethics Opinions; [GLOBALCIT](https://globalcit.eu/); [CUAD](https://www.atticusprojectai.org/cuad); Nemotron Personas; [ToSDR Terms of Service Corpus](https://www.kaggle.com/datasets/sonu1607/tosdr-terms-of-service-corpus); CodeHima/TOS_Dataset; [ContractNLI](https://stanfordnlp.github.io/contract-nli/); CaseHOLD; Code of Federal Regulations; [Canadian Case Law](https://huggingface.co/datasets/a2aj/canadian-case-law) (subsets that allow commercial use) | [Qwen3-235B-A22B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507) |
| Nemotron-Pretraining-Formal-Logic | Text | 128M | [Nemotron Personas](https://huggingface.co/datasets/nvidia/Nemotron-Personas-USA) | [Qwen3-235B-A22B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507) |
| Nemotron-Pretraining-Economics | Text | 73.4M | - | [Qwen3-235B-A22B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507) |
| Nemotron-Pretraining-Multiple-Choice | Text | 1.6B | [MMLU Auxiliary Train](https://huggingface.co/datasets/cais/mmlu/viewer/all/auxiliary_train) | [DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3); [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B) |
| Nemotron-Pretraining-Code-Concepts | Text | 7.3B | - | [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b); [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) |
| Nemotron-Pretraining-Unconditional-Algorithmic | Text | 196.5M | - | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b); [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B) |
| More Synthetic Tasks from DeepSeek-V3 and Qwen3-235B-A22B | Text | 1.1B | train splits of acp_bench; ai2_arc; babi; gsm8k; hendrycks_math; IFEval; MedText; mediqa_qa; mlqa; MMLU-Pro; mmlu-pro-plus; MMLU-ProX; nq_open; tinyGSM8k; truthful_qa; truthfulqa-multi; MATH-lighteval; mmlu; awesome-chatgpt-prompts; super_glue | [DeepSeek v3](https://huggingface.co/deepseek-ai/DeepSeek-V3); [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B) |
| Synthetic Tasks from DeepSeek-V3 and Qwen3-235B-A22B | Text | 6.7B | train splits of Into the Unknown; AI2 ARC (AI2 Reasoning Challenge); BLiMP (Benchmark of Linguistic Minimal Pairs); CommonSenseQA; GLUE; HeadQA; Hendrycks Ethics; Memo Trap; modus-tollens; NeQA; pattern-matching-suppression; mastermind_24_mcq_random; mastermind_24_mcq_close; quote-repetition; redefine-math; Repetitive Algebra; sig-figs; MMLU-Pro; MC-TACO; MedConceptsQA; MMLU_dataset; OpenbooksQA; PIQA (Physical Interaction Question Answering); SocialIQA; SuperGLUE; tinyAI2_arc; tinyMMLU; tinyWinogrande; TruthfulQA; WebQuestions; Winogrande; GPQA; MBPP | [DeepSeek v3](https://huggingface.co/deepseek-ai/DeepSeek-V3); [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B) |
| Synthetic Art of Problem Solving from DeepSeek-R1 | Text | 40B | [Art of Problem Solving](https://artofproblemsolving.com/company); [American Mathematics Competitions 8](https://artofproblemsolving.com/wiki/index.php/AMC_8_Problems_and_Solutions); [American Mathematics Competitions 10](https://artofproblemsolving.com/wiki/index.php/AMC_10_Problems_and_Solutions) | [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1) |
| Synthetic Moral Stories and Social Chemistry from Qwen3-235B-A22B-Thinking-2507 and Mixtral-8x22B-v0.1 | Text | 15.2M | [social-chemestry-101](https://huggingface.co/datasets/tasksource/social-chemestry-101); [Moral Stories](https://huggingface.co/datasets/demelin/moral_stories) | [Qwen3-235B-A22B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507); [Mixtral-8x22B-v0.1](https://huggingface.co/mistralai/Mixtral-8x22B-v0.1) |
| Synthetic Moral Stories and Social Chemistry from Mixtral-8x22B-v0.1 | Text | 327M | [social-chemestry-101](https://huggingface.co/datasets/tasksource/social-chemestry-101); [Moral Stories](https://huggingface.co/datasets/demelin/moral_stories) | [Mixtral-8x22B-v0.1](https://huggingface.co/mistralai/Mixtral-8x22B-v0.1) |
| Synthetic Social Sciences seeded with OpenStax from DeepSeek-V3, Mixtral-8x22B-v0.1, and Qwen2.5-72B | Text | 83.6M | [OpenStax - CC BY-SA subset](https://openstax.org/) | [DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3); [Mixtral-8x22B-v0.1](https://huggingface.co/mistralai/Mixtral-8x22B-v0.1); [Qwen2.5-72B](https://huggingface.co/Qwen/Qwen2.5-72B) |
| Synthetic Health Sciences seeded with OpenStax from DeepSeek-V3, Mixtral-8x22B-v0.1, and Qwen2.5-72B | Text | 9.7M | [OpenStax - CC BY-SA subset](https://openstax.org/) | [DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3); [Mixtral-8x22B-v0.1](https://huggingface.co/mistralai/Mixtral-8x22B-v0.1); [Qwen2.5-72B](https://huggingface.co/Qwen/Qwen2.5-72B) |
| Synthetic STEM seeded with OpenStax, Open Textbook Library, and GSM8K from DeepSeek-R1, DeepSeek-V3, DeepSeek-V3-0324, and Qwen2.5-72B | Text | 175M | [OpenStax - CC BY-SA subset](https://openstax.org/); [GSM8K](https://github.com/openai/grade-school-math); [Open Textbook Library - CC BY-SA & GNU subset](https://open.umn.edu/opentextbooks/textbooks/) | [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1), [DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3); [DeepSeek-V3-0324](https://huggingface.co/deepseek-ai/DeepSeek-V3-0324); [Qwen2.5-72B](https://huggingface.co/Qwen/Qwen2.5-72B) |
| [Nemotron-PrismMath](https://huggingface.co/datasets/nvidia/Nemotron-PrismMath) | Text | 4.6B | [Big-Math-RL-Verified](https://huggingface.co/datasets/SynthLabsAI/Big-Math-RL-Verified); [OpenR1-Math-220k](https://huggingface.co/datasets/open-r1/OpenR1-Math-220k) | [Qwen2.5-0.5B-instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct), [Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct); [DeepSeek-R1-Distill-Qwen-32B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B) |
| Synthetic Question Answering Data from Papers and Permissible Books from Qwen2.5-72B-Instruct | Text | 350M | [arXiv](https://info.arxiv.org/help/bulk_data/index.html); [National Institutes of Health ExPorter](https://www.nih.gov/); [BioRxiv](https://www.biorxiv.org/tdm); [PMC Article](https://pmc.ncbi.nlm.nih.gov/tools/textmining/); [USPTO Backgrounds](https://data.uspto.gov/apis/transition-guide/bdss#pats); [peS2o](https://huggingface.co/datasets/allenai/peS2o); Global Regulation; [CORE](https://core.ac.uk/documentation/dataset); [PG-19](https://github.com/google-deepmind/pg19); [DOAB CC BY & CC BY-SA subset](https://www.doabooks.org/en); [NDLTD](https://ndltd.org/thesis-resources/global-etd-search/) | [Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct) |
| Synthetic Rephrased [Math Data from Common Crawl](https://huggingface.co/datasets/nvidia/Nemotron-MIND) from phi-4 | Text | 73B | [Common Crawl](https://commoncrawl.org/latest-crawl) | [phi-4](https://huggingface.co/microsoft/phi-4) |
| Synthetic Math Data from Common Crawl 4plus | Text | 52.3B | [Common Crawl](https://commoncrawl.org/latest-crawl) | [phi-4](https://huggingface.co/microsoft/phi-4) |
| Synthetic Math Data from Common Crawl 3 | Text | 80.9B | [Common Crawl](https://commoncrawl.org/latest-crawl) | [phi-4](https://huggingface.co/microsoft/phi-4) |
| Synthetic AGIEval seeded with AQUA-RAT, LogiQA, and AR-LSAT from DeepSeek-V3 and DeepSeek-V3-0324 | Text | 4.0B | [AQUA-RAT](https://huggingface.co/datasets/deepmind/aqua_rat); [LogiQA](https://huggingface.co/datasets/lucasmccabe/logiqa); [AR-LSAT](https://github.com/zhongwanjun/AR-LSAT) | [DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3); [DeepSeek-V3-0324](https://huggingface.co/deepseek-ai/DeepSeek-V3-0324) |
| Synthetic AGIEval seeded with AQUA-RAT, LogiQA, and AR-LSAT from Qwen3-30B-A3B | Text | 4.2B | [AQUA-RAT](https://huggingface.co/datasets/deepmind/aqua_rat); [LogiQA](https://huggingface.co/datasets/lucasmccabe/logiqa); [AR-LSAT](https://github.com/zhongwanjun/AR-LSAT) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) |
| Synthetic Art of Problem Solving from Qwen2.5-32B-Instruct, Qwen2.5-Math-72B, Qwen2.5-Math-7B, and Qwen2.5-72B-Instruct | Text | Undisclosed | [Art of Problem Solving](https://artofproblemsolving.com/company); [American Mathematics Competitions 8](https://artofproblemsolving.com/wiki/index.php/AMC_8_Problems_and_Solutions); [American Mathematics Competitions 10](https://artofproblemsolving.com/wiki/index.php/AMC_10_Problems_and_Solutions); [GSM8K](https://github.com/openai/grade-school-math); [PRM800K](https://github.com/openai/prm800k) | [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct); [Qwen2.5-Math-72B](https://huggingface.co/Qwen/Qwen2.5-Math-72B); [Qwen2.5-Math-7B](https://huggingface.co/Qwen/Qwen2.5-Math-7B); [Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct) |
| Synthetic MMLU Auxiliary Train from DeepSeek-R1 | Text | 0.5B | [MMLU Auxiliary Train](https://huggingface.co/datasets/cais/mmlu/viewer/all/auxiliary_train) | [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1) |
| Synthetic Long Context Continued Post-Training Data from Papers and Permissible Books from Qwen2.5-72B-Instruct | Text | Undisclosed | [arXiv](https://info.arxiv.org/help/bulk_data/index.html); [National Institutes of Health ExPorter](https://www.nih.gov/); [BioRxiv](https://www.biorxiv.org/tdm); [PMC Article](https://pmc.ncbi.nlm.nih.gov/tools/textmining/); [USPTO Backgrounds](https://data.uspto.gov/apis/transition-guide/bdss#pats); [peS2o](https://huggingface.co/datasets/allenai/peS2o); Global Regulation; [CORE](https://core.ac.uk/documentation/dataset); [PG-19](https://github.com/google-deepmind/pg19); [DOAB CC BY & CC BY-SA subset](https://www.doabooks.org/en); [NDLTD](https://ndltd.org/thesis-resources/global-etd-search/) | [Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct) |
| Synthetic Common Crawl from Qwen3-30B-A3B and Mistral-Nemo-12B-Instruct | Text | 415.8B | [Common Crawl](https://commoncrawl.org/) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B); [Mistral-NeMo-12B-Instruct](https://huggingface.co/nvidia/Mistral-NeMo-12B-Instruct) |
| Synthetic Multilingual Data from Common Crawl from Qwen3-30B-A3B | Text | Undisclosed | [Common Crawl](https://commoncrawl.org/) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) |
| Synthetic Multilingual Data from Wikimedia from Qwen3-30B-A3B | Text | Undisclosed | [Wikimedia](https://dumps.wikimedia.org/) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) |
| Synthetic Math Data from Wikimedia from Nemotron-4-340B-Instruct | Text | Undisclosed | - | [Nemotron-4-340B-Instruct](https://huggingface.co/nvidia/Nemotron-4-340B-Instruct) |
| Synthetic Common Crawl Code from phi-4 | Text | 427.9B | [Common Crawl](https://commoncrawl.org/latest-crawl) | [phi-4](https://huggingface.co/microsoft/phi-4) |
| Synthetic Scientific Coding from Qwen3-235B-A22B | Text | 1.2B | [Wikimedia](https://dumps.wikimedia.org/) | [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507) |
| Tool Calling Data | Text | 26.2B | - | [Qwen3-235B-A22B-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507); [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) |
| Synthetic Essential-Web from QwQ-32B | Text | 28.1B | [Essential-Web](https://huggingface.co/datasets/EssentialAI/essential-web-v1.0) | [QwQ-32B](https://huggingface.co/Qwen/QwQ-32B) |
| Translated Synthetic Crawl | Text | 389.9B | [Common Crawl](https://commoncrawl.org/) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) |
| Translated Synthetic Wikipedia | Text | 7.9B | [Wikimedia](https://dumps.wikimedia.org/) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) |
| Synthetic Long Context from Qwen3-235B-A22B-Instruct-2507 | Text | Undisclosed | [CORE](https://core.ac.uk/documentation/dataset); [PG-19](https://github.com/google-deepmind/pg19); [DOAB CC BY & CC BY-SA subset](https://www.doabooks.org/en); [NDLTD](https://ndltd.org/thesis-resources/global-etd-search/) | [Qwen3-235B-A22B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507) |
| Synthetic Search STEM OPENQ from DeepSeek-R1-0528 | Text | Undisclosed | - | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic MCQ from Qwen2.5-32B-Instruct and DeepSeek-R1-0528 | Text | Undisclosed | - | [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct); [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic Offline Search MCQA HLE from DeepSeek-R1-0528 | Text | Undisclosed | - | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic Offline Search MCQA GPQA from Qwen3-235B-A22B and DeepSeek-R1-0528 | Text | Undisclosed | - | [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B); [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic Human Preference from QwQ-32B, Qwen3-30B-A3B, Qwen3-235B-A22B, Qwen3-235B-A22B-Instruct-2507, Mistral-Small-3.1-24B-Instruct-2503, Mistral-Small-3.2-24B-Instruct-2506, MiniMax-M1-80k, MiniMax-M1-40k, Kimi-K2-Instruct, DeepSeek-V3-0324, DeepSeek-R1-0528 | Text | Undisclosed | - | [QwQ-32B](https://huggingface.co/Qwen/QwQ-32B); [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B); [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B); [Qwen3-235B-A22B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507); [Mistral-Small-3.1-24B-Instruct-2503](https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503); [Mistral-Small-3.2-24B-Instruct-2506](https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506); [MiniMax-M1-80k](https://huggingface.co/MiniMaxAI/MiniMax-M1-80k); [MiniMax-M1-40k](https://huggingface.co/MiniMaxAI/MiniMax-M1-40k); [Kimi-K2-Instruct](https://huggingface.co/moonshotai/Kimi-K2-Instruct); [DeepSeek-V3-0324](https://huggingface.co/deepseek-ai/DeepSeek-V3-0324); [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic WildChat-1M and arena-human-preference-140k from DeepSeek-R1, gemma-2-2b-it, gemma-3-27b-it, gpt-oss-20b, gpt-oss-120b, Mistral-7B-Instruct-v0.3, Mixtral-8x22B-Instruct-v0.1, Nemotron-4-340B-Instruct, NVIDIA-Nemotron-Nano-9B-v2, Phi-4-mini-instruct, Phi-3-small-8k-instruct, Phi-3-medium-4k-instruct, Qwen3-235B-A22B, QwQ-32B | Text | Undisclosed | [WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M); [arena-human-preference-140k](https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k) | [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1); [gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it); [gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it); [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b); [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b); [Mistral-7B-Instruct-v0.3](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3); [Mixtral-8x22B-Instruct-v0.1](https://huggingface.co/mistralai/Mixtral-8x22B-Instruct-v0.1); [Nemotron-4-340B-Instruct](https://huggingface.co/nvidia/Nemotron-4-340B-Instruct); [NVIDIA-Nemotron-Nano-9B-v2](https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2); [Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct); [Phi-3-small-8k-instruct](https://huggingface.co/microsoft/Phi-3-small-8k-instruct); [Phi-3-medium-4k-instruct](https://huggingface.co/microsoft/Phi-3-medium-4k-instruct); [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B); [QwQ-32B](https://huggingface.co/Qwen/QwQ-32B) |
| Synthetic Code from Qwen3-32B | Text | Undisclosed | English Common Crawl; English Common Crawl 1.1 | [Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B) |
| Synthetic OpenCodeReasoning from DeepSeek-R1 | Text | Undisclosed | [OpenCodeReasoning](https://huggingface.co/datasets/nvidia/OpenCodeReasoning) | [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1) |
| Synthetic OpenCodeReasoning from DeepSeek-R1-0528 | Text | Undisclosed | [OpenCodeReasoning](https://huggingface.co/datasets/nvidia/OpenCodeReasoning) | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic HackerRank Coding from DeepSeek-R1-0528 | Text | Undisclosed | HackerRank Coding Dataset | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic LIMO from DeepSeek-R1-0528 | Text | Undisclosed | [LIMO](https://huggingface.co/datasets/GAIR/LIMO) | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic SCP from DeepSeek-R1-0528 | Text | Undisclosed | [SCP-116K](https://huggingface.co/datasets/EricLu/SCP-116K) | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic Stack Exchange from DeepSeek-R1-0528 | Text | Undisclosed | [Stack Exchange](https://archive.org/details/stackexchange) | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic Stack Exchange from gpt-oss-120b and Qwen2.5-32B-Instruct | Text | Undisclosed | [Stack Exchange](https://archive.org/details/stackexchange) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b); [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct) |
| Synthetic Stack Exchange from gpt-oss-120b | Text | Undisclosed | [Stack Exchange](https://archive.org/details/stackexchange) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) |
| Synthetic Art of Problem Solving from gpt-oss-120b and Qwen2.5-32B-Instruct | Text | Undisclosed | [Art of Problem Solving](https://artofproblemsolving.com/company); [American Mathematics Competitions 8](https://artofproblemsolving.com/wiki/index.php/AMC_8_Problems_and_Solutions); [American Mathematics Competitions 10](https://artofproblemsolving.com/wiki/index.php/AMC_10_Problems_and_Solutions) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b); [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct) |
| Synthetic Common Crawl from Qwen3-30B-A3B | Text | Undisclosed | [Common Crawl](https://commoncrawl.org/) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) |
| Synthetic Wikipedia from Qwen3-30B-A3B | Text | Undisclosed | [Wikimedia](https://dumps.wikimedia.org/) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) |
| Synthetic Essential-Web from Qwen3-30B-A3B and Qwen3-235B-A22B-Thinking-2507 | Text | Undisclosed | [Essential-Web](https://huggingface.co/datasets/EssentialAI/essential-web-v1.0) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B); [Qwen3-235B-A22B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507) |
| Synthetic Essential-Web from gpt-oss-120b | Text | Undisclosed | [Essential-Web](https://huggingface.co/datasets/EssentialAI/essential-web-v1.0) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) |
| Synthetic Textbook Math from Qwen3-30B-A3B, Qwen3-235B-A22B, phi-4 | Text | Undisclosed | [Common Crawl](https://commoncrawl.org/); [FineMath](https://huggingface.co/datasets/HuggingFaceTB/finemath) | [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B); [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B); [phi-4](https://huggingface.co/microsoft/phi-4) |
| Synthetic Math and Code from DeepSeek-R1 and DeepSeek-R1-0528 | Text | Undisclosed | [Magicoder-Evol-Instruct-110K](https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K); [opc-sft-stage2](https://huggingface.co/datasets/OpenCoder-LLM/opc-sft-stage2); [TACO](https://huggingface.co/datasets/BAAI/TACO); [OpenCodeReasoning](https://huggingface.co/datasets/nvidia/OpenCodeReasoning); [OpenMathReasoning](https://huggingface.co/datasets/nvidia/OpenMathReasoning); [NuminaMath CoT](https://huggingface.co/datasets/AI-MO/NuminaMath-CoT) | [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1); [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic Math from gpt-oss-120b and Qwen2.5-32B-Instruct | Text | Undisclosed | - | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b); [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct) |
| Synthetic OpenMathReasoning from gpt-oss-120b and Qwen2.5-32B-Instruct | Text | Undisclosed | [OpenMathReasoning](https://huggingface.co/datasets/nvidia/OpenMathReasoning) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b); [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct) |
| Synthetic KernelBook from DeepSeek-R1-0528 | Text | Undisclosed | [KernelBook](https://huggingface.co/datasets/GPUMODE/KernelBook) | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic Scale HLE from gpt-oss-120b | Text | Undisclosed | Scale HLE | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) |
| Synthetic CDQuestions from gpt-oss-120b | Text | Undisclosed | [CDQuestions](https://cdquestions.com/) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) |
| Synthetic GPQA from gpt-oss-120b and Qwen2.5-32B-Instruct | Text | Undisclosed | [Stack Exchange](https://archive.org/details/stackexchange) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b); [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct) |
| Synthetic Vedantu from gpt-oss-120b | Text | Undisclosed | [Vedantu](https://www.vedantu.com/) | [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) |
| Synthetic Search STEM MCQ from Qwen3-235B-A22B and DeepSeek-R1-0528 | Text | Undisclosed | - | [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B); [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic OpenSTEM from Qwen2.5-32B-Instruct and DeepSeek-R1-0528 | Text | Undisclosed | - | [Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct); [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic MCQ10 from DeepSeek-R1-0528 | Text | Undisclosed | - | [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) |
| Synthetic MCQ4 from Qwen3-235B-A22B, DeepSeek-R1-0528, and Qwen3-235B-A22B-Instruct-2507 | Text | Undisclosed | - | [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B); [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528); [Qwen3-235B-A22B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507) |

#### NVIDIA-Sourced Synthetic Datasets (Post-Training)

| Dataset | Modality | Dataset Size | Seed Dataset | Model(s) used for generation |
| :---- | :---- | :---- | :---- | :---- |
| Synthetic Competitive MATH Proofs from DeepSeek-V4-Pro | Text | Undisclosed | [AMC 8 Problems and Solutions, AMC 10 Problems and Solution, and AIME Problems and Solutions] | [deepseek-ai/DeepSeek-V4-Pro] |
| Synthetic Hermes Agent Reasoning Traces | Text | Undisclosed | [lambda/hermes-agent-reasoning-traces] | [hermes-agent-generator] |
| Synthetic Competitive Coding from DeepSeek-V4-Pro | Text | Undisclosed | [NVCompetitiveCodingV1] | [deepseek-ai/DeepSeek-V4-Pro] |

_The publisher's README is longer; it is cut here. Read the rest at the source._
