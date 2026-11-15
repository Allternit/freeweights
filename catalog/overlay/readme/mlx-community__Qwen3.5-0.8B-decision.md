# Qwen3.5-0.8B decision model

Qwen3.5-0.8B turned into a decision model with `optiq lora train --decision`: a LoRA on the backbone and a new joint schema head that scores noul, choice and score questions in one pass. It runs on Apple Silicon through MLX and OptiQ (`optiq serve` exposes `/v1/systemone`).

## Typed Decisions result

Scored on the full 400-case test split (2,000 decisions) with the benchmark's own metrics.

| Model | Accuracy | KL from gold ↓ | Brier ↓ | ECE ↓ | p50 latency |
|---|---|---|---|---|---|
| **This model** | **0.772** | **0.097** | **0.054** | 0.177 | 0.34 s |
| [gemma-4-e2b-it-OptiQ-4bit-decision](https://huggingface.co/mlx-community/gemma-4-e2b-it-OptiQ-4bit-decision) | 0.802 | 0.072 | 0.039 | 0.181 | 0.99 s |
| [clef-OptiQ-4bit](https://huggingface.co/mlx-community/clef-OptiQ-4bit) (27B) | 0.719 | 0.189 | 0.102 | 0.118 | 9.7 s |
| Always answer the train-split average | 0.489 | 0.327 | 0.181 | – | – |

Latency is one request per case with all five questions, on an Apple M3 Max.

This model was fitted on the benchmark's own train split and nothing else: 1,080 records. The test cases are disjoint from it, but they come from the same four workflows, so expect less on decisions of a different kind. The Clef models were trained on other data. Top-label calibration (ECE) is no better than Clef's.

**Correction, 2026-10-11.** This card first reported 0.512 accuracy. That was a bug: the adapter was saved with tensor names that mlx-lm could not place, so it loaded without its LoRA weights. The adapter file is fixed and the numbers above are from the fixed file.

## Use

```bash
pip install -U mlx-optiq
optiq serve --model mlx-community/Qwen3.5-0.8B-decision
```

Size on disk is 1.9 GB (bf16 backbone, LoRA adapter and head).

Trained and scored with [OptiQ](https://mlx-optiq.com).
