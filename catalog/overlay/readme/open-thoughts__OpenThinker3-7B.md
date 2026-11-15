<p align="center">
    <img src="https://huggingface.co/datasets/open-thoughts/open-thoughts-114k/resolve/main/open_thoughts.png" width="50%">
</p>

<p align="center">
<a href="https://arxiv.org/abs/2506.04178" style="margin-right: 24px;">paper</a> |
<a href="https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M" style="margin-right: 24px; margin-left: 24px;">dataset</a> |
<a href="https://huggingface.co/open-thoughts/OpenThinker3-7B" style="margin-left: 24px;">model</a>
</p>

> [!NOTE]
> We have released a paper for OpenThoughts! See our paper [here](https://arxiv.org/abs/2506.04178).

# OpenThinker3-7B

State-of-the-art open-data 7B reasoning model. 🚀

This model is a fine-tuned version of [Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) on the 
[OpenThoughts3-1.2M](https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M) dataset. 
It represents a notable improvement over our previous models, [OpenThinker-7B](https://huggingface.co/open-thoughts/OpenThinker-7B) and [OpenThinker2-7B](https://huggingface.co/open-thoughts/OpenThinker2-7B), and it outperforms several other strong reasoning 7B models such as [DeepSeek-R1-Distill-Qwen-7B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B) and [Llama-3.1-Nemotron-Nano-8B-v1](https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-8B-v1), despite being trained only with SFT, without any RL.

This time, we also released a paper! See our [paper](https://arxiv.org/abs/2506.04178) and [blog post](https://openthoughts.ai/blog/ot3) for more details. OpenThinker3-32B to follow! 👀

# Evaluation Results
The numbers reported in the table below are evaluated with our open-source tool [Evalchemy](https://github.com/mlfoundations/Evalchemy). 
In the table below, we bold values in each column that are within 2 standard errors of the best.

| Model                                                                                           | Data  | AIME24 | AIME25 |  AMC23 | MATH500 | HMMT O2/25 | LCB 06/24-01/25 | CodeElo | CodeForces | GPQA-D | JEEBench |
| ----------------------------------------------------------------------------------------------- | ----- | ------ | ------ | ------ | ------- | ---------- | --------------- | ------- | ---------- | ------ | -------- |
| [OpenThinker-7B](https://huggingface.co/open-thoughts/OpenThinker-7B)                           | ✅    |  30.7  |  22.0  |  72.5  |   82.8  |   15.7     |    26.1         |  11.1   |  14.9      |  38.6  |  45.3    |
| [OpenThinker2-7B](https://huggingface.co/open-thoughts/OpenThinker2-7B)                         | ✅    |  60.7  |  38.7  |  89.8  |   87.6  |   24.7     |    40.6         |  22.8   |  26.6      |  47.0  |  65.1    |
| **[OpenThinker3-7B](https://huggingface.co/open-thoughts/OpenThinker3-7B)**                     | ✅    |**69.0**|**53.3**|**93.5**| **90.0**|   **42.7** |    **51.7**     |  31.0   |**32.2**    |  53.7  |**72.4**  |
| [DeepSeek-R1-Distill-Qwen-32B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B) | ❌    |  51.3  |  38.0  |  92.0  |   88.0  |   25.0     |    34.5         |  19.9   |  21.1      |  33.2  |  50.4    |
| [OpenR1-Distill-7B](https://huggingface.co/open-r1/OpenR1-Distill-7B)                           | ✅    |  57.7  |  39.7  |  87.0  |   88.0  |   25.7     |    30.7         |  30.1   |  29.3      |**58.9**|  68.7    |
| [Llama-3.1-Nemotron-Nano-8B-v1](https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-8B-v1)    | ✅    |  62.0  |  48.0  |**94.0**|   89.4  |   26.7     |    **50.9**     |  30.9   |**32.9**    |  52.9  |  70.7    |
| [AceReason-Nemotron-7B](https://huggingface.co/nvidia/AceReason-Nemotron-7B)                    | ✅    |**71.0**|  50.7  |**93.8**|   89.8  |   33.3     |    44.3         |**32.9** |**30.9**    |  52.9  |  64.3    |

# Data

This model was trained on the [OpenThoughts3-1.2M](https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M) dataset.

The key to the strong model performance is our comprehensive data pipeline and over 1,000+ ablation experiments.
This led to the creation of [OpenThoughts3-1.2M](https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M), which consists of 850,000 math questions, 250,000 code questions, and 100,000 science questions.
Reasoning traces are generated with QwQ-32B. 

See the [OpenThoughts3-1.2M](https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M) dataset page or our [paper](https://arxiv.org/abs/2506.04178) for additional information.


# Intended uses & limitations

Apache 2.0 License


## Training procedure

We used 512 A100 nodes to train the model for 48 hours.

## Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 8e-05
- seed: 42
- distributed_type: multi-GPU
- num_devices: 512
- gradient_accumulation_steps: 1
- total_train_batch_size: 512
- optimizer: Use OptimizerNames.ADAMW_TORCH with betas=(0.9,0.999) and epsilon=1e-08 and optimizer_args=No additional optimizer arguments
- lr_scheduler_type: cosine
- lr_scheduler_warmup_ratio: 0.1
- num_epochs: 5.0
- weight_decay: 0.0

## Framework versions

- Transformers 4.46.1
- Pytorch 2.3.0
- Datasets 3.1.0
- Tokenizers 0.20.3

More info can be found in our repository: [https://github.com/open-thoughts/open-thoughts](https://github.com/open-thoughts/open-thoughts).

# Links
- 📝 [OpenThoughts Paper](https://arxiv.org/abs/2506.04178)
- 📊 [OpenThoughts3-1.2M and OpenThinker3-7B Blog Post](https://www.open-thoughts.ai/blog/ot3)
- 💻 [Open Thoughts GitHub Repository](https://github.com/open-thoughts/open-thoughts)
- 🧠 [OpenThoughts3-1.2M dataset](https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M)
- 🤖 [OpenThinker3-7B model](https://huggingface.co/open-thoughts/OpenThinker3-7B) - this model.

# Citation
```
@misc{guha2025openthoughtsdatarecipesreasoning,
  title={OpenThoughts: Data Recipes for Reasoning Models}, 
  author={Etash Guha and Ryan Marten and Sedrick Keh and Negin Raoof and Georgios Smyrnis and Hritik Bansal and Marianna Nezhurina and Jean Mercat and Trung Vu and Zayne Sprague and Ashima Suvarna and Benjamin Feuer and Liangyu Chen and Zaid Khan and Eric Frankel and Sachin Grover and Caroline Choi and Niklas Muennighoff and Shiye Su and Wanjia Zhao and John Yang and Shreyas Pimpalgaonkar and Kartik Sharma and Charlie Cheng-Jie Ji and Yichuan Deng and Sarah Pratt and Vivek Ramanujan and Jon Saad-Falcon and Jeffrey Li and Achal Dave and Alon Albalak and Kushal Arora and Blake Wulfe and Chinmay Hegde and Greg Durrett and Sewoong Oh and Mohit Bansal and Saadia Gabriel and Aditya Grover and Kai-Wei Chang and Vaishaal Shankar and Aaron Gokaslan and Mike A. Merrill and Tatsunori Hashimoto and Yejin Choi and Jenia Jitsev and Reinhard Heckel and Maheswaran Sathiamoorthy and Alexandros G. Dimakis and Ludwig Schmidt},
  year={2025},
  eprint={2506.04178},
  archivePrefix={arXiv},
  primaryClass={cs.LG},
  url={https://arxiv.org/abs/2506.04178}, 
}
```