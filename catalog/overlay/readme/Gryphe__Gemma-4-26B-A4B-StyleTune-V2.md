# Gemma-4-26B-A4B-StyleTune-V2

[![image/jpg](Gemma-4-26B-A4B-StyleTune-V2.jpg)](Gemma-4-26B-A4B-StyleTune-V2.jpg)

As promised, a slightly less wonky 26B-A4B Style Tune! Turns out you really shouldn't use this technique with multiple epochs. I delved deep into the data and found that a second epoch does all sorts of nasty stuff to MoE models, so V2 is a single epoch of an otherwise unchanged technique. The metrics have barely changed, but stability should be far, far better this time around!

Where V1 had a 54% reduction in cliches V2 offers 52%, but otherwise still an entirely new writing style, and the same Gemma 4 26B-A4B you already know underneath. One tensor changed out of 659. For realsies this time, I promise.

Also available in [31B version](https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune) and a [12B version](https://huggingface.co/Gryphe/Gemma-4-12B-StyleTune)!

## What is a style tune?

Normally when I finetune a model I train as much of it as possible, loading every tensor and transforming it to better approximate whatever's in my data. Not this time. This time I trained precisely one tensor: the `lm_head` output projection - the layer that decides which token to emit. Literally the last stop before text appears on your screen.

This specific tensor has a massive influence on a model's writing style, something I first discovered building MythoMax years ago. Gemma 31B (the first style tune) is a VRAM-hungry monster, so the question became: how do I have the maximum impact with the minimum hardware requirements?

The answer: freeze everything else. All 30 transformer layers, all the attention heads, all the MLPs — completely untouched. Only `lm_head` trains, which means VRAM requirements drop dramatically, training completes in a single overnight run on consumer hardware, and every single one of Gemma's capabilities remains fully intact. The model hasn't changed. Only the voice has, and it's done so in the best way possible. (Obligatory disclaimer: I might be biased towards my own data.)

I used the same data I had on me for my last Pantheon Reasoning release, with one notable exception - No instruct 24k set. 100% narrative data, certified cliché free.

## What changed?

Benchmarked against 200 diverse roleplay prompts versus the base instruct model:

- **52% fewer clichés** per 100 words (1.141 → 0.551)
- **Only 19.9% shared trigram vocabulary** - the model reaches for an almost entirely different set of phrases, with responses feeling much less sloppy as a result.

Considering we're talking about narrative data it's hard to provide you with many other meaningful statistics - It's one of those "try it to understand it" kinda situations.

## What didn't change?

Everything else. All the reasoning capability, world knowledge, instruction following, and language understanding are completely intact - none of those live in `lm_head`. This isn't a full finetune. It's a targeted style replacement on a single tensor.

## Inference

Whatever you prefer, Gemma seems remarkably flexible in that regard. I run with temp 1.0, 0.10 MinP and the DRY sampler.

## Prompt Format

Gemma 4's native chat template applies automatically.

## Credits

- Everyone from [Anthracite](https://huggingface.co/anthracite-org)! Hi, guys!
- [Latitude](https://huggingface.co/LatitudeGames), for which I am still producing finetunes on a regular basis, helping me keep my skills sharp and up-to-date!
- All the folks I chat with on a daily basis on Discord! You know who you are.
- Anyone I forgot to mention, just in case!
