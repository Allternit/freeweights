# Qwen3.5-397B-A17B-nvfp4 (MLX)

4-bit nvfp4 [MLX](https://github.com/ml-explore/mlx) quantized version of the **text** model from [Qwen/Qwen3.5-397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B).

Portions of this card were copied or adapted from the original model card, authored by the Qwen team.

## Model Overview

Qwen3.5-397B-A17B is Alibaba's latest flagship language model, featuring a hybrid architecture that combines Gated DeltaNet (linear attention) with sparse Mixture-of-Experts for high-throughput inference. Despite having 397B total parameters, only ~17B are activated per token, making it remarkably efficient for its capability level.

This conversion provides a **text-only** 4-bit quantized version optimized for local inference on Apple Silicon Macs via the MLX framework. The vision encoder from the original multimodal model is not included — for image/video understanding, refer to the original [Qwen/Qwen3.5-397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B).

### Key Capabilities

- **201 languages and dialects** with deep cultural and regional understanding
- **262K native context** (extensible to 1M+ with YaRN)
- **Thinking mode** with chain-of-thought reasoning (`<think>...</think>`)
- **Tool use and agentic workflows** (MCP, function calling)
- **Competitive benchmarks**: MMLU-Pro 87.8, SuperGPQA 70.4, C-Eval 93.0

## Architecture

| Parameter | Value |
|---|---|
| Total Parameters | 397B |
| Active Parameters | ~17B |
| Hidden Size | 4,096 |
| Layers | 60 |
| Layer Layout | 15 × (3 × Gated DeltaNet + 1 × Full Attention), all with MoE FFN |
| Total Experts | 512 |
| Active Experts per Token | 10 routed + 1 shared |
| Expert Intermediate Size | 1,024 |
| Full Attention Heads | 32 Q / 2 KV (GQA), head dim 256 |
| Linear Attention Heads | 16 QK / 64 V, head dim 128 |
| Context Length | 262,144 tokens |
| Vocab Size | 248,320 |

## Quantization Details

| Parameter | Value |
|---|---|
| Method | nvfp4 |
| Bits | 4-bit (weights) |
| Group Size | 64 |
| MoE Router Gates | 8-bit (preserved at higher precision) |
| Model Size on Disk | ~223 GB |

The MoE router gates (`mlp.gate` and `mlp.shared_expert_gate` for all 60 layers) are kept at 8-bit precision to preserve routing accuracy, which is critical for Mixture-of-Experts models.

## Requirements

- Apple Silicon Mac with **at least 256 GB unified memory** (e.g., Mac Studio M3 Ultra 256GB+)
- Python 3.10+
- [`mlx-lm`](https://github.com/ml-explore/mlx-lm) from the `main` branch

## Installation

```bash
pip install git+https://github.com/ml-explore/mlx-lm
```

## Usage

### Quick Start — Python API

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3.5-397B-A17B-nvfp4")

messages = [{"role": "user", "content": "Explain the Riemann hypothesis in simple terms."}]
prompt = tokenizer.apply_chat_template(messages, add_generation_prompt=True)

response = generate(
    model,
    tokenizer,
    prompt=prompt,
    max_tokens=4096,
    verbose=True,
    temp=0.6,
    top_p=0.95,
)
```

### Thinking Mode (Default)

The model defaults to thinking mode, producing chain-of-thought reasoning inside `<think>...</think>` tags before the final answer:

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3.5-397B-A17B-nvfp4")

messages = [
    {"role": "user", "content": "How many r's are in the word 'strawberry'?"}
]
prompt = tokenizer.apply_chat_template(messages, add_generation_prompt=True)

response = generate(
    model,
    tokenizer,
    prompt=prompt,
    max_tokens=8192,
    verbose=True,
    temp=0.6,
    top_p=0.95,
)
```

### Non-Thinking Mode

For faster, more direct responses without chain-of-thought reasoning:

```python
from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen3.5-397B-A17B-nvfp4")

messages = [
    {"role": "user", "content": "Write a haiku about machine learning."}
]
prompt = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    enable_thinking=False,
)

response = generate(
    model,
    tokenizer,
    prompt=prompt,
    max_tokens=2048,
    verbose=True,
    temp=0.7,
    top_p=0.8,
)
```

### Command Line

```bash
# Thinking mode (default)
mlx_lm.generate \
    --model mlx-community/Qwen3.5-397B-A17B-nvfp4 \
    --prompt "What are the key differences between TCP and UDP?" \
    --max-tokens 4096 \
    --temp 0.6 \
    --top-p 0.95

# Start a local chat server (OpenAI-compatible)
mlx_lm.server --model mlx-community/Qwen3.5-397B-A17B-nvfp4
```

### Local OpenAI-Compatible Server

Start the server:

```bash
mlx_lm.server --model mlx-community/Qwen3.5-397B-A17B-nvfp4 --port 8080
```

Then query it with any OpenAI-compatible client:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8080/v1", api_key="unused")

response = client.chat.completions.create(
    model="mlx-community/Qwen3.5-397B-A17B-nvfp4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Write a Python function to find all prime numbers up to n using the Sieve of Eratosthenes."},
    ],
    max_tokens=4096,
    temperature=0.6,
    top_p=0.95,
)
print(response.choices[0].message.content)
```

Or with `curl`:

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mlx-community/Qwen3.5-397B-A17B-nvfp4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 512,
    "temperature": 0.6
  }'
```

## Recommended Generation Parameters

| Parameter | Thinking Mode | Non-Thinking Mode |
|---|---|---|
| `temperature` | 0.6 | 0.7 |
| `top_p` | 0.95 | 0.8 |
| `top_k` | 20 | 20 |
| `presence_penalty` | 0.0 | 1.5 |
| `repetition_penalty` | 1.0 | 1.0 |
| `max_tokens` (general) | 32,768 | 32,768 |
| `max_tokens` (math/code) | 81,920 | — |

## Tips

- **Thinking mode** is best for complex reasoning, math, and coding tasks. The model will produce internal reasoning before answering.
- **Non-thinking mode** is better for straightforward Q&A, creative writing, and conversational use where latency matters.
- For **math problems**, append: *"Please reason step by step, and put your final answer within \boxed{}."*
- For **multi-turn conversations**, the default chat template automatically strips thinking content from prior turns.
- If running into **memory pressure**, consider closing other applications to free unified memory.

## Original Model

This is a quantized version of [Qwen/Qwen3.5-397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B). Refer to the original model card for full benchmark results, training details, and the technical report.

## Citation

```bibtex
@misc{qwen3.5,
    title  = {{Qwen3.5}: Towards Native Multimodal Agents},
    author = {{Qwen Team}},
    month  = {February},
    year   = {2026},
    url    = {https://qwen.ai/blog?id=qwen3.5}
}
```
