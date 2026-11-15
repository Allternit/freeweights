# Nemotron-CC-2024 HQ (real+synthetic), 1.7B / 100B tokens, 4096 ctx

Base model. No reasoning enrichment — the *no front-loading* / non-permissive-web cell.

## Context

Part of a 2x2 study for the NeurIPS 2026 submission *Strong Post-Training from Permissive,
Reasoning-Dominant, Web-Scale Pretraining* (rebuttal experiments), isolating **web corpus**
from **reasoning enrichment**:

|                  | reasoning front-loaded | no front-loading |
|------------------|------------------------|------------------|
| **MV web**       | MV-100BT               | MV-noinstruct    |
| **Nemotron web** | nemotron-hq-mv_reasoning-100B | nemotron-hq-100B |

The clean, unconfounded contrast is **nemotron-hq-mv_reasoning-100B vs nemotron-hq-100B**:
same web substrate, same recipe, same tokenizer, same EOD convention — the only difference
is the presence of the reasoning/instruct data.

> **Framing note.** MixtureVitae's reasoning subset is itself permissively licensed, so the
> `mv_reasoning` model is a *web-substrate swap* (non-permissive web + permissive reasoning),
> **not** a fully non-permissive corpus. Please describe it as
> "Nemotron-CC web + MV reasoning subset".

## Pretraining

- 1.7B dense, `open-sci-ref` protocol, GPT-NeoX tokenizer (vocab 50304, uint16)
- 100B tokens, 23,842 iters, seq len 4096, RoPE theta 100k
- WSD schedule, lr 4e-3, 20% linear cooldown, global batch 1024
- 64 nodes x 4 GH200

## Note on `modeling_opensci.py`

Patched so `OpensciModel.forward` accepts `**kwargs`. Recent `transformers` passes
`num_items_in_batch` down from Trainer for correct loss averaging, and
`OpensciForCausalLM.forward` forwards `**kwargs` into both `self.model(...)` and
`self.loss_function(...)`. Without the patch training fails with
`TypeError: OpensciModel.forward() got an unexpected keyword argument 'num_items_in_batch'`.
Loss behaviour is unchanged.

