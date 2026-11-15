## Llamacpp imatrix Quantizations of Laguna-S-2.1 by poolside

Using <a href="https://github.com/ggml-org/llama.cpp/">llama.cpp</a> release <a href="https://github.com/ggml-org/llama.cpp/releases/tag/b10087">b10087</a> for quantization.

Original model: https://huggingface.co/poolside/Laguna-S-2.1

All quants made using imatrix option with dataset from [here](https://gist.github.com/bartowski1182/82ae9b520227f57d79ba04add13d0d0d)

Run them in your choice of tools:

- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [ramalama](https://github.com/containers/ramalama)
- [LM Studio](https://lmstudio.ai/)
- [koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Jan AI](https://www.jan.ai/)
- [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui)
- [LoLLMs](https://github.com/ParisNeo/lollms)
- [Atomic Chat](https://atomic.chat/)

Note: if it's a newly supported model, you may need to wait for an update from the developers.

## Prompt format

```
〈|EOS|〉<system>{system_prompt}</system>
<user>{prompt}</user>
<assistant><think>
```

## Download a file (not the whole branch) from below:

| Filename | Quant type | File Size | Split | Description |
| -------- | ---------- | --------- | ----- | ----------- |
| [Laguna-S-2.1-bf16.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-bf16) | bf16 | 235.20GB | true | Full BF16 weights. |
| [Laguna-S-2.1-Q8_0.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q8_0) | Q8_0 | 125.02GB | true | Extremely high quality, generally unneeded but max available quant. |
| [Laguna-S-2.1-Q6_K_L.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q6_K_L) | Q6_K_L | 101.83GB | true | Uses Q8_0 for embed and output weights. Very high quality, near perfect, *recommended*. |
| [Laguna-S-2.1-Q6_K.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q6_K) | Q6_K | 101.68GB | true | Very high quality, near perfect, *recommended*. |
| [Laguna-S-2.1-Q5_K_L.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q5_K_L) | Q5_K_L | 84.18GB | true | Uses Q8_0 for embed and output weights. High quality, *recommended*. |
| [Laguna-S-2.1-Q5_K_M.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q5_K_M) | Q5_K_M | 83.98GB | true | High quality, *recommended*. |
| [Laguna-S-2.1-Q5_K_S.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q5_K_S) | Q5_K_S | 81.30GB | true | High quality, *recommended*. |
| [Laguna-S-2.1-Q4_1.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q4_1) | Q4_1 | 74.04GB | true | Legacy format, similar performance to Q4_K_S but with improved tokens/watt on Apple silicon. |
| [Laguna-S-2.1-Q4_K_M.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q4_K_M) | Q4_K_M | 71.76GB | true | Good quality, default size for most use cases, *recommended*. |
| [Laguna-S-2.1-Q4_K_S.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q4_K_S) | Q4_K_S | 69.11GB | true | Slightly lower quality with more space savings, *recommended*. |
| [Laguna-S-2.1-Q4_0.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q4_0) | Q4_0 | 67.04GB | true | Legacy format, offers online repacking for ARM and AVX CPU inference. |
| [Laguna-S-2.1-IQ4_NL.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-IQ4_NL) | IQ4_NL | 66.92GB | true | Similar to IQ4_XS, but slightly larger. Offers online repacking for ARM CPU inference. |
| [Laguna-S-2.1-IQ4_XS.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-IQ4_XS) | IQ4_XS | 63.33GB | true | Decent quality, smaller than Q4_K_S with similar performance, *recommended*. |
| [Laguna-S-2.1-IQ3_M.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-IQ3_M) | IQ3_M | 56.48GB | true | Medium-low quality, new method with decent performance comparable to Q3_K_M. |
| [Laguna-S-2.1-Q3_K_XL.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q3_K_XL) | Q3_K_XL | 56.46GB | true | Uses Q8_0 for embed and output weights. Lower quality but usable, good for low RAM availability. |
| [Laguna-S-2.1-Q3_K_L.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q3_K_L) | Q3_K_L | 56.19GB | true | Lower quality but usable, good for low RAM availability. |
| [Laguna-S-2.1-Q3_K_M.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-Q3_K_M) | Q3_K_M | 54.04GB | true | Low quality. |
| [Laguna-S-2.1-IQ3_XS.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/tree/main/Laguna-S-2.1-IQ3_XS) | IQ3_XS | 54.00GB | true | Lower quality, new method with decent performance, slightly better than Q3_K_S. |
| [Laguna-S-2.1-Q3_K_S.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-Q3_K_S.gguf) | Q3_K_S | 51.57GB | false | Low quality, not recommended. |
| [Laguna-S-2.1-IQ3_XXS.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-IQ3_XXS.gguf) | IQ3_XXS | 49.47GB | false | Lower quality, new method with decent performance, comparable to Q3 quants. |
| [Laguna-S-2.1-Q2_K_L.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-Q2_K_L.gguf) | Q2_K_L | 42.09GB | false | Uses Q8_0 for embed and output weights. Very low quality but surprisingly usable. |
| [Laguna-S-2.1-Q2_K.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-Q2_K.gguf) | Q2_K | 41.79GB | false | Very low quality but surprisingly usable. |
| [Laguna-S-2.1-IQ2_M.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-IQ2_M.gguf) | IQ2_M | 39.93GB | false | Relatively low quality, uses SOTA techniques to be surprisingly usable. |
| [Laguna-S-2.1-IQ2_S.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-IQ2_S.gguf) | IQ2_S | 36.26GB | false | Low quality, uses SOTA techniques to be usable. |
| [Laguna-S-2.1-IQ2_XS.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-IQ2_XS.gguf) | IQ2_XS | 35.57GB | false | Low quality, uses SOTA techniques to be usable. |
| [Laguna-S-2.1-IQ2_XXS.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-IQ2_XXS.gguf) | IQ2_XXS | 32.02GB | false | Very low quality, uses SOTA techniques to be usable. |
| [Laguna-S-2.1-IQ1_M.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-IQ1_M.gguf) | IQ1_M | 27.64GB | false | Extremely low quality, *not* recommended. |
| [Laguna-S-2.1-IQ1_S.gguf](https://huggingface.co/bartowski/Laguna-S-2.1-GGUF/blob/main/Laguna-S-2.1-IQ1_S.gguf) | IQ1_S | 24.86GB | false | Extremely low quality, *not* recommended. |

## Embed/output weights

Some of these quants (Q3_K_XL, Q4_K_L etc) are the standard quantization method with the embeddings and output weights quantized to Q8_0 instead of what they would normally default to.

## Downloading using huggingface-cli

<details>
  <summary>Click to view download instructions</summary>

First, make sure you have huggingface-cli installed:

```
pip install -U "huggingface_hub[cli]"
```

Then, you can target the specific file you want:

```
huggingface-cli download bartowski/Laguna-S-2.1-GGUF --include "Laguna-S-2.1-Q4_K_M.gguf" --local-dir ./
```

If the model is bigger than 50GB, it will have been split into multiple files. In order to download them all to a local folder, run:

```
huggingface-cli download bartowski/Laguna-S-2.1-GGUF --include "Laguna-S-2.1-Q8_0/*" --local-dir ./
```

You can either specify a new local-dir (Laguna-S-2.1-Q8_0) or download them all in place (./)

</details>

## ARM/AVX information

Previously, you would download Q4_0_4_4/4_8/8_8, and these would have their weights interleaved in memory in order to improve performance on ARM and AVX machines by loading up more data in one pass.

Now, however, there is something called "online repacking" for weights. details in [this PR](https://github.com/ggml-org/llama.cpp/pull/9921). If you use Q4_0 and your hardware would benefit from repacking weights, it will do it automatically on the fly.

As of llama.cpp build [b4282](https://github.com/ggml-org/llama.cpp/releases/tag/b4282) you will not be able to run the Q4_0_X_X files and will instead need to use Q4_0.

Additionally, if you want to get slightly better quality, you can use IQ4_NL thanks to [this PR](https://github.com/ggml-org/llama.cpp/pull/10541) which will also repack the weights for ARM, though only the 4_4 for now. The loading time may be slower but it will result in an overall speed increase.

<details>
  <summary>Click to view Q4_0_X_X information (deprecated)</summary>

I'm keeping this section to show the potential theoretical uplift in performance from using the Q4_0 with online repacking.

<details>
  <summary>Click to view benchmarks on an AVX2 system (EPYC7702)</summary>

| model                          |       size |     params | backend    | threads |          test |                  t/s |  % (vs Q4_0)  |
| ------------------------------ | ---------: | ---------: | ---------- | ------: | ------------: | -------------------: |-------------: |
| qwen2 3B Q4_0                  |   1.70 GiB |     3.09 B | CPU        |      64 |         pp512 |        204.03 ± 1.03 |          100% |
| qwen2 3B Q4_0                  |   1.70 GiB |     3.09 B | CPU        |      64 |        pp1024 |        282.92 ± 0.19 |          100% |
| qwen2 3B Q4_0                  |   1.70 GiB |     3.09 B | CPU        |      64 |        pp2048 |        259.49 ± 0.44 |          100% |
| qwen2 3B Q4_0                  |   1.70 GiB |     3.09 B | CPU        |      64 |         tg128 |         39.12 ± 0.27 |          100% |
| qwen2 3B Q4_0                  |   1.70 GiB |     3.09 B | CPU        |      64 |         tg256 |         39.31 ± 0.69 |          100% |
| qwen2 3B Q4_0                  |   1.70 GiB |     3.09 B | CPU        |      64 |         tg512 |         40.52 ± 0.03 |          100% |
| qwen2 3B Q4_K_M                |   1.79 GiB |     3.09 B | CPU        |      64 |         pp512 |        301.02 ± 1.74 |          147% |
| qwen2 3B Q4_K_M                |   1.79 GiB |     3.09 B | CPU        |      64 |        pp1024 |        287.23 ± 0.20 |          101% |
| qwen2 3B Q4_K_M                |   1.79 GiB |     3.09 B | CPU        |      64 |        pp2048 |        262.77 ± 1.81 |          101% |
| qwen2 3B Q4_K_M                |   1.79 GiB |     3.09 B | CPU        |      64 |         tg128 |         18.80 ± 0.99 |           48% |
| qwen2 3B Q4_K_M                |   1.79 GiB |     3.09 B | CPU        |      64 |         tg256 |         24.46 ± 3.04 |           83% |
| qwen2 3B Q4_K_M                |   1.79 GiB |     3.09 B | CPU        |      64 |         tg512 |         36.32 ± 3.59 |           90% |
| qwen2 3B Q4_0_8_8              |   1.69 GiB |     3.09 B | CPU        |      64 |         pp512 |        271.71 ± 3.53 |          133% |
| qwen2 3B Q4_0_8_8              |   1.69 GiB |     3.09 B | CPU        |      64 |        pp1024 |       279.86 ± 45.63 |          100% |
| qwen2 3B Q4_0_8_8              |   1.69 GiB |     3.09 B | CPU        |      64 |        pp2048 |        320.77 ± 5.00 |          124% |
| qwen2 3B Q4_0_8_8              |   1.69 GiB |     3.09 B | CPU        |      64 |         tg128 |         43.51 ± 0.05 |          111% |
| qwen2 3B Q4_0_8_8              |   1.69 GiB |     3.09 B | CPU        |      64 |         tg256 |         43.35 ± 0.09 |          110% |
| qwen2 3B Q4_0_8_8              |   1.69 GiB |     3.09 B | CPU        |      64 |         tg512 |         42.60 ± 0.31 |          105% |

Q4_0_8_8 offers a nice bump to prompt processing and a small bump to text generation

</details>

</details>

## Which file should I choose?

<details>
  <summary>Click here for details</summary>

A great write up with charts showing various performances is provided by Artefact2 [here](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)

The first thing to figure out is how big a model you can run. To do this, you'll need to figure out how much RAM and/or VRAM you have.

If you want your model running as FAST as possible, you'll want to fit the whole thing on your GPU's VRAM. Aim for a quant with a file size 1-2GB smaller than your GPU's total VRAM.

If you want the absolute maximum quality, add both your system RAM and your GPU's VRAM together, then similarly grab a quant with a file size 1-2GB Smaller than that total.

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
