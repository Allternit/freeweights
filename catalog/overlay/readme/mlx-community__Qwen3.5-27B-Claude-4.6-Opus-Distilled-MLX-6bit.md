# Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-6bit-MLX

Quantized by [BeastCode](https://huggingface.co/BeastCode)

A **6-bit MLX quantization** of [Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled](https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled).
Optimized for Apple Silicon. Highest-accuracy local quantization of this model tested to date.

The original BF16 weights are **55.6 GB**. This quantization reduces that to **20 GB** —
runnable on any Mac with 32 GB+ unified memory, with full reasoning capability intact.

For smaller Macs, see the [4-bit version](https://huggingface.co/BeastCode/Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit) (14 GB, 24 GB+ RAM).

---

## 🧠 Why This Model?

Most local LLMs are reactive — they start generating a response before they've fully
mapped out the logic. This model is **deliberative**.

Distilled from **Claude 4.6 Opus** reasoning trajectories, it enters a `<think>` state
before answering where it deconstructs the problem, traces logic flows, and
self-corrects before you see a single word of the final answer.

The practical difference in code review: a standard model looks at `self.value -= 1`
in a threading context and says "add a lock." This model looks at it and tells you
*why* — that `self.value -= 1` compiles to `LOAD_FAST → BINARY_SUBTRACT → STORE_FAST`,
three bytecode ops, and the GIL can release between LOAD and STORE. The explanation
matters as much as the fix.

---

## 📊 Performance Benchmarks

> Tested on Apple M4 Pro, 64 GB · `mlx-lm 0.30.7` · macOS 15  
> All numbers from MLX's internal timing (`verbose=True`), not wall-clock

| Metric | Result |
|---|---|
| Model load time | ~3.5s |
| Prompt ingestion (prefill) | **94 tokens/sec** |
| Generation speed | **10–11 tokens/sec** |
| Peak RAM usage | **~22 GB** |
| Bits per weight | **6.501** |
| Final size | **20 GB (5 shards)** |

### Code Review Reasoning Challenges

Three hand-crafted challenges requiring multi-step logical deduction — not pattern
matching. Each is designed so a shallow read gives a wrong or incomplete answer.

| Challenge | Result | Detail |
|---|---|---|
| LRU Cache — is it correct? | ✅ | Correctly concluded the implementation IS correct — traced every operation |
| Thread-safe counter race condition | ✅ | Named exact bytecode ops, traced T1–T6 thread interleave, minimal fix |
| Pricing engine — find 3 bugs | ✅ **3/3** | Found `>` vs `>=` boundary, loyalty threshold, and discount stacking order |

**Score: 3/3 challenges fully correct.**

For comparison: Qwen2.5-Coder-32B-Instruct-6bit (26 GB, trained on 5.5T code tokens)
scored 1.5/3 on the same challenges — it found the obvious `>= 10` bug but missed the
boundary condition and the stacking order, and gave a factually wrong explanation of
why the race condition occurs.

---

## 💻 System Requirements

| | |
|---|---|
| **Hardware** | Apple Silicon Mac (M1, M2, M3, M4 or later) |
| **Minimum RAM** | 32 GB Unified Memory |
| **Recommended RAM** | 36 GB+ (64 GB for large PR diffs and long context) |
| **OS** | macOS 13.5 or later |
| **Python** | 3.10+ (Homebrew Python 3.12 recommended) |

---

## 🚀 Quick Start

### 1. Install mlx-lm

```bash
# macOS ships with Python 3.9 which is too old — install 3.12 via Homebrew
brew install python@3.12
/opt/homebrew/bin/python3.12 -m venv ~/mlx-venv
~/mlx-venv/bin/pip install mlx-lm
```

### 2. Run in your terminal

```bash
~/mlx-venv/bin/mlx_lm.chat \
  --model BeastCode/Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-6bit
```

### 3. Python integration — recommended approach

Use `apply_chat_template` with `enable_thinking=True`. This is the idiomatic way to
trigger reasoning mode — no manual prompt construction needed.

```python
from mlx_lm import load, generate
from mlx_lm.sample_utils import make_sampler, make_logits_processors

model, tokenizer = load("BeastCode/Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-6bit")

messages = [
    {
        "role": "system",
        "content": (
            "You are an expert code reviewer. Analyze the code carefully, "
            "thinking through potential edge cases, security vulnerabilities, "
            "and logic flows step-by-step before providing your final review."
        ),
    },
    {
        "role": "user",
        "content": "Review this function:\n\n```python\ndef divide(a, b):\n    return a / b\n```",
    },
]

prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True,
)

response = generate(
    model,
    tokenizer,
    prompt=prompt,
    max_tokens=8192,  # reasoning models need room — don't go below 4096
    sampler=make_sampler(temp=0.7, min_p=0.05),
    logits_processors=make_logits_processors(
        repetition_penalty=1.15,
        repetition_context_size=64,
    ),
    verbose=True,
)
print(response)
```

> **Important:** Do not set `max_tokens` below 4096. The `<think>` block alone consumes
> 300–800 tokens on a moderately complex question. If the limit is hit before `</think>`
> is emitted, the model never transitions to its answer phase and loops indefinitely.
> Use 4096 for single functions, 8192 for full PR diffs.

> **Sampling params:** `repetition_penalty=1.15` is essential for quantized reasoning
> models. Without it, the model can enter a local probability minimum and repeat the
> same sentence until the token limit. `temp=0.7 + min_p=0.05` prevents greedy decoding.

### 4. Stripping the `<think>` block

```python
import re

def strip_thinking(text: str) -> str:
    """Remove the internal reasoning block, returning only the final answer."""
    return re.sub(r'<think>.*?</think>\s*', '', text, flags=re.DOTALL).strip()

clean_response = strip_thinking(response)
```

---

## ⚙️ Quantization Details

| Property | Value |
|---|---|
| Method | 6-bit group-wise quantization |
| Tool | `mlx-lm 0.30.7` (`mlx_lm.convert`) |
| Bits per weight | 6.501 (embeddings and lm_head kept at higher precision) |
| Group size | 64 (default) |
| Source format | BF16 safetensors (11 shards, 55.6 GB) |
| Output format | MLX safetensors (5 shards, 20 GB) |

### Reproduce this quantization

```bash
~/mlx-venv/bin/mlx_lm.convert \
  --hf-path Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled \
  --mlx-path ~/mlx-models/Qwen3.5-27B-Jackrong-6bit \
  --quantize \
  --q-bits 6
```

---

## 🏆 Model Comparison

| Model | Size | Speed (M4 Pro) | Challenge score | RAM required |
|---|---|---|---|---|
| **This model (6-bit)** | **20 GB** | **10–11 tok/s** | **3/3 ✅** | **32 GB+** |
| [4-bit version](https://huggingface.co/BeastCode/Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit) | 14 GB | 15 tok/s | 2.5/3 | 24 GB+ |
| Qwen2.5-Coder-32B-6bit | 26 GB | 9 tok/s | 1.5/3 ⚠️ | 32 GB+ |

The 4-bit version is faster and suitable for quick checks. The 6-bit version is the
right choice when correctness matters: it found all 3 bugs in every reasoning challenge,
including subtle boundary conditions and multi-step logic errors the 4-bit and the
larger code-specialist model missed.

---

## 🙏 Acknowledgements

- **Core weights:** [Alibaba Qwen Team](https://huggingface.co/Qwen) — Qwen 3.5 27B Dense
- **Reasoning SFT:** [Jackrong](https://huggingface.co/Jackrong) — Claude 4.6 Opus distillation
- **Inference engine:** [Apple MLX Team](https://github.com/ml-explore/mlx)
- **4-bit version:** [BeastCode/Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit](https://huggingface.co/BeastCode/Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit)
