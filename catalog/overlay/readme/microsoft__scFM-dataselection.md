# scFM-dataselection pretraining checkpoints

Model checkpoints and PCA components for **Evaluating the role of pretraining
dataset size and diversity on single-cell foundation model performance**,
DenAdel et al., *Nature Methods* (2026).

- [Paper](https://doi.org/10.1038/s41592-026-03120-y)
- [Code and preprocessing](https://github.com/microsoft/scFM-dataselection)

## Models

| Model | Count |
|---|---:|
| Geneformer | 125 |
| scVI | 125 |
| SSL/MLP | 125 |
| SCimilarity | 80 |
| PCA components | 80 |
| **Total** | **535** |

The full download is approximately **36.5 GB**: 455 neural network checkpoints
and 80 PCA component matrices.

Within `portable-checkpoints/`, models are grouped into `geneformer/`,
`scvi/`, `ssl/`, `scimilarity/` and `pca/`.

The Geneformer, scVI and SSL models cover random sampling, cell-type
reweighting and geometric sketching at 1, 10, 25, 50, 75 and 100 percent of
the pretraining corpus. The collection also includes perturbation spike-in
experiments. See `model-index.csv` for model folders and training settings.

SCimilarity includes five seeds at each of 1, 10, 25, 50 and 75 percent for
`random`, `celltype_reweighted` and `geometric_sketching` sampling, plus five
100-percent random models. Each folder contains the native encoder and
decoder weights, gene order, layer sizes and cell-type labels. These are
study-trained models, not the upstream SCimilarity pretrained models.

## Download

Use Python **3.10**. The examples below were tested on CPU.

```python
from huggingface_hub import snapshot_download

root = snapshot_download(
    repo_id="microsoft/scFM-dataselection",
    local_dir="scFM-dataselection",
)
```

From the downloaded directory:

```bash
python -m pip install -r requirements.txt
```

To download individual models, use `allow_patterns` with the model folders
listed in `model-index.csv`. Include `model-index.csv`, `tools/*`,
`public-resources/*` and `requirements.txt` to use the loading code below.
For SCimilarity alone, PyTorch is sufficient; download the model's five files
and `tools/*.py`. No cell-search database is included or required.

## Load a checkpoint

Run these examples from the downloaded directory. They use small dummy inputs.

```python
import csv
import sys
import numpy as np
import torch

sys.path.insert(0, "tools")
from portable_models import load_model

with open("model-index.csv", newline="") as stream:
    rows = list(csv.DictReader(stream))

geneformer = load_model(
    "portable-checkpoints/geneformer/random/idx_100pct_seed25"
)
with torch.no_grad():
    logits = geneformer(input_ids=torch.tensor([[2, 3, 4, 5]])).logits

ssl = load_model("portable-checkpoints/ssl/random/idx_100pct_seed25")
with torch.no_grad():
    latent, reconstruction = ssl(torch.ones(2, 19331))

scimilarity = load_model(
    "portable-checkpoints/scimilarity/random/idx_100pct_seed25"
)
with torch.no_grad():
    embedding, reconstruction = scimilarity(torch.ones(2, scimilarity.n_genes))
    # Embeddings have shape (2, 128); reconstructions have shape (2, 19331).

pca_row = next(row for row in rows if row["family"] == "PCA")
components = load_model(pca_row["portable_directory"])
projection = np.ones((2, 19331), dtype=components.dtype) @ components
```

For your own data, follow the paper's preprocessing. Geneformer requires
ranked gene inputs and normalization using the tokenizer dictionaries in
`public-resources/geneformer/`. SSL and PCA use the paper's 19,331-gene
scTab order.

SCimilarity takes expression values aligned to `scimilarity.gene_order`
(also in each model's `gene_order.tsv`), normalized to 10,000 counts per cell
and transformed with `log1p`. Its encoder returns L2-normalized embeddings.
Use `scimilarity.encoder(expression)` when only embeddings are needed;
`scimilarity.decoder(embedding)` returns reconstructed log-normalized values,
not raw counts. The bundled network classes are from SCimilarity 0.4.1 and
do not require its atlas/search dependencies.

For scVI, provide an AnnData object with raw counts in `X` and `var_names`
matching the `gene_names` order in the model's `config.json`.

```python
scvi_model = load_model(
    "portable-checkpoints/scvi/random/idx_100pct_seed25",
    adata=your_anndata,
)
latent = scvi_model.get_latent_representation()
```

## License

The model weights, PCA components and loading code are licensed under
**MIT**, except for the bundled SCimilarity network implementation, which
uses **Apache-2.0**. Geneformer tokenizer files also use Apache-2.0, and the
included SSL code uses MIT. See `LICENSE` and `THIRD_PARTY_NOTICES.md` for the full terms
and copyright notices.

## Citation

Please cite the paper when using these checkpoints:

> DenAdel, A., Hughes, M., Thoutam, A., et al. Evaluating the role of pretraining
> dataset size and diversity on single-cell foundation model performance.
> Nature Methods 23, 1447-1457 (2026).
> https://doi.org/10.1038/s41592-026-03120-y

Questions about the checkpoints can be raised in the
[paper's code repository](https://github.com/microsoft/scFM-dataselection/issues).
