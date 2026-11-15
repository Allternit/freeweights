<div align="center">
<img src="https://praeclarumjj3.github.io/uploads/sage.png" alt="SAGE Teaser" width="800"/>
</div>

*   **GitHub Repo:** [https://github.com/allenai/SAGE](https://github.com/allenai/SAGE)
*   **Project Page:** [https://praeclarumjj3.github.io/sage/](https://praeclarumjj3.github.io/sage/)

## System Capabilities

SAGE-MM operates as the core decision-maker within the SAGE system. It functions in two distinct stages:

1.  **Stage-1 (Context VLM):** The model analyzes initial sampled frames and metadata to determine if the query can be answered immediately ("single-turn") or if it requires tool usage ("multi-turn").
2.  **Stage-2 (Iterative Reasoner):** If tools are needed, the model enters a loop where it calls tools, analyzes their output, and updates its context until a final answer is derived.

### Supported Tools

The model is trained to generate JSON-formatted actions to invoke the following tools:
*   `web-search`: Search the internet for external knowledge (e.g., sports standings, cast lists).
*   `transcribe-speech`: Perform ASR on specific timestamped segments of the video.
*   `ground-event`: Locate start/end timestamps for specific visual events.
*   `extract-video-parts`: Extract high-resolution frames or subclips from specific timestamps.
*   `analyze`: Perform detailed visual analysis on extracted media.
  
## Usage

**Note:** SAGE-MM outputs JSON action strings. It requires a runtime environment (provided in our [GitHub repo](https://github.com/allenai/SAGE)) to parse these strings, execute the tools, and feed the observation back to the model.

## License

This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with [Ai2's Responsible Use Guidelines](https://allenai.org/responsible-use). 