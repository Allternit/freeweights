# Multilingual Anonymiser OpenPII (Ai4Privacy)

This model is designed to **redact and classify Personally Identifiable Information (PII)** from multilingual text. It has been fine-tuned on the [open-pii-masking-500k-ai4privacy](https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy) dataset and supports multiple languages, including French (fr), English (en), German (de), Telugu (te), Hindi (hi), Italian (it), Spanish (es), and Dutch (nl).

---

## Evaluation Metrics

The table below summarizes the detailed evaluation results per PII label. Metrics are presented as percentages rounded to two decimal places. For the "O" (Non-PII) label, precision, recall, and F1 score are not applicable (n/a) due to the absence of true positives.

| **Label**          | **TP** | **FP** | **FN** | **Accuracy** | **Precision** | **Recall** | **F1 Score** |
|--------------------|:------:|:------:|:------|:------------:|:-------------:|:----------:|:------------:|
| O (Non-PII)        | 0      | 734    | 0      | 98.97%       | n/a           | n/a        | n/a          |
| GIVENNAME          | 6623   | 661    | 352    | 86.73%       | 90.93%        | 94.95%     | 92.90%       |
| SURNAME            | 2786   | 877    | 162    | 72.84%       | 76.06%        | 94.50%     | 84.28%       |
| CITY               | 1763   | 216    | 225    | 79.99%       | 89.09%        | 88.68%     | 88.88%       |
| DATE               | 2195   | 1      | 3      | 99.82%       | 99.95%        | 99.86%     | 99.91%       |
| AGE                | 176    | 7      | 2      | 95.14%       | 96.17%        | 98.88%     | 97.51%       |
| EMAIL              | 2981   | 0      | 0      | 100.0%       | 100.0%        | 100.0%     | 100.0%       |
| CREDITCARDNUMBER   | 601    | 57     | 35     | 86.72%       | 91.34%        | 94.50%     | 92.89%       |
| SEX                | 103    | 45     | 1      | 69.13%       | 69.59%        | 99.04%     | 81.75%       |
| SOCIALNUM          | 364    | 134    | 20     | 70.27%       | 73.09%        | 94.79%     | 82.54%       |
| TIME               | 1631   | 1      | 3      | 99.76%       | 99.94%        | 99.82%     | 99.88%       |
| TELEPHONENUM       | 3537   | 10     | 9      | 99.47%       | 99.72%        | 99.75%     | 99.73%       |
| IDCARDNUM          | 1540   | 314    | 148    | 76.92%       | 83.06%        | 91.23%     | 86.96%       |
| ZIPCODE            | 311    | 39     | 16     | 84.97%       | 88.86%        | 95.11%     | 91.87%       |
| DRIVERLICENSENUM   | 296    | 143    | 26     | 63.66%       | 67.43%        | 91.93%     | 77.79%       |
| PASSPORTNUM        | 482    | 285    | 25     | 60.86%       | 62.84%        | 95.07%     | 75.67%       |
| TITLE              | 224    | 68     | 78     | 60.54%       | 76.71%        | 74.17%     | 75.42%       |
| BUILDINGNUM        | 292    | 45     | 14     | 83.19%       | 86.65%        | 95.42%     | 90.85%       |
| STREET             | 1272   | 155    | 67     | 85.14%       | 89.14%        | 94.99%     | 91.97%       |
| TAXNUM             | 471    | 101    | 34     | 77.72%       | 82.34%        | 93.27%     | 87.47%       |
| GENDER             | 123    | 35     | 9      | 73.65%       | 77.85%        | 93.18%     | 84.83%       |

### Overall Evaluation
- **Accuracy:** 95.03%  
- **Precision:** 87.61%  
- **Recall:** 95.76%  
- **F1 Score:** 91.50%  

- **Total True Positives (TP):** 27,771  
- **Total False Positives (FP):** 3,928  
- **Total False Negatives (FN):** 1,229  

### Macro-Averaged Metrics
- **Accuracy:** 82.17%  
- **Precision:** 80.99%  
- **Recall:** 89.96%  
- **F1 Score:** 84.91%  

---

## Model Behavior & Limitations

- **Evaluation Focus:**  
  The metrics above reflect performance on the test split of the [open-pii-masking-500k-ai4privacy](https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy) dataset. This model both redacts and classifies PII into specific categories (e.g., GIVENNAME, EMAIL). Real-world performance may vary depending on text domain and language, so additional validation is recommended. For support, contact **support@ai4privacy.com**.

- **Strengths:**  
  - High recall (95.76%) ensures most PII is detected.  
  - Exceptional performance on labels like "EMAIL" (100% F1), "DATE" (99.91% F1), and "TIME" (99.88% F1).  

- **Limitations:**  
  - Lower precision for labels such as "PASSPORTNUM" (62.84%) and "DRIVERLICENSENUM" (67.43%), indicating a higher rate of false positives.  
  - The "O" (Non-PII) label has no true positives, making precision, recall, and F1 score not applicable (n/a).  

---

## Disclaimer

This model card details the evaluation metrics and fine-tuning parameters for the multilingual anonymiser with PII classification capabilities. **Please note:**  
- The model is provided **as-is** under the MIT License.  
- It is intended for both redaction and PII classification purposes.  
- Users should thoroughly test and evaluate its performance on their specific datasets before deploying in production environments.

---

*Ai4Privacy – Committed to protecting personal data in the age of AI.*

---