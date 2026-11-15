# Aurora-Code-1

> *Northern Lights for your codebase.*

**Aurora-Code-1** is a 35B Mixture-of-Experts coding model (3B parameters activated per token) built by [Perciqa](https://perciqa.com), a Canadian AI company. Fine-tuned from Qwen3.6-35B-A3B on 2,700 high-quality agentic coding instruction pairs, Aurora-Code-1 is optimised for code generation, debugging, code review, and multi-step agentic coding workflows.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![HuggingFace](https://img.shields.io/badge/%F0%9F%A4%97-Perciqa%2FAurora--Code--1-yellow)](https://huggingface.co/Perciqa/Aurora-Code-1)
[![Canadian AI](https://img.shields.io/badge/Made%20in-Canada%20%F0%9F%87%A8%F0%9F%87%A6-red)](https://perciqa.com)

---

## What Aurora-Code-1 does

Aurora-Code-1 is tuned specifically for developers who need a model they can deploy, audit, and fully control — on their own infrastructure.

- **Code generation** — write functions, classes, and complete programs across 40+ languages
- **Debugging** — identify root causes and produce clear, actionable fixes
- **Code review** — flag security issues, suggest refactors, explain tradeoffs
- **Agentic tasks** — multi-step tool use, planning, and repository-level reasoning

No black boxes. No data leaving your infrastructure. Your model, your terms.

---

## Quickstart

### Install

```bash
pip install "transformers>=4.51.0" accelerate
```

> **Hardware:** ~60–65 GB VRAM. A single 80 GB A100/H100 or two 48 GB GPUs work well. `device_map="auto"` supports CPU offload for smaller setups.

### Transformers

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Perciqa/Aurora-Code-1"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto",
)

system_prompt = (
    "You are Aurora, an AI code assistant built by Perciqa. "
    "You help developers write, review, and understand code. "
    "You provide clear, correct, and complete solutions. "
    "When you're unsure, you say so."
)

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": "Write a Python function to merge two sorted lists."},
]

text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer([text], return_tensors="pt").to(model.device)

outputs = model.generate(
    **inputs,
    max_new_tokens=2048,
    temperature=0.7,
    do_sample=True,
)
response = tokenizer.decode(outputs[0][len(inputs.input_ids[0]):], skip_special_tokens=True)
print(response)
```

### vLLM (recommended for production)

```bash
pip install vllm
vllm serve Perciqa/Aurora-Code-1 --max-model-len 32768
```

Query via the OpenAI-compatible API:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="token-abc123")

response = client.chat.completions.create(
    model="Perciqa/Aurora-Code-1",
    messages=[
        {"role": "system", "content": "You are Aurora, an AI code assistant built by Perciqa."},
        {"role": "user", "content": "Refactor this function to be more Pythonic."},
    ],
    max_tokens=2048,
)
print(response.choices[0].message.content)
```

### Ollama

```bash
ollama run hf.co/Perciqa/Aurora-Code-1
```

---

## Argus Integration

[Argus](https://perciqa.com/argus) is Perciqa's open-source agent observability SDK — trajectory tracing, token usage, eval-in-production. Aurora-Code-1 integrates natively.

```python
import argus
from openai import OpenAI

argus.init(server_url="http://localhost:8000", agent_name="aurora-coder")
client = OpenAI(base_url="http://localhost:8000/v1", api_key="token-abc123")

@argus.trace(kind="agent")
def aurora_code(query: str) -> str:
    response = client.chat.completions.create(
        model="Perciqa/Aurora-Code-1",
        messages=[
            {"role": "system", "content": "You are Aurora, an AI code assistant built by Perciqa."},
            {"role": "user", "content": query},
        ],
    )
    return response.choices[0].message.content

result = aurora_code("Write a TypeScript function that validates an email address.")
print(result)
```

Argus captures latency, token usage, inputs/outputs, and agent spans — visible in the Argus dashboard with no extra instrumentation.

---

## Performance

Benchmarks in progress. Independent evaluations on LiveCodeBench, SWE-bench Verified, HumanEval+, and MBPP+ will be published here before the stable release.

---

## Model Details

| Field | Value |
|---|---|
| Architecture | Mixture-of-Experts (MoE) Transformer |
| Total Parameters | 35B |
| Activated Parameters | 3B per token |
| Transformer Layers | 48 |
| Attention Heads | 32 (Q) / 4 (KV), Grouped Query Attention |
| Total Experts | 128 |
| Activated Experts | 8 per token |
| Fine-Tuning | LoRA SFT — 2,700 agentic coding pairs |
| Context Length | 131,072 tokens |
| License | Apache 2.0 |

---

## Training

Aurora-Code-1 v1 is trained with LoRA supervised fine-tuning on a curated set of 2,700 agentic coding instruction pairs covering:

- Code generation (Python, TypeScript, Go, Rust, and more)
- Debugging and root cause analysis
- Code review and refactoring
- Multi-step agentic reasoning and tool use

Future versions will expand the dataset and move to full fine-tuning.

---

## Roadmap

| Version | Description | Status |
|---|---|---|
| **v1** | LoRA SFT on 2,700 agentic coding pairs. Perciqa system prompt and Argus integration. | Released |
| **v2** | Expanded SFT on 10K–20K pairs. Independent benchmark evaluation. | Q3 2026 |
| **v3** | Full fine-tune with extended dataset across generation, debugging, review, and test writing. | Q4 2026 |

---

## System Prompt

```
You are Aurora, an AI code assistant built by Perciqa. You help developers write, review, and understand code. You provide clear, correct, and complete solutions. When you're unsure, you say so.
```

---

## About Perciqa

Perciqa is a Canadian AI company building enterprise models and tools that organisations can deploy, audit, and fully control — on their own infrastructure, on their own terms. Founded in 2023 and based in Canada 🇨🇦.

[perciqa.com](https://perciqa.com) · [GitHub](https://github.com/perciqa)

---

## License

Aurora-Code-1 is released under the [Apache 2.0 License](https://opensource.org/licenses/Apache-2.0).

---

Made with ♥ by [Perciqa](https://perciqa.com) 🇨🇦
