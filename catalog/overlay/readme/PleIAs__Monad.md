# ⚛️ Monad

<div align="center">
  <img src="figures/pleias.jpg" width="60%" alt="Pleias" />
</div>

<p align="center">
  <a href="https://pleias.fr/blog/blogsynth-the-new-data-frontier"><b>Blog announcement</b></a>
</p>

**Monad** is a 56 million parameters generalist Small Reasoning Model, trained on 200 billions tokens from <a href="https://huggingface.co/PleIAs/Baguettotron">SYNTH</a>, a fully open generalist dataset.

As of 2025, Monad is the best contender for the smallest viable language models. Despite being less than half of gpt-2, Monad not only answers in consistent English but performs significanly beyond chance on MMLU and other major industry benchmarks.

<p align="center">
  <img width="80%" src="figures/training_efficiency.jpeg">
</p>

Monad's name is a reference to Leibniz concept and general idea of the smallest possible unit of intelligence.

## Features
Monad has been natively trained for instructions with thinking traces. We implemented a series of dedicated pipelines for:
* Memorization of encyclopedic knowledge (50,000 vital articles from Wikipedia), though in this size range hallucinations have to be expected.
* Retrieval-Augmented Generation with grounding (following on our initial experiments with Pleias-RAG series)
* Arithmetic and simple math resolution problem
* Editing tasks
* Information extraction
* Creative writing, including unusual synthetic exercises like lipograms or layout poems.

Monad is strictly monolingual in English. We trained a new custom tokenizer (likely one of the smallest tokenizer to date, less than 8,000 individual tokens), exclusively trained on SYNTH so that we maintain a relatively good compression ratio. 

## Model design and training
Monad is a 56M parameters decoders with a standard Qwen/Llama-like design, except for its extremely compact size and overall opiniated architecture for depth (with 64 layers)
<p align="center">
  <img width="80%" src="figures/monad_structure.png">
</p>

Monad was trained on 16 h100 from Jean Zay (compute plan n°A0191016886). Full pre-training took a bit less than 6 hours.

## Evaluation
Monad attains performance on MMLU significantly beyond chance with close to 30% of positive rate. We also find non-random results on gsm8k (8%) and HotPotQA (8%)

To our knowledge, there is no model remotely close in this size range for evaluation comparison. Spiritually and practically, Monad remains unique.

## Use and deployment
Monad has been trained on the standard instruction style from Qwen.

```xml
<|im_start|>user
Who are you?<|im_end|>
<|im_start|>assistant
<think>
```

Monad has no support yet for multi-turn.

A major envisioned use case for Monad is explainability, as the model does provide a unique trade-off between observability and actual reasoning performance.