# Model Card for RLAIF-V

[GitHub ](https://github.com/RLHF-V/RLAIF-V) | [Paper](https://arxiv.org/abs/2405.17220)

**RLAIF-V-12B** is a multimodal large language model (MLLM) that exhibits **super GPT-4V trustworthiness**. The model is built up on OmniLMM from the [MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V) series. 

We utilize a novel framework, [RLAIF-V](https://github.com/RLHF-V/RLAIF-V), which **aligns MLLMs in a fully open-source paradigm**. This framework maximally exploits the [open-source feedback](https://huggingface.co/datasets/HaoyeZhang/RLAIF-V-Dataset) from two key perspectives, including **high-quality feedback data** and an **online feedback learning algorithm**. 

<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6566e0c493e30c8a60048eb3/T4hALrgNdXKHnkvb-27bA.png" alt="fig1-1" width="85%"/>
</p>

## Model Details

### Key Features

* 🏅 **Super GPT-4V Trustworthiness**: By learning from open-source AI feedback, RLAIF-V-12B achieves super GPT-4V trustworthiness in both generative and discriminative tasks.
* 💪 **Maintaining Well Performance on General Abilities**: On benchmarks tested with the general abilities (e.g. LLaVA Bench, MMStar), RLAIF-V-12B also exhibits good performance.

<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6566e0c493e30c8a60048eb3/dhsi5_okbtlBp2pfYOkFK.png" alt="fig1-2" width="90%"/>
</p>

* 🚀 **Inference-time Scaling by RLAIF-V Reward**: Using RLAIF-V 12B as a reward model can further improve model performance on multiple benchmarks with best-of-N selection. It also consistently improves the trustworthiness on different MLLMs.

<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6566e0c493e30c8a60048eb3/QB_plzz-wRmyDcr81BXum.png" alt="fig1-3" width="50%"/>
</p>


### Examples
<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6566e0c493e30c8a60048eb3/yg-Ksp9qi8AodURSmX769.png" alt="fig2-1" width="81%"/>
  <img src="https://cdn-uploads.huggingface.co/production/uploads/6566e0c493e30c8a60048eb3/NSEkeBmH99B44rX8GTZig.png" alt="fig2-1" width="80%"/>
</p>

### Model Description
- **Related model:** [OmniLMM-12B](https://huggingface.co/openbmb/OmniLMM-12B)
- **Trained on data:** [RLAIF-V-Dataset](https://huggingface.co/datasets/HaoyeZhang/RLAIF-V-Dataset)

## Usage
Please look at [GitHub](https://github.com/RLHF-V/RLAIF-V) for more details about usage.



## Citation

If you find our model/code/paper helpful, please consider cite our papers 📝:

```bibtex
@article{yu2023rlhf,
  title={Rlhf-v: Towards trustworthy mllms via behavior alignment from fine-grained correctional human feedback},
  author={Yu, Tianyu and Yao, Yuan and Zhang, Haoye and He, Taiwen and Han, Yifeng and Cui, Ganqu and Hu, Jinyi and Liu, Zhiyuan and Zheng, Hai-Tao and Sun, Maosong and others},
  journal={arXiv preprint arXiv:2312.00849},
  year={2023}
}

@article{yu2024rlaifv,
  title={RLAIF-V: Open-Source AI Feedback Leads to Super GPT-4V Trustworthiness}, 
  author={Tianyu Yu and Haoye Zhang and Qiming Li and Qixin Xu and Yuan Yao and Da Chen and Xiaoman Lu and Ganqu Cui and Yunkai Dang and Taiwen He and Xiaocheng Feng and Jun Song and Bo Zheng and Zhiyuan Liu and Tat-Seng Chua and Maosong Sun},
  journal={arXiv preprint arXiv:2405.17220},
  year={2024},
}
```