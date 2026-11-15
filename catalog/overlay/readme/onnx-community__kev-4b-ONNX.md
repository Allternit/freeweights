> This is a Transformers.js-ready ONNX conversion of the original Hugging Face model [jaredpalmer/kev-4b](https://huggingface.co/jaredpalmer/kev-4b).
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

const repo = "onnx-community/kev-4b-ONNX";
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

# Kev-4B

Kev-4B is a **decision model**: one document (the *state*) and a set of typed questions in, a probability distribution per question out, in one forward pass. No text generation. It is a LoRA adapter (r=16) plus a pointer head on `Qwen/Qwen3-4B-Base`, serving TypeSafe's public `/v1/systemone` contract.

**The recommended kev.** The best 4B checkpoint under a frozen, checksummed protocol after ~40 controlled 4B trials, and the first Kev within seven points of Jev out of domain on the same items. Same recipe run at three seeds: transfer 0.773 / **0.790** / 0.770; this checkpoint is the seed selected on the development partition (never on the locked test).

- Hub: `jaredpalmer/kev-4b` (this repo; trial `v7-rc3/01-trial-1`)
- Code, suites, every trial with hashes and paired bootstraps: [github.com/jaredpalmer/kev](https://github.com/jaredpalmer/kev) — `PLAN.md`, `runs/leaderboard.md`

## Results (same frozen items for every row)

| | Kev-0.5B (prototype) | Kev-0.6B | **Kev-4B** | Jev |
|---|---|---|---|---|
| in-distribution accuracy (decision-v4 dev, 1,200 q) | 0.712 | 0.801 | **0.854** | 0.845 |
| out-of-domain accuracy (transfer-v4 dev, 560 q) | 0.561 | 0.620 | **0.790** | 0.857 |
| out-of-domain Brier | 0.50 | 0.536 | **0.328** | 0.211 |
| confident errors out of domain (p ≥ 0.9 and wrong) | – | 10.8% | 8.2% | 3.7% |
| held-out policy structures, both siblings correct | – | 0.08 | 0.73 | 0.86 |
| option-order flip rate | 0.21 | 0.07 | 0.06 | 0.00 |

Per-source out-of-domain accuracy (Kev-4B / Jev): QNLI 0.89 / 0.93, SciQ 0.99 / 0.99, TweetEval-offensive 0.75 / 0.81, PAWS 0.72 / 0.79, MMLU 0.65 / 0.90, Emotion 0.66 / 0.59, deadline (3-level date arithmetic) 0.53 / 0.93, (A and B) or not C 0.97 / 0.97, if A then not B else C 0.88 / 0.78.

Seeds: three seeds on decision-v7: transfer 0.773 / **0.790** / 0.770, held-out rule pairs 0.62 / **0.73** / 0.67 (Jev 0.86); this checkpoint is seed 1, selected on development transfer accuracy. Trained on `decision-v7` (10k public records + 896 policy records over nine template families incl. four ordinal Score threshold families + 1,680 records from 60 random rule structures with negation anywhere); development/test items are byte-identical to v4, so every number here is comparable with earlier checkpoints.

**Locked test, read once** (`runs/locked/kev-4b-v7-preview-ungated/`): in-distribution **0.856** (Brier 0.211), out-of-domain **0.806** (Brier 0.294, confident errors 6.6%, held-out pairs 0.66). This partition will not be read again for this checkpoint.

## What we learned building it

- **Capacity dominates out of domain.** With public examples and synthetic budget held equal, 0.6B → 4B is +14–19 pp; 4B → 8B is +1–7 pp.
- **Fine-tuning erodes base capability, and the learning rate controls it.** The 4B base, zero-shot with a letter readout, scores 0.688 on the same MMLU items and 0.787 on PAWS; the default recipe (lr 2e-4) trained down to 0.60–0.66 / 0.56–0.71. Lowering lr to 5e-5 recovers most of it and is the single largest recipe improvement we found; fewer LoRA target modules and smaller ranks help less.
- **More public training data raises in-distribution accuracy and lowers transfer** at 4B (10k vs 3.4k records: −3 pp). Knowledge MCQ sources (ARC, OpenBookQA, CommonsenseQA) raise in-distribution accuracy to 0.86 without moving transfer.
- Programmatic contrastive policy pairs teach the trained rule structures (both-correct 0.85–1.0) but transfer to unseen structures only partially (0.5–0.6 at 4B, 0.03–0.11 at 0.6B).

## Known limits

- Held-out policy reasoning (unseen rule compositions, date arithmetic with grace periods) is far from Jev.
- Product-shaped questions with no training analogue are not guaranteed: on the TypeSafe docs example ("two charges on my card" → *Is there a billing problem?*) this checkpoint answers 0.48 (Kev-8B 0.95, Kev-0.6B 0.97) while picking the return reason correctly (wrong size 0.53; Kev-8B 0.84; Kev-0.6B prefers "none of the above" 0.58). Measure on your own inputs.
- Out-of-domain probabilities are usable but not calibrated (raw ECE 0.096); temperature fitted in-domain does not transfer.
- 4B fp32 needs ~16 GB; on a 32 GB Mac use `KEV_DTYPE=bf16`. Latency on an H100 is ~45 ms per packed request; on an M5 several hundred ms.

## Training

Frozen suite `evals/v4/decision-v4`: 10,000 public records (1,000 per source, ten sources) plus two programmatic policy arms of 448 records, two epochs, LoRA r=16 on attention and MLP projections, pointer head from scratch, cross-entropy on the option distribution, **lr 5e-5** (OneCycle), effective batch 8, bf16 autocast with fp32 master weights, gradient checkpointing, one H100 (~40 min). Augmentation: option permutation, none-of-the-above insertion, distractors, none minimal pairs on 25% of Choice records. No Jev outputs were used for training.

## Evaluation protocol

Development partitions select models; the locked test partition is read at most once per candidate. Every number carries suite hash, code hashes, and git commit in `result.json`. See `PLAN.md` for the corrections we made to our own earlier claims.

## Use

```bash
uv run --extra serve python -m kev.serve --run jaredpalmer/kev-4b --port 8008      # KEV_DTYPE=bf16 on a 32 GB Mac
```

Any TypeSafe-compatible client works: `TypeSafeClient(api_key="local", base_url="http://127.0.0.1:8008", model="kev-latest")`.

## License

Apache-2.0 for the adapter and head; Qwen3 base is Apache-2.0; datasets carry their own licenses.
