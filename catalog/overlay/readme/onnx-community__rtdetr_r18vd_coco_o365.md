https://huggingface.co/PekingU/rtdetr_r18vd_coco_o365 with ONNX weights to be compatible with Transformers.js.


## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Perform object-detection with `onnx-community/rtdetr_r18vd_coco_o365`.

```js
import { pipeline } from '@huggingface/transformers';

const detector = await pipeline('object-detection', 'onnx-community/rtdetr_r18vd_coco_o365');

const img = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg';
const output = await detector(img, { threshold: 0.8 });
```

<details>

<summary>See example output</summary>

```js
[
  {
    score: 0.9812611937522888,
    label: 'cat',
    box: { xmin: 10, ymin: 55, xmax: 316, ymax: 471 }
  },
  {
    score: 0.9653043746948242,
    label: 'remote',
    box: { xmin: 40, ymin: 73, xmax: 175, ymax: 117 }
  },
  {
    score: 0.9768251776695251,
    label: 'cat',
    box: { xmin: 344, ymin: 25, xmax: 640, ymax: 372 }
  },
  {
    score: 0.8878865242004395,
    label: 'remote',
    box: { xmin: 333, ymin: 76, xmax: 370, ymax: 187 }
  },
  {
    score: 0.9277128577232361,
    label: 'sofa',
    box: { xmin: 0, ymin: -1, xmax: 640, ymax: 478 }
  }
]
```

</details>

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).