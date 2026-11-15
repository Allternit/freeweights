# Project Alexandria — Gemma 4 12B IT: Knowledge Units, LoRA rank 128

This is a **LoRA adapter**, released on 10 October 2026. Load it on the pinned [Gemma 4 12B IT base model](https://huggingface.co/google/gemma-4-12B-it); it contains learned adapter matrices rather than a standalone copy of Gemma.

## Why extract scientific knowledge?

Research papers contain findings, experimental conditions, quantities and relationships that agents can use for retrieval, question answering and synthesis. Project Alexandria aims to make that factual knowledge reusable through representations that reduce dependence on the original prose. A Knowledge Unit describes entities, attributes and relationships; a scientific summary offers an organized account of a paper.

The motivation is introduced in [Project Alexandria: Towards Freeing Scientific Knowledge from Copyright Burdens via LLMs](https://arxiv.org/abs/2502.19413v2). The paper proposes knowledge-preserving, style-agnostic representations and examines their reuse. An agent can retrieve relevant KUs, answer a question from their facts and follow a source identifier for verification. Distillation trains a smaller extractor to imitate a larger teacher, reducing the cost of creating these representations.

For example, an illustrative KU can describe an intervention, its dose, the measured effect, the population and the uncertainty as separate fields. This helps an agent distinguish a measured result from an interpretation. These adapters learn the extraction task; they do not provide a database of all scientific knowledge.

The technical goal is to preserve scientific information while reducing reproduction of source expression. **This release does not certify that its outputs are copyright-free.** Our literal-copy audits still find substantial overlap. Source access, source terms, attribution and output review remain relevant. QA accuracy measures usefulness for answering questions; it does not establish legal clearance or complete factual correctness.

## Model and training provenance

- Base: [google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it), revision `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`.
- Teacher: [Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8), revision `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a`.
- Task: generator-only knowledge units; no quality-review or correction adapter was trained.
- Training: **391 examples from 97 papers**, one epoch, 49 optimizer updates.
- LoRA: rank 128, alpha 256, dropout 0.05; language-layer q/k/v/o attention and gate/up/down MLP projections.
- Optimizer: AdamW, learning rate 2e-5, weight decay 0.01, 5% warmup then cosine decay; BF16 base, gradient checkpointing, flex attention and assistant-token-weighted cut cross entropy.
- Effective batch: eight; source/prompt tokens are masked from the loss; no source or target truncation.
- See [training configuration](training_config.json), [native data manifest](training/manifest.json) and [weight/code provenance](provenance.json).

The teacher processed the 97-paper cohort sequentially with at most **1,000 source words per call**, conditioning naming on the previous ten KUs. The teacher thinking mode was disabled, so these targets contain **no reasoning supervision**. The adapter was then evaluated on **20 different papers**, with 200 questions frozen before context generation. It was applied to both 1,000-word and 500-word extraction without retraining. The 97 training papers are not an adapter test set.

## Evaluation: retained knowledge

A separate, fixed **Qwen2.5-7B-Instruct** answerer receives the generated representation and answers four-choice questions. The generator never receives evaluation questions or gold labels. Each paper contributes ten questions. Failed paper generations count as ten wrong answers; invalid responses remain in the denominator. Confidence intervals use 10,000 paired paper-bootstrap draws.

### Matched 20-paper / 200-question follow-up

| Context | Correct / 200 | QA accuracy | 95% interval | Invalid slots |
| --- | ---: | ---: | --- | ---: |
| No source context | 89 | 44.50% | 40.50–49.00% | 5 |
| Complete original papers | 182 | 91.00% | 87.50–94.50% | 0 |
| Qwen27 teacher, 1,000-word KUs | 176 | 88.00% | 85.00–91.50% | 0 |
| Qwen27 teacher, 500-word KUs | 179 | 89.50% | 87.00–92.00% | 0 |
| Untrained Gemma12, 1,000-word KUs | 127 | 63.50% | 54.00–71.50% | 10 |
| Untrained Gemma12, 500-word KUs | 150 | 75.00% | 64.50–84.00% | 10 |
| This adapter, 1,000-word KUs | 170 | 85.00% | 80.50–89.00% | 0 |
| This adapter, 500-word KUs | 177 | 88.50% | 84.00–92.00% | 0 |

This adapter reaches **88.50%** with 500-word chunks and **85.00%** with 1,000-word chunks. The +3.5-point chunk difference has a paired 95% interval of **−1.0 to +8.0 points**. The small cohort does not establish a reliable advantage of 500-word extraction. All 18 context conditions were freshly judged in the follow-up, with unchanged cached contexts preserved. Questions were teacher-authored and source-validated automatically, rather than independently curated by humans.

The complete follow-up used four GH200 GPUs for 1,078 allocation seconds: **1.1978 reserved GPU-hours**, including server startup, four Gemma extraction variants, all 3,600 QA slots and copying audits. This is an experimental allocation cost, not a production rate.

## Copy-overlap audit

Every evaluated output is audited against its complete, untruncated source. The primary rule allows at most five normalized consecutive whitespace words; six is borderline and seven or more is flagged. Narrative fields, evidence quotes and bibliographic metadata are tracked separately; a punctuation-split diagnostic is also retained. This numerical heuristic is a technical diagnostic, not a legal test.

| Condition | Audited outputs | Narrative ≤5 | Six only | Narrative ≥7 | Longest copied run | Mean coverage in runs ≥6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| This adapter, 1,000 words | 20 | 0 | 0 | 20 | 37 words | 11.18% |
| This adapter, 500 words | 20 | 0 | 0 | 20 | 35 words | 13.47% |

**No evaluated output from this adapter passes the strict five-word narrative rule under these recipes.** No back-translation or semantic correction is applied in the primary scores. Raw QA performance and copying compliance are reported independently. The inference script performs the same audit automatically and retains failures and partial outputs.

[Full English evaluation report](https://github.com/LAION-AI/project-alexandria/blob/findings/ornith-dflash-97-20261003/experiments/scientific_summaries/gemma_ku_distillation_20261009/ku500_followup_20261010/README.md)
and local [machine-readable metrics](evaluation/metrics.json), [copy audit](evaluation/copy_overlap.json).

## Two chunk sizes, one trained adapter

The [500-word profile](profiles/ku500.json) and [1,000-word profile](profiles/ku1000.json) use **the same rank-128 weights, trained with 1,000-word teacher chunks**. Set `--chunk-words 500` or `--chunk-words 1000` in the inference CLI below. These are two inference configurations, not two independently trained adapters.

The matching [Gemma 4 E4B KU adapter](https://huggingface.co/laion/Alexandria-Gemma-4-E4B-it-Qwen27-Knowledge-Units-LoRA-r128) has its own weights and both chunk-size evaluations.

## Quick start: inference

Download this repository and install the inference environment separately from the training environment. All commands below run from the downloaded repository directory. A CUDA installation compatible with your vLLM build is required.

```bash
hf download laion/Alexandria-Gemma-4-12B-it-Qwen27-Knowledge-Units-LoRA-r128 --local-dir adapter-release
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
  --max-model-len 32768 --max-num-batched-tokens 8192 \
  --enable-prefix-caching --enable-chunked-prefill
```

In another terminal, use the same environment:

```bash
python code/infer.py --text-file paper.txt --task ku \
  --model alexandria --output outputs --chunk-words 500
# Batch input: one JSON object per line with document_id, text, optional title.
python code/infer.py --input papers.jsonl --task ku \
  --model alexandria --concurrency 16 --output outputs-batch --chunk-words 1000
```

Each document receives an output directory with complete call traces, the result, failure flags and the full-source copying audit. Chunks within a paper remain sequential; concurrent papers are batched by vLLM. KU generation disables thinking and allows one 16,384-token format retry after an 8,192-token attempt. Summary generation allows three bounded 24,576-token format attempts. Removing `--thinking` enables direct summary generation. Portable examples retain the benchmark prompts and budgets; hardware, scheduler ordering and library differences can change sampled outputs. They do not claim byte-identical regeneration of the archived benchmark.

## Reproduce training

The included compressed JSONL preserves the native tokenizer input IDs, assistant-only labels and original row order used for the completed run. Its uncompressed SHA256 is in the manifest. These token arrays encode source text and targets; they are reconstructable, so they are not privacy-preserving or irreversible fingerprints. Source-paper rights still apply.

```bash
python -m venv .venv-train
. .venv-train/bin/activate
python -m pip install -r requirements-training.txt
python code/train.py --output reproduced --dry-run
python code/train.py --output reproduced
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

## Knowledge Units after guarded back-translation

[Read five complete papers and compare model/chunk views](https://projects.laion.ai/project-alexandria/ku-examples/) · [Saved factual examples](examples/README.md) · [PDF evaluation](https://projects.laion.ai/project-alexandria/ku-examples/evaluation.pdf).

An additional matched study reused the same frozen 20 papers / 200 MCQs and freshly judged all 18 raw/reference contexts plus ten guarded KU contexts. The adapter weights and original extractions are unchanged. Copied context-summary/descriptive-attribute passages receive up to two TranslateGemma 4B English → German → English round-trips; graph names, IDs, targets and metadata are preserved. Repairs are accepted before QA using critical-value signatures, bidirectional NLI ≥0.9 and a five-word copy limit inside each candidate window.

| Source chunk | Fresh raw QA | Guarded BT QA | Paired change | 95% interval |
| --- | ---: | ---: | ---: | --- |
| 500 words | 89.00% (178/200) | 88.50% (177/200) | -0.50 pp | -1.50 to +0.00 pp |
| 1,000 words | 84.50% (169/200) | 84.00% (168/200) | -0.50 pp | -2.00 to +1.00 pp |

These fresh stochastic QA scores are distinct from the earlier 20-paper results above. Failed generations retain their full wrong/invalid slots. No output is regenerated or selected using QA. Both comparisons have paired intervals including zero. Guarded document-level number/unit/formula checks record zero retained critical-value flags, but substantial literal overlap remains; the whole-output five-word rule is not completely met. The paper/graph/source references and missing author/style/lookahead annotations remain inspectable in the reader.

[All new QA, fidelity and timing metrics](evaluation/ku_backtranslation_20261010/metrics.json), [copy audit](evaluation/ku_backtranslation_20261010/copy_overlap.json), [separate bibliographic copy diagnostic](evaluation/ku_backtranslation_20261010/bibliographic_copy_diagnostic.json) and [tested repair/evaluation code](backtranslation_pipeline/code/ku_pipeline.py) are included. The repair bundle needs its own runtime models/local source arrays as described by the linked experiment; training and ordinary adapter inference use the existing code above.

[Full experiment documentation](https://github.com/LAION-AI/project-alexandria/tree/findings/ornith-dflash-97-20261003/experiments/scientific_summaries/ku_backtranslation_20_20261010).

## Wording repair: measured results and deployment advice

### Both KU chunk profiles are available

Use [500 source words](profiles/ku500.json) or [1000 source words](profiles/ku1000.json) with the same trained rank128 adapter. Training used 1000-word teacher chunks; these are two evaluated inference configurations, not two separately trained adapters.

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
