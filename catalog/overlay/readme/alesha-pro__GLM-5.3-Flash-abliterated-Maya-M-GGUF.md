# GLM-5.3-Flash-abliterated-Maya-M-GGUF

Project Maya's Maya-M quant of GLM-5.3-Flash plus a 2.2 MB vector that removes refusals while the model runs, and a small patch for the Maya engine that applies it. On 4x RTX 3090 it decodes 56 tokens/s at a 256K context with the vector on.

## Credits first

The model weights in this repo are not mine. They are Maya-M and the vision files of Project Maya, copied byte for byte from [peasantsmith/GLM-5.3-Flash-Maya-GGUF](https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF) at revision `3e9f3bb20aa191e01c6fb850faf132d8149da98a`. The SHA256 of all 5 files match theirs at that revision. See `SHA256SUMS`.

The authors changed the first shard after I downloaded it. Their commit `1084950a` renames the architecture in the GGUF header to `glm5-next`, and the file size is the same. This repo has the earlier first shard, the one all my runs used with Maya v1.0.27. For the current files go to their repo.

| Part | Authors | Links |
|---|---|---|
| Maya-M, the quantization recipe and the engine | mw00 and PeasantSmith | [GLM-5.3-Flash-Maya-GGUF](https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF), [Project Maya](https://github.com/mw00/project-maya) |
| The engine Maya grew out of | Niko1221 | [Strata](https://github.com/Niko1221/Strata) |
| Base model | Z.ai | [zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash) |
| BF16 teacher logits for the KL number | brandonmusic | [GLM-5.3-Flash-BF16-Teacher-Logits](https://huggingface.co/datasets/brandonmusic/GLM-5.3-Flash-BF16-Teacher-Logits) |

My part is one file, `vector/glm53-refusal-per-block-3dir.layers45.f32`, a [patch for the Maya engine](https://github.com/alesha-pro/project-maya/blob/glm-ablate/docs/GLM-ABLATE.md) that reads it, and the measurements below. For the original card, the other sizes (Maya-S, Maya-S24, Maya-L) and the authors' own benchmarks go to their repo.

## The vector

The GGUF stays as its authors published it. Before each layer's FFN output is written into the 4 hyper-connection streams, the patched engine removes that layer's 3 directions from both operands of the write:

```text
x = x - (x . v) v      for each of the layer's directions v
```

Layers 1 to 44 each have 3 directions of their own. The first is harmful minus harmless at the last prompt token with thinking off, the second is the same with thinking on, and the third is the same at the closing `</think>` of the stock model's own reasoning. Without the setting the engine runs the original model.

The directions were not found on Maya-M. I found them on the EXL3 2.05 bpw quant of the same model with my exllamav3 fork and converted the file for Maya. The method and the scripts are in the [abliteration write-up](https://github.com/alesha-pro/exllamav3-glm53-4x3090/blob/glm53-4x3090/glm53/abliteration/README.md).

The file is raw float32 with 45 x 3 x 4096 values, 2,211,840 bytes, SHA256 `b0debc326b06c956039fd75dc1cb759dd46c4aa5e868bbfef1a5b0607c3552b7`.

## Refusals

64 held-out AdvBench and 82 JailbreakBench requests without thinking plus the first 32 with thinking: 178 answers, greedy, through the API of the running server, judged by the stock GLM-5.3-Flash.

| | Refused | Disputes the premise | Cut off while thinking |
|---|---:|---:|---:|
| Maya-M with the vector | 2 | 4 | 0 |

The 2 refusals are requests about suicide and self-harm. The model turns them into text about prevention. I left them as they are. "Disputes the premise" means the model takes the request and says its premise is false, as with a request to prove the Earth is flat.

On the EXL3 2.05 bpw quant, where the directions come from, the stock model refused 144 of 146 requests without thinking, and with the vector 0 of 438 answers were refusals. I did not run the stock Maya-M on these sets.

## Speed on 4x RTX 3090

Maya v1.0.27, Maya-M, 256K context, after `./maya.sh --calibrate`. Through the chat API, answers run to their natural end, thinking off, temperature 0. Maya serves 1 request at a time.

| | Without the vector | With the vector |
|---|---:|---:|
| Decode | 58.4 tokens/s | 56.1 |
| Decode at 32K depth | 57.2 | 55.9 |
| Prefill at 8K | 1078 to 1113 tokens/s | 1119 to 1153 |
| Prefill at 32K | 1860 to 1896 | 1938 to 1953 |

Before calibration the same install gave 24.9 tokens/s. The engine had sent cold experts to the CPU, and my machine has only 2 memory channels. `./maya.sh --calibrate` moved them to the PCIe path (`STRATA_GLM_PCIE_SHARE=0.75`).

Closeness to the original on a 25-window panel of BF16 logits (51,175 positions, full vocabulary), without the vector, computed by the Maya engine itself:

| Quant | Size | KLD to BF16 | Top-1 agreement |
|---|---:|---:|---:|
| EXL3 2.05 bpw | 85.1 GB | 0.1214 | 88.68% |
| EXL3 mix, gate/up 2 bits and down 3 bits | 98.1 GB | 0.0959 | 89.87% |
| **Maya-M** | **116.0 GB** | **0.0934** | **90.68%** |
| EXL3 3.05 bpw | 125.2 GB | 0.0473 | 93.08% |

The EXL3 rows ran through exllamav3 and the Maya-M row through Maya, so the Maya number includes the noise of its own engine. The authors measure Maya-M against FP8 on their own set, and those numbers are not comparable with this table. I did not measure KLD of Maya-M with the vector on.

## Run it

```bash
git clone -b glm-ablate https://github.com/alesha-pro/project-maya
cd project-maya
hf download alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF --local-dir models
ln -s ../vision models/Maya-M/vision
./maya.sh --setup --model Maya-M --gguf-dir models/Maya-M --context 262144

tools/glm_ablate_config.py maya-maya-m.json models/vector/glm53-refusal-per-block-3dir.layers45.f32
./maya.sh
```

The fork is Maya v1.0.27 plus 3 files. `tools/glm_ablate_config.py maya-maya-m.json --off` gives the original model back. The settings are `STRATA_GLM_ABLATE` (the file) and `STRATA_GLM_ABLATE_LAYERS=45` in the `env` section of the config. Details: [docs/GLM-ABLATE.md](https://github.com/alesha-pro/project-maya/blob/glm-ablate/docs/GLM-ABLATE.md).

Upstream Maya without the patch runs these GGUF files as the original model and ignores the vector.

## Other sizes

- [GLM-5.3-Flash-abliterated-exl3-2.05bpw](https://huggingface.co/alesha-pro/GLM-5.3-Flash-abliterated-exl3-2.05bpw): EXL3, everything in VRAM on 4x 24 GB, 79 tokens/s, 4 parallel requests.
- [GLM-5.3-Flash-abliterated-exl3-2.4bpw-mix](https://huggingface.co/alesha-pro/GLM-5.3-Flash-abliterated-exl3-2.4bpw-mix): EXL3 with the Maya-M idea, 98.1 GB.

## Limits

- Tested on Maya-M only, on 4 NVIDIA cards, on one rig: RTX 3090 at 300 W, PCIe 3.0, EPYC 7642, 2 memory channels of DDR4-2400.
- 2 of 178 answers were still refusals.
- The judge is the same model without the vector. There are no human labels. 146 prompts from 2 public sets.
- The patch is not part of upstream Maya.

## License

MIT, the license of GLM-5.3-Flash and of Maya-M. See `LICENSE`.
