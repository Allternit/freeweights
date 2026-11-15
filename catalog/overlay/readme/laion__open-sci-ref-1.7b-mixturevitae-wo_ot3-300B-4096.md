# MixtureVitae v1 with only OpenThoughts3 removed, 1.7B / 300B tokens, 4096 ctx

Base model (4k). Matches the paper's main MV-300BT training scale.

## Why this model exists

Rebuttal experiment for the NeurIPS 2026 submission *Strong Post-Training from Permissive,
Reasoning-Dominant, Web-Scale Pretraining*, extending the 100B `wo_ot3` ablation
(`laion/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096`) to the paper's main 300B scale,
to test whether OpenThoughts3 is critical for reasoning-boosting post-training at the scale
actually used in the paper (rather than only at the smaller 100B ablation budget).

## Data

MixtureVitae v1 (decontaminated), **93 of 96 shards** -- drops `open_thoughts-0/1/2`
(18.69B tokens, 4.53% of MV). Weights proportional to shard size, so every kept shard
retains its natural share: this is plain MV minus OT3, not a reweighted mixture.
393.92B tokens available; 300B consumed (0.76 epochs, no repetition).

## Pretraining

1.7B dense, `open-sci-ref` architecture, GPT-NeoX tokenizer (vocab 50304, uint16).
300B tokens, 71,526 iters, seq len 4096, RoPE theta 100k, WSD schedule, lr 4e-3,
20% linear cooldown, global batch 1024, **warmup 25000** (the 300B convention -- NOT
the 1000 used at the 100B ablation scale). 64 nodes x 4 GH200.

Training config is a byte-identical schedule copy of the config that produced
`ontocord/1.7b-MixtureVitae-300BT-v1-decontaminated` (MV-300BT, the paper's main model),
so `wo_ot3-300BT` vs `MV-300BT` is a controlled pair differing only in the OT3 removal.

> Note: not labelled `v0.02` -- the published open-sci-ref v0.02 recipe uses global batch
> 1008 and exists only as a release-metadata record; this run matches the actual JUPITER
> rerun of MV-300BT used throughout this study (global batch 1024).

## Two fixes applied to the released files

- **`modeling_opensci.py`**: `OpensciModel.forward` accepts `**kwargs`. Recent `transformers`
  passes `num_items_in_batch` from Trainer for loss averaging, and `OpensciForCausalLM.forward`
  forwards `**kwargs` into both `self.model(...)` and `self.loss_function(...)`. Without this,
  post-training raises `TypeError: unexpected keyword argument 'num_items_in_batch'`.
- **`config.json`**: `max_position_embeddings` cast to `int`. YaRN writes it as a float
  (`16384.0`), and lm-eval uses it as a slice index -> `TypeError: slice indices must be
  integers`. Affects the 16k variant.

## Caveat

This blend is built from per-shard files tokenized with `--append-eod`, whereas the MV-300BT
reference (`merged_0`) has NO EOD tokens (verified by probing both token streams). Unavoidable
-- `merged_0` is a single pre-merged `.bin` so OT3 cannot be removed from it -- but the pair
therefore differs by a document-separator token as well as by the OT3 removal.

## Language evaluation (open-sci-0.01 suite, lm-eval-harness, 11-task paper convention)

| model | 11-task mean |
|---|---|
| wo_ot3-300BT (this model) | 56.44 |
| MV-300BT (full mixture, paper) | 55.49 |

Removing OT3 leaves general language ability intact at 300B (+0.95 mean), consistent with
the same result at 100B (wo_ot3-100BT 50.77 vs MV-100BT 50.27, +0.50) -- the base model is
unaffected, so any Phase-2 post-training difference is attributable to the OT3 pretrain/
post-train overlap rather than to lost general capability.

Reasoning suite (partial -- oellm-cli's `reasoning` task group covers 6 of the paper's 11
reasoning benchmarks; the other 3 route through evalchemy and hit a container-mode
limitation): GSM8K 49.4 (exact-match), MBPP 36.0 (pass@1).

