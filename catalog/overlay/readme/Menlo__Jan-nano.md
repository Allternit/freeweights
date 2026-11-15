# Jan-Nano: An Agentic Model
<sub>*Note: Jan-Nano is a non-thinking model.*</sub>

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/menloresearch/deep-research) 

<div align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/65713d70f56f9538679e5a56/wC7Xtolp7HOFIdKTOJhVt.png" width="300" alt="Jan-Nano">
</div>

Authors: [Alan Dao](https://scholar.google.com/citations?user=eGWws2UAAAAJ&hl=en), [Bach Vu Dinh](https://scholar.google.com/citations?user=7Lr6hdoAAAAJ&hl=vi)

## Overview

Jan-Nano is a compact 4-billion parameter language model specifically designed and trained for deep research tasks. This model has been optimized to work seamlessly with Model Context Protocol (MCP) servers, enabling efficient integration with various research tools and data sources.

## Evaluation
Jan-Nano has been evaluated on the SimpleQA benchmark using our MCP-based benchmark methodology, demonstrating strong performance for its model size:

![image/png](https://cdn-uploads.huggingface.co/production/uploads/65713d70f56f9538679e5a56/sdRfF9FX5ApPow9gZ31No.png)

The evaluation was conducted using our MCP-based benchmark approach, which assesses the model's performance on SimpleQA tasks while leveraging its native MCP server integration capabilities. This methodology better reflects Jan-Nano's real-world performance as a tool-augmented research model, validating both its factual accuracy and its effectiveness in MCP-enabled environments.

## How to Run Locally

![Jan-Nano Demo](replay.gif)

Jan-Nano is currently supported by Jan, an open-source ChatGPT alternative that runs entirely on your computer. Jan provides a user-friendly interface for running local AI models with full privacy and control.

For non-jan app or tutorials there are guidance inside community section, please check those out! [Discussion](https://huggingface.co/Menlo/Jan-nano/discussions)

### VLLM
Here is an example command you can use to run vllm with Jan-nano

```
vllm serve Menlo/Jan-nano --host 0.0.0.0 --port 1234 --enable-auto-tool-choice --tool-call-parser hermes --chat-template ./qwen3_nonthinking.jinja
```

Chat-template is already included in tokenizer so chat-template is optional, but in case it has issue you can download the template here [Non-think chat template](https://qwen.readthedocs.io/en/latest/_downloads/c101120b5bebcc2f12ec504fc93a965e/qwen3_nonthinking.jinja)

### Recommended Sampling Parameters

- Temperature: 0.7
- Top-p: 0.8
- Top-k: 20
- Min-p: 0
- 
## 📄 Citation

```bibtex
@misc{dao2025jannanotechnicalreport,
      title={Jan-nano Technical Report}, 
      author={Alan Dao and Dinh Bach Vu},
      year={2025},
      eprint={2506.22760},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2506.22760}, 
}
```

### Documentation
[Setup, Usage & FAQ](https://menloresearch.github.io/deep-research/)