# UltraX: Refining Pre-Training Data at Scale with Adaptive Programmatic Editing

<p align="center">
  <a href="https://huggingface.co/collections/openbmb/ultradata">
    <img src="https://raw.githubusercontent.com/OpenBMB/UltraX/main/assets/ultradata-logo.png" alt="OpenBMB UltraData" width="350"/>
  </a>
  <br/>
  <a href="https://huggingface.co/collections/openbmb/ultradata">
    <img src="https://raw.githubusercontent.com/OpenBMB/UltraX/main/assets/ultrax-logo.png" alt="UltraX Logo" width="350"/>
  </a>
</p>

<p align="center">
<a href="https://arxiv.org/abs/2607.08646">📜 Paper</a> |
<a href="https://github.com/openbmb/UltraX">💻 Code</a> |
<a href="https://huggingface.co/datasets/openbmb/UltraX-Preview">🤗 Datasets</a> |
<a href="https://huggingface.co/collections/openbmb/ultradata">📦 UltraData Collection</a>
</p>

<p align="center">
English |
<a href="https://huggingface.co/openbmb/UltraX-0.6B-Preview/blob/main/README_ZH.md">中文</a>
</p>

## 📚 Introduction

**UltraX** is a function-calling refinement framework for large-scale pre-training data. Instead of end-to-end text rewriting, UltraX trains a lightweight refinement model to predict structured editing operations — including insertion, deletion, and modification — which are then deterministically executed on the original text.

This repository provides the **UltraX refinement models**, which are trained via full-parameter SFT to predict cleaning function calls for web-crawled text:

| Model | Description |
|-------|-------------|
| **UltraX** | Default model: instruction-guided with edit-weighted sampling (main experiment) |
| **UltraX-No-Instruction** | Ablation variant: trained without system instruction |
| **UltraX-Preservation-Weighted** | Ablation variant: trained with preservation-weighted sampling (60% keep_all) |

## 📢 News

- **[2026.07.13]** UltraX codebase, refinement model, and refined datasets are now available on GitHub and Hugging Face. 🚀🚀🚀
- **[2026.07.10]** UltraX technical report is available on [arXiv](https://arxiv.org/abs/2607.08646). 🔥🔥🔥

## 💡 Highlights

- **Function-Calling Refinement:** Instead of end-to-end text rewriting, UltraX predicts structured editing operations (`keep_all`, `remove_all`, `remove_lines`, `replace_str`, `add_line`), enabling fine-grained instance-level editing with deterministic execution.
- **LAM + DCR Pipeline:** Line Alignment and Mapping (LAM) aligns original and refined text at line level, while Dynamic Context Replacement (DCR) converts character-level edits into reliable `replace_str` operations with unique context anchoring.
- **Lightweight & Efficient:** The refinement model is a standard SFT model that predicts structured function calls, significantly cheaper than end-to-end LLM rewriting while achieving superior performance.

## 🔬 Pipeline Overview

<div align="center">
  <img src="https://raw.githubusercontent.com/OpenBMB/UltraX/main/assets/ultrax_pipeline.png" width="800"/>
</div>

## 🔍 Model Details

All models are trained with the following configuration:

| Setting | Value |
|---------|-------|
| Training Framework | ms-swift with DeepSpeed ZeRO3 |
| Training Type | Full-parameter SFT |
| Max Sequence Length | 20,480 tokens |
| Learning Rate | 3e-5 (cosine decay, min lr 3e-6) |
| Warmup Ratio | 0.03 |
| Precision | bfloat16 |
| Hardware | 8x GPU |

### Model Variants

- **UltraX (Instruction-Guided, Edit-Weighted):** The default configuration. The model is trained with a system instruction that defines the editing operations and cleaning rules, using edit-weighted sampling.

- **UltraX-No-Instruction:** Trained without system instruction. Demonstrates that programmatic refinement brings clear gains even without explicit task protocol (Avg: 45.73 vs Raw 45.08), though instruction guidance further improves performance (Avg: 46.14).

- **UltraX-Preservation-Weighted:** Trained with preservation-weighted sampling where keep_all accounts for 60% of training data. Shows stronger performance on certain tasks (ARC-C, ARC-E, OBQA, SciQ), demonstrating the trade-off between editing aggressiveness and content preservation.

## 📈 Evaluation Results

Performance comparison on FineWeb (20B tokens, 1B MiniCPM, 10 benchmarks, zero-shot):

<div align="center">
  <img src="https://raw.githubusercontent.com/OpenBMB/UltraX/main/assets/results.png" width="900"/>
</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/OpenBMB/UltraX/main/assets/fineweb_token_curve.png" alt="FineWeb Token Curve" width="450"/>
  <p><i>Average downstream performance on FineWeb under different training token budgets.</i></p>
</div>

## 🔧 Function Space

The model predicts operations from the following function space:

| Function | Description |
|----------|-------------|
| `keep_all()` | Document needs no modification |
| `remove_all()` | Entire document is valueless (e.g., error pages, login walls) |
| `remove_lines(start, end)` | Remove consecutive lines from start to end (inclusive) |
| `replace_str(line, old, new)` | Replace a substring within a specific line |
| `add_line(base, sub_idx, content)` | Insert a new line near the base position |

### Input/Output Format

**Input:** Text with line number markers (`<lid:N>` prefix per line), preceded by a system instruction.

**Output:** A sequence of function calls, one per line. Example:
```
remove_lines(1, 3)
replace_str(5, 'Click here to subscribe', '')
remove_lines(12, 15)
```

## 🚀 Quick Start

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("openbmb/UltraX-0.6B-Preview")
tokenizer = AutoTokenizer.from_pretrained("openbmb/UltraX-0.6B-Preview")
```

## ❤️ Acknowledgements

- The refinement model is trained using [ms-swift](https://github.com/modelscope/ms-swift).
- UltraX builds upon insights from [ProX](https://github.com/GAIR-NLP/ProX) and RefineX.

Thanks for their awesome work! Open-source contributions make UltraX possible! 🙌

## 📖 Citation

If you find our work useful, please consider citing:

```bibtex
@misc{ultrax2026,
  title={UltraX: Refining Pre-Training Data at Scale with Adaptive Programmatic Editing},
  author={Xinlong Zhao and Dongsheng Liu and Hengyu Zhao and Zixuan Fu and Zheng Wang and Jie Cai and Jie Zhou and Qiang Ma and Xuanhe Zhou and Xu Han and Yudong Wang and Zhiyuan Liu},
  year={2026},
  eprint={2607.08646},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
}
```

## 📜 License

This project is licensed under the [Apache 2.0](https://huggingface.co/openbmb/UltraX-0.6B-Preview/blob/main/LICENSE) license.
