# rl_mixed-struct-step37_terminus-structured

RL-trained Qwen3-8B with structured tool calls on mixed dataset (200 nl2bash + 500 r2egym + 500 swesmith).

37 RL steps with terminus-structured agent. SWEBench-100: 42% pass@3.

## Training Details

- **Base model**: [laion/r2egym-nl2bash-stack-bugsseq-fixthink-again](https://huggingface.co/laion/r2egym-nl2bash-stack-bugsseq-fixthink-again)
- **Training method**: rloo-n with terminus-structured agent (structured tool calls: bash, view, edit, create, search)
- **Framework**: BenSkyRL + Harbor 
- **Context**: 32k (24k input + 8k output)
- **Learning rate**: 1e-5

## SWEBench-Verified Results (100 tasks, pass@3)

| Model | SWEBench pass@3 |
|---|---|
| Base SFT (terminus-2) | 37% |
| This model (terminus-structured) | See eval results |

## Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("laion/rl_mixed-struct-step37_terminus-structured")
tokenizer = AutoTokenizer.from_pretrained("laion/rl_mixed-struct-step37_terminus-structured")
```
