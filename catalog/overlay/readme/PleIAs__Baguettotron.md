# 🥖 Baguettotron

<div align="center">
  <img src="figures/pleias.jpg" width="60%" alt="Pleias" />
</div>

<p align="center">
  <a href="https://pleias.fr/blog/blogsynth-the-new-data-frontier"><b>Blog announcement</b></a>
</p>

**Baguettotron** is a 321 million parameters generalist Small Reasoning Model, trained on 200 billions tokens from <a href="https://huggingface.co/datasets/PleIAs/SYNTH">SYNTH</a>, a fully open generalist dataset.

Despite being trained on consideraly less data, Baguettotron outperforms most SLM of the same size range on non-code industry benchmarks, providing an unprecedented balance between memory, general reasoning, math and retrieval performance.

<p align="center">
  <img width="80%" src="figures/training_efficiency.jpeg">
</p>

The name is both a nod to French origins and to the unusual shape of the model: with 80 layers, Baguettotron is currently the deepest SLM in its size range.

## Features
Baguettron has been natively trained for instructions with thinking traces. We implemented a series of dedicated pipelines for:
* Memorization of encyclopedic knowledge (50,000 vital articles from Wikipedia)
* Retrieval-Augmented Generation with grounding (following on our initial experiments with Pleias-RAG series)
* Arithmetic and simple math resolution problem
* Editing tasks
* Information extraction
* Creative writing, including unusual synthetic exercises like lipograms or layout poems.
* Cooking (the model wouldn't deserve its name otherwise)

Baguettotron is able to read and write in the main European languages: French, German, Italian, Spanish, Polish and, to a lesser extent Latin and Dutch. Reasoning traces are exclusively written in English.

Full synthetic training makes relatively straightforward to expand language support and we lookg forward to either bring more languages or create language-specific variants.

## Model design and training
Baguettotron is a 321M parameters decoders with a standard Qwen/Llama-like design, except for extreme depth with 80 layers (a type of model we internally nicknamed "baguette")
<p align="center">
  <img width="80%" src="figures/baguettotron_structure.png">
</p>

Baguettotron was trained on 16 h100 from Jean Zay (compute plan n°A0191016886). An unusual feature of training on SYNTH was having reasoning signals from MMLU and other major industry benchmarks very early on. We were able to empirically measure consistent improvements from stacking more layers.

<p align="center">
  <img width="80%" src="figures/training_baguettotron.png">
</p>

Our current hypothesis is that deeper architecture benefits more from dense reasoning data, as the model is more commonly exposed to string sequences requiring intensive computation or knowledge interconnection. 

## Reasoning style
The reasoning traces use an entirely new reasoning style with dense, short frequently non-verbal sentences, designed by Pleias and made possible thanks to the use of fine-tuning models for synthetic generation.

Traces use the following stenographic notation integrated into the special tokens of the model:

### Logical markers

| Token | Meaning                           | Usage                                                      |
| ----- | ---------------------------------- | ---------------------------------------------------------- |
| **→** | derivation / implication           | For very short causal/logical flow |
| **↺** | iterative return / refinement loop | For backtracking, reconsidering priors, RAG re-querying.   |
| **?** | uncertainty/questions to resolve   | Could be appended to short expressions/word, not just interrogative sentences                  |
| **!/※** | insight/breakthroughs            | Emphatic mark for knowledge discovery                  |
| **≈** | approximation/estimates   | For intermediary hypothesis/uncertain preliminary statements               |
| **∴** | therefore / final step             | Use sparingly to mark stable conclusions.                  |

### Uncertainty

| Token | Meaning                   | Usage                                                         |
| ----- | ------------------------- | ------------------------------------------------------------- |
| **●** | high confidence           | well-supported empirical/theoretical ground; “anchor points.” |
| **◐** | medium/partial confidence | incomplete data; plausible but unverified links.              |
| **○** | low confidence            | speculation, missing context, weak inference chain.           |
| **⚠** | bias/premise risk                     | domain mismatch, cultural assumptions, language-switch artifacts. |
| **?maybe?** | soft speculation | marks tentative ideas, reasoning branches that might collapse later |

### Verification process

| Token | Meaning                   | Usage                                    |
| ----- | ------------------------- | ---------------------------------------- |
| **☐** | unverified hypothesis     | raw claim, no cross-check yet.           |
| **☑** | intermediate verification | one source/argument supports it.         |
| **✓** | confirmed/validated       | multiple independent supports (●-level). |

The model can also use a vareity of graphic notation for causality/problem decomposition at time. Things like:

```
Initial query:
├─ feature1: *lorem ipsum*
├─ feature2: *lorem ipsum*
└─ feature2: *lorem ipsum*
```

### Simulated entropy

Baguettotron uses a range of special tokens **⟨H≈X.X⟩** to introduce higher entropy sequences, a bit similarly to temperature control.
* **⟨H≈0.3–0.5⟩**: still grounded sequences with a slightly higher token entropy
* **⟨H≈0.5–1.0⟩**: exploratory, multi-path reasoning
* **⟨H≈1.5–1.8⟩**: fragmented, oniric, literary stream-of-consciousness drift

It remains a pure simulation since the model does obviously not have access to inference controls. Yet it still allows for more token exploration/diversification. Inspiration from this method came from the <a href="https://github.com/xjdr-alt/entropix">Entropix</a> project.

## Evaluation

We evaluated Baguettotron on three major industry benchmarks MMLU (general reasoning and memorization), math (gsm8k) and retrieval (HotPotQA). With only 321M parameters, Baguettotron gets close to Qwen-0.6B performance and significantly outperforms similarly sized Gemma.

<p align="center">
  <img width="80%" src="figures/table_evaluation.png">
</p>

## Inference
Baguettotron has been trained on the standard instruction style from Qwen.

```xml
<|im_start|>user
Who are you?<|im_end|>
<|im_start|>assistant
<think>
```

Baguettotron has support for multi-turn. We recommend to use a "rolling" thinking, by systematically appending thinking traces for each new generation but discarding the past one.

It's possible to remove thinking traces by swapping <think> with a closing </think> tag.

```xml
<|im_start|>user
Who are you?<|im_end|>
<|im_start|>assistant
</think>
```

Yet, our current tests show a significantly decreased performance for most tasks, especially memorization of encyclopedic knowledge.

For RAG, Baguettotron uses a special syntax to pass on references:

```xml
<|im_start|>user
Who are you?

<source_1>[…]</source_1>
<source_2>[…]</source_2>
<|im_end|>
<|im_start|>assistant
<think>
```

Afterwards the model will return an answer with grounding references (<ref>[quote]</ref>). The draft will be affected as well and focus on source synthesis rather than reminiscence of internal knowledge base.

## Fine-Tuning/RL

Baguettotron has been successfully fine-tuned for a variety of tasks including text classification and <a href="https://x.com/darrenangle/status/1990259914602856831">poetry writing</a>.

Since it's a reasoning model, it should train well with reinforcement learning methods like GRPO, either for verifiable tasks or with a LLM-as-a-judge.