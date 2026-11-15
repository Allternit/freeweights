<div align="center">
<img src="https://github.com/OpenBMB/MiniCPM/blob/main/assets/minicpm_logo.png?raw=true" width="500em" ></img> 
</div>

<p align="center">
<a href="https://github.com/OpenBMB/MiniCPM/" target="_blank">GitHub Repo</a> |
<a href="https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf" target="_blank">Technical Report</a> 
</p>
<p align="center">
👋 Join us on <a href="https://discord.gg/3cGQn9b3YM" target="_blank">Discord</a> and <a href="https://github.com/OpenBMB/MiniCPM/blob/main/assets/wechat.jpg" target="_blank">WeChat</a>
</p>

## What's New
- [2025.06.06] **MiniCPM4** series are released! This model achieves ultimate efficiency improvements while maintaining optimal performance at the same scale! It can achieve over 5x generation acceleration on typical end-side chips! You can find technical report [here](https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf).🔥🔥🔥

## MiniCPM4 Series
MiniCPM4 series are highly efficient large language models (LLMs) designed explicitly for end-side devices, which achieves this efficiency through systematic innovation in four key dimensions: model architecture, training data, training algorithms, and inference systems.
- [MiniCPM4-8B](https://huggingface.co/openbmb/MiniCPM4-8B): The flagship of MiniCPM4, with 8B parameters, trained on 8T tokens.
- [MiniCPM4-0.5B](https://huggingface.co/openbmb/MiniCPM4-0.5B): The small version of MiniCPM4, with 0.5B parameters, trained on 1T tokens.
- [MiniCPM4-8B-Eagle-FRSpec](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-FRSpec): Eagle head for FRSpec, accelerating speculative inference for MiniCPM4-8B.
- [MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu): Eagle head trained with QAT for FRSpec, efficiently integrate speculation and quantization to achieve ultra acceleration for MiniCPM4-8B.
- [MiniCPM4-8B-Eagle-vLLM](https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-vLLM): Eagle head in vLLM format, accelerating speculative inference for MiniCPM4-8B.
- [MiniCPM4-8B-marlin-Eagle-vLLM](https://huggingface.co/openbmb/MiniCPM4-8B-marlin-Eagle-vLLM): Quantized Eagle head for vLLM format, accelerating speculative inference for MiniCPM4-8B.
- [BitCPM4-0.5B](https://huggingface.co/openbmb/BitCPM4-0.5B): Extreme ternary quantization applied to MiniCPM4-0.5B compresses model parameters into ternary values, achieving a 90% reduction in bit width.
- [BitCPM4-1B](https://huggingface.co/openbmb/BitCPM4-1B): Extreme ternary quantization applied to MiniCPM3-1B compresses model parameters into ternary values, achieving a 90% reduction in bit width.
- [MiniCPM4-Survey](https://huggingface.co/openbmb/MiniCPM4-Survey): Based on MiniCPM4-8B, accepts users' quiries as input and autonomously generate trustworthy, long-form survey papers.
- [MiniCPM4-MCP](https://huggingface.co/openbmb/MiniCPM4-MCP): Based on MiniCPM4-8B, accepts users' queries and available MCP tools as input and autonomously calls relevant MCP tools to satisfy users' requirements. (**<-- you are here**)

## Introduction

**MiniCPM4-MCP** is an open-source on-device LLM agent model jointly developed by [THUNLP](https://nlp.csai.tsinghua.edu.cn), Renmin University of China and [ModelBest](https://modelbest.cn/en), built on [MiniCPM-4](https://huggingface.co/openbmb/MiniCPM4-8B) with 8 billion parameters. It is capable of solving a wide range of real-world tasks by interacting with various tool and data resources through MCP.

## Usage

As of now, MiniCPM4-MCP supports the following:

- Utilization of tools across 16 MCP servers: These servers span various categories, including office, lifestyle, communication, information, and work management.

- Single-tool-calling capability: It can perform single- or multi-step tool calls using a single tool that complies with the MCP.

- Cross-tool-calling capability: It can perform single- or multi-step tool calls using different tools that complies with the MCP.


## Inference

### MCP Servers Deployment

The MCP Servers supported by MiniCPM4-MCP include
[Airbnb](https://github.com/openbnb-org/mcp-server-airbnb), 
[Amap-Maps](https://github.com/zxypro1/amap-maps-mcp-server),
[Arxiv-MCP-Server](https://github.com/blazickjp/arxiv-mcp-server),
[Calculator](https://github.com/githejie/mcp-server-calculator),
[Computer-Control-MCP](https://github.com/AB498/computer-control-mcp),
[Desktop-commander](https://github.com/wonderwhy-er/DesktopCommanderMCP),
[Filesystem](https://github.com/mark3labs/mcp-filesystem-server),
[Github](https://github.com/modelcontextprotocol/servers/tree/main/src/github),
[Gaode](https://github.com/perMAIN/gaode),
[MCP-Code-Executor](https://github.com/bazinga012/mcp_code_executor),
[MCP-DOCx](https://github.com/MeterLong/MCP-Doc),
[PPT](https://github.com/GongRzhe/Office-PowerPoint-MCP-Server),
[PPTx](https://github.com/supercurses/powerpoint),
[Simple-Time-Server](https://github.com/andybrandt/mcp-simple-timeserver),
[Slack](https://github.com/modelcontextprotocol/servers/tree/main/src/slack), and
[Whisper](https://github.com/arcaputo3/mcp-server-whisper). Follow the instructions provided in each server's repository for successful deployment. Note that not all tools in these servers will function properly in every environment. Some tools are unstable and may return errors such as timeouts or HTTP errors. During training data construction, tools with consistently high failure rates (e.g., those for which the LLM fails to produce a successful query even after hundreds of attempts) are filtered out.

### MCP Client Setup

We modified the existing MCP Client from the [mcp-cli](https://github.com/chrishayuk/mcp-cli) repository to enable interaction between MiniCPM and MCP Servers.  
After the MCP Client performs a handshake with a Server, it retrieves a list of available tools. An example of tool information contained in this list is provided in [`available_tool_example.json`](https://github.com/OpenBMB/MiniCPM/blob/main/demo/minicpm4/MCP/available_tool_example.json).  

Once the available tools and user query are obtained, results can be generated using the following script logic:

```bash
python generate_example.py \
--tokenizer_path {path to MiniCPM4 tokenizer} \
--base_url {vllm deployment URL} \
--model {model name used in vllm deployment} \
--output_path {path to save results}
```
where the `generate_example.py` is located in [link](https://github.com/OpenBMB/MiniCPM/blob/main/demo/minicpm4/MCP/generate_example.py) and MiniCPM4 generates tool calls in the following format:

```
    <|tool_call_start|>
    ```python 
    read_file(path="/path/to/file")
    ```
    <|tool_call_end|>
```
You can build a custom parser for MiniCPM4 tool calls based on this format. The relevant parsing logic is located in `generate_example.py`.

Since the [mcp-cli](https://github.com/chrishayuk/mcp-cli) repository supports the vLLM inference framework, MiniCPM4-MCP can also be integrated into `mcp-cli` by modifying vLLM accordingly.  
Specifically, follow the instructions in [this link](https://github.com/OpenBMB/MiniCPM/tree/main/demo/minicpm3/function_call) to enable interaction between a client running the MiniCPM4-MCP model and the MCP Server.





## Evaluation
The detailed evaluation script can be found on the [GitHub](https://github.com/OpenBMB/MiniCPM/tree/main/demo/minicpm4/MCP) page. The evaluation results are presented below.

| MCP Server                  |          | gpt-4o             |              |          | qwen3             |              |      |      minicpm4         |              |
|-----------------------|----------------|--------------|--------------|---------------|--------------|--------------|----------------|--------------|--------------|
|                       | func           | param        | value        | func          | param        | value        | func           | param        | value        |
| Airbnb                | 89.3           | 67.9         | 53.6         | 92.8          | 60.7         | 50.0         | 96.4           | 67.9         | 50.0         |
| Amap-Maps             | 79.8           | 77.5         | 50.0         | 74.4          | 72.0         | 41.0         | 89.3           | 85.7         | 39.9         |
| Arxiv-MCP-Server      | 85.7           | 85.7         | 85.7         | 81.8          | 54.5         | 50.0         | 57.1           | 57.1         | 52.4         |
| Calculator            | 100.0          | 100.0        | 20.0         | 80.0          | 80.0         | 13.3         | 100.0          | 100.0        | 6.67         |
| Computor-Control-MCP  | 90.0           | 90.0         | 90.0         | 90.0          | 90.0         | 90.0         | 90.0           | 90.0         | 86.7         |
| Desktop-Commander     | 100.0          | 100.0        | 100.0        | 100.0         | 100.0        | 100.0        | 100.0          | 100.0        | 100.0        |
| Filesystem            | 63.5           | 63.5         | 31.3         | 69.7          | 69.7         | 26.0         | 83.3           | 83.3         | 42.7         |
|Github | 92.0 | 80.0 | 58.0 | 80.5 | 50.0 | 27.7 | 62.8 | 25.7 | 17.1 |
| Gaode                 | 71.1           | 55.6         | 17.8         | 68.8          | 46.6         | 24.4         | 68.9           | 46.7         | 15.6         |
| MCP-Code-Executor     | 85.0           | 80.0         | 70.0         | 80.0          | 80.0         | 70.0         | 90.0           | 90.0         | 65.0         |
| MCP-Docx              | 95.8           | 86.7         | 67.1         | 94.9          | 81.6         | 60.1         | 95.1           | 86.6         | 76.1         |
| PPT                   | 72.6           | 49.8         | 40.9         | 85.9          | 50.7         | 37.5         | 91.2           | 72.1         | 56.7         |
| PPTx                  | 64.2           | 53.7         | 13.4         | 91.0          | 68.6         | 20.9         | 91.0           | 58.2         | 26.9         |
| Simple-Time-Server    | 90.0           | 70.0         | 70.0         | 90.0          | 90.0         | 90.0         | 90.0           | 60.0         | 60.0         |
| Slack                 | 100.0          | 90.0         | 70.0         | 100.0         | 100.0        | 65.0         | 100.0          | 100.0        | 100.0        |
| Whisper               | 90.0           | 90.0         | 90.0         | 90.0          | 90.0         | 90.0         | 90.0           | 90.0         | 30.0         |
| **Average**              | **80.2**       | **70.2**     | **49.1**     | **83.5**      | **67.7**     | **43.8**     | **88.3**       | **76.1**     | **51.2**     |

## Statement
- As a language model, MiniCPM generates content by learning from a vast amount of text. 
- However, it does not possess the ability to comprehend or express personal opinions or value judgments. 
- Any content generated by MiniCPM does not represent the viewpoints or positions of the model developers. 
- Therefore, when using content generated by MiniCPM, users should take full responsibility for evaluating and verifying it on their own.

## LICENSE
- This repository and MiniCPM models are released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License. 

## Citation
- Please cite our [paper](https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf) if you find our work valuable.

```bibtex
@article{minicpm4,
  title={{MiniCPM4}: Ultra-Efficient LLMs on End Devices},
  author={MiniCPM Team},
  year={2025}
}
```
