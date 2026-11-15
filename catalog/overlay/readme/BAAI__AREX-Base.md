<div align="center">
  <img src="assets/arex-logo.png" width="40%" alt="AREX" style="display: block; margin: 0 auto -2px;">
  <div style="margin-bottom: 7px;"><strong>Towards a Recursively Self-Improving Agent for Deep Research</strong></div>
  <a href="https://arxiv.org/abs/2607.21461"><img src="https://img.shields.io/badge/-Paper-B31B1B?style=for-the-badge&amp;logo=arxiv&amp;logoColor=white" alt="Paper"></a>
  <a href="https://vectorspacelab.github.io/arex-model/"><img src="https://img.shields.io/badge/-Homepage-24292F?style=for-the-badge&amp;logo=github&amp;logoColor=white" alt="Homepage"></a>
  <a href="https://arex-research.com/"><img src="https://img.shields.io/badge/-Live_Demo-0F766E?style=for-the-badge&amp;logo=googlechrome&amp;logoColor=white" alt="Live Demo"></a>
</div>

## Introduction

AREX is a family of deep research agents developed by the Beijing Academy of Artificial Intelligence (BAAI). It is designed for long-horizon tasks in which an agent must search across sources, assemble candidate answers, verify multiple constraints, and revise its research plan when the available evidence is incomplete.

AREX follows a recursive self-improvement framework consisting of an inner research loop and an outer self-improvement loop. The inner loop conducts deep research, while the outer loop evaluates and improves the research process.

This repository contains **AREX-Base**, the larger model in the AREX family. It is built on Qwen3.5-122B-A10B and uses a Mixture-of-Experts architecture with 122B total parameters and 10B activated parameters.

- **Architecture:** Mixture-of-Experts
- **Parameters:** 122B
- **Context length:** 262,144 tokens

**Key Features**

- **Recursive self-improvement:** evaluates provisional answers and chooses whether to accept, refine, or restart the research trajectory.
- **Verification-guided research:** converts unresolved answer constraints into focused follow-up searches.
- **Autonomous context updates:** retains verified findings, source identifiers, rejected candidates, open constraints, and the next research plan.
- **Long-horizon tool use:** supports multi-round search, browsing, evidence integration, and answer construction.
- **Evidence-grounded answers:** maintains supporting evidence and answer-level confidence throughout the research process.

**Model Family**

| Model | Backbone | Context | Links | Positioning |
| --- | --- | ---: | --- | --- |
| **AREX-Base** | Qwen3.5-122B-A10B | 256K | [🤗 Hugging Face](https://huggingface.co/BAAI/AREX-Base) · [🤖 ModelScope](https://modelscope.cn/models/BAAI/AREX-Base) | Higher-capacity model with the strongest overall AREX results. |
| **AREX-Turbo** | Qwen3.5-4B | 256K | [🤗 Hugging Face](https://huggingface.co/BAAI/AREX-Turbo) · [🤖 ModelScope](https://modelscope.cn/models/BAAI/AREX-Turbo) | Compact model for lower-cost research and tool-use settings. |

## Method

AREX organizes deep research as two interacting loops supported by autonomous context management.

1. **Inner research loop.** The agent searches, reads, integrates evidence, tracks candidates, and produces a provisional answer with supporting evidence and an answer-level confidence score.
2. **Outer self-improvement loop.** The agent checks the provisional answer against the original constraints. High-confidence answers are accepted. Recoverable trajectories are refined around unresolved claims, while uninformative trajectories can be restarted.
3. **Autonomous context update.** The model invokes `update_context` to refresh its research state around verified findings, current and rejected candidates, unresolved constraints, source validity, and the next research plan.

This design preserves useful work across iterations and reduces repeated exploration of paths that have already been rejected.

## Evaluation

AREX is evaluated through a unified long-horizon search-agent interface with `search`, `visit`, `update_context`, and `finish` tools. HLE with tools additionally provides a Python tool.

<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:900px;margin:0 auto;padding:16px 0">
<table style="width:100%;border-collapse:collapse;font-size:13px;white-space:nowrap">
<thead><tr>
<th style="padding:10px 10px;text-align:left;font-weight:600;border-bottom:2px solid #0F766E;color:#0F766E">Model</th>
<th style="padding:10px 8px;text-align:center;font-weight:500;border-bottom:2px solid #0F766E;color:#0F766E;font-size:14px">Total<br>Params</th>
<th style="padding:10px 8px;text-align:center;font-weight:500;border-bottom:2px solid #0F766E;color:#0F766E;font-size:14px">BrowseComp</th>
<th style="padding:10px 8px;text-align:center;font-weight:500;border-bottom:2px solid #0F766E;color:#0F766E;font-size:14px">GAIA</th>
<th style="padding:10px 8px;text-align:center;font-weight:500;border-bottom:2px solid #0F766E;color:#0F766E;font-size:14px">xbench-<br>2510</th>
<th style="padding:10px 8px;text-align:center;font-weight:500;border-bottom:2px solid #0F766E;color:#0F766E;font-size:14px">DeepSearch<br>QA</th>
<th style="padding:10px 8px;text-align:center;font-weight:500;border-bottom:2px solid #0F766E;color:#0F766E;font-size:14px">WideSearch-<br>en</th>
<th style="padding:10px 8px;text-align:center;font-weight:500;border-bottom:2px solid #0F766E;color:#0F766E;font-size:14px">HLE&nbsp;w/<br>tools</th>
</tr></thead>
<tbody>
<tr><td colspan="8" style="padding:8px 12px;font-weight:600;color:#0F766E;border-bottom:1px solid rgba(15,118,110,0.2);background:rgba(15,118,110,0.1)">Frontier models</td></tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">GPT-5.4</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">82.7</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">88.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">77.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">52.1*</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Opus-4.6</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">83.7</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">91.3</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">77.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">53.0*</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Gemini-3.1-Pro</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">85.9</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">53.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">93.3</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">66.4</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">51.4*</td>
</tr>
<tr><td colspan="8" style="padding:8px 12px;font-weight:600;color:#0F766E;border-bottom:1px solid rgba(15,118,110,0.2);background:rgba(15,118,110,0.1)">Open-source models</td></tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">GLM-5</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">744B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">75.9</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">70.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">69.8</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">50.4</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Kimi-K2.6</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">1T</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">83.2</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">90.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">92.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.8</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">54.0*</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">DeepSeek-V4-Flash</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">284B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">73.2</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">69.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">90.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">76.4</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">45.1</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">DeepSeek-V4-Pro</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">1.6T</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">83.4</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">88.7</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">78.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">48.2</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Tongyi-DeepResearch</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">30B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">43.4</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">70.9</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">55.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">32.9</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Qwen3.5-35B</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">35B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">61.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">50.3</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">68.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">57.1</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">47.4</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Qwen3.5-122B</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">122B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">63.8</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">81.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">60.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">47.5</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Qwen3.5-397B</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">397B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">78.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">83.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">61.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">82.1</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">74.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">48.3</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">MiroThinker-1.7-mini</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">30B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">67.9</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.3</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">57.2</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">67.9</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">36.4</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">MiroThinker-1.7</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">235B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">74.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">82.7</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">62.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">72.1</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">42.9</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">MiroThinker-H1</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">88.2</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">88.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">72.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">47.7</td>
</tr>
<tr>
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15)">Quest-35B</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">35B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">64.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">80.8</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">-</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">60.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">37.2</td>
</tr>
<tr><td colspan="8" style="padding:8px 12px;font-weight:600;color:#0F766E;border-bottom:1px solid rgba(15,118,110,0.2);background:rgba(15,118,110,0.1)">AREX models</td></tr>
<tr style="background:rgba(15,118,110,0.04);font-weight:600">
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15);color:#0F766E">AREX-Turbo</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">4B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">70.7</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">81.6</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">57.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">78.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">68.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">40.6</td>
</tr>
<tr style="background:rgba(15,118,110,0.04);font-weight:600">
<td style="padding:7px 10px;padding-left:20px;border-bottom:1px solid rgba(128,128,128,0.15);color:#0F766E">AREX-Base</td>
<td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">122B</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">82.5</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">85.4</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">71.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">89.9</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">82.0</td><td style="padding:7px 8px;text-align:center;border-bottom:1px solid rgba(128,128,128,0.15)">52.4</td>
</tr>
</tbody>
</table>
<div style="font-size:12px;color:#6b7280;margin-top:6px;margin-bottom:-8px;line-height:1.5">* Results reported on the full HLE. Unmarked HLE results use the text-only subset.</div>
</div>

## Inference

See [`inference/README.md`](inference/README.md) for OpenAI-compatible serving and generation examples. The folder also contains the complete, directly formattable system and user prompts used for BrowseComp.

## Intended Use

AREX-Base is intended for research-agent applications that require long-horizon information seeking, evidence aggregation, multi-constraint verification, and tool-augmented reasoning. Its larger capacity is suited to settings where research quality is prioritized over serving cost.

## License

AREX-Base is released under the [Apache License 2.0](LICENSE).

## Citation

```bibtex
@misc{baai2026arex,
      title={AREX: Towards a Recursively Self-Improving Agent for Deep Research},
      author={Shuqi Lu and Chaofan Li and Kun Luo and Zhang Zhang and Hui Wang and Hongwang Xiao and Lei Xiong and Jiahao Wang and Sen Wang and Xiyan Jiang and Wanli Li and Yuyang Hu and Hongjin Qian and Bingyu Yan and Ziyi Xia and Yingxia Shao and Kang Liu and Zhicheng Dou and Di He and Chaozhuo Li and Qiwei Ye and Zhongyuan Wang and Zheng Liu},
      year={2026},
      eprint={2607.21461},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2607.21461},
}
```
