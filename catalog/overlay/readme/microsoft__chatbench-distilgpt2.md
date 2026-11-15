# chatbench-distilgpt2

## Overview

ChatBench Simulators are a set of fine-tuned user simulators designed to enable automated, realistic evaluation of large language models (LLMs) through simulated user–AI conversations.

Instead of recruiting human participants for every evaluation, you can use this simulator (`chatbench-distilgpt2`) to act as a proxy user. By providing a multiple-choice question (full stem plus answer options) via a simple CLI or Python API, the simulator generates natural user turns—asking clarifications, signaling understanding, or indicating errors—until the simulated user “accepts” an answer.

The resulting conversations can be used to compute task success rate, coherence, user satisfaction, error recovery, and latency metrics, allowing researchers and practitioners to move beyond static benchmarks and evaluate models under interactive, user-in-the-loop conditions.

<p align="center">
        <a href="https://github.com/microsoft/ChatBench">GitHub</a>&nbsp&nbsp | &nbsp&nbsp <a href="https://arxiv.org/pdf/2504.07114">Paper</a> 
</p>

## Model Details

### Model Description

- **Model type**: Causal LM (user simulator)
- **Base model**: distilgpt2 (82M parameters)
- **Fine-tuned on**: microsoft/ChatBench (≈12K multi-turn QA dialogs)
- **Languages**: English
- **License**: Inherits from DistilGPT2 (OpenAI license)
- **Developed by**: Microsoft
- **Contacts**: kevingao@microsoft.com, serinac@berkeley.edu, jmh@microsoft.com

### Training Setup:

The model was fine-tuned end-to-end on ChatBench data using the same simulator recipe described in Section 5 of the paper. Each example is formatted as:

```text
[SYSTEM] <instruction>

<previous turns>

[USER] 
→ model generates: <assistant reply> [END]
```

- **Optimizer:** AdamW
- **Precision:** bf16 (on 4× RTX A6000 GPUs)
- **Quantization:** 8-bit CPU offload for inference
- **Batch size:** 4 per GPU
- **Epochs:** 2
- **LR:** 5e−5

## Intended Uses

#### Direct Use

- Automated user simulation for interactive benchmarking of LLMs.

- Research reproduction of the ACL’25 paper results.

- Educational multiple-choice QA practice under simulated dialog conditions.

#### Out-of-Scope

- Deployment in sensitive domains (healthcare, legal, financial) without expert oversight.

- Open-ended creative generation (storytelling, brainstorming).

- Long-context tasks exceeding DistilGPT2’s 1024-token window.

## Bias, Risks, and Limitations

- **Bias**: Inherits biases from DistilGPT2 pretraining and the ChatBench dataset.

- **Factual reliability**: May hallucinate or produce unrealistic user behaviors outside structured QA contexts.

- **Coverage**: Optimized for MMLU-style multiple-choice QA; not suitable for unconstrained dialogues.

- **Context Limitations**: Restricted to ~1024 tokens.

## How to Get Started

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("microsoft/chatbench-distilgpt2")
tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
tokenizer.pad_token = tokenizer.eos_token

inputs = tokenizer(
    "[SYSTEM] You are an assistant.\n\n[USER] What is 2+2?\n\n[USER] ",
    return_tensors="pt",
)
outputs = model.generate(**inputs, max_new_tokens=20)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

## Evaluation

### Perplexity

We report perplexity (PPL) on held-out ChatBench data, comparing baseline `DistilGPT2` vs. fine-tuned `chatbench-distilgpt2`. 

_A lower PPL means the fine-tuned model is closer (more confident) in the human-like reply it was trained on._

| **Model** | **Perplexity** 
| :----------------------- | :------------ | 
| DistilGPT2 (baseline) | 13.63 
| **chatbench-distilgpt2** | **3.38** |

### Interactive Evaluation (ACL’25 Study)

- **Correlation with Human User–AI Accuracy**: +20 point improvement over unfine-tuned baselines.

- **Task Success Accuracy**: Within ±5 points of real user–AI results across five MMLU subsets.

- **Ablations**: Removing persona-conditioning or chain-of-thought prompts reduced coherence scores by ~10 points.

Full details are available in Section 6 of the [paper](https://arxiv.org/pdf/2504.07114).

## Technical Specifications

### Compute Infrastructure

- **Hardware**: 4× NVIDIA RTX A6000 GPUs (48GB VRAM each), 128-core x86_64 CPU
- **Software**: Ubuntu 22.04, CUDA 12.4, PyTorch + Hugging Face Transformers

## Citation

https://arxiv.org/abs/2504.07114


#### Subjects:	Computation and Language (cs.CL); Artificial Intelligence (cs.AI); Computers and Society (cs.CY); Human-Computer Interaction (cs.HC)
#### Cite as:	
- arXiv:2504.07114 [cs.CL] (or arXiv:2504.07114v1 [cs.CL] for this version)
- https://doi.org/10.48550/arXiv.2504.07114


**BibTeX:**

@misc{chang2025chatbenchstaticbenchmarkshumanai,
      title={ChatBench: From Static Benchmarks to Human-AI Evaluation}, 
      author={Serina Chang and Ashton Anderson and Jake M. Hofman},
      year={2025},
      eprint={2504.07114},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2504.07114}, 
}

**APA:**

Chang, S., Anderson, A., & Hofman, J. M. (2025). ChatBench: From Static Benchmarks to Human-AI Evaluation. arXiv [Cs.CL]. Retrieved from http://arxiv.org/abs/2504.07114 

