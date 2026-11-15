<div align="center">

# UI-Mate-27B

### UI-Mate: Advancing Open-Weight Foundation GUI Agents with In-Context Demonstrations

**Show the workflow once. Let the agent adapt it to the task at hand.**

Tencent HY Frontier

[Project Page](https://ui-mate.github.io/) ·
[GitHub](https://github.com/Tencent/UI-Mate) ·
[arXiv](https://arxiv.org/abs/2608.15930)

</div>

## Overview

**UI-Mate-27B** is an open-weight foundation GUI agent for long-horizon work across applications and operating systems. It observes live screenshots, reasons over the visible state, and produces structured keyboard and mouse actions for native desktop interaction.

It executes a task from a natural-language instruction and live screenshots alone, planning from what is currently on screen and re-planning as the interface changes.

## Model Details

- **Parameters:** 27B
- **Base model:** [Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- **Input:** task instruction, screenshots, and interaction history
- **Output:** reasoning, a concise action description, and structured computer-use tool calls
- **Action space:** mouse, keyboard, scrolling, waiting, user interaction, and task completion
- **Training:** supervised fine-tuning followed by online reinforcement learning in executable GUI environments
- **License:** Apache-2.0

UI-Mate is an agent checkpoint rather than a standalone visual-chat model. We recommend using the official prompt, response parser, and interaction harness from the [UI-Mate repository](https://github.com/Tencent/UI-Mate).

| Checkpoint | Intended use |
| --- | --- |
| **UI-Mate-27B** | General computer use at 27B |
| [UI-Mate-9B](https://huggingface.co/tencent/UI-Mate-9B) | General computer use at 9B |
| [UI-Mate-democua-27B](https://huggingface.co/tencent/UI-Mate-democua-27B) | Demonstration-guided computer use |

## Highlights

- Strong general computer-use performance across Ubuntu and Windows benchmarks.
- Long-horizon execution across multiple applications.
- Live-screen grounding instead of coordinate replay.
- Structured actions compatible with `pyautogui`.
- OpenAI-compatible serving and client interface.

## Evaluation

| Benchmark | UI-Mate-27B |
| --- | ---: |
| OSWorld-Verified · average score | **77.0** |
| WindowsAgentArena · average score | **66.2** |
| OSWorkerBench · strict success | **41.00** |
| OSWorkerBench · progress | **76.86** |

See the [project page](https://ui-mate.github.io/) for evaluation details and updates.

## Quick Start

### 1. Serve the model with vLLM

vLLM automatically downloads the checkpoint from Hugging Face Hub on first launch.

```bash
pip install -U vllm openai pillow

vllm serve tencent/UI-Mate-27B \
    --trust-remote-code \
    --served-model-name UI_Mate \
    --port 8000 \
    --tensor-parallel-size 2 \
    --gpu-memory-utilization 0.85 \
    --mm-encoder-tp-mode data \
    --chat-template-content-format openai \
    --limit-mm-per-prompt '{"image":6,"video":0}'
```

The default agent retains five screenshots in context. The server must therefore admit at least six images because the newest screenshot arrives before the oldest one is collapsed.

Confirm that the endpoint exposes the expected model name:

```bash
curl -s http://127.0.0.1:8000/v1/models
```

### 2. Run the reference examples

```bash
git clone https://github.com/Tencent/UI-Mate.git
cd UI-Mate

python examples/run_agent.py \
    --base-url http://127.0.0.1:8000/v1
```

Run a complete recorded trajectory:

```bash
python examples/run_agent.py \
    --replay \
    --base-url http://127.0.0.1:8000/v1
```

Or provide your own screenshot:

```bash
python examples/run_agent.py \
    --image /path/to/screen.png \
    --instruction "Export this spreadsheet as HTML and open it in Chrome"
```

### 3. Use the Python agent

```python
from agents.ui_mate_agent import UIMateAgent

agent = UIMateAgent(
    base_url="http://127.0.0.1:8000/v1",
    model="UI_Mate",
)

with open("screen.png", "rb") as f:
    response, actions = agent.predict(
        "Install the autoDocstring extension in VS Code.",
        {"screenshot": f.read()},
    )

print(response)
print(actions)

# Reset the interaction history before starting a new task.
agent.reset()
```

## Intended Use and Limitations

UI-Mate-27B is intended for research and development of screenshot-based GUI agents in controlled desktop environments.

Its behavior can be affected by application versions, screen layouts, display scaling, latency, and unexpected UI state. Benchmark performance does not guarantee reliable execution in arbitrary environments, and the model requires an external runtime to execute its predicted actions.

## Safety

Computer-use agents can make mistakes, encounter prompt injection, or trigger consequential actions.

- Prefer isolated or disposable environments.
- Avoid unattended, high-stakes, or destructive workflows.
- Require human confirmation before sensitive operations.
- Monitor the interaction trajectory and verify the resulting application state.
- Do not treat a model-reported success as proof that the intended outcome was achieved.

## License

UI-Mate is released under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). Third-party components remain subject to their respective licenses. See the repository [LICENSE](https://github.com/Tencent/UI-Mate/blob/main/LICENSE) for details.

## Citation

```bibtex
@article{uimate2026,
  title         = {UI-Mate: Advancing Open-Weight Foundation GUI Agents with In-Context Demonstrations},
  author        = {Tencent HY Frontier Team},
  journal       = {arXiv preprint arXiv:2608.15930},
  year          = {2026},
}
```