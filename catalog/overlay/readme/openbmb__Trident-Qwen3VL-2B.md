<h1 align="center">Trident-Qwen3VL-2B</h1>

<p align="center">
  Official model for <a href="https://arxiv.org/abs/2610.11816"><i>Chaos in the Text: Revealing the Modality Preference in Mixed-Modality Retrievers</i></a>
</p>
<p align="center">
  <a href="https://chaos-in-texts.github.io/"><img src="https://img.shields.io/badge/%F0%9F%94%B1%20Project%20Page-chaos--in--texts-5b3fd1.svg" alt="Project Page"></a>
  <a href="https://arxiv.org/abs/2610.11816"><img src="https://img.shields.io/badge/arXiv-2610.11816-b31b1b.svg" alt="arXiv"></a>
  <a href="https://github.com/OpenBMB/Trident"><img src="https://img.shields.io/badge/GitHub-OpenBMB%2FTrident-blue.svg" alt="Code"></a>
  <a href="https://huggingface.co/OpenBMB/Trident-Qwen3VL-2B"><img src="https://img.shields.io/badge/%F0%9F%A4%97%20Model-Trident--Qwen3VL--2B-yellow.svg" alt="Model"></a>
  <a href="https://huggingface.co/datasets/OpenBMB/Trident-Train"><img src="https://img.shields.io/badge/%F0%9F%A4%97%20Data-Trident--Train-orange.svg" alt="Train data"></a>
  <a href="https://huggingface.co/datasets/OpenBMB/Trident-Eval"><img src="https://img.shields.io/badge/%F0%9F%A4%97%20Data-Trident--Eval-orange.svg" alt="Eval data"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"></a>
</p>

**Trident-Qwen3VL-2B** is a multimodal embedding model for **mixed-modality retrieval**. It maps text, images, and fused text-image inputs into one shared space, so a text query can rank text-only, image-only, and fused documents in a single list. It is fine-tuned from [Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct) on [Trident-Train](https://huggingface.co/datasets/OpenBMB/Trident-Train), as described in the paper [Chaos in the Text: Revealing the Modality Preference in Mixed-Modality Retrievers](https://arxiv.org/abs/2610.11816). The LoRA adapter is already merged, so no base model or [PEFT](https://github.com/huggingface/peft) is needed.

## Quickstart

**1. Set up the code and download the weights**

```bash
git clone https://github.com/OpenBMB/Trident.git
cd Trident
conda create -n trident python=3.12 -y && conda activate trident
pip install -r requirements.txt     # tested with transformers 4.57.1 (Qwen3-VL needs >= 4.57)

hf download OpenBMB/Trident-Qwen3VL-2B --local-dir checkpoints/Trident-Qwen3VL-2B
```

**2. Encode queries and documents** 

no repository clone needed

```python
import sys

CKPT = "checkpoints/Trident-Qwen3VL-2B"
sys.path.insert(0, CKPT)

from trident_embedder import TridentEmbedder

model = TridentEmbedder(CKPT)

queries = [
    {"text": "How many stores did Saint Laurent operate in Western Europe in 2020?", "images": []},
]

documents = [
    {"text": "A bar chart showing the number of Saint Laurent stores by region and year.", "images": []},  # text-only
    {"text": None, "images": ["figs/example_chart.png"]},                                                # image-only
    {"text": "Number of stores by region.", "images": ["figs/example_chart.png"]},                       # text + image
]

q = model.process(queries, role="query")
d = model.process(documents, role="doc")
print(q @ d.T)
```

run from the root of the Trident repository

```python
import sys
sys.path.insert(0, "src")

from embedding_backends.common import (
    ensure_tokenizers_thread_safety,
    ensure_transformers_special_tokens_compat,
)
from embedding_backends.trident_qwen3vl import TridentQwen3VLBackend

ensure_transformers_special_tokens_compat()
ensure_tokenizers_thread_safety()

CKPT = "checkpoints/Trident-Qwen3VL-2B"

backend = TridentQwen3VLBackend(
    {"model_type": "trident_qwen3vl", "checkpoint": CKPT, "dtype": "bfloat16"},
    device="cuda:0",
)
backend.load()


def encode(items, role):
    """items: list of {"text": str | None, "images": [paths]}; role: "query" or "doc"."""
    backend.args_dict["role"] = role
    instruction = backend.default_instruction(role)
    inputs = [{**item, "instruction": instruction} for item in items]
    embeddings, _ = backend.process(inputs, role=role)
    return embeddings  # [N, dim] numpy array, L2-normalised


queries = [
    {"text": "How many stores did Saint Laurent operate in Western Europe in 2020?", "images": []},
]

documents = [
    {"text": "A bar chart showing the number of Saint Laurent stores by region and year.", "images": []},  # text-only
    {"text": None, "images": ["figs/example_chart.png"]},                                                # image-only
    {"text": "Number of stores by region.", "images": ["figs/example_chart.png"]},                       # text + image
]

q = encode(queries, role="query")      # [1, dim]
d = encode(documents, role="doc")      # [3, dim]

scores = q @ d.T                       # cosine similarity, comparable across all document types
print(scores)
print(scores[0].argsort()[::-1])       # document ranking for the query
```

Each input is a dict with an optional `text` string and an `images` list of local image paths. Use `text` only, `images` only, or both for fused inputs. Queries and documents use different default instructions, which are part of the training format.

## About This Checkpoint

This is the **general-purpose release**, trained on the **merged** visual-document and natural-image data. It is intended for real-world use, where a corpus often contains both document images and natural images and the domain of a query is not known in advance.

It is **not** the checkpoint behind the numbers in the paper. Please note:

- **Per-domain training in the paper.** The results in Table 1 (visual documents) and Table 4 (natural images) come from two separately trained models, using the `only_vdoc` and `only_nature` subsets of [Trident-Train](https://huggingface.co/datasets/OpenBMB/Trident-Train). We do not release these per-domain checkpoints. The data and code are public, so the paper's numbers can be reproduced by training each domain separately following the paper's setup (Appendix D).
- **No Matryoshka loss.** The Matryoshka experiments (Appendix I, Fig. 17) use a separately trained version. This checkpoint was trained without the Matryoshka loss, so please use the **full 2048-dim embedding** and do not truncate it to lower dimensions.
- **Expected performance.** Compared with the paper, this merged model scores about 2–3 points lower on visual-document benchmarks and noticeably lower on natural-image benchmarks, especially in the Mix setting. The two domains differ in how well text, image, and fused views align semantically, which makes natural images more sensitive to merged training. Average NDCG@10 of this checkpoint (our re-evaluation):

| Benchmark group                        | Origin |   Mix |
| -------------------------------------- | -----: | ----: |
| Visual documents (6 datasets, Table 1) |  78.28 | 70.96 |
| Natural images (4 datasets, Table 4)   |  64.86 | 65.91 |

For paper-reported numbers (Origin / Mix averages: 80.51 / 73.90 on visual documents, 69.81 / 76.78 on natural images), please train per-domain models as described above.

## License

The Trident-specific contributions, including the fine-tuned weights, are released under the [MIT License](https://github.com/OpenBMB/Trident/blob/main/LICENSE). The model is fine-tuned from [Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct), which is released under Apache-2.0, and the base model's license terms continue to apply to the weights derived from it. The training images come from third-party datasets (see [Trident-Train](https://huggingface.co/datasets/OpenBMB/Trident-Train)) and remain subject to their original licenses.

## Citation

If you find this work useful, please cite:

```bibtex
@article{sun2026chaos,
  title={Chaos in the Text: Revealing the Modality Preference in Mixed-Modality Retrievers},
  author={Sun, Yubo and Peng, Chunyi and Yan, Yukun and Liu, Zhenghao and Xu, Zhipeng and Mei, Sen and Xin, Linlin and Zeng, Zheni and Sun, Maosong},
  journal={arXiv preprint arXiv:2610.11816},
  year={2026}
}
```
