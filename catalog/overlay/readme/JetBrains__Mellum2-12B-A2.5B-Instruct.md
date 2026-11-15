<img alt="Mellum" src="mellum-logo-dark.svg" width="320">

# Mellum2 Instruct

> [!Note]
> Use this model when you want direct, low-latency answers without an explicit chain of thought — interactive chat, code assistance, tool use, and instruction following. If you need explicit reasoning before the answer (complex debugging, planning, multi-step agentic flows), use [Thinking](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking) instead.

## Mellum2 Instruct Highlights

Mellum2 Instruct is a post-trained assistant model trained by JetBrains.

The model uses a Mixture-of-Experts architecture with 64 experts and activates 8 experts per token. It uses a combination of sliding-window and full attention layers, with a context length of 131,072 tokens.

It is produced from [`Mellum2-12B-A2.5B-Base`](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base) by supervised fine-tuning followed by reinforcement learning with verifiable rewards (RLVR) on math, executable coding, tool use, instruction following, reasoning, and knowledge tasks. Mellum2 Instruct answers directly, without an externalized chain of thought.

## Mellum2 Model Family

This repository contains one checkpoint from the Mellum2 family.

| Checkpoint | Description |
|---|---|
| [Base Pretrain](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base-Pretrain) | Base checkpoint before long-context extension |
| [Base](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base) | Final base model |
| [Instruct SFT](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct-SFT) | Supervised instruction-tuned checkpoint |
| [Thinking SFT](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking-SFT) | Supervised thinking checkpoint |
| Instruct | RL-tuned instruction model |
| [Thinking](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking) | RL-tuned thinking model |

## Model Overview

**Mellum2 Instruct** has the following features:

- Number of Layers: 28
- Hidden Size: 2304
- Intermediate Size: 7168
- MoE Intermediate Size: 896
- Number of Experts: 64
- Number of Activated Experts: 8
- Number of Attention Heads (GQA): 32 for Q and 4 for KV
- Context Length: 131,072
- Sliding Window: 1,024
- Vocabulary Size: 98,304
- Precision: bfloat16

## Serving with vLLM

```sh
# Without tool calling
vllm serve JetBrains/Mellum2-12B-A2.5B-Instruct --max-model-len 131072

# With tool calling
vllm serve JetBrains/Mellum2-12B-A2.5B-Instruct \
  --max-model-len 131072 \
  --enable-auto-tool-choice \
  --tool-call-parser hermes
```

## Quickstart

Text-Only Input

```python
from openai import OpenAI
# Configured by environment variables
client = OpenAI()

messages = [
    {"role": "user", "content": "Write a Python function to reverse a string."},
]

chat_response = client.chat.completions.create(
    model="JetBrains/Mellum2-12B-A2.5B-Instruct",
    messages=messages,
    max_tokens=81920,
    temperature=0.6,
    top_p=0.95,
    extra_body={
        "top_k": 20,
    },
)
print("Chat response:", chat_response)
```

## Evaluation

Post-training evaluation for the instruct (no-thinking) variants. All values are percentages; higher is better except HarmBench, where lower is better. All values self-reported by JetBrains.

| Benchmark          | Mellum2 Instruct SFT | Mellum2 Instruct | Qwen3.5 (4B) | Qwen3.5 (9B) | OLMo-3 (7B) | Ministral 3 (14B) | Seed-Coder (8B) |
| :----------------- | --------------------: | ----------------: | -----------: | -----------: | ----------: | ----------------: | --------------: |
| **Coding**         |                       |                   |              |              |             |                   |                 |
| LiveCodeBench v6   |                  30.9 |              37.2 |         51.0 |         63.7 |        28.2 |              42.4 |            28.1 |
| EvalPlus           |                  76.2 |              78.4 |         69.4 |         71.8 |        67.3 |              74.1 |            73.8 |
| MultiPL-E          |                  64.6 |              67.1 |         51.0 |         67.1 |        36.1 |              71.5 |            77.0 |
| **Tool Use**       |                       |                   |              |              |             |                   |                 |
| BFCL v4            |                  31.8 |              44.2 |         52.0 |         60.6 |        19.8 |              38.8 |               — |
| BFCL v3            |                  43.1 |              66.3 |         64.1 |         70.5 |        41.9 |              52.7 |               — |
| **Math**           |                       |                   |              |              |             |                   |                 |
| AIME               |                  29.9 |              41.7 |         38.3 |         58.3 |        40.0 |              33.3 |             0.0 |
| GSM-Plus           |                  73.0 |              80.5 |         85.2 |         87.9 |        85.8 |              86.6 |            50.4 |
| **Knowledge**      |                       |                   |              |              |             |                   |                 |
| MMLU-Redux         |                  77.4 |              78.1 |         87.5 |         91.1 |        71.8 |              85.9 |            38.1 |
| GPQA Diamond       |                  38.9 |              40.9 |         76.8 |         79.8 |        40.9 |              58.6 |            20.2 |
| **Conversational** |                       |                   |              |              |             |                   |                 |
| IFEval             |                  69.3 |              75.8 |         82.1 |         83.9 |        83.2 |              67.3 |            56.2 |
| JetBrains pairwise |                  66.7 |              68.1 |         60.6 |         77.8 |        44.4 |              72.4 |            43.0 |
| MixEval            |                  62.9 |              62.2 |         65.9 |         71.1 |        59.4 |              71.2 |            37.2 |
| BS-Bench           |                  24.0 |              18.0 |         56.9 |         61.0 |        22.0 |               9.0 |             5.0 |
| **Safety**         |                       |                   |              |              |             |                   |                 |
| HarmBench (↓)      |                   8.4 |              23.1 |         20.3 |         20.9 |        14.7 |              56.5 |            40.0 |
| XSTest             |                  78.3 |              81.2 |         93.2 |         91.2 |        91.2 |              96.8 |            86.3 |

Notes:
- **EvalPlus** is the mean of HumanEval+ and MBPP+.
- **AIME** is the mean of AIME 2025 and AIME 2026 (30 questions each).
- **BFCL v4** is the macro-average of five subtasks: v1, v2, v3, web search, memory.
- **JetBrains pairwise** is win rate against `Qwen2.5-7B-Instruct` on an internal benchmark.
- `—` indicates the model lacks native tool calling.

For more details, see the [Mellum2 Technical Report](https://arxiv.org/abs/2605.31268).

## License

Released under the Apache 2.0 license.
