# BERT base model (uncased)

Pretrained model on English language using a masked language modeling (MLM) objective. It was introduced in
[this paper](https://arxiv.org/abs/1810.04805) and first released in
[this repository](https://github.com/google-research/bert). This model is uncased: it does not make a difference
between english and English.

Disclaimer: The team releasing BERT did not write a model card for this model so this model card has been written by
the Hugging Face team.

## Model description

BERT is a transformers model pretrained on a large corpus of English data in a self-supervised fashion. This means it
was pretrained on the raw texts only, with no humans labeling them in any way (which is why it can use lots of
publicly available data) with an automatic process to generate inputs and labels from those texts. More precisely, it
was pretrained with two objectives:

- Masked language modeling (MLM): taking a sentence, the model randomly masks 15% of the words in the input then run
  the entire masked sentence through the model and has to predict the masked words. This is different from traditional
  recurrent neural networks (RNNs) that usually see the words one after the other, or from autoregressive models like
  GPT which internally masks the future tokens. It allows the model to learn a bidirectional representation of the
  sentence.
- Next sentence prediction (NSP): the models concatenates two masked sentences as inputs during pretraining. Sometimes
  they correspond to sentences that were next to each other in the original text, sometimes not. The model then has to
  predict if the two sentences were following each other or not.

This way, the model learns an inner representation of the English language that can then be used to extract features
useful for downstream tasks: if you have a dataset of labeled sentences, for instance, you can train a standard
classifier using the features produced by the BERT model as inputs.

## Model variations

BERT has originally been released in base and large variations, for cased and uncased input text. The uncased models also strips out an accent markers.  
Chinese and multilingual uncased and cased versions followed shortly after.  
Modified preprocessing with whole word masking has replaced subpiece masking in a following work, with the release of two models.  
Other 24 smaller models are released afterward.  

The detailed release history can be found on the [google-research/bert readme](https://github.com/google-research/bert/blob/master/README.md) on github.

| Model | #params | Language |
|------------------------|--------------------------------|-------|
| [`bert-base-uncased`](https://huggingface.co/bert-base-uncased) | 110M   | English |
| [`bert-large-uncased`](https://huggingface.co/bert-large-uncased)              | 340M    | English | sub 
| [`bert-base-cased`](https://huggingface.co/bert-base-cased)        | 110M    | English |
| [`bert-large-cased`](https://huggingface.co/bert-large-cased) | 340M    |  English |
| [`bert-base-chinese`](https://huggingface.co/bert-base-chinese) | 110M    | Chinese |
| [`bert-base-multilingual-cased`](https://huggingface.co/bert-base-multilingual-cased) | 110M | Multiple |
| [`bert-large-uncased-whole-word-masking`](https://huggingface.co/bert-large-uncased-whole-word-masking) | 340M | English |
| [`bert-large-cased-whole-word-masking`](https://huggingface.co/bert-large-cased-whole-word-masking) | 340M | English |

## Intended uses & limitations

You can use the raw model for either masked language modeling or next sentence prediction, but it's mostly intended to
be fine-tuned on a downstream task. See the [model hub](https://huggingface.co/models?filter=bert) to look for
fine-tuned versions of a task that interests you.

Note that this model is primarily aimed at being fine-tuned on tasks that use the whole sentence (potentially masked)
to make decisions, such as sequence classification, token classification or question answering. For tasks such as text
generation you should look at model like GPT2.

### How to use

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use this model directly with a pipeline for masked language modeling:

```js
import { pipeline } from "@huggingface/transformers";

const unmasker = await pipeline("fill-mask", "onnx-community/bert-base-uncased-ONNX");
const result = await unmasker("The capital of France is [MASK].", { top_k: 3 });
console.log(result);
// [
//   { score: 0.41678285598754883, token: 3000, token_str: 'paris', sequence: 'the capital of france is paris.' },
//   { score: 0.07141835987567902, token: 22479, token_str: 'lille', sequence: 'the capital of france is lille.' },
//   { score: 0.06339213997125626, token: 10241, token_str: 'lyon', sequence: 'the capital of france is lyon.' }
// ]
```

### Limitations and bias

Even if the training data used for this model could be characterized as fairly neutral, this model can have biased
predictions. This bias will also affect all fine-tuned versions of this model.

## Training data

The BERT model was pretrained on [BookCorpus](https://yknzhu.wixsite.com/mbweb), a dataset consisting of 11,038
unpublished books and [English Wikipedia](https://en.wikipedia.org/wiki/English_Wikipedia) (excluding lists, tables and
headers).

## Evaluation results

When fine-tuned on downstream tasks, this model achieves the following results:

Glue test results:

| Task | MNLI-(m/mm) | QQP  | QNLI | SST-2 | CoLA | STS-B | MRPC | RTE  | Average |
|:----:|:-----------:|:----:|:----:|:-----:|:----:|:-----:|:----:|:----:|:-------:|
|      | 84.6/83.4   | 71.2 | 90.5 | 93.5  | 52.1 | 85.8  | 88.9 | 66.4 | 79.6    |


### BibTeX entry and citation info

```bibtex
@article{DBLP:journals/corr/abs-1810-04805,
  author    = {Jacob Devlin and
               Ming{-}Wei Chang and
               Kenton Lee and
               Kristina Toutanova},
  title     = {{BERT:} Pre-training of Deep Bidirectional Transformers for Language
               Understanding},
  journal   = {CoRR},
  volume    = {abs/1810.04805},
  year      = {2018},
  url       = {http://arxiv.org/abs/1810.04805},
  archivePrefix = {arXiv},
  eprint    = {1810.04805},
  timestamp = {Tue, 30 Oct 2018 20:39:56 +0100},
  biburl    = {https://dblp.org/rec/journals/corr/abs-1810-04805.bib},
  bibsource = {dblp computer science bibliography, https://dblp.org}
}
```
