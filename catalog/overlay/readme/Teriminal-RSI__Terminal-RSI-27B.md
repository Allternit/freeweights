# Terminal-RSI-27B

**Terminal-RSI-27B** is a Qwen3.8-27B-based terminal-agent model released by the Terminal-RSI project. It is intended for repository inspection, code editing, dependency repair, scientific workflow reconstruction, and other multi-step tasks that require interaction with an executable environment and verification of the resulting state.

Terminal-RSI alternates **Recursive Self-Rewrite (RSR)** of verified execution trajectories with critic-inheriting **Recursive Policy-Refine (RPR)**. The framework aims to turn successful exploration into reproducible behavior and partial progress into strictly verified task completion.

- **Paper:** [Terminal-RSI: Recursive Self-Improving Terminal Agents via Recursive Self-Rewrite and Policy-Refine](https://arxiv.org/abs/2610.22192)
- **Project:** [Terminal-RSI project page](https://jyyang26.github.io/terminal-rsi/)
- **Code:** [jyyang26/Terminal-RSI](https://github.com/jyyang26/Terminal-RSI)
- **Model:** [Teriminal-RSI/Terminal-RSI-27B](https://huggingface.co/Teriminal-RSI/Terminal-RSI-27B)


## Model details

| Property | Value |
|---|---|
| Release name | Terminal-RSI-27B |
| Backbone named in the paper | Qwen3.8-27B |
| Serialized architecture | `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`) |
| Parameters in exported tensors | 27,781,427,952, including the packaged vision components |
| Stored weight dtype | BF16 |
| Text layers / hidden size | 64 / 5,120 |
| Configured context capacity | 262,144 tokens |
| Weight format | Hugging Face Safetensors; 13 files referenced by the weight index |
| License | Apache-2.0; see `LICENSE` |



## Training approach

The paper describes the retained sequence:

**Base → RSR-1 → RPR-1 → RSR-2 → RPR-2**

- **Recursive Self-Rewrite (RSR):** Discover verified trajectories across complementary harnesses, rewrite them into runbooks, screen for leakage and compatibility, and execute them afresh. Accepted public trajectories provide actor-only supervised updates; critic weights are carried through the rewrite stage.
- **Recursive Policy-Refine (RPR):** Recalibrate an inherited critic with the actor frozen, then jointly optimize actor and critic using PPO. The initial Warm-up Critic Model is prepared separately from the four critic-only calibration updates at the start of each refinement phase.
- **Family Dense Reward (FDR):** Normalize verifier-measured partial progress across task families. The paper uses FDR in RPR-1 and the ordinary RPR-2 branch.
- **Success-Prioritized Reward (SPR):** Combine a strict-success bonus with bounded partial-progress credit. The paper's retained Long-Reward RPR-2 branch uses SPR.
- **Turn-Boundary Skip-Observation GAE (TB-GAE):** Formulate credit assignment over generated tokens while skipping observation recursion nodes and applying decay across interaction-turn boundaries. This is a methodological contribution, not an independently established component-level performance gain. The paper explicitly notes that deployment of the estimator requires checkpoint/configuration evidence; its documented first phase uses standard GAE with unit discount and trace factors.


## Paper-reported evaluation

**These results refer to the paper's retained RPR-2 step-18 model; see the checkpoint distinction above.**

| Benchmark / metric | Base | Paper's retained Terminal-RSI-27B |
|---|---:|---:|
| Terminal-Bench 4.0 — success (%) | 0.00 | **19.84** |
| Terminal-Bench 2.1 — success (%) | 51.70 | **86.52** |
| Terminal-Bench 3.0 — success (%) | 0.00 | **16.95** |
| Terminal-Bench Hard — success (%) | 31.00 | **79.00** |
| Four-suite equal-weight mean success (%) | 20.68 | **50.58** |
| LHTB — mean process reward | 0.21 | **0.37** |
| LHTB — mean strict completions / 46 tasks | 0/46 | **5/46** |
| SWR100 — success (%) | 3.00 | **6.00** |

Retained-stage scores are arithmetic means over three inference runs (**Mean@3**). The four-suite mean excludes LHTB and SWR100 and is not task-weighted. LHTB process reward and strict completion are separate metrics.

### Evaluation harness

The paper reports:

- temperature `0.60`, top-p `0.95`;
- up to `8,192` generated tokens per turn and `96,000` input tokens per call;
- structured JSON actions and explicit thinking mode disabled;
- linear interaction history with proactive summarization triggered at `32,000` accumulated tokens;
- benchmark-specific termination and time limits, with a configured upper bound of `100,000` turns.

Performance depends on the agent harness, tools, prompts, time budget, and verifier. A standalone chat example does not reproduce these agent evaluations. External frontier-model comparisons are omitted here because the paper notes incomplete primary-source/protocol reconciliation.

## Loading the model

Use a Transformers version that supports `Qwen3_5ForConditionalGeneration`, plus PyTorch, Accelerate, and Safetensors. The packaged configuration records the export version as `5.8.0.dev0`; configuration loading was checked locally with Transformers `5.17.0`. **Full model loading and GPU inference were not tested as part of packaging.**

```python
import torch
from transformers import AutoTokenizer, Qwen3_5ForConditionalGeneration

model_id = "Teriminal-RSI/Terminal-RSI-27B"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = Qwen3_5ForConditionalGeneration.from_pretrained(
    model_id,
    dtype=torch.bfloat16,
    device_map="auto",
)

messages = [
    {"role": "system", "content": "You are a terminal assistant. Explain your next action; do not claim to have run commands."},
    {"role": "user", "content": "How would you investigate a Python project whose tests fail because a dependency is missing?"},
]
prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False,
)
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
with torch.inference_mode():
    outputs = model.generate(
        **inputs,
        max_new_tokens=1024,
        do_sample=True,
        temperature=0.6,
        top_p=0.95,
    )
print(tokenizer.decode(outputs[0, inputs["input_ids"].shape[-1]:], skip_special_tokens=True))
```

This example generates text only. Actual terminal execution requires an external agent loop that validates actions, runs commands in a sandbox, returns observations, and checks completion. The BF16 weight files alone occupy approximately **55.56 GB (51.75 GiB)**; inference additionally requires memory for activations, runtime buffers, and the KV/state cache. Long-context inference may need substantially more memory.

All **13 indexed Safetensors files** are required, including `model-missing-from-origin-00001.safetensors` and `model-missing-from-origin-00002.safetensors`. These are part of the checkpoint, not optional leftovers.

## Intended use and limitations

Intended uses include research on terminal agents, repository repair, code execution, scientific workflow reconstruction, and long-horizon reinforcement learning with executable verification.

- Run generated commands in an isolated environment with restricted credentials, network access, and filesystem permissions. Do not give an autonomous agent unrestricted access to production systems.
- The model can produce incorrect code, unsafe commands, misleading explanations, or false claims of completion. Use independent tests and protected verifiers rather than relying on self-reported success.
- Benchmark gains do not establish general-purpose reliability, safety, or applicability to every repository or task family.
- The recursive-stage comparisons are not compute-matched component ablations. The paper separates observed performance from unsupported causal attribution.
- No new benchmark runs, full inference validation, or independent safety evaluation were performed for this upload.

## 中文简介

Terminal-RSI-27B 是基于 Terminal-RSI 论文所述方法基于 Qwen3.8-27B 为基座的终端智能体模型，面向代码仓库检查、依赖修复、科学工作流重建和需要真实执行与验证的多步骤任务。Terminal-RSI 通过递归自重写（RSR）与继承 critic 的递归策略精炼（RPR）交替迭代，结合任务家族进度奖励与优先严格成功的奖励设计，将局部进展转化为可验证的任务完成。

## Citation

```bibtex
@article{yang2026terminalrsi,
  title = {Terminal-RSI: Recursive Self-Improving Terminal Agents via Recursive Self-Rewrite and Policy-Refine},
  author = {Yang, Junyao and Li, Zongxia and Shi, Yucheng and Li, Zhongzhi and Wang, Ruhan and Zhou, Ruiwen and Mi, Haitao and Yan, Shuicheng and Liang, Leowei},
  journal = {arXiv preprint arXiv:2610.22192},
  year = {2026}
}
```


