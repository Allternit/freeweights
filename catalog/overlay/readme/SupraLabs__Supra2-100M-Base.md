<h1 align="center">Supra2-100M Base</h1>

<p align="center">
  Base model of new Supra2 family • 100M Parameters • 1K Context - extended to 2k
</p>

![supra2-_pro_-100m](https://cdn-uploads.huggingface.co/production/uploads/697f2832c2c5e4daa93cece7/zMBPPr0y634MNUvx2Krqy.png)

**Supra2-100M Base** is a 100M-parameter decoder-only language model pretrained from scratch by **SupraLabs** on 30B tokens of English web text. It uses the **Qwen3** architecture with a custom 32,768-token tokenizer.

This is a **base model**. It has *not* been instruction-tuned, chat-tuned, or aligned in any way. 

---

## **Let the model speak - a sample**

Prompt: "Artificial intelligence is "
Completion:
```plaintext
100% efficient, yet it still requires a lot of resources.
We are in the midst of a major transition from the traditional computer and software to artificial intelligence.
It is very important to have a strategy in mind. This is not only important for the companies that use it, but also for individuals and organizations that use it.
There is a huge difference between the two approaches. The artificial intelligence approach is based on computers and the software.
It has been proven that the artificial intelligence approach is more efficient and has a much better performance.
The benefits of artificial intelligence are also known to be immense. It is a powerful tool that can improve productivity, increase efficiency, and reduce costs.
It can be used for a wide range of tasks, from customer service to product development.
It is also used for various other tasks, such as sales, marketing, and customer service.
It is also used for various other tasks, such as customer service and product development.
There are a number of different types of artificial intelligence. These include machine learning, natural language processing, and neural networks.
The main advantage of using artificial intelligence is that it is more efficient and can be used for a wide range of tasks.
It is also[...]
```

---

## **Evaluation & Benchmarks**

All benchmarks were evaluated using the EleutherAI LM-Eval Harness.

| Model | PIQA (acc_norm) | HellaSwag (acc_norm) | ARC-Easy (acc_norm) | ARC-Challenge (acc_norm) |
| :--- | :---: | :---: | :---: | :---: |
| Supra-50M-Base | 0.62 | 0.32 | 0.46 | 0.25 |
| Supra2-100M Base | 0.65 | 0.36 | 0.48 | 0.25 |
| BananaMind-2-Pro-Preview-EXP | 0.67 | 0.40 | 0.51 | 0.27 |
| GPT-X-125M | 0.65 | 0.37 | 0.51 | 0.25 |
| OpenAI GPT-2 Small | 0.62 | 0.31 | 0.39 | 0.22 |

![grafik](https://cdn-uploads.huggingface.co/production/uploads/697f2832c2c5e4daa93cece7/TfH9iBYB0nNvms2-M84lG.png)

---

## **Model Details**

| | |
| ----- | ----- |
| **Developed by** | SupraLabs |
| **Model type** | Causal decoder-only transformer (Qwen3) |
| **Language** | English |
| **Parameters** | 100.7M total / 75.5M non-embedding |
| **Training tokens** | 30B (300 tokens per parameter) |
| **Context length** | 1,024 (trained) / 2,048 (config maximum, untested) |
| **Precision** | bfloat16 |
| **License** | Apache 2.0 |

### **Architecture**

| Hyperparameter | Value |
| ----- | ----- |
| Hidden size | 768 |
| Layers | 12 |
| Attention heads | 12 (GQA, 4 KV heads) |
| Head dim | 64 |
| Intermediate size (SwiGLU) | 2048 |
| Vocab size | 32,768 |
| Positional encoding | RoPE θ=10,000 |
| Normalization | RMSNorm, ε=10\-6 (incl. QK-Norm) |
| Tied embeddings | Yes |
| Sliding window | Disabled |
| Attention implementation | SDPA |

---

## **Training Data**

| Source | Share | Approx. tokens |
| ----- | ----- | ----- |
| `HuggingFaceFW/fineweb-edu` (`sample-350BT`) | 70% | 21B |
| `HuggingFaceFW/dclm_100BT-shuffled` | 30% | 9B |

Documents were tokenized with the custom `supra2-tokenizer`, concatenated into a flat `uint16` token stream, and packed into contiguous 1,024-token chunks (no padding, no document masking — sequences may cross document boundaries).

---

## **Training Procedure**

| Setting | Value |
| ----- | ----- |
| Optimizer | AdamW (fused), β1=0.9, β2=0.95, ε=10−8 |
| Peak learning rate | 1×10-3 |
| LR schedule | WSD (Warmup–Stable–Decay), `1-sqrt` decay to 0 |
| Total steps | 114k |
| Micro batch size | 16 |
| Gradient accumulation | 16 |
| Effective batch | 256 sequences \= **262,144 tokens/step** |
| Weight decay | 0.1 |
| Gradient clipping | 1.0 |
| Auxiliary loss | Router-free **z-loss**, coefficient 10\-4 |
| Compile | `torch.compile` enabled |
| Hardware | 1× RTX 5090 (32GB) |

---

## **Usage**

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "SupraLabs/Supra2-100M"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto",
)
model.eval()

prompt = "Artificial intelligence is "
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

with torch.no_grad():
    out = model.generate(
        **inputs,
        max_new_tokens=256,
        do_sample=True,
        temperature=0.3,
        top_p=0.85,
        top_k=15,
        no_repeat_ngram_size=3,
        repetition_penalty=1.1,
    )

print(tokenizer.decode(out[0], skip_special_tokens=True))
```

### **Tokenizer notes**

The tokenizer ships with a **ChatML** template and reserved special tokens (`<|im_start|>`, `<|im_end|>`, `<think>`, `<tool_call>`, `<|reserved_0..15|>`, …). These exist so that downstream fine-tunes can adopt them without resizing embeddings — **the base model has never seen them in training** and will not behave sensibly if you apply the chat template.

---

## **Intended Use**

**Intended:**

* Research on small-scale pretraining, scaling behavior, and data mixtures  
* A cheap starting point for SFT / instruction tuning / domain adaptation  
* Educational use, ablations, and fast iteration on limited hardware

**Not intended:**

* Any production or user-facing deployment  
* Factual question answering, advice, or decision support  
* Non-English text (essentially untrained; only supports english\!)

---

## **Limitations and Bias**

* **Small.** At 100M parameters, factual recall, reasoning, arithmetic, and long-range coherence are weak. Expect frequent hallucination and topic drift.  
* **Base model.** No RLHF, no safety tuning, no refusal behavior. It will continue whatever text you give it, including harmful or offensive prompts.  
* **Web-derived data.** FineWeb-Edu and DCLM are filtered CommonCrawl derivatives and carry the biases, stereotypes, and factual errors of the open web.  
* **Short context.** Trained exclusively at 1,024 tokens. The config allows 2,048, but extrapolation beyond 1,024 is untested and likely degraded.  
* **No document masking.** Attention could cross document boundaries within a packed chunk, which slightly blurs document independence.  
* **English only.**

---

## **What comes next?**

We are already training the next models in the Supra2-family:

- Supra2-Nano (800k params)  
- Supra2-Small (\~1.3M params)  
- Supra2-Medium (25M params)  
- Supra2-IMG: our SOTA small text-to-image model

---

## **Citation**

```bibtex
@misc{supralabs2026supra2100m,
  author       = {{SupraLabs}},
  title        = {Supra2-100M Base},
  year         = {2026},
  publisher    = {Hugging Face},
  journal      = {Hugging Face repository},
  howpublished = {\url{https://huggingface.co/SupraLabs/Supra2-100M}},
  note         = {Software model}
}
```

---

*© SupraLabs 2026*