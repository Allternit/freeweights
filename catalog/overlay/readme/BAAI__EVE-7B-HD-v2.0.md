<div align='center'>
<h1>EVEv2: Improved Baselines for Encoder-Free Vision-Language Models</h1h1>
<h3><a href="https://arxiv.org/abs/2502.06788">EVEv2: Improved Baselines for Encoder-Free Vision-Language Models</a></h3>

[Haiwen Diao*](https://scholar.google.com/citations?user=46eCjHQAAAAJ&hl=zh-CN), [Xiaotong Li*](https://scholar.google.com/citations?hl=zh-CN&user=cpCE_T4AAAAJ), [Yufeng Cui*](https://scholar.google.com/citations?user=5Ydha2EAAAAJ&hl=zh-CN&oi=ao), [Yueze Wang*](https://scholar.google.com/citations?user=ga2MKaMAAAAJ&hl=zh-CN), [Haoge Deng](https://scholar.google.com/citations?user=S2sbvjgAAAAJ&hl=zh-CN), [Ting Pan](https://scholar.google.com/citations?user=qQv6YbsAAAAJ&hl=zh-CN), [Wenxuan Wang](https://scholar.google.com/citations?hl=zh-CN&user=75OyC-oAAAAJ), [Huchuan Lu📧](https://scholar.google.com/citations?user=D3nE0agAAAAJ&hl=zh-CN), [Xinlong Wang📧](https://scholar.google.com/citations?user=DPz0DjYAAAAJ&hl=zh-CN)

Dalian University of Technology; Beijing Academy of Artificial Intelligence; Peking University;   
Beijing University of Posts and Telecommunications; University of Chinese Academy of Sciences; Chinese Academy of Sciences Institute of Automation

|  [Paper](https://arxiv.org/abs/2502.06788) | [Code](https://github.com/baaivision/EVE) |
</div>

Existing encoder-free vision-language models (VLMs) are rapidly narrowing the performance gap with their encoder-based counterparts, highlighting the promising potential for unified multimodal systems with structural simplicity and efficient deployment. 
We systematically clarify the performance gap between VLMs using pre-trained vision encoders, discrete tokenizers, and minimalist visual layers from scratch, deeply excavating the under-examined characteristics of encoder-free VLMs. We develop efficient strategies for encoder-free VLMs that rival mainstream encoder-based ones. 
After an in-depth investigation, we launch EVEv2.0, a new and improved family of encoder-free VLMs. 
We show that: (i) Properly decomposing and hierarchically associating vision and language within a unified model reduces interference between modalities. 
(ii) A well-designed training strategy enables effective optimization for encoder-free VLMs. 
Through extensive evaluation, our EVEv2.0 represents a thorough study for developing a decoder-only architecture across modalities, demonstrating superior data efficiency and strong vision-reasoning capability.   


## Model Weights

We release the instruction-tuned weights of **EVEv2**. 

| Model name | Weight                                                  |
| ---------- | ------------------------------------------------------- |
| **EVE-7B-HD-v2.0** | [🤗 HF link](https://huggingface.co/BAAI/EVE-7B-HD-v2.0) (28GB) |




## ✒️ Citation
If **EVE** is helpful for your research, please consider **star** ⭐ and **citation** 📝 :
```bibtex
@article{diao2025EVEv2,
  title={EVEv2: Improved Baselines for Encoder-Free Vision-Language Models},
  author={Diao, Haiwen and Li, Xiaotong and Cui, Yufeng and Wang, Yueze and Deng, Haoge and Pan, Ting and Wang, Wenxuan and Lu, Huchuan and Wang, Xinlong},
  journal={arXiv preprint arXiv:2502.06788},
  year={2025}
}
```