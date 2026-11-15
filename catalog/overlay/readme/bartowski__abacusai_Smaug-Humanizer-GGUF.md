## Llamacpp imatrix Quantizations of Smaug-Humanizer by abacusai

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b11969">b11969</a> for quantization.

Original model: https://huggingface.co/abacusai/Smaug-Humanizer

**Model details:**
- Parameter count: 12B (source checkpoint)
- Input support: text, image and audio (with mmproj file) - [details](#multimodal)
- Speculative decoding: no
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<bos><start_of_turn>system
{system_prompt}<end_of_turn>
<start_of_turn>user
{prompt}<end_of_turn>
<start_of_turn>model
```

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q4_K_M.gguf) (7.62GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [abacusai_Smaug-Humanizer-bf16.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-bf16.gguf) | bf16 | 23.83GB | false | Full BF16 weights. |
| [abacusai_Smaug-Humanizer-Q8_0.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q8_0.gguf) | Q8_0 | 12.67GB | false | Extremely high quality, generally unneeded but max available quant. |
| [abacusai_Smaug-Humanizer-Q6_K_L.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q6_K_L.gguf) | Q6_K_L | 10.93GB | false | The large size of Q6_K, about halfway to Q8_0 in size. Very high quality, near perfect, *recommended*. |
| [abacusai_Smaug-Humanizer-Q6_K.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q6_K.gguf) | Q6_K | 10.44GB | false | Very high quality, near perfect, *recommended*. |
| [abacusai_Smaug-Humanizer-Q6_K_S.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q6_K_S.gguf) | Q6_K_S | 9.99GB | false | Very high quality, near perfect, a little smaller than Q6_K with almost all of the model at Q6_K precision, *recommended*. |
| [abacusai_Smaug-Humanizer-Q5_K_M.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q5_K_M.gguf) | Q5_K_M | 9.10GB | false | High quality, *recommended*. |
| [abacusai_Smaug-Humanizer-Q5_K_S.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q5_K_S.gguf) | Q5_K_S | 8.57GB | false | High quality, *recommended*. |
| [abacusai_Smaug-Humanizer-Q4_K_L.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q4_K_L.gguf) | Q4_K_L | 8.26GB | false | The large size of Q4_K, between Q4_K_M and Q5_K_S: more of the most sensitive weights kept at higher precision, *recommended*. |
| [abacusai_Smaug-Humanizer-Q4_1.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q4_1.gguf) | Q4_1 | 7.76GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [abacusai_Smaug-Humanizer-Q4_K_M.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q4_K_M.gguf) | Q4_K_M | 7.62GB | false | Good quality, default size for most use cases, *recommended*. |
| [abacusai_Smaug-Humanizer-IQ4_NL.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-IQ4_NL.gguf) | IQ4_NL | 7.62GB | false | Similar to IQ4_XS, but slightly larger. |
| [abacusai_Smaug-Humanizer-Q4_K_S.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q4_K_S.gguf) | Q4_K_S | 7.23GB | false | Slightly lower quality with more space savings, *recommended*. |
| [abacusai_Smaug-Humanizer-Q4_0.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q4_0.gguf) | Q4_0 | 7.13GB | false | Legacy format, kept for compatibility with older tools. |
| [abacusai_Smaug-Humanizer-IQ4_XS.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-IQ4_XS.gguf) | IQ4_XS | 6.82GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [abacusai_Smaug-Humanizer-IQ3_M.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-IQ3_M.gguf) | IQ3_M | 6.48GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [abacusai_Smaug-Humanizer-Q3_K_L.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q3_K_L.gguf) | Q3_K_L | 6.12GB | false | Lower quality but usable, good for low RAM availability. |
| [abacusai_Smaug-Humanizer-Q3_K_M.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q3_K_M.gguf) | Q3_K_M | 5.80GB | false | Low quality. |
| [abacusai_Smaug-Humanizer-IQ3_XS.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-IQ3_XS.gguf) | IQ3_XS | 5.56GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [abacusai_Smaug-Humanizer-Q3_K_S.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q3_K_S.gguf) | Q3_K_S | 5.55GB | false | Low quality, *not* recommended. |
| [abacusai_Smaug-Humanizer-IQ3_XXS.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-IQ3_XXS.gguf) | IQ3_XXS | 5.31GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [abacusai_Smaug-Humanizer-Q2_K.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-Q2_K.gguf) | Q2_K | 4.63GB | false | Very low quality but surprisingly usable. |
| [abacusai_Smaug-Humanizer-IQ2_M.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-IQ2_M.gguf) | IQ2_M | 4.45GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |

Download a specific file:

```
hf download bartowski/abacusai_Smaug-Humanizer-GGUF --include "abacusai_Smaug-Humanizer-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/abacusai_Smaug-Humanizer-GGUF --include "abacusai_Smaug-Humanizer-Q4_K_M.gguf" --local-dir ./
```

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/abacusai_Smaug-Humanizer-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b11969 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image and audio input. Alongside the quants, this repo includes the multimodal projector files [mmproj-abacusai_Smaug-Humanizer-bf16.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/mmproj-abacusai_Smaug-Humanizer-bf16.gguf) and [mmproj-abacusai_Smaug-Humanizer-f16.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/mmproj-abacusai_Smaug-Humanizer-f16.gguf), which pair with any quant above.

llama.cpp downloads the mmproj automatically when using `-hf` as shown above; if you're loading files manually, pass it with `--mmproj`.

## Per-tensor layouts

Some of these files were built with a layout computed for this model instead of llama.cpp's standard one-size-fits-all rules. A Q4_K_M is still mostly Q4_K; the extra precision goes to the weights this particular model is most sensitive to. The S, M or L in a name says how much of the model stays at the base precision: about 90 % for S, 70 % for M and 50 % for L. An `_L` name is simply the large size of its family. Q4_K_L is to Q4_K_M what Q4_K_M is to Q4_K_S; Q6_K_S, Q6_K and Q6_K_L are the small, medium and large sizes of Q6_K, with Q6_K_L about halfway to Q8_0. In earlier releases an `_L` name meant the embedding and output weights were kept at Q8_0; in these files it means the larger size of the base type. There is no size target, so each file's bits per weight is reported rather than promised.

The layout each of these files was built with is published in the [`layouts/`](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/tree/main/layouts) folder: `<file>.tensor-types.txt` is the exact `--tensor-type-file` given to `llama-quantize`, and `<file>.layout.json` records how it was computed, including the generator version, the llama.cpp release and the commit, so any of them can be rebuilt. The code that computed them is public at [`quantization-config`](https://github.com/bartowski1182/quantization-config); its tag `key-3bf8b43e20a68f0b` is the exact snapshot these files record. The method is described in [this write-up](https://huggingface.co/blog/bartowski/per-tensor-layout-maps-for-gguf-quantization).

Checked on this model before any of these files were released: Q4_K_M reached 0.98×, Q3_K_M 0.91× and IQ2_M 0.63× the KL divergence of the standard layout at the same file size.

<details>
<summary>Layout details</summary>

Files built from a computed layout:

| Quant | Size | Body bits/weight | File bits/weight | Body kept at base type |
| ----- | ---- | ---------------- | ---------------- | ---------------------- |
| Q6_K_L | 10.93GB | 7.41 | 7.35 | 50 % |
| Q6_K | 10.44GB | 7.04 | 7.01 | 70 % |
| Q6_K_S | 9.99GB | 6.72 | 6.71 | 90 % |
| Q5_K_M | 9.10GB | 6.06 | 6.11 | 70 % |
| Q5_K_S | 8.57GB | 5.67 | 5.76 | 90 % |
| Q4_K_L | 8.26GB | 5.44 | 5.55 | 50 % |
| Q4_K_M | 7.62GB | 4.97 | 5.12 | 70 % |
| IQ4_NL | 7.62GB | 4.97 | 5.12 | 70 % |
| Q4_K_S | 7.23GB | 4.69 | 4.86 | 90 % |
| IQ4_XS | 6.82GB | 4.39 | 4.58 | 90 % |
| IQ3_M | 6.48GB | 4.23 | 4.35 | 50 % |
| Q3_K_L | 6.12GB | 3.97 | 4.11 | 50 % |
| Q3_K_M | 5.80GB | 3.73 | 3.90 | 70 % |
| IQ3_XS | 5.56GB | 3.56 | 3.73 | 90 % |
| Q3_K_S | 5.55GB | 3.55 | 3.73 | 90 % |
| IQ3_XXS | 5.31GB | 3.38 | 3.57 | 70 % |
| Q2_K | 4.63GB | 2.97 | 3.11 | 70 % |
| IQ2_M | 4.45GB | 2.83 | 2.99 | 70 % |

Checked on this model: the computed layout against the standard one, measured by KL divergence against the unquantized model. The ratio compares each computed file with the standard ladder read at that file's own size, so it can differ from the two KLD columns when the two files differ in size.

| Quant | Computed layout KLD | Standard layout KLD | Ratio at equal size | Size vs standard file |
| ----- | ------------------- | ------------------- | ------------------- | --------------------- |
| Q4_K_M | 0.0279 ± 0.0005 | 0.0274 ± 0.0004 | 0.98× | −0.6 % |
| Q3_K_M | 0.1417 ± 0.0020 | 0.0967 ± 0.0013 | 0.91× | −8.0 % |
| IQ2_M | 0.3482 ± 0.0036 | 0.3467 ± 0.0037 | 0.63× | −10.0 % |

How it works: the base type is a floor for every body tensor and a fixed share of the body bytes stays at it (90 % for S, 70 % for M, 50 % for L); the remaining bytes go where a cross-model sensitivity prior, measured by KL divergence against the unquantized model, says they buy the most quality. The embedding and output tensors are sized by their share of the file: a small table is kept at Q8_0, a large one follows the file's bitrate. A K-quant and the IQ quant with the same base bitrate (Q3_K_S and IQ3_XS, Q3_K_M and IQ3_S, Q3_K_L and IQ3_M) come out at about the same size; the IQ file is the GPU-oriented twin.

</details>

## imatrix

All quants made using imatrix option, with a calibration corpus rendered through this model's own chat template. The corpus pairs plain prose with tool-calling and reasoning conversations ([corpus source data](https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a)), encoded exactly as this model sees them at inference and processed with `--parse-special`, so chat-format special tokens contribute to the importance matrix. The corpus rendered for this model is included in this repo: [abacusai_Smaug-Humanizer-calibration-v6.txt](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-calibration-v6.txt). The imatrix is available here: [abacusai_Smaug-Humanizer-imatrix.gguf](https://huggingface.co/bartowski/abacusai_Smaug-Humanizer-GGUF/blob/main/abacusai_Smaug-Humanizer-imatrix.gguf).

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
  "tool_chunks": 139,
  "total_chunks": 358,
  "n_conversations": 173,
  "conversation_token_lengths": [
    94,
    416,
    252,
    552,
    339,
    148,
    449,
    1319,
    875,
    219,
    112,
    380,
    44,
    98,
    292,
    387,
    1327,
    274,
    458,
    118,
    112,
    189,
    181,
    412,
    307,
    131,
    428,
    378,
    135,
    280,
    741,
    168,
    340,
    258,
    419,
    599,
    292,
    219,
    81,
    120,
    437,
    405,
    742,
    186,
    118,
    327,
    420,
    225,
    309,
    764,
    241,
    608,
    360,
    158,
    256,
    1512,
    1317,
    288,
    1706,
    251,
    296,
    281,
    360,
    160,
    1371,
    214,
    266,
    175,
    477,
    111,
    235,
    503,
    219,
    234,
    477,
    429,
    359,
    468,
    154,
    110,
    802,
    173,
    134,
    153,
    379,
    119,
    2657,
    1323,
    143,
    205,
    228,
    353,
    277,
    237,
    181,
    333,
    48,
    586,
    151,
    425,
    213,
    280,
    232,
    268,
    666,
    204,
    349,
    151,
    256,
    197,
    1377,
    1337,
    366,
    158,
    383,
    427,
    69,
    1309,
    987,
    306,
    61,
    439,
    1156,
    67,
    839,
    227,
    265,
    227,
    337,
    96,
    251,
    1184,
    153,
    718,
    206,
    216,
    603,
    839,
    110,
    759,
    230,
    118,
    175,
    138,
    151,
    50,
    1209,
    363,
    252,
    292,
    187,
    1255,
    501,
    1262,
    1308,
    252,
    57,
    381,
    151,
    206,
    247,
    283,
    173,
    471,
    131,
    250,
    101,
    127,
    735,
    53,
    98,
    412,
    645
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
