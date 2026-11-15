# MOSS VA SFT3 — quality + speed DPO LoRA, 75/25 (rank 16)

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
The sibling of [`laion/moss-va-sft3-quality-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-quality-dpo-lora):
the identical recipe on a corpus that is 75 % audio-quality pairs and 25 % speaking-speed pairs.
Because the two runs differ in exactly one variable, the difference between them is attributable to
the speed arm.

**Read this first: like its sibling, this adapter does not improve generated audio quality in our
evaluation.** Best checkpoint **+0.011 DNSMOS (t +0.26)** against the base model — no effect. What
it *does* show is an unintended and fairly striking training-dynamics result, described below.

## What it was trained on, in plain language

**75 % — quality pairs (24,379).** The same recording twice: once cleaned by a speech enhancer,
once raw. The model is nudged toward the cleaner one. Because both halves are the same take, it
cannot learn "prefer a different voice" — only "prefer a cleaner signal".

**25 % — speed pairs (8,126).** The same recording twice: once at its natural speed, once
time-stretched. The model is nudged toward the natural one. The sample is forced to **50/50
faster/slower** even though the source is 59/41, because a pacing preference should be symmetric,
and it is stratified by stretch magnitude so mild and extreme stretches both survive the cut.

The ratio lives in the data rather than in the sampler: the trainer's balancing mode alternates its
two pools strictly 50/50 and has no ratio knob, so 75/25 had to be written into the corpus.

## The speed arm was already solved before training began

At the very first optimizer step, with the learning rate at 5e-9 and nothing yet learned, the speed
pairs were already classified correctly **100 %** of the time while the quality pairs sat near
chance. A preference decided by sequence length is not a task; it is a constant. Over the last 60
logged batches both families are at 1.000 (n = 118 and n = 362).

So the 25 % is dilution of the quality gradient — by design and confirmed by measurement.

## The unintended finding: the mix drifts half as far

`reward(chosen)` measures how far the trained policy has moved from the supervised reference model.
At matched fractions of each run:

| fraction of run | quality-only sibling | this 75/25 mix |
|---|---|---|
| 1/8 | +8.6 | +5.5 |
| 1/4 | +13.7 | +8.0 |
| 1/2 | +21.6 | +10.8 |
| 3/4 | +28.8 | +11.7 |
| end | **+29.9** | **+12.3** |

Both end at preference accuracy 1.0000 with `reward(rejected)` negative. The quality-only run more
than doubles its margin over the second half; **this one stops moving after step 980.**

The mechanism is simple once stated: pairs that are already solved contribute no gradient but still
enter the length-normalised average, so an arm that is trivially correct acts as a **brake on
margin inflation**, not merely as a slower path to the same place. If you are worried about DPO
over-optimisation, a deliberately easy auxiliary arm is a cheap regulariser.

Whether the gentler adapter *sounds* better is untested. This is a statement about how far the
policy moved, not about audio.

## Results

16 prompts × 3 samples per checkpoint, all conditions from the same prompts under the same seed,
samples averaged within a prompt first (n = 16, t over prompts). DNSMOS is the primary metric
because it is what selected the quality training pairs.

| checkpoint | DNSMOS | Δ vs base | t | WER | Δ WER | genuineness | Δ genu |
|---|---|---|---|---|---|---|---|
| base (no adapter) | 3.338 | — | — | 0.058 | — | 4.004 | — |
| **step245** ← repo root | **3.349** | **+0.011** | **+0.26** | 0.064 | +0.006 | 3.990 | −0.014 |
| step735 | 3.290 | −0.048 | −1.25 | 0.080 | +0.023 | 3.860 | −0.144 |
| step1225 | 3.308 | −0.030 | −0.84 | 0.059 | +0.001 | 3.987 | −0.018 |
| step1962 (final) | 3.314 | −0.024 | −0.86 | 0.082 | +0.024 | 3.929 | −0.075 |

Nothing here is significant in either direction. `step1225` is notable only for leaving word error
rate essentially untouched (+0.001).

For comparison, the quality-only sibling's best was +0.017 (t +0.45) and its worst −0.130
(t −2.05). **Neither adapter beats the base model on DNSMOS.**

## How it was trained

| | |
|---|---|
| base | [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3) |
| initialised from | [`laion/moss-va-sft3-rate-lora`](https://huggingface.co/laion/moss-va-sft3-rate-lora) (536 tensors, load asserted) |
| data | 32,505 pairs: 24,379 quality (75.0 %) + 8,126 speed (25.0 %) |
| quality gates | ≥ +0.10 DNSMOS gain (mean +0.253), speaker-cosine margin mean 0.490, emotion cosine preserved |
| speed sample | forced 50/50 faster/slower, stratified by stretch magnitude, selected by a hash of the clip id so it is reproducible |
| objective | DPO, β 30, length-normalised, NLL anchor 0.013 |
| schedule | 2 epochs, 1,962 updates, lr 1e-6, 10 % warmup, 4 pairs per device × 4 GPUs |
| hardware | 4 GPUs, 1 h 25 min |

**Limitation carried from the data:** all 24,379 quality pairs come from one enhancer
(`raw_sidon`); a voice-conversion arm did not survive the gates. One tool's notion of "clean".

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

model = PeftModel.from_pretrained(base, "laion/moss-va-sft3-quality-speed-dpo-lora",
                                  adapter_name="mix").to(dev).eval()
# do NOT call model.merge_and_unload()

batch = proc([[{"role": "user", "content": prompt, "audio_codes_list": []}]],
             mode="generation")
out = model.generate(input_ids=batch["input_ids"].to(dev),
                     attention_mask=batch["attention_mask"].to(dev).to(torch.bool),
                     max_new_tokens=340, do_sample=True,
                     temperature=1.0, top_p=0.95, top_k=50)
```

Another checkpoint:

```python
model = PeftModel.from_pretrained(base, "laion/moss-va-sft3-quality-speed-dpo-lora",
                                  subfolder="checkpoints/step1225", adapter_name="mix")
```

Adapter strength (base scaling is α/r = 32/16 = 2.0; all measurements used w = 1.0):

```python
for module in model.modules():
    scaling = getattr(module, "scaling", None)
    if isinstance(scaling, dict) and "mix" in scaling:
        module.scaling["mix"] = 2.0 * w
```

## Prompt format

Trained under prompt format hash `090c4ca315519a57` (inherited from the rate stage). A
duration-only script is byte-identical to the project's standard `073aeb09dc923376`, so ordinary
prompts work unchanged.

## Checkpoints

`checkpoints/step{245,735,1225,1962}` — exactly the four that were evaluated. Nothing is published
here without numbers. The root copy is `step245`.

## Related

- Base model: [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3)
- Initialised from: [`laion/moss-va-sft3-rate-lora`](https://huggingface.co/laion/moss-va-sft3-rate-lora)
- Quality-only sibling: [`laion/moss-va-sft3-quality-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-quality-dpo-lora)
- General-purpose DPO adapter: [`laion/moss-va-sft3-dpo-lora-p2`](https://huggingface.co/laion/moss-va-sft3-dpo-lora-p2)
