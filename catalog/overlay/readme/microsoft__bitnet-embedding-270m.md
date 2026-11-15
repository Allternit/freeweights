# BitNet Embeddings

## Model Description

BitNet-Embeddings is a family of multilingual text embedding models developed by Microsoft BitNet team.
The models use decoder-only architecture with last-token pooling and L2 normalization to produce dense text embeddings.
They can be applied to a wide range of tasks, including text retrieval, clustering, semantic similarity, classification, bitext mining, and reranking.
They achieve competitive performance on public benchmarks while maintaining excellent inference and storage efficiency.

- **Developed by:** BitNet Team, Microsoft Research
- **Model type:** BitNet b1.58 based Text Embeddings
- **Language(s):** Multilingual (see [Supported Languages](#supported-languages))
- **License:** MIT License

## Model Sources

- **Repository:** [https://github.com/microsoft/BitNet](https://github.com/microsoft/BitNet)
- **Paper:** [BitNet Text Embeddings](https://arxiv.org/abs/2606.25674)
- **Paper:** [Multilingual E5 Text Embeddings: A Technical Report](https://arxiv.org/abs/2402.05672)

| Model | Weights | Parameters | Embedding Dimension | Max Tokens | MTEB v2 Mean |
|---|---|---|---|---|---|
| [bitnet-embeddings-270m](https://huggingface.co/microsoft/bitnet-embedding-270m) | 1.58-bit | 270M | 640 | 32,768 | 66.26 |
| [harrier-oss-v1-270m](https://huggingface.co/microsoft/harrier-oss-v1-270m) | bf16 | 270M | 640 | 32,768 | 66.5 |
| [bitnet-embeddings-0.6b](https://huggingface.co/microsoft/bitnet-embedding-0.6b) | 1.58-bit | 0.6B | 1,024 | 32,768 | 67.49 |
| [harrier-oss-v1-0.6b](https://huggingface.co/microsoft/harrier-oss-v1-0.6b) | bf16 | 0.6B | 1,024 | 32,768 | 69.0 |

## Model Details

- **Architecture**: Transformer-based, modified with BitLinear layers (BitNet framework).
  - Uses Rotary Position Embeddings (RoPE).
  - Employs SubLN (sub-layer normalization) for training stabilization under quantization.
  - No bias terms in linear or normalization layers.
- **Quantization**: Native 1.58-bit weights and 8-bit activations (W1.58A8).
  - Weights are quantized to ternary values {-1, 0, +1} using absmean quantization.
  - Activations are quantized to 8-bit integers using absmax quantization (per-token).
  - Trained from scratch with this quantization scheme, not post-training quantized.
- **Context Length**: 32,768 tokens.
- **Pooling Strategy**: Last-token (EOS) pooling followed by L2 normalization.
- **Training Pipeline**:
  1. **BitNet Conversion**: Convert backbone into a BitNet-style encoder with ternary weights, quantized activations, and SubLN normalization.
  2. **Continual Contrastive Pre-training**: Trained on 1B text pairs with InfoNCE loss.
  3. **Distillation-based Supervised Fine-tuning**: Contrastive loss + similarity-distribution distillation + attention-relation distillation from FP16 teacher.

| Model | [bitnet-embedding-0.6B](https://huggingface.co/microsoft/bitnet-embedding-0.6b) | [bitnet-embedding-270M](https://huggingface.co/microsoft/bitnet-embedding-270m) |
|---|---|---|
| Backbone | Qwen3-0.6B | Gemma3 |
| Parameters | ~0.6B | ~270M |
| Embedding Dimension | 1,024 | 640 |
| Hidden Layers | 28 | 18 |
| Attention Heads (KV) | 16 (8) | 4 (1) |
| head_dim | 128 | 256 |
| Intermediate Size | 3,072 | 2,048 |
| Activation | SiLU | GELU |
| Tokenizer | Qwen3 (151,936) | Gemma (262,144) |
| Post-attn/FFW norms | No | Yes |
| Embedding scaling | No | sqrt(hidden_size) |

## MTEB v2 Evaluation Scores (16-bit embeddings)

| Model | Weights | Bitext | Classification | Clustering | Pair Class. | Reranking | Retrieval | STS | **Mean** |
|---|---|---|---|---|---|---|---|---|---|
| bitnet-embeddings-270m | 1.58-bit | 80.47 | 71.09 | 52.37 | 79.72 | 60.50 | 66.71 | 74.35 | **66.26** |
| bitnet-embeddings-0.6b | 1.58-bit | 81.47 | 72.65 | 53.06 | 80.47 | 62.12 | 68.33 | 74.97 | **67.49** |

## Embedding Quantization

The output embeddings can be quantized to 8, 4, 2, or even 1 bit, allowing users to flexibly trade off between storage cost and retrieval performance based on their application needs.

![Embedding Quantization — Mean MTEB v2 Score](fig1_quant_per_task.png)

## Training

The models are trained with contrastive learning objectives on a large-scale mixture of multilingual datasets covering diverse tasks.
Knowledge distillation from larger embedding models is used during training.
The BitNet quantization is applied to all linear layers, resulting in 1.58-bit ternary weights while keeping activations in higher precision.

## How to Use (with bitnet.cpp)

For achieving the efficiency benefits, use the dedicated C++ implementation: [bitnet.cpp](https://github.com/microsoft/BitNet).

### Build

```bash
git clone --recursive https://github.com/microsoft/BitNet.git
cd BitNet
cmake -S . -B build \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_C_COMPILER=clang \
  -DCMAKE_CXX_COMPILER=clang++ \
  -DGGML_NATIVE=ON \
  -DGGML_OPENMP=OFF \
  -DLLAMA_BUILD_COMMON=ON \
  -DLLAMA_BUILD_TOOLS=ON \
  -DLLAMA_BUILD_EXAMPLES=ON
cmake --build build --target llama-embedding llama-bench -j$(nproc)
```

### Download

```bash
# 270M
hf download microsoft/bitnet-embedding-270m \
  bitnet-embeddings-270m-bf16-i2_s.gguf \
  --local-dir models/bitnet-embedding-270m

# 0.6B
hf download microsoft/bitnet-embedding-0.6b \
  bitnet-embeddings-0.6b-bf16-i2_s.gguf \
  --local-dir models/bitnet-embedding-0.6b
```

### Inference

```bash
# Choose one model:
MODEL=models/bitnet-embedding-270m/bitnet-embeddings-270m-bf16-i2_s.gguf
# MODEL=models/bitnet-embedding-0.6b/bitnet-embeddings-0.6b-bf16-i2_s.gguf

./build/bin/llama-embedding \
  -m "$MODEL" \
  -p "query: What is BitNet?" \
  --embd-normalize 2 \
  --embd-output-format array
```

**Example output** (L2-normalized embedding; 640 dimensions for 270M or 1,024 for 0.6B; truncated):

```json
[[0.0239517, 0.6826404, -0.0000000, -0.0644535, 0.0613754, 0.0473094, 0.0114330, ...]]
```

Please refer to the [bitnet.cpp GitHub repository](https://github.com/microsoft/BitNet) for detailed compilation steps, usage examples, and command-line options.

## Evaluation

### Embedding Quality (MMTEB eng, v2)

BitNet Embedding 0.6B was evaluated against its full-precision FP16 teacher model on the MMTEB (eng, v2) benchmark:

| Model | Cls. | Clust. | PairCls. | Rerank. | Retr. | STS | Summ. | Avg. | Speed (t/s) |
|-------|------|--------|----------|--------|-------|-----|-------|------|-------------|
| FP16 Teacher | 86.37 | 55.48 | 82.56 | 43.89 | 55.34 | 81.15 | 31.87 | 67.95 | 382.15 |
| **BitNet Embedding 0.6B** | **86.49** | **55.42** | **82.30** | **43.41** | **54.03** | **81.15** | **32.06** | **67.60** | **870.90** |

The model achieves **67.60** average score on MMTEB (eng, v2), only **0.35 points** below the FP16 teacher, while delivering **2.28x** higher CPU throughput.


### Inference Performance (CPU, 8 threads)

Performance on **Intel Xeon Platinum 8573C** with 8 threads, Clang/Clang++ (no OpenMP), GGML_NATIVE=ON. All results in tokens/second (mean +/- std over 3 runs).

> **Note on build flags:** The results below use `-DGGML_NATIVE=ON`, which auto-detects and enables the best instruction set supported by the host CPU (e.g., AVX, AVX2, AVX-VNNI, FMA, F16C). This yields optimal performance. To target only AVX2 (e.g., for portable binaries), set `-DGGML_NATIVE=OFF` and manually specify:
> ```
> -DGGML_AVX=ON -DGGML_AVX2=ON -DGGML_FMA=ON -DGGML_F16C=ON
> -DGGML_AVX512=OFF -DGGML_AVX512_VBMI=OFF -DGGML_AVX512_VNNI=OFF -DGGML_AVX512_BF16=OFF
> ```

#### bitnet-embedding-0.6B

| Test | F16.gguf (t/s) | **I2_S.gguf (t/s)** | Speedup |
|------|---------------|-----------------|---------|
| pp128 | 382.15 | **870.90** | **2.28x** |
| pp256 | 373.95 | **827.75** | **2.21x** |
| pp512 | 371.86 | **716.27** | **1.93x** |
| pp1024 | 341.55 | **620.58** | **1.82x** |
| pp2048 | 298.21 | **481.14** | **1.61x** |
| pp4096 | 236.76 | **336.32** | **1.42x** |

#### bitnet-embedding-270m

| Test | F16.gguf (t/s) | **I2_S.gguf (t/s)** | Speedup |
|------|---------------|-----------------|---------|
| pp128 | 1212.68 | **2019.59** | **1.67x** |
| pp256 | 1221.28 | **2119.50** | **1.74x** |
| pp512 | 1394.99 | **2181.23** | **1.56x** |
| pp1024 | 1265.22 | **2086.46** | **1.65x** |
| pp2048 | 1024.47 | **1471.60** | **1.44x** |
| pp4096 | 785.54 | **1033.46** | **1.32x** |

## Uses

### Direct Use

BitNet-Embeddings is designed for direct use in tasks requiring text embeddings. Its primary applications include:

- Efficient information retrieval for RAG, web search, enterprise search, and question answering applications.
- Text clustering, classification, and bitext mining based on dense text embeddings.

### Out-of-Scope Use

- BitNet-Embeddings does not generate any human-readable texts or other multi-modal content. Instead, it maps input texts into dense embedding vectors that are used by downstream Vector DB or classifiers.
- **Limited Training Data Representation:** While the training data includes a mix of multilingual datasets, it may not represent diverse linguistic, cultural, or geographical contexts for low-resource languages. As a result, performance in low-resource languages may be significantly limited.
- **Domain-Specific Limitations:** The training data predominantly covers general-purpose knowledge tasks. Specific or niche domains such as legal, medical, or scientific literature may not be adequately represented, and results in these areas should be interpreted with caution.
- **Use in High-Risk Applications:** We do not recommend using BitNet-Embeddings in commercial or real-world applications without further testing and development. As the model is being released for research purposes, additional evaluation and fine-tuning are required to ensure reliability and fairness in high-stakes scenarios.

## Supported Languages

The models are trained on multilingual data and support a wide range of languages,
including but not limited to: Arabic, Bulgarian, Catalan, Czech, Danish, German, Greek, English, Spanish,
Estonian, Persian, Finnish, French, Hebrew, Hindi, Croatian, Hungarian, Indonesian, Italian, Japanese,
Korean, Lithuanian, Latvian, Macedonian, Malay, Dutch, Norwegian, Polish, Portuguese, Romanian, Russian,
Slovak, Slovenian, Albanian, Serbian, Swedish, Thai, Turkish, Ukrainian, Urdu, Vietnamese, and Chinese.

## Evaluation

Please follow the [mteb](https://github.com/embeddings-benchmark/mteb) repository on how to reproduce our scores.
The evaluation prompts used for each task are also available at [mteb_v2_eval_prompts.json](mteb_v2_eval_prompts.json).

## Bias, Risks, and Limitations

- Predictions may perpetuate biases present in the training data.
- There is limited support for extremely low-resource languages and underrepresented domains.
- The model is designed for text embedding tasks (retrieval, similarity, classification) and is not suitable for text generation.

## Disclaimer

We do not recommend using BitNet Embedding 0.6B in commercial or real-world applications without further testing and development. This model is intended for research and development purposes. Please use responsibly.

## FAQ

**1. Do I need to add instructions to the query?**

Yes, this is how the model is trained, otherwise you will see a performance degradation.
The task definition should be a one-sentence instruction that describes the task.
This is a way to customize text embeddings for different scenarios through natural language instructions.

On the other hand, there is no need to add instructions to the document side.

**2. Why are my reproduced results slightly different from reported in the model card?**

Different versions of `transformers` and `pytorch` could cause negligible but non-zero performance differences.

**3. What pooling strategy does this model use?**

The model uses **last-token pooling** — the embedding of the last non-padding token is used as the sentence representation.
The embedding is then L2-normalized.

## Citation

```bibtex
@misc{li2026bitnettextembeddings,
  title={BitNet Text Embeddings},
  author={Zhen Li and Xin Huang and Liang Wang and Nan Yang and Ting Song and Yan Xia and Xun Wu and Shaohan Huang and Huishuai Zhang and Furu Wei and Dongyan Zhao},
  year={2026},
  eprint={2606.25674},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
  url={https://arxiv.org/abs/2606.25674}
}

@inproceedings{wang2025bitnet,
  title={BitNet.cpp: Efficient Edge Inference for Ternary LLMs},
  author={Wang, Jinheng and Zhou, Hansong and Song, Ting and Cao, Shijie and Xia, Yan and Cao, Ting and Wei, Jianyu and Ma, Shuming and Wang, Hongyu and Wei, Furu},
  booktitle={Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)},
  pages={9305--9322},
  year={2025}
}

@article{wang2024multilingual,
  title={Multilingual E5 Text Embeddings: A Technical Report},
  author={Wang, Liang and Yang, Nan and Huang, Xiaolong and Yang, Linjun and Majumder, Rangan and Wei, Furu},
  journal={arXiv preprint arXiv:2402.05672},
  year={2024}
}
```
