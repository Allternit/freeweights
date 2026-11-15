## E5-mistral-7b-instruct

[Improving Text Embeddings with Large Language Models](https://arxiv.org/pdf/2401.00368.pdf). Liang Wang, Nan Yang, Xiaolong Huang, Linjun Yang, Rangan Majumder, Furu Wei, arXiv 2024

This model has 32 layers and the embedding size is 4096.

## Usage

Below is an example to encode queries and passages from the MS-MARCO passage ranking dataset.

### Sentence Transformers

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("intfloat/e5-mistral-7b-instruct")
# In case you want to reduce the maximum sequence length:
model.max_seq_length = 4096

queries = [
    "how much protein should a female eat",
    "summit define",
]
documents = [
    "As a general guideline, the CDC's average requirement of protein for women ages 19 to 70 is 46 grams per day. But, as you can see from this chart, you'll need to increase that if you're expecting or training for a marathon. Check out the chart below to see how much protein you should be eating each day.",
    "Definition of summit for English Language Learners. : 1  the highest point of a mountain : the top of a mountain. : 2  the highest level. : 3  a meeting or series of meetings between the leaders of two or more governments."
]

query_embeddings = model.encode(queries, prompt_name="web_search_query")
document_embeddings = model.encode(documents)

scores = (query_embeddings @ document_embeddings.T) * 100
print(scores.tolist())
```

Have a look at [config_sentence_transformers.json](config_sentence_transformers.json) for the prompts that are pre-configured, such as `web_search_query`, `sts_query`, and `summarization_query`. Additionally, check out [unilm/e5/utils.py](https://github.com/microsoft/unilm/blob/9c0f1ff7ca53431fe47d2637dfe253643d94185b/e5/utils.py#L106) for prompts we used for evaluation. You can use these via e.g. `model.encode(queries, prompt="Instruct: Given a claim, find documents that refute the claim\nQuery: ")`.


### Transformers

```python
import torch
import torch.nn.functional as F

from torch import Tensor
from transformers import AutoTokenizer, AutoModel


def last_token_pool(last_hidden_states: Tensor,
                 attention_mask: Tensor) -> Tensor:
    left_padding = (attention_mask[:, -1].sum() == attention_mask.shape[0])
    if left_padding:
        return last_hidden_states[:, -1]
    else:
        sequence_lengths = attention_mask.sum(dim=1) - 1
        batch_size = last_hidden_states.shape[0]
        return last_hidden_states[torch.arange(batch_size, device=last_hidden_states.device), sequence_lengths]


def get_detailed_instruct(task_description: str, query: str) -> str:
    return f'Instruct: {task_description}\nQuery: {query}'


# Each query must come with a one-sentence instruction that describes the task
task = 'Given a web search query, retrieve relevant passages that answer the query'
queries = [
    get_detailed_instruct(task, 'how much protein should a female eat'),
    get_detailed_instruct(task, 'summit define')
]
# No need to add instruction for retrieval documents
documents = [
    "As a general guideline, the CDC's average requirement of protein for women ages 19 to 70 is 46 grams per day. But, as you can see from this chart, you'll need to increase that if you're expecting or training for a marathon. Check out the chart below to see how much protein you should be eating each day.",
    "Definition of summit for English Language Learners. : 1  the highest point of a mountain : the top of a mountain. : 2  the highest level. : 3  a meeting or series of meetings between the leaders of two or more governments."
]
input_texts = queries + documents

tokenizer = AutoTokenizer.from_pretrained('intfloat/e5-mistral-7b-instruct')
model = AutoModel.from_pretrained('intfloat/e5-mistral-7b-instruct')

max_length = 4096
# Tokenize the input texts
batch_dict = tokenizer(input_texts, max_length=max_length, padding=True, truncation=True, return_tensors='pt')

outputs = model(**batch_dict)
embeddings = last_token_pool(outputs.last_hidden_state, batch_dict['attention_mask'])

# normalize embeddings
embeddings = F.normalize(embeddings, p=2, dim=1)
scores = (embeddings[:2] @ embeddings[2:].T) * 100
print(scores.tolist())
```

## Supported Languages

This model is initialized from [Mistral-7B-v0.1](https://huggingface.co/mistralai/Mistral-7B-v0.1)
and fine-tuned on a mixture of multilingual datasets.
As a result, it has some multilingual capability.
However, since Mistral-7B-v0.1 is mainly trained on English data, we recommend using this model for English only.
For multilingual use cases, please refer to [multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large).

## MTEB Benchmark Evaluation

Check out [unilm/e5](https://github.com/microsoft/unilm/tree/master/e5) to reproduce evaluation results 
on the [BEIR](https://arxiv.org/abs/2104.08663) and [MTEB benchmark](https://arxiv.org/abs/2210.07316).

## FAQ

**1. Do I need to add instructions to the query?**

Yes, this is how the model is trained, otherwise you will see a performance degradation.
The task definition should be a one-sentence instruction that describes the task.
This is a way to customize text embeddings for different scenarios through natural language instructions.

Please check out [unilm/e5/utils.py](https://github.com/microsoft/unilm/blob/9c0f1ff7ca53431fe47d2637dfe253643d94185b/e5/utils.py#L106) for instructions we used for evaluation.

On the other hand, there is no need to add instructions to the document side.

**2. Why are my reproduced results slightly different from reported in the model card?**

Different versions of `transformers` and `pytorch` could cause negligible but non-zero performance differences.

**3. Where are the LoRA-only weights?**

You can find the LoRA-only weights at [https://huggingface.co/intfloat/e5-mistral-7b-instruct/tree/main/lora](https://huggingface.co/intfloat/e5-mistral-7b-instruct/tree/main/lora).

## Citation

If you find our paper or models helpful, please consider cite as follows:

```bibtex
@article{wang2023improving,
  title={Improving Text Embeddings with Large Language Models},
  author={Wang, Liang and Yang, Nan and Huang, Xiaolong and Yang, Linjun and Majumder, Rangan and Wei, Furu},
  journal={arXiv preprint arXiv:2401.00368},
  year={2023}
}

@article{wang2022text,
  title={Text Embeddings by Weakly-Supervised Contrastive Pre-training},
  author={Wang, Liang and Yang, Nan and Huang, Xiaolong and Jiao, Binxing and Yang, Linjun and Jiang, Daxin and Majumder, Rangan and Wei, Furu},
  journal={arXiv preprint arXiv:2212.03533},
  year={2022}
}
```

## Limitations

Using this model for inputs longer than 4096 tokens is not recommended.

This model's multilingual capability is still inferior to [multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large) for some cases.

