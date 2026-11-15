## gte-Qwen2-1.5B-instruct

**gte-Qwen2-1.5B-instruct** is the latest model in the gte (General Text Embedding) model family. The model is built on [Qwen2-1.5B](https://huggingface.co/Qwen/Qwen2-1.5B) LLM model and use the same training data and strategies as the [gte-Qwen2-7B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct) model. 

The model incorporates several key advancements:

- Integration of bidirectional attention mechanisms, enriching its contextual understanding.
- Instruction tuning, applied solely on the query side for streamlined efficiency
- Comprehensive training across a vast, multilingual text corpus spanning diverse domains and scenarios. This training leverages both weakly supervised and supervised data, ensuring the model's applicability across numerous languages and a wide array of downstream tasks.


## Model Information
- Model Size: 1.5B 
- Embedding Dimension: 1536
- Max Input Tokens: 32k

## Requirements
```
transformers>=4.39.2
flash_attn>=2.5.6
```
## Usage 

### Sentence Transformers

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("Alibaba-NLP/gte-Qwen2-1.5B-instruct", trust_remote_code=True)
# In case you want to reduce the maximum length:
model.max_seq_length = 8192

queries = [
    "how much protein should a female eat",
    "summit define",
]
documents = [
    "As a general guideline, the CDC's average requirement of protein for women ages 19 to 70 is 46 grams per day. But, as you can see from this chart, you'll need to increase that if you're expecting or training for a marathon. Check out the chart below to see how much protein you should be eating each day.",
    "Definition of summit for English Language Learners. : 1  the highest point of a mountain : the top of a mountain. : 2  the highest level. : 3  a meeting or series of meetings between the leaders of two or more governments.",
]

query_embeddings = model.encode(queries, prompt_name="query")
document_embeddings = model.encode(documents)

scores = (query_embeddings @ document_embeddings.T) * 100
print(scores.tolist())
```

Observe the [config_sentence_transformers.json](config_sentence_transformers.json) to see all pre-built prompt names. Otherwise, you can use `model.encode(queries, prompt="Instruct: ...\nQuery: "` to use a custom prompt of your choice.

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

tokenizer = AutoTokenizer.from_pretrained('Alibaba-NLP/gte-Qwen2-1.5B-instruct', trust_remote_code=True)
model = AutoModel.from_pretrained('Alibaba-NLP/gte-Qwen2-1.5B-instruct', trust_remote_code=True)

max_length = 8192

# Tokenize the input texts
batch_dict = tokenizer(input_texts, max_length=max_length, padding=True, truncation=True, return_tensors='pt')
outputs = model(**batch_dict)
embeddings = last_token_pool(outputs.last_hidden_state, batch_dict['attention_mask'])

# normalize embeddings
embeddings = F.normalize(embeddings, p=2, dim=1)
scores = (embeddings[:2] @ embeddings[2:].T) * 100
print(scores.tolist())
```

### infinity_emb

Usage via [infinity, MIT Licensed](https://github.com/michaelfeil/infinity).
```bash
docker run \
--gpus "0" -p "7997":"7997" \
michaelf34/infinity:0.0.68-trt-onnx \
v2 --model-id Alibaba-NLP/gte-Qwen2-1.5B-instruct --revision "refs/pr/20" --dtype bfloat16 --batch-size 16 --device cuda --engine torch --port 7997 --no-bettertransformer
```

## Evaluation

### MTEB & C-MTEB

You can use the [scripts/eval_mteb.py](https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct/blob/main/scripts/eval_mteb.py) to reproduce the following result of **gte-Qwen2-1.5B-instruct** on MTEB(English)/C-MTEB(Chinese):

| Model Name | MTEB(56)  | C-MTEB(35) | MTEB-fr(26) | MTEB-pl(26) | 
|:----:|:---------:|:----------:|:----------:|:----------:|
| [bge-base-en-1.5](https://huggingface.co/BAAI/bge-base-en-v1.5) |   64.23   |     -      |  - | - |
| [bge-large-en-1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) |   63.55   |     -      | - | - |
| [gte-large-en-v1.5](https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5) |   65.39   |     -      |  - | - |
| [gte-base-en-v1.5](https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5) |   64.11   |     -      |  - | - |
| [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) |   64.68   |     -      |  - | - |
| [acge_text_embedding](https://huggingface.co/aspire/acge_text_embedding) |     -     |   69.07    |   - | - |
| [stella-mrl-large-zh-v3.5-1792d](https://huggingface.co/infgrad/stella-mrl-large-zh-v3.5-1792d) |     -     |   68.55    |  - | - |
| [gte-large-zh](https://huggingface.co/thenlper/gte-large-zh) |     -     |   66.72    |  - | - |
| [multilingual-e5-base](https://huggingface.co/intfloat/multilingual-e5-base) |   59.45   |   56.21    |   - | - |
| [multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large) |   61.50   |   58.81    |   - | - |
| [e5-mistral-7b-instruct](https://huggingface.co/intfloat/e5-mistral-7b-instruct) |   66.63   |   60.81    |   - | - |
| [gte-Qwen1.5-7B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen1.5-7B-instruct) |   67.34   |   69.52    |  - | - |
| [NV-Embed-v1](https://huggingface.co/nvidia/NV-Embed-v1) |   69.32   |     -      |  - | - |
| [**gte-Qwen2-7B-instruct**](https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct) | **70.24** | **72.05**  | **68.25**   | **67.86** |
| [**gte-Qwen2-1.5B-instruct**](https://huggingface.co/Alibaba-NLP/gte-Qwen2-1.5B-instruct) | **67.16** | **67.65**  | **66.60** | **64.04** |

### GTE Models

The gte series models have consistently released two types of models: encoder-only models (based on the BERT architecture) and decode-only models (based on the LLM architecture). 

|                                        Models                                         | Language | Max Sequence Length | Dimension | Model Size (Memory Usage, fp32) |
|:-------------------------------------------------------------------------------------:|:--------:|:-----: |:---------:|:-------------------------------:|
|             [GTE-large-zh](https://huggingface.co/thenlper/gte-large-zh)              | Chinese  | 512 |   1024    |             1.25GB              |
|              [GTE-base-zh](https://huggingface.co/thenlper/gte-base-zh)               | Chinese  | 512 |    512    |             0.41GB              |
|             [GTE-small-zh](https://huggingface.co/thenlper/gte-small-zh)              | Chinese  | 512 |    512    |             0.12GB              |
|                [GTE-large](https://huggingface.co/thenlper/gte-large)                 | English  | 512 |   1024    |             1.25GB              |
|                 [GTE-base](https://huggingface.co/thenlper/gte-base)                  | English  | 512 |    512    |             0.21GB              |
|                [GTE-small](https://huggingface.co/thenlper/gte-small)                 | English  | 512 |    384    |             0.10GB              |
|       [GTE-large-en-v1.5](https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5)       | English | 8192 |   1024    |             1.74GB              |
|        [GTE-base-en-v1.5](https://huggingface.co/Alibaba-NLP/gte-base-en-v1.5)        | English | 8192 |    768    |             0.51GB              |
| [GTE-Qwen1.5-7B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen1.5-7B-instruct) | Multilingual | 32000 | 4096 | 26.45GB |
|   [GTE-Qwen2-7B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct)   | Multilingual | 32000 | 3584 | 26.45GB |
|   [GTE-Qwen2-1.5B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen2-1.5B-instruct)   | Multilingual | 32000 | 1536 | 6.62GB |


## Cloud API Services

In addition to the open-source [GTE](https://huggingface.co/collections/Alibaba-NLP/gte-models-6680f0b13f885cb431e6d469) series models, GTE series models are also available as commercial API services on Alibaba Cloud.

- [Embedding Models](https://help.aliyun.com/zh/model-studio/developer-reference/general-text-embedding/): Three versions of the text embedding models are available: text-embedding-v1/v2/v3, with v3 being the latest API service.
- [ReRank Models](https://help.aliyun.com/zh/model-studio/developer-reference/general-text-sorting-model/): The gte-rerank model service is available.

Note that the models behind the commercial APIs are not entirely identical to the open-source models.

## Community support

### Fine-tuning

GTE models can be fine-tuned with a third party framework SWIFT.

```shell
pip install ms-swift -U
```

```shell
# check: https://swift.readthedocs.io/en/latest/BestPractices/Embedding.html
nproc_per_node=8
NPROC_PER_NODE=$nproc_per_node \
USE_HF=1 \
swift sft \
    --model Alibaba-NLP/gte-Qwen2-1.5B-instruct \
    --train_type lora \
    --dataset 'sentence-transformers/stsb' \
    --torch_dtype bfloat16 \
    --num_train_epochs 10 \
    --per_device_train_batch_size 2 \
    --per_device_eval_batch_size 1 \
    --gradient_accumulation_steps $(expr 64 / $nproc_per_node) \
    --eval_steps 100 \
    --save_steps 100 \
    --eval_strategy steps \
    --use_chat_template false \
    --save_total_limit 5 \
    --logging_steps 5 \
    --output_dir output \
    --warmup_ratio 0.05 \
    --learning_rate 5e-6 \
    --deepspeed zero3 \
    --dataloader_num_workers 4 \
    --task_type embedding \
    --loss_type cosine_similarity \
    --dataloader_drop_last true
```

## Citation

If you find our paper or models helpful, please consider cite:

```
@article{li2023towards,
  title={Towards general text embeddings with multi-stage contrastive learning},
  author={Li, Zehan and Zhang, Xin and Zhang, Yanzhao and Long, Dingkun and Xie, Pengjun and Zhang, Meishan},
  journal={arXiv preprint arXiv:2308.03281},
  year={2023}
}
```
