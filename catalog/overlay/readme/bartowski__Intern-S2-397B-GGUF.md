## Llamacpp imatrix Quantizations of Intern-S2-397B by internlm

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b10896">b10896</a> for quantization.

Original model: https://huggingface.co/internlm/Intern-S2-397B

**Model details:**
- Parameter count: 403B
- Input support: text, image (with mmproj file) - [details](#multimodal)
- Speculative decoding: yes (MTP) - [details](#mtp)
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

No prompt format found, check original model page

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q4_K_M) (254.58GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [Intern-S2-397B-Q8_0.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q8_0) | Q8_0 | 428.62GB | true | Extremely high quality, generally unneeded but max available quant. |
| [Intern-S2-397B-Q6_K.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q6_K) | Q6_K | 353.55GB | true | Very high quality, near perfect, *recommended*. |
| [Intern-S2-397B-Q6_K_S.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q6_K_S) | Q6_K_S | 336.90GB | true | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [Intern-S2-397B-Q5_K_M.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q5_K_M) | Q5_K_M | 309.36GB | true | High quality, *recommended*. |
| [Intern-S2-397B-Q5_K_S.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q5_K_S) | Q5_K_S | 286.57GB | true | High quality, *recommended*. |
| [Intern-S2-397B-Q4_K_M.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q4_K_M) | Q4_K_M | 254.58GB | true | Good quality, default size for most use cases, *recommended*. |
| [Intern-S2-397B-IQ4_NL.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ4_NL) | IQ4_NL | 253.29GB | true | Similar to IQ4_XS, but slightly larger. |
| [Intern-S2-397B-Q4_1.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q4_1) | Q4_1 | 252.83GB | true | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [Intern-S2-397B-Q4_K_S.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q4_K_S) | Q4_K_S | 237.23GB | true | Slightly lower quality with more space savings, *recommended*. |
| [Intern-S2-397B-Q4_0.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q4_0) | Q4_0 | 229.17GB | true | Legacy format, kept for compatibility with older tools. |
| [Intern-S2-397B-IQ4_XS.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ4_XS) | IQ4_XS | 223.27GB | true | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Intern-S2-397B-IQ3_M.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ3_M) | IQ3_M | 213.19GB | true | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Intern-S2-397B-Q3_K_L.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q3_K_L) | Q3_K_L | 203.95GB | true | Lower quality but usable, good for low RAM availability. |
| [Intern-S2-397B-Q3_K_M.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q3_K_M) | Q3_K_M | 193.69GB | true | Low quality. |
| [Intern-S2-397B-Q3_K_S.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q3_K_S) | Q3_K_S | 183.78GB | true | Low quality, *not* recommended. |
| [Intern-S2-397B-IQ3_XS.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ3_XS) | IQ3_XS | 181.84GB | true | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Intern-S2-397B-IQ3_XXS.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ3_XXS) | IQ3_XXS | 173.29GB | true | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Intern-S2-397B-Q2_K.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-Q2_K) | Q2_K | 154.50GB | true | Very low quality but surprisingly usable. |
| [Intern-S2-397B-IQ2_M.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ2_M) | IQ2_M | 146.06GB | true | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [Intern-S2-397B-IQ2_S.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ2_S) | IQ2_S | 131.56GB | true | Low quality, uses SOTA techniques to be usable. |
| [Intern-S2-397B-IQ2_XS.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ2_XS) | IQ2_XS | 125.16GB | true | Low quality, uses SOTA techniques to be usable. |
| [Intern-S2-397B-IQ2_XXS.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ2_XXS) | IQ2_XXS | 118.84GB | true | Very low quality, uses SOTA techniques to be usable. |
| [Intern-S2-397B-IQ1_M.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ1_M) | IQ1_M | 101.82GB | true | Extremely low quality, *not* recommended. |
| [Intern-S2-397B-IQ1_S.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/Intern-S2-397B-IQ1_S) | IQ1_S | 91.61GB | true | Extremely low quality, *not* recommended. |

Download a specific file:

```
hf download bartowski/Intern-S2-397B-GGUF --include "Intern-S2-397B-Q4_K_M/*" --local-dir ./
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
hf download bartowski/Intern-S2-397B-GGUF --include "Intern-S2-397B-Q4_K_M/*" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/Intern-S2-397B-GGUF --include "Intern-S2-397B-Q8_0/*" --local-dir ./
```

You can either specify a new local-dir (Intern-S2-397B-Q8_0) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/Intern-S2-397B-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b10896 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image input. Alongside the quants, this repo includes the multimodal projector files [mmproj-Intern-S2-397B-f16.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/blob/main/mmproj-Intern-S2-397B-f16.gguf) and [mmproj-Intern-S2-397B-bf16.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/blob/main/mmproj-Intern-S2-397B-bf16.gguf), which pair with any quant above.

llama.cpp downloads the mmproj automatically when using `-hf` as shown above; if you're loading files manually, pass it with `--mmproj`.

## MTP

This model has MTP (Multi-Token Prediction) layers, and they are included in these quants

MTP layers act as a built-in draft model, letting llama.cpp run speculative decoding for faster generation. To use them, add the following flag to your llama.cpp command:

```
--spec-type draft-mtp
```

Note: the MTP layers are stored at Q4_0 in the imatrix quants (except for the Q8_0 quant), since imatrix calibration does not exercise them. Q4_0 is chosen for its speed which massively benefits MTP performance.

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-61746c35382fd0e6` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on [bartowski/Nex-N2.5-Pro-GGUF](https://huggingface.co/bartowski/Nex-N2.5-Pro-GGUF) (same architecture and tensor shapes) before any of these files were released: Q4_K_M reached 0.83×, Q3_K_M 0.76× and IQ1_S 0.80× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K | 353.55GB | 7.04 | 7.01 | 70 % |
| Q6_K_S | 336.90GB | 6.71 | 6.68 | 91 % |
| Q5_K_M | 309.36GB | 6.15 | 6.13 | 70 % |
| Q5_K_S | 286.57GB | 5.68 | 5.68 | 90 % |
| Q4_K_M | 254.58GB | 5.04 | 5.05 | 70 % |
| IQ4_NL | 253.29GB | 5.01 | 5.02 | 70 % |
| Q4_K_S | 237.23GB | 4.68 | 4.70 | 90 % |
| IQ4_XS | 223.27GB | 4.40 | 4.43 | 90 % |
| IQ3_M | 213.19GB | 4.20 | 4.23 | 50 % |
| Q3_K_L | 203.95GB | 4.01 | 4.04 | 50 % |
| Q3_K_M | 193.69GB | 3.80 | 3.84 | 70 % |
| Q3_K_S | 183.78GB | 3.60 | 3.64 | 90 % |
| IQ3_XS | 181.84GB | 3.56 | 3.61 | 90 % |
| IQ3_XXS | 173.29GB | 3.38 | 3.44 | 70 % |
| Q2_K | 154.50GB | 3.00 | 3.06 | 70 % |
| IQ2_M | 146.06GB | 2.83 | 2.90 | 70 % |
| IQ2_S | 131.56GB | 2.54 | 2.61 | 70 % |
| IQ2_XS | 125.16GB | 2.41 | 2.48 | 90 % |
| IQ2_XXS | 118.84GB | 2.28 | 2.36 | 70 % |
| IQ1_M | 101.82GB | 1.93 | 2.02 | 70 % |
| IQ1_S | 91.61GB | 1.73 | 1.82 | 70 % |

Checked on [bartowski/Nex-N2.5-Pro-GGUF](https://huggingface.co/bartowski/Nex-N2.5-Pro-GGUF), which shares this model's architecture and tensor shapes: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0285 ± 0.0005 | 0.0396 ± 0.0007 | 0.83× | +3.7 % |
| Q3_K_M | 0.0700 ± 0.0012 | 0.1063 ± 0.0017 | 0.76× | +4.7 % |
| IQ1_S | 0.5358 ± 0.0063 | 0.7574 ± 0.0077 | 0.80× | +7.4 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [Intern-S2-397B-calibration-v6.txt](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/blob/main/Intern-S2-397B-calibration-v6.txt). The imatrix is available here: [Intern-S2-397B-imatrix.gguf](https://huggingface.co/bartowski/Intern-S2-397B-GGUF/blob/main/Intern-S2-397B-imatrix.gguf).

<details>
<summary>Calibration render details</summary>

```json
{
  "generator": "auto_quant_v2 calibration renderer",
  "recipe": "calibration-v6",
  "model": "Intern-S2-397B",
  "encoder": "chat_template",
  "chunk_size": 512,
  "prose_chunks": 214,
  "tool_chunks": 335,
  "total_chunks": 549,
  "tool_chunk_fraction": 0.61,
  "n_conversations": 137,
  "extension_convs_used": 0,
  "conversation_token_lengths": [
    565,
    1628,
    915,
    1403,
    1146,
    1365,
    2567,
    665,
    1228,
    1233,
    1068,
    2097,
    882,
    977,
    2401,
    1274,
    1121,
    987,
    738,
    719,
    1363,
    1059,
    1408,
    1203,
    1719,
    1499,
    1051,
    723,
    973,
    1504,
    1570,
    841,
    1269,
    1038,
    1017,
    1713,
    1652,
    1176,
    478,
    1911,
    1412,
    1127,
    1399,
    1771,
    1962,
    1316,
    1610,
    782,
    2442,
    1103,
    2638,
    788,
    1025,
    752,
    904,
    699,
    2314,
    759,
    1149,
    1088,
    1232,
    1172,
    927,
    1023,
    969,
    1424,
    914,
    1553,
    1836,
    842,
    322,
    1123,
    3002,
    2837,
    710,
    763,
    1033,
    796,
    1299,
    1083,
    1152,
    796,
    1072,
    1072,
    1292,
    1547,
    1404,
    1390,
    874,
    659,
    2471,
    639,
    1162,
    1676,
    1948,
    1204,
    644,
    1357,
    1125,
    1730,
    1699,
    1716,
    818,
    771,
    1038,
    2857,
    741,
    597,
    764,
    1262,
    1053,
    1371,
    769,
    349,
    318,
    2322,
    734,
    1140,
    1831,
    1729,
    2364,
    2374,
    692,
    981,
    841,
    851,
    1240,
    1000,
    843,
    1358,
    831,
    711,
    1422,
    1028,
    918,
    1317,
    1480
  ],
  "warnings": []
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
