This model has the safetensors weights for the [Madlad-400](https://github.com/google-research/google-research/tree/master/madlad_400) 8B param **language model**.

The HF transformers code to run inference is not ready yet. The [original implementation](https://github.com/google/flaxformer/blob/ea17eb012a1d340ddff017b7a534c2162aaec34c/flaxformer/architectures/t5/t5_architecture.py#L1484) is in JAX/Flaxformer.

The model architecture is the same as [Palm 8B](https://arxiv.org/pdf/2204.02311.pdf).

It's a decoder-only T5 with 32 layers, 16 query heads, 1 KV head, and 4096 embedding size.

These are the main differences relative to the original T5 architecture:

- SwiGLU Activation
- Parallel Layers
- Multi-Query Attention
- RoPE Embeddings
- Shared Input-Output Embeddings
- No biases
- Bidirectional attention
- Layer Norm with `center_scale_at_zero` and final layer with `use_scale=False`

If you are looking for the language models models, here are the available versions:
- [3B](https://huggingface.co/jbochi/madlad400-3b-mt)
- [7B](https://huggingface.co/jbochi/madlad400-7b-mt)
- [7B-BT](https://huggingface.co/jbochi/madlad400-7b-mt-bt)
- [10B](https://huggingface.co/jbochi/madlad400-10b-mt)


Article: [MADLAD-400: A Multilingual And Document-Level Large Audited Dataset](https://arxiv.org/abs/2309.04662)

Abstract:

> We introduce MADLAD-400, a manually audited, general domain 3T token monolingual dataset based on CommonCrawl, spanning 419 languages. We discuss the limitations revealed by self-auditing MADLAD-400, and the role data auditing had in the dataset creation process. We then train and release a 10.7B-parameter multilingual machine translation model on 250 billion tokens covering over 450 languages using publicly available data, and find that it is competitive with models that are significantly larger, and report the results on different domains. In addition, we train a 8B-parameter language model, and assess the results on few-shot translation. We make the baseline models available to the research community.



