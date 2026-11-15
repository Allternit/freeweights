<img alt="Mellum" src="mellum-logo-dark.svg" width="320">

# Mellum2.1 Thinking with the MTP head

> [!Note]
> This repository is [Mellum2.1 Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking) with its multi-token prediction (MTP) head included. The model weights are byte-identical to that release; the head adds one shard and one config key. Use this repository for speculative decoding with vLLM 0.33 or newer and transformers 5.20 or newer, and the Thinking repository with older versions, which cannot load the extra tensors.

> [!Note]
> Mellum2.1 is a thinking model. Use it for complex agentic tasks, such as working in a repository, running commands, and calling tools, and for hard non-agentic problems in coding, math, and reasoning.

<img alt="Mellum2.1 benchmarks" src="mellum21_summary.png" width="100%">

## Mellum2.1 Highlights

Mellum2.1 is the next version of [Mellum2 Thinking](https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking). The architecture is unchanged (a 12B mixture-of-experts model with 2.5B active parameters), and almost all of the work for this version went into post-training, primarily reinforcement learning (RL):

- **Reinforcement learning at a new scale:** RL went from a short final stage to the main part of training, after many experiments on both the methods and the data.
- **More data, filtered harder:** new RL tasks in math, competitive programming, science, tool use, and software engineering, combining open RL datasets with tasks we built ourselves and filtering every source before training.
- **Real environments for agentic skills:** for software engineering, the model trains inside real repositories with a shell and file-editing tools and is rewarded when the tests pass.

As a result, Mellum2.1 handles agentic tasks much better than Mellum2. After millions of sandboxed runs in real environments during training, it explores a codebase, edits files, and checks its own changes.

## Model Overview

**Mellum2.1 Thinking** has the following features:

- Number of Parameters: 12B total, 2.5B active
- Number of Layers: 28
- Hidden Size: 2304
- Intermediate Size: 7168
- MoE Intermediate Size: 896
- Number of Experts: 64
- Number of Activated Experts: 8
- Number of Attention Heads (GQA): 32 for Q and 4 for KV
- Context Length: 131,072
- Sliding Window: 1,024 (3 of every 4 layers)
- Vocabulary Size: 98,304
- Precision: bfloat16
- Multi-token prediction head: 1 layer, used as a speculative decoding draft
- License: Apache 2.0

## Serving with vLLM

Requires vLLM 0.33 or newer with transformers 5.20 or newer. The
`--speculative-config` flag turns on speculative decoding with the MTP head;
without it the server runs the plain model and ignores the head.

```sh
# Without tool calling
vllm serve JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP \
  --max-model-len 131072 \
  --reasoning-parser qwen3 \
  --speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'

# With tool calling
vllm serve JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP \
  --max-model-len 131072 \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser hermes \
  --speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'
```

GGUF builds for llama.cpp, Ollama, and LM Studio, including the MTP head as a
draft file, are in
[JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF).

## Quickstart

```python
from openai import OpenAI
# Configured by environment variables
client = OpenAI()

messages = [
    {"role": "user", "content": "Find the bug in this function and explain the fix: def mean(xs): return sum(xs) / len(xs) - 1"},
]

chat_response = client.chat.completions.create(
    model="JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP",
    messages=messages,
    max_tokens=81920,
    temperature=0.6,
    top_p=0.95,
    extra_body={"top_k": 20},
)
print("Chat response:", chat_response)
```

## Multi-token prediction head

The multi-token prediction (MTP) head is one extra transformer block, trained
together with the model, that predicts the token after the one just sampled.
Inference engines use it as a speculative draft: the model verifies every
drafted token, so the output is unchanged while decoding runs 1.4–1.8x faster,
with about 90% of the drafted tokens accepted. The head lives in
`model-mtp.safetensors` under the `mtp.` prefix, announced by
`num_nextn_predict_layers: 1` in `config.json`; everything else is identical to
[Mellum2.1 Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking).

- **vLLM** 0.33 or newer: `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`,
  as in the serving commands above.
- **transformers** 5.20 or newer: pass `use_mtp=True` to `generate`.
- **llama.cpp**: use the GGUF repository with `--spec-type draft-mtp --spec-draft-n-max 1`.

Older versions cannot load the extra tensors: transformers before 5.20 skips
them with a warning, vLLM releases up to 0.32 refuse the checkpoint. With those,
serve [Mellum2.1 Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking)
instead.

## Evaluation

The model weights are those of Mellum2.1 Thinking, so its results apply unchanged. All values are percentages; higher is better except HarmBench, where lower is better. All models were evaluated by JetBrains with the same pipeline in thinking mode. All values are self-reported by JetBrains.

| Benchmark | Mellum2.1 Thinking | Mellum2 Thinking | Gemma 4 (E4B) | Qwen3.5 (9B) |
| :--- | ---: | ---: | ---: | ---: |
| **Coding** | | | | |
| LiveCodeBench v6 | 82.0 | 69.4 | 69.4 | 75.4 |
| HumanEval+ | 91.5 | 90.9 | 89.1 | 89.6 |
| MBPP+ | 79.4 | 75.4 | 70.9 | 69.8 |
| **Math** | | | | |
| AIME 25/26 | 83.3 | 60.1 | 45.0 | 86.7 |
| GSM-Plus | 88.3 | 87.1 | 87.4 | 91.4 |
| **Agentic** | | | | |
| SWE-bench Verified | 47.0 | 2.0 | 23.0 | 50.0 |
| Terminal-Bench 2.1 | 17.4 | 0.6 | 3.4 | 21.7 |
| SWE-bench Pro | 28.0 | 0.0 | 4.0 | 38.0 |
| **Tool Use** | | | | |
| BFCL v4 | 62.3 | 49.6 | 52.5 | 58.5 |
| WorkBench | 44.6 | 45.1 | 46.1 | 39.7 |
| ToolHop | 49.1 | 46.7 | 39.9 | 52.0 |
| **Conversational** | | | | |
| IFEval | 90.6 | 79.5 | 90.8 | 92.4 |
| **Knowledge** | | | | |
| GPQA Diamond | 64.6 | 51.0 | 53.1 | 77.8 |
| MMLU-Redux | 87.8 | 86.0 | 84.9 | 89.5 |
| MixEval-Hard | 46.4 | 41.6 | 41.4 | 50.3 |
| **Safety** | | | | |
| XSTest | 88.8 | 91.2 | 95.2 | 95.6 |
| HarmBench (↓) | 8.5 | 21.5 | 38.1 | 6.6 |

Notes:
- Non-agentic benchmarks use greedy decoding.
- **Agentic** benchmarks use the same open-source agent harness (Pi v0.73.1, shell and file tools) for every model, with each model's default sampling (temperature 1.0 for Mellum2.1), a 114K-token context, and up to 16K tokens per turn.
- **AIME** is the mean of AIME 2025 and AIME 2026 (30 questions each).
- **BFCL v4** is the macro-average of five subtasks: v1, v2, v3, web search, memory.
- Mellum2 Thinking was re-evaluated with this pipeline, so its numbers differ slightly from the [Mellum2 Technical Report](https://arxiv.org/abs/2605.31268).

## License

Released under the Apache 2.0 license.
