# UltraData-Code-L2-Classifier

<p align="center">
<a href="https://huggingface.co/collections/openbmb/ultradata">📦 UltraData Collection</a> |
<a href="https://ultradata.openbmb.cn/">🌐 UltraData</a> |
<a href="https://huggingface.co/collections/openbmb/minicpm5">🤗 MiniCPM5 Series</a> |
<a href="https://arxiv.org/pdf/2610.23960">📖 Tech Report</a> |
<a href="https://huggingface.co/datasets/openbmb/UltraData-Code">🤗 UltraData-Code Dataset</a>
</p>

<p align="center">English | <a href="https://huggingface.co/openbmb/UltraData-Code-L2-Classifier/blob/main/README_ZH.md">中文</a></p>

## 📚 Introduction

***UltraData-Code-L2-Classifier*** is a suite of language-specific, file-level scorers designed for the 11 programming languages represented in [UltraData-Code-L1](https://huggingface.co/datasets/openbmb/UltraData-Code).

For each language, we train and apply a dedicated L2 scorer to the corresponding files in UltraData-Code-L1. The selected files form [UltraData-Code-L2](https://huggingface.co/datasets/openbmb/UltraData-Code), a corpus designed to concentrate interpretable computation and problem-solving logic. The resulting L2 corpus contains approximately **400B tokens** and retains approximately **12.23% of L1 files** overall.

## 💡 Highlights

> **Abstract:** Code generation has become a core capability of large language models (LLMs), and code data is central to the pre-training process that develops it. As obtaining public code of sufficient quality becomes more difficult, further progress cannot rely on corpus expansion alone. Tiered data management instead applies increasingly targeted processing to smaller data pools, producing data states suited to different training objectives. Following this perspective, we present **UltraData-Code** as four connected data states spanning repository archival at L0, standardized natural code at L1, algorithmic selection at L2, and task-oriented synthesis at L3. L0 preserves repository data and provenance for reprocessing, while L1 applies scalable filtering, normalization, and near-deduplication for broad pre-training. L2 selects high-quality algorithmically relevant files using language-adaptive relevance signals and quality constraints, yielding approximately 400B tokens of **UltraData-Code-L2** across 11 programming languages for focused continual pre-training. L3 converts selected implementations into structured programming exercises, yielding approximately 150B tokens of **UltraData-Code-L3** across the same 11 languages for task-oriented mid-training or supervised fine-tuning (SFT). Under controlled 10B-token continual pre-training of a 1B model, L2 improves pass@1 over L1 by **7.80** percentage points (pp) on EvalPlus and **5.13pp** on MultiPL-E. Replacing half of the L2 training tokens with L3 yields a further gain of **8.42pp** and **8.07pp** on the two benchmarks, respectively. Both gains increase when the training budget scales to 100B tokens. We have released our datasets and classifiers to support further research on LLMs.

- **A connected code data construction pipeline.** UltraData-Code links repository archival and standardized natural code with selection and structured synthesis, yielding approximately 400B tokens at L2 and 150B tokens at L3 across 11 programming languages. The datasets have been released to facilitate the development of LLMs.
- **Fine-grained curation of algorithmically relevant code.** We develop a language-adaptive selection framework that combines file role supervision with language-specific heuristic cues to learn algorithmic relevance. The framework reuses precomputed semantic embeddings across role, relevance, and quality models, and applies role and quality constraints during selection.
- **Implementation-grounded, task-oriented synthesis.** We introduce a structured synthesis protocol that converts each algorithmically relevant implementation selected by L2 into a programming exercise, jointly generating a standalone task, analysis, solution, and test candidates from the same source implementation. This transformation preserves the source code's computational intent while adding explicit task and solution supervision for code generation.

<div align="center">
  <img src="assets/ultradata-code-l0-l3-overview.png" width="760" alt="UltraData-Code L0-L3 construction pipeline"/>
</div>

## 🔎 L2 Selection Framework

The L2 framework is applied independently to each of the 11 languages in UltraData-Code-L1:

1. **Encode files.** Each file is represented with a 1024-dimensional embedding from [Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B).
2. **Predict file roles.** The role classifier assigns one of `ALGO`, `WEB`, `TOOL`, `DATA`, `TEST`, `CONFIG`, or `EXCLUDE`.
3. **Construct dual-cue supervision.** ALGO role labels are combined with language-specific heuristic evidence to identify algorithmically relevant files beyond the ALGO role alone.
4. **Score relevance and quality.** The relevance model outputs `algo_rel_score`; the quality model outputs `quality_score`.
5. **Calibrate and select.** A language-specific relevance threshold is calibrated on held-out data. A file is retained when it passes the relevance and quality thresholds and is not predicted as `EXCLUDE`.

<div align="center">
  <img src="assets/ultradata-code-l2.png" width="760" alt="UltraData-Code L2 selection framework"/>
</div>

## 📈 Evaluation Results

The 10B-token comparisons use the same 1B foundation model, training settings, decontamination, and evaluation protocol.

**Python results: Algorithmic selection yields the strongest natural code result.** UltraData-Code-L2-py improves the average EvalPlus pass@1 by **17.91 points** over UltraData-Code-L1-py and by **8.46 points** over Stack-Edu-py.

<div align="center">
  <img src="assets/python-training-dynamics.png" alt="Python training dynamics" width="760"/>
</div>

<div align="center">
  <img src="assets/python_results.png" alt="Python main results table" width="900"/>
</div>

**Multilingual results: L2 selection improves over L1 baselines.** UltraData-Code-L2 exceeds UltraData-Code-L1 by **7.80 points** on EvalPlus and **5.13 points** on MultiPL-E, and exceeds Stack-Edu by **4.37** and **3.05 points**, respectively.

<div align="center">
  <img src="assets/multilingual-training-dynamics.png" alt="Multilingual training dynamics" width="760"/>
</div>

<div align="center">
  <img src="assets/multilingual_results.png" alt="Multilingual main results table" width="900"/>
</div>

## 🚀 Usage of UltraData-Code-L2 Classifier

Install the runtime dependencies:

```bash
pip install numpy torch pyarrow
```

### Score embeddings in Python

```python
import sys
sys.path.insert(0, "scripts")
from scorers import LanguageScorers

scorers = LanguageScorers.load("classifiers/cpp")

# float32 [N, 1024]; paths are repository-relative and aligned with embeddings
out = scorers.score(embeddings, paths)
```

Use the matching language directory for each input language. Real repository-relative paths are required by the relevance model.

### Score Parquet files

[`scripts/score_parquet.py`](scripts/score_parquet.py) accepts one Parquet file or recursively walks a directory. Inputs must contain an `embedding` column and either `relative_path` or `meta.file_path`.

```bash
SCORERS=classifiers/cpp
DATA_PATH=data/input
SAVE_PATH=data/output

python scripts/score_parquet.py \
  --scorers ${SCORERS} \
  --input ${DATA_PATH} \
  --output-root ${SAVE_PATH} \
  --batch-size 1024 \
  --device cpu \
  --apply-policy
```

The output mirrors the input directory structure and preserves all existing columns. Use `--describe` to inspect a scorer set, `--limit N` to process at most `N` Parquet files, or `--algo-rel-min`, `--quality-min`, and `--exclude-categories` to override policy values.

### Output fields

The classifier appends the following results to each input file:

```text
category: {Predicted file role}
cls_confidence: {File role confidence}
algo_rel_score: {Algorithmic-relevance score}
quality_score: {Code quality score}
selected: {Whether the file passes the selection policy}
```

- `category` is one of `ALGO`, `WEB`, `TOOL`, `DATA`, `TEST`, `CONFIG`, or `EXCLUDE`.
- `cls_confidence` and `algo_rel_score` range from `0` to `1`; `quality_score` ranges from `0` to `10`.
- `selected` is added only when `--apply-policy` is enabled. It marks rows that pass the relevance threshold, the `EXCLUDE` veto, and the quality threshold; rows are not deleted.

### Notes

- Inputs must use 1024-dimensional embeddings produced by [Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B).
- The relevance scorer also uses the repository-relative path. Use real paths aligned with the embeddings.
- [`config.json`](config.json) provides defaults. Command-line options can override these defaults.
- The scoring script is single-process. For corpus-scale inference, schedule multiple shards or subdirectories externally.

## ❤️ Acknowledgements

This release builds on [Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B), [PyTorch](https://pytorch.org/), [PyArrow](https://arrow.apache.org/docs/python/). Thanks for their awesome work! Open-source contributions make UltraData-Code possible! 🙌

## 💳 License

This project is released under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license.

## 📖 Citation

If you find **UltraData-Code** or this classifier useful, please consider citing:

```bibtex
@article{tu2026ultradata,
  title={{UltraData-Code}: From Raw Repositories to Algorithmically Dense and Task-Oriented Code Data},
  author={Tu, Chengying and Zhao, Hengyu and Xue, Shuaikang and Qu, Zhongming and Zhou, Jihao and Lin, Xinle and Guo, Junshao and Fu, Zixuan and Ma, Qiang and Zhou, Jie and others},
  journal={arXiv preprint arXiv:2610.23960},
  year={2026}
}
```
