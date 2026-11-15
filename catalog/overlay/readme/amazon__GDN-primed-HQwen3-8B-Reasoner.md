# GDN-primed-HQwen3-8B-Reasoner

GDN-primed-HQwen3-8B-Reasoner is a Hybrid language model consisting of 50% Attention layers and 50% [Gated DeltaNet (GDN)](https://arxiv.org/abs/2412.06464) layers, primed from [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) using the [Hybrid Model Factory](https://github.com/awslabs/hybrid-model-factory) Priming pipeline. The model is trained for long-context reasoning and supports context lengths of 128K tokens.

GDN is a State-Space Model layer with constant memory and linear compute cost in the sequence length.

By combining Attention with GDN, our Hybrid model achieves up to **2× faster inference** at long contexts while **closely matching the base Transformer's quality**.

## Links

- 📄 [Gated DeltaNet paper (ICLR 2025)](https://arxiv.org/abs/2412.06464)
- 💻 [GitHub: Hybrid Model Factory](https://github.com/awslabs/hybrid-model-factory)


## Why Hybrid?

Each Primed Hybrid model is initialized from a base Transformer by converting a portion of its Attention layers into State-Space Model (SSM) layers that maintain a fixed-size recurrent state instead of a growing KV cache. At a 50% Hybrid ratio, roughly half the KV cache (which grows linearly with sequence length) is replaced with fixed-size SSM state. The practical benefits:

- **Higher throughput at long contexts** — less memory on KV cache means more memory for batching
- **More concurrent sequences** — ~2× as many concurrent sequences before hitting memory limits
- **Growing advantage with context length** — at long contexts, Attention dominates the forward pass while SSM layers remain negligible in cost. Since the Hybrid model makes roughly half as many Attention calls as the base Transformer, the throughput advantage grows with context length

Increasing hybridization ratio, replacing more Attention layers with SSM layers, further reduces memory and increases throughput, typically at the expense of performance.

## Model Overview

- **Type**: Causal Language Model (Hybrid Attention + SSM)
- **Base Model**: Qwen3-8B
- **Hybrid Layer Type**: Gated DeltaNet (GDN)
- **Hybrid Ratio**: 50% (18 Attention + 18 GDN layers)
- **Parameters**: ~8B
- **Context Length**: 128K natively
- **Precision**: bfloat16
- **License**: Apache 2.0

## Benchmark Results

We consider the following Transformer as a baseline:

1. **Qwen3-8B (thinking, from HF)**: The original Qwen model evaluated in thinking mode, which is the intended mode for reasoning tasks. This serves as the base Transformer from which we start the Priming procedure.

### Reasoning Benchmarks

Evaluations on math reasoning (AIME24/25), science (GPQA), coding (LiveCodeBenchv5, Scicode), tool-calling (BFCLv3/v4), and instruction-following (IFBench).  Evaluations are done using the [Nemo Evaluator SDK](https://docs.nvidia.com/nemo/evaluator/latest/).  We have provided the evaluation configuration [examples/evaluation/nemo_reasoning_evals.yaml](https://github.com/awslabs/hybrid-model-factory/blob/main/examples/evaluation/nemo_reasoning_evals.yaml) for reproducibility.  Evaluations are done at 64K generation length.

| Model                         | AIME24 | AIME25 | GPQA | LiveCodeBench-v5 | BFCLv4 (minus web-search) | BFCLv3 | IFBench | SciCode | Average |
|-------------------------------|------|-----------|--------|-----------|----------|------|----|-----|-----|
| Qwen3-8B (thinking, from HF)  | 78.67 | 71.0 | 57.77 | 57.94 | 68.30 | 66.46 | 31.60 | 10.63 | 55.29 |
| GKA-primed-HQwen3-8B-Reasoner | 82.00 | 73.67 | 61.81 | 63.10 | 66.47 | 62.20 | 38.96 | 6.41 | 56.82 |
| GDN-primed-HQwen3-8B-Reasoner | 82.00 | 73.33 | 61.49 | 62.94 | 63.27 | 57.44 | 37.80 | 2.50 | 55.10 |

*For BFCLv4, we remove the web-search subtask and weight each task by the number of entries (test examples) for that task.*

**How close are the Hybrid models to the Transformer baseline on complex reasoning tasks?**
Our Primed Hybrid models are competitive with the Qwen3-8B (thinking, from HF) model despite [<0.5% of the base Transformer's pre-training token budget](#training-data). In particular, **Primed GKA outperforms the Transformer baseline** by ~1.5 points on average. 

**Which SSM layer type performs best?**
Primed GKA uniformly outperforms GDN across all reasoning tasks, with a +1.73 point average gain — consistent with the expressiveness order of their respective SSM layers.

## About Gated DeltaNet (GDN)

Gated DeltaNet is a State-Space Model layer with diagonal + low-rank transition dynamics. It extends Mamba2 with the Delta Update rule, improving expressiveness through gated state transitions while retaining Mamba2's efficiency.

For more details, see the [GDN paper](https://arxiv.org/abs/2412.06464).

### Architecture Details

| Component | Details |
|-----------|---------|
| Number of Layers | 36 (18 Attention + 18 GDN) |
| Hidden Dimension | 4096 |
| Attention Heads | 32 (Q) / 8 (KV) |
| Head Dimension | 128 |
| Intermediate Dimension (FFN) | 12288 |
| Vocabulary Size | 151,936 |
| Position Encoding | RoPE (θ = 5,000,000) |
| Layer Layout | GDN layer indices were selected with our [*selective hybridization*](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/LayerSelection.md) procedure |

### Inference Efficiency

Sustained decode throughput (tokens/s) on 8× H200 GPUs (TP=8), measured during pure decode with a saturated KV cache. Benchmarked with random data (no prefix-caching benefits). See the full [Inference guide](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#performance-benchmarks) for methodology and additional models.

| Model                                                   | 16K            | 32K            | 64K            | 128K           |
|---------------------------------------------------------|----------------|----------------|----------------|----------------|
| GDN-primed-HQwen3-8B-Reasoner                          | 17,479 (1.95×) | 10,080 (1.95×) | 5,521 (2.01×)  | 2,863 (2.33×)  |
| GKA-primed-HQwen3-8B (`num_iter=30`, default)           | 15,892 (1.78×) | 9,159 (1.77×)  | 5,173 (1.89×)  | 2,736 (2.23×)  |
| Mamba2-primed-HQwen3-8B                                 | 16,844 (1.88×) | 9,966 (1.93×)  | 5,460 (1.99×)  | 2,825 (2.30×)  |
| BMOJOF-primed-HQwen3-8B                                 | 7,854 (0.88×)  | 5,597 (1.08×)  | 3,573 (1.30×)  | 2,153 (1.75×)  |
| Qwen3-8B (thinking, from HF)                            | 8,951          | 5,174          | 2,740          | 1,227          |

Mean TTFT at the Transformer's saturated batch size (Hybrid model has memory to spare):

| Model                                                   | 16K               | 32K               | 64K               | 128K              |
|---------------------------------------------------------|-------------------|-------------------|-------------------|-------------------|
| GDN-primed-HQwen3-8B-Reasoner                          | 27,805 ms (1.00×) | 30,975 ms (0.95×) | 36,151 ms (0.85×) | 46,389 ms (0.74×) |
| GKA-primed-HQwen3-8B (`num_iter=30`, default)           | 35,013 ms (1.26×) | 38,502 ms (1.18×) | 44,893 ms (1.06×) | 53,606 ms (0.85×) |
| Mamba2-primed-HQwen3-8B                                 | 28,668 ms (1.03×) | 31,405 ms (0.96×) | 36,666 ms (0.86×) | 46,618 ms (0.74×) |
| BMOJOF-primed-HQwen3-8B                                 | 44,763 ms (1.61×) | 47,600 ms (1.46×) | 52,272 ms (1.23×) | 61,702 ms (0.98×) |
| Qwen3-8B (thinking, from HF)                            | 27,736 ms         | 32,661 ms         | 42,462 ms         | 62,922 ms         |

The decode throughput advantage grows with context length — from 1.95× at 16K to 2.33× at 128K — thanks to GDN layers maintaining a fixed-size recurrent state instead of a growing KV cache. TTFT crosses over at 32K and reaches 0.74× (26% faster) at 128K.

## Usage

### With vLLM (recommended)

Install the [Hybrid Model Factory vLLM plugin](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#docker-recommended) in your local environment, then serve:

```bash
vllm serve amazon/GDN-primed-HQwen3-8B-Reasoner \
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
    "model": "amazon/GDN-primed-HQwen3-8B-Reasoner",
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
    "model": "amazon/GDN-primed-HQwen3-8B-Reasoner",
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
    "amazon/GDN-primed-HQwen3-8B-Reasoner", trust_remote_code=True
).to("cuda")
tokenizer = AutoTokenizer.from_pretrained("amazon/GDN-primed-HQwen3-8B-Reasoner")

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

@misc{yang2025gateddeltanetworksimproving,
      title={Gated Delta Networks: Improving Mamba2 with Delta Rule}, 
      author={Songlin Yang and Jan Kautz and Ali Hatamizadeh},
      year={2025},
      eprint={2412.06464},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2412.06464}, 
}

```

## License

This model is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
