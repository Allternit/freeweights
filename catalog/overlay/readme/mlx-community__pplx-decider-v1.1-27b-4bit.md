# mlx-community/pplx-decider-v1.1-27b-4bit

An [MLX](https://github.com/ml-explore/mlx) 4-bit conversion of
[`perplexity-ai/pplx-decider-v1.1-27b`](https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b), for Apple Silicon.
It includes a standalone inference script and a llama.cpp-compatible `/v1/systemone` server.

**This is a classifier, not a chat model.** Give it a *state* (text, JSON, chat messages and/or up to 8 images) and a
*question*. One forward pass returns calibrated probabilities over the answer options. There is no generation step.

| Question type | Criteria | Answer |
|---|---|---|
| `choice` | `{"label": "description", ...}`, 1-255 options | `choice`, `probabilities`, `confidence` |
| `score` | `["lowest level", ..., "highest level"]`, 2-10 levels | `score` (expected level), `probabilities`, `legend`, `confidence` |
| `noul` | optional `{"true": "...", "false": "..."}` | `noul` = P(true) |

## Why it needs the included code

`mlx_lm.load` / `mlx_vlm.load` **will not give correct results** with this checkpoint:

- The 16 full-attention layers are **noncausal**: every token sees the whole prompt, and only padding is masked. The
  48 Gated DeltaNet layers stay causal. Running with a causal mask still picks the same top answer most of the time,
  but the probabilities are clearly wrong (mean KL 0.038 vs 0.0014).
- The output is a **255-row decision readout** (stored as `language_model.lm_head`), not a vocabulary head. It reads
  only the last token, uses calibration temperature `1.00874`, and masks options past the question's count.

`decider_mlx.py` implements all of this. The prompt format and answer logic are copied from the official
`autojev/model.py`.

## Quick start

Requires an Apple Silicon Mac with at least 24 GB of memory (the model uses about 16 GB at runtime), and Python 3.12+.

```bash
hf download mlx-community/pplx-decider-v1.1-27b-4bit --local-dir pplx-decider-4bit
cd pplx-decider-4bit
pip install -r requirements.txt     # mlx, mlx-vlm, transformers, pillow (no torch needed)
```

```python
from decider_mlx import Decider

model = Decider.from_pretrained(".")   # or "mlx-community/pplx-decider-v1.1-27b-4bit"
answers = model.decide(
    "Customer message: I was charged twice for my order last week.",
    {
        "route":   {"type": "choice", "instructions": "Which team should handle this?",
                    "criteria": {"billing": "payments, refunds", "shipping": "delivery", "technical": "bugs, login"}},
        "angry":   {"type": "noul",   "instructions": "Is the customer angry?"},
        "urgency": {"type": "score",  "instructions": "How urgent is this?",
                    "criteria": ["can wait", "this week", "today", "right now"]},
    },
    images=None,  # optional: file paths, data:image/... URLs or PIL images
)
print(answers["route"]["choice"], answers["angry"]["noul"], answers["urgency"]["score"])
```

For raw probabilities on many rows, use `model.predict([{"state": ..., "question": ..., "images": [...]}, ...])`.
It groups rows of similar length into padded batches.

CLI:

```bash
python decider_mlx.py --model . --state "Win a FREE iPhone, click now!!!" \
  --question '{"type": "noul", "instructions": "Is this spam?"}'
```

## Server

```bash
python server.py --model . --port 8092    # loads in ~10 s
```

```bash
curl localhost:8092/v1/systemone -H 'Content-Type: application/json' -d '{
  "state": "Customer message: I was charged twice for my order last week.",
  "questions": {
    "route":   {"type": "choice", "instructions": "Which team should handle this?",
                "criteria": {"billing": "payments, refunds", "shipping": "delivery", "technical": "bugs, login"}},
    "angry":   {"type": "noul",   "instructions": "Is the customer angry?"},
    "urgency": {"type": "score",  "instructions": "How urgent is this?", "criteria": ["can wait", "this week", "today", "right now"]}
  }}'
```

The request and response use the same format as llama.cpp's `llama-server /v1/systemone`:

- `state`: a string, JSON, or chat messages with `image_url` parts
- `questions`
- `images`: data URLs, up to 8

The response has `answers` and `usage`. Also available: `GET /v1/models`, `/health` and `/stats`. Set
`DECIDER_API_KEY` to require a bearer token.

The server runs MLX on a single GPU worker. Concurrent requests are batched together by similar length. Each
question is its own sequence: noncausal attention means questions about the same state can't share a prompt prefix.

## Accuracy

Compared with the official PyTorch implementation (bf16), on 33 test rows covering choice/score/noul, 2-255 options,
100-7k tokens and images:

| | argmax agree | mean KL | max abs Δp |
|---|---|---|---|
| this model (single row) | 33/33 | 0.0014 | 0.029 |
| this model (batched, padded) | 33/33 | 0.0014 | 0.025 |
| *control: reference run with causal attention (the wrong mode)* | *33/33* | *0.038* | *0.27* |

## Speed

Measured on an Apple M5 Max (128 GB) in High Power mode, over HTTP, sustained:

| Workload | decisions/s |
|---|---|
| ~100-token decisions, 32 concurrent clients | 6.5 |
| mixed 100-1.8k tokens + images (avg ~360), 16 clients | 1.8 |

That's 1.4-1.6x faster than llama.cpp Q8_0/Q4_K_M on the same machine. Speed depends on prefill, which is
compute-bound: about 975 tok/s with a cool GPU, about 730 tok/s sustained. Tips:

- Use High Power mode: `sudo pmset -a powermode 2`. On our machine it roughly doubled the speed.
- Batch rows of similar length. Padding is the main waste, and small batches run as efficiently as large ones.
- The default input limit is 8192 tokens per decision (`Decider(..., max_tokens=...)`). Prompts can't be split into
  chunks, because each full-attention layer needs every key at once.

## Conversion details

- Source: `perplexity-ai/pplx-decider-v1.1-27b` @ `3b45dead`, with the `Qwen3_5Model` backbone mapped to the
  `mlx_vlm.models.qwen3_5` layout and the readout (`readout.safetensors`, `[255, 5120]`) stored as `language_model.lm_head`.
- Quantization: affine, 4 bits, group size 64, applied to the language backbone. The vision tower and the readout stay
  in bf16. Total size 15.3 GB.
- Tested with mlx 0.32.3, mlx-vlm 0.7.6, transformers 5.19.0 (see `requirements.txt`).

## License and credits

Apache-2.0, the same license as the original model. See `LICENSE` and `NOTICE`. All credit for the model goes to
Perplexity ([original model card](https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b)). It is built on
[Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B), and much of its training data comes from
[tasksource](https://github.com/sileod/tasksource):

```bibtex
@inproceedings{sileo-2024-tasksource,
    title = "tasksource: A Large Collection of {NLP} tasks with a Structured Dataset Preprocessing Framework",
    author = "Sileo, Damien",
    booktitle = "Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation (LREC-COLING 2024)",
    year = "2024",
    url = "https://aclanthology.org/2024.lrec-main.1361",
    pages = "15655--15684",
}
```
