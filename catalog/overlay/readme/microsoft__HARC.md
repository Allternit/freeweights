<h1 align="center">HARC: Coupling Harmfulness and Refusal Directions for Robust Safety Alignment</h1>
<p align="center">
  <a href="https://arxiv.org/abs/2607.00572"><img src="https://img.shields.io/badge/Paper-arXiv-b31b1b.svg?logo=arxiv&logoColor=white" alt="Paper"></a>
  <a href="https://huggingface.co/collections/microsoft/harc"><img src="https://img.shields.io/badge/%F0%9F%A4%97%20Collection-HARC-ff9d00.svg" alt="Collection"></a>
  <a href="https://github.com/microsoft/HARC"><img src="https://img.shields.io/badge/GitHub-Code-181717.svg?logo=github" alt="GitHub"></a>
  <a href="https://huggingface.co/microsoft/HARC/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT"></a>
</p>

---

## Model description

HARC couples a model's internal *harmfulness* and *refusal* directions at both
prompt-side and response-side token positions, using an additive margin-hinge
loss on cosine projections of the residual stream. The intervention is confined
to a low-dimensional harmfulness–refusal subspace within a small set of selected
layers, which improves robustness to jailbreak attacks while preserving general
capability and avoiding the over-refusal regression typical of broader safety
tuning.

**This repository contains the HARC LoRA adapters.** The adapter is applied to attention and MLP projections
and trained with a composite objective: **(i)** the margin-hinge coupling loss **(ii)** a KL-divergence retention term anchoring benign outputs to the base model **(iii)** a cross-entropy term supervising refusal text on harmful prompts.
Training directions are extracted via difference-of-means on contrastive prompt sets
and periodically recomputed with EMA blending. The adapter adds ~1% trainable parameters and leaves the base
architecture unchanged.

- **Backbone models:** Llama-3.1-8B-Instruct, Qwen-2.5-7B-Instruct
- **Collection:** [HARC Collection](https://huggingface.co/collections/microsoft/harc)
- **Paper:** [arXiv:2607.00572](https://arxiv.org/abs/2607.00572)
- **Code:** [github.com/microsoft/HARC](https://github.com/microsoft/HARC)

## The HARC collection

| Repo | Contents | License |
|---|---|---|
| **microsoft/HARC** (this repo) | LoRA adapters for both backbones | MIT |
| [microsoft/HARC-Llama-3.1-8B-Instruct](https://huggingface.co/microsoft/HARC-Llama-3.1-8B-Instruct) | Merged full model | Llama 3.1 Community License |
| [microsoft/HARC-Qwen2.5-7B-Instruct](https://huggingface.co/microsoft/HARC-Qwen2.5-7B-Instruct) | Merged full model | Apache-2.0 |

Use this repo if you want the lightweight adapters to load on top of your own
copy of the base model; use the merged-model repos if you want a single
ready-to-run checkpoint.

## Repository structure

```
microsoft/HARC/
└── adapters/
    ├── harc_llama3.1_8b/    # base = Llama-3.1-8B-Instruct
    └── harc_qwen2.5_7b/     # base = Qwen2.5-7B-Instruct
```

## How to use

Use the base model's standard chat template in both cases.

### Option A — pre-merged full model (simplest)

Loads directly from the merged-model repo; no base download or PEFT required.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# pick the merged model you want
repo = "microsoft/HARC-Qwen2.5-7B-Instruct"   # or "microsoft/HARC-Llama-3.1-8B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(repo)
model = AutoModelForCausalLM.from_pretrained(repo, torch_dtype="auto", device_map="auto")

messages = [{"role": "user", "content": "Hello!"}]
inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to(model.device)
out = model.generate(inputs, max_new_tokens=256)
print(tokenizer.decode(out[0][inputs.shape[-1]:], skip_special_tokens=True))
```

### Option B — base model + LoRA adapter (via PEFT)

Load the base model, then attach the adapter from this repo with the matching `subfolder`.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_id = "Qwen/Qwen2.5-7B-Instruct"          # or "meta-llama/Llama-3.1-8B-Instruct"
subfolder = "adapters/harc_qwen2.5_7b"        # or "adapters/harc_llama3.1_8b"

tokenizer = AutoTokenizer.from_pretrained(base_id)
base = AutoModelForCausalLM.from_pretrained(base_id, torch_dtype="auto", device_map="auto")
model = PeftModel.from_pretrained(base, "microsoft/HARC", subfolder=subfolder)
```

Requires `torch >= 2.1`, `transformers`, and (for Option B) `peft`. Inference
hardware requirements match the base model (a 7–8B model in bf16/fp16 fits on a
24GB GPU).

## Results

![HARC main results on Llama-3.1-8B and Qwen-2.5-7B](https://huggingface.co/microsoft/HARC/resolve/main/assets/HARC-res.png)

## License

The LoRA adapters in this repository are released under the MIT License. The
merged full models are distributed in separate repositories under their base
model's license: the Llama variant under the Meta Llama 3.1 Community License,
and the Qwen variant under Apache-2.0.

## Citation

```bibtex
@article{chua2026harc,
  title={HARC: Coupling Harmfulness and Refusal Directions for Robust Safety Alignment},
  author={Chua, Shei Pern and Wu, Fangzhao},
  journal={arXiv preprint arXiv:2607.00572},
  year={2026}
}
```