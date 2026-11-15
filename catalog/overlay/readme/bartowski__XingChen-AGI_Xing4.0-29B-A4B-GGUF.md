## Llamacpp imatrix Quantizations of Xing4.0-29B-A4B by XingChen-AGI

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b12174">b12174</a> for quantization.

Original model: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B

**Model details:**
- Parameter count: 31B (source checkpoint)
- Input support: text
- Speculative decoding: yes (MTP) - [details](#mtp)
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

No prompt format found, check original model page

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q4_K_M.gguf) (20.06GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [XingChen-AGI_Xing4.0-29B-A4B-bf16.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/tree/main/XingChen-AGI_Xing4.0-29B-A4B-bf16) | bf16 | 62.45GB | true | Full BF16 weights. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q8_0.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q8_0.gguf) | Q8_0 | 33.22GB | false | Extremely high quality, generally unneeded but max available quant. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q6_K_L.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q6_K_L.gguf) | Q6_K_L | 28.44GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q6_K.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q6_K.gguf) | Q6_K | 27.19GB | false | Very high quality, near perfect, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q6_K_S.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q6_K_S.gguf) | Q6_K_S | 26.00GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q5_K_M.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q5_K_M.gguf) | Q5_K_M | 24.00GB | false | High quality, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q5_K_S.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q5_K_S.gguf) | Q5_K_S | 22.41GB | false | High quality, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q4_K_L.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q4_K_L.gguf) | Q4_K_L | 21.69GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q4_K_M.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q4_K_M.gguf) | Q4_K_M | 20.06GB | false | Good quality, default size for most use cases, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ4_NL.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ4_NL.gguf) | IQ4_NL | 20.01GB | false | Similar to IQ4_XS, but slightly larger. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q4_1.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q4_1.gguf) | Q4_1 | 19.72GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q4_K_S.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q4_K_S.gguf) | Q4_K_S | 18.89GB | false | Slightly lower quality with more space savings, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q4_0.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q4_0.gguf) | Q4_0 | 17.99GB | false | Legacy format, kept for compatibility with older tools. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ4_XS.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ4_XS.gguf) | IQ4_XS | 17.98GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ3_M.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ3_M.gguf) | IQ3_M | 17.04GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q3_K_L.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q3_K_L.gguf) | Q3_K_L | 16.85GB | false | Lower quality but usable, good for low RAM availability. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q3_K_M.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q3_K_M.gguf) | Q3_K_M | 16.10GB | false | Low quality. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ3_XS.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ3_XS.gguf) | IQ3_XS | 14.92GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q3_K_S.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q3_K_S.gguf) | Q3_K_S | 14.92GB | false | Low quality, *not* recommended. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ3_XXS.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ3_XXS.gguf) | IQ3_XXS | 14.43GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [XingChen-AGI_Xing4.0-29B-A4B-Q2_K.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-Q2_K.gguf) | Q2_K | 12.84GB | false | Very low quality but surprisingly usable. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ2_M.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ2_M.gguf) | IQ2_M | 12.53GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ2_S.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ2_S.gguf) | IQ2_S | 11.24GB | false | Low quality, uses SOTA techniques to be usable. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ2_XS.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ2_XS.gguf) | IQ2_XS | 10.56GB | false | Low quality, uses SOTA techniques to be usable. |
| [XingChen-AGI_Xing4.0-29B-A4B-IQ2_XXS.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-IQ2_XXS.gguf) | IQ2_XXS | 10.32GB | false | Very low quality, uses SOTA techniques to be usable. |

Download a specific file:

```
hf download bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF --include "XingChen-AGI_Xing4.0-29B-A4B-Q4_K_M.gguf" --local-dir ./
```

## Downloading using the Hugging Face CLI

<details>
  <summary>Click to view download instructions</summary>

First, make sure you have the Hugging Face CLI installed:

```
pip install -U "huggingface_hub[cli]"
```

Download a specific file:

```
hf download bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF --include "XingChen-AGI_Xing4.0-29B-A4B-Q4_K_M.gguf" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF --include "XingChen-AGI_Xing4.0-29B-A4B-bf16/*" --local-dir ./
```

You can either specify a new local-dir (XingChen-AGI_Xing4.0-29B-A4B-bf16) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b12174 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## MTP

This model has MTP (Multi-Token Prediction) layers, and they are included in these quants

MTP layers act as a built-in draft model, letting llama.cpp run speculative decoding for faster generation. To use them, add the following flag to your llama.cpp command:

```
--spec-type draft-mtp
```

Note: the MTP layers are stored at Q4_0 in every quant except Q8_0. Imatrix calibration does not exercise them, so the imatrix has nothing to offer these layers, and Q4_0 is chosen for its speed, which massively benefits MTP performance.

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on this model before any of these files were released: Q4_K_M reached 0.99×, Q3_K_M 1.04× and IQ2_XXS 0.50× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 28.44GB | 7.40 | 7.29 | 51 % |
| Q6_K | 27.19GB | 7.04 | 6.97 | 70 % |
| Q6_K_S | 26.00GB | 6.71 | 6.66 | 90 % |
| Q5_K_M | 24.00GB | 6.15 | 6.15 | 70 % |
| Q5_K_S | 22.41GB | 5.70 | 5.74 | 90 % |
| Q4_K_L | 21.69GB | 5.50 | 5.56 | 50 % |
| Q4_K_M | 20.06GB | 5.04 | 5.14 | 70 % |
| IQ4_NL | 20.01GB | 5.04 | 5.13 | 70 % |
| Q4_K_S | 18.89GB | 4.72 | 4.84 | 90 % |
| IQ4_XS | 17.98GB | 4.47 | 4.61 | 90 % |
| IQ3_M | 17.04GB | 4.20 | 4.37 | 50 % |
| Q3_K_L | 16.85GB | 4.14 | 4.32 | 50 % |
| Q3_K_M | 16.10GB | 3.93 | 4.13 | 70 % |
| IQ3_XS | 14.92GB | 3.60 | 3.82 | 90 % |
| Q3_K_S | 14.92GB | 3.60 | 3.82 | 90 % |
| IQ3_XXS | 14.43GB | 3.47 | 3.70 | 70 % |
| Q2_K | 12.84GB | 3.06 | 3.29 | 70 % |
| IQ2_M | 12.53GB | 2.93 | 3.21 | 70 % |
| IQ2_S | 11.24GB | 2.62 | 2.88 | 70 % |
| IQ2_XS | 10.56GB | 2.43 | 2.71 | 90 % |
| IQ2_XXS | 10.32GB | 2.36 | 2.64 | 70 % |

Checked on this model: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0353 ± 0.0015 | 0.0431 ± 0.0014 | 0.99× | +4.2 % |
| Q3_K_M | 0.0952 ± 0.0020 | 0.1217 ± 0.0026 | 1.04× | +8.1 % |
| IQ2_XXS | 0.4148 ± 0.0050 | 1.1512 ± 0.0091 | 0.50× | +8.4 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [XingChen-AGI_Xing4.0-29B-A4B-calibration-v6.txt](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-calibration-v6.txt). The imatrix is available here: [XingChen-AGI_Xing4.0-29B-A4B-imatrix.gguf](https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF/blob/main/XingChen-AGI_Xing4.0-29B-A4B-imatrix.gguf).

<details>
<summary>Calibration render details</summary>

```json
{
  "recipe": "calibration-v6",
  "encoder": "chat_template",
  "library_versions": {
    "transformers": "5.20.2",
    "tokenizers": "0.23.3",
    "tiktoken": "0.14.0",
    "blobfile": "3.3.0",
    "huggingface_hub": "1.31.0"
  },
  "chunk_size": 512,
  "prose_chunks": 228,
  "tool_chunks": 332,
  "total_chunks": 560,
  "n_conversations": 137,
  "conversation_token_lengths": [
    505,
    1617,
    862,
    1386,
    1153,
    1382,
    2653,
    608,
    1226,
    1189,
    1042,
    2081,
    830,
    947,
    2465,
    1278,
    1088,
    941,
    688,
    659,
    1338,
    1054,
    1431,
    1182,
    1690,
    1514,
    1001,
    680,
    918,
    1488,
    1619,
    790,
    1275,
    1005,
    1044,
    1748,
    1652,
    1152,
    419,
    1940,
    1386,
    1117,
    1428,
    1752,
    1955,
    1288,
    1584,
    761,
    2522,
    1079,
    2645,
    751,
    974,
    686,
    939,
    653,
    2320,
    698,
    1103,
    1043,
    1234,
    1147,
    915,
    972,
    920,
    1382,
    868,
    1567,
    1821,
    799,
    333,
    1113,
    3129,
    3030,
    666,
    701,
    990,
    724,
    1292,
    1061,
    1138,
    772,
    1063,
    1079,
    1256,
    1583,
    1430,
    1381,
    841,
    599,
    2533,
    680,
    1124,
    1694,
    2007,
    1167,
    605,
    1340,
    1147,
    1705,
    1670,
    1842,
    770,
    701,
    1034,
    3056,
    696,
    528,
    735,
    1184,
    1012,
    1317,
    727,
    362,
    331,
    2358,
    687,
    1132,
    1820,
    1726,
    2429,
    2443,
    628,
    951,
    787,
    830,
    1229,
    984,
    813,
    1373,
    788,
    669,
    1397,
    996,
    867,
    1307,
    1476
  ]
}
```

</details>

## ARM/AVX information

llama.cpp automatically "repacks" weights into an interleaved layout at load time for faster inference on ARM and AVX machines - details in [this PR](https://github.com/ggml-org/llama.cpp/pull/9921). This once required downloading special Q4_0_4_4/4_8/8_8 files; those are long gone. Online repacking now covers Q4_0, IQ4_NL, and most K-quants, so no special quant choice is needed for CPU inference.

## Which file should I choose?

<details>
  <summary>Click here for details</summary>

An older (early 2024) but still useful write-up with charts comparing quant performances is provided by Artefact2 [here](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)

The first thing to figure out is how big a model you can run. To do this, you'll need to figure out how much RAM and/or VRAM you have.

If you want your model running as FAST as possible, you'll want to fit the whole thing on your GPU's VRAM. Aim for a quant with a file size 1-2GB smaller than your GPU's total VRAM.

If you want the absolute maximum quality, add both your system RAM and your GPU's VRAM together, then similarly grab a quant with a file size 1-2GB Smaller than that total.

Hugging Face can also do this math for you: add your hardware in your [Local Apps settings](https://huggingface.co/settings/local-apps) and the model page will show which files fit.

Next, you'll need to decide if you want to use an 'I-quant' or a 'K-quant'.

If you don't want to think too much, grab one of the K-quants. These are in format 'QX_K_X', like Q5_K_M.

If you want to get more into the weeds, you can check out this extremely useful feature chart:

[llama.cpp feature matrix](https://github.com/ggml-org/llama.cpp/wiki/Feature-matrix)

But basically, if you're aiming for below Q4, and you're running cuBLAS (Nvidia) or rocBLAS (AMD), you should look towards the I-quants. These are in format IQX_X, like IQ3_M. These are newer and offer better performance for their size.

These I-quants can also be used on CPU, but will be slower than their K-quant equivalent, so speed vs performance is a tradeoff you'll have to decide.

</details>

## Credits

Thank you kalomaze and Dampf for assistance in creating the imatrix calibration dataset.

Want to support my work? Visit my ko-fi page here: https://ko-fi.com/bartowski
