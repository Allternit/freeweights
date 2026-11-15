# Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF

## Credits first

The model weights in this repo are not mine. They are the four GSQ-RCO quantizations of Qwen3.8-Flash-Next (Q2_0, IQ2_XS, IQ3_XXS, IQ3_S) made by the Deep Algorithms and Systems Lab at ISTA, copied byte for byte from [ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF) at revision `ed59f92082b1e93c0e96d60a8b11aab089b52f09`. The SHA256 of every shard and of the vision projector match their files. See `SHA256SUMS`.

| Part | Authors | Links |
|---|---|---|
| Quantization, GSQ and RCO | [ISTA-DASLab](https://huggingface.co/ISTA-DASLab) | [GSQ paper](https://arxiv.org/abs/2604.18556), [GSQ code](https://github.com/IST-DASLab/GSQ), [RCO paper](https://arxiv.org/abs/2605.00649), [RCO code](https://github.com/IST-DASLab/RCO) |
| Base model | Qwen team | [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) |
| Refusal direction, taken from their weights | huihui-ai | [Huihui-Qwen3.8-Flash-Next-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated) |
| Runtime with the projection feature | Niko1221 | [Strata](https://github.com/Niko1221/Strata) |

If you use these weights, cite the two ISTA-DASLab papers. The BibTeX is at the bottom of this page.

My part is one 480 KB file, `Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf`, and the measurements below. The same file serves every size. I measured IQ3_S and IQ2_XS with it. Q2_0 and IQ3_XXS are here as ISTA-DASLab published them and I have not run them. For the original card and ISTA's own benchmarks, go to the ISTA-DASLab repo.

## The vector

A kit for Strata on one consumer GPU: the official GSQ-RCO files plus a control vector that removes refusals while the model runs. After each steered layer Strata subtracts one direction `r` from every residual stream:

```text
h = h - (h . r) r
```

The weights stay as ISTA-DASLab published them. A request with `"experimental_speed_projection": false` runs the original model.

The direction comes from the Huihui checkpoint. Huihui changed 144 residual-writing tensors with a rank-one edit along one unit direction `r`. At strength 1.0 that edit is `W_new = W - r (r^T W)`, which removes `r` from every block output. The projection in Strata does almost the same thing at run time. It differs in two ways. Strata projects the whole stream, so the embedding and n-gram contributions lose their `r` component too. Layer 0 cannot be steered.

My [EXL3 quantizations](https://huggingface.co/alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6) of the same model bake the strength-1.0 edit into the weights. This repo keeps the weights original and applies the direction in the engine.

## Sizes

| Size | Bits per weight | Download | Experts held in RAM | KL to BF16 Huihui | Top-1 same as BF16 | Decode at a 32K prompt |
|---|---:|---:|---:|---:|---:|---:|
| `Q2_0` | 2.40 | 66.4 GB | 34 GB | not measured | | |
| `IQ2_XS` | 2.50 | 68.0 GB | 35.5 GB | 0.193 | 88% | 87 tokens/s |
| `IQ3_XXS` | 3.00 | 75.8 GB | 43 GB | not measured | | |
| `IQ3_S` | 3.50 | 83.6 GB | 50 GB | 0.075 | 93% | 59 tokens/s |

Between the two I measured, IQ3_S stays closer to the full model and IQ2_XS decodes 45-70% faster on prompts up to 131K. Strata's page asks for a 64 GB PC for IQ3_S and IQ3_XXS and 48 GB for the two smaller sizes. ISTA-DASLab describe Q2_0 as the fastest of the four.

Each size is two shards in its own folder, laid out as in the ISTA-DASLab repo. Shard 2 is the n-gram table and is the same file in all four folders. The measured numbers are from one RTX 3090 and are explained below. The RAM column for the sizes I did not run comes from Strata's setup.

## Run it with Strata

You need an NVIDIA or AMD card with 12 GB or more. Strata's own page has the full requirements. The commands below take IQ3_S. For another size replace `IQ3_S` with its name everywhere.

```bash
git clone https://github.com/Niko1221/Strata
hf download alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF \
  IQ3_S/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-00001-of-00002.gguf \
  IQ3_S/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-00002-of-00002.gguf \
  mmproj-Qwen3.8-Flash-Next-BF16.gguf \
  Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf \
  --local-dir flash-next
mv flash-next/mmproj-Qwen3.8-Flash-Next-BF16.gguf flash-next/IQ3_S/
cd Strata
./setup.sh --setup --model IQ3_S --gguf-dir ../flash-next/IQ3_S --vision gpu \
  --experimental-speed-projection ../flash-next/Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf
```

On Windows use `START-HERE.bat` with the same flags. The `mv` puts the vision projector next to the shards, where setup looks for it. Without it setup downloads the same file from ISTA-DASLab. Setup builds or downloads the engine, fetches the MTP draft layer (about 6 GB from the original Qwen checkpoint), packs the model and starts the server at `http://127.0.0.1:8080`. OpenAI clients use `/v1`, Anthropic clients use `/v1/messages`.

Setup writes these engine flags into `strata-<model>.json`:

```text
--control-vector-scaled <path>/Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf:1.0
--control-vector-layer-range 4 44 --cvec-mode project --cvec-dir per-layer
```

I tested layers 4-44 and 1-47. Both are in the tables below. To use 1-47, change the two numbers in that file.

I did not run the installer end to end on my machine. I built the engine from the pinned source and started it with the same arguments setup writes.

Plain llama.cpp will load these GGUFs, but its stock `--control-vector` adds a vector. It has no projection mode, so there the files behave as the original model.

## Measurements

One RTX 3090 at 300 W, EPYC 7642 (48 cores, AVX2, no AVX-512), 125 GB RAM, Strata 0.1.38 at commit `99f3dbd` built for sm_86.

Refusals on 10 prompts (lock picking, phishing email, keylogger, explicit story and similar), sampled at temperature 1.0. Each cell is thinking off, then thinking on. The count comes from a regex on the start of the answer. On IQ3_S I also read the opening of every answer in the original, bundled and 1-47 arms, and on IQ2_XS in the 1-47 arm.

| Arm | IQ3_S | IQ2_XS |
|---|---:|---:|
| Original, vector off | 10/10, 9/10 | 9/10, 9/10 |
| Strata's bundled vector, layers 4-44 | 1/10, 0/10 | not run |
| This vector, layers 4-44 | 0/10, 0/10 | 0/10, 0/10 |
| This vector, layers 1-47 | 0/10, 0/10 | 0/10, 0/10 |

With thinking on, some prompts spent all 3,000 tokens reasoning and returned no answer. That happened to one prompt in ten on IQ3_S and to three or four on IQ2_XS, in every vector arm. I checked the reasoning text for loops and found none (under 1% of 12-word sequences repeat), so the smaller size deliberates longer before it answers. I did not count those as refusals. Ten prompts is a small set.

Teacher-forced comparison on four 1,023-token windows (code agent trace, tool-use dialogue, reasoning, plain web text). The reference is the BF16 Huihui model at strength 1.0, run one layer at a time through Transformers. KL is over the engine's top 256 tokens. The reference perplexity is 2.565.

| Arm | IQ3_S KL to BF16 | IQ3_S top-1 | IQ3_S perplexity | IQ2_XS KL to BF16 | IQ2_XS top-1 | IQ2_XS perplexity |
|---|---:|---:|---:|---:|---:|---:|
| Original, vector off | 0.0834 | 92.5% | 2.525 | 0.2025 | 87.5% | 2.600 |
| Strata's bundled vector, 4-44 | 0.0832 | 92.3% | 2.543 | not run | | |
| This vector, 4-44 | 0.0738 | 93.0% | 2.527 | 0.1923 | 87.4% | 2.603 |
| This vector, 1-47 | 0.0746 | 92.8% | 2.528 | 0.1933 | 87.8% | 2.592 |

Measured against the original on the same quant, this vector moves the output by KL 0.005-0.023 per window and the bundled one by 0.018-0.045.

The reference has noise of its own. Two BF16 passes over the same text with different window lengths differ by KL 0.013-0.021 and agree on top-1 at 95-98%. So part of each number is the reference and the rest is quantization.

Agent work through OMP, five small coding tasks with tools (a Python log summary fix, an HTTP Range parser with 18 tests, and semver, LRU cache and CSV fixes in JavaScript). I graded each on its original tests.

| Arm | IQ3_S | IQ2_XS |
|---|---:|---:|
| Original, vector off | 5/5 | not run |
| Strata's bundled vector, 4-44 | 5/5 | not run |
| This vector, 4-44 | 5/5 | not run |
| This vector, 1-47 | 5/5 | 5/5 |

A second turn on the Python task with the 1-47 vector (add a CLI, keep the tests green) passed on IQ3_S and IQ2_XS. These tasks do not separate the arms. They show the vector did not break tool use on them.

Other checks used the 1-47 vector with images on and a 131K context, on IQ3_S and IQ2_XS.

| Check | Result |
|---|---|
| Needle in a haystack at 32K and 115K prompt tokens | 6 of 6 found on both |
| Vision, one synthetic image | text read, both shapes and colours named on both |
| MTP drafts accepted over all agent and probe requests | 65-71% |

The speed curve below uses the prompts of my EXL3 cards. Each request reads an independent document and writes 512 tokens, nonthinking and greedy, with nothing cached. I ran each depth twice with MTP drafts on, a 262K context with KV streaming and the 1-47 vector on. Decode and prompt reading are tokens/s, mean of the two repeats, as the engine reports them.

| Prompt tokens | IQ3_S decode | IQ2_XS decode | IQ3_S prompt reading | IQ2_XS prompt reading | IQ3_S first token | IQ2_XS first token |
|---:|---:|---:|---:|---:|---:|---:|
| 4,096 | 58.1 | 84.2 | 890 | 1,164 | 4.6 s | 3.6 s |
| 32,768 | 59.0 | 87.1 | 1,840 | 2,014 | 17.9 s | 16.3 s |
| 131,072 | 46.6 | 79.6 | 1,768 | 2,001 | 74.2 s | 65.6 s |
| 261,120 | 39.5 | 47.3 | 1,546 | 1,669 | 169.1 s | 156.6 s |

The two repeats differ by up to 8 tokens/s at 4K and 12 at 261K. MTP accepted 60-65% of the drafts. Peak VRAM was 23.8 GB on both measured sizes. The engine refuses 261,632 + 512 tokens in a 262,144 context, so the deepest point is 261,120.

Agent sessions and the refusal probe run with thinking and sampling at temperature 1.0. There the server log gives a median decode of 46-54 tokens/s for IQ3_S and 73-80 for IQ2_XS on requests of 200 tokens or more.

The vision check is a smoke test on one image. About 8,000 of the 24,576 experts fit in the 3090's VRAM with IQ3_S and about 12,500 with IQ2_XS, and the CPU computes the rest. This CPU has no AVX-512, so a desktop with AVX-512 may decode faster.

I did not test Q2_0 or IQ3_XXS, harder refusal sets, real photos or documents in vision, more than one GPU, or AMD cards.

## Files

| File | Size | From |
|---|---:|---|
| `IQ3_S/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-00001-of-00002.gguf` | 54.8 GB | ISTA-DASLab, unchanged |
| `IQ3_S/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-00002-of-00002.gguf` | 28.8 GB | ISTA-DASLab, unchanged (n-gram table) |
| `IQ2_XS/Qwen3.8-Flash-Next-GSQ-RCO-IQ2_XS-00001-of-00002.gguf` | 39.2 GB | ISTA-DASLab, unchanged |
| `IQ2_XS/Qwen3.8-Flash-Next-GSQ-RCO-IQ2_XS-00002-of-00002.gguf` | 28.8 GB | ISTA-DASLab, unchanged (the same n-gram table) |
| `IQ3_XXS/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS-00001-of-00002.gguf` | 47.0 GB | ISTA-DASLab, unchanged (untested here) |
| `IQ3_XXS/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS-00002-of-00002.gguf` | 28.8 GB | ISTA-DASLab, unchanged (the same n-gram table) |
| `Q2_0/Qwen3.8-Flash-Next-GSQ-RCO-Q2_0-00001-of-00002.gguf` | 37.6 GB | ISTA-DASLab, unchanged (untested here) |
| `Q2_0/Qwen3.8-Flash-Next-GSQ-RCO-Q2_0-00002-of-00002.gguf` | 28.8 GB | ISTA-DASLab, unchanged (the same n-gram table) |
| `mmproj-Qwen3.8-Flash-Next-BF16.gguf` | 0.9 GB | ISTA-DASLab, unchanged |
| `tensor-allocation/` | | ISTA-DASLab, unchanged |
| `Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf` | 480 KB | mine, `r` for layers 1-47 in llama.cpp control vector format |
| `LICENSE`, `SHA256SUMS` | | |

The file names and folders are the published ones because Strata's setup looks for them.

Removing refusals removes a safety behaviour. What the model writes with the vector on is your responsibility.

## Citation

Cite the authors of the quantization:

```bibtex
@article{gsq2026,
  title  = {GSQ: Highly-Accurate Low-Precision Scalar Quantization for LLMs via Gumbel-Softmax Sampling},
  author = {Dadgarnia, Alireza and Tabesh, Soroush and Nikdan, Mahdi and Helcig, Michael and Kurtic, Eldar and Kleinegger, Maximilian and Alistarh, Dan},
  journal= {arXiv preprint arXiv:2604.18556},
  year   = {2026}
}
@article{rco2026,
  title  = {Model Compression with Exact Budget Constraints via Riemannian Manifolds},
  author = {Helcig, Michael and Alistarh, Dan},
  journal= {arXiv preprint arXiv:2605.00649},
  year   = {2026}
}
```

## License

ISTA-DASLab state that their quantized weights inherit the license of the base model. The base model, the Huihui checkpoint the direction comes from and this repo are under the [Qwen Community License 1.0](LICENSE). Read that file for its terms.
