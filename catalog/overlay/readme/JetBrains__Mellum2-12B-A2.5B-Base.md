<img alt="Mellum" src="mellum-logo-dark.svg" width="320">

# Mellum2 Base

> [!Note]
> Use this checkpoint as the starting point for your own fine-tuning, alignment, or domain adaptation on top of the long-context base. For instruction-following or reasoning tasks out of the box, use [Instruct](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct) or [Thinking](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking) instead.

## Mellum2 Base Highlights

Mellum2 Base is a long-context pretrained causal language model trained by JetBrains.

The model uses a Mixture-of-Experts architecture with 64 experts and activates 8 experts per token. It uses a combination of sliding-window and full attention layers, with a context length of 131,072 tokens.

This is the long-context base, produced from [`Mellum2-12B-A2.5B-Base-Pretrain`](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base-Pretrain) by a layer-selective YaRN extension stage that re-maps RoPE frequencies on the global-attention layers only. It is the shared starting point for the released Instruct and Thinking variants.

## Mellum2 Model Family

This repository contains one checkpoint from the Mellum2 family.

| Checkpoint | Description |
|---|---|
| [Base Pretrain](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base-Pretrain) | Base checkpoint before long-context extension |
| Base | Final base model |
| [Instruct SFT](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct-SFT) | Supervised instruction-tuned checkpoint |
| [Thinking SFT](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking-SFT) | Supervised thinking checkpoint |
| [Instruct](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct) | RL-tuned instruction model |
| [Thinking](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking) | RL-tuned thinking model |

## Model Overview

**Mellum2 Base** has the following features:

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
vllm serve JetBrains/Mellum2-12B-A2.5B-Base --max-model-len 131072
```

## Quickstart

Text-Only Input (base model — use the completions endpoint, not chat)

```python
from openai import OpenAI
# Configured by environment variables
client = OpenAI()

completion = client.completions.create(
    model="JetBrains/Mellum2-12B-A2.5B-Base",
    prompt="def fibonacci(n):\n    ",
    max_tokens=81920,
    temperature=0.6,
    top_p=0.95,
    extra_body={
        "top_k": 20,
    },
)
print("Completion:", completion)
```

## Evaluation

Mellum2 Base pretraining results compared with similarly-sized open base models. All values are self-reported by JetBrains.

| Benchmark                 | Mellum2 (12B-A2.5B) | OLMo-3 (7B) | Qwen2.5 (7B) | Qwen3 (4B) | Qwen3.5 (4B) |
| :------------------------ | -------------------: | ----------: | -----------: | ---------: | -----------: |
| **Code Generation**       |                      |             |              |            |              |
| HumanEval                 |                 41.5 |        45.1 |         55.5 |       57.3 |         50.0 |
| HumanEval+                |                 37.2 |        39.6 |         47.0 |       51.2 |         43.9 |
| MBPP                      |                 62.4 |        50.6 |         63.6 |       67.0 |         52.2 |
| MBPP+                     |                 61.4 |        52.9 |         64.0 |       64.5 |         55.0 |
| MultiPL-E (7 langs)       |                 21.0 |        10.0 |         19.2 |       26.0 |         12.1 |
| CRUXEval-I                |                 45.4 |        38.8 |         44.0 |       44.6 |         49.1 |
| CRUXEval-O                |                 43.9 |        36.6 |         42.9 |       43.5 |         43.2 |
| **Knowledge & Reasoning** |                      |             |              |            |              |
| MMLU                      |                 70.9 |        62.1 |         71.8 |       71.1 |         74.2 |
| MMLU-Pro                  |                 59.3 |        34.5 |         48.6 |       51.5 |         52.4 |
| BBH                       |                 74.9 |        63.6 |         69.0 |       71.3 |         80.2 |
| ARC-Challenge             |                 53.5 |        53.6 |         51.3 |       51.2 |         54.9 |
| HellaSwag                 |                 73.7 |        74.2 |         78.9 |       73.7 |         75.3 |
| WinoGrande                |                 65.5 |        69.5 |         73.3 |       71.2 |         70.8 |
| TruthfulQA MC2            |                 44.5 |        47.0 |         56.4 |       53.5 |         52.1 |
| **Math & Science**        |                      |             |              |            |              |
| GSM8K                     |                 81.7 |        73.5 |         81.9 |       82.0 |         80.1 |
| MATH                      |                 10.0 |        18.7 |         24.6 |       27.7 |         25.3 |
| GPQA Diamond              |                 31.3 |        28.8 |         32.8 |       36.9 |         41.4 |
| GPQA Main                 |                 35.0 |        27.9 |         34.2 |       36.8 |         40.2 |

For more details, see the [Mellum2 Technical Report](https://arxiv.org/abs/2605.31268).

## License

Released under the Apache 2.0 license.
