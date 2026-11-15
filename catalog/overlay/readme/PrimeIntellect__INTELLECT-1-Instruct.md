# INTELLECT-1

## **Model Overview**
**INTELLECT-1** is the first collaboratively trained 10 billion parameter language model trained from scratch on 1 trillion tokens of English text and code.

![Intellect 1 training visual](intellect-1-map.png)

This is an instruct model. The base model associated with it is [INTELLECT-1](https://huggingface.co/PrimeIntellect/INTELLECT-1).


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
model = AutoModelForCausalLM.from_pretrained("PrimeIntellect/INTELLECT-1-Instruct")
tokenizer = AutoTokenizer.from_pretrained("PrimeIntellect/INTELLECT-1-Instruct")

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



## Post-training

The post-training has been handled by [arcee](https://huggingface.co/arcee-ai)

After completing the globally distributed pretraining phase, we applied several post-training techniques to enhance INTELLECT-1's capabilities and task-specific performance. Our post-training methodology consisted of three main phases.

First, we conducted an extensive series of 16 Supervised Fine-Tuning (SFT) trainings, with individual runs ranging from 1 to 3.3 billion tokens each. The most successful configuration used 2.4 billion training tokens over 3 epochs. We used MergeKit, EvolKit, and DistillKit from Arcee AI to combine the models, generate the data sets, and distill the logits, respectively. For training data, we used a diverse set of high-quality datasets:

1. **New Datasets** (released with INTELLECT-1):
   - [arcee-ai/EvolKit-75k (generated via EvolKit)](https://huggingface.co/datasets/arcee-ai/EvolKit-75K)
   - [arcee-ai/Llama-405B-Logits](https://huggingface.co/datasets/arcee-ai/LLama-405B-Logits)
   - arcee-ai/The-Tomb

2. **Instruction Following**:
   - [mlabonne/open-perfectblend-fixed](https://huggingface.co/datasets/MaziyarPanahi/open-perfectblend-fixed) (generalist capabilities)
   - [microsoft/orca-agentinstruct-1M-v1-cleaned](https://huggingface.co/datasets/mlabonne/orca-agentinstruct-1M-v1-cleaned) (Chain-of-Thought)
   - [Post-training-Data-Flywheel/AutoIF-instruct-61k-with-funcs](https://huggingface.co/datasets/Post-training-Data-Flywheel/AutoIF-instruct-61k)

3. **Domain-Specific**:
   - [Team-ACE/ToolACE](https://huggingface.co/datasets/Team-ACE/ToolACE) (function calling)
   - [Synthia coder](https://huggingface.co/datasets/MaziyarPanahi/Synthia-Coder-v1.5-I-sharegpt) (programming)
   - [ServiceNow-AI/M2Lingual](https://huggingface.co/datasets/ServiceNow-AI/M2Lingual) (multilingual)
   - [AI-MO/NuminaMath-TIR](https://huggingface.co/datasets/AI-MO/NuminaMath-TIR) (mathematics)

4. **Tulu-3 Persona Datasets**:
   - [allenai/tulu-3-sft-personas-code](https://huggingface.co/datasets/allenai/tulu-3-sft-personas-code)
   - [allenai/tulu-3-sft-personas-math](https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math)
   - [allenai/tulu-3-sft-personas-math-grade](https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math-grade)
   - [allenai/tulu-3-sft-personas-algebra](https://huggingface.co/datasets/allenai/tulu-3-sft-personas-algebra)

Second, we execute 8 distinct Direct Preference Optimization (DPO) runs with various combinations of data sets to enhance specific performance metrics and align the model with human preferences. A key advantage in our post-training process was INTELLECT-1's use of the Llama-3 tokenizer, which allowed us to utilize logits from Llama-3.1-405B to heal and maintain precision during the post-training process via DistillKit.

Finally, we performed 16 strategic merges between candidate models using MergeKit to create superior combined models that leverage the strengths of different training runs. During the post-training phase, we observed that when using a ChatML template without an explicit BOS (begin-of-sequence) token, the initial loss was approximately 15. However, when switching to the Llama 3.1 chat template, the loss for these trainings started much lower at approximately 1.1, indicating better alignment with the underlying Llama 3 tokenizer.

The combination of these post-training techniques resulted in significant improvements in various benchmarks, particularly in knowledge retrieval, grade school math, instruction following and reasoning.


**Performance on benchmarks**

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