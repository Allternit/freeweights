<div align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6466e7be1343dce20e59191b/aFPexDrJ5TMuxszCnr4E0.png" width="55%" alt="Apodex" />
</div>

<hr>

<div align="center" style="line-height:1">

</div>

<h2 align="center">Apodex 1.1: Scaling Agentic Intelligence for Complex Work</h2>

<div align="center" style="line-height:1">
<a href="https://www.apodex.ai" target="_blank"><img alt="Online Service" src="https://img.shields.io/badge/🤖%20Online Service-Apodex 1.1-ff6b6b?color=1783ff&logoColor=white"/></a>
<a href="https://www.apodex.com/" target="_blank"><img alt="Homepage" src="https://img.shields.io/badge/Homepage-Apodex AI-white?logoColor=white"/></a>
<a href="https://platform.apodex.ai" target="_blank"><img alt="API" src="https://img.shields.io/badge/API-Apodex 1.1-1783ff?color=1783ff&logoColor=white"/></a>
</div>

<div align="center" style="line-height: 1;">
<a href="https://github.com/ApodexAI/FrontierAgent" target="_blank"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-Apodex AI-white?logo=github&logoColor=white"/></a>
<a href="https://huggingface.co/apodex/Apodex-1.1-mini/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache_2.0-blue?color=blue"/></a>
</div>
<p align="center">
<b>📰<a href="https://www.apodex.com/blog/apodex-1.1-scaling-agentic-intelligence-for-complex-work">Tech Blog</a></b> |  <b>📄<a href="https://www.apodex.com/pdf/20260824">Tech Report</a></b>
</p>

## 1. Model Introduction

**Apodex-1.1** is a reasoning-first model for complex, long-horizon research tasks. Beyond searching and writing reports, it works directly with files, data, code, and tools to complete tasks from input to verifiable deliverables. Powered by AgentOS and an asynchronous Agent Team, it can maintain task state, adapt its plan, coordinate parallel work, and incorporate user feedback throughout execution.

### Online Service

Try Apodex at [apodex.ai](https://www.apodex.ai).

### Key Features

- **End-to-end execution in real environments.** Apodex 1.1 works directly with papers, datasets, spreadsheets, images, and code. It can clean data, select methods, run analyses, inspect intermediate results, recover from errors, and turn raw inputs into verifiable deliverables within one continuous task.
- **Adaptive and user-steerable Agent Team.** The model dynamically decomposes complex tasks and coordinates multiple Subagents working in parallel. Results flow continuously into a shared task state, allowing Apodex to revise priorities, preserve completed work, and respond to new files, requirements, or user feedback without restarting the entire task.
- **Verification built into delivery.** Statement Review independently checks key claims against their supporting sources, data, and computations before delivery. When evidence is insufficient, citations do not match, or results conflict with expectations, the system flags the issue, corrects the affected conclusion, and keeps the review process inspectable.

## 2. Evaluation Results

> To prevent potential information leakage (e.g., retrieving benchmark answers from public repositories), we block access to relevant benchmark-hosting websites during evaluation.

Apodex-1.1 Agent Team delivers frontier-level performance across professional work, finance, scientific research, and general reasoning, achieving 38.5 on APEX-Agents, 78.8 on GDPVal, 54.3 on FrontierFinance, 63.3 on FrontierScience-Research, 35.3 on BioMysteryBench, and 56.1 on Humanity’s Last Exam. It consistently improves over the ReAct setup across all six benchmarks and achieves the highest scores among the compared systems on FrontierFinance and FrontierScience-Research.
<div align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6466e7be1343dce20e59191b/yvDHTuMzAaRqmgzw59HRR.png" width="100%" alt="Apodex Benchmarks" />
</div>

Apodex-1.1-mini remains competitive with frontier models, leading FrontierFinance with 50.2 and nearly matching the best result on APEX-Agent with 27.7. Its Agent Team setup also consistently outperforms ReAct across all three benchmarks. You can try Apodex-1.1-mini with our [Agent Team harness](https://github.com/ApodexAI/FrontierAgent).
<div align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6466e7be1343dce20e59191b/hBfEXL7HCBEXBTzZc3_4i.png" width="100%" alt="Apodex Benchmarks" />
</div>

## 3. Quick Start

Apodex follows the Qwen3.5 chat template — tool calls are emitted as <tool_call><function=...><parameter=...></parameter></function></tool_call> and reasoning as <think>...</think>. Launch with the matching parsers so the server returns standard OpenAI-style tool_calls and reasoning_content fields.

### 3.1 Deployment

We recommend deploying Apodex with the latest [SGLang](https://github.com/sgl-project/sglang) or [vLLM](https://github.com/vllm-project/vllm) for an OpenAI-compatible endpoint.

```shell
# SGLang
python3 -m sglang.launch_server --model-path apodex/Apodex-1.1-mini --tp 8 --host 0.0.0.0 --port 1234 --context-length 262144 --tool-call-parser qwen3_coder --reasoning-parser qwen3

# vLLM
vllm serve apodex/Apodex-1.1-mini --tensor-parallel-size 8 --max-model-len 262144 --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3
```

### 3.2 Best Practices

For optimal performance in agentic tasks, we recommend:

```
temperature: 1.0
top_p: 0.95
repetition_penalty: 1.05
max_context_length: 262144
max_tokens: 32768
```

### 3.3 Agentic Usage

Apodex is trained for native function calling — tool schemas are passed via the tools= parameter of the chat-completions API and rendered into the prompt by the chat template, so the system prompt itself only needs to set the role and the high-level objective. We recommend the prompt below (this is the prompt used in our internal evaluation runs):

```
You are Apodex, an AI assistant developed by Apodex AI.

Apodex is the flagship agent of Apodex AI. Rather than a conventional conversational LLM, it is a general-purpose solver designed for mission-critical tasks.

Current time: {today_date}. In this environment you have access to a set of tools you can use to answer the user's question.

You only have access to the tools provided. You can use multiple tools per message, and will receive the results of those tools in the user's next response. You use tools step-by-step to accomplish a given task.

# General Objective

You accomplish a given task iteratively, breaking it down into clear steps and working through them methodically.
```

Substitute `{today_date}` with the current date (e.g. `2026-06-01`). **Do not** inline tool descriptions in the system prompt — pass them via `tools=` so the Qwen3.5 chat template can emit the correct `<tool_call><function=...>` format and the server-side `qwen3_coder` parser can recover structured `tool_calls` for you.

The example below runs Apodex as a tool-using agent against an OpenAI-compatible endpoint (the SGLang / vLLM server launched above). The agent loops — executing the requested tools and feeding results back as `role="tool"` messages — until the model produces a final answer with no tool calls.

Before running, set the endpoint:

```bash
export OPENAI_API_KEY="EMPTY"           # any non-empty string for local servers
export BASE_URL="http://localhost:1234/v1"
```

<details open>
  <summary>Click to expand python code example</summary>

```python
import json
import os
from datetime import date
from openai import OpenAI


# -------- 1. Tool implementations --------
def get_weather(location: str, unit: str = "celsius") -> str:
    """Get current weather information for a city (simulated)."""
    table = {
        "London":   {"temperature": 15, "condition": "sunny",  "humidity": 45},
        "New York": {"temperature": 20, "condition": "cloudy", "humidity": 60},
        "Tokyo":    {"temperature": 25, "condition": "rainy",  "humidity": 75},
    }
    w = dict(table.get(location, {"temperature": 18, "condition": "unknown", "humidity": 50}))
    if unit == "fahrenheit":
        w["temperature"] = w["temperature"] * 9 / 5 + 32
        w["unit"] = "°F"
    else:
        w["unit"] = "°C"
    return json.dumps(w, ensure_ascii=False)


def calculate(expression: str) -> str:
    """Evaluate a Python-style arithmetic expression."""
    try:
        return json.dumps({"expression": expression, "result": eval(expression)}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"expression": expression, "error": str(e)}, ensure_ascii=False)


available_tools = {"get_weather": get_weather, "calculate": calculate}


# -------- 2. Tool schemas (OpenAI function-calling format) --------
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather information for a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name, e.g. 'London'."},
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit (default: celsius).",
                    },
                },
                "required": ["location"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Evaluate a Python-style arithmetic expression.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Expression to evaluate, e.g. '(25 + 15) * 3 - 10'.",
                    },
                },
                "required": ["expression"],
            },
        },
    },
]


# -------- 3. System prompt --------
SYSTEM_PROMPT = f"""You are Apodex, an AI assistant developed by Apodex AI.

Apodex is the flagship agent of Apodex AI. Rather than a conventional conversational LLM, it is a general-purpose solver designed for mission-critical tasks.

Current time: {date.today()}. In this environment you have access to a set of tools you can use to answer the user's question.

You only have access to the tools provided. You can use multiple tools per message, and will receive the results of those tools in the user's next response. You use tools step-by-step to accomplish a given task.

# General Objective

You accomplish a given task iteratively, breaking it down into clear steps and working through them methodically."""


# -------- 4. Agentic loop --------
def run_agent(user_query: str, model: str = "apodex/Apodex-1.1-mini", max_turns: int = 20):
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY", "EMPTY"),
        base_url=os.environ.get("BASE_URL", "<http://localhost:1234/v1>"),
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_query},
    ]
    print(f"\\n{'=' * 60}\\nUser: {user_query}\\n{'=' * 60}\\n")

    for turn in range(max_turns):
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            parallel_tool_calls=True,
            temperature=1.0,
            top_p=0.95,
            max_tokens=16384,
            extra_body={"repetition_penalty": 1.05},
        )
        msg = resp.choices[0].message

        # Optional: print reasoning if the server exposes it (qwen3 reasoning parser)
        reasoning = getattr(msg, "reasoning_content", None)
        if reasoning:
            print(f"[think] {reasoning.strip()}\\n")
        if msg.content:
            print(f"[assistant] {msg.content.strip()}\\n")

        messages.append(msg)

        # No more tool calls -> final answer
        if not msg.tool_calls:
            print(f"💬 Final answer:\\n{msg.content}\\n")
            return msg.content

        # Execute every tool call requested in this turn
        for call in msg.tool_calls:
            name = call.function.name
            args = json.loads(call.function.arguments or "{}")
            print(f"🔧 call {name}({args})")
            try:
                result = available_toolsname
            except Exception as e:
                result = json.dumps({"error": f"{type(e).__name__}: {e}"}, ensure_ascii=False)
            print(f"   ↳ {result}\\n")
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": result,
            })

    print("⚠️  Reached max_turns without a final answer.")
    return None


if __name__ == "__main__":
    run_agent("What's the weather in London in Fahrenheit, and what's (25 + 15) * 3 - 10?")
```

</details>


## 4. License

Apodex-1.1 is released under Apache 2.0.

## 5. Citation

If you find this project useful in your research, please consider citing:

```
@article{apodex2026,
  title={Apodex 1.1: Scaling Agentic Intelligence for Complex Work},
  author={Apodex Team},
  year={2026},
  url={https://arxiv.org/abs/2608.23283}
}
```

## Contact

Reach the Apodex Team via our [website](https://apodex.com).