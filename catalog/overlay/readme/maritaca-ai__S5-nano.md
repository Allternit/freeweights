# S5-nano

This repository contains the **BF16 version of S5-nano** (9.3 GB), with the original, unquantized weights for vLLM and SGLang. The [FP8 version](https://huggingface.co/maritaca-ai/S5-nano-FP8) reduces the weight size to 5.8 GB and is recommended for GPUs with native FP8 support. The [GGUF versions](https://huggingface.co/maritaca-ai/S5-nano-GGUF) are for llama.cpp and compatible applications, with BF16 (8.7 GB), Q8_0 (4.6 GB), and Q4_K_M (2.8 GB) options.

S5-nano is a 4B-parameter model built by Maritaca AI on
[Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) through continued pretraining
followed by post-training. It delivers substantial
improvements on Brazilian benchmarks while maintaining strong performance in
function calling, tool use, and structured outputs.

It has two modes:

- **Think**: reasons before answering (the default mode).
- **Instruct**: answers directly, without a reasoning step.

The context window supports up to 262,144 tokens, and the weights include an MTP
(multi-token prediction) layer for speculative decoding.

## Versions

| Version | Format | Size | For |
|---|---|---|---|
| [S5-nano](https://huggingface.co/maritaca-ai/S5-nano) | BF16 | 9.3 GB | vLLM, SGLang |
| [S5-nano-FP8](https://huggingface.co/maritaca-ai/S5-nano-FP8) | FP8 | 5.8 GB | vLLM, SGLang |
| [S5-nano-GGUF](https://huggingface.co/maritaca-ai/S5-nano-GGUF) | GGUF | 2.8 to 8.7 GB | llama.cpp |

FP8 is recommended for GPUs with native FP8 support (Ada, Hopper, and Blackwell).
The GGUF repository provides BF16, Q8_0, and Q4_K_M variants.

The FP8 version uses E4M3 weights for linear layers, with one scale per output
channel, and dynamically quantizes activations per token during inference.
Embeddings, the vision encoder, the MTP layer, and some small projections remain
in BF16.

<!-- s5-nano-evaluation-results:start -->
## Evaluation results

[Explore the results in Observatório Maritaca](https://maritaca-ai.github.io/observatorio-maritaca/)

Results for the original S5-nano checkpoint, evaluated in **BF16** on text tasks.

### Averages

Each primary metric is weighted equally.

<div style="display:flex;flex-wrap:wrap;gap:16px;margin:20px 0">
<div style="flex:1 1 420px;min-width:0"><img src="https://huggingface.co/maritaca-ai/S5-nano/resolve/main/assets/medias-think.svg" alt="Overall averages in Think mode, with benchmark coverage" width="900" style="width:100%;height:auto"></div>
<div style="flex:1 1 420px;min-width:0"><img src="https://huggingface.co/maritaca-ai/S5-nano/resolve/main/assets/medias-instruct.svg" alt="Overall averages in Instruct mode, with benchmark coverage" width="900" style="width:100%;height:auto"></div>
</div>

<div style="display:block;width:100%;max-width:100%;box-sizing:border-box;overflow-x:auto;margin:18px 0 26px">
<table style="display:table;width:100%;min-width:100%;border-collapse:collapse;font-size:13px;line-height:1.45">
<thead><tr>
<th style="padding:12px 9px;text-align:left;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Model</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Mode</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Native BR</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Translated PT</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Non-native</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.28);white-space:nowrap">Total</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Coverage</th>
</tr></thead><tbody>
<tr><td colspan="7" style="padding:10px 12px;background:rgba(157,195,162,.28);color:inherit;font-weight:700;letter-spacing:.03em">Think</td></tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:165px;">S5-nano 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">83.74</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">86.94</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">54.11</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">75.25</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Qwen3.5-4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">72.49</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">87.61</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">54.82</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">68.68</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">LFM2.5-24B-A2B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">69.68</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">87.30</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">56.45</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">67.06</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Nemotron 3.5 Bolt E4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">71.42</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">84.92</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">50.78</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">64.95</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Gemma 4 E4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">71.64</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">83.82</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">47.22</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">63.68</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">LFM3-1.7B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">57.60</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">74.76</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">50.71</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">57.94</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Lumi 4B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">52.68</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">52.50</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">33.97</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">44.77</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Tucano2-qwen-3.7B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Think</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">34.83</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">46.12</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">30.45</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">33.13</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">22/23</td>
</tr>
<tr><td colspan="7" style="padding:10px 12px;background:rgba(157,195,162,.28);color:inherit;font-weight:700;letter-spacing:.03em">Instruct</td></tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:165px;">S5-nano 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">74.65</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">83.48</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">44.06</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">66.51</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Qwen3.5-4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">66.22</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">84.94</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">47.20</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">61.84</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Nemotron 3.5 Bolt E4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">67.58</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">81.16</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">46.57</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">60.47</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Gemma 4 E4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">68.10</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">77.91</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">44.61</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">59.93</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">LatamGPT 70B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">47.66</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">66.97</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">42.99</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">48.19</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">20/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Gaia 4B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">46.25</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">66.90</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">34.95</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">43.26</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">LFM3-1.7B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">47.17</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">11.57</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">39.33</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">42.31</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Lumi 4B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">43.40</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">59.48</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">35.16</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">40.55</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Tucano2-qwen-3.7B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">31.87</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">40.97</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">25.30</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">29.75</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">23/23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Manacá 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">Instruct</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">7.01</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">27.76</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">19.56</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">12.85</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">20/23</td>
</tr>
</tbody></table></div>

<details>
<summary>Compared models and sizes</summary>

Total, active, and effective parameter counts measure different things. LatamGPT 70B is a larger reference model; LFM2.5 has approximately 24B total parameters and 2B active parameters.

<div style="display:block;width:100%;max-width:100%;box-sizing:border-box;overflow-x:auto;margin:18px 0 26px">
<table style="display:table;width:100%;min-width:100%;border-collapse:collapse;font-size:13px;line-height:1.45">
<thead><tr>
<th style="padding:12px 9px;text-align:left;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Model</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Parameters</th>
</tr></thead><tbody>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">S5-nano 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">≈4.2B · text</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Qwen3.5-4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">4.66B · ≈4.2B text</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Gemma 4 E4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">8B total · 4B effective</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Nemotron 3.5 Bolt E4B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">8B total · 4B effective</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">LFM3-1.7B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">1.73B total</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">LFM2.5-24B-A2B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">23.97B total · ≈2B active</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Gaia 4B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">4.30B total</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Manacá 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">1.72B total</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Tucano2-qwen-3.7B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">3.76B total</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Lumi 4B 🇧🇷</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);">3.97B total</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">LatamGPT 70B</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);">70.55B · larger reference model</td>
</tr>
</tbody></table></div>

</details>

### Results by benchmark

**Bold** indicates the best result within each group with a documented evaluation protocol, in the same mode. Different groups may produce more than one highlighted result in the same row. `†` indicates that the model produced reasoning in Instruct mode even though it was disabled in the request.

<h4 style="padding:14px 16px;background:rgba(157,195,162,.28);border-left:4px solid rgba(157,195,162,.65);color:inherit">Think / Thinking</h4>

<div style="display:block;width:100%;max-width:100%;box-sizing:border-box;overflow-x:auto;margin:18px 0 26px">
<table style="display:table;width:100%;min-width:100%;border-collapse:collapse;font-size:13px;line-height:1.45">
<thead><tr>
<th style="padding:12px 9px;text-align:left;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Evaluation / metric</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.28);white-space:nowrap">S5-nano 🇧🇷</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Qwen3.5-4B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Gemma 4 E4B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Nemotron 3.5 Bolt E4B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">LFM3-1.7B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">LFM2.5-24B-A2B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Tucano2-qwen-3.7B 🇧🇷</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Lumi 4B 🇧🇷</th>
</tr></thead><tbody>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Arena-Hard v2 · Weighted preference</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">19.12</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">11.67</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">20.06</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;"><strong>25.82</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">11.18</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">21.65</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">0.35</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">3.62</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Prosa-PT · Rubrics passed</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>75.07</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">56.89</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">60.14</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">59.87</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">51.24</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">54.41</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">25.94</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">30.90</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">IFBench · Strict prompt-level</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">42.67</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">49.67</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">37.33</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">59.67</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">68.67</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;"><strong>71.67</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">12.33</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">23.67</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">CAPITU · Strict single-turn</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">95.50</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">90.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">85.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">89.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">96.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;"><strong>98.00</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">50.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">65.00</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">CAPITU · full conversations · Strict full-conversation</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>97.00</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">92.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">74.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">81.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">94.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">95.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">33.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">37.00</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Lumen PT · Safety · normalized score</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">98.92</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">94.75</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">99.23</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;"><strong>99.92</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">77.62</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">91.51</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">No demonstrated capability</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">98.23</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">HarmBench · Safety · normalized score</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">91.25</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;"><strong>96.56</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">83.12</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">91.56</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">84.69</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">89.06</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">90.62</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">94.69</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">MMLU-PT · high school · Accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>82.83</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">81.85</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">74.81</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">74.62</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">53.31</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">75.53</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">3.57</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">59.98</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">MMLU-PT · undergraduate · Accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>80.54</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">63.92</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">65.04</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">64.42</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">42.70</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">57.82</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">9.66</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">47.84</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">Global-MMLU PT · Accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">78.22</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;"><strong>81.43</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">73.64</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">75.84</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">62.28</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">79.27</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">3.34</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">44.37</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">ENADE-QA · Accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>81.70</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">79.75</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">72.07</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">72.63</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">60.34</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">74.58</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">50.98</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">61.73</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">ENEM-VL · text · Accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>92.91</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">92.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">88.83</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">90.59</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">81.29</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">84.46</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">71.38</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">80.18</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">BLUEX v2 · text · Rubric-based score</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>87.89</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">84.46</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">82.89</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">80.03</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">81.50</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">82.60</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">62.71</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">65.16</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">MATH-PT · PT-BR · Accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">87.77</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;"><strong>91.07</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">85.58</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">80.72</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">85.42</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">90.75</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">20.06</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">81.50</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">MARCA public · Criteria met</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>89.57</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">78.23</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">35.11</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">40.01</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">79.32</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">66.82</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">5.61</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">2.15</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">BrowseComp-Plus · Accuracy / total</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>37.00</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">27.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">8.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">7.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">29.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">28.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">0.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">4.00</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Structured Output Benchmark · Weighted JSON pass rate</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">97.33</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">96.64</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">93.94</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">94.91</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;"><strong>98.40</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">98.19</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">70.78</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">86.46</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">BRoverbs · Mean accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>92.83</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">79.97</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">82.73</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">87.13</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">40.76</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">68.91</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">69.43</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">31.35</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">ASSIN 2 · RTE · Macro F1</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>95.67</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">93.80</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">94.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">94.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">87.24</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">95.33</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">88.89</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">60.62</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">CulturalBench Hard · Fully correct groups</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">41.73</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;"><strong>48.08</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">44.34</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">41.32</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">29.01</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">47.60</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">29.10</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">16.22</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">LongBench v2 · Accuracy</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;">49.70</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;"><strong>54.08</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;"><strong>43.74</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">35.19</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">34.00</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">38.97</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">9.94</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">9.15</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">OAB-Bench · 210 · full · Mean score per exam × 10</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>82.00</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">45.88</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">53.19</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">50.43</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">27.93</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">40.83</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">25.39</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">31.18</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);min-width:165px;">Magis-Bench · 74 · full · Mean score per section × 10</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>50.41</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">13.97</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">23.38</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">21.86</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">7.81</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">15.42</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">3.33</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);min-width:80px;">4.50</td>
</tr>
<tr>
<td style="padding:9px 9px;text-align:left;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:165px;">CondutaBench · 140 · Native clinical score</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.14);color:inherit;min-width:80px;"><strong>80.24</strong></td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">67.92</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">58.49</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">57.27</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">42.81</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">70.98</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">25.47</td>
<td style="padding:9px 9px;text-align:center;border-bottom:1px solid rgba(157,195,162,.35);background:rgba(157,195,162,.07);min-width:80px;">27.33</td>
</tr>
</tbody></table></div>

<h4 style="padding:14px 16px;background:rgba(157,195,162,.28);border-left:4px solid rgba(157,195,162,.65);color:inherit">Instruct</h4>

<div style="display:block;width:100%;max-width:100%;box-sizing:border-box;overflow-x:auto;margin:18px 0 26px">
<table style="display:table;width:100%;min-width:100%;border-collapse:collapse;font-size:13px;line-height:1.45">
<thead><tr>
<th style="padding:12px 9px;text-align:left;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Evaluation / metric</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.28);white-space:nowrap">S5-nano 🇧🇷</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Qwen3.5-4B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Gemma 4 E4B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Nemotron 3.5 Bolt E4B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">LFM3-1.7B</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Gaia 4B 🇧🇷</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Manacá 🇧🇷</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Tucano2-qwen-3.7B 🇧🇷</th>
<th style="padding:12px 9px;text-align:center;font-weight:600;border-bottom:2px solid rgba(157,195,162,.65);color:inherit;background:rgba(157,195,162,.14);white-space:nowrap">Lumi 4B 🇧🇷</th>

_The publisher's README is longer; it is cut here. Read the rest at the source._
