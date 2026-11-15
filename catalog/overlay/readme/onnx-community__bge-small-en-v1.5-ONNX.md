https://huggingface.co/BAAI/bge-small-en-v1.5 with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model to compute embeddings, as follows:

```js
import { pipeline } from '@huggingface/transformers';

// Create a feature-extraction pipeline
const extractor = await pipeline('feature-extraction', 'onnx-community/bge-small-en-v1.5-ONNX');

// Compute sentence embeddings
const texts = ['Hello world.', 'Example sentence.'];
const embeddings = await extractor(texts, { pooling: 'cls', normalize: true });
console.log(embeddings);
// Tensor {
//   dims: [ 2, 384 ],
//   type: 'float32',
//   data: Float32Array(768) [ -0.019706636667251587, -0.028999386355280876, ... ],
//   size: 768
// }

console.log(embeddings.tolist()); // Convert embeddings to a JavaScript list
// [
//   [ -0.019706636667251587, -0.028999386355280876, 0.030835328623652458, ... ],
//   [ -0.020751159638166428, 0.007133616600185633, 0.024070002138614655, ... ]
// ]
```

You can also use the model for retrieval. For example:
```js
import { pipeline, cos_sim } from '@huggingface/transformers';

// Create a feature-extraction pipeline
const extractor = await pipeline('feature-extraction', 'onnx-community/bge-small-en-v1.5-ONNX');

// List of documents you want to embed
const texts = [
    'Hello world.',
    'The giant panda (Ailuropoda melanoleuca), sometimes called a panda bear or simply panda, is a bear species endemic to China.',
    'I love pandas so much!',
];

// Compute sentence embeddings
const embeddings = await extractor(texts, { pooling: 'cls', normalize: true });

// Prepend recommended query instruction for retrieval.
const query_prefix = 'Represent this sentence for searching relevant passages: '
const query = query_prefix + 'What is a panda?';
const query_embeddings = await extractor(query, { pooling: 'cls', normalize: true });

// Sort by cosine similarity score
const scores = embeddings.tolist().map(
    (embedding, i) => ({
        id: i,
        score: cos_sim(query_embeddings.data, embedding),
        text: texts[i],
    })
).sort((a, b) => b.score - a.score);
console.log(scores);
// [
//   { id: 1, score: 0.819299738162704, text: 'The giant panda (Ailuropoda melanoleuca), sometimes called a panda bear or simply panda, is a bear species endemic to China.' },
//   { id: 2, score: 0.7127886435498881, text: 'I love pandas so much!' },
//   { id: 0, score: 0.4215074419638722, text: 'Hello world.' }
// ]
```

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).
