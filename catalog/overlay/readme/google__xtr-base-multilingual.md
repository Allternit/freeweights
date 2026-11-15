# XTR: Rethinking the Role of Token Retrieval in Multi-Vector Retrieval

We provide how you can run [XTR](https://arxiv.org/abs/2304.01982) on PyTorch.

We thank Mujeen Sung (https://github.com/mjeensung/xtr-pytorch) for providing this functionality.

## Installation

```
$ git clone git@github.com:mjeensung/xtr-pytorch.git
$ pip install -e .
```

## Usage
```
# Create the dataset
sample_doc = "Google LLC (/ˈɡuːɡəl/ (listen)) is an American multinational technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence..."
chunks = [chunk.lower() for chunk in sent_tokenize(sample_doc)]

# Load the XTR retriever
xtr = XtrRetriever(model_name_or_path="google/xtr-base-multilingual", use_faiss=False, device="cuda")

# Build the index
xtr.build_index(chunks)

# Retrieve top-3 documents given the query
query = "Who founded google"
retrieved_docs, metadata = xtr.retrieve_docs([query], document_top_k=3)
for rank, (did, score, doc) in enumerate(retrieved_docs[0]):
    print(f"[{rank}] doc={did} ({score:.3f}): {doc}")

"""
>> [0] doc=0 (0.925): google llc (/ˈɡuːɡəl/ (listen)) is an american multinational technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.
>> [1] doc=1 (0.903): it has been referred to as "the most powerful company in the world" and one of the world's most valuable brands due to its market dominance, data collection, and technological advantages in the area of artificial intelligence.
>> [2] doc=2 (0.900): its parent company alphabet is considered one of the big five american information technology companies, alongside amazon, apple, meta, and microsoft.
"""
```

## Citing this work

```bibtex
@article{lee2024rethinking,
  title={Rethinking the role of token retrieval in multi-vector retrieval},
  author={Lee, Jinhyuk and Dai, Zhuyun and Duddu, Sai Meher Karthik and Lei, Tao and Naim, Iftekhar and Chang, Ming-Wei and Zhao, Vincent},
  journal={Advances in Neural Information Processing Systems},
  volume={36},
  year={2024}
}
```
