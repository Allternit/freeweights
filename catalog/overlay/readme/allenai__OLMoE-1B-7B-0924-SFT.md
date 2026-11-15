<img alt="OLMoE Logo." src="olmoe-logo.png" width="250px">

# Model Summary

This model is an intermediate training checkpoint during post-training, after the Supervised Fine-Tuning (SFT) step. For best performance, we recommend you use the [OLMoE-Instruct](https://huggingface.co/allenai/OLMoE-1B-7B-0924-Instruct) version.

- **Paper**: https://arxiv.org/abs/2409.02060
- **Pretraining** [Checkpoints](https://hf.co/allenai/OLMoE-1B-7B-0924), [Code](https://github.com/allenai/OLMo/tree/Muennighoff/MoE), [Data](https://huggingface.co/datasets/allenai/OLMoE-mix-0924) and [Logs](https://wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924--Vmlldzo4OTcyMjU3).
- **SFT (Supervised Fine-Tuning)** [Checkpoints](https://huggingface.co/allenai/OLMoE-1B-7B-0924-SFT), [Code](https://github.com/allenai/open-instruct/tree/olmoe-sft), [Data](https://hf.co/datasets/allenai/tulu-v3.1-mix-preview-4096-OLMoE) and [Logs](https://github.com/allenai/OLMoE/blob/main/logs/olmoe-sft-logs.txt).
- **DPO/KTO (Direct Preference Optimization/Kahneman-Tversky Optimization)**, [Checkpoints](https://huggingface.co/allenai/OLMoE-1B-7B-0924-Instruct), [Preference Data](https://hf.co/datasets/allenai/ultrafeedback_binarized_cleaned), [DPO code](https://github.com/allenai/open-instruct/tree/olmoe-sft), [KTO code](https://github.com/Muennighoff/kto/blob/master/kto.py) and [Logs](https://github.com/allenai/OLMoE/blob/main/logs/olmoe-dpo-logs.txt).

Branches:
- `main`: Instruction tuned / supervised finetuned (SFT) model of https://hf.co/allenai/OLMoE-1B-7B-0924 (`main` branch)
- `load-balancing`: Ablation with load balancing loss during SFT
- `non-annealed`: Ablation starting from the checkpoint prior to annealing (branch `step1200000-tokens5033B` of https://hf.co/allenai/OLMoE-1B-7B-0924) rather than the annealed checkpoint (branch `main` of https://hf.co/allenai/OLMoE-1B-7B-0924)

# Citation

```bibtex
@misc{muennighoff2024olmoeopenmixtureofexpertslanguage,
      title={OLMoE: Open Mixture-of-Experts Language Models}, 
      author={Niklas Muennighoff and Luca Soldaini and Dirk Groeneveld and Kyle Lo and Jacob Morrison and Sewon Min and Weijia Shi and Pete Walsh and Oyvind Tafjord and Nathan Lambert and Yuling Gu and Shane Arora and Akshita Bhagia and Dustin Schwenk and David Wadden and Alexander Wettig and Binyuan Hui and Tim Dettmers and Douwe Kiela and Ali Farhadi and Noah A. Smith and Pang Wei Koh and Amanpreet Singh and Hannaneh Hajishirzi},
      year={2024},
      eprint={2409.02060},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2409.02060}, 
}
```