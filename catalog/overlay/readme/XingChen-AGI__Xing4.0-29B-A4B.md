<h1 align="center">Xing4.0-29B-A4B</h1>

<p align="center"><b>From "answering questions" to "getting things done" — an agentic MoE flagship<br>with 29B total / 4B active parameters and a native 256K context.</b></p>

<p align="center">
  🦉 <a href="https://github.com/XingChen-AGI/Xing4.0-29B-A4B">GitHub</a> •
  🤗 <a href="https://huggingface.co/XingChen-AGI">Hugging Face Org</a> •
  🤖 <a href="https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B">ModelScope</a> •
  🪐 <a href="https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-A4B">Modelers</a> •
  ⚡ <a href="https://github.com/XingChen-AGI/xing4-vllm-plugin">vLLM Plugin</a> •
  ☁️ <a href="https://www.teleai.com.cn/">Tianyi AI Platform</a>
</p>

<p align="center">
  <a href="https://github.com/XingChen-AGI/Xing4.0-29B-A4B"><img alt="Parameters" src="https://img.shields.io/badge/Params-29B%20%2F%204B%20active-7C3AED"></a>
  <a href="https://github.com/XingChen-AGI/Xing4.0-29B-A4B"><img alt="Context" src="https://img.shields.io/badge/Context-256K%20%E2%86%92%20512K-orange"></a>
  <a href="https://github.com/XingChen-AGI/Xing4.0-29B-A4B"><img alt="SWE-bench Verified" src="https://img.shields.io/badge/SWE--bench%20Verified-75.0-brightgreen"></a>
  <a href="https://github.com/XingChen-AGI/Xing4.0-29B-A4B/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-blue"></a>
</p>

<p align="center">
  <b>Pick a build:</b>&nbsp; <b>BF16 (this repo)</b> • <a href="https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8">FP8</a> • <a href="https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF">GGUF</a> (2–8-bit, 11–34 GB, runs in llama.cpp) • <a href="https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8">W8A8</a>
</p>

---

## Contents

- [Introduction](#introduction)
- [Model at a Glance](#model-at-a-glance)
- [Highlights](#highlights)
- [Architecture](#architecture)
- [Benchmarks](#benchmarks)
- [Quickstart](#quickstart)
  - [Inference](#inference)
  - [Serving & Ecosystem](#serving--ecosystem)
- [Recommended Parameters](#recommended-parameters)
- [Evaluation Details](#evaluation-details)
- [Citation](#citation)
- [Acknowledgments](#acknowledgments)

## Introduction

**Xing4.0-29B-A4B** is a next-generation large language model in the Xing series (formerly [TeleChat](https://github.com/Tele-AI/TeleChat3)), developed by China Telecom Artificial Intelligence Technology Co., Ltd. With 29B total parameters and only 4B activated per token, it natively supports a 256K context length, extensible to 512K. It was trained end-to-end on a fully in-house stack — from silicon to software — and is deeply optimized for complex engineering tasks: long-context planning, multi-step reasoning, tool calling, and structured output.

For full project documentation, deployment guides, and fine-tuning recipes, visit the [GitHub repository](https://github.com/XingChen-AGI/Xing4.0-29B-A4B).

## Model at a Glance

| | |
|---|---|
| Total parameters | **29B** |
| Activated parameters per token | **4B** (~13.8% activation) |
| Architecture | MoE · mHC + MLA + MTP |
| Context length | **256K** native, extensible to **512K** |
| Training corpus | **1.5 trillion** high-quality bilingual (ZH/EN) tokens |
| Open weights | BF16 (this repo) • [FP8](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8) • [GGUF](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF) |
| License | Apache 2.0 |

## Highlights

- **Agent-oriented architecture** — built on the mHC + MLA + MTP architecture, supporting multi-step planning, tool calling, and complex reasoning-chain execution, ensuring task coherence and execution stability under long contexts.
- **Deep software–hardware co-optimization** — adapted to domestic NPU clusters with a fully in-house training framework, including mHC feature adaptation and fused-operator development, enabling stable and efficient training at scale.
- **~96% training throughput gain** — fine-grained MoE communication optimization, selective recomputation, automatic graph–operator fusion, and hand-tuned fused mHC kernels lifted overall training throughput by approximately **96%** over out-of-the-box performance.
- **Native in the open ecosystem** — fine-tuning via [ms-swift](https://github.com/modelscope/ms-swift/pull/10275) and [LLaMA-Factory](https://github.com/hiyouga/LlamaFactory/pull/10754) merged upstream; serving via SGLang mainline ([#39793](https://github.com/sgl-project/sglang/pull/39793)) and the official vLLM plugin; local GGUF inference via llama.cpp mainline ([#31589](https://github.com/ggml-org/llama.cpp/pull/31589), b12174+); format-aligned with agent frameworks such as OpenCode, Claude Code, OpenClaw, and Hermes for out-of-the-box workflows.
- **Easy adaptation for domain scenarios** — lightweight customization on proprietary data for intent classification, table understanding, contract auditing, and knowledge-based QA, for rapid and low-cost domain capability deployment.

## Architecture

|                  | Xing4.0-29B-A4B |
|------------------|-----------------|
| Parameters       | 29B (4B active) |
| Number of Layers           | 40              |
| Hidden Size      | 3584            |
| Dense FFN Intermediate Size | 9216       |
| Expert Intermediate Size    | 1024       |
| Attention Type   | MLA             |
| Number of Routed Experts | 64              |
| Active Experts per Token | 4              |
| Number of Shared Experts | 1               |
| Context Length   | 256K (extensible to 512K) |

## Benchmarks

Head-to-head with same-class open agentic models:

| Benchmark              | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|------------------------|:---:|:---:|:---:|
| IFBench                | 69.67 | **72.67** | 65.50 |
| AIME2026               | 90.00 | 88.30 | **92.70** |
| AA.LCR                 | 61.00 | **66.00** | 62.00 |
| Tau3-Bench             | 64.63 | 58.90 | **67.20** |
| Claw-Eval              | **76.55** | 71.49 | 74.54 |
| SWE-bench Verified     | 75.00 | 53.00 | **76.00** |
| Terminal-Bench 2.1     | **57.50** | 30.00 | 51.50 |
| SWE-bench Multilingual | 66.00 | 51.00 | **67.20** |
| DeepresearchBII        | **60.80** | 39.30 | 59.70 |

**Bold** marks the best score in each benchmark.

- **Coding agent** — 75.0 on SWE-bench Verified (approaching Qwen3.6-35B-A3B's 76.0, far ahead of Gemma4-26B-A4B's 53.0), 66.0 on SWE-bench Multilingual, and a clear lead on Terminal-Bench 2.1 (57.5 vs 51.5 / 30.0).
- **General agent** — best in this comparison on Claw-Eval (76.55) and DeepresearchBII (60.80), with 64.63 on Tau3-Bench.

## Quickstart

### Inference

Xing4.0-29B-A4B can be accessed via an OpenAI-compatible API.

```python
from openai import OpenAI

client = OpenAI(
    base_url="your-base-url",
    api_key="your-api-key",
)

completion = client.chat.completions.create(
    model="Xing4.0-29B-A4B",
    messages=[{"role": "user", "content": "Briefly explain the basic principles of quantum computing."}],
    temperature=1.0,
    top_p=0.95,
    extra_body={
        "repetition_penalty": 1.05,
        "skip_special_tokens": False,
        "spaces_between_special_tokens": False,
        "chat_template_kwargs": {
            "enable_thinking": True,  # Set to False to disable thinking
        },
    },
)

print(completion.choices[0].message.content)
```

### Serving & Ecosystem

Xing4.0-29B-A4B runs across serving stacks with different integration levels (as of 2026-11-10):

| Stack | Xing4.0 support | Since | How to run |
|---|---|---|---|
| **SGLang** | Native — mainline ([#39793](https://github.com/sgl-project/sglang/pull/39793)) | 2026-11-05 | Any recent mainline release; [plugin](https://github.com/XingChen-AGI/xing4-sglang-plugin) for older versions |
| **llama.cpp** | Native GGUF — mainline ([#31589](https://github.com/ggml-org/llama.cpp/pull/31589)) | 2026-11-05 | Stock build **b12174+** on CPU / CUDA with [Xing4.0-29B-A4B-GGUF](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF) |
| **vLLM** | Official out-of-tree plugin | — | [XingChen-AGI/xing4-vllm-plugin](https://github.com/XingChen-AGI/xing4-vllm-plugin) |
| [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM/pull/19283) · [KTransformers](https://github.com/kvcache-ai/ktransformers/pull/2168) | PR under upstream review | — | Install from the PR branch (see the GitHub README) |

Prebuilt container images and step-by-step deployment guides are listed in the [GitHub repository](https://github.com/XingChen-AGI/Xing4.0-29B-A4B).

## Recommended Parameters

| Scenario | temperature | top_p | repetition_penalty |
|----------|:-----------:|:-----:|:------------------:|
| Complex reasoning / general tasks | 1.0 | 0.95 | 1.05 |
| Coding / agent tasks              | 0.8 | 0.95 | 1.05 |

## Evaluation Details

- **SWE-bench Verified**: We evaluate Xing4.0-29B-A4B using the `SWE-agent` harness with `temperature=1.0, top_p=0.95, repetition_penalty=1.05` and a `210`K context window.
- **Terminal-Bench 2.1**: We evaluate in `terminus-2` with `temperature=0.8, top_p=0.95, repetition_penalty=1.05, max_tokens=64K` and a `24`-hour timeout. We report the average score over `3` runs.
- **SWE-bench Multilingual**: We evaluate Xing4.0-29B-A4B using the `SWE-agent` harness with `temperature=1.0, top_p=0.95, repetition_penalty=1.05` and a `210`K context window.
- **Claw-Eval**: We evaluate using the [official harness](https://github.com/claw-eval/claw-eval) with `temperature=0.8, top_p=0.95, repetition_penalty=1.05, max_tokens=16384` and a 256K context window. We report the average score over `3` runs.
- **Tau3-Bench**: We evaluate using the [official harness](https://github.com/sierra-research/tau-bench) with `temperature=0.8, top_p=0.95, repetition_penalty=1.05, max_tokens=16384`. We report the average pass^1 over `4` runs.
- **DeepresearchBII**: We evaluate using the `OpenCode` harness with `temperature=0.8, top_p=0.95, repetition_penalty=1.05, max_tokens=32768` and a `256`K context window, with Exa MCP server enabled.
- **AIME2026**: We evaluate with `temperature=1.0, top_p=0.95, repetition_penalty=1.05, max_tokens=131072`. We report the average score over 5 independent runs.
- **IFBench**: We evaluate with `temperature=0.8, top_p=0.95, repetition_penalty=1.05, max_tokens=81920`.
- **AA.LCR**: We evaluate with `temperature=1.0, top_p=0.95, repetition_penalty=1.05, max_tokens=65536`. We report the average score over `3` runs.

## Citation

```bibtex
@misc{liu2025trainingreporttelechat3moe,
      title={Training Report of TeleChat3-MoE}, 
      author={Xinzhang Liu and Chao Wang and Zhihao Yang and Zhuo Jiang and Xuncheng Zhao and Haoran Wang and Lei Li and Dongdong He and Luobin Liu and Kaizhe Yuan and Han Gao and Zihan Wang and Yitong Yao and Sishi Xiong and Wenmin Deng and Haowei He and Kaidong Yu and Yu Zhao and Ruiyu Fang and Yuhao Jiang and Yingyan Li and Xiaohui Hu and Xi Yu and Jingqi Li and Yanwei Liu and Qingli Li and Xinyu Shi and Junhao Niu and Chengnuo Huang and Yao Xiao and Ruiwen Wang and Fengkai Li and Luwen Pu and Kaipeng Jia and Fubei Yao and Yuyao Huang and Xuewei He and Zhuoru Jiang and Ruiting Song and Rui Xue and Qiyi Xie and Jie Zhang and Zilu Huang and Zhaoxi Zhang and Zhilong Lu and Yanhan Zhang and Yin Zhang and Yanlei Xue and Zhu Yuan and Teng Su and Xin Jiang and Shuangyong Song and Yongxiang Li and Xuelong Li},
      year={2025},
      eprint={2512.24157},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2512.24157}, 
}

@misc{wang2025technicalreporttelechat2telechat25,
      title={Technical Report of TeleChat2, TeleChat2.5 and T1}, 
      author={Zihan Wang and Xinzhang Liu and Yitong Yao and Chao Wang and Yu Zhao and Zhihao Yang and Wenmin Deng and Kaipeng Jia and Jiaxin Peng and Yuyao Huang and Sishi Xiong and Zhuo Jiang and Kaidong Yu and Xiaohui Hu and Fubei Yao and Ruiyu Fang and Zhuoru Jiang and Ruiting Song and Qiyi Xie and Rui Xue and Xuewei He and Yanlei Xue and Zhu Yuan and Zhaoxi Zhang and Zilu Huang and Shiquan Wang and Xin Wang and Hanming Wu and Mingyuan Wang and Xufeng Zhan and Yuhan Sun and Zhaohu Xing and Yuhao Jiang and Bingkai Yang and Shuangyong Song and Yongxiang Li and Zhongjiang He and Xuelong Li},
      year={2025},
      eprint={2507.18013},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2507.18013}, 
}
```

## Acknowledgments

Xing4.0-29B-A4B is better because of the open-source community. This section is our way of saying thanks — and we will keep adding names as the community grows.

**Inference, training, and tooling.** Thank you to the maintainers of [vLLM](https://github.com/vllm-project/vllm), [SGLang](https://github.com/sgl-project/sglang), [KTransformers](https://github.com/kvcache-ai/ktransformers), [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM), and [llama.cpp](https://github.com/ggml-org/llama.cpp), and to the wider MLX ecosystem — for building inference stacks open enough to carry an architecture combination like ours, and for keeping them that way. Support for Xing4.0 has also landed in [ms-swift](https://github.com/modelscope/ms-swift), [GPTQModel](https://github.com/ModelCloud/GPTQModel), and [unsloth-zoo](https://github.com/unslothai/unsloth-zoo), and in [LocalAI](https://github.com/mudler/LocalAI)'s gallery. Thank you to their maintainers.

**Community quants and ports.** Special thanks to the community members who did real work on this model and published it for everyone:

- [@kingjones777](https://huggingface.co/kingjones777) — AMD ROCm builds with public recipes and hashes, and detailed reports that made the ROCm path work end to end.
- [Venastine Research](https://huggingface.co/Venastine-Research) — four GGUF tiers, including an 11.6 GB build that puts the model within reach of 16 GB cards, with a fully documented imatrix recipe.
- [@jmarceno](https://huggingface.co/jmarceno) — an independently recomputed imatrix and a 3.31 BPW quant, with the recipe and hashes published.
- [@TokenAI-zer](https://huggingface.co/TokenAI-zer) — an MLX implementation verified to near-exact logit parity, and precise issue reports on the reference implementation.
- [@nativ-community](https://huggingface.co/nativ-community) — an MLX 8-bit port with token-level fidelity verification, with upstream work now merged in [mlx-vlm](https://github.com/Neywa-Labs/mlx-vlm).
- The FlagOS project — multi-accelerator builds of the model.

We are also grateful to the teams and individuals who fine-tuned Xing4.0 for domain work — finance, official document writing, roleplay, meeting minutes, rewriting, information extraction — and published those weights for others to build on.

If you have ported, quantized, evaluated, or fixed Xing4.0 and are not on this list — thank you. Open a discussion and let us know; we will add you.

**Evaluation tooling.** Our benchmark numbers rest on harnesses built and maintained by the SWE-agent, Terminal-Bench, [tau-bench](https://github.com/sierra-research/tau-bench), and [Claw-Eval](https://github.com/claw-eval/claw-eval) teams, along with research tooling from Exa. We are grateful for the infrastructure that makes open model evaluation possible.

---

<p align="center">
  <b>China Telecom Artificial Intelligence Technology Co., Ltd.</b><br>
  <a href="https://huggingface.co/XingChen-AGI">More open models from XingChen-AGI</a>
</p>