https://huggingface.co/PekingU/rtdetr_r50vd with ONNX weights to be compatible with Transformers.js.

# Usage (Transformers.js)

> [!IMPORTANT]
> NOTE: RT-DETR support is experimental and requires you to install Transformers.js [v3](https://github.com/xenova/transformers.js/tree/v3) from source.

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [GitHub](https://github.com/xenova/transformers.js/tree/v3) using:
```bash
npm install xenova/transformers.js#v3
```

**Example:** Perform object-detection with `onnx-community/rtdetr_r50vd`.

```js
import { pipeline } from '@xenova/transformers';

const detector = await pipeline('object-detection', 'onnx-community/rtdetr_r50vd');

const img = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg';
const output = await detector(img, { threshold: 0.9 });
// [{
//   score: 0.9720445871353149,
//   label: 'cat',
//   box: { xmin: 14, ymin: 54, xmax: 319, ymax: 472 }
// },
// ...
// {
//   score: 0.9795005917549133,
//   label: 'sofa',
//   box: { xmin: 0, ymin: 0, xmax: 640, ymax: 472 }
// }]
```

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).