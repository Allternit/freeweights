## Llamacpp imatrix Quantizations of Ornith-1.5-122B by ornith-ai

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b11716">b11716</a> for quantization.

Original model: https://huggingface.co/ornith-ai/Ornith-1.5-122B

**Model details:**
- Parameter count: 125B (source checkpoint)
- Input support: text, image (with mmproj file) - [details](#multimodal)
- Speculative decoding: yes (MTP) - [details](#mtp)
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<|im_start|>system
{system_prompt}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
<think>
```

<details><summary>Prompt format with tool definitions</summary>

```
<|im_start|>system
# Tools

You have access to the following functions:

<tools>
{"type": "function", "function": {"name": "get_stock_price", "description": "Get the current stock price", "parameters": {"type": "object", "properties": {"symbol": {"type": "string", "description": "The stock symbol, e.g. AAPL, GOOG"}}, "required": ["symbol"]}}}
</tools>

If you choose to call a function ONLY reply in the following format with NO suffix:

<tool_call>
<function=example_function_name>
<parameter=example_parameter_1>
value_1
</parameter>
<parameter=example_parameter_2>
This is the value for the second parameter
that can span
multiple lines
</parameter>
</function>
</tool_call>

<IMPORTANT>
Reminder:
- Function calls MUST follow the specified format: an inner <function=...></function> block must be nested within <tool_call></tool_call> XML tags
- Required parameters MUST be specified
- You may provide optional reasoning for your function call in natural language BEFORE the function call, but NOT after
- If there is no function call available, answer the question like normal with your current knowledge and do not tell the user about function calls
</IMPORTANT>

{system_prompt}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
<think>
```

</details>

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q4_K_M) (78.92GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [Ornith-1.5-122B-bf16.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-bf16) | bf16 | 249.36GB | true | Full BF16 weights. |
| [Ornith-1.5-122B-Q8_0.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q8_0) | Q8_0 | 132.60GB | true | Extremely high quality, generally unneeded but max available quant. |
| [Ornith-1.5-122B-Q6_K.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q6_K) | Q6_K | 109.30GB | true | Very high quality, near perfect, *recommended*. |
| [Ornith-1.5-122B-Q6_K_S.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q6_K_S) | Q6_K_S | 104.42GB | true | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [Ornith-1.5-122B-Q5_K_M.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q5_K_M) | Q5_K_M | 94.94GB | true | High quality, *recommended*. |
| [Ornith-1.5-122B-Q5_K_S.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q5_K_S) | Q5_K_S | 89.06GB | true | High quality, *recommended*. |
| [Ornith-1.5-122B-Q4_K_L.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q4_K_L) | Q4_K_L | 84.72GB | true | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [Ornith-1.5-122B-Q4_K_M.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q4_K_M) | Q4_K_M | 78.92GB | true | Good quality, default size for most use cases, *recommended*. |
| [Ornith-1.5-122B-IQ4_NL.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-IQ4_NL) | IQ4_NL | 78.92GB | true | Similar to IQ4_XS, but slightly larger. |
| [Ornith-1.5-122B-Q4_1.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q4_1) | Q4_1 | 78.48GB | true | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [Ornith-1.5-122B-Q4_K_S.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q4_K_S) | Q4_K_S | 74.17GB | true | Slightly lower quality with more space savings, *recommended*. |
| [Ornith-1.5-122B-Q4_0.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q4_0) | Q4_0 | 71.26GB | true | Legacy format, kept for compatibility with older tools. |
| [Ornith-1.5-122B-IQ4_XS.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-IQ4_XS) | IQ4_XS | 70.21GB | true | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Ornith-1.5-122B-IQ3_M.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-IQ3_M) | IQ3_M | 67.63GB | true | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Ornith-1.5-122B-Q3_K_L.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q3_K_L) | Q3_K_L | 64.17GB | true | Lower quality but usable, good for low RAM availability. |
| [Ornith-1.5-122B-Q3_K_M.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q3_K_M) | Q3_K_M | 60.61GB | true | Low quality. |
| [Ornith-1.5-122B-IQ3_XS.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-IQ3_XS) | IQ3_XS | 57.86GB | true | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Ornith-1.5-122B-Q3_K_S.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-Q3_K_S) | Q3_K_S | 57.48GB | true | Low quality, *not* recommended. |
| [Ornith-1.5-122B-IQ3_XXS.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/Ornith-1.5-122B-IQ3_XXS) | IQ3_XXS | 54.36GB | true | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Ornith-1.5-122B-Q2_K.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-Q2_K.gguf) | Q2_K | 48.95GB | false | Very low quality but surprisingly usable. |
| [Ornith-1.5-122B-IQ2_M.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-IQ2_M.gguf) | IQ2_M | 46.38GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [Ornith-1.5-122B-IQ2_S.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-IQ2_S.gguf) | IQ2_S | 42.51GB | false | Low quality, uses SOTA techniques to be usable. |
| [Ornith-1.5-122B-IQ2_XS.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-IQ2_XS.gguf) | IQ2_XS | 40.00GB | false | Low quality, uses SOTA techniques to be usable. |
| [Ornith-1.5-122B-IQ2_XXS.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-IQ2_XXS.gguf) | IQ2_XXS | 38.27GB | false | Very low quality, uses SOTA techniques to be usable. |
| [Ornith-1.5-122B-IQ1_M.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-IQ1_M.gguf) | IQ1_M | 33.22GB | false | Extremely low quality, *not* recommended. |
| [Ornith-1.5-122B-IQ1_S.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-IQ1_S.gguf) | IQ1_S | 30.01GB | false | Extremely low quality, *not* recommended. |

Download a specific file:

```
hf download bartowski/Ornith-1.5-122B-GGUF --include "Ornith-1.5-122B-Q4_K_M/*" --local-dir ./
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
hf download bartowski/Ornith-1.5-122B-GGUF --include "Ornith-1.5-122B-Q4_K_M/*" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/Ornith-1.5-122B-GGUF --include "Ornith-1.5-122B-Q8_0/*" --local-dir ./
```

You can either specify a new local-dir (Ornith-1.5-122B-Q8_0) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/Ornith-1.5-122B-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b11716 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image input. Alongside the quants, this repo includes the multimodal projector files [mmproj-Ornith-1.5-122B-bf16.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/mmproj-Ornith-1.5-122B-bf16.gguf) and [mmproj-Ornith-1.5-122B-f16.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/mmproj-Ornith-1.5-122B-f16.gguf), which pair with any quant above.

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

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on this model before any of these files were released: Q4_K_M reached 0.79×, Q3_K_M 0.80× and IQ1_S 0.85× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K | 109.30GB | 7.04 | 7.02 | 70 % |
| Q6_K_S | 104.42GB | 6.71 | 6.70 | 90 % |
| Q5_K_M | 94.94GB | 6.08 | 6.09 | 70 % |
| Q5_K_S | 89.06GB | 5.69 | 5.72 | 90 % |
| Q4_K_L | 84.72GB | 5.41 | 5.44 | 50 % |
| Q4_K_M | 78.92GB | 5.02 | 5.07 | 70 % |
| IQ4_NL | 78.92GB | 5.02 | 5.07 | 70 % |
| Q4_K_S | 74.17GB | 4.71 | 4.76 | 90 % |
| IQ4_XS | 70.21GB | 4.44 | 4.51 | 90 % |
| IQ3_M | 67.63GB | 4.27 | 4.34 | 50 % |
| Q3_K_L | 64.17GB | 4.04 | 4.12 | 50 % |
| Q3_K_M | 60.61GB | 3.81 | 3.89 | 70 % |
| IQ3_XS | 57.86GB | 3.62 | 3.71 | 90 % |
| Q3_K_S | 57.48GB | 3.60 | 3.69 | 90 % |
| IQ3_XXS | 54.36GB | 3.39 | 3.49 | 70 % |
| Q2_K | 48.95GB | 3.03 | 3.14 | 70 % |
| IQ2_M | 46.38GB | 2.86 | 2.98 | 70 % |
| IQ2_S | 42.51GB | 2.60 | 2.73 | 70 % |
| IQ2_XS | 40.00GB | 2.44 | 2.57 | 90 % |
| IQ2_XXS | 38.27GB | 2.32 | 2.46 | 70 % |
| IQ1_M | 33.22GB | 1.99 | 2.13 | 70 % |
| IQ1_S | 30.01GB | 1.77 | 1.93 | 70 % |

Checked on this model: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0572 ± 0.0008 | 0.0818 ± 0.0012 | 0.79× | +3.4 % |
| Q3_K_M | 0.1376 ± 0.0019 | 0.1954 ± 0.0025 | 0.80× | +4.6 % |
| IQ1_S | 0.7147 ± 0.0066 | 0.9474 ± 0.0081 | 0.85× | +8.6 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [Ornith-1.5-122B-calibration-v6.txt](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-calibration-v6.txt). The imatrix is available here: [Ornith-1.5-122B-imatrix.gguf](https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF/blob/main/Ornith-1.5-122B-imatrix.gguf).

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
  "prose_chunks": 214,
  "tool_chunks": 359,
  "total_chunks": 573,
  "n_conversations": 137,
  "conversation_token_lengths": [
    566,
    1629,
    1259,
    1521,
    1147,
    1366,
    3182,
    828,
    1229,
    1424,
    1069,
    2098,
    883,
    1255,
    2791,
    1275,
    1122,
    988,
    739,
    720,
    1364,
    1060,
    1409,
    1204,
    1874,
    1500,
    1656,
    910,
    1417,
    1648,
    1571,
    1222,
    1270,
    1039,
    1018,
    1714,
    1653,
    1177,
    479,
    1912,
    1413,
    1128,
    1400,
    2004,
    2092,
    1317,
    1611,
    909,
    2958,
    1104,
    2870,
    789,
    1026,
    972,
    905,
    700,
    2492,
    917,
    1150,
    1089,
    1233,
    1173,
    928,
    1221,
    1185,
    1590,
    915,
    1554,
    2128,
    843,
    323,
    1124,
    3337,
    2838,
    711,
    944,
    1034,
    1075,
    1300,
    1084,
    1153,
    797,
    1212,
    1073,
    1293,
    1548,
    1405,
    2068,
    875,
    660,
    2768,
    640,
    1405,
    1677,
    1949,
    1205,
    645,
    1358,
    1126,
    1731,
    1846,
    1717,
    819,
    1017,
    1039,
    2858,
    742,
    736,
    765,
    1414,
    1054,
    1579,
    770,
    350,
    319,
    2628,
    1020,
    1141,
    1832,
    2041,
    2697,
    2679,
    818,
    982,
    842,
    961,
    1241,
    1001,
    844,
    1359,
    832,
    712,
    1745,
    1029,
    919,
    1318,
    1481
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
