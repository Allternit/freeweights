# 🎯 General Video Embedder (GVE)

> **One Embedder for All Video Retrieval Scenarios**  
> Queries of text, image, video, or any combination modalities — GVE understands them all for representations, zero-shot, without in-domain training.

GVE is the first video embedding model that **generalizes across 9 abilities, including 3 diverse retrieval tasks and 6 domains** — from coarse text-to-video to fine-grained spatial/temporal queries, composed (text+image) queries, and long-context retrieval — all evaluated on our new **Universal Video Retrieval Benchmark (UVRB)**.

Built on **Qwen2.5-VL** and trained only with LoRA with **13M** collected and synthesized multimodal data, GVE achieves **SOTA zero-shot performance** than competitors.

---

## 🌟 Why GVE?

| Capability | Existing Works | **GVE** |
|-----------|-------------------|--------|
| **Query Flexibility** | Only text | ✅ Text, ✅ Image, ✅ Video, ✅ Text+Image, ✅ Text+Video |
| **Fine-grained Understanding** | Weak on spatial-temporal details | **S: 0.821**, **T: 0.469** (SOTA) |
| **Training Data** | Uses in-domain test data (e.g., MSRVTT) | **Synthesized data** — true zero-shot |
| **Performance** | Unite-7B (8.3B): 55.9 | **GVE-3B (3.8B): 0.571** → **better with half the size**; **GVE-7B (3.8B): 0.600** |

---

## 📊 Performance on UVRB

- TXT: Textual Video Retrieval
- CMP: Composed Video Retrieval
- VIS: Visual Video Retrieval
- CG: Coarse-grained Video Retrieval
- FG: Fine-grained Video Retrieval
- LC: Long-Context Video Retrieval
- S: Spatial Video Retrieval
- T: Temporal Video Retrieval
- PR: Partially Relevant Video Retrieval

> For each column: highest score is **bolded**, second-highest is <u>underlined</u>.

| Model | **AVG** | TXT | CMP | VIS | CG | FG | LC | S | T | PR |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| CLIP4Clip | 0.416 | 0.401 | 0.178 | **0.714** | 0.380 | 0.360 | 0.463 | 0.559 | 0.285 | 0.236 |
| ViCLIP | 0.375 | 0.336 | 0.263 | 0.640 | 0.380 | 0.315 | 0.313 | 0.484 | 0.289 | 0.171 |
| VideoCLIP-XL | 0.510 | 0.550 | 0.227 | 0.632 | <u>0.558</u> | 0.493 | 0.600 | 0.787 | 0.381 | 0.310 |
| LanguageBind | 0.508 | 0.543 | 0.231 | 0.645 | 0.539 | 0.479 | 0.610 | 0.723 | 0.378 | 0.336 |
| InternVideo2-1B | 0.420 | 0.422 | 0.248 | 0.581 | 0.480 | 0.403 | 0.383 | 0.606 | 0.413 | 0.189 |
| InternVideo2-6B | 0.445 | 0.448 | 0.220 | 0.660 | 0.504 | 0.417 | 0.423 | 0.631 | 0.400 | 0.220 |
| GME-2B | 0.416 | 0.539 | **0.345** | 0.597 | 0.461 | 0.471 | 0.685 | 0.716 | 0.349 | 0.347 |
| Unite-2B | 0.507 | 0.536 | 0.242 | 0.654 | 0.455 | 0.471 | 0.681 | 0.725 | 0.347 | 0.341 |
| VLM2Vec-V2 | 0.538 | 0.587 | 0.263 | 0.613 | 0.498 | 0.502 | 0.762 | 0.809 | 0.348 | 0.348 |
| BGE-VL | 0.480 | 0.497 | 0.268 | 0.622 | 0.448 | 0.406 | 0.636 | 0.664 | 0.292 | 0.261 |
| UniME-7B | 0.542 | 0.561 | 0.308 | <u>0.702</u> | 0.500 | 0.518 | 0.664 | 0.785 | 0.396 | 0.373 |
| B3-7B | 0.538 | 0.570 | 0.270 | 0.678 | 0.482 | 0.505 | 0.722 | 0.797 | 0.364 | 0.355 |
| GME-7B | 0.562 | 0.604 | <u>0.341</u> | 0.615 | 0.518 | 0.507 | <u>0.788</u> | 0.749 | 0.373 | 0.398 |
| Unite-7B | 0.559 | 0.609 | 0.254 | 0.666 | 0.541 | 0.539 | 0.746 | 0.779 | 0.412 | **0.425** |
| **GVE-3B** | <u>0.571</u> | <u>0.619</u> | 0.304 | 0.647 | 0.552 | <u>0.541</u> | 0.764 | <u>0.816</u> | <u>0.430</u> | 0.377 |
| **GVE-7B** | **0.600** | **0.657** | 0.312 | 0.657 | **0.587** | **0.570** | **0.814** | **0.821** | **0.469** | <u>0.419</u> |

---

## 🚀 Get Started

1. Loading model

```python
model_path = 'Alibaba-NLP/GVE-7B'
model = AutoModel.from_pretrained(model_path, trust_remote_code=True, device_map='auto', low_cpu_mem_usage=True, torch_dtype=torch.bfloat16)
processor = AutoProcessor.from_pretrained(model_path, trust_remote_code=True, use_fast=True)
processor.tokenizer.padding_side = 'left'
```

2. Processing inputs

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {
        "role": "user",
        "content": [
            {
                "type": "video",
                "video": "./asset/video_example.mp4",
                "max_pixels": 200 * 28 * 28,
                "fps": 1.0,
                "max_frames": 8,
            },
            {"type": "text", "text": "Describe this video."},
        ],
    }
]
texts = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
image_inputs, video_inputs, video_kwargs = process_vision_info(messages, return_video_kwargs=True)
inputs = processor(
    text=[texts],
    images=image_inputs,
    videos=video_inputs,
    padding=True,
    truncation=True,
    max_length=1200,
    return_tensors="pt",
    **video_kwargs,
).to("cuda")
```

3. Embedding

```python
outputs = model(**inputs)
embedding = F.normalize(outputs['last_hidden_state'][:, -1, :], p=2, dim=1)
```

## 📚 Citation

```bibtex
@misc{guo2025gve,
  title={Towards Universal Video Retrieval: Generalizing Video Embedding via Synthesized Multimodal Pyramid Curriculum}, 
  author={Zhuoning Guo and Mingxin Li and Yanzhao Zhang and Dingkun Long and Pengjun Xie and Xiaowen Chu},
  year={2025},
  eprint={2510.27571},
  archivePrefix={arXiv},
  primaryClass={cs.CV},
  url={https://arxiv.org/abs/2510.27571}, 
}
```