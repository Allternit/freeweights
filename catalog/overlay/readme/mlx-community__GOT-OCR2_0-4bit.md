# mlx-community/GOT-OCR2_0-4bit

4-bit MLX quantization of [`stepfun-ai/GOT-OCR2_0`](https://huggingface.co/stepfun-ai/GOT-OCR2_0), the 560M-parameter
OCR-2.0 model. Converted with `mlx-vlm` 0.6.14 (`mlx` 0.32.0) for inference on
Apple Silicon.

Fidelity was measured against the unquantized bf16 source and against the
reference PyTorch implementation, not assumed. Every number below comes from a
run recorded in this card.

> **Requires `mlx-vlm` with GOT-OCR 2.0 support**, which is currently open as
> [Blaizzy/mlx-vlm#1908](https://github.com/Blaizzy/mlx-vlm/pull/1908). The PR is
> **not merged yet**, so a released `mlx-vlm` cannot load this repo.

```bash
python -m mlx_vlm generate \
    --model mlx-community/GOT-OCR2_0-4bit \
    --image document.png \
    --prompt "OCR: " \
    --max-tokens 1024
```

GOT is not a chat model. It takes two instructions: `OCR: ` for plain text and
`OCR with format: ` for structured output (tables, formulas, sheet music). Any
other prompt is out of distribution.

## Quantization

| | |
|---|---|
| Bits | 4 |
| Group size | 64 |
| Mode | affine |
| Effective bits/weight | **6.522** |
| Size on disk | 457 MB |
| Quantized tensors | 169 language-model tensors |
| Vision tower | bf16, unquantized (0 `.scales` under `vision_tower`) |
| Projector | bf16, unquantized |

The effective figure sits well above the nominal 4 because `mlx-vlm`
quantizes only the language model. The vision tower and the projector are
96.7M of the 560.5M parameters, 17%, and stay bf16 by design. Packing checks
out exactly: `U32 x (32/4)` = 463,785,984, the quantized parameter count.

Tied embeddings are 155.5M of those 463.8M, 34%, much higher than in a typical
conversion where the transformer body dominates. They are the worst-hit tensor
in both quantizations, which is what the per-tensor numbers below show.

## Fidelity

### Weight level, against the bf16 source

| | |
|---|---|
| Weight SNR | **20.53 dB** |
| Tensors compared | 169 |
| Parameters compared | 463,785,984 |
| Worst tensor | `embed_tokens` (19.10 dB) |

Exact, prompt-free and hardware-independent: the quantized weights are
dequantized and compared element-wise against the source.

### Against the reference PyTorch implementation

One forward pass, same image and same prompt (the MPT conversation the model was
trained with), comparing the final-position logits over all 151,860 classes.

| Comparison | max abs error | cosine | argmax |
|---|---|---|---|
| MLX bf16 vs torch fp32 | 0.47469 | 0.99979109 | same, top-5 identical |
| MLX fp32 vs torch fp32 | **0.000130** | **1.0000000000** | same |

The second row is the one that matters: the source weights are bf16, so running
the MLX port in fp32 loses nothing, and the residual is porting error alone. The
first row's larger figure is bf16 rounding, not a defect.

### Task level, against ground truth

Six documents rendered locally with exactly known text (invoice, lab report,
shipping label, receipt, spec table, rotated receipt), transcribed with `OCR: `
and scored directly. This sidesteps using bf16 as the reference at all.

| Variant | field | content | numeric | CER vs bf16 | tok/s | peak GB |
|---|---|---|---|---|---|---|
| bf16 | 0.8684 | 0.9605 | 0.9720 | 0 (ref) | 138.3 | 2.50 |
| 8-bit | 0.8684 | 0.9605 | 0.9720 | 0.0000 | 210.8 | 2.06 |
| 4-bit | 0.8947 | 0.9474 | 0.9623 | 0.0116 | 272.9 | 1.83 |

`field` counts required strings present exactly, `content` ignores markup and
whitespace, `numeric` counts ground-truth numbers recovered.

**The 8-bit output is byte-identical to bf16 on all six documents**, down to the
same fields missed.

Two caveats a reader should have:

- **The 4-bit `field` score is higher than bf16 and that is not an improvement.**
  The denominator is 38 strings, so one string is 0.026. 4-bit happens to get the
  invoice fully right and then loses `12.00` on the receipt. `content` and
  `numeric`, which are less format-sensitive, both move the other way. Treat the
  three variants as separated by one or two strings, not by `field`.
- **`shipping_label` loses the same three fields in every variant, bf16
  included** (`1Z-994-AX-77310582`, `Halberd Components`, `3011AB`). That is a
  limit of the source model on that document, not a quantization effect.

Throughput measured on an M-series Mac during the same run, single image,
generation only.

## What was not measured

- **Only the plain 1024x1024 single-crop path.** GOT's fine-grained mode (region
  by box or by colour), its multi-crop path for dense pages, and its multi-page
  mode are not exercised by anything above.
- **`OCR with format: ` was not scored.** The accuracy table uses `OCR: ` only.
  Format mode was smoke-tested and runs, but no ground-truth scoring was done for
  tables, formulas or sheet music.
- **No perplexity, top-1 agreement or KL.** GOT only emits transcriptions, so
  generic passages give meaningless perplexity. The ground-truth OCR scoring
  above replaces that layer rather than supplementing it.
- **Six synthetic documents, one language.** They are rendered, not photographed,
  and English only. Real scans, handwriting and the multilingual claims of the
  source are untested here.
- **No accuracy measurement at long context.** Everything ran well under the
  32k window.

## Related

- [`mlx-community/GOT-OCR2_0-bf16`](https://huggingface.co/mlx-community/GOT-OCR2_0-bf16)
- [`mlx-community/GOT-OCR2_0-8bit`](https://huggingface.co/mlx-community/GOT-OCR2_0-8bit)
- [`mlx-community/GOT-OCR2_0-4bit`](https://huggingface.co/mlx-community/GOT-OCR2_0-4bit)

Source model: [`stepfun-ai/GOT-OCR2_0`](https://huggingface.co/stepfun-ai/GOT-OCR2_0) ([paper](https://arxiv.org/abs/2409.01704)).
