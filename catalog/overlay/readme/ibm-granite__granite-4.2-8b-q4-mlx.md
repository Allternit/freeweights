### Granite 4.2 models (MLX)

Granite 4.2 language models are a family of state-of-the-art open foundation models featuring dense decoder-only architectures. They natively support multilingual capabilities, a wide range of coding tasks, retrieval-augmented generation (RAG), tool usage, structured JSON output, and extended reasoning via a built-in thinking mode.

All models are publicly released under the Apache 2.0 license, allowing free use for both research and commercial purposes. The data curation and training processes were specifically designed for enterprise scenarios and customization, incorporating governance, risk, and compliance (GRC) evaluations alongside IBM's standard data clearance and document quality review procedures.

> [!NOTE]
> This repository contains MLX variants of an IBM Granite base model, converted using
> [mlx-lm](https://github.com/ml-explore/mlx-examples/tree/main/llms) for native inference
> on Apple Silicon (M-series) hardware.
>
> Please reference the base model's full model card here:
> https://huggingface.co/ibm-granite/granite-4.2-8b

#### Requirements

- macOS with Apple Silicon (M1 / M2 / M3 / M4 or later)
- Python ≥ 3.9

#### Installation

[mlx-lm](https://github.com/ml-explore/mlx-examples/tree/main/llms) is a Python package that provides fast LLM inference and fine-tuning on Apple Silicon using the [MLX](https://github.com/ml-explore/mlx) framework.

**Option 1 — install into your environment (recommended for repeated use):**

```bash
pip install mlx-lm
```

**Option 2 — run ephemerally via `uvx` (no persistent mlx-lm install required):**

> **Prerequisite:** `uvx` is part of [uv](https://docs.astral.sh/uv/), a fast Python package manager.
> Install it first by following the [uv installation guide](https://docs.astral.sh/uv/getting-started/installation/)
> or with:
> ```bash
> pip install uv
> ```

```bash
# mlx-lm is downloaded into a temporary environment on first use
uvx mlx_lm generate \
  --model ibm-granite/granite-4.2-8b-q4-mlx \
  --prompt "Why is the sky blue according to science?" \
  --temp 1.0 \
  --top-p 0.95
```

#### Available MLX Variants

Each quantization variant is published as its own Hugging Face repository:

| Variant | Repo name suffix | Description | Recommended for |
|---|---|---|---|
| `bf16` | `-bf16-mlx` | Full-precision BFloat16 | Highest quality; requires ≥ 16 GB unified memory |
| `q8`   | `-q8-mlx`   | 8-bit quantization (group-size 64) | High quality with ~50 % memory reduction vs bf16 |
| `q4`   | `-q4-mlx`   | 4-bit quantization (group-size 64) | Best efficiency; suitable for 8 GB unified memory |

For example, the variants for `granite-4.2-8b` are published at:

```
ibm-granite/granite-4.2-8b-bf16-mlx
ibm-granite/granite-4.2-8b-q8-mlx
ibm-granite/granite-4.2-8b-q4-mlx
```

#### Running

Run directly from a variant repository (mlx-lm will download weights on first use):

```bash
mlx_lm generate \
  --model ibm-granite/granite-4.2-8b-q4-mlx \
  --prompt "Why is the sky blue according to science?" \
  --temp 1.0 \
  --top-p 0.95
```

To use a different quantization, substitute the variant suffix, for example `-q8-mlx` or `-bf16-mlx`.

You can also download the model and run from a local path:

```bash
uvx --from huggingface-hub hf download ibm-granite/granite-4.2-8b-q4-mlx \
  --local-dir ./granite-4.2-8b-q4-mlx

mlx_lm generate \
  --model ./granite-4.2-8b-q4-mlx \
  --prompt "Why is the sky blue according to science?" \
  --temp 1.0 \
  --top-p 0.95
```

#### Recommended Generation Parameters

This repository includes a `generation_config.json` copied from the base model. It records the recommended `temperature` and `top_p` values, but **`mlx_lm generate` does not read them automatically** — only `eos_token_id` is consumed by mlx-lm at inference time. Pass the values explicitly on every invocation using the flags below.

The Granite 4.2 base model recommends:

| Parameter | Recommended value | CLI flag |
|---|---|---|
| Temperature | `1.0` | `--temp 1.0` |
| Top-p | `0.95` | `--top-p 0.95` |

> Without these flags, `mlx_lm generate` defaults to `--temp 0.0` (greedy / deterministic decoding) and `--top-p 1.0`.

Example with the recommended values applied:

```bash
mlx_lm generate \
  --model ibm-granite/granite-4.2-8b-q4-mlx \
  --prompt "Explain retrieval-augmented generation in simple terms." \
  --temp 1.0 \
  --top-p 0.95
```

In Python, always apply the chat template and pre-tokenize before calling `generate()`:

```python
from mlx_lm import load, generate

model, tokenizer = load("ibm-granite/granite-4.2-8b-q4-mlx")

messages = [{"role": "user", "content": "Explain retrieval-augmented generation in simple terms."}]

# Always pre-tokenize with add_special_tokens=False — see Thinking Mode section.
prompt_str = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True,
)
prompt = tokenizer.encode(prompt_str, add_special_tokens=False)

response = generate(model, tokenizer, prompt=prompt, temp=1.0, top_p=0.95, max_tokens=256)
print(response)
```

#### Thinking Mode

Granite 4.2 supports built-in chain-of-thought reasoning. When thinking is active the model produces its reasoning inside a `<think>…</think>` block before its final answer.

Thinking is **on by default**. The chat template appends `<think>\n` automatically when `add_generation_prompt=True`, placing the model inside the open reasoning block so it generates content before closing it. Two template parameters let you adjust the behavior:

| Parameter | Values | Effect |
|---|---|---|
| `enable_thinking` | `true` (default) / `false` | Enables or disables the `<think>` block entirely. |
| `reasoning_effort` | `"low"` / `"high"` (default) | `"low"` requests a shorter reasoning pass; omit or set `"high"` for full depth. |

**CLI — thinking is on by default**

No extra flags are needed to enable thinking. The model reasons automatically:

```bash
mlx_lm generate \
  --model ibm-granite/granite-4.2-8b-q4-mlx \
  --prompt "What is the difference between a mutex and a semaphore?" \
  --temp 1.0 \
  --top-p 0.95 \
  --max-tokens 1024
```

**CLI — disable thinking for direct answers:**

Pass `enable_thinking=false` via `--chat-template-config` to skip the reasoning block entirely:

```bash
mlx_lm generate \
  --model ibm-granite/granite-4.2-8b-q4-mlx \
  --prompt "Summarize this paragraph in one sentence." \
  --chat-template-config '{"enable_thinking": false}' \
  --temp 1.0 \
  --top-p 0.95
```

**CLI — request low-effort (faster) reasoning:**

```bash
mlx_lm generate \
  --model ibm-granite/granite-4.2-8b-q4-mlx \
  --prompt "What is the difference between a mutex and a semaphore?" \
  --chat-template-config '{"reasoning_effort": "low"}' \
  --temp 1.0 \
  --top-p 0.95 \
  --max-tokens 1024
```

#### Python API

**Enable thinking:**

Include `<think>` block before answer:

```python
from mlx_lm import load, generate

model, tokenizer = load(
    "ibm-granite/granite-4.2-8b-q4-mlx"
)

messages = [{"role": "user", "content": "What is the difference between a mutex and a semaphore?"}]

# enable_thinking=True: the chat template appends <think>\n so the model reasons
# before closing the block with </think> and producing its final answer.
# True is the default for Granite 4.2, but passing it explicitly is good practice.
#
# IMPORTANT: always pre-tokenize with add_special_tokens=False.
# Passing a plain string to generate() triggers re-encoding with add_special_tokens=True,
# which prepends a spurious BOS token and collapses the thinking block to empty.
prompt_str = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True,         # show Think block
)
prompt = tokenizer.encode(prompt_str, add_special_tokens=False)

response = generate(model, tokenizer, prompt=prompt, temp=1.0, top_p=0.95, max_tokens=1024)
print(response)
```

**Disable thinking**

Direct answer with no `<think>` block:

```python
from mlx_lm import load, generate

model, tokenizer = load(
    "ibm-granite/granite-4.2-8b-q4-mlx"
)

messages = [{"role": "user", "content": "Summarize this paragraph in one sentence."}]

prompt_str = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False,        # skip the <think> block entirely
)
prompt = tokenizer.encode(prompt_str, add_special_tokens=False)

response = generate(model, tokenizer, prompt=prompt, temp=1.0, top_p=0.95, max_tokens=256)
print(response)
```

**Low-effort (faster) reasoning:**

`reasoning_effort` controls the depth of the thinking pass. The default is `"high"` (full-depth reasoning). Set it to `"low"` for a shorter, faster reasoning pass.

```python
# reasoning_effort="low"  → shorter, faster reasoning pass
# reasoning_effort="high" → full-depth reasoning (default; same as omitting the parameter)
prompt_str = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    reasoning_effort="low",
)
prompt = tokenizer.encode(prompt_str, add_special_tokens=False)

response = generate(model, tokenizer, prompt=prompt, temp=1.0, top_p=0.95, max_tokens=512)
print(response)
```

#### Supported Languages

Supported Languages: English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese. Users may finetune Granite 4.2 models for languages beyond these languages.

#### Intended Use

This model is designed to handle general instruction-following tasks and can be integrated into AI assistants across various domains, including business applications.

#### Capabilities

- Summarization
- Text classification
- Text extraction
- Question-answering
- Retrieval Augmented Generation (RAG)
- Code related tasks
- Function-calling tasks
- Multilingual dialog use cases
- Fill-In-the-Middle (FIM) code completions
- Thinking / extended reasoning (enable_thinking, reasoning_effort)

---

#### Learn more

- Developers: Granite Team, IBM
- Website: [Granite Docs](https://www.ibm.com/granite/docs)
- GitHub Repository: [ibm-granite/granite-language-models](https://github.com/ibm-granite/granite-language-models)
- Hugging Face: [Granite 4.2 Language Models](https://huggingface.co/collections/ibm-granite/granite-42-language-models)
- MLX Examples: [ml-explore/mlx-examples](https://github.com/ml-explore/mlx-examples)
- License: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
