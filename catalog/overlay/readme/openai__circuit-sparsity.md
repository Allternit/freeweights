## Sparse Model from Gao et al. 2025

Weights for a sparse model from Gao et al. 2025, used for the qualitative results from the paper (related to bracket counting and variable binding). All weights for the other models used in the paper, as well as lightweight inference code, are present in https://github.com/openai/circuit_sparsity. In the context of that repo, this model is csp_yolo2.

This is a runnable standalone huggingface implementation for one of the models. It includes code to load the locally converted HF model + tokenizer and run a tiny generation.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

if __name__ == "__main__":
    PROMPT = "def square_sum(xs):\n    return sum(x * x for x in xs)\n\nsquare_sum([1, 2, 3])\n"
    tok = AutoTokenizer.from_pretrained("openai/circuit-sparsity", trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        "openai/circuit-sparsity",
        trust_remote_code=True,
        torch_dtype="auto",
    )
    model.to("cuda" if torch.cuda.is_available() else "cpu")
    inputs = tok(PROMPT, return_tensors="pt", add_special_tokens=False)["input_ids"].to(
        model.device
    )

    with torch.no_grad():
        out = model.generate(
            inputs,
            max_new_tokens=64,
            do_sample=True,
            temperature=0.8,
            top_p=0.95,
            return_dict_in_generate=False,
        )

    print("=== Prompt ===")
    print(PROMPT)
    print("\n=== Generation ===")
    print(tok.decode(out[0], skip_special_tokens=True))
```


## License
This project is licensed under the [Apache License 2.0](LICENSE.md).