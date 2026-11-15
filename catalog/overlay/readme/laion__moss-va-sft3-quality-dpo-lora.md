# MOSS VA SFT3 — audio-quality DPO LoRA (rank 16)

<!-- moss-tied-heads-warning -->
## ⚠️ Do not merge this adapter into the base weights

`merge_and_unload()`, `merge_adapter()`, and any offline "bake the LoRA into the checkpoint"
script will **destroy the model irrecoverably**. This is not a performance caveat. Read this
before you write a deployment script.

### Why

This adapter targets `audio_lm_heads.0 … audio_lm_heads.11` and `text_lm_head` — **12 of its 23
target modules.** In this architecture those output heads are *weight-tied* to the input
embeddings: `tie_weights()` sets

```
audio_lm_heads[i].weight  IS  audio_embeddings[i].weight     # the same tensor, not a copy
text_lm_head.weight       IS  transformer.embed_tokens.weight
```

They are one allocation with two names. So when a merge adds `B @ A * (alpha/r)` into the head
weight, it writes that delta straight into the **embedding table** at the same time. The model
then reads its own inputs through a matrix that has been shifted by an output-side correction.
Generation does not fail loudly — it degrades into noise or into a fixed babble, and the damage
is inside the checkpoint you just saved. There is nothing to unmerge afterwards, because the
original values are gone.

### Verify it yourself in three lines

Do not take our word for it:

```python
m = base.model if hasattr(base, "model") else base
print(m.audio_lm_heads[0].weight.data_ptr() == m.audio_embeddings[0].weight.data_ptr())
# True  -> same storage, merging corrupts the embeddings
```

### What to do instead

Load with PEFT and **leave the adapter unmerged**. Set its strength through the scaling factor:

```python
from peft import PeftModel

model = PeftModel.from_pretrained(base, "<this repo>", adapter_name="a").to(dev).eval()
# do NOT call model.merge_and_unload()

def set_weight(model, name, w):
    """Scale one named adapter's contribution.  alpha/r is its own base scaling."""
    for module in model.modules():
        scaling = getattr(module, "scaling", None)
        if isinstance(scaling, dict) and name in scaling:
            if not hasattr(module, "_base_scaling"):
                module._base_scaling = {}
            module._base_scaling.setdefault(name, scaling[name])
            scaling[name] = module._base_scaling[name] * float(w)

set_weight(model, "a", 1.0)
model.base_model.set_adapter(["a"])      # several adapters can be active at once
```

**This sounds identical to a merge.** An unmerged LoRA computes `Wx + (B @ A)x * (alpha/r)`,
which is exactly what the merged weight `W + B @ A * (alpha/r)` would compute — the same
arithmetic, in a different order. You give up a small amount of inference speed and you keep the
ability to change the weight, stack several adapters, or turn one off. Nothing about the sound
changes.

### If you are stacking adapters

Set each one's scaling separately and activate them together with
`model.base_model.set_adapter([...])`. Note that stacking is not free: in our own measurements a
deep stack held audio quality but **destroyed intelligibility** (word error 0.063 → 0.554). Add
adapters deliberately and measure.

### If you maintain code that merges

A regex over module names is not enough — the reliable test is identity of storage. Group the
modules by `weight.data_ptr()` and refuse to merge into any group with more than one member.
`lora_bank.py` in `LAION-AI/Humaneness-Voice-Demo-Server` does this and asserts on the merge path.


---
Preference-trained to prefer cleaner recordings of the same performance.

**Read this first: in our own evaluation this adapter does not improve generated audio quality.**
Across 16 prompts, paired against the base model, the best checkpoint scores **+0.017 DNSMOS
(t +0.45)** — indistinguishable from no adapter — and the most heavily trained checkpoint is
**−0.119 (t −2.14)**, i.e. slightly worse. We publish it with the numbers rather than without
them; the null result is the finding.

## What it was trained to do, in plain language

We had 24,379 real recordings that were run through a speech enhancer (SIDON). For each one we
kept the pair *(enhanced take, original take)* — the same performance, the same speaker, the same
words, one cleaner than the other. Then we used Direct Preference Optimization to nudge the model
toward producing audio that looks like the cleaner half of each pair.

The point of pairing the *same* take against itself is that the model cannot learn "prefer a
different voice" or "prefer a calmer delivery" — those are held constant. The only thing that
varies is signal cleanliness.

Three guardrails decided which pairs were allowed in:

- the enhanced version had to score at least **+0.10 DNSMOS** better (mean gain +0.253, max +1.927);
- it had to stay closer to the same speaker than a same-voice baseline (mean cosine margin 0.490),
  so quality could not be bought by changing the voice;
- its emotion embedding had to stay close to the original, so the performance could not be ironed
  flat.

## Honest limitation of the data

All 24,379 pairs come from **one enhancer** (`enhanced_variant = raw_sidon`). A second arm using
voice conversion did not survive the gates. So this adapter learned one tool's notion of "clean",
not a general one.

## Results

DNSMOS is the right primary metric here because it is what **selected** the training data. If the
adapter learned the objective, generated audio should score higher. It does not.

16 prompts × 3 samples per checkpoint, all conditions generated from the same prompts under the
same seed, samples averaged within a prompt first, so n = 16 and the t is over prompts.

| checkpoint | DNSMOS | Δ vs base | t | WER | Δ WER | genuineness | Δ genu |
|---|---|---|---|---|---|---|---|
| base (no adapter) | 3.338 | — | — | 0.058 | — | 4.004 | — |
| step188 | 3.208 | −0.130 | −2.05 | 0.099 | +0.042 | 4.020 | +0.016 |
| **step376** ← repo root | **3.355** | **+0.017** | **+0.45** | 0.072 | +0.015 | 4.014 | +0.010 |
| step752 | 3.288 | −0.050 | −1.69 | 0.073 | +0.016 | 4.039 | +0.034 |
| step1128 | 3.306 | −0.032 | −0.85 | 0.078 | +0.020 | 4.081 | +0.077 |
| step1504 (final) | 3.219 | −0.119 | −2.14 | 0.081 | +0.024 | 4.202 | +0.197 |

With ten conditions tested at n = 16, |t| ≈ 2.1 is roughly what chance produces, so the two
apparently significant negatives should be read as "suspicious", not "established". The defensible
summary is: **no checkpoint is better than the base model, and the extremes look worse.**

One counter-signal worth naming: `step1504` has the highest genuineness of any condition
(+0.197, t +1.90) while having the worst DNSMOS. If that survives a listening test it would matter,
because genuineness is closer to what a voice-acting model is for than DNSMOS is. It has not been
listening-tested.

### Why the recommended checkpoint is an early one

The preference task is **solved by step 376**: accuracy hits 1.0000 and validation loss goes flat.
Everything after that inflates the margin without learning anything.

| step | pref. accuracy | val loss | reward(chosen) | reward(rejected) |
|---|---|---|---|---|
| 188 | 0.9903 | 0.8111 | +8.57 | +1.39 |
| **376** | 1.0000 | 0.7442 | +13.67 | +0.70 |
| 564 | 1.0000 | 0.7406 | +17.00 | +0.12 |
| 752 | 1.0000 | 0.7385 | +21.56 | −0.92 |
| 940 | 1.0000 | 0.7365 | +26.32 | −2.74 |
| 1128 | 1.0000 | 0.7354 | +28.81 | −4.03 |
| 1316 | 1.0000 | 0.7350 | +29.68 | −4.52 |
| 1504 | 1.0000 | 0.7349 | +29.91 | −4.70 |

`reward(chosen)` more than doubles from step 376 to the end at constant accuracy — about 1.0 nat
per token of drift away from the supervised reference model, for nothing.

**A warning for anyone selecting checkpoints by validation loss:** for DPO a lower validation loss
just means a larger margin, so that criterion prefers the most aggressive checkpoint *by
construction*. It is not a quality criterion. Every checkpoint here was preserved specifically
because the trainer's own pruning would have discarded the early ones.

## How it was trained

| | |
|---|---|
| base | [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3) |
| initialised from | [`laion/moss-va-sft3-rate-lora`](https://huggingface.co/laion/moss-va-sft3-rate-lora) (536 tensors, load asserted) — one rank-16 adapter carrying both stages rather than two that must be stacked |
| data | 24,379 preference pairs, chosen = SIDON-repaired take, rejected = the same raw take |
| objective | DPO, β 30, length-normalised, NLL anchor 0.013 (keeps the policy from suppressing the chosen sequences along with the rejected ones) |
| schedule | 2 epochs, 1,504 updates, lr 1e-6, 10 % warmup, 4 pairs per device × 4 GPUs |
| hardware | 4 GPUs, 1 h 25 min |

## Inference

⚠️ **Never merge this adapter into the base weights.** Its target modules include
`audio_lm_heads.0 … audio_lm_heads.11`, whose tensors share storage with
`audio_embeddings.N.weight` (weight tying). Merging corrupts the embedding table irrecoverably.

```python
import torch
from transformers import AutoConfig, AutoModel, AutoProcessor
from peft import PeftModel

BASE = "laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3"
dev = "cuda:0"

proc = AutoProcessor.from_pretrained(BASE, trust_remote_code=True)
proc.audio_tokenizer = proc.audio_tokenizer.to(dev).eval()
cfg = AutoConfig.from_pretrained(BASE, trust_remote_code=True)
base = AutoModel.from_pretrained(BASE, trust_remote_code=True,
                                 dtype=torch.bfloat16,
                                 attn_implementation="sdpa").to(dev).eval()

model = PeftModel.from_pretrained(base, "laion/moss-va-sft3-quality-dpo-lora",
                                  adapter_name="qual").to(dev).eval()
# do NOT call model.merge_and_unload()

batch = proc([[{"role": "user", "content": prompt, "audio_codes_list": []}]],
             mode="generation")
out = model.generate(input_ids=batch["input_ids"].to(dev),
                     attention_mask=batch["attention_mask"].to(dev).to(torch.bool),
                     max_new_tokens=340, do_sample=True,
                     temperature=1.0, top_p=0.95, top_k=50)
```

Pick a different checkpoint with `subfolder`:

```python
model = PeftModel.from_pretrained(base, "laion/moss-va-sft3-quality-dpo-lora",
                                  subfolder="checkpoints/step1504",
                                  adapter_name="qual")
```

Adapter strength (base scaling is α/r = 32/16 = 2.0; all measurements used w = 1.0):

```python
for module in model.modules():
    scaling = getattr(module, "scaling", None)
    if isinstance(scaling, dict) and "qual" in scaling:
        module.scaling["qual"] = 2.0 * w
```

## Prompt format

Trained under prompt format hash `090c4ca315519a57` (inherited from the rate stage). A
duration-only script is byte-identical to the project's standard `073aeb09dc923376`, so ordinary
prompts work unchanged.

## Checkpoints

`checkpoints/step{188,376,752,1128,1504}` — exactly the five that were evaluated above. Nothing is
published here without numbers. The root copy is `step376`.

## Related

- Base model: [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3)
- Initialised from: [`laion/moss-va-sft3-rate-lora`](https://huggingface.co/laion/moss-va-sft3-rate-lora)
- Sibling trained on a 75/25 quality+speed mix: [`laion/moss-va-sft3-quality-speed-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-quality-speed-dpo-lora)
- General-purpose DPO adapter: [`laion/moss-va-sft3-dpo-lora-p2`](https://huggingface.co/laion/moss-va-sft3-dpo-lora-p2)
