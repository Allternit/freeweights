# mlx-community/all-MiniLM-L6-v2-4bit

The Model [mlx-community/all-MiniLM-L6-v2-4bit](https://huggingface.co/mlx-community/all-MiniLM-L6-v2-4bit) was converted to MLX format from [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) using mlx-lm version **0.0.3**.

## Use with mlx

```bash
pip install mlx-embeddings
```

```python
from mlx_embeddings import load, generate
import mlx.core as mx

model, tokenizer = load("mlx-community/all-MiniLM-L6-v2-4bit")

# For text embeddings
output = generate(model, processor, texts=["I like grapes", "I like fruits"])
embeddings = output.text_embeds  # Normalized embeddings

# Compute dot product between normalized embeddings
similarity_matrix = mx.matmul(embeddings, embeddings.T)

print("Similarity matrix between texts:")
print(similarity_matrix)


```
