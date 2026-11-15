# GELab-Zero-4B-preview

This model is part of the **GELab-Zero** project, which presents the **Step-GUI Technical Report** [[Paper](https://huggingface.co/papers/2512.15431)] [[Project Page](https://opengelab.github.io/)] [[Code](https://github.com/stepfun-ai/gelab-zero)].

## Model Details

This model is part of the [**GELab-Zero**](https://github.com/stepfun-ai/gelab-zero) project, which aims to accelerate the innovation and application deployment of GUI Agents by providing:
1.  **A 4B GUI Agent model** capable of running on local computers.
2.  **Plug-and-play inference infrastructure** that handles ADB connections, dependency installation, and task recording/replay (**available in the** [**GELab-Zero**](https://github.com/stepfun-ai/gelab-zero)).

### Key Capabilities
*   **Local Deployment**: Optimized for consumer-grade hardware, balancing low latency with privacy.
*   **GUI Navigation**: Proficient in detecting and interacting with UI elements (click, type, slide, wait, etc.) based on visual cues.
*   **Complex Task Execution**: Handles multi-step long-horizon tasks across various apps (Food, Transportation, Shopping, Social, etc.).
*   **Open-World Generalization**: Capable of zero-shot operation across diverse unseen applications and complex dynamic interfaces without requiring app-specific adaptation.

## Usage

### Quick Start with Ollama

The easiest way to run inference is using Ollama.

1.**Install Ollama**: Download from [ollama.com](https://ollama.com/).

2.**Download the Model**:

```bash
# Install huggingface-cli
pip install huggingface_hub
# Download model
huggingface-cli download --resume-download stepfun-ai/GELab-Zero-4B-preview --local-dir gelab-zero-4b-preview
```

3.**Create and Run in Ollama**:

```bash
cd gelab-zero-4b-preview
ollama create gelab-zero-4b-preview -f Modelfile
    
# Test the model
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
        "model": "gelab-zero-4b-preview",
        "messages": [{"role": "user", "content": "Hello, GELab-Zero!"}]
      }'
```

To use this model for actual Android device control (ADB connection, task execution), please use the [GELab-Zero](https://github.com/stepfun-ai/gelab-zero).


## Citation

If you find GELab-Zero-4B-preview useful for your research, please consider citing our work :)

```bibtex
@misc{yan2025stepguitechnicalreport,
      title={Step-GUI Technical Report}, 
      author={Haolong Yan and Jia Wang and Xin Huang and Yeqing Shen and Ziyang Meng and Zhimin Fan and Kaijun Tan and Jin Gao and Lieyu Shi and Mi Yang and Shiliang Yang and Zhirui Wang and Brian Li and Kang An and Chenyang Li and Lei Lei and Mengmeng Duan and Danxun Liang and Guodong Liu and Hang Cheng and Hao Wu and Jie Dong and Junhao Huang and Mei Chen and Renjie Yu and Shunshan Li and Xu Zhou and Yiting Dai and Yineng Deng and Yingdan Liang and Zelin Chen and Wen Sun and Chengxu Yan and Chunqin Xu and Dong Li and Fengqiong Xiao and Guanghao Fan and Guopeng Li and Guozhen Peng and Hongbing Li and Hang Li and Hongming Chen and Jingjing Xie and Jianyong Li and Jingyang Zhang and Jiaju Ren and Jiayu Yuan and Jianpeng Yin and Kai Cao and Liang Zhao and Liguo Tan and Liying Shi and Mengqiang Ren and Min Xu and Manjiao Liu and Mao Luo and Mingxin Wan and Na Wang and Nan Wu and Ning Wang and Peiyao Ma and Qingzhou Zhang and Qiao Wang and Qinlin Zeng and Qiong Gao and Qiongyao Li and Shangwu Zhong and Shuli Gao and Shaofan Liu and Shisi Gao and Shuang Luo and Xingbin Liu and Xiaojia Liu and Xiaojie Hou and Xin Liu and Xuanti Feng and Xuedan Cai and Xuan Wen and Xianwei Zhu and Xin Liang and Xin Liu and Xin Zhou and Yingxiu Zhao and Yukang Shi and Yunfang Xu and Yuqing Zeng and Yixun Zhang and Zejia Weng and Zhonghao Yan and Zhiguo Huang and Zhuoyu Wang and Zheng Ge and Jing Li and Yibo Zhu and Binxing Jiao and Xiangyu Zhang and Daxin Jiang},
      year={2025},
      eprint={2512.15431},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2512.15431}, 
}

@software{gelab_zero_2025,
  title={GELab-Zero: An Advanced Mobile Agent Inference System},
  author={GELab Team},
  year={2025},
  url={https://github.com/stepfun-ai/gelab-zero}
}

@misc{gelab_engine,
      title={GUI Exploration Lab: Enhancing Screen Navigation in Agents via Multi-Turn Reinforcement Learning}, 
      author={Haolong Yan and Yeqing Shen and Xin Huang and Jia Wang and Kaijun Tan and Zhixuan Liang and Hongxin Li and Zheng Ge and Osamu Yoshie and Si Li and Xiangyu Zhang and Daxin Jiang},
      year={2025},
      eprint={2512.02423},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2512.02423}, 
}
```