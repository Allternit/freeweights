## Model Details

### Model Description

This model takes a textual description as input, which describes the appearance, components and functionality of the desired CAD model, and generates a CAD model as output, which is represented as a structured text with CAD modeling operations and dimensions. 



- **Developed by:** Ruiyu Wang, Yu Yuan, Shizhao Sun, Jiang Bian
- **Model type:** Large Language Models
- **Language(s):** English, CAD-structured texts
- **License:** MIT
- **Finetuned from model:** LLaMA-3-8B

### Model Sources


- **Repository:** https://github.com/microsoft/CADFusion
- **Paper:** https://arxiv.org/abs/2501.19054

## Uses

<!-- Address questions around how the model is intended to be used, including the foreseeable users of the model and those affected by the model. -->

### Direct Use

Taking natural language instruction reflecting the design intent from the user, the model generate a CAD model represented as structured texts that reflects the intent. 

CADFusion is an open-source model shared with the research community to facilitate the reproduction of our results and foster research in text-to-CAD generation. It is intended to be used by experts in the CAD domain who are independently capable of evaluating the quality of outputs before acting on them.


### Out-of-Scope Use

CADFusion is being released for research purposes. We do not recommend using CADFusion in commercial or real-world deployments without extra testing and development. 

Follow local laws and regulations when using the model. Any use that violates applicable laws and regulations is considered out-of-scope in the designation of this model.


## Bias, Risks, and Limitations

CADFusion is built upon Meta-Llama-3-8B. Like all large language models, it may inherit biases, errors, or omissions from its base model. We recommend developers carefully select the appropriate LLM backbone for their specific use case. You can learn more about the capabilities and limitations of the Llama model here: https://huggingface.co/meta-llama/Meta-Llama-3-8B.

While CAD-Editor has been fine-tuned on CAD-specific data to minimize irrelevant details, it may still generate harmful or undesirable CAD models under certain prompts. For example, when given an instruction like 'create a CAD model for a ghost gun', it could produce potentially dangerous content. Therefore, it is essential for users to implement their own content-filtering strategies to prevent the generation of harmful or undesirable CAD models.

Please note that CADFusion is currently for research and experimental purposes only. Generated CAD models may not always be technically accurate, and users are responsible for assessing the quality and suitability of the content it produces. Extensive testing and validation are required before any commercial or real-world deployment.


### Recommendations

Please only use the textual description for the appearance, components and functionality of the desired CAD model as input.

## How to Get Started with the Model

```
generate_samples.sh [path-of-model] test –full
```

Please replace ```[path-of-model]``` with the path of the downloaded CADFusion model on your machine.

For more information, please visit our GitHub repo: https://github.com/microsoft/CADFusion.

## Training Details

### Training Data

The training data contains two parts, the CAD model and its corresponding textual description. For the CAD model, it is originally from a open-source dataset [DeepCAD](https://github.com/ChrisWu1997/DeepCAD?tab=readme-ov-file). We use its pre-processed version [Skexgen](https://github.com/samxuxiang/SkexGen) and transform it into a format that are suitable for our model. For the textual description, we invite human annotators to describe the CAD model in DeepCAD by natural language.

### Training Procedure

The model is trained by alternating two stages, the sequential learning stage and the visual feedback stage. For the sequence learning stage, we use paired textual descriptions and CAD models to fine-tune the LLM backbone. For the visual feedback stage, we use paired textual descriptions, rejected CAD models and preferred CAD models to fine-tune the LLM backbone, where the rejected CAD models and preferred CAD models are produced by labeling the rendered CAD images with a large vision-language model (https://huggingface.co/lmms-lab/llava-onevision-qwen2-7b-ov). 

See the methodology section in our paper (https://arxiv.org/pdf/2501.19054) for more information.


### Training Hyperparameters

Sequential Learning (SL) Stage:
- LoRA rank and alpha: 32, 32
- Optimizer: AdamW
- Learning rate: 1e-4
- Epochs: 40

Visual Feedback (VF) Stage:
- LoRA rank and alpha: 32, 32
- Optimizer: AdamW
- Learning rate: 1e-4
- Epochs: 3 VF epochs and 1 SL epoch


## Evaluation

### Testing Data

The testing data contains two parts, the CAD model and its corresponding textual description. For the CAD model, it is originally from a open-source dataset [DeepCAD](https://github.com/ChrisWu1997/DeepCAD?tab=readme-ov-file). We use its pre-processed version [Skexgen](https://github.com/samxuxiang/SkexGen) and transform it into a format that are suitable for our model. For the textual description, we invite human annotators to describe the CAD model in DeepCAD by natural language.

### Metrics

- Generation diversity and quality on the generated CAD models in comparison to the test set, including Coverage (COV), Minimum Matching Distance (MMD) and Jensen-Shannon Divergence (JSD).
- Invalidity Ratio (IR).
- Visual quality, including human ranking and VLM scoring.


### Results

CADFusion achieves better performance quantitatively and qualitatively compared with baselines such as GPT-4o and Text2CAD (https://arxiv.org/abs/2409.17106).  For example, it improves the visual quality in a great margin: the VLM scoring for GPT-4o and Text2CAD is 5.13 and 2.01 respectively and CADFusion improves it to 8.96. 

See Table 1 in our paper (https://arxiv.org/pdf/2501.19054) for the complete evaluation.




## Environmental Impact

<!-- Total emissions (in grams of CO2eq) and additional considerations, such as electricity usage, go here. Edit the suggested text below accordingly -->

Carbon emissions can be estimated using the [Machine Learning Impact calculator](https://mlco2.github.io/impact#compute) presented in [Lacoste et al. (2019)](https://arxiv.org/abs/1910.09700).


## Citation


**BibTeX:**
```
@InProceedings{wang2024cadfusion,
  title={Text-to-CAD Generation Through Infusing Visual Feedback in Large Language Models},
  author={Wang, Ruiyu and Yuan, Yu and Sun, Shizhao and Bian, Jiang},
  booktitle={ICML},
  year={2025}
}
```


## Model Card Authors

Ruiyu Wang, Shizhao Sun

## Model Card Contact

We welcome feedback and collaboration from our audience. If you have suggestions, questions, or observe unexpected/offensive behavior in our technology, please contact Shizhao Sun at shizsu@microsoft.com.

If the team receives reports of undesired behavior or identifies issues independently, we will update this repository with appropriate mitigations.