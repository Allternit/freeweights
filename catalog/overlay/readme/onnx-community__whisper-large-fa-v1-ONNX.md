# whisper-large-fa-v1 (ONNX)


This is an ONNX version of [vhdm/whisper-large-fa-v1](https://huggingface.co/vhdm/whisper-large-fa-v1). It was automatically converted and uploaded using [this Hugging Face Space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).


## Usage with Transformers.js


See the pipeline documentation for `automatic-speech-recognition`: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline


---


# 📢 vhdm/whisper-large-fa-v1

🎧 **Fine-tuned Whisper Large V3 Turbo for Persian Speech Recognition**

This model is a fine-tuned version of [`openai/whisper-large-v3-turbo`](https://huggingface.co/openai/whisper-large-v3-turbo) trained specifically on high-quality Persian speech data from the [`vhdm/persian-voice-v1`](https://huggingface.co/datasets/vhdm/persian-voice-v1) dataset.

---

## 🧪 Evaluation Results

| Metric | Value |
|--------|-------|
| **Final Validation Loss** | 0.1445 |
| **Word Error Rate (WER)** | **14.07%** |

The model shows consistent improvement over training and reaches a solid WER of ~14% on clean Persian speech data.

---

## 🧠 Model Description

This model aims to bring high-accuracy **automatic speech recognition (ASR)** to Persian language using the Whisper architecture. By leveraging OpenAI's powerful Whisper Large V3 Turbo backbone and carefully curated Persian data, it can transcribe Persian audio with high fidelity.

---

## ✅ Intended Use

This model is best suited for:

- 📱 Transcribing Persian voice notes
- 🗣️ Real-time or batch ASR for Persian podcasts, videos, and interviews
- 🔍 Creating searchable transcripts of Persian audio content
- 🧩 Fine-tuning or domain adaptation for Persian speech tasks

### 🚫 Limitations

- The model is fine-tuned on clean audio from specific sources and may perform poorly on noisy, accented, or dialectal speech.
- Not optimized for real-time streaming ASR (though inference is fast).
- It may occasionally produce hallucinations (incorrect but plausible words), a common issue in Whisper models.

---

## 📚 Training Data

The model was trained on the [`vhdm/persian-voice-v1`](https://huggingface.co/datasets/vhdm/persian-voice-v1) dataset, a curated collection of Persian speech recordings with high-quality transcriptions.

---

## ⚙️ Training Procedure

- **Optimizer**: AdamW (`betas=(0.9, 0.999)`, `eps=1e-08`)
- **Learning Rate**: 1e-5
- **Batch Sizes**: Train - 16 | Eval - 8
- **Scheduler**: Linear with 500 warmup steps
- **Mixed Precision**: Native AMP (automatic mixed precision)
- **Seed**: 42
- **Training Steps**: 5000

---

## ⏱️ Training Time & Hardware

The model was trained using an **NVIDIA H100 GPU**, and the full fine-tuning process took approximately **20 hours**.

---

## 📈 Training Progress

| Step | Training Loss | Validation Loss | WER (%) |
|------|----------------|-----------------|----------|
| 1000 | 0.2190         | 0.2093          | 22.07    |
| 2000 | 0.1191         | 0.1698          | 17.85    |
| 3000 | 0.1051         | 0.1485          | 15.79    |
| 4000 | 0.0644         | 0.1530          | 16.03    |
| 5000 | 0.0289         | 0.1445          | **14.07** |

---

## 🧰 Framework Versions

- `transformers`: 4.52.4  
- `torch`: 2.7.1+cu118  
- `datasets`: 3.6.0  
- `tokenizers`: 0.21.1  

---

## 🚀 Try it out

You can load and test the model using 🤗 Transformers:

```python
from transformers import pipeline

pipe = pipeline("automatic-speech-recognition", model="vhdm/whisper-large-fa-v1")
result = pipe("path_to_persian_audio.wav")
print(result["text"])
