# Granite-SWASH-2B (Sliding Window Attention + Sinks Hybrid)

**Model Summary**
Granite-SWASH-2B is a 2B parameter decoder-only dense language model with **per-layer Sliding Window Attention (SWA)** and **learnable attention sinks** (LSE-based). Trained on a mix of open source and proprietary data, it is a broad, general-purpose, English-language base model that serves as an early exploration and small-scale preview for upcoming Granite series model releases. 

- **Developers:** Granite Team, IBM
- **Model Collection:** [Granite Experiment HF Collection](https://huggingface.co/collections/ibm-granite/granite-experiments)
<!-- - **Technical Blog:** [Granite-4.1 Blog](https://huggingface.co/blog/ibm-granite/granite-4-1) -->
<!-- - **GitHub Repository:** [ibm-granite/granite-4.1-language-models](https://github.com/ibm-granite/granite-4.1-language-models) -->
- **Website**: [Granite Docs](https://www.ibm.com/granite/docs/) 
- **Release Date**: July 7th, 2026
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Architecture

Granite-SWASH-2B is based on a decoder-only dense transformer architecture. Core components of this architecture are: GQA, RoPE, MLP with SwiGLU, RMSNorm, shared input/output embeddings, Sliding Window Attention, and Attention Sinks.

| Parameter | Value |
|-----------|-------|
| Hidden size | 2560 |
| Layers | 24 |
| Attention heads | 20 (4 KV heads, GQA) |
| Intermediate size | 8192 (SwiGLU) |
| Max position embeddings | 8192 |
| Sliding window size | 128 |
| Vocabulary | 100,352 |
| Parameters | 2,144,463,840 |

**Attention Pattern:** 7 full-attention layers (indices 0, 3, 7, 11, 15, 19, 23) and 17 sliding-window layers (window=128). All layers have learnable per-head attention sinks.

**MuP Scaling:** embedding_multiplier=12, residual_multiplier=0.28, logits_scaling=10, attention_multiplier=0.0078125

**Sink Mechanism:** this model uses **post-attention LSE scaling** in the eager implementation:

```
sink_scale = sigmoid(lse - sinks)
attn_output = attn_output * sink_scale
```

Where `lse` is the log-sum-exp of attention scores, and `sinks` is a learnable per-head parameter. Flash Attention 3 and 4 implementations natively incorporate and compute the sink token under the hood. Note that SDPA does not express sink tokens or `sink_scale`, and so is not a supported backend. 

## Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model = AutoModelForCausalLM.from_pretrained(
    "ibm-granite/granite-swash-2b",
    dtype=torch.bfloat16,
    device_map="auto",
    attn_implementation="flash_attention_3",  # or "flash_attention_4" or "eager", NOT "sdpa"
)
tokenizer = AutoTokenizer.from_pretrained("ibm-granite/granite-swash-2b")

inputs = tokenizer("The capital of France is", return_tensors="pt").to(model.device)
out = model.generate(**inputs, max_new_tokens=50, do_sample=False)
print(tokenizer.decode(out[0], skip_special_tokens=True))
```

Requires transformers version > 5.8.0

## Evaluation Results

| Benchmark | Metric | Score |
|-----------|--------|-------|
| WikiText-2 | word_perplexity | 15.29 |
| MMLU (5-shot) | accuracy | 0.5519 |
| GSM8K CoT (5-shot) | exact_match | 0.4223 |

## Supported Features

- Flash Attention 3 and 4 with native LSE (recommended for speed)
- Eager attention fallback (for debugging/CPU)
- Sliding window KV cache (memory-efficient generation)
- Per-layer causal mask dispatch (full vs sliding window)
- Generation via `model.generate()`

## Ethical Considerations and Limitations
The use of Large Language Models involves risks and ethical considerations people must be aware of, including but not limited to: bias and fairness, misinformation, and autonomous decision-making. Granite-SWASH-2B is not an exception in this regard. Even though this model is suited for multiple generative AI tasks, it has not undergone any safety alignment and it may produce problematic outputs. Additionally, it remains uncertain whether smaller models might exhibit increased susceptibility to hallucination in generation scenarios by copying text verbatim from the training dataset due to their reduced sizes and memorization capacities. This aspect is currently an active area of research, and we anticipate more rigorous exploration, comprehension, and mitigations in this domain. Regarding ethics, a latent risk associated with all Large Language Models is their malicious utilization. We urge the community to use Granite-SWASH-2B model with ethical intentions and in a responsible way. To enhance safety in enterprise deployments, we recommend using Granite Language models alongside [Granite Guardian](https://huggingface.co/ibm-granite/granite-guardian-4.1-8b), a model designed to detect and flag risks in inputs and outputs across key dimensions outlined in the [IBM AI Risk Atlas](https://ibm.github.io/ai-atlas-nexus/concepts/IBM_AI_Risk_Atlas/).  

## Resources
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://github.com/ibm-granite-community/