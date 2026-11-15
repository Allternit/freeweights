# swesmith_8b_rope_65k-step37

RL-trained Qwen3-8B on SWEsmith tasks (65k context with YaRN rope, 37 steps, LR=2e-5, Dr.GRPO with sequence_mean loss, eps_clip_high=0.28).

## Training Details

- **Base model**: [laion/GLM-4_7-r2egym_sandboxes-maxeps-131k-lc](https://huggingface.co/laion/GLM-4_7-r2egym_sandboxes-maxeps-131k-lc)
- **Training method**: drgrpo
- **Framework**: BenSkyRL + Harbor

## Usage

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("laion/swesmith_8b_rope_65k-step37")
tokenizer = AutoTokenizer.from_pretrained("laion/swesmith_8b_rope_65k-step37")
```
