https://huggingface.co/baidu/ERNIE-4.5-0.3B-PT with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then generate text as follows:
```js
import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/ERNIE-4.5-0.3B-ONNX",
  { dtype: "fp32" }, // Options: "fp32", "fp16", "q8", "q4", "q4f16"
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "What is the capital of France?" },
];

// Generate a response
const output = await generator(messages, {
    max_new_tokens: 512,
    do_sample: false,
    streamer: new TextStreamer(generator.tokenizer, { skip_prompt: true, skip_special_tokens: true}),
});
console.log(output[0].generated_text.at(-1).content);
// The capital of France is Paris.
```

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).