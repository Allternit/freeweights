## Llamacpp imatrix Quantizations of Phi-3-mini-4k-instruct

Using <a href="https://github.com/ggerganov/llama.cpp/">llama.cpp</a> commit <a href="https://github.com/ggerganov/llama.cpp/commit/ffe666572f98a686b17a2cd1dbf4c0a982e5ac0a">ffe6665</a> for quantization.

Original model: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct

All quants made using imatrix option with dataset provided by Kalomaze [here](https://github.com/ggerganov/llama.cpp/discussions/5263#discussioncomment-8395384)

## Prompt format

```
<s><|user|> 
{system_prompt}<|end|> 
<|assistant|> 
<|user|> 
{prompt}<|end|> 
<|assistant|> 

```

## Download a file (not the whole branch) from below:

| Filename | Quant type | File Size | Description |
| -------- | ---------- | --------- | ----------- |
| [Phi-3-mini-4k-instruct-Q8_0.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q8_0.gguf) | Q8_0 | 4.06GB | Extremely high quality, generally unneeded but max available quant. |
| [Phi-3-mini-4k-instruct-Q6_K.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q6_K.gguf) | Q6_K | 3.13GB | Very high quality, near perfect, *recommended*. |
| [Phi-3-mini-4k-instruct-Q5_K_M.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q5_K_M.gguf) | Q5_K_M | 2.81GB | High quality, *recommended*. |
| [Phi-3-mini-4k-instruct-Q5_K_S.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q5_K_S.gguf) | Q5_K_S | 2.64GB | High quality, *recommended*. |
| [Phi-3-mini-4k-instruct-Q4_K_M.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf) | Q4_K_M | 2.39GB | Good quality, uses about 4.83 bits per weight, *recommended*. |
| [Phi-3-mini-4k-instruct-Q4_K_S.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q4_K_S.gguf) | Q4_K_S | 2.18GB | Slightly lower quality with more space savings, *recommended*. |
| [Phi-3-mini-4k-instruct-IQ4_NL.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ4_NL.gguf) | IQ4_NL | 2.17GB | Decent quality, slightly smaller than Q4_K_S with similar performance *recommended*. |
| [Phi-3-mini-4k-instruct-IQ4_XS.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ4_XS.gguf) | IQ4_XS | 2.05GB | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Phi-3-mini-4k-instruct-Q3_K_L.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q3_K_L.gguf) | Q3_K_L | 2.08GB | Lower quality but usable, good for low RAM availability. |
| [Phi-3-mini-4k-instruct-Q3_K_M.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q3_K_M.gguf) | Q3_K_M | 1.95GB | Even lower quality. |
| [Phi-3-mini-4k-instruct-IQ3_M.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ3_M.gguf) | IQ3_M | 1.85GB | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Phi-3-mini-4k-instruct-IQ3_S.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ3_S.gguf) | IQ3_S | 1.68GB | Lower quality, new method with decent performance, recommended over Q3_K_S quant, same size with better performance. |
| [Phi-3-mini-4k-instruct-Q3_K_S.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q3_K_S.gguf) | Q3_K_S | 1.68GB | Low quality, not recommended. |
| [Phi-3-mini-4k-instruct-IQ3_XS.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ3_XS.gguf) | IQ3_XS | 1.62GB | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Phi-3-mini-4k-instruct-IQ3_XXS.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ3_XXS.gguf) | IQ3_XXS | 1.51GB | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Phi-3-mini-4k-instruct-Q2_K.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-Q2_K.gguf) | Q2_K | 1.41GB | Very low quality but surprisingly usable. |
| [Phi-3-mini-4k-instruct-IQ2_M.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ2_M.gguf) | IQ2_M | 1.31GB | Very low quality, uses SOTA techniques to also be surprisingly usable. |
| [Phi-3-mini-4k-instruct-IQ2_S.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ2_S.gguf) | IQ2_S | 1.21GB | Very low quality, uses SOTA techniques to be usable. |
| [Phi-3-mini-4k-instruct-IQ2_XS.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ2_XS.gguf) | IQ2_XS | 1.15GB | Very low quality, uses SOTA techniques to be usable. |
| [Phi-3-mini-4k-instruct-IQ2_XXS.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ2_XXS.gguf) | IQ2_XXS | 1.04GB | Lower quality, uses SOTA techniques to be usable. |
| [Phi-3-mini-4k-instruct-IQ1_M.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ1_M.gguf) | IQ1_M | .91GB | Extremely low quality, *not* recommended. |
| [Phi-3-mini-4k-instruct-IQ1_S.gguf](https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/blob/main/Phi-3-mini-4k-instruct-IQ1_S.gguf) | IQ1_S | .84GB | Extremely low quality, *not* recommended. |

## Which file should I choose?

A great write up with charts showing various performances is provided by Artefact2 [here](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)

The first thing to figure out is how big a model you can run. To do this, you'll need to figure out how much RAM and/or VRAM you have.

If you want your model running as FAST as possible, you'll want to fit the whole thing on your GPU's VRAM. Aim for a quant with a file size 1-2GB smaller than your GPU's total VRAM.

If you want the absolute maximum quality, add both your system RAM and your GPU's VRAM together, then similarly grab a quant with a file size 1-2GB Smaller than that total.

Next, you'll need to decide if you want to use an 'I-quant' or a 'K-quant'.

If you don't want to think too much, grab one of the K-quants. These are in format 'QX_K_X', like Q5_K_M.

If you want to get more into the weeds, you can check out this extremely useful feature chart:

[llama.cpp feature matrix](https://github.com/ggerganov/llama.cpp/wiki/Feature-matrix)

But basically, if you're aiming for below Q4, and you're running cuBLAS (Nvidia) or rocBLAS (AMD), you should look towards the I-quants. These are in format IQX_X, like IQ3_M. These are newer and offer better performance for their size.

These I-quants can also be used on CPU and Apple Metal, but will be slower than their K-quant equivalent, so speed vs performance is a tradeoff you'll have to decide.

The I-quants are *not* compatible with Vulcan, which is also AMD, so if you have an AMD card double check if you're using the rocBLAS build or the Vulcan build. At the time of writing this, LM Studio has a preview with ROCm support, and other inference engines have specific builds for ROCm.

Want to support my work? Visit my ko-fi page here: https://ko-fi.com/bartowski
