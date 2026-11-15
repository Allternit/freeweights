> [!NOTE]
> This repository contains models that have been converted to the GGUF format with various quantizations from an IBM Granite `.safetensors` model.
>
> Please reference the base model's full model card here:
> https://huggingface.co/ibm-granite/granite-4.1-30b

### Merging the `.bf16` model

The `bf16` model had to be split into multiple files to accommodate single file size restrictions 
using the `llama-gguf-split` tool, with its default `--split` settings, which can be built from the [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) project.

Use the following command to merge the split files which points to the first file in the sequence:

```bash
llama-gguf-split --merge granite-4.1-30b-bf16-00001-of-00005.gguf granite-4.1-30b-bf16.gguf
```

The remaining split filenames are inferred by the tool based upon the `00001-of-0000x` naming convention. 
