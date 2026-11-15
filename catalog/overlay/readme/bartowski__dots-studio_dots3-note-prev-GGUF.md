## Llamacpp imatrix Quantizations of dots3-note-prev by dots-studio

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b10569">b10569</a> for quantization.

Original model: https://huggingface.co/dots-studio/dots3-note-prev

**Model details:**
- Parameter count: 288B
- Input support: text, image, audio (with mmproj file) - [details](#multimodal)
- Speculative decoding: yes (MTP) - [details](#mtp)
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<|system|>{system_prompt}<|endofsystem|><|user|>{prompt}<|endofuser|><|assistant|>
```

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q4_K_M) (171.11GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [dots-studio_dots3-note-prev-Q8_0.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q8_0) | Q8_0 | 298.41GB | true | Extremely high quality, generally unneeded but max available quant. |
| [dots-studio_dots3-note-prev-Q6_K.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q6_K) | Q6_K | 242.31GB | true | Very high quality, near perfect, *recommended*. |
| [dots-studio_dots3-note-prev-Q5_K_M.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q5_K_M) | Q5_K_M | 200.41GB | true | High quality, *recommended*. |
| [dots-studio_dots3-note-prev-Q5_K_S.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q5_K_S) | Q5_K_S | 193.77GB | true | High quality, *recommended*. |
| [dots-studio_dots3-note-prev-Q4_1.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q4_1) | Q4_1 | 176.11GB | true | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [dots-studio_dots3-note-prev-Q4_K_L.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q4_K_L) | Q4_K_L | 171.68GB | true | Uses Q8_0 for embed and output weights. Good quality, *recommended*. |
| [dots-studio_dots3-note-prev-Q4_K_M.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q4_K_M) | Q4_K_M | 171.11GB | true | Good quality, default size for most use cases, *recommended*. |
| [dots-studio_dots3-note-prev-Q4_K_S.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q4_K_S) | Q4_K_S | 164.46GB | true | Slightly lower quality with more space savings, *recommended*. |
| [dots-studio_dots3-note-prev-Q4_0.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q4_0) | Q4_0 | 159.37GB | true | Legacy format, kept for compatibility with older tools. |
| [dots-studio_dots3-note-prev-IQ4_NL.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ4_NL) | IQ4_NL | 158.98GB | true | Similar to IQ4_XS, but slightly larger. |
| [dots-studio_dots3-note-prev-IQ4_XS.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ4_XS) | IQ4_XS | 150.39GB | true | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [dots-studio_dots3-note-prev-Q3_K_XL.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q3_K_XL) | Q3_K_XL | 134.47GB | true | Uses Q8_0 for embed and output weights. Lower quality but usable, good for low RAM availability. |
| [dots-studio_dots3-note-prev-IQ3_M.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ3_M) | IQ3_M | 134.13GB | true | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [dots-studio_dots3-note-prev-Q3_K_L.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q3_K_L) | Q3_K_L | 133.79GB | true | Lower quality but usable, good for low RAM availability. |
| [dots-studio_dots3-note-prev-Q3_K_M.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q3_K_M) | Q3_K_M | 128.59GB | true | Low quality. |
| [dots-studio_dots3-note-prev-IQ3_XS.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ3_XS) | IQ3_XS | 128.27GB | true | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [dots-studio_dots3-note-prev-Q3_K_S.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q3_K_S) | Q3_K_S | 122.68GB | true | Low quality, not recommended. |
| [dots-studio_dots3-note-prev-IQ3_XXS.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ3_XXS) | IQ3_XXS | 117.49GB | true | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [dots-studio_dots3-note-prev-Q2_K_L.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q2_K_L) | Q2_K_L | 100.18GB | true | Uses Q8_0 for embed and output weights. Very low quality but surprisingly usable. |
| [dots-studio_dots3-note-prev-Q2_K.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-Q2_K) | Q2_K | 99.42GB | true | Very low quality but surprisingly usable. |
| [dots-studio_dots3-note-prev-IQ2_M.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ2_M) | IQ2_M | 94.82GB | true | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [dots-studio_dots3-note-prev-IQ2_S.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ2_S) | IQ2_S | 86.00GB | true | Low quality, uses SOTA techniques to be usable. |
| [dots-studio_dots3-note-prev-IQ2_XS.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ2_XS) | IQ2_XS | 84.26GB | true | Low quality, uses SOTA techniques to be usable. |
| [dots-studio_dots3-note-prev-IQ2_XXS.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ2_XXS) | IQ2_XXS | 75.75GB | true | Very low quality, uses SOTA techniques to be usable. |
| [dots-studio_dots3-note-prev-IQ1_M.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ1_M) | IQ1_M | 65.27GB | true | Extremely low quality, *not* recommended. |
| [dots-studio_dots3-note-prev-IQ1_S.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/tree/main/dots-studio_dots3-note-prev-IQ1_S) | IQ1_S | 58.58GB | true | Extremely low quality, *not* recommended. |

Download a specific file:

```
hf download bartowski/dots-studio_dots3-note-prev-GGUF --include "dots-studio_dots3-note-prev-Q4_K_M/*" --local-dir ./
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
hf download bartowski/dots-studio_dots3-note-prev-GGUF --include "dots-studio_dots3-note-prev-Q4_K_M/*" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/dots-studio_dots3-note-prev-GGUF --include "dots-studio_dots3-note-prev-Q8_0/*" --local-dir ./
```

You can either specify a new local-dir (dots-studio_dots3-note-prev-Q8_0) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/dots-studio_dots3-note-prev-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made with llama.cpp release b10569 - if this model's architecture is newly supported, you'll need that release or newer to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image and audio input. Alongside the quants, this repo includes the multimodal projector files [mmproj-dots-studio_dots3-note-prev-f16.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/blob/main/mmproj-dots-studio_dots3-note-prev-f16.gguf) and [mmproj-dots-studio_dots3-note-prev-bf16.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/blob/main/mmproj-dots-studio_dots3-note-prev-bf16.gguf), which pair with any quant above.

llama.cpp downloads the mmproj automatically when using `-hf` as shown above; if you're loading files manually, pass it with `--mmproj`.

## MTP

This model has MTP (Multi-Token Prediction) layers, and they are included in these quants

MTP layers act as a built-in draft model, letting llama.cpp run speculative decoding for faster generation. To use them, add the following flag to your llama.cpp command:

```
--spec-type draft-mtp
```

Note: the MTP layers are stored at Q4_0 in the imatrix quants (except for the Q8_0 quant), since imatrix calibration does not exercise them. Q4_0 is chosen for its speed which massively benefits MTP performance.

## imatrix

All quants made using imatrix option with dataset from [here](https://gist.github.com/bartowski1182/82ae9b520227f57d79ba04add13d0d0d). The imatrix is available here: [dots-studio_dots3-note-prev-imatrix.gguf](https://huggingface.co/bartowski/dots-studio_dots3-note-prev-GGUF/blob/main/dots-studio_dots3-note-prev-imatrix.gguf).

## Embed/output weights

Some of these quants (Q3_K_XL, Q4_K_L etc) are the standard quantization method with the embeddings and output weights quantized to Q8_0 instead of what they would normally default to.

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