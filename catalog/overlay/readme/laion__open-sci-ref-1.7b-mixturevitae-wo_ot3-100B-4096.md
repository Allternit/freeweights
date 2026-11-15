# MixtureVitae v1 with only OpenThoughts3 removed, 1.7B / 100B tokens, 4096 ctx

Base model (4k).

## Why this model exists

Rebuttal experiment for the NeurIPS 2026 submission *Strong Post-Training from Permissive,
Reasoning-Dominant, Web-Scale Pretraining*, addressing reviewer oxw5:

> *"The OpenThoughts3 traces used in the Phase 2 reasoning stage were already present in MV
> pretraining, so the unique gain may reflect amplification of seen data rather than general
> receptivity, and the ablation removes the whole reasoning subset rather than that overlap."*

The published `MV-noinstruct` ablation removes MixtureVitae's **entire** instruction/reasoning
subset (175.1B tokens, 42% of the corpus), so it cannot isolate the OT3 pretrain/post-train
overlap. This model removes **only OpenThoughts3** — 18.69B tokens, 4.53% of MV — keeping
everything else, including the multilingual shards.

Intended comparison:

| base | Phase 2 | tests |
|---|---|---|
| MV (full) | OT3 30k | published result |
| **this model** | OT3 30k | is the gain OT3 re-exposure, or general reasoning receptivity? |

## Data

MixtureVitae v1 (decontaminated), **93 of 96 shards** — drops `open_thoughts-0/1/2`.
Weights proportional to shard size, so every kept shard retains its natural share: this is
plain MV minus OT3, not a reweighted mixture. 393.92B tokens available; 100B consumed.

Composition: 37 reasoning/instruct (of 40) + 48 non-reasoning + 8 multilingual shards,
all GPT-NeoX (uint16, vocab 50304).

## Pretraining

1.7B dense, `open-sci-ref` architecture, GPT-NeoX tokenizer. 100B tokens, 23,842 iters,
seq len 4096, RoPE theta 100k, WSD schedule, lr 4e-3, 20% linear cooldown, global batch 1024,
warmup 1000. 64 nodes x 4 GH200. Hyperparameters identical to the companion
`nemotron-hq[-mv_reasoning]-100B-4096` models and to `MV-100BT`, so all are comparable.

> Note: not labelled `v0.02` — the published open-sci-ref v0.02 recipe uses global batch 1008
> and warmup 25000, and exists only at 300B/1T budgets. This follows the project's 100B
> convention instead.

## Two fixes applied to the released files

- **`modeling_opensci.py`**: `OpensciModel.forward` accepts `**kwargs`. Recent `transformers`
  passes `num_items_in_batch` from Trainer for loss averaging, and `OpensciForCausalLM.forward`
  forwards `**kwargs` into both `self.model(...)` and `self.loss_function(...)`. Without this,
  training raises `TypeError: unexpected keyword argument 'num_items_in_batch'`.
- **`config.json`**: `max_position_embeddings` cast to `int`. YaRN writes it as a float
  (`16384.0`), and lm-eval uses it as a slice index -> `TypeError: slice indices must be
  integers`. Affects the 16k variant.

## Language evaluation (open-sci-0.01 suite, lm-eval-harness)

| task | wo_ot3 | MV-100BT (full) |
|---|---|---|
| MMLU | 31.93 | 32.47 |
| HellaSwag | 48.90 | 48.46 |
| ARC-C / ARC-E | 35.32 / 66.20 | 34.39 / 64.60 |
| PIQA | 68.12 | 68.44 |
| BoolQ | 67.43 | 70.86 |
| WinoGrande | 57.38 | 57.70 |
| OBQA | 35.20 | 33.80 |
| COPA | 68.00 | 67.00 |
| LAMBADA | 44.96 | 43.82 |
| CommonsenseQA | 35.05 | 31.45 |
| Social-IQA | 42.94 | 42.22 |
| **MEAN** | **50.12** | **49.60** |

Removing OT3 leaves general language ability intact (+0.52 mean, 8/12 tasks up). That is the
point: the base is unchanged, so any Phase-2 difference is attributable to the OT3 overlap
rather than to lost general capability. Contrast `MV-noinstruct`, which removes 42% of the
corpus and does degrade.

