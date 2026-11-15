# INTELLECT-1

## **Model Overview**
**INTELLECT-1** is the first collaboratively trained 10 billion parameter language model trained from scratch on 1 trillion tokens of English text and code.

![Intellect 1 training visual](intellect-1-map.png)

This is a base model. Please use the [INTELLECT-1-Instruct](https://huggingface.co/PrimeIntellect/INTELLECT-1-Instruct) for chat use case.

**INTELLECT-1** was trained on up to 14 concurrent nodes distributed across 3 continents, with contributions from 30 independent community contributors providing compute.
The training code utilizes the [prime framework](https://github.com/PrimeIntellect-ai/prime), a scalable distributed training framework designed for fault-tolerant, dynamically scaling, high-perfomance training on unreliable, globally distributed workers.
The key abstraction that allows dynamic scaling is the `ElasticDeviceMesh` which manages dynamic global process groups for fault-tolerant communication across the internet and local process groups for communication within a node.
The model was trained using the [DiLoCo](https://arxiv.org/abs/2311.08105) algorithms with 100 inner steps. The global all-reduce was done with custom int8 all-reduce kernels to reduce the communication payload required, greatly reducing the communication overhead by a factor 400x.

For more detailed technical insights, please refer to our [technical paper](https://github.com/PrimeIntellect-ai/prime).

**Note: You must add a BOS token at the beginning of each sample. Performance may be impacted otherwise.**

## Usage
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

torch.set_default_device("cuda")
model = AutoModelForCausalLM.from_pretrained("PrimeIntellect/INTELLECT-1")
tokenizer = AutoTokenizer.from_pretrained("PrimeIntellect/INTELLECT-1")

input_text = "What is the Metamorphosis of Prime Intellect about?"
input_ids = tokenizer.encode(input_text, return_tensors="pt")
output_ids = model.generate(input_ids, max_length=50, num_return_sequences=1)
output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)

print(output_text)
```

### Example text generation pipeline
```python
import torch
from transformers import pipeline
torch.set_default_device("cuda")

pipe = pipeline("text-generation", model="PrimeIntellect/INTELLECT-1")
print(pipe("What is prime intellect ?"))
```

## **Model Details**
- **Compute Contributors**: Prime Intellect, Arcee AI, kotaro, skre_0, marlo, rodeo, Herb, Olas, superchillen, Hugging Face, mev_pete, 0xfr_, dj, primeprimeint1234, Marco Giglio, realtek, Hyperbolic, hecataeus, NWO, Virtual Machine, droll, SemiAnalysis, _waiting__, toptickcrypto, sto, Johannes, washout_segment_0b, klee
- **Release Date**: 29 Nov 2024
- **Model License**: Apache 2.0

## **Technical Specifications**
| **Parameter**       | **Value**              |
|----------------------|------------------------|
| Parameter Size       | 10B |
| Number of Layers     | 42 |
| Number of Attention Heads | 32 |
| Hidden Size          | 4096 |
| Context Length       | 8192 |
| Vocabulary Size      | 128256 |

**Training Details**:
- **Dataset**: 55% fineweb-edu, 10% fineweb, 20% Stack V1, 10% dclm-baseline, 5% open-web-math
- **Tokens**: 1 Trillion
- **Optimizer**: Diloco/LocalSGD - Inner Optimizer: AdamW, Outer Optmizer: Nesterov SGD


**Performance on benchmarks**


Base Models:
| Model | Size | Tokens | MMLU | GPQA | GSM8K | ARC-C | Hellaswag |
|---|---|---|---|---|---|---|---|
| INTELLECT | 10B | 1T | 37.5 | 26.12 | 8.1 | 52.13 | 72.26 |
| MPT-7B | 7B | 1T | 26.8 | 25.67 | 8.3 | 46.67 | 77.41 |
| Falcon-7B | 7B | 1.5T | 26.2 | 23.66 | 4.9 | 47.61 | 78.23 |
| Pythia-12B | 12B | 300B | 26.5 | 24.33 | 4.09 | 40.61 | 68.83 |
| LLM360-Amber | 7B | 1.3T | 24.5 | 27.01 | 4.32 | 42.75 | 74.08 |
| LLaMA-7B | 7B | 1T | 35.1 | 23.21 | 9.7 | 50.43 | 78.19 |
| LLaMA-13B | 13B | 1T | 46.9 | 26.34 | 17.3 | 56.14 | 81.05 |
| LLaMA2-7B | 7B | 2T | 45.3 | 25.89 | 13.5 | 54.10 | 78.64 |
| LLaMA2-13B | 13B | 2T | 54.8 | 25.67 | 24.3 | 59.81 | 82.58 |

[Instruction-Tuned Models](https://huggingface.co/PrimeIntellect/INTELLECT-1-Instruct): 
| Model | Size | Tokens | MMLU | GPQA | GSM8K | ARC-C | Hellaswag |
|---|---|---|---|---|---|---|---|
| INTELLECT-Instruct | 10B | 1T | 49.89 | 28.32 | 38.58 | 54.52 | 71.42 |
| MPT-7B-Chat | 7B | 1T | 36.29 | 26.79 | 8.26 | 51.02 | 75.88 |
| Falcon-7B-Instruct | 7B | 1.5T | 25.21 | 26.34 | 4.93 | 45.82 | 70.61 |
| LLM360-AmberChat | 7B | 1.4T | 36.02 | 27.23 | 6.14 | 43.94 | 73.94 |
| LLaMA2-7B-Chat | 7B | 2T | 47.20 | 28.57 | 23.96 | 53.33 | 78.69 |
| LLaMA2-13B-Chat | 13B | 2T | 53.51 | 28.35 | 37.15 | 59.73 | 82.47 |

## **Citations**
If you use this model in your research, please cite it as follows:
```
@article{jaghouar2024intellect,
  title={INTELLECT-1 Technical Report.},
  author={Jaghouar, Sami and Ong, Jack Min and Basra, Manveer and Obeid, Fares and Straube, Jannik and Keiblinger, Michael and Bakouch, Elie and Atkins, Lucas and Panahi, Maziyar and Goddard, Charles and Ryabinin, Max and Hagemann, Johannes},
  journal={arXiv preprint},
  year={2024}
}
```