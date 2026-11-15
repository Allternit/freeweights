## Llamacpp imatrix Quantizations of K2-Horizon-0.9B by IFM

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b11462">b11462</a> for quantization.

Original model: https://huggingface.co/IFM/K2-Horizon-0.9B

**Model details:**
- Parameter count: 1B (source checkpoint)
- Input support: text
- Speculative decoding: no
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<|ifm|im_start|>system
{system_prompt}<|ifm|im_end|><|ifm|im_start|>user
{prompt}<|ifm|im_end|><|ifm|im_start|>assistant
<ifm|think>
```

<details><summary>Prompt format with tool definitions</summary>

```
<|ifm|im_start|>system
# Tools
You may call one or more tools to assist with the user query.

Available tools are:

<ifm|tools>
## get_stock_price
Get the current stock price

**Parameters**
- `symbol` *(string, required)* - The stock symbol, e.g. AAPL, GOOG
</ifm|tools>

When calling tools, you MUST follow the tool-call format below:

Wrap all tool calls in a single <ifm|tool_calls></ifm|tool_calls> block. For each call, write the function name at the start of <ifm|tool_call>, followed by paired <ifm|arg_key> and <ifm|arg_value> tags for each argument:

<ifm|tool_calls>
<ifm|tool_call>$FUNCTION_NAME
<ifm|arg_key>$PARAMETER_NAME</ifm|arg_key>
<ifm|arg_value>$PARAMETER_VALUE</ifm|arg_value>
...
</ifm|tool_call>
</ifm|tool_calls>

String and scalar parameters should be written as plain text. Array and object parameters should be written as JSON literals.

{system_prompt}<|ifm|im_end|><|ifm|im_start|>user
{prompt}<|ifm|im_end|><|ifm|im_start|>assistant
<ifm|think>
```

</details>

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q4_K_M.gguf) (0.69GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [K2-Horizon-0.9B-bf16.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-bf16.gguf) | bf16 | 2.16GB | false | Full BF16 weights. |
| [K2-Horizon-0.9B-Q8_0.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q8_0.gguf) | Q8_0 | 1.15GB | false | Extremely high quality, generally unneeded but max available quant. |
| [K2-Horizon-0.9B-Q6_K_L.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q6_K_L.gguf) | Q6_K_L | 0.98GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [K2-Horizon-0.9B-Q6_K.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q6_K.gguf) | Q6_K | 0.94GB | false | Very high quality, near perfect, *recommended*. |
| [K2-Horizon-0.9B-Q6_K_S.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q6_K_S.gguf) | Q6_K_S | 0.90GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [K2-Horizon-0.9B-Q5_K_M.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q5_K_M.gguf) | Q5_K_M | 0.83GB | false | High quality, *recommended*. |
| [K2-Horizon-0.9B-Q5_K_S.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q5_K_S.gguf) | Q5_K_S | 0.78GB | false | High quality, *recommended*. |
| [K2-Horizon-0.9B-Q4_K_L.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q4_K_L.gguf) | Q4_K_L | 0.74GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [K2-Horizon-0.9B-Q4_1.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q4_1.gguf) | Q4_1 | 0.70GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [K2-Horizon-0.9B-Q4_K_M.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q4_K_M.gguf) | Q4_K_M | 0.69GB | false | Good quality, default size for most use cases, *recommended*. |
| [K2-Horizon-0.9B-IQ4_NL.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-IQ4_NL.gguf) | IQ4_NL | 0.69GB | false | Similar to IQ4_XS, but slightly larger. |
| [K2-Horizon-0.9B-Q4_K_S.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q4_K_S.gguf) | Q4_K_S | 0.65GB | false | Slightly lower quality with more space savings, *recommended*. |
| [K2-Horizon-0.9B-Q4_0.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q4_0.gguf) | Q4_0 | 0.65GB | false | Legacy format, kept for compatibility with older tools. |
| [K2-Horizon-0.9B-IQ4_XS.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-IQ4_XS.gguf) | IQ4_XS | 0.62GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [K2-Horizon-0.9B-IQ3_M.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-IQ3_M.gguf) | IQ3_M | 0.60GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [K2-Horizon-0.9B-Q3_K_L.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q3_K_L.gguf) | Q3_K_L | 0.57GB | false | Lower quality but usable, good for low RAM availability. |
| [K2-Horizon-0.9B-Q3_K_M.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q3_K_M.gguf) | Q3_K_M | 0.54GB | false | Low quality. |
| [K2-Horizon-0.9B-IQ3_XS.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-IQ3_XS.gguf) | IQ3_XS | 0.51GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [K2-Horizon-0.9B-Q3_K_S.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q3_K_S.gguf) | Q3_K_S | 0.50GB | false | Low quality, *not* recommended. |
| [K2-Horizon-0.9B-IQ3_XXS.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-IQ3_XXS.gguf) | IQ3_XXS | 0.50GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [K2-Horizon-0.9B-Q2_K.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-Q2_K.gguf) | Q2_K | 0.43GB | false | Very low quality but surprisingly usable. |
| [K2-Horizon-0.9B-IQ2_M.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-IQ2_M.gguf) | IQ2_M | 0.42GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |

Download a specific file:

```
hf download bartowski/K2-Horizon-0.9B-GGUF --include "K2-Horizon-0.9B-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/K2-Horizon-0.9B-GGUF --include "K2-Horizon-0.9B-Q4_K_M.gguf" --local-dir ./
```

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/K2-Horizon-0.9B-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b11462 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on this model before any of these files were released: Q4_K_M reached 0.91×, Q3_K_M 0.80× and IQ2_M 0.86× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 0.98GB | 7.40 | 7.27 | 50 % |
| Q6_K | 0.94GB | 7.04 | 6.98 | 70 % |
| Q6_K_S | 0.90GB | 6.71 | 6.71 | 90 % |
| Q5_K_M | 0.83GB | 6.14 | 6.14 | 70 % |
| Q5_K_S | 0.78GB | 5.68 | 5.77 | 90 % |
| Q4_K_L | 0.74GB | 5.46 | 5.50 | 50 % |
| Q4_K_M | 0.69GB | 5.00 | 5.12 | 70 % |
| IQ4_NL | 0.69GB | 4.99 | 5.11 | 70 % |
| Q4_K_S | 0.65GB | 4.67 | 4.85 | 90 % |
| IQ4_XS | 0.62GB | 4.42 | 4.62 | 90 % |
| IQ3_M | 0.60GB | 4.26 | 4.42 | 50 % |
| Q3_K_L | 0.57GB | 3.99 | 4.20 | 50 % |
| Q3_K_M | 0.54GB | 3.76 | 4.01 | 70 % |
| IQ3_XS | 0.51GB | 3.56 | 3.76 | 90 % |
| Q3_K_S | 0.50GB | 3.54 | 3.74 | 90 % |
| IQ3_XXS | 0.50GB | 3.36 | 3.68 | 70 % |
| Q2_K | 0.43GB | 3.00 | 3.20 | 70 % |
| IQ2_M | 0.42GB | 2.90 | 3.12 | 70 % |

Checked on this model: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0260 ± 0.0002 | 0.0282 ± 0.0003 | 0.91× | equal |
| Q3_K_M | 0.1173 ± 0.0009 | 0.1121 ± 0.0009 | 0.80× | −5.0 % |
| IQ2_M | 0.3802 ± 0.0027 | 0.3287 ± 0.0025 | 0.86× | −7.1 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [K2-Horizon-0.9B-calibration-v6.txt](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-calibration-v6.txt). The imatrix is available here: [K2-Horizon-0.9B-imatrix.gguf](https://huggingface.co/bartowski/K2-Horizon-0.9B-GGUF/blob/main/K2-Horizon-0.9B-imatrix.gguf).

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
  "prose_chunks": 229,
  "tool_chunks": 260,
  "total_chunks": 489,
  "n_conversations": 173,
  "conversation_token_lengths": [
    321,
    799,
    525,
    983,
    749,
    609,
    732,
    1979,
    1138,
    367,
    532,
    843,
    688,
    1026,
    512,
    642,
    1962,
    747,
    689,
    563,
    674,
    389,
    322,
    628,
    639,
    579,
    888,
    609,
    514,
    671,
    1394,
    769,
    605,
    487,
    611,
    1025,
    879,
    400,
    458,
    681,
    468,
    1082,
    1046,
    664,
    266,
    736,
    611,
    613,
    877,
    1414,
    785,
    1471,
    661,
    847,
    497,
    2116,
    1953,
    459,
    2390,
    493,
    609,
    437,
    314,
    378,
    1925,
    466,
    555,
    611,
    604,
    570,
    545,
    686,
    613,
    547,
    661,
    636,
    555,
    918,
    393,
    651,
    1450,
    695,
    294,
    128,
    331,
    631,
    2776,
    1872,
    359,
    1036,
    427,
    607,
    468,
    653,
    354,
    651,
    397,
    749,
    577,
    753,
    957,
    759,
    597,
    765,
    850,
    544,
    581,
    352,
    467,
    1029,
    2025,
    1980,
    334,
    330,
    1071,
    713,
    739,
    1953,
    1280,
    615,
    293,
    586,
    1074,
    826,
    1377,
    1030,
    524,
    629,
    529,
    269,
    647,
    1928,
    421,
    933,
    372,
    467,
    797,
    999,
    273,
    922,
    385,
    430,
    159,
    111,
    125,
    277,
    1853,
    640,
    460,
    593,
    537,
    1498,
    1281,
    1903,
    1950,
    423,
    589,
    802,
    472,
    376,
    505,
    546,
    549,
    1106,
    362,
    734,
    508,
    391,
    1032,
    537,
    448,
    708,
    972
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
