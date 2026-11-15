# BERT multilingual base model (uncased)

Pretrained model on the top 102 languages with the largest Wikipedia using a masked language modeling (MLM) objective.
It was introduced in [this paper](https://arxiv.org/abs/1810.04805) and first released in
[this repository](https://github.com/google-research/bert). This model is uncased: it does not make a difference
between english and English.

Disclaimer: The team releasing BERT did not write a model card for this model so this model card has been written by
the Hugging Face team.

## Model description

BERT is a transformers model pretrained on a large corpus of multilingual data in a self-supervised fashion. This means
it was pretrained on the raw texts only, with no humans labelling them in any way (which is why it can use lots of
publicly available data) with an automatic process to generate inputs and labels from those texts. More precisely, it
was pretrained with two objectives:

- Masked language modeling (MLM): taking a sentence, the model randomly masks 15% of the words in the input then run
  the entire masked sentence through the model and has to predict the masked words. This is different from traditional
  recurrent neural networks (RNNs) that usually see the words one after the other, or from autoregressive models like
  GPT which internally mask the future tokens. It allows the model to learn a bidirectional representation of the
  sentence.
- Next sentence prediction (NSP): the models concatenates two masked sentences as inputs during pretraining. Sometimes
  they correspond to sentences that were next to each other in the original text, sometimes not. The model then has to
  predict if the two sentences were following each other or not.

This way, the model learns an inner representation of the languages in the training set that can then be used to
extract features useful for downstream tasks: if you have a dataset of labeled sentences for instance, you can train a
standard classifier using the features produced by the BERT model as inputs.

## Intended uses & limitations

You can use the raw model for either masked language modeling or next sentence prediction, but it's mostly intended to
be fine-tuned on a downstream task. See the [model hub](https://huggingface.co/models?filter=bert) to look for
fine-tuned versions on a task that interests you.

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

const unmasker = await pipeline("fill-mask", "onnx-community/bert-base-multilingual-uncased-ONNX");
const result = await unmasker("The capital of France is [MASK].", { top_k: 3 });
console.log(result);
// [
//   { score: 0.2571190595626831, token: 10718, token_str: 'paris', sequence: 'the capital of france is paris.' },
//   { score: 0.15583284199237823, token: 18254, token_str: 'lyon', sequence: 'the capital of france is lyon.' },
//   { score: 0.06897224485874176, token: 25091, token_str: 'bordeaux', sequence: 'the capital of france is bordeaux.' }
// ]
```

### Limitations and bias

Even if the training data used for this model could be characterized as fairly neutral, this model can have biased
predictions. This bias will also affect all fine-tuned versions of this model.

## Training data

The BERT model was pretrained on the 102 languages with the largest Wikipedias. You can find the complete list
[here](https://github.com/google-research/bert/blob/master/multilingual.md#list-of-languages).

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
