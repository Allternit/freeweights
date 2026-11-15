# rl_r2egym-nl2bash-swesmith-pymethods2test_terminus-structured

RL-trained Qwen3-8B with structured tool calls.

Training pipeline: SFT (r2egym+nl2bash+swesmith) → RL mixed dataset (37 steps) → RL full r2egym (55 steps) → RL pymethods2test (110 steps).

Key results:
- SWEBench-100: 42% pass@3 (vs 37% base with terminus-2)
- Pymethods2test: 94-100% pass@8
- 14 SWEBench tasks solved that base model cannot
- Trained with terminus-structured agent (bash, view, edit, create, search tools)

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

model = AutoModelForCausalLM.from_pretrained("laion/rl_r2egym-nl2bash-swesmith-pymethods2test_terminus-structured")
tokenizer = AutoTokenizer.from_pretrained("laion/rl_r2egym-nl2bash-swesmith-pymethods2test_terminus-structured")
```
