## Llamacpp imatrix Quantizations of basal-omni-1.0-ultra by Remek

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b11716">b11716</a> for quantization.

Original model: https://huggingface.co/Remek/basal-omni-1.0-ultra

**Model details:**
- Parameter count: 31B (source checkpoint)
- Input support: text, image and audio (with mmproj file) - [details](#multimodal)
- Speculative decoding: no
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<bos><|turn>system
{system_prompt}<turn|>
<|turn>user
{prompt}<turn|>
<|turn>model
<|channel>thought
<channel|>
```

<details><summary>Prompt format with tool definitions</summary>

```
<bos><|turn>system
{system_prompt}<|tool>declaration:get_stock_price{description:<|"|>Get the current stock price<|"|>,parameters:{properties:{symbol:{description:<|"|>The stock symbol, e.g. AAPL, GOOG<|"|>,type:<|"|>STRING<|"|>}},required:[<|"|>symbol<|"|>],type:<|"|>OBJECT<|"|>}}<tool|><turn|>
<|turn>user
{prompt}<turn|>
<|turn>model
<|channel>thought
<channel|>
```

</details>

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q4_K_M.gguf) (19.52GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [Remek_basal-omni-1.0-ultra-bf16.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/tree/main/Remek_basal-omni-1.0-ultra-bf16) | bf16 | 61.41GB | true | Full BF16 weights. |
| [Remek_basal-omni-1.0-ultra-Q8_0.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q8_0.gguf) | Q8_0 | 32.64GB | false | Extremely high quality, generally unneeded but max available quant. |
| [Remek_basal-omni-1.0-ultra-Q6_K_L.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q6_K_L.gguf) | Q6_K_L | 28.29GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [Remek_basal-omni-1.0-ultra-Q6_K.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q6_K.gguf) | Q6_K | 26.96GB | false | Very high quality, near perfect, *recommended*. |
| [Remek_basal-omni-1.0-ultra-Q6_K_S.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q6_K_S.gguf) | Q6_K_S | 25.76GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [Remek_basal-omni-1.0-ultra-Q5_K_M.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q5_K_M.gguf) | Q5_K_M | 23.50GB | false | High quality, *recommended*. |
| [Remek_basal-omni-1.0-ultra-Q5_K_S.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q5_K_S.gguf) | Q5_K_S | 21.99GB | false | High quality, *recommended*. |
| [Remek_basal-omni-1.0-ultra-Q4_K_L.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q4_K_L.gguf) | Q4_K_L | 20.91GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [Remek_basal-omni-1.0-ultra-Q4_1.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q4_1.gguf) | Q4_1 | 19.77GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [Remek_basal-omni-1.0-ultra-Q4_K_M.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q4_K_M.gguf) | Q4_K_M | 19.52GB | false | Good quality, default size for most use cases, *recommended*. |
| [Remek_basal-omni-1.0-ultra-IQ4_NL.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ4_NL.gguf) | IQ4_NL | 19.40GB | false | Similar to IQ4_XS, but slightly larger. |
| [Remek_basal-omni-1.0-ultra-Q4_K_S.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q4_K_S.gguf) | Q4_K_S | 18.31GB | false | Slightly lower quality with more space savings, *recommended*. |
| [Remek_basal-omni-1.0-ultra-Q4_0.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q4_0.gguf) | Q4_0 | 18.08GB | false | Legacy format, kept for compatibility with older tools. |
| [Remek_basal-omni-1.0-ultra-IQ4_XS.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ4_XS.gguf) | IQ4_XS | 17.23GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Remek_basal-omni-1.0-ultra-IQ3_M.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ3_M.gguf) | IQ3_M | 16.40GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Remek_basal-omni-1.0-ultra-Q3_K_L.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q3_K_L.gguf) | Q3_K_L | 15.62GB | false | Lower quality but usable, good for low RAM availability. |
| [Remek_basal-omni-1.0-ultra-Q3_K_M.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q3_K_M.gguf) | Q3_K_M | 14.70GB | false | Low quality. |
| [Remek_basal-omni-1.0-ultra-IQ3_XS.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ3_XS.gguf) | IQ3_XS | 14.04GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Remek_basal-omni-1.0-ultra-Q3_K_S.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q3_K_S.gguf) | Q3_K_S | 13.96GB | false | Low quality, *not* recommended. |
| [Remek_basal-omni-1.0-ultra-IQ3_XXS.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ3_XXS.gguf) | IQ3_XXS | 13.33GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Remek_basal-omni-1.0-ultra-Q2_K.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-Q2_K.gguf) | Q2_K | 11.93GB | false | Very low quality but surprisingly usable. |
| [Remek_basal-omni-1.0-ultra-IQ2_M.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ2_M.gguf) | IQ2_M | 11.34GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [Remek_basal-omni-1.0-ultra-IQ2_S.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ2_S.gguf) | IQ2_S | 10.22GB | false | Low quality, uses SOTA techniques to be usable. |
| [Remek_basal-omni-1.0-ultra-IQ2_XS.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ2_XS.gguf) | IQ2_XS | 9.61GB | false | Low quality, uses SOTA techniques to be usable. |
| [Remek_basal-omni-1.0-ultra-IQ2_XXS.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-IQ2_XXS.gguf) | IQ2_XXS | 9.16GB | false | Very low quality, uses SOTA techniques to be usable. |

Download a specific file:

```
hf download bartowski/Remek_basal-omni-1.0-ultra-GGUF --include "Remek_basal-omni-1.0-ultra-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/Remek_basal-omni-1.0-ultra-GGUF --include "Remek_basal-omni-1.0-ultra-Q4_K_M.gguf" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/Remek_basal-omni-1.0-ultra-GGUF --include "Remek_basal-omni-1.0-ultra-bf16/*" --local-dir ./
```

You can either specify a new local-dir (Remek_basal-omni-1.0-ultra-bf16) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/Remek_basal-omni-1.0-ultra-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b11716 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image and audio input. Alongside the quants, this repo includes the multimodal projector files [mmproj-Remek_basal-omni-1.0-ultra-bf16.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/mmproj-Remek_basal-omni-1.0-ultra-bf16.gguf) and [mmproj-Remek_basal-omni-1.0-ultra-f16.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/mmproj-Remek_basal-omni-1.0-ultra-f16.gguf), which pair with any quant above.

llama.cpp downloads the mmproj automatically when using `-hf` as shown above; if you're loading files manually, pass it with `--mmproj`.

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on [bartowski/TheDrummer_Artemis-31B-v1.2-GGUF](https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF) (same architecture and tensor shapes) before any of these files were released: Q4_K_M reached 1.01×, Q3_K_M 0.90× and IQ2_XXS 0.80× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 28.29GB | 7.41 | 7.37 | 50 % |
| Q6_K | 26.96GB | 7.04 | 7.03 | 70 % |
| Q6_K_S | 25.76GB | 6.71 | 6.71 | 90 % |
| Q5_K_M | 23.50GB | 6.10 | 6.12 | 70 % |
| Q5_K_S | 21.99GB | 5.68 | 5.73 | 90 % |
| Q4_K_L | 20.91GB | 5.39 | 5.45 | 50 % |
| Q4_K_M | 19.52GB | 5.01 | 5.09 | 70 % |
| IQ4_NL | 19.40GB | 4.98 | 5.06 | 70 % |
| Q4_K_S | 18.31GB | 4.68 | 4.77 | 90 % |
| IQ4_XS | 17.23GB | 4.39 | 4.49 | 90 % |
| IQ3_M | 16.40GB | 4.21 | 4.27 | 50 % |
| Q3_K_L | 15.62GB | 4.00 | 4.07 | 50 % |
| Q3_K_M | 14.70GB | 3.75 | 3.83 | 70 % |
| IQ3_XS | 14.04GB | 3.56 | 3.66 | 90 % |
| Q3_K_S | 13.96GB | 3.54 | 3.64 | 90 % |
| IQ3_XXS | 13.33GB | 3.37 | 3.47 | 70 % |
| Q2_K | 11.93GB | 2.99 | 3.11 | 70 % |
| IQ2_M | 11.34GB | 2.88 | 2.96 | 70 % |
| IQ2_S | 10.22GB | 2.57 | 2.66 | 70 % |
| IQ2_XS | 9.61GB | 2.40 | 2.50 | 90 % |
| IQ2_XXS | 9.16GB | 2.28 | 2.39 | 70 % |

Checked on [bartowski/TheDrummer_Artemis-31B-v1.2-GGUF](https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF), which shares this model's architecture and tensor shapes: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.6093 ± 0.0116 | 0.5935 ± 0.0119 | 1.01× | equal |
| Q3_K_M | 1.3691 ± 0.0162 | 1.1847 ± 0.0155 | 0.90× | −7.7 % |
| IQ2_XXS | 3.7906 ± 0.0232 | 3.3542 ± 0.0209 | 0.80× | −15.4 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [Remek_basal-omni-1.0-ultra-calibration-v6.txt](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-calibration-v6.txt). The imatrix is available here: [Remek_basal-omni-1.0-ultra-imatrix.gguf](https://huggingface.co/bartowski/Remek_basal-omni-1.0-ultra-GGUF/blob/main/Remek_basal-omni-1.0-ultra-imatrix.gguf).

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
  "prose_chunks": 219,
  "tool_chunks": 273,
  "total_chunks": 492,
  "n_conversations": 137,
  "conversation_token_lengths": [
    345,
    1411,
    652,
    1146,
    879,
    1186,
    2285,
    410,
    987,
    945,
    722,
    1728,
    667,
    739,
    2132,
    993,
    836,
    713,
    552,
    518,
    1152,
    782,
    1143,
    1012,
    1435,
    1215,
    797,
    470,
    752,
    1242,
    1309,
    590,
    1027,
    761,
    986,
    1458,
    1413,
    928,
    284,
    1746,
    1225,
    888,
    1157,
    1491,
    1715,
    1046,
    1269,
    518,
    2154,
    909,
    2418,
    569,
    761,
    515,
    919,
    491,
    2037,
    498,
    871,
    821,
    1008,
    963,
    680,
    772,
    742,
    1163,
    669,
    1272,
    1562,
    660,
    329,
    881,
    2853,
    2736,
    529,
    505,
    775,
    550,
    1061,
    869,
    921,
    526,
    807,
    826,
    926,
    1234,
    1158,
    1172,
    612,
    425,
    2180,
    660,
    907,
    1319,
    1790,
    972,
    417,
    1191,
    1133,
    1381,
    1394,
    1415,
    591,
    534,
    814,
    2647,
    530,
    357,
    561,
    982,
    872,
    1107,
    539,
    361,
    332,
    2029,
    496,
    923,
    1593,
    1438,
    2082,
    2110,
    459,
    670,
    615,
    600,
    1009,
    769,
    646,
    1093,
    547,
    517,
    1170,
    710,
    688,
    1087,
    1257
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
