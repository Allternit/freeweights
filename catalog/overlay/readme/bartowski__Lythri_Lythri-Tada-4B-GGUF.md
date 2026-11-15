## Llamacpp imatrix Quantizations of Lythri-Tada-4B by Lythri

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b12074">b12074</a> for quantization.

Original model: https://huggingface.co/Lythri/Lythri-Tada-4B

**Model details:**
- Parameter count: 5B (source checkpoint)
- Input support: text
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
```

<details><summary>Prompt format with tool definitions</summary>

```
<bos><|turn>system
{system_prompt}<|tool>declaration:get_stock_price{description:<|"|>Get the current stock price<|"|>,parameters:{properties:{symbol:{description:<|"|>The stock symbol, e.g. AAPL, GOOG<|"|>,type:<|"|>STRING<|"|>}},required:[<|"|>symbol<|"|>],type:<|"|>OBJECT<|"|>}}<tool|><turn|>
<|turn>user
{prompt}<turn|>
<|turn>model
```

</details>

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q4_K_M.gguf) (3.17GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [Lythri_Lythri-Tada-4B-bf16.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-bf16.gguf) | bf16 | 9.27GB | false | Full BF16 weights. |
| [Lythri_Lythri-Tada-4B-Q8_0.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q8_0.gguf) | Q8_0 | 4.95GB | false | Extremely high quality, generally unneeded but max available quant. |
| [Lythri_Lythri-Tada-4B-Q6_K_L.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q6_K_L.gguf) | Q6_K_L | 4.03GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [Lythri_Lythri-Tada-4B-Q6_K.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q6_K.gguf) | Q6_K | 3.94GB | false | Very high quality, near perfect, *recommended*. |
| [Lythri_Lythri-Tada-4B-Q6_K_S.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q6_K_S.gguf) | Q6_K_S | 3.87GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [Lythri_Lythri-Tada-4B-Q5_K_M.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q5_K_M.gguf) | Q5_K_M | 3.73GB | false | High quality, *recommended*. |
| [Lythri_Lythri-Tada-4B-Q5_K_S.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q5_K_S.gguf) | Q5_K_S | 3.63GB | false | High quality, *recommended*. |
| [Lythri_Lythri-Tada-4B-Q4_1.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q4_1.gguf) | Q4_1 | 3.48GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [Lythri_Lythri-Tada-4B-Q4_0.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q4_0.gguf) | Q4_0 | 3.37GB | false | Legacy format, kept for compatibility with older tools. |
| [Lythri_Lythri-Tada-4B-Q4_K_L.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q4_K_L.gguf) | Q4_K_L | 3.29GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [Lythri_Lythri-Tada-4B-Q4_K_M.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q4_K_M.gguf) | Q4_K_M | 3.17GB | false | Good quality, default size for most use cases, *recommended*. |
| [Lythri_Lythri-Tada-4B-IQ4_NL.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-IQ4_NL.gguf) | IQ4_NL | 3.17GB | false | Similar to IQ4_XS, but slightly larger. |
| [Lythri_Lythri-Tada-4B-Q4_K_S.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q4_K_S.gguf) | Q4_K_S | 3.08GB | false | Slightly lower quality with more space savings, *recommended*. |
| [Lythri_Lythri-Tada-4B-IQ4_XS.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-IQ4_XS.gguf) | IQ4_XS | 3.02GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Lythri_Lythri-Tada-4B-IQ3_M.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-IQ3_M.gguf) | IQ3_M | 2.65GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Lythri_Lythri-Tada-4B-Q3_K_L.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q3_K_L.gguf) | Q3_K_L | 2.62GB | false | Lower quality but usable, good for low RAM availability. |
| [Lythri_Lythri-Tada-4B-Q3_K_M.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q3_K_M.gguf) | Q3_K_M | 2.54GB | false | Low quality. |
| [Lythri_Lythri-Tada-4B-IQ3_XS.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-IQ3_XS.gguf) | IQ3_XS | 2.48GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Lythri_Lythri-Tada-4B-Q3_K_S.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q3_K_S.gguf) | Q3_K_S | 2.47GB | false | Low quality, *not* recommended. |
| [Lythri_Lythri-Tada-4B-IQ3_XXS.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-IQ3_XXS.gguf) | IQ3_XXS | 2.44GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Lythri_Lythri-Tada-4B-Q2_K.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q2_K.gguf) | Q2_K | 2.34GB | false | Very low quality but surprisingly usable. |
| [Lythri_Lythri-Tada-4B-IQ2_M.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-IQ2_M.gguf) | IQ2_M | 1.95GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |

Download a specific file:

```
hf download bartowski/Lythri_Lythri-Tada-4B-GGUF --include "Lythri_Lythri-Tada-4B-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/Lythri_Lythri-Tada-4B-GGUF --include "Lythri_Lythri-Tada-4B-Q4_K_M.gguf" --local-dir ./
```

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/Lythri_Lythri-Tada-4B-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b12074 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on [bartowski/RinggAI_ringg-router-e2b-GGUF](https://huggingface.co/bartowski/RinggAI_ringg-router-e2b-GGUF) (same architecture and tensor shapes) before any of these files were released: Q4_K_M reached 0.15×, Q3_K_M 0.20× and IQ2_M 0.20× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 4.03GB | 7.40 | 6.96 | 50 % |
| Q6_K | 3.94GB | 7.04 | 6.81 | 70 % |
| Q6_K_S | 3.87GB | 6.71 | 6.68 | 90 % |
| Q5_K_M | 3.73GB | 6.14 | 6.45 | 70 % |
| Q5_K_S | 3.63GB | 5.69 | 6.27 | 90 % |
| Q4_K_L | 3.29GB | 5.61 | 5.70 | 50 % |
| Q4_K_M | 3.17GB | 5.08 | 5.48 | 70 % |
| IQ4_NL | 3.17GB | 5.08 | 5.48 | 70 % |
| Q4_K_S | 3.08GB | 4.68 | 5.32 | 90 % |
| IQ4_XS | 3.02GB | 4.42 | 5.22 | 90 % |
| IQ3_M | 2.65GB | 4.32 | 4.58 | 50 % |
| Q3_K_L | 2.62GB | 4.18 | 4.52 | 50 % |
| Q3_K_M | 2.54GB | 3.84 | 4.38 | 70 % |
| IQ3_XS | 2.48GB | 3.58 | 4.28 | 90 % |
| Q3_K_S | 2.47GB | 3.54 | 4.26 | 90 % |
| IQ3_XXS | 2.44GB | 3.44 | 4.22 | 70 % |
| Q2_K | 2.34GB | 3.00 | 4.05 | 70 % |
| IQ2_M | 1.95GB | 2.89 | 3.38 | 70 % |

Checked on [bartowski/RinggAI_ringg-router-e2b-GGUF](https://huggingface.co/bartowski/RinggAI_ringg-router-e2b-GGUF), which shares this model's architecture and tensor shapes: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0381 ± 0.0005 | 0.0516 ± 0.0006 | 0.15× | −8.0 % |
| Q3_K_M | 0.1898 ± 0.0016 | 0.2395 ± 0.0021 | 0.20× | −21.1 % |
| IQ2_M | 0.5899 ± 0.0040 | 0.8125 ± 0.0052 | 0.20× | −25.1 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [Lythri_Lythri-Tada-4B-calibration-v6.txt](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-calibration-v6.txt). The imatrix is available here: [Lythri_Lythri-Tada-4B-imatrix.gguf](https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-imatrix.gguf).

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
