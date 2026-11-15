## Llamacpp imatrix Quantizations of Spark-X2.6-1.7B by XHToken

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b11969">b11969</a> for quantization.

Original model: https://huggingface.co/XHToken/Spark-X2.6-1.7B

**Model details:**
- Parameter count: 2B (source checkpoint)
- Input support: text
- Speculative decoding: no
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<｜start▁of▁sentence｜><|System|>
you are a helpful assistant.
`thinking_effort` guides on how much to think in your thinking channel (not including the response channel), supported values include `low` and `high`.
Now the system is invoked with `thinking_effort=high`.

{system_prompt}<｜end▁of▁sentence｜><｜start▁of▁sentence｜><|User|>{prompt}<｜end▁of▁sentence｜><｜start▁of▁sentence｜><|Bot|><think>
```

<details><summary>Prompt format with tool definitions</summary>

```
<｜start▁of▁sentence｜><|System|>
you are a helpful assistant.
`thinking_effort` guides on how much to think in your thinking channel (not including the response channel), supported values include `low` and `high`.
Now the system is invoked with `thinking_effort=high`.

## Tools
You have access to the following functions:
<tools>
{"name":"get_stock_price","description":"Get the current stock price","parameters":{"type":"object","properties":{"symbol":{"type":"string","description":"The stock symbol, e.g. AAPL, GOOG"}},"required":["symbol"]}}
</tools>

{system_prompt}<｜end▁of▁sentence｜><｜start▁of▁sentence｜><|User|>{prompt}<｜end▁of▁sentence｜><｜start▁of▁sentence｜><|Bot|><think>
```

</details>

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q4_K_M.gguf) (1.09GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [Spark-X2.6-1.7B-bf16.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-bf16.gguf) | bf16 | 3.42GB | false | Full BF16 weights. |
| [Spark-X2.6-1.7B-Q8_0.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q8_0.gguf) | Q8_0 | 1.82GB | false | Extremely high quality, generally unneeded but max available quant. |
| [Spark-X2.6-1.7B-Q6_K_L.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q6_K_L.gguf) | Q6_K_L | 1.56GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [Spark-X2.6-1.7B-Q6_K.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q6_K.gguf) | Q6_K | 1.49GB | false | Very high quality, near perfect, *recommended*. |
| [Spark-X2.6-1.7B-Q6_K_S.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q6_K_S.gguf) | Q6_K_S | 1.44GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [Spark-X2.6-1.7B-Q5_K_M.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q5_K_M.gguf) | Q5_K_M | 1.33GB | false | High quality, *recommended*. |
| [Spark-X2.6-1.7B-Q5_K_S.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q5_K_S.gguf) | Q5_K_S | 1.24GB | false | High quality, *recommended*. |
| [Spark-X2.6-1.7B-Q4_K_L.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q4_K_L.gguf) | Q4_K_L | 1.19GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [Spark-X2.6-1.7B-Q4_1.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q4_1.gguf) | Q4_1 | 1.13GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [Spark-X2.6-1.7B-Q4_K_M.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q4_K_M.gguf) | Q4_K_M | 1.09GB | false | Good quality, default size for most use cases, *recommended*. |
| [Spark-X2.6-1.7B-IQ4_NL.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-IQ4_NL.gguf) | IQ4_NL | 1.08GB | false | Similar to IQ4_XS, but slightly larger. |
| [Spark-X2.6-1.7B-Q4_0.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q4_0.gguf) | Q4_0 | 1.04GB | false | Legacy format, kept for compatibility with older tools. |
| [Spark-X2.6-1.7B-Q4_K_S.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q4_K_S.gguf) | Q4_K_S | 1.02GB | false | Slightly lower quality with more space savings, *recommended*. |
| [Spark-X2.6-1.7B-IQ4_XS.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-IQ4_XS.gguf) | IQ4_XS | 0.97GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Spark-X2.6-1.7B-IQ3_M.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-IQ3_M.gguf) | IQ3_M | 0.91GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Spark-X2.6-1.7B-Q3_K_L.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q3_K_L.gguf) | Q3_K_L | 0.88GB | false | Lower quality but usable, good for low RAM availability. |
| [Spark-X2.6-1.7B-Q3_K_M.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q3_K_M.gguf) | Q3_K_M | 0.83GB | false | Low quality. |
| [Spark-X2.6-1.7B-IQ3_XS.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-IQ3_XS.gguf) | IQ3_XS | 0.79GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Spark-X2.6-1.7B-Q3_K_S.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q3_K_S.gguf) | Q3_K_S | 0.79GB | false | Low quality, *not* recommended. |
| [Spark-X2.6-1.7B-IQ3_XXS.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-IQ3_XXS.gguf) | IQ3_XXS | 0.76GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Spark-X2.6-1.7B-Q2_K.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-Q2_K.gguf) | Q2_K | 0.70GB | false | Very low quality but surprisingly usable. |
| [Spark-X2.6-1.7B-IQ2_M.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-IQ2_M.gguf) | IQ2_M | 0.64GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |

Download a specific file:

```
hf download bartowski/Spark-X2.6-1.7B-GGUF --include "Spark-X2.6-1.7B-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/Spark-X2.6-1.7B-GGUF --include "Spark-X2.6-1.7B-Q4_K_M.gguf" --local-dir ./
```

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/Spark-X2.6-1.7B-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b11969 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on this model before any of these files were released: Q4_K_M reached 0.63×, Q3_K_M 0.71× and IQ2_M 0.81× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 1.56GB | 7.40 | 7.30 | 50 % |
| Q6_K | 1.49GB | 7.04 | 7.00 | 70 % |
| Q6_K_S | 1.44GB | 6.71 | 6.72 | 90 % |
| Q5_K_M | 1.33GB | 6.14 | 6.24 | 70 % |
| Q5_K_S | 1.24GB | 5.63 | 5.81 | 90 % |
| Q4_K_L | 1.19GB | 5.53 | 5.56 | 50 % |
| Q4_K_M | 1.09GB | 4.98 | 5.10 | 70 % |
| IQ4_NL | 1.08GB | 4.94 | 5.07 | 70 % |
| Q4_K_S | 1.02GB | 4.60 | 4.78 | 90 % |
| IQ4_XS | 0.97GB | 4.31 | 4.53 | 90 % |
| IQ3_M | 0.91GB | 4.20 | 4.28 | 50 % |
| Q3_K_L | 0.88GB | 4.03 | 4.14 | 50 % |
| Q3_K_M | 0.83GB | 3.71 | 3.87 | 70 % |
| IQ3_XS | 0.79GB | 3.52 | 3.71 | 90 % |
| Q3_K_S | 0.79GB | 3.52 | 3.71 | 90 % |
| IQ3_XXS | 0.76GB | 3.32 | 3.54 | 70 % |
| Q2_K | 0.70GB | 3.00 | 3.27 | 70 % |
| IQ2_M | 0.64GB | 2.87 | 3.00 | 70 % |

Checked on this model: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.2359 ± 0.0027 | 0.2470 ± 0.0028 | 0.63× | −4.9 % |
| Q3_K_M | 0.9964 ± 0.0075 | 0.9673 ± 0.0074 | 0.71× | −13.7 % |
| IQ2_M | 1.9198 ± 0.0107 | 1.9477 ± 0.0108 | 0.81× | −9.6 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [Spark-X2.6-1.7B-calibration-v6.txt](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-calibration-v6.txt). The imatrix is available here: [Spark-X2.6-1.7B-imatrix.gguf](https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B-imatrix.gguf).

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
  "prose_chunks": 225,
  "tool_chunks": 310,
  "total_chunks": 535,
  "n_conversations": 137,
  "conversation_token_lengths": [
    412,
    1472,
    1026,
    1262,
    922,
    1200,
    2894,
    602,
    990,
    1172,
    834,
    1845,
    742,
    1053,
    2513,
    1072,
    935,
    805,
    598,
    583,
    1228,
    830,
    1143,
    1066,
    1615,
    1321,
    1458,
    715,
    1235,
    1386,
    1315,
    997,
    1081,
    858,
    1111,
    1461,
    1512,
    1032,
    335,
    1785,
    1305,
    925,
    1186,
    1753,
    1850,
    1115,
    1419,
    680,
    2668,
    991,
    2692,
    621,
    814,
    771,
    981,
    547,
    2338,
    671,
    958,
    857,
    1016,
    1009,
    726,
    1013,
    989,
    1372,
    764,
    1305,
    1883,
    711,
    380,
    904,
    3283,
    2734,
    568,
    701,
    830,
    873,
    1067,
    981,
    913,
    639,
    1003,
    826,
    1085,
    1301,
    1212,
    1932,
    696,
    481,
    2479,
    717,
    1215,
    1446,
    1829,
    1056,
    474,
    1244,
    1192,
    1405,
    1700,
    1427,
    665,
    845,
    876,
    2593,
    597,
    531,
    611,
    1212,
    921,
    1399,
    617,
    415,
    377,
    2340,
    830,
    972,
    1688,
    1804,
    2412,
    2397,
    615,
    784,
    673,
    737,
    1029,
    815,
    705,
    1136,
    660,
    557,
    1566,
    800,
    734,
    1098,
    1273
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
