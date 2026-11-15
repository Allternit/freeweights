# OpenCodeReasoning-Nemotron-32B-IOI Overview

## Description: <br>
OpenCodeReasoning-Nemotron-32B-IOI is a large language model (LLM) which is a derivative of Qwen2.5-32B-Instruct (AKA the reference model). It is a reasoning model that is post-trained for reasoning for code generation. The model supports a context length of 32K tokens. <br>

This model is ready for commercial/non-commercial use. <br>

![Evaluation Results](./results.png)


## Results from [OpenCodeReasoning](https://arxiv.org/abs/2504.01943)

Below results are the average of **64 evaluations** on each benchmark.

| Model                     | Dataset Size Python | C++    | LiveCodeBench (pass@1) | CodeContests (pass@1) | IOI (Total Score) |
|---------------------------|---------------------|--------|------------------------|-----------------------|-------------------|
| OlympicCoder-7B           | 0                   | 100K   | 40.9                   | 10.6                  | 127               |
| OlympicCoder-32B          | 0                   | 100K   | 57.4                   | 18.0                  | 153.5             |
| QWQ-32B                   | -                   | -      | 61.3                   | 20.2                  | 175.5             |
|  |  |  |  |  |  |
| **OpenCodeReasoning-IOI** |  |  |  |  |  |
|  |  |  |  |  |  |
| **OCR-Qwen-32B-Instruct** | **736K** | **356K**| **61.5** | **25.5** | **175.5** |


## Reproducing our results

* [Models](https://huggingface.co/collections/nvidia/opencodereasoning-2-68168f37cd7c6beb1e3f92e7)
* [Dataset](https://huggingface.co/datasets/nvidia/OpenCodeReasoning)
* [Paper](https://arxiv.org/abs/2504.01943)


## How to use the models?

To run inference on coding problems for IOI Benchmark:

````python
import transformers
import torch

model_id = "nvidia/OpenCodeReasoning-Nemotron-32B-IOI"

pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device_map="auto",
)

prompt = """You are a helpful and harmless assistant. You should think step-by-step before responding to the instruction below.

Please use c++ programming language only.

You must use ```cpp for just the final solution code block with the following format:
```cpp
// Your code here
```

{user}
"""

messages = [
    {
        "role": "user",
        "content": prompt.format(user="Write a program to calculate the sum of the first $N$ fibonacci numbers")},
]

outputs = pipeline(
    messages,
    max_new_tokens=32768,
)
print(outputs[0]["generated_text"][-1]['content'])
````

To run inference on coding problems for python programs:

````python
import transformers
import torch

model_id = "nvidia/OpenCodeReasoning-Nemotron-32B"

pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device_map="auto",
)

prompt = """You are a helpful and harmless assistant. You should think step-by-step before responding to the instruction below.

Please use python programming language only.

You must use ```python for just the final solution code block with the following format:
```python
# Your code here
```

{user}
"""

messages = [
    {
        "role": "user",
        "content": prompt.format(user="Write a program to calculate the sum of the first $N$ fibonacci numbers")},
]

outputs = pipeline(
    messages,
    max_new_tokens=32768,
)
print(outputs[0]["generated_text"][-1]['content'])
````



## Citation

If you find the data useful, please cite:
```
@article{ahmad2025opencodereasoning,
      title={OpenCodeReasoning: Advancing Data Distillation for Competitive Coding}, 
      author={Wasi Uddin Ahmad, Sean Narenthiran, Somshubra Majumdar, Aleksander Ficek, Siddhartha Jain, Jocelyn Huang, Vahid Noroozi, Boris Ginsburg},
      year={2025},
      eprint={2504.01943},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2504.01943}, 
}
```

## Additional Information

## Model Architecture: <br>
Architecture Type: Dense decoder-only Transformer model
Network Architecture: Qwen-32B-Instruct 
<br>
**This model was developed based on Qwen2.5-32B-Instruct and has 32B model parameters. <br>**
**OpenCodeReasoning-Nemotron-32B was developed based on Qwen2.5-32B-Instruct and has 32B model parameters. <br>**

## Input: <br>
**Input Type(s):** Text <br>
**Input Format(s):** String <br>
**Input Parameters:** One-Dimensional (1D) <br>
**Other Properties Related to Input:** Context length up to 32,768 tokens <br>

## Output: <br>
**Output Type(s):** Text <br>
**Output Format:** String <br>
**Output Parameters:** One-Dimensional (1D) <br>
**Other Properties Related to Output:** Context length up to 32,768 tokens <br> 

Our AI models are designed and/or optimized to run on NVIDIA GPU-accelerated systems. By leveraging NVIDIA’s hardware (e.g. GPU cores) and software frameworks (e.g., CUDA libraries), the model achieves faster training and inference times compared to CPU-only solutions. <br>   

## Software Integration : <br>
* Runtime Engine: NeMo 2.3.0 <br>
* Recommended Hardware Microarchitecture Compatibility: <br>
NVIDIA Ampere <br>
NVIDIA Hopper <br>
* Preferred/Supported Operating System(s): Linux <br> 

## Model Version(s): 
1.0 (4/25/2025)  <br>
OpenCodeReasoning-Nemotron-7B<br>
OpenCodeReasoning-Nemotron-14B<br>
OpenCodeReasoning-Nemotron-32B<br>
OpenCodeReasoning-Nemotron-32B-IOI<br>


# Training and Evaluation Datasets: <br>   

## Training Dataset:

The training corpus for OpenCodeReasoning-Nemotron-32B is [OpenCodeReasoning](https://huggingface.co/datasets/nvidia/OpenCodeReasoning) dataset, which is composed of competitive programming questions and DeepSeek-R1 generated responses. 

Data Collection Method: Hybrid: Automated, Human, Synthetic <br>
Labeling Method: Hybrid: Automated, Human, Synthetic <br>
Properties: 736k samples from OpenCodeReasoning (https://huggingface.co/datasets/nvidia/OpenCodeReasoning)

## Evaluation Dataset:
We used the datasets listed in the next section to evaluate OpenCodeReasoning-Nemotron-32B. <br>
**Data Collection Method: Hybrid: Automated, Human, Synthetic <br>**
**Labeling Method: Hybrid: Automated, Human, Synthetic <br>**

### License/Terms of Use: <br> 
GOVERNING TERMS: Use of this model is governed by [Apache 2.0](https://huggingface.co/nvidia/OpenCode-Nemotron-2-7B/blob/main/LICENSE).

### Deployment Geography:
Global<br>

### Use Case: <br>
This model is intended for developers and researchers building LLMs. <br>

### Release Date:  <br>
Huggingface [04/25/2025] via https://huggingface.co/nvidia/OpenCodeReasoning-Nemotron-32B/ <br> 

## Reference(s):
[2504.01943] OpenCodeReasoning: Advancing Data Distillation for Competitive Coding
<br>

## Inference:
**Engine:** vLLM <br>
**Test Hardware** NVIDIA H100-80GB <br>

## Ethical Considerations:
NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications.  When downloaded or used in accordance with our terms of service, developers should work with their internal model team to ensure this model meets requirements for the relevant industry and use case and addresses unforeseen product misuse.  

Please report security vulnerabilities or NVIDIA AI Concerns here.