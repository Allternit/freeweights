<p align="center">
    <img src="https://cdn-uploads.huggingface.co/production/uploads/658529d61c461dfe88afe8e8/tto-qt1BmKdhObReEKBq2.png" width="400"/>
<p>
  
<p align="center">
     💚 <a href="https://research.nvidia.com/labs/toronto-ai/chronoedit/"><b>ChronoEdit</b></a> &nbsp&nbsp ｜ &nbsp&nbsp 🖥️ <a href="https://github.com/nv-tlabs/ChronoEdit">GitHub</a> &nbsp&nbsp  | &nbsp&nbsp🤗 <a href="https://huggingface.co/collections/nvidia/chronoedit">Hugging Face</a>&nbsp&nbsp | &nbsp&nbsp🤖 <a href="https://huggingface.co/spaces/nvidia/ChronoEdit">Gradio Demo</a>&nbsp&nbsp | &nbsp&nbsp 📑 <a href="https://arxiv.org/abs/2510.04290">Paper</a> &nbsp&nbsp 
<br>

-----
# ChronoEdit: Towards Temporal Reasoning for Image Editing and World Simulation

### Description:
**ChronoEdit-14B** enables physics-aware image editing and action-conditioned world simulation through temporal reasoning. It distills priors from a 14B-parameter pretrained video generative model and separates inference into (i) a **video reasoning stage** for latent trajectory denoising, and (ii) an **in-context editing stage** for pruning trajectory tokens. ChronoEdit-14B was developed by NVIDIA as part of the **ChronoEdit** family of multimodal foundation models. 
This model is ready for commercial use.

![gallery](https://cdn-uploads.huggingface.co/production/uploads/658529d61c461dfe88afe8e8/AToaxp6VcVxnn09AS0vna.jpeg)

### License/Terms of Use
Governing Terms: Use of this model is governed by the [NVIDIA Open Model License Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/). Additional Information: [Apache License Version 2.0](https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md).

Important Note: If you bypass, disable, reduce the efficacy of, or circumvent any technical limitation, safety guardrail or associated safety guardrail hyperparameter, encryption, security, digital rights management, or authentication mechanism contained in the Model, your rights under License Agreement will automatically terminate. (edited) 

### Deployment Geography
Global


### Use Case
Researchers and developers for:
- Physics-aware in-context image editing 
- Action-conditioned world simulation (PhysicalAI) 
- Benchmarking multimodal foundation models 


### Release Date
- Hugging Face: 10/29/2025 via [ChronoEdit](https://huggingface.co/collections/nvidia/chronoedit).

- GitHub: 29/10/2025 via [GitHub Repo Link](https://github.com/nv-tlabs/ChronoEdit)


## References(s)
- ChronoEdit: Temporal Reasoning for In-Context Image Editing (Preprint, 2025) 
- Related NVIDIA works: [Cosmos](https://www.nvidia.com/en-us/ai/cosmos/),[Gen3C](https://research.nvidia.com/labs/toronto-ai/GEN3C/),[DiffusionRenderer](https://research.nvidia.com/labs/toronto-ai/DiffusionRenderer/),[Difix3D](https://research.nvidia.com/labs/toronto-ai/difix3d/)


## Model Architecture
**Architecture Type:** Diffusion Transformer 
**Network Architecture:** Custom temporal denoising transformer 
**Base Model:** Pretrained video generative model (14B parameters) 
**Number of Parameters:** ~1.4 × 10^10 


---


## Input
**Input Type(s):** Image + Text (instruction) 
**Input Format:** 
- Text: UTF-8 string 
- Image: RGB (`.png`, `.jpg`) 
**Input Parameters:** 
- Image: Two-Dimensional (2D) Red, Green, Blue (RGB), variable resolution (recommended ≤1024×1024) 
- Text: One-Dimensional (1D), up to ~300 tokens 
**Other Properties Related to Input:**
- Image Resolution: 1280 x 720 or 720 x 1280 or 960 x 960 or 1024×1024




## Output
**Output Type(s):** Image 
**Output Format:** RGB (`.png`) 
**Output Parameters:** Two-Dimensional (2D) Red, Green, Blue (RGB), resolution configurable 
**Other Properties Related to Output:**
- Image Resolution: 1280 x 720 or 720 x 1280 or 960 x 960 or 1024×1024


Our AI models are designed and/or optimized to run on NVIDIA GPU-accelerated systems. By leveraging NVIDIA’s hardware (e.g. GPU cores) and software frameworks (e.g., CUDA libraries), the model achieves faster training and inference times compared to CPU-only solutions. 


---


## Software Integration
**Runtime Engine(s):** 
- PyTorch / Diffusers 
- Triton Inference Server (optional) 


**Supported Hardware Microarchitecture Compatibility:** 
- NVIDIA Ampere 
- NVIDIA Blackwell 
- NVIDIA Hopper 
- NVIDIA Lovelace 


**Preferred Operating Systems:** 
- Linux 


The integration of foundation and fine-tuned models into AI systems requires additional testing using use-case-specific data to ensure safe and effective deployment. Following the V-model methodology, iterative testing and validation at both unit and system levels are essential to mitigate risks, meet technical and functional requirements, and ensure compliance with safety and ethical standards before deployment.


---


## Model Version(s)
- ChronoEdit-14B v1.0 (initial public release, 03/2025) 


---


## Training, Testing and Evaluation Datasets


## Training Dataset:
- Synthetic world interaction data (robot arm manipulation, object picking, temporal consistency) 
- Open-domain video-text corpora (research use only) 


**Data Modality:**
Image, Text, Video


**Image Training Data Size:**
1 Million to 1 Billion Images


**Text Training Data Size:**
Less than 10,000 Hours


**Data Collection Method:** Hybrid: Synthetic, Automated, Human


**Labeling Method:** Hybrid: Synthetic, Automated, Human


**Properties:**
- Modalities: 10 million image and text pair
- Nature of the content: Synthetic world interaction data (robot arm manipulation, object picking, temporal consistency) 
- Linguistic characteristics: Natural Language


---


## Testing Dataset
- Held-out portion of training dataset for action-conditioned tasks.


**Data Collection Method:**
Automated


**Labeling Method by dataset:**
Automated


**Properties:**
- Modalities: 500 million image and text pair
- Nature of the content: Robot world interaction data (robot arm manipulation, object picking, temporal consistency) 
- Linguistic characteristics: Natural Language


---


## Evaluation Dataset
- Held-out portion of training dataset for action-conditioned tasks.


**Data Collection Method:**
Automated


**Labeling Method by dataset:**
Automated


**Properties:**
- Modalities: 500 million image and text pair
- Nature of the content: Robot world interaction data (robot arm manipulation, object picking, temporal consistency) 
- Linguistic characteristics: Natural Language


---


## Inference
**Acceleration Engine:** TensorRT, Triton
**Test Hardware:** NVIDIA H100, NVIDIA B200


---


## Ethical Considerations:
NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications.  When downloaded or used in accordance with our terms of service, developers should work with their internal model team to ensure this model meets requirements for the relevant industry and use case and addresses unforeseen product misuse. 
For more detailed information on ethical considerations for this model, please see the Model Card++ Bias, Explainability, Safety & Security, and Privacy Subcards.


Users are responsible for model inputs and outputs. Users are responsible for ensuring safe integration of this model, including implementing guardrails as well as other safety mechanisms, prior to deployment.


Please make sure you have proper rights and permissions for all input image and video content; if image or video includes people, personal health information, or intellectual property, the image or video generated will not blur or maintain proportions of image subjects included.


Please report model quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://www.nvidia.com/en-us/support/submit-security-vulnerability/).


### Plus Plus (++) Promise


We value you, the datasets, the diversity they represent, and what we have been entrusted with. This model and its associated data have been:


- Verified to comply with current applicable disclosure laws, regulations, and industry standards.
- Verified to comply with applicable privacy labeling requirements.
- Annotated to describe the collector/source (NVIDIA or a third-party).
- Characterized for technical limitations.
- Reviewed to ensure proper disclosure is accessible to, maintained for, and in compliance with NVIDIA data subjects and their requests.
- Reviewed before release.
- Tagged for known restrictions and potential safety implications.


### Bias


Field                                                                                               |  Response
:---------------------------------------------------------------------------------------------------|:---------------
Participation considerations from adversely impacted groups [protected classes](https://www.senate.ca.gov/content/protected-classes) in model design and testing:  |  None
Measures taken to mitigate against unwanted bias:                                                   |  None


### Explainability

Field                                                                                                  |  Response
:------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------
Intended Task/Domain:                                                                                  |  Image Editing, Text Prompt
Model Type:                                                                                            |  Transformer
Intended Users:                                                                                        |  Physical AI developers.
Output:                                                                                                |  Two-Dimensional (2D) Red, Green, Blue (RGB) Image
Describe how the model works:                                                                          |  We take an image as input, encode it using Cosmos tokenizer to latent space. We then use our model which is a transformer-like architecture to modify the image.
Name the adversely impacted groups this has been tested to deliver comparable outcomes regardless of:  |  Not Applicable.
Technical Limitations & Mitigation:                                                                    |  The proposed method relies only on synthetic data for Physical AI scenarios, which might limit the generalization ability if the target scenario is not in the pre-generated SDG dataset.  
Verified to have met prescribed NVIDIA quality standards:  |  Yes
Performance Metrics:                                                                                   |  Qualitative and quantitative evaluation, including human and vision-language model (VLM) assessments on Action Fidelity, Identity Preservation and Visual Coherence Metrics.
Potential Known Risks:                                                                                 |  This model is only trained on synthetic data generated for Physical AI use case.  Testing on cases that are not related to Physical AI may yield unsatisfactory and unexpected results.
Licensing:                                                                                             |  Governing Terms: Use of this model is governed by the [NVIDIA Open Model License Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/). Additional Information: [Apache License Version 2.0](https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md).


### Privacy


Field                                                                                                                              |  Response
:----------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------
Generatable or reverse engineerable personal data?                                                     |  No
Personal data used to create this model?                                                                                       |  None Known
How often is dataset reviewed?                                                                                                     |  Before Release
Is there provenance for all datasets used in training? |  Yes
Does data labeling (annotation, metadata) comply with privacy laws?                                                                |  Yes
Is data compliant with data subject requests for data correction or removal, if such a request was made? | No, not possible with externally-sourced data.
Applicable Privacy Policy | https://www.nvidia.com/en-us/about-nvidia/privacy-policy/


### Safety


Field                                               |  Response
:---------------------------------------------------|:----------------------------------
Model Application Field(s):                               |  World Generation
Describe the life critical impact (if present).   |  Not Applicable <br>
Use Case Restrictions:                              |  Abide by  [NVIDIA Open Model License Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/). Additional Information: [Apache License Version 2.0](https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md).
Model and dataset restrictions:            |  The Principle of least privilege (PoLP) is applied limiting access for dataset generation and model development.  Restrictions enforce dataset access during training, and dataset license constraints adhered to.


## Citation
```bibtex
@article{wu2025chronoedit,
    title={ChronoEdit: Towards Temporal Reasoning for Image Editing and World Simulation},
    author={Wu, Jay Zhangjie and Ren, Xuanchi and Shen, Tianchang and Cao, Tianshi and He, Kai and Lu, Yifan and Gao, Ruiyuan and Xie, Enze and Lan, Shiyi and Alvarez, Jose M. and Gao, Jun and Fidler, Sanja and Wang, Zian and Ling, Huan},
    journal={arXiv preprint arXiv:2510.04290},
    year={2025}
}

```