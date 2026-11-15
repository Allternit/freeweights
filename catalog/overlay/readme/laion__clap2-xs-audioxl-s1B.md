# CLAP2-XS: contrastive language-audio model

CLAP2-XS is one of the five CLAP2 contrastive audio-text models (27M to 340M parameters), in OpenCLIP and Transformers format. An audio tower and a text tower map audio clips and English text into a shared embedding space, so the models can be used for zero-shot audio classification, audio-text retrieval, and as general audio embeddings. All models were trained from scratch on LAION-Audio-XL, a corpus of 366M audio-text pairs.

The audio tower is a NaFlex vision transformer over log-mel patches. It takes audio of any length (no fixed-size crop or padding to a fixed length) and produces one embedding per clip.

Each model size is a separate repository (see the table below).

Paper: [arXiv:2611.11592](https://arxiv.org/abs/2611.11592) · Code: [LAION-AI/clap2](https://github.com/LAION-AI/clap2) · Project page: [projects.laion.ai/clap2](https://projects.laion.ai/clap2/)

## Models

All models were trained for 1,024M samples seen (WSD learning-rate schedule, last checkpoint). Parameter counts are for both towers.

| Model | Repository | Params | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|---|
| L | [laion/clap2-large-audioxl-s1B](https://huggingface.co/laion/clap2-large-audioxl-s1B) | 340.1M | 53.6 | 81.9 | 30.3 |
| M | [laion/clap2-medium-audioxl-s1B](https://huggingface.co/laion/clap2-medium-audioxl-s1B) | 152.8M | 52.3 | 81.4 | 29.4 |
| S | [laion/clap2-small-audioxl-s1B](https://huggingface.co/laion/clap2-small-audioxl-s1B) | 103.9M | 51.8 | 81.8 | 29.8 |
| **XS** (this model) | [laion/clap2-xs-audioxl-s1B](https://huggingface.co/laion/clap2-xs-audioxl-s1B) | 48.3M | 49.1 | 80.6 | 27.6 |
| XXS | [laion/clap2-xxs-audioxl-s1B](https://huggingface.co/laion/clap2-xxs-audioxl-s1B) | 27.3M | 46.2 | 79.1 | 28.0 |

Scores are in %, higher is better. MAEB-30 is the mean over the 30 tasks of the Massive Audio Embedding Benchmark. The tasks cover speech, music and sound, and the task types classification, zero-shot classification, pair classification, clustering and retrieval. HEAR-17 is the mean over 17 HEAR tasks (all except Beehive and Maestro 5h). MSEB is the mean over 62 English MSEB scores. For the exact protocol, per-domain and per-task-type scores, and comparisons with other audio-text models, see the [paper](https://arxiv.org/abs/2611.11592).

## Quick start

```bash
pip install "open_clip_torch>=4.2.1" soundfile
```

```python
import torch, open_clip
from open_clip.audio.io import load_audio

hub = "hf-hub:laion/clap2-xs-audioxl-s1B"
model, preprocess = open_clip.create_model_from_pretrained(hub)
tokenizer = open_clip.get_tokenizer(hub)

audio = preprocess()(load_audio("dog.wav"))  # any sample rate and channel count
texts = ["A dog barks.", "A door slams shut.", "People are applauding."]
with torch.no_grad():
    logits, _ = model.get_logits({k: v[None] for k, v in audio.items()}, tokenizer(texts))
print({t: round(p, 3) for t, p in zip(texts, logits.softmax(-1)[0].tolist())})
```

Output for an FSD50K clip of a dog barking: `{'A dog barks.': 1.0, 'A door slams shut.': 0.0, 'People are applauding.': 0.0}`. For embeddings, use `model.encode_audio({k: v[None] for k, v in audio.items()}, normalize=True)` and `model.encode_text(tokenizer(texts), normalize=True)`.

### Several clips at once

Pad the patch dictionaries to the longest clip. `patch_valid` masks the padding, so the embeddings are the same as when each clip is encoded alone:

```python
from torch.nn.utils.rnn import pad_sequence
items = [preprocess()(load_audio(f)) for f in ["dog.wav", "rain.wav"]]
batch = {k: pad_sequence([x[k] for x in items], batch_first=True) for k in items[0]}
with torch.no_grad():
    audio_embeds = model.encode_audio(batch, normalize=True)
```

## Writing text prompts

For zero-shot classification, describe each class with several short captions in full sentences, in the style of the training captions. For example, "A cello plays a slow melody." or "A man gives a lecture." Cover the different kinds of sound in the class. Avoid bare labels ("speech", "dog") and negations ("no background music"). Average the prompt embeddings of each class. Before taking the top class, subtract each class's mean score over the clips.

## Input notes

- The input audio can have any sample rate and any number of channels. `preprocess` averages multi-channel audio to mono and resamples it to 32 kHz. The front end is a 128-bin log-mel spectrogram (50 Hz to 16 kHz, 320-sample hop), cut into non-overlapping 16x16 patches. This gives 50 tokens per second of audio.
- The models were trained on clips of at most 30 s (length buckets of 6.9, 9.0, 13.0, 22.6 and 30.1 s). The benchmark scores above use only the first 30 s of each clip. The model accepts longer clips, but this is not evaluated. Split long recordings into segments of up to 30 s and average or compare the segment embeddings. Cost grows quadratically with length (full attention).
- The text tower takes English text. The tokenizer is case-sensitive (GPT-2 style BPE, 256-token context) and the training captions use normal sentence case. Text written entirely in capitals (for example some speech transcripts) tokenizes into rare pieces and scores worse. The paper's evaluation lowercases a text if it is all capitals and has at least three words. Do the same for such inputs, or write captions in normal case.
- Both towers are used in float32 here. Training used bf16 autocast.

## Intended use and limitations

Intended use: zero-shot audio tagging and classification, audio-text retrieval, audio embeddings for downstream classifiers, and data curation (for example filtering or ranking audio by text queries). The small models are meant to be cheap to run.

Limitations:
- Text is English only. The corpus contains speech in many languages, but captions are English. Multilingual text queries are not supported.
- The training data is about 45% speech and 22% music by predicted label, so speech and music are better covered than rare sound events. Sound-event scores saturated earlier in the scaling study than speech and music scores.
- Most captions were generated by the audio-language models Qwen3-Omni and MOSS-Audio (471.2M of the 500M-sample pool before the 30 s cut, 94%), so the model inherits their wording and errors.
- Not evaluated for audio longer than 30 s, for noisy-text or non-English queries, or for safety-critical use.

## Training data

LAION-Audio-XL contains 366,006,046 audio-text pairs with audio of at most 30 s. They were selected from 1.48B collected audio samples (316 academic datasets, internet datasets, Common Crawl, and Creative Commons YouTube videos, which make up most of the raw pool). Unreadable and silent audio, exact and near duplicates, and audio overlapping with the MAEB, HEAR and MSEB evaluation sets are removed. A taxonomy-based, coverage-aware procedure then selects the samples. The mixture is 44.8% speech, 22.4% music, 16.6% designed sound effects and 16.2% other. Samples without a source description get a short (about 12 words) and a long (about 29 words) caption from Qwen3-Omni-30B-A3B-Instruct and MOSS-Audio-8B-Thinking. Training picks one at random.

About 94% of the samples carry a Creative Commons licence. Audio from sources whose licence allows redistribution is released in [laion/laion-audio-xl](https://huggingface.co/datasets/laion/laion-audio-xl). The other clips are released as links with captions and metadata.

## Training

The models were trained from scratch with a standard CLIP (InfoNCE) loss, AdamW (betas 0.9/0.98, weight decay 0.2), a warmup-stable-decay learning-rate schedule, gradient clipping 1.0, bf16 autocast and a learnable logit scale (initial 1/0.07, capped at 300). Audio is batched by length bucket with a budget of 49,152 audio tokens per GPU batch. The audio tower is a NaFlex ViT with axial RoPE, RMSNorm, SwiGLU, LayerScale, one register token and attention pooling. The text tower is a bidirectional transformer with RoPE, RMSNorm, SwiGLU and QK-norm (50,260-token vocabulary).

| Model | Audio tower (width x depth) | Text tower (width x depth) | Embedding dim |
|---|---|---|---|
| XXS | 224 x 12 | 224 x 12 | 224 |
| XS | 320 x 12 | 320 x 12 | 320 |
| S | 512 x 12 | 512 x 11 | 512 |
| M | 640 x 12 | 640 x 11 | 640 |
| L | 1024 x 12 | 960 x 11 | 960 |

## Evaluation code

The benchmarks (MAEB, MSEB, HEAR) are run with the audio extension of [CLIP_benchmark](https://github.com/LAION-AI/clip_benchmark), which loads these models with the same OpenCLIP calls as above.

## License

Apache 2.0.

## Citation

```bibtex
@misc{wijngaard2026laionaudioxlwebscalecorpusscaling,
      title={LAION-Audio-XL: A Web-Scale Corpus and Scaling Studies for Contrastive Language-Audio Pretraining},
      author={Gijs Wijngaard and Felix Förster and Ross Wightman and Marianna Nezhurina and Christoph Schuhmann and Jenia Jitsev and A. Sophia Koepke},
      year={2026},
      eprint={2611.11592},
      archivePrefix={arXiv},
      primaryClass={cs.SD},
      url={https://arxiv.org/abs/2611.11592},
}
```
