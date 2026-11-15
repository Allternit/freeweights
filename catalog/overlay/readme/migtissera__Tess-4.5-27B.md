<video src="https://huggingface.co/migtissera/Tess-4.5-27B/resolve/main/assets/tess-4.5-launch.mp4" poster="https://huggingface.co/migtissera/Tess-4.5-27B/resolve/main/assets/poster.jpg" controls autoplay muted loop playsinline width="100%"></video>

# Tess-4.5

**October 2026** · [Continuity Research](https://continuityresearch.ai/tess-4-5/) · [GGUF](https://huggingface.co/migtissera/Tess-4.5-27B-GGUF)

## The frontier, at home.

We’re introducing Tess-4.5, a 27-billion-parameter open-weights model for real engineering work. It reasons through every step, works with the tools and files actually in front of it, and runs on a single GPU or a laptop.

| **133 / 150** | **25%** | **0** | **96 tok/s** |
|:---:|:---:|:---:|:---:|
| BenchLocal, best of three tries (128 on the first). Level with its base, Qwen3.8-27B.¹ | Fewer tokens than its base to reach that score, reasoning included.² | Calls to a tool it wasn’t given, across 182 scored responses.³ | Writing code on a single RTX 4090, with the bundled draft head.⁴ |

---

## Nothing traded away.

Specialist fine-tunes usually pay for their specialty with general ability. Tess-4.5 doesn’t. On BenchLocal, the community’s quality suite for local models, it passes 133 of 150 scenarios within three tries, and 128 on the first: exactly its base, Qwen3.8-27B, on both counts. It leads on CLI-40, the pack closest to real terminal work, and is perfect on instruction following, math reasoning and bug finding.¹

| BenchLocal pack, best of three | Tess-4.5-27B | Qwen3.8-27B |
|---|:---:|:---:|
| ToolCall-15 | 13 | 13 |
| InstructFollow-15 | 15 | 15 |
| StructOutput-15 | 14 | 14 |
| DataExtract-15 | 14 | 14 |
| ReasonMath-15 | 15 | 15 |
| BugFind-15 | 15 | 15 |
| HermesAgent-20 | 16 | **17** |
| CLI-40 | **31** | 30 |
| **Total, best of three** | **133 / 150** | **133 / 150** |
| Total, first try | 128 / 150 | 128 / 150 |

## Less thinking. Same answers.

Tess-4.5 reaches the same score with a quarter fewer tokens. Across all 150 BenchLocal scenarios it generated 25% fewer tokens than its base, reasoning included. It is leanest where the work is hardest: on CLI-40 it used 32% fewer tokens and still scored higher, and on data extraction 43% fewer.²

| Tokens to the same score | Tess-4.5-27B | Qwen3.8-27B | |
|---|:---:|:---:|:---:|
| All 150 scenarios | **262K** | 349K | **−25%** |
| CLI-40 | **149K** | 219K | **−32%** |
| DataExtract-15 | **14K** | 25K | **−43%** |
| BugFind-15 | **28K** | 35K | **−21%** |

Fewer tokens means answers sooner, less context spent on its own thinking, and longer sessions before the window fills. On your own GPU it compounds with the draft head: fewer tokens, each one faster.

## It knows where it is.

Local agents tend to fail in the same few ways. They invent a path, call a tool that isn’t there, or lose the thread an hour in. Tess-4.5 is built to do the opposite.

It reads its environment before it acts: the directory it is working in, and the exact tools it has been handed. Across 182 scored BenchLocal responses, it never called a tool it wasn’t given.³

```text
# system
Working directory: /Users/sam/projects/agent-core
Tools: Bash

# user
What Python version is installed here?

# tess
Bash({"command": "python --version", "description": "Check installed Python version"})

# user, no tools offered
What is 17 × 23? Reply with just the number.

# tess
391
```

## Fast where you are.

Tess-4.5 ships with a multi-token-prediction draft head that writes several tokens per step. On a single RTX 4090 it doubles code generation, from 49 tokens a second to 96. On a MacBook Pro it takes code from 24 to 38.⁴

| Machine | Without draft | With MTP draft, code | With MTP draft, shell |
|---|:---:|:---:|:---:|
| NVIDIA RTX 4090 | 48.9 tok/s | **96.1 tok/s** | 85.5 tok/s |
| Apple M4 Max | 24.4 tok/s | **37.8 tok/s** | 33.1 tok/s |

## Capability, with control.

An agent that can run commands can also run the wrong one. Tess-4.5 is built to ask before destructive actions and to report failures plainly, but no model is a guarantee. Run it with permission prompts, in a sandbox, or in a container.

The weights are open. You can inspect them, adapt them and run them where your data already lives. The responsibility for how they are deployed is yours, too.

---

## Get started

**Give Tess its bearings.** Tess works best when it knows where it is. State the working directory in the system prompt and attach your real tool definitions:

```text
You are Tess, an agentic coding assistant that operates in the user's terminal.

# Environment

Working directory: /path/to/your/project
```

- Pass your actual tools in the `tools` field. Tess reads the definitions and uses what is there.
- Leave thinking on, which is the default, and keep `preserve_thinking` on for multi-turn agent loops.
- Sample with `temperature=1.0`, `top_p=0.95`, `top_k=20`, `min_p=0.0`.

**llama.cpp.** GGUF quantizations, the vision projector and the MTP draft heads are in [Tess-4.5-27B-GGUF](https://huggingface.co/migtissera/Tess-4.5-27B-GGUF).

```bash
llama-server -hf migtissera/Tess-4.5-27B-GGUF:Q4_K_M --spec-type draft-mtp --jinja -ngl 99 -c 65536
```

**vLLM.**

```bash
vllm serve migtissera/Tess-4.5-27B \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice --tool-call-parser qwen3_coder \
  --speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'
```

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")
response = client.chat.completions.create(
    model="migtissera/Tess-4.5-27B",
    messages=[
        {"role": "system", "content": "You are Tess, an agentic coding assistant.\n\n# Environment\n\nWorking directory: /home/me/project"},
        {"role": "user", "content": "Why is the test suite failing?"},
    ],
    tools=[{
        "type": "function",
        "function": {
            "name": "Bash",
            "description": "Executes a bash command and returns its output.",
            "parameters": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]},
        },
    }],
    temperature=1.0, top_p=0.95,
    extra_body={"top_k": 20, "chat_template_kwargs": {"preserve_thinking": True}},
)
print(response.choices[0].message)
```

## Availability

Tess-4.5 is available now under the Apache 2.0 license, built on [Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B).

| | |
|---|---|
| This repository | BF16 weights for transformers, vLLM and SGLang |
| [Tess-4.5-27B-GGUF](https://huggingface.co/migtissera/Tess-4.5-27B-GGUF) | Q4_K_M · Q6_K · Q8_0 · vision projector · MTP draft heads |
| Base model | Qwen3.8-27B: 27B dense, hybrid Gated DeltaNet and attention, vision-language |
| Context | 262,144 tokens, inherited from Qwen3.8-27B |
| Reasoning | Thinking on by default; `reasoning_effort` (`xhigh`, `medium`, `low`); `preserve_thinking` |
| Vision | Inherited from Qwen3.8-27B |

**Limitations.** Tess-4.5 is built for software engineering and agentic work in English. General chat and creative writing come from the base model and were not a focus.

---

## Notes

1. BenchLocal (benchlocal-cli), all 8 packs, 150 scenarios. Best of three is BenchLocal’s Pass@3: a scenario counts if any of up to three attempts passes. First try is Pass@1. Thinking on (reasoning effort xhigh), temperature 1.0, top-p 0.95, top-k 20, 16K thinking budget, one run per model on the same harness. At temperature 1.0 a single run moves by about two scenarios per pack, so read per-pack differences of one or two as ties. Community runs of Qwen3.8-27B with a 64K thinking budget report 129 to 137 on the first try.
2. Completion tokens, reasoning plus answer, on each scenario’s first attempt in the runs from note 1, summed over all 150 scenarios: Tess-4.5 262,047, Qwen3.8-27B 349,009. Counting retries too, Tess-4.5 used 20% fewer (318,532 against 399,130).
3. Counted over every scored response, retries included, to requests that declared no tools.
4. Q4_K_M with upstream llama.cpp, one request at a time, thinking on. RTX 4090: 131K context, q4_0 KV cache (the draft’s too), flash attention. M4 Max: 16K context. MTP: the Q8_0 draft head with draft-mtp speculative decoding. Gains depend on the task: on the 4090, prose went from 49 to 82 tokens a second.

## Acknowledgments

Tess-4.5 stands on [Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B). Thank you to the Qwen team for an exceptional open base model. Thanks also to [Thinking Machines Lab](https://thinkingmachines.ai) for Tinker, the [llama.cpp](https://github.com/ggml-org/llama.cpp) community, and the [BenchLocal](https://github.com/noonghunna/benchlocal-cli) community for an honest yardstick for local models.

```bibtex
@misc{tess45,
  title  = {Tess-4.5},
  author = {Migel Tissera},
  year   = {2026},
  url    = {https://huggingface.co/migtissera/Tess-4.5-27B}
}
```
