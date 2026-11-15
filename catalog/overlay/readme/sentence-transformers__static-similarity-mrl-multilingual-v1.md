# Static Embeddings with BERT Multilingual uncased tokenizer finetuned on various datasets

This is a [sentence-transformers](https://www.SBERT.net) model trained on the [wikititles](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikititles), [tatoeba](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-tatoeba), [talks](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-talks), [europarl](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-europarl), [global_voices](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-global-voices), [muse](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-muse), [wikimatrix](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikimatrix), [opensubtitles](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-opensubtitles), [stackexchange](https://huggingface.co/datasets/sentence-transformers/stackexchange-duplicates), [quora](https://huggingface.co/datasets/sentence-transformers/quora-duplicates), [wikianswers_duplicates](https://huggingface.co/datasets/sentence-transformers/wikianswers-duplicates), [all_nli](https://huggingface.co/datasets/sentence-transformers/all-nli), [simple_wiki](https://huggingface.co/datasets/sentence-transformers/simple-wiki), [altlex](https://huggingface.co/datasets/sentence-transformers/altlex), [flickr30k_captions](https://huggingface.co/datasets/sentence-transformers/flickr30k-captions), [coco_captions](https://huggingface.co/datasets/sentence-transformers/coco-captions), [nli_for_simcse](https://huggingface.co/datasets/sentence-transformers/nli-for-simcse) and [negation](https://huggingface.co/datasets/jinaai/negation-dataset) datasets. It maps sentences & paragraphs to a 1024-dimensional dense vector space and can be used for semantic textual similarity, paraphrase mining, text classification, clustering, and more.

Read our [Static Embeddings blogpost](https://huggingface.co/blog/static-embeddings) to learn more about this model and how it was trained.

* **0 Active Parameters:** This model does not use any active parameters, instead consisting exclusively of averaging pre-computed token embeddings.
* **100x to 400x faster:** On CPU, this model is 100x to 400x faster than common options like [multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small). On GPU, it's 10x to 25x faster.
* **Matryoshka:** This model was trained with a [Matryoshka loss](https://huggingface.co/blog/matryoshka), allowing you to truncate the embeddings for faster retrieval at minimal performance costs.
* **Evaluations:** See [Evaluations](#evaluation) for details on performance on NanoBEIR, embedding speed, and Matryoshka dimensionality truncation.
* **Training Script:** See [train.py](train.py) for the training script used to train this model from scratch.

See [`static-retrieval-mrl-en-v1`](https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1) for an English static embedding model that has been finetuned specifically for retrieval tasks.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
<!-- - **Base model:** [Unknown](https://huggingface.co/unknown) -->
- **Maximum Sequence Length:** inf tokens
- **Output Dimensionality:** 1024 dimensions
- **Similarity Function:** Cosine Similarity
- **Training Datasets:**
    - [wikititles](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikititles)
    - [tatoeba](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-tatoeba)
    - [talks](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-talks)
    - [europarl](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-europarl)
    - [global_voices](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-global-voices)
    - [muse](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-muse)
    - [wikimatrix](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikimatrix)
    - [opensubtitles](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-opensubtitles)
    - [stackexchange](https://huggingface.co/datasets/sentence-transformers/stackexchange-duplicates)
    - [quora](https://huggingface.co/datasets/sentence-transformers/quora-duplicates)
    - [wikianswers_duplicates](https://huggingface.co/datasets/sentence-transformers/wikianswers-duplicates)
    - [all_nli](https://huggingface.co/datasets/sentence-transformers/all-nli)
    - [simple_wiki](https://huggingface.co/datasets/sentence-transformers/simple-wiki)
    - [altlex](https://huggingface.co/datasets/sentence-transformers/altlex)
    - [flickr30k_captions](https://huggingface.co/datasets/sentence-transformers/flickr30k-captions)
    - [coco_captions](https://huggingface.co/datasets/sentence-transformers/coco-captions)
    - [nli_for_simcse](https://huggingface.co/datasets/sentence-transformers/nli-for-simcse)
    - [negation](https://huggingface.co/datasets/jinaai/negation-dataset)
- **Languages:** en, multilingual, ar, bg, ca, cs, da, de, el, es, et, fa, fi, fr, gl, gu, he, hi, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, ru, sk, sl, sq, sr, sv, th, tr, uk, ur, vi, zh, hr
- **License:** apache-2.0

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/UKPLab/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): StaticEmbedding(
    (embedding): EmbeddingBag(105879, 1024, mode='mean')
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
model = SentenceTransformer("tomaarsen/static-similarity-mrl-multilingual-v1")
# Run inference
sentences = [
    'It is known for its dry red chili powder .',
    'It is popular for dry red chili powder .',
    'These monsters will move in large groups .',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 1024]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities.shape)
# [3, 3]
```

This model was trained with Matryoshka loss, allowing this model to be used with lower dimensionalities with minimal performance loss.
Notably, a lower dimensionality allows for much faster downstream tasks, such as clustering or classification. You can specify a lower dimensionality with the `truncate_dim` argument when initializing the Sentence Transformer model:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/static-similarity-mrl-multilingual-v1", truncate_dim=256)
embeddings = model.encode([
    "I used to hate him.",
    "Раньше я ненавидел его."
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

We've evaluated the model on 5 languages which have a lot of benchmarks across various tasks on [MTEB](https://huggingface.co/spaces/mteb/leaderboard).

We want to reiterate that this model is not intended for retrieval use cases. Instead, we evaluate on Semantic Textual Similarity (STS), Classification, and Pair Classification. We compare against the excellent and small [multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small) model.

![](img/similarity_mteb_eval.png)

Across all measured languages, [static-similarity-mrl-multilingual-v1](https://huggingface.co/sentence-transformers/static-similarity-mrl-multilingual-v1) reaches an average **92.3%** for STS, **95.52%** for Pair Classification, and **86.52%** for Classification relative to [multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small).

![](img/similarity_speed.png)

To make up for this performance reduction, [static-similarity-mrl-multilingual-v1](https://huggingface.co/sentence-transformers/static-similarity-mrl-multilingual-v1) is approximately ~125x faster on CPU and ~10x faster on GPU devices than [multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small). Due to the super-linear nature of attention models, versus the linear nature of static embedding models, the speedup will only grow larger as the number of tokens to encode increases.

#### Matryoshka Evaluation

Lastly, we experimented with the impacts on English STS on MTEB performance when we did Matryoshka-style dimensionality reduction by truncating the output embeddings to a lower dimensionality. 

![English STS MTEB performance vs Matryoshka dimensionality reduction](img/similarity_matryoshka.png)

As you can see, you can easily reduce the dimensionality by 2x or 4x with minor (0.15% or 0.56%) performance hits. If the speed of your downstream task or your storage costs are a bottleneck, this should allow you to alleviate some of those concerns.

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

<details><summary>wikititles</summary>

* Dataset: [wikititles](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikititles) at [d92a4d2](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikititles/tree/d92a4d28a082c3c93563feb92a77de6074bdeb52)
* Size: 14,700,458 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                       | non_english                                                                                    |
  |:--------|:----------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------|
  | type    | string                                                                                        | string                                                                                         |
  | details | <ul><li>min: 4 characters</li><li>mean: 18.33 characters</li><li>max: 84 characters</li></ul> | <ul><li>min: 4 characters</li><li>mean: 17.19 characters</li><li>max: 109 characters</li></ul> |
* Samples:
  | english                 | non_english                |
  |:------------------------|:---------------------------|
  | <code>Le Vintrou</code> | <code>Ле-Вентру</code>     |
  | <code>Greening</code>   | <code>Begrünung</code>     |
  | <code>Warrap</code>     | <code>واراب (توضيح)</code> |
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

<details><summary>tatoeba</summary>

* Dataset: [tatoeba](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-tatoeba) at [cec1343](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-tatoeba/tree/cec1343ab5a7a8befe99af4a2d0ca847b6c84743)
* Size: 4,138,956 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                        | non_english                                                                                    |
  |:--------|:-----------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------|
  | type    | string                                                                                         | string                                                                                         |
  | details | <ul><li>min: 5 characters</li><li>mean: 31.59 characters</li><li>max: 196 characters</li></ul> | <ul><li>min: 6 characters</li><li>mean: 30.95 characters</li><li>max: 161 characters</li></ul> |
* Samples:
  | english                                                | non_english                          |
  |:-------------------------------------------------------|:-------------------------------------|
  | <code>I used to hate him.</code>                       | <code>Раньше я ненавидел его.</code> |
  | <code>It is nothing less than an insult to her.</code> | <code>それはまさに彼女に対する侮辱だ。</code>        |
  | <code>I've apologized, so lay off, OK?</code>          | <code>謝ったんだから、さっきのはチャラにしてよ。</code>   |
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

<details><summary>talks</summary>

* Dataset: [talks](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-talks) at [0c70bc6](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-talks/tree/0c70bc6714efb1df12f8a16b9056e4653563d128)
* Size: 9,750,031 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                        | non_english                                                                                    |
  |:--------|:-----------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------|
  | type    | string                                                                                         | string                                                                                         |
  | details | <ul><li>min: 5 characters</li><li>mean: 94.41 characters</li><li>max: 493 characters</li></ul> | <ul><li>min: 4 characters</li><li>mean: 82.49 characters</li><li>max: 452 characters</li></ul> |
* Samples:
  | english                                                                                               | non_english                                                    |
  |:------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------|
  | <code>(Laughter) EC: But beatbox started here in New York.</code>                                     | <code>(Skratt) EC: Fast beatbox började här i New York.</code> |
  | <code>I did not have enough money to buy food, and so to forget my hunger, I started singing."</code> | <code>食べ物を買うお金もなかった だから 空腹を忘れるために 歌を歌い始めたの」</code>             |
  | <code>That is another 25 million barrels a day.</code>                                                | <code>那时还要增加两千五百万桶的原油。</code>                                  |
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

<details><summary>europarl</summary>

* Dataset: [europarl](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-europarl) at [11007ec](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-europarl/tree/11007ecf9c790178a49a4cbd5cfea451a170f2dc)
* Size: 4,990,000 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                         | non_english                                                                                     |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          |
  | details | <ul><li>min: 0 characters</li><li>mean: 147.77 characters</li><li>max: 668 characters</li></ul> | <ul><li>min: 0 characters</li><li>mean: 153.13 characters</li><li>max: 971 characters</li></ul> |
* Samples:
  | english                                                                                                                                                                                                                                                                                                                                           | non_english                                                                                                                                                                                                                                                                                                                                              |
  |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>(SK) I would like to stress three key points in relation to this issue.</code>                                                                                                                                                                                                                                                              | <code>(SK) Chtěla bych zdůraznit tři klíčové body, které jsou s tímto tématem spojeny.</code>                                                                                                                                                                                                                                                            |
  | <code>Women have a higher recorded rate of unemployment, especially long term unemployment.</code>                                                                                                                                                                                                                                                | <code>Blandt kvinder registreres større arbejdsløshed, især blandt langtidsarbejdsløse.</code>                                                                                                                                                                                                                                                           |
  | <code>You will recall that we have occasionally had disagreements over how to interpret Rule 166 of our Rules of Procedure and that certain Members thought that the Presidency was not applying it properly, since it was not giving the floor for points of order that did not refer to the issue that was being debated at that moment.</code> | <code>De husker nok, at vi til tider har været uenige om fortolkningen af artikel 166 i vores forretningsorden, og at nogle af medlemmerne mente, at formanden ikke anvendte den korrekt, eftersom han ikke gav ordet til indlæg til forretningsordenen, når det ikke drejede sig om det spørgsmål, der blev drøftet på det pågældende tidspunkt.</code> |
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

<details><summary>global_voices</summary>

* Dataset: [global_voices](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-global-voices) at [4cc20ad](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-global-voices/tree/4cc20add371f246bb1559b543f8b0dea178a1803)
* Size: 1,099,099 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                         | non_english                                                                                     |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          |
  | details | <ul><li>min: 5 characters</li><li>mean: 115.13 characters</li><li>max: 740 characters</li></ul> | <ul><li>min: 3 characters</li><li>mean: 119.89 characters</li><li>max: 801 characters</li></ul> |
* Samples:
  | english                                                                                   | non_english                                                                                                 |
  |:------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------|
  | <code>Generation 9/11: Cristina Balli (USA) from British Council USA on Vimeo.</code>     | <code>Генерација 9/11: Кристина Бали (САД) од Британскиот совет САД на Вимео.</code>                        |
  | <code>Jamaica: Mapping the state of emergency · Global Voices</code>                      | <code>Jamaica: Mapeando el estado de emergencia</code>                                                      |
  | <code>It takes more than courage or bravery to do such a... http://fb.me/12T47y0Ml</code> | <code>Θέλει κάτι παραπάνω από κουράγιο ή ανδρεία για να κάνεις κάτι τέτοιο... http://fb.me/12T47y0Ml</code> |
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

<details><summary>muse</summary>

* Dataset: [muse](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-muse) at [238c077](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-muse/tree/238c077ac66070748aaf2ab1e45185b0145b7291)
* Size: 1,368,274 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                      | non_english                                                                                  |
  |:--------|:---------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------|
  | type    | string                                                                                       | string                                                                                       |
  | details | <ul><li>min: 3 characters</li><li>mean: 7.38 characters</li><li>max: 16 characters</li></ul> | <ul><li>min: 1 characters</li><li>mean: 7.33 characters</li><li>max: 18 characters</li></ul> |
* Samples:
  | english              | non_english         |
  |:---------------------|:--------------------|
  | <code>metro</code>   | <code>metrou</code> |
  | <code>suggest</code> | <code>제안</code>     |
  | <code>nnw</code>     | <code>nno</code>    |
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

<details><summary>wikimatrix</summary>

* Dataset: [wikimatrix](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikimatrix) at [74a4cb1](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-wikimatrix/tree/74a4cb15422cdd0c3aacc93593b6cb96a9b9b3a9)
* Size: 9,688,498 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                          | non_english                                                                                      |
  |:--------|:-------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------|
  | type    | string                                                                                           | string                                                                                           |
  | details | <ul><li>min: 16 characters</li><li>mean: 124.31 characters</li><li>max: 418 characters</li></ul> | <ul><li>min: 11 characters</li><li>mean: 129.99 characters</li><li>max: 485 characters</li></ul> |
* Samples:
  | english                                                                                                                                    | non_english                                                                                                                           |
  |:-------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
  | <code>3) A set of wikis to support collaboration activities and disseminate information about good practices.</code>                       | <code>3) Un conjunt de wikis per donar suport a les activitats de col·laboració i difusió d'informació sobre bones pràctiques.</code> |
  | <code>Daily cruiseferry services operate to Copenhagen and Frederikshavn in Denmark, and to Kiel in Germany.</code>                        | <code>Dịch vụ phà du lịch hàng ngày vận hành tới Copenhagen và Frederikshavn tại Đan Mạch, và tới Kiel tại Đức.</code>                |
  | <code>In late April 1943, Philipp was ordered to report to Hitler's headquarters, where he stayed for most of the next four months.</code> | <code>Sent i april 1943 fick Philipp ordern att rapportera till Hitlers högkvarter, där han stannade i fyra månader.</code>           |
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

<details><summary>opensubtitles</summary>

* Dataset: [opensubtitles](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-opensubtitles) at [d86a387](https://huggingface.co/datasets/sentence-transformers/parallel-sentences-opensubtitles/tree/d86a387587ab6f2fd9ec7453b2765cec68111c87)
* Size: 4,990,000 training samples
* Columns: <code>english</code> and <code>non_english</code>
* Approximate statistics based on the first 1000 samples:
  |         | english                                                                                        | non_english                                                                                    |
  |:--------|:-----------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------|
  | type    | string                                                                                         | string                                                                                         |
  | details | <ul><li>min: 0 characters</li><li>mean: 34.43 characters</li><li>max: 220 characters</li></ul> | <ul><li>min: 0 characters</li><li>mean: 26.99 characters</li><li>max: 118 characters</li></ul> |
* Samples:
  | english                                                                 | non_english                                                    |
  |:------------------------------------------------------------------------|:---------------------------------------------------------------|
  | <code>Would you send a tomato juice, black coffee and a masseur?</code> | <code>هل لك أن ترسل لي عصير طماطم قهوة سوداء.. والمدلك!</code> |
  | <code>To hear the angels sing</code>                                    | <code>لكى تسمع غناء الملائكه</code>                            |
  | <code>Brace yourself.</code>                                            | <code>" تمالك نفسك " بريكر</code>                              |
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

<details><summary>stackexchange</summary>

* Dataset: [stackexchange](https://huggingface.co/datasets/sentence-transformers/stackexchange-duplicates) at [1c9657a](https://huggingface.co/datasets/sentence-transformers/stackexchange-duplicates/tree/1c9657aec12d9e101667bb9593efcc623c4a68ff)
* Size: 250,519 training samples
* Columns: <code>post1</code> and <code>post2</code>
* Approximate statistics based on the first 1000 samples:
  |         | post1                                                                                             | post2                                                                                             |
  |:--------|:--------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------|
  | type    | string                                                                                            | string                                                                                            |
  | details | <ul><li>min: 77 characters</li><li>mean: 669.56 characters</li><li>max: 3982 characters</li></ul> | <ul><li>min: 81 characters</li><li>mean: 641.44 characters</li><li>max: 4053 characters</li></ul> |
* Samples:
  | post1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | post2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
  |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>New user question about passwords Just got a refurbished computer with Ubuntu as the OS.  Have never even heard of the OS and now I'm trying to learn.  When I boot the system, it starts up great.  But, if I try to navigate around, it requires a password.  Is there a trick to finding the initial password?  Please advise.</code>                                                                                                                                              | <code>How do I reset a lost administrative password? I'm working on a Ubuntu system, and my client has completely forgotten his administrative password. He doesn't even remember entering one; however it is there.  I've tried the suggestions on the website, and I have been unsuccessful in deleting the password so that I can download applets required for running some files. Is there a solution?</code>                                                                                                    |
  | <code>Reorder a list of string randomly but constant in a period of time I need to reorder a list in a random way but I want to have the same result on a short period of time ... So I have:  var list = new String[] { "Angie", "David", "Emily", "James" }    var shuffled = list.OrderBy(v =&gt; "4a78926c")).ToList();   But I always get the same order ... I could use Guid.NewGuid() but then I would have a different result in a short period of time.  How can I do this?</code> | <code>Randomize a List What is the best way to randomize the order of a generic list in C#? I've got a finite set of 75 numbers in a list I would like to assign a random order to, in order to draw them for a lottery type application.</code>                                                                                                                                                                                                                                                                      |
  | <code>Made a mistake on check need help to fix I wrote a check and put the amount in the pay to order spot. Can I just mark it out, put the name in the spot and finish writing the check?</code>                                                                                                                                                                                                                                                                                           | <code>How to correct a mistake made when writing a check? I think I know the answer to this, but I'm not sure, and it's a good question, so I'll ask:  What is the accepted/proper way to correct a mistake made on a check?  For instance, I imagine that in any given January, some people accidentally date a check in the previous year.  Is there a way to correct such a mistake, or must a check be voided (and wasted)?  Pointers to definitive information (U.S., Canada, and elsewhere) are helpful.</code> |
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

<details><summary>quora</summary>

* Dataset: [quora](https://huggingface.co/datasets/sentence-transformers/quora-duplicates) at [451a485](https://huggingface.co/datasets/sentence-transformers/quora-duplicates/tree/451a4850bd141edb44ade1b5828c259abd762cdb)
* Size: 101,762 training samples
* Columns: <code>anchor</code>, <code>positive</code>, and <code>negative</code>
* Approximate statistics based on the first 1000 samples:
  |         | anchor                                                                                          | positive                                                                                        | negative                                                                                        |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          | string                                                                                          |
  | details | <ul><li>min: 16 characters</li><li>mean: 53.47 characters</li><li>max: 249 characters</li></ul> | <ul><li>min: 16 characters</li><li>mean: 52.63 characters</li><li>max: 237 characters</li></ul> | <ul><li>min: 14 characters</li><li>mean: 54.67 characters</li><li>max: 292 characters</li></ul> |
* Samples:
  | anchor                                                | positive                                         | negative                                            |
  |:------------------------------------------------------|:-------------------------------------------------|:----------------------------------------------------|
  | <code>What food should I try in Brazil?</code>        | <code>Which foods should I try in Brazil?</code> | <code>What meat should one eat in Argentina?</code> |
  | <code>What is the best way to get a threesome?</code> | <code>How does one find a threesome?</code>      | <code>How is the experience of a threesome?</code>  |
  | <code>Whether I do CA or MBA? Which is better?</code> | <code>Which is better CA or MBA?</code>          | <code>Which is better CA or IT?</code>              |
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

<details><summary>wikianswers_duplicates</summary>

* Dataset: [wikianswers_duplicates](https://huggingface.co/datasets/sentence-transformers/wikianswers-duplicates) at [9af6367](https://huggingface.co/datasets/sentence-transformers/wikianswers-duplicates/tree/9af6367d1ad084daf8a9de9c21bc33fcdc7770d0)
* Size: 9,990,000 training samples
* Columns: <code>anchor</code> and <code>positive</code>
* Approximate statistics based on the first 1000 samples:
  |         | anchor                                                                                          | positive                                                                                        |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          |
  | details | <ul><li>min: 14 characters</li><li>mean: 47.39 characters</li><li>max: 151 characters</li></ul> | <ul><li>min: 15 characters</li><li>mean: 47.58 characters</li><li>max: 154 characters</li></ul> |
* Samples:
  | anchor                                                                | positive                                                                 |
  |:----------------------------------------------------------------------|:-------------------------------------------------------------------------|
  | <code>Did Democritus belive matter was continess?</code>              | <code>Why did democritus call the smallest pice of matter atomos?</code> |
  | <code>Tell you about the most ever done to satisfy a customer?</code> | <code>How do you satisfy your client or customer?</code>                 |
  | <code>How is a chemical element different from a compound?</code>     | <code>How is a chemical element different to a compound?</code>          |
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

<details><summary>all_nli</summary>

* Dataset: [all_nli](https://huggingface.co/datasets/sentence-transformers/all-nli) at [d482672](https://huggingface.co/datasets/sentence-transformers/all-nli/tree/d482672c8e74ce18da116f430137434ba2e52fab)
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

<details><summary>simple_wiki</summary>

* Dataset: [simple_wiki](https://huggingface.co/datasets/sentence-transformers/simple-wiki) at [60fd9b4](https://huggingface.co/datasets/sentence-transformers/simple-wiki/tree/60fd9b4680642ace0e2604cc2de44d376df419a7)
* Size: 102,225 training samples
* Columns: <code>text</code> and <code>simplified</code>
* Approximate statistics based on the first 1000 samples:
  |         | text                                                                                            | simplified                                                                                       |
  |:--------|:------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                           |
  | details | <ul><li>min: 18 characters</li><li>mean: 149.3 characters</li><li>max: 573 characters</li></ul> | <ul><li>min: 16 characters</li><li>mean: 123.58 characters</li><li>max: 576 characters</li></ul> |
* Samples:
  | text                                                                                                                                                                                                                              | simplified                                                                                                                                                                                                              |
  |:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>The next morning , it had a small CDO and well-defined bands , and the system , either a weak tropical storm or a strong tropical depression , likely reached its peak .</code>                                             | <code>The next morning , it had a small amounts of convection near the center and well-defined bands , and the system , either a weak tropical storm or a strong tropical depression , likely reached its peak .</code> |
  | <code>The region of measurable parameter space that corresponds to a regime is very often loosely defined . Examples include `` the superfluid regime '' , `` the steady state regime '' or `` the femtosecond regime '' .</code> | <code>This is common if a regime is threatened by another regime .</code>                                                                                                                                               |
  | <code>The Lamborghini Diablo is a high-performance mid-engined sports car that was built by Italian automaker Lamborghini between 1990 and 2001 .</code>                                                                          | <code>The Lamborghini Diablo is a sport car that was built by Lamborghini from 1990 to 2001 .</code>                                                                                                                    |
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

<details><summary>altlex</summary>

* Dataset: [altlex](https://huggingface.co/datasets/sentence-transformers/altlex) at [97eb209](https://huggingface.co/datasets/sentence-transformers/altlex/tree/97eb20963455c361d5a81c107c3596cff9e0cd82)
* Size: 112,696 training samples
* Columns: <code>text</code> and <code>simplified</code>
* Approximate statistics based on the first 1000 samples:
  |         | text                                                                                             | simplified                                                                                       |
  |:--------|:-------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------|
  | type    | string                                                                                           | string                                                                                           |
  | details | <ul><li>min: 13 characters</li><li>mean: 131.03 characters</li><li>max: 492 characters</li></ul> | <ul><li>min: 13 characters</li><li>mean: 112.41 characters</li><li>max: 492 characters</li></ul> |
* Samples:
  | text                                                                                                                                                                                                                                 | simplified                                                                                                                                           |
  |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>Reinforcement and punishment are the core tools of operant conditioning .</code>                                                                                                                                               | <code>Principles of operant conditioning :</code>                                                                                                    |
  | <code>The Japanese Ministry of Health , Labour and Welfare defines `` hikikomori '' as people who refuse to leave their house and , thus , isolate themselves from society in their homes for a period exceeding six months .</code> | <code>The Japanese Ministry of Health , Labour and Welfare defines hikikomori as people who refuse to leave their house for over six months .</code> |
  | <code>It has six rows of black spines and has a pair of long , clubbed spines on the head .</code>                                                                                                                                   | <code>It has a pair of long , clubbed spines on the head .</code>                                                                                    |
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

#### flickr30k_captions

* Dataset: [flickr30k_captions](https://huggingface.co/datasets/sentence-transformers/flickr30k-captions) at [0ef0ce3](https://huggingface.co/datasets/sentence-transformers/flickr30k-captions/tree/0ef0ce31492fd8dc161ed483a40d3c4894f9a8c1)
* Size: 158,881 training samples
* Columns: <code>caption1</code> and <code>caption2</code>
* Approximate statistics based on the first 1000 samples:
  |         | caption1                                                                                        | caption2                                                                                        |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          |
  | details | <ul><li>min: 20 characters</li><li>mean: 63.19 characters</li><li>max: 318 characters</li></ul> | <ul><li>min: 13 characters</li><li>mean: 63.65 characters</li><li>max: 205 characters</li></ul> |
* Samples:
  | caption1                                                                                          | caption2                                                                          |
  |:--------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------|
  | <code>Four women pose for a photograph with a man in a bright yellow suit.</code>                 | <code>A group of friends get their photo taken with a man in a green suit.</code> |
  | <code>A many dressed in army gear walks on the crash walking a brown dog.</code>                  | <code>A man with army fatigues is walking his dog.</code>                         |
  | <code>Four people are sitting around a kitchen counter while one is drinking from a glass.</code> | <code>A group of people sit around a breakfast bar.</code>                        |
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

<details><summary>coco_captions</summary>

* Dataset: [coco_captions](https://huggingface.co/datasets/sentence-transformers/coco-captions) at [bd26018](https://huggingface.co/datasets/sentence-transformers/coco-captions/tree/bd2601822b9af9a41656d678ffbd5c80d81e276a)
* Size: 414,010 training samples
* Columns: <code>caption1</code> and <code>caption2</code>
* Approximate statistics based on the first 1000 samples:
  |         | caption1                                                                                        | caption2                                                                                        |
  |:--------|:------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
  | type    | string                                                                                          | string                                                                                          |
  | details | <ul><li>min: 30 characters</li><li>mean: 52.57 characters</li><li>max: 151 characters</li></ul> | <ul><li>min: 29 characters</li><li>mean: 52.71 characters</li><li>max: 186 characters</li></ul> |
* Samples:
  | caption1                                                                                                     | caption2                                                                             |
  |:-------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------|
  | <code>THERE ARE FRIENDS ON THE BEACH POSING </code>                                                          | <code>A group of people standing together on the beach while holding a woman.</code> |
  | <code>a lovely white bathroom with white shower curtain.</code>                                              | <code>A white toilet sitting in a bathroom next to a sink.</code>                    |

_The publisher's README is longer; it is cut here. Read the rest at the source._
