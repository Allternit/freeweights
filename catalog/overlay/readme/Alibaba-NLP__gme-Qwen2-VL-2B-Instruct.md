<p align="center">
  <img src="images/gme_logo.png" alt="GME Logo" style="width: 100%; max-width: 450px;">
</p>

<p align="center"><b>GME: General Multimodal Embedding</b></p>

## GME-Qwen2-VL-2B

We are excited to present `GME-Qwen2VL` series of unified **multimodal embedding models**,
which are based on the advanced [Qwen2-VL](https://huggingface.co/collections/Qwen/qwen2-vl-66cee7455501d7126940800d) multimodal large language models (MLLMs).

The `GME` models support three types of input: **text**, **image**, and **image-text pair**, all of which can produce universal vector representations and have powerful retrieval performance.

**Key Enhancements of GME Models**:

- **Unified Multimodal Representation**: GME models can process both single-modal and combined-modal inputs, resulting in a unified vector representation. This enables versatile retrieval scenarios (Any2Any Search), supporting tasks such as text retrieval, image retrieval from text, and image-to-image searches.
- **High Performance**: Achieves state-of-the-art (SOTA) results in our universal multimodal retrieval benchmark (**UMRB**) and demonstrate strong evaluation scores in the Multimodal Textual Evaluation Benchmark (**MTEB**).
- **Dynamic Image Resolution**: Benefiting from `Qwen2-VL` and our training data, GME models support dynamic resolution image input.
- **Strong Visual Retrieval Performance**: Enhanced by the Qwen2-VL model series, our models excel in visual document retrieval tasks that require a nuanced understanding of document screenshots.
  This capability is particularly beneficial for complex document understanding scenarios,
  such as multimodal retrieval-augmented generation (RAG) applications focused on academic papers.

**Developed by**: Tongyi Lab, Alibaba Group

**Paper**: [GME: Improving Universal Multimodal Retrieval by Multimodal LLMs](http://arxiv.org/abs/2412.16855)


## Model List
| Models | Model Size | Max Seq. Length | Dimension | MTEB-en| MTEB-zh | UMRB |
|:-----: | :-----: |:-----: |:-----: |:-----: | :-----: | :-----: |
|[`gme-Qwen2-VL-2B`](https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-2B-Instruct) | 2.21B | 32768 | 1536 | 65.27 | 66.92 | 64.45 |
|[`gme-Qwen2-VL-7B`](https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-7B-Instruct) | 8.29B | 32768 | 3584 | 67.48 | 69.73 | 67.44 |

## Usage 


**Transformers**

The remote code has some issues with `transformers>=4.52.0`, please downgrade or use `sentence_transformers`

```python
from transformers import AutoModel
from transformers.utils.versions import require_version


require_version(
    "transformers<4.52.0",
    "The remote code has some issues with transformers>=4.52.0, please downgrade: pip install transformers==4.51.3"
)


t2i_prompt = 'Find an image that matches the given text.'
texts = [
    "The Tesla Cybertruck is a battery electric pickup truck built by Tesla, Inc. since 2023.",
    "Alibaba office.",
]
images = [
    'https://upload.wikimedia.org/wikipedia/commons/e/e9/Tesla_Cybertruck_damaged_window.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/TaobaoCity_Alibaba_Xixi_Park.jpg',
]


gme = AutoModel.from_pretrained(
    "Alibaba-NLP/gme-Qwen2-VL-2B-Instruct",
    torch_dtype="float16", device_map='cuda', trust_remote_code=True
)


# Single-modal embedding
e_text = gme.get_text_embeddings(texts=texts)
e_image = gme.get_image_embeddings(images=images)
print('Single-modal', (e_text @ e_image.T).tolist())
## Single-modal [[0.359619140625, 0.0655517578125], [0.04180908203125, 0.374755859375]]

# How to set embedding instruction
e_query = gme.get_text_embeddings(texts=texts, instruction=t2i_prompt)
# If is_query=False, we always use the default instruction.
e_corpus = gme.get_image_embeddings(images=images, is_query=False)
print('Single-modal with instruction', (e_query @ e_corpus.T).tolist())
## Single-modal with instruction [[0.429931640625, 0.11505126953125], [0.049835205078125, 0.409423828125]]

# Fused-modal embedding
e_fused = gme.get_fused_embeddings(texts=texts, images=images)
print('Fused-modal', (e_fused @ e_fused.T).tolist())
## Fused-modal [[1.0, 0.05511474609375], [0.05511474609375, 1.0]]
```


**sentence_transformers**

The `encode` function accept `str` or `dict` with key(s) in `{'text', 'image', 'prompt'}`.

**Do not pass `prompt` as the argument to `encode`**, pass as the input as a `dict` with a `prompt` key.

```python
from sentence_transformers import SentenceTransformer


t2i_prompt = 'Find an image that matches the given text.'
texts = [
    "The Tesla Cybertruck is a battery electric pickup truck built by Tesla, Inc. since 2023.",
    "Alibaba office.",
]
images = [
    'https://upload.wikimedia.org/wikipedia/commons/e/e9/Tesla_Cybertruck_damaged_window.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/TaobaoCity_Alibaba_Xixi_Park.jpg',
]


gme_st = SentenceTransformer("Alibaba-NLP/gme-Qwen2-VL-2B-Instruct")

# Single-modal embedding
e_text = gme_st.encode(texts, convert_to_tensor=True)
e_image = gme_st.encode([dict(image=i) for i in images], convert_to_tensor=True)
print('Single-modal', (e_text @ e_image.T).tolist())
## Single-modal [[0.356201171875, 0.06536865234375], [0.041717529296875, 0.37890625]]

# How to set embedding instruction
e_query = gme_st.encode([dict(text=t, prompt=t2i_prompt) for t in texts], convert_to_tensor=True)
# If no prompt, we always use the default instruction.
e_corpus = gme_st.encode([dict(image=i) for i in images], convert_to_tensor=True)
print('Single-modal with instruction', (e_query @ e_corpus.T).tolist())
## Single-modal with instruction [[0.425537109375, 0.1158447265625], [0.049835205078125, 0.413818359375]]

# Fused-modal embedding
e_fused = gme_st.encode([dict(text=t, image=i) for t, i in zip(texts, images)], convert_to_tensor=True)
print('Fused-modal', (e_fused @ e_fused.T).tolist())
## Fused-modal [[0.99951171875, 0.0556640625], [0.0556640625, 0.99951171875]]
```



## Evaluation

We validated the performance on our universal multimodal retrieval benchmark (**UMRB**, see [Release UMRB](https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-7B-Instruct/discussions/2)) among others.

|                    |      | Single-modal |           | Cross-modal |             |           | Fused-modal |            |            |             |  Avg.      |
|--------------------|------|:------------:|:---------:|:-----------:|:-----------:|:---------:|:-----------:|:----------:|:----------:|:-----------:|:----------:|
|                    |      | T→T (16)     |  I→I (1)  |  T→I (4)    |  T→VD (10)  |  I→T (4)  |  T→IT (2)   |  IT→T (5)  |  IT→I (2)  |  IT→IT (3)  |  (47)      |
| VISTA              | 0.2B | 55.15        | **31.98** | 32.88       | 10.12       | 31.23     | 45.81       | 53.32      | 8.97       | 26.26       | 37.32      |
| CLIP-SF            | 0.4B | 39.75        | 31.42     | 59.05       | 24.09       | 62.95     | 66.41       | 53.32      | 34.9       | 55.65       | 43.66      |
| One-Peace          | 4B   | 43.54        | 31.27     | 61.38       | 42.9        | 65.59     | 42.72       | 28.29      | 6.73       | 23.41       | 42.01      |
| DSE                | 4.2B | 48.94        | 27.92     | 40.75       | 78.21       | 52.54     | 49.62       | 35.44      | 8.36       | 40.18       | 50.04      |
| E5-V               | 8.4B | 52.41        | 27.36     | 46.56       | 41.22       | 47.95     | 54.13       | 32.9       | 23.17      | 7.23        | 42.52      |
| **[GME-Qwen2-VL-2B](https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-2B-Instruct)** | 2.2B | 55.93 | 29.86	| 57.36	| 87.84	| 61.93 |	76.47	| 64.58	 | 37.02	| 66.47 | 64.45 |
| **[GME-Qwen2-VL-7B](https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-7B-Instruct)** | 8.3B | **58.19** | 31.89 | **61.35** | **89.92** | **65.83** | **80.94** | **66.18** | **42.56** | **73.62** | **67.44** |

The [MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard) English tab shows the text embeddings performence of our model.

**More detailed experimental results can be found in the [paper](http://arxiv.org/abs/2412.16855)**.

## Community support

### Fine-tuning

GME models can be fine-tuned by SWIFT：

```shell
pip install ms-swift -U
```

```shell
# MAX_PIXELS settings to reduce memory usage
# check: https://swift.readthedocs.io/en/latest/BestPractices/Embedding.html
nproc_per_node=8
MAX_PIXELS=1003520 \
USE_HF=1 \
NPROC_PER_NODE=$nproc_per_node \
swift sft \
    --model Alibaba-NLP/gme-Qwen2-VL-2B-Instruct \
    --train_type lora \
    --dataset 'HuggingFaceM4/TextCaps:emb' \
    --torch_dtype bfloat16 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 2 \
    --per_device_eval_batch_size 2 \
    --gradient_accumulation_steps $(expr 64 / $nproc_per_node) \
    --eval_steps 100 \
    --save_steps 100 \
    --eval_strategy steps \
    --save_total_limit 5 \
    --logging_steps 5 \
    --output_dir output \
    --lazy_tokenize true \
    --warmup_ratio 0.05 \
    --learning_rate 5e-6 \
    --deepspeed zero3 \
    --dataloader_num_workers 4 \
    --task_type embedding \
    --loss_type infonce \
    --dataloader_drop_last true
```


## Limitations

- **Single Image Input**: In `Qwen2-VL`, an image could be converted into a very large number of visual tokens. We limit the number of visual tokens to 1024 to obtain a good training efficiency.
Due to the lack of relevant data, our models and evaluations retain one single image.
- **English-only Training**: Our models are trained on english data only. Although the `Qwen2-VL` models are multilingual, the multilingual-multimodal embedding performance are not guaranteed.

We will extend to multi-image input, image-text interleaved data as well as multilingual data in the future version.

## Redistribution and Use

We encourage and value diverse applications of GME models and continuous enhancements to the models themselves.

- If you distribute or make GME models (or any derivative works) available, or if you create a product or service (including another AI model) that incorporates them, you must prominently display `Built with GME` on your website, user interface, blog post, About page, or product documentation.

- If you utilize GME models or their outputs to develop, train, fine-tune, or improve an AI model that is distributed or made available, you must prefix the name of any such AI model with `GME`.

## Cloud API Services

In addition to the open-source [GME](https://huggingface.co/collections/Alibaba-NLP/gme-models-67667e092da3491f630964d6) series models, GME series models are also available as commercial API services on Alibaba Cloud.

- [MultiModal Embedding Models](https://help.aliyun.com/zh/model-studio/developer-reference/multimodal-embedding-api-reference?spm=a2c4g.11186623.0.0.321c1d1cqmoJ5C): The `multimodal-embedding-v1` model service is available.

Note that the models behind the commercial APIs are not entirely identical to the open-source models.

## Hiring

We have open positions for Research Interns and Full-Time Researchers to join our team at Tongyi Lab. 
We are seeking passionate individuals with expertise in representation learning, LLM-driven information retrieval, Retrieval-Augmented Generation (RAG), and agent-based systems. 
Our team is located in the vibrant cities of Beijing and Hangzhou, offering a collaborative and dynamic work environment where you can contribute to cutting-edge advancements in artificial intelligence and machine learning.
If you are driven by curiosity and eager to make a meaningful impact through your work, we would love to hear from you. Please submit your resume along with a brief introduction to <a href="mailto:dingkun.ldk@alibaba-inc.com">dingkun.ldk@alibaba-inc.com</a>.

## Citation
If you find our paper or models helpful, please consider cite:

```
@misc{zhang2024gme,
      title={GME: Improving Universal Multimodal Retrieval by Multimodal LLMs}, 
      author={Zhang, Xin and Zhang, Yanzhao and Xie, Wen and Li, Mingxin and Dai, Ziqi and Long, Dingkun and Xie, Pengjun and Zhang, Meishan and Li, Wenjie and Zhang, Min},
      year={2024},
      eprint={2412.16855},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={http://arxiv.org/abs/2412.16855}, 
}
```
