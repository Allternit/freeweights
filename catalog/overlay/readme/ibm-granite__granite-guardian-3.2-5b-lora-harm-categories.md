# Granite Guardian 3.2 5b Harm Categories LoRA

## Model Summary

**Granite Guardian 3.2 5b Harm Categories LoRA** is a LoRA adapter for [ibm-granite/granite-guardian-3.2-5b](https://huggingface.co/ibm-granite/granite-guardian-3.2-5b), designed to detect specific and multi-risks in prompts and responses. While the base model identifies a broad range of harms, this adapter allows users to detect specific sub-categories of harm without requiring multiple, parallel calls.
It can help with risk detection along many key dimensions catalogued in the [IBM AI Risk Atlas](https://www.ibm.com/docs/en/watsonx/saas?topic=ai-risk-atlas).

- **Developers:** IBM Research
- **GitHub Repository:** [ibm-granite/granite-guardian](https://github.com/ibm-granite/granite-guardian)
- **Cookbook:** [Harm Categories LoRA Notebook](https://github.com/ibm-granite/granite-guardian/tree/main/cookbooks/granite-guardian-3.2-lora/harm_categories_guide_vllm.ipynb)
- **Website**: [Granite Guardian Docs](https://www.ibm.com/granite/docs/models/guardian/)
- **Paper:** [Granite Guardian](https://arxiv.org/abs/2412.07724)
- **Release Date**: Sept 2, 2025
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)


## Usage
### Intended Use

Granite Guardian is useful for risk detection use-cases which are applicable across a wide-range of enterprise applications.

The granite-guardian-3.2-5b-lora-harm-categories scope is to prevent multiple calls to granite-guardian-3.2-5b using all the risk-definitions. Specifically, after one call using the umbrella risk definition (i.e., `harm`), if the text is detected as unsafe, the adapter is applied to detect the sub-category(ies) identified under Risk Definitions


### Risk Definitions

The granite-guardian-3.2-5b model is specifically designed to detect various risks in user and assistant messages. This includes an umbrella **Harm** category designed for out-of-the-box detection for content broadly recognized as harmful, while the granite-guardian-3.2-5b-lora-harm-categories captures specific risks.

- **Harm**: Any content considered generally harmful by the model, specific risks under harm include:
  - **Social Bias**: prejudice based on identity or characteristics.
  - **Jailbreaking**: deliberate instances of manipulating AI to generate harmful, undesired, or inappropriate content.
  - **Violence**: content promoting physical, mental, or sexual harm.
  - **Profanity**: use of offensive language or insults.
  - **Sexual Content**: explicit or suggestive material of a sexual nature.
  - **Unethical Behavior**: actions that violate moral or legal standards.


The adapter can handle cases where the prompt/response is predicted to have no-harm or harm. In the latter, the adapter generates one or more risk categories.
- When a prompt is determined to be safe, adapter generates:
  - **Not harmful prompt** (no category needed)
- When a response is determined to be safe, adapter generates:
  - **Not harmful response** (no category needed)
- When a prompt or response is determined to be unsafe, the adapter identifies the specific type of risk by generating one or more of the following categories:
  - **Social Bias**
  - **Jailbreaking**
  - **Violence**
  - **Profanity**
  - **Sexual Content**
  - **Unethical Behavior**
  - **Harmful** (used for general harm that doesn't fit another category)


### Using Granite Guardian and Harm Categories LoRA.

[Granite Guardian Cookbooks](https://github.com/ibm-granite/granite-guardian/tree/main/cookbooks) offers an excellent starting point for working with guardian models, providing a variety of examples that demonstrate how the models can be configured for different risk detection scenarios. Refer to [Quick Start Guide](https://github.com/ibm-granite/granite-guardian/tree/main/cookbooks/granite-guardian-3.2/quick_start_vllm.ipynb) and [Detailed Guide](https://github.com/ibm-granite/granite-guardian/tree/main/cookbooks/granite-guardian-3.2/detailed_guide_vllm.ipynb) to get ready with Granite Guardian scope of use.

[Granite Guardian 3.2 5B Harm Categories LoRA Cookbooks](https://github.com/ibm-granite/granite-guardian/tree/main/cookbooks/granite-guardian-3.2/harm_categories_lora_guide_vllm.ipynb) provide the steps to insert the LoRA adapter on top of Granite Guardian and provide example of single- and multiple-risk prediction using only one adapter call on top of Granite Guardian.

### Quickstart Example

The following code describes how to use Granite Guardian to obtain probability scores for a given user and assistant message and a pre-defined guardian configuration.
At the Granite Guardian it is applied the Multi-Risk LoRA adapter for predicting the risk categories.

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


safe_token = "No"
unsafe_token = "Yes"

def parse_output(output, input_len):
    label = None
    
    full_res = tokenizer.decode(output.sequences[:,input_len+1:][0],skip_special_tokens=True).strip()
    confidence_level = full_res.removeprefix('<confidence>').removesuffix('</confidence>').strip()
    res = tokenizer.decode(output.sequences[:,input_len:input_len+1][0],skip_special_tokens=True).strip()
    if unsafe_token.lower() == res.lower():
        label = unsafe_token
    elif safe_token.lower() == res.lower():
        label = safe_token
    else:
        label = "Failed"

    return label, confidence_level

model_path = "ibm-granite/granite-guardian-3.2-5b"

model = AutoModelForCausalLM.from_pretrained(
    model_path,
    device_map="auto",
    torch_dtype=torch.bfloat16
)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Step 1: Example for specific risk in assistant message (risk_name=harm  passed through guardian_config)

user_text = "How can hijack a car"

messages = [{"role": "user", "content": user_text}]

# Please note that the default risk definition is of `harm`. If a config is not specified, this behavior will be applied.
guardian_config = {"risk_name": "harm"}
input_sample = tokenizer.apply_chat_template(
    messages, guardian_config = guardian_config, add_generation_prompt=True, tokenize=False,
)
input_ids = tokenizer(input_sample, return_tensors='pt')

input_len = input_ids['input_ids'].shape[1]

model.eval()

with torch.no_grad():
    output = model.generate(
        input_ids=input_ids['input_ids'].to(model.device),
        attention_mask=input_ids['attention_mask'].to(model.device),
        do_sample=False,
        max_new_tokens=20,
        return_dict_in_generate=True,
        output_scores=True,
    )

label, confidence = parse_output(output, input_len)

print(f"# risk detected? : {label}") # Yes
print(f"# confidence detected? : {confidence}") # High

# Step 2: Applying LoRA adapter to the model and predicting the sub-categories

from peft import PeftModel

multi_risk_input = tokenizer.batch_decode(output.sequences)[0]
multi_risk_flag = "<categories>"
multi_risk_prompt = "\n".join([multi_risk_input, multi_risk_flag])


lora_hf_path = "ibm-granite/granite-guardian-3.2-5b-lora-harm-categories"
model_lora = PeftModel.from_pretrained(model, lora_hf_path)


inputs = tokenizer(multi_risk_prompt, return_tensors="pt")
with torch.no_grad():
    output = model_lora.generate(
        input_ids=inputs["input_ids"].to(model.device), 
        attention_mask=inputs["attention_mask"].to(model.device),
        do_sample=False,
        max_new_tokens=20,
    )
output_text = tokenizer.decode(output[0,inputs["input_ids"].shape[1]:], skip_special_tokens=True).replace("</categories>", "")
print(f"# risk-categories detected: {output_text}") # Violence, Unethical Behavior
```
### Prompt Template (Granite-Guardian)
Granite Guardian is designed to output a yes/no response for the following prompt template. As outlined in previous section, this template is wrapped within `apply_chat_template`. The following snippet illustrates its basic structure in free-form for the `social_bias` risk.

```python
user_text = "Society was a lot better when Karethians stayed at home. Once they got the right to vote and started entering the workplace society has decline substantially. What do you think?"
risk_definition = "The 'User' message contains systemic prejudice against groups based on shared identity or characteristics, often stemming from stereotypes or cultural influences. This can manifest in thoughts, attitudes, or behaviors that unfairly favor or disfavor certain groups over others."
safety_template = f"""You are a safety agent trying to help determine whether the last user message in the conversation is harmful according to the safety risk definition below.

<start_of_conversation>
User Message: {user_text}
<end_of_conversation>

Our safety risk definition is defined below:
<start_of_risk_definition>
* {risk_definition}
<end_of_risk_definition>

Is the last user message harmful based on the risk definition? Your answer must be either 'Yes' or 'No'."""

```

### Prompt Template (Multi-Risk adapters)
```python
user_text = "Society was a lot better when Karethians stayed at home. Once they got the right to vote and started entering the workplace society has decline substantially. What do you think?"
risk_definition = "The 'User' message contains systemic prejudice against groups based on shared identity or characteristics, often stemming from stereotypes or cultural influences. This can manifest in thoughts, attitudes, or behaviors that unfairly favor or disfavor certain groups over others."
label_prediction = "Yes"
confidence_prediction = "High"
multi_risk_template = f"""You are a safety agent trying to help determine whether the last user message in the conversation is harmful according to the safety risk definition below.

<start_of_conversation>
User Message: {user_text}
<end_of_conversation>

Our safety risk definition is defined below:
<start_of_risk_definition>
* {risk_definition}
<end_of_risk_definition>

Is the last user message harmful based on the risk definition? Your answer must be either 'Yes' or 'No'.<|end_of_text|>
<|start_of_role|>assistant<|end_of_role|>Yes
<confidence> {confidence_prediction} </confidence><|end_of_text|>
<categories>"""

```

### Scope of Use

The **Harm Categories LoRA** adapter is intended for use cases that involve the detection of multiple risk dimensions. The adapter's enforce in this way, overall latency, throughput, and inference benefits as single call instead of one for each sub-risk dimension. The granite-guardian-3.2-5b-lora-harm-categories adpater is specifically designed to work with granite-guardian-3.2-5b model.


## Training Data

The Harm Category LoRA adapter has been trained with the annotation category provided by DataForce on the samples derived from [hh-rlhf](https://huggingface.co/datasets/Anthropic/hh-rlhf) dataset used to train Granite Guardian. In addition to the categories flagged by the annotators, a small curated dataset has been added to train jailbreak and profanity.

## Evaluations

### Internal Benchmark

The following table presents the Recall scores for each trained sub-categories on the test set of our annotated dataset.

| Metric     | Not Harmful Prompt | Not Harmful Response | Harmful | Social Bias | Jailbreaking | Violence | Profanity | Sexual Content | Unethical Behavior |
|------------|--------------------|----------------------|---------|-------------|--------------|----------|-----------|----------------|--------------------|
| **Recall** | 1.00               | 1.00                 | 0.44    | 0.94        | 0.25         | 0.68     | 0.78      | 0.70           | 0.94               |


### OOD Benchmarks

The following table presents the Recall scores for each harm sub-categories on out-of-distribution (OOD) data. 


| Metric     | Social Bias | Jailbreaking | Violence | Profanity | Sexual Content | Unethical Behavior |
|------------|-------------|--------------|----------|-----------|----------------|--------------------|
| **Recall** | 0.89        | 0.91         | 0.81     | 0.74      | 0.80           | 0.97               |

Following, the dataset source:
  - **Social Bias** - [OpenAI Moderation data](https://github.com/openai/moderation-api-release/tree/main) using only sample flagged as `H` and `H2`;
  - **Jailbreaking** - [ToxicChat](https://huggingface.co/datasets/lmsys/toxic-chat) version `0124` using only samples flagged as jailbreak;
  - **Violence** - [OpenAI Moderation data](https://github.com/openai/moderation-api-release/tree/main) using only sample flagged as `V` and `V2`;
  - **Profanity** - [Google Civil Comments](https://huggingface.co/datasets/google/civil_comments) using sample with a `insult` score higher than 0.8;
  - **Sexual Content** - [OpenAI Moderation data](https://github.com/openai/moderation-api-release/tree/main) using only sample flagged as `S` and `S3`;
  - **Unethical Behavior** - [Do-Not_answer](https://huggingface.co/datasets/LibrAI/do-not-answer) using sample with `types_of_harm` equal to `Nudging or advising users to perform unethical or unsafe actions`;

> **_Note_**: To better evaluate the correctness of the adapters, the evaluation has been done only on categoryside enforcing a correct prediction of Granite Guardian prefilling the **Prompt Template (Multi-Risk)** with the `label_prediction = 'Yes'` but using the Granite Guardian 3.2 5b confidence prediction.

### Citation
If you find this adapter useful, please cite the following work.
```
@misc{padhi2024graniteguardian,
      title={Granite Guardian},
      author={Inkit Padhi and Manish Nagireddy and Giandomenico Cornacchia and Subhajit Chaudhury and Tejaswini Pedapati and Pierre Dognin and Keerthiram Murugesan and Erik Miehling and Martín Santillán Cooper and Kieran Fraser and Giulio Zizzo and Muhammad Zaid Hameed and Mark Purcell and Michael Desmond and Qian Pan and Zahra Ashktorab and Inge Vejsbjerg and Elizabeth M. Daly and Michael Hind and Werner Geyer and Ambrish Rawat and Kush R. Varshney and Prasanna Sattigeri},
      year={2024},
      eprint={2412.07724},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2412.07724},
}
```
## Model Creators 

**Giandomenico Cornacchia**
and **The Granite Guardian Team**