## Llamacpp imatrix Quantizations of Nex-N2.5-mini by nex-agi

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b10896">b10896</a> for quantization.

Original model: https://huggingface.co/nex-agi/Nex-N2.5-mini

**Model details:**
- Parameter count: 35B
- Input support: text, image (with mmproj file) - [details](#multimodal)
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
<think>
```

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q4_K_M.gguf) (22.32GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [nex-agi_Nex-N2.5-mini-bf16.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/tree/main/nex-agi_Nex-N2.5-mini-bf16) | bf16 | 69.38GB | true | Full BF16 weights. |
| [nex-agi_Nex-N2.5-mini-Q8_0.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q8_0.gguf) | Q8_0 | 36.91GB | false | Extremely high quality, generally unneeded but max available quant. |
| [nex-agi_Nex-N2.5-mini-Q6_K_L.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q6_K_L.gguf) | Q6_K_L | 32.30GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [nex-agi_Nex-N2.5-mini-Q6_K.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q6_K.gguf) | Q6_K | 29.37GB | false | Very high quality, near perfect, *recommended*. |
| [nex-agi_Nex-N2.5-mini-Q5_K_M.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q5_K_M.gguf) | Q5_K_M | 26.98GB | false | High quality, *recommended*. |
| [nex-agi_Nex-N2.5-mini-Q5_K_S.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q5_K_S.gguf) | Q5_K_S | 25.14GB | false | High quality, *recommended*. |
| [nex-agi_Nex-N2.5-mini-Q4_K_L.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q4_K_L.gguf) | Q4_K_L | 24.11GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [nex-agi_Nex-N2.5-mini-Q4_K_M.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q4_K_M.gguf) | Q4_K_M | 22.32GB | false | Good quality, default size for most use cases, *recommended*. |
| [nex-agi_Nex-N2.5-mini-IQ4_NL.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ4_NL.gguf) | IQ4_NL | 22.32GB | false | Similar to IQ4_XS, but slightly larger. |
| [nex-agi_Nex-N2.5-mini-Q4_1.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q4_1.gguf) | Q4_1 | 21.97GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [nex-agi_Nex-N2.5-mini-Q4_K_S.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q4_K_S.gguf) | Q4_K_S | 20.95GB | false | Slightly lower quality with more space savings, *recommended*. |
| [nex-agi_Nex-N2.5-mini-Q4_0.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q4_0.gguf) | Q4_0 | 19.94GB | false | Legacy format, kept for compatibility with older tools. |
| [nex-agi_Nex-N2.5-mini-IQ4_XS.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ4_XS.gguf) | IQ4_XS | 19.89GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [nex-agi_Nex-N2.5-mini-IQ3_M.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ3_M.gguf) | IQ3_M | 18.96GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [nex-agi_Nex-N2.5-mini-Q3_K_L.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q3_K_L.gguf) | Q3_K_L | 18.27GB | false | Lower quality but usable, good for low RAM availability. |
| [nex-agi_Nex-N2.5-mini-Q3_K_M.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q3_K_M.gguf) | Q3_K_M | 17.34GB | false | Low quality. |
| [nex-agi_Nex-N2.5-mini-IQ3_XS.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ3_XS.gguf) | IQ3_XS | 16.32GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [nex-agi_Nex-N2.5-mini-Q3_K_S.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q3_K_S.gguf) | Q3_K_S | 16.32GB | false | Low quality, *not* recommended. |
| [nex-agi_Nex-N2.5-mini-IQ3_XXS.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ3_XXS.gguf) | IQ3_XXS | 15.58GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [nex-agi_Nex-N2.5-mini-Q2_K.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-Q2_K.gguf) | Q2_K | 13.84GB | false | Very low quality but surprisingly usable. |
| [nex-agi_Nex-N2.5-mini-IQ2_M.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ2_M.gguf) | IQ2_M | 13.23GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [nex-agi_Nex-N2.5-mini-IQ2_S.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ2_S.gguf) | IQ2_S | 11.98GB | false | Low quality, uses SOTA techniques to be usable. |
| [nex-agi_Nex-N2.5-mini-IQ2_XS.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ2_XS.gguf) | IQ2_XS | 11.27GB | false | Low quality, uses SOTA techniques to be usable. |
| [nex-agi_Nex-N2.5-mini-IQ2_XXS.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-IQ2_XXS.gguf) | IQ2_XXS | 10.79GB | false | Very low quality, uses SOTA techniques to be usable. |

Download a specific file:

```
hf download bartowski/nex-agi_Nex-N2.5-mini-GGUF --include "nex-agi_Nex-N2.5-mini-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/nex-agi_Nex-N2.5-mini-GGUF --include "nex-agi_Nex-N2.5-mini-Q4_K_M.gguf" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/nex-agi_Nex-N2.5-mini-GGUF --include "nex-agi_Nex-N2.5-mini-bf16/*" --local-dir ./
```

You can either specify a new local-dir (nex-agi_Nex-N2.5-mini-bf16) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/nex-agi_Nex-N2.5-mini-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b10896 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image input. Alongside the quants, this repo includes the multimodal projector files [mmproj-nex-agi_Nex-N2.5-mini-f16.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/mmproj-nex-agi_Nex-N2.5-mini-f16.gguf) and [mmproj-nex-agi_Nex-N2.5-mini-bf16.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/mmproj-nex-agi_Nex-N2.5-mini-bf16.gguf), which pair with any quant above.

llama.cpp downloads the mmproj automatically when using `-hf` as shown above; if you're loading files manually, pass it with `--mmproj`.

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S, and Q6_K_L sits about halfway between Q6_K and Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt.

Checked on this model before any of these files were released: Q4_K_M reached 0.85×, Q3_K_M 0.80× and IQ2_XXS 0.87× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 32.30GB | 7.40 | 7.36 | 50 % |
| Q6_K | 29.37GB | 6.71 | 6.69 | 91 % |
| Q5_K_M | 26.98GB | 6.14 | 6.15 | 70 % |
| Q5_K_S | 25.14GB | 5.70 | 5.73 | 90 % |
| Q4_K_L | 24.11GB | 5.45 | 5.49 | 50 % |
| Q4_K_M | 22.32GB | 5.03 | 5.09 | 70 % |
| IQ4_NL | 22.32GB | 5.03 | 5.09 | 70 % |
| Q4_K_S | 20.95GB | 4.70 | 4.77 | 90 % |
| IQ4_XS | 19.89GB | 4.45 | 4.53 | 90 % |
| IQ3_M | 18.96GB | 4.23 | 4.32 | 50 % |
| Q3_K_L | 18.27GB | 4.06 | 4.16 | 50 % |
| Q3_K_M | 17.34GB | 3.84 | 3.95 | 70 % |
| IQ3_XS | 16.32GB | 3.60 | 3.72 | 90 % |
| Q3_K_S | 16.32GB | 3.60 | 3.72 | 90 % |
| IQ3_XXS | 15.58GB | 3.42 | 3.55 | 70 % |
| Q2_K | 13.84GB | 3.05 | 3.15 | 70 % |
| IQ2_M | 13.23GB | 2.87 | 3.02 | 70 % |
| IQ2_S | 11.98GB | 2.61 | 2.73 | 70 % |
| IQ2_XS | 11.27GB | 2.44 | 2.57 | 90 % |
| IQ2_XXS | 10.79GB | 2.33 | 2.46 | 70 % |

Checked on this model: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0302 ± 0.0006 | 0.0415 ± 0.0006 | 0.85× | +4.3 % |
| Q3_K_M | 0.0659 ± 0.0009 | 0.0991 ± 0.0014 | 0.80× | +6.9 % |
| IQ2_XXS | 0.2401 ± 0.0026 | 0.3331 ± 0.0033 | 0.87× | +10.4 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [nex-agi_Nex-N2.5-mini-calibration-v6.txt](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-calibration-v6.txt). The imatrix is available here: [nex-agi_Nex-N2.5-mini-imatrix.gguf](https://huggingface.co/bartowski/nex-agi_Nex-N2.5-mini-GGUF/blob/main/nex-agi_Nex-N2.5-mini-imatrix.gguf).

<details>
<summary>Calibration render details</summary>

```json
{
  "generator": "auto_quant_v2 calibration renderer",
  "recipe": "calibration-v6",
  "model": "Nex-N2.5-mini",
  "encoder": "chat_template",
  "chunk_size": 512,
  "prose_chunks": 214,
  "tool_chunks": 359,
  "total_chunks": 573,
  "tool_chunk_fraction": 0.627,
  "n_conversations": 137,
  "extension_convs_used": 0,
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

Thank you ZeroWw for the inspiration to experiment with embed/output.

Want to support my work? Visit my ko-fi page here: https://ko-fi.com/bartowski
