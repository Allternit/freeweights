## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Automatic speech recognition w/ Moonshine tiny.
```js
import { pipeline } from "@huggingface/transformers";

const transcriber = await pipeline("automatic-speech-recognition", "onnx-community/moonshine-tiny-ONNX");
const output = await transcriber("https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav");
console.log(output);
// { text: 'And so my fellow Americans ask not what your country can do for you as what you can do for your country.' }
```
