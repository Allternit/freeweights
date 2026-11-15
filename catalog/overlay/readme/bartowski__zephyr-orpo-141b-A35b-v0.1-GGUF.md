## Llamacpp Quantizations of zephyr-orpo-141b-A35b-v0.1

Using <a href="https://github.com/ggerganov/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggerganov/llama.cpp/releases/tag/b2636">b2636</a> for quantization.

Original model: https://huggingface.co/HuggingFaceH4/zephyr-orpo-141b-A35b-v0.1

## Prompt format

```
<|im_start|>system
{system_prompt}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
```

## Download a file (not the whole branch) from below:

This is a very large model and has been split into parts to upload. Recent versions of llamacpp allow you to load part 1 and the rest will load as well. Make sure you download all parts of the chosen size.

| Filename | Quant type | File Size | Description |
| -------- | ---------- | --------- | ----------- |
| [zephyr-orpo-141b-A35b-v0.1-Q5_K_M.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q5_K_M-00001-of-00005.gguf) | Q5_K_M | 99.96GB | High quality, *recommended*. |
| [zephyr-orpo-141b-A35b-v0.1-Q5_K_S.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q5_K_S-00001-of-00005.gguf) | Q5_K_S | 96.97GB | High quality, *recommended*. |
| [zephyr-orpo-141b-A35b-v0.1-Q4_K_M.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q4_K_M-00001-of-00005.gguf) | Q4_K_M | 85.58GB | Good quality, uses about 4.83 bits per weight, *recommended*. |
| [zephyr-orpo-141b-A35b-v0.1-Q4_K_S.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q4_K_S-00001-of-00005.gguf) | Q4_K_S | 80.47GB | Slightly lower quality with more space savings, *recommended*. |
| [zephyr-orpo-141b-A35b-v0.1-IQ4_NL.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-IQ4_NL-00001-of-00005.gguf) | IQ4_NL | 80.47GB | Decent quality, slightly smaller than Q4_K_S with similar performance *recommended*. |
| [zephyr-orpo-141b-A35b-v0.1-IQ4_XS.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-IQ4_XS-00001-of-00005.gguf) | IQ4_XS | 76.35GB | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [zephyr-orpo-141b-A35b-v0.1-Q3_K_L.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q3_K_L-00001-of-00005.gguf) | Q3_K_L | 72.57GB | Lower quality but usable, good for low RAM availability. |
| [zephyr-orpo-141b-A35b-v0.1-Q3_K_M.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q3_K_M-00001-of-00005.gguf) | Q3_K_M | 67.78GB | Even lower quality. |
| [zephyr-orpo-141b-A35b-v0.1-IQ3_M.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-IQ3_M-00001-of-00005.gguf) | IQ3_M | 64.49GB | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [zephyr-orpo-141b-A35b-v0.1-IQ3_S.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-IQ3_S-00001-of-00005.gguf) | IQ3_S | 61.49GB | Lower quality, new method with decent performance, recommended over Q3_K_S quant, same size with better performance. |
| [zephyr-orpo-141b-A35b-v0.1-Q3_K_S.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q3_K_S-00001-of-00005.gguf) | Q3_K_S | 61.49GB | Low quality, not recommended. |
| [zephyr-orpo-141b-A35b-v0.1-IQ3_XS.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-IQ3_XS-00001-of-00005.gguf) | IQ3_XS | 58.22GB | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [zephyr-orpo-141b-A35b-v0.1-Q2_K.gguf](https://huggingface.co/bartowski/zephyr-orpo-141b-A35b-v0.1-GGUF/blob/main/zephyr-orpo-141b-A35b-v0.1-Q2_K-00001-of-00005.gguf) | Q2_K | 52.10GB | Very low quality but surprisingly usable. |

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