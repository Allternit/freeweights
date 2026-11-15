## VibeVoice-ASR
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?logo=github)](https://github.com/microsoft/VibeVoice)
[![Live Playground](https://img.shields.io/badge/Live-Playground-green?logo=gradio)](https://aka.ms/vibevoice-asr)
[![Technical Report](https://img.shields.io/badge/arXiv-2601.18184-b31b1b?logo=arxiv)](https://arxiv.org/pdf/2601.18184)

**VibeVoice-ASR** is a unified speech-to-text model designed to handle **60-minute long-form audio** in a single pass, generating structured transcriptions containing **Who (Speaker), When (Timestamps), and What (Content)**, with support for **Customized Hotwords** and over **50 languages**.

➡️ **Code:** [microsoft/VibeVoice](https://github.com/microsoft/VibeVoice)<br>
➡️ **Demo:** [VibeVoice-ASR-Demo](https://aka.ms/vibevoice-asr)<br>
➡️ **Report:** [VibeVoice-ASR Technical Report](https://arxiv.org/pdf/2601.18184)<br>
➡️ **Finetuning:** [Finetuning](https://github.com/microsoft/VibeVoice/blob/main/finetuning-asr/README.md)<br>
➡️ **vLLM:** [vLLM-VibeVoice-ASR](https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-vllm-asr.md)<br>

<p align="left">
  <img src="figures/VibeVoice_ASR_archi.png" alt="VibeVoice-ASR Architecture" height="250px">
</p>


## 🔥 Key Features


- **🕒 60-minute Single-Pass Processing**:
  Unlike conventional ASR models that slice audio into short chunks (often losing global context), VibeVoice ASR accepts up to **60 minutes** of continuous audio input within 64K token length. This ensures consistent speaker tracking and semantic coherence across the entire hour.

- **👤 Customized Hotwords**:
  Users can provide customized hotwords (e.g., specific names, technical terms, or background info) to guide the recognition process, significantly improving accuracy on domain-specific content.

- **📝 Rich Transcription (Who, When, What)**:
  The model jointly performs ASR, diarization, and timestamping, producing a structured output that indicates *who* said *what* and *when*.
  
- **🌍 Multilingual & Code-Switching Support**:
  It supports over 50 languages, requires no explicit language setting, and natively handles code-switching within and across utterances. Language distribution can be found [here](#language-distribution).



## Evaluation
<p align="center">
  <img src="figures/DER.jpg" alt="DER" width="70%">
  <img src="figures/cpWER.jpg" alt="cpWER" width="70%">
  <img src="figures/tcpWER.jpg" alt="tcpWER" width="70%">
</p>

## Installation and Usage

Please refer to [GitHub README](https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-asr.md#installation).

## Language Distribution
<p align="center">
  <img src="figures/language_distribution_horizontal.png" alt="Language Distribution" width="80%">
</p>

## License
This project is licensed under the MIT License.

## Contact
This project was conducted by members of Microsoft Research. We welcome feedback and collaboration from our audience. If you have suggestions, questions, or observe unexpected/offensive behavior in our technology, please contact us at VibeVoice@microsoft.com.
If the team receives reports of undesired behavior or identifies issues independently, we will update this repository with appropriate mitigations.