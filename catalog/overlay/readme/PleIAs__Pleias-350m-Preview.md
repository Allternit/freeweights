<div style="text-align: center;">
  <img src="https://raw.githubusercontent.com/Pleias/logos/d6152d7943905da32a1e04fdfd7708ed9c7eed5e/PleIAs%201_0%20Full%20Logo%20(Black).png" style="width: 80%; margin: 0 auto; display: inline-block;"/>
</div>


**Pleias-pico-350m-Preview** is an early preview of a 350 million parameter base model trained by [Pleias](https://huggingface.co/PleIAs) on [Common Corpus](https://huggingface.co/datasets/PleIAs/common_corpus).

Like all the base and specialized models from Pleias, Pleias-pico-350m-Preview has only been trained on open data out of copyright (public domain) or under a permissible license.

## Description

Pleias-pico-350m-Preview is a transformer base model, entirely pretrained from scratch, using an architecture similar to Llama/GPT-Neox for easier deployment/inference.

It includes the following features, that would apply to any responsibly trained variant:
* Only trained on open data under a permissible license and in compliance with the European AI Act. By design, all Pleias model are unable to output copyrighted content.
* Extensive multilingual support for main European languages.
* A new tokenizer designed for enhanced document processing tasks and better multilingual support.
* Extremely low level of toxicity and problematic content.


Pleias-pico-350m-Preview has demonstrated unusual abilities for multilingual generation in its size range. Fully supported languages include English, French, Spanish, German, Italian, Dutch, Latin and Portuguese. 

Given its size, Pleias-pico-350m-Preview can run on CPU without any compression loss. We provide a first GGUF variant as part of our release.

## Recommended use
As a base model, Pleias-pico-350m-Preview is only able to run continuation prompts.

Text generation is currently able to support a range of creative writing tasks in multiple European languages. For more consistent results we recommend using a low or null temperature with a slight repetition penalty (1.1-1.2).

Pleias-pico-350m-Preview has been successfully adapted for continuous pretraining and full-fine-tuning on document processing tasks such as RAG, translation or OCR correction. Given the small size of the model we do not recommend fine-tuning methods based on LORA.

## Examples
With only 350 million parameters, Pleias-pico-350m-Preview is able to generate consistent texts in multiple European languages.

Thanks to an unprecedented coverage of ancient texts in public domain, Pleias-pico-350m-Preview is even able to generate texts in historical script. Such as a continuation of <i>To be or not to be</i> in original spelling:

<blockquote>
<b>To be, or not to be, that is the Queſtion:<br/>
Whether 'tis Nobler in the minde to ſuffer<br/>
The Slings and Arrowes of outragious Fortune,<br/>
Or to take Armes against a Sea of troubles?</b><br/>
And if it be ſo, then what can we do?<br/>
But to make our ſelves the more obnoxious<br/>
To this unjuſt Tyrant, whoſe cruelty<br/>
Is but too often the cauſe of his own.<br/>
For he hath made us all his Enemies,<br/>
Whoſe Fury and revengeful Aﬀections<br/>
Are now become the only means of his<br/>
Deſtruction; and therefore, as I have ſaid,<br/>
We are no longer to be ſubject to him.<br/>
</blockquote>

French classic play with the 17th century writing style (including the long s):

<blockquote>
<b>Helas! pour mon malheur ie l’ay trop écouté.<br/>
Ie n’ay point du ſilence affecté le myſtère.<br/>
Ie croyois ſans péril pouuoir eſtre ſincere.<br/>
Et ſans armer mes yeux d’vn moment de rigueur,<br/></b>
Je ne voy pas que ce foit vn crime à la nature:<br/>
Mais je vous prie, qu'on me donne quelque recompenſe :<br/>
Pourquoy donc auec tant de gloire &c en vne heure?<br/>
Cela fait voir bien clairement que ma deſpenſe<br/>
Eſt plus grande que celle des autres hommes ;<br/>
Car il eſt certain que les Princes font moins heureux;<br/>
Que ceux qui ont eu leur vie par leurs mains confacrée.<br/>
</blockquote>

Pleias-pico-350m-Preview is able to intersperse languages and has good capacities for translation, even in classical languages like Latin:

<blockquote>
<b>Cicero advocated for a similar idea: Equidem ad</b> pacem, non ut in pace sit; sed ut in pace. Cicero's statement is echoed by other authors of the time, such as Quintilian and Tacitus, who also emphasized the importance of peace over war (Quint., Inst., 1, 4). In contrast to the Roman concept of "pax" or "pacificus", which was often associated with military conquests, Cicero saw peace as an ideal state that could be achieved through peaceful means. 
</blockquote>

## Training
Pleias-pico-350m-Preview was fully pretrained at Jean Zay on 64 h100s for 46 hours with Nanotron, the pretraining library from HuggingFace. We provide the complete settings as a yaml file as part of our release. 

Training schedule includes 518,000 steps (batch size 1,024) on a filtered and enhanced version of Common Corpus (1,086,324,736,000 tokens).

Training Greenhouse Gas Emissions: Estimated total location-based greenhouse gas emissions were 0,5 tons CO2eq for training. 

## Ethical Considerations

pleias-pico-350-Preview model, like all large language models, carries inherent ethical risks that require careful consideration. Our approach to mitigating these risks begins at the data level, where we exclusively use vetted sources, deliberately excluding CommonCrawl. The primary challenge comes from our public domain dataset component, which contains historical texts that may reflect outdated social norms and potentially harmful language, particularly regarding minoritized groups.

To address this, we implemented a systematic ethical filtering process using toxicity classifiers to identify extremely harmful content. We also employed synthetic rewriting techniques to transform mildly problematic passages while preserving the underlying informational value. This process significantly reduced potential societal harm without compromising the dataset's size or textual quality, resulting in notably low toxicity scores in benchmarks compared to other models.

Despite these preventive measures, users should be aware that the model has not undergone additional safety alignment procedures and may still produce problematic outputs. The model's capabilities in generative AI tasks must be balanced against the risks of bias, misinformation propagation, and autonomous decision-making challenges. We explicitly prohibit any malicious utilization and emphasize the responsibility of users to implement appropriate safeguards.

At Pleias, we continue to research and develop improved methods for creating safer and more equitable models and datasets. This includes ongoing work in toxicity reduction, bias mitigation, and the development of more sophisticated ethical filtering techniques.

## Acknowledgements

This work would not have been possible without the substantial support from étalab. 

The training was conducted as part of the Grand Challenge of GENCI, aligned with the European strategy for establishing AI factories through the EuroHPC Joint Undertaking, aimed at supporting European startups and providing open-source models to the community.

We express our gratitude to GENCI's Jean Zay supercomputer, France's AI flagship facility, which was instrumental in our model's training. The project benefited from the new NVIDIA H100 partition specifically dedicated to the French AI community. We appreciate the generous allocation of compute hours over five months and the invaluable technical expertise provided by IDRIS, EVIDEN, and NVIDIA (as well as its Inception program).

We are deeply grateful to the Mozilla Foundation Local AI Program for their generous support. 

Finally, we acknowledge the significant contributions from the open science LLM community, particularly HuggingFace, Eleuther AI and Allen AI whose insights and cooperation have been invaluable to our work.

## Update
Pleias-pico-350m-Preview is currently released as an early preview.

The model will undergo several more round of post-training to enhance reasoning capacities and fine-tunability as well as in anticipation of a generalist instruct version.
