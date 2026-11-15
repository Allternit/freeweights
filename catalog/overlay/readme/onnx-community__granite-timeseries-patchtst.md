https://huggingface.co/ibm-granite/granite-timeseries-patchtst with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Time series forecasting w/ `onnx-community/granite-timeseries-patchtst`

```js
import { PatchTSTForPrediction, Tensor } from "@huggingface/transformers";

const model_id = "onnx-community/granite-timeseries-patchtst";
const model = await PatchTSTForPrediction.from_pretrained(model_id, { dtype: "fp32" });

const dims = [64, 512, 7];
const prod = dims.reduce((a, b) => a * b, 1);
const past_values = new Tensor('float32',
    Float32Array.from({ length: prod }, (_, i) => i / prod),
    dims,
);
const { prediction_outputs } = await model({ past_values });
console.log(prediction_outputs);
```

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).