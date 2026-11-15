# mlx-community/PaddleOCR-VL-1.6-5bit

5-bit MLX quantization of
[`PaddlePaddle/PaddleOCR-VL-1.6`](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6), a 958M-parameter OCR /
document-parsing VLM. Converted with `mlx-vlm` 0.6.10 (`mlx` 0.32.0) for
inference on Apple Silicon.

Fidelity was measured against the unquantized bf16 source, not assumed. The
numbers below and the method that produced them are in the tables that follow.

```bash
pip install mlx-vlm
python -m mlx_vlm generate \
    --model mlx-community/PaddleOCR-VL-1.6-5bit \
    --image document.png \
    --prompt "Transcribe this document to markdown." \
    --max-tokens 512
```

## Quantization

| | |
|---|---|
| Bits | 5 |
| Group size | 64 |
| Mode | affine |
| Effective bits/weight | **7.065** |
| Size on disk | 0.75 GB |
| Quantized tensors | 212 (128 language model + 84 vision tower) |
| Unquantized tensors | 712 (scales, biases, norms, embeddings, bf16) |

Unlike most `mlx-vlm` conversions, the vision tower **is** quantized here:
`visual.*` carries 84 `.scales` entries (27 qkv + 27 out_proj + 27 fc1 +
position_embedding + 2 projector linears). The effective figure still exceeds
5 because the language model also keeps its embeddings, layernorms and the
group-64 scales/biases in bf16.

## Measured fidelity

Weight-level metrics compare dequantized weights against the bf16 source tensor
by tensor, streamed from disk. No prompts, no sampling, hardware-independent.
27 fused `visual.layers.N.self_attn.qkv` tensors (source keeps q/k/v separate)
are excluded -- they cannot be compared as single tensors; all other 185
quantized tensors are.

| Variant | bpw | SNR | Relative L2 | Cosine | Decode tok/s | Peak RAM |
|---|---|---|---|---|---|---|
| 4-bit | 6.214 | 18.88 dB | 11.4% | 0.993542 | 455.5 | 0.785 GB |
| 5-bit | 7.065 | 24.2 dB | 6.2% | 0.9981 | 385.8 | 0.881 GB |
| bf16 (source) | 16 | n/a | n/a | n/a | 192.0 | 1.856 GB |

Measured on an M2 Pro / 32 GB, greedy decoding.

## OCR accuracy vs ground truth

Because OCR has *ground truth*, transcription can be scored directly rather
than inferred from token distributions. Six documents were rendered locally
with exactly known content (invoice, clinical lab report, shipping label,
receipt, motor-controller datasheet, and a second receipt rendered **rotated
8 degrees** to simulate a skewed photo scan), covering tabular line items,
currency, dates, identifiers and an image-quality stressor. 76 required fields
across the six.

| Variant | Field accuracy | Content accuracy | Numeric recall | CER vs bf16 |
|---|---|---|---|---|
| 4-bit | 1.0 | 1.0 | 1.0 | 0.0965 |
| 5-bit | 0.9474 | 0.9474 | 0.9216 | 0.1865 |
| bf16 (source) | 0.9605 | 0.9737 | 0.9792 | 0.0000 |

- **Field accuracy**: required strings present, exact match (format-sensitive).
- **Content accuracy**: the same, ignoring markup and whitespace.
- **Numeric recall**: ground-truth numbers present, ignoring markup. For an
  invoice or a datasheet the numbers *are* the payload.

### The 4-bit-vs-5-bit ordering is template drift, not a fidelity ranking

At 4 bits the variant transcribes all six documents perfectly; at 5 bits it
confabulates tables on two of them (`Item | Qty | Unit | Amount` with duplicated
amounts on the invoice, a hallucinated `Name | Name / **Individuals** | **102**`
header on the lab report). The bf16 source itself is not exempt: it drops
`24.00` and `16.00` on the invoice and concatenates `PRIORITYOVERNIGHT`.

**This is template selection, verified, not assumed.** Four controlled checks
were run before publishing:

1. **The bf16 control is byte-identical to the unquantized HF source** on all
   six documents (loaded directly from the Hub, same mlx-vlm code path, greedy).
   The control is faithful — its field score *is* the base model.
2. **All three variants agree on the first token's input** (pixel values
   byte-identical) and diverge at the *first generated token*: the greedy path
   commits to a document template (markdown table vs plain lines) immediately,
   and a template mismatch costs whole fields, not characters.
3. **The base model can produce the "perfect" transcript when steered**: the
   bf16 control with the prompt "plain text, line by line, no tables" scores
   0.987 (it was 0.961 before) — the content was always
   there, the default template was hiding it.
4. **The ranking is not stable across prompts**, which is the whole point: a
   real quality difference would survive a prompt change, and this one does not.

| Prompt | 4-bit | 5-bit | bf16 |
|---|---|---|---|
| default ("markdown") | 1.0 | 0.9474 | 0.9605 |
| "plain text, no tables" | 1.0 | 0.9868 | 0.9868 |
| "markdown table" | 0.8816 | 0.9079 | 0.8816 |

Three prompts, three different orderings: the 4-bit wins only under the default
prompt, the 5-bit wins only under "markdown table", and under the steering
prompt they tie within one field (`PRIORITYOVERNIGHT` against
`PRIORITY OVERNIGHT`, a single dropped space in one document).

So the OCR ordering is **not a quality ranking**: greedy decoding is a
discontinuous function of the weights, and quantization noise flips the template
commitment at token 0 in a direction that is uncorrelated with bit width. The
weight-level table above is the reliable ordering -- 5-bit reconstructs the
source strictly better (24.2 dB vs 18.9 dB, the expected ~6 dB per bit). Six
synthetic documents are too small a sample to rank variants on the OCR layer;
treat the per-doc detail below rather than the aggregate as the signal.

Per-document field accuracy (missed fields in parentheses):

| Doc | 4-bit | 5-bit | bf16 |
|---|---|---|---|
| invoice | 1.0 | 0.75 (`4471`, `2026-03-14`, `Northwind Trading`) | 0.8333 (`24.00`, `16.00`) |
| lab_report | 1.0 | 0.9286 (`2026-01-07`) | 1.0 |
| shipping_label | 1.0 | 1.0 | 0.8889 (`PRIORITY OVERNIGHT`) |
| receipt | 1.0 | 1.0 | 1.0 |
| spec_table | 1.0 | 1.0 | 1.0 |
| rotated_receipt | 1.0 | 1.0 | 1.0 |

The rotated receipt (8 degrees, simulated photo) does not break any variant at
the default prompt — 4-bit keeps all 14 fields there too.

## What was not measured

- **No distributional metrics (perplexity, top-1 agreement, KL).** This is an
  OCR specialist; on plain chat text the bf16 source itself degenerates (asked
  for the capital of Japan it starts an unrelated derivation, and arithmetic
  prompts produce incoherent output), so an aggregate over ordinary prose would
  measure domain mismatch in the source, not quantization error.
- **No standard OCR benchmark.** No OmniDocBench, no DocVQA, no CER against a
  public dataset. The six documents are synthetic and rendered with a default
  font: exact ground truth, but not photographs, not handwriting, and not
  non-Latin scripts. The 8-degree rotation covers skewed scans in one
  controlled case, not the full variety.
- **No judged quality**, no layout-structure scoring (reading order, cell
  spanning), no throughput figures for any chip other than an M2 Pro.
- The 27 fused QKV tensors of the vision tower are not in the weight-level
  comparison (no single source tensor to compare them against).

## Sibling variants

| Variant | bpw | OCR fields | Size |
|---|---|---|---|
| [PaddleOCR-VL-1.6-4bit](https://huggingface.co/mlx-community/PaddleOCR-VL-1.6-4bit) | 6.214 | 1.0 | 0.68 GB |
| [PaddleOCR-VL-1.6-5bit](https://huggingface.co/mlx-community/PaddleOCR-VL-1.6-5bit) | 7.065 | 0.9474 | 0.75 GB |

## Credits

All credit for the underlying model belongs to
[PaddlePaddle](https://huggingface.co/PaddlePaddle). This is a format
conversion and quantization; no training or fine-tuning was performed. See the
[source model card](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6) for license, intended use
and limitations.
