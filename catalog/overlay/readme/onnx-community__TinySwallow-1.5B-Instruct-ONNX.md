https://huggingface.co/SakanaAI/TinySwallow-1.5B-Instruct with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model to generate text like this:

```js
import { pipeline } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/TinySwallow-1.5B-Instruct-ONNX",
  { dtype: "q4" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Solve the equation: x^2 + 2x - 3 = 0" },
];

// Generate a response
const output = await generator(messages, { max_new_tokens: 256, do_sample: false });
console.log(output[0].generated_text.at(-1).content);
```

<details>

<summary>See example output</summary>

```
Here's how to solve the quadratic equation \(x^2 + 2x - 3 = 0\):

**Step 1:** Recognize that this is a quadratic equation in standard form, \(ax^2 + bx + c = 0\), where \(a=1\), \(b=2\), and \(c=-3\).

**Step 2:** We can factor the left side of the equation:

\[x^2 + 2x - 3 = (x + 3)(x - 1) = 0.\]

**Step 3:** Now we have two possible solutions from factoring:

- \(x + 3 = 0\) or \(x - 1 = 0\)

**Step 4:** Solve each equation for \(x\):

- \(x + 3 = 0 \Rightarrow x = -3\)
- \(x - 1 = 0 \Rightarrow x = 1\)

Therefore, the solutions to the equation \(x^2 + 2x - 3 = 0\) are \(x = -3\) and \(x = 1\).
```

</details>

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).