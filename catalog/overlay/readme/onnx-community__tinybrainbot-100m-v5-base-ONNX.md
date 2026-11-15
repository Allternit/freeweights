# tinybrainbot-100m-v5-base (ONNX)


This is an ONNX version of [nkthebass/tinybrainbot-100m-v5-base](https://huggingface.co/nkthebass/tinybrainbot-100m-v5-base). It was automatically converted and uploaded using [this Hugging Face Space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).


## Usage with Transformers.js


See the pipeline documentation for `text-generation`: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline


---


# TinyBrainBot-100M-v5-Base

A **100M-parameter** base model trained from scratch on **29.6B tokens**, as a plain Llama (`LlamaForCausalLM`): no custom
code. It is [TinyBrainBot-100M-v3-Base](https://huggingface.co/nkthebass/tinybrainbot-100m-v3-base) continued for 4.6B
tokens with knowledge-dense data, and it beats it on every Open SLM Leaderboard task, without any benchmark training data.

## Scores

Zero-shot, full test sets, acc_norm; *(raw acc)* underneath. Intelligence Index from the
[Open SLM Leaderboard](https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard).

| Model | Params | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| **TinyBrainBot-100M-v5-Base** (this model) | 100.1M | **26.07** | **34.98** | **57.15** | **34.47** | **67.52** | 47.00 |
| &nbsp;&nbsp;*(raw acc)* | | *24.87* | *30.83* | *62.92* | *30.29* | *67.57* | *47.00* |
| TinyBrainBot-100M-v3-Base (previous) | 100.1M | 20.97 | 32.62 | 54.67 | 30.12 | 66.21 | 37.40 |
| void.1 | 90.2M | 24.38 | 39.5 | 49.3 | 29.4 | 67.2 | 43.7 |
| MobileLLM-R1-140M-base | 140M | 24.64 | 33.8 | 49.9 | 24.7 | 63.2 | 65.7 |
| BananaMind-2-Pro | 139M | 24.96 | 42.8 | 53.6 | 27.8 | 67.5 | 38.2 |
| GPT-X2.5-135M | 135M | 25.17 | 40.6 | 51.8 | 29.2 | 69.4 | 38.4 |

Other models' numbers are from the leaderboard.

### Arithmetic it never trained on

ArithMark-3 is kept honest: on 1,380 held-out arithmetic problems in topics and wordings the model never saw, it scores
**40.7**, close to its public 47.0.

## Quick start

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
tok = AutoTokenizer.from_pretrained("nkthebass/tinybrainbot-100m-v5-base")
model = AutoModelForCausalLM.from_pretrained("nkthebass/tinybrainbot-100m-v5-base")
ids = tok("The water cycle begins when the sun heats water in oceans and lakes, causing it to", return_tensors="pt")
print(tok.decode(model.generate(**ids, max_new_tokens=24, do_sample=False)[0]))
```

GGUF files for llama.cpp, LM Studio, Ollama and Jan: F16 (201 MB), Q8_0 (107 MB) and Q4_K_M (66 MB), with
`add_space_prefix=false` set so they tokenize exactly like transformers (greedy output matches).

This is a **base model**: it continues text and does not chat.

## Model

| | |
|---|---|
| Parameters | 100.1M (75.5M non-embedding + 24.6M tied embedding) |
| Shape | hidden 768, 12 layers, 12 query heads of 64 with 4 KV heads (GQA), SwiGLU 2048, RMSNorm, RoPE |
| Vocabulary | 32,000 SentencePiece |
| Context | 1,024 tokens |

## Training

**29.6B tokens**: the 25.06B of 100M-v3-Base, then 4.56B tokens in five stages, each re-warming the learning rate
(peak 3e-4 to 6e-4) and decaying it again. The published weights are the final step of the last stage (step 113,000),
not a merge.

| Continuation data (4.56B tokens) | Approx. share |
|---|--:|
| Q&A and facts: our distilled sets, GooAQ, FactBase-DCLM, finephrase FAQ, ELI5 | 30% |
| Web: DCLM-Ultra-1.1, ClimbMix, top-scored FineWeb-Edu pages (score 4-5) | 23% |
| Textbooks: Cosmopedia (incl. SmolLM cosmopedia-v2, school-level audiences), WikiHow | 21% |
| Wikipedia (dense and Simple English) | 11% |
| Commonsense, how-to and writing (our distilled sets, finephrase tutorials) | 6.5% |
| Arithmetic (our drills, Orca-Math, UltraData-Math) | 4.5% |
| Grade-school science Q&A (final stage only) | 3% |
| Narrative (Gutenberg, BookCorpus) | 1% |

**Grade-school science Q&A.** The final stage includes about 420k grade-school science questions with short explained
answers, written by Ling-3.0-Flash: no answer options, and any item sharing an 8-word phrase with an ARC question was
removed before training.

No benchmark train or test data was used in the continuation.

## Evaluation

```
lm_eval --model hf --model_args pretrained=nkthebass/tinybrainbot-100m-v5-base,dtype=float32 --tasks hellaswag,arc_easy,arc_challenge,piqa --num_fewshot 0
python bencharithmark-3.py --model nkthebass/tinybrainbot-100m-v5-base --dtype float32
```

## Limitations

A 100M base model: good at short factual and commonsense continuations for its size, but open-ended generation is
limited and can be wrong. Not aligned or safety-tuned. An instruct version is planned.
