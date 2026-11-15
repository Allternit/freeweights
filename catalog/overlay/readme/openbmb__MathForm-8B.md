<div align="center">
  <h1>MathForm: Scaling Mathematical Autoformalization with Knowledge Retrieval and Verification-Guided Refinement</h1>
</div>

<div align="center" style="line-height: 1;">
  <a href="https://arxiv.org/abs/2608.14221" style="margin: 2px;"><img src="https://img.shields.io/badge/Paper-arXiv-b31b1b.svg" alt="Paper" style="display: inline-block; vertical-align: middle;" /></a>
  <a href="https://github.com/OpenBMB/MathForm" style="margin: 2px;"><img src="https://img.shields.io/badge/GitHub-MathForm-181717.svg" alt="Code" style="display: inline-block; vertical-align: middle;" /></a>
  <a href="https://huggingface.co/datasets/openbmb/FormalVerse" style="margin: 2px;"><img src="https://img.shields.io/badge/%F0%9F%A4%97%20Dataset-FormalVerse-yellow.svg" alt="FormalVerse Dataset" style="display: inline-block; vertical-align: middle;" /></a>
</div>

**MathForm-8B** is an autoformalization model that translates natural-language
mathematical statements into Lean 4. It is released with the paper *MathForm:
Scaling Mathematical Autoformalization with Knowledge Retrieval and
Verification-Guided Refinement*.

The model is trained on [FormalVerse](https://huggingface.co/datasets/openbmb/FormalVerse) through supervised
fine-tuning followed by reinforcement learning using Lean compilation and
semantic-consistency feedback.

<p align="center">
  <img src="./assets/data-pipeline.png" width="800" alt="MathForm data construction and training pipeline">
  <br>
  <em>Figure 1: Overview of the MathForm data construction and training pipeline. The system combines Mathlib knowledge retrieval, compilation and semantic verification, and iterative refinement to generate reliable formal data, followed by trajectory reconstruction and training of MathForm-8B.</em>
</p>

## Results

<p align="center">
  <img src="./assets/results.png" width="900" alt="Pass@8 results on six benchmarks">
  <br>
  <em>Figure 2: Pass@8 pass rates (%) under Syntax Check (SC) and Consistency Check (CC) for specialized autoformalizers on six benchmarks. AVG is the equally weighted macro-average across all six benchmarks. For each column, the best result is shown in bold and the second best is underlined.</em>
</p>

## Usage

### Transformers

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "openbmb/MathForm-8B"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id, torch_dtype=torch.bfloat16, device_map="auto"
)

prompt = (
    "Please convert the following informal math problem to a formal one in Lean 4 with a header. "
    "Use the following theorem names: my_favorite_theorem.\n\n"
    "Show that for every real number x, x^2 is non-negative."
)

messages = [{"role": "user", "content": prompt}]
text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(text, return_tensors="pt").to(model.device)

outputs = model.generate(
    **inputs, max_new_tokens=16384, temperature=0.6, top_p=0.95
)
print(tokenizer.decode(outputs[0][inputs.input_ids.shape[-1]:], skip_special_tokens=True))
```

### vLLM

```bash
vllm serve openbmb/MathForm-8B \
  --served-model-name MathForm-8B \
  --dtype bfloat16 \
  --max-model-len 16384
```

### SGLang

```bash
python -m sglang.launch_server \
  --model-path openbmb/MathForm-8B \
  --served-model-name MathForm-8B \
  --dtype bfloat16 \
  --context-length 16384
```

Both servers expose an OpenAI-compatible API at
`http://localhost:8000/v1/chat/completions`.

### Recommended Settings

| Setting | Value |
| --- | --- |
| `temperature` | 0.6 |
| `top_p` | 0.95 |
| `max_new_tokens` | 16384 |

## Evaluation

The evaluation pipeline, benchmark files, and Pass@k scripts are available in
the [MathForm repository](https://github.com/OpenBMB/MathForm). Compilation checks require a running
Kimina Lean Server. The experiments use Lean 4.21.0.

## License

This project is licensed under the Apache License 2.0.

## Citation

```bibtex
@misc{pu2026mathformscalingmathematicalautoformalization,
      title={MathForm: Scaling Mathematical Autoformalization with Knowledge Retrieval and Verification-Guided Refinement}, 
      author={Lushi Pu and Weiming Zhang and Xinheng Xie and Zixuan Fu and Bingxiang He and Hengyu Zhao and Hongya Lyu and Xin Li and Jie Zhou and Yudong Wang},
      year={2026},
      eprint={2608.14221},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2608.14221}, 
}
```
