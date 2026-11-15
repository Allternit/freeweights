# mlx-community/parakeet-tdt_ctc-0.6b-ja

This model was converted to MLX format from [nvidia/parakeet-tdt_ctc-0.6b-ja](https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja) using [the conversion script](https://gist.github.com/senstella/77178bb5d6ec67bf8c54705a5f490bed). Please refer to [original model card](https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja) for more details on the model.

## Use with mlx

### parakeet-mlx

```bash
pip install -U parakeet-mlx
```

```bash
parakeet-mlx audio.wav --model mlx-community/parakeet-tdt_ctc-0.6b-ja
```

### mlx-audio

```bash
pip install -U mlx-audio
```

```bash
python -m mlx_audio.stt.generate --model mlx-community/parakeet-tdt_ctc-0.6b-ja --audio audio.wav --output somewhere
```
