# K2-Horizon-7B oQ6e

oQ6e (imatrix-enhanced mixed-precision 6-bit) conversion of [IFM/K2-Horizon-7B](https://huggingface.co/IFM/K2-Horizon-7B), a dense reasoning model from the K2 Horizon family (7B parameters, 512K context).

**Upstream model:** [IFM/K2-Horizon-7B](https://huggingface.co/IFM/K2-Horizon-7B) by the IFM Team, released under Apache-2.0.

**Conversion:** Quantized to MLX format using [Hermes Agent](https://hermes-agent.nousresearch.com) with `mlx-lm` and `oMLX`.

## Quickstart

```bash
pip install -U mlx-lm

python3 -m mlx_lm.generate   --model hermitdave/K2-Horizon-7B-oQ6e   --prompt "Explain why long-context evaluation is difficult."   --max-tokens 512 --temp 1.0 --top-p 0.95
```

## Reasoning

K2-Horizon is a reasoning model. Always use `reasoning_effort="high"` for best results:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")
response = client.chat.completions.create(
    model="hermitdave/K2-Horizon-7B-oQ6e",
    messages=[{"role": "user", "content": "Explain quantum entanglement."}],
    extra_body={"chat_template_kwargs": {"reasoning_effort": "high"}},
)
print("Reasoning:", getattr(response.choices[0].message, "reasoning_content", None))
print("Answer:", response.choices[0].message.content)
```

## Benchmark Results

| Benchmark | K2-Horizon-7B |
|-----------|--------------|
| SWE-bench Verified | **70.6** |
| Terminal-Bench 2.1 | **39.06** |
| tau3-Banking | **25.8** |
| BrowseComp | **59.0** |
| HMMT Feb 2026 | **73.3** |

Scores in %. See [model card](https://huggingface.co/IFM/K2-Horizon-7B) for full results.

## oMLX Patch

K2-Horizon requires oMLX v0.6.4+ with the [K2-Horizon support patch (PR #3441)](https://github.com/jundot/omlx/pull/3441). This patch adds:

- `k2_horizon` model type support
- Reasoning content handling (`<ifm|think>` tags)
- Tool call parsing (plain text and XML formats)
- Multi-turn conversation support

Without this patch, oMLX will refuse to load K2-Horizon models with `ValueError: Model type k2_horizon not supported`.

## Chat Template

K2-Horizon uses IFM's custom chat template with reasoning and tool calling support. Key tags:

| Tag | Purpose |
|-----|---------|
| `<ifm\|think>`, `<ifm\|think_fast>`, `<ifm\|think_faster>` | Thinking blocks |
| `<\|ifm\|im_start|>`, `<\|ifm\|im_end\|>` | Message delimiters |
| `<ifm\|tool_call>`, `<ifm\|arg_key>`, `<ifm\|arg_value>` | Tool call structure |

All tags are automatically stripped by oMLX before responses reach users.

## Citation

```bibtex
@misc{k2horizon2026,
  title  = {Introducing K2 Horizon: Frontier Performance, Radically Open},
  author = {{IFM Team}},
  year   = {2026},
  url    = {https://ifm.ai/blog/k2/},
}
```

## License

Apache-2.0 (same as upstream).
