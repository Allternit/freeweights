<img alt="olmOCR Logo" src="https://huggingface.co/datasets/allenai/blog-images/resolve/main/olmocr/olmocr.png" width="242px" style="margin-left:'auto' margin-right:'auto' display:'block'">

# olmOCR-7B-0725

This is a release of the olmOCR model that's fine tuned from Qwen2.5-VL-7B-Instruct using the 
[olmOCR-mix-0225](https://huggingface.co/datasets/allenai/olmOCR-mix-0225) dataset.

Quick links:
- 📃 [Paper](https://olmocr.allenai.org/papers/olmocr.pdf)
- 🤗 [Dataset](https://huggingface.co/datasets/allenai/olmOCR-mix-0225)
- 🛠️ [Code](https://github.com/allenai/olmocr)
- 🎮 [Demo](https://olmocr.allenai.org/)

The best way to use this model is via the [olmOCR toolkit](https://github.com/allenai/olmocr).
The toolkit comes with an efficient inference setup via sglang that can handle millions of documents
at scale.

## Usage

This model expects as input a single document image, rendered such that the longest dimension is 1288 pixels.

The prompt must then contain the additional metadata from the document, and the easiest way to generate this
is to use the methods provided by the [olmOCR toolkit](https://github.com/allenai/olmocr).

A simple way to infer using transformers is as follows:

```python
import torch from transformers import AutoModelForImageTextToText, AutoProcessor 

model_id = "allenai/olmOCR-7B-0725" 
processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForImageTextToText.from_pretrained(model_id, torch_dtype=torch.float16 ).to("cuda").eval()

PROMPT = """
Below is the image of one page of a PDF document , as well as some raw textual content that
was previously extracted for it that includes position information for each image and
block of text ( The origin [0 x0 ] of the coordinates is in the lower left corner of the
image ).
Just return the plain text representation of this document as if you were reading it
naturally .
Turn equations into a LaTeX representation , and tables into markdown format . Remove the
headers and footers , but keep references and footnotes .
Read any natural handwriting .
This is likely one page out of several in the document , so be sure to preserve any sentences
that come from the previous page , or continue onto the next page , exactly as they are .
If there is no text at all that you think you should read , you can output null .
Do not hallucinate .
RAW_TEXT_START
{ base_text }
RAW_TEXT_END
"""

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "image": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/smolvlm_table.png",
            },
            {"type": "text", "text": PROMPT},
        ],
    }
]

text = processor.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
)
inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt"
).to(model.device)

output_ids = model.generate(**inputs, max_new_tokens=1000)
generated_ids = [output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, output_ids)]
output_text = processor.batch_decode(generated_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True)
print(output_text)
```

## License and use

olmOCR is licensed under the Apache 2.0 license.
olmOCR is intended for research and educational use.
For more information, please see our [Responsible Use Guidelines](https://allenai.org/responsible-use).