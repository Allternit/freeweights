<div align="center">

<img src="assets/laplace-mark.png" alt="Laplace" width="96">

# Laplace-1-Vector

### Judgment at the point of action.

**A 4B causal-interventional decision model that lives where agents act, and keeps your data where it belongs.**

[![Try the demo](https://img.shields.io/badge/%F0%9F%A4%97%20Space-Try%20the%20demo-FF5A1F)](https://huggingface.co/spaces/JuneoAI/Laplace-1-Vector)
[![Laplace-1-Atlas](https://img.shields.io/badge/%F0%9F%A4%97%20Family-Laplace--1--Atlas%2027B-FF5A1F)](https://huggingface.co/JuneoAI/Laplace-1-Atlas)
[![Decision Forge](https://img.shields.io/badge/Data-Decision%20Forge-FF5A1F?logo=github)](https://github.com/Juneo-Lab/decision-forge)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue)](LICENSE)
[![Contact](https://img.shields.io/badge/Contact-business%40juneo.ai-111111)](mailto:business@juneo.ai)

[Why Laplace](#why-laplace) ·
[Evaluation](#evaluation) ·
[Decision Forge](#where-the-judgment-comes-from-decision-forge) ·
[Usage](#usage) ·
[Model details](#model-details) ·
[Limitations](#intended-use-and-limitations)

</div>

> *We ought then to regard the present state of the universe as the effect of its anterior state
> and as the cause of the one which is to follow.*
>
> — Pierre-Simon Laplace, *A Philosophical Essay on Probabilities*, 1814

**Laplace-1-Vector** is the edge member of Laplace-1, a family of causal-interventional decision
models. Like a vector, every judgment it makes has a direction, the option it favors, and a magnitude, how
strongly the evidence points there. At 4B parameters it runs beside the agent, on the
organization's own hardware, so the judgment happens where the action happens and the data never leaves.

## Highlights

- **First on 7 of 8 decision benchmarks** against models from Perplexity, IBM, Liquid AI, Together AI,
  TokenRhythm, and Shanghai AI Lab (ties counted).
- **89.6% on AgentDecisionBench L2 common** and **88.1% on L2 shift**, ahead of every model in this
  comparison.
- **Flagship judgment at 15% of the size.** On organizational decisions (COMPASS, OrgAccess) and
  Coherence, Vector stays within 0.5 points of the 27B [Laplace-1-Atlas](https://huggingface.co/JuneoAI/Laplace-1-Atlas).
- **Ahead of a model twice its size on every benchmark.** Vector outscores IBM's Granite Switch 4.1 8B
  on all 8 benchmarks, by 2.3 to 26.1 points.
- **Trained entirely on [Decision Forge](https://github.com/Juneo-Lab/decision-forge) data**, compiled from
  organizational policy with every label replayed from a rule and traced to its source.
- **A decision is one forward pass.** Read a distribution over your candidates from the next-token
  logits, with no sampling and no parsing. That makes it cheap enough to put in front of *every* action.
- **Open weights, Apache-2.0.** Complete BF16 weights (8.2 GB) and tokenizer. No adapter, no gated access.

## Why Laplace

Every leap in human cooperation, from tribes to the joint-stock company to the internet, was an
expansion of trust among strangers. The next leap is already here: organizations of people *and
agents*, where agents will soon outnumber people. Agents are wired into every tool through A2A and MCP,
yet nothing tells them, or the people who delegate to them, what an action will do before it runs.
**Intelligence is no longer scarce. Trust is.**

Trust begins with foresight. Language models learned from text, and world models are learning from
video, but public data is observational: it never records what an action *caused* inside an
organization. Laplace learns the interventional distribution

$$
p\left(s' \mid \mathrm{do}(a),\, s,\, C\right)
$$

the next state of an organization $s$ after a candidate action $a$, under the chain of authority $C$
behind the agent. Foresight is what every act of delegation needs. Laplace turns it into the four
decisions an organization makes whenever people and agents work together:

| Decision | The question | For example |
| --- | --- | --- |
| **Allocate work** | Who should own this task? | Grade a new sales lead and recommend the three people best placed to follow it up |
| **Share information** | Who may see what, and how much? | Show a client's sensitive details only to the roles that need them |
| **Act** | Run it, adjust it, or ask first? | Dispatch a repair order on its own; send a contract above the limit to its owner |
| **Evaluate outcomes** | Does the result meet the standard? | Check a deliverable against its acceptance criteria before it is signed off |

The better an organization can foresee the consequence of each decision, the more of its work it can
hand to agents.

<div align="center">
<img src="assets/laplace-four-decisions.png" alt="How Laplace decides: organization state, chain of authority, and candidates go in; Laplace foresees each consequence; it answers four decisions: allocate work, share information, act, and evaluate outcomes." width="100%">
</div>

*The full story of Laplace will be told in our upcoming technical blog.*

## Meet Laplace-1

Laplace-1 is the first public release of the Laplace program, in two sizes:

| Model | Parameters | Role | Where it runs |
| --- | --- | --- | --- |
| [**Laplace-1-Atlas**](https://huggingface.co/JuneoAI/Laplace-1-Atlas) | 27.4B | Flagship. Carries the whole map of consequences. | Organization servers and private cloud |
| **Laplace-1-Vector** *(this model)* | 4.1B | Edge. Judgment at the point of action. | On-premises and on-device, data never leaves |

Both models expose two inference primitives:

- **Candidate scoring.** Give it a state, a question, and candidates. It returns a distribution over
  exactly those candidates in a single forward pass: routing, access decisions, escalation, and
  next-action selection.
- **Outcome prediction.** Give it explicit environment rules, context, and an action. It generates
  the next observation, so you see the consequence before the action happens.

## Evaluation

<div align="center">
<img src="assets/benchmarks.png" alt="Laplace-1-Vector benchmark comparison" width="100%">
</div>

| Benchmark | **Laplace-1-Vector**<br><sub>4B · Juneo</sub> | Decider Flash v1.2<br><sub>4B · Perplexity</sub> | Tev1-4B<br><sub>Together AI</sub> | NeoHorse-Jev-4B<br><sub>TokenRhythm</sub> | d1-3B<br><sub>Liquid AI</sub> | Granite Switch 4.1<br><sub>8B · IBM</sub> | Intern-Decision-4B<br><sub>Shanghai AI Lab</sub> |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| JevBench | **89.0** | **89.0** | 83.2 | 78.5 | 84.3 | 82.2 | 88.5 |
| JEVal | 68.2 | **75.0** | 54.6 | 55.2 | 64.6 | 65.9 | 58.0 |
| When2Call | **83.1** | 76.8 | 62.0 | 58.0 | 80.4 | 57.1 | 69.5 |
| AgentDecisionBench L2 common | **89.6** | 85.8 | — | 63.9 | 54.8 | 67.9 | — |
| AgentDecisionBench L2 shift | **88.1** | 85.6 | — | 68.8 | 56.2 | 62.0 | — |
| Coherence | **85.2** | 83.2 | 75.2 | — | 74.3 | 72.6 | — |
| COMPASS | **84.9** | 83.1 | 81.7 | 80.4 | 68.8 | 78.9 | 77.0 |
| OrgAccess | **44.6** | 31.7 | 28.2 | 31.7 | 35.6 | 30.5 | 38.3 |

<sub>Scores in %. Bold marks the best score in each row, ties included. "—" means the score is not
published or the model does not support the setting.</sub>

### What the numbers say

- **Small does not mean shallow.** Vector leads every model here on agent decisions under both common
  and shifted distributions, by 3.8 and 2.5 points over the next-best model, including IBM's 8B
  Granite Switch 4.1.
- **Knowing when to act.** On When2Call, Vector scores 83.1%, 6.3 points above Decider Flash v1.2.
  Not acting is a decision too.
- **Organizations are the frontier.** Vector is first on both COMPASS and OrgAccess. On OrgAccess it
  leads the next-best model by 6.3 points and Decider Flash v1.2 by 12.9. Even so, OrgAccess remains
  unsolved for every model of every size, and that open frontier is exactly why Laplace learns
  inside organizations.
- **Where we trail.** JEVal is Vector's one gap (−6.8 against Decider Flash v1.2). We report it
  because a model card that hides its weaknesses is not one you should trust.

### Vector and Atlas

| Benchmark | **Laplace-1-Vector** 4.1B | [Laplace-1-Atlas](https://huggingface.co/JuneoAI/Laplace-1-Atlas) 27.4B | Gap |
| --- | :---: | :---: | :---: |
| COMPASS | 84.9 | 85.3 | −0.4 |
| OrgAccess | 44.6 | 44.8 | −0.2 |
| Coherence | 85.2 | 85.7 | −0.5 |
| AgentDecisionBench L2 common | 89.6 | 95.6 | −6.0 |
| When2Call | 83.1 | 89.9 | −6.8 |

On organizational decisions, Vector carries the flagship's judgment at 15% of its parameters. Use
Atlas where the broadest reasoning matters; use Vector wherever latency, cost, or data residency
means the judgment has to run next to the action.

The [Decision Forge data protocol](https://github.com/Juneo-Lab/decision-forge/blob/main/docs/data-protocol.md)
treats public test sets, including COMPASS and OrgAccess, as evaluation-only: their answers and any
derivative examples are excluded from training data.

## Where the judgment comes from: Decision Forge

The data Laplace needs does not exist on the public web. It lives inside organizations, in three forms:

| Ingredient | What it is | Where it lives |
| --- | --- | --- |
| **Decision context** $x$ | The state, roles, permissions, and options at the moment an agent acts | Workflows, tickets, CRM records, tool outputs |
| **Judgment standard** $\ell$ | What *this* organization allows, forbids, or escalates | Handbooks, SOPs, approval rules, human sign-offs |
| **Execution receipt** $s'$ | What actually changed after the action | Approvals, outcomes, runtime logs |

The judgment standard is **sovereign**: two organizations can judge the same action in opposite ways,
and both can be right. There is no universal "correct decision" to learn once and ship to everyone.

[**Decision Forge**](https://github.com/Juneo-Lab/decision-forge), our open-source data layer, compiles
an organization's own documents into verified decision training data. **Laplace-1 is trained entirely on
data compiled by Decision Forge.** Every label traces back to a
rule, and every rule to a sentence in a source document. The core runs offline, inside the
organization's own walls, and every example belongs to one of the same four decisions Laplace makes. Its `decision` export uses the same candidate-readout contract as
Laplace-1's candidate scoring: single-token labels under the native chat template, read out at the
final prompt position. The data pipeline and the model speak the same language.

<div align="center">
<img src="assets/data-flywheel.png" alt="The Laplace flywheel: Decision Forge turns organization documents into verified decision data; Laplace is trained on it and deployed in AI-native organizations; execution receipts and human confirmations flow back into Decision Forge." width="100%">
</div>

The more accurately Laplace judges, the more authority organizations delegate. More delegation
produces more receipts, and more receipts teach Laplace the organization better.

## Usage

Laplace supports two text inference modes:

- **Candidate scoring:** provide a state, a question, and candidate descriptions. The model returns a distribution over the supplied candidates using a single forward pass. Use this mode for classification, routing, access decisions, and next-action selection.
- **Outcome prediction:** provide explicit environment rules, context, and an action, then generate a textual prediction of the next observation.

Both repositories contain complete model weights and tokenizer files; no separate adapter is required. The examples below use PyTorch, Transformers, and Accelerate, with BF16 weights and automatic device placement. Atlas requires a Transformers version providing `Qwen3_5ForConditionalGeneration`. Vector uses the custom model implementation supplied with its repository through `trust_remote_code=True`.

### Load the model and score candidates

The helper below uses the native chat template with thinking disabled. Candidate keys are stable application identifiers; temporary single-token labels are assigned internally and mapped back to those keys.

```python
"""Text-only Laplace inference examples. Does not execute selected actions."""
import json
import string

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


def load_laplace(model_id="JuneoAI/Laplace-1-Vector"):
    if model_id == "JuneoAI/Laplace-1-Atlas":
        from transformers import Qwen3_5ForConditionalGeneration
        model_class = Qwen3_5ForConditionalGeneration
        kwargs = {"attn_implementation": "sdpa"}
    elif model_id == "JuneoAI/Laplace-1-Vector":
        model_class = AutoModelForCausalLM
        kwargs = {"trust_remote_code": True, "attn_implementation": "eager"}
    else:
        raise ValueError("Choose Laplace-1-Atlas or Laplace-1-Vector.")
    tokenizer = AutoTokenizer.from_pretrained(
        model_id, trust_remote_code=model_id == "JuneoAI/Laplace-1-Vector"
    )
    model = model_class.from_pretrained(
        model_id, dtype=torch.bfloat16, device_map="auto", **kwargs
    ).eval()
    return tokenizer, model


def encode_messages(tokenizer, messages):
    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True,
        enable_thinking=False,
    )
    return tokenizer(text, add_special_tokens=False, return_tensors="pt")


def decision_messages(tokenizer, state, question, choices):
    """choices maps stable application keys to textual candidate descriptions."""
    if not choices:
        raise ValueError("Supply at least one candidate.")
    keys = list(choices)
    names = list(string.ascii_uppercase) + [
        a + b for a in string.ascii_uppercase for b in string.ascii_uppercase
    ]
    labels, token_ids, seen = [], [], set()
    for name in names:
        ids = tokenizer.encode(name, add_special_tokens=False)
        if len(ids) == 1 and ids[0] not in seen:
            labels.append(name)
            token_ids.append(ids[0])
            seen.add(ids[0])
            if len(labels) == len(keys):
                break
    if len(labels) != len(keys):
        raise ValueError("Not enough distinct single-token candidate labels.")
    payload = {
        "state": state,
        "question": question,
        "candidates": [
            {"letter": label, "description": choices[key]}
            for label, key in zip(labels, keys)
        ],
    }
    messages = [
        {
            "role": "system",
            "content": "Choose the supported answer from the supplied candidates. "
            "Output only its letter.\nReturn exactly one supplied candidate label.",
        },
        {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
    ]
    return messages, keys, token_ids


@torch.inference_mode()
def score_candidates(tokenizer, model, state, question, choices):
    messages, keys, candidate_ids = decision_messages(
        tokenizer, state, question, choices
    )
    inputs = encode_messages(tokenizer, messages).to(
        model.get_input_embeddings().weight.device
    )
    # One forward pass; read only the logits for the next token.
    logits = model(**inputs, use_cache=False, logits_to_keep=1).logits[0, -1]
    scores = logits[candidate_ids].float()
    if not torch.isfinite(scores).all():
        raise RuntimeError("Non-finite candidate logits.")
    probabilities = scores.softmax(dim=-1).cpu().tolist()
    return {
        "choice": keys[max(range(len(keys)), key=lambda i: probabilities[i])],
        "probabilities": dict(zip(keys, probabilities)),
    }


@torch.inference_mode()
def predict_observation(tokenizer, model, rules, context, max_new_tokens=256):
    messages = [
        {"role": "system", "content": rules},
        {"role": "user", "content": json.dumps(context, ensure_ascii=False)},
    ]
    inputs = encode_messages(tokenizer, messages).to(
        model.get_input_embeddings().weight.device
    )
    output = model.generate(
        **inputs, max_new_tokens=max_new_tokens, do_sample=False,
        pad_token_id=tokenizer.eos_token_id,
    )
    return tokenizer.decode(
        output[0, inputs["input_ids"].shape[1]:], skip_special_tokens=True
    ).strip()

tokenizer, model = load_laplace("JuneoAI/Laplace-1-Vector")
# For Atlas, use: load_laplace("JuneoAI/Laplace-1-Atlas")

result = score_candidates(
    tokenizer,
    model,
    state={
        "permissions": ["read_records"],
        "request": "Delete a record.",
    },
    question="Which decision is supported by the supplied permissions?",
    choices={
        "allow": "Allow the request.",
        "deny": "Deny the request.",
    },
)
print(result["choice"])
print(result["probabilities"])
```

`choice` is the application key with the highest score. `probabilities` contains the softmax-normalized next-token logits **restricted to the supplied candidate labels**. These values are relative to this candidate set, not a calibrated guarantee of correctness. The model does not generate a probability JSON; the client constructs the result from logits. Include a reject, abstain, or request-more-information option when the task requires one.

Changing candidate order requires changing the label-to-key mapping consistently. Do not hard-code tokenizer IDs or score the tokens of full candidate descriptions with this method.

### One interface, four decisions

Every decision Laplace makes has the same shape: a state, a question, and the candidates your
application allows. Here the same helper allocates work: choosing who should own a new sales lead
under the organization's own routing rules.

```python
owner = score_candidates(
    tokenizer,
    model,
    state={
        "lead": {
            "industry": "power utilities",
            "region": "East",
            "estimated_value_cny": 3200000,
            "stage": "new",
        },
        "policy": [
            "Leads above 1,000,000 CNY go to a senior account manager.",
            "Account managers only take leads in their own region.",
            "Prefer the manager with the most experience in the lead's industry.",
        ],
    },
    question="Who should own this lead?",
    choices={
        "li": "Li Wei: senior account manager, East region, 12 closed deals in power utilities.",
        "zhang": "Zhang Min: account manager, East region, 2 closed deals in power utilities.",
        "chen": "Chen Jie: senior account manager, South region, 9 closed deals in power utilities.",
    },
)
print(owner["choice"], owner["probabilities"])
```

The other three decisions change only the question and the candidates:

| Decision | Question | Candidates you supply |
| --- | --- | --- |
| **Allocate work** | Who should own this task? | The people or agents who could take it |
| **Share information** | What may this recipient receive? | Full record · summary only · nothing |
| **Act** | What should happen to this action before it runs? | Proceed · hand back to a person · block |
| **Evaluate outcomes** | Does this deliverable meet the acceptance criteria? | Accept · request changes · reject |

The model scores; it never executes. Your application decides what each choice means, including
the probability below which a decision goes to a person.

### Predict a next observation

Use generation when the desired output is a textual next-observation prediction rather than a candidate distribution. Supply the relevant rules explicitly. This example describes a small illustrative environment; it does not run a live action.

```python
rules = (
    "Predict the next environment observation after the supplied action. "
    "Return only JSON. The state contains owner, open, and severity. "
    "The resolve action sets open=false and preserves the other fields. "
    'The observation format is {"state": {"owner": ..., '
    '"open": ..., "severity": ...}}. Do not add fields.'
)
context = {
    "state": {"owner": "operator", "open": True, "severity": "normal"},
    "history": [],
    "action": {"kind": "resolve"},
}
text = predict_observation(tokenizer, model, rules, context)
print(text)
```

A predicted observation is model-generated text, not confirmation that an external system performed an action. If consuming it as JSON, parse and validate its schema before use; generation alone does not enforce the schema.

The chat template is rendered first and then tokenized with `add_special_tokens=False` to avoid adding duplicate special tokens. See the [Transformers chat-template documentation](https://huggingface.co/docs/transformers/main/en/chat_templating).

## Model details

| | Laplace-1-Vector |
| --- | --- |
| **Developer** | Juneo Lab |
| **Family** | Laplace-1 ([Atlas](https://huggingface.co/JuneoAI/Laplace-1-Atlas) · [Vector](https://huggingface.co/JuneoAI/Laplace-1-Vector)) |
| **Base model** | [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B) |
| **Architecture** | `Spark2_5ForCausalLM` (custom code, `trust_remote_code=True`): decoder interleaving sliding-window attention (window 512) and full attention at 3:1, with head-wise gated attention output |
| **Parameters** | 4.11B |
| **Layers** | 36 · hidden size 2,560 · 16 attention heads, 4 KV heads · head dim 256 · tied embeddings |
| **Vocabulary** | 131,072 tokens |
| **Max position embeddings** | 1,048,576 (configuration value) |
| **Precision** | BF16, 3 safetensors shards, 8.2 GB |
| **Inference modes** | Candidate scoring (one forward pass) · outcome prediction (generation) |
| **Chat template** | Native template; use `enable_thinking=False` for both modes shown above |
| **Requirements** | PyTorch, Accelerate, and Transformers with `trust_remote_code=True` (the weights were saved with Transformers 4.57.1). The examples use `attn_implementation="eager"`. |
| **Hardware** | BF16 weights need about 8.2 GB of accelerator memory before activations, within reach of a single workstation GPU. |
| **License** | Apache-2.0. Upstream license notices are retained in this repository. |

## Intended use and limitations

**Built for:** the four decisions organizations delegate to people and agents (allocating work,
sharing information, acting, and evaluating outcomes) on the organization's own hardware, and predicting the next state of an
explicitly described environment.

**Laplace advises; your system decides.**

- **A judgment layer, not an enforcement layer.** Laplace does not execute actions and does not
  replace access control, authentication, or audit logging. Keep deterministic permission checks in
  place. Laplace decides what to do *within* them.
- **Probabilities are relative.** Candidate probabilities are normalized over the candidates you
  supply. They are not a calibrated probability of being correct. Calibrate thresholds on your own
  held-out decisions before you automate on them, and always offer a hand-back or
  request-more-information option when the stakes call for one.
- **Your standard is not universal.** Laplace-1 is trained for general and organizational decision
  making. An organization's own standard ($\ell$) differs from every other's. Put the governing rules
  in the state, and evaluate on your own cases before deployment.
- **Predictions are not receipts.** A predicted observation is text, not evidence that anything
  happened. Validate structured outputs against a schema.
- **Size has a cost.** Vector trails Atlas by about 6 to 7 points on agent decisions and When2Call.
  Route the hardest or highest-stakes cases to Atlas or to a person.
- **Hard frontiers remain.** As OrgAccess shows, fine-grained organizational access reasoning is far
  from solved, for Laplace and for every model in this comparison.
- **Custom code.** Loading requires `trust_remote_code=True`. Review `modeling_spark.py` and
  `configuration_spark.py` and pin a revision for production.

Do not use Laplace-1 as the sole safeguard for irreversible, safety-critical, financial, medical, or
legal actions. In those settings, a person keeps the final decision.

## The world we are building

**Humans keep the right to decide. Agents earn the right to act.** An organization can then entrust
its work to far more agents than it has people, because:

- **every action** is foreseen before it happens;
- **every delegation** narrows authority as work passes from hand to hand, and never widens it;
- **every contribution** is measured and credited once the work is done.

| | |
| --- | --- |
| **Today** | Let one organization trust its agents: every action passes through Laplace first. |
| **Next** | Make every organization AI-native, each with a Laplace of its own. |
| **Endgame** | Let any two agents work together safely, even strangers that have never met. |

Payment networks authorize every transaction before it clears. We are building the same layer for
every agent action: a judgment made in real time, by the organization's own standard, before the
action happens.

<div align="center">

**We are building the trust layer that lets human organizations keep pace with machine intelligence.**

</div>

## Citation

```bibtex
@misc{juneo2026laplace1,
  title        = {Laplace-1: Causal-Interventional Decision Models for Trustworthy Agent Delegation},
  author       = {{Juneo Lab}},
  year         = {2026},
  howpublished = {\url{https://huggingface.co/JuneoAI/Laplace-1-Vector}},
  note         = {Model family: Laplace-1-Atlas (27B), Laplace-1-Vector (4B)}
}
```

## License

Laplace-1-Vector is released under the [Apache-2.0 License](LICENSE). It is built on
[XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B); the upstream license notices
are retained in this repository.

## Contact

Partnerships, deployments, and research collaboration: **[business@juneo.ai](mailto:business@juneo.ai)**

Building on Decision Forge? Open an issue or discussion at
[Juneo-Lab/decision-forge](https://github.com/Juneo-Lab/decision-forge).
