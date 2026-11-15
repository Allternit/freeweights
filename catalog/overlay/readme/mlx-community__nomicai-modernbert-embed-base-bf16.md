# mlx-community/modernbert-embed-base-bf16

The Model [mlx-community/nomicai-modernbert-embed-base-bf16](https://huggingface.co/mlx-community/nomicai-modernbert-embed-base-bf16) was converted to MLX format from [nomic-ai/modernbert-embed-base](https://huggingface.co/nomic-ai/modernbert-embed-base) using mlx-lm version **0.0.3**.

## Use with mlx

```bash
pip install mlx-embeddings
```

```python
from mlx_embeddings import load, generate
import mlx.core as mx

model, tokenizer = load("mlx-community/nomicai-modernbert-embed-base-bf16")

# For text embeddings
output = generate(model, processor, texts=["I like grapes", "I like fruits"])
embeddings = output.text_embeds  # Normalized embeddings

# Compute dot product between normalized embeddings
similarity_matrix = mx.matmul(embeddings, embeddings.T)

print("Similarity matrix between texts:")
print(similarity_matrix)


```
