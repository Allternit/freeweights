> This is a Transformers.js-ready ONNX conversion of the original Hugging Face model [jaredpalmer/kev-0.6b](https://huggingface.co/jaredpalmer/kev-0.6b).
> The original model card content follows below.

## Usage with Transformers.js

Variants under `onnx/`: `q4f16` (default) and `q4` (4-bit `MatMulNBits` weights,
block 32, embedding as `GatherBlockQuantized`, pointer head in fp32; `q4f16`
runs the rest of the graph in fp16 for WebGPU). The full-precision export is
not published.

Kev is not a text generator and not a plain sequence classifier. One document
(the *state*) and any number of typed questions are packed into a single
sequence with five delimiter tokens; a block-causal mask lets every question
see the state and itself only, and a pointer head scores each option's
`</opt>` token against its question's `<decide>` token. The graph takes only
`input_ids` and `attention_mask` (right padded) and derives segments,
positions and the mask from the delimiter ids in-graph. Its `logits` output
has one value per token: read the value at every option's `</opt>` position
and softmax within the question. `config.json` carries the delimiters, ids
and limits under `kev`.

Transformers.js resolves `qwen3` to its text-generation class, which expects
a KV-cache graph, so load this graph through the base `PreTrainedModel`
class: unknown or unmapped types take the single-session encoder-only path,
which feeds every graph input by name. It logs one warning ("assuming
encoder-only architecture"), which is expected.

```js
import { AutoTokenizer, PreTrainedModel, Tensor } from "@huggingface/transformers";

const repo = "onnx-community/kev-0.6b-ONNX";
const tokenizer = await AutoTokenizer.from_pretrained(repo);
const model = await PreTrainedModel.from_pretrained(repo, { dtype: "q4f16", device: "webgpu" });

// Caller text can never produce a delimiter: <|name|> -> <¦name¦> (kev.model.user_tokens)
const enc = (t) => Array.from(tokenizer(t.replace(/<\|([A-Za-z0-9_]+)\|>/g, "<¦$1¦>"), { add_special_tokens: false }).input_ids.data, Number);
const [STATE, Q, OPT, END, DECIDE] = ["<|fim_prefix|>", "<|fim_middle|>", "<|box_start|>", "<|box_end|>", "<|fim_suffix|>"].map((t) => enc(t)[0]);

// TypeSafe request: choice = criteria object (name -> description or null), noul = yes/no, score = ordered levels
const state = "I was charged twice for the same order and nobody answers my emails. I want my money back now.";
const questions = [
  { instr: "Which team should handle this ticket?", options: ["billing: Charges, refunds, invoices", "technical support: Bugs, outages, login problems", "sales", "account management"] },
  { instr: "Is the customer asking for a refund?", options: ["no", "yes"] },
  { instr: "How positive is the sentiment of this message?", options: ["very negative", "negative", "neutral", "positive", "very positive"] },
];

const tokens = [STATE, ...enc(state)];
const groups = questions.map((q) => {
  const spans = q.options.map((o) => [OPT, ...enc(o), END]);
  const branch = [Q, ...enc(q.instr), ...spans.flat(), DECIDE];
  const base = tokens.length;
  let cursor = 1 + enc(q.instr).length;
  const ends = spans.map((s) => { cursor += s.length; return base + cursor - 1; }); // index of each </opt>
  tokens.push(...branch);
  return ends;
});

const { logits } = await model({
  input_ids: new Tensor("int64", BigInt64Array.from(tokens, BigInt), [1, tokens.length]),
  attention_mask: new Tensor("int64", new BigInt64Array(tokens.length).fill(1n), [1, tokens.length]),
});
const scores = Array.from(logits.to("float32").data);
const softmax = (xs) => { const m = Math.max(...xs); const e = xs.map((x) => Math.exp(x - m)); const s = e.reduce((a, b) => a + b); return e.map((x) => x / s); };
const answers = groups.map((ends) => softmax(ends.map((i) => scores[i])));
// choice: argmax over the criteria keys; noul: answers[i][1] is p(yes); score: expected level = sum(i * p[i])
```

Limits: the state is cut to 8,192 tokens and each question branch (instruction,
options, delimiters) plus the state must fit in 8,192 tokens (training used
384 and 1,024; longer inputs run but are untested). Choice questions take 1 to
255 options. Option descriptions render as `name: description`; structured
state or instructions (objects, lists) render as indented `key: value` text as
in the source `kev.api.render`.

---

## Original model card

# Kev-0.6B

Kev-0.6B is a **decision model**: one document (the *state*) and a set of typed questions in, a probability distribution per question out, in one forward pass. No text generation. It is a LoRA adapter (r=16) plus a pointer head on `Qwen/Qwen3-0.6B-Base`, and it serves TypeSafe's public `/v1/systemone` contract.

**The small member of the Kev family.** It is the best 0.6B checkpoint under a frozen, checksummed evaluation protocol: the 4B/8B recipe's data (`decision-v7`) at lr 1e-4, three seeds (transfer 0.613 / 0.605 / **0.620**), after eight one-knob mutations and three seeds of the previous data found nothing better than 0.61. Out of domain it is a 0.6B model — use Kev-4B for accuracy; use this one where memory or latency rule the 4B out, and measure on your own data.

- Hub: `jaredpalmer/kev-0.6b` (this repo; trial `v7-06b/02-trial-2`, seed 2 of 3)
- Code, suites, results, and the full research log: [github.com/jaredpalmer/kev](https://github.com/jaredpalmer/kev) — see `PLAN.md`, `runs/leaderboard.md`, and `evals/v4/*/manifest.json`

## What changed since Kev-0.5B

| | Kev-0.5B | Kev-0.6B (this) |
|---|---|---|
| backbone | Qwen2.5-0.5B | Qwen3-0.6B-Base |
| training records | 9,000 (six sources) | 12,576 (ten public sources + 896 policy minimal pairs + 1,680 records from 60 random rule structures) |
| none-of-the-above | augmentation fix only | + minimal pairs: same state rendered with the true option present and removed |
| in-distribution accuracy (decision-v4 dev) | 0.712 | **0.801** |
| out-of-domain accuracy (transfer-v4 dev) | 0.561 | **0.620** |
| none-option present, accuracy | 0.25 (transfer-v1) | 0.80 |
| seeds behind the number | 1 | 3 (transfer 0.605–0.620) |

Jev (`typesafe-ai/jev` via Vercel AI Gateway) on the same frozen development sets: **0.845** in-distribution, **0.857** out-of-domain. Per-source transfer accuracy for this checkpoint: QNLI 0.85, SciQ 0.93, TweetEval-offensive 0.69, PAWS 0.59, Emotion 0.49, MMLU 0.50; held-out policy structures near chance.

## Known limits

- **Out of domain it is a 0.6B model.** Transfer accuracy is flat at ~0.60 across every hyperparameter we tried (eight one-knob mutations, three seeds). The same recipe at 4B reaches 0.72–0.75 and at 8B 0.74–0.77; capacity, not data, is the bottleneck at this size.
- **Held-out policy reasoning fails**: on programmatic policy pairs whose rule structure was never trained, both-siblings-correct is 6–11% (Kev-4B 0.73, Jev 0.86).
- **Ordinal hedging**: on 3-level Score questions with date arithmetic it collapses to the middle level.
- Confident-error rate out of domain is 11% (≥0.9 confidence and wrong); raw ECE 0.09 in-domain, 0.15 out of domain. Probabilities are usable in-domain; treat them as advisory elsewhere.
- **Locked test, read once** (`runs/locked/kev-06b-v7-ungated/`): in-distribution accuracy **0.808** (Brier 0.266, ECE 0.089), out-of-domain **0.642** (Brier 0.483, ECE 0.128, confident errors 7.9%). This partition will not be read again for this checkpoint.

## Architecture

Prefill-only causal LM with a block-causal attention mask: a shared state prefix, one isolated branch per question, and a pointer readout over option boundary tokens. Questions packed into one request get exactly the probabilities they would get alone (measured max delta 4e-6). Details in the repository README.

## Training

Frozen suite `evals/v7/decision-v7` (manifest pins dataset and base-model revisions): 10,000 public records (1,000 per source), 896 policy minimal-pair records over nine template families, and 1,680 records from 60 randomly generated rule structures, two epochs, LoRA r=16 on attention and MLP projections at lr 1e-4, pointer head from scratch, cross-entropy on the option distribution, bf16 autocast with fp32 master weights on one H100 (~12 min). Augmentation: option permutation, none-of-the-above insertion, distractors, and none minimal pairs on 25% of Choice records. No Jev outputs were used for training.

## Evaluation protocol

Development partitions select models; a locked test partition exists and is read at most once per promoted candidate. Every number above carries the suite hash, code hashes, and git commit in `result.json`. Comparisons use a record-clustered paired bootstrap. See `PLAN.md` for the corrections we made to our own earlier claims.

## Use

```python
from typesafe import TypeSafeClient   # any TypeSafe-compatible client
client = TypeSafeClient(api_key="local", base_url="http://127.0.0.1:8008", model="kev-latest")
```

Serve with `uv run --extra serve python -m kev.serve --run jaredpalmer/kev-0.6b --port 8008` from the repository.

## License

Apache-2.0 for the adapter and head. The base model is Apache-2.0 (Qwen3). Training datasets carry their own licenses.
