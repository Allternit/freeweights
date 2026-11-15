# swesmith_8b-step35

RL-trained Qwen3-8B on SWEsmith tasks (32k context, no rope scaling, 35 steps).

## Training Details

| Parameter | Value |
|---|---|
| **Base model** | [laion/r2egym-nl2bash-stack-bugsseq-fixthink-again](https://huggingface.co/laion/r2egym-nl2bash-stack-bugsseq-fixthink-again) (Qwen3-8B SFT) |
| **Dataset** | SWEsmith oracle-verified (2,500 tasks, 120s timeout) |
| **Algorithm** | RLOO-N (Leave-One-Out with neutral masking) |
| **Learning rate** | 2.0e-5 |
| **Train batch size** | 32 |
| **Samples per prompt** | 8 |
| **Max episodes** | 64 |
| **Max generate length** | 8,192 tokens |
| **Max input tokens** | 24,000 |
| **Max model length** | 32,768 |
| **Rope scaling** | None (32k native context) |
| **KL loss** | Disabled |
| **Reward shaping** | Enabled (pass_ratio) |
| **Staleness steps** | 16 |
| **Policy nodes** | 2 (8 GPUs, FSDP2) |
| **Inference engines** | 20 (TP=1) |
| **Training steps** | 35 |
| **Framework** | BenSkyRL + Harbor |

## Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("laion/swesmith_8b-step35")
tokenizer = AutoTokenizer.from_pretrained("laion/swesmith_8b-step35")
```
