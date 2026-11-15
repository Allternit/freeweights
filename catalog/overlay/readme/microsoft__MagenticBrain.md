# MagenticBrain

MagenticBrain is a 14B-parameter orchestration model from **Microsoft Research AI Frontiers**. It plans multi-step tasks, calls declared tools, and coordinates sub-agents. It does not execute actions itself — every real-world side effect happens inside a host harness.

The model is supervised fine-tuned from [Qwen/Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B) on agentic data: function-calling corpora, file-system trajectories, terminal tasks, sub-agent delegation traces, and reasoning data. After supervised fine-tuning, it was further trained with reinforcement learning on in-house-constructed terminal tasks. It's co-designed with **MagenticLite**, our agentic application and harness, and that's the configuration it has been most thoroughly evaluated in.

We're releasing weights only. Inference code, training recipes, and the execution harness are part of MagenticLite.

## Highlights

- **Orchestration-first post-training.** Specialized for planning, tool selection, multi-turn tool chaining, and sub-agent delegation. Not a general-purpose chat model.
- **Structured tool calls in JSON.** Tool schemas are passed in at inference time. The model selects only from declared tools and never invents new ones.
- **Sub-agent delegation built in.** Trained with explicit handoff traces to **Fara1.5-9B**, our computer-use sub-agent (browser and desktop control).
- **Submit-to-terminate protocol.** Every task ends with a dedicated `submit` signal, which is a protocol token, not an action. The harness uses it as the end-of-task indicator.
- **32K context.** Enough headroom for system prompt + tool schemas + multi-turn trajectory state.
- **Built on Qwen3-14B.** Inherits the base model's reasoning and instruction-following.

## Model Details

| | |
|---|---|
| **Developer** | Microsoft Research AI Frontiers |
| **Architecture** | Decoder-only transformer (Qwen3 architecture) |
| **Parameters** | ~14B |
| **Context length** | 32,768 tokens |
| **Inputs** | Text (system prompt, tool schema, user goal, trajectory state) |
| **Outputs** | Text and structured JSON tool calls |
| **Training period** | January 2026 – April 2026 |
| **Release date** | 14 May 2026 |
| **License** | MIT |
| **Base model** | [Qwen/Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B) |

## Recommended Deployment: MagenticLite

MagenticBrain is the orchestration model inside **MagenticLite**. The training mix, tool-call format, and submit/terminate protocol are calibrated against MagenticLite's execution loop. If you want the behavior MagenticBrain was trained for, run it inside MagenticLite.

The weights load in any compatible runtime (Transformers, vLLM, SGLang, TensorRT-LLM). If you integrate the model directly, you're responsible for the execution boundary: declaring the tool schema, parsing the model's JSON tool calls, executing tools under your own permissions, and handling the `submit` terminator.

## Quickstart

### Transformers

Requires `transformers >= 4.51.0`.

```python
import json
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "microsoft/MagenticBrain"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto",
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read the contents of a file at the given path.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "submit",
            "description": "Signal that the task is complete.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

messages = [
    {"role": "system", "content": "You are an orchestration agent. Plan steps and call only the tools declared below."},
    {"role": "user", "content": "Summarize the contents of /tmp/report.md."},
]

text = tokenizer.apply_chat_template(
    messages,
    tools=tools,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False,  # thinking is disabled by default for MagenticBrain
)

inputs = tokenizer(text, return_tensors="pt").to(model.device)
output_ids = model.generate(**inputs, max_new_tokens=1024)[0][inputs.input_ids.shape[1]:]
print(tokenizer.decode(output_ids, skip_special_tokens=True))
```

The model emits tool calls as JSON objects. Parse them, execute the tool in your host, feed the result back as a `tool` role message, and call `generate` again. Loop until the model emits `submit`.

### vLLM

Serve with an OpenAI-compatible endpoint that exposes tool-calling:

```bash
vllm serve microsoft/MagenticBrain \
  --enable-auto-tool-choice \
  --tool-call-parser hermes \
  --max-model-len 32768
```

Then call `/v1/chat/completions` with `tools=[...]` as you would with any OpenAI-compatible tool-use model. Pass `chat_template_kwargs={"enable_thinking": false}` to match training-time defaults.

### Recommended sampling

```
enable_thinking = false
temperature = 0.7
top_p = 0.8
top_k = 20
min_p = 0
presence_penalty = 1
```

MagenticBrain runs in non-thinking mode — keep `enable_thinking=False` in the chat template. Do not use greedy decoding; it causes endless repetition on this model family. Lower the temperature if you need stricter, more deterministic tool selection.

## Training

### Approach

Post-training has two stages. First, Supervised Fine-Tuning on a heterogeneous agentic data mix. Second, a reinforcement learning stage on in-house-constructed terminal tasks, further specializing the model for multi-step CLI execution. Thinking tokens are disabled by default (`enable_thinking=False`) to control verbosity and reduce looping on long trajectories.

### Data sources

- **Function-calling and orchestration:** APIGen-MT, ToolACE, xLAM
- **MCP environments:** 250+ synthetic Model Context Protocol environments with single- and multi-turn trajectories, generated for tool-orchestration training
- **File-system / Cowork:** file rename, organize, delete, and categorize trajectories
- **Terminal / CLI:** containerized tasks paired with executable tests
- **Sub-agent delegation:** explicit handoff traces (MagenticBrain → Fara1.5-9B for computer use)
- **Reasoning and planning:** Kimi-2.5-generated traces (preferred for lower verbosity), with filtered subsets of Dolci, Hermes, and Nemotron data

Total post-training corpus is under 1B tokens. Base-model pretraining is documented in the [Qwen3 technical report](https://arxiv.org/abs/2505.09388).

### Data processing

The corpus was filtered and normalized before training. Samples ending on non-`submit` tool calls were removed to prevent infinite-loop trajectories. Samples exceeding the 32K context were dropped. JSON tool-call formats were normalized through shared filters. Thinking blocks were stripped or regenerated to control output length.

### Latest data date

April 30, 2026. The corpus is not collected on an ongoing basis. Future updates will ship as separately versioned models with their own model cards.

## Intended Use and Limitations

### Primary use cases

- **Tool orchestration and workflow planning.** Decompose goals into steps, select tools from an explicit schema, populate structured arguments, chain outputs across multiple turns.
- **Agentic task coordination inside a host.** File operations, terminal and code execution, and system actions through host-owned tools, plus delegation to sub-agents.
- **Research and product experimentation with agentic systems.** Benchmarking agentic reasoning, studying delegation patterns, serving as the orchestrator in multi-agent stacks.

### Out of scope

- Fully autonomous agents that take unbounded actions or set their own goals
- Open-ended consumer chat with broad, unsandboxed tool permissions
- Systems that depend on emergent tool invention or self-modification
- Authoritative decisions on business outcomes, product logic, or user-facing policies — these remain the responsibility of host systems and humans

Use outside the declared tool schema, without a host-controlled execution boundary, or in deployments that bypass human-in-the-loop confirmation for sensitive actions is unsupported and outside the conditions the model was evaluated under.

## Responsible AI Considerations

MagenticBrain is a constrained orchestration model with delegated execution. Known risk areas include:

- **Unauthorized or harmful tool actions** if executed without checks
- **Over-autonomy and loss of human oversight** if agentic behavior is misinterpreted as self-directed decision-making
- **Hallucinated plans or policy-violating suggestions**
- **Data provenance, privacy, and IP risk** carried over from base-model pretraining

### Mitigations

The model has no execution authority on its own. All actions go through host-owned tools, and the tool surface is explicitly scoped — the model cannot call undeclared tools. Inside MagenticLite, additional safety layers apply: tool-output verification, scoped permissions for state-changing actions, and human-in-the-loop confirmation on sensitive operations.

If you're integrating MagenticBrain outside MagenticLite, we recommend:

- Declare the minimum tool surface required (least privilege)
- Surface the model's plan and tool calls in your UI for transparency
- Gate critical or irreversible tool calls behind explicit human confirmation
- Treat the model's plan as a recommendation, not an authoritative decision

MagenticBrain does not claim full autonomy, self-learning, independent policy-setting, or direct execution of real-world actions. Deployments that rely on any of these properties are unsupported.

### Safety evaluation

Safety evaluation covered harmful content (sexual, violent, hateful, self-harm), copyright and IP content, jailbreaks and UPIA-style prompt injection, ungrounded content, and task adherence. MagenticBrain's safety behavior is comparable to or better than the Qwen3-14B base model on these categories.

## License

Released under the **MIT License**. Model weights only — inference code, execution harness, training recipes, and hyperparameters are not part of this release.

## Contact

For information requests under the EU AI Act and related inquiries: **MSFTAIActRequest@microsoft.com**

Authorized representative: Microsoft Ireland Operations Limited, 70 Sir John Rogerson's Quay, Dublin 2, D02 R296, Ireland.