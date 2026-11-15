<img alt="olmOCR Logo" src="https://huggingface.co/datasets/allenai/blog-images/resolve/main/olmocr/olmocr.png" width="242px" style="margin-left:'auto' margin-right:'auto' display:'block'">

# olmOCR-7B-0225-preview-FP8

This is the official FP8 quantized version of [olmOCR-7B-0225-preview](https://huggingface.co/allenai/olmOCR-7B-0225-preview/) for use with the olmOCR pipeline.

Be sure you have olmOCR v0.1.75 or newer and run:

```
# Download a sample PDF
curl -o olmocr-sample.pdf https://olmocr.allenai.org/papers/olmocr_3pg_sample.pdf

# Convert it to markdown
python -m olmocr.pipeline ./localworkspace --markdown --pdfs olmocr-sample.pdf --model allenai/olmOCR-7B-0225-preview-FP8
```

## License and use

olmOCR is licensed under the Apache 2.0 license.
olmOCR is intended for research and educational use.
For more information, please see our [Responsible Use Guidelines](https://allenai.org/responsible-use).