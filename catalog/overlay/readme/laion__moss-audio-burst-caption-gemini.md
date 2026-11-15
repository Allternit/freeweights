# MOSS Audio — Vocal-burst event captioning trained on Gemini captions

Describe an individual vocal burst in context, given both its start and end time in the full recording. This repository contains a **trained, separate LoRA adapter** for the pinned MOSS-Audio-8B-Instruct model. It is a text-generating caption model, distinct from the encoder-only Humaneness Ears score and localization models.

[Listen to 50 Gemini TTS acting performances with adapted captions and untuned baselines](https://laion-humaneness-ears-atlas.static.hf.space/moss-caption-grid.html) · [Gemini annotation dataset](https://huggingface.co/datasets/laion/whisper-gemini-voice-annotations) · [Companion adapter](https://huggingface.co/laion/moss-audio-voice-caption-gemini)

## Model and adaptation

Base: [OpenMOSS-Team/MOSS-Audio-8B-Instruct](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Instruct), revision `d4dc5a6d8cd79b43dcd82884c75e303b1ecd016d`. Reviewed [official source](https://github.com/OpenMOSS/MOSS-Audio/tree/66326e6e0db34f036c86a76ba005efa4830c69dd), revision `66326e6e0db34f036c86a76ba005efa4830c69dd`. MOSS combines a pretrained audio encoder, an audio-to-language adapter, DeepStack audio injections and a Qwen3 language transformer. Approximate audio token rate is 12.5 Hz. The exact instantiated base has 9,052,463,488 parameters; the repository's 8B name refers to its language-model size class.

Only rank-32 LoRA weights inside the language transformer's attention and MLP projections are trained. Base language weights, the audio encoder, the audio adapter and DeepStack mergers are frozen. The actual total parameter count including LoRA is 9,139,757,440; trainable adapter parameters are 87,293,952. This adaptation does not train a new audio encoder or a burst localization head.

## Data, labels and separation

| Task split | Examples |
|---|---:|
| Training | 80,773 |
| Validation | 4,649 |
| Test | 4,820 |

The Gemini annotation collection joins a balanced S1 selection, LAION's Got Talent, balanced 40-emotion snippets and a voice annotation POC. Splits are disjoint by exact MP3 SHA256. Burst examples share full recordings within a split and use one training example per event. The labels are machine-generated Gemini descriptions, not independently adjudicated human ground truth. Some S1 clips may have been seen in earlier Whisper score-model pretraining; they are excluded from this caption adaptation's training split.

Whole-voice supervision is the `voice_caption`. Burst supervision is an event's detailed caption. Audio, the task prompt and, for burst captioning, numeric interval endpoints are the only inputs. No transcript, class label, reference caption or Gemini score vector is included in the input. Every event has both start and end seconds.

## Training recipe and measured validation result

| Setting | Value |
|---|---|
| Epochs | 2 |
| Updates | 2,526 |
| LoRA | rank 32, alpha 64, dropout 0.05 |
| Optimizer | AdamW, weight decay 0.01 |
| Learning rate | 1e-4 peak; 5% warmup; cosine decay |
| Batch | 4 GPUs × 1 example × 16 accumulated microbatches = 64 |
| Precision / attention | BF16 / SDPA |
| Sequence cap | 8,192 tokens; dynamic lengths; oversized examples fail |
| Audio | full recording, mono 16 kHz; no event crop |
| Audio time markers | every two seconds |
| Loss | mean next-token cross entropy, assistant caption tokens only |
| Best checkpoint | checkpoint-2526 |
| Best validation loss | 1.423833 |

Validation loss is teacher-caption token prediction loss. It measures fit to Gemini text and is **not** a human caption-quality score or an event detection metric. The best epoch checkpoint is selected by this loss. Full optimizer/scheduler/RNG checkpoints are saved each epoch and every 200 updates in the training run; this lightweight public release contains the best adapter and training history, not the large optimizer states.

Gradient checkpointing is disabled because the upstream DeepStack path uses temporary forward hooks. Frozen audio modules remain in evaluation mode. `model_accepts_loss_kwargs=False` ensures correct accumulation scaling: the official MOSS loss does not consume Trainer's `num_items_in_batch`. Transformers 4.57.1 is pinned, matching the upstream recommendation; a narrow encoder output compatibility hook is included.

## Inference

Clone/download this repository, then:

```bash
pip install -r requirements.txt
python download_base.py --output base_model
python inference.py sample.wav --task burst_caption --adapter . --base-model base_model --start 1.2 --end 2.4
```

The download helper pins the base revision and verifies all four weight shard hashes. A BF16 CUDA GPU is recommended; CPU inference uses float32 and is much slower and more memory-intensive. Complete clips of up to 30 seconds match the adaptation distribution. Generation is greedy and deterministic with a configurable token limit. The burst adapter requires externally supplied timestamps; pair it with a locator to describe automatically detected intervals.

## Reproduce training

`export_sft.py` exports the published annotation TARs to this exact SFT contract. Where source audio is not redistributed, supply an `--audio-map` mapping original MP3 hashes to local TAR members. The exporter refuses a partial dataset by default and never silently invents missing audio.

```bash
python export_sft.py --help
python -m torch.distributed.run --standalone --nproc_per_node=4 train_adapter.py \
  --task burst_caption --data-root prepared \
  --base-model-dir base_model --output training_output --epochs 2
# To resume, append: --resume training_output/checkpoint-N
```

The full executed trainer, task recipe, data reader, masking and official source files are included. The upstream manifest verifies vendored source hashes. See `training_run.json`, `training_results.json`, `training/trainer_state.json`, `data_audit.json` and `base_weights_manifest.json` for evidence and exact revisions.

## Scope and limitations

These captions can describe delivery and audible affect, but they are probabilistic interpretations and may omit or hallucinate details. They do not establish a speaker's internal emotional state, identity or diagnosis. They do not replace the separate numeric emotion, VoiceNet, DNSMOS, AudioBox or Orange embedding heads: those scores are not training targets for these two text adapters. The listening demo uses 50 newly generated Gemini TTS acting performances, distinct from the Gemini-caption adaptation corpus. Humaneness Ears Medium proposes the burst intervals; the caption adapter receives the full recording and both interval endpoints. These intervals are unvalidated predictions. No Gemini reference captions are displayed. This is a qualitative listening grid rather than an independent human-rated benchmark. The untuned baseline uses the same audio and prompt with LoRA disabled. Recordings longer than 30 seconds are supplied in full but extend beyond the adaptation clip-length range.

## Credits and licensing

Original adapter weights and documentation: CC BY 4.0, LAION. Pinned MOSS base weights and vendored OpenMOSS source retain Apache 2.0, with attribution and license preserved in `upstream/LICENSE`. Audio sources retain their source terms. Dataset provenance and annotation methods are documented in the linked dataset card.

References: [MOSS Audio model card](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Instruct); [official fine-tuning documentation](https://github.com/OpenMOSS/MOSS-Audio/blob/66326e6e0db34f036c86a76ba005efa4830c69dd/finetune/FINETUNE.md); [PEFT](https://github.com/huggingface/peft); [LoRA paper](https://arxiv.org/abs/2106.09685).
