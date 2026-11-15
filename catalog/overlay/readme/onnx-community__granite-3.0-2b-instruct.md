https://huggingface.co/ibm-granite/granite-3.0-2b-instruct with ONNX weights to be compatible with Transformers.js.


## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text generation with `onnx-community/granite-3.0-2b-instruct`.

```js
import { pipeline } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/granite-3.0-2b-instruct",
  { dtype: "q4" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Tell me a joke." },
];

// Generate a response
const output = await generator(messages, { max_new_tokens: 128 });
console.log(output[0].generated_text.at(-1).content);
```

<details>

<summary>Example output</summary>

```
Why don't scientists trust atoms?

Because they make up everything!
```
</details>


---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).