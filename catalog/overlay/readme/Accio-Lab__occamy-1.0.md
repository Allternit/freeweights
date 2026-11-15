<div align="center">
  <picture>
    <img src="assets/accio.svg" width="34%" alt="Accio">
  </picture>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <picture>
    <img src="assets/occamy.png" width="13%" alt="Occamy logo">
  </picture>
  <h1>Occamy-1.0</h1>
  <p><strong>Open Pareto-frontier 35B Intelligence for Co-work</strong></p>
</div>

<hr>

<div align="center" style="line-height: 1;">
  <a href="https://accio-lab.github.io/occamy/"><img alt="Project Website" src="https://img.shields.io/badge/Website-Occamy--1.0-087F6A"></a>
  <a href="https://huggingface.co/Accio-Lab/occamy-1.0"><img alt="Hugging Face" src="https://img.shields.io/badge/%F0%9F%A4%97%20Model-Occamy--1.0-FFD21E"></a>
  <a href="https://github.com/Accio-Lab/Dressage"><img alt="Dressage" src="https://img.shields.io/badge/Training-Dressage-087F6A"></a>
  <a href="https://arxiv.org/pdf/2609.11977"><img alt="Technical Report" src="https://img.shields.io/badge/%F0%9F%93%84%20Report-Occamy--1.0-B31B1B"></a>
    <a href="https://www.modelscope.cn/models/Accio-Lab/occamy-1.0"><img alt="ModelScope" src="https://img.shields.io/badge/Model-ModelScope-624AFF?logo=modelscope&logoColor=white"></a>
  <a href="https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216"><img alt="Collection" src="https://img.shields.io/badge/Collection-Occamy--1.0-087F6A"></a>
  <a href="https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer"><img alt="Explorer" src="https://img.shields.io/badge/Space-Checkpoint%20Explorer-087F6A"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-blue"></a>
</div>

<p align="center">
  <a href="https://accio-lab.github.io/occamy/">Project Website</a> &nbsp;|&nbsp;
  <a href="https://huggingface.co/Accio-Lab/occamy-1.0">Model Weights</a> &nbsp;|&nbsp;
  <a href="https://github.com/Accio-Lab/Dressage">Training Framework</a>
</p>

## Available Checkpoints

Browse the [Occamy 1.0 collection](https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216) or use the [interactive checkpoint explorer](https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer) to select a format and copy deployment commands.

| Checkpoint | Weight files | Runtime / use | Validation scope |
|---|---:|---|---|
| [BF16](https://huggingface.co/Accio-Lab/occamy-1.0) | 70.22 GB | Transformers, SGLang, vLLM; text + vision | Original checkpoint; nine-case vLLM compatibility check |
| [GGUF](https://huggingface.co/Accio-Lab/occamy-1.0-GGUF) | 11.66–36.90 GB | llama.cpp; 17 variants from IQ2_M to Q8_0 | B200 sample checks; tokenizer protocol documented |
| [APEX GGUF](https://huggingface.co/Accio-Lab/occamy-1.0-APEX-GGUF) | 13.47–25.34 GB | llama.cpp; three plain and four calibrated profiles, including Mini | Full tensor/coverage checks and native-tokenizer functional/PPL samples on B200 |
| [FP8](https://huggingface.co/Accio-Lab/occamy-1.0-FP8) | 36.61 GB | Blockwise FP8; SGLang / vLLM | Paired sample evaluation; nine-case vLLM check |
| [NVFP4](https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4) | 23.93 GB | Native FP4 on compatible hardware; H200 Marlin W4A16 | Expert-only mixed precision; bounded runtime checks |
| [MLX 8-bit](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit) | 36.83 GB | mlx-lm; text only, group size 64 | Native Linux checks, 8/8 fixtures and 2/2 HTTP checks; **Mac Metal acceptance pending** |
| [MLX 6-bit](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit) | 28.17 GB | mlx-lm; text only, group size 64 | Native Linux checks, 8/8 fixtures and 2/2 HTTP checks; **Mac Metal acceptance pending** |
| [MLX 5-bit](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit) | 23.84 GB | mlx-lm; text only, affine, group 64 | Native Linux checks, 8/8 fixtures, 2/2 HTTP and paired subset PPL; **Mac Metal acceptance pending** |
| [MLX 4-bit](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit) | 19.51 GB | mlx-lm; text only, group size 64 | Linux native checks passed; **Mac Metal acceptance pending** |
| [MLX 3-bit](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit) | 15.18 GB | mlx-lm; text only, group size 64 | Linux native checks passed; **Mac Metal acceptance pending** |
| [MLX MXFP4](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp4) | 18.43 GB | mlx-lm; text only, mxfp4, group 32 | Native Linux checks, 8/8 fixtures, 2/2 HTTP and paired subset PPL; **Mac Metal acceptance pending** |
| [MLX MXFP8](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp8) | 35.75 GB | mlx-lm; text only, mxfp8, group 32 | Native Linux checks, 8/8 fixtures, 2/2 HTTP and paired subset PPL; **Mac Metal acceptance pending** |
| [MLX NVFP4](https://huggingface.co/Accio-Lab/occamy-1.0-MLX-nvfp4) | 19.51 GB | mlx-lm; text only, nvfp4, group 16 | Native Linux checks, 8/8 fixtures, 2/2 HTTP and paired subset PPL; **Mac Metal acceptance pending** |
| [MTP head](https://huggingface.co/Accio-Lab/occamy-1.0-MTP) | 1.69 GB + base | Experimental draft head; patched SGLang | Bounded greedy parity checks; final MTP3 speed unmeasured |

Sizes are decimal GB of weight files, not peak RAM/VRAM. GGUF image input requires the separate 0.90 GB F16 vision projector. KV cache, context length, concurrency and runtime buffers need additional memory. The [MLX collection](https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b) groups the Apple Silicon candidates.

BF16, FP8 and NVFP4 each passed a nine-case vLLM compatibility check on a single H200, covering text, code, JSON, tool calls and follow-up, and images. NVFP4 used Marlin W4A16. These checks used ordinary decoding; the separate MTP head remains experimental. Format-specific sample checks do not establish equal benchmark quality or a general speed ranking.

## 1. Model Introduction

Occamy-1.0 is a compact agentic model purpose-built for real-world co-work: long-horizon, stateful tasks that require coordinated use of search, code, tools, files, structured APIs, and productivity software. Starting from the post-trained [Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) checkpoint, Occamy concentrates further training on reliable execution, persistent state tracking, recovery, and follow-through rather than relearning general capabilities from scratch.

### Key Features

- **Co-work specialization:** Designed for sustained execution across multi-step professional workflows, not isolated question answering.
- **Compact inference footprint:** A 35B-total, 3B-active Mixture-of-Experts model that keeps long-running agent workloads practical.
- **Long-horizon continuity:** Designed to keep work coherent across tool calls, delegated runs, and history rewrites such as context compaction.
- **Broad agentic capability:** Co-work gains are accompanied by strong tool calling, terminal coding, and instruction following.
- **Execution-grounded training:** Supervised fine-tuning spans general agentic work, long-horizon interaction, software engineering, and tool-call grounding.
- **Open training stack:** The multi-harness reinforcement-learning infrastructure used to train Occamy is released as [Dressage](https://github.com/Accio-Lab/Dressage).

> [!NOTE]
> Occamy is optimized for common co-work workloads, not as a replacement for frontier models on every task. Retrieval-heavy and simulated-user tasks still have headroom, and native browser or desktop visual interaction is not part of the current co-work training interface.

## 2. Model Summary

<div align="center">
<table>
<tbody>
<tr><td align="center"><strong>Architecture</strong></td><td align="center">Mixture-of-Experts causal model with vision encoder</td></tr>
<tr><td align="center"><strong>Total Parameters</strong></td><td align="center">35B</td></tr>
<tr><td align="center"><strong>Activated Parameters</strong></td><td align="center">3B</td></tr>
<tr><td align="center"><strong>Number of Layers</strong></td><td align="center">40</td></tr>
<tr><td align="center"><strong>Number of Experts</strong></td><td align="center">256</td></tr>
<tr><td align="center"><strong>Activated Experts</strong></td><td align="center">8 routed + 1 shared</td></tr>
<tr><td align="center"><strong>Base Architecture Context</strong></td><td align="center">262,144 tokens</td></tr>
<tr><td align="center"><strong>SFT Sequence Length</strong></td><td align="center">131,072 tokens</td></tr>
<tr><td align="center"><strong>Starting Checkpoint</strong></td><td align="center"><a href="https://huggingface.co/Qwen/Qwen3.6-35B-A3B">Qwen3.6-35B-A3B</a></td></tr>
<tr><td align="center"><strong>Post-training</strong></td><td align="center">Full-parameter SFT, HDPO, model merging, and SAO</td></tr>
</tbody>
</table>
</div>

Architecture fields follow the starting checkpoint's published model card. Occamy post-trains the language backbone without changing the architecture; the vision encoder and projector are frozen during SFT. The released checkpoint configuration remains the source of truth for serving limits.

## 3. Evaluation Results

<div align="center">
  <picture>
    <img src="assets/occamy-main-results.svg" width="100%" alt="Occamy-1.0 results on co-work, tool-use, coding, and business benchmarks">
  </picture>
</div>

### Full Evaluation

<table>
  <thead>
    <tr>
      <th rowspan="2" align="left" bgcolor="#EAF6F3">Benchmark</th>
      <th colspan="6" align="center" bgcolor="#EAF6F3"><font color="#087F6A">35B-A3B Models</font></th>
      <th colspan="4" align="center" bgcolor="#EAF6F3"><font color="#087F6A">Large-scale Models</font></th>
    </tr>
    <tr>
      <th align="center" bgcolor="#087F6A"><font color="#FFFFFF">Occamy-1.0</font></th>
      <th align="center">Qwen3.6<br>35B-A3B</th>
      <th align="center">Agents-A1</th>
      <th align="center">Nex-N2-mini</th>
      <th align="center">BigBang-1.0</th>
      <th align="center">Ornith-1.5</th>
      <th align="center">GPT-5.6 Sol</th>
      <th align="center">Qwen3.8-Max</th>
      <th align="center">DeepSeek V4<br>Pro (0813)</th>
      <th align="center">GLM-5.2</th>
    </tr>
  </thead>
  <tbody>
    <tr><td colspan="11" bgcolor="#DDF1EC"><font color="#087F6A"><strong>Co-work</strong></font></td></tr>
    <tr><td>Claw-Eval (average)</td><td align="right"><strong>82.20</strong></td><td align="right">69.50</td><td align="right"><u>69.90</u></td><td align="right">66.60</td><td align="right">63.50</td><td align="right">64.40</td><td align="right"><u>81.80</u></td><td align="right"><strong>83.92</strong></td><td align="right">81.70</td><td align="right">81.60</td></tr>
    <tr><td>Claw-Eval (Pass³)</td><td align="right"><strong>71.40</strong></td><td align="right"><u>54.80</u></td><td align="right">41.70</td><td align="right">37.00</td><td align="right">40.20</td><td align="right">48.70</td><td align="right">68.90</td><td align="right"><u>73.68</u></td><td align="right"><strong>74.50</strong></td><td align="right">68.30</td></tr>
    <tr><td>WildClawBench</td><td align="right"><strong>49.16</strong></td><td align="right">40.40</td><td align="right">30.73</td><td align="right">30.31</td><td align="right">32.87</td><td align="right"><u>45.91</u></td><td align="right"><strong>67.20</strong></td><td align="right"><u>54.42</u></td><td align="right">37.30</td><td align="right">52.14</td></tr>
    <tr><td>CommerceAgentBench</td><td align="right"><u>37.38</u></td><td align="right">19.60</td><td align="right">9.30</td><td align="right">16.80</td><td align="right">30.80</td><td align="right"><strong>37.40</strong></td><td align="right"><strong>49.50</strong></td><td align="right"><u>46.30</u></td><td align="right">43.30</td><td align="right">39.30</td></tr>
    <tr><td>Business Arena</td><td align="right"><strong>$79,868</strong></td><td align="right">$44,751</td><td align="right">$33,626</td><td align="right">$13,325</td><td align="right">$56,477</td><td align="right"><u>$66,292</u></td><td align="right"><strong>$168,867</strong></td><td align="right"><u>$89,423</u></td><td align="right">$40,804</td><td align="right">$55,742</td></tr>
    <tr><td>GDPval<sup>†</sup></td><td align="right"><strong>1,128</strong></td><td align="right"><u>1,004</u></td><td align="right">869</td><td align="right">999</td><td align="right">951</td><td align="right">855</td><td align="right"><strong>1,741</strong></td><td align="right"><u>1,640</u></td><td align="right">1,500</td><td align="right">1,452</td></tr>
    <tr><td>OfficeQA Pro</td><td align="right"><u>48.10</u></td><td align="right">39.10</td><td align="right">23.30</td><td align="right">46.60</td><td align="right">43.60</td><td align="right"><strong>59.40</strong></td><td align="right"><strong>74.40</strong></td><td align="right"><u>69.20</u></td><td align="right">51.20</td><td align="right">66.20</td></tr>
    <tr><td>τ³-Bench (Banking)</td><td align="right"><strong>37.10</strong></td><td align="right">11.90</td><td align="right">7.20</td><td align="right"><u>25.80</u></td><td align="right">10.30</td><td align="right">21.70</td><td align="right"><u>46.90</u></td><td align="right"><strong>54.60</strong></td><td align="right">44.30</td><td align="right">37.10</td></tr>
    <tr><td colspan="11" bgcolor="#DDF1EC"><font color="#087F6A"><strong>Tool calling</strong></font></td></tr>
    <tr><td>AutomationBench (Pass¹)</td><td align="right"><strong>27.60</strong></td><td align="right">7.50</td><td align="right">2.20</td><td align="right">5.70</td><td align="right">14.80</td><td align="right"><u>18.50</u></td><td align="right"><strong>45.50</strong></td><td align="right"><u>43.50</u></td><td align="right">32.00</td><td align="right">28.00</td></tr>
    <tr><td>AutomationBench (partial)</td><td align="right"><strong>69.10</strong></td><td align="right">39.40</td><td align="right">14.70</td><td align="right">27.90</td><td align="right">47.40</td><td align="right"><u>58.00</u></td><td align="right"><strong>81.20</strong></td><td align="right"><strong>81.20</strong></td><td align="right">59.70</td><td align="right"><u>70.00</u></td></tr>
    <tr><td>BFCL v4</td><td align="right"><u>65.40</u></td><td align="right">63.19</td><td align="right">57.23</td><td align="right">62.81</td><td align="right">57.86</td><td align="right"><strong>68.51</strong></td><td align="right">64.33</td><td align="right"><strong>73.65</strong></td><td align="right">67.10</td><td align="right"><u>70.33</u></td></tr>
    <tr><td>VitaBench</td><td align="right"><u>41.75</u></td><td align="right">34.25</td><td align="right">37.00</td><td align="right">26.25</td><td align="right"><strong>46.00</strong></td><td align="right">40.25</td><td align="right">46.75</td><td align="right"><u>52.25</u></td><td align="right"><strong>53.50</strong></td><td align="right">43.75</td></tr>
    <tr><td colspan="11" bgcolor="#DDF1EC"><font color="#087F6A"><strong>Coding</strong></font></td></tr>
    <tr><td>Terminal-Bench 2.1</td><td align="right">59.00</td><td align="right">49.50</td><td align="right">41.60</td><td align="right"><u>60.70<sup>*</sup></u></td><td align="right">33.70</td><td align="right"><strong>67.80<sup>*</sup></strong></td><td align="right"><strong>88.80</strong></td><td align="right">81.30<sup>*</sup></td><td align="right"><u>87.90<sup>*</sup></u></td><td align="right">82.70</td></tr>
    <tr><td colspan="11" bgcolor="#DDF1EC"><font color="#087F6A"><strong>Instruction following</strong></font></td></tr>
    <tr><td>IFEval</td><td align="right"><u>91.53</u></td><td align="right">86.90</td><td align="right"><strong>91.60</strong></td><td align="right"><strong>91.60</strong></td><td align="right">90.50</td><td align="right">81.80</td><td align="right"><u>95.00</u></td><td align="right"><strong>95.02</strong></td><td align="right">93.74</td><td align="right">93.89</td></tr>
  </tbody>
</table>

Within each size group, **bold** denotes the best result and <u>underlining</u> denotes the second-best result. <sup>*</sup> Official model-card or Artificial Analysis result. <sup>†</sup> Reproduced on the public task release.

### Cost-Performance

<div align="center">
  <picture>
    <img src="assets/aggregate-cost-performance.png" width="100%" alt="Aggregate inference cost versus normalized performance across four co-work benchmarks">
  </picture>
</div>

Across Claw-Eval, WildClawBench, AutomationBench, and GDPval, Occamy-1.0 lies near the low-cost knee of the empirical Pareto frontier. Relative to its Qwen3.6-35B-A3B starting checkpoint, it delivers a large aggregate capability gain with only a modest change in measured per-task inference cost. Benchmark scores are equally weighted after per-benchmark min-max normalization, and costs are macro-averaged per task under the frozen pricing protocol used in the report.


## 4. Training Recipe

Occamy uses staged specialization and consolidation:

```text
Qwen3.6-35B-A3B
  ├─ Marathon Expert: SFT → HDPO ┐
  └─ Sprint Expert: SFT          ├─ Uniform merge → SAO → Occamy-1.0
```

The Marathon Expert learns sustained execution and accuracy-conditioned efficiency, while the Sprint Expert preserves broader agentic capability. A uniform parameter-space merge combines both experts into one checkpoint with no inference-time routing or ensembling, and a final Single-Rollout Asynchronous Optimization (SAO) stage refines the merged policy on a broad co-work mixture.

The deduplicated SFT union across both experts is:

| Data source | Trajectories | Average length | Tokens |
| --- | ---: | ---: | ---: |
| General agentic | 5,418 | 37.7K | 204.1M |
| Long-horizon interactive agents | 923 | 95.8K | 88.4M |
| Terminal and software engineering | 1,228 | 35.1K | 43.1M |
| Tool-call grounding | 7,429 | 9.1K | 67.7M |
| **Overall** | **14,998** | **26.9K** | **403.3M** |

Training tasks are grounded in executable environments with observable state transitions and task-level grading. The open-source [Dressage](https://github.com/Accio-Lab/Dressage) stack provides multi-harness execution, token-exact trajectory capture, sandbox integration, and multi-segment conversion for reinforcement learning.

## 5. Deployment

Occamy-1.0 keeps the Qwen3.6-35B-A3B architecture, so the [upstream deployment recipe](https://huggingface.co/Qwen/Qwen3.6-35B-A3B#deployment) is the reference serving path. The examples below mirror that recipe with eight-way tensor parallelism and its full context length; adjust both to fit your hardware and confirm them against the released Occamy checkpoint configuration.

### SGLang

The upstream model card recommends [SGLang](https://github.com/sgl-project/sglang) 0.5.10 or newer for the Qwen3.6 architecture.

```bash
python -m sglang.launch_server \
  --model-path Accio-Lab/occamy-1.0 \
  --port 8000 \
  --tp-size 8 \
  --mem-fraction-static 0.8 \
  --context-length 262144 \
  --reasoning-parser qwen3 \
  --tool-call-parser qwen3_coder
```

### vLLM

The upstream model card recommends [vLLM](https://github.com/vllm-project/vllm) 0.19.0 or newer for the Qwen3.6 architecture.

```bash
vllm serve Accio-Lab/occamy-1.0 \
  --port 8000 \
  --tensor-parallel-size 8 \
  --max-model-len 262144 \
  --reasoning-parser qwen3 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder
```

Both commands expose an OpenAI-compatible endpoint at `http://localhost:8000/v1`.

## 6. Model Usage

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="Accio-Lab/occamy-1.0",
    messages=[
        {
            "role": "user",
            "content": "Inspect this repository, fix the failing test, and explain the change.",
        }
    ],
    max_tokens=32768,
    temperature=1.0,
    top_p=0.95,
    presence_penalty=1.5,
    extra_body={
        "top_k": 20,
        "chat_template_kwargs": {
            "enable_thinking": True,
            "preserve_thinking": True,
        },
    },
)

print(response.choices[0].message.content)
```

For multi-turn agent runs, retain the complete assistant message returned by the server, including reasoning content and tool calls, then append tool results using the standard OpenAI chat-completions schema. This preserves the execution context that Occamy relies on across long workflows.

### Agent Frameworks

Occamy was trained and evaluated across multiple harnesses, including [OpenClaw](https://github.com/openclaw/openclaw), [Hermes Agent](https://github.com/NousResearch/hermes-agent), and Accio Work. It can be integrated with other tool-using agent frameworks through the same OpenAI-compatible API.

---

## 7. License

This repository is released under the [Apache License 2.0](LICENSE). See the Hugging Face model card for the terms that apply to the model weights.

---

## 8. Contact Us

For questions or feedback, please open an [issue](https://github.com/Accio-Lab/occamy/issues).
