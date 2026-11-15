https://huggingface.co/Alibaba-NLP/gte-multilingual-base with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model to compute embeddings, as follows:

```js
import { pipeline } from '@huggingface/transformers';

// Create a feature-extraction pipeline
const extractor = await pipeline('feature-extraction', 'onnx-community/gte-multilingual-base');

// Compute sentence embeddings
const texts = ['Hello world.', 'Example sentence.'];
const embeddings = await extractor(texts, { pooling: 'mean', normalize: true });
console.log(embeddings);
// Tensor {
//   dims: [ 2, 768 ],
//   type: 'float32',
//   data: Float32Array(1536) [ 0.019079938530921936, 0.041718777269124985, ... ],
//   size: 1536
// }

console.log(embeddings.tolist()); // Convert embeddings to a JavaScript list
// [
//   [ -0.04247443005442619, 0.00007914059096947312, -0.007467088755220175, ... ],
//   [ -0.05675575137138367, 0.0288529209792614, -0.02864679880440235, ... ]
// ]
```

You can also use the model for retrieval. For example:
```js
import { pipeline, cos_sim } from '@huggingface/transformers';

// Create a feature-extraction pipeline
const extractor = await pipeline('feature-extraction', 'onnx-community/gte-multilingual-base');

// List of documents you want to embed
const texts = [
    'Hello world.',
    'The giant panda (Ailuropoda melanoleuca), sometimes called a panda bear or simply panda, is a bear species endemic to China.',
    'I love pandas so much!',
];

// Compute sentence embeddings
const embeddings = await extractor(texts, { pooling: 'mean', normalize: true });

// Prepend recommended query instruction for retrieval.
const query_prefix = 'Represent this sentence for searching relevant passages: '
const query = query_prefix + 'What is a panda?';
const query_embeddings = await extractor(query, { pooling: 'mean', normalize: true });

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
//   { id: 1, score: 0.8908273895482127, text: 'The giant panda (Ailuropoda melanoleuca), sometimes called a panda bear or simply panda, is a bear species endemic to China.' },
//   { id: 2, score: 0.7903781165100383, text: 'I love pandas so much!' },
//   { id: 0, score: 0.7320514921911025, text: 'Hello world.' }
// ]
```

---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).