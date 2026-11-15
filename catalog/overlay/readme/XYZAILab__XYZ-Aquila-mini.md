<div align="center">
  <a href="https://xyz-lab.ai/">
    <img src="./assets/xyz-ai-lab-slogan.svg" width="520" alt="XYZ AI Lab — We Build The Minds That Build" />
  </a>
</div>

<h1 align="center">XYZ-Aquila-mini</h1>

<p align="center"><strong>An open-weight thinking model for Deep Search.</strong></p>

<p align="center">
  <a href="https://xyz-lab.ai/"><img alt="Homepage" src="https://img.shields.io/badge/Homepage-XYZ%20AI%20Lab-111827?style=flat-square&logo=googlechrome&logoColor=white"></a>
  <a href="https://xyz-lab.ai/demo/"><img alt="Demo AI4AI" src="https://img.shields.io/badge/Demo-AI4AI-0f766e?style=flat-square&logo=googlechrome&logoColor=white"></a>
  <a href="https://xyz-lab.ai/try-it-out/"><img alt="Demo Search Agent" src="https://img.shields.io/badge/Demo-Search%20Agent-2563eb?style=flat-square&logo=googlechrome&logoColor=white"></a>
</p>

<p align="center">
  <a href="https://github.com/XYZ-AI-Lab"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-XYZ%20AI%20Lab-111827?style=flat-square&logo=github&logoColor=white"></a>
  <a href="https://huggingface.co/datasets/XYZAILab/XYZ-Aquila-SFT"><img alt="Data" src="https://img.shields.io/badge/Data-XYZ--Aquila--SFT-7c3aed?style=flat-square&logo=huggingface&logoColor=white"></a>
  <a href="https://xyz-lab.ai/blogs/ai4ai-at-scale/assets/bounded-exploration-ai4ai-system-optimization.pdf"><img alt="Technical Report" src="https://img.shields.io/badge/Technical%20Report-PDF-b45309?style=flat-square&logo=readthedocs&logoColor=white"></a>
</p>

## Introduction

**XYZ-Aquila** is a family of open-weight Deep Search agents developed by [XYZ AI Lab](https://xyz-lab.ai/). XYZ-Aquila-mini is post-trained from [Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) through a bounded-exploration **AI4AI** pipeline: humans define the target capability, development evidence, constraints, risk boundaries, and acceptance policy, while AI agents diagnose failures and propose scoped interventions across data, post-training, runtime, context management, tools, evaluation, and infrastructure.

The released checkpoint is a **thinking model** with Qwen-compatible reasoning and tool-call formats. It is optimized for agentic search, including long-horizon planning, English and Chinese web browsing, multi-source evidence aggregation, source verification, and recovery from failed environment interactions. The open-source [AxisAgentic harness](https://github.com/XYZ-AI-Lab/AxisAgentic) provides the concrete `search` / `scrape` / `python` tool implementations, fixed tool contract, replayable context management, and benchmark evaluation workflow; these capabilities are supplied by the surrounding harness rather than by the checkpoint alone.

## New Release

- HuggingFace models: [XYZ-Aquila-mini](https://huggingface.co/XYZAILab/XYZ-Aquila-mini) | [XYZ-Aquila-pro](https://huggingface.co/XYZAILab/XYZ-Aquila-pro)
- ModelScope models: [XYZ-Aquila-mini](https://modelscope.cn/models/XYZAILab/XYZ-Aquila-mini) | [XYZ-Aquila-pro](https://modelscope.cn/models/XYZAILab/XYZ-Aquila-pro)
- Data: [XYZ-Aquila-SFT](https://huggingface.co/datasets/XYZAILab/XYZ-Aquila-SFT)
- Agent harness: [AxisAgentic](https://github.com/XYZ-AI-Lab/AxisAgentic)

## Benchmark Results

The external benchmark suite was held out from routine AI4AI optimization. Following the technical report, evaluation uses a ReAct-style search harness with web search, webpage extraction, stateful Python execution, and a maximum 256K context. XYZ-Aquila-mini obtains the highest reported score in every column of the evaluated sub-40B open-weight comparison. XYZ-Aquila-pro obtains the highest reported score in every column of the evaluated sub-400B open-weight comparison.

<div align="center">
  <img src="./assets/benchmark_results_candidate_2.svg" width="100%" alt="XYZ-Aquila benchmark results across six agentic search benchmarks" />
</div>

The figure provides a visual overview across six agentic search benchmarks. The tables below transpose the comparison: each row is a benchmark and each column is a model within the group.

### Small-scale open-weight (<40B)

Open-weight systems with fewer than 40B parameters, including XYZ-Aquila-mini.

| Benchmark | XYZ-Aquila-mini | Agents-A1 | Nex-N2-mini | apodex-mini | MiroThinker 1.7 mini |
|:--|--:|--:|--:|--:|--:|
| BrowseComp | **78.8** | 75.5 | 74.1 | 71.5 | 67.9 |
| BrowseComp-ZH | **82.9** | -- | 79.6† | 80.6 | -- |
| DeepSearchQA | **89.5** | -- | 87.2† | 82.2 | -- |
| GAIA | **97.1** | 96.0 | -- | -- | 80.3 |
| LiveBrowseComp | **48.7** | 29.6† | 41.4† | 32.8† | 34.9† |
| HLE | **51.1** | 47.6 | 37.1† | 46.8 | 36.4 |
| WideSearch | **80.8** | -- | 62.0 | -- | 73.3† |

### Large-scale open-weight (<400B)

Open-weight systems with fewer than 400B parameters, including XYZ-Aquila-pro.

| Benchmark | XYZ-Aquila-pro | Nex-N2-Pro | MiroThinker 1.7 | apodex-1.0 |
|:--|--:|--:|--:|--:|
| BrowseComp | **84.8** | 83.7† | 74.0 | 75.5 |
| BrowseComp-ZH | **85.1** | 79.6† | 75.3 | 82.6 |
| DeepSearchQA | **92.5** | 92.3† | -- | 84.6 |
| LiveBrowseComp | **53.7** | 50.4† | 34.1† | -- |
| HLE | **53.3** | 50.0† | 42.9 | 49.0 |
| WideSearch | **81.2** | 75.6 | -- | -- |

### XYZ-Aquila-pro vs. Larger-Scale and Closed-Source Models

XYZ-Aquila-pro compared with larger-scale open-weight and closed-source models.

| Benchmark | XYZ-Aquila-pro | apodex-h1 | DeepSeek-V4-<br>Pro-Max | Kimi-K2.6 | Claude<br>Opus 4.7 | GPT-5.5<br>xhigh |
|:--|--:|--:|--:|--:|--:|--:|
| BrowseComp | 84.8 | **90.3** | 83.4 | 83.2 | 79.3 | 84.4 |
| BrowseComp-ZH | **85.1** | 84.1 | -- | -- | -- | -- |
| DeepSearchQA | 92.5 | **94.4** | -- | 92.5 | 89.1 | -- |
| LiveBrowseComp | **53.7** | -- | 38.3 | 31.7 | -- | -- |
| HLE | 53.3 | **60.8** | -- | 55.5 | 54.7 | 52.2 |
| WideSearch | **81.2** | -- | -- | 80.8 | -- | -- |

All values are percentages. HLE denotes Humanity's Last Exam. DeepSearchQA uses F1, WideSearch uses Item F1 Max@4, and the remaining benchmarks use accuracy. Rows with no reported result across an entire group are omitted; `--` indicates an unreported result within an otherwise populated row. `†` marks results reproduced under the common evaluation setup; other baseline values come from public reports or benchmark submissions. See the [technical report](https://xyz-lab.ai/blogs/ai4ai-at-scale/assets/bounded-exploration-ai4ai-system-optimization.pdf) for full provenance and analysis.

## Quickstart

### Install SGLang

We recommend `sglang>=0.5.14` for XYZ-Aquila-mini.

```bash
uv pip install 'git+https://github.com/sgl-project/sglang.git#subdirectory=python&egg=sglang[all]'
```

### SGLang Deployment

The example below launches an OpenAI-compatible endpoint with Qwen reasoning and tool-call parsers. It uses tensor parallelism across eight GPUs; reduce the tensor parallel size and context length if the deployment does not have enough memory.

```bash
MODEL_PATH=XYZAILab/XYZ-Aquila-mini
SERVED_MODEL=XYZ-Aquila-mini

python -m sglang.launch_server \
  --model-path "${MODEL_PATH}" \
  --served-model-name "${SERVED_MODEL}" \
  --port 8000 \
  --tp-size 8 \
  --mem-fraction-static 0.8 \
  --context-length 262144 \
  --reasoning-parser qwen3 \
  --tool-call-parser qwen3_coder
```

### Tool-Use Example

The following example sends a text-only research conversation with three tools to the SGLang OpenAI-compatible endpoint.

```python
import requests

BASE_URL = "http://localhost:8000/v1"
MODEL_NAME = "XYZ-Aquila-mini"

SYSTEM_PROMPT = r"""You are a task-solving research agent with access to native structured tools.
Use the tools step-by-step to answer the user's question accurately and completely.
Today is: 2026-06-27

# Tool-Use Rules

- Use the function-calling interface to invoke tools. Do not write tool calls as plain text.
- Call at most ONE tool per assistant turn. The next message will contain that tool's result; use it to decide your next step.
- Only use tools declared in the provided tools schema.
- Use web_search to discover relevant sources, verify facts, or find promising URLs.
- Use scrape_and_extract_info to read a specific URL or extract focused facts from a page.
- Prefer focused searches and focused extraction requests. Avoid repeating the same query or URL unless the previous result was unusable.
- For source-grounded questions, do not rely only on search snippets when a page needs to be inspected.

# Answering

- When you have sufficient evidence, stop calling tools and provide the final answer wrapped in \boxed{}.
- Follow the user's requested output format exactly.
- Keep the boxed answer concise: a number, short phrase, or comma-separated list when appropriate.
- Do not output a final prose response without \boxed{}.
"""

USER_PROMPT = r"""In the mythological literature of a certain northern European region, the parental figure of a specified character was joined in a legal and social union with a ruler whose title was derived from a specific tribal designation. The name of that tribe was also adopted as the identifier for a historical Continental kingdom, whose final independent sovereign fell in armed conflict against a nomadic steppe confederation in the latter half of the 5th century. The character in question administered a prepared liquid to a male subject who had, in the narrative, taken possession of a hoard of precious metal and crafted objects. The hoard's origin was a confrontation between a male figure and a winged, venomous creature that had once been a male member of a specific lineage. The administration of the liquid led to the subject developing an altered perception of a prior commitment of matrimony. The later consequence, directly flowing from this event, was the coerced marriage of the subject's sister to the leader of the aforementioned nomadic confederation. Provide the name recorded for the character who prepared and administered the liquid.
Follow the request's format instructions strictly and wrap the final answer in \boxed{}."""

messages = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": USER_PROMPT},
]

tools = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web using Google and return relevant results. Use this tool to find up-to-date information, verify facts, or discover URLs for further investigation.\n\nReturns structured search results including organic results, knowledge graph, and related questions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query string.",
                    },
                    "num": {
                        "type": "integer",
                        "description": "Number of results to return (default: 10, max: 100).",
                        "default": 10,
                    },
                    "hl": {
                        "type": "string",
                        "description": "Language code for results, e.g., 'en', 'zh', (ISO 639-1, default: 'en').",
                        "default": "en",
                    },
                    "gl": {
                        "type": "string",
                        "description": "Country code for localised results, e.g., 'us', 'gb', (ISO 3166-1 alpha-2, default: 'us').",
                        "default": "us",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "scrape_and_extract_info",
            "description": "Fetch and read the contents of a web page, PDF, or other online document. Returns the page content as clean text. When 'info_to_extract' is provided, uses an LLM to extract only the relevant information from the page.\n\nUse this tool to read web pages found via web_search, examine documents, or access any URL-addressable content.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The URL to scrape (web page, PDF, code file, etc.).",
                    },
                    "info_to_extract": {
                        "type": "string",
                        "description": "What specific information to extract from the page. If provided, returns a focused extraction instead of the full page content. If omitted, returns the full page content.",
                    },
                },
                "required": ["url"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_python_code",
            "description": "Execute a self-contained snippet of Python code in a fresh, isolated sandbox and return its output.\n\nEach call runs in a brand-new sandbox with no memory of previous calls: include every import and define every variable you need inside `code`, and `print(...)` anything you want to read back. Use it for calculations, symbolic math (sympy), numeric work (numpy/scipy), data processing, and verifying intermediate results.\n\nArgs:\n    code: The complete Python source to execute.\n\nReturns:\n    The captured execution result (stdout, returned values, and any error/traceback).",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Self-contained Python code to execute. Print any value you want returned.",
                    },
                },
                "required": ["code"],
            },
        },
    },
]

payload = {
    "model": MODEL_NAME,
    "messages": messages,
    "tools": tools,
    "temperature": 1.0,
    "top_p": 0.95,
    "repetition_penalty": 1.05,
    "max_tokens": 32768,
    "chat_template_kwargs": {
        "enable_thinking": True,
        "preserve_thinking": True,
    },
}

response = requests.post(f"{BASE_URL}/chat/completions", json=payload, timeout=1800)
response.raise_for_status()
result = response.json()
```

### Recommended Sampling Config

```yaml
temperature: 1.0
top_p: 0.95
repetition_penalty: 1.05
max_tokens: 32768
chat_template_kwargs:
  enable_thinking: true
  preserve_thinking: true
```

## Citation

```bibtex
@techreport{xyz_aquila_2026,
  title       = {AI4AI at Scale: A Full-Pipeline System for Enhancing LLM Agentic Capabilities},
  author      = {{XYZ Agentic Team}},
  institution = {XYZ AI Lab},
  year        = {2026},
  url         = {https://xyz-lab.ai/blogs/ai4ai-at-scale/assets/bounded-exploration-ai4ai-system-optimization.pdf}
}
```
