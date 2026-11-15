## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library
from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Perform object-detection with `onnx-community/rfdetr_nano-ONNX`.

```js
import { pipeline } from '@huggingface/transformers';

const detector = await pipeline('object-detection', 'onnx-community/rfdetr_nano-ONNX');

const img = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg';
const output = await detector(img, { threshold: 0.75 });
console.log(output);
```
