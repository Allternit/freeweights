# Project Alexandria — Gemma 4 12B IT: Scientific summaries, LoRA rank 128

This is a **LoRA adapter**, released on 10 October 2026. Load it on the pinned [Gemma 4 12B IT base model](https://huggingface.co/google/gemma-4-12B-it); it contains learned adapter matrices rather than a standalone copy of Gemma.

## Why extract scientific knowledge?

Research papers contain findings, experimental conditions, quantities and relationships that agents can use for retrieval, question answering and synthesis. Project Alexandria aims to make that factual knowledge reusable through representations that reduce dependence on the original prose. A Knowledge Unit describes entities, attributes and relationships; a scientific summary offers an organized account of a paper.

The motivation is introduced in [Project Alexandria: Towards Freeing Scientific Knowledge from Copyright Burdens via LLMs](https://arxiv.org/abs/2502.19413v2). The paper proposes knowledge-preserving, style-agnostic representations and examines their reuse. An agent can retrieve relevant KUs, answer a question from their facts and follow a source identifier for verification. Distillation trains a smaller extractor to imitate a larger teacher, reducing the cost of creating these representations.

For example, an illustrative KU can describe an intervention, its dose, the measured effect, the population and the uncertainty as separate fields. This helps an agent distinguish a measured result from an interpretation. These adapters learn the extraction task; they do not provide a database of all scientific knowledge.

The technical goal is to preserve scientific information while reducing reproduction of source expression. **This release does not certify that its outputs are copyright-free.** Our literal-copy audits still find substantial overlap. Source access, source terms, attribution and output review remain relevant. QA accuracy measures usefulness for answering questions; it does not establish legal clearance or complete factual correctness.

## Model and training provenance

- Base: [google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it), revision `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`.
- Teacher: [ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B), revision `489cb97981b8654bcfcf30ce1f94ed1b62e07b53`.
- Task: generator-only scientific summaries; no quality-review or correction adapter was trained.
- Training: **736 examples from 736 papers**, one epoch, 92 optimizer updates.
- LoRA: rank 128, alpha 256, dropout 0.05; language-layer q/k/v/o attention and gate/up/down MLP projections.
- Optimizer: AdamW, learning rate 2e-5, weight decay 0.01, 5% warmup then cosine decay; BF16 base, gradient checkpointing, flex attention and assistant-token-weighted cut cross entropy.
- Effective batch: eight; source/prompt tokens are masked from the loss; no source or target truncation.
- See [training configuration](training_config.json), [native data manifest](training/manifest.json) and [weight/code provenance](provenance.json).

The frozen training dataset is [ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004](https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004), pinned revision [`1ab11230eb1928c790a9f8e0a13ec2563565dc82`](https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Ornith-1.5-9B-736-20261004/tree/1ab11230eb1928c790a9f8e0a13ec2563565dc82). The original source-only generation answer and its matching emitted reasoning were supervised using Gemma's native thought-channel template. Corrected answers were not paired with unrelated generator reasoning. The separate 97-paper / 970-MCQ benchmark was excluded from training by identity, title, hashes and substantial-text overlap.

The Ornith teacher used native BF16 autoregressive decoding without DFlash. These are raw targets: all 736 have readable narratives and reasoning, but none passed the stricter nested source-evidence schema validator. They received no semantic quality correction.

## Evaluation: retained knowledge

A separate, fixed **Qwen2.5-7B-Instruct** answerer receives the generated representation and answers four-choice questions. The generator never receives evaluation questions or gold labels. Each paper contributes ten questions. Failed paper generations count as ten wrong answers; invalid responses remain in the denominator. Confidence intervals use 10,000 paired paper-bootstrap draws.

### Held-out 97-paper / 970-question comparison, thinking enabled

| Generator | Correct / 970 | QA accuracy | 95% interval | Failed papers | Mean summary words |
| --- | ---: | ---: | --- | ---: | ---: |
| Gemma 4 12B IT / no LoRA, thinking enabled | 850 | 87.63% | 85.26–89.90% | 0 | 1070 |
| Gemma 4 12B IT / Ornith-distilled rank 64, one epoch | 874 | 90.10% | 86.49–93.09% | 2 | 1679 |
| Gemma 4 12B IT / Ornith-distilled rank 128, one epoch | 755 | 77.84% | 70.52–84.64% | 16 | 1364 |

This adapter changes accuracy by **-9.79 percentage points** against the matched base control (paired 95% interval **-17.32 to -2.68**). Longer generated summaries and format failures affect the result. This comparison does not hold summary length fixed.

Generation took **114.02 minutes** on one active GH200, at **471.8 completion tokens/s/GPU**, including emitted thinking and format retries. Mean native narrative length: **2049 tokens** across all 97 slots, with failed outputs contributing zero. Server startup, training and QA are excluded from this generation measurement.

## Copy-overlap audit

Every evaluated output is audited against its complete, untruncated source. The primary rule allows at most five normalized consecutive whitespace words; six is borderline and seven or more is flagged. Narrative fields, evidence quotes and bibliographic metadata are tracked separately; a punctuation-split diagnostic is also retained. This numerical heuristic is a technical diagnostic, not a legal test.

| Condition | Audited outputs | Narrative ≤5 | Six only | Narrative ≥7 | Longest copied run | Mean coverage in runs ≥6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| This adapter | 81 | 0 | 0 | 81 | 184 words | 22.09% |

**No evaluated output from this adapter passes the strict five-word narrative rule under these recipes.** No back-translation or semantic correction is applied in the primary scores. Raw QA performance and copying compliance are reported independently. The inference script performs the same audit automatically and retains failures and partial outputs.

[Full English evaluation report](https://github.com/LAION-AI/project-alexandria/blob/findings/ornith-dflash-97-20261003/experiments/scientific_summaries/ornith_gemma_distillation_736/evaluation/RESULTS.md)
and local [machine-readable metrics](evaluation/metrics.json), [copy audit](evaluation/copy_overlap.json).

## Quick start: inference

Download this repository and install the inference environment separately from the training environment. All commands below run from the downloaded repository directory. A CUDA installation compatible with your vLLM build is required.

```bash
hf download laion/Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r128 --local-dir adapter-release
cd adapter-release
python -m venv .venv-infer
. .venv-infer/bin/activate
python -m pip install -r requirements-inference.txt
vllm serve google/gemma-4-12B-it --revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7 \
  --served-model-name base --host 127.0.0.1 --port 8000 \
  --language-model-only --reasoning-parser gemma4 \
  --enable-lora --max-lora-rank 128 --max-loras 2 \
  --lora-modules alexandria=. --generation-config vllm \
  --gpu-memory-utilization 0.90 --max-num-seqs 16 \
  --max-model-len 65536 --max-num-batched-tokens 8192 \
  --enable-prefix-caching --enable-chunked-prefill
```

In another terminal, use the same environment:

```bash
python code/infer.py --text-file paper.txt --task summary \
  --model alexandria --output outputs --thinking
# Batch input: one JSON object per line with document_id, text, optional title.
python code/infer.py --input papers.jsonl --task summary \
  --model alexandria --concurrency 16 --output outputs-batch --thinking
```

Each document receives an output directory with complete call traces, the result, failure flags and the full-source copying audit. Chunks within a paper remain sequential; concurrent papers are batched by vLLM. KU generation disables thinking and allows one 16,384-token format retry after an 8,192-token attempt. Summary generation allows three bounded 24,576-token format attempts. Removing `--thinking` enables direct summary generation. Portable examples retain the benchmark prompts and budgets; hardware, scheduler ordering and library differences can change sampled outputs. They do not claim byte-identical regeneration of the archived benchmark.

## Reproduce training

The included compressed JSONL preserves the native tokenizer input IDs, assistant-only labels and original row order used for the completed run. Its uncompressed SHA256 is in the manifest. These token arrays encode source text and targets; they are reconstructable, so they are not privacy-preserving or irreversible fingerprints. Source-paper rights still apply.

```bash
python -m venv .venv-train
. .venv-train/bin/activate
python -m pip install -r requirements-training.txt
python code/train.py --output reproduced --dry-run
torchrun --standalone --nproc_per_node=8 code/train.py --output reproduced
```

The original KU run used one GH200 with microbatch one and gradient accumulation eight. Original summary runs used eight GH200 GPUs across two nodes, one example per rank. The portable trainer supports any GPU world size dividing eight. For two nodes with four GPUs each, launch `torchrun --nnodes=2 --nproc_per_node=4 --node_rank=NODE_RANK --master_addr=MASTER_HOST --master_port=29500 code/train.py --output reproduced` on each node. Adapter training needs substantial GPU memory for the 65,536-token summary limit; the original KU examples are much shorter.

`code/prepare_training.py` can render new OpenAI-style source-only conversations with actual `reasoning_content` through the pinned native tokenizer. It derives assistant boundaries from template offsets, preserves emitted reasoning and rejects over-length examples instead of truncating them. The released native arrays already provide the exact training targets. `code/merge_adapter.py` optionally merges these matrices into a downloaded BF16 base for deployment; quantization is a separate step.

## License, attribution and citation

- Release-owned adapter matrices, new scripts in `code/`, documentation and new metadata: **[CC BY 4.0](LICENSE)**. Attribute LAION / Project Alexandria contributors, link this model repository and identify your modifications.
- Bundled original Alexandria utilities and prompts in `vendor/` and `prompts/`: retain their **Apache 2.0** license and attribution; see [third-party notices](NOTICE) and [Apache text](LICENSES/Apache-2.0.txt). New release wrappers are CC BY 4.0.
- The Google base model and its tokenizer retain their own Apache 2.0 terms. The base model weights are obtained separately and are not redistributed here.
- Source documents and pre-existing datasets retain their own rights. This release licenses the contributions we can license; it does not relicense source-paper expression or guarantee downstream output clearance.

Please cite the [Alexandria paper](https://arxiv.org/abs/2502.19413v2), [base model](https://huggingface.co/google/gemma-4-12B-it) and this adapter repository. [Citation metadata](CITATION.cff) and [source-code provenance](provenance.json) are included.

## Release validation

The packaged trainer validates all native examples and supervision masks. CPU checks compare one source conversation from each training-data family with its original input IDs and labels, inspect every adapter tensor shape, and verify the synthetic HTTP inference-client and copying-audit path. The completed GPU evaluations establish the performance of the original weights. No new full training run was launched to test packaging. [Validation records](release_validation.json).

## Wording repair: measured results and deployment advice

The measured optimized summary figures below belong to the **Qwen-distilled rank128** adapter, not this adapter. Treat them as external reference results and repair suggestions; keep this model’s own evaluation above.

The targeted editor is [Gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it), BF16 with thinking disabled; “E4B” is the model identifier, not a measured 4-bit quantization setting. The tested repair chain contains TranslateGemma, Qwen local/full-field editing, and two Gemma local-edit stages. Direct Gemma-only repair is a proposed ablation whose complete throughput and QA have not been measured.

| 12B KU source profile | Raw QA | Final conservative-chain QA | Mean copied-word coverage >=6, raw → final | Narrative-only five-word passes |
| --- | ---: | ---: | ---: | ---: |
| 500 words | 88.0% | 88.0% | 10.889% → 0.413% | 11/20 |
| 1000 words | 84.5% | 84.5% | 9.810% → 0.551% | 12/20 |

Twenty frozen papers, 200 questions per condition; 44 comparison conditions and 8,800 QA slots in the complete search. Every question/paper slot is retained. Bibliographic metadata is reported separately; the historical all-factual-field audit passes only 2/20 and 4/20. **No tested pipeline achieves zero five-word-rule violations.** The repeated holdout search still needs independent validation.

For the Qwen-rank128 merged-FP8 **summary** deployment, one guarded TranslateGemma round changes QA from 94.23% to 93.30% on 97 papers / 970 MCQs and lowers copied-word coverage from 15.23% to 9.69%, but all 97 narratives still violate the strict rule. Back-translation alone is a cheap option for partial overlap reduction; it is not validated as sufficient for complete compliance. Optimized generation plus that translation/NLI stage is estimated at 72,488 / 114,454 GH200 GPU-hours for 38M / 60M summaries, assuming 85% useful capacity.

The corresponding direct-Gemma **cost scenarios** are 108,683 / 171,605 GPU-hours for summary generation plus repair, and 232,315 / 366,813 for 500-word KU generation plus repair. These totals borrow 3.1296 GPU-seconds per paper from Gemma’s residual KU edits after earlier repair stages. Summary application and direct repair from raw KUs are **unconfirmed optimistic proxies**, not measured complete repair costs, guaranteed budgets or zero-overlap estimates. Generation-only estimates are 69,820 / 110,241 for summaries and 193,451 / 305,449 for 500-word KUs, with the same capacity factor.

[Repair workflow and exact editor settings](repair/RECOMMENDATIONS.md), [full results](repair/RESULTS.md), [all scores](repair/metrics.json), [overlap evidence](repair/copy_overlap.json), [38M/60M compute assumptions](repair/SCALING.md), and [frozen protocol](repair/protocol.json) are included. Scan the complete source, edit only flagged fields, preserve graph references and numbers/formulas, use bidirectional meaning filters against the immutable original, bound retries, and retain unresolved failures. QA is never an acceptance filter.

[GitHub experiment and adapter inventory](https://github.com/LAION-AI/project-alexandria/tree/findings/ornith-dflash-97-20261003/experiments/scientific_summaries/backtranslation_repair_search_20261010).

## Related Gemma 12B adapters

- [Qwen27-Summaries-LoRA-r64](https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r64).
- [Qwen27-Summaries-LoRA-r128](https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r128).
- [Ornith9-Summaries-LoRA-r64](https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r64).
- [Ornith9-Summaries-LoRA-r128](https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Ornith9-Summaries-LoRA-r128).
- [Qwen27-Knowledge-Units-LoRA-r128](https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Qwen27-Knowledge-Units-LoRA-r128).
