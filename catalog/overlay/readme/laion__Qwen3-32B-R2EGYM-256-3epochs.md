# Qwen3-32B-R2EGYM-256-3epochs

This model is a reinforcement learning fine-tuned version of [Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B), trained using the SkyRL framework with fully asynchronous PPO on coding and reasoning tasks from the R2EGYM benchmark.

## Training Details

### Framework
- **Training Framework**: [SkyRL](https://github.com/NovaSkyAI/SkyRL) (fully async PPO)
- **Parallelism Strategy**: FSDP2 with CPU offload
- **Agent**: Terminus-2 (terminal-based coding agent with thinking enabled)

### Dataset
- **Dataset**: [open-athena/r2egym_gpt5_codex_solved_tasks_256_subset](https://huggingface.co/datasets/open-athena/r2egym_gpt5_codex_solved_tasks_256_subset)
- **Number of tasks**: 256
- **Evaluation set**: OpenThoughts-TB-dev (70 tasks)

### Hyperparameters

| Parameter | Value |
|---|---|
| **Epochs** | 3 |
| **Total steps** | 12 (4 steps/epoch) |
| **Learning rate** | 1e-5 |
| **Weight decay** | 0.0 |
| **Train batch size** | 64 |
| **Micro train batch size per GPU** | 1 |
| **Advantage estimator** | rloo_n |
| **KL loss** | disabled |
| **Samples per prompt** | 8 |
| **Max prompt length** | 2,048 |
| **Max generate length** | 30,720 |
| **RoPE scaling** | yarn (factor=4.0, original_max_position_embeddings=32,768) |

### Infrastructure

| Component | Configuration |
|---|---|
| **Policy nodes** | 4 nodes x 4 GPUs |
| **Reference model nodes** | 4 nodes x 4 GPUs |
| **Inference engines** | 26 (tensor parallelism = 2) |
| **Parallel generation workers** | 96 |
| **Concurrent sandbox trials** | 96 |
| **Total training nodes** | 17 |

### Training Notes
- Training was resumed from a step-9 checkpoint
- The model uses Terminus-2, a terminal-based coding agent that interacts with sandboxed Docker environments to solve programming tasks
- Thinking mode was enabled during training (`--enable_thinking`)

## Usage

This model can be used as a drop-in replacement for Qwen3-32B with improved coding and reasoning capabilities.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("laion/Qwen3-32B-R2EGYM-256-3epochs")
tokenizer = AutoTokenizer.from_pretrained("laion/Qwen3-32B-R2EGYM-256-3epochs")
```
