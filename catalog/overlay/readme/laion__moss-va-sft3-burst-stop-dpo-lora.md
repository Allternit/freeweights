# MOSS VA SFT3 — vocal-burst realisation + stop/no-improvisation DPO LoRA (rank 16)

Teaches two things the model gets wrong: **realising the vocal burst that was actually asked for**
(a scream where a scream was written, not a laugh and not silence), and **stopping when the line is
finished** instead of mumbling on past it.

Unlike the earlier quality adapters in this line, this one is not a null result. On 317 held-out
preference pairs, pooled accuracy goes **0.707 → 0.943**, and every one of the eight task families
improves.

## ⚠️ Do not merge this adapter into the base weights

`merge_and_unload()`, `merge_adapter()`, or any offline "bake the LoRA into the checkpoint" script
will **destroy the model irrecoverably**.

This adapter targets `audio_lm_heads.0 … audio_lm_heads.11` and `text_lm_head` — 12 of its 23 target
modules. Those output heads are *weight-tied* to the input embeddings: `tie_weights()` makes
`audio_lm_heads[i].weight` and `audio_embeddings[i].weight` **the same tensor**, one allocation with
two names. A merge adds `B @ A · (α/r)` into the head and therefore writes the same delta into the
embedding table. The model then reads its own inputs through a matrix shifted by an output-side
correction. It does not fail loudly — it degrades into noise, inside the checkpoint you just saved,
with the original values gone.

Verify it yourself:

```python
m = base.model if hasattr(base, "model") else base
print(m.audio_lm_heads[0].weight.data_ptr() == m.audio_embeddings[0].weight.data_ptr())
# True -> same storage
```

Load with PEFT and leave it unmerged. This is **acoustically identical** to a merge: an unmerged
LoRA computes `Wx + (B @ A)x · (α/r)`, a merged one `(W + B @ A · (α/r))x` — the same arithmetic in
a different order. You give up a little inference speed and keep adjustable strength, stackability
and the ability to switch it off.

## What it was trained on, in plain language

**14,932 preference pairs.** Each pair is the same recording twice — one version the model should
prefer, one it should not — so it cannot learn "prefer a different voice" or "prefer a calmer
delivery". Four arms:

**Vocal bursts (30 %).** *Chosen* = the original clip with its burst intact. *Rejected*, in three
kinds:

| kind | share of the burst arm | what the negative is |
|---|---|---|
| **swap** | **39.5 %** | a **different burst class from the same speaker**, similar length — a laugh where a scream belongs |
| silence | 35.1 % | the burst replaced by silence, faded in and out so total duration is unchanged |
| excise | 25.4 % | the burst cut out entirely (duration shortens) |

The swap kind is the point. With silence-only negatives the model can cheat: it only has to detect
*whether* a burst is present, never *which* one. Making swap the largest kind forces it to identify
the class.

**Stopping (25 %).** Three ways of teaching the model to fall silent:
- **truncated prompt** — the script is cut a word or two early and the audio is cut and faded at the
  same point; *rejected* is the original, which keeps talking past the prompt.
- **two-sentence fade** — only the first sentence is in the prompt and the second is faded to
  silence in the chosen audio. **The stated duration is the FULL original length**, so the model
  learns to say the first sentence at its natural pace and then produce silence — not to stretch it
  across the whole budget. Verified: 410/410 renders have exactly one speech segment whose sum
  equals the full original duration.
- **appended noise** — *chosen* is the clean original; *rejected* has a random fragment from another
  take by the same speaker appended, so the negative is "kept going" rather than "was cut".

**Quality (25 %) and speed (20 %)** are carried over from the earlier corpora as controls, so the
run can show it is not damaging what already worked.

## Results

Scored **forward-only through every kept checkpoint on the same 317 held-out pairs** — one record
per pair per checkpoint, 5,706 records. That makes every comparison paired, with each pair its own
control, rather than a marginal accuracy on a few dozen pairs.

| task family | n | init | step112 | step336 | step616 | **step896** |
|---|---|---|---|---|---|---|
| **stop: two sentences** | 31 | **0.258** | 0.871 | 0.968 | 0.968 | **1.000** |
| stop: truncated | 31 | 0.613 | 0.935 | 1.000 | 1.000 | **1.000** |
| stop: appended noise | 22 | 0.636 | 0.955 | 1.000 | 1.000 | **1.000** |
| **burst: wrong class (swap)** | 32 | 0.625 | 0.688 | 0.719 | 0.781 | **0.844** |
| burst: replaced by silence | 27 | 0.407 | 0.481 | 0.667 | 0.815 | **0.815** |
| burst: excised | 24 | 0.458 | 0.583 | 0.625 | 0.542 | **0.667** |
| quality (control) | 95 | 0.979 | 0.979 | 1.000 | 0.979 | **1.000** |
| speed (control) | 55 | 0.873 | 0.945 | 0.964 | 1.000 | **1.000** |
| **pooled** | **317** | **0.707** | 0.855 | 0.905 | 0.918 | **0.943** |

### The single most important finding

**Improvising past the end of a line was not merely unlearned — it was learned backwards.** The
starting adapter scores **0.258** on the two-sentence stop task: 8 right, 23 wrong. It *actively
prefers* the take that keeps talking. After 112 steps it is at 0.871, and 1.000 by the end.

This would have been invisible in the pooled number: 31 pairs out of 317 moving from 0.258 to 1.000
shifts the pooled accuracy by 0.08, inside its own noise. Only the per-family paired scoring found
it.

### The two arms learn on completely different schedules

All three stop families are finished by step 280. `burst_silence` is still *below* its starting
value at step 224 (0.481 vs 0.407), first becomes significant at step 336, and peaks at step 784. A
checkpoint chosen on the stop arm alone would be chosen roughly 500 steps too early.

`burst_excise` is the family this corpus did **not** solve (0.458 → 0.667). By construction: it is
the only burst kind whose two sides differ in length, so it overlaps the speed-stretch task and the
model can decide it on duration instead of on the burst.

## Which checkpoint to use

**A range, not a single point: `step336` … `step896`.**

- `step336` — the first checkpoint where all eight families are at or above the starting adapter on
  the paired logit *and* the burst arm has begun to move.
- `step896` — the largest paired gains in the ladder and the best pooled accuracy (0.9432).

Deliberately **not** best-by-`val_loss` (step 840) and **not** best-by-pooled-accuracy (step 616).
`step902` is a 6-step tail and the only late reversal in the run — use 896, not `final`.

**Nobody has listened to any of these yet.** Every number above is preference accuracy on held-out
pairs. A listening test should compare four conditions — the starting adapter
(`ratelora_dpo_mix_r16/step245`) plus step336, step616 and step896 — with two separate judgements
per clip, "is this the burst that was asked for" and "does it stop", kept apart from any
audio-quality rating.

### A caveat about `rew_chosen`

In LoRA mode the trainer's reference policy is `peft.disable_adapter()`, which disables **all**
adapters — so `rew_chosen` is measured against **bare SFT3**, not against this run's starting point.
It was flat (3.29–3.49) across all 902 steps while `rew_rejected` fell from +0.295 to −3.87, so all
margin came from pushing the rejected side down. Read `rew_chosen > 0` as "better than bare SFT3",
which is a weak guardrail, not a strong one.

## How it was trained

| | |
|---|---|
| base | [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3) |
| initialised from | [`laion/moss-va-sft3-quality-speed-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-quality-speed-dpo-lora) @ step245 |
| data | `ds_mix_dpo_bs`, 14,932 pairs — bursts 25.0 % / stop 25.0 % / quality 30.0 % / speed 20.0 % |
| objective | DPO, β 30, length-normalised, NLL anchor 0.013 |
| schedule | 902 updates, lr 1e-6, 10 % warmup, 4 pairs per device × 4 GPUs |
| hardware | 4 GPUs, ~40 min |
| adapter | LoRA rank 16, α 32 — so the scaling `w` below multiplies α/r = 2.0 |

## Inference

```python
import torch
from transformers import AutoConfig, AutoModel, AutoProcessor
from peft import PeftModel

BASE = "laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3"
dev = "cuda:0"

proc = AutoProcessor.from_pretrained(BASE, trust_remote_code=True)
proc.audio_tokenizer = proc.audio_tokenizer.to(dev).eval()
cfg  = AutoConfig.from_pretrained(BASE, trust_remote_code=True)
base = AutoModel.from_pretrained(BASE, trust_remote_code=True,
                                 dtype=torch.bfloat16,
                                 attn_implementation="sdpa").to(dev).eval()

model = PeftModel.from_pretrained(base, "laion/moss-va-sft3-burst-stop-dpo-lora",
                                  adapter_name="bs").to(dev).eval()
# do NOT call model.merge_and_unload()

batch = proc([[{"role": "user", "content": prompt, "audio_codes_list": []}]],
             mode="generation")
out = model.generate(input_ids=batch["input_ids"].to(dev),
                     attention_mask=batch["attention_mask"].to(dev).to(torch.bool),
                     max_new_tokens=340, do_sample=True,
                     temperature=1.0, top_p=0.95, top_k=25)
```

A different checkpoint:

```python
model = PeftModel.from_pretrained(base, "laion/moss-va-sft3-burst-stop-dpo-lora",
                                  subfolder="checkpoints/step336", adapter_name="bs")
```

Adapter strength (base scaling is α/r = 2.0; all measurements used w = 1.0):

```python
def set_weight(model, name, w):
    for module in model.modules():
        sc = getattr(module, "scaling", None)
        if isinstance(sc, dict) and name in sc:
            if not hasattr(module, "_base_scaling"):
                module._base_scaling = {}
            module._base_scaling.setdefault(name, sc[name])
            sc[name] = module._base_scaling[name] * float(w)

set_weight(model, "bs", 1.0)
```

## Prompt format

Trained under prompt format hash `090c4ca315519a57` (inherited through the adapter chain). A
duration-only script is byte-identical to the project's standard `073aeb09dc923376`, so ordinary
prompts work unchanged.

## Checkpoints

`checkpoints/step{112,336,616,896}` — the four reported above. The root copy is `step896`. All 18
checkpoints exist internally; these are the ones with published numbers.

## Related

- Base model: [`…-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3)
- Initialised from: [`moss-va-sft3-quality-speed-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-quality-speed-dpo-lora)
- Per-burst-class adapters: [`moss-va-sft3-vocal-burst-lora-adapters`](https://huggingface.co/laion/moss-va-sft3-vocal-burst-lora-adapters) — note that this DPO adapter and those adapters attack the problem at different points and have not been tested together
- General-purpose DPO adapter: [`moss-va-sft3-dpo-lora-p2`](https://huggingface.co/laion/moss-va-sft3-dpo-lora-p2)
