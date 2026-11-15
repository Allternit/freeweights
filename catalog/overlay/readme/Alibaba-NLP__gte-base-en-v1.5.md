  
<!-- **English** | [中文](./README_zh.md) -->

# gte-base-en-v1.5

We introduce `gte-v1.5` series, upgraded `gte` embeddings that support the context length of up to **8192**, while further enhancing model performance.
The models are built upon the `transformer++` encoder [backbone](https://huggingface.co/Alibaba-NLP/new-impl) (BERT + RoPE + GLU).

The `gte-v1.5` series achieve state-of-the-art scores on the MTEB benchmark within the same model size category and prodvide competitive on the LoCo long-context retrieval tests (refer to [Evaluation](#evaluation)).

We also present the [`gte-Qwen1.5-7B-instruct`](https://huggingface.co/Alibaba-NLP/gte-Qwen1.5-7B-instruct),
a SOTA instruction-tuned multi-lingual embedding model that ranked 2nd in MTEB and 1st in C-MTEB.

<!-- Provide a longer summary of what this model is. -->

- **Developed by:** Institute for Intelligent Computing, Alibaba Group
- **Model type:** Text Embeddings
- **Paper:** [mGTE: Generalized Long-Context Text Representation and Reranking
Models for Multilingual Text Retrieval](https://arxiv.org/pdf/2407.19669)

<!-- - **Demo [optional]:** [More Information Needed] -->

### Model list

| Models | Language | Model Size | Max Seq. Length | Dimension | MTEB-en | LoCo |
|:-----: | :-----: |:-----: |:-----: |:-----: | :-----: | :-----: |
|[`gte-Qwen1.5-7B-instruct`](https://huggingface.co/Alibaba-NLP/gte-Qwen1.5-7B-instruct)| Multiple | 7720 | 32768 | 4096 | 67.34 | 87.57 |
|[`gte-large-en-v1.5`](https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5) | English | 434 | 8192 | 1024 | 65.39 | 86.71 |
|[`gte-base-en-v1.5`](https://huggingface.co/Alibaba-NLP/gte-base-en-v1.5) | English | 137 | 8192 | 768 | 64.11 | 87.44 |


## How to Get Started with the Model

Use the code below to get started with the model.

```python
# Requires transformers>=4.36.0

import torch.nn.functional as F
from transformers import AutoModel, AutoTokenizer

input_texts = [
    "what is the capital of China?",
    "how to implement quick sort in python?",
    "Beijing",
    "sorting algorithms"
]

model_path = 'Alibaba-NLP/gte-base-en-v1.5'
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModel.from_pretrained(model_path, trust_remote_code=True)

# Tokenize the input texts
batch_dict = tokenizer(input_texts, max_length=8192, padding=True, truncation=True, return_tensors='pt')

outputs = model(**batch_dict)
embeddings = outputs.last_hidden_state[:, 0]
 
# (Optionally) normalize embeddings
embeddings = F.normalize(embeddings, p=2, dim=1)
scores = (embeddings[:1] @ embeddings[1:].T) * 100
print(scores.tolist())
```

**It is recommended to install xformers and enable unpadding for acceleration, refer to [enable-unpadding-and-xformers](https://huggingface.co/Alibaba-NLP/new-impl#recommendation-enable-unpadding-and-acceleration-with-xformers).**


Use with `sentence-transformers`:

```python
# Requires sentence_transformers>=2.7.0

from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

sentences = ['That is a happy person', 'That is a very happy person']

model = SentenceTransformer('Alibaba-NLP/gte-base-en-v1.5', trust_remote_code=True)
embeddings = model.encode(sentences)
print(cos_sim(embeddings[0], embeddings[1]))
```

Use with `transformers.js`:

```js
// npm i @xenova/transformers
import { pipeline, dot } from '@xenova/transformers';

// Create feature extraction pipeline
const extractor = await pipeline('feature-extraction', 'Alibaba-NLP/gte-base-en-v1.5', {
    quantized: false, // Comment out this line to use the quantized version
});

// Generate sentence embeddings
const sentences = [
    "what is the capital of China?",
    "how to implement quick sort in python?",
    "Beijing",
    "sorting algorithms"
]
const output = await extractor(sentences, { normalize: true, pooling: 'cls' });

// Compute similarity scores
const [source_embeddings, ...document_embeddings ] = output.tolist();
const similarities = document_embeddings.map(x => 100 * dot(source_embeddings, x));
console.log(similarities); // [34.504930869007296, 64.03973265120138, 19.520042686034362]
```

Use with infinity:
[Infinity](https://github.com/michaelfeil/infinity) is a MIT licensed server for OpenAI-compatible deployment.
```
docker run --gpus all -v $PWD/data:/app/.cache -p "7997":"7997" \
michaelf34/infinity:0.0.68 \
v2 --model-id Alibaba-NLP/gte-base-en-v1.5 --revision "4c742dc2b781e4ab062a4a77f4f7cbad4bdee970" --dtype bfloat16 --batch-size 32 --device cuda --engine torch --port 7997
```

## Training Details

### Training Data

- Masked language modeling (MLM): `c4-en`
- Weak-supervised contrastive pre-training (CPT): [GTE](https://arxiv.org/pdf/2308.03281.pdf) pre-training data
- Supervised contrastive fine-tuning: [GTE](https://arxiv.org/pdf/2308.03281.pdf) fine-tuning data

### Training Procedure

To enable the backbone model to support a context length of 8192, we adopted a multi-stage training strategy.
The model first undergoes preliminary MLM pre-training on shorter lengths.
And then, we resample the data, reducing the proportion of short texts, and continue the MLM pre-training.

The entire training process is as follows:
- MLM-2048: lr 5e-4, mlm_probability 0.3, batch_size 4096, num_steps 70000, rope_base 10000
- [MLM-8192](https://huggingface.co/Alibaba-NLP/gte-en-mlm-base): lr 5e-5, mlm_probability 0.3, batch_size 1024, num_steps 20000, rope_base 500000
- CPT: max_len 512, lr 2e-4, batch_size 32768, num_steps 100000
- Fine-tuning: TODO


## Evaluation


### MTEB

The results of other models are retrieved from [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard).

The gte evaluation setting: `mteb==1.2.0, fp16 auto mix precision, max_length=8192`, and set ntk scaling factor to 2 (equivalent to rope_base * 2).

| Model Name | Param Size (M) | Dimension | Sequence Length | Average (56) | Class. (12) | Clust. (11) | Pair Class. (3) | Reran. (4) | Retr. (15) | STS (10) | Summ. (1) |
|:----:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| [**gte-large-en-v1.5**](https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5) | 434 | 1024 | 8192 | **65.39** | 77.75 | 47.95 | 84.63 | 58.50 | 57.91 | 81.43 | 30.91 |
| [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) | 335 | 1024 | 512 | 64.68 | 75.64 | 46.71 | 87.2 | 60.11 | 54.39 | 85 | 32.71 |
| [multilingual-e5-large-instruct](https://huggingface.co/intfloat/multilingual-e5-large-instruct) | 560 | 1024 | 514 | 64.41 | 77.56 | 47.1 | 86.19 | 58.58 | 52.47 | 84.78 | 30.39 |
| [bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5)| 335 | 1024 | 512 | 64.23 | 75.97 | 46.08 | 87.12 | 60.03 | 54.29 | 83.11 | 31.61 |
| [**gte-base-en-v1.5**](https://huggingface.co/Alibaba-NLP/gte-base-en-v1.5) | 137 | 768 | 8192 | **64.11** | 77.17 | 46.82 | 85.33 | 57.66 | 54.09 | 81.97 | 31.17 |
| [bge-base-en-v1.5](https://huggingface.co/BAAI/bge-base-en-v1.5)| 109 | 768 | 512 | 63.55 | 75.53 | 45.77 | 86.55 | 58.86 | 53.25 | 82.4 | 31.07 |


### LoCo

| Model Name |  Dimension | Sequence Length | Average (5) | QsmsumRetrieval | SummScreenRetrieval | QasperAbastractRetrieval | QasperTitleRetrieval |  GovReportRetrieval |
|:----:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| [gte-qwen1.5-7b](https://huggingface.co/Alibaba-NLP/gte-qwen1.5-7b) | 4096 | 32768 |  87.57 | 49.37 | 93.10 | 99.67 | 97.54 | 98.21 | 
| [gte-large-v1.5](https://huggingface.co/Alibaba-NLP/gte-large-v1.5) |1024 | 8192 | 86.71 | 44.55 | 92.61 | 99.82 | 97.81 | 98.74 |
| [gte-base-v1.5](https://huggingface.co/Alibaba-NLP/gte-base-v1.5) | 768 | 8192 | 87.44 | 49.91  | 91.78 | 99.82 | 97.13 | 98.58 |



## Citation
If you find our paper or models helpful, please consider citing them as follows:

```
@misc{zhang2024mgte,
  title={mGTE: Generalized Long-Context Text Representation and Reranking Models for Multilingual Text Retrieval}, 
  author={Xin Zhang and Yanzhao Zhang and Dingkun Long and Wen Xie and Ziqi Dai and Jialong Tang and Huan Lin and Baosong Yang and Pengjun Xie and Fei Huang and Meishan Zhang and Wenjie Li and Min Zhang},
  year={2024},
  eprint={2407.19669},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
  url={https://arxiv.org/abs/2407.19669}, 
}
@misc{li2023gte,
  title={Towards General Text Embeddings with Multi-stage Contrastive Learning}, 
  author={Zehan Li and Xin Zhang and Yanzhao Zhang and Dingkun Long and Pengjun Xie and Meishan Zhang},
  year={2023},
  eprint={2308.03281},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
  url={https://arxiv.org/abs/2308.03281}, 
}
```
