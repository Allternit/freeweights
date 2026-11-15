<div align="center">
  <a href="https://agent.fastino.ai" target="_blank" rel="noopener noreferrer">
    <img src="image/GLiNER-2-Large-HF-Banner.png" alt="Fastino AI - Fine-tune GLiNER with a single prompt" width="100%"/>
  </a>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
  <a href="https://agent.fastino.ai" target="_blank" rel="noreferrer" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Deploy-GLiNER2-EA4335" alt="Fine-tune and Deploy GLiNER2 with Fastino" style="vertical-align:middle;">
  </a>  <a href="https://arxiv.org/abs/2507.18546" target="_blank" rel="noreferrer" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/arXiv-2605.07982-b31b1b.svg?logo=arxiv" alt="arXiv Paper" style="vertical-align:middle;">
  </a>
  <a href="https://github.com/fastino-ai/GLiNER2" target="_blank" rel="noreferrer" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/GitHub-GLiNER2-black?logo=github" alt="GitHub" style="vertical-align:middle;">
  </a>
  <a href="https://x.com/fastinoAI" target="_blank" rel="noreferrer" style="text-decoration:none;">
    <img src="https://img.shields.io/twitter/follow/:fastinoAI" alt="Follow @fastinoAI" style="vertical-align:middle;">
  </a>
</div>

# GLiNER2: Unified Schema-Based Information Extraction and Text Classification

> *Extract entities, classify text, parse structured data, and extract relations—all in one efficient model.*

GLiNER2 unifies **Named Entity Recognition**, **Text Classification**, **Structured Data Extraction**, and **Relation Extraction** into a single 205M parameter model. It provides efficient CPU-based inference without requiring complex pipelines or external API dependencies.

Fine-tune via [Fastino](https://agent.fastino.ai). Join discussions on [Discord](https://discord.gg/fastino) and [Reddit](https://www.reddit.com/r/GLiNER/).

## ✨ Why GLiNER2?

- **🎯 One Model, Four Tasks**: Entities, classification, structured data, and relations in a single forward pass
- **💻 CPU First**: Lightning-fast inference on standard hardware—no GPU required
- **🛡️ Privacy**: 100% local processing, zero external dependencies

## Installation

```bash
pip install gliner2
```

## Usage

### Entity Extraction

```python
from gliner2 import GLiNER2

# Load the model
extractor = GLiNER2.from_pretrained("fastino/gliner2-large-v1")

# Extract entities with descriptions for higher precision
text = "Patient received 400mg ibuprofen for severe headache at 2 PM."
result = extractor.extract_entities(
    text,
    {
        "medication": "Names of drugs, medications, or pharmaceutical substances",
        "dosage": "Specific amounts like '400mg', '2 tablets', or '5ml'",
        "symptom": "Medical symptoms, conditions, or patient complaints",
        "time": "Time references like '2 PM', 'morning', or 'after lunch'"
    }
)

print(result)
# Output: {'entities': {'medication': ['ibuprofen'], 'dosage': ['400mg'], 'symptom': ['severe headache'], 'time': ['2 PM']}}
```

### Text Classification

```python
# Single-label classification
result = extractor.classify_text(
    "This laptop has amazing performance but terrible battery life!",
    {"sentiment": ["positive", "negative", "neutral"]}
)
print(result)
# Output: {'sentiment': 'negative'}

# Multi-label classification
result = extractor.classify_text(
    "Great camera quality, decent performance, but poor battery life.",
    {
        "aspects": {
            "labels": ["camera", "performance", "battery", "display", "price"],
            "multi_label": True,
            "cls_threshold": 0.4
        }
    }
)
print(result)
# Output: {'aspects': ['camera', 'performance', 'battery']}
```

### Structured Data Extraction

```python
# Financial document processing
text = """
Transaction Report: Goldman Sachs processed a $2.5M equity trade for Tesla Inc. 
on March 15, 2024. Commission: $1,250. Status: Completed.
"""

result = extractor.extract_json(
    text,
    {
        "transaction": [
            "broker::str::Financial institution or brokerage firm",
            "amount::str::Transaction amount with currency",
            "security::str::Stock, bond, or financial instrument",
            "date::str::Transaction date",
            "commission::str::Fees or commission charged",
            "status::str::Transaction status",
            "type::[equity|bond|option|future|forex]::str::Type of financial instrument"
        ]
    }
)

print(result)
# Output: {
#     'transaction': [{
#         'broker': 'Goldman Sachs',
#         'amount': '$2.5M',
#         'security': 'Tesla Inc.',
#         'date': 'March 15, 2024',
#         'commission': '$1,250',
#         'status': 'Completed',
#         'type': 'equity'
#     }]
# }
```

### Multi-Task Schema Composition

```python
# Comprehensive legal contract analysis
contract_text = """
Service Agreement between TechCorp LLC and DataSystems Inc., effective January 1, 2024.
Monthly fee: $15,000. Contract term: 24 months with automatic renewal.
Termination clause: 30-day written notice required.
"""

schema = (extractor.create_schema()
    .entities(["company", "date", "duration", "fee"])
    .classification("contract_type", ["service", "employment", "nda", "partnership"])
    .structure("contract_terms")
        .field("parties", dtype="list")
        .field("effective_date", dtype="str")
        .field("monthly_fee", dtype="str")
        .field("term_length", dtype="str")
        .field("renewal", dtype="str", choices=["automatic", "manual", "none"])
        .field("termination_notice", dtype="str")
)

results = extractor.extract(contract_text, schema)

print(results)
# Output: {
#     'entities': {
#         'company': ['TechCorp LLC', 'DataSystems Inc.'],
#         'date': ['January 1, 2024'],
#         'duration': ['24 months'],
#         'fee': ['$15,000']
#     },
#     'contract_type': 'service',
#     'contract_terms': [{
#         'parties': ['TechCorp LLC', 'DataSystems Inc.'],
#         'effective_date': 'January 1, 2024',
#         'monthly_fee': '$15,000',
#         'term_length': '24 months',
#         'renewal': 'automatic',
#         'termination_notice': '30-day written notice'
#     }]
# }
```

## Model Details

- **Model Type:** Bidirectional Transformer Encoder (BERT-based)
- **Parameters:** 340M
- **Input:** Text sequences
- **Output:** Entities, classifications, and structured data
- **Architecture:** Based on GLiNER with multi-task extensions (large variant)
- **Training Data:** Multi-domain datasets for NER, classification, and structured extraction

## Performance

This large model provides:
- Enhanced accuracy on complex extraction tasks
- Better performance on ambiguous or difficult cases
- Improved handling of specialized domains (medical, legal, financial)
- Efficient CPU inference (GPU optional for faster processing)
- Superior multi-task performance

## Use Cases

The large model excels in:
- Medical information extraction
- Legal document analysis
- Financial document processing
- Complex multi-entity scenarios
- High-precision extraction requirements
- Domain-specific applications

## Fine-tuning

This model can be fine-tuned locally with the `gliner2` trainer (see the [training guide](https://github.com/fastino-ai/GLiNER2#-training-custom-models)). To fine-tune or serve it without managing GPUs, the [Fastino API](https://agent.fastino.ai) offers hosted training and inference, usually faster than training locally.

## Citation

If you use this model in your research, please cite:

```bibtex
@misc{zaratiana2025gliner2efficientmultitaskinformation,
      title={GLiNER2: An Efficient Multi-Task Information Extraction System with Schema-Driven Interface}, 
      author={Urchade Zaratiana and Gil Pasternak and Oliver Boyd and George Hurn-Maloney and Ash Lewis},
      year={2025},
      eprint={2507.18546},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2507.18546}, 
}
```

## License

This project is licensed under the Apache License 2.0.

## Links

- **Repository:** https://github.com/fastino-ai/GLiNER2
- **Paper:** https://arxiv.org/abs/2507.18546
- **Organization:** [Fastino AI](https://fastino.ai)