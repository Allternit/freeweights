## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example**: Remove background of an image

```js
import { pipeline } from '@huggingface/transformers';

const segmenter = await pipeline('background-removal', 'onnx-community/BEN2-ONNX');
const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/woman-with-afro_medium.jpg';
const output = await segmenter([url]);
output[0].save('mask.png');
// You can also use `output[0].toCanvas()` or `await output[0].toBlob()` if you would like to access the output without saving.
```



| Input| Output |
|--------|--------|
| ![input](https://github.com/user-attachments/assets/e39c66b3-a3cd-4fcb-846f-899fbe95cbf5) | ![output](https://github.com/user-attachments/assets/90d4507e-74e0-4a75-9fc4-2c9d6d3cfaa5) |


