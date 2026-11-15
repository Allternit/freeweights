## Llamacpp imatrix Quantizations of Oc-e-Non-v1 by p-e-w

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b12180">b12180</a> for quantization.

Original model: https://huggingface.co/p-e-w/Oc-e-Non-v1

**Model details:**
- Parameter count: 4B (source checkpoint)
- Input support: text
- Speculative decoding: no
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<|im_start|>system
{system_prompt}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
```

<details><summary>Prompt format with tool definitions</summary>

```
<|im_start|>system
{system_prompt}

# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{"type": "function", "function": {"name": "get_stock_price", "description": "Get the current stock price", "parameters": {"type": "object", "properties": {"symbol": {"type": "string", "description": "The stock symbol, e.g. AAPL, GOOG"}}, "required": ["symbol"]}}}
</tools>

For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{"name": <function-name>, "arguments": <args-json-object>}
</tool_call><|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
```

</details>

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q4_K_M.gguf) (2.59GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [p-e-w_Oc-e-Non-v1-bf16.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-bf16.gguf) | bf16 | 8.05GB | false | Full BF16 weights. |
| [p-e-w_Oc-e-Non-v1-Q8_0.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q8_0.gguf) | Q8_0 | 4.28GB | false | Extremely high quality, generally unneeded but max available quant. |
| [p-e-w_Oc-e-Non-v1-Q6_K_L.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q6_K_L.gguf) | Q6_K_L | 3.69GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [p-e-w_Oc-e-Non-v1-Q6_K.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q6_K.gguf) | Q6_K | 3.52GB | false | Very high quality, near perfect, *recommended*. |
| [p-e-w_Oc-e-Non-v1-Q6_K_S.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q6_K_S.gguf) | Q6_K_S | 3.38GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [p-e-w_Oc-e-Non-v1-Q5_K_M.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q5_K_M.gguf) | Q5_K_M | 3.11GB | false | High quality, *recommended*. |
| [p-e-w_Oc-e-Non-v1-Q5_K_S.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q5_K_S.gguf) | Q5_K_S | 2.91GB | false | High quality, *recommended*. |
| [p-e-w_Oc-e-Non-v1-Q4_K_L.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q4_K_L.gguf) | Q4_K_L | 2.80GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [p-e-w_Oc-e-Non-v1-Q4_1.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q4_1.gguf) | Q4_1 | 2.63GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [p-e-w_Oc-e-Non-v1-Q4_K_M.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q4_K_M.gguf) | Q4_K_M | 2.59GB | false | Good quality, default size for most use cases, *recommended*. |
| [p-e-w_Oc-e-Non-v1-IQ4_NL.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-IQ4_NL.gguf) | IQ4_NL | 2.59GB | false | Similar to IQ4_XS, but slightly larger. |
| [p-e-w_Oc-e-Non-v1-Q4_K_S.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q4_K_S.gguf) | Q4_K_S | 2.44GB | false | Slightly lower quality with more space savings, *recommended*. |
| [p-e-w_Oc-e-Non-v1-Q4_0.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q4_0.gguf) | Q4_0 | 2.42GB | false | Legacy format, kept for compatibility with older tools. |
| [p-e-w_Oc-e-Non-v1-IQ4_XS.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-IQ4_XS.gguf) | IQ4_XS | 2.33GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [p-e-w_Oc-e-Non-v1-IQ3_M.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-IQ3_M.gguf) | IQ3_M | 2.16GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [p-e-w_Oc-e-Non-v1-Q3_K_L.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q3_K_L.gguf) | Q3_K_L | 2.08GB | false | Lower quality but usable, good for low RAM availability. |
| [p-e-w_Oc-e-Non-v1-Q3_K_M.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q3_K_M.gguf) | Q3_K_M | 1.98GB | false | Low quality. |
| [p-e-w_Oc-e-Non-v1-IQ3_XS.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-IQ3_XS.gguf) | IQ3_XS | 1.84GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [p-e-w_Oc-e-Non-v1-Q3_K_S.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q3_K_S.gguf) | Q3_K_S | 1.83GB | false | Low quality, *not* recommended. |
| [p-e-w_Oc-e-Non-v1-IQ3_XXS.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-IQ3_XXS.gguf) | IQ3_XXS | 1.75GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [p-e-w_Oc-e-Non-v1-Q2_K.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q2_K.gguf) | Q2_K | 1.59GB | false | Very low quality but surprisingly usable. |
| [p-e-w_Oc-e-Non-v1-IQ2_M.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-IQ2_M.gguf) | IQ2_M | 1.49GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |

Download a specific file:

```
hf download bartowski/p-e-w_Oc-e-Non-v1-GGUF --include "p-e-w_Oc-e-Non-v1-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/p-e-w_Oc-e-Non-v1-GGUF --include "p-e-w_Oc-e-Non-v1-Q4_K_M.gguf" --local-dir ./
```

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/p-e-w_Oc-e-Non-v1-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b12180 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on [bartowski/zime-ai_dwight-4b-GGUF](https://huggingface.co/bartowski/zime-ai_dwight-4b-GGUF) (same architecture and tensor shapes) before any of these files were released: Q4_K_M reached 1.03×, Q3_K_M 0.72× and IQ2_M 0.84× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 3.69GB | 7.41 | 7.34 | 50 % |
| Q6_K | 3.52GB | 7.04 | 7.01 | 70 % |
| Q6_K_S | 3.38GB | 6.71 | 6.71 | 90 % |
| Q5_K_M | 3.11GB | 6.13 | 6.19 | 70 % |
| Q5_K_S | 2.91GB | 5.68 | 5.78 | 90 % |
| Q4_K_L | 2.80GB | 5.45 | 5.57 | 50 % |
| Q4_K_M | 2.59GB | 5.00 | 5.16 | 70 % |
| IQ4_NL | 2.59GB | 4.99 | 5.15 | 70 % |
| Q4_K_S | 2.44GB | 4.67 | 4.86 | 90 % |
| IQ4_XS | 2.33GB | 4.42 | 4.64 | 90 % |
| IQ3_M | 2.16GB | 4.26 | 4.29 | 50 % |
| Q3_K_L | 2.08GB | 3.98 | 4.14 | 50 % |
| Q3_K_M | 1.98GB | 3.75 | 3.93 | 70 % |
| IQ3_XS | 1.84GB | 3.56 | 3.67 | 90 % |
| Q3_K_S | 1.83GB | 3.54 | 3.65 | 90 % |
| IQ3_XXS | 1.75GB | 3.35 | 3.48 | 70 % |
| Q2_K | 1.59GB | 3.00 | 3.16 | 70 % |
| IQ2_M | 1.49GB | 2.90 | 2.97 | 70 % |

Checked on [bartowski/zime-ai_dwight-4b-GGUF](https://huggingface.co/bartowski/zime-ai_dwight-4b-GGUF), which shares this model's architecture and tensor shapes: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0238 ± 0.0003 | 0.0224 ± 0.0003 | 1.03× | equal |
| Q3_K_M | 0.0956 ± 0.0010 | 0.0808 ± 0.0010 | 0.72× | −8.3 % |
| IQ2_M | 0.4399 ± 0.0030 | 0.2977 ± 0.0027 | 0.84× | −11.8 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [p-e-w_Oc-e-Non-v1-calibration-v6.txt](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-calibration-v6.txt). The imatrix is available here: [p-e-w_Oc-e-Non-v1-imatrix.gguf](https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-imatrix.gguf).

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
  "prose_chunks": 218,
  "tool_chunks": 268,
  "total_chunks": 486,
  "n_conversations": 164,
  "conversation_token_lengths": [
    319,
    847,
    573,
    1180,
    806,
    635,
    719,
    2084,
    1087,
    410,
    612,
    967,
    810,
    1200,
    481,
    669,
    2076,
    771,
    696,
    633,
    695,
    367,
    316,
    637,
    667,
    615,
    1009,
    580,
    547,
    785,
    1530,
    807,
    637,
    477,
    622,
    1229,
    999,
    455,
    509,
    718,
    425,
    1262,
    1075,
    703,
    244,
    778,
    645,
    646,
    984,
    1545,
    879,
    1713,
    680,
    944,
    536,
    2326,
    2079,
    450,
    2395,
    489,
    666,
    456,
    332,
    377,
    1978,
    518,
    607,
    661,
    636,
    729,
    579,
    716,
    651,
    559,
    706,
    689,
    595,
    1115,
    401,
    786,
    1583,
    816,
    265,
    130,
    345,
    731,
    2760,
    1947,
    357,
    1277,
    472,
    621,
    500,
    718,
    317,
    691,
    398,
    791,
    621,
    846,
    1036,
    799,
    636,
    846,
    827,
    539,
    617,
    368,
    483,
    1158,
    2144,
    2082,
    328,
    318,
    1248,
    847,
    844,
    2071,
    1357,
    613,
    295,
    581,
    1115,
    1091,
    1406,
    1115,
    522,
    676,
    508,
    242,
    651,
    2069,
    406,
    926,
    418,
    435,
    925,
    248,
    1071,
    458,
    147,
    124,
    1977,
    452,
    650,
    1695,
    1386,
    2020,
    2057,
    467,
    636,
    497,
    528,
    620,
    563,
    358,
    786,
    548,
    404,
    1095,
    617,
    516,
    739,
    1011
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
