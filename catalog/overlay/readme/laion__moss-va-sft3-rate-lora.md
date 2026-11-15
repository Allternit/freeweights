# MOSS VA SFT3 — speaking-rate LoRA (rank 16)

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
**Read this first: this adapter does not do what it was built to do.** It was trained to make the
model obey an explicit speaking-rate instruction in the prompt. Measured against the base model in
400 paired trials across two designs, it changes the speaking rate by **nothing measurable**. It is
published because the measurement is the useful part, and because it is the initialisation of the
two quality adapters that build on it.

It is **harmless** — word error rate and duration accuracy are unchanged — but it is not a rate
control and should not be described as one.

## What was supposed to happen, in plain language

A text-to-speech model normally decides for itself how fast to talk. We wanted to be able to say
"say this line at 26 characters per second" and have it comply, so an agent could direct pacing the
way a director does.

To teach that, we took 121,940 real recordings and, for each one, wrote the speaking rate of the
actual recording into the prompt. A third of the rows say the duration ("3.3 seconds"), a third say
the rate ("20.0 characters per second"), a third say both. Then we trained a small adapter — 34.4
million extra weights on top of a frozen 4.55-billion-parameter model — to predict the audio given
that prompt.

## Why it could not have worked

The rate in every training row was **computed from the duration**: `rate = characters / duration`,
where both the characters and the duration are already printed in the prompt. So the rate tag never
carried information the prompt did not already contain. The model had no reason to learn to read it
— the answer was always available somewhere else.

Worse, the prompt envelope also carries a `Tokens:` budget that fixes the total length directly.
That budget, not the tag, is what actually controls timing — and the base model already obeys it.

## The measurements

Base = `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`. 8 texts × 5 requested rates ×
3 samples, paired within cell on a shared seed. "Tempo" is characters per **voiced** second (silence
excluded); "slope" is achieved tempo regressed on requested tempo, where 1.0 would be perfect
obedience and 0.0 would be total indifference.

### Design A — the budget moves with the request (the natural way to ask)

| tag mode | model | slope | ±se | tempo @14 | tempo @26 | WER |
|---|---|---|---|---|---|---|
| duration only | base | 0.659 | 0.072 | 17.6 | 25.8 | 0.074 |
| duration only | **+ this adapter** | 0.589 | 0.083 | 18.1 | 25.4 | 0.071 |
| rate only | base | 0.664 | 0.066 | 17.6 | 26.4 | 0.049 |
| rate only | **+ this adapter** | 0.656 | 0.075 | 18.0 | 26.4 | 0.049 |
| both | base | 0.774 | 0.072 | 16.3 | 25.8 | 0.067 |
| both | **+ this adapter** | 0.778 | 0.066 | 18.1 | 27.7 | 0.067 |

The base model tracks the request just as well as the adapter — **and it has never seen a rate
tag.** It is responding to the length budget, which moves with the request in all three modes.
Interaction term (adapter's gain in `rate` mode beyond its gain in `duration` mode): **−0.09**.

### Design B — the budget is pinned, only the tag varies (the decisive test)

| tag mode | model | slope | ±se | tempo @14 | tempo @26 |
|---|---|---|---|---|---|
| rate only | base | 0.008 | 0.069 | 18.5 | 18.3 |
| rate only | **+ this adapter** | −0.034 | 0.069 | 18.4 | 18.1 |
| both | base | 0.104 | 0.066 | 17.9 | 18.4 |
| both | **+ this adapter** | −0.006 | 0.055 | 17.3 | 17.7 |

**All four slopes are zero.** Told 14 or told 26, the model speaks at 18.

### What *is* controllable

1. **Total duration: fully.** Median error 0.000 s in 13 of 14 conditions of a separate 1,596-clip
   study, regression slope 0.979. This works through the `Tokens:` budget and needs no adapter.
2. **Tempo: only indirectly.** A tighter budget forces faster speech, but there is a **floor around
   18 characters per voiced second** — below it the model does not slow down, it pads with silence.
3. **The rate tag: inert.**

### Audio quality (16 prompts, paired vs base)

| DNSMOS | SIG | BAK | WER | genuineness |
|---|---|---|---|---|
| −0.054 (t −1.55) | −0.047 | −0.036 | +0.028 | −0.047 |

No significant change on anything.

## How it was trained

| | |
|---|---|
| base | [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3) |
| data | 121,940 voice-profile recordings, rate modes in equal thirds (40,835 / 40,609 / 40,496) |
| corpus rate | median 20.7 characters per second, p10 16.2, p90 27.4; 1.30 rate segments per clip |
| adapter | LoRA rank 16, α 32, dropout 0.05, 34.4 M of 4.164 B trainable (0.825 %) |
| schedule | 1 epoch, 3,788 updates, lr 1e-4 cosine to 0.1×, 50 % warmup, weight decay 0.1, global batch 32 |
| hardware | 4 GPUs, 1 h 47 min |
| val loss | 3.8225 → 3.8227 → 3.8216 → **3.8200** over the four evaluation points |

**The validation loss is not a quality signal here** and should not be read as one. It runs over
every audio token of a clip, and a rate tag moves almost none of that distribution; the total
movement across the whole run is 0.0025 at n = 116. This is exactly why the behavioural test above
exists.

## Prompt format

This adapter was trained on prompt format hash **`090c4ca315519a57`**, not the project's usual
`073aeb09dc923376`. A duration-only row is byte-identical between the two; the rate forms are new.

```
[3.3 seconds duration]                              # identical to the standard format
[20.0 characters per second]                        # replaces the duration tag
[3.3 seconds duration; 20.0 characters per second]  # both
```

## Inference

⚠️ **Never merge this adapter into the base weights.** Its target modules include
`audio_lm_heads.0 … audio_lm_heads.11`, and those tensors share storage with
`audio_embeddings.N.weight` (they are weight-tied). Merging writes the head delta into the
embedding table and destroys generation irrecoverably. Load with PEFT and leave it unmerged.

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

model = PeftModel.from_pretrained(base, "laion/moss-va-sft3-rate-lora",
                                  adapter_name="rate").to(dev).eval()
# do NOT call model.merge_and_unload()

batch = proc([[{"role": "user", "content": prompt, "audio_codes_list": []}]],
             mode="generation")
ids = batch["input_ids"].to(dev)
msk = batch["attention_mask"].to(dev).to(torch.bool)
out = model.generate(input_ids=ids, attention_mask=msk,
                     max_new_tokens=340, do_sample=True,
                     temperature=1.0, top_p=0.95, top_k=50)
```

Decode the returned audio codes with the processor's audio tokenizer as for the base model.

### Setting the adapter strength

```python
for module in model.modules():
    scaling = getattr(module, "scaling", None)
    if isinstance(scaling, dict) and "rate" in scaling:
        module.scaling["rate"] = 2.0 * w   # base scaling is alpha/r = 32/16 = 2.0
```

All measurements above used `w = 1.0`.

## Checkpoints

`checkpoints/step3788` is the final state and the copy at the repository root. Earlier checkpoints
(947, 1894, 2841) exist but were not evaluated, and nothing is published here without numbers.

## Related

- Base model: [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3)
- Quality DPO on top of this: [`laion/moss-va-sft3-quality-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-quality-dpo-lora)
- Quality + speed DPO on top of this: [`laion/moss-va-sft3-quality-speed-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-quality-speed-dpo-lora)
- The project's general-purpose DPO adapter: [`laion/moss-va-sft3-dpo-lora-p2`](https://huggingface.co/laion/moss-va-sft3-dpo-lora-p2)

## What a second attempt should do

Train on audio where the rate varies **independently of the natural duration**: the same text, a
generous fixed length budget, differently time-stretched audio, and the tag naming the stretched
rate. Only then does the tag predict something the rest of the prompt does not.
