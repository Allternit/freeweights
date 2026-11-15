# chatbench-mistral-7b

## Overview

ChatBench Simulators are fine-tuned user simulators designed to enable automated, realistic evaluation of large language models (LLMs) through simulated user–AI conversations.

Instead of recruiting human participants for every evaluation, you can use this simulator (`chatbench-mistral-7b`) to act as a proxy user. By providing a multiple-choice question (full stem plus answer options) via CLI or Python API, the simulator generates natural user turns—asking clarifications, signaling understanding, or indicating errors—until the simulated user “accepts” an answer.

The resulting conversations can be used to compute task success rate, coherence, user satisfaction, error recovery, and latency metrics, allowing researchers and practitioners to move beyond static benchmarks and evaluate models under interactive, user-in-the-loop conditions.

<p align="center">
        <a href="https://github.com/microsoft/ChatBench">GitHub</a>&nbsp&nbsp | &nbsp&nbsp <a href="https://arxiv.org/pdf/2504.07114">Paper</a> 
</p>


## Model Details

### Model Description

- **Model type**: Causal LM (user simulator, LoRA adapter on Mistral-7B)
- **Base model**: mistralai/Mistral-7B-v0.1
- **Fine-tuned on**: microsoft/ChatBench (≈12K multi-turn QA dialogs)
- **Languages**: English
- **License**: inherited from Mistral-7B (apache-2.0)
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
- **Adapter**: LoRA (r=8, α=32, dropout=0.05 on q_proj,v_proj)
- **Quantization**: 8-bit weights with CPU offload
- **Precision:** bf16 (trained on 4× RTX A6000 GPUs)
- **Quantization:** 8-bit CPU offload for inference
- **Batch size:** 1 per GPU
- **Epochs:** 2
- **LR:** 5e−5


## Intended Uses

#### Direct Use

- Automated user simulation for interactive benchmarking of LLMs.

- Research reproduction of the ACL’25 paper results.

- Lightweight prototyping of evaluation pipelines with a mid-size simulator.

#### Out-of-Scope

- Deployment in sensitive domains (healthcare, legal, financial) without human oversight.

- Creative writing or open-ended dialog beyond structured multiple-choice QA.

- Very long-context tasks beyond the 2048-token limit.

## Bias, Risks, and Limitations

- **Bias**:Inherits biases from Mistral-7B pretraining and ChatBench data.

- **Factual reliability**: May hallucinate or produce unrealistic user behaviors outside the training domain.

- **Coverage**: Optimized for structured multiple-choice QA; not suitable for unconstrained dialogue.

- **Adapter trade-offs**: LoRA adapters may underfit compared to full fine-tunes; perplexity gains are smaller relative to other simulators.

## How to Get Started

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# Load base Mistral-7B with 8-bit quantization
base = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-v0.1",
    load_in_8bit=True,
    device_map="auto"
)

# Load ChatBench LoRA adapter
model = PeftModel.from_pretrained(base, "microsoft/chatbench-mistral-7b")

tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-v0.1")
tokenizer.pad_token = tokenizer.eos_token

inputs = tokenizer(
    "[SYSTEM] You are a user.\n\n[USER] What is 2+2?\n\n[USER] ",
    return_tensors="pt"
).to("cuda")

outputs = model.generate(**inputs, max_new_tokens=64)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))

```
## Evaluation

### Perplexity

We report perplexity (PPL) on held-out ChatBench data, comparing baseline `Mistral-7B` vs. fine-tuned `chatbench-mistral-7b`. 

_A lower PPL means the fine-tuned model is closer (more confident) in the human-like reply it was trained on._

| **Model** | **Perplexity** 
| :----------------------- | :------------ | 
| Mistral-7B (baseline) | 3.62
| **chatbench-mistral-7b** | **1.8** |

### Interactive Evaluation (ACL’25 Study)

- **Correlation with Human User–AI Accuracy**: +20 point improvement over unfine-tuned baselines.

- **Task Success Accuracy**: Within ±5 points of real user–AI results across five MMLU subsets.

- **Ablations**: Removing persona-conditioning or chain-of-thought prompts reduced coherence scores by ~10 points.

Full details are available in Section 6 of the [paper](https://arxiv.org/pdf/2504.07114).

## Technical Specifications

### Compute Infrastructure

- **Hardware**: 4× NVIDIA RTX A6000 GPUs (48GB VRAM each), 128-core x86_64 CPU
- **Software**: Ubuntu 22.04, CUDA 12.4, PyTorch + Hugging Face Transformers + PEFT

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

