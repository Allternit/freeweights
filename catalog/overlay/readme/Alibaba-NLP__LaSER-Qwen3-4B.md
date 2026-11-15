# LaSER-Qwen3-4B

**LaSER** (**La**tent **S**pace **E**xplicit **R**easoning) is a self-distillation framework that internalizes explicit Chain-of-Thought reasoning into the latent space of dense retrievers, enabling the model to "think silently" through continuous latent tokens.

**LaSER-Qwen3-4B** is a 4B-parameter dense retriever built on [Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B).

> 📄 **Paper:** [LaSER: Internalizing Explicit Reasoning into Latent Space for Dense Retrieval](https://arxiv.org/abs/2603.01425) 
>
> 💻 **Code:** [https://github.com/ignorejjj/LaSER](https://github.com/ignorejjj/LaSER)

## Model Summary

| Attribute | Detail |
|:---|:---|
| **Model Type** | Dense Retriever with Latent Thinking |
| **Base Model** | [Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B) |
| **Parameters** | 4B |
| **Embedding Dimension** | 2560 |
| **Max Sequence Length** | 8192 (training: 512) |
| **Similarity Function** | Cosine Similarity |
| **Latent Thinking Steps (K)** | 3 (default) |
| **Training Data** | 81K examples from [ReasonEmb](https://huggingface.co/datasets/reasonir/ReasonEmb) |
| **License** | MIT |

## How It Works

Unlike standard dense retrievers that encode queries in a single forward pass, LaSER generates **K continuous latent thinking tokens** autoregressively in the embedding space:

1. Encode the input text into embeddings
2. At each thinking step, project the last hidden state through the LM head → softmax → compute a probability-weighted soft token from the embedding table
3. Append the soft token and repeat for K steps (using KV caching for efficiency)
4. Mean-pool the hidden states from all K thinking steps → L2 normalize

This enables complex reasoning while maintaining the inference efficiency of standard dense retrievers (~1.7× latency overhead, only ~0.3% of rewrite-then-retrieve pipelines).

## Usage

### Direct Usage with Transformers

```python
import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer


def laser_encode(model, tokenizer, texts, max_length=512, num_thinking_steps=3):
    """Encode texts using LaSER's latent thinking mechanism."""
    device = next(model.parameters()).device
    batch = tokenizer(texts, padding=True, truncation=True, max_length=max_length, return_tensors="pt").to(device)
    input_ids, attention_mask = batch["input_ids"], batch["attention_mask"]

    batch_size = input_ids.size(0)
    thinking_slots = num_thinking_steps - 1
    eos_id = tokenizer.eos_token_id

    if thinking_slots > 0:
        eos_padding = torch.full((batch_size, thinking_slots), eos_id, dtype=input_ids.dtype, device=device)
        mask_padding = torch.ones((batch_size, thinking_slots), dtype=attention_mask.dtype, device=device)
        input_ids = torch.cat([input_ids, eos_padding], dim=1)
        attention_mask = torch.cat([attention_mask, mask_padding], dim=1)

    input_embeds = model.get_input_embeddings()(input_ids)
    embedding_table = model.get_input_embeddings().weight
    base_seq_len = input_embeds.size(1) - thinking_slots

    past_key_values = None
    hidden_steps = []

    for step_idx in range(thinking_slots):
        pos = base_seq_len + step_idx
        step_embeds = input_embeds[:, :pos, :] if past_key_values is None else input_embeds[:, pos-1:pos, :]
        step_mask = attention_mask[:, :pos]

        outputs = model(inputs_embeds=step_embeds, attention_mask=step_mask,
                       output_hidden_states=True, past_key_values=past_key_values,
                       use_cache=True, return_dict=True)
        hidden_steps.append(outputs.hidden_states[-1][:, -1, :])
        token_probs = torch.softmax(outputs.logits[:, -1, :], dim=-1)
        new_embed = token_probs @ embedding_table
        past_key_values = outputs.past_key_values
        pre = input_embeds[:, :pos, :]
        post = input_embeds[:, pos+1:, :]
        input_embeds = torch.cat([pre, new_embed.unsqueeze(1), post], dim=1)

    final_embeds = input_embeds[:, -1:, :] if past_key_values else input_embeds
    outputs = model(inputs_embeds=final_embeds, attention_mask=attention_mask,
                   output_hidden_states=True, past_key_values=past_key_values,
                   use_cache=True, return_dict=True)
    hidden_steps.append(outputs.hidden_states[-1][:, -1, :])

    embeddings = torch.stack(hidden_steps, dim=1).mean(dim=1)
    return F.normalize(embeddings, p=2, dim=-1)


# Load model
model_name = "Alibaba-NLP/LaSER-Qwen3-4B"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
tokenizer.padding_side = "left"
if tokenizer.pad_token_id is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_name, torch_dtype=torch.float16, trust_remote_code=True
).cuda().eval()

# Encode queries and documents
with torch.inference_mode():
    query_emb = laser_encode(model, tokenizer, ["why is the sky blue"], num_thinking_steps=3)
    doc_emb = laser_encode(model, tokenizer, ["Rayleigh scattering makes short wavelengths scatter more strongly"], num_thinking_steps=3)

# Compute similarity
similarity = (query_emb @ doc_emb.T).item()
print(f"Cosine similarity: {similarity:.4f}")
```

### Batch Encoding

```python
queries = [
    "What causes tides in the ocean?",
    "How does photosynthesis convert light to energy?",
    "Why do metals conduct electricity?",
]

with torch.inference_mode():
    query_embeddings = laser_encode(model, tokenizer, queries, num_thinking_steps=3)
    print(f"Batch embeddings shape: {query_embeddings.shape}")  # (3, 2560)
```

## Evaluation Results

### BRIGHT Benchmark (nDCG@10) — In-Domain

| Model | Size | Avg. |
|:---|:---:|:---:|
| Qwen3-Embedding-4B | 4B | 17.9 |
| Fair Baseline (Qwen3-4B) | 4B | — |
| GIRCSE (Qwen3-4B) | 4B | — |
| **LaSER-Qwen3-4B (Ours)** | **4B** | **28.0** |

### Cross-Scale Comparison on BRIGHT

| Model | Size | Avg. (nDCG@10) |
|:---|:---:|:---:|
| LaSER-Qwen3-0.6B | 0.6B | 23.1 |
| **LaSER-Qwen3-4B** | **4B** | **28.0** |
| LaSER-Qwen3-8B | 8B | 29.3 |

> LaSER-Qwen3-4B achieves a strong balance between performance and computational cost, outperforming 8B-scale standard dense retrievers while requiring significantly less compute.

## Training Details

- **Training Data:** 81K query-document pairs from [ReasonEmb](https://huggingface.co/datasets/reasonir/ReasonEmb), each with a CoT reasoning path generated by GPT-4o-mini
- **Method:** LoRA fine-tuning (r=64, α=32) for 1 epoch on 4×A100 GPUs
- **Loss:** Contrastive learning + Output-level KL distillation (λ₂=10) + Process-level trajectory alignment (λ₃=0.1)
- **Temperature:** τ=0.02
- **Thinking Steps:** K=3

## Model Family

| Model | Parameters | BRIGHT Avg. | Link |
|:---|:---:|:---:|:---:|
| LaSER-Qwen3-0.6B | 0.6B | 23.1 | [🤗 Link](https://huggingface.co/Alibaba-NLP/LaSER-Qwen3-0.6B) |
| **LaSER-Qwen3-4B** | 4B | 28.0 | [🤗 This model](https://huggingface.co/Alibaba-NLP/LaSER-Qwen3-4B) |
| LaSER-Qwen3-8B | 8B | 29.3 | [🤗 Link](https://huggingface.co/Alibaba-NLP/LaSER-Qwen3-8B) |

## Citation

```bibtex
@article{jin2026laser,
  title={LaSER: Internalizing Explicit Reasoning into Latent Space for Dense Retrieval},
  author={Jin, Jiajie and Zhang, Yanzhao and Li, Mingxin and Long, Dingkun and Xie, Pengjun and Zhu, Yutao and Dou, Zhicheng},
  year={2026},
  journal={arXiv preprint},
  url={https://arxiv.org/abs/2603.01425},
}
```
