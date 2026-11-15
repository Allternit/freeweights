<img src="https://allenai.org/olmo/olmo-7b-animation.gif" alt="OLMo Logo" width="800" style="margin-left:'auto' margin-right:'auto' display:'block'"/>


# Model Card for OLMo 7B July 2024 Instruct

**Requires transformers versions v4.40.0 or newer**


OLMo is a series of **O**pen **L**anguage **Mo**dels designed to enable the science of language models.
The OLMo base models are trained on the [Dolma](https://huggingface.co/datasets/allenai/dolma) dataset.
The adapted versions are trained on the [Tulu SFT mixture](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture-olmo-4096) and, for the Instruct version, a [cleaned version of the UltraFeedback dataset](https://huggingface.co/datasets/allenai/ultrafeedback_binarized_cleaned).

OLMo 7B Instruct SFT are two adapted versions of these models trained for better question answering.
These are updated OLMo models corresponding to our July 2024 release.
They show the performance gain that OLMo base models can achieve with existing fine-tuning techniques.

## Model Details

We release two adapted model versions:
| Model | Training Method(s) | Datasets | Context Length | 
|------|--------|---------|--|
| [OLMo 7B July 2024 SFT](https://huggingface.co/allenai/OLMo-1.7-7B-Nitro-SFT-hf)   | SFT | [Tulu 2 SFT Mix](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture-olmo-4096)     | 4096        | 
| [OLMo 7B July 2024 Instruct](https://huggingface.co/allenai/OLMo-1.7-7B-Nitro-Instruct-hf) | SFT + DPO   | [Tulu 2 SFT Mix](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture-olmo-4096) + [Ultrafeedback Cleaned](https://huggingface.co/datasets/allenai/ultrafeedback_binarized_cleaned)     | 4096 |

These models are both trained on top of OLMo 7b July 2024:
| Size | Training Tokens | Layers | Hidden Size | Attention Heads | Context Length |
|------|--------|---------|-------------|-----------------|----------------|
| [OLMo 7B July 2024](https://huggingface.co/allenai/OLMo-1.7-7B-hf)   | 2.7T |32     | 4096        | 32              | 4096  |


### Model Description

<!-- Provide a longer summary of what this model is. -->

- **Developed by:** Allen Institute for AI (AI2)
- **Supported by:** Databricks, Kempner Institute for the Study of Natural and Artificial Intelligence at Harvard University, AMD, CSC (Lumi Supercomputer), UW
- **Model type:** a Transformer style autoregressive language model.
- **Language(s) (NLP):** English
- **License:** The code and model are released under Apache 2.0.
- **Contact:** Technical inquiries: `olmo at allenai dot org`. Press: `press at allenai dot org`
- **Date cutoff:** Oct. 2023, with most data from Feb./March 2023 based on Dolma dataset version.


### Model Sources

- **Project Page:** https://allenai.org/olmo
- **Repositories:** 
    - Core repo (training, inference, fine-tuning etc.): https://github.com/allenai/OLMo
    - Evaluation code: https://github.com/allenai/OLMo-Eval
    - Further fine-tuning code: https://github.com/allenai/open-instruct
- **Paper:** [Link](https://arxiv.org/abs/2402.00838)


### Inference

You can run these models using recent (>= 4.40) versions of transformers.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
olmo = AutoModelForCausalLM.from_pretrained("allenai/OLMo-7B-0724-Instruct-hf")
tokenizer = AutoTokenizer.from_pretrained("allenai/OLMo-7B-0724-Instruct-hf")
chat = [
    { "role": "user", "content": "What is language modeling?" },
]
prompt = tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)
inputs = tokenizer.encode(prompt, add_special_tokens=False, return_tensors="pt")
# optional verifying cuda
# inputs = {k: v.to('cuda') for k,v in inputs.items()}
# olmo = olmo.to('cuda')
response = olmo.generate(input_ids=inputs.to(olmo.device), max_new_tokens=100, do_sample=True, top_k=50, top_p=0.95)
print(tokenizer.batch_decode(response, skip_special_tokens=True)[0])
>> '<|user|>\nWhat is language modeling?\n<|assistant|>\nLanguage modeling is a type of natural language processing (NLP) task or machine learning task that...'
```

You can make this slightly faster by quantizing the model, e.g. `OLMoForCausalLM.from_pretrained("allenai/OLMo-7B-Instruct", torch_dtype=torch.float16, load_in_8bit=True)` (requires `bitsandbytes`).
The quantized model is more sensitive to typing / cuda, so it is recommended to pass the inputs as `inputs.input_ids.to('cuda')` to avoid potential issues.


## Evaluation

<!-- This section describes the evaluation protocols and provides the results. -->

Core model results for the 7B adapted models are found below.

| Model                 | MMLU 0-shot ↑ | AlpacaEval %win ↑ | ToxiGen % Toxic ↓ | TruthfulQA %Info+True ↑ |
|-----------------------|---------------|--------------------|--------------------|-------------------------|
| **OLMo July 2024 base**      | 50.8          | -                  | 85.2               | 28.4                    |
| **[OLMo 7B July 2024 SFT](https://huggingface.co/allenai/OLMo-1.7-7B-Nitro-SFT-hf)**         |    54.2       | 70.9               | .1               | 44.4                    |
| **[OLMo 7B July 2024 Instruct](https://huggingface.co/allenai/OLMo-1.7-7B-Nitro-Instruct-hf)**     | 52.8          | 83.5               | 1.7                | 70.3                    |



## Model Details

### Data
For training data details, please see the [Dolma](https://huggingface.co/datasets/allenai/dolma), [Tulu 2](https://huggingface.co/datasets/allenai/allenai/tulu-v2-sft-mixture-olmo-4096), and [UltraFeedback](https://huggingface.co/datasets/openbmb/UltraFeedback) documentation.

### Architecture


### Hyperparameters 

The hyperparameters for the two phases of training are below:

|                         | Learning Rate | Beta | Epochs | Warmup                                                                 | Weight Decay | Gradient Clipping | Maximum Sequence Length |
|-------------------------|---------------|------|--------|------------------------------------------------------------------------|--------------|-------------------|-------------------------|
| **SFT**                 | 2 × 10^-6     | N/A  | 3      | Linear warmup for the first 3% of total training time, then cooldown to 0 | 0            | 0                 | 4096                    |
| **DPO**                 | 5 × 10^-7     | 0.1  | 3      | Linear warmup for the first 10% of total training time, then cooldown to 0| 0            | 0                 | 4096                    |

Compared to Tulu 2, DPO hyperparameters are the same. SFT is lower LR and 3 epochs instead of 2 (and 2k length instead of 8k).

## Bias, Risks, and Limitations

This adapted OLMo model is a research artifact. 
It is intended to benefit the research community interested in understanding the safety properties of LLMs and developers building safety tools for LLMs. 
For this reason, the model does not include a specific safety filter or safety training data. 
While our model scores well relative to its peers on ToxiGen, it is possible for the model to generate harmful and sensitive content from some user prompts. 
We recommend developers exercise caution and consider the risks of the applications of this technology. 
Furthermore, developers should consider implementing safeguards for biases, privacy, and other potential harms when appropriate. 
Finally, as with every LLM, OLMo may produce factual-sounding outputs that may not be true, so developers and users are encouraged to confirm such outputs before relying on them. 
All users of this model are responsible for how they use the model.


## Citation

**BibTeX:**

```
@article{Groeneveld2023OLMo,
  title={OLMo: Accelerating the Science of Language Models},
  author={Groeneveld, Dirk and Beltagy, Iz and Walsh, Pete and Bhagia, Akshita and Kinney, Rodney and Tafjord, Oyvind and Jha, Ananya Harsh and Ivison, Hamish and Magnusson, Ian and Wang, Yizhong and Arora, Shane and Atkinson, David and Authur, Russell and Chandu, Khyathi and Cohan, Arman and Dumas, Jennifer and Elazar, Yanai and Gu, Yuling and Hessel, Jack and Khot, Tushar and Merrill, William and Morrison, Jacob and Muennighoff, Niklas and Naik, Aakanksha and Nam, Crystal and Peters, Matthew E. and Pyatkin, Valentina and Ravichander, Abhilasha and Schwenk, Dustin and Shah, Saurabh and Smith, Will and Subramani, Nishant and Wortsman, Mitchell and Dasigi, Pradeep and Lambert, Nathan and Richardson, Kyle and Dodge, Jesse and Lo, Kyle and Soldaini, Luca and Smith, Noah A. and Hajishirzi, Hannaneh},
  journal={Preprint},
  year={2024}
}
```

**APA:**

Groeneveld, D., Beltagy, I., Walsh, P., Bhagia, A., Kinney, R., Tafjord, O., Jha, A., Ivison, H., Magnusson, I., Wang, Y., Arora, S., Atkinson, D., Authur, R., Chandu, K., Cohan, A., Dumas, J., Elazar, Y., Gu, Y., Hessel, J., Khot, T., Merrill, W., Morrison, J., Muennighoff, N., Naik, A., Nam, C., Peters, M., Pyatkin, V., Ravichander, A., Schwenk, D., Shah, S., Smith, W., Subramani, N., Wortsman, M., Dasigi, P., Lambert, N., Richardson, K., Dodge, J., Lo, K., Soldaini, L., Smith, N., & Hajishirzi, H. (2024). OLMo: Accelerating the Science of Language Models. Preprint.

## Model Card Contact


For errors in this model card, contact Nathan or Jacob, `{nathanl, jacobm} at allenai dot org`.