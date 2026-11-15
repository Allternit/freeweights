# Gemma 4 31B it SDFT Heretic RP

This repository contains **merged Hugging Face weights** for an RP-enhanced version of Gemma 4 31B it.

The model is based on the uncensored **Heretic SDFT** line, then further tuned for roleplay behavior: stronger scene continuation, better character and world continuity, more active narrative pressure, and reduced generic LLM phrasing.

## Important Disclaimer

This model is provided **for research and evaluation purposes only**.

The underlying Heretic SDFT base intentionally has weakened or removed guardrails compared with standard aligned chat models. Users are responsible for how they run, prompt, deploy, and distribute outputs from this model.

Do not use this model to generate harmful, illegal, abusive, exploitative, or otherwise unsafe content.

## What This Is

- **Merged weights**, not a LoRA adapter.
- Built from `google/gemma-4-31B-it`.
- Further RP-tuned from the Heretic SDFT base.
- Intended for local inference, RP evaluation, narrative testing, and research.
- Quantized GGUF files may be published separately.

## RP Improvements

Compared with the previous Heretic SDFT RP checkpoints, this version showed statistically meaningful improvements in roleplay-oriented evaluation:

- Better continuation of ongoing scenes.
- Stronger use of established character traits and recent actions.
- More active world and NPC momentum.
- Better handling of multi-turn RP context.
- Less generic filler and slightly reduced slop phrasing.
- More consistent atmospheric detail without as much mechanical repetition.

## Recommended Use

This model is intended for:

- Dark fantasy, cyberpunk, and grounded RPG narration.
- Game Master style scene continuation.
- Character dialogue and NPC interaction.
- Multi-turn RP experiments.
- Research into SDFT, self-training, and RP behavior shaping.

## Notes

This is an experimental release. Outputs may still be unstable, repetitive, unsafe, or stylistically uneven depending on sampling settings and prompt structure.

Recommended starting inference settings:

```text
temperature: 0.8-0.95
top_p: 0.95
top_k: 64
```

## Acknowledgements

Special thanks to the people who helped make this release possible:

- **kurgan1138** — lead tester, responsible for extensive RP evaluation and feedback.
- **dysfunctionalidi0t** — tester, contributed additional evaluation and prompt testing.
- **Greg** — sponsor, generously provided the training server resources that made this model possible.