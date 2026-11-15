# GKA-primed-HQwen3-32B-Reasoner

GKA-primed-HQwen3-32B-Reasoner is a Hybrid language model consisting of 50% Attention layers and 50% [Gated KalmaNet (GKA)](https://arxiv.org/abs/2511.21016) layers, primed from [Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B) using the [Hybrid Model Factory](https://github.com/awslabs/hybrid-model-factory) Priming pipeline. The model is trained for long-context reasoning and supports context lengths of 128K tokens.

GKA (pronounced as gee-ka) is a State-Space Model layer inspired by the Kalman Filter that solves an online ridge regression problem at test time, with constant
memory and linear compute cost in the sequence length.

By combining Attention with GKA, our Hybrid model achieves up to **2× faster inference** at long contexts while **closely matching the base Transformer's quality**.

## Links

- 📄 [Gated KalmaNet paper (CVPR 2026)](https://arxiv.org/abs/2511.21016)
- 💻 [GitHub: Hybrid Model Factory](https://github.com/awslabs/hybrid-model-factory)


## Why Hybrid?

Each Primed Hybrid model is initialized from a base Transformer by converting a portion of its Attention layers into State-Space Model (SSM) layers that maintain a fixed-size recurrent state instead of a growing KV cache. At a 50% Hybrid ratio, roughly half the KV cache (which grows linearly with sequence length) is replaced with fixed-size SSM state. The practical benefits:

- **Higher throughput at long contexts** — less memory on KV cache means more memory for batching
- **More concurrent sequences** — ~2× as many concurrent sequences before hitting memory limits
- **Growing advantage with context length** — at long contexts, Attention dominates the forward pass while SSM layers remain negligible in cost. Since the Hybrid model makes roughly half as many Attention calls as the base Transformer, the throughput advantage grows with context length

Increasing hybridization ratio, replacing more Attention layers with SSM layers, further reduces memory and increases throughput, typically at the expense of performance.

## Model Overview

- **Type**: Causal Language Model (Hybrid Attention + SSM)
- **Base Model**: Qwen3-32B
- **Hybrid Layer Type**: Gated KalmaNet (GKA)
- **Hybrid Ratio**: 50% (32 Attention + 32 GKA layers)
- **Parameters**: ~32B
- **Context Length**: 128K natively
- **Precision**: bfloat16
- **License**: Apache 2.0

## Benchmark Results

We consider the following Transformer as a baseline:

1. **Qwen3-32B (thinking, from HF)**: The original Qwen model evaluated in thinking mode, which is the intended mode for reasoning tasks. This serves as the base Transformer from which we start the Priming procedure.

### Reasoning Benchmarks

Evaluations on math reasoning (AIME24/25), science (GPQA), coding (LiveCodeBenchv5, Scicode), tool-calling (BFCLv3/v4), and instruction-following (IFBench).  Evaluations are done using the [Nemo Evaluator SDK](https://docs.nvidia.com/nemo/evaluator/latest/).  We have provided the evaluation configuration [examples/evaluation/nemo_reasoning_evals.yaml](https://github.com/awslabs/hybrid-model-factory/blob/main/examples/evaluation/nemo_reasoning_evals.yaml) for reproducibility.  Evaluations are done at 64K generation length.

| Model  | AIME24 | AIME25 | GPQA | LiveCodeBench-v5 | BFCLv4 (minus web-search) | BFCLv3 | IFBench | SciCode | Average |
|-------|------|-----------|--------|-----------|----------|------|----|-----|-----|
| Qwen3-32B (thinking, from HF)         | 86.33 | 70.00 | 65.40 | 64.44 | 69.30 | 69.57 | 32.61 | 15.94 | 59.20 |
| GKA-primed-HQwen3-32B-Reasoner             | 87.67 | 81.67 | 67.30 | 70.24 | 70.14 | 66.34 | 48.22 | 12.34 | 62.99 |


*For BFCLv4, we remove the web-search subtask and weight each task by the number of entries (test examples) for that task.*

**How close is the Hybrid model to the Transformer baseline on complex reasoning tasks?**
Our Primed GKA Hybrid **outperforms the Qwen3-32B (thinking, from HF) baseline** by ~3.8 points on average, despite using [<0.5% of the base Transformer's pre-training token budget](#training-data).  This is enabled by our multi-stage reasoning training pipeline coupled with higher throughput of Hybrid architectures.


## About Gated KalmaNet (GKA)

Gated KalmaNet is a State-Space Model layer that is more expressive than both Mamba2 and Gated DeltaNet. GKA achieves this by employing the Kalman Filter to compute the optimal state at each time-step based on the entire past. In contrast, SSMs like Mamba2 and GDN rely on instantaneous objectives (that rely *solely* on the current input and loss estimate of the past) to compute their state.

Unlike other SSM-based hybrid layers, GKA gives you a runtime knob for trading compute against speed — with no retraining nor architecture changes. The `num_iter` parameter controls how many iterations the GKA solver runs during inference. No other hybrid layer type offers this: GDN and Mamba2 have fixed compute per layer, so their speed is fixed a priori. GKA lets you slide along the compute–latency curve per deployment, making it uniquely suited for scenarios where different endpoints or traffic tiers have different latency budgets.

For details on controlling GKA's compute–speed tradeoff at serving time via `num_iter`, see [GKA Compute Control](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#gka-compute-control-num_iter), and for more details on the modeling choices see the [GKA paper](https://arxiv.org/abs/2511.21016).

This release includes optimized Triton kernels for GKA's Chebyshev solver, enabling the throughput numbers reported in [Inference Efficiency](#inference-efficiency). The training kernels are in [`training/.../gated_kalmanet/ops/chebyshev/`](https://github.com/awslabs/hybrid-model-factory/tree/main/training/src/hmf/model/hybrid_zoo/layers/gated_kalmanet/ops/chebyshev) and the inference kernels in [`vllm-inference/.../gka/ops/`](https://github.com/awslabs/hybrid-model-factory/tree/main/vllm-inference/src/primed_vllm/gka/ops).

### Architecture Details

| Component | Details                                                                      |
|-----------|------------------------------------------------------------------------------|
| Number of Layers | 64 (32 Attention + 32 GKA)                                                   |
| Hidden Dimension | 5120                                                                         |
| Attention Heads | 64 (Q) / 8 (KV)                                                              |
| Head Dimension | 128                                                                          |
| Intermediate Dimension (FFN) | 25600                                                                        |
| Vocabulary Size | 151,936                                                                      |
| Position Encoding | RoPE (θ = 5,000,000)                                                         |
| Layer Layout | GKA layer indices were selected with our [*selective hybridization*](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/LayerSelection.md) procedure |

### Trade-off inference FLOPs for accuracy.
As discussed above, GKA offers the unique ability to adjust the inference FLOPs by tuning the `num_iter` parameter. Here we summarize reasoning performance across different `num_iter` settings.

| Model                                                   | Avg. Reasoning Performance |
|---------------------------------------------------------|----------------------------|
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=30`, default) | 62.99                      |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=10`)          | 62.63                      |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=5`)           | 61.77                      |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=1`)           | 60.04                      |
| Qwen3-32B (thinking, from HF)                            | 59.20                      |

For most practical scenarios, we recommend setting `num_iter=10` for the best trade-off. See next section for inference gains upon reducing number of iterations.

> [!NOTE]
> Interestingly, setting `num_iter=0` effectively converts the GKA model to a Gated Linear Attention (GLA) model. Thus, one can think of increasing num iters as improving upon the initial solution of the GLA model.

### Inference Efficiency

Sustained decode throughput (tokens/s) on 8× H200 GPUs (TP=8), measured during pure decode with a saturated KV cache. Benchmarked with random data (no prefix-caching benefits). See the full [Inference guide](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#performance-benchmarks) for methodology and additional models.

| Model                                                     | 16K           | 32K           | 64K           | 128K          |
|-----------------------------------------------------------|---------------|---------------|---------------|---------------|
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=30`, default)  | 6,810 (1.29×) | 4,152 (1.45×) | 2,385 (1.82×) | 1,168 (1.99×) |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=10`)           | 7,778 (1.47×) | 4,534 (1.58×) | 2,537 (1.94×) | 1,200 (2.05×) |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=5`)            | 8,039 (1.52×) | 4,621 (1.61×) | 2,569 (1.96×) | 1,206 (2.06×) |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=1`)            | 8,177 (1.54×) | 4,678 (1.63×) | 2,593 (1.98×) | 1,210 (2.06×) |
| GDN-primed-HQwen3-32B                                    | 8,133 (1.53×) | 4,876 (1.70×) | 2,688 (2.06×) | 1,238 (2.11×) |
| Qwen3-32B (thinking, from HF)                            | 5,299         | 2,865         | 1,308         | 586           |

Mean TTFT at the Transformer's saturated batch size (Hybrid model has memory to spare):

| Model                                                     | 16K               | 32K               | 64K               | 128K              |
|-----------------------------------------------------------|-------------------|-------------------|-------------------|-------------------|
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=30`, default)  | 52,053 ms (1.32×) | 58,613 ms (1.21×) | 68,241 ms (1.05×) | 84,935 ms (0.90×) |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=10`)           | 48,560 ms (1.23×) | 55,039 ms (1.13×) | 64,766 ms (0.99×) | 81,410 ms (0.86×) |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=5`)            | 47,958 ms (1.22×) | 54,320 ms (1.12×) | 63,826 ms (0.98×) | 80,369 ms (0.85×) |
| GKA-primed-HQwen3-32B-Reasoner (`num_iter=1`)            | 46,726 ms (1.19×) | 53,061 ms (1.09×) | 62,645 ms (0.96×) | 79,321 ms (0.84×) |
| GDN-primed-HQwen3-32B                                    | 42,492 ms (1.08×) | 48,417 ms (1.00×) | 57,525 ms (0.88×) | 73,145 ms (0.77×) |
| Qwen3-32B (thinking, from HF)                            | 39,421 ms         | 48,527 ms         | 65,104 ms         | 94,479 ms         |

The decode throughput advantage grows with context length — from 1.29× at 16K to 1.99× at 128K (2.06× with `num_iter=1`) — thanks to GKA layers maintaining a fixed-size recurrent state instead of a growing KV cache. TTFT crosses over at long contexts: GKA prefills 10–16% faster than the Transformer at 128K depending on `num_iter`. Reducing `num_iter` progressively improves both decode and TTFT, with the effect more pronounced at 32B than 8B. See [Trade-off inference FLOPs for accuracy](#trade-off-inference-flops-for-accuracy) for details.


## Usage

### With vLLM (recommended)

Install the [Hybrid Model Factory vLLM plugin](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#docker-recommended) in your local environment, then serve:

```bash
vllm serve amazon/GKA-primed-HQwen3-32B-Reasoner \
  --enable-prefix-caching \
  --mamba-cache-mode align \
  --mamba-cache-dtype float32 \
  --mamba-ssm-cache-dtype float32 \
  --enable-auto-tool-choice \
  --tool-call-parser hermes \
  --reasoning-parser qwen3
```

Query the server:

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "amazon/GKA-primed-HQwen3-32B-Reasoner",
    "messages": [
      {"role": "user", "content": "What is Linear Attention in the context of LLMs?"}
    ],
    "temperature": 1.0,
    "top_p": 1.0
  }'
```

> [!TIP]
> The `--mamba-cache-dtype float32` and `--mamba-ssm-cache-dtype float32` flags are important for accurate long-context generation. See the [Inference guide](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#recommended-flags-for-hybrid-models) for details on all recommended flags.

> [!TIP]
> Similarly to [NVIDIA-Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16), for generic reasoning tasks (e.g. Math, Science) we recommend setting `temperature=1.0` and `top_p=1.0`.  For tool-calling we recommend `temperature=0.6`, `top_p=0.95`.

#### Thinking Versus Non-thinking Setting

Our reasoning model supports thinking on/off modes.  Whenever thinking mode is on, the model will reason for multiple tokens in a segment delimited by `<think>` and `</think>` (which is extracted by the reasoning parser) before producing a response.  This is necessary for difficult queries and increases response quality at the expense of higher latency.  Thinking mode is enabled by default, however thinking mode can be turned off via the chat template.

If you want to query the model with thinking mode *off*, query the model as follows:

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "amazon/GKA-primed-HQwen3-32B-Reasoner",
    "messages": [
      {"role": "user", "content": "What is Linear Attention in the context of LLMs?"}
    ],
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

### With Hugging Face Transformers

> [!WARNING]
> Due to the long generations produced by reasoning models, the lower latency provided by vLLM is preferred over Hugging Face for evaluations and in production settings.  We recommend Hugging Face generation primarily for quick debugging or testing.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import hmf.model.hybrid_zoo.models.model_register  # Register Hybrid models

model = AutoModelForCausalLM.from_pretrained(
    "amazon/GKA-primed-HQwen3-32B-Reasoner", trust_remote_code=True
).to("cuda")
tokenizer = AutoTokenizer.from_pretrained("amazon/GKA-primed-HQwen3-32B-Reasoner")

messages = [{"role": "user", "content": "What is linear attention in the context of LLMs?"}]
prompt = tokenizer.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True, enable_thinking=True
)
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=65536, temperature=1.0, top_p=1.0)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

In order to turn thinking mode off, simply specify `enable_thinking=False` when applying the chat template:
```python
messages = [{"role": "user", "content": "What is linear attention in the context of LLMs?"}]
prompt = tokenizer.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True, enable_thinking=False
)
```

## Training data
These models were produced through the multi-stage Priming pipeline from [Hybrid Model Factory](https://github.com/awslabs/hybrid-model-factory). Training data spans web documents, mathematics, long-context documents, and instruction-following and reasoning examples — each targeting a different capability axis. This diversity is critical: it allows the Priming procedure to convert a base Transformer into a more memory- and compute-efficient Hybrid architecture at nearly the same level of performance, using <0.5% of the base Transformer model's pre-training token budget.


## Responsible AI Considerations
At Amazon, we are committed to developing AI responsibly and take a people-centric approach that prioritizes education, science, and our customers, to integrate responsible AI across the end-to-end AI lifecycle. We believe the use of AI must respect the rule of law and human rights, and we encourage the safe and responsible development of AI.  When downloaded or used in accordance with [AWS Responsible AI Policy](https://aws.amazon.com/ai/responsible-ai/policy/), developers should work with their internal model team to ensure this model meets requirements for the relevant industry and use case and addresses unforeseen product misuse.
Please report model quality, risk, security vulnerabilities or Amazon AI Concerns [here](https://pages.awscloud.com/global-ln-gc-400-ai-service-cards-contact-us-registration.html).

## Citation

```bibtex
@software{hybrid_model_factory,
  title = {Hybrid Model Factory},
  year = {2026},
  url = {https://github.com/awslabs/hybrid-model-factory}
}

@inproceedings{gka2026,
  title = {Gated KalmaNet: A Fading Memory Layer Through Test-Time Ridge Regression},
  year = {2026},
  booktitle = {CVPR},
  url = {https://arxiv.org/abs/2511.21016}
}

```

## License

This model is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
