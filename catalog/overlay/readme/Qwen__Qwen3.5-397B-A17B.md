# Qwen3.5-397B-A17B

<img width="400px" src="https://qianwen-res.oss-accelerate.aliyuncs.com/logo_qwen3.5.png">

[![Qwen Chat](https://img.shields.io/badge/%F0%9F%92%9C%EF%B8%8F%20Qwen%20Chat%20-536af5)](https://chat.qwen.ai)

> [!Note]
> This repository contains model weights and configuration files for the post-trained model in the Hugging Face Transformers format. 
>
> These artifacts are compatible with Hugging Face Transformers, vLLM, SGLang, KTransformers, etc.

> [!Tip]
> For users seeking managed, scalable inference without infrastructure maintenance, the official Qwen API service is provided by [Alibaba Cloud Model Studio](https://modelstudio.alibabacloud.com/).
>
> In particular, **Qwen3.5-Plus** is the hosted version corresponding to Qwen3.5-397B-A17B with more production features, e.g., 1M context length by default, official built-in tools, and adaptive tool use.
> For more information, please refer to the [User Guide](https://www.alibabacloud.com/help/en/model-studio/text-generation).

Over recent months, we have intensified our focus on developing foundation models that deliver exceptional utility and performance. Qwen3.5 represents a significant leap forward, integrating breakthroughs in multimodal learning, architectural efficiency, reinforcement learning scale, and global accessibility to empower developers and enterprises with unprecedented capability and efficiency.

## Qwen3.5 Highlights

Qwen3.5 features the following enhancement:

- **Unified Vision-Language Foundation**: Early fusion training on multimodal tokens achieves cross-generational parity with Qwen3 and outperforms Qwen3-VL models across reasoning, coding, agents, and visual understanding benchmarks.

- **Efficient Hybrid Architecture**: Gated Delta Networks combined with sparse Mixture-of-Experts deliver high-throughput inference with minimal latency and cost overhead.

- **Scalable RL Generalization**: Reinforcement learning scaled across million-agent environments with progressively complex task distributions for robust real-world adaptability.

- **Global Linguistic Coverage**: Expanded support to 201 languages and dialects, enabling inclusive, worldwide deployment with nuanced cultural and regional understanding.

- **Next-Generation Training Infrastructure**: Near-100% multimodal training efficiency compared to text-only training and asynchronous RL frameworks supporting massive-scale agent scaffolds and environment orchestration.


![Benchmark Results](https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.5/Figures/qwen3.5_397b_a17b_score.png)

For more details, please refer to our blog post [Qwen3.5](https://qwen.ai/blog?id=qwen3.5).


## Model Overview

- Type: Causal Language Model with Vision Encoder
- Training Stage: Pre-training & Post-training
- Language Model
    - Number of Parameters: 397B in total and 17B activated
    - Hidden Dimension: 4096
    - Token Embedding: 248320 (Padded)
    - Number of Layers: 60
        - Hidden Layout: 15 \* (3 \* (Gated DeltaNet -> MoE) -> 1 \* (Gated Attention -> MoE))
    - Gated DeltaNet:
        - Number of Linear Attention Heads: 64 for V and 16 for QK
        - Head Dimension: 128
    - Gated Attention:
        - Number of Attention Heads: 32 for Q and 2 for KV
        - Head Dimension: 256
        - Rotary Position Embedding Dimension: 64
    - Mixture Of Experts
        - Number of Experts: 512
        - Number of Activated Experts: 10 Routed + 1 Shared
        - Expert Intermediate Dimension: 1024
    - LM Output: 248320 (Padded)
    - MTP: trained with multi-steps  
- Context Length: 262,144 natively and extensible up to 1,010,000 tokens.

## Benchmark Results

### Language

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:900px;margin:0 auto;padding:16px 0">
<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead><tr>
<th style="padding:10px 12px;text-align:left;font-weight:600;border-bottom:2px solid #7c3aed;color:#7c3aed"></th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">GPT5.2</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Claude 4.5 Opus</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Gemini-3 Pro</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Qwen3-Max-Thinking</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">K2.5-1T-A32B</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Qwen3.5-397B-A17B</th>
</tr></thead>
<tbody>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Knowledge</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMLU-Pro</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.8</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMLU-Redux</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">95.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">95.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">95.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.9</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">SuperGPQA</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">67.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">74.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">67.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">69.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.4</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">C-Eval</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.0</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Instruction Following</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">IFEval</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.6</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">IFBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">75.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">58.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.5</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MultiChallenge</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">57.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">54.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">64.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">63.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">62.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">67.6</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Long Context</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">AA-LCR</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">72.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">74.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.7</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">LongBench v2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">54.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">64.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">60.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">61.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">63.2</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">STEM</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">GPQA</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">91.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.4</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">HLE</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">35.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">30.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">37.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">30.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">30.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">28.7</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">HLE-Verified¹</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">43.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">38.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">48</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">37.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">37.6</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Reasoning</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">LiveCodeBench v6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.6</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">HMMT Feb 25</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">99.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">97.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">98.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">95.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.8</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">HMMT Nov 25</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">100</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">91.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.7</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">IMOAnswerBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.9</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">AIME26</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">96.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">91.3</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">General Agent</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">BFCL-V4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">63.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">72.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">67.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">72.9</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">TAU2-Bench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">91.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.7</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">VITA-Bench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">38.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">56.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">51.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">40.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">41.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">49.7</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">DeepPlanning</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">44.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">33.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">23.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">28.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">14.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">34.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">Tool Decathlon</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">43.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">43.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">36.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">18.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">27.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">38.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MCP-Mark</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">57.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">42.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">53.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">33.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">29.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">46.1</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Search Agent³</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">HLE w/ tool</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">45.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">43.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">45.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">49.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">50.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">48.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">BrowseComp</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">65.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">67.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">59.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">53.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--/74.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">69.0/78.6</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">BrowseComp-zh</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">62.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">66.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">60.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">WideSearch</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">57.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">72.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">74.0</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">Seal-0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">45.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">47.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">45.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">46.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">57.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">46.9</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Multilingualism</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMMLU</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.5</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMLU-ProX</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">78.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">82.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.7</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">NOVA-63</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">54.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">56.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">56.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">54.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">56.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">59.1</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">INCLUDE</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">82.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.6</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">Global PIQA</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">91.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.8</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">PolyMATH</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">62.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">64.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">43.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">73.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">WMT24++</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">78.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">78.9</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MAXIFE</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">72.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.2</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Coding Agent</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">SWE-bench Verified</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">75.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.4</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">SWE-bench Multilingual</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">72.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">65.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">66.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">73.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">69.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">SecCodeBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">62.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">57.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">61.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">Terminal Bench 2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">54.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">59.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">54.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">22.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">50.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">52.5</td>
</tr>
</tbody>
</table>

<p style="margin-top:12px;font-size:11px;opacity:0.7">
* HLE-Verified: a verified and revised version of Humanity’s Last Exam (HLE), accompanied by a transparent, component-wise verification protocol and a fine-grained error taxonomy. We open-source the dataset at https://huggingface.co/datasets/skylenage/HLE-Verified.<br>
* TAU2-Bench: we follow the official setup except for the airline domain, where all models are evaluated by applying the fixes proposed in the Claude Opus 4.5 system card.<br>
* MCPMark: GitHub MCP server uses v0.30.3 from api.githubcopilot.com; Playwright tool responses are truncated at 32k tokens.<br>
* Search Agent: most search agents built on our model adopt a simple context-folding strategy(256k): once the cumulative Tool Response length reaches a preset threshold, earlier Tool Responses are pruned from the history to keep the context within limits.<br>
* BrowseComp: we tested two strategies, simple context-folding achieved a score of 69.0, while using the same discard-all strategy as DeepSeek-V3.2 and Kimi K2.5 achieved 78.6.<br>
* WideSearch: we use a 256k context window without any context management.<br>
* MMLU-ProX: we report the averaged accuracy on 29 languages.<br>
* WMT24++: a harder subset of WMT24 after difficulty labeling and rebalancing; we report the averaged scores on 55 languages using XCOMET-XXL.<br>
* MAXIFE: we report the accuracy on English + multilingual original prompts (totally 23 settings).<br>
* Empty cells (--) indicate scores not yet available or not applicable.<br>
</p>

</div>

### Vision Language

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:900px;margin:0 auto;padding:16px 0">
<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead><tr>
<th style="padding:10px 12px;text-align:left;font-weight:600;border-bottom:2px solid #7c3aed;color:#7c3aed"></th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">GPT5.2</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Claude 4.5 Opus</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Gemini-3 Pro</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Qwen3-VL-235B-A22B</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">K2.5-1T-A32B</th>
<th style="padding:10px 12px;text-align:center;font-weight:500;border-bottom:2px solid #7c3aed;color:#7c3aed;font-size: 14px;">Qwen3.5-397B-A17B</th>
</tr></thead>
<tbody>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">STEM and Puzzle</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMMU</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.0</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMMU-Pro</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">69.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">78.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.0</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MathVision</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">74.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">74.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.6</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">Mathvista(mini)</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">We-Math</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">74.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.9</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">DynaMath</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">82.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">86.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">ZEROBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">10</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">12</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">ZEROBench_sub</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">33.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">28.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">39.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">28.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">33.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">41.0</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">BabyVision</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">34.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">14.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">49.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">22.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">36.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">52.3/43.3</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">General VQA</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">RealWorldQA</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.9</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMStar</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">73.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">78.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">83.8</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">HallusionBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">65.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">64.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">66.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">69.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">71.4</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMBench<sub><small>EN-DEV-v1.1</small></sub></td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.7</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">SimpleVQA</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">55.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">65.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">73.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">61.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">71.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">67.1</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Text Recognition and Document Understanding</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">OmniDocBench1.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">88.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.8</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">CharXiv(RQ)</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">82.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">66.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.8</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">MMLongBench-Doc</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">61.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">60.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">56.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">58.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">61.5</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">CC-OCR</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">76.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.0</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">79.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">82.0</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">AI2D_TEST</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">89.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.9</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">OCRBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">80.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">85.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.1</td>
</tr>
<tr><td colspan="7" style="padding:8px 12px;font-weight:600;color:#7c3aed;border-bottom:1px solid rgba(124, 58, 237, 0.2);background:rgba(124, 58, 237, 0.1)">Spatial Intelligence</td></tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">ERQA</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">59.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">46.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">70.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">52.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">67.5</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">CountBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">91.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">90.6</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">97.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">93.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">94.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">97.2</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">RefCOCO(avg)</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">91.1</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">87.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">92.3</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">ODInW13</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">46.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">43.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">47.0</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">EmbSpatialBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">81.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">75.7</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">61.2</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.3</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">77.4</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">84.5</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">RefSpatialBench</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">65.5</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">69.9</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">--</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">73.6</td>
</tr>
<tr>
<td style="padding:7px 12px;padding-left:20px;border-bottom:1px solid rgba(128, 128, 128, 0.15);">LingoQA</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">78.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">72.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">66.8</td>
<td style="padding:7px 12px;text-align:center;border-bottom:1px solid rgba(128, 128, 128, 0.15)">68.2</td>

_The publisher's README is longer; it is cut here. Read the rest at the source._
