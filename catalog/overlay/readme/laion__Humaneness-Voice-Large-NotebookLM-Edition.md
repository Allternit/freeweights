# Humaneness Voice Large — NotebookLM Edition

<!-- notebooklm-experimental-training-data-notice -->
> **Experimental release — training-data filtering is incomplete.** This model is experimental and currently suffers from insufficient filtering of its training data, including unreliable language labels and uneven audio quality. Output quality, pronunciation and language accuracy can therefore vary substantially. Cleaner reference audio in this demo does not undo problems learned during training.
<!-- end-notebooklm-experimental-training-data-notice -->

Generate a two-person podcast conversation from a written dialogue and two clean voice references. This is the user's listening-selected **NotebookLM + rank 64 · final 652**, with its adapter already merged at scale 1. Download the root weights and run inference directly; do not apply the included adapter a second time.

The model begins with [Humaneness Voice Large 1.3 Alpha](https://huggingface.co/laion/Humaneness-Voice-Large-1.3-Alpha), receives a three-epoch full fine-tune on filtered two-speaker podcasts, and then a small rank-64 quality-ladder fine-tune. It produces the entire requested exchange as one acoustic sequence. It is not a pipeline that separately synthesizes each turn and joins files.

**Current language recommendation:** English and German are the strongest new-text conditions in this study. Spanish is mixed. French has very high automatic ASR word error despite checked French references and should be treated as an unreliable stress condition, not reliable French support. Listen and inspect the transcripts before use.

**Start here:** [Podcast prompting guide](PODCAST_PROMPTING.md) · [Inference script](podcast_infer.py) · [Training and lineage](TRAINING.md) · [Existing held-out comparison](https://laion-humaneness-voice-large-podcast-listening.static.hf.space/lora-comparison.html)

## Install and generate

Use a CUDA GPU with sufficient memory, a recent compatible PyTorch installation, and Python 3.11 or newer. The tested JUPITER environment used PyTorch 2.9.1 and Transformers 5.14.1. CPU-only inference and other precision modes are not validated here.

```bash
hf download laion/Humaneness-Voice-Large-NotebookLM-Edition --local-dir notebooklm-edition
cd notebooklm-edition
pip install -r requirements.txt
python podcast_infer.py --model . --dialogue examples/dialogue.json \
  --reference-s1 examples/en-S1.wav --reference-s2 examples/en-S2.wav \
  --seed 20261103 --output conversation.wav
```

The first invocation also downloads the separately licensed [MOSS Audio Tokenizer v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2). The model's custom implementation requires trust_remote_code; inspect the supplied code before running it. Supply your own authorized clean single-speaker WAV references to change the voices. The provided reference files are original-media crops with source provenance in examples/reference-provenance.json.

## What the model receives

Two distinct S1/S2 identity-reference blocks precede the prompt. Each reference must cover 5.04–14.96 seconds; longer input files are cropped before encoding. Optional strictly earlier conversation may supply up to 60 seconds of context. The GENERAL block describes the overall performance. SCRIPT contains alternating speaker labels, English delivery directions, literal words in the requested language, and duration/pause cues. The CLI builds the exact trained ChatML serialization and preserves all audio placeholders. The generic base-model single-speaker helper does not implement this podcast contract.

S1 and S2 are local routing labels for the two recordings, not global identities, registered personal names or spoken words. English, German, French and Spanish are the focus of the HQ demonstrations. Dutch was present in the first full fine-tune but excluded from the quality adapter because publisher labels were unreliable; Dutch performance is not advertised.

## Architecture and sampling

The architecture is the Large MOSS Local Transformer family: a 36-layer Qwen3-family semantic transformer with 2,560-dimensional states and a one-layer local acoustic transformer using the same width. Twelve codebooks are generated at each 80-ms acoustic frame, or 150 codec indices per second. MOSS-v2 decodes the result to 48-kHz mono audio. The tokenizer and network architecture were not expanded for speaker routing.

The reference command uses audio temperature 1, top-p 0.95, top-k 50, repetition penalty 1, and CFG 1. Whole-dialogue generation is stochastic. Requested durations and speaker switches are learned instructions, not hard constraints or forced waveform edits. Start with two short turns, then try longer dialogues.

## Evidence and limits

The user selected this checkpoint after listening. The earlier frozen 50-task comparison gave this adapter CE 6.079, genuineness 3.959 and mean per-clip ASR WER 11.44%; its NotebookLM full-fine-tuned parent gave 6.084, 3.943 and 7.76%. Those metrics do not establish an overall automatic improvement. They also do not measure speaker-switch correctness. The HQ reference study uses new text and training-domain identities; it is a demonstration, not a held-out-speaker benchmark. All raw model-predicted scores and prompts are preserved.

## License and intended use

The released fine-tuned weights are CC BY 4.0; see LICENSE and NOTICE.md. Upstream code, tokenizer assets, the external codec, and source recordings retain their own terms. Research and authorized dataset augmentation are recommended uses. Use only voices for which you have appropriate permission; do not use the model for deceptive impersonation. Test quality, language accuracy and speaker stability before any production use. LAION does not endorse generated statements or speaker identities.

## HQ reference listening examples

[Listen to all 30 dialogues with both original HQ voice references](https://laion-humaneness-voice-large-podcast-listening.static.hf.space/hq-references.html). Ten short exchanges, ten approximately 38-second conversations, and ten up to one minute. The examples below are automatically selected by CE, production quality and WER, rather than claimed to be a blinded human ranking.

Reference revision 2 uses different diarized speakers from the SAME HQ training-source episode. Each actual crop passes background 4.0, PQ 7.5 and CE 5.5; stored text and fresh ASR pass an explicit four-language heuristic. This is not certified acoustic language identification. Crops can lie outside the original episode score windows and are therefore scored independently. GENERAL is empty, matching podcast SFT; delivery directions remain inline. The original diagnostic run is retained in the Space.

| Group | N | CE ↑ | PQ ↑ | Genuineness ↑ | Mean per-clip WER ↓ | Actual seconds |
|---|---:|---:|---:|---:|---:|---:|
| all | 30 | 6.186 | 7.947 | 4.000 | 24.4% | 37.11 |
| short | 10 | 6.177 | 7.953 | 4.128 | 18.4% | 17.91 |
| medium | 10 | 6.210 | 7.960 | 3.985 | 27.5% | 38.35 |
| long | 10 | 6.171 | 7.927 | 3.887 | 27.4% | 55.07 |

| Language | N | Mean per-clip WER ↓ |
|---|---:|---:|
| en | 9 | 1.3% |
| de | 9 | 6.3% |
| fr | 6 | 94.9% |
| es | 6 | 16.0% |

These are model/ASR estimates. New texts and conditioning differ from the older held-out comparison, so this table is not a controlled before/after improvement claim. Audio highlights require WER ≤15%, PQ ≥7.5 and CE ≥5.5, prefer one per language, then fill to four by CE/PQ/WER. Every result, including failures, remains in the full grid.

**short-en-learning** — CE 6.38, PQ 8.08, WER 0.0%; 17.8 seconds.

<audio controls preload="none" src="https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-en.mp3"></audio>

[Listen / download](https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-en.mp3)

**short-de-train** — CE 6.33, PQ 8.10, WER 0.0%; 17.9 seconds.

<audio controls preload="none" src="https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-de.mp3"></audio>

[Listen / download](https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-de.mp3)

**short-es-radio** — CE 6.33, PQ 8.09, WER 0.0%; 17.9 seconds.

<audio controls preload="none" src="https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-es.mp3"></audio>

[Listen / download](https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-es.mp3)

**short-en-walking** — CE 6.31, PQ 8.02, WER 0.0%; 17.8 seconds.

<audio controls preload="none" src="https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-en.mp3"></audio>

[Listen / download](https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition/resolve/main/examples/generated-en.mp3)
