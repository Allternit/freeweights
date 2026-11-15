# distilbert-base-uncased-finetuned-conll03-english (ONNX)

This is an ONNX version of [elastic/distilbert-base-uncased-finetuned-conll03-english](https://huggingface.co/elastic/distilbert-base-uncased-finetuned-conll03-english). It was automatically converted and uploaded using [this space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Perform named entity recognition.

```js
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('token-classification', 'onnx-community/distilbert-base-uncased-finetuned-conll03-english-ONNX');
const output = await classifier('My name is Sarah and I live in London');
```

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).