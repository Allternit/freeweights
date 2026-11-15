<div style="text-align: center;">
  <img src="https://raw.githubusercontent.com/Pleias/logos/d6152d7943905da32a1e04fdfd7708ed9c7eed5e/PleIAs%201_0%20Full%20Logo%20(Black).png" style="width: 80%; margin: 0 auto; display: inline-block;"/>
</div>

**Pleias-nano-1.2b-Preview** is an early preview of a 1.21 billion parameters base model trained by [Pleias](https://huggingface.co/PleIAs) with [Tracto AI](https://tracto.ai/) on [Common Corpus](https://huggingface.co/datasets/PleIAs/common_corpus).

Like all the base and specialized models from Pleias, Pleias-nano-1.2b-Preview has only been trained on open data out of copyright (public domain) or under a permissible license.

## Description
Pleias-nano-1.2b-Preview is a transformer base model, entirely pretrained from scratch, using an architecture similar to Llama/GPT-Neox for easier deployment/inference.

It includes the following features, that would apply to any responsibly trained variant:
* Only trained on open data under a permissible license and in compliance with the European AI Act. By design, all Pleias model are unable to output copyrighted content.
* Extensive multilingual support for main European languages.
* A new tokenizer designed for enhanced document processing tasks and better multilingual support.
* Extremely low level of toxicity and problematic content.

Pleias-nano-1.2b-Preview has demonstrated unusual abilities for multilingual generation in its size range. Fully supported languages include English, French, Spanish, German, Italian, Dutch, Latin and Portuguese. 

Given its size, Pleias-nano-1.2b-Preview can run on CPU without any compression loss. We provide a first GGUF variant as part of our release.

## Recommended use
As a base model, Pleias-nano-1.2b-Preview is only able to run continuation prompts.

Text generation is currently able to support a range of creative writing tasks in multiple European languages. For more consistent results we recommend using a low or null temperature with a slight repetition penalty (1.2).

Pleias-nano-1.2b-Preview has been successfully adapted for continuous pretraining and full-fine-tuning on document processing tasks such as RAG, translation or OCR correction. Given the small size of the model we do not recommend fine-tuning methods based on LORA.

## Example


## Training
Pleias-nano-1.2b-Preview was fully pretrained on TractoAI on ISEG GPU cluster by Nebius AI on 192 h100s for 5 days. Pretraining code relied on [the fork of Nanotron developed by TractoAI](https://github.com/tractoai/nanotron). We provide the complete settings as a yaml file as part of our release. 

Training schedule includes 518,000 steps (batch size 1,024) on over three epochs (nearly 5 trillions tokens):
* A lightly filtered version of Common Corpus (1.6 trillion tokens)
* A filtered and enhanced version of Common Corpus (1,086,324,736,000 tokens).
* A repeat of the previous set.
  
Training Greenhouse Gas Emissions: Estimated total location-based greenhouse gas emissions were 4 tons CO2eq for training. 

## Ethical Considerations

pleias-1.B-Base model, like all large language models, carries inherent ethical risks that require careful consideration. Our approach to mitigating these risks begins at the data level, where we exclusively use vetted sources, deliberately excluding CommonCrawl. The primary challenge comes from our public domain dataset component, which contains historical texts that may reflect outdated social norms and potentially harmful language, particularly regarding minoritized groups.

To address this, we implemented a systematic ethical filtering process using toxicity classifiers to identify extremely harmful content. We also employed synthetic rewriting techniques to transform mildly problematic passages while preserving the underlying informational value. This process significantly reduced potential societal harm without compromising the dataset's size or textual quality, resulting in notably low toxicity scores in benchmarks compared to other models.

Despite these preventive measures, users should be aware that the model has not undergone additional safety alignment procedures and may still produce problematic outputs. The model's capabilities in generative AI tasks must be balanced against the risks of bias, misinformation propagation, and autonomous decision-making challenges. We explicitly prohibit any malicious utilization and emphasize the responsibility of users to implement appropriate safeguards.

At Pleias, we continue to research and develop improved methods for creating safer and more equitable models and datasets. This includes ongoing work in toxicity reduction, bias mitigation, and the development of more sophisticated ethical filtering techniques.

## Acknowledgements

This work would not have been possible without the substantial support and technical expertise from TractoAI, a serverless AI platform for running data and compute-intensive workloads at scale.

We are deeply grateful to the Mozilla Foundation Local AI Program for their generous support. 

Finally, we acknowledge the significant contributions from the open science LLM community, particularly HuggingFace, Eleuther AI and Allen AI whose insights and cooperation have been invaluable to our work.

## Update
Pleias-1.2b-Preview is currently released as an early preview.

The model will undergo several more round of post-training to enhance reasoning capacities and fine-tunability as well as in anticipation of a generalist instruct version.
