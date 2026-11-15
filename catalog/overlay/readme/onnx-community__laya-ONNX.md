# laya (ONNX)

ONNX conversion of Convai Innovations' [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya), a non-autoregressive decision model (answerdotai/ModernBERT-large encoder with a decision head). Give it a state (text or JSON) and typed questions (`choice`, `score`, `noul`); it returns a calibrated distribution per question in one forward pass. For the model itself, its training and its limits, see the [original model card](https://huggingface.co/convaiinnovations/laya) and the [laya repository](https://github.com/NandhaKishorM/laya).

## Files

| File | Size |
|---|---|
| `onnx/model.onnx` (+ `_data`), fp32 | 1.69 GB |
| `onnx/model_fp16.onnx` (+ `_data`), fp16 weights and activations, fp32 inputs/outputs | 0.85 GB |

One graph holds encoder and head (laya's own `laya-ts` export splits them in two):

- inputs: `input_ids` [b, s] int64, `attention_mask` [b, s] int64, `marker_pos` [b, k] int64, `marker_mask` [b, k] bool, `qtype` [b] int64 (choice 0, score 1, noul 2)
- outputs: `logits` [b, k] (one per `[MASK]` option marker, masked slots -1e4), `act_logits` [b, 2]

Each question is its own sequence (`[CLS] {type} question: {question} [SEP] [MASK] opt … [SEP] state [SEP]`). `config.json` carries the encoder config plus a `laya` section with everything a runtime needs: `max_len` (512), `head_max_len` (192), the calibrated temperatures per question type and option count, and whether the tokenizer needs word-by-word encoding in Transformers.js (`split_words`).

## Use it in the browser

With [open-jev](https://github.com/shreyaskarnik/open-jev/tree/laya-family) (Transformers.js, WebGPU):

```ts
import { OpenJev, choice, score, noul } from "open-jev";

const jev = await OpenJev.load({ model: "laya" });
const answers = await jev.decide("Hi, we were billed twice for March. Please refund the duplicate.", {
  department: choice("Which department should handle this?", ["billing", "technical", "other"], {
    billing: "invoices, payments, refunds",
    technical: "bugs, outages, system errors",
  }),
  urgency: score("How urgent is this?", ["not urgent", "soon", "blocking"]),
  refund: noul("Does the user ask for a refund?"),
});
```

The open-jev laya family rebuilds laya's `build_sequence` (option texts, 48-token option cap, head budget) and applies the checkpoint's calibrated temperatures, as `laya.Agent` does.

## Conversion and parity

`torch.onnx.export` (dynamo, opset 18) of `DecisionModel.forward` from `laya.common`, with dynamic batch, sequence and marker axes. Scripts are in `conversion/`.

- ONNX Runtime (CPU) against PyTorch on real typed-decisions sequences, up to 2,048 tokens (past the 128-token sliding window): max |Δlogit| 2.4e-5.
- open-jev in Node (onnxruntime-node) against laya's own Python `Agent.predict` on 15 cases (typed-decisions states; double spaces; the mask token inside text; over-long options; the head budget; Hindi, Chinese, Japanese and Spanish): token ids identical for every question; fp32 max |Δp| < 1e-4; fp16 max |Δp| 0.007, no top answer changed.

## Accuracy in the browser

[typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions) test split (400 states, 2,000 questions), WebGPU on an M3 Pro, via [open-jev](https://github.com/shreyaskarnik/open-jev/tree/laya-family):

| dtype | choice | score | noul | overall | median per state |
|---|---|---|---|---|---|
| fp16 | 29.2% | 32.6% | 48.3% | **36.3%** | 0.96 s |
| fp32 | 29.3% | 32.4% | 48.7% | **36.4%** | 1.32 s |

fp16 is the default on WebGPU: it matches fp32 within 0.2 points and is faster. The base checkpoints are zero-shot here; Laya's card reports 0.362 for the English one.

## License

Apache-2.0, as the original. Converted by [@shreyask](https://huggingface.co/shreyask); all credit for the model to Convai Innovations.
