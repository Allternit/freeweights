<h1 align="center">FlagEmbedding</h1>




For more details please refer to our Github: [FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding).

**BGE-EN-ICL** primarily demonstrates the following capabilities:
- In-context learning ability: By providing few-shot examples in the query, it can significantly enhance the model's ability to handle new tasks.
- Outstanding performance: The model has achieved state-of-the-art (SOTA) performance on both BEIR and AIR-Bench.


## 📑 Open-source Plan

- [x] Checkpoint
- [x] Training Data
- [x] Technical Report
- [ ] Evaluation Pipeline

The technical report for **BGE-EN-ICL** can be found in [Making Text Embedders Few-Shot Learners](https://arxiv.org/abs/2409.15700)

## Data List

| Data                                                        | Introduction                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [public-data](https://huggingface.co/datasets/cfli/bge-e5data) | Public data identical to [e5-mistral](https://huggingface.co/intfloat/e5-mistral-7b-instruct) |
| [full-data](https://huggingface.co/datasets/cfli/bge-full-data) | The full dataset we used for training |

## Usage 

### Using FlagEmbedding
```
git clone https://github.com/FlagOpen/FlagEmbedding.git
cd FlagEmbedding
pip install -e .
```

```python
from FlagEmbedding import FlagICLModel
queries = ["how much protein should a female eat", "summit define"]
documents = [
    "As a general guideline, the CDC's average requirement of protein for women ages 19 to 70 is 46 grams per day. But, as you can see from this chart, you'll need to increase that if you're expecting or training for a marathon. Check out the chart below to see how much protein you should be eating each day.",
    "Definition of summit for English Language Learners. : 1  the highest point of a mountain : the top of a mountain. : 2  the highest level. : 3  a meeting or series of meetings between the leaders of two or more governments."
]
examples = [
  {'instruct': 'Given a web search query, retrieve relevant passages that answer the query.',
   'query': 'what is a virtual interface',
   'response': "A virtual interface is a software-defined abstraction that mimics the behavior and characteristics of a physical network interface. It allows multiple logical network connections to share the same physical network interface, enabling efficient utilization of network resources. Virtual interfaces are commonly used in virtualization technologies such as virtual machines and containers to provide network connectivity without requiring dedicated hardware. They facilitate flexible network configurations and help in isolating network traffic for security and management purposes."},
  {'instruct': 'Given a web search query, retrieve relevant passages that answer the query.',
   'query': 'causes of back pain in female for a week',
   'response': "Back pain in females lasting a week can stem from various factors. Common causes include muscle strain due to lifting heavy objects or improper posture, spinal issues like herniated discs or osteoporosis, menstrual cramps causing referred pain, urinary tract infections, or pelvic inflammatory disease. Pregnancy-related changes can also contribute. Stress and lack of physical activity may exacerbate symptoms. Proper diagnosis by a healthcare professional is crucial for effective treatment and management."}
]
model = FlagICLModel('BAAI/bge-en-icl', 
                     query_instruction_for_retrieval="Given a web search query, retrieve relevant passages that answer the query.",
                     examples_for_task=examples,  # set `examples_for_task=None` to use model without examples
                     use_fp16=True) # Setting use_fp16 to True speeds up computation with a slight performance degradation
embeddings_1 = model.encode_queries(queries)
embeddings_2 = model.encode_corpus(documents)
similarity = embeddings_1 @ embeddings_2.T
print(similarity)
```

By default, FlagICLModel will use all available GPUs when encoding. Please set `os.environ["CUDA_VISIBLE_DEVICES"]` to select specific GPUs.
You also can set `os.environ["CUDA_VISIBLE_DEVICES"]=""` to make all GPUs unavailable.


### Using HuggingFace Transformers

With the transformers package, you can use the model like this: First, you pass your input through the transformer model, then you select the last hidden state of the first token (i.e., [CLS]) as the sentence embedding.

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
    return f'<instruct>{task_description}\n<query>{query}'

def get_detailed_example(task_description: str, query: str, response: str) -> str:
    return f'<instruct>{task_description}\n<query>{query}\n<response>{response}'

def get_new_queries(queries, query_max_len, examples_prefix, tokenizer):
    inputs = tokenizer(
        queries,
        max_length=query_max_len - len(tokenizer('<s>', add_special_tokens=False)['input_ids']) - len(
            tokenizer('\n<response></s>', add_special_tokens=False)['input_ids']),
        return_token_type_ids=False,
        truncation=True,
        return_tensors=None,
        add_special_tokens=False
    )
    prefix_ids = tokenizer(examples_prefix, add_special_tokens=False)['input_ids']
    suffix_ids = tokenizer('\n<response>', add_special_tokens=False)['input_ids']
    new_max_length = (len(prefix_ids) + len(suffix_ids) + query_max_len + 8) // 8 * 8 + 8
    new_queries = tokenizer.batch_decode(inputs['input_ids'])
    for i in range(len(new_queries)):
        new_queries[i] = examples_prefix + new_queries[i] + '\n<response>'
    return new_max_length, new_queries

task = 'Given a web search query, retrieve relevant passages that answer the query.'
examples = [
  {'instruct': 'Given a web search query, retrieve relevant passages that answer the query.',
   'query': 'what is a virtual interface',
   'response': "A virtual interface is a software-defined abstraction that mimics the behavior and characteristics of a physical network interface. It allows multiple logical network connections to share the same physical network interface, enabling efficient utilization of network resources. Virtual interfaces are commonly used in virtualization technologies such as virtual machines and containers to provide network connectivity without requiring dedicated hardware. They facilitate flexible network configurations and help in isolating network traffic for security and management purposes."},
  {'instruct': 'Given a web search query, retrieve relevant passages that answer the query.',
   'query': 'causes of back pain in female for a week',
   'response': "Back pain in females lasting a week can stem from various factors. Common causes include muscle strain due to lifting heavy objects or improper posture, spinal issues like herniated discs or osteoporosis, menstrual cramps causing referred pain, urinary tract infections, or pelvic inflammatory disease. Pregnancy-related changes can also contribute. Stress and lack of physical activity may exacerbate symptoms. Proper diagnosis by a healthcare professional is crucial for effective treatment and management."}
]
examples = [get_detailed_example(e['instruct'], e['query'], e['response']) for e in examples]
examples_prefix = '\n\n'.join(examples) + '\n\n' # if there not exists any examples, just set examples_prefix = ''
queries = [
    get_detailed_instruct(task, 'how much protein should a female eat'),
    get_detailed_instruct(task, 'summit define')
]
documents = [
    "As a general guideline, the CDC's average requirement of protein for women ages 19 to 70 is 46 grams per day. But, as you can see from this chart, you'll need to increase that if you're expecting or training for a marathon. Check out the chart below to see how much protein you should be eating each day.",
    "Definition of summit for English Language Learners. : 1  the highest point of a mountain : the top of a mountain. : 2  the highest level. : 3  a meeting or series of meetings between the leaders of two or more governments."
]
query_max_len, doc_max_len = 512, 512

tokenizer = AutoTokenizer.from_pretrained('BAAI/bge-en-icl')
model = AutoModel.from_pretrained('BAAI/bge-en-icl')
model.eval()

new_query_max_len, new_queries = get_new_queries(queries, query_max_len, examples_prefix, tokenizer)

query_batch_dict = tokenizer(new_queries, max_length=new_query_max_len, padding=True, truncation=True, return_tensors='pt')
doc_batch_dict = tokenizer(documents, max_length=doc_max_len, padding=True, truncation=True, return_tensors='pt')

with torch.no_grad():
    query_outputs = model(**query_batch_dict)
    query_embeddings = last_token_pool(query_outputs.last_hidden_state, query_batch_dict['attention_mask'])
    doc_outputs = model(**doc_batch_dict)
    doc_embeddings = last_token_pool(doc_outputs.last_hidden_state, doc_batch_dict['attention_mask'])
    
# normalize embeddings
query_embeddings = F.normalize(query_embeddings, p=2, dim=1)
doc_embeddings = F.normalize(doc_embeddings, p=2, dim=1)
scores = (query_embeddings @ doc_embeddings.T) * 100
print(scores.tolist())
```


## Evaluation  

`bge-en-icl` achieve **state-of-the-art performance on both MTEB and AIR-Bench leaderboard!**

- **[MTEB](https://huggingface.co/spaces/mteb/leaderboard)**:

![BEIR](./results/MTEB.png)   

- **[BEIR](https://huggingface.co/spaces/mteb/leaderboard)**: 

![BEIR](./results/BEIR.png)

- **[AIR-Bench](https://huggingface.co/spaces/AIR-Bench/leaderboard)**: 

**QA (en, nDCG@10):**

|       AIR-Bench_24.04        |   wiki    |    web    |   news    | healthcare |    law    |  finance  |   arxiv   |  msmarco  |  ALL (8)  |
| :--------------------------: | :-------: | :-------: | :-------: | :--------: | :-------: | :-------: | :-------: | :-------: | :-------: |
|  **e5-mistral-7b-instruct**  |   61.67   |   44.41   |   48.18   |   56.32    |   19.32   |   54.79   |   44.78   |   59.03   |   48.56   |
|  **SFR-Embedding-Mistral**   |   63.46   |   51.27   |   52.21   |   58.76    |   23.27   |   56.94   |   47.75   |   58.99   |   51.58   |
|       **NV-Embed-v1**        |   62.84   |   50.42   |   51.46   |   58.53    |   20.65   |   49.89   |   46.10   |   60.27   |   50.02   |
|    **Linq-Embed-Mistral**    |   61.04   |   48.41   |   49.44   | **60.18**  |   20.34   |   50.04   |   47.56   |   60.50   |   49.69   |
|  **gte-Qwen2-7B-instruct**   |   63.46   |   51.20   |   54.07   |   54.20    |   22.31   | **58.20** |   40.27   |   58.39   |   50.26   |
|    **stella_en_1.5B_v5**     |   61.99   |   50.88   |   53.87   |   58.81    |   23.22   |   57.26   |   44.81   |   61.38   |   51.53   |
| **bge-en-icl zero-shot** |   64.61   |   54.40   |   55.11   |   57.25    |   25.10   |   54.81   |   48.46   |   63.71   |   52.93   |
| **bge-en-icl few-shot**  | **64.94** | **55.11** | **56.02** |   58.85    | **28.29** |   57.16   | **50.04** | **64.50** | **54.36** |

**Long-Doc (en, Recall@10):**

|       AIR-Bench_24.04        | arxiv (4) | book (2)  | healthcare (5) |  law (4)  | ALL (15)  |
| :--------------------------: | :-------: | :-------: | :------------: | :-------: | :-------: |
|  **text-embedding-3-large**  |   74.53   |   73.16   |     65.83      |   64.47   |   68.77   |
|  **e5-mistral-7b-instruct**  |   72.14   |   72.44   |     68.44      |   62.92   |   68.49   |
|  **SFR-Embedding-Mistral**   |   72.79   |   72.41   |     67.94      |   64.83   |   69.00   |
|       **NV-Embed-v1**        |   77.65   |   75.49   |     72.38      | **69.55** |   73.45   |
|    **Linq-Embed-Mistral**    |   75.46   |   73.81   |     71.58      |   68.58   |   72.11   |
|  **gte-Qwen2-7B-instruct**   |   63.93   |   68.51   |     65.59      |   65.26   |   65.45   |
|    **stella_en_1.5B_v5**     |   73.17   |   74.38   |     70.02      |   69.32   |   71.25   |
| **bge-en-icl zero-shot** |   78.30   |   78.21   |     73.65      |   67.09   |   73.75   |
| **bge-en-icl few-shot**  | **79.63** | **79.36** |   **74.80**    |   67.79   | **74.83** |


## Model List

`bge` is short for `BAAI general embedding`.

| Model                                                                     |      Language       |                                                                                                                                                                                       |                                                                     Description                                                                      | query instruction for retrieval [1] |
|:--------------------------------------------------------------------------|:-------------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|
| [BAAI/bge-en-icl](https://huggingface.co/BAAI/bge-en-icl)         |       English       |                                                                                           -                                                                                           | A LLM-based embedding model with in-context learning capabilities, which can fully leverage the model's potential based on a few shot examples | Provide instructions and few-shot examples freely based on the given task. |
| [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)                         |    Multilingual     | [Inference](https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3#usage) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3) |         Multi-Functionality(dense retrieval, sparse retrieval, multi-vector(colbert)), Multi-Linguality, and Multi-Granularity(8192 tokens)          |  |
| [BAAI/llm-embedder](https://huggingface.co/BAAI/llm-embedder)             |       English       |                                        [Inference](./FlagEmbedding/llm_embedder/README.md) [Fine-tune](./FlagEmbedding/llm_embedder/README.md)                                        |                                  a unified embedding model to support diverse retrieval augmentation needs for LLMs                                  | See [README](./FlagEmbedding/llm_embedder/README.md) |
| [BAAI/bge-reranker-large](https://huggingface.co/BAAI/bge-reranker-large) | Chinese and English |                                 [Inference](#usage-for-reranker) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/reranker)                                 |                                         a cross-encoder model which is more accurate but less efficient [2]                                          |   |
| [BAAI/bge-reranker-base](https://huggingface.co/BAAI/bge-reranker-base)   | Chinese and English |                                 [Inference](#usage-for-reranker) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/reranker)                                 |                                         a cross-encoder model which is more accurate but less efficient [2]                                          |   |
| [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5)   |       English       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                               version 1.5 with more reasonable similarity distribution                                               | `Represent this sentence for searching relevant passages: `  |
| [BAAI/bge-base-en-v1.5](https://huggingface.co/BAAI/bge-base-en-v1.5)     |       English       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                               version 1.5 with more reasonable similarity distribution                                               | `Represent this sentence for searching relevant passages: `  |
| [BAAI/bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5)   |       English       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                               version 1.5 with more reasonable similarity distribution                                               | `Represent this sentence for searching relevant passages: `  |
| [BAAI/bge-large-zh-v1.5](https://huggingface.co/BAAI/bge-large-zh-v1.5)   |       Chinese       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                               version 1.5 with more reasonable similarity distribution                                               | `为这个句子生成表示以用于检索相关文章：`  |
| [BAAI/bge-base-zh-v1.5](https://huggingface.co/BAAI/bge-base-zh-v1.5)     |       Chinese       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                               version 1.5 with more reasonable similarity distribution                                               | `为这个句子生成表示以用于检索相关文章：`  |
| [BAAI/bge-small-zh-v1.5](https://huggingface.co/BAAI/bge-small-zh-v1.5)   |       Chinese       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                               version 1.5 with more reasonable similarity distribution                                               | `为这个句子生成表示以用于检索相关文章：`  |
| [BAAI/bge-large-en](https://huggingface.co/BAAI/bge-large-en)             |       English       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                             :trophy: rank **1st** in [MTEB](https://huggingface.co/spaces/mteb/leaderboard) leaderboard                              | `Represent this sentence for searching relevant passages: `  |
| [BAAI/bge-base-en](https://huggingface.co/BAAI/bge-base-en)               |       English       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                            a base-scale model but with similar ability to `bge-large-en`                                             | `Represent this sentence for searching relevant passages: `  |
| [BAAI/bge-small-en](https://huggingface.co/BAAI/bge-small-en)             |       English       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                                 a small-scale model but with competitive performance                                                 | `Represent this sentence for searching relevant passages: `  |
| [BAAI/bge-large-zh](https://huggingface.co/BAAI/bge-large-zh)             |       Chinese       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                      :trophy: rank **1st** in [C-MTEB](https://github.com/FlagOpen/FlagEmbedding/tree/master/C_MTEB) benchmark                       | `为这个句子生成表示以用于检索相关文章：`  |
| [BAAI/bge-base-zh](https://huggingface.co/BAAI/bge-base-zh)               |       Chinese       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                            a base-scale model but with similar ability to `bge-large-zh`                                             | `为这个句子生成表示以用于检索相关文章：`  |
| [BAAI/bge-small-zh](https://huggingface.co/BAAI/bge-small-zh)             |       Chinese       |                             [Inference](#usage-for-embedding-model) [Fine-tune](https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/finetune)                              |                                                 a small-scale model but with competitive performance                                                 | `为这个句子生成表示以用于检索相关文章：`  |





## Citation

If you find this repository useful, please consider giving a star :star: and citation

```
@misc{li2024makingtextembeddersfewshot,
      title={Making Text Embedders Few-Shot Learners}, 
      author={Chaofan Li and MingHao Qin and Shitao Xiao and Jianlyu Chen and Kun Luo and Yingxia Shao and Defu Lian and Zheng Liu},
      year={2024},
      eprint={2409.15700},
      archivePrefix={arXiv},
      primaryClass={cs.IR},
      url={https://arxiv.org/abs/2409.15700}, 
}
@misc{bge_embedding,
      title={C-Pack: Packaged Resources To Advance General Chinese Embedding}, 
      author={Shitao Xiao and Zheng Liu and Peitian Zhang and Niklas Muennighoff},
      year={2023},
      eprint={2309.07597},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

## License
FlagEmbedding is licensed under the [MIT License](https://github.com/FlagOpen/FlagEmbedding/blob/master/LICENSE).