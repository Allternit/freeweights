<img src="https://allenai.org/olmo/olmo-7b-animation.gif" alt="OLMo Logo" width="800" style="margin-left:'auto' margin-right:'auto' display:'block'"/>


# Model Card for OLMo 7B Instruct

<!-- Provide a quick summary of what the model is/does. -->

OLMo is a series of **O**pen **L**anguage **Mo**dels designed to enable the science of language models.
The OLMo base models are trained on the [Dolma](https://huggingface.co/datasets/allenai/dolma) dataset.
The adapted versions are trained on the [Tulu SFT mixture](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture) and, for the Instruct version, a [cleaned version of the UltraFeedback dataset](https://huggingface.co/datasets/allenai/ultrafeedback_binarized_cleaned).
We release all code, checkpoints, logs, and details involved in training these models.

OLMo 7B Instruct and OLMo SFT are two adapted versions of these models trained for better question answering.
They show the performance gain that OLMo base models can achieve with existing fine-tuning techniques.

**This version is for direct use with HuggingFace Transformers** from v4.40 on.

**Note that this is the instruct variant of the original OLMo release - there are newer (better) versions of OLMo out now! Check [here](https://huggingface.co/collections/allenai/olmo-suite-65aeaae8fe5b6b2122b46778) for newer releases.**


## Model Details

We release two adapted model versions:
The base models related to this adapted model are the following: 
| Model | Training Method(s) | Datasets | Context Length | 
|------|--------|---------|--|
| [OLMo 7B SFT](https://huggingface.co/allenai/OLMo-7B-SFT)   | SFT | [Tulu 2 SFT Mix](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture)     | 2048        | 
| [OLMo 7B Instruct](https://huggingface.co/allenai/OLMo-7B-Instruct) | SFT + DPO   | [Tulu 2 SFT Mix](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture) + [Ultrafeedback Cleaned](https://huggingface.co/datasets/allenai/ultrafeedback_binarized_cleaned)     | 2048 |


The base models related to this adapted model are the following: 
| Size | Training Tokens | Layers | Hidden Size | Attention Heads | Context Length |
|------|--------|---------|-------------|-----------------|----------------|
| [OLMo 1B](https://huggingface.co/allenai/OLMo-1B)   | 3 Trillion |16     | 2048        | 16              | 2048  |
| [OLMo 7B](https://huggingface.co/allenai/OLMo-7B) | 2.5 Trillion   | 32     | 4096        | 32              |  2048  |
| [OLMo 7B Twin 2T](https://huggingface.co/allenai/OLMo-7B-Twin-2T) | 2 Trillion   | 32     | 4096        | 32              |  2048  |


### Model Description

<!-- Provide a longer summary of what this model is. -->

- **Developed by:** Allen Institute for AI (AI2)
- **Supported by:** Databricks, Kempner Institute for the Study of Natural and Artificial Intelligence at Harvard University, AMD, CSC (Lumi Supercomputer), UW
- **Model type:** a Transformer style autoregressive language model.
- **Language(s) (NLP):** English
- **License:** The code and model are released under Apache 2.0.
- **Contact:** Technical inquiries: `olmo at allenai dot org`. Press: `press at allenai dot org`
- **Date cutoff:** Feb./March 2023 based on Dolma dataset version.


### Model Sources

<!-- Provide the basic links for the model. -->

- **Project Page:** https://allenai.org/olmo
- **Repositories:** 
    - Core repo (training, inference, fine-tuning etc.): https://github.com/allenai/OLMo
    - Evaluation code: https://github.com/allenai/OLMo-Eval
    - Further fine-tuning code: https://github.com/allenai/open-instruct
- **Paper:** [Link](https://arxiv.org/abs/2402.00838)
- **Technical blog post:** https://blog.allenai.org/olmo-open-language-model-87ccfc95f580
- **W&B Logs:** https://wandb.ai/ai2-llm/OLMo-7B/reports/OLMo-7B--Vmlldzo2NzQyMzk5
<!-- - **Press release:** TODO -->

## Uses

<!-- Address questions around how the model is intended to be used, including the foreseeable users of the model and those affected by the model. -->

### Inference
You can load and run this model as usual so long as your HuggingFace version is >= 4.40:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
olmo = AutoModelForCausalLM.from_pretrained("allenai/OLMo-7B-Instruct-hf")
tokenizer = AutoTokenizer.from_pretrained("allenai/OLMo-7B-Instruct-hf")
message = [{"role": "user", "content": "What is 2+2?"}]
inputs = tokenizer.apply_chat_template(messages, tokenize=True, add_generation_prompt=True, return_tensors="pt")
# optional verifying cuda
# inputs = {k: v.to('cuda') for k,v in inputs.items()}
# olmo = olmo.to('cuda')
response = olmo.generate(**inputs, max_new_tokens=100, do_sample=True, top_k=50, top_p=0.95)
print(tokenizer.batch_decode(response, skip_special_tokens=True)[0])
>> '2+2=4'
```

## Evaluation

<!-- This section describes the evaluation protocols and provides the results. -->

Core model results for the 7B adapted models are found below.

| Model                 | MMLU 0-shot ↑ | AlpacaEval %win ↑ | ToxiGen % Toxic ↓ | TruthfulQA %Info+True ↑ |
|-----------------------|---------------|--------------------|--------------------|-------------------------|
| **OLMo (base)**      | 28.3          | -                  | 81.4               | 31.6                    |
| MPT Chat          | 33.8          | 46.8               | 0.1                | 42.7                    |
| Falcon Instruct   | 25.2          | 14.0               | 70.7               | 27.2                    |
| RPJ-INCITE Chat   | 27.0          | 38.0               | 46.4               | 53.0                    |
| Llama-2-Chat 7B      | 46.8          | 87.3               | 0.0                | 26.3                    |
| AI2 Tulu 2 7B         | 50.4          | 73.9               | 7.0                | 51.7                    |
| AI2 Tulu 2 7B DPO        | 50.7          | 85.1               | 0.5                | - *                     |
| **[OLMo 7B SFT](https://huggingface.co/allenai/OLMo-7B-SFT)**         | 47.3          | 57.0               | 14.4               | 41.2                    |
| **[OLMo 7B Instruct](https://huggingface.co/allenai/OLMo-7B-Instruct)**     | 46.2          | 69.3               | 1.7                | 52.0                    |

*Following Ivison et al. 2023, we do not report Tulu 2 TruthfulQA scores due to test set contamination.
## Model Details

### Data
For training data details, please see the [Dolma](https://huggingface.co/datasets/allenai/dolma), [Tulu 2](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture), and [UltraFeedback](https://huggingface.co/datasets/openbmb/UltraFeedback) documentation.

### Architecture


### Hyperparameters 

The hyperparameters for the two phases of training are below:

|                         | Learning Rate | Beta | Epochs | Warmup                                                                 | Weight Decay | Gradient Clipping | Maximum Sequence Length |
|-------------------------|---------------|------|--------|------------------------------------------------------------------------|--------------|-------------------|-------------------------|
| **SFT**                 | 2 × 10^-6     | N/A  | 3      | Linear warmup for the first 3% of total training time, then cooldown to 0 | 0            | 0                 | 2048                    |
| **DPO**                 | 5 × 10^-7     | 0.1  | 3      | Linear warmup for the first 10% of total training time, then cooldown to 0| 0            | 0                 | 2048                    |

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