## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Selfie segmentation with `onnx-community/mediapipe_selfie_segmentation_landscape`.

```js
import { AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';

// Load model and processor
const model_id = 'onnx-community/mediapipe_selfie_segmentation_landscape';
const model = await AutoModel.from_pretrained(model_id, { dtype: 'fp32' });
const processor = await AutoProcessor.from_pretrained(model_id);

// Load image from URL
const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/selfie_segmentation_landscape.png';
const image = await RawImage.read(url);

// Pre-process image
const inputs = await processor(image);

// Predict alpha matte
const { alphas } = await model(inputs);

// Save output mask
const mask = await RawImage.fromTensor(alphas[0].mul(255).to('uint8')).resize(image.width, image.height);
mask.save('mask.png');

// (Optional) Apply mask to original image
const result = image.clone().putAlpha(mask);
result.save('result.png');
```

| Input image | Predicted mask | Output image |
| :----------:|:------------:|:------------:|
| ![image/png](https://cdn-uploads.huggingface.co/production/uploads/61b253b7ac5ecaae3d1efe0c/EicPesTu_BsQH9G-KabP9.png) | ![image/png](https://cdn-uploads.huggingface.co/production/uploads/61b253b7ac5ecaae3d1efe0c/eNwol9ruNZ1H_Ih6GFFit.png) | ![image/png](https://cdn-uploads.huggingface.co/production/uploads/61b253b7ac5ecaae3d1efe0c/VtoqyqMzJAShy3BNVQBm6.png) |

