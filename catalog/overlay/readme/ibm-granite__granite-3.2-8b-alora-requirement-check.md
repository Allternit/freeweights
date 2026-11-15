# Granite 3.2 8B Instruct - Requirement Checker

Welcome to Granite Experiments!

Think of Experiments as a preview of what's to come. These projects are still under development, but we wanted to let the open-source community take them for spin! Use them, break them, and help us build what's next for Granite – we'll keep an eye out for feedback and questions in the [Community section](https://huggingface.co/ibm-granite/granite-uncertainty-3.0-8b-lora/discussions). Happy exploring!


## Model Summary

**Granite 3.2 8b Instruct - Requirement Checker** is an Activated LoRA (aLoRA) adapter for [ibm-granite/granite-3.2-8b-instruct](https://huggingface.co/ibm-granite/granite-3.2-8b-instruct), 
adding the capability to check if specified requirements were satisfied by the last model generation. Only one requirement is checked at a time (but can be checked in parallel). 

- **Developer:** IBM Research
- **Model type:** Activated LoRA adapter for [ibm-granite/granite-3.2-8b-instruct](https://huggingface.co/ibm-granite/granite-3.2-8b-instruct)
- **License:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Activated LoRA
Activated LoRA (aLoRA) is a new low rank adapter architecture that allows for reusing existing base model KV cache for more efficient inference. 

Whitepaper

[IBM Research Blogpost](https://research.ibm.com/blog/inference-friendly-aloras-lora)

[Github - needed to run inference](https://github.com/IBM/activated-lora)



## Usage

<!-- Address questions around how the model is intended to be used, including the foreseeable users of the model and those affected by the model. -->

### Intended use

This is an experimental aLoRA testing new functionality being developed for IBM's Granite LLM family.  We are welcoming the community to test it out and give us feedback, but we are NOT recommending this model be used for real deployments at this time.  Stay tuned for more updates on the Granite roadmap.

**Usage steps** Given a generation task and a set of requirements:

1. Use the base model to generate a response as normal (via the `assistant` role), with the prompt describing the task followed by "Requirements:"" and the list of active requirements.
2. Repeat the requirement to be checked.
3. The Requirement Checker model will respond with "Y" or "N", where "Y" means the requirement is satisfied. Note, any additional text after the "Y/N" can be ignored.  You can curb additional generation by setting "max token length" = 1.


### Quickstart Example

The following code describes how to use the Granite Uncertainty model to answer questions and obtain intrinsic calibrated certainty scores. 

The code required for Activated LoRA is on [Github](https://github.com/IBM/activated-lora) 

Prior to running the code below, either clone the repo or install as

```
pip install git+ssh://git@github.com:IBM/activated-lora.git
```

Note that two generation options are shown - one illustrating the KV cache reuse ability of aLoRA (faster), and another showing the simplest generation call (slower).
```python
import torch,os
from transformers import AutoTokenizer,  AutoModelForCausalLM, DynamicCache
from alora.peft_model_alora import aLoRAPeftModelForCausalLM
from alora.config import aLoraConfig
from alora.tokenize_alora import tokenize_alora

REUSE_CACHE = False  

token = os.getenv("HF_MISTRAL_TOKEN")
BASE_NAME = "ibm-granite/granite-3.2-8b-instruct"
LORA_NAME = "ibm-granite/granite-3.2-8b-alora-requirement-check"
device=torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load model
tokenizer = AutoTokenizer.from_pretrained(BASE_NAME,padding_side='left',trust_remote_code=True, token=token)
model_base = AutoModelForCausalLM.from_pretrained(BASE_NAME,device_map="auto")
model_req_check = aLoRAPeftModelForCausalLM.from_pretrained(model_base, LORA_NAME)

question = "What is IBM Research?"
print("Question:" + question)
question_chat = [
    {
        "role": "user",
        "content": question
    },
]

# Generate answer with base model
input_text = tokenizer.apply_chat_template(question_chat,tokenize=False,add_generation_prompt=True)
# Remove default system prompt
len_sys = len(input_text.split("<|start_of_role|>user"))
input_text = input_text[len_sys:]

#tokenize
inputs = tokenizer(input_text, return_tensors="pt")
if REUSE_CACHE: #save KV cache for future aLoRA call
    prompt_cache = DynamicCache()
    with model_req_check.disable_adapter():
        output_dict = model_base.generate(inputs["input_ids"].to(device), attention_mask=inputs["attention_mask"].to(device), max_new_tokens=600,past_key_values = prompt_cache, return_dict_in_generate=True)
    answer_cache = output_dict.past_key_values
    output = output_dict.sequences
else: #simplest call
    with model_req_check.disable_adapter():
        output = model_req_check.generate(inputs["input_ids"].to(device), attention_mask=inputs["attention_mask"].to(device), max_new_tokens=600)
output_text = tokenizer.decode(output[0])
answer = output_text.split("assistant<|end_of_role|>")[1]
print("Answer: " + answer)

# Generate requirement check
req_generation_prompt = "<|start_of_role|>check_requirement<|end_of_role|>"
req_chat = question_chat + [
    {
        "role": "assistant",
        "content": answer
    },
]

req_text = tokenizer.apply_chat_template(req_chat,tokenize=False) 
req_text = req_text[len_sys:]
# tokenize and generate
inputs, alora_offsets = tokenize_alora(tokenizer,req_text, req_generation_prompt)

if REUSE_CACHE: #reuse KV cache from earlier answer generation 
    output = model_req_check.generate(inputs["input_ids"].to(device), attention_mask=inputs["attention_mask"].to(device), max_new_tokens=1,alora_offsets=alora_offsets,past_key_values=answer_cache)
else: #simplest call
    output = model_req_check.generate(inputs["input_ids"].to(device), attention_mask=inputs["attention_mask"].to(device), max_new_tokens=1,alora_offsets=alora_offsets)
output_text = tokenizer.decode(output[0])

# Extract score
req_score = output_text[-1]
print("Requirement Satisfied: " + req_score)
```


## Evaluation

The model was evaluated on held-out synthetic data. Classification error rate is 3.5%.



## Training Details
The **Granite Requirement Checker 3.2 8b** model is an aLoRA adapter finetuned to check whether the specified requirement was satisfied by the last assisstant turn generation.



### Training Data
Synthetic data generated by Mixtral 8x22b.



## Model Card Authors 

Kristjan Greenewald
Bo Wu