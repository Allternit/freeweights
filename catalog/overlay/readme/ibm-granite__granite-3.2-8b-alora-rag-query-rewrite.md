# Granite 3.2 8B Instruct - Query Rewrite aLoRA

Welcome to Granite Experiments!

Think of Experiments as a preview of what's to come. These projects are still under development, but we wanted to let the open-source community take them for spin! Use them, break them, and help us build what's next for Granite – we'll keep an eye out for feedback and questions. Happy exploring!

## Model Summary

**Granite 3.2 8b Instruct - Query Rewrite** is an Activated LoRA (aLoRA) adapter for [ibm-granite/granite-3.2-8b-instruct](https://huggingface.co/ibm-granite/granite-3.2-8b-instruct) that is fine-tuned for the query rewrite task in multi-turn conversations: 

    Given a multi-turn conversation between a user and an AI assistant, decontextualize the last 
    user utterance (query) by rewriting it (whenever necessary) into an equivalent version that 
    is standalone and can be understood by itself.

In addition to query rewrite, the adapter retains the full abilities of the [ibm-granite/granite-3.2-8b-instruct](https://huggingface.co/ibm-granite/granite-3.2-8b-instruct) model. 

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

This is a LoRA adaptor that gives the ability to rewrite the last user query in a multi-turn conversation. The rewrite is a form of expansion that inlines into the query any implicit references that are made to entities, concepts, or even parts of the conversation that occur in the previous turns (either by the user or the AI assistant). Such expansion can include coreference resolution (i.e., replacement of pronouns with the actual entities), handling of ellipsis, which is the common linguistic phenomenon where parts of a sentence or phrase are omitted by the user, but can be understood from the context (i.e., for whom, of what, with respect to something discussed above, etc.).

As a result of the expansion, the query becomes a standalone query, still equivalent in meaning with what the user asked in the last turn. The rewritten query can be sent to downstream tasks (e.g., to a retriever in a RAG setting) as a better replacement for the original user query, and without the need for (a potentially very long) context. 

**Model input**: The input to the model is a list of conversational turns converted to a string using `apply_chat_template` function. These turns can alternate between the `user` and `assistant` roles, and the last turn is assumed to be from the `user`. 

To prompt the LoRA adapter to rewrite the last user turn, a special rewrite role is used to trigger the rewrite capability of the model. The role includes the keyword "rewrite" followed by a short description of the query rewrite task.

`<|start_of_role|>rewrite: Reword the final utterance from the USER into a single utterance that doesn't need the prior conversation history to understand the user's intent. If the final utterance is a clear and standalone question, please DO NOT attempt to rewrite it, rather output the last utterance as is. Your output format should be in JSON: { \"rewritten_question\": <REWRITE> }"<|end_of_role|>`

**Model output**: When prompted with the above special rewrite role, the model generates a json object, which contains a field with the actual rewritten question. 

This LoRA adapter can be used to rewrite user questions for multiple conversational use cases, including but not limited to: RAG scenarios, natural language access to databases, routing to APIs or tools. The adapter does not need any documents (that may be present in the context in a RAG setting) and uses only the dialog turns with what is being said between the user and assistant. 

### Quickstart Example

The following code describes how to use the Query Rewrite model.

The code required for Activated LoRA is on [Github](https://github.com/IBM/activated-lora) 

Prior to running the code below, either clone the repo or install as

```
pip install git+ssh://git@github.com:IBM/activated-lora.git
```

```python
import torch,os
from transformers import AutoTokenizer, AutoModelForCausalLM, DynamicCache
from alora.peft_model_alora import aLoRAPeftModelForCausalLM
from alora.config import aLoraConfig


token = os.getenv("HF_MISTRAL_TOKEN")
BASE_NAME = "ibm-granite/granite-3.2-8b-instruct"
LORA_NAME = "ibm-granite/granite-query-rewrite-3.2-8b-alora"
device=torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load model
tokenizer = AutoTokenizer.from_pretrained(BASE_NAME,padding_side='left',trust_remote_code=True, token=token)
model_base = AutoModelForCausalLM.from_pretrained(BASE_NAME,device_map="auto")
model_rewrite = aLoRAPeftModelForCausalLM.from_pretrained(model_base, LORA_NAME)

INSTRUCTION_TEXT = "Reword the final utterance from the USER into a single utterance that doesn't need the prior conversation history to understand the user's intent. If the final utterance is a clear and standalone question, please DO NOT attempt to rewrite it, rather output the last user utterance as is. "
JSON = "Your output format should be in JSON: { \"rewritten_question\": <REWRITE> }"
REWRITE_PROMPT = "<|start_of_role|>rewrite: " + INSTRUCTION_TEXT + JSON + "<|end_of_role|>"


# Input conversation
conv = [
    {
        "role":"user",
        "content":"Tim Cook is the CEO of Apple Inc."
    },
    {
        "role":"assistant",
        "content":"Yes, Tim Cook is the Chief Executive Officer of Apple Inc."
    },
    {
        "role":"user",
        "content":"and for Microsoft?"
    }
]

# Generate the query rewrite for the last turn in the above conversation
conv = [{"role":"system", "content":""}] + conv
input_text = tokenizer.apply_chat_template(conv, tokenize=False) + REWRITE_PROMPT
inputs = tokenizer(input_text, return_tensors="pt")
output = model_rewrite.generate(inputs["input_ids"].to(device), attention_mask=inputs["attention_mask"].to(device), max_new_tokens=80)
output_text = tokenizer.decode(output[0])

# Regex pattern to extract the JSON with the rewrite from the output of the model
pattern = r'\{\s*"[^"]+"\s*:\s*"[^"]*"\s*\}'
match_js = re.findall(pattern, output_text)[0]
try:
    #Parse the JSON and extract the rewrite    
    rewrite = json.loads (match_js) ['rewritten_question']
except Exception as e: 
    rewrite = match_js.split ("\"rewritten_question\": ", 1)[1]

print(f"Rewrite: {rewrite}\n")
# Rewrite: Who is the CEO of Microsoft?
```



## Training Details

The training data contains both: 1) standalone examples, which teach the adapter to refrain from rewriting user questions that are already standalone, and 2) non-standalone examples containing a diversity of patterns that are used to teach the adapter to expand the user turn so that it becomes standalone. 

### Training Data
The training data uses the publicly available Cloud corpus of technical documentation pages from [MT-RAG](https://arxiv.org/abs/2501.03468). Based on this corpus of documents, we constructed a dataset consisting of high-quality, human-created conversations, where the last turn of the conversation comes into versions: non-standalone version, and corresponding standalone version. 
The training dataset is proprietary and was obtained in combination with a third-party company who contracted the human annotators. 

#### Training Hyperparameters
The aLoRA adapter was fine-tuned using the new low rank adapter architecture (Activated LoRA) under the following regime: rank = 32, learning rate = 3e-6, number of epochs = 25, with early stopping based on validation set, and 90/10 split between training and validation.


## Evaluation

### Evaluation of retriever 
We evaluate Recall@k on the [MT-RAG](https://arxiv.org/abs/2501.03468) benchmark, under various query rewrite strategies for the retriever. All retrieved passages are obtained using the Elser retriever with the same settings as in the above paper. In addition to the adapter, we include several other baselines, including no-rewrite (where we send the last user turn to the retriever as-is), Mixtral rewrites, as well as gold rewrites (human-created) as an upper ceiling baseline. 
We evaluate on three different testsets: a) full MT-RAG dataset (842 data points with last user turns); b) the non-standalone subset of MT-RAG dataset, which is a subset of 260 (out of 842) last user turns that were annotated by humans as non-standalone (i.e., they are dependent on the prior context); c) the standalone subset of MT-RAG dataset, which is the complementary subset, with all the last user turns that were annotated by humans as standalone.

a. Evaluation of Recall@k on full MT-RAG dataset.

| Strategy                     | Recall@5        | Recall@10         |  Recall@20   |
| ---------------------------- | --------------- | ----------------- | ------------ |
| No rewrite                   |  0.486          | 0.587             |  0.665       |
| Mixtral 8x7b rewrite         |  0.522          | 0.642             |  0.72        |
| Granite 3.2-8b aLoRA rewrite |  0.541	         | 0.664             |  0.742       |
| Gold rewrite                 |  0.563	         | 0.674         	 |  0.747       |
   

b.  Evaluation of Recall@k on the non-standalone subset of MT-RAG.

| Strategy                    | Recall@5        | Recall@10         |  Recall@20   |
| --------------------------- | --------------- | ----------------- | ------------ |
| No rewrite                  |  0.263          | 0.338             |	0.435      | 
| Mixtral 8x7b rewrite        |  0.362	        | 0.488             |	0.574      |
| Granite 3.2-8b aLoRA rewrite | 0.415          | 0.535	            |   0.644      |
| Gold rewrite                |  0.479	        | 0.582             |	0.662      |

c.  Evaluation of Recall@k on the standalone subset of MT-RAG.

| Strategy                    | Recall@5        | Recall@10         |  Recall@20   |
| --------------------------- | --------------- | ----------------- | ------------ |
| No rewrite                  |  0.609	        | 0.723           	| 0.792        | 
| Mixtral 8x7b rewrite        |  0.613	        | 0.733             | 0.809        |
| Granite 3.2-8b aLoRA rewrite |  0.625         |  0.752	        | 0.818        |
| Gold rewrite                |  0.609	        | 0.723           	| 0.792        |



### Evaluation of answer generation 
We evaluate answer generation quality, with top-k passages retrieved under the various query rewrite strategies for the retriever. We choose here k = 20, but similar trends take place for other values of k. We used Granite-3.2-8b instruct as the answer generator, and [RAGAS](https://arxiv.org/abs/2309.15217) Faithfulness and [RAD-Bench](https://arxiv.org/abs/2409.12558) score as metrics for answer quality. We use the same three testsets as above. 


a. Evaluation of answer quality on full MT-RAG dataset.

| Strategy                    | RAGAS-F          | RAD-Bench        | 
| --------------------------- | ---------------- | ---------------- | 
| No rewrite                  |  0.73	         |   0.66           |  
| Mixtral 8x7b rewrite        |  0.8             |   0.68           |  
| Granite 3.2-8b aLoRA rewrite |  0.81            |   0.69            |  
| Gold rewrite                |  0.79	         |   0.69           |  

a. Evaluation of answer quality on non-standalone subset of MT-RAG. 

| Strategy                    | RAGAS-F          | RAD-Bench        | 
| --------------------------- | ---------------- | ---------------- | 
| No rewrite                  |  0.61	         |   0.62           |  
| Mixtral 8x7b rewrite        |  0.76            |   0.65           |  
| Granite 3.2-8b aLoRA rewrite |  0.77            |   0.69           |  
| Gold rewrite                |  0.8	         |   0.69           |  

a. Evaluation of answer quality on standalone MT-RAG subset.

| Strategy                    | RAGAS-F          | RAD-Bench        | 
| --------------------------- | ---------------- | ---------------- | 
| No rewrite                  |  0.79	         |   0.68           |  
| Mixtral 8x7b rewrite        |  0.82            |   0.7            |  
| Granite 3.2-8b aLoRA rewrite |  0.83            |   0.7           |  
| Gold rewrite                |  0.79	         |   0.69           |  




## Contact 

[Lucian Popa](mailto:lpopa@us.ibm.com)

