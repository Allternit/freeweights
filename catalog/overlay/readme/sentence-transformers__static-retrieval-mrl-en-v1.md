# Static Embeddings with BERT uncased tokenizer finetuned on various datasets

This is a [sentence-transformers](https://www.SBERT.net) model trained on the [gooaq](https://huggingface.co/datasets/sentence-transformers/gooaq), [msmarco](https://huggingface.co/datasets/sentence-transformers/msmarco-co-condenser-margin-mse-sym-mnrl-mean-v1), [squad](https://huggingface.co/datasets/sentence-transformers/squad), [s2orc](https://huggingface.co/datasets/sentence-transformers/s2orc), [allnli](https://huggingface.co/datasets/sentence-transformers/all-nli), [paq](https://huggingface.co/datasets/sentence-transformers/paq), [trivia_qa](https://huggingface.co/datasets/sentence-transformers/trivia-qa), [msmarco_10m](https://huggingface.co/datasets/bclavie/msmarco-10m-triplets), [swim_ir](https://huggingface.co/datasets/nthakur/swim-ir-monolingual), [pubmedqa](https://huggingface.co/datasets/sentence-transformers/pubmedqa), [miracl](https://huggingface.co/datasets/sentence-transformers/miracl), [mldr](https://huggingface.co/datasets/sentence-transformers/mldr) and [mr_tydi](https://huggingface.co/datasets/sentence-transformers/mr-tydi) datasets. It maps sentences & paragraphs to a 1024-dimensional dense vector space and is designed to be used for semantic search.

Read our [Static Embeddings blogpost](https://huggingface.co/blog/static-embeddings) to learn more about this model and how it was trained.

* **0 Active Parameters:** This model does not use any active parameters, instead consisting exclusively of averaging pre-computed token embeddings.
* **100x to 400x faster:** On CPU, this model is 100x to 400x faster than common options like [all-mpnet-base-v2](https://huggingface.co/sentence-transformers/all-mpnet-base-v2). On GPU, it's 10x to 25x faster.
* **Matryoshka:** This model was trained with a [Matryoshka loss](https://huggingface.co/blog/matryoshka), allowing you to truncate the embeddings for faster retrieval at minimal performance costs.
* **Evaluations:** See [Evaluations](#evaluation) for details on performance on NanoBEIR, embedding speed, and Matryoshka dimensionality truncation. In short, this model is **87.4%** as performant as the commonly used [`all-mpnet-base-v2`](https://huggingface.co/sentence-transformers/all-mpnet-base-v2).
* **Training Script:** See [train.py](train.py) for the training script used to train this model from scratch.

See [`static-similarity-mrl-multilingual-v1`](https://huggingface.co/sentence-transformers/static-similarity-mrl-multilingual-v1) for a general-purpose multilingual static embedding model. It's been trained for semantic textual similarity, paraphrase mining, text classification, clustering, and more.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
<!-- - **Base model:** [Unknown](https://huggingface.co/unknown) -->
- **Maximum Sequence Length:** inf tokens
- **Output Dimensionality:** 1024 tokens
- **Similarity Function:** Cosine Similarity
- **Training Datasets:**
    - [gooaq](https://huggingface.co/datasets/sentence-transformers/gooaq)
    - [msmarco](https://huggingface.co/datasets/sentence-transformers/msmarco-co-condenser-margin-mse-sym-mnrl-mean-v1)
    - [squad](https://huggingface.co/datasets/sentence-transformers/squad)
    - [s2orc](https://huggingface.co/datasets/sentence-transformers/s2orc)
    - [allnli](https://huggingface.co/datasets/sentence-transformers/all-nli)
    - [paq](https://huggingface.co/datasets/sentence-transformers/paq)
    - [trivia_qa](https://huggingface.co/datasets/sentence-transformers/trivia-qa)
    - [msmarco_10m](https://huggingface.co/datasets/bclavie/msmarco-10m-triplets)
    - [swim_ir](https://huggingface.co/datasets/nthakur/swim-ir-monolingual)
    - [pubmedqa](https://huggingface.co/datasets/sentence-transformers/pubmedqa)
    - [miracl](https://huggingface.co/datasets/sentence-transformers/miracl)
    - [mldr](https://huggingface.co/datasets/sentence-transformers/mldr)
    - [mr_tydi](https://huggingface.co/datasets/sentence-transformers/mr-tydi)
- **Language:** en
- **License:** apache-2.0

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/UKPLab/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): StaticEmbedding(
    (embedding): EmbeddingBag(30522, 1024, mode='mean')
  )
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```

Then you can load this model and run inference.
```python
from sentence_transformers import SentenceTransformer

# Download from the 🤗 Hub
model = SentenceTransformer("tomaarsen/static-retrieval-mrl-en-v1")
# Run inference
sentences = [
    'Gadofosveset-enhanced MR angiography of carotid arteries: does steady-state imaging improve accuracy of first-pass imaging?',
    'To evaluate the diagnostic accuracy of gadofosveset-enhanced magnetic resonance (MR) angiography in the assessment of carotid artery stenosis, with digital subtraction angiography (DSA) as the reference standard, and to determine the value of reading first-pass, steady-state, and "combined" (first-pass plus steady-state) MR angiograms.',
    'In a longitudinal study we investigated in vivo alterations of CVO during neuroinflammation, applying Gadofluorine M- (Gf) enhanced magnetic resonance imaging (MRI) in experimental autoimmune encephalomyelitis, an animal model of multiple sclerosis. SJL/J mice were monitored by Gadopentate dimeglumine- (Gd-DTPA) and Gf-enhanced MRI after adoptive transfer of proteolipid-protein-specific T cells. Mean Gf intensity ratios were calculated individually for different CVO and correlated to the clinical disease course. Subsequently, the tissue distribution of fluorescence-labeled Gf as well as the extent of cellular inflammation was assessed in corresponding histological slices.',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 1024]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities.shape)
# [3, 3]
```

This model was trained with Matryoshka loss, allowing this model to be used with lower dimensionalities with minimal performance loss (See [Matryoshka Evaluations](#matryoshka-evaluations) for evaluations).
Notably, a lower dimensionality allows for much faster and cheaper information retrieval. You can specify a lower dimensionality with the `truncate_dim` argument when initializing the Sentence Transformer model:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("tomaarsen/static-retrieval-mrl-en-v1", truncate_dim=256)
embeddings = model.encode([
    "what is the difference between chronological order and spatial order?",
    "can lavender grow indoors?"
])
print(embeddings.shape)
# => (2, 256)
```

<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

## Evaluation

### Metrics

#### Information Retrieval

* Datasets: `NanoClimateFEVER`, `NanoDBPedia`, `NanoFEVER`, `NanoFiQA2018`, `NanoHotpotQA`, `NanoMSMARCO`, `NanoNFCorpus`, `NanoNQ`, `NanoQuoraRetrieval`, `NanoSCIDOCS`, `NanoArguAna`, `NanoSciFact` and `NanoTouche2020`
* Evaluated with [<code>InformationRetrievalEvaluator</code>](https://sbert.net/docs/package_reference/sentence_transformer/evaluation.html#sentence_transformers.evaluation.InformationRetrievalEvaluator)

| Metric              | NanoClimateFEVER | NanoDBPedia | NanoFEVER  | NanoFiQA2018 | NanoHotpotQA | NanoMSMARCO | NanoNFCorpus | NanoNQ     | NanoQuoraRetrieval | NanoSCIDOCS | NanoArguAna | NanoSciFact | NanoTouche2020 |
|:--------------------|:-----------------|:------------|:-----------|:-------------|:-------------|:------------|:-------------|:-----------|:-------------------|:------------|:------------|:------------|:---------------|
| cosine_accuracy@1   | 0.32             | 0.7         | 0.46       | 0.28         | 0.64         | 0.18        | 0.42         | 0.24       | 0.8                | 0.28        | 0.1         | 0.52        | 0.5714         |
| cosine_accuracy@3   | 0.52             | 0.84        | 0.8        | 0.44         | 0.82         | 0.42        | 0.56         | 0.44       | 0.96               | 0.48        | 0.46        | 0.6         | 0.898          |
| cosine_accuracy@5   | 0.6              | 0.9         | 0.84       | 0.54         | 0.86         | 0.5         | 0.62         | 0.58       | 1.0                | 0.54        | 0.56        | 0.62        | 0.9796         |
| cosine_accuracy@10  | 0.78             | 0.94        | 0.94       | 0.64         | 0.96         | 0.66        | 0.72         | 0.7        | 1.0                | 0.7         | 0.74        | 0.76        | 1.0            |
| cosine_precision@1  | 0.32             | 0.7         | 0.46       | 0.28         | 0.64         | 0.18        | 0.42         | 0.24       | 0.8                | 0.28        | 0.1         | 0.52        | 0.5714         |
| cosine_precision@3  | 0.1933           | 0.5867      | 0.2667     | 0.1933       | 0.3733       | 0.14        | 0.3733       | 0.1467     | 0.3867             | 0.2267      | 0.1533      | 0.2067      | 0.6054         |
| cosine_precision@5  | 0.14             | 0.544       | 0.18       | 0.16         | 0.26         | 0.1         | 0.32         | 0.124      | 0.248              | 0.188       | 0.112       | 0.132       | 0.6204         |
| cosine_precision@10 | 0.104            | 0.452       | 0.1        | 0.104        | 0.148        | 0.066       | 0.244        | 0.076      | 0.13               | 0.14        | 0.074       | 0.084       | 0.5306         |
| cosine_recall@1     | 0.1467           | 0.0805      | 0.4367     | 0.1519       | 0.32         | 0.18        | 0.0428       | 0.24       | 0.7107             | 0.0597      | 0.1         | 0.485       | 0.0398         |
| cosine_recall@3     | 0.239            | 0.1605      | 0.7467     | 0.2983       | 0.56         | 0.42        | 0.0984       | 0.43       | 0.9253             | 0.1417      | 0.46        | 0.57        | 0.1236         |
| cosine_recall@5     | 0.279            | 0.218       | 0.8033     | 0.3793       | 0.65         | 0.5         | 0.1196       | 0.58       | 0.9627             | 0.1947      | 0.56        | 0.595       | 0.2095         |
| cosine_recall@10    | 0.4197           | 0.3143      | 0.9033     | 0.4838       | 0.74         | 0.66        | 0.1389       | 0.69       | 0.9793             | 0.2887      | 0.74        | 0.75        | 0.337          |
| **cosine_ndcg@10**  | **0.3309**       | **0.5681**  | **0.6922** | **0.3651**   | **0.6547**   | **0.4041**  | **0.3242**   | **0.4534** | **0.8951**         | **0.2643**  | **0.4078**  | **0.6111**  | **0.5703**     |
| cosine_mrr@10       | 0.4453           | 0.7854      | 0.6397     | 0.3915       | 0.7485       | 0.3245      | 0.5041       | 0.3764     | 0.88               | 0.3998      | 0.3034      | 0.5837      | 0.744          |
| cosine_map@100      | 0.2598           | 0.4335      | 0.6205     | 0.3024       | 0.5798       | 0.3389      | 0.1449       | 0.389      | 0.8594             | 0.205       | 0.3151      | 0.5683      | 0.447          |

#### Nano BEIR

* Dataset: `NanoBEIR_mean`
* Evaluated with [<code>NanoBEIREvaluator</code>](https://sbert.net/docs/package_reference/sentence_transformer/evaluation.html#sentence_transformers.evaluation.NanoBEIREvaluator)

| Metric              | Value      |
|:--------------------|:-----------|
| cosine_accuracy@1   | 0.424      |
| cosine_accuracy@3   | 0.6337     |
| cosine_accuracy@5   | 0.703      |
| cosine_accuracy@10  | 0.8108     |
| cosine_precision@1  | 0.424      |
| cosine_precision@3  | 0.2963     |
| cosine_precision@5  | 0.2406     |
| cosine_precision@10 | 0.1733     |
| cosine_recall@1     | 0.2303     |
| cosine_recall@3     | 0.398      |
| cosine_recall@5     | 0.4655     |
| cosine_recall@10    | 0.5727     |
| **cosine_ndcg@10**  | **0.5032** |
| cosine_mrr@10       | 0.5482     |
| cosine_map@100      | 0.4203     |

We've evaluated [sentence-transformers/static-retrieval-mrl-en-v1](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1) on NanoBEIR and plotted it against the inference speed computed on a RTX 3090 and i7-13700K. For the inference speed tests, we calculated the number of computed query embeddings of the [GooAQ dataset](https://huggingface.co/datasets/sentence-transformers/gooaq) per second, either on CPU or GPU.

We evaluate against 3 types of models:
1. Attention-based dense embedding models, e.g. traditional Sentence Transformer models like [`all-mpnet-base-v2`](https://huggingface.co/sentence-transformers/all-mpnet-base-v2), [`bge-base-en-v1.5`](https://huggingface.co/BAAI/bge-base-en-v1.5), and [`gte-large-en-v1.5`](https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5).
2. Static Embedding-based models, e.g. [`static-retrieval-mrl-en-v1`](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1), [`potion-base-8M`](https://huggingface.co/minishlab/potion-base-8M), [`M2V_base_output`](https://huggingface.co/minishlab/M2V_base_output), and [`glove.6B.300d`](https://huggingface.co/sentence-transformers/average_word_embeddings_glove.6B.300d).
3. Sparse bag-of-words model, BM25, often a strong baseline.

    <details><summary>Click to expand BM25 implementation details</summary>

    I relied on the highly efficient [bm25s](https://github.com/xhluca/bm25s) implementation, using `model.get_scores()` on tokens after tokenization and stemming with the English `PyStemmer`.

    </details>

> **NOTE:** Many of the attention-based dense embedding models are finetuned on the training splits of the (Nano)BEIR evaluation datasets. This gives the models an unfair advantage in this benchmark and can result in lower downstream performance on real retrieval tasks.
>
> [static-retrieval-mrl-en-v1](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1) is purposefully not trained on any of these datasets.

##### GPU
![NanoBEIR performance vs inference speed](img/nano_beir_vs_speed_gpu.png)

##### CPU
![NanoBEIR performance vs inference speed](img/nano_beir_vs_speed_cpu.png)

We can draw some notable conclusions from these figures:
1. [`static-retrieval-mrl-en-v1`](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1) outperforms all other Static Embedding models.
2. [`static-retrieval-mrl-en-v1`](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1) is the only Static Embedding model to outperform BM25.
3. [`static-retrieval-mrl-en-v1`](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1) is
    * **87.4%** as performant as the commonly used [`all-mpnet-base-v2`](https://huggingface.co/sentence-transformers/all-mpnet-base-v2),
    * **24x** faster on GPU,
    * **397x** faster on CPU.
4. [`static-retrieval-mrl-en-v1`](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1) is quicker on CPU than on GPU: This model can run extraordinarily quickly everywhere, including consumer-grade PCs, tiny servers, phones, or in-browser.

#### Matryoshka Evaluations

We experimented with the results on NanoBEIR performance when we performed Matryoshka-style dimensionality reduction by truncating the output embeddings to a lower dimensionality.

| Dimensionality | NanoBEIR_mean | NanoArguAna | NanoClimateFEVER | NanoDBPedia | NanoFEVER | NanoFiQA2018 | NanoHotpotQA | NanoMSMARCO | NanoNFCorpus | NanoNQ | NanoQuoraRetrieval | NanoSCIDOCS | NanoSciFact | NanoTouche2020 |
|----------------|---------------|-------------|------------------|-------------|-----------|--------------|--------------|-------------|--------------|--------|--------------------|-------------|-------------|----------------|
| 1024           | **0.5031**    | 0.4077      | 0.3308           | 0.5681      | 0.6921    | 0.3651       | 0.6547       | 0.4040      | 0.3241       | 0.4533 | 0.8950             | 0.2642      | 0.6111      | 0.5702         |
| 512            | **0.4957**    | 0.3878      | 0.3360           | 0.5626      | 0.6945    | 0.3517       | 0.6280       | 0.3892      | 0.3206       | 0.4505 | 0.8986             | 0.2657      | 0.5953      | 0.5635         |
| 256            | **0.4819**    | 0.3855      | 0.3203           | 0.5407      | 0.6734    | 0.3518       | 0.6027       | 0.4144      | 0.2860       | 0.4254 | 0.8948             | 0.2466      | 0.5620      | 0.5605         |
| 128            | **0.4622**    | 0.4001      | 0.2982           | 0.5266      | 0.6273    | 0.3188       | 0.5606       | 0.4025      | 0.2693       | 0.4021 | 0.8930             | 0.2283      | 0.5447      | 0.5368         |
| 64             | **0.4176**    | 0.3424      | 0.2809           | 0.5022      | 0.5480    | 0.2831       | 0.4680       | 0.3739      | 0.2153       | 0.3845 | 0.8525             | 0.1680      | 0.5045      | 0.5050         |
| 32             | **0.3532**    | 0.2866      | 0.1870           | 0.4292      | 0.4193    | 0.2292       | 0.3602       | 0.3587      | 0.1444       | 0.3525 | 0.8325             | 0.1525      | 0.3983      | 0.4408         |

![NanoBEIR performance vs Matryoshka dimensionality reduction](img/nano_beir_matryoshka.png)

These findings show that reducing the dimensionality by e.g. 2x only has a 1.47% reduction in performance (0.5031 NDCG@10 vs 0.4957 NDCG@10), while realistically resulting in a 2x speedup in retrieval speed. 

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Datasets

<details><summary>gooaq</summary>

* Dataset: [gooaq](https://huggingface.co/datasets/sentence-transformers/gooaq) at [b089f72](https://huggingface.co/datasets/sentence-transformers/gooaq/tree/b089f728748a068b7bc5234e5bcf5b25e3c8279c)
* Size: 3,012,496 training samples
* Columns: <code>question</code> and <code>answer</code>
* Approximate statistics based on the first 1000 samples:
  |         | question                                                                                       | answer                                                                                           |
  |:--------|:-----------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------|
  | type    | string                                                                                         | string                                                                                           |
  | details | <ul><li>min: 18 characters</li><li>mean: 43.23 characters</li><li>max: 96 characters</li></ul> | <ul><li>min: 55 characters</li><li>mean: 253.36 characters</li><li>max: 371 characters</li></ul> |
* Samples:
  | question                                                                           | answer                                                                                                                                                                                                                                                                                                                |
  |:-----------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>what is the difference between broilers and layers?</code>                   | <code>An egg laying poultry is called egger or layer whereas broilers are reared for obtaining meat. So a layer should be able to produce more number of large sized eggs, without growing too much. On the other hand, a broiler should yield more meat and hence should be able to grow well.</code>                |
  | <code>what is the difference between chronological order and spatial order?</code> | <code>As a writer, you should always remember that unlike chronological order and the other organizational methods for data, spatial order does not take into account the time. Spatial order is primarily focused on the location. All it does is take into account the location of objects and not the time.</code> |
  | <code>is kamagra same as viagra?</code>                                            | <code>Kamagra is thought to contain the same active ingredient as Viagra, sildenafil citrate. In theory, it should work in much the same way as Viagra, taking about 45 minutes to take effect, and lasting for around 4-6 hours. However, this will vary from person to person.</code>                               |
* Loss: [<code>MatryoshkaLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#matryoshkaloss) with these parameters:
  ```json
  {
      "loss": "MultipleNegativesRankingLoss",
      "matryoshka_dims": [
          1024,
          512,
          256,
          128,
          64,
          32
      ],
      "matryoshka_weights": [
          1,
          1,
          1,
          1,
          1,
          1
      ],
      "n_dims_per_step": -1
  }
  ```

</details>

<details><summary>msmarco</summary>

* Dataset: [msmarco](https://huggingface.co/datasets/sentence-transformers/msmarco-co-condenser-margin-mse-sym-mnrl-mean-v1) at [84ed2d3](https://huggingface.co/datasets/sentence-transformers/msmarco-co-condenser-margin-mse-sym-mnrl-mean-v1/tree/84ed2d35626f617d890bd493b4d6db69a741e0e2)
* Size: 502,939 training samples
* Columns: <code>query</code>, <code>positive</code>, and <code>negative</code>
* Approximate statistics based on the first 1000 samples:
  |         | query                                                                                           | positive                                                                                          | negative                                                                                         |
  |:--------|:------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                            | string                                                                                           |
  | details | <ul><li>min: 11 characters</li><li>mean: 33.26 characters</li><li>max: 197 characters</li></ul> | <ul><li>min: 96 characters</li><li>mean: 356.24 characters</li><li>max: 1006 characters</li></ul> | <ul><li>min: 68 characters</li><li>mean: 327.52 characters</li><li>max: 995 characters</li></ul> |
* Samples:
  | query                                        | positive                                                                                                                                                                                                                                                                                                                               | negative                                                                                                                                                                                                                                                                                                                                       |
  |:---------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>when was the sullivan acts</code>      | <code>Sullivan Act Tim Sullivan, a major Irish criminal passed the Sullivan Act in 1911 to help his constituents rob strangers or to help them against Italian incomers. That is the crux of story that goes with a very early gun control law.</code>                                                                                 | <code>Sullivan Act Tim Sullivan, a major Irish criminal passed the Sullivan Act in 1911 to help his constituents rob strangers or to help them against Italian incomers. That is the crux of story that goes with a very early gun control law.</code>                                                                                         |
  | <code>can lavender grow indoors</code>       | <code>Growing Lavender Indoors. People ALWAYS ask if you can grow lavender indoors. Well, you can, but most Lavender does best outside. Here is our winter experiment to show you what it would look like. This is one of our 4 Lavender Babies from Fall 2010. Our test specimen is L. x intermedia 'Grosso'.</code>                  | <code>Lavender can be grown indoors with a bit of effort to keep it in the conditions it loves to thrive. First off begin with choosing a variety that is better able to tolerate the conditions inside a home. To successfully grow Lavender indoors you need to create optimal growing conditions which is hard to do inside a house.</code> |
  | <code>what kind of barley do you malt</code> | <code>Barley is a wonderfully versatile cereal grain with a rich nutlike flavor and an appealing chewy, pasta-like consistency. Its appearance resembles wheat berries, although it is slightly lighter in color. Sprouted barley is naturally high in maltose, a sugar that serves as the basis for both malt syrup sweetener.</code> | <code>Specialty grains that can be used in this way are usually barley, malted or unmalted, that has been treated differently at the malting company. Crystal malt is one of the specialty grains. It is available in a whole range of colors, from 20 to 120 Lovibond. Crystal malt is malted barley that is heated while wet.</code>         |
* Loss: [<code>MatryoshkaLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#matryoshkaloss) with these parameters:
  ```json
  {
      "loss": "MultipleNegativesRankingLoss",
      "matryoshka_dims": [
          1024,
          512,
          256,
          128,
          64,
          32
      ],
      "matryoshka_weights": [
          1,
          1,
          1,
          1,
          1,
          1
      ],
      "n_dims_per_step": -1
  }
  ```

</details>

<details><summary>squad</summary>

* Dataset: [squad](https://huggingface.co/datasets/sentence-transformers/squad) at [d84c8c2](https://huggingface.co/datasets/sentence-transformers/squad/tree/d84c8c2ef64693264c890bb242d2e73fc0a46c40)
* Size: 87,599 training samples
* Columns: <code>question</code> and <code>answer</code>
* Approximate statistics based on the first 1000 samples:
  |         | question                                                                                        | answer                                                                                             |
  |:--------|:------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                             |
  | details | <ul><li>min: 14 characters</li><li>mean: 59.66 characters</li><li>max: 150 characters</li></ul> | <ul><li>min: 156 characters</li><li>mean: 769.53 characters</li><li>max: 3706 characters</li></ul> |
* Samples:
  | question                                                                 | answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  |:-------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>What did Business Insider call San Diego in 2013?</code>           | <code>San Diego was ranked as the 20th-safest city in America in 2013 by Business Insider. According to Forbes magazine, San Diego was the ninth-safest city in the top 10 list of safest cities in the U.S. in 2010. Like most major cities, San Diego had a declining crime rate from 1990 to 2000. Crime in San Diego increased in the early 2000s. In 2004, San Diego had the sixth lowest crime rate of any U.S. city with over half a million residents. From 2002 to 2006, the crime rate overall dropped 0.8%, though not evenly by category. While violent crime decreased 12.4% during this period, property crime increased 1.1%. Total property crimes per 100,000 people were lower than the national average in 2008.</code>                                                                                                                                                                                                                                                                                                               |
  | <code>What did the Spanish call this region?</code>                      | <code>The name Montana comes from the Spanish word Montaña, meaning "mountain", or more broadly, "mountainous country". Montaña del Norte was the name given by early Spanish explorers to the entire mountainous region of the west. The name Montana was added to a bill by the United States House Committee on Territories, which was chaired at the time by Rep. James Ashley of Ohio, for the territory that would become Idaho Territory. The name was successfully changed by Representatives Henry Wilson (Massachusetts) and Benjamin F. Harding (Oregon), who complained that Montana had "no meaning". When Ashley presented a bill to establish a temporary government in 1864 for a new territory to be carved out of Idaho, he again chose Montana Territory. This time Rep. Samuel Cox, also of Ohio, objected to the name. Cox complained that the name was a misnomer given that most of the territory was not mountainous and that a Native American name would be more appropriate than a Spanish one. Other names such as...</code> |
  | <code>Small missiles were designed that could be mounted on what?</code> | <code>As this process continued, the missile found itself being used for more and more of the roles formerly filled by guns. First to go were the large weapons, replaced by equally large missile systems of much higher performance. Smaller missiles soon followed, eventually becoming small enough to be mounted on armored cars and tank chassis. These started replacing, or at least supplanting, similar gun-based SPAAG systems in the 1960s, and by the 1990s had replaced almost all such systems in modern armies. Man-portable missiles, MANPADs as they are known today, were introduced in the 1960s and have supplanted or even replaced even the smallest guns in most advanced armies.</code>                                                                                                                                                                                                                                                                                                                                         |
* Loss: [<code>MatryoshkaLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#matryoshkaloss) with these parameters:
  ```json
  {
      "loss": "MultipleNegativesRankingLoss",
      "matryoshka_dims": [
          1024,
          512,
          256,
          128,
          64,
          32
      ],
      "matryoshka_weights": [
          1,
          1,
          1,
          1,
          1,
          1
      ],
      "n_dims_per_step": -1
  }
  ```

</details>

<details><summary>s2orc</summary>

* Dataset: [s2orc](https://huggingface.co/datasets/sentence-transformers/s2orc) at [8cfc394](https://huggingface.co/datasets/sentence-transformers/s2orc/tree/8cfc394e83b2ebfcf38f90b508aea383df742439)
* Size: 90,000 training samples
* Columns: <code>title</code> and <code>abstract</code>
* Approximate statistics based on the first 1000 samples:
  |         | title                                                                                           | abstract                                                                                          |
  |:--------|:------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                            |
  | details | <ul><li>min: 31 characters</li><li>mean: 80.02 characters</li><li>max: 185 characters</li></ul> | <ul><li>min: 84 characters</li><li>mean: 635.31 characters</li><li>max: 1023 characters</li></ul> |
* Samples:
  | title                                                                                                                 | abstract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
  |:----------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>Modeling Method of Flow Diversion of the Three Outlets in Jingjiang Reach Under Unsteady Flow Conditions</code> | <code>The Yangtze River Flood Protection Physical Model is built under the financial support of World Bank loan.Based on theoretical analysis and experimental study,a modeling method of flow diversion of the three outlets in Jingjiang Reach under unsteady flow conditions was established for the model.Validation tests under both steady and unsteady flow conditions manifested that with this modeling method,the experimental flow diversion proves to be consistent with that of the prototype and therefore meets the requirements for precision.Being validated,this modeling method has been applied to Yangtze River Flood Protection Physical Model to study the flood routing features in Jingjiang reach.</code>                                                                                                                                                                     |
  | <code>Enlightening on medical administration by clinical governance in British</code>                                 | <code>Medical quality and safety were the responsibilities of medical system in view of British clinical governance. Medical regulation institutes were considered to be built and be authorized regulation rights. British medical administration was introduced and its enlightening in China was mentioned.</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  | <code>APPLICATION OF A FUZZY MULTI-CRITERIA DECISION-MAKING MODEL FOR SHIPPING COMPANY PERFORMANCE EVALUATION</code>  | <code>Combining fuzzy set theory, Analytic Hierarchy Process (AHP) and concept of entropy, a fuzzy Multiple Criteria Decision-Making (MCDM) model for shipping company performance evaluation is proposed. First, the AHP is used to construct subjective weights for all criteria and sub-criteria. Then, linguistic values characterized by triangular fuzzy numbers and trapezoidal fuzzy numbers are used to denote the evaluation values of all alternatives with respect to various subjective and objective criteria. Finally, the aggregation fuzzy assessment of different shipping companies is ranked to determine the best selection. Utilizing this fuzzy MCDM model, the decision-maker's fuzzy assessment and the trade-off between various evaluations criteria can be taken into account in the aggregation process, thus ensuring more effective and accurate decision-making.</code> |
* Loss: [<code>MatryoshkaLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#matryoshkaloss) with these parameters:
  ```json
  {
      "loss": "MultipleNegativesRankingLoss",
      "matryoshka_dims": [
          1024,
          512,
          256,
          128,
          64,
          32
      ],
      "matryoshka_weights": [
          1,
          1,
          1,
          1,
          1,
          1
      ],
      "n_dims_per_step": -1
  }
  ```

</details>

<details><summary>allnli</summary>

* Dataset: [allnli](https://huggingface.co/datasets/sentence-transformers/all-nli) at [d482672](https://huggingface.co/datasets/sentence-transformers/all-nli/tree/d482672c8e74ce18da116f430137434ba2e52fab)
* Size: 557,850 training samples
* Columns: <code>anchor</code>, <code>positive</code>, and <code>negative</code>
* Approximate statistics based on the first 1000 samples:
  |         | anchor                                                                                          | positive                                                                                        | negative                                                                                        |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          | string                                                                                          |
  | details | <ul><li>min: 18 characters</li><li>mean: 34.88 characters</li><li>max: 193 characters</li></ul> | <ul><li>min: 15 characters</li><li>mean: 46.49 characters</li><li>max: 181 characters</li></ul> | <ul><li>min: 16 characters</li><li>mean: 50.47 characters</li><li>max: 204 characters</li></ul> |
* Samples:
  | anchor                                                                     | positive                                         | negative                                                   |
  |:---------------------------------------------------------------------------|:-------------------------------------------------|:-----------------------------------------------------------|
  | <code>A person on a horse jumps over a broken down airplane.</code>        | <code>A person is outdoors, on a horse.</code>   | <code>A person is at a diner, ordering an omelette.</code> |
  | <code>Children smiling and waving at camera</code>                         | <code>There are children present</code>          | <code>The kids are frowning</code>                         |
  | <code>A boy is jumping on skateboard in the middle of a red bridge.</code> | <code>The boy does a skateboarding trick.</code> | <code>The boy skates down the sidewalk.</code>             |
* Loss: [<code>MatryoshkaLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#matryoshkaloss) with these parameters:
  ```json
  {
      "loss": "MultipleNegativesRankingLoss",
      "matryoshka_dims": [
          1024,
          512,
          256,
          128,
          64,
          32
      ],
      "matryoshka_weights": [
          1,
          1,
          1,
          1,
          1,
          1
      ],
      "n_dims_per_step": -1
  }
  ```

</details>

<details><summary>paq</summary>

* Dataset: [paq](https://huggingface.co/datasets/sentence-transformers/paq) at [74601d8](https://huggingface.co/datasets/sentence-transformers/paq/tree/74601d8d731019bc9c627ffc4271cdd640e1e748)
* Size: 64,371,441 training samples
* Columns: <code>query</code> and <code>answer</code>
* Approximate statistics based on the first 1000 samples:
  |         | query                                                                                           | answer                                                                                            |
  |:--------|:------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                            |
  | details | <ul><li>min: 25 characters</li><li>mean: 50.56 characters</li><li>max: 104 characters</li></ul> | <ul><li>min: 509 characters</li><li>mean: 620.96 characters</li><li>max: 773 characters</li></ul> |
* Samples:
  | query                                                                       | answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  |:----------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>in veetla visheshanga ganesh is the husband of</code>                 | <code>Veetla Visheshanga a song which reminds Ganga's memory. She is actually not Ganga but Gowri and her lover is the groom named Ganesh. When both were about to marry they were stopped by some goons because of which Gowri fell from the mountain but survived with injuries. Gopal who found the truth brought Ganesh to unite them. Gopal insists Gowri to marry Ganesh as both of them are lovers to which Gowri unwillingly accepts. But while Ganesh tries to tie the Mangal Sutra, Gowri stops him and she goes to Gopal saying that he may not need her but she needs him</code>                                                                                                                                                                              |
  | <code>when did simon property group became a publicly traded company</code> | <code>of the S&P 100. Simon Property Group has been the subject of several lawsuits and investigations regarding civil rights and discrimination. Simon Property Group was formed in 1993 when the majority of the shopping center interests of Melvin Simon & Associates became a publicly traded company. Melvin Simon & Associates, owned by brothers Melvin Simon and Herbert Simon, was founded in 1960 in Indianapolis, Indiana, and had long been one of the top shopping center developers in the United States. In 1996, Simon DeBartolo Group was created when Simon Property merged with former rival DeBartolo Realty Corp. This was shortly</code>                                                                                                           |
  | <code>what was the nationality of antoine faivre</code>                     | <code>Theosophy (Boehmian) below. "Theosophy": The scholar of esotericism Wouter Hanegraaff described Christian theosophy as "one of the major currents in the history of Western esotericism". Christian theosophy is an under-researched area; a general history of it has never been written. The French scholar Antoine Faivre had a specific interest in the theosophers and illuminists of the eighteenth and nineteenth centuries. He wrote his doctoral thesis on Karl von Eckartshausen and Christian theosophy. Scholars of esotericism have argued that Faivre's definition of Western esotericism relies on his own specialist focus on Christian theosophy, Renaissance Hermeticism, and Romantic "Naturphilosophie" and therefore creates an "ideal"</code> |
* Loss: [<code>MatryoshkaLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#matryoshkaloss) with these parameters:
  ```json
  {
      "loss": "MultipleNegativesRankingLoss",
      "matryoshka_dims": [
          1024,
          512,
          256,
          128,
          64,
          32
      ],
      "matryoshka_weights": [
          1,
          1,
          1,
          1,
          1,
          1
      ],
      "n_dims_per_step": -1
  }
  ```

</details>

<details><summary>trivia</summary>_qa

* Dataset: [trivia_qa](https://huggingface.co/datasets/sentence-transformers/trivia-qa) at [a7c36e3](https://huggingface.co/datasets/sentence-transformers/trivia-qa/tree/a7c36e3c8c8c01526bc094d79bf80d4c848b0ad0)
* Size: 73,346 training samples
* Columns: <code>query</code> and <code>answer</code>
* Approximate statistics based on the first 1000 samples:
  |         | query                                                                                           | answer                                                                                              |
  |:--------|:------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                              |
  | details | <ul><li>min: 21 characters</li><li>mean: 76.91 characters</li><li>max: 455 characters</li></ul> | <ul><li>min: 136 characters</li><li>mean: 3273.89 characters</li><li>max: 4096 characters</li></ul> |
* Samples:
  | query                                                                           | answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  |:--------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>What type of rock is formed by the solidification of molten magma?</code> | <code>igneous rock - Dictionary Definition : Vocabulary.com igneous rock n rock formed by the solidification of molten magma Types: a rare type of peridotite that sometimes contains diamonds; found in South Africa and Siberia Type of: material consisting of the aggregate of minerals like those making up the Earth's crust Word Family Usage Examples Sign up, it's free! Whether you're a student, an educator, or a life-long learner, Vocabulary.com can put you  on the path to systematic vocabulary improvement.</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  | <code>Which river flows through the town of Shrewsbury?</code>                  | <code>River Severn | river, Wales and England, United Kingdom | Britannica.com river, Wales and England, United Kingdom Written By: Wales River Severn, Welsh Hafren, Britain’s longest river from source to tidal waters—about 180 miles (290 km) long, with the Severn estuary adding some 40 miles (64 km) to its total length. The Severn rises near the River Wye on the northeastern slopes of Plynlimon (Welsh: Pumlumon), Wales , and follows a semicircular course basically southward to the Bristol Channel and the Atlantic Ocean . It drains an area of 4,350 square miles (11,266 square km) with an average discharge at Bewdley of 2,170 cubic feet (61.5 cubic m) per second. River Severn at Shrewsbury, Shropshire, Eng. Chris Bayley The river’s course is at first southeasterly, descending from an elevation of 2,000 feet (600 m) at its source to 500 feet (150 m) at the Welsh town of Llanidloes. There it turns sharply northeastward, following the Vale of Powys past Newtown and Welshpool . At Llanymynech the...</code> |
  | <code>Which band's name was inspired by a novel by Herman Hesse?</code>         | <code>23 Band Names Inspired by Literature :: Books :: Lists :: Paste 23 Band Names Inspired by Literature By Wyndham Wyeth  |  April 24, 2011  |  10:52pm Share Tweet Submit Pin At Paste, we look for “Signs of Life” in all forms of art. And while we value each artform for its unique merits, it’s always a treat when they overlap. So we decided to take a look at bands that derived their names from literature. The works that inspired several of the entries are probably obvious, but a few of them will most certainly surprise you. It may also surprise you to see which genres favor the written word. (Who knew metalheads were such scholars?) Photo by Max Blau New Jersey punks Titus Andronicus take their name from the greatest wordsmith of them all, William Shakespeare . Titus Andronicus is thought to be the famous playwright’s first tragedy. It is also his bloodiest and most violent work. 2. The Doors Source: The Doors of Perception by Aldous Huxley When The Doors formed in 1965, they decided to na...</code> |
* Loss: [<code>MatryoshkaLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#matryoshkaloss) with these parameters:
  ```json
  {
      "loss": "MultipleNegativesRankingLoss",
      "matryoshka_dims": [
          1024,
          512,
          256,
          128,
          64,
          32
      ],
      "matryoshka_weights": [
          1,
          1,
          1,
          1,
          1,
          1
      ],
      "n_dims_per_step": -1
  }
  ```

</details>

<details><summary>msmarco_10m</summary>

* Dataset: [msmarco_10m](https://huggingface.co/datasets/bclavie/msmarco-10m-triplets) at [8c5139a](https://huggingface.co/datasets/bclavie/msmarco-10m-triplets/tree/8c5139a245a5997992605792faa49ec12a6eb5f2)
* Size: 10,000,000 training samples
* Columns: <code>query</code>, <code>positive</code>, and <code>negative</code>
* Approximate statistics based on the first 1000 samples:
  |         | query                                                                                           | positive                                                                                         | negative                                                                                          |
  |:--------|:------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                           | string                                                                                            |
  | details | <ul><li>min: 10 characters</li><li>mean: 33.47 characters</li><li>max: 158 characters</li></ul> | <ul><li>min: 53 characters</li><li>mean: 353.76 characters</li><li>max: 948 characters</li></ul> | <ul><li>min: 67 characters</li><li>mean: 343.74 characters</li><li>max: 1063 characters</li></ul> |
* Samples:
  | query                                            | positive                                                                                                                                                                                                                                                                                                                                                            | negative                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

_The publisher's README is longer; it is cut here. Read the rest at the source._
