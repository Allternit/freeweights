https://huggingface.co/Menlo/Jan-nano with ONNX weights to be compatible with Transformers.js.

# Jan-Nano: An Agentic Model

<div align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/65713d70f56f9538679e5a56/wC7Xtolp7HOFIdKTOJhVt.png" width="300" alt="Jan-Nano">
</div>

Authors: [Alan Dao](https://scholar.google.com/citations?user=eGWws2UAAAAJ&hl=en), [Bach Vu Dinh](https://scholar.google.com/citations?user=7Lr6hdoAAAAJ&hl=vi), [Thinh Le](https://scholar.google.com/citations?user=8tcN7xMAAAAJ&hl=en)  

## Overview

Jan-Nano is a compact 4-billion parameter language model specifically designed and trained for deep research tasks. This model has been optimized to work seamlessly with Model Context Protocol (MCP) servers, enabling efficient integration with various research tools and data sources.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text-generation with `onnx-community/Jan-nano-ONNX`.
```js
import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Jan-nano-ONNX",
  { dtype: "q4f16" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Tell me a joke." },
];

// Generate a response
const output = await generator(messages, {
    max_new_tokens: 512,
    do_sample: false,
    streamer: new TextStreamer(generator.tokenizer, { skip_prompt: true, skip_special_tokens: true}),
});
console.log(output[0].generated_text.at(-1).content);
```

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).