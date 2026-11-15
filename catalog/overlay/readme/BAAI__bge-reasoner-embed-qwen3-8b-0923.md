<h1 align="center">BGE-Reasoner-Embed</h1>



For more details please refer to our Github: [BGE-Reasoner](https://github.com/VectorSpaceLab/agentic-search/tree/main/BGE-Reasoner).

**BGE-Reasoner-Embed-Qwen3-8B-0923** is an embedding model trained for reasoning-intensive retrieval tasks, based on [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B). It achieves an nDCG@10 of 37.1 on the [BRIGHT](https://brightbenchmark.github.io/) benchmark with original query, demonstrating its strong capability in reasoning-intensive retrieval tasks.

The search results on BRIGHT are available [here](https://huggingface.co/BAAI/bge-reasoner-embed-qwen3-8b-0923/tree/main/search_results).

## Usage 

### Using FlagEmbedding
```
git clone https://github.com/FlagOpen/FlagEmbedding.git
cd FlagEmbedding
pip install -e .
```

```python
from FlagEmbedding import FlagLLMModel
queries = [
    # taken from BRIGHT TheoT dataset, qid: examples-TheoremQA_wenhuchen/eigen_value1.json
    "Imagine you have a magical box that transforms any object you put inside it, where the object is represented by the column vector x = (x_1, x_2). The box's transformation can be represented by the matrix A = [[5, 4], [1, 2]], so when given an object x, the box outputs the new object Ax. On some special objects, this new object is just a constant multiple of the original object, λx = (λx_1, λx_2). Find both possible values of λ where this occurs — note that these are the box's eigenvalues.",
    # taken from BRIGHT TheoT dataset, qid: examples-TheoremQA_maxku/ipnetwork13-hammingdist.json
    "Imagine you're comparing three digital images that are extremely simplified down to a grid of 5 pixels each, represented by either black (0) or white (1) pixels. The images are as follows: Image A: 00000, Image B: 10101, and Image C: 01010. By counting the number of pixels that differ between each pair of images, find the smallest number of differing pixels."
]
documents = [
    # taken from BRIGHT TheoT dataset, docid: 2723
    "\\begin{definition}[Definition:Eigenvector/Linear Operator]\nLet $K$ be a field.\nLet $V$ be a vector space over $K$. \nLet $A : V \\to V$ be a linear operator.\nLet $\\lambda \\in K$ be an eigenvalue of $A$.\nA non-zero vector $v \\in V$ is an '''eigenvector corresponding to $\\lambda$''' {{iff}}:\n:$v \\in \\map \\ker {A - \\lambda I}$\nwhere: \n:$I : V \\to V$ is the identity mapping on $V$\n:$\\map \\ker {A - \\lambda I}$ denotes the kernel of $A - \\lambda I$.\nThat is, {{iff}}: \n:$A v = \\lambda v$\n\\end{definition}",
    # taken from BRIGHT TheoT dataset, docid: 14101
    "\\section{Error Correction Capability of Linear Code}\nTags: Linear Codes\n\n\\begin{theorem}\nLet $C$ be a linear code.\nLet $C$ have a minimum distance $d$.\nThen $C$ corrects $e$ transmission errors for all $e$ such that $2 e + 1 \\le d$.\n\\end{theorem}\n\n\\begin{proof}\nLet $C$ be a linear code whose master code is $V$.\nLet $c \\in C$ be a transmitted codeword.\nLet $v$ be the received word from $c$.\nBy definition, $v$ is an element of $V$.\nLet $v$ have a distance $e$ from $c$, where $2 e + 1 \\le d$.\nThus there have been $e$ transmission errors.\n{{AimForCont}} $c_1$ is a codeword of $C$, distinct from $c$, such that $\\map d {v, c_1} \\le e$.\nThen:\n{{begin-eqn}}\n{{eqn | l = \\map d {c, c_1}\n      | o = \\le\n      | r = \\map d {c, v} + \\map d {v, c_1}\n      | c = \n}}\n{{eqn | o = \\le\n      | r = e + e\n      | c = \n}}\n{{eqn | o = <\n      | r = d\n      | c = \n}}\n{{end-eqn}}\nSo $c_1$ has a distance from $c$ less than $d$.\nBut $C$ has a minimum distance $d$.\nThus $c_1$ cannot be a codeword of $C$.\nFrom this contradiction it follows that there is no codeword of $C$ closer to $v$ than $c$.\nHence there is a unique codeword of $C$ which has the smallest distance from $v$.\nHence it can be understood that $C$ has corrected the transmission errors of $v$.\n{{Qed}}\n\\end{proof}\n\n"
]
model = FlagLLMModel("BAAI/bge-reasoner-embed-qwen3-8b-0923", 
                     query_instruction_for_retrieval="Given a Math problem, retrieve relevant theorems that help answer the problem.",
                     query_instruction_format="Instruct: {}\nQuery: {}",
                     devices="cuda:0",  # set devices to "cuda:0" for testing on a single GPU
                     use_fp16=True) # Setting use_fp16 to True speeds up computation with a slight performance degradation
embeddings_1 = model.encode_queries(queries)
embeddings_2 = model.encode_corpus(documents)
similarity = embeddings_1 @ embeddings_2.T
print(similarity)
# [[0.8228 0.5386]
#  [0.575  0.6533]]
```


### Using Sentence Transformers

```python
from sentence_transformers import SentenceTransformer
import torch

# Load the model, optionally in float16 precision for faster inference
model = SentenceTransformer("BAAI/bge-reasoner-embed-qwen3-8b-0923", model_kwargs={"torch_dtype": torch.float16})


queries = [
    # taken from BRIGHT TheoT dataset, qid: examples-TheoremQA_wenhuchen/eigen_value1.json
    "Imagine you have a magical box that transforms any object you put inside it, where the object is represented by the column vector x = (x_1, x_2). The box's transformation can be represented by the matrix A = [[5, 4], [1, 2]], so when given an object x, the box outputs the new object Ax. On some special objects, this new object is just a constant multiple of the original object, λx = (λx_1, λx_2). Find both possible values of λ where this occurs — note that these are the box's eigenvalues.",
    # taken from BRIGHT TheoT dataset, qid: examples-TheoremQA_maxku/ipnetwork13-hammingdist.json
    "Imagine you're comparing three digital images that are extremely simplified down to a grid of 5 pixels each, represented by either black (0) or white (1) pixels. The images are as follows: Image A: 00000, Image B: 10101, and Image C: 01010. By counting the number of pixels that differ between each pair of images, find the smallest number of differing pixels."
]
documents = [
    # taken from BRIGHT TheoT dataset, docid: 2723
    "\\begin{definition}[Definition:Eigenvector/Linear Operator]\nLet $K$ be a field.\nLet $V$ be a vector space over $K$. \nLet $A : V \\to V$ be a linear operator.\nLet $\\lambda \\in K$ be an eigenvalue of $A$.\nA non-zero vector $v \\in V$ is an '''eigenvector corresponding to $\\lambda$''' {{iff}}:\n:$v \\in \\map \\ker {A - \\lambda I}$\nwhere: \n:$I : V \\to V$ is the identity mapping on $V$\n:$\\map \\ker {A - \\lambda I}$ denotes the kernel of $A - \\lambda I$.\nThat is, {{iff}}: \n:$A v = \\lambda v$\n\\end{definition}",
    # taken from BRIGHT TheoT dataset, docid: 14101
    "\\section{Error Correction Capability of Linear Code}\nTags: Linear Codes\n\n\\begin{theorem}\nLet $C$ be a linear code.\nLet $C$ have a minimum distance $d$.\nThen $C$ corrects $e$ transmission errors for all $e$ such that $2 e + 1 \\le d$.\n\\end{theorem}\n\n\\begin{proof}\nLet $C$ be a linear code whose master code is $V$.\nLet $c \\in C$ be a transmitted codeword.\nLet $v$ be the received word from $c$.\nBy definition, $v$ is an element of $V$.\nLet $v$ have a distance $e$ from $c$, where $2 e + 1 \\le d$.\nThus there have been $e$ transmission errors.\n{{AimForCont}} $c_1$ is a codeword of $C$, distinct from $c$, such that $\\map d {v, c_1} \\le e$.\nThen:\n{{begin-eqn}}\n{{eqn | l = \\map d {c, c_1}\n      | o = \\le\n      | r = \\map d {c, v} + \\map d {v, c_1}\n      | c = \n}}\n{{eqn | o = \\le\n      | r = e + e\n      | c = \n}}\n{{eqn | o = <\n      | r = d\n      | c = \n}}\n{{end-eqn}}\nSo $c_1$ has a distance from $c$ less than $d$.\nBut $C$ has a minimum distance $d$.\nThus $c_1$ cannot be a codeword of $C$.\nFrom this contradiction it follows that there is no codeword of $C$ closer to $v$ than $c$.\nHence there is a unique codeword of $C$ which has the smallest distance from $v$.\nHence it can be understood that $C$ has corrected the transmission errors of $v$.\n{{Qed}}\n\\end{proof}\n\n"
]

query_embeddings = model.encode(queries, prompt="Instruct: Given a Math problem, retrieve relevant theorems that help answer the problem.\nQuery: ")
document_embeddings = model.encode(documents)

# Compute the (cosine) similarity between the query and document embeddings
similarity = model.similarity(query_embeddings, document_embeddings)
print(similarity)
# tensor([[0.8228, 0.5391],
#         [0.5752, 0.6543]], dtype=torch.float16)
```


### Using HuggingFace Transformers
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


def tokenize_texts(tokenizer, texts, max_length: int, device: str):
    batch_dict = tokenizer(texts, max_length=max_length, padding=True, truncation=True, return_tensors='pt', pad_to_multiple_of=8)
    batch_dict = {k: v.to(device) for k, v in batch_dict.items()}
    return batch_dict


task = 'Given a Math problem, retrieve relevant theorems that help answer the problem.'
queries = [
    # taken from BRIGHT TheoT dataset, qid: examples-TheoremQA_wenhuchen/eigen_value1.json
    "Imagine you have a magical box that transforms any object you put inside it, where the object is represented by the column vector x = (x_1, x_2). The box's transformation can be represented by the matrix A = [[5, 4], [1, 2]], so when given an object x, the box outputs the new object Ax. On some special objects, this new object is just a constant multiple of the original object, λx = (λx_1, λx_2). Find both possible values of λ where this occurs — note that these are the box's eigenvalues.",
    # taken from BRIGHT TheoT dataset, qid: examples-TheoremQA_maxku/ipnetwork13-hammingdist.json
    "Imagine you're comparing three digital images that are extremely simplified down to a grid of 5 pixels each, represented by either black (0) or white (1) pixels. The images are as follows: Image A: 00000, Image B: 10101, and Image C: 01010. By counting the number of pixels that differ between each pair of images, find the smallest number of differing pixels."
]
queries = [get_detailed_instruct(task, q) for q in queries]
documents = [
    # taken from BRIGHT TheoT dataset, docid: 2723
    "\\begin{definition}[Definition:Eigenvector/Linear Operator]\nLet $K$ be a field.\nLet $V$ be a vector space over $K$. \nLet $A : V \\to V$ be a linear operator.\nLet $\\lambda \\in K$ be an eigenvalue of $A$.\nA non-zero vector $v \\in V$ is an '''eigenvector corresponding to $\\lambda$''' {{iff}}:\n:$v \\in \\map \\ker {A - \\lambda I}$\nwhere: \n:$I : V \\to V$ is the identity mapping on $V$\n:$\\map \\ker {A - \\lambda I}$ denotes the kernel of $A - \\lambda I$.\nThat is, {{iff}}: \n:$A v = \\lambda v$\n\\end{definition}",
    # taken from BRIGHT TheoT dataset, docid: 14101
    "\\section{Error Correction Capability of Linear Code}\nTags: Linear Codes\n\n\\begin{theorem}\nLet $C$ be a linear code.\nLet $C$ have a minimum distance $d$.\nThen $C$ corrects $e$ transmission errors for all $e$ such that $2 e + 1 \\le d$.\n\\end{theorem}\n\n\\begin{proof}\nLet $C$ be a linear code whose master code is $V$.\nLet $c \\in C$ be a transmitted codeword.\nLet $v$ be the received word from $c$.\nBy definition, $v$ is an element of $V$.\nLet $v$ have a distance $e$ from $c$, where $2 e + 1 \\le d$.\nThus there have been $e$ transmission errors.\n{{AimForCont}} $c_1$ is a codeword of $C$, distinct from $c$, such that $\\map d {v, c_1} \\le e$.\nThen:\n{{begin-eqn}}\n{{eqn | l = \\map d {c, c_1}\n      | o = \\le\n      | r = \\map d {c, v} + \\map d {v, c_1}\n      | c = \n}}\n{{eqn | o = \\le\n      | r = e + e\n      | c = \n}}\n{{eqn | o = <\n      | r = d\n      | c = \n}}\n{{end-eqn}}\nSo $c_1$ has a distance from $c$ less than $d$.\nBut $C$ has a minimum distance $d$.\nThus $c_1$ cannot be a codeword of $C$.\nFrom this contradiction it follows that there is no codeword of $C$ closer to $v$ than $c$.\nHence there is a unique codeword of $C$ which has the smallest distance from $v$.\nHence it can be understood that $C$ has corrected the transmission errors of $v$.\n{{Qed}}\n\\end{proof}\n\n"
]

tokenizer = AutoTokenizer.from_pretrained("BAAI/bge-reasoner-embed-qwen3-8b-0923")
model = AutoModel.from_pretrained("BAAI/bge-reasoner-embed-qwen3-8b-0923")
model.eval()

device = "cuda:0"   # set device to "cuda:0" for testing on a single GPU
model.to(device)
model.half()

max_length = 512
# Tokenize the input texts
query_batch_dict = tokenize_texts(tokenizer, queries, max_length, device)
doc_batch_dict = tokenize_texts(tokenizer, documents, max_length, device)

with torch.no_grad():
    query_outputs = model(**query_batch_dict)
    query_embeddings = last_token_pool(query_outputs.last_hidden_state, query_batch_dict['attention_mask'])
    
    doc_outputs = model(**doc_batch_dict)
    doc_embeddings = last_token_pool(doc_outputs.last_hidden_state, doc_batch_dict['attention_mask'])

# normalize embeddings
query_embeddings = F.normalize(query_embeddings, p=2, dim=1)
doc_embeddings = F.normalize(doc_embeddings, p=2, dim=1)
scores = (query_embeddings @ doc_embeddings.T) * 100
print(scores.cpu().tolist())
# [[82.25, 53.84375], [57.53125, 65.3125]]
```


## Evaluation  

BGE-Reasoner-Embed-Qwen3-8B-0923 exhibits strong performance in reasoning-intensive retrieval tasks, as demonstrated by its results (nDCG@10 = 37.1 using original query) on the BRIGHT benchmark. You can try reproducing the evaluation results using [this script](https://huggingface.co/BAAI/bge-reasoner-embed-qwen3-8b-0923/blob/main/evaluation_scripts/eval_bright_short.sh) (refer to [FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding/blob/master/examples/evaluation/bright/eval_bright_short.sh)).

<img src="./imgs/bright-performance.png" alt="BRIGHT Performance" style="zoom:200%;" />

Note:
- "**Avg - ALL**" refers to the average performance across **all 12 datasets** in the BRIGHT benchmark.
- "**Avg - SE**" refers to the average performance across the **7 datasets in the StackExchange subset** of the BRIGHT benchmark.
- "**Avg - CD**" refers to the average performance across the **2 datasets in the Coding subset** of the BRIGHT benchmark.
- "**Avg - MT**" refers to the average performance across the **3 datasets in the Theorem-based subset** of the BRIGHT benchmark.

> Sources of Results:
>
> [1] https://arxiv.org/pdf/2407.12883
>
> [2] https://arxiv.org/pdf/2504.20595
>
> [3] https://github.com/Debrup-61/RaDeR
>
> [4] https://seed1-5-embedding.github.io
>
> [5] https://arxiv.org/pdf/2508.07995
>
> *: results evaluated with our script

## Citation

If you find this repository useful, please consider giving a star :star: and citation

```
@article{chen2025reasonembed,
  title={ReasonEmbed: Enhanced Text Embeddings for Reasoning-Intensive Document Retrieval},
  author={Chen, Jianlyu and Lan, Junwei and Li, Chaofan and Lian, Defu and Liu, Zheng},
  journal={arXiv preprint arXiv:2510.08252},
  year={2025}
}
```
