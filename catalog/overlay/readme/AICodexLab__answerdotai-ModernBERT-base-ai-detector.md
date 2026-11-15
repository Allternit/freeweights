# answerdotai-ModernBERT-base-ai-detector

This model is a fine-tuned version of [answerdotai/ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base) on the AI vs Human Text Classification dataset, [DAIGT V2 Train Dataset](https://www.kaggle.com/datasets/thedrcat/daigt-v2-train-dataset/data).

It achieves the following results on the evaluation set:
- **Validation Loss:** `0.0036`

---

## **📝 Model Description**
This model is based on **ModernBERT-base**, a lightweight and efficient BERT-based model.  
It has been fine-tuned for **AI-generated vs Human-written text classification**, allowing it to distinguish between texts written by **AI models (ChatGPT, DeepSeek, Claude, etc.)** and human authors.  

---

## **🎯 Intended Uses & Limitations**
### ✅ **Intended Uses**
- **AI-generated content detection** (e.g., ChatGPT, Claude, DeepSeek).
- **Text classification** for distinguishing human vs AI-generated content.
- **Educational & Research applications** for AI-content detection.

### ⚠️ **Limitations**
- **Not 100% accurate** → Some AI texts may resemble human writing and vice versa.
- **Limited to trained dataset scope** → May struggle with **out-of-domain** text.
- **Bias risks** → If the dataset contains bias, the model may inherit it.

---

## **📊 Training and Evaluation Data**
- The model was fine-tuned on **35,894 training samples** and **8,974 test samples**.
- The dataset consists of **AI-generated text samples (ChatGPT, Claude, DeepSeek, etc.)** and **human-written samples (Wikipedia, books, articles)**.
- Labels:
  - `1` → AI-generated text
  - `0` → Human-written text

---

## **⚙️ Training Procedure**
### **Training Hyperparameters**
The following hyperparameters were used during training:

| Hyperparameter        | Value                |
|----------------------|--------------------|
| **Learning Rate**    | `2e-5`             |
| **Train Batch Size** | `16`               |
| **Eval Batch Size**  | `16`               |
| **Optimizer**        | `AdamW` (`β1=0.9, β2=0.999, ε=1e-08`) |
| **LR Scheduler**     | `Linear`           |
| **Epochs**          | `3`                |
| **Mixed Precision**  | `Native AMP (fp16)` |

---

## **📈 Training Results**
| Training Loss | Epoch  | Step | Validation Loss |
|--------------|--------|------|----------------|
| 0.0505       | 0.22   | 500  | 0.0214         |
| 0.0114       | 0.44   | 1000 | 0.0110         |
| 0.0088       | 0.66   | 1500 | 0.0032         |
| 0.0          | 0.89   | 2000 | 0.0048         |
| 0.0068       | 1.11   | 2500 | 0.0035         |
| 0.0          | 1.33   | 3000 | 0.0040         |
| 0.0          | 1.55   | 3500 | 0.0097         |
| 0.0053       | 1.78   | 4000 | 0.0101         |
| 0.0          | 2.00   | 4500 | 0.0053         |
| 0.0          | 2.22   | 5000 | 0.0039         |
| 0.0017       | 2.45   | 5500 | 0.0046         |
| 0.0          | 2.67   | 6000 | 0.0043         |
| 0.0          | 2.89   | 6500 | 0.0036         |

---

## **🛠 Framework Versions**
| Library       | Version     |
|--------------|------------|
| **Transformers** | `4.48.3`  |
| **PyTorch**      | `2.5.1+cu124` |
| **Datasets**     | `3.3.2`  |
| **Tokenizers**   | `0.21.0` |

---

## **📤 Model Usage**
To load and use the model for text classification:
```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

model_name = "answerdotai/ModernBERT-base-ai-detector"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Create text classification pipeline
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)

# Run classification
text = "This text was written by an AI model like ChatGPT."
result = classifier(text)

print(result)
```