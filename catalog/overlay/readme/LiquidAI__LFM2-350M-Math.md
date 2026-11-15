<center>
<div style="text-align: center;">
  <img 
    src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/2b08LKpev0DNEk6DlnWkY.png" 
    alt="Liquid AI"
    style="width: 100%; max-width: 100%; height: auto; display: inline-block; margin-bottom: 0.5em; margin-top: 0.5em;"
  />
</div>
<div style="display: flex; justify-content: center; gap: 0.5em;">
<a href="https://playground.liquid.ai/"><strong>Try LFM</strong></a> • <a href="https://docs.liquid.ai/lfm/getting-started/welcome"><strong>Docs</strong></a> • <a href="https://leap.liquid.ai/"><strong>LEAP</strong></a> • <a href="https://discord.com/invite/liquid-ai"><strong>Discord</strong></a>
</div>
</center>

<br>

# LFM2-350M-Math

Based on [LFM2-350M](https://huggingface.co/LiquidAI/LFM2-350M), LFM2-350M-Math is a tiny reasoning model designed for tackling tricky math problems. 

You can find more information about other task-specific models in this [blog post](https://www.liquid.ai/blog/introducing-liquid-nanos-frontier-grade-performance-on-everyday-devices).

## 📄 Model details

**Generation parameters**: We strongly recommend using greedy decoding with a `temperature=0.6`, `top_p=0.95`, `min_p=0.1`, `repetition_penalty=1.05`.

**System prompt**: We recommend not using any system prompt.

**Supported languages**: English only.

**Chat template**: LFM2 uses a ChatML-like chat template as follows:

```
<|startoftext|><|im_start|>user
Find the sum of all integer bases $b>9$ for which $17_{b}$ is a divisor of $97_{b}$.<|im_end|>
<|im_start|>assistant
<|cot_start|>First, we need to convert $17_{b}$ and $97_{b}$ into base 10. [...]<|im_end|>
```

You can automatically apply it using the dedicated [`.apply_chat_template()`](https://huggingface.co/docs/transformers/en/chat_templating#applychattemplate) function from Hugging Face transformers.

> [!WARNING]
> ⚠️ The model is intended for single-turn conversations.

## 📈 Performance

Reasoning enables models to better structure their thought process, explore multiple solution strategies, and self-verify their final responses. Augmenting tiny models with extensive test-time compute in this way allows them to even solve challenging competition-level math problems. Our benchmark evaluations demonstrate that LFM2-350M-Math is highly capable for its size.

![68d41660ccb9b4bb78d0ad93_Response Accuracy - dark mode](https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/NTZ7lZPY1CAaSm73zCKHO.png)

As we are excited about edge deployment, our goal is to limit memory consumption and latency. Our post-training recipe leverages reinforcement learning to explicitly bring down response verbosity where it is not desirable. To this end, we combine explicit reasoning budgets with difficulty-aware advantage re-weighting. Please refer to our separate [blog post](https://www.liquid.ai/research/lfm-1b-math-can-small-models-be-concise-reasoners) for a detailed post-training recipe.

![68d4166ef8b3f7322f15c8cb_Response Length - dark mode](https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/74l9X7ZzMmcKUlPRsLobS.png)

## 🏃 How to run

- Hugging Face: [LFM2-350M](https://huggingface.co/LiquidAI/LFM2-350M)
- llama.cpp: [LFM2-350M-Math-GGUF](https://huggingface.co/LiquidAI/LFM2-350M-Math-GGUF)
- LEAP: [LEAP model library](https://leap.liquid.ai/models?model=lfm2-350M-math)

You can use the following Colab notebooks for easy inference and fine-tuning:

| Notebook | Description | Link |
|-------|------|------|
| Inference | Run the model with Hugging Face's transformers library. | <a href="https://colab.research.google.com/drive/1TfLUH1vpIiJE6TdZTlMxhbp95f3BNKaD?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (TRL) | Supervised Fine-Tuning (SFT) notebook with a LoRA adapter using TRL. | <a href="https://colab.research.google.com/drive/1j5Hk_SyBb2soUsuhU0eIEA9GwLNRnElF?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| DPO (TRL) | Preference alignment with Direct Preference Optimization (DPO) using TRL. | <a href="https://colab.research.google.com/drive/1MQdsPxFHeZweGsNx4RH7Ia8lG8PiGE1t?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (Axolotl) | Supervised Fine-Tuning (SFT) notebook with a LoRA adapter using Axolotl. | <a href="https://colab.research.google.com/drive/155lr5-uYsOJmZfO6_QZPjbs8hA_v8S7t?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (Unsloth) | Supervised Fine-Tuning (SFT) notebook with a LoRA adapter using Unsloth. | <a href="https://colab.research.google.com/drive/1HROdGaPFt1tATniBcos11-doVaH7kOI3?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |

## 📬 Contact

- Got questions or want to connect? [Join our Discord community](https://discord.com/invite/liquid-ai)
- If you are interested in custom solutions with edge deployment, please contact [our sales team](https://www.liquid.ai/contact).

## Citation

```
@article{liquidai2025lfm2,
 title={LFM2 Technical Report},
 author={Liquid AI},
 journal={arXiv preprint arXiv:2511.23404},
 year={2025}
}
```