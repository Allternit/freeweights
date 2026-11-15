https://huggingface.co/kyutai/helium-1-preview-2b with ONNX weights to be compatible with Transformers.js.


## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text-generation w/ `onnx-community/helium-1-preview-2b-ONNX`
```js
import { pipeline } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/helium-1-preview-2b-ONNX",
  { dtype: "q4" },
);

// Define the prompt
const text = "Hello, today is a great day to";

// Generate a response
const output = await generator(text, { max_new_tokens: 128 });
console.log(output[0].generated_text);
```

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).