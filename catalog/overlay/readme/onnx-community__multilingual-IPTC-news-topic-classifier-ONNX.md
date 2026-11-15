# multilingual-IPTC-news-topic-classifier (ONNX)

This is an ONNX version of [classla/multilingual-IPTC-news-topic-classifier](https://huggingface.co/classla/multilingual-IPTC-news-topic-classifier). It was automatically converted and uploaded using [this space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text classification with a multilingual news topic classifier.

```js
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('text-classification', 'onnx-community/multilingual-IPTC-news-topic-classifier-ONNX');
const output = await classifier('I love transformers!');
```