# MistralLite-AWQ Model

MistralLite-AWQ is a version of the [MistralLite](https://huggingface.co/amazon/MistralLite) model that was
quantized using the AWQ method developed by [Lin et al. (2023)](https://arxiv.org/abs/2306.00978).
The MistralLite-AWQ models are approximately **70% smaller** than those of MistralLite whilst maintaining comparable performance.

Please refer to the [original MistralLite model card](https://huggingface.co/amazon/MistralLite) for details about the model
preparation and training processes.

## MistralLite-AWQ Variants

| Branch | Approx. Model Size | `q_group_size` | `w_bit` | `version` |
|--------|---:|---------------:|--------:|-----------|
| [main](https://huggingface.co/amazon/MistralLite-AWQ/tree/main) | 3.9 GB | 128 | 4 | GEMM |
| [MistralLite-AWQ-64g-4b-GEMM](https://huggingface.co/amazon/MistralLite-AWQ/tree/MistralLite-AWQ-64g-4b-GEMM) | 4.0 GB | 64 | 4 | GEMM |
| [MistralLite-AWQ-32g-4b-GEMM](https://huggingface.co/amazon/MistralLite-AWQ/tree/MistralLite-AWQ-32g-4b-GEMM) | 4.3 GB | 32 | 4 | GEMM |

## Dependencies
- [`autoawq==0.2.5`](https://pypi.org/project/autoawq/0.2.5/) – [AutoAWQ](https://github.com/casper-hansen/AutoAWQ) was used to quantize the MistralLite model.
- [`vllm==0.4.2`](https://pypi.org/project/vllm/0.4.2/) – [vLLM](https://github.com/vllm-project/vllm) was used to host models for benchmarking.

## Evaluations

### Long Context

The following benchmark results are shown as _accuracy_ (%) values, unless stated otherwise.

#### Topic Retrieval

See https://lmsys.org/blog/2023-06-29-longchat/

| Model Name                                         |   n_topics=05 |   n_topics=10 |   n_topics=15 |   n_topics=20 |   n_topics=25 |
|:---------------------------------------------------|--------------:|--------------:|--------------:|--------------:|--------------:|
| _n_tokens_ (approx.) =         | _3048_ | _5966_ | _8903_ | _11832_ | _14757_ |
| MistralLite                                        |           100 |           100 |           100 |           100 |            98 |
| **MistralLite-AWQ**           |          **100** |          **100** |          **100**|          **100** |           **98** |
| **MistralLite-AWQ-64g-4b-GEMM**            |          **100** |          **100** |          **100**|          **100** |           **98** |
| **MistralLite-AWQ-32g-4b-GEMM**            |          **100** |          **100** |          **100**|          **100** |           **98** |
| Mistral-7B-Instruct-v0.1                           |            96 |            52 |             2 |             0 |             0 |
| Mistral-7B-Instruct-v0.2                           |           100 |           100 |           100 |           100 |           100 |
| Mixtral-8x7B-v0.1                                  |             0 |             0 |             0 |             0 |             0 |
| Mixtral-8x7B-Instruct-v0.1                         |           100 |           100 |           100 |           100 |           100 |

#### [Line Retrieval](https://lmsys.org/blog/2023-06-29-longchat/#longeval-results)

See https://lmsys.org/blog/2023-06-29-longchat/#longeval-results

| Model Name                                         |   n_lines=200 |   n_lines=300 |   n_lines=400 |   n_lines=500 |   n_lines=600 |   n_lines=680 |
|:----------|-------------:|-------------:|------------:|-----------:|-----------:|-----------:|
| _n_tokens_ (approx.) =         | _4317_ | _6415_ | _8510_ | _10610_ | _12698_ | _14373_ | 
| MistralLite                                        |           100 |            94 |            86 |            82 |            76 |            66 |
| **MistralLite-AWQ**           |           **96**|           **94**|           **88** |           **80** |           **70**|           **62** |
| **MistralLite-AWQ-64g-4b-GEMM**            |           **96**|           **96**|           **90** |           **70** |           **72**|           **60** |
| **MistralLite-AWQ-32g-4b-GEMM**            |           **98**|           **96**|           **84** |           **76** |           **70**|           **62** |
| Mistral-7B-Instruct-v0.1                           |            96 |            56 |            38 |            36 |            30 |            30 |
| Mistral-7B-Instruct-v0.2                           |           100 |           100 |            96 |            98 |            96 |            84 |
| Mixtral-8x7B-v0.1                                  |            54 |            38 |            56 |            66 |            62 |            38 |
| Mixtral-8x7B-Instruct-v0.1                         |           100 |           100 |           100 |           100 |           100 |           100 |

#### Pass Key Retrieval

See https://github.com/epfml/landmark-attention/blob/main/llama/run_test.py#L101

| Model Name                               |   n_garbage=12000 |   n_garbage=20000 |   n_garbage=31000 |   n_garbage=38000 |   n_garbage=45000 | n_garbage=60000 |
|:----------|-------------:|-------------:|------------:|-----------:|-----------:|-----------:|
| _n_tokens_ (approx.) =         | _3272_ | _5405_ | _8338_ | _10205_ | _12071_ | _16072_ |
| MistralLite                              |               100 |               100 |               100 |               100 |               100 | 100|
| **MistralLite-AWQ** |              **100** |             **100**|              **100**|              **100** |              **100**| **100**|
| **MistralLite-AWQ-64g-4b-GEMM**  |              **100** |             **100**|              **100**|              **100** |              **100**| **100**|
| **MistralLite-AWQ-32g-4b-GEMM**  |              **100** |             **100**|              **100**|              **100** |              **100**| **100**|
| Mistral-7B-Instruct-v0.1                            |               100 |                50 |                30 |                20 |                10 |                10 |
| Mistral-7B-Instruct-v0.2                            |               100 |               100 |               100 |               100 |               100 |               100 |
| Mixtral-8x7B-v0.1                                   |               100 |               100 |               100 |               100 |               100 |               100 |
| Mixtral-8x7B-Instruct-v0.1                          |               100 |               100 |               100 |                90 |               100 |               100 |


#### QuALITY (Question Answering with Long Input Texts, Yes!)

See https://nyu-mll.github.io/quality/

|Model Name| Test set Accuracy | Hard subset Accuracy|
|:----------|-------------:|-------------:|
| MistralLite                              |   56.8 |       74.5 |
| **MistralLite-AWQ** |  **55.3** |      **71.8** |
| **MistralLite-AWQ-64g-4b-GEMM**  |  **55.2** |      **72.9** |
| **MistralLite-AWQ-32g-4b-GEMM**  |  **56.6** |      **72.8** |
| Mistral-7B-Instruct-v0.1                 |   45.2 |       58.9 |
| Mistral-7B-Instruct-v0.2                 |   55.5 |       74   |
| Mixtral-8x7B-v0.1                        |   75   |       74.1 |
| Mixtral-8x7B-Instruct-v0.1               |   68.7 |       83.3 |

## Usage

## Inference via vLLM HTTP Host

### Launch Host
```bash
python -m vllm.entrypoints.openai.api_server \
    --model amazon/MistralLite-AWQ \
    --quantization awq
```

### Query Host
```bash
curl -X POST http://localhost:8000/v1/completions \
    -H "Content-Type: application/json" \
    -d '{ "model": "amazon/MistralLite-AWQ",
          "prompt": "<|prompter|>What are the main challenges to support a long context for LLM?</s><|assistant|>",
          "temperature": 0,
          "echo": false
    }'
```

## Inference via [vLLM Offline Inference](https://docs.vllm.ai/en/latest/getting_started/examples/offline_inference.html)
```python
from vllm import LLM, SamplingParams

prompts = [
   "<|prompter|>What are the main challenges to support a long context for LLM?</s><|assistant|>",
]
sampling_params = SamplingParams(temperature=0, max_tokens=100)

llm = LLM(model="amazon/MistralLite-AWQ")

outputs = llm.generate(prompts, sampling_params)

# Print the outputs.
for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"Prompt: {prompt!r}, Generated text: {generated_text!r}")

```

## License

Apache 2.0

## Limitations

Before using the MistralLite-AWQ model, it is important to perform your own
independent assessment, and take measures to ensure that your use would comply
with your own specific quality control practices and standards, and that your
use would comply with the local rules, laws, regulations, licenses and terms
that apply to you, and your content.
