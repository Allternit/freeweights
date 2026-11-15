# Medical-NER (ONNX)

This is an ONNX version of [blaze999/Medical-NER](https://huggingface.co/blaze999/Medical-NER). It was automatically converted and uploaded using [this space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Perform named entity recognition.

```js
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('token-classification', 'onnx-community/Medical-NER-ONNX');
const output = await classifier('My name is Sarah and I live in London');
```