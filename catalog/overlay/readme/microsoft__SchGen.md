# SchGen

[![License](https://img.shields.io/badge/License-MIT-green.svg)]()
[![Model](https://img.shields.io/badge/Model-GPT--OSS--20B-blue)]()

**SchGen** is a large language model for **PCB schematic generation from natural-language requests**.

The model is supervised fine-tuned from **GPT-OSS-20B** using a custom dataset of approximately **8K paired user requests and schematic-generation code samples**.  
SchGen generates executable Python code that can be rendered into **KiCad schematic designs** using customized schematic APIs.

➡️ **Base Model:** GPT-OSS-20B  
➡️ **License:** MIT  
➡️ **Framework:** Transformers  
➡️ **Context Length:** 13,312 tokens 

To cite this model and corresponding paper, please use the following bib item:

```
@misc{luo2026schgenpcbschematicgeneration,
      title={SchGen: PCB Schematic Generation with Semantic-Grounded Code Representations}, 
      author={Qinpei Luo and Ruichun Ma and Xinyu Zhang and Lili Qiu},
      year={2026},
      eprint={2605.30345},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2605.30345}, 
}
```

---

## Overview

Printed circuit board (PCB) design is a critical but expertise-intensive process in embedded systems, IoT, robotics, and AI hardware.

SchGen explores whether large language models can assist hardware design by generating schematic construction code directly from natural-language descriptions.

The input is a user request describing a circuit design requirement, and the output is executable Python code that can generate a KiCad schematic using custom APIs.

Example input:

```text
I want a 1.8V regulated supply from VIN using an AP2112K LDO,
with a test point on the 1.8V rail and a solder-jumper-selectable LED indicator.
```

---

## 🔥 Key Features

- 🔌 **Natural Language to Schematic Code**  
  Generates executable Python schematic-generation code directly from user requests.

- 🧠 **KiCad-Oriented Design Flow**  
  Designed around custom Code-to-Schematic APIs for KiCad schematic construction.

- 📐 **Structured Hardware Generation**  
  Produces editable and programmatic schematic representations instead of images.

- 🛠️ **Research-Focused PCB Generation**  
  Intended for experimentation, benchmarking, and AI-assisted hardware prototyping.

---

## Model Details

| Item | Value |
|---|---|
| Base Model | GPT-OSS-20B |
| Parameters | 20B |
| Architecture | Supervised Fine-Tuned LLM |
| Input | Natural-language design requests |
| Output | Python schematic-generation code |
| Context Length | 13,312 |
| Training Hardware | 1× NVIDIA A100 |
| Training Time | ~21 hours |

---

## Usage

The recommended workflow is:

1. Provide a natural-language circuit request
2. Generate Python schematic-construction code
3. Execute the code to render a KiCad schematic
4. Verify outputs using ERC/DRC tools

The model is designed for integration into:

- EDA automation pipelines
- Hardware engineering copilots
- Synthetic schematic generation systems
- Research workflows for AI-assisted PCB design

---

## Evaluation

SchGen was evaluated using several schematic-generation metrics:

- **Valid Circuits**  
  Measures whether generated code executes successfully and produces valid schematics.

- **Spatial Violation**  
  Measures overlaps among symbols, labels, and wires.

- **Netlist Accuracy**  
  Measures connectivity correctness against ground-truth netlists.

SchGen outperforms several frontier LLM baselines on schematic generation tasks when all models are provided with the same schematic-generation APIs.

---

## Limitations

SchGen is an early-stage research system and currently focuses on:

- small and medium-scale schematic modules
- hobbyist and open-source hardware designs
- English-language requests

The model may underperform on:

- RF or high-frequency circuits
- industrial or enterprise hardware
- large multi-board systems
- safety-critical applications

Generated outputs should always undergo:

- Electrical Rule Checking (ERC)
- Design Rule Checking (DRC)
- human engineering review

SchGen is intended as an assistive tool rather than a fully autonomous hardware engineer.

---

## Technical Requirements

The model generates executable Python code and requires:

- Python environment
- KiCad installation
- Custom schematic-generation APIs

Inference was validated on:

- NVIDIA A100 GPUs
- 4-bit quantized configurations

---

## Dataset

SchGen was trained on a custom dataset of approximately 8K pairs of:

- natural-language hardware requests
- Python schematic-generation code

The dataset was synthesized through:

1. GPT-generated draft schematics
2. Human correction and annotation
3. LLM-generated user requests

The dataset is available at `https://huggingface.co/datasets/microsoft/SchGen_dataset`

---

## License

This project is licensed under the MIT License.

---

## Contact

This project was conducted by members of Microsoft Research.

For questions, feedback, or collaboration inquiries:

- ruichunma@microsoft.com

If issues or problematic behavior are identified, the repository may be updated with appropriate mitigations.