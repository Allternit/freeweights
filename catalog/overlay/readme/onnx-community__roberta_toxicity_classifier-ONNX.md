# roberta_toxicity_classifier (ONNX)

This is an ONNX version of [s-nlp/roberta_toxicity_classifier](https://huggingface.co/s-nlp/roberta_toxicity_classifier). It was automatically converted and uploaded using [this space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Classify text toxicity.

```js
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('text-classification', 'onnx-community/roberta_toxicity_classifier-ONNX');
const output = await classifier('I love transformers!');
```