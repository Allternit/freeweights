https://huggingface.co/tasksource/deberta-base-long-nli with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model for zero-shot classification as follows:
```js
import { pipeline } from '@huggingface/transformers';

// Create a zero-shot classification pipeline
const classifier = await pipeline('zero-shot-classification', 'onnx-community/deberta-base-long-nli');

// Classify input text
const text = 'one day I will see the world';
const candidate_labels = ['travel', 'cooking', 'dancing'];
const output = await classifier(text, candidate_labels);
console.log(output);
// {
//   sequence: 'one day I will see the world',
//   labels: [ 'travel', 'dancing', 'cooking' ],
//   scores: [ 0.9572489961861119, 0.030494221087573718, 0.012256782726314351 ]
// }
```
---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).