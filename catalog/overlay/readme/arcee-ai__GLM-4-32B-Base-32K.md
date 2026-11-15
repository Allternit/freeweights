### GLM-4-32B-Base-32K

GLM-4-32B-Base-32K is an enhanced version of [THUDM's GLM-4-32B-Base-0414](https://huggingface.co/THUDM/GLM-4-32B-Base-0414), specifically engineered to offer robust performance over an extended context window. While the original model's capabilities degraded after 8,192 tokens, this version maintains strong performance up to a 32,000-token context, making it ideal for tasks requiring long-context understanding and processing.

This model was developed as a proof-of-concept to validate that a merging-centric approach to context extension can be successfully applied to larger-scale models. The techniques employed resulted in an approximate 5% overall improvement on standard base model benchmarks while significantly improving 32k recall.

More details can be found in our blog post [here](https://www.arcee.ai/blog/extending-afm-4-5b-to-64k-context-length) where we applied this work to our upcoming AFM 4.5B

## Model Details
- Architecture Base: [THUDM/GLM-4-32B-Base-0414](https://huggingface.co/THUDM/GLM-4-32B-Base-0414)
- Parameter Count: 32B
- License: [MIT](https://huggingface.co/arcee-ai/GLM-4-32B-Base-32K#license)

## Improvements
The primary improvement in this model is its enhanced long-context capability. The following methods were used to achieve this:

- Targeted Long-Context Training: The model underwent continued pretraining on sequences up to its full 32,000 token context length.
- Iterative Merging: Various model checkpoints were iteratively merged to combine the benefits of different training runs, enhancing both long-context and short-context performance.
- Short-Context Distillation: Knowledge from the original high-performing short-context model was distilled into the long-context-trained model to recover and retain its initial capabilities on shorter tasks.

As a result, where the original model's performance on the Needle in a Haystack (NIAH) benchmark would decline after 8,000 tokens, this extended version maintains reliable performance across the entire 32,000 token context window.

## Benchmarks

| Benchmark | GLM-4-32B-Base-0414 | GLM-4-32B-Base-32K |
|-----------|--------------------:|-----------------:|
| arc_challenge | 59.39% | **64.93%** |
| arc_easy | 85.44% | **87.88%** |
| hellaswag | 64.75% | **65.40%** |
| mmlu | 77.05% | **77.87%** |
| piqa | 81.61% | **83.19%** |
| truthfulqa_mc2 | 49.27% | **50.07%** |
| winogrande | 78.69% | **80.03%** |

### NIAH Benchmark Results Comparison

| Model | Task | 4,096 | 8,192 | 16,384 | 24,576 | 32,768 |
|-------|------|------:|------:|-------:|-------:|-------:|
| **GLM-4-32B-Base-0414** | | | | | | |
| | niah_single_1 | 100.0% | 100.0% | 77.0% | 5.2% | 1.2% |
| | niah_single_2 | 100.0% | 100.0% | 73.4% | 2.6% | 0.0% |
| | niah_single_3 | 100.0% | **99.8%** | 48.0% | 1.4% | 0.0% |
| **GLM-4-32B-Base-32k** | | | | | | |
| | niah_single_1 | 100.0% | 100.0% | **100.0%** | **99.2%** | **99.6%** |
| | niah_single_2 | 100.0% | 100.0% | **99.2%** | **80.2%** | **68.8%** |
| | niah_single_3 | 100.0% | 99.6% | **95.6%** | **86.6%** | **61.0%** |


### NIAH Averages

| Model | 4,096 | 8,192 | 16,384 | 24,576 | 32,768 |
|-------|------:|------:|-------:|-------:|-------:|
| GLM-4-32B-Base-0414 | 100.0% | 99.9% | 66.1% | 3.1% | 0.4% |
| GLM-4-32B-Base-32k | 100.0% | 99.9% | **98.3%** | **88.7%** | **76.5%** |

## Use Cases

This model serves as a new base for continued training at 32K context

## License
**GLM-4-32B-Base-32K (32B)** is released under the [MIT](https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md) license following with the original model's license.

If you have questions or would like to share your experiences using GLM-4-32B-Base-32K (32B), please connect with us on social media. We’re excited to see what you build—and how this model helps you innovate!