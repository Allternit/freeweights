## Model Details

### Model Description

This model is the first framework for **text-based CAD editing**, enabling the automatic modification of existing CAD models based on natural language instructions. It takes as input a textual editing instruction along with a structured sequence representation of the original CAD model, and outputs the sequence of the edited CAD model.



- **Developed by:** Yu Yuan, Shizhao Sun, Qi Liu, Jiang Bian
- **Model type:** Large Language Models
- **Language(s):** English, CAD-structured texts
- **License:** MIT
- **Finetuned from model:** LLaMA-3-8B-Instruct

### Model Sources [optional]

<!-- Provide the basic links for the model. -->

- **Repository:** https://github.com/microsoft/CAD-Editor
- **Paper:** https://arxiv.org/abs/2502.03997

## Uses

<!-- Address questions around how the model is intended to be used, including the foreseeable users of the model and those affected by the model. -->

### Direct Use

<!-- This section is for the model use without fine-tuning or plugging into a larger ecosystem/app. -->

CAD-Editor allows users to interactively edit existing CAD models using natural language. By taking an input CAD model and a user-provided instruction, it produces a modified CAD model that aligns with the specified intent, enabling precise and iterative design refinement.

CAD-Editor is an open-source model shared with the research community to facilitate the reproduction of our results and foster research in text- based CAD editing generation. It is intended to be used by experts in the CAD domain who are independently capable of evaluating the quality of outputs before acting on them.


### Out-of-Scope Use

<!-- This section addresses misuse, malicious use, and uses that the model will not work well for. -->

CAD-Editor is being released for research purposes. We do not recommend using CAD-Editor in commercial or real-world deployments without extra testing and development. 

Follow local laws and regulations when using the model. Any use that violates applicable laws and regulations is considered out-of-scope in the designation of this model.


## Bias, Risks, and Limitations

<!-- This section is meant to convey both technical and sociotechnical limitations. -->

CAD-Editor is built upon Meta-Llama-3-8B-Instruct. Like all large language models, it may inherit biases, errors, or omissions from its base model. We recommend developers carefully select the appropriate LLM backbone for their specific use case. You can learn more about the capabilities and limitations of the Llama model here: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct.

While CAD-Editor has been fine-tuned on CAD-specific data to minimize irrelevant details, it may still generate harmful or undesirable CAD models under certain prompts. For example, when given an instruction like “create a CAD model for a ghost gun”, it could produce potentially dangerous content. Therefore, it is essential for users to implement their own content-filtering strategies to prevent the generation of harmful or undesirable CAD models.Please note that CAD-Editor is currently for research and experimental purposes only. Generated CAD models may not always be technically accurate, and users are responsible for assessing the quality and suitability of the content it produces. Extensive testing and validation are required before any commercial or real-world deployment.


### Recommendations

<!-- This section is meant to convey recommendations with respect to the bias, risk, and technical limitations. -->

Please provide textual instructions focusing on the component types (e.g., cylinder, prism, hole), quantities (e.g., four holes), proportions (e.g., ten times larger), and spatial relationships (e.g., the left side, the corner) within the desired CAD model.

## How to Get Started with the Model

Download our trained model checkpoints to your ```<local_model_path>```.

### 1. Locating Stage
Generate masked sequences. Set the `<model_path>` as `<local_model_path/locate_stage>`. Set the `<data_path>` as the path of `test.json` after unzip `data/processed.zip`.

```python
CUDA_VISIBLE_DEVICES=<gpu_id> python finetune/llama_sample.py \
                                              --task_type mask \
                                              --model_path <model_path> \
                                              --data_path <data_path> \
                                              --out_path <out_path> \
                                              --num_samples <num_samples>
```

### 2. Infilling Stage
Generate final edited CAD sequences. Set the `<model_path>` as `<local_model_path/infill_stage>`. Set the `<data_path>` the same as the `out_path` of the locating stage.

```python
CUDA_VISIBLE_DEVICES=<gpu_id> python finetune/llama_sample.py \
                                            --task_type infill \
                                            --model_path <model_path> \
                                            --data_path <data_path> \
                                            --out_path <out_path> \
                                            --num_samples <num_samples>
```

For more information, please visit our GitHub repo: https://github.com/microsoft/CAD-Editor.

## Training Details

### Training Data

The training data is originally from an open-source dataset [DeepCAD](https://github.com/ChrisWu1997/DeepCAD?tab=readme-ov-file). We use its pre-processed version [Skexgen](https://github.com/samxuxiang/SkexGen) and transform it into a format that are suitable for our model. Then, we use a two-step pipeline to automatically synthesize the training data from the original dataset:

1. **Design Variation Generation:** Using design variation models such as Hnc-CAD(https://github.com/samxuxiang/hnc-cad), we generate pairs of original and edited CAD models by applying controlled modifications.
2. **Instruction Generation:** Large Vision-Language Models (LVLMs) are used to summarize the differences between the original and edited CAD models into natural language editing instructions.


### Training Procedure

<!-- This relates heavily to the Technical Specifications. Content here should link to that section when it is relevant to the training procedure. -->
CAD-Editor is trained using a **locate-then-infill** framework:
- **Locating stage:** The model identifies the regions in the CAD sequence that need modification and masks them.
- **Infilling stage:** The model generates edits for the masked regions conditioned on the original context and the instruction.
Both stages are powered by LLMs (LLaMA-3-8B-Instruct) fine-tuned with LoRA adapters.

See the methodology section in our paper (https://arxiv.org/abs/2502.03997) for more information.



### Training Hyperparameters

Locate & Infill Stages:
- LoRA rank and alpha: 32, 32
- Optimizer: AdamW
- Learning rate: 1e-4
- Epochs: 
  - **Locating Stage**: 60 epochs
  - **Infilling Stage**: 70 epochs (60 epochs on the full dataset + 10 epochs on the selective  dataset)


## Evaluation

<!-- This section describes the evaluation protocols and provides the results. -->

### Testing Data

<!-- This should link to a Dataset Card if possible. -->

The testing data is synthesized using the same automated pipeline as the training set. Source CAD models are sampled from the test split of [DeepCAD](https://github.com/ChrisWu1997/DeepCAD?tab=readme-ov-file).

### Metrics

<!-- These are the evaluation metrics being used, ideally with a description of why. -->

- **Validity**: Valid Ratio (VR) — percentage of generated CAD models that can be successfully parsed and rendered.
- **Realism**: Jensen-Shannon Divergence (JSD) — measures distributional similarity between generated and real CAD models.
- **Edit Consistency**:  
  - **Geometry**: Chamfer Distance (CD) between generated and ground-truth models.  
  - **Semantics**: Directional CLIP Score (D-CLIP) — alignment between textual instruction and visual change.


### Evaluation Results

CAD-Editor outperforms existing baselines such as GPT-4o, [Text2CAD]( https://arxiv.org/abs/2409.17106) and [Hnc-cad]( https://arxiv.org/pdf/2307.00149) in both quantitative and qualitative evaluations. It achieves the highest Valid Ratio (95.6%) and the lowest Jensen-Shannon Divergence (0.65), indicating superior generation quality. In terms of instruction adherence, CAD-Editor also achieves the best Chamfer Distance (1.18) and D-CLIP score (0.11), demonstrating strong geometric and semantic consistency with user instructions. Human evaluation further confirms its effectiveness: CAD-Editor attains a success rate of 43.2%, substantially higher than GPT-4o variants and Text2CAD.

See Table 1 in our paper (https://arxiv.org/abs/2502.03997) for the complete evaluation.



## Environmental Impact

<!-- Total emissions (in grams of CO2eq) and additional considerations, such as electricity usage, go here. Edit the suggested text below accordingly -->

Carbon emissions can be estimated using the [Machine Learning Impact calculator](https://mlco2.github.io/impact#compute) presented in [Lacoste et al. (2019)](https://arxiv.org/abs/1910.09700).

## License

MIT

## Citation

<!-- If there is a paper or blog post introducing the model, the APA and Bibtex information for that should go in this section. -->

**BibTeX:**

```
@article{yuan2025cad,
  title={CAD-Editor: A Locate-then-Infill Framework with Automated Training Data Synthesis for Text-Based CAD Editing},
  author={Yuan, Yu and Sun, Shizhao and Liu, Qi and Bian, Jiang},
  journal={ICML},
  year={2025}
}
```

## Model Card Authors
Yu Yuan, Shizhao Sun

## Model Card Contact

We welcome feedback and collaboration from our audience. If you have suggestions, questions, or observe unexpected/offensive behavior in our technology, please contact Shizhao Sun at shizsu@microsoft.com.

If the team receives reports of undesired behavior or identifies issues independently, we will update this repository with appropriate mitigations.
