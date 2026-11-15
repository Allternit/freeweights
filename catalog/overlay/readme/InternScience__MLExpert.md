# MLExpert: Towards a Generalist Agentic Model for Autonomous Machine Learning Engineering

<p align="center">
  <a href="https://github.com/InternScience/MLExpert">💻 <strong>GitHub</strong></a>
  &nbsp; | &nbsp;
  <a href="https://arxiv.org/abs/2610.22344">📄 <strong>arXiv Paper</strong></a>
  &nbsp; | &nbsp;
  <a href="https://huggingface.co/papers/2610.22344">🤗 <strong>HF Papers</strong></a>
</p>

**MLExpert** is a 35B Mixture-of-Experts agentic model for autonomous machine learning engineering. It organizes experiments, writes and revises code, and improves solutions through sustained interaction with execution environments. Hierarchical agentic SFT develops general tool-use and domain-specific optimization skills, while **Windowed Interaction Reinforcement Learning (WIRL)** trains multi-turn decisions using feedback from completed experiments.

## Highlights

- **Long-horizon optimization:** Plans experiments, interprets execution feedback, revisits previous solutions, and selects submission candidates within a persistent workspace.
- **Strong MLE performance:** Achieves a **72.7% medal rate on MLE-Bench Lite**, matching GLM-5.3 and Kimi-K3 under the MLExpert Harness.
- **General-purpose harness compatibility:** Achieves a **69.7% medal rate with Claude Code**, compared with 42.4% for its base model.
- **Scientific task optimization:** Matches published scientific results on seven of ten NatureBench Lite tasks and surpasses them on five.

## Performance

### MLE-Bench Lite

We primarily evaluate our trained models on MLE-Bench Lite, a 22-task subset of MLE-Bench consisting of historical Kaggle competitions for end-to-end machine learning engineering. We report the percentage of tasks awarded each medal tier (Gold, Silver, and Bronze), the percentage receiving any medal (Any Medal), and the percentage exceeding the median human score (Med+), with Any Medal as the primary metric. All five metrics are computed over the 22 tasks and reported as percentages.

The first five metric columns use the MLExpert Harness; the last two columns report the general-purpose harness and its medal rate. All values are percentages.

![MLE-Bench Lite main results (Table 1 from the paper)](./figures/mle-bench-lite-table.png)

**MLExpert achieves the highest medal rate among same-scale models and reaches the performance level of larger frontier models.** Under the unified MLExpert Harness, MLExpert raises the medal rate of its Qwen3.6-35B-A3B base model from 37.9% to 72.7%, achieving the highest rate among the same-scale models evaluated and performance comparable to GLM-5.3 and Kimi-K3. These results show that long-horizon agentic post-training substantially improves the base model's MLE capability, bringing a 35B model to a performance level comparable to larger frontier models.

**MLExpert retains its advantage over the base model under a general-purpose coding harness.** With Claude Code, MLExpert achieves a 69.7% medal rate, compared with 42.4% for its base model, and exceeds the strongest evaluated same-scale baseline by 22.7 percentage points. The consistent advantage over the base model across both harnesses suggests that the improvement from post-training is not specific to the MLExpert-Harness and remains effective in a general-purpose agentic coding environment.

### NatureBench Lite

We also evaluate on NatureBench, following the ten-task Lite subset used in Frontis-MA1. M denotes Match-SOTA (g ≥ 0), while S denotes Surpass-SOTA (g > 0.1), which serves as a key metric for directly assessing agents' ability to surpass published scientific results.

![NatureBench Lite main results (Table 2 from the paper)](./figures/naturebench-lite-table.png)

**On NatureBench Lite, MLExpert improves scientific task performance over the base model.** With Claude Code, MLExpert raises the Surpass-SOTA rate from 0.0% to 50.0%, exceeding Nex-N2.5-mini at 20.0% and matching GLM-5.3 at 50.0%. Its Match-SOTA rate also improves from 40.0% to 70.0%. These results show that post-training improves scientific task optimization, enabling MLExpert to match or exceed published reference results on more tasks.

## Usage

The commands below load `InternScience/MLExpert` and serve an API endpoint at `http://localhost:8000/v1`.

### SGLang

Install [SGLang](https://docs.sglang.ai/get_started/install.html) with uv:

```shell
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate
uv pip install sglang
```

**Text Generation**

```shell
python -m sglang.launch_server \
    --model-path InternScience/MLExpert \
    --host 127.0.0.1 \
    --port 8000 \
    --tp-size 2 \
    --context-length 262144 \
    --reasoning-parser qwen3 \
    --language-model-only
```

**Tool Use**

```shell
python -m sglang.launch_server \
    --model-path InternScience/MLExpert \
    --host 127.0.0.1 \
    --port 8000 \
    --tp-size 2 \
    --context-length 262144 \
    --reasoning-parser qwen3 \
    --tool-call-parser qwen3_coder \
    --language-model-only
```

### vLLM

Install [vLLM](https://docs.vllm.ai/en/stable/getting_started/installation/index.html) with uv:

```shell
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate
uv pip install vllm --torch-backend=auto
```

**Text Generation**

```shell
vllm serve InternScience/MLExpert \
    --host 127.0.0.1 \
    --port 8000 \
    --tensor-parallel-size 2 \
    --max-model-len 262144 \
    --reasoning-parser qwen3 \
    --language-model-only
```

**Tool Calling**

```shell
vllm serve InternScience/MLExpert \
    --host 127.0.0.1 \
    --port 8000 \
    --tensor-parallel-size 2 \
    --max-model-len 262144 \
    --reasoning-parser qwen3 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder \
    --language-model-only
```

### Recommended Sampling Parameters

| Parameter | Value |
| :--- | ---: |
| `temperature` | 1.0 |
| `top_p` | 0.95 |
| `top_k` | 20 |
| `min_p` | 0.0 |
| `presence_penalty` | 1.5 |
| `repetition_penalty` | 1.0 |

These parameters apply to both thinking and non-thinking modes. Set `chat_template_kwargs.enable_thinking` to `true` to enable thinking or `false` to disable it. Machine-readable profiles are provided in [inference_profiles.json](./inference_profiles.json).