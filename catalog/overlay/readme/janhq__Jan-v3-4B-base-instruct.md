# Jan-v3-4B-base-instruct: a 4B baseline model for fine-tuning

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/janhq/jan) 
[![License](https://img.shields.io/badge/License-Apache%202.0-yellow)](https://opensource.org/licenses/Apache-2.0)
[![Jan App](https://img.shields.io/badge/Powered%20by-Jan%20App-purple?style=flat&logo=android)](https://jan.ai/) 

![image](https://cdn-uploads.huggingface.co/production/uploads/655e3b59d5c0d3db5359ca3c/A65FII_r3rAi9wZtK5P_v.png)

## Overview

**Jan-v3-4B-base-instruct** is a 4B-parameter model obtained via post-training distillation from a larger teacher, transferring capabilities while preserving general-purpose performance on standard benchmarks. The result is a compact, ownable base that is straightforward to fine-tune, broadly applicable and minimizing the usual capacity–capability trade-offs. 

Building on this base, **Jan-Code**, a code-tuned variant, **will be released soon.**

## Model Overview

> **Note:** Jan-v3-4B-base-instruct inherits its core architecture from **Qwen/Qwen3-4B-Instruct-2507**.

- Number of Parameters: 4.0B  
- Number of Parameters (Non-Embedding): 3.6B
- Number of Layers: 36
- Number of Attention Heads (GQA): 32 for Q and 8 for KV
- Context Length: **262,144 natively**.

**Intended Use**

* A better small base for downstream work: improved instruction following out of the box, strong starting point for fine-tuning, and effective lightweight coding assistance.

## Performance

![image](https://cdn-uploads.huggingface.co/production/uploads/655e3b59d5c0d3db5359ca3c/IGuQdKZ0_IGIwL0Wkcasi.png)

## Quick Start

### Integration with Jan Apps

Jan-v3 demo is hosted on **Jan Browser** at **[chat.jan.ai](https://chat.jan.ai/)**. It is also optimized for direct integration with [Jan Desktop](https://jan.ai/), select the model in the app to start using it.


### Local Deployment

**Using vLLM:**
```bash
vllm serve janhq/Jan-v3-4B-base-instruct \
    --host 0.0.0.0 \
    --port 1234 \
    --enable-auto-tool-choice \
    --tool-call-parser hermes 
    
```

**Using llama.cpp:**
```bash
llama-server --model Jan-v3-4B-base-instruct-Q8_0.gguf \
    --host 0.0.0.0 \
    --port 1234 \
    --jinja \
    --no-context-shift
```

### Recommended Parameters
For optimal performance in agentic and general tasks, we recommend the following inference parameters:
```yaml
temperature: 0.7
top_p: 0.8
top_k: 20
```

## 🤝 Community & Support

- **Discussions**: [Hugging Face Community](https://huggingface.co/janhq/Jan-v2-VL-8B/discussions) 
- **Jan App**: Learn more about the Jan App at [jan.ai](https://jan.ai/)

## 📄 Citation
```bibtex
Updated Soon
```
