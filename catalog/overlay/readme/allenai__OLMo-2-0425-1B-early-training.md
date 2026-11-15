## Model Details

<img alt="OLMo Logo" src="https://huggingface.co/datasets/allenai/blog-images/resolve/main/olmo2/olmo.png" width="242px" style="margin-left:'auto' margin-right:'auto' display:'block'">

---

## Model Card for OLMo 2 1B Early Training Checkpoints
We introduce OLMo 2 1B Early Training checkpoints, a collection of frequent checkpoints early in the training process of a 1B model. We release these checkpoints as a resource for anyone interested in studying early training dynamics. To view our official OLMo 2 1B model, please see [OLMo-2-0425-1B](https://huggingface.co/allenai/OLMo-2-0425-1B). Or, view the entire collection of OLMo 2 models [here](https://huggingface.co/collections/allenai/olmo-2-674117b93ab84e98afc72edc).

We generated these checkpoints after the original training of our OLMo 2 1B model. Checkpoints were saved every 1,000 steps for 37,000 steps, starting at step0 of our OLMo-2-1B model.

### A Note on these Checkpoints
These checkpoints use the same architecture and starting checkpoint as the official OLMo 2 1B, but they aren’t identical to the original run due to the non-deterministic nature of LLM training environments. Performance may differ slightly. If you're interested in comparing these checkpoints to our original OLMo 2 1B, you can compare the checkpoints that are present in both repositories:
- `stage1-step0-tokens0B` -- This official OLMo 2 1B checkpoint is loaded in as the starting point for these checkpoints
- `stage1-step10000-tokens21B`
- `stage1-step20000-tokens42B`
- `stage1-step30000-tokens63B`

## Inference
You can access these checkpoints using the standard Hugging Face Transformers library:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
olmo_early_training = AutoModelForCausalLM.from_pretrained("allenai/OLMo-2-0425-1B-early-training")
tokenizer = AutoTokenizer.from_pretrained("allenai/OLMo-2-0425-1B-early-training")
message = ["The capital of the United States is "]
inputs = tokenizer(message, return_tensors='pt', return_token_type_ids=False)

response = olmo_early_training.generate(**inputs, max_new_tokens=100, do_sample=True, top_k=50, top_p=0.95)
print(tokenizer.batch_decode(response, skip_special_tokens=True)[0])

```

To access a specific checkpoint, you can specify the revision:

```python
olmo_early_training = AutoModelForCausalLM.from_pretrained("allenai/OLMo-2-0425-1B-early-training", revision="stage1-step20000-tokens42B")
```

## Model Description
- Developed by: Allen Institute for AI (Ai2)
- Model type: a Transformer style autoregressive language model.
- Language(s) (NLP): English
- License: The models and checkpoints are licensed under Apache 2.0. They are intended for research and educational use in accordance with [Ai2's Responsible Use Guidelines](https://allenai.org/responsible-use).
- Contact: Technical inquiries: olmo@allenai.org. Press: press@allenai.org

## Bias, Risks, and Limitations
Like any base or fine-tuned language model, AI can be prompted by users to generate harmful and sensitive content. Such content may also be produced unintentionally, especially in cases involving bias, so we recommend that users consider the risks when applying this technology. Additionally, many statements from OLMo or any LLM are often inaccurate, so facts should be verified.
