This is an ONNX version of [swiss-ai/Apertus-8B-Instruct-2509](https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509).

### Use with Transformers.js

> [!IMPORTANT]  
> Note: This model requires Transformers.js v4.0.0 and above!

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers@next
```

**Example**: Basic example

```js
import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "swiss-ai/Apertus-8B-Instruct-2509",
  {
    device: "webgpu",
    dtype: "q4f16",
  },
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
    streamer: new TextStreamer(generator.tokenizer, { skip_prompt: true, skip_special_tokens: true }),
});
console.log(output[0].generated_text.at(-1).content);
// The capital of France is Paris.
```
