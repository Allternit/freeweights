# Qwen3-Reranker-0.6B (ONNX)

ONNX conversion of [Qwen/Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B) for use with [Transformers.js v4](https://huggingface.co/blog/transformersjs-v4).

The model is exported with ORT graph optimization (level 2), which fuses Qwen3's grouped-query attention into `com.microsoft.GroupQueryAttention` ops — the contrib op Transformers.js v4 uses for accelerated inference.

## Available ONNX Variants

| File | Format | Notes |
|------|--------|-------|
| `onnx/model_quantized.onnx` | int8 | Dynamic int8 (MatMul/Gemm only) |
| `onnx/model_q4.onnx` | 4-bit | `com.microsoft.MatMulNBits`, block_size=32 |

> **Note:** fp32 and fp16 variants are not provided because this model's weights exceed the ONNX single-file size limit and require external data files (`model.onnx_data`), which are not supported by ONNX Runtime Web (WASM/WebGPU).

## How the Reranker Works

Qwen3-Reranker is a **CausalLM-based** reranker — not a classifier. It scores relevance by:
1. Formatting query + document into a structured chat prompt
2. Running the model and reading logits for `"yes"` / `"no"` tokens at the **last token position**
3. Computing `score = softmax([yes_logit, no_logit])[0]`

## Usage (Transformers.js v4)

```js
import { AutoTokenizer, AutoModelForCausalLM } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen3-Reranker-0.6B-ONNX";

const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
  dtype: "q4",       // "q8" | "q4"
  device: "webgpu",  // or "wasm" / "cpu"
});

// Token IDs for binary scoring
const TOKEN_YES = tokenizer.convert_tokens_to_ids("yes");
const TOKEN_NO  = tokenizer.convert_tokens_to_ids("no");

const SYSTEM_PROMPT =
  'Judge whether the Document meets the requirements based on the Query and the Instruct provided. ' +
  'Note that the answer can only be "yes" or "no".';

function buildPrompt(query, doc, instruction = "Given a web search query, retrieve relevant passages that answer the query") {
  return (
    `<|im_start|>system\n${SYSTEM_PROMPT}<|im_end|>\n` +
    `<|im_start|>user\n<Instruct>: ${instruction}\n\n<Query>: ${query}\n\n<Document>: ${doc}<|im_end|>\n` +
    `<|im_start|>assistant\n<think>\n\n</think>\n`
  );
}

async function scoreDocument(query, doc) {
  const prompt = buildPrompt(query, doc);
  const inputs = tokenizer(prompt, { truncation: true, max_length: 8192 });
  const output = await model(inputs);

  // Extract logits for the last generated token
  const seqLen = output.logits.dims[1];
  const vocabSize = output.logits.dims[2];
  const lastLogits = output.logits.data.slice(
    (seqLen - 1) * vocabSize,
    seqLen * vocabSize
  );

  const yesScore = Math.exp(lastLogits[TOKEN_YES]);
  const noScore  = Math.exp(lastLogits[TOKEN_NO]);
  return yesScore / (yesScore + noScore);  // normalized probability
}

async function rerank(query, documents) {
  const scores = await Promise.all(documents.map(doc => scoreDocument(query, doc)));
  return documents
    .map((doc, i) => ({ doc, score: scores[i] }))
    .sort((a, b) => b.score - a.score);
}

// Example
const results = await rerank(
  "What is the capital of France?",
  [
    "Berlin is the capital of Germany.",
    "Paris is the capital and largest city of France.",
    "France is a country in Western Europe.",
  ]
);
console.log(results);
// [
//   { doc: "Paris is the capital...", score: 0.982 },
//   { doc: "France is a country...", score: 0.341 },
//   { doc: "Berlin is the capital...", score: 0.018 },
// ]

await model.dispose();
```

## Notes

- **Padding:** left-padded (configured in `tokenizer_config.json`)
- **Context window:** 32K tokens; recommended `max_length: 8192` for practical use
- **Custom instructions:** A short task description (English, 1–5 words) improves accuracy by 1–5%
- **WebGPU:** Recommended for best performance in browsers with Transformers.js v4
- **q4 format:** Uses `com.microsoft.MatMulNBits` (ORT contrib op), natively supported in v4

## Original Model

See [Qwen/Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B) for benchmarks, training details, and full documentation.