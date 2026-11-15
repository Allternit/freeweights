# mlx-community/Unlimited-OCR-2-8bit

[`baidu/Unlimited-OCR-2`](https://huggingface.co/baidu/Unlimited-OCR-2) converted to MLX with
[mlx-vlm](https://github.com/Blaizzy/mlx-vlm): 8-bit affine quantization (group size 64) of the language model. The SAM and CLIP vision towers and the
per-layer DASH router stay in bfloat16.

Refer to the [original model card](https://huggingface.co/baidu/Unlimited-OCR-2) for details on the model.

## Use with mlx-vlm

Unlimited-OCR-2 support (page2d RoPE and DASH block-sparse attention) is being upstreamed to
mlx-vlm. Until it is released, install from the branch that adds it:

```bash
pip install -U "git+https://github.com/shuuul/mlx-vlm.git"
```

```bash
# One page (gundam mode: 1024 global view + up to 16 local crops)
mlx_vlm.generate --model mlx-community/Unlimited-OCR-2-8bit --image page.png \
    --prompt "Multi page parsing." --max-tokens 8192 --temperature 0

# Several pages in one request (one 1024 base view per page)
mlx_vlm.generate --model mlx-community/Unlimited-OCR-2-8bit --image p1.png p2.png \
    --prompt "Multi page parsing." --max-tokens 16384 --temperature 0
```

The output uses `<PAGE>`, `<BLOCK>label[x0, y0, x1, y1]<FORK>text` and `cross_*` / `append_*`
labels for blocks that continue across a page break; the upstream repository ships a converter
to Markdown.
