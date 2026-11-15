## 📚 Experiment overview

A full write-up of **every experiment run with this model** — temperature/sampling scaling (best temp with/without reference), best-of-N group-size studies, reward variants (V1–V6), the VoiceCLAP-small blend scorer, the FAIR eval, character/emotion studies, and voice cloning — with results and links to the live grids:

➡️ **[Full experiment overview](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/overview.html)**
(GitHub: [LAION-AI/laion-moss-local-1.5-voice-acting-4.55b](https://github.com/LAION-AI/laion-moss-local-1.5-voice-acting-4.55b))

## 🎭 Character archetype prompt study

### 🏆 THE FINAL SHOWCASE — [13 Character Voices, Directed by Prompt](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/voices.html)

The **capstone** of the study: the round-5 **best-of-64 champions** for all **13 voices** (zombie · ork · goblin · dragon · evil-ghost · mouse · fairy · ranting · pain-scream · ASMR man/woman · grieving woman/man), each with its **exact reusable director instruction**, listenable champion audio + a freshly recomputed 57-dim VoiceNet profile and procedural caption, its char / char_emo / blend / genu / invWER scores, signature dimensions and firing emotions. Includes the **complete 13-principle prompting playbook** (reusable template + effect→words lookup + per-character round-5 recipes) and the **round-1→5 improvement-arc** table. All **zero-shot, no reference audio**. **→ [projects.laion.ai/.../voices.html](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/voices.html)**


An evolutionary search for the natural-language **performance instruction** that best embodies each of **10 character/style archetypes** (zombie, orc, fairy, mouse, dragon, goblin, ASMR man/woman, ranting, pain-scream) with this model — **no reference audio**, scored by a VoiceNet 57-dimension reward (blend + genuineness + 1.5·character). ~60 listenable takes with per-clip voice profiles, the full reward method, compute breakdown, and a consolidated prompting **lessons playbook**:

➡️ **[Character archetype prompt study](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/archetypes.html)**

➡️🔥 **[Character archetype prompt study — round 2 (emotion-aware)](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/archetypes_round2.html)** — the same 10 archetypes re-optimized with an **EmoNet** emotion score added to the reward (`0.5·blend + 0.5·genu + 2.0·char_vn + 1.5·char_emo`; blend/genuineness halved, character pushed harder). Shows the round-1 → round-2 jump per archetype (e.g. the **ranting** fix and new goblin/zombie emotion gains). ➡️🎚️ **[Character archetype prompt study — round 3 (resonance · pitch · dominance)](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/archetypes_round3.html)** — re-optimized again exploiting chest/throat/nasal/head **resonance**, **register & pitch-range**, and commanding-vs-meek **dominance** dims; shows the round-1 → 2 → 3 char progression. ➡️🎯 **[Character archetype prompt study — round 4 (weighted dims & emotions + 3 new voices)](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/archetypes_round4.html)** — introduces **per-dimension** and **per-emotion** reward weights; re-tunes 4 archetypes (goblin *more evil* Malevolence ×2.5 char_emo 0.28→0.67; mouse *higher pitch* RANG ×2.5 char 0.76→0.87; pain-scream with *real screams in the text* + Arousal ×2.5 char_emo 0.81→0.94; ranting arousal-weighted) and builds **3 new voices from scratch** — a breathy evil ghost, a crying woman and a crying man (Sadness ×2.5, char_emo 0.92 / 0.89). 📘 **[Practical prompting guide](https://github.com/LAION-AI/laion-moss-local-1.5-voice-acting-4.55b/blob/master/PROMPTING_GUIDE.md)** — a for-dummies per-archetype cheat-sheet (copy-paste champion instructions, recipes, template). ➡️🏆 **[Round 5 — the final 13-voice showcase](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/voices.html)** — all 13 best-of-64 champions with reusable prompts + the complete prompting playbook and round-1→5 improvement arc.


# MOSS-TTS-Local **4.55B** — Voice Acting (48 kHz local transformer, merged)

An **expressive voice-acting** model: fantasy characters (orc / dragon / fairy / goblin), shouting,
whispering, and **vocal bursts** (laughs, gasps, sighs, giggles, moans) driven by natural-language
director instructions, in **English and German**.

This is the **4.55-billion-parameter local-transformer** MOSS variant at **48 kHz**. Its sibling is the
**8-billion-parameter delay-architecture** model at 24 kHz:
[`laion/moss-tts-v1.5-8b-voice-acting`](https://huggingface.co/laion/moss-tts-v1.5-8b-voice-acting).

| | **this model — 4.55B local transformer** | [8B delay](https://huggingface.co/laion/moss-tts-v1.5-8b-voice-acting) |
|---|---|---|
| architecture | `moss_tts_local`, 12-codebook RVQ | `moss_tts_delay`, 32-codebook RVQ |
| audio tokenizer | [`OpenMOSS-Team/MOSS-Audio-Tokenizer-v2`](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2) — **48 kHz** | [`OpenMOSS-Team/MOSS-Audio-Tokenizer`](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer) — **24 kHz** |
| output | **native 48 kHz** (use raw — no post-processing needed) | 24 kHz (optionally band-width-extended with Sidon) |
| why pick it | higher audio bandwidth out of the box, fewer codebooks to predict per frame, smaller/faster (~0.87 s per 15 s clip at batch 64 on one A100) | larger capacity; measured slightly lower word accuracy on identical prompts (invWER 0.83 vs **0.97**) |

**Off-the-shelf:** this repository contains the fully **merged** weights — the voice-acting LoRA
(rank 256, 1M training samples) is already folded into the base fine-tune. Load and generate;
no adapter handling needed.

🎧 **Listen:** [production best-of-64 grid](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/production_best50.html)
— top-3 raw takes per group across 40 emotions, with scores.
Full generation recipe (prompting, scoring, rewards, throughput):
[SYNTHETIC_DATA_RECIPE.md](https://github.com/LAION-AI/laion-moss-local-1.5-voice-acting-4.55b/blob/master/SYNTHETIC_DATA_RECIPE.md).

## 🎧 Listen — best-of-64 samples

Ten different emotions, each the **top-scoring take out of 64** for its prompt, generated with this model (reference-less, natural-language director instructions, raw 48 kHz). The spoken line is shown above each clip. More: the [full best-of-64 grid](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/production_best50.html).

**Affection** — *“I feel the very cosmos aligning when I am near you, as if destiny itself whispers your name on the wind. My heart, a humble offering, beats only for your grace, a symphony of devotion played solely for your ears. Forever and always, my love.”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/affection.mp3"></audio>

**Amusement** — *“Huh, so, like, maybe the pigeons *are* smarter than they look, huh?”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/amusement.mp3"></audio>

**Anger** — *“How many times I gotta tell you, huh? You think you're so damn smart, just walkin' all over me? I'm about to lose it, swear to God.”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/anger.mp3"></audio>

**Astonishment / Surprise** — *“That just happened, didn't it... Achoo! Wait, did I just *sneeze* glitter?”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/astonishment.mp3"></audio>

**Awe** — *“Right, so, like, how did they even DO that? That's just... well, that's seriously the most unbelievable thing I think I've ever seen, seriously.”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/awe.mp3"></audio>

**Bitterness** — *“I should have known better than to trust in hope, for hope, like a venomous serpent, only coils around your heart to deliver the fatal bite of disappointment.”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/bitterness.mp3"></audio>

**Concentration** — *“So, alright, focusing up here; gotta nail this thing first try. Yeah, that's it, need to keep the energy up and pay attention to the objective to get it right on the spot.”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/concentration.mp3"></audio>

**Confusion** — *“I don't get it, like at all, what's even going on? Seriously, am I missing something super obvious here, or is everyone messing with me? This is just wild, man, totally lost!”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/confusion.mp3"></audio>

**Contemplation** — *“That's kinda weird, innit? Maybe I'm overthinking it, though, just lost in thought, like, proper deep. Still, makes you wonder, doesn't it?”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/contemplation.mp3"></audio>

**Contentment** — *“Ah, the tears of a battle fought and won, a war finally over. Peace now descends, wrapping me in its gentle embrace, a soothing balm to a weary soul. At long last, I am home.”*

<audio controls src="https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting/resolve/main/samples/contentment.mp3"></audio>

## Training data

- **DramaBox distillation** — voice-acting performances distilled from DramaBox-style prompts
  (structured director's instructions + spoken lines), vocal-burst / strong-emotion filtered.
- **Gemini TTS distillation** — audio-matched fixed prompts with MOSS RVQ tokens.
- **Emolia** — German emotional speech.
- **Podcast snippets** from publicly available podcasts on the web.

Training: 8×GPU DDP, bf16, gradient checkpointing, global batch 128, warmup 0.03 + linear decay;
rank-256 LoRA (α=256) over all attention + MLP projections, then merged into the weights.

## Requirements

```bash
pip install "transformers>=4.45" torch torchaudio safetensors huggingface_hub
```

The MOSS v2 audio codec (`OpenMOSS-Team/MOSS-Audio-Tokenizer-v2`) is pulled automatically.
~10 GB VRAM (bf16 + codec).

## Prompt format (DramaBox style)

Split each line into two parts:
- **`instruction`** = the *voice / performance description and stage directions* (what is written
  **outside** the double quotes), e.g. *"As a mighty orc warrior with a deep, guttural, growling
  voice, bellow these words."* Describe vocal bursts as director notes, e.g. `(a soft chuckle)`,
  `(gasping)`.
- **`text`** = the *spoken words* (what is written **inside** the double quotes).

## Inference (complete)

```python
import torch, torchaudio
from transformers import AutoProcessor, AutoModel

REPO = "laion/moss-tts-local-transformer-4.55b-voice-acting"
DEVICE = "cuda"

proc = AutoProcessor.from_pretrained(REPO, trust_remote_code=True,
                                     codec_path="OpenMOSS-Team/MOSS-Audio-Tokenizer-v2")
proc.audio_tokenizer = proc.audio_tokenizer.to(DEVICE).eval()
model = AutoModel.from_pretrained(REPO, trust_remote_code=True,
                                  dtype=torch.bfloat16,
                                  attn_implementation="sdpa").to(DEVICE).eval()

@torch.no_grad()
def generate(text, instruction, language="English", reference_codes=None, n=3):
    kw = dict(text=text, instruction=instruction, language=language)
    if reference_codes is not None:
        kw["reference"] = [torch.tensor(reference_codes, dtype=torch.long)]
    best = None
    for seed in range(n):
        torch.manual_seed(seed)
        batch = proc([[proc.build_user_message(**kw)]], mode="generation")
        out = model.generate(input_ids=batch["input_ids"].to(DEVICE),
                             attention_mask=batch["attention_mask"].to(DEVICE),
                             max_new_tokens=1200, do_sample=True,
                             audio_temperature=1.0, audio_top_p=0.95,
                             audio_top_k=25, audio_repetition_penalty=1.1)
        msg = proc.decode(out)[0]
        if not msg.audio_codes_list:
            continue
        wav = msg.audio_codes_list[0]                    # waveform @ 48 kHz
        if best is None or wav.shape[-1] > best.shape[-1]:
            best = wav
    return best

wav = generate(
    text="You dare enter my domain? Then you shall not leave alive!",
    instruction="As a mighty orc warrior with a deep, guttural, growling voice, "
                "bellow these words with brutal force.",
    language="English")
torchaudio.save("orc.wav", wav.cpu().float(), 48000)
```

Tips (measured): batch by repeating `input_ids` n× and calling `generate` once (batch 64 →
0.87 s/clip on an A100); use **SDPA** (flash-attn 2.x is incompatible with this remote-code
attention); without reference audio use `audio_temperature=0.8`; pass
`tokens ≈ words × 6` (12.5 Hz codec frames) via `build_user_message` to avoid rushed pacing.

### Optional: clone a reference voice

Pass 12-codebook MOSS codes of a reference clip to steer timbre; keep the instruction for the
delivery (an *empty* instruction gives the highest speaker similarity):

```python
ref_codes = proc.encode_audios_from_path(["my_reference.wav"], n_vq=12)[0]
wav = generate(text="...", instruction="", language="English", reference_codes=ref_codes)
```

## ⚡ Serving with SGLang-Omni (fast inference)

For interactive or **bulk dataset generation**, serve this model with **[SGLang-Omni](https://github.com/sgl-project/sglang)** — an OpenAI-compatible speech server with continuous batching + CUDA graphs. Measured on **1× A100-80GB**:

| metric | value |
|---|---|
| time-to-first-audio (streaming, 1 req) | **~0.74 s** |
| single-stream real-time factor | **~4.5× realtime** |
| **offline data-gen throughput (peak)** | **~35× realtime ≈ 35 audio-hours per A100-hour** (concurrency 96, ~68 GB VRAM) |

Minimal setup and serve:

```bash
uv pip install sglang-omni soundfile
hf download laion/moss-tts-local-transformer-4.55b-voice-acting

# NOTE the `env -u LD_LIBRARY_PATH` — without it the FIRST request SIGABRTs with
# `undefined symbol: cudnnGetLibConfig` (a leaked cuDNN path in the stage subprocess).
env -u LD_LIBRARY_PATH CUDA_VISIBLE_DEVICES=0 \
  sgl-omni serve \
    --model-path laion/moss-tts-local-transformer-4.55b-voice-acting \
    --config examples/configs/moss_tts_local.yaml --port 8000
```

```bash
curl -X POST http://localhost:8000/v1/audio/speech -H "Content-Type: application/json" \
  -d '{"input": "You dare enter my lair?!", "instructions": "A furious ancient dragon, low and booming."}' \
  --output dragon.wav
```

To hit **~35× realtime** for dataset generation: raise `max_running_requests` to 64 **and** capture CUDA graphs up to batch 64, then drive ~96 concurrent non-streaming requests. Full step-by-step setup, the complete `/v1/audio/speech` API (reference-less / voice-clone / streaming), every startup trap with its fix, and the detailed tuning tables are in the **[SGLang-Omni serving guide (A100)](https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/sglang.html)**.

## Notes

- The `text_lm_head` / `audio_lm_heads` "MISSING" note on load is benign weight-tying.
- License: **Apache-2.0**.


## Repository

Code, inference guide, fast-inference measurements, SGLang/streaming notes and audio demos:
**<https://github.com/LAION-AI/laion-moss-local-1.5-voice-acting-4.55b>**
