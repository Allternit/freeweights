<div align="center">

<p align="center">
  <a href="https://github.com/OpenBMB/MiniCPM"><img src="https://raw.githubusercontent.com/OpenBMB/MiniCPM-OCR/main/assets/minicpm-ocr/minicpm-logo.jpg" width="300" alt="MiniCPM logo"></a>
</p>

<p align="center">
  <b>Usage Guide</b>
</p>

<table align="center" width="100%">
  <tr>
    <td align="center" width="25%" valign="top">
      <b>🚀 Free API</b><br/>
      <sub>Try it online for free, then call the API from your own code.</sub><br/>
      Playground (<a href="https://platform.modelbest.cn/console/playground/document-parse">CN</a> /
      <a href="https://platform.modelbest.ai/console/playground/document-parse">Global</a>)<br/>
      API docs (<a href="https://platform.modelbest.cn/console/docs/api/document-parse">CN</a> /
      <a href="https://platform.modelbest.ai/console/docs/api/document-parse">Global</a>)
    </td>
    <td align="center" width="25%" valign="top">
      <b>🤖 Agent Skill</b><br/>
      <sub>One prompt: the agent installs it and parses your first document.</sub><br/>
      <a href="https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/SKILL_en.md">SKILL.md</a>
    </td>
    <td align="center" width="25%" valign="top">
      <b>💻 Self-hosting</b><br/>
      <sub>vLLM / SGLang / llama.cpp / Ollama, plus an official Docker image. Data stays on your side.</sub><br/>
      <a href="https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md">Deployment guide</a>
    </td>
    <td align="center" width="25%" valign="top">
      <b>📱 Mobile App</b><br/>
      <sub>On-device and offline. Document parsing is iOS-only for now.</sub><br/>
      <a href="https://github.com/OpenBMB/MiniCPM-V-Apps/blob/main/README.md#11-ios-demo">iOS Demo</a>
    </td>
  </tr>
</table>

<p align="center">
  Demo (<a href="https://platform.modelbest.cn/console/playground/document-parse">CN</a> /
  <a href="https://platform.modelbest.ai/console/playground/document-parse">Global</a>) &nbsp;·&nbsp;
  <a href="https://github.com/OpenBMB/MiniCPM-OCR">GitHub</a> &nbsp;·&nbsp;
  <a href="https://github.com/OpenBMB/MiniCPM-OCR#using-minicpm-ocr">SDK usage</a> &nbsp;·&nbsp;
  <a href="https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark">DSpark</a> &nbsp;·&nbsp;
  <a href="https://discord.gg/JE8KQqtdn">Discord</a>
  &nbsp;|&nbsp; <a href="https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf/blob/main/README_zh.md">中文</a>
</p>

</div>

# MiniCPM-OCR 1.0 DSpark — GGUF

> **GGUF build of the [DSpark draft head](https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark) for
> [MiniCPM-OCR 1.0](https://huggingface.co/openbmb/MiniCPM-OCR-1.0).** A draft model, not a standalone OCR model — pair it
> with the matching main checkpoint.

## Files

| File | Size |
| :--- | ---: |
| `dspark-MiniCPM-OCR-1_0-F16.gguf` | 0.606 GB |
| `dspark-MiniCPM-OCR-1_0-Q8_0.gguf` | 0.327 GB |
| `dspark-MiniCPM-OCR-1_0-Q6_K.gguf` | 0.255 GB |
| `dspark-MiniCPM-OCR-1_0-Q5_K_M.gguf` | 0.233 GB |
| `dspark-MiniCPM-OCR-1_0-Q5_K_S.gguf` | 0.232 GB |
| `dspark-MiniCPM-OCR-1_0-Q5_1.gguf` | 0.243 GB |
| `dspark-MiniCPM-OCR-1_0-Q5_0.gguf` | 0.232 GB |
| `dspark-MiniCPM-OCR-1_0-Q4_K_M.gguf` | 0.211 GB |
| `dspark-MiniCPM-OCR-1_0-Q4_K_S.gguf` | 0.209 GB |
| `dspark-MiniCPM-OCR-1_0-Q4_1.gguf` | 0.220 GB |
| `dspark-MiniCPM-OCR-1_0-Q4_0.gguf` | 0.209 GB |

Use the main model's projector (`mmproj-model-f16-4x.gguf` from
[MiniCPM-OCR-1.0-gguf](https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf)); this repository contains only the draft.

## Parsing pipeline

MiniCPM-OCR 1.0 parses full documents as a **two-stage pipeline** orchestrated by the [`minicpm-ocr` SDK](https://pypi.org/project/minicpm-ocr/). The two stages use separate models, run in separate environments, and may run on different machines:

- **Stage 1 — Layout detection (SDK environment).** The PP-DocLayoutV3 layout model detects document regions — text, tables, formulas, charts, seals — and determines reading order; the SDK crops each region. It runs locally inside the SDK environment and requires PaddlePaddle / PaddleX.
- **Stage 2 — Region recognition (inference service).** The SDK sends each cropped region over HTTP to a MiniCPM-OCR 1.0 inference service — served by vLLM, SGLang, llama.cpp, or Ollama — with a prompt matching the region type, then assembles the recognized content into the final Markdown / JSON in reading order.

<p align="center"><img src="assets/parsing_pipeline.svg" alt="Parsing pipeline: in the minicpm-ocr SDK environment, the PP-DocLayoutV3 layout model detects and crops document regions; each cropped region is sent over HTTP to a separate recognition service running MiniCPM-OCR 1.0 (vLLM, SGLang, llama.cpp, or Ollama); the SDK then assembles the recognized text, tables, formulas, charts, and seals into Markdown and JSON in reading order." width="90%"></p>

See the [model guide](https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md) for more on architecture, parsing workflow, deployment options, and benchmark breakdowns.

## Usage

```bash
llama-cli \
  -m MiniCPM-OCR-1_0-Q8_0.gguf \
  --mmproj mmproj-model-f16-4x.gguf \
  -md dspark-MiniCPM-OCR-1_0-Q8_0.gguf \
  --spec-type draft-dspark \
  --image page.png -p "Text Recognition:" \
  --jinja -ngl 99 -ngld 99 -fa on
```

`-md` is the draft model and `--spec-type draft-dspark` enables the draft; `-ngld` offloads draft
layers to GPU.

> `llama-mtmd-cli` does not accept a draft model. Use `llama-cli` or `llama-server` when enabling
> DSpark with multimodal input.

Each tier carries the **absolute** target token IDs in its `d2t` tensor (the safetensors export
stores them delta-encoded).

## Related checkpoints

| Format | Hugging Face | ModelScope |
| :--- | :--- | :--- |
| BF16 (original) | [🤗](https://huggingface.co/openbmb/MiniCPM-OCR-1.0) | [ModelScope](https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0) |
| GGUF (llama.cpp) | [🤗](https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf) | [ModelScope](https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-gguf) |
| AWQ W4A16 | [🤗](https://huggingface.co/openbmb/MiniCPM-OCR-1.0-AWQ) | [ModelScope](https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-AWQ) |
| GPTQ W4A16 | [🤗](https://huggingface.co/openbmb/MiniCPM-OCR-1.0-GPTQ) | [ModelScope](https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-GPTQ) |
| DSpark draft (BF16) | [🤗](https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark) | [ModelScope](https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-DSpark) |
| DSpark draft (GGUF) **(this repo)** | [🤗](https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf) | [ModelScope](https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-DSpark-gguf) |

## FAQ

Installation, model downloads, GPU memory, input formats, and unexpected outputs:
[FAQ](https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/faq_en.md).

## License

Model weights, code, and documentation are released under the
[Apache License 2.0](https://github.com/OpenBMB/MiniCPM-OCR/blob/main/LICENSE).
