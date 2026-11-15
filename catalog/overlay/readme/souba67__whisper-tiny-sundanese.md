# whisper-tiny-sundanese

Sundanese fine-tune of `openai/whisper-tiny`, with ONNX weights for in-browser
inference through transformers.js.

## Accuracy

| model | WER |
|---|---|
| stock `openai/whisper-tiny` | 83.4% |
| this fine-tune | **10.6%** |

Measured in Kaggle notebook `phase_b_whisper_sundanese89b32c3026`, version 2.
OpenSLR SLR44, 2,401 female and 1,812 male utterances for 4,213 total, split
3,791 train and 422 test with `train_test_split(test_size=0.1, seed=42)`.
Normalisation was `.strip().lower()` on both sides and nothing else, so
punctuation mismatches count as errors. WER moves by several points on
normalisation choices alone, which is why the rule is stated here.

An independent re-run on 13 August 2026 rebuilt the corpus and the split from
scratch and scored the PyTorch weights at **10.44%** on 60 clips of that test
split, which is the same number within sampling noise and confirms the split is
genuinely held out.

## Microphone accuracy: 69.68% WER

SLR44 is studio read speech from a small set of speakers, and the test split
above is a random slice of those same recordings. Same speakers, same
conditions, same read-aloud prompts. On 13 August 2026 the model was measured on
audio that shares none of that.

Sixty utterances, written for the purpose and checked against SLR44 for overlap
(no exact match, no shared 5-gram), read into a laptop's built-in microphone and
captured through a browser at 16kHz mono with echo cancellation, noise
suppression and auto gain on, which is the audio path the in-browser demo uses.
531 reference words. Same `.strip().lower()` normalisation as above.

| | SLR44 read speech | laptop microphone |
|---|---|---|
| stock `openai/whisper-tiny` | 83.4% | 87.01% |
| this fine-tune | 10.6% | **69.68%** |
| advantage | 73 points | 17 points |

The fine-tune is still the better model on real audio, by 17 points, so use it
rather than stock. But roughly three quarters of its headline advantage belongs
to SLR44's recording conditions rather than to the language. Quoting 10.6% as
this model's accuracy without the second column would be misleading, which is
why both are here.

The recordings split into a neutral half and a colloquial half. The gap between
them is vocabulary, not acoustics: 39% of the colloquial half's word tokens never
appear anywhere in SLR44, against 27% for the neutral half.

| | neutral | colloquial |
|---|---|---|
| PyTorch | 64.48% | 74.63% |
| int8 ONNX | 66.41% | 81.99% |

The audio was checked before the number was believed: 76% of its energy sits
below 1kHz with 6% above 4kHz, level varies with a std/mean ratio of 0.86, and
stock Whisper transcribes the same files into recognisable-if-wrong Sundanese.
It is speech, and the model hears it. One clip of the sixty clipped.

### Do not rank quantisations on the read-speech split

A per-channel int8 build of this decoder beats the published per-tensor one on
read speech, 10.09% against 10.82% on the full 422-clip held-out split, for 110KB
more. On the microphone recordings the ordering inverts:

| variant | read speech | laptop microphone |
|---|---|---|
| int8 per-tensor (published here) | 10.82% | **74.39%** |
| int8 per-channel | **10.09%** | 81.17% |

On the colloquial half the per-channel build reaches 93.38%. It is not published
here for that reason. If you quantise this model yourself, the clean benchmark
will not tell you which variant to ship.

## ONNX

Four variants were transcribed over the same 60 held-out SLR44 clips and scored
against the PyTorch weights. Exact match is the share of clips where the
transcript is character-for-character identical to PyTorch's, which catches a
variant that is differently wrong at a similar WER.

| variant | WER | exact match vs PyTorch | size |
|---|---|---|---|
| PyTorch | 10.44% | – | – |
| fp32 ONNX | 10.44% | 100% | 118.4MB decoder |
| **int8 ONNX** | **11.61%** | **76.7%** | **30.1MB decoder** |

The int8 files are what `dtype: 'q8'` loads, and the whole Sundanese pipeline is
40.1MB: a 30.1MB merged decoder and a 10.1MB encoder.

### The int8 files were wrong until 13 August 2026

Earlier versions of this repo shipped a `decoder_model_merged_quantized.onnx`
that was **fp32 in substance**. Dynamic quantisation left it at 118.5MB against
the fp32 file's 118.4MB, because `quantize_dynamic` does not descend into the
subgraphs of the If node a merged decoder uses unless it is told to. That was
disclosed here rather than hidden, but it was still a file whose name promised a
size it did not have.

Passing `extra_options={"EnableSubgraph": True}` fixes it: 118.4MB to 30.1MB, a
genuine fourfold shrink.

Note what this correction did to the accuracy table. The previous card reported
int8 at **100% exact match**, and that was true only because the file was fp32.
A real int8 decoder costs 1.17 points of WER and disagrees with PyTorch on
roughly a quarter of clips. The honest trade is 88MB of download for that.

Two details worth recording for anyone reproducing this:

- The quantisation was applied to the **already-published fp32 files**, not to a
  fresh export. Re-exporting with optimum 2.1.0 unties the lm_head from the token
  embedding, so the `[51865, 384]` matrix appears twice and the fp32 merged
  decoder comes out at 198.1MB instead of 118.4MB. Its int8 is 50.1MB rather than
  30.1MB, at identical accuracy. The duplication is pure download cost.
- A size check alone is not enough, and neither is an accuracy check alone. The
  broken file passed every accuracy test precisely because it was fp32, and a
  file that quantised correctly could still be silently degraded. Both gates
  have to run.

## Correction history

An earlier version of this card reported 0.00% WER and described the evaluation
clips as held out. Both were wrong. The clips were selected from the tail of the
download, but the corpus had been shuffled before splitting, so they were
training data and the score was memorisation.

On 13 August 2026 the int8 ONNX files were replaced with genuinely quantised
ones, and the accuracy table above was rewritten. The previous table's int8 row
read 100% exact match, which was accurate for the file that was then published
and is not accurate for the one published now.

Also on 13 August 2026 the microphone section stopped saying the figure was
unmeasured and started giving it. Earlier versions of this card promised a
number "when there is a run behind it". There is one now: 69.68%.

## Usage

```js
import { pipeline } from '@huggingface/transformers'
const asr = await pipeline('automatic-speech-recognition',
  'souba67/whisper-tiny-sundanese', { dtype: 'q8' })
const out = await asr(audio, { language: 'su', task: 'transcribe' })
```
