![HiDream-E1 Demo](demo.jpg)

HiDream-E1 is an image editing model built on [HiDream-I1](https://github.com/HiDream-ai/HiDream-I1).

<span style="color: #FF5733; font-weight: bold">For more features and to experience the full capabilities of our product, please visit [https://vivago.ai/](https://vivago.ai/).</span>

## Project Updates
- 🌟 **July 16, 2025**: We've open-sourced the updated image editing model **HiDream-E1.1**. 
- 📝 **May 28, 2025**: We've released our technical report [HiDream-I1: A High-Efficient Image Generative Foundation Model with Sparse Diffusion Transformer](https://arxiv.org/abs/2505.22705). Please use the Bibtex below to cite the paper.
- 🚀 **April 28, 2025**: We've open-sourced the image editing model **HiDream-E1**. 


## Quick Start
Please make sure you have installed [Flash Attention](https://github.com/Dao-AILab/flash-attention) and latest [Diffusers](https://github.com/huggingface/diffusers.git). We recommend CUDA versions 12.4 for the manual installation.

```sh
pip install -r requirements.txt
pip install -U flash-attn --no-build-isolation
pip install -U git+https://github.com/huggingface/diffusers.git
```

Then you can run the inference scripts to generate images:

``` python 
python ./inference_e1_1.py
```

> [!NOTE]
> The inference script will try to automatically download `meta-llama/Llama-3.1-8B-Instruct` model files. You need to [agree to the license of the Llama model](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct) on your HuggingFace account and login using `huggingface-cli login` in order to use the automatic downloader.

## Gradio Demo

We also provide a Gradio demo for interactive image editing. You can run the demo with:

``` python
python gradio_demo_1_1.py 
```


## Evaluation Metrics

**Evaluation results on EmuEdit and ReasonEdit Benchmarks. Higher is better.**

| Model              | EmuEdit Global | EmuEdit Add  | EmuEdit Text | EmuEdit BG   | EmuEdit Color | EmuEdit Style | EmuEdit Remove | EmuEdit Local | EmuEdit Average | ReasonEdit |
|--------------------|----------------|--------------|--------------|--------------|---------------|---------------|----------------|---------------|-----------------|------------|
| OmniGen            | 1.37           | 2.09         | 2.31         | 0.66         | 4.26          | 2.36          | 4.73           | 2.10          | 2.67            | 7.36       |
| MagicBrush         | 4.06           | 3.54         | 0.55         | 3.26         | 3.83          | 2.07          | 2.70           | 3.28          | 2.81            | 1.75       |
| UltraEdit          | 5.31           | 5.19         | 1.50         | 4.33         | 4.50          | 5.71          | 2.63           | 4.58          | 4.07            | 2.89       |
| Gemini-2.0-Flash   | 4.87           | 7.71 | 6.30         | 5.10 | 7.30          | 3.33          | 5.94           | 6.29          | 5.99            | 6.95       |
| HiDream-E1         | 5.32 | 6.98         | 6.45 | 5.01         | 7.57 | 6.49 | 5.99 | 6.35 | 6.40 | 7.54 |
| HiDream-E1.1         | **7.47** | **7.97**         | **7.49** | **7.32** | **7.97** | **7.84** | **7.51** | **6.80** | **7.57** | **7.70** |

## License Agreement
The Transformer models in this repository are licensed under the MIT License. The VAE is from `FLUX.1 [schnell]`, and the text encoders from `google/t5-v1_1-xxl` and `meta-llama/Meta-Llama-3.1-8B-Instruct`. Please follow the license terms specified for these components. You own all content you create with this model. You can use your generated content freely, but you must comply with this license agreement. You are responsible for how you use the models. Do not create illegal content, harmful material, personal information that could harm others, false information, or content targeting vulnerable groups.


## Acknowledgements
- The VAE component is from `FLUX.1 [schnell]`, licensed under Apache 2.0. 
- The text encoders are from `google/t5-v1_1-xxl` (licensed under Apache 2.0) and `meta-llama/Meta-Llama-3.1-8B-Instruct` (licensed under the Llama 3.1 Community License Agreement).


## Citation

```bibtex
@article{hidreami1technicalreport,
  title={HiDream-I1: A High-Efficient Image Generative Foundation Model with Sparse Diffusion Transformer},
  author={Cai, Qi and Chen, Jingwen and Chen, Yang and Li, Yehao and Long, Fuchen and Pan, Yingwei and Qiu, Zhaofan and Zhang, Yiheng and Gao, Fengbin and Xu, Peihan and others},
  journal={arXiv preprint arXiv:2505.22705},
  year={2025}
}
```