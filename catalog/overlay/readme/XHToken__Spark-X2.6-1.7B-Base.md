# Spark-X2.6-1.7B
<div align="center">
  
[![Slack](https://img.shields.io/badge/Slack-Join-4A154B?logo=slack&logoColor=white)](https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white)](https://discord.gg/kTDE2Hg8aw)
[![YouTube](https://img.shields.io/badge/YouTube-Subscribe-FF0000?logo=youtube&logoColor=white)](https://www.youtube.com/@SparkLLM)
[![dev.to](https://img.shields.io/badge/dev.to-Follow-0A0A0A?logo=devdotto&logoColor=white)](https://dev.to/sparkllm)
[![Bluesky](https://img.shields.io/badge/Bluesky-Follow-0285FF?logo=bluesky&logoColor=white)](https://bsky.app/profile/sparkllm.bsky.social)
[![X](https://img.shields.io/badge/X-Follow-000000?logo=x&logoColor=white)](https://x.com/sparkllm)
[![Zhihu](https://img.shields.io/badge/Zhihu-Follow-0084FF?logo=zhihu&logoColor=white)](https://www.zhihu.com/people/zhiikz7qh7m)
[![WeChat](https://img.shields.io/badge/WeChat-Join-07C160?logo=wechat&logoColor=white)](images/xhtoken-wechat.jpg)

</div>

> [!Note]
> This repository contains model weights and configuration files for the post-trained model in the Hugging Face Transformers format. 


## Introduction
We introduce Spark-X2.6-1.7B, the second model in the Spark-X2.6 series, following the release of Spark-X2.6-4B. Building on Spark-X2.5-1.7B, this release further advances our compact, general-purpose language models for on-device deployment.

Spark-X2.6-1.7B retains exactly the same architecture as Spark-X2.5-1.7B, achieving its capability gains through improved post-training. It delivers substantial improvements in coding, agent, long-context, multilingual, reasoning, etc. These capability gains, combined with strong inference efficiency among models of comparable size, enable more capable and practical on-device AI for developers and users tackling real-world tasks.


**Technical Highlights**:
- **Stronger Coding, Agentic, and Long-Context Capabilities**: The model delivers substantial improvements in complex tool use, multi-step planning, software engineering, and reasoning over extended contexts, achieving state-of-the-art performance among open-source models of comparable size.
- **Controllable Thinking Budget**: The model provides three configurable thinking levels—none, low, high—allowing applications to balance reasoning quality, latency, and inference cost dynamically.

### Fine-Tuning

We recommend using [Llama-Factory](https://github.com/XHToken/LlamaFactory) to fine-tune the model.


## License

The Spark-X2.6 model series is licensed under the [Apache 2.0 License](https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base/blob/main/LICENSE).

## Citation
If you find our work helpful, feel free to give us a cite.

```bibtex
@misc{sparkx2.6,
    title  = {Spark-X2.6-4B&1.7B: Advancing the Frontier of On-Device Agents for Real-World Tasks},
    author = {SparkLLM Team},
    year   = {2026}
}
```
