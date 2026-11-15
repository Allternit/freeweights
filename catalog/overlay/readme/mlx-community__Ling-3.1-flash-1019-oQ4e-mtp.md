# Ling-3.1-flash-1019-oQ4e-mtp

This model was quantized using [oQ](https://github.com/jundot/omlx) (oMLX v0.7.3rc1) mixed-precision quantization.

A mixed-precision MLX checkpoint of [inclusionAI/Ling-3.1-flash-1019](https://huggingface.co/inclusionAI/Ling-3.1-flash-1019), an upgraded version of [Ling-3.1-flash](https://huggingface.co/inclusionAI/Ling-3.1-flash) with improved reasoning and agentic capabilities. It is a hybrid-linear mixture-of-experts model with 560B total and 25B active parameters, built from 63 KDA linear-attention layers and 9 gated MLA layers, with 512 routed experts of which 8 are active per token. It includes the language model and the MTP (NextN) layer, which oMLX runs as Lightning MTP speculative decoding.

The effective average is 4.615 bits/weight for the complete checkpoint.

## Quantization and Bit Distribution

oQ4e allocates bits by measured layer sensitivity, then rounds each group with an importance matrix (256 samples x 512 tokens, collected layer by layer from the original FP8 weights) and a weighted least-squares refit of its scale and bias.

| Storage format | Logical weights | Share of total | Tensor storage | Effective bits/weight |
|---|---|---|---|---|
| Affine 4-bit, group 64 | 555.661B | 97.123% | 291.094 GiB | 4.50 |
| Affine 8-bit, group 128 | 1.085B | 0.190% | 1.042 GiB | 8.25 |
| Affine 8-bit, group 64 | 15.333B | 2.680% | 15.173 GiB | 8.50 |
| BF16 | 0.041B | 0.007% | 0.076 GiB | 16.00 |
| FP32 | 0.000B | 0.000% | 0.000 GiB | 32.00 |
| **Total** | **572.121B** | **100%** | **307.385 GiB** | **4.615** |

## Storage Breakdown

| Component | Logical weights | Storage |
|---|---|---|
| Language backbone | 563.946B | 325.363 GB / 303.017 GiB |
| MTP head | 8.174B | 4.690 GB / 4.367 GiB |
| **Total** | **572.121B** | **330.052 GB / 307.385 GiB** |

## License

MIT, following the source model.
