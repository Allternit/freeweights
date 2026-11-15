# rl_pymethods2test-r2egym_terminus-structured

RL-trained Qwen3-8B with structured tool calls (terminus-structured agent).

## Training Pipeline

SFT (r2egym+nl2bash+swesmith) → RL mixed dataset (37 steps) → RL full r2egym (55 steps) → RL pymethods2test (156 steps, full epoch)

## Key Results

- **SWEBench-100 pass@3**: 37-42% (depending on eval run)
- **Pymethods2test pass@8**: 91-97%
- **SWEBench in-train eval**: up to 14 fully solved at various checkpoints
- Training on test-writing (pymethods) maintains code-editing ability (SWEBench)

## Training Details

- **Base model**: [laion/r2egym-nl2bash-stack-bugsseq-fixthink-again](https://huggingface.co/laion/r2egym-nl2bash-stack-bugsseq-fixthink-again)
- **Agent**: terminus-structured (bash, view, edit, create, search tools)
- **Algorithm**: RLOO-N
- **Learning rate**: 1e-5
- **Context**: 32k (24k input + 8k output)
- **Framework**: BenSkyRL + Harbor (JSC HPC)

## Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("laion/rl_pymethods2test-r2egym_terminus-structured")
tokenizer = AutoTokenizer.from_pretrained("laion/rl_pymethods2test-r2egym_terminus-structured")
```
