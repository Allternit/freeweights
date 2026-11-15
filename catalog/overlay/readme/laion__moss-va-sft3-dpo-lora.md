# Preference-tuning adapter for MOSS voice-acting v2 SFT-3

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
A rank-64 LoRA trained with DPO on top of
[`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3).
**This is the best checkpoint this project has measured**, on the same 80-prompt generation-based
evaluation used for everything else:

| model | reward | WER | emotion pct | quality | burst | burst hit rate |
|---|---|---|---|---|---|---|
| SFT-3, no adapter | 0.4584 | 0.0987 | 0.3494 | 0.9127 | 0.3564 | 0.666 |
| + DPO, corpus v1 | 0.4668 | 0.1117 | 0.3518 | 0.9108 | 0.3973 | 0.694 |
| + DPO, corpus v2 (step 4590) | 0.4633 | 0.1024 | 0.3427 | 0.9062 | 0.3930 | 0.719 |
| **this adapter** | **0.4708** | **0.0950** | 0.3373 | **0.9235** | **0.4271** | **0.772** |

It is the first preference-tuned model in this line whose word error rate is **better than the
supervised baseline's** (0.0950 against 0.0987) — every earlier DPO run paid for its gains in
intelligibility.

## What it was trained on

2,327,904 preference pairs, of which **20.5 %** are a construction we call *classifier-free-guidance
pairs*: two recordings of the **same speaker** within 10 % of each other's length, one strongly
expressing a dimension and one not, with the **spoken words removed from the prompt** so the
preference cannot be decided from the text. Each pair is emitted **twice with the roles flipped** —
under a "high" instruction the intense clip is chosen, under a "low" instruction the mild one is —
so a model cannot win by a global preference for loud audio and must condition on the instruction.

That worked: preference accuracy on those pairs rose from **0.562 (chance) to 0.975** during
training.

## What it did not do

It did **not** raise emotional intensity — 0.3373 against 0.3494 for the bare supervised model.
The construction taught the model to attend to the instruction block and the timing tags, which is
what the burst and WER numbers show, without giving it any new ability to *reach* an intensity it
could not reach before. See the technical report for the three standing hypotheses and the one that
was measured and refuted.

## A note on checkpoint rotation

An earlier checkpoint of a different DPO run scored 0.4687 and was briefly the best; it was removed
by the trainer's keep-last policy before it could be published. The adapter here is the best that
still exists **and** the best ever measured.

## Inference

```python
import torch, torchaudio
from transformers import AutoProcessor, AutoModel

BASE = "laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3"

proc = AutoProcessor.from_pretrained(BASE, trust_remote_code=True)
model = AutoModel.from_pretrained(BASE, trust_remote_code=True,
                                  dtype=torch.bfloat16, attn_implementation="sdpa").cuda().eval()

prompt = open("prompt.txt").read()          # the <user_inst> block, see "How to prompt" below
um = {"role": "user", "content": prompt, "audio_codes_list": []}
b = proc([[um]], mode="generation")

with torch.no_grad():
    out = model.generate(input_ids=b["input_ids"].cuda(),
                         attention_mask=b["attention_mask"].cuda(),
                         max_new_frames=340, do_sample=True,
                         audio_temperature=1.0, audio_top_p=0.95, audio_top_k=50,
                         audio_repetition_penalty=1.0)

# codes -> waveform. Use the processor's own decoder: calling the audio tokenizer directly, or
# reshaping its output, yields a two-channel result that flattens into audio at HALF SPEED and
# still sounds like speech. This project lost a whole corpus to that once.
wav = proc.decode_audio_codes([out_codes], return_stereo=False)[0].reshape(-1).float().cpu()
torchaudio.save("out.flac", wav[None], int(proc.model_config.sampling_rate), format="flac")
```

### Loading adapters

```python
from peft import PeftModel

# one adapter
model = PeftModel.from_pretrained(model, "laion/moss-va-sft3-dpo-lora")

# several, each with its own weight -- the usual case: identity from a voice adapter,
# affect from an emotion adapter, general quality from the DPO adapter.
#
# NOTE: `add_weighted_adapter(..., combination_type="linear")` does NOT work here. It raises
# `ValueError: All adapters must have the same r value`, because the DPO adapter is rank 64 and
# the voice / emotion adapters are rank 16. Activate them together instead and scale each one.
model = PeftModel.from_pretrained(model, "<dpo adapter path>", adapter_name="dpo")
model.load_adapter("<voice adapter path>", adapter_name="voice")
model.load_adapter("<emotion adapter path>", adapter_name="emo")

names = ["dpo", "voice", "emo"]
weights = {"dpo": 1.0, "voice": 1.0, "emo": 1.5}     # 1.5 for emotion is the measured optimum
model.base_model.set_adapter(names)                  # the TUNER takes a list; PeftModel does not
model.active_adapter = names[0]                      # must stay a str or generate() indexes a list

for mod in model.modules():
    sc = getattr(mod, "scaling", None)
    if isinstance(sc, dict):
        if not hasattr(mod, "_base_scaling"):
            mod._base_scaling = dict(sc)
        for k in sc:
            if k in weights:
                sc[k] = mod._base_scaling[k] * weights[k]
```

### Scaling an adapter without re-merging

A LoRA layer computes `h + scaling · B(A(x))`, so multiplying the stored `scaling` **is** the merge
weight — exact and reversible:

```python
def set_lora_scale(model, w):
    for mod in model.modules():
        sc = getattr(mod, "scaling", None)
        if isinstance(sc, dict):
            if not hasattr(mod, "_base_scaling"):
                mod._base_scaling = dict(sc)
            for k in sc:
                sc[k] = mod._base_scaling[k] * w
```
## How to prompt this model

Every request is one `<user_inst>` block. The fields are fixed — none may be added or removed:

```
<user_inst>
- Reference(s):
{None | Speaker: <name> | <|audio|>}
- Instruction:
{GENERAL: ... and/or SCRIPT: ...}
- Tokens:
{target length in audio frames}
- Quality:
None
- Sound Event:
None
- Ambient Sound:
None
- Language:
{English | German}
- Text:
{the same script as under SCRIPT:, character for character}
</user_inst>
```

| Field | What goes in it |
|---|---|
| `Reference(s)` | `<\|audio\|>` when a reference recording of the target voice is attached, `Speaker: <name>` when only a voice name is known, otherwise `None`. |
| `Instruction` | A `GENERAL:` line, a `SCRIPT:` block, or both. |
| `Tokens` | Target length in audio frames. The tokenizer runs at **12.5 frames per second**, so 12.8 s = 160 frames. This is the length budget and the numbers in the script must add up to it. |
| `Quality`, `Sound Event`, `Ambient Sound` | Always `None`. Kept so the field layout matches the base model. |
| `Language` | `English` or `German`. |
| `Text` | The rendered script, byte-identical to the `SCRIPT:` block. |

### `GENERAL:` — who is speaking

Prose describing the voice and the clip: age and gender, energy and pace, tension, timbre, clarity,
pitch range, breath, affect, which emotions are audible, style, recording quality.

```
GENERAL: A young adult masculine voice; delivery is normally alert, brisk, neutral tension;
timbre is neutral-toned, fairly smooth; average clarity, wide pitch range, light breath;
affect is mildly positive, slightly dominant; reads as bitterness, contempt; 9.5s, EN.
```

The phrase `reads as …` is where the emotion names live.

### `SCRIPT:` — what to say, when, and how

Four kinds of tag, told apart **by their brackets**:

| Tag | Means | Rule |
|---|---|---|
| `[3.9 seconds duration]` | the next sentence must take this long | square brackets, stands **before** the text, one per speech segment |
| `[0.8 seconds pause]` | silence of this length | square brackets; every gap of 0.2 s or more, including before the first word and after the last |
| `(contented sigh, 0.2 seconds)` | a non-speech vocalisation of this length | round brackets **with** a duration — label first, then the seconds |
| `(clearly amused, warm and open, unguarded)` | how to perform the next sentence | round brackets **without** a duration, stands before the duration tag |

**The disambiguation rule in one line:** square bracket = a number of seconds; round bracket *with* a
number = a vocal burst; round bracket *without* a number = a delivery direction. That is the only
thing separating a burst from a direction, which is why directions never carry a number.

A complete example:

```
<user_inst>
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
</user_inst>
```

0.4 + 2.4 + 0.3 + 0.4 + 0.2 + 2.3 = 6.0 s = 75 frames. **If the numbers do not add up to the token
budget the model has to choose which to honour**, and length control is the thing it honours best.

### Segmentation rules the training data followed

* split at sentence ends (`.` `!` `?` `…`) and at every vocal burst;
* any segment still longer than **12 s** is split again at its largest internal gap;
* a duration is measured from the first word onset to the last word offset of that segment, so two
  sentences of 12 s and 8 s produce `[12.0 seconds duration]` and `[8.0 seconds duration]`, never a
  single `[20.0 seconds duration]`;
* gaps below **0.20 s** are folded into the neighbouring speech instead of being printed, so the
  printed numbers still add up;
* a burst that overlaps speech prints only the part that does not overlap.

### Vocal-burst labels that actually occur in training

`low mumble`, `ahem`, `contented sigh`, `surprised gasp`, `chuckle`, `breathy giggle`,
`childlike giggle`, `wistful sigh`, `exhausted groan`, `sharp inhale`, `resonant hum`, `scream`,
`yawn`, `deep breath`, `soft hum`, `exasperated sigh`, `cackle`, `shriek`, `coughing`,
`mournful wail`, `growl`, `purr`.

Realistic lengths: median **0.28 s**, 10th percentile 0.14 s, 90th percentile 0.48 s, longest
observed 2.46 s. A sigh requested at 3 s is outside anything in the data.

### Intensity bands

Delivery directions carry an intensity adverb drawn from the percentile band of the requested
emotion. The same cutoffs are used by the training data, the reward and the evaluation:

| band | percentile | adverbs |
|---|---|---|
| faint | 0.40 – 0.70 | barely, faintly, only slightly, just a little |
| moderate | 0.70 – 0.90 | clearly, plainly, noticeably, unmistakably |
| intense | 0.90 – 0.98 | strongly, intensely, very, deeply |
| extreme | 0.98 – 1.00 | overwhelmingly, extremely, utterly, completely |

## The family

| | |
|---|---|
| 🧩 **Base model (required by every adapter here)** | [`laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3) |
| 🎚️ **Preference-tuning adapter** | [`laion/moss-va-sft3-dpo-lora`](https://huggingface.co/laion/moss-va-sft3-dpo-lora) |
| 🎭 **40 emotion adapters** | [`laion/moss-va-sft3-emotion-loras`](https://huggingface.co/laion/moss-va-sft3-emotion-loras) |
| 🗣️ **500 voice adapters** | [`laion/moss-va-sft3-voice-loras`](https://huggingface.co/laion/moss-va-sft3-voice-loras) |
| 🔊 **Listening page — nine models on the same 80 prompts, with ASR transcripts** | [laion/moss-va-sft3-samples](https://huggingface.co/spaces/laion/moss-va-sft3-samples) |
| 🔬 **Emotion adapters vs baseline, matched and neutral prompts** | [laion/moss-va-emotion-loras](https://huggingface.co/spaces/laion/moss-va-emotion-loras) |
| 🧪 **Four-factor study — what actually drives the emotion score** | [laion/moss-va-four-factor-study](https://huggingface.co/spaces/laion/moss-va-four-factor-study) |
| 📄 **Technical report** | [laion/moss-va-technical-report](https://huggingface.co/spaces/laion/moss-va-technical-report) |
| 📖 **Voice-acting manual (v2 model)** | [projects.laion.ai/moss-voiceacting-manual](https://projects.laion.ai/moss-voiceacting-manual/site/index.html) |
| ⬅️ **Predecessors** | [voice-acting-v2](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2) · [-sft](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft) · [-sft-dpo](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft-dpo) |
