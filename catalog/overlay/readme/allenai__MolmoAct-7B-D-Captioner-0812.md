<img src="molmoact_logo.svg" alt="MolmoAct Logo" style="width: auto; height: 50px;">

# MolmoAct 7B-D Captioner

MolmoAct is a fully open-source action reasoning model for robotic manipulation developed by the Allen Institute for AI. MolmoAct is trained on a subset of OXE and MolmoAct Dataset, a dataset with 10k high-quality trajectories of a single-arm Franka robot performing 93 unique manipulation tasks in both home and tabletop environments. It has state-of-the-art performance among vision-language-action models on multiple benchmarks while being fully open-source. You can find all models in the MolmoAct family [here](https://huggingface.co/collections/allenai/molmoact-689697591a3936fba38174d7).
**Learn more about MolmoAct** in our announcement [blog post](https://allenai.org/blog/molmoact) or the [paper](https://arxiv.org/abs/2508.07917).

**MolmoAct 7B-D Captioner** is based on [Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B) and uses [SigLip2](https://huggingface.co/google/siglip2-so400m-patch14-384) as the vision backbone, which is trained on Pixmo-Cap using the same way as Molmo's pre-training stage. This model then becomes a captioner model for image dense captioning, and is intended to be used for MolmoAct training replication from scratch, since we start MolmoAct 7B-D pre-training stage based on this checkpoint. Note that this model is not for running any action inferences or benchmarking, so we skip the inference instruction for this model.

This checkpoint is a **preview** of the MolmoAct release. All artifacts used in creating MolmoAct (data, training code, evaluations, intermediate checkpoints) will be made available at a later date, furthering our commitment to open-source AI development and reproducibility.

Quick links:
- 📂 [All Models](https://huggingface.co/collections/allenai/molmoact-689697591a3936fba38174d7)
- 📂 [All Data](https://huggingface.co/collections/allenai/molmoact-data-mixture-6897e583e13b6c2cf3ea2b80)
- 📃 [Paper](https://arxiv.org/abs/2508.07917)
- 💻 [Code](https://github.com/allenai/MolmoAct)
- 🎥 [Blog Post](https://allenai.org/blog/molmoact)
- 🎥 [Video](https://youtu.be/-_wag1X25OE?si=Xi_kUaJTmcQBx1f6)


## License and Use

This model is licensed under Apache 2.0. It is intended for research and educational use.
For more information, please see our [Responsible Use Guidelines](https://allenai.org/responsible-use).


## Model and Hardware Safety

MolmoAct offers the ability to inspect a visual trace of its intended actions in space before they occur, allowing users to ensure safe behavior by proactively auditing and adjusting the actions of any hardware acting under the model’s instructions. MolmoAct’s action space is bounded within the data provided, and compliance is built into the model to prevent excessive force when resistance is detected. Please follow the hardware manufacturer’s guidelines when using this model with a robot and perform all operations in a safely configured environment.

## Citation

```bibtex
@misc{molmoact2025,
      title={MolmoAct: Action Reasoning Models that can Reason in Space}, 
      author={Jason Lee and Jiafei Duan and Haoquan Fang and Yuquan Deng and Shuo Liu and Boyang Li and Bohan Fang and Jieyu Zhang and Yi Ru Wang and Sangho Lee and Winson Han and Wilbert Pumacay and Angelica Wu and Rose Hendrix and Karen Farley and Eli VanderBilt and Ali Farhadi and Dieter Fox and Ranjay Krishna},
      year={2025},
      eprint={2508.07917},
      archivePrefix={arXiv},
      primaryClass={cs.RO},
      url={https://arxiv.org/abs/2508.07917}
}
```