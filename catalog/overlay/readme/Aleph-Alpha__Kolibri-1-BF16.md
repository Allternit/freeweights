# Kolibri

[Tech report](https://aleph-alpha.com/downloads/tech-report.pdf) | [Tech blog](https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/)

Kolibri is Aleph Alpha's mixture-of-experts (MoE) reasoning model, with a
focus on German and English. The model supports an explicit reasoning mode
and tool calling. It is optimized for long-context and inference efficiency.

## Model overview

| Model | Kolibri 1 |
| --- | --- |
| Model Provider | Aleph Alpha GmbH |
| Model Developer | Aleph Alpha Research GmbH |
| Architecture | Mixture-of-Experts |
| Total parameters | 78B (`78,103,074,560`) |
| Active parameters / token | 3.46B (`3,457,573,120`) |
| Languages | German, English |
| Context length | `1,048,576 tokens`; we recommend ≤262,144 tokens for serving efficiency and complex tasks |
| Precision | `bfloat16` |
| Reasoning mode | Yes |
| Tool calling | Yes |
| License | Apache 2.0 |
| Acceptable Use Policy | n/a, cf. Responsible Use |
| Knowledge cutoff | EN: June 18, 2026, DE: June 18, 2026<br>*This only affects implicit knowledge, the model may use more recent information through tool use.* |
| Hardware requirements | Model memory footprint: ~156 GB (BF16 weights). Minimum: 4× A100 80 GB, 4× H100 SXM5, 2× H200, 1× B200 or 1× B300. Recommended: 4× H100 SXM5, 2× H200, 2× B200 or 1× B300. |
| Best for | Multi-step reasoning, retrieval-augmented generation, agentic tool calling, coding, German- and English-language assistant |
| Release Date | 3rd of October 2026 |
| Code of Practice | Aleph Alpha is a signatory of the EU GPAI Code of Practice, see <https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai>. |
| Training Data | Pre-training: Trained on 20T tokens of a filtered, bilingual corpus (~62.5% English, ~23.9% German, ~13.6% code) combining curated web data, synthetic rephrasings and translations, and high-quality sources. Additionally trained on 3.44T in mid-training and 201B for long-context extension.<br>Post-training: The SFT mix contained filtered, bilingual data that combines open-source datasets and synthetically generated data. For RL we used a broad mix of environments that cover reasoning, agentic, and instruction following use-cases. |
| Training method | We trained a transformer 50-layer MoE model with 4:1 SWA:GQA attention, using Muon and Exact Quantile Balancing on 384 experts per layer, with 1 shared and 6 routed. |
| Computing Resources | *Pre-training* (based on actual measurements), *excluding mid-training and long-context*: Hardware: 768 NVIDIA B200 (96 HGX 8xB200 nodes); Parallelism: EP8 FSDP16 DP6; Time: 21 days (511h, 392k GPUh)<br>*Mid-training*: 5 days, 90k GPUh (same setup as above)<br>*Long-Context*: 13h, 10k GPUh (same setup as above except parallelism: FSDP128 DP6)<br>FLOPS: **6.4e23** |
| Tech Report | <https://aleph-alpha.com/downloads/tech-report.pdf> |

## Intended use

Kolibri is intended to process text input and output in German and English
and to perform a wide range of tasks beyond natural-language generation, for
example multi-step reasoning, coding, structured extraction,
retrieval-augmented generation, long-document processing and agentic tool
calling.

Kolibri was pre-trained on sequences of 16,384 tokens, mid-trained on 65,536
and trained on 262,144 tokens in a final long-context phase, which is its
native context length. Because positional encoding is applied only in the
sliding-window layers, the context can be extended beyond that length
without any position scaling, in principle to arbitrary lengths. We have
validated quality and serving efficiency up to 1,048,576 tokens. For
latency- or throughput-sensitive deployments and for complex tasks, we
recommend contexts of at most 262,144 tokens. See the
[technical report](https://aleph-alpha.com/downloads/tech-report.pdf) for details.

For the kinds of systems Kolibri is meant to be integrated into, see AI
system types below; for uses that we encourage users to refrain from, see
Responsible Use.

## Design goals

Kolibri is designed to deliver strong German and English performance at low
serving cost. Its mixture-of-experts architecture activates only a small
fraction of its parameters for each token, keeping compute per token low
while retaining the capacity of a much larger model. The trade-off is
memory: the full model must be held in memory even though only part of it is
active at any time. To keep long contexts affordable, most attention layers
focus on nearby text, while a smaller number attend across the whole
context. We also developed a tokenizer tailored to German word structure, so
German text is processed efficiently without sacrificing English. Supporting
two languages rather than many is a deliberate choice of depth over breadth.

## AI system types

Kolibri is intended for integration into conversational assistants and
agentic workflows in German and English, in which a person reviews the
model's output before it is acted on rather than autonomous systems that act
unreviewed. It suits document-processing and drafting systems,
question-answering systems over an organisation's own material, and internal
knowledge and research tools. Its tool-calling and structured-output
capabilities make it appropriate for orchestration layers that call APIs,
execute code or run searches, provided the calling system validates the
results. In decision-support systems it belongs on the advisory side,
surfacing evidence and drafting options for a human to weigh, and it is not
intended as the deciding component. More broadly, it is built for human-AI
collaboration rather than unsupervised operation.

## Sustainability

### Energy consumption

9.5×10² MWh (estimated), including node power and data-centre overhead
(PUE). This includes pre-training, mid-training and long-context training.
It excludes SFT and RL, peak, idle and low-load states, and proxy and
ablation models.

### Energy measurement

For pre-training, we obtained the average power usage per node and the power
usage effectiveness (PUE) from the cluster provider. We multiplied these
with the number of nodes and the runtime to obtain a total energy estimate.

## Getting started

### Transformers

Kolibri runs with Transformers, which supports it natively from version
5.20:

```bash
pip install "transformers[torch]>=5.20"
```

#### Pipeline Usage

```python
from transformers import pipeline

pipe = pipeline("text-generation", model="Aleph-Alpha/Kolibri-1-BF16", device_map="auto")
messages = [{"role": "user", "content": "Erkläre kurz, was ein Mixture-of-Experts-Modell ist."}]
out = pipe(messages, max_new_tokens=1024)
print(out[0]["generated_text"][-1]["content"])
```

#### Auto Classes Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "Aleph-Alpha/Kolibri-1-BF16"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto")

messages = [{"role": "user", "content": "Erkläre kurz, was ein Mixture-of-Experts-Modell ist."}]
inputs = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    enable_thinking=False,
    return_tensors="pt",
    return_dict=True,
).to(model.device)
outputs = model.generate(**inputs, max_new_tokens=1024)
prompt_len = inputs["input_ids"].shape[1]
message = tokenizer.parse_response(outputs[0, prompt_len:], prefix=outputs[0, :prompt_len])
print(message["content"])
```

Drop `enable_thinking=False` to let the model reason first, and raise
`max_new_tokens` to leave room for it. The reasoning is in
`message["thinking"]`.

### vLLM

vLLM supports Kolibri natively from version 0.33.0 through its Transformers
modeling backend
([vllm-project/vllm#60827](https://github.com/vllm-project/vllm/pull/60827)):

```bash
pip install "vllm>=0.33.0"
```

Serve the model with reasoning and tool-calling enabled:

```bash
vllm serve Aleph-Alpha/Kolibri-1-BF16 \
  --reasoning-parser hf \
  --tool-call-parser hf \
  --enable-auto-tool-choice
```

The `hf` parsers read Kolibri's output format from the checkpoint's response
template.

For `vllm<0.33.0`, use the **aleph-alpha-inference** package that provides the
Kolibri vLLM plugin instead. Either use the container image
`ghcr.io/aleph-alpha/aleph-alpha-inference`, or install the package from
[Aleph-Alpha/aleph-alpha-inference](https://github.com/Aleph-Alpha/aleph-alpha-inference),
which also installs the vLLM version it supports:

```bash
pip install 'aleph-alpha-inference>=1'
```

With the plugin, serve with `--reasoning-parser kolibri1 --tool-call-parser
kolibri1` instead.

To serve contexts beyond 262,144 tokens, add `--max-model-len 1048576
--hf-overrides '{"max_position_embeddings": 1048576}'`.

The recommended sampling parameters for the model are `temperature=1.0`,
`top_p=0.97` and `top_k=128`.

### Querying the server (OpenAI-compatible API)

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="Aleph-Alpha/Kolibri-1-BF16",
    messages=[
        {
            "role": "user",
            "content": "Erkläre kurz, was ein Mixture-of-Experts-Modell ist.",
        },
    ],
    extra_body={
        "chat_template_kwargs": {
            "reasoning_effort": "high",
            "enable_thinking": True,
        }
    },
)
print(response.choices[0].message.content)
```

### Reasoning mode

Kolibri supports explicit thinking effort levels that need to be configured
through the chat template. You can pass `reasoning_effort` values `low`,
`medium` and `high` to configure the amount of effort our model puts into
finding the answer. You can disable thinking altogether by setting
`reasoning_effort` to `none` or passing `enable_thinking=false`. The model
will then immediately respond.

### Tool calling

The serving command enables Hermes-style tool calling (`--tool-call-parser
hf --enable-auto-tool-choice`). The `hf` parser does not support
`tool_choice="required"`, a named `tool_choice`, `parallel_tool_calls=false`
or strict tools; use `--tool-call-parser hermes` if you need them. Pass your
function schemas via the
standard `tools` field of the chat completions request; the model will emit
tool calls that the parser converts into structured output. Tool calling can
be combined with reasoning mode.

```python
import json
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")
MODEL = "Aleph-Alpha/Kolibri-1-BF16"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name, e.g. Heidelberg",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["city"],
            },
        },
    }
]


def get_weather(city, unit="celsius"):
    return {"city": city, "temperature": 18, "unit": unit, "conditions": "cloudy"}


messages = [{"role": "user", "content": "Wie ist das Wetter gerade in Heidelberg?"}]

first = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
msg = first.choices[0].message
messages.append(msg)

for call in msg.tool_calls or []:
    args = json.loads(call.function.arguments)
    result = get_weather(**args)
    messages.append(
        {
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps(result),
        }
    )

final = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
print(final.choices[0].message.content)
```

## Evaluation

The best value per row is bolded. In each table, the best value of each group
with more than one model is underlined, and both marks compare the MoE models
only. The dense models activate several times as many parameters per token,
so they are greyed out and unmarked.

### Post-training

<table style="border: 0; border-collapse: collapse; border-top: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4); font-size: 0.8em">
<tr style="border: 0"><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: left">Type</th><th colspan="12" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 1px solid rgba(128, 128, 128, 0.4)">MoE</th><th colspan="2" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">Dense</th></tr>
<tr style="border: 0"><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: left">Active parameters</th><th colspan="7" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4)">3B</th><th colspan="3" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 3px solid rgba(128, 128, 128, 0.25); border-bottom: 1px solid rgba(128, 128, 128, 0.4)">4-6B</th><th colspan="2" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 3px solid rgba(128, 128, 128, 0.25); border-bottom: 1px solid rgba(128, 128, 128, 0.4)">12B</th><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 3px solid rgba(128, 128, 128, 0.25); border-bottom: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">27B</th><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">70B</th></tr>
<tr style="border: 0"><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: left"></th><th colspan="2" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4)">Ours</th><th colspan="5" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4)">Baseline models</th><th colspan="3" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 3px solid rgba(128, 128, 128, 0.25)"></th><th colspan="2" style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 3px solid rgba(128, 128, 128, 0.25)"></th><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)"></th><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: center; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)"></th></tr>
<tr style="border: 0"><th style="font-weight: normal; border: 0; padding: 2px 4px; text-align: left; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)">Eval</th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-left: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Kolibri</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Kolibri Origin</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-left: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">GLM-4.7 Flash 30B-A3B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Nemotron 3 Nano 30B-A3B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Qwen3.5 35B-A3B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Qwen3.6 35B-A3B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Qwen3-Next 80B-A3B Thinking</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-left: 3px solid rgba(128, 128, 128, 0.25); border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Gemma 4 26B-A4B IT</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">GPT-OSS 120B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Mistral Small 4 119B-A6B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-left: 3px solid rgba(128, 128, 128, 0.25); border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">GLM-4.5 Air 106B-A12B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-bottom: 1px solid rgba(128, 128, 128, 0.4)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Nemotron 3 Super 120B-A12B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-left: 3px solid rgba(128, 128, 128, 0.25); border-bottom: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Qwen3.8 27B</div></th><th style="font-weight: normal; border: 0; padding: 2px 4px; vertical-align: bottom; border-left: 1px solid rgba(128, 128, 128, 0.4); border-bottom: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)"><div style="border: 0; padding: 2px 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap">Apertus 70B Instruct</div></th></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">Overall (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><b><ins>75.0</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">54.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">64.7</td><td style="border: 0; padding: 2px 4px; text-align: right">65.6</td><td style="border: 0; padding: 2px 4px; text-align: right">74.7</td><td style="border: 0; padding: 2px 4px; text-align: right">71.4</td><td style="border: 0; padding: 2px 4px; text-align: right">62.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">71.9</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>72.3</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">63.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">64.4</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>73.0</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">80.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">–</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">Overall (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><b><ins>71.0</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">46.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">50.4</td><td style="border: 0; padding: 2px 4px; text-align: right">59.3</td><td style="border: 0; padding: 2px 4px; text-align: right">69.8</td><td style="border: 0; padding: 2px 4px; text-align: right">67.3</td><td style="border: 0; padding: 2px 4px; text-align: right">58.0</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">66.3</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>70.2</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">61.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">64.8</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>67.9</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">79.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">–</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-weight: bold; border-top: 1px solid rgba(128, 128, 128, 0.4)">Knowledge</td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-style: italic">Average (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">50.2</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">39.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">45.5</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">46.0</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><b><ins>52.7</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">52.1</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">48.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic"><ins>51.4</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">50.0</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">47.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic">45.7</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><ins>52.0</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic; color: rgba(128, 128, 128, 0.8)">56.8</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic; color: rgba(128, 128, 128, 0.8)">22.8</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-style: italic">Average (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">57.6</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">44.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">46.5</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">41.2</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><ins>61.3</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">61.0</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">55.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic"><b><ins>61.5</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">58.0</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">51.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic">52.2</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><ins>59.5</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic; color: rgba(128, 128, 128, 0.8)">69.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic; color: rgba(128, 128, 128, 0.8)">24.8</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">GPQA Diamond (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><b><ins>84.8</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">68.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">73.1</td><td style="border: 0; padding: 2px 4px; text-align: right">73.9</td><td style="border: 0; padding: 2px 4px; text-align: right">83.8</td><td style="border: 0; padding: 2px 4px; text-align: right">83.4</td><td style="border: 0; padding: 2px 4px; text-align: right">76.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)"><ins>81.1</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">76.4</td><td style="border: 0; padding: 2px 4px; text-align: right">74.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">73.2</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>78.0</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">89.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">29.5</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">GPQA Diamond (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">81.0</td><td style="border: 0; padding: 2px 4px; text-align: right">58.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">59.8</td><td style="border: 0; padding: 2px 4px; text-align: right">49.6</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>84.2</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">80.6</td><td style="border: 0; padding: 2px 4px; text-align: right">72.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)"><ins>80.1</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">76.0</td><td style="border: 0; padding: 2px 4px; text-align: right">72.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">71.1</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>76.6</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">88.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">31.4</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">Humanity&#x27;s Last Exam (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><b><ins>21.3</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">9.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">15.4</td><td style="border: 0; padding: 2px 4px; text-align: right">12.1</td><td style="border: 0; padding: 2px 4px; text-align: right">20.4</td><td style="border: 0; padding: 2px 4px; text-align: right">21.1</td><td style="border: 0; padding: 2px 4px; text-align: right">11.6</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">19.2</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>19.4</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">9.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">8.7</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>20.6</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">35.6</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">5.2</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">Humanity&#x27;s Last Exam (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">16.1</td><td style="border: 0; padding: 2px 4px; text-align: right">10.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">9.1</td><td style="border: 0; padding: 2px 4px; text-align: right">13.1</td><td style="border: 0; padding: 2px 4px; text-align: right">18.1</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>20.5</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">15.6</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)"><b><ins>23.4</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">20.7</td><td style="border: 0; padding: 2px 4px; text-align: right">10.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">10.5</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>22.3</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">37.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">5.7</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">AA-Omniscience Accuracy (public set)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">14.8</td><td style="border: 0; padding: 2px 4px; text-align: right">11.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">17.0</td><td style="border: 0; padding: 2px 4px; text-align: right">19.5</td><td style="border: 0; padding: 2px 4px; text-align: right">22.2</td><td style="border: 0; padding: 2px 4px; text-align: right">21.0</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>24.2</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">20.7</td><td style="border: 0; padding: 2px 4px; text-align: right">23.3</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>25.0</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">20.0</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>26.7</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">19.0</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">13.5</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; color: rgba(128, 128, 128, 0.8)">AA-Omniscience Index (public set)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">-30.7</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">-64.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">-62.8</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">-45.7</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">-46.2</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)"><b><ins>-12.5</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">-42.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">-47.3</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">-35.2</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)"><ins>-24.0</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)"><ins>-28.8</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">-36.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">-5.8</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">–</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">MMLU-Pro CoT (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">80.1</td><td style="border: 0; padding: 2px 4px; text-align: right">70.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">76.5</td><td style="border: 0; padding: 2px 4px; text-align: right">78.3</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>84.6</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">84.3</td><td style="border: 0; padding: 2px 4px; text-align: right">81.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)"><ins>84.5</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">80.8</td><td style="border: 0; padding: 2px 4px; text-align: right">80.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">80.9</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>82.7</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">85.0</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">43.0</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">MMLU-ProX CoT (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">75.6</td><td style="border: 0; padding: 2px 4px; text-align: right">65.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">70.7</td><td style="border: 0; padding: 2px 4px; text-align: right">61.0</td><td style="border: 0; padding: 2px 4px; text-align: right">81.7</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>81.9</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">79.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)"><ins>81.1</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">77.2</td><td style="border: 0; padding: 2px 4px; text-align: right">70.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">74.9</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>79.7</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">82.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">37.3</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-weight: bold; border-top: 1px solid rgba(128, 128, 128, 0.4)">Math</td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-style: italic">Average (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic"><b><ins>96.2</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">81.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">88.8</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">88.8</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">90.1</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">87.8</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">86.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic">87.4</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><ins>90.7</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">81.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic">82.8</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><ins>91.1</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic; color: rgba(128, 128, 128, 0.8)">97.8</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic; color: rgba(128, 128, 128, 0.8)">0.6</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-style: italic">Average (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic"><ins>89.3</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">74.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">45.2</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">84.3</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">79.6</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">83.7</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">83.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic">88.1</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><b><ins>90.8</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">75.4</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic">80.6</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><ins>86.5</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic; color: rgba(128, 128, 128, 0.8)">96.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic; color: rgba(128, 128, 128, 0.8)">0.1</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">AIME 2025 (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><b><ins>95.8</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">81.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">89.4</td><td style="border: 0; padding: 2px 4px; text-align: right">89.6</td><td style="border: 0; padding: 2px 4px; text-align: right">88.1</td><td style="border: 0; padding: 2px 4px; text-align: right">84.6</td><td style="border: 0; padding: 2px 4px; text-align: right">84.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">87.3</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>90.6</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">79.8</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">81.9</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>91.7</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">97.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">0.6</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">AIME 2025 (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><ins>88.5</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">73.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">43.8</td><td style="border: 0; padding: 2px 4px; text-align: right">84.4</td><td style="border: 0; padding: 2px 4px; text-align: right">76.7</td><td style="border: 0; padding: 2px 4px; text-align: right">82.9</td><td style="border: 0; padding: 2px 4px; text-align: right">80.6</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">88.1</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>90.6</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">72.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">80.6</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>85.6</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">96.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">0.2</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">AIME 2026 (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><b><ins>96.7</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">81.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">88.3</td><td style="border: 0; padding: 2px 4px; text-align: right">87.9</td><td style="border: 0; padding: 2px 4px; text-align: right">92.1</td><td style="border: 0; padding: 2px 4px; text-align: right">91.0</td><td style="border: 0; padding: 2px 4px; text-align: right">88.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">87.5</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>90.8</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">83.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">83.8</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>90.4</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">97.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">0.6</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">AIME 2026 (DE)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><ins>90.2</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">75.2</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">46.7</td><td style="border: 0; padding: 2px 4px; text-align: right">84.2</td><td style="border: 0; padding: 2px 4px; text-align: right">82.5</td><td style="border: 0; padding: 2px 4px; text-align: right">84.4</td><td style="border: 0; padding: 2px 4px; text-align: right">86.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">88.1</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>91.0</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">78.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">80.6</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>87.5</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">96.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">0.0</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-weight: bold; border-top: 1px solid rgba(128, 128, 128, 0.4)">Agentic</td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 3px solid rgba(128, 128, 128, 0.25); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td><td style="border: 0; padding: 2px 4px; border-left: 1px solid rgba(128, 128, 128, 0.4); border-top: 1px solid rgba(128, 128, 128, 0.4)"></td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; font-style: italic">Average (EN)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">63.1</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">41.6</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic">58.9</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">46.4</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><b><ins>63.4</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">62.1</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">46.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic"><ins>54.6</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">54.0</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic">40.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic">53.5</td><td style="border: 0; padding: 2px 4px; text-align: right; font-style: italic"><ins>54.9</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); font-style: italic; color: rgba(128, 128, 128, 0.8)">66.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); font-style: italic; color: rgba(128, 128, 128, 0.8)">–</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px; color: rgba(128, 128, 128, 0.8)">TerminalBench 2.1</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">30.7</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">–</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">20.2</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">9.7</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)"><b><ins>39.7</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">–</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">8.6</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">–</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)"><ins>29.2</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)">21.0</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">–</td><td style="border: 0; padding: 2px 4px; text-align: right; color: rgba(128, 128, 128, 0.8)"><b><ins>39.7</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">76.8</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">–</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">Tau2-Bench (Telecom)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">94.4</td><td style="border: 0; padding: 2px 4px; text-align: right">67.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">95.9</td><td style="border: 0; padding: 2px 4px; text-align: right">45.9</td><td style="border: 0; padding: 2px 4px; text-align: right">97.7</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>99.1</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">43.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">45.3</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>73.1</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">41.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">53.8</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>68.1</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">82.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">10.8</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">Tau2-Bench (Retail)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">69.3</td><td style="border: 0; padding: 2px 4px; text-align: right">58.5</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">57.9</td><td style="border: 0; padding: 2px 4px; text-align: right">64.9</td><td style="border: 0; padding: 2px 4px; text-align: right">70.8</td><td style="border: 0; padding: 2px 4px; text-align: right"><b><ins>71.6</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">60.8</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)"><ins>71.3</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">60.5</td><td style="border: 0; padding: 2px 4px; text-align: right">62.9</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">61.4</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>67.5</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">68.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">9.6</td></tr>
<tr style="border: 0"><td style="border: 0; padding: 2px 4px">Tau2-Bench (Airline)</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)"><b><ins>78.0</ins></b></td><td style="border: 0; padding: 2px 4px; text-align: right">58.7</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4)">68.7</td><td style="border: 0; padding: 2px 4px; text-align: right">52.7</td><td style="border: 0; padding: 2px 4px; text-align: right">76.0</td><td style="border: 0; padding: 2px 4px; text-align: right">70.7</td><td style="border: 0; padding: 2px 4px; text-align: right">65.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)"><ins>73.3</ins></td><td style="border: 0; padding: 2px 4px; text-align: right">72.7</td><td style="border: 0; padding: 2px 4px; text-align: right">40.0</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25)">70.7</td><td style="border: 0; padding: 2px 4px; text-align: right"><ins>72.7</ins></td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 3px solid rgba(128, 128, 128, 0.25); color: rgba(128, 128, 128, 0.8)">83.3</td><td style="border: 0; padding: 2px 4px; text-align: right; border-left: 1px solid rgba(128, 128, 128, 0.4); color: rgba(128, 128, 128, 0.8)">40.0</td></tr>

_The publisher's README is longer; it is cut here. Read the rest at the source._
