## Llamacpp imatrix Quantizations of FrogNano-4B-2609 by microsoft

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b11279">b11279</a> for quantization.

Original model: https://huggingface.co/microsoft/FrogNano-4B-2609

**Model details:**
- Parameter count: 5B (source checkpoint)
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

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q4_K_M.gguf) (2.80GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [FrogNano-4B-2609-bf16.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-bf16.gguf) | bf16 | 8.67GB | false | Full BF16 weights. |
| [FrogNano-4B-2609-Q8_0.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q8_0.gguf) | Q8_0 | 4.62GB | false | Extremely high quality, generally unneeded but max available quant. |
| [FrogNano-4B-2609-Q6_K_L.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q6_K_L.gguf) | Q6_K_L | 3.92GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [FrogNano-4B-2609-Q6_K.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q6_K.gguf) | Q6_K | 3.76GB | false | Very high quality, near perfect, *recommended*. |
| [FrogNano-4B-2609-Q6_K_S.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q6_K_S.gguf) | Q6_K_S | 3.61GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [FrogNano-4B-2609-Q5_K_M.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q5_K_M.gguf) | Q5_K_M | 3.36GB | false | High quality, *recommended*. |
| [FrogNano-4B-2609-Q5_K_S.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q5_K_S.gguf) | Q5_K_S | 3.15GB | false | High quality, *recommended*. |
| [FrogNano-4B-2609-Q4_K_L.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q4_K_L.gguf) | Q4_K_L | 2.97GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [FrogNano-4B-2609-Q4_1.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q4_1.gguf) | Q4_1 | 2.92GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [FrogNano-4B-2609-Q4_K_M.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q4_K_M.gguf) | Q4_K_M | 2.80GB | false | Good quality, default size for most use cases, *recommended*. |
| [FrogNano-4B-2609-IQ4_NL.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-IQ4_NL.gguf) | IQ4_NL | 2.79GB | false | Similar to IQ4_XS, but slightly larger. |
| [FrogNano-4B-2609-Q4_0.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q4_0.gguf) | Q4_0 | 2.72GB | false | Legacy format, kept for compatibility with older tools. |
| [FrogNano-4B-2609-Q4_K_S.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q4_K_S.gguf) | Q4_K_S | 2.62GB | false | Slightly lower quality with more space savings, *recommended*. |
| [FrogNano-4B-2609-IQ4_XS.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-IQ4_XS.gguf) | IQ4_XS | 2.51GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [FrogNano-4B-2609-IQ3_M.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-IQ3_M.gguf) | IQ3_M | 2.35GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [FrogNano-4B-2609-Q3_K_L.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q3_K_L.gguf) | Q3_K_L | 2.24GB | false | Lower quality but usable, good for low RAM availability. |
| [FrogNano-4B-2609-Q3_K_M.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q3_K_M.gguf) | Q3_K_M | 2.14GB | false | Low quality. |
| [FrogNano-4B-2609-IQ3_XS.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-IQ3_XS.gguf) | IQ3_XS | 2.05GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [FrogNano-4B-2609-Q3_K_S.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q3_K_S.gguf) | Q3_K_S | 2.04GB | false | Low quality, *not* recommended. |
| [FrogNano-4B-2609-IQ3_XXS.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-IQ3_XXS.gguf) | IQ3_XXS | 1.98GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [FrogNano-4B-2609-Q2_K.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-Q2_K.gguf) | Q2_K | 1.80GB | false | Very low quality but surprisingly usable. |
| [FrogNano-4B-2609-IQ2_M.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-IQ2_M.gguf) | IQ2_M | 1.65GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |

Download a specific file:

```
hf download bartowski/FrogNano-4B-2609-GGUF --include "FrogNano-4B-2609-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/FrogNano-4B-2609-GGUF --include "FrogNano-4B-2609-Q4_K_M.gguf" --local-dir ./
```

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/FrogNano-4B-2609-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b11279 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image input. Alongside the quants, this repo includes the multimodal projector files [mmproj-FrogNano-4B-2609-bf16.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/mmproj-FrogNano-4B-2609-bf16.gguf) and [mmproj-FrogNano-4B-2609-f16.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/mmproj-FrogNano-4B-2609-f16.gguf), which pair with any quant above.

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

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on [bartowski/togethercomputer_Tev1-4B-experimental-GGUF](https://huggingface.co/bartowski/togethercomputer_Tev1-4B-experimental-GGUF) (same architecture and tensor shapes) before any of these files were released: Q4_K_M reached 0.66×, Q3_K_M 0.58× and IQ2_M 0.69× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 3.92GB | 7.40 | 7.25 | 50 % |
| Q6_K | 3.76GB | 7.04 | 6.95 | 70 % |
| Q6_K_S | 3.61GB | 6.71 | 6.68 | 90 % |
| Q5_K_M | 3.36GB | 6.15 | 6.21 | 70 % |
| Q5_K_S | 3.15GB | 5.69 | 5.83 | 90 % |
| Q4_K_L | 2.97GB | 5.46 | 5.49 | 50 % |
| Q4_K_M | 2.80GB | 5.08 | 5.17 | 70 % |
| IQ4_NL | 2.79GB | 5.05 | 5.15 | 70 % |
| Q4_K_S | 2.62GB | 4.67 | 4.84 | 90 % |
| IQ4_XS | 2.51GB | 4.42 | 4.63 | 90 % |
| IQ3_M | 2.35GB | 4.24 | 4.34 | 50 % |
| Q3_K_L | 2.24GB | 4.01 | 4.15 | 50 % |
| Q3_K_M | 2.14GB | 3.78 | 3.96 | 70 % |
| IQ3_XS | 2.05GB | 3.58 | 3.79 | 90 % |
| Q3_K_S | 2.04GB | 3.54 | 3.76 | 90 % |
| IQ3_XXS | 1.98GB | 3.41 | 3.65 | 70 % |
| Q2_K | 1.80GB | 3.01 | 3.32 | 70 % |
| IQ2_M | 1.65GB | 2.88 | 3.06 | 70 % |

Checked on [bartowski/togethercomputer_Tev1-4B-experimental-GGUF](https://huggingface.co/bartowski/togethercomputer_Tev1-4B-experimental-GGUF), which shares this model's architecture and tensor shapes: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0230 ± 0.0009 | 0.0228 ± 0.0011 | 0.66× | −5.3 % |
| Q3_K_M | 0.0922 ± 0.0018 | 0.0758 ± 0.0018 | 0.58× | −14.9 % |
| IQ2_M | 0.2849 ± 0.0031 | 0.2568 ± 0.0031 | 0.69× | −12.7 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [FrogNano-4B-2609-calibration-v6.txt](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-calibration-v6.txt). The imatrix is available here: [FrogNano-4B-2609-imatrix.gguf](https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF/blob/main/FrogNano-4B-2609-imatrix.gguf).

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
  "tool_chunks": 336,
  "total_chunks": 550,
  "n_conversations": 137,
  "conversation_token_lengths": [
    566,
    1629,
    916,
    1404,
    1147,
    1366,
    2568,
    666,
    1229,
    1234,
    1069,
    2098,
    883,
    978,
    2402,
    1275,
    1122,
    988,
    739,
    720,
    1364,
    1060,
    1409,
    1204,
    1720,
    1500,
    1052,
    724,
    974,
    1505,
    1571,
    842,
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
    1772,
    1963,
    1317,
    1611,
    783,
    2443,
    1104,
    2639,
    789,
    1026,
    753,
    905,
    700,
    2315,
    760,
    1150,
    1089,
    1233,
    1173,
    928,
    1024,
    970,
    1425,
    915,
    1554,
    1837,
    843,
    323,
    1124,
    3003,
    2838,
    711,
    764,
    1034,
    797,
    1300,
    1084,
    1153,
    797,
    1073,
    1073,
    1293,
    1548,
    1405,
    1391,
    875,
    660,
    2472,
    640,
    1163,
    1677,
    1949,
    1205,
    645,
    1358,
    1126,
    1731,
    1700,
    1717,
    819,
    772,
    1039,
    2858,
    742,
    598,
    765,
    1263,
    1054,
    1372,
    770,
    350,
    319,
    2323,
    735,
    1141,
    1832,
    1730,
    2365,
    2375,
    693,
    982,
    842,
    852,
    1241,
    1001,
    844,
    1359,
    832,
    712,
    1423,
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
