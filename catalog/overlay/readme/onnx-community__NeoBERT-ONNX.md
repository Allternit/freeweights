# NeoBERT

NeoBERT is a **next-generation encoder** model for English text representation, pre-trained from scratch on the RefinedWeb dataset. NeoBERT integrates state-of-the-art advancements in architecture, modern data, and optimized pre-training methodologies. It is designed for seamless adoption: it serves as a plug-and-play replacement for existing base models, relies on an **optimal depth-to-width ratio**, and leverages an extended context length of **4,096 tokens**. Despite its compact 250M parameter footprint, it is the most efficient model of its kind and achieves **state-of-the-art results** on the massive MTEB benchmark, outperforming BERT large, RoBERTa large, NomicBERT, and ModernBERT under identical fine-tuning conditions. 

- Paper: [paper](https://arxiv.org/abs/2502.19587)
- Repository: [github](https://github.com/chandar-lab/NeoBERT).

## Usage

### Transformers.js

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then compute embeddings using the pipeline API:

```js
import { pipeline } from "@huggingface/transformers";

// Create feature extraction pipeline
const extractor = await pipeline("feature-extraction", "onnx-community/NeoBERT-ONNX");

// Compute embeddings
const text = "NeoBERT is the most efficient model of its kind!";
const embedding = await extractor(text, { pooling: "cls" });
console.log(embedding.dims); // [1, 768]
```

Or manually with the model and tokenizer classes:
```js
import { AutoModel, AutoTokenizer } from "@huggingface/transformers";

// Load model and tokenizer
const model_id = "onnx-community/NeoBERT-ONNX";
const tokenizer = await AutoTokenizer.from_pretrained(model_id);
const model = await AutoModel.from_pretrained(model_id);

// Tokenize input text
const text = "NeoBERT is the most efficient model of its kind!";
const inputs = tokenizer(text);

// Generate embeddings
const outputs = await model(inputs);
const embedding = outputs.last_hidden_state.slice(null, 0);
console.log(embedding.dims); // [1, 768]
```

### ONNXRuntime

```py
from transformers import AutoTokenizer
from huggingface_hub import hf_hub_download
import onnxruntime as ort

model_id = "onnx-community/NeoBERT-ONNX"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model_file = hf_hub_download(model_id, filename="onnx/model.onnx")
session = ort.InferenceSession(model_file)

text = ["NeoBERT is the most efficient model of its kind!"]
inputs = tokenizer(text, return_tensors="np").data
outputs = session.run(None, inputs)[0]
embeddings = outputs[:, 0, :]
print(f"{embeddings.shape=}") # (1, 768)
```

## Conversion

The export script can be found at [./export.py](https://huggingface.co/onnx-community/NeoBERT-ONNX/blob/main/export.py).