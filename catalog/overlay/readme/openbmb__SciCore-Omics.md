<div align="center">

# 🧬 SciCore-Omics

### A tri-modal foundation model unifying histology, spatial transcriptomics, and biological language

[![Model](https://img.shields.io/badge/🤗%20Model-openbmb%2FSciCore--Omics-yellow)](https://huggingface.co/openbmb/SciCore-Omics)
[![Code](https://img.shields.io/badge/GitHub-OpenBMB%2FScicore--Omics-black?logo=github)](https://github.com/OpenBMB/Scicore-Omics)
[![Demo](https://img.shields.io/badge/🤗%20Space-Demo-blue)](https://huggingface.co/spaces/Alkaidxxy/SciCore-Omics)
[![License](https://img.shields.io/badge/License-Apache--2.0-green)](https://github.com/OpenBMB/Scicore-Omics/blob/main/LICENSE)

</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/OpenBMB/Scicore-Omics/main/figs/fig1.png" width="95%" alt="SciCore-Omics overview">
</p>

---

## 🔍 Overview

**SciCore-Omics** is a tri-modal biomedical foundation model that connects **histology images**, **spatial transcriptomic profiles**, and **biological language** for spatial biology and pathology-related reasoning.

The model introduces a gene-aware branch based on **NicheFormer + Gene Q-Former + Gene Projector**, enabling transcriptomic information to be aligned with the language-model token space.

SciCore-Omics supports:

* 🖼️ image-only reasoning;
* 🧬 gene-only reasoning;
* 🖼️🧬 joint image-gene reasoning;
* 💬 natural-language biomedical interpretation.

---

## ✨ Highlights

* Tri-modal modeling of histology, spatial transcriptomics, and language
* Gene-aware transcriptomic encoding with NicheFormer
* Unified image-gene-text reasoning in the language-model space
* Designed for spatial biology, pathology reasoning, and biomedical interpretation
* Open-source model weights, code, and demo

---

## 🚀 Quick Start

This Hugging Face repository hosts the model weights.

For full inference and training code, please refer to the GitHub repository:

```bash
git clone https://github.com/OpenBMB/Scicore-Omics.git
cd Scicore-Omics
```

Download the model weights:

```bash
huggingface-cli download openbmb/SciCore-Omics \
  --local-dir ./weights/SciCore-Omics
```

Minimal loading example:

```python
import torch
from transformers import AutoModel, AutoTokenizer, AutoProcessor

model_path = "openbmb/SciCore-Omics"

processor = AutoProcessor.from_pretrained(
    model_path,
    trust_remote_code=True
)

tokenizer = AutoTokenizer.from_pretrained(
    model_path,
    trust_remote_code=True
)

model = AutoModel.from_pretrained(
    model_path,
    trust_remote_code=True,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

model.eval()
```

For complete examples, please see:

https://github.com/OpenBMB/Scicore-Omics/tree/main/eval

---

## 📦 Resources

| Resource      | Link                                                  |
| ------------- | ----------------------------------------------------- |
| Model weights | https://huggingface.co/openbmb/SciCore-Omics          |
| GitHub code   | https://github.com/OpenBMB/Scicore-Omics              |
| Online demo   | https://huggingface.co/spaces/Alkaidxxy/SciCore-Omics |

---

## ⚠️ Limitations

SciCore-Omics is released for research use only.

It may generate inaccurate or incomplete biomedical interpretations and should not be used as a standalone clinical diagnostic or treatment recommendation system.

---

## 📚 Citation

```bibtex
@misc{xiao2026scicoreomics,
  title  = {SciCore-Omics: a tri-modal foundation model unifying histology, spatial transcriptomics and language for spatial biology},
  author = {Xiao, Xinyu and Li, Yunfei and Zeng, Zheni and others},
  year   = {2026},
  note   = {Manuscript in preparation}
}
```

---

## 📄 License

This project is released under the Apache-2.0 License.