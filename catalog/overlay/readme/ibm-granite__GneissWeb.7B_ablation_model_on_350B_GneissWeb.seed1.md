**Model Summary:**

This model is part of the [GneissWeb](https://huggingface.co/datasets/ibm-granite/GneissWeb) ablations, detailed in this [technical report](https://arxiv.org/pdf/2502.14907). The model has 7 billion parameters and uses the LLama architecture. It is trained on a random subset of 350 billion English tokens from GneissWeb, tokenized using the StarCoder tokenizer.

- Developers: IBM Research

- Release Date: Feb 25th, 2025

- License: Apache 2.0

**Intended Use**: 

This model is trained on 350B tokens of GneissWeb and is not instruction-tuned or safety aligned. It is important to note that the primary intended use case for this model is to compare its performance with other models trained under similar conditions, with the goal of comparing pre-training datasets.These other models are mentioned [here](https://huggingface.co/datasets/ibm-granite/GneissWeb)


**Generation**: 

This is a simple example of how to use `GneissWeb.7B_ablation_model_on_350B_GneissWeb.seed1` model.

Install the following libraries:

```shell
pip install torch torchvision torchaudio
pip install accelerate
pip install transformers
```
Then, copy the code snippet below to run the example.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
device = "auto"
model_path = "ibm-granite/GneissWeb.7B_ablation_model_on_350B_GneissWeb.seed1"
tokenizer = AutoTokenizer.from_pretrained(model_path)
# drop device_map if running on CPU
model = AutoModelForCausalLM.from_pretrained(model_path, device_map=device)
model.eval()
# change input text as desired
input_text = "What is the meaning of 'Gneiss'?"
# tokenize the text
input_tokens = tokenizer(input_text, return_tensors="pt").to('cuda')
# generate output tokens
output = model.generate(**input_tokens,
                        max_length=43)
# decode output tokens into text
output = tokenizer.batch_decode(output)
# print output
print(output)

```

**Evaluation Results**:  Please refer to section 5.3.2 of the [GneissWeb](https://arxiv.org/pdf/2502.14907) paper.

**Infrastructure**: Please refer to section 5.2 of the [GneissWeb](https://arxiv.org/pdf/2502.14907) paper.

**Ethical Considerations and Limitations**: The use of Large Language Models involves risks and ethical considerations people must be aware of, including but not limited to: bias and fairness, misinformation, and autonomous decision-making. `GneissWeb.7B_ablation_model_on_350B_GneissWeb.seed1` is not the exception in this regard. Even though this model is suited for multiple generative AI tasks, it has not undergone any safety alignment, there it may produce problematic outputs. Additionally, it remains uncertain whether smaller models might exhibit increased susceptibility to hallucination in generation scenarios by copying text verbatim from the training dataset due to their reduced sizes and memorization capacities. This aspect is currently an active area of research, and we anticipate more rigorous exploration, comprehension, and mitigations in this domain. Regarding ethics, a latent risk associated with all Large Language Models is their malicious utilization. We urge the community to use `GneissWeb.7B_ablation_model_on_350B_GneissWeb.seed1` model with ethical intentions and in a responsible way.

**Resources**: Learn more about GneissWeb [here](https://huggingface.co/datasets/ibm-granite/GneissWeb). 
