# Llama.cpp Quantizations of Nomic Embed Code: A State-of-the-Art Code Retriever

[Blog](https://www.nomic.ai/blog/posts/introducing-state-of-the-art-nomic-embed-code) | [Technical Report](https://arxiv.org/abs/2412.01007) | [AWS SageMaker](https://aws.amazon.com/marketplace/seller-profile?id=seller-tpqidcj54zawi) | [Atlas Embedding and Unstructured Data Analytics Platform](https://atlas.nomic.ai)

Using <a href="https://github.com/ggml-org/llama.cpp">llama.cpp</a> commit <a href="https://github.com/ggml-org/llama.cpp/tree/11683f579b2e0efac27955945a4bcadd8e123af3">11683f579</a> for quantization.

Original model: [nomic-embed-code](https://huggingface.co/nomic-ai/nomic-embed-code)

## Usage

This model can be used with the [llama.cpp server](https://github.com/ggml-org/llama.cpp/blob/master/examples/embedding#post-v1embeddings-openai-compatible-embeddings-api) and other software that supports llama.cpp embedding models.

Queries embedded with `nomic-embed-code` must begin with the following prefix:
```
Represent this query for searching relevant code:
```

For example, the code below shows how to use the prefix to embed user questions, e.g. in a RAG application.

Start a llama.cpp server:
```
llama-server -m nomic-embed-code.Q4_0.gguf --embeddings --pooling last
```

And run this code:
```python
import requests
from textwrap import dedent

def dot(va, vb):
    return sum(a*b for a, b in zip(va, vb))
def embed(texts):
    resp = requests.post('http://localhost:8080/v1/embeddings', json={'input': texts}).json()
    return [d['embedding'] for d in resp['data']]

docs = [
    dedent("""\
    def fn(n):
        if n < 0:
            raise ValueError
        return 1 if n == 0 else n * fn(n - 1)
    """).strip(),
    dedent("""\
    def fn(n):
        print(("Fizz" * (n % 3 == 0) + "Buzz" * (n % 5 == 0)) or n)
    """).strip(),
]
docs_embed = embed(docs)

query = 'Calculate the n-th factorial'
query_embed = embed(['Represent this query for searching relevant code: ' + query])[0]
print(f'query: {query!r}')
for d, e in zip(docs, docs_embed):
    print(f'\nsimilarity {dot(query_embed, e):.2f}:\n{d}')
```

You should see output similar to this:
```
query: 'Calculate the n-th factorial'

similarity 0.49:
def fn(n):
    if n < 0:
        raise ValueError
    return 1 if n == 0 else n * fn(n - 1)

similarity 0.32:
def fn(n):
    print(("Fizz" * (n % 3 == 0) + "Buzz" * (n % 5 == 0)) or n)
```

## Download a file (not the whole branch) from below:

| Filename                                                                                                                       | Quant Type | File Size | Description                                                                                    |
| --------                                                                                                                       | ---------- | --------: | -----------                                                                                    |
| [nomic-embed-code.f32.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.f32.gguf)         | f32        |  26.35GiB | Full FP32 weights.                                                                             |
| [nomic-embed-code.f16.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.f16.gguf)         | f16        |  13.18GiB | Full FP16 weights.                                                                             |
| [nomic-embed-code.bf16.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.bf16.gguf)       | bf16       |  13.18GiB | Full BF16 weights.                                                                             |
| [nomic-embed-code.Q8\_0.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q8_0.gguf)      | Q8\_0      |   7.00GiB | Extremely high quality, generally unneeded but max available quant.                            |
| [nomic-embed-code.Q6\_K.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q6_K.gguf)      | Q6\_K      |   5.41GiB | Very high quality, near perfect, *recommended*.                                                |
| [nomic-embed-code.Q5\_K\_M.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q5_K_M.gguf) | Q5\_K\_M   |   4.72GiB | High quality, *recommended*.                                                                   |
| [nomic-embed-code.Q5\_K\_S.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q5_K_S.gguf) | Q5\_K\_S   |   4.60GiB | High quality, *recommended*.                                                                   |
| [nomic-embed-code.Q4\_1.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q4_1.gguf)      | Q4\_1      |   4.22GiB | Legacy format, similar performance to Q4\_K\_S but with improved tokens/watt on Apple silicon. |
| [nomic-embed-code.Q4\_K\_M.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q4_K_M.gguf) | Q4\_K\_M   |   4.08GiB | Good quality, default size for most use cases, *recommended*.                                  |
| [nomic-embed-code.Q4\_K\_S.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q4_K_S.gguf) | Q4\_K\_S   |   3.87GiB | Slightly lower quality with more space savings, *recommended*.                                 |
| [nomic-embed-code.Q4\_0.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q4_0.gguf)      | Q4\_0      |   3.84GiB | Legacy format, offers online repacking for ARM and AVX CPU inference.                          |
| [nomic-embed-code.Q3\_K\_L.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q3_K_L.gguf) | Q3\_K\_L   |   3.59GiB | Lower quality but usable, good for low RAM availability.                                       |
| [nomic-embed-code.Q3\_K\_M.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q3_K_M.gguf) | Q3\_K\_M   |   3.33GiB | Low quality.                                                                                   |
| [nomic-embed-code.Q3\_K\_S.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q3_K_S.gguf) | Q3\_K\_S   |   3.03GiB | Low quality, not recommended.                                                                  |
| [nomic-embed-code.Q2\_K.gguf](https://huggingface.co/nomic-ai/nomic-embed-code-GGUF/blob/main/nomic-embed-code.Q2_K.gguf)      | Q2\_K      |   2.64GiB | Very low quality but surprisingly usable.                                                      |

## Model Overview
`nomic-embed-code` is a state-of-the-art code embedding model that excels at code retrieval tasks:

- **High Performance**: Outperforms Voyage Code 3 and OpenAI Embed 3 Large on CodeSearchNet
- **Multilingual Code Support**: Trained for multiple programming languages (Python, Java, Ruby, PHP, JavaScript, Go)
- **Advanced Architecture**: 7B parameter code embedding model
- **Fully Open-Source**: Model weights, training data, and [evaluation code](https://github.com/gangiswag/cornstack/) released

| Model | Python | Java | Ruby | PHP | JavaScript | Go |
|-------|--------|------|------|-----|------------|-----|
| **Nomic Embed Code** | **81.7** | **80.5** | 81.8 | **72.3** | 77.1 | **93.8** |
| Voyage Code 3 | 80.8 | **80.5** | **84.6** | 71.7 | **79.2** | 93.2 |
| OpenAI Embed 3 Large | 70.8 | 72.9 | 75.3 | 59.6 | 68.1 | 87.6 |
| Nomic CodeRankEmbed-137M | 78.4 | 76.9 | 79.3 | 68.8 | 71.4 | 92.7 |
| CodeSage Large v2 (1B) | 74.2 | 72.3 | 76.7 | 65.2 | 72.5 | 84.6 |
| CodeSage Large (1B) | 70.8 | 70.2 | 71.9 | 61.3 | 69.5 | 83.7 |
| Qodo Embed 1 7B | 59.9 | 61.6 | 68.4 | 48.5 | 57.0 | 81.4 |

## Model Architecture

- **Total Parameters**: 7B
- **Training Approach**: Trained on the CoRNStack dataset with dual-consistency filtering and progressive hard negative mining
- **Supported Languages**: Python, Java, Ruby, PHP, JavaScript, and Go

### CoRNStack Dataset Curation

Starting with the deduplicated Stackv2, we create text-code pairs from function docstrings and respective code. We filtered out low-quality pairs where the docstring wasn't English, too short, or that contained URLs, HTML tags, or invalid characters. We additionally kept docstrings with text lengths of 256 tokens or longer to help the model learn long-range dependencies.


![image/png](https://cdn-uploads.huggingface.co/production/uploads/607997c83a565c15675055b3/rb-J54KLgg21f59Ba1jWp.png)

After the initial filtering, we used dual-consistency filtering to remove potentially noisy examples. We embed each docstring and code pair and compute the similarity between each docstring and every code example. We remove pairs from the dataset if the corresponding code example is not found in the top-2 most similar examples for a given docstring.

During training, we employ a novel curriculum-based hard negative mining strategy to ensure the model learns from challenging examples. We use a softmax-based sampling strategy to progressively sample hard negatives with increasing difficulty over time.


## Join the Nomic Community

- Nomic Embed Ecosystem: [https://www.nomic.ai/embed](https://www.nomic.ai/embed)
- Website: [https://nomic.ai](https://nomic.ai)
- Twitter: [https://twitter.com/nomic\_ai](https://twitter.com/nomic_ai)
- Discord: [https://discord.gg/myY5YDR8z8](https://discord.gg/myY5YDR8z8)

# Citation

If you find the model, dataset, or training code useful, please cite our work:

```bibtex
@misc{suresh2025cornstackhighqualitycontrastivedata,
      title={CoRNStack: High-Quality Contrastive Data for Better Code Retrieval and Reranking},
      author={Tarun Suresh and Revanth Gangi Reddy and Yifei Xu and Zach Nussbaum and Andriy Mulyar and Brandon Duderstadt and Heng Ji},
      year={2025},
      eprint={2412.01007},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2412.01007},
}
```
