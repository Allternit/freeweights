# Preference-tuning adapter for MOSS voice-acting v2 SFT-3 — contrastive pair families

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
A rank-64 LoRA (alpha 128) trained with DPO on top of
[`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3),
which is itself a supervised fine-tune of
[`laion/moss-tts-local-transformer-4.55b-voice-acting-v2`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2).

**This is the best checkpoint this project has measured.** It supersedes
[`laion/moss-va-sft3-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-dpo-lora), which holds
the previous best (the CFG-only corpus). All rows below come from the same 80-prompt,
generation-based evaluation, on identical prompts and the same corrected percentile scale.

| model | reward | WER | emotion pct | quality | burst | burst hit rate |
|---|---|---|---|---|---|---|
| SFT-3, no adapter | 0.4584 | 0.0987 | 0.3494 | 0.9127 | 0.3564 | 0.666 |
| + DPO, corpus v1 | 0.4668 | 0.1117 | 0.3518 | 0.9108 | 0.3973 | 0.694 |
| + DPO, corpus v2 (step 3216) | 0.4687 | 0.1094 | 0.3401 | 0.9211 | 0.3929 | 0.709 |
| + DPO, CFG corpus (step 4912) | 0.4708 | 0.0950 | 0.3373 | 0.9235 | 0.4271 | **0.772** |
| **this adapter (step 5022)** | **0.4757** | 0.0977 | **0.3541** | 0.9208 | **0.4180** | 0.762 |
| this adapter, step 3906 | 0.4744 | **0.0916** | 0.3478 | 0.9231 | 0.4106 | 0.762 |

Two things are worth noting. Its **word error rate is better than the supervised baseline's**
(0.0977 against 0.0987), which no preference-tuned model in this line managed before the CFG
corpus — earlier DPO runs always paid for their gains in intelligibility. And its **emotion
percentile is the highest of any preference-tuned model** here (0.3541), which is what the two new
pair families were built to achieve.

## What it was trained on

2,696,421 preference pairs. 86.3 % is the CFG corpus that produced the previous best; **13.7 % is
new**, in two families:

| family | rows | what varies between chosen and rejected |
|---|---|---|
| `p2_emox` | 309,128 | **the emotion only.** Same speaker, durations within 10 %, and *both* clips are intense — one on the emotion the instruction names, one on a different one. Turning intensity up is worth nothing; only conditioning on the instruction is. Each pair is emitted twice with the roles flipped. |
| `p2_len` (cut) | 29,564 | **the duration only.** Same speaker, same text, same emotion; the rejected side is the same clip truncated to 50–75 % of its frames. |
| `p2_len` (ext) | 29,825 | as above, but the rejected side runs 125–150 % long. |

The emotion of a clip is always taken from its **measured** value (a 40-head emotion model scored
on that exact waveform), never from the prompt that generated it.

The text field differs between the families by design. `p2_emox` pairs two *different* recordings
under one prompt, so the words are replaced by `...` — otherwise the preference would be decidable
from the text alone. `p2_len` pairs one recording against itself at two lengths, so the words are
shared and the full timed script stays in the prompt: the timing tags are exactly what the
rejected side violates.

## How to use it

```python
from transformers import AutoProcessor, AutoModel
from peft import PeftModel

BASE = "laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3"
proc  = AutoProcessor.from_pretrained(BASE, trust_remote_code=True)
model = AutoModel.from_pretrained(BASE, trust_remote_code=True,
                                  dtype="bfloat16", attn_implementation="sdpa")
model = PeftModel.from_pretrained(model, "laion/moss-va-sft3-dpo-lora-p2").eval().cuda()

prompt = """<user_inst>
- Reference(s):
None
- Instruction:
GENERAL: A young adult feminine voice, warm and conversational; reads as amusement; 6.0s, EN.
SCRIPT:
[0.4 seconds pause] (intensely amused: letting it out / not hiding it, warm and open,
unguarded; bright, relaxed) [2.4 seconds duration] You are not going to believe this.
[0.3 seconds pause] (breathy giggle, 0.4 seconds) [0.2 seconds pause] (still intensely amused)
[2.3 seconds duration] He actually wore it to the wedding.
- Tokens:
75
- Quality:
None
- Sound Event:
None
- Ambient Sound:
None
- Language:
English
- Text:
[0.4 seconds pause] (intensely amused: letting it out / not hiding it, warm and open,
unguarded; bright, relaxed) [2.4 seconds duration] You are not going to believe this.
[0.3 seconds pause] (breathy giggle, 0.4 seconds) [0.2 seconds pause] (still intensely amused)
[2.3 seconds duration] He actually wore it to the wedding.
</user_inst>"""

b = proc([[{"role": "user", "content": prompt, "audio_codes_list": []}]], mode="generation")
out = model.generate(input_ids=b["input_ids"].cuda(), attention_mask=b["attention_mask"].cuda(),
                     max_new_frames=340, do_sample=True, audio_temperature=1.0,
                     audio_top_p=0.95, audio_top_k=50)
```

### The prompt format

The audio tokenizer runs at 12.5 frames per second, so `Tokens:` is `seconds × 12.5` — 6.0 s is 75.
Four kinds of tag appear in the script, told apart by their brackets:

| tag | meaning |
|---|---|
| `[3.9 seconds duration]` | the next sentence must take this long; stands **before** it, one per segment |
| `[0.8 seconds pause]` | silence, for every gap of 0.2 s or more, including before the first word and after the last |
| `(contented sigh, 0.2 seconds)` | a vocal burst: round brackets **with** a duration |
| `(clearly amused, warm and open)` | a delivery direction: round brackets **without** a duration |

The numbers should add up to the token budget. Realistic burst lengths are short — median 0.28 s
in the training data, 90th percentile 0.48 s.

## Limitations

* **Emotional intensity is still far below what the prompt asks for.** Asked for percentile
  0.90–0.98 of a named emotion, this model reaches 0.354 on the corrected scale. Every objective
  tried against this — GRPO, plain DPO, CFG-DPO, and these contrastive families — has moved it only
  slightly. The one approach that has moved it more is training on more extreme data; see the
  per-emotion adapters at
  [`laion/moss-va-sft3-emotion-loras`](https://huggingface.co/laion/moss-va-sft3-emotion-loras).
* Timing is the solved part: median duration error 0.08 s, essentially every clip within 0.5 s of
  the length its own script adds up to.
* The adapter ships **unmerged** and should stay that way. `audio_lm_heads.N.weight` and
  `audio_embeddings.N.weight` are the same tensor (`tie_weights()`), so merging the head delta also
  rewrites the embedding and corrupts the model — measured, both tensors changing by exactly
  6.103515625e-05 while the text embedding did not change at all.

## Evaluation

Listening pages, all on identical prompts:

* [`laion/moss-va-sft3-samples`](https://huggingface.co/spaces/laion/moss-va-sft3-samples) — nine
  models side by side with ASR transcripts
* [`laion/moss-va-emotion-loras`](https://huggingface.co/spaces/laion/moss-va-emotion-loras) —
  specialist adapters against this baseline, matched and neutral prompts
* [`laion/moss-va-lora-scale`](https://huggingface.co/spaces/laion/moss-va-lora-scale) — merge-weight
  ablation
* [`laion/moss-va-technical-report`](https://huggingface.co/spaces/laion/moss-va-technical-report) —
  the full technical report
