# Qwen3.8-3.6-27B-blend

**Unofficial JetBrains derivative.** This model was prepared by JetBrains using Qwen models developed by Alibaba Cloud. This release is not affiliated with, sponsored by, or endorsed by Alibaba Cloud or Alibaba Group.

[![Coding quality versus output tokens: tasks completed on JetBrains’ 100-task internal coding benchmark](https://blog.jetbrains.com/wp-content/uploads/2026/09/jbr-tradeoff-2.png)](https://blog.jetbrains.com/junie/2026/09/smarter-local-al/)

*Tasks completed versus output tokens on JetBrains’ 100-task internal coding benchmark. Reasoning settings differ between configurations; see the article for methodology and context.*

Read [Making Local AI Smarter and Faster](https://blog.jetbrains.com/junie/2026/09/smarter-local-al/) for the Junie Local release story, coding evaluations, token-efficiency results, and MTP runtime experiments. 

Available formats: [BF16](https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend) · [GGUF](https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF) · [MLX 4-bit](https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit) · [MTP MLX 4-bit](https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit) · [DFlash2 drafter](https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-DFlash2).

This model is a 50/50 combination of Qwen3.6-27B and Qwen3.8-27B, created by linearly interpolating their checkpoint parameters. The configuration, tokenizer, processor, and chat template are retained from Qwen3.8-27B. Exact source revisions and merge settings are recorded in [merge-manifest.json](merge-manifest.json).

The interpolation uses float32 accumulation.

```text
0.5 * Qwen/Qwen3.6-27B + 0.5 * Qwen/Qwen3.8-27B
```

- `Qwen/Qwen3.6-27B` revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`
- `Qwen/Qwen3.8-27B` revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`

## DFlash2 draft model

This repository bundles a DFlash2 draft model for this blend under [`DFlash2/`](DFlash2/) — the same weights as [JetBrains/Qwen3.8-3.6-27B-blend-DFlash2](https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-DFlash2), fine-tuned from the public [Qwen 3.8 DFlash2 drafter](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2) on Junie coding trajectories. `DFlash2/` is a standalone draft checkpoint (verified by the target during speculative decoding); it is not part of the target model. See the standalone repository for documentation and serving examples.

## License and attribution

Distributed under the Apache License, Version 2.0. The original Qwen [LICENSE](LICENSE), including `Copyright 2026 Alibaba Cloud`, is retained unchanged.

Copyright © 2026 JetBrains s.r.o. This notice applies only to original material contributed by JetBrains. Upstream Qwen material remains subject to its original copyright and attribution notices.

See [NOTICE](NOTICE) for attribution and [CHANGES.md](CHANGES.md) for a description of the modifications and the affected files.

## Note on acceptable use

This model is distributed under the Apache License, Version 2.0. This notice does not modify the License. Users are reminded that using this model, or its outputs, to infringe the copyright or other intellectual property rights of third parties may violate applicable law, independent of the terms of this License.

## Training and upstream information

No additional training or fine-tuning was performed, and no additional training data was used to create this derivative; its preparation consisted of the checkpoint merge and, where applicable, the extraction, format conversion, and quantization described above and in [CHANGES.md](CHANGES.md).

For upstream information, see the official [Qwen3.6-27B model card](https://huggingface.co/Qwen/Qwen3.6-27B) and [Qwen3.8-27B model card](https://huggingface.co/Qwen/Qwen3.8-27B). Qwen also publishes a [Training Data Summary](https://qwen.ai/training-data-summary), which describes training data for models powering qwen.ai generally; it does not identify the exact training datasets for these two checkpoints.
