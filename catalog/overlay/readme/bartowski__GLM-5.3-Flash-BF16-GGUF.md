## Llamacpp imatrix Quantizations of GLM-5.3-Flash-BF16 by zai-org

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b11279">b11279</a> for quantization.

Original model: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16

**Model details:**
- Parameter count: 321B (source checkpoint)
- Input support: text, image (with mmproj file) - [details](#multimodal)
- Speculative decoding: yes (MTP) - [details](#mtp)
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
[gMASK]<sop><|system|>Reasoning Effort: Max<|system|>{system_prompt}<|user|>{prompt}<|assistant|><think>
```

<details><summary>Prompt format with tool definitions</summary>

```
[gMASK]<sop><|system|>Reasoning Effort: Max<|system|>
# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{"name": "get_stock_price", "description": "Get the current stock price", "parameters": {"type": "object", "properties": {"symbol": {"type": "string", "description": "The stock symbol, e.g. AAPL, GOOG"}}, "required": ["symbol"]}}
</tools>

For each function call, output the function name and arguments within the following XML format:
<tool_call>{function-name}<arg_key>{arg-key-1}</arg_key><arg_value>{arg-value-1}</arg_value><arg_key>{arg-key-2}</arg_key><arg_value>{arg-value-2}</arg_value>...</tool_call><|system|>{system_prompt}<|user|>{prompt}<|assistant|><think>
```

</details>

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q4_K_M) (200.83GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [GLM-5.3-Flash-BF16-Q8_0.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q8_0) | Q8_0 | 341.50GB | true | Extremely high quality, generally unneeded but max available quant. |
| [GLM-5.3-Flash-BF16-Q6_K.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q6_K) | Q6_K | 281.04GB | true | Very high quality, near perfect, *recommended*. |
| [GLM-5.3-Flash-BF16-Q6_K_S.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q6_K_S) | Q6_K_S | 268.17GB | true | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [GLM-5.3-Flash-BF16-Q5_K_M.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q5_K_M) | Q5_K_M | 243.69GB | true | High quality, *recommended*. |
| [GLM-5.3-Flash-BF16-Q5_K_S.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q5_K_S) | Q5_K_S | 227.91GB | true | High quality, *recommended*. |
| [GLM-5.3-Flash-BF16-Q4_1.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q4_1) | Q4_1 | 202.61GB | true | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [GLM-5.3-Flash-BF16-Q4_K_M.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q4_K_M) | Q4_K_M | 200.83GB | true | Good quality, default size for most use cases, *recommended*. |
| [GLM-5.3-Flash-BF16-IQ4_NL.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ4_NL) | IQ4_NL | 200.83GB | true | Similar to IQ4_XS, but slightly larger. |
| [GLM-5.3-Flash-BF16-Q4_K_S.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q4_K_S) | Q4_K_S | 189.30GB | true | Slightly lower quality with more space savings, *recommended*. |
| [GLM-5.3-Flash-BF16-Q4_0.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q4_0) | Q4_0 | 184.09GB | true | Legacy format, kept for compatibility with older tools. |
| [GLM-5.3-Flash-BF16-IQ4_XS.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ4_XS) | IQ4_XS | 177.74GB | true | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [GLM-5.3-Flash-BF16-IQ3_M.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ3_M) | IQ3_M | 166.63GB | true | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [GLM-5.3-Flash-BF16-Q3_K_L.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q3_K_L) | Q3_K_L | 162.44GB | true | Lower quality but usable, good for low RAM availability. |
| [GLM-5.3-Flash-BF16-Q3_K_M.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q3_K_M) | Q3_K_M | 155.02GB | true | Low quality. |
| [GLM-5.3-Flash-BF16-IQ3_XS.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ3_XS) | IQ3_XS | 147.36GB | true | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [GLM-5.3-Flash-BF16-Q3_K_S.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q3_K_S) | Q3_K_S | 147.36GB | true | Low quality, *not* recommended. |
| [GLM-5.3-Flash-BF16-IQ3_XXS.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ3_XXS) | IQ3_XXS | 138.83GB | true | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [GLM-5.3-Flash-BF16-Q2_K.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-Q2_K) | Q2_K | 125.67GB | true | Very low quality but surprisingly usable. |
| [GLM-5.3-Flash-BF16-IQ2_M.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ2_M) | IQ2_M | 120.62GB | true | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [GLM-5.3-Flash-BF16-IQ2_S.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ2_S) | IQ2_S | 107.52GB | true | Low quality, uses SOTA techniques to be usable. |
| [GLM-5.3-Flash-BF16-IQ2_XS.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ2_XS) | IQ2_XS | 101.43GB | true | Low quality, uses SOTA techniques to be usable. |
| [GLM-5.3-Flash-BF16-IQ2_XXS.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ2_XXS) | IQ2_XXS | 96.63GB | true | Very low quality, uses SOTA techniques to be usable. |
| [GLM-5.3-Flash-BF16-IQ1_M.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ1_M) | IQ1_M | 83.01GB | true | Extremely low quality, *not* recommended. |
| [GLM-5.3-Flash-BF16-IQ1_S.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/GLM-5.3-Flash-BF16-IQ1_S) | IQ1_S | 74.85GB | true | Extremely low quality, *not* recommended. |

Download a specific file:

```
hf download bartowski/GLM-5.3-Flash-BF16-GGUF --include "GLM-5.3-Flash-BF16-Q4_K_M/*" --local-dir ./
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
hf download bartowski/GLM-5.3-Flash-BF16-GGUF --include "GLM-5.3-Flash-BF16-Q4_K_M/*" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/GLM-5.3-Flash-BF16-GGUF --include "GLM-5.3-Flash-BF16-Q8_0/*" --local-dir ./
```

You can either specify a new local-dir (GLM-5.3-Flash-BF16-Q8_0) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/GLM-5.3-Flash-BF16-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b11279 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image input. Alongside the quants, this repo includes the multimodal projector files [mmproj-GLM-5.3-Flash-BF16-bf16.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/blob/main/mmproj-GLM-5.3-Flash-BF16-bf16.gguf) and [mmproj-GLM-5.3-Flash-BF16-f16.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/blob/main/mmproj-GLM-5.3-Flash-BF16-f16.gguf), which pair with any quant above.

llama.cpp downloads the mmproj automatically when using `-hf` as shown above; if you're loading files manually, pass it with `--mmproj`.

## MTP

This model has MTP (Multi-Token Prediction) layers, and they are included in these quants

MTP layers act as a built-in draft model, letting llama.cpp run speculative decoding for faster generation. To use them, add the following flag to your llama.cpp command:

```
--spec-type draft-mtp
```

Note: the MTP layers are stored at Q4_0 in every quant except Q8_0. Imatrix calibration does not exercise them, so the imatrix has nothing to offer these layers, and Q4_0 is chosen for its speed, which massively benefits MTP performance.

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on this model before any of these files were released: Q4_K_M reached 0.93×, Q3_K_M 0.99× and IQ1_S 1.02× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K | 281.04GB | 7.04 | 7.01 | 70 % |
| Q6_K_S | 268.17GB | 6.71 | 6.69 | 90 % |
| Q5_K_M | 243.69GB | 6.08 | 6.08 | 70 % |
| Q5_K_S | 227.91GB | 5.68 | 5.68 | 90 % |
| Q4_K_M | 200.83GB | 4.98 | 5.01 | 70 % |
| IQ4_NL | 200.83GB | 4.98 | 5.01 | 70 % |
| Q4_K_S | 189.30GB | 4.69 | 4.72 | 90 % |
| IQ4_XS | 177.74GB | 4.39 | 4.43 | 90 % |
| IQ3_M | 166.63GB | 4.11 | 4.16 | 50 % |
| Q3_K_L | 162.44GB | 4.00 | 4.05 | 50 % |
| Q3_K_M | 155.02GB | 3.81 | 3.87 | 70 % |
| IQ3_XS | 147.36GB | 3.61 | 3.68 | 90 % |
| Q3_K_S | 147.36GB | 3.61 | 3.68 | 90 % |
| IQ3_XXS | 138.83GB | 3.39 | 3.46 | 70 % |
| Q2_K | 125.67GB | 3.05 | 3.13 | 70 % |
| IQ2_M | 120.62GB | 2.92 | 3.01 | 70 % |
| IQ2_S | 107.52GB | 2.59 | 2.68 | 70 % |
| IQ2_XS | 101.43GB | 2.43 | 2.53 | 90 % |
| IQ2_XXS | 96.63GB | 2.31 | 2.41 | 70 % |
| IQ1_M | 83.01GB | 1.96 | 2.07 | 70 % |
| IQ1_S | 74.85GB | 1.75 | 1.87 | 70 % |

Checked on this model: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0580 ± 0.0009 | 0.0688 ± 0.0010 | 0.93× | +2.4 % |
| Q3_K_M | 0.1526 ± 0.0022 | 0.1726 ± 0.0024 | 0.99× | +3.9 % |
| IQ1_S | 1.0209 ± 0.0091 | 1.1087 ± 0.0097 | 1.02× | +6.0 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [GLM-5.3-Flash-BF16-calibration-v6.txt](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/blob/main/GLM-5.3-Flash-BF16-calibration-v6.txt). The imatrix is available here: [GLM-5.3-Flash-BF16-imatrix.gguf](https://huggingface.co/bartowski/GLM-5.3-Flash-BF16-GGUF/blob/main/GLM-5.3-Flash-BF16-imatrix.gguf).

<details>
<summary>Calibration render details</summary>

```json
{
  "recipe": "calibration-v6",
  "encoder": "chat_template",
  "library_versions": {
    "transformers": "5.9.0",
    "tokenizers": "0.22.2",
    "tiktoken": "0.14.0",
    "blobfile": "3.3.0",
    "huggingface_hub": "1.31.0"
  },
  "chunk_size": 512,
  "prose_chunks": 213,
  "tool_chunks": 304,
  "total_chunks": 517,
  "n_conversations": 137,
  "conversation_token_lengths": [
    439,
    1430,
    1029,
    1224,
    911,
    1187,
    2859,
    583,
    1038,
    1157,
    870,
    1920,
    753,
    1016,
    2487,
    1056,
    964,
    853,
    620,
    558,
    1223,
    820,
    1131,
    1049,
    1647,
    1333,
    1439,
    708,
    1211,
    1351,
    1320,
    945,
    1070,
    889,
    1011,
    1433,
    1404,
    1023,
    362,
    1727,
    1154,
    920,
    1187,
    1770,
    1840,
    1111,
    1420,
    652,
    2625,
    926,
    2670,
    606,
    825,
    776,
    840,
    571,
    2221,
    704,
    980,
    920,
    1003,
    1028,
    725,
    988,
    915,
    1270,
    755,
    1289,
    1895,
    721,
    320,
    935,
    3034,
    2453,
    584,
    730,
    835,
    875,
    1062,
    957,
    933,
    644,
    957,
    860,
    1123,
    1267,
    1136,
    1845,
    703,
    506,
    2456,
    625,
    1141,
    1429,
    1701,
    1080,
    477,
    1162,
    1066,
    1473,
    1630,
    1434,
    665,
    827,
    873,
    2524,
    615,
    525,
    613,
    1151,
    935,
    1290,
    637,
    348,
    310,
    2323,
    828,
    907,
    1536,
    1793,
    2389,
    2379,
    606,
    814,
    715,
    748,
    1001,
    819,
    720,
    1133,
    684,
    584,
    1506,
    794,
    782,
    1087,
    1220
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
