# granite-vision-3.3-2b-chart2csv-preview

**Model Summary**: 

Chart2CSV is a specialized vision-language model fine-tuned for the accurate extraction of tabular data from charts and visualizations. Built on top of [ibm-granite/granite-vision-3.3-2b](https://huggingface.co/ibm-granite/granite-vision-3.3-2b), it produces machine-readable CSV outputs with improved numeric fidelity compared to general-purpose VLMs. The model is trained using code-guided synthetic chart data following the [ChartGen](https://arxiv.org/abs/2507.19492) methodology, which strengthens factual grounding and reduces hallucination in the Chart-to-CSV task.

**Intended Use**: 

The model is intended for workflows that require precise extraction of chart data into structured tables, including but not limited to:
- Integration within Docling-based document parsing pipelines for structured data enrichment ([Chart data extraction with Docling](https://github.com/docling-project/docling/blob/main/docs/examples/chart_extraction.py))
- Enabling multimodal document understanding systems that jointly reason over charts, text, and tables
- Direct extraction of structured data from charts embedded in reports, presentations, and PDFs
- Providing structured inputs for downstream workflow automation and analytics systems
- Supporting large-scale ingestion of financial or industry documents where raw tabular data is unavailable

The model's outputs are designed to be CSV-ready when used with the recommended Chart2CSV extraction prompt, enabling seamless downstream analysis with data tools like pandas, SQL, or spreadsheet software.

**Generation**: 

This is a simple example of how to use the granite-vision-3.3-2b-chart2csv-preview model with the specific Chart-to-CSV prompt.

```python
from transformers import AutoProcessor, AutoModelForVision2Seq
from huggingface_hub import hf_hub_download
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"

model_path = "ibm-granite/granite-vision-3.3-2b-chart2csv-preview"
processor = AutoProcessor.from_pretrained(model_path)
model = AutoModelForVision2Seq.from_pretrained(model_path).to(device)

# prepare image and text prompt, using the appropriate prompt template

img_path = hf_hub_download(repo_id=model_path, filename='example.jpg')

conversation = [
    {
        "role": "user",
        "content": [
            {"type": "image", "url": img_path},
            {"type": "text", "text": "Convert the information in this chart into a data table in CSV format."},
        ],
    },
]
inputs = processor.apply_chat_template(
    conversation,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt"
).to(device)


# autoregressively complete prompt
output = model.generate(**inputs, max_new_tokens=500)
print(processor.decode(output[0], skip_special_tokens=True))

```

**Evaluations:** 

We compare the performance of granite-vision-3.3-2b-chart2csv-preview with other vision-language models (VLMs) on an internal Chart-to-CSV benchmark. In this task, models generate a CSV table from a chart image, and outputs are compared to ground-truth data using an LLM-based judge that measures similarity while ignoring minor formatting differences.
| | Chart2CSV | 
|-----------|-----------|
| chartgemma | 37.1 |
| granite-vision-3.3-2b | 53.8 |
| Qwen3-VL-4B-Instruct | 58.1 |
| InternVL3-8B | 56.1 | 
| Pixtral-12B-2409 | 49.1 | 
| Mistral-Samll-3.1-24B-Instruct-2503 | 53.2 | 
| Qwen2-VL-72B-Instruct | 50.3 | 
| GPT-4o | 46.7 | 
| **granite-vision-3.3-2b-chart2csv-preview** | **60.1** |


**Model Architecture:**  

The granite-vision-3.3-2b-chart2csv-preview model uses the same architecture as the [granite-vision-3.3-2b](https://huggingface.co/ibm-granite/granite-vision-3.3-2b).

**Infrastructure:** 

We train granite-vision-3.3-2b-chart2csv-preview using IBM's supercomputing cluster, Blue Vela, which is outfitted with NVIDIA H100 GPUs. This cluster provides a scalable and efficient infrastructure for training our models over thousands of GPUs.

**Responsible Use and Limitations:** 

Some use cases for Chart-to-CSV extraction systems can trigger certain risks and operational considerations, including but not limited to: numeric inaccuracies, propagation of errors into downstream analytics pipelines, and misinterpretation of ambiguous chart styles. Although Chart2CSV is optimized to reduce hallucination and improve numeric fidelity, it may still produce inaccurate or incomplete tables in cases of low-resolution images, complex layouts, overlapping visual elements, or unconventional chart designs. Since Chart2CSV extracts structured numeric data, incorrect outputs may impact financial, scientific, or industry analysis workflows if not validated. We recommend human verification or automated consistency checks in high-stakes applications. Chart2CSV is optimized specifically for chart-to-CSV extraction and may not perform reliably on general vision-language tasks outside this scope.

**Resources**
- 📄 Read the full technical report of Granite Vision models [here](https://arxiv.org/abs/2502.09927)
- ⭐️ Learn about the latest updates with Granite: https://www.ibm.com/granite
- 🚀 Learn about Docling enrichment features: https://docling-project.github.io/docling/usage/enrichments/
- 📄 Get started with tutorials, best practices, and prompt engineering advice: https://www.ibm.com/granite/docs/
- 💡 Learn about the latest Granite learning resources: https://ibm.biz/granite-learning-resources
