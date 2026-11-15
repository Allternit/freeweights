# Sage-A1.5

<div style="display: flex; flex-direction: column; align-items: center; line-height: 1.2;">
  <div style="display: flex; justify-content: center; align-items: center; gap: 10px; height: 30px;">
    <span style="font-size: 16px;" role="img" aria-label="Homepage">🏠</span>
    <a href="https://alpha-innovator.github.io/Sage-A1.5/"><b>Homepage</b></a>
    <span style="color: #ccc;">|</span>
    <img src="./figures/24px.svg" width="16" height="16" alt="Technical Report" style="filter: invert(0.5);">
    <a href="https://arxiv.org/abs/2610.28578"><b>Technical Report</b></a>
    <span style="color: #ccc;">|</span>
    <span style="font-size: 16px;" role="img" aria-label="Free Trial">🎁</span>
    <a href="https://discovery.intern-ai.org.cn/token-plan/home?tabIndex=0&lang=en-US"><b>Free Trial</b></a>
  </div>

  <div style="display: flex; justify-content: center; align-items: center; gap: 10px; height: 30px; margin-top: 2px;">
    <img src="./figures/hf-logo.svg" width="16" height="16" alt="Hugging Face">
    <a href="https://huggingface.co/InternScience/Sage-A1.5"><b>Hugging Face</b></a>
    <span style="color: #ccc;">|</span>
    <img src="./figures/github-logo.svg" width="16" height="16" alt="GitHub">
    <a href="https://github.com/InternScience/Agents-A1"><b>Github</b></a>
    <span style="color: #ccc;">|</span>
    <img src="./figures/modelscope-logo.svg" width="16" height="16" alt="Model Scope">
    <a href="https://modelscope.cn/models/InternScience/Sage-A1.5"><b>ModelScope</b></a>
  </div>
</div>


> [!Note]
> This repository contains model weights and configuration files for Sage-A1.5 in the Hugging Face Transformers format.
>
> These artifacts are compatible with Hugging Face Transformers, vLLM, SGLang, etc.

---

**Sage‑A1.5** is a 35B Mixture‑of‑Experts agentic model based on **[Qwen3.6](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)** and **[Agents-A1](https://huggingface.co/InternScience/Agents-A1)** from Shanghai AI Laboratory, built to advance long-horizon scientific problem solving through adaptive capability composition. Building upon **A1**, **Sage‑A1.5** learns not only to solve individual tasks, but also to organize work and revise its approach during execution, highlighting three key capabilities: **Agentic Orchestration, Verification, and Open Scientific Discovery**.

First, agentic orchestration extends single-agent execution through task delegation and parallel collaboration among subagents with isolated contexts, 
enabling complex tasks to be decomposed and addressed concurrently while reducing interference across concurrent subagents. 
Second, agentic verification strengthens long-horizon reliability through progress checking, evidence validation, and reflective strategy revision, 
allowing **Sage‑A1.5** to recognize unproductive search paths and pursue alternative approaches. 
Third, open scientific discovery extends agentic capabilities beyond answering predefined questions to conducting exploratory research, 
connecting scientific inquiry with interactive analysis and inspectable research artifacts. 
We hope **Sage‑A1.5** provides the community with an accessible foundation for open scientific discovery, 
offering a practical path from long-horizon task execution to collaborative, verifiable, and inspectable scientific exploration.

![Sage-A1 Benchmark Overview](./figures/Sage-A1p5-benchmark.png)

## Highlights
- **Agentic Orchestration**: Orchestrates parallel investigations across subagents with independent contexts, enabling them to challenge assumptions, refine conclusions through evidence, and synthesize their findings into comprehensive results.
- **Verification Mode**: An opt-in self-review capability that lives inside the model's own chain of thought — the model pauses mid-trajectory to review what it has established and what has failed, then acts on a revised direction in the same turn, with no external critic.
- **Agentic Reasoning**: Sage-A1.5 excels at decomposing complex tasks into executable sub-steps, planning ahead, and adapting its strategy based on intermediate results.
- **Tool Use**: Natively supports function calling and tool integration, enabling seamless interaction with APIs, code interpreters, search engines, and other external tools.
- **Scientific and Professional Reasoning**: Handles tool-integrated scientific reasoning and professional knowledge question answering.
- **Instruction Following**: Precisely follows detailed, multi-constraint instructions across diverse domains.

We welcome developers and enterprises to integrate and try Sage-A1.5 and share their feedback.

## Performance

We evaluate Sage-A1.5 in real-world agentic and research-oriented workflows across six
directions — long-horizon search, engineering tasks, instruction following, scientific research,
general agentic tasks, and scientific agentic tasks. Despite operating in the ~35B model class,
Sage-A1.5 delivers highly competitive performance against frontier-scale systems such as
Kimi-K3, GLM-5.3, and GPT-5.6-sol. It achieves overall SOTA on XBench-DS-2510 (92.0),
IFBench (81.6), PinchBench (90.0), FrontierScience-Olympiad (81.0), FrontierScience-Research (48.3),
CMT (80.0), and OmniDocBench (91.5), and reaches 95.1 on GAIA — higher than every
larger-scale model we compare against. Among comparable ~35B models it ranks first on a broad
range of tasks, including BrowseComp (81.7), SWE-bench Pro (61.2), MLE-Lite (65.2),
SciCode (44.3, tied with Agents-A1), AA-LCR (81.0), HLE w/ tools (55.1),
VitaBench (45.4), and ChemCOTBench (66.5).
Compared with A1, it improves substantially on engineering and agentic workloads
(SWE-bench Pro +17.6, SWE-bench Multilingual +14.0, PinchBench +13.1, MLE-Lite +21.3).
These results show that Sage-A1.5 combines strong long-horizon search ability, robust
scientific reasoning, and reliable instruction following, establishing it as a highly capable and
efficient agentic model that narrows the gap with much larger frontier models.


<p>
🥇 Overall SOTA &nbsp;&nbsp;
🟢 Best Among Comparable Models (~35B)
</p>

<table>
<thead>
<tr>
<th rowspan="2" align="left">Benchmark</th>
<th colspan="4" align="center" style="text-align:center;">
    📏 Comparable Models (~35B)
</th>

<th colspan="3" align="center" style="text-align:center;">
    🚀 Larger-scale Models
</th>
</tr>

<tr>
<th align="center">Sage-A1.5</th>
<th align="center">Agents-A1</th>
<th align="center">Qwen3.6-35B-A3B</th>
<th align="center">Ornith-1.5</th>
  
<th align="center">Kimi-K3</th>
<th align="center">GLM-5.3</th>
<th align="center">GPT-5.6-sol</th>

</tr>
</thead>

<tbody>

<tr>
    <td colspan="8" align="left"><b>🔍 Long-horizon Search</b></td>
</tr>

<tr>
<td align="left">GAIA</td>
<td align="center">95.1</td>
<td align="center">96.0 🥇</td>
<td align="center">78.6</td>
<td align="center">77.6</td>
<td align="center">92.2</td>
<td align="center">92.2</td>
<td align="center">88.3</td>
</tr>

<tr>
<td align="left">BrowseComp</td>
<td align="center">81.7 w/o Agentic Orchestration<br>82.8 🟢 w/ Agentic Orchestration</td>
<td align="center">75.5</td>
<td align="center">67.9</td>
<td align="center">67.6</td>
<td align="center">91.2 🥇</td>
<td align="center">76.2</td>
<td align="center">90.4</td>
</tr>

<tr>
<td align="left">DeepResearch-Bench2</td>
<td align="center">43.7 w/o Agentic Orchestration<br>47.5 w/ Agentic Orchestration</td>
<td align="center">37.5</td>
<td align="center">45.1</td>
<td align="center">48.6 🟢</td>
<td align="center">52.4</td>
<td align="center">55.7</td>
<td align="center">57.9 🥇</td>
</tr>

<tr>
<td align="left">XBench-DS-2510</td>
<td align="center">92.0 🥇</td>
<td align="center">86.0</td>
<td align="center">71.0</td>
<td align="center">80.0</td>
<td align="center">85.0</td>
<td align="center">84.0</td>
<td align="center">90.0</td>
</tr>



<tr>
    <td colspan="8" align="left"><b>⚙️ Engineering Tasks</b></td>
</tr>

<tr>
<td align="left">MLE-Lite</td>
<td align="center">65.2 🟢</td>
<td align="center">43.9</td>
<td align="center">37.9</td>
<td align="center">39.4</td>
<td align="center">72.7</td>
<td align="center">72.7</td>
<td align="center">77.3 🥇</td>
</tr>

<tr>
<td align="left">SciCode</td>
<td align="center">44.3 🟢</td>
<td align="center">44.3</td>
<td align="center">36.6</td>
<td align="center">39.5</td>
<td align="center">58.7</td>
<td align="center">59.0 🥇</td>
<td align="center">56.1</td>
</tr>

<tr>
<td align="left">SWE-bench Pro</td>
<td align="center">61.2 🟢</td>
<td align="center">43.6</td>
<td align="center">49.5</td>
<td align="center">59.6</td>
<td align="center">63.3</td>
<td align="center">64.6</td>
<td align="center">64.6 🥇</td>
</tr>

<tr>
<td align="left">SWE-bench Multilingual</td>
<td align="center">72.7 🟢</td>
<td align="center">58.7</td>
<td align="center">67.2</td>
<td align="center">71.4</td>
<td align="center">80.8</td>
<td align="center">81.3 🥇</td>
<td align="center">74.1</td>
</tr>

<tr>
    <td colspan="8" align="left"><b>📋 Instruction Following</b></td>
</tr>

<tr>
<td align="left">IFBench</td>
<td align="center">81.6 🥇</td>
<td align="center">80.6</td>
<td align="center">64.4</td>
<td align="center">44.6</td>
<td align="center">72.1</td>
<td align="center">53.4</td>
<td align="center">72.7</td>
</tr>

<tr>
<td align="left">AA-LCR</td>
<td align="center">81.0 🟢</td>
<td align="center">74.2</td>
<td align="center">71.7</td>
<td align="center">73.2</td>
<td align="center">88.7 🥇</td>
<td align="center">79.7</td>
<td align="center">84.0</td>
</tr>


<tr>
    <td colspan="8" align="left"><b>🧪 Scientific Research</b></td>
</tr>

<tr>
<td align="left">FrontierScience-Olympiad</td>
<td align="center">81.0 🥇</td>
<td align="center">79.0</td>
<td align="center">60.3</td>
<td align="center">70.0</td>
<td align="center">69.0</td>
<td align="center">67.0</td>
<td align="center">73.0</td>
</tr>

<tr>
<td align="left">FrontierScience-Research</td>
<td align="center">48.3 🥇</td>
<td align="center">40.0</td>
<td align="center">2.9</td>
<td align="center">6.7</td>
<td align="center">21.7</td>
<td align="center">16.7</td>
<td align="center">26.7</td>
</tr>

<tr>
<td align="left">HiPhO</td>
<td align="center">45.3</td>
<td align="center">46.4 🥇</td>
<td align="center">37.7</td>
<td align="center">39.5</td>
<td align="center">42.4</td>
<td align="center">39.7</td>
<td align="center">46.2</td>
</tr>

<tr>
<td align="left">HLE w/ tools</td>
<td align="center">55.1 🟢</td>
<td align="center">47.6</td>
<td align="center">36.2</td>
<td align="center">33.4</td>
<td align="center">56.0</td>
<td align="center">62.5</td>
<td align="center">64.5 🥇</td>
</tr>

<tr>
<td align="left">CMT</td>
<td align="center">80.0 🥇</td>
<td align="center">72.0</td>
<td align="center">20</td>
<td align="center">26.0</td>
<td align="center">34.0</td>
<td align="center">40.0</td>
<td align="center">50.0</td>
</tr>

<tr>
<td align="left">CritPt</td>
<td align="center">20.0 🟢</td>
<td align="center">4.3</td>
<td align="center">0.3</td>
<td align="center">2.9</td>
<td align="center">23.4</td>
<td align="center">19.1</td>
<td align="center">32.3 🥇</td>
</tr>


<tr>
    <td colspan="8" align="left"><b>🤖 General Agentic Tasks</b></td>
</tr>

<tr>
<td align="left">Agents' Last Exam (ALE-CLI)</td>
<td align="center">19.1 🟢</td>
<td align="center">10.2</td>
<td align="center">3.81</td>
<td align="center">14.3</td>
<td align="center">27.6</td>
<td align="center">28.5</td>
<td align="center">28.6 🥇</td>
</tr>

<tr>
<td align="left">VitaBench</td>
<td align="center">45.4 🟢</td>
<td align="center">38.7</td>
<td align="center">35.6</td>
<td align="center">44.6</td>
<td align="center">59.0 🥇</td>
<td align="center">58.7</td>
<td align="center">46.8</td>
</tr>

<tr>
<td align="left">PinchBench</td>
<td align="center">90.0 🥇</td>
<td align="center">76.9</td>
<td align="center">88.1</td>
<td align="center">88.6</td>
<td align="center">88.2</td>
<td align="center">86.6</td>
<td align="center">87.3</td>
</tr>

<tr>
    <td colspan="8" align="left"><b>🔬 Scientific Agentic Tasks</b></td>
</tr>

<tr>
<td align="left">ChemCOTBench</td>
<td align="center">66.5 🟢</td>
<td align="center">64.0</td>
<td align="center">59.3</td>
<td align="center">53.8</td>
<td align="center">82.5 🥇</td>
<td align="center">78.3</td>
<td align="center">77.9</td>
</tr>


<tr>
<td align="left">MatTools</td>
<td align="center">42.6</td>
<td align="center">47.1 🟢</td>
<td align="center">15.9</td>
<td align="center">38.6</td>
<td align="center">24.3</td>
<td align="center">53.2 🥇</td>
<td align="center">45.6</td>
</tr>

<tr>
<td align="left">OmniDocBench</td>
<td align="center">91.5 🥇</td>
<td align="center">89.5</td>
<td align="center">89.9</td>
<td align="center">89.6</td>
<td align="center">91.1</td>
<td align="center">-</td>
<td align="center">85.8</td>
</tr>

</tbody>
</table>

> [!Note]
> SWE-Bench Series: We use the mini-SWE-agent harness with a temperature of 1.0, top-p of 0.95, a 200K-token context window, and automatic context compaction enabled. All evaluations are conducted in a fully offline environment without internet access.
>
> GLM-5.3 on OmniDocBench: GLM-5.3 is a text-only (unimodal) model without multimodal input support, so its results on OmniDocBench, a multimodal benchmark, are not reported.


## Usage

### SGLang

[SGLang](https://github.com/sgl-project/sglang) is a fast serving framework for large language models and vision language models.

Install SGLang with uv:

```shell
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate

uv pip install sglang
```

See [its documentation](https://docs.sglang.ai/get_started/install.html) for more details.

The following commands create API endpoints at `http://localhost:8000/v1`:

- **Standard Version**:

  ```shell
  python -m sglang.launch_server \
    --model-path InternScience/Sage-A1.5 \
    --port 8000 \
    --mem-fraction-static 0.8 \
    --context-length 262144 \
    --reasoning-parser qwen3 \
    --tool-call-parser qwen3_coder
  ```

- **Multi-Token Prediction (MTP)**:

  ```shell
  python -m sglang.launch_server \
    --model-path InternScience/Sage-A1.5 \
    --port 8000 \
    --mem-fraction-static 0.8 \
    --context-length 262144 \
    --reasoning-parser qwen3 \
    --tool-call-parser qwen3_coder \
    --speculative-algorithm EAGLE \
    --speculative-num-steps 3 \
    --speculative-eagle-topk 1 \
    --speculative-num-draft-tokens 4
  ```

#### For ultra long context:

Sage-A1.5 natively supports a 256K context window. To extend it to 512K, serve the model with
YaRN (`factor: 2.0`) enabled by overriding the RoPE parameters:

```shell
SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1 \
python -m sglang.launch_server \
  --model-path InternScience/Sage-A1.5 \
  --port 8000 \
  --context-length 524288 \
  --json-model-override-args '{
      "text_config": {
          "rope_parameters": {
              "mrope_interleaved": true,
              "mrope_section": [11, 11, 10],
              "rope_type": "yarn",
              "rope_theta": 10000000,
              "partial_rotary_factor": 0.25,
              "factor": 2.0,
              "original_max_position_embeddings": 262144
          }
      }
  }' \
  --reasoning-parser qwen3 \
  --tool-call-parser qwen3_coder \
  --mem-fraction-static 0.88
```

### vLLM

[vLLM](https://github.com/vllm-project/vllm) is a high-throughput and memory-efficient inference and serving engine for LLMs.

Install vLLM from the main branch via uv:

```shell
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate

uv pip install vllm --torch-backend=auto
```

See [its documentation](https://docs.vllm.ai/en/stable/getting_started/installation/index.html) for more details.

The following commands create API endpoints at `http://localhost:8000/v1`:

- **Standard Version** (1 GPUs, 262K context):

  ```shell
  vllm serve InternScience/Sage-A1.5 \
    --port 8000 \
    --max-model-len 262144 \
    --reasoning-parser qwen3 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder

  ```
- **Text-Only** (skips vision encoder to free KV cache memory):

  ```shell
  vllm serve InternScience/Sage-A1.5 \
    --port 8000 \
    --tensor-parallel-size 1 \
    --max-model-len 262144 \
    --reasoning-parser qwen3 \
    --language-model-only
  ```

- **Multi-Token Prediction (MTP)**:
  ```shell
  vllm serve InternScience/Sage-A1.5 \
    --port 8000 \
    --max-model-len 262144 \
    --reasoning-parser qwen3 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder \
    --speculative-config '{"method":"mtp","num_speculative_tokens":3,"moe_backend":"triton"}'
  ```  

#### For ultra long context:

Sage-A1.5 natively supports a 256K context window. To extend it to 512K, serve the model with
YaRN (`factor: 2.0`) enabled via `--hf-overrides` (vLLM no longer supports the old `--rope-scaling`
flag):

```shell
VLLM_ALLOW_LONG_MAX_MODEL_LEN=1 \
vllm serve InternScience/Sage-A1.5 \
  --port 8000 \
  --max-model-len 524288 \
  --hf-overrides '{
    "text_config": {
      "rope_parameters": {
        "rope_type": "yarn",
        "rope_theta": 10000000,
        "partial_rotary_factor": 0.25,
        "factor": 2.0,
        "original_max_position_embeddings": 262144,
        "mrope_interleaved": true,
        "mrope_section": [11, 11, 10]
      }
    }
  }' \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder
```

### Advanced Modes

Sage-A1.5 ships two opt-in modes that build on the standard serving setup above. Both are off by
default: Agentic Orchestration Mode is turned on by registering a tool, Verification Mode by a chat-template flag.

#### Agentic Orchestration

Agentic Orchestration Mode (see [Highlights](#highlights)) lets the model fan out independent sub-questions to
sub-agents that run **in parallel**, each with its own context window and its own tool access. It is
enabled by exposing a `spawn_subagent` tool to the model: the model calls it whenever a task
decomposes into independent investigations, and your harness runs each sub-task and returns the
structured results.

Sub-agents are not restricted to any fixed tool set — they can be given whatever tools your
deployment registers (search, page reading, code execution, retrieval, internal APIs, …). By default
they inherit the main agent's tools; set `subagent_tools` if you want them to have a different, for
instance narrower, set.

Register the following tool schema alongside your other tools:

```python
SPAWN_SUBAGENT_SCHEMA = {
    "type": "function",
    "function": {
        "name": "spawn_subagent",
        "description": (
            "Dispatch one or more sub-agents IN PARALLEL to investigate independent "
            "sub-questions. Each sub-agent has access to google_search and read_page "
            "but CANNOT see your conversation. You MUST give each sub-agent everything "
            "it needs via the `task`, `context`, and `expected_output` fields. Sub-agents "
            "return structured JSON: {answer, status, evidence, unresolved_issues}."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "tasks": {
                    "type": "array",
                    "minItems": 1,
                    "description": "List of independent sub-tasks to dispatch in parallel.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "task": {
                                "type": "string",
                                "description": "Self-contained sub-question. The sub-agent has no other context.",
                            },
                            "context": {
                                "type": "string",
                                "description": "Background facts and constraints the sub-agent needs.",
                            },
                            "expected_output": {
                                "type": "string",
                                "description": "Form of the desired answer (e.g. 'a year YYYY', 'a person name').",
                            },
                        },
                        "required": ["task", "context", "expected_output"],
                    },
                },
            },
            "required": ["tasks"],
        },
    },
}
```

Because a sub-agent cannot see the main conversation, every task must be self-contained — `task`,
`context`, and `expected_output` are all required. Each sub-agent returns one compact JSON object
`{answer, status, evidence, unresolved_issues}`, and the batch is handed back to the main model in
input order.

**Notes:**

- Keep each sub-task **independent**. Tasks in one batch run concurrently and cannot see each
  other's results, so anything sequential belongs in separate `spawn_subagent` calls.
- `expected_output` acts as a format constraint on the sub-agent's `answer` (e.g. `'a year YYYY'`,
  `'a person name'`), which keeps results short and easy to merge.
- A sub-agent that cannot resolve its task returns `"UNKNOWN"` with a `status` of `unknown` or
  `insufficient_evidence` rather than guessing — check `status` before using an answer.
- Batch size and per-sub-agent turn budget are harness-side settings
  (`max_tasks_per_spawn`, default 5; `subagent_max_turns`, default 20). Oversized batches are
  rejected with an error message instead of being truncated.
- The schema's `description` above names `google_search` and `read_page` because that is the
  reference setup. If you give sub-agents a different tool set, update that sentence to match —
  it is what tells the main model what its sub-agents can actually do.

#### Verification Mode

Verification Mode (see [Highlights](#highlights)) is **opt-in** and off by default. Enable it per request by
passing `verification` through `chat_template_kwargs`; the chat template then appends the verification
protocol trigger to the end of your system message.

- **OpenAI Python client** (via `extra_body`):

  ```python
  from openai import OpenAI

  client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")

  response = client.chat.completions.create(
      model="InternScience/Sage-A1.5",
      messages=[
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Find the population of Beijing and cross-check it."},
      ],
      tools=TOOLS,
      extra_body={"chat_template_kwargs": {"verification": True}},
  )

  message = response.choices[0].message
  print(message.reasoning_content)  # self-review happens inside the chain of thought
  print(message.content)
  ```

- **curl**:

  ```shell
  curl http://localhost:8000/v1/chat/completions \
    -H 'Content-Type: application/json' \
    -d '{
      "model": "InternScience/Sage-A1.5",
      "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Find the population of Shanghai and cross-check it."}
      ],
      "chat_template_kwargs": {"verification": true}
    }'
  ```

**Notes:**

- A **non-empty system message is required**. Because the trigger is appended to the end of the system
  content, a request with `verification: true` and no system message (or a whitespace-only one) is
  rejected with HTTP 400.
- Pass a **JSON boolean**, not a string: `{"verification": true}`, not `{"verification": "true"}`.
- Omitting `chat_template_kwargs` is equivalent to `{"verification": false}`, which renders the prompt
  unchanged.
- Verification Mode is independent of tool use — it works with or without `tools`.
- The self-review is emitted as reasoning content, so read `reasoning_content` in addition to `content`.

### Recommended Sampling Parameters

For the best generation quality, we recommend the following sampling parameters:

- `temperature`: 1.0
- `top_p`: 0.95
- `top_k`: 20
- `min_p`: 0.0
- `presence_penalty`: 1.5
- `repetition_penalty`: 1.0
  

## Agent Capability Evaluation

To provide the community with a unified agent evaluation codebase for fair comparison, 
we have also open-sourced an evaluation framework for assessing agentic models across core capabilities, including tool use and multi-step reasoning. 
The evaluation code is included in the [Sage-A1/evaluation](https://github.com/InternScience/Agents-A1/tree/main/evaluation) of this repository.

We use this framework to evaluate the released model under a standardized and reproducible setting. 
Specifically, the model is tested on a set of agent-oriented tasks that require it to understand user goals, decompose complex instructions, 
interact with tools or environments when necessary, and produce final results. 
The evaluation results reported in [Model Card](https://huggingface.co/InternScience/Sage-A1.5) are generated using the open-source framework above, 
so that users can reproduce the experiments, compare other models under the same protocol, and further extend the benchmark for new agent scenarios. 
(**Note that:** To ensure a fair comparison, we report the benchmark results from their original technical reports. 
If a model does not report the corresponding benchmark results, we evaluate it using the same evaluation protocol as our model.)

For detailed evaluation scripts, task definitions, metrics, and reproduction instructions, please refer to the evaluation codebase.

## Citation

If you find our work helpful, feel free to give us a cite.

```
@misc{lou2026sagea15longhorizonexecutionscientific,
      title={Sage-A1.5: From Long-Horizon Execution to Scientific Exploration with Capability Composition}, 
      author={Sage-A1.5 Team},
      year={2026},
      eprint={2610.28578},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2610.28578}, 
}
```