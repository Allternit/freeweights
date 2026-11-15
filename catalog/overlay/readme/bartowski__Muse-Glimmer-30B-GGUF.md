## Llamacpp imatrix Quantizations of Muse-Glimmer-30B by meta-models

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> commit <a href="https://github.com/ggml-org/llama.cpp/commit/62bf73d25c53">62bf73d25c53</a> for quantization.

Original model: https://huggingface.co/meta-models/Muse-Glimmer-30B

**Model details:**
- Parameter count: 30B
- Input support: text, image (with mmproj file) - [details](#multimodal)
- MTP: yes - [details](#mtp-dflash)
- imatrix: yes - [details](#imatrix)

[How to run](#how-to-run)

## Prompt format

```
<|begin_of_text|><|start|>system<|message|>{system_prompt}

Reasoning strength: high.

# Valid recipients: "self", "user".<|eot|><|start|>user<|message|>{prompt}<|eot|><|start|>assistant
```

**Don't know which to choose?** Grab [Q4_K_M](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q4_K_M.gguf) (17.31GB) - usually a good mix of size and performance. Download instructions available [here](#downloading-using-the-hugging-face-cli)

## Available files:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [Muse-Glimmer-30B-bf16.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/tree/main/Muse-Glimmer-30B-bf16) | bf16 | 55.73GB | true | Full BF16 weights. |
| [Muse-Glimmer-30B-Q8_0.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q8_0.gguf) | Q8_0 | 29.61GB | false | Extremely high quality, generally unneeded but max available quant. |
| [Muse-Glimmer-30B-Q6_K_L.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q6_K_L.gguf) | Q6_K_L | 24.07GB | false | Uses Q8_0 for embed and output weights. Very high quality, near perfect, *recommended*. |
| [Muse-Glimmer-30B-Q6_K.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q6_K.gguf) | Q6_K | 23.41GB | false | Very high quality, near perfect, *recommended*. |
| [Muse-Glimmer-30B-Q5_K_L.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q5_K_L.gguf) | Q5_K_L | 20.94GB | false | Uses Q8_0 for embed and output weights. High quality, *recommended*. |
| [Muse-Glimmer-30B-Q5_K_M.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q5_K_M.gguf) | Q5_K_M | 20.11GB | false | High quality, *recommended*. |
| [Muse-Glimmer-30B-Q5_K_S.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q5_K_S.gguf) | Q5_K_S | 19.44GB | false | High quality, *recommended*. |
| [Muse-Glimmer-30B-Q4_K_L.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q4_K_L.gguf) | Q4_K_L | 18.30GB | false | Uses Q8_0 for embed and output weights. Good quality, *recommended*. |
| [Muse-Glimmer-30B-Q4_1.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q4_1.gguf) | Q4_1 | 17.83GB | false | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [Muse-Glimmer-30B-Q4_K_M.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q4_K_M.gguf) | Q4_K_M | 17.31GB | false | Good quality, default size for most use cases, *recommended*. |
| [Muse-Glimmer-30B-Q4_K_S.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q4_K_S.gguf) | Q4_K_S | 16.32GB | false | Slightly lower quality with more space savings, *recommended*. |
| [Muse-Glimmer-30B-Q4_0.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q4_0.gguf) | Q4_0 | 16.27GB | false | Legacy format, kept for compatibility with older tools. |
| [Muse-Glimmer-30B-IQ4_NL.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ4_NL.gguf) | IQ4_NL | 16.24GB | false | Similar to IQ4_XS, but slightly larger. |
| [Muse-Glimmer-30B-Q3_K_XL.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q3_K_XL.gguf) | Q3_K_XL | 15.96GB | false | Uses Q8_0 for embed and output weights. Lower quality but usable, good for low RAM availability. |
| [Muse-Glimmer-30B-IQ4_XS.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ4_XS.gguf) | IQ4_XS | 15.44GB | false | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Muse-Glimmer-30B-Q3_K_L.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q3_K_L.gguf) | Q3_K_L | 14.78GB | false | Lower quality but usable, good for low RAM availability. |
| [Muse-Glimmer-30B-Q3_K_M.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q3_K_M.gguf) | Q3_K_M | 13.96GB | false | Low quality. |
| [Muse-Glimmer-30B-IQ3_M.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ3_M.gguf) | IQ3_M | 13.11GB | false | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Muse-Glimmer-30B-Q3_K_S.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q3_K_S.gguf) | Q3_K_S | 12.79GB | false | Low quality, not recommended. |
| [Muse-Glimmer-30B-Q2_K_L.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q2_K_L.gguf) | Q2_K_L | 12.35GB | false | Uses Q8_0 for embed and output weights. Very low quality but surprisingly usable. |
| [Muse-Glimmer-30B-IQ3_XS.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ3_XS.gguf) | IQ3_XS | 12.32GB | false | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Muse-Glimmer-30B-IQ3_XXS.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ3_XXS.gguf) | IQ3_XXS | 11.55GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Muse-Glimmer-30B-Q2_K.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-Q2_K.gguf) | Q2_K | 11.04GB | false | Very low quality but surprisingly usable. |
| [Muse-Glimmer-30B-IQ2_M.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ2_M.gguf) | IQ2_M | 10.66GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [Muse-Glimmer-30B-IQ2_S.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ2_S.gguf) | IQ2_S | 10.04GB | false | Low quality, uses SOTA techniques to be usable. |
| [Muse-Glimmer-30B-IQ2_XS.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ2_XS.gguf) | IQ2_XS | 9.58GB | false | Low quality, uses SOTA techniques to be usable. |
| [Muse-Glimmer-30B-IQ2_XXS.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-IQ2_XXS.gguf) | IQ2_XXS | 8.92GB | false | Very low quality, uses SOTA techniques to be usable. |

Download a specific file:

```
hf download bartowski/Muse-Glimmer-30B-GGUF --include "Muse-Glimmer-30B-Q4_K_M.gguf" --local-dir ./
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
hf download bartowski/Muse-Glimmer-30B-GGUF --include "Muse-Glimmer-30B-Q4_K_M.gguf" --local-dir ./
```

The files marked `true` in the Split column above are stored as multiple parts in a folder. To download all the parts to a local folder, run:

```
hf download bartowski/Muse-Glimmer-30B-GGUF --include "Muse-Glimmer-30B-bf16/*" --local-dir ./
```

You can either specify a new local-dir (Muse-Glimmer-30B-bf16) or download them all in place (./)

</details>

## How to run

These quants run with [llama.cpp](https://github.com/ggml-org/llama.cpp) - installable in one line via [llama.app](https://llama.app/):

```
curl -LsSf https://llama.app/install.sh | sh
llama-server -hf bartowski/Muse-Glimmer-30B-GGUF:Q4_K_M
```

llama-server includes a built-in chat web UI, served at http://localhost:8080 by default.

These quants were made from llama.cpp commit 62bf73d25c53 - this model's architecture may be newly supported, so you'll need a build from that commit or a later release to run them.

They also work in: [LM Studio](https://lmstudio.ai/) · [koboldcpp](https://github.com/LostRuins/koboldcpp) · [ramalama](https://github.com/containers/ramalama) · [Jan AI](https://www.jan.ai/) · [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) · [LoLLMs](https://github.com/ParisNeo/lollms) · [Atomic Chat](https://atomic.chat/)

## Multimodal

This model supports image input. Alongside the quants, this repo includes the multimodal projector files [mmproj-Muse-Glimmer-30B-f16.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/mmproj-Muse-Glimmer-30B-f16.gguf) and [mmproj-Muse-Glimmer-30B-bf16.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/mmproj-Muse-Glimmer-30B-bf16.gguf), which pair with any quant above.

llama.cpp downloads the mmproj automatically when using `-hf` as shown above; if you're loading files manually, pass it with `--mmproj`.

## MTP (DFlash)

This model has a DFlash draft model. These are not included in the quants themselves - they are provided as separate files in this repo: [dflash-Muse-Glimmer-30B-Q4_0.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/dflash-Muse-Glimmer-30B-Q4_0.gguf) and [dflash-Muse-Glimmer-30B-Q8_0.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/dflash-Muse-Glimmer-30B-Q8_0.gguf)

DFlash acts as a draft model, letting llama.cpp run speculative decoding for faster generation. To use it, add the following flag to your llama.cpp command:

```
--spec-type draft-dflash
```

When running with `-hf` as shown above, llama.cpp should download the DFlash file automatically alongside the model. If you're downloading files manually instead, also grab the dspark file and pass it with `-md /path/to/dflash-Muse-Glimmer-30B-Q4_0.gguf`.

## imatrix

All quants made using imatrix option with dataset from [here](https://gist.github.com/bartowski1182/82ae9b520227f57d79ba04add13d0d0d). The imatrix is available here: [Muse-Glimmer-30B-imatrix.gguf](https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF/blob/main/Muse-Glimmer-30B-imatrix.gguf).

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
