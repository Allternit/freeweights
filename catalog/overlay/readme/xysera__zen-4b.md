# Zen 4B

Zen 4B is Xysera's public research model for structured reasoning, instruction following, and deliberate problem solving.

This release contains a merged BF16 model produced through Xysera's first full parameter-efficient adaptation pass. It is intended for research, evaluation, and local prototyping.

## Model summary

| Property | Value |
|---|---|
| Model family | Zen |
| Scale | Approximately 4B parameters |
| Architecture | Decoder-only causal language model |
| Weight format | BF16 safetensors |
| Primary language | English |
| Primary focus | Structured reasoning and instruction following |
| Release status | Public research release |

## Training approach

Zen 4B was developed using a proprietary model optimization and adaptation pipeline, incorporating iterative training, checkpoint-based evaluation, and targeted refinement to improve reasoning, instruction following, and structured problem-solving capabilities.

## Evaluation

Internal evaluation used 500 examples each from ARC-Easy, HellaSwag, PIQA, and Winogrande. Scores use normalized accuracy where available.

| Task | Score |
|---|---:|
| ARC-Easy | 68.6% |
| HellaSwag | 61.8% |
| PIQA | 78.8% |
| Winogrande | 73.6% |

These are directional internal results, not leaderboard submissions. They should not be compared directly with results using different prompts, shot counts, sample sizes, or evaluation harnesses.

## Limitations

- The model has not undergone a full safety, bias, or harmful-content evaluation.
- Performance is uneven across tasks and may reflect specialization in the adaptation data.
- The current evaluation is limited in size.
- The model may produce factual errors, incomplete reasoning, or incorrect calculations.
- Outputs should be independently verified for consequential use.

## Basic usage

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "xysera/zen-4b"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id, torch_dtype=torch.bfloat16, device_map="auto"
)
messages = [{"role": "user", "content": "Explain how a binary search works."}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=256, do_sample=False)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

## Artifact preservation

The original base checkpoint, QLoRA adapter, intermediate checkpoints, optimizer state, tokenizer, and training logs remain preserved in Xysera's private checkpoint storage. This repository is a clean release repository and does not replace those artifacts.

## Status

Zen 4B is an active public research release.
