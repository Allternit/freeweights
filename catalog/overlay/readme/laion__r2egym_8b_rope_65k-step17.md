# r2egym_8b_rope_65k-step17

RL-trained Qwen3-8B on R2EGym tasks (65k context with YaRN rope scaling, 17 steps).

## Training Details

| Parameter | Value |
|---|---|
| **Base model** | [laion/GLM-4_7-r2egym_sandboxes-maxeps-131k-lc](https://huggingface.co/laion/GLM-4_7-r2egym_sandboxes-maxeps-131k-lc) (Qwen3-8B SFT, long-context) |
| **Dataset** | R2EGym GPT5/Codex solved tasks (1,785 tasks) |
| **Algorithm** | RLOO-N (Leave-One-Out with neutral masking) |
| **Learning rate** | 3.0e-5 |
| **Train batch size** | 32 |
| **Samples per prompt** | 8 |
| **Max episodes** | 64 |
| **Max generate length** | 8,192 tokens |
| **Max input tokens** | 57,344 |
| **Max model length** | 65,536 |
| **Rope scaling** | YaRN (factor=4.0, original_max_pos_emb=32,768) |
| **KL loss** | Disabled |
| **Reward shaping** | Enabled (pass_ratio) |
| **Staleness steps** | 16 |
| **Policy nodes** | 2 (8 GPUs, FSDP2) |
| **Inference engines** | 20 (TP=1) |
| **Training steps** | 17 |
| **Framework** | BenSkyRL + Harbor |

## Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("laion/r2egym_8b_rope_65k-step17")
tokenizer = AutoTokenizer.from_pretrained("laion/r2egym_8b_rope_65k-step17")
```
