# Hermes 4.3 - Seed 36B

![4.3 small](https://cdn-uploads.huggingface.co/production/uploads/6317aade83d8d2fd903192d9/RoJnKcyjYfd5zj3PP3eRq.png)

## Model Description

Hermes 4.3 36B is a frontier, hybrid-mode **reasoning** model based on ByteDance Seed 36B base, made by Nous Research that is aligned to **you**. 

This is our first Hermes model trained in a decentralized manner over the internet using [Psyche](https://psyche.network), read the blog post: https://nousresearch.com/introducing-hermes-4-3/

Read the Hermes 4 technical report here: <a href="https://arxiv.org/abs/2508.18255">Hermes 4 Technical Report</a>

Chat with Hermes in Nous Chat: https://chat.nousresearch.com

Training highlights include a newly synthesized post-training corpus emphasizing verified reasoning traces, massive improvements in math, code, STEM, logic, creativity, and format-faithful outputs, while preserving general assistant quality and broadly neutral alignment.

## What’s new vs Hermes 3

- **Post-training corpus**: Massively increased dataset size from 1M samples and 1.2B tokens to **~5M samples / ~60B tokens** blended across reasoning and non-reasoning data.
- **Hybrid reasoning mode** with explicit `<think>…</think>` segments when the model decides to deliberate, and options to make your responses faster when you want.
- **Reasoning** that is top quality, expressive, improves math, code, STEM, logic, and even creative writing and subjective responses.
- **Schema adherence & structured outputs**: trained to produce valid JSON for given schemas and to repair malformed objects.
- **Much easier to steer and align**: extreme improvements on steerability, especially on reduced refusal rates.

## Our Mission: Frontier Capabilities Aligned to You

In pursuit of the mission of producing models that are open, steerable and capable of producing the full range of human expression, while being able to be aligned to your values, we created a new benchmark, RefusalBench, that tests the models willingness to be helpful in a variety of scenarios commonly disallowed by closed and open models.

**Hermes 4.3 36B is now SOTA across non-abliterated models on the RefusalBench Leaderboard, surpassing our previous best of 59.5% on Hermes 4 70B**
### % of Questions Answered – RefusalBench
*(Average of 5 trials)*
| Model | % of Questions Answered |
| :--- | :--- |
| **Hermes 4.3 36B Non-Reasoning** | 74.60% |
| **Hermes 4.3 36B Reasoning** | 72.29% |
| Hermes 4 70B Reasoning | 59.50% |
| Hermes 4 405B Reasoning | 57.10% |
| grok4 | 51.30% |
| Hermes 4 70B | 49.07% |
| Hermes 4 405B | 43.20% |
| Qwen2.5 7B | 36.10% |
| Qwen3 235B Reasoning | 34.30% |
| DeepSeek V3 | 28.10% |
| Gemini 2.5 Pro | 24.23% |
| Llama 405B | 21.70% |
| Gemini 2.5 Flash | 19.13% |
| GPT4o | 17.67% |
| Sonnet 4 | 17.00% |
| GPT4-mini | 16.76% |
| R1 | 16.70% |
| cogito-v2-405B Reasoning| 15.40% |
| Opus 4.1 | 15.38% |
| Qwen3 235B | 15.30% |
| cogito-v2-405B | 14.94% |
| cogito-v2-405B | 12.10% |
| GPT 5 | 11.34% |
| gpt-oss 120B | 5.60% |
| gpt-oss 20B | 4.79% |

Hermes 4 achieves SOTA on RefusalBench across all popular closed and open models in being helpful and conforming to your values, without censorship.

## Benchmarks (Hermes 4.3 36B)

| | Hermes 4.3 36B Psyche | Hermes 4.3 36B Centralized | Hermes 4 70B Centralized |
| :--- | :--- | :--- | :--- |
| AIME 24 | 71.9 | 70.6 | 73.5 |
| AIME 25 | 69.3 | 66.8 | 67.4 |
| BBH | 86.4 | 84.7 | 87.8 |
| DROP | 83.5 | 81.6 | 85.0 |
| GPQA Diamond | 65.5 | 64.8 | 66.1 |
| IFEval | 77.9 | 73.9 | 78.7 |
| MATH-500 | 93.8 | 92.3 | 95.5 |
| MMLU | 87.7 | 86.5 | 88.4 |
| MMLU-Pro | 80.7 | 79.7 | 80.7 |
| MuSR | 69.7 | 64.7 | 70.4 |
| OBQA | 96.6 | 91.8 | 94.8 |
| SimpleQA | 6.0 | 5.6 | 17.9 |

## Prompt Format

Hermes 4 uses Llama-3-Chat format with role headers and special tags.

**Basic chat:**
```
<|start_header_id|>system<|end_header_id|>

You are Hermes 4. Be concise and helpful.<|eot_id|>
<|start_header_id|>user<|end_header_id|>

Explain the photoelectric effect simply.<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
```

### Reasoning mode

Reasoning mode can be activated with the chat template via the flag `thinking=True` or by using the following system prompt:

```
You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside <think> </think> tags, and then provide your solution or response to the problem.
```

Note that you can add any additional system instructions before or after this system message, and it will adjust the models policies, style, and effort of thinking, as well as its post-thinking style, format, identity, and more. You may also interleave the tool definition system message with the reasoning one. 

When the model chooses to deliberate, it emits:

```
<|start_header_id|>assistant<|end_header_id|>
<think>
…model’s internal reasoning may appear here…
</think>
Final response starts here…<|eot_id|>
```

Additionally, we provide a flag to keep the content inbetween the `<think> ... </think>` that you can play with by setting `keep_cots=True`


## Function Calling & Tool Use

Hermes 4 supports function/tool calls *within* a single assistant turn, produced after it's reasoning:

**System message (example):**

```
<|start_header_id|>system<|end_header_id|>
You are a function-calling AI. Tools are provided inside <tools>…</tools>.
When appropriate, call a tool by emitting a <tool_call>{...}</tool_call> object.
After a tool responds (as <tool_response>), continue reasoning inside <think> and produce the final answer.
<tools>
{"type":"function","function":{"name":"get_weather","description":"Get weather by city","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}
</tools><|eot_id|>
```

Note that you may also simply place tool definitions into the "tools:" field of your messages, and the chat template will parse and create the system prompt for you. This also works with reasoning mode for improved accuracy of tool use.

The model will then generate tool calls within `<tool_call> {tool_call} </tool_call>` tags, for easy parsing. The tool_call tags are also added tokens, so it makes it easy to parse while streaming! There are also automatic tool parsers built-in to VLLM and SGLang for Hermes, just set the tool parser in VLLM to `hermes` and in SGLang to `qwen25`.

## Inference Notes

- **Sampling defaults that work well:** `temperature=0.6, top_p=0.95, top_k=20`.
- **Template:** Use the Llama chat format for Hermes 4.3 36B, 70B, and 405B as shown above, or set `add_generation_prompt=True` when using `tokenizer.apply_chat_template(...)`.

### Transformers example

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "NousResearch/Hermes-4.3-36B"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto"
)

messages = [
    {"role":"system","content":"You are Hermes 4. Be concise."},
    {"role":"user","content":"Summarize CRISPR in 3 sentences."}
]

inputs = tokenizer.apply_chat_template(
    messages, add_generation_prompt=True, return_tensors="pt"
).to(model.device)

outputs = model.generate(
    **inputs, max_new_tokens=400, temperature=0.6, top_p=0.95, top_k=20, do_sample=True
)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

For production serving on multi-GPU nodes, consider tensor parallel inference engines (e.g., SGLang/vLLM backends) with prefix caching.

## Inference Providers:

### Nous Portal:

<a href="https://portal.nousresearch.com"><img width=256 alt="chutes logo" src="https://cdn-uploads.huggingface.co/production/uploads/6317aade83d8d2fd903192d9/6YytY7N0mjCnBQvWo3qtv.png"></a>

### Chutes:

<a href="https://chutes.ai/app"><img width=256 alt="chutes logo" src="https://cdn-uploads.huggingface.co/production/uploads/6317aade83d8d2fd903192d9/l14AWPv6cSvaprpwK_IWY.png"></a>

# Quantized / Smaller Variants

Hermes 4 is available as BF16 original weights as well as BF16 as well as GGUF variants.

GGUF Verions (4, 5, 6, and 8bit): https://huggingface.co/NousResearch/Hermes-4.3-36B-GGUF

See the Hermes 4 collection to explore them all:
https://huggingface.co/collections/NousResearch/hermes-4-collection-68a731bfd452e20816725728

# How to cite

```bibtex
@misc{teknium2025hermes4technicalreport,
      title={Hermes 4 Technical Report}, 
      author={Ryan Teknium and Roger Jin and Jai Suphavadeeprasit and Dakota Mahan and Jeffrey Quesnelle and Joe Li and Chen Guang and Shannon Sands and Karan Malhotra},
      year={2025},
      eprint={2508.18255},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2508.18255}, 
}
```