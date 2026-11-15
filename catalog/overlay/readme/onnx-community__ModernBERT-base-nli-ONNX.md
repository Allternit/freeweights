# ModernBERT-base-nli (ONNX)

This is an ONNX version of [tasksource/ModernBERT-base-nli](https://huggingface.co/tasksource/ModernBERT-base-nli). It was automatically converted and uploaded using [this space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text Classification with ModernBERT.

```js
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('text-classification', 'onnx-community/ModernBERT-base-nli-ONNX');
const output = await classifier('I love transformers!');
```