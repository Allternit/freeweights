# MOSS Voice-Acting 4.55B — DPO LoRA (rank 64)

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
A **rank-64 DPO adapter** for
[`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft),
trained on **7,410,723 preference pairs** of synthetic voice-profile and real English/German
speech.

By **Christoph Schuhmann** and **LAION**.

A **full-parameter** DPO model trained on the same data and objective is published separately as
[`…-v2-sft-dpo`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft-dpo).
It is a different run, not a merge of this adapter, and it is the one used as the base for further
training.

> ### Do not call `merge_and_unload()` on this adapter
>
> The 12 `audio_lm_heads` are **weight-tied** to the audio embeddings — `tie_weights()` assigns
> `head.weight = embedding.weight`, the same tensor object — and this adapter targets those heads.
> Folding `W ← W + BA` therefore writes the head update into the embeddings as well:
>
> ```
> audio_lm_heads.0.weight          max|dW| = 6.103515625e-05    (the merge)
> audio_embeddings.0.weight        max|dW| = 6.103515625e-05    (same tensor)
> transformer.embed_tokens.weight  max|dW| = 0.0                (not a target, correct)
> ```
>
> The merged result loads, generates and sounds like speech, and is a **different function** from
> the adapter: on identical input the final hidden state differs with rms 0.107 against a signal
> rms of 2.518 — **4.3 %**. Keep the adapter unmerged.

> **This adapter composes with that SFT checkpoint and with nothing else.** It was trained against
> those exact weights and against the same prompt library (format hash `3d8a696ccec4a98f`).
> Applying it to the Apache-2.0 base model, or driving it with a different prompt surface, is not
> a supported configuration and will not reproduce anything measured here.

---

## What it does, and the honest state of it

In informal listening, **SFT + this adapter is the best of the three** (base, SFT, SFT+DPO) on
most prompts. Two faults remain and are being worked on in a follow-up round: vocal bursts that
run longer than they should, and occasional content that was never prompted.

**The loss-space picture disagrees with the listening picture, and both are reported.** DPO on
this preference set over-optimises: preference accuracy climbs while `reward(chosen)` — the
implicit reward on the *preferred* sequence — goes negative, meaning the policy is making the good
audio less likely too, only less so than the bad audio.

| step | val loss | pref acc | reward(chosen) | reward(rejected) |
|--:|--:|--:|--:|--:|
| 123 | 1.0601 | 0.8086 | −0.1107 | −7.2040 |
| **246 (shipped)** | **0.9054** | **0.9336** | **−0.3283** | **−12.4435** |
| 369 | 0.7871 | 0.9902 | −0.8465 | −17.1600 |
| 492 | 0.7476 | 0.9961 | −1.5908 | −21.6908 |
| 861 (final) | 0.7329 | 0.9941 | −2.3850 | −26.4160 |

**No checkpoint in this run reached `reward(chosen) ≥ 0.`** Step 246 is the least damaged and is
the one that was judged best by ear; shipping the final checkpoint — the default in most DPO
pipelines — would have shipped the worst one. Preference accuracy is *not* a health metric here:
it reached 0.994 exactly where the model was most degraded.

---

## Training

| | value |
|---|---|
| base | `laion/…-voice-acting-v2-sft` (the full fine-tune, all 4.13 B parameters trained) |
| rank / alpha / dropout | **64** / 128 / 0.05 |
| trainable | 137.4 M of 4.267 B = **3.22 %** |
| targets | `q,k,v,o,gate,up,down` across the 36-layer global stack, `c_attn,c_proj,fc_in,fc_out` in the local transformer, and all 12 `audio_lm_heads` |
| objective | DPO, **length-normalised**, β = **30**, chosen-NLL anchor weight **0.013** |
| peak LR | **1e-6**, cosine, 10 % warmup |
| epochs / steps | 1 / 988 (shipped checkpoint at step 246) |
| global batch | 2,048 pairs per optimizer step |
| hardware | 64 nodes × 4 GH200 = 256 GPUs |

### Preference data

| source | pairs | families |
|---|--:|---|
| [`laion/laion-voice-profiles-dpo`](https://huggingface.co/datasets/laion/laion-voice-profiles-dpo) | 3,451,531 | emotion, truncation, continuation |
| [`laion/tts-realspeech-dpo-en-de`](https://huggingface.co/datasets/laion/tts-realspeech-dpo-en-de) | 3,959,192 | truncation, continuation only |

The four length families (truncation / continuation on both corpora) are **6,349,129 pairs =
85.6 %** of the raw mix. They were downsampled to `length_keep = 0.16`, which keeps every one of
the 1,064,594 emotion pairs and raises emotion from 14.4 % to ≈51 % of what the model sees.

---

## Four things that went wrong first, and what each one cost

This is the part that is usually left out of a model card. Every configuration below was run and
measured before being abandoned.

**1 — The objective was decided by sequence length.** With an unnormalised summed log-probability,
preference accuracy hit **1.000 at step 102 of 1194**, 8.5 % into the run. That is not fast
learning; 85.6 % of pairs differ from the chosen sequence mainly in LENGTH, and a sum over a
different number of positions separates them by hundreds of nats before the model understands
anything. *Fix: divide by supervised positions.* **Check the composition of a preference set
before choosing the objective.**

**2 — The job died on a rank-divergent collective.** The heartbeat fired on
`now - last_hb >= 60`, evaluated independently on every rank against its own drifting clock.
Eventually one step landed with some ranks over the threshold and some under; the ones over called
an `all_gather` the others never reached, and NCCL aborted after 10 minutes. **Slurm reported the
array element `COMPLETED`.** *Fix: rank 0 decides, `broadcast` tells everyone.* **Never gate a
collective on per-rank wall-clock.**

**3 — The policy suppressed the good audio, not just the bad.** Length-normalised, β = 30, no
anchor: `reward(chosen)` rose to +0.652 and then went to **−0.830** while accuracy sat at 1.000.
Chosen and rejected are *different recordings*, and a 4 B model can always find something to
separate two recordings — including by making both less likely. *Fix: a chosen-NLL anchor (the
RPO / DPO+SFT form), plus an explicit health check on `reward(chosen)`, plus checkpoint selection
by that health rather than by recency.*

**4 — The anchor was 20× too strong, from a units mistake.** With `nll_weight = 0.25` the step-1
loss came out at **14.29** instead of ≈0.7. `sequence_logp` normalises by supervised POSITIONS and
each position carries **13 channels** (12 codebooks + the binary stop head), so `-logp ≈ 54 nats
per position`, not ≈4. *Fix: 0.013, which puts the anchor at ≈0.7 — the same scale as the DPO
term.* **Check a normalised quantity's measured magnitude before choosing its weight.**

---

## Usage

```python
import torch
from transformers import AutoProcessor, AutoModel
from peft import PeftModel

SFT  = "laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft"
LORA = "laion/moss-tts-local-transformer-4.55b-voice-acting-v2-dpo-lora"

proc = AutoProcessor.from_pretrained(SFT, trust_remote_code=True,
                                     codec_path="OpenMOSS-Team/MOSS-Audio-Tokenizer-v2")
model = AutoModel.from_pretrained(SFT, trust_remote_code=True,
                                  dtype=torch.bfloat16, attn_implementation="sdpa")
model = PeftModel.from_pretrained(model, LORA).cuda().eval()
# optional: model = model.merge_and_unload()   # fold the adapter in, drop the peft wrapper

msg = proc.build_user_message(
    text="[4.2 seconds duration] I really did not see that coming.",
    instruction="GENERAL: A young adult feminine voice; delivery is bright and quick; "
                "affect is positive, animated.\nSCRIPT:\n\"I really did not see that coming.\"",
    tokens=53, language="English")
batch = proc([[msg]], mode="generation")
out = model.generate(input_ids=batch["input_ids"].cuda(),
                     attention_mask=batch["attention_mask"].cuda(),
                     max_new_frames=400, do_sample=True,
                     audio_temperature=1.0, audio_top_p=0.95, audio_top_k=50)
wav = proc.decode(out)[0].audio_codes_list[0]      # 48 kHz
```

`tokens` is the target length in codec frames at **12.5 fps** — 4.2 s ≈ 53 frames.

### Prompt format

Identical to the SFT model's; see
[its card](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft#prompt-format)
for the full `<user_inst>` block and the training distribution of each field. In short: reference
audio or `Speaker: <name>` 50/50, one of four instruction surfaces, an optional
`[7.3 seconds duration]` prefix on the text (**spoken** duration, not clip duration), and
parenthesised burst cues that are dropped entirely on 10 % of samples.

---

## Limitations

- **English and German only.**
- **`reward(chosen) < 0` at every checkpoint.** The adapter improves preference discrimination at
  some cost to the likelihood of the preferred audio itself. This is a real, measured caveat, not
  a formality.
- **Chosen and rejected are different recordings**, not the same utterance rendered two ways, so
  part of what DPO can learn here is content preference rather than delivery preference.
- **Burst length is not yet controlled.** The training prompts named bursts (`(sigh)`) without
  stating how long they should be, and the model sometimes holds them far too long. A follow-up
  round adds explicit per-burst durations.
- **11.0 % duration-tag coverage on the emotion family.** Only 117,525 of 1,064,594 emotion pairs
  resolve against the SFT corpus, so 89 % of that family carried no duration tag.
- No MOS study, intelligibility benchmark or speaker-similarity re-measurement has been run.

## Intended use

Research on expressive and controllable speech synthesis. Not validated for, and should not be
used for, generating speech attributed to a real person without their consent.

---

## Licence and attribution

Released under **CC-BY-4.0** by **Christoph Schuhmann** and **LAION**.

Derived from `laion/moss-tts-local-transformer-4.55b-voice-acting-v2` (Apache-2.0), whose notice is
preserved. The MOSS-TTS architecture and the MOSS-Audio-Tokenizer-v2 codec originate with the
OpenMOSS team.

```bibtex
@misc{schuhmann2026mossva_dpo_lora,
  title  = {MOSS Voice-Acting 4.55B --- DPO LoRA (rank 64)},
  author = {Schuhmann, Christoph and {LAION}},
  year   = {2026},
  url    = {https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-dpo-lora},
  note   = {Rank-64 DPO adapter over the SFT checkpoint; 7.41M preference pairs; CC-BY-4.0}
}
```
