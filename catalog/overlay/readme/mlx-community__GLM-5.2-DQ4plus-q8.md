# mlx-community/GLM-5.2-DQ4plus-q8

This model [mlx-community/GLM-5.2-DQ4plus-q8](https://huggingface.co/mlx-community/GLM-5.2-DQ4plus-q8) was converted to MLX format from [zai-org/GLM-5.2](https://huggingface.co/zai-org/GLM-5.2) using mlx-lm version **0.31.3** (with PR #1410).

This is created for people using a single Apple Mac Studio M3 Ultra with 512 GB. The 4-bit version of GLM-5.2 fits comfortably. But we can do better. Using research results, we aim to get better results from a slightly larger and smarter quantization. It should also not be so large that it leaves no memory for a useful context window.

You can find more similar MLX model quants for Apple Mac Studio with 512 GB at https://huggingface.co/bibproj

```bash
pip install mlx-lm

mlx_lm.generate --model mlx-community/GLM-5.2-DQ4plus-q8 --prompt "Hallo"
```

---

## What is this DQ4plus-q8?

In the Arxiv paper [Quantitative Analysis of Performance Drop in DeepSeek Model Quantization](https://arxiv.org/abs/2505.02390) the authors write,

> We further propose `DQ3_K_M`, a dynamic 3-bit quantization method that significantly outperforms traditional `Q3_K_M` variant on various benchmarks, which is also comparable with 4-bit quantization (`Q4_K_M`) approach in most tasks.

and

> dynamic 3-bit quantization method (`DQ3_K_M`) that outperforms the 3-bit quantization implementation in `llama.cpp` and achieves performance comparable to 4-bit quantization across multiple benchmarks.

The resulting multi-bitwidth quantization has been well tested and documented.

---

## How can you create your own DQ4plus-q8 quants?

This time the recipe is a bit different from that of a normal DQ3_K_M. To make to the quant perform better under stress, only the `up` and `gate` expert tensors are quantized to 4-bit, and the `down` expert to a mix of 5-bit and 6-bit. All the other tensors are kept at 8-bit. You could say that this quant has an 8-bit "brain" and 4-bit/5-bit/6-bit experts.

In the `convert.py` file of mlx-lm on your system ( [you can see the original code here](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/convert.py) ), replace the code inside `def mixed_quant_predicate()` with something like

```python
        # Build a mixed quant like "DQ4plus-q8" similar to the "DQ3" of Arxiv paper https://arxiv.org/abs/2505.02390
        #    Quantitative Analysis of Performance Drop in DeepSeek Model Quantization
        q_bits = 8
        # For "switch experts"
        if "switch_mlp.up_proj" in path:
           q_bits = 4
        if "switch_mlp.gate_proj" in path:
           q_bits = 4
        if "switch_mlp.down_proj" in path:
           q_bits = 5
           # Blocks up to 5 are higher quality
           if index < 5:
              q_bits = 6
           # Every 5th block is "medium" quality
           if (index % 5) == 0:
              q_bits = 6
        print("path:", path, "index:", index, "q_bits:", q_bits)
        return {"group_size": group_size, "bits": q_bits, "mode": mode}
```

Then create your GLM-5.2-DQ4plus-q8 quant with

```bash
mlx_lm.convert --hf-path zai-org/GLM-5.2 --mlx-path GLM-5.2-DQ4plus-q8 -q --quant-predicate mixed_3_4
```

---

Enjoy!
