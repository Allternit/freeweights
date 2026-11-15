# nanowhale-100m-base 🐳

A small ~110M parameter language model implementing the **DeepSeek-V4 architecture** from scratch. This is the pretrained base model — see [HuggingFaceTB/nanowhale-100m](https://huggingface.co/HuggingFaceTB/nanowhale-100m) for the SFT/chat version.

**Training code**: [github.com/huggingface/nanowhale](https://github.com/huggingface/nanowhale)

## Architecture

This model implements key DeepSeek-V4 innovations at a miniature scale:

| Component | Details |
|---|---|
| **Parameters** | ~110M total (41M embeddings, 69M non-embedding) |
| **Hidden size** | 320 |
| **Layers** | 8 |
| **Attention heads** | 8 (1 KV head — MQA-style) |
| **Head dim** | 96 (32 RoPE + 64 NoPE) |
| **MLA** | q_lora_rank=160, o_groups=2, o_lora_rank=80 |
| **MoE** | 4 routed experts + 1 shared, top-2 routing |
| **Expert FFN** | SwiGLU, intermediate_size=640 |
| **Routing** | sqrtsoftplus scoring, noaux_tc method |
| **Hyper-Connections** | hc_mult=4, Sinkhorn routing (2 iters) |
| **MTP** | 1 next-token prediction layer |
| **Vocab** | 129,280 (DeepSeek-V4 tokenizer) |
| **Context** | 2,048 tokens |

### DeepSeek-V4 Features Implemented

- **Multi-head Latent Attention (MLA)**: Compressed KV cache via latent projections
- **Mixture of Experts (MoE)**: Sparse activation — only 2 of 4 experts per token
- **Hyper-Connections**: Multi-copy hidden states with learned Sinkhorn routing replacing residual connections
- **SwiGLU FFN** with configurable limit
- **Grouped output projection** (o_groups)

## Training

- **Dataset**: [HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu) (streaming)
- **Steps**: 5,000
- **Tokens seen**: ~2.6B
- **Batch size**: 8 × 4 gradient accumulation = 32 effective
- **Sequence length**: 2,048
- **Learning rate**: 6e-4, cosine schedule, 3% warmup
- **Optimizer**: AdamW (β1=0.9, β2=0.95, weight_decay=0.1)
- **Precision**: bf16 mixed precision
- **Hardware**: 1× NVIDIA H100 80GB

### Training Metrics

| Metric | Value |
|---|---|
| Final loss | ~5.3 (cross-entropy) |
| Final entropy | 3.77 |
| Token accuracy | 33.8% |

## Usage

```python
import torch
from safetensors.torch import load_file
from transformers import AutoConfig, AutoModelForCausalLM, AutoTokenizer
from huggingface_hub import hf_hub_download

# Load model (recommended: manual load for reliability)
config = AutoConfig.from_pretrained("HuggingFaceTB/nanowhale-100m-base", trust_remote_code=True)
model = AutoModelForCausalLM.from_config(config, trust_remote_code=True).float()

# Download and load weights
weights_path = hf_hub_download("HuggingFaceTB/nanowhale-100m-base", "model.safetensors")
state_dict = load_file(weights_path)
model.load_state_dict(state_dict, strict=True)
model = model.cuda().eval()

tokenizer = AutoTokenizer.from_pretrained("HuggingFaceTB/nanowhale-100m-base")

# Generate
input_ids = tokenizer.encode("The meaning of life is", return_tensors="pt").cuda()
output = model.generate(input_ids, max_new_tokens=100, temperature=0.7, top_p=0.9,
                        pad_token_id=tokenizer.eos_token_id)
print(tokenizer.decode(output[0], skip_special_tokens=True))
```

## Limitations

- **Small model**: 110M params with 129K vocab means ~37% of parameters are in embeddings, limiting model capacity
- **Limited training**: Only 5K steps / 2.6B tokens — significantly undertrained compared to production models
- **Pretrained only**: This is a base model without instruction tuning. Outputs are language-model completions, not conversations.
- **bf16 NaN**: Use fp32 — the Hyper-Connections architecture produces values that overflow bf16 range at this scale.
- **Custom architecture**: Requires `trust_remote_code=True`

## License

Apache-2.0
