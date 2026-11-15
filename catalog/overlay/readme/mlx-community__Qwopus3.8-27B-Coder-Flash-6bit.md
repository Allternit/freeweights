# ⚡ Qwopus3.8-27B-Coder-Flash

![Qwopus3.8-27B-Coder-Flash — 27B coding, agentic reasoning, and efficient execution](assets/model_hero.png)

## A coding-oriented Flash model for practical software work

**Qwopus3.8-27B-Coder-Flash** is positioned for coding, agentic reasoning, tool use, and efficient execution. It extends the Qwopus Flash philosophy to a 27B model focused on useful software-engineering work: understand the request, make a concrete change, inspect tool feedback, test the result, recover from errors, and deliver the artifact.

## 🎨 Visual Coding Showcase

### 3D Seaside Town Modeling Test

A recorded walkthrough of the 3D seaside town modeling test.

<video src="https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF/resolve/main/assets/showcase/seaside_town_3d_modeling_test.mp4" poster="https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF/resolve/main/assets/showcase/seaside_town_3d_modeling_poster.jpg" controls autoplay loop muted playsinline preload="metadata" width="100%" style="width: 100%; border-radius: 12px;"></video>

[Open or download the video](https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF/resolve/main/assets/showcase/seaside_town_3d_modeling_test.mp4)

### Five-Story Pagoda Test

![Five-Story Pagoda Test — rendered pagoda scene](assets/showcase/five_story_pagoda_test.png)

These examples illustrate visual coding outputs; they complement the quantitative evaluations below.

## 💡 1. The Flash Philosophy — Make Each Token Count

Flash puts useful work first. For a coding model, quality means more than producing a plausible answer: it means implementing the requested change, handling relevant edge cases, and helping an agent reach a tested result.

The practical workflow is:

**Read → Reason → Call Tools → Edit → Test → Recover → Deliver**

Compact, purposeful reasoning is a design goal for this model. The evaluations in this card do not measure reasoning-token reduction, so this goal should not be read as a demonstrated reduction in reasoning length or a general speedup. The focus is to spend each turn on a useful next action while preserving code quality and task completion.

> [!TIP]
> **Efficiency includes correctness.** A short response is useful when it solves the task. The results below therefore report task outcomes and decoding throughput separately.

## 🧪 2. Model Preparation and Collaboration

**Qwopus3.8-27B-Coder-Flash** is a coding-oriented fine-tune of [unsloth/Qwen3.8-27B](https://huggingface.co/unsloth/Qwen3.8-27B), based on [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B). It focuses on code generation, complex reasoning, and the repeated tool-use decisions involved in practical software work. The model uses the **Apache-2.0** license.

**Community support.** We thank [Kyle Hessling · @KyleHessling1 on X](https://x.com/KyleHessling1) for his collaboration and support across the Qwopus project, and [Unsloth](https://unsloth.ai/) for its open-source fine-tuning tools and contributions to the model-training community.

## 📚 3. Dataset and Distillation Recipe

The model was fine-tuned on approximately **200,000 (~200K) code and complex-reasoning examples**, combining agent interactions, algorithm and code-generation tasks, and logical reasoning.

| Data component | Approximate scope and sources | Training focus |
| :--- | :--- | :--- |
| Agent interaction and tool use | ~20K examples, primarily distilled from **Qwen3.8-Flash-Max** | Multi-turn tool calling, tool selection and execution, environment-state tracking, error recovery, self-correction, context-aware planning, boundary awareness, and final delivery |
| Algorithm and code generation | Teacher sources: **Qwen3.8-Flash-Max**, **Qwen3.8-Max**, and **DeepSeek-V4-Flash** | Algorithm implementation, complex code generation, syntax correctness, edge cases, refactoring, debugging, structured reasoning, and instruction following |
| Logical reasoning and instruction tuning | High-quality reasoning and instruction data from the **NVIDIA Nemotron** series | Multi-step reasoning, logical consistency, complex instructions, structured responses, and alignment between reasoning and coding |

The agent-interaction examples are intended to help the model work through the repeated decisions in a software-engineering agent: choosing a tool, interpreting its output, updating the plan, correcting an invocation, and returning a finished artifact. Code-generation and reasoning examples complement these trajectories with algorithmic problem solving, instruction execution, and planning.

## 📊 4. Benchmark Results — MMLU-Pro and Coding Quality

The visual summary below presents local evaluation results. **Coder-Flash** denotes **Qwopus3.8-27B-Coder-Flash**.

![Local benchmark summary for Qwopus3.8-27B-Coder-Flash and reference models. The test sets and settings differ, so the rows are not a controlled ranking.](assets/benchmark_summary.png)

### MMLU-Pro evaluation details

> [!NOTE]
> The reported local score is **93.87% (1,408 / 1,500)** on a balanced subset of **500 mathematics, 500 physics, and 500 chemistry questions**. The run used **zero-shot chain-of-thought (CoT)**; this is a local subset result, distinct from the official five-shot MMLU-Pro protocol.

### Throughput and output-length notes

The recorded decoder-only throughput is calculated from the number of generated tokens divided by the sum of the requests' decoding times. It is **not** the wall-clock throughput of the entire concurrent evaluation. Results collected under different runtime conditions should not be treated as strict end-to-end comparisons.

The aggregate `raw_output` character counts are **9,576,855** for this model, **7,949,546** for Qwopus3.8-27B-Flash, and **8,824,213** for Qwen3.8 Base. Character count is not token count and does not, by itself, establish inference efficiency.

## ⚡ 5. Efficiency — Purposeful Reasoning and Practical Inference

The Flash design goal is to keep reasoning directed toward the next useful action in a coding or tool-use workflow. This evaluation records a decoder-only throughput of **8.973 tok/s** for Qwopus3.8-27B-Coder-Flash. The corresponding reference figures are **9.347 tok/s** for Qwopus3.8-27B-Flash and **8.284 tok/s** for Qwen3.8 Base.

No end-to-end acceleration, memory footprint, energy use, token savings, or reduction in reasoning length is reported here. Those measurements require their own documented test conditions.

## 🍎 6. Practical Agent Evaluation

Two local evaluations provide separate views of coding-agent behavior.

### Agentic software engineering — 9 / 9

The coding-agent test covers three concrete changes:

1. Repair a function that merges overlapping intervals.
2. Add a case-sensitivity parameter to a record-search function.
3. Add a `drop_remainder` parameter to a chunking function.

Each task was run with three different seeds and checked with task-specific tests. The model passed **9 / 9 runs (100%)** in this set. This is a small, targeted local evaluation, not a general software-engineering benchmark or a repository-scale success estimate.

### Agent error recovery — 144 episodes

A separate controlled command-line task asked an agent to turn four rows of telemetry into a JSON summary file. Episodes varied prior-context fixtures, error placement, temperature, and random seed. Scenarios included missing arguments, an invalid output format, an incorrect input path, inspecting tool feedback and help/configuration, checking the filesystem, correcting a tool invocation, and delivering the final artifact.

![Separate local agent evaluation signals: Coding Agent 9/9, strict final delivery 135/144, artifact assertions 140/144, and no candidate repeated-failure loops detected by the heuristic.](assets/agent_evaluation.png)

## ⚙️ 7. Inference Examples

### Checkpoint and runtime

Use **Transformers 5.8.0 or newer** for the Qwen3.8 processor, together with a compatible PyTorch installation. The full checkpoint uses the `Qwen3_5ForConditionalGeneration` architecture. BF16 weights alone need approximately **56 GB** of memory, plus additional space for the runtime, activations, and cache. The vLLM example targets a Linux machine with a supported NVIDIA GPU and sufficient VRAM; adjust tensor parallelism for your hardware. See the [Transformers architecture documentation](https://huggingface.co/docs/transformers/model_doc/qwen3_5) and the [official vLLM Qwen3.8 recipe](https://recipes.vllm.ai/Qwen/Qwen3.8-27B) for runtime details.

Both examples keep thinking enabled and explicitly use `reasoning_effort="xhigh"`. The supported effort values are `low`, `medium`, and `xhigh`. The output limits below are starting points for a short coding prompt; increase them when a task requires longer reasoning or code.

### Transformers — local Python inference

Install the dependencies in a dedicated Python environment:

```bash
python -m pip install -U "transformers>=5.8.0" accelerate torch torchvision
export MODEL_PATH="/path/to/Qwopus3.8-27B-Coder-Flash"
```

```python
import os

import torch
from transformers import AutoProcessor, Qwen3_5ForConditionalGeneration

model_path = os.environ["MODEL_PATH"]
processor = AutoProcessor.from_pretrained(model_path)
model = Qwen3_5ForConditionalGeneration.from_pretrained(
    model_path,
    dtype=torch.bfloat16,
    device_map="auto",
).eval()

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Write a Python function that merges overlapping intervals. Include tests.",
            }
        ],
    }
]
inputs = processor.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    return_dict=True,
    return_tensors="pt",
    enable_thinking=True,
    reasoning_effort="xhigh",
).to(model.device)

with torch.inference_mode():
    output_ids = model.generate(
        **inputs,
        max_new_tokens=8192,
        do_sample=True,
        temperature=1.0,
        top_p=0.95,
        top_k=20,
    )

generated_ids = output_ids[:, inputs["input_ids"].shape[1]:]
print(processor.batch_decode(generated_ids, skip_special_tokens=True)[0])
```

### vLLM — OpenAI-compatible server

Use a separate environment for vLLM so that it can install its compatible PyTorch dependencies:

```bash
python -m pip install -U "vllm>=0.17.0" "transformers>=5.8.0" openai
export MODEL_PATH="/path/to/Qwopus3.8-27B-Coder-Flash"

vllm serve "$MODEL_PATH" \
  --served-model-name qwopus-coder-flash \
  --host 127.0.0.1 \
  --port 8000 \
  --dtype bfloat16 \
  --tensor-parallel-size 1 \
  --max-model-len 16384 \
  --reasoning-parser qwen3
```

After the server is ready, run this client in another terminal:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY",
    timeout=3600,
)
response = client.chat.completions.create(
    model="qwopus-coder-flash",
    messages=[
        {
            "role": "user",
            "content": "Write a Python function that merges overlapping intervals. Include tests.",
        }
    ],
    temperature=1.0,
    top_p=0.95,
    max_tokens=8192,
    extra_body={
        "top_k": 20,
        "chat_template_kwargs": {
            "enable_thinking": True,
            "reasoning_effort": "xhigh",
        },
    },
)
print(response.choices[0].message.content)
```

For automatic tool calling, add `--enable-auto-tool-choice --tool-call-parser qwen3_coder` to the server command and supply tool schemas in the client request. The application is responsible for executing tool calls and returning their results to the model.

## 🧭 8. Intended Use and Limitations

Potential uses include:

- Coding assistance, including implementation, debugging, and refactoring.
- Software-engineering workflows where an agent reads files, uses tools, edits code, tests changes, and recovers from tool errors.
- Complex instruction-following and reasoning tasks.
- Local experimentation with compatible inference runtimes.

The reported evidence is limited to the specified local MMLU-Pro run, three seeded coding tasks, one controlled command-line error-recovery scenario, and the stated decoder-only throughput measurements. Performance on other benchmarks is not reported here. Benchmark protocol, task selection, runtime, and orchestration all affect interpretation.

Generated code and tool actions can still be incorrect, incomplete, or poorly adapted to a user's environment. Results from the small agent tests do not guarantee success on larger repositories, novel tools, longer work sessions, or different harnesses. Review generated code and tool actions before using them in consequential workflows.

## 🙏 9. Acknowledgements and Citation

We thank the Qwen and NVIDIA Nemotron communities for their model and data contributions. We also recognize [Kyle Hessling (@KyleHessling1)](https://x.com/KyleHessling1) for collaboration and support across the Qwopus project, and [Unsloth](https://unsloth.ai/) for its open-source fine-tuning tools and community contributions.

If you use this model in your work, please cite:

```bibtex
@misc{jackrong2026qwopus3827bcoderflash,
  author       = {Jackrong},
  title        = {Qwopus3.8-27B-Coder-Flash},
  year         = {2026},
  howpublished = {Hugging Face},
  url          = {https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF}
}
```
