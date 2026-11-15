# GKA-primed-HQwen3-8B-Instruct

GKA-primed-HQwen3-8B-Instruct is a Hybrid language model consisting of 50% Attention layers and 50% [Gated KalmaNet (GKA)](https://arxiv.org/abs/2511.21016) layers, primed from [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) using the [Hybrid Model Factory](https://github.com/awslabs/hybrid-model-factory) Priming pipeline. The model is instruction-tuned and supports context lengths up to 128K tokens.

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
- **Base Model**: Qwen3-8B
- **Hybrid Layer Type**: Gated KalmaNet (GKA)
- **Hybrid Ratio**: 50% (18 Attention + 18 GKA layers)
- **Parameters**: ~8B
- **Context Length**: 128K natively
- **Precision**: bfloat16
- **License**: Apache 2.0


Note, this is an Instruction-tuned model and is not a thinking model, that is, it does not natively produce chain-of-thought thinking tokens in its generation trace.  Tool calling is not supported by this checkpoint.  If you need tool calling capabilities, use the Reasoner checkpoints.

## Benchmark Results

Below we report benchmark performance for all our instruction-tuned Primed models. All Hybrid models use a 50% Hybrid ratio and are Primed from Qwen3-8B. 

We consider two baselines:

1. **Qwen3-8B (non-thinking, from HF)**: The original Qwen model evaluated in non-thinking mode, which is the intended mode for an Instruct model. This serves as the base Transformer from which we start the Priming procedure.
2. **Qwen3-8B (Long)**: The Qwen model fine-tuned on our priming data, extending its native context length from 32K to 128K. All Primed Hybrid models use the same training hyperparameters and data as this baseline, making it a fair comparison for differing architectures.

On both long- and short-context benchmarks, our Primed Hybrid models closely match the performance of the Transformer model while having [considerably lower deployment costs](#inference-efficiency), showcasing the efficacy of the Priming process.

### Long-Context Benchmarks

Evaluated on [HELMET](https://github.com/princeton-nlp/HELMET), [MRCR](https://huggingface.co/datasets/openai/mrcr), and [BABILong](https://github.com/booydar/babilong) across context lengths from 8K to 128K, using a weighted average with geometrically increasing weights for longer contexts. 

The plot below shows performance averaged over context lengths from 8K to 128K.

> [!NOTE]
> For the Qwen3-8B (non-thinking, from HF) model, we used YaRN to evaluate on long-context tasks as directed in the [model card](https://huggingface.co/Qwen/Qwen3-8B)

<img width="1000px" src="https://raw.githubusercontent.com/awslabs/hybrid-model-factory/main/assets/figures/long_context_results_8B_models.png">


**How close are the Hybrid models to the Transformer baseline on long context tasks?**
Primed GKA and GDN Hybrids are within ~1.5 points of Qwen3-8B (Long) on average, while being [1.5–2× faster at inference](#inference-efficiency). Primed B'MOJO-F matches GKA/GDN in quality but is slower due to unfused SSM+SWA kernels ([details](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md)). Primed Mamba2 lags further behind (approx. 3 point gap), consistent with GKA and GDN's higher expressivity.

**Why SSM layers over Sliding Window Attention (SWA)?**
All Hybrid SSM models outperform the Hybrid SWA model (50% Attention + 50% SWA, window size 512). Even though SWA uses ~2× the effective state size of GKA at BF16, SSM layers retain information from the remote past, while SWA forgets everything beyond its window.

### Short-Context NLP Benchmarks

Evaluations on Tulu3-dev from [OLMES](https://github.com/allenai/olmes). All tasks are over a short-context length (≤ 8K).
Each category in the table below averages the following Tulu3-dev subtasks: 
1. Math: GSM8K, MATH.
2. Knowledge: MMLU, PopQA, TruthfulQA.
3. Coding: HumanEval, HumanEval+. 
4. Reasoning: BigBenchHard.
5. Instruction Following: IFEval.

|Model | Math | Knowledge | Coding | Reasoning | Instruction Following  | Average |
|---|---|---|---|----------|---|--------|
| Qwen3-8B [non-thinking, from HF] | 81.36 | 49.33 | 91.77 | 74.31 | 85.59 | 76.47  |
| Qwen3-8B [Long] | 64.56 | 49.75 | 91 | 76.27    | 74.49  | 71.21  |
| GKA-primed-HQwen3-8B-Instruct    |  64.15 | 47.90 | 90.46 | 72.60    | 70.98 | 69.22  |
| GDN-primed-HQwen3-8B-Instruct    |  59.54 | 48.41 | 91.18 | 72.97    | 73.57 | 69.13  |
| Mamba2-primed-HQwen3-8B-Instruct | 57.77 | 46.91 | 89.56 | 70.99    | 74.86 | 68.02  |
| BMOJOF-primed-HQwen3-8B-Instruct | 65.69 | 48.63 | 90.02 | 76.42    | 75.60 | 71.27  |


**How close are the Hybrid models to the Transformer baseline on short context tasks?**
All Primed Hybrid models are within ~3 points of Qwen3-8B (Long), using [<0.5% of the base Transformer's pre-training token budget](#training-data). Note, B'MOJO-F fully matches the Transformer baseline but is slower to deploy (see [above](#long-context-benchmarks)).

**Which SSM layer type performs best?**
Among the non B'MOJO-F Hybrids, GKA ranks first (~2 point gap with Qwen3-8B [Long]), followed by GDN, then Mamba2. This ranking correlates with the expressiveness order of their respective SSM layers.

> [!NOTE]
> For applications to complex reasoning and coding problems check out our [Primed Hybrid Reasoning models](https://huggingface.co/collections/amazon/primed-hybrid-models-collection).

## About Gated KalmaNet (GKA)

Gated KalmaNet is a State-Space Model layer that is more expressive than both Mamba2 and Gated DeltaNet. GKA achieves this by employing the Kalman Filter to compute the optimal state at each time-step based on the entire past. In contrast, SSMs like Mamba2 and GDN rely on instantaneous objectives (that rely *solely* on the current input and loss estimate of the past) to compute their state.


Unlike other SSM-based hybrid layers, GKA gives you a runtime knob for trading compute against speed — with no retraining nor architecture changes. The `num_iter` parameter controls how many iterations the GKA solver runs during inference. No other hybrid layer type offers this: GDN and Mamba2 have fixed compute per layer, so their speed is fixed a priori. GKA lets you slide along the compute–latency curve per deployment, making it uniquely suited for scenarios where different endpoints or traffic tiers have different latency budgets.

For details on controlling GKA's compute–speed tradeoff at serving time via `num_iter`, see [GKA Compute Control](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#gka-compute-control-num_iter), and for more details on the modeling choices see the [GKA paper](https://arxiv.org/abs/2511.21016).

This release includes optimized Triton kernels for GKA's Chebyshev solver, enabling the throughput numbers reported in [Inference Efficiency](#inference-efficiency). The training kernels are in [`training/.../gated_kalmanet/ops/chebyshev/`](https://github.com/awslabs/hybrid-model-factory/tree/main/training/src/hmf/model/hybrid_zoo/layers/gated_kalmanet/ops/chebyshev) and the inference kernels in [`vllm-inference/.../gka/ops/`](https://github.com/awslabs/hybrid-model-factory/tree/main/vllm-inference/src/primed_vllm/gka/ops).



### Architecture Details

| Component | Details                                                                      |
|-----------|------------------------------------------------------------------------------|
| Number of Layers | 36 (18 Attention + 18 GKA)                                                   |
| Hidden Dimension | 4096                                                                         |
| Attention Heads | 32 (Q) / 8 (KV)                                                              |
| Head Dimension | 128                                                                          |
| Intermediate Dimension (FFN) | 12288                                                                        |
| Vocabulary Size | 151,936                                                                      |
| Position Encoding | RoPE (θ = 5,000,000)                                                         |
| Layer Layout | GKA layer indices were selected with our [*selective hybridization*](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/LayerSelection.md) procedure |


### Trade-off inference FLOPs for accuracy.
As discussed above, GKA offers the unique ability to adjust the inference FLOPs by tuning the `num_iter` parameter. Here we summarize long context performance across different `num_iter` settings.

| Model                                         | Avg. Long-context Performance |
|-----------------------------------------------|-------------------------------|
| GKA-primed-HQwen3-8B-Instruct (`num_iter=30`, default)  | 48.6                          | 
| GKA-primed-HQwen3-8B-Instruct (`num_iter=10`) | 48.3                          | 
| GKA-primed-HQwen3-8B-Instruct (`num_iter=5`)  | 48.3                          | 
| GKA-primed-HQwen3-8B-Instruct (`num_iter=1`)  | 47.5                          | 
| GKA-primed-HQwen3-8B-Instruct (`num_iter=0`)  | 45.8                          |
| Qwen3-8B (Long)                               | 50.1                          |

For most practical scenarios, we recommend setting `num_iter=10` for the best trade-off. See next section for inference gains upon reducing number of iterations.

> [!NOTE]
> Interestingly, setting `num_iter=0` effectively converts the GKA model to a Gated Linear Attention (GLA) model. Thus, one can think of increasing num iters as improving upon the initial solution of the GLA model. 



### Inference Efficiency

Sustained decode throughput (tokens/s) on 8× H200 GPUs (TP=8), measured during pure decode with a saturated KV cache. Benchmarked with random data (no prefix-caching benefits). See the full [Inference guide](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#performance-benchmarks) for methodology and additional models.

| Model                                                    | 16K            | 32K            | 64K            | 128K           |
|----------------------------------------------------------|----------------|----------------|----------------|----------------|
| GKA-primed-HQwen3-8B-Instruct (`num_iter=30`, default)  | 15,892 (1.78×) | 9,159 (1.77×)  | 5,173 (1.89×)  | 2,736 (2.23×)  |
| GKA-primed-HQwen3-8B-Instruct (`num_iter=10`)           | 17,261 (1.93×) | 9,668 (1.87×)  | 5,359 (1.96×)  | 2,801 (2.28×)  |
| GKA-primed-HQwen3-8B-Instruct (`num_iter=5`)            | 17,606 (1.97×) | 9,770 (1.89×)  | 5,399 (1.97×)  | 2,811 (2.29×)  |
| GKA-primed-HQwen3-8B-Instruct (`num_iter=1`)            | 17,485 (1.95×) | 9,780 (1.89×)  | 5,413 (1.98×)  | 2,812 (2.29×)  |
| GDN-primed-HQwen3-8B                                    | 17,479 (1.95×) | 10,080 (1.95×) | 5,521 (2.01×)  | 2,863 (2.33×)  |
| Qwen3-8B (Long)                                         | 8,951          | 5,174          | 2,740          | 1,227          |

Mean TTFT at the Transformer's saturated batch size (Hybrid model has memory to spare):

| Model                                                    | 16K               | 32K               | 64K               | 128K              |
|----------------------------------------------------------|-------------------|-------------------|-------------------|-------------------|
| GKA-primed-HQwen3-8B-Instruct (`num_iter=30`, default)  | 35,013 ms (1.26×) | 38,502 ms (1.18×) | 44,893 ms (1.06×) | 53,606 ms (0.85×) |
| GKA-primed-HQwen3-8B-Instruct (`num_iter=10`)           | 33,008 ms (1.19×) | 36,334 ms (1.11×) | 42,076 ms (0.99×) | 51,404 ms (0.82×) |
| GKA-primed-HQwen3-8B-Instruct (`num_iter=5`)            | 32,318 ms (1.17×) | 35,690 ms (1.09×) | 41,490 ms (0.98×) | 50,752 ms (0.81×) |
| GKA-primed-HQwen3-8B-Instruct (`num_iter=1`)            | 31,741 ms (1.14×) | 35,716 ms (1.09×) | 39,963 ms (0.94×) | 50,232 ms (0.80×) |
| GDN-primed-HQwen3-8B                                    | 27,805 ms (1.00×) | 30,975 ms (0.95×) | 36,151 ms (0.85×) | 46,389 ms (0.74×) |
| Qwen3-8B (Long)                                         | 27,736 ms         | 32,661 ms         | 42,462 ms         | 62,922 ms         |

The decode throughput advantage grows with context length — from 1.78× at 16K to 2.23× at 128K — thanks to GKA layers maintaining a fixed-size recurrent state instead of a growing KV cache. TTFT crosses over at long contexts: GKA prefills 15–20% faster than the Transformer at 128K. Reducing `num_iter` progressively improves both decode and TTFT, with most of the gain coming from 30 → 10. See [Trade-off inference FLOPs for accuracy](#trade-off-inference-flops-for-accuracy) for details.




## Usage

### With vLLM (recommended)

Install the [Hybrid Model Factory vLLM plugin](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#docker-recommended) in your local environment, then serve:

```bash
vllm serve amazon/GKA-primed-HQwen3-8B-Instruct \
  --enable-prefix-caching \
  --mamba-cache-mode align \
  --mamba-cache-dtype float32 \
  --mamba-ssm-cache-dtype float32
```

Query the server:

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "amazon/GKA-primed-HQwen3-8B-Instruct",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is Linear Attention in the context of LLMs?"}
    ]
  }'
```

> [!TIP]
> The `--mamba-cache-dtype float32` and `--mamba-ssm-cache-dtype float32` flags are important for accurate long-context generation. See the [Inference guide](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#recommended-flags-for-hybrid-models) for details on all recommended flags.

### With Hugging Face Transformers
See the [Inference guide](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/Inference.md#huggingface-transformers-inference) for details on when we recommend the Hugging Face Transformers implementation as opposed to the highly optimized vLLM one.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import hmf.model.hybrid_zoo.models.model_register  # Register Hybrid models

model = AutoModelForCausalLM.from_pretrained(
    "amazon/GKA-primed-HQwen3-8B-Instruct", trust_remote_code=True
).to("cuda")
tokenizer = AutoTokenizer.from_pretrained("amazon/GKA-primed-HQwen3-8B-Instruct")

messages = [{"role": "user", "content": "What is linear attention in the context of LLMs?"}]
prompt = tokenizer.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
)
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=256)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### Training-Free Context Extension 

This model supports training-free context extension 2-4× its native context via an extension to Hybrid models of [PICASO cache composition](https://arxiv.org/abs/2502.17605). See the [State Composition guide](https://github.com/awslabs/hybrid-model-factory/blob/main/docs/StateComposition.md) for usage. Note, this is currently supported in Hugging Face Transformers only.


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
