<div align="center">
<img src="figures/nbg.png" width="220" alt="Nanbeige Logo">
</div>

# <span id="Introduction">1. Introduction</span>

In Nanbeige4.3, we take a foundational step toward pushing the boundaries of lightweight agents. Our strategy centers on building a high-capacity teacher agent first, which will subsequently anchor the distillation of advanced agentic capabilities into smaller models.

To this end, we introduce Nanbeige4.3-33B, designed as the flagship teacher model for the Nanbeige4.3 series. Delivering state-of-the-art agentic performance among open models in the ~30B parameter class, Nanbeige4.3-33B excels at complex coding and professional cowork tasks. It not only offers a powerful, cost-effective option for immediate real-world deployment, but also lays the necessary foundation to power our upcoming small model distillation pipeline (e.g., for Nanbeige4.3-3B).


<table>
  <thead>
    <tr>
      <th rowspan="2">Model</th>
      <th colspan="3">STEM Reasoning</th>
      <th colspan="3">Mathematics &amp; Coding</th>
      <th colspan="2">General Knowledge</th>
    </tr>
    <tr>
      <th>MMLU-Pro</th><th>GPQA</th><th>SuperGPQA</th>
      <th>GSM8K</th><th>Math</th><th>MBPP</th>
      <th>MMLU</th><th>CMMLU</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Gemma4-31B-Base</td><td>59.3</td><td>41.5</td><td>33.8</td><td>88.9</td><td>43.6</td><td>72.5</td><td>84.2</td><td>76.9</td>
    </tr>
    <tr>
      <td><strong>Nanbeige4.3-33B-Base</strong></td><td><strong>66.9</strong></td><td><strong>62.0</strong></td><td><strong>45.6</strong></td><td><strong>92.9</strong></td><td><strong>57.3</strong></td><td><strong>74.6</strong></td><td><strong>85.5</strong></td><td><strong>86.8</strong></td>
    </tr>
  </tbody>
</table>

This repository contains **Nanbeige4.3-33B-Base**, the base model of Nanbeige4.3-33B. Compared with Gemma4-31B-Base, which is the only frontier open-source base model released at the 30B-parameter scale in the past six months, Nanbeige4.3-33B-Base consistently wins across a broad range of benchmarks. For usecase, Nanbeige4.3-33B-Base provides a strong foundation for post-training, whether to develop general-purpose or domain-specialized agents.
# <span id="Quickstart">2. Quickstart</span>

## Transformers

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained(
  'Nanbeige/Nanbeige4.3-33B-Base',
  use_fast=False,
  trust_remote_code=True
)
model = AutoModelForCausalLM.from_pretrained(
  'Nanbeige/Nanbeige4.3-33B-Base',
  torch_dtype='auto',
  device_map='auto',
  trust_remote_code=True
)

prompt = "The capital of China is"
input_ids = tokenizer(prompt, return_tensors='pt').input_ids
output_ids = model.generate(input_ids.to(model.device))
resp = tokenizer.decode(output_ids[0][len(input_ids[0]):], skip_special_tokens=True)
print(resp)

```

## SGLang

```bash
MODEL_PATH=/path/to/your/Nanbeige4.3-33B-Base
python -m sglang.launch_server \
  --model-path ${MODEL_PATH} \
  --host 0.0.0.0 \
  --port 8000 \
  --tp-size 4 \
  --mem-fraction-static 0.8
```

## vLLM

```bash
MODEL_PATH=/path/to/your/Nanbeige4.3-33B-Base
vllm serve ${MODEL_PATH} \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 4 \
  --gpu-memory-utilization 0.8
```

# <span id="Contact">3. Contact</span>

If you have any questions, please open an issue in this repository or contact us at nanbeige@kanzhun.com.

We also welcome collaborations to build domain-specific and industry-focused agents, including joint work on data and training.


# <span id="Citation">4. Citation</span>

If you find our model useful or would like to use it in your own work, please cite this Hugging Face project:

```bibtex
@misc{nanbeige43base2026,
  title        = {Nanbeige4.3-33B-Base},
  author       = {Nanbeige Team},
  year         = {2026},
  publisher    = {Hugging Face},
  howpublished = {\url{https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base}}
}
```
