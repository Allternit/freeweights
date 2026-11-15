# HybridAgent-14B-Agentic

- Paper: [Hybrid Reasoning Agents](https://arxiv.org/pdf/2610.18861)
- Code: https://github.com/togethercomputer/HybridAgent
- 8B HybridAgent: [togethercomputer/HybridAgent-8B-Agentic](https://huggingface.co/togethercomputer/HybridAgent-8B-Agentic)

## Overview

HybridAgent is an LLM agent that dynamically navigates between latent reasoning and text-based interaction within a single generation process. It thinks in continuous latent space through a lightweight HybridLink and acts through text, calling a Python interpreter and a web search tool across multiple turns over one shared working memory. Its latent thoughts stay directly interpretable: every latent step can be read out as pseudo-text.

This checkpoint is the 14B HybridAgent for **agentic reasoning tasks**, built on Qwen3-14B-Base with HybridSFT followed by HybridRL.

## Files

Standard Transformers files for the backbone (`model.safetensors`, `config.json`, `generation_config.json`, the tokenizer with the two anchor tokens `<latent>` and `</latent>`) plus the HybridLink weights `adapter.pt` with `adapter_config.json`. Loading the backbone with `transformers` alone gives a text-only model; hybrid generation with latent mode and tools needs the HybridAgent code.

## Usage

```bash
git clone https://github.com/togethercomputer/HybridAgent.git && cd HybridAgent
pip install -r requirements.txt && pip install -e .
cp .env.example .env   # TAVILY_API_KEY for the search tool

# batch inference on a JSONL file of questions
python -m hybrid_inference.run_batch --model togethercomputer/HybridAgent-14B-Agentic \
    --input examples/questions.jsonl --output outputs/results.jsonl

# inspect the latent thoughts of a trajectory as pseudo-text (HTML report)
python -m interpretable_latent_mode --model togethercomputer/HybridAgent-14B-Agentic \
    --question "How many trailing zeros does 100! have?" --output report.html
```

```python
import torch
from hybrid_agent import HybridGenerationEngine, SYSTEM_PROMPT, build_tool_executor, load_hybrid_agent

model, tokenizer = load_hybrid_agent("togethercomputer/HybridAgent-14B-Agentic", device="cuda")
engine = HybridGenerationEngine(model, tokenizer, torch.device("cuda"), build_tool_executor(), SYSTEM_PROMPT,
                                "How many trailing zeros does 100! have?", batch_size=1, record_latent_readout=True)
engine.run(torch.Generator(device="cuda").manual_seed(0))
print(engine.row_result(engine.rows[0])["output_rendered"])
```

## Citation

```bibtex
@misc{zou2026hybridagent,
      title={Hybrid Reasoning Agents},
      author={Jiaru Zou and Yunzhe Qi and Sirui Chen and Federico Bianchi and Shang Zhu and Pan Lu and Jingrui He and James Zou},
      year={2026},
      eprint={2610.18861},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2610.18861},
}
```

