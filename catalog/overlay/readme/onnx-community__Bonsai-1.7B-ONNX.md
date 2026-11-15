### Transformers.js

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model like this:
```js
import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Bonsai-1.7B-ONNX",
  { device: "webgpu", dtype: "q1" },
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
```
