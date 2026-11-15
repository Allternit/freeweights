# OLMoASR

OLMoASR is a series of English automatic speech recognition (ASR) models proposed in the [OLMoASR: Open Models and Data for Training Robust Speech Recognition Models](https://github.com/allenai/OLMoASR.git)
paper by Huong Ngo et al. from Ai2. Trained on 440K hours of weakly-supervised audio-text pairs collected from the public internet, OLMoASR demonstrates strong robustness and zero-shot capabilities. Visit the 
[OLMoASR repository](https://github.com/allenai/OLMoASR.git) for access to data processing, training and evaluation code.

# Model Details
OLMoASR uses a Transformer-based encoder-decoder architecture and is an audio language model (LM), where there is an audio encoder and language decoder.
OLMoASR has 5 different model sizes and all checkpoints are trained with English-only data. Below is a table enumerating the different model sizes and associated parameter count.

| Size      | Parameters |
|-----------|------------|
| tiny      | 39 M       |
| base      | 74 M       |
| small     | 244 M      |
| medium    | 769 M      |
| large     | 1.5 B     |
| large-v2  | 1.5 B     |

# Training Data
OLMoASR is trained on 440K hours of weakly-supervised data subsampled from OLMoASR-Mix, a filtered version of [OLMoASR-Pool](link).
OLMoASR-Mix is a collection 1M hours of audio-text pairs, curated from the 3M hours of OLMoASR-Pool.

# Usage

To perform transcription, you can run
```
import olmoasr

model = olmoasr.load_model("medium", inference=True)
result = model.transcribe("audio.mp3")
print(result)
```

# Evaluation
To perform evaluation, you can visit the [OLMoASR repository](https://github.com/allenai/OLMoASR.git) for more details. 

# License 
This model is licensed under Apache 2.0. It is intended for research and educational use in accordance with [Ai2's Responsible Use Guidelines](https://allenai.org/responsible-use).
# BibTeX entry and citation info
```
@misc{ngo2025olmoasropenmodelsdata,
      title={OLMoASR: Open Models and Data for Training Robust Speech Recognition Models}, 
      author={Huong Ngo and Matt Deitke and Martijn Bartelds and Sarah Pratt and Josh Gardner and Matt Jordan and Ludwig Schmidt},
      year={2025},
      eprint={2508.20869},
      archivePrefix={arXiv},
      primaryClass={cs.SD},
      url={https://arxiv.org/abs/2508.20869}, 
}
```