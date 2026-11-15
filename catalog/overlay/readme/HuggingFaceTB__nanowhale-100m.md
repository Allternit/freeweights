# nanowhale-100m 🐳

A small ~110M parameter language model implementing the **DeepSeek-V4 architecture**, fine-tuned for chat/instruction following. Trained from scratch — no weights from DeepSeek-V4 were used.

- **Pretrained base model**: [HuggingFaceTB/nanowhale-100m-base](https://huggingface.co/HuggingFaceTB/nanowhale-100m-base)
- **This model**: SFT on [HuggingFaceTB/smol-smoltalk](https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk)
- **Training code**: [github.com/huggingface/nanowhale](https://github.com/huggingface/nanowhale)

## Architecture

This model implements key DeepSeek-V4 innovations at a miniature scale:

| Component | Details |
|---|---|
| **Parameters** | ~110M total (41M embeddings, 69M non-embedding) |
| **Hidden size** | 320 |
| **Layers** | 8 |
| **Attention heads** | 8 (1 KV head — MQA-style) |
| **MLA** | Multi-head Latent Attention with q_lora_rank=160 |
| **MoE** | 4 routed experts + 1 shared, top-2 routing |
| **Hyper-Connections** | hc_mult=4, Sinkhorn routing (replacing residual connections) |
| **MTP** | 1 next-token prediction layer |
| **Vocab** | 129,280 (DeepSeek-V4 tokenizer) |
| **Context** | 2,048 tokens |

## Training

### Stage 1: Pretraining
- **Dataset**: [HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- **Steps**: 5,000 | **Tokens**: ~2.6B
- **Batch**: 32 effective (8 × 4 GA) | **Seq length**: 2,048
- **LR**: 6e-4, cosine, 3% warmup
- **Precision**: bf16 mixed

### Stage 2: SFT (this model)
- **Dataset**: [HuggingFaceTB/smol-smoltalk](https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk) (460K conversations)
- **Steps**: 3,000 | **Tokens**: ~72.7M
- **Batch**: 32 effective (8 × 4 GA) | **Seq length**: 2,048
- **LR**: 2e-5, cosine, 5% warmup
- **Precision**: fp32

### Metrics

| Metric | Pretrained | SFT |
|---|---|---|
| **Eval loss** | — | 2.607 |
| **Perplexity** (held-out) | 13.62 | 12.90 |
| **Token accuracy** | 33.8% | 48.5% |

## Usage

```python
import torch
from safetensors.torch import load_file
from transformers import AutoConfig, AutoModelForCausalLM, AutoTokenizer
from huggingface_hub import hf_hub_download

# Load model (recommended: manual load for reliability)
config = AutoConfig.from_pretrained("HuggingFaceTB/nanowhale-100m", trust_remote_code=True)
model = AutoModelForCausalLM.from_config(config, trust_remote_code=True).float()

# Download and load weights
weights_path = hf_hub_download("HuggingFaceTB/nanowhale-100m", "model.safetensors")
state_dict = load_file(weights_path)
model.load_state_dict(state_dict, strict=True)
model = model.cuda().eval()

tokenizer = AutoTokenizer.from_pretrained("HuggingFaceTB/nanowhale-100m")

# Chat
messages = [{"role": "user", "content": "What are 3 benefits of exercise?"}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
input_ids = tokenizer.encode(prompt, return_tensors="pt").cuda()
output = model.generate(input_ids, max_new_tokens=200, temperature=0.7, top_p=0.9,
                        pad_token_id=tokenizer.eos_token_id)
print(tokenizer.decode(output[0][input_ids.shape[1]:], skip_special_tokens=True))
```

## Limitations

- **Tiny model**: 110M params with 129K vocabulary — most capacity goes to embeddings. Generations are often incoherent or factually wrong.
- **Undertrained**: Only 5K pretrain + 3K SFT steps. Production models train for 100K+ steps on trillions of tokens.
- **Educational purpose**: This model demonstrates the DeepSeek-V4 architecture at small scale. It is **not** suitable for any production use.
- **bf16 NaN**: Use fp32 — the Hyper-Connections architecture produces values that overflow bf16 range at this scale.
- **Custom code**: Requires `trust_remote_code=True`.

## Hardware

Trained on 1× NVIDIA H100 80GB.

## License

Apache-2.0
