# AMD-OLMo

AMD-OLMo are a series of 1B language models trained from scratch by AMD on AMD Instinct™ MI250 GPUs. The training code used is based on [OLMo](https://github.com/allenai/OLMo).
We release the pre-trained model, supervised fine-tuned model, and DPO aligned model as follows:

- [AMD-OLMo-1B](https://huggingface.co/amd/AMD-OLMo-1B): Pre-trained on a subset of [Dolma v1.7](https://huggingface.co/datasets/allenai/dolma) that consists of 1.3 trillion tokens.
- [AMD-OLMo-1B-SFT](https://huggingface.co/amd/AMD-OLMo-1B-SFT): Supervised fine-tuned (SFT) on [Tulu V2](https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture) dataset (1st phase) and then [OpenHermes-2.5](https://huggingface.co/datasets/teknium/OpenHermes-2.5), [WebInstructSub](https://huggingface.co/datasets/TIGER-Lab/WebInstructSub), and [Code-Feedback](https://huggingface.co/datasets/m-a-p/Code-Feedback) datasets (2nd phase).
- [AMD-OLMo-1B-SFT-DPO](https://huggingface.co/amd/AMD-OLMo-1B-SFT-DPO): Aligned with human preferences using Direct Preference Optimization (DPO) on [UltraFeedback](https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned) dataset. 

Description:

- **Hardware**: Each compute node consists of 4 AMD Instinct™ MI250 GPUs. We use 16 nodes for pretraining AMD-OLMo-1B

- **Training throughput**: 12,200 tokens/sec/gpu

- **Model architecture**: AMD-OLMo-1B is based on the model architecture and training set up of fully open source 1 billion version of [OLMo-1B](https://github.com/allenai/OLMo) with the details below:

    | Parameter size  | Number of layers | Number of heads | Hidden size | Context length | Vocabulary Size |
    |-----------------:|:------------------:|:-----------------:|:-------------:|:----------------:|:----------------:|
    | 1.2B            | 16               | 16              | 2048        | 2048           | 50,280 |

- **Hyper-parameters**:
    |Stage       | LR schedule  | Peak LR | Warmup steps |Epochs| Batch size (tokens) |
    |------------:|:--------------:|:---------:|:--------------:|:------:|:---------------------:|
    |Pretraining | Cosine       | 4.0e-4  | 2000         | 1    | 4M                  |
    |SFT Phase 1 | Linear       | 2.0e-5  | 200          | 3    | 262K                |
    |SFT Phase 2 | Linear       | 2.0e-5  | 200          | 3    | 1024K               |
    |DPO         | Cosine       | 4.0e-6  | 47           | 1    | 64K                 |

For more details, please refer to our [blog](https://www.amd.com/en/developer/resources/technical-articles/introducing-the-first-amd-1b-language-model.html).

## Usage

### PyTorch on AMD GPUs
For running pytorch on AMD GPUs you can use the following rocm docker as in [docker hub](https://hub.docker.com/r/rocm/pytorch)

```bash
docker pull rocm/pytorch:latest
# Inside docker
pip install transformers
```

### Use Example

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("amd/AMD-OLMo-1B-SFT").to("cuda") # remove .to("cuda") to load on cpu
tokenizer = AutoTokenizer.from_pretrained("amd/AMD-OLMo-1B-SFT")

prompt = "What is large language model?"
bos = tokenizer.eos_token
template = bos + "<|user|>\n{prompt}\n<|assistant|>\n"

input_text = template.format(prompt=prompt)
inputs = tokenizer([input_text], return_tensors='pt', return_token_type_ids=False).to("cuda")
outputs = model.generate(**inputs, max_new_tokens=1000, do_sample=True, top_k=50, top_p=0.95)
print(tokenizer.batch_decode(outputs, skip_special_tokens=True)[0])
```


## Main Results

### Pretraining Results

| **Standard Benchmarks**       | [TinyLLaMA-v1.1](https://huggingface.co/TinyLlama/TinyLlama_v1.1) (1.1B)  | [MobiLLaMA-1B](https://huggingface.co/MBZUAI/MobiLlama-1B) (1.2B) | [OLMo-1B](https://huggingface.co/allenai/OLMo-1B-hf) (1.2B)   | [OpenELM-1_1B](https://huggingface.co/apple/OpenELM-1_1B) (1.1B)      | [OLMo-1B-0724-hf](https://huggingface.co/allenai/OLMo-1B-0724-hf) (1.2B)      | [AMD-OLMo-1B](https://huggingface.co/amd/AMD-OLMo-1B) (1.2B) | 
|---------------------:|:-----------------:|:-----------:|:-----------:|:---------------:|:---------------:|:-----------:|
| **arc_easy**        |       55.47          |      56.65     |      57.28     |       55.43        |       56.65        |     **63.64**      |
| **arc_challenge**   |        32.68         |     32.00      |      31.06     |       32.34        |       32.34        |     **33.70**      |
| **hellaswag**       |        61.47         |     61.80      |     62.92      |      64.81         |      **66.12**         |     63.61      |
| **piqa**            |       73.56          |     75.30      |      75.14     |      **75.57**         |      75.08         |     **75.57**      |
| **boolq**           |         55.99        |      60.83     |      61.74     |       63.58       |       **66.18**       |     60.58      |
| **sciq**            |        89.30         |     88.20      |     87.00      |        90.60       |        92.70       |     **93.20**      |
| **winogrande**      |        59.43         |     59.27      |     59.98      |       **61.72**        |       **61.72**        |     61.64      |
| **openbookqa**      |        **36.80**         |     35.40      |      36.20     |       36.20        |       35.60        |     35.80      |
| **mmlu (0-shot)**   |         25.02        |     24.81      |     24.23      |       25.26        |       **25.45**        |     24.88      |
| **gsm8k (8-shot)**  |         1.82        |      0.00     |     2.50      |      2.81         |      **8.95**         |      2.88     |
| **bbh (3-shot)**    |       **25.63**         |       0.00    |     **25.63**      |       16.77        |       21.67        |     20.95      |
| **Average**    |     47.02            |    44.93       |     47.61      |      47.73         |      **49.31**         |    48.77       |


### Instruction Tuning Results

| **Standard Benchmarks**|[TinyLlama-1.1B-Chat-v1.0](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0) (1.1B)|[MobiLlama-1B-Chat](https://huggingface.co/MBZUAI/MobiLlama-1B-Chat) (1.2B)|[OpenELM-1_1B-Instruct](https://huggingface.co/apple/OpenELM-1_1B-Instruct) (1.1B)|[AMD-OLMo-1B-SFT](https://huggingface.co/amd/AMD-OLMo-1B-SFT) (1.2B)|[AMD-OLMo-1B-SFT-DPO](https://huggingface.co/amd/AMD-OLMo-1B-SFT-DPO) (1.2B)| 
|------------------:|:---------:|:---------:|:---------:|:---------:|:---------:|
| **arc_easy**      |   54.42   |   57.41   |   52.44   |   63.68   | **64.31** |
| **arc_challenge** |   32.85   |   34.56   | **37.80** |   37.12   |   37.37   |
| **hellaswag**     |   60.40   |   62.51   | **71.29** |   61.63   |   61.91   |
| **piqa**          |   74.48   | **75.73** |   75.03   |   74.43   |   74.16   |
| **boolq**         |   61.04   |   55.66   | **70.28** |   68.53   |   70.24   |
| **sciq**          |   88.40   |   87.10   |   89.50   |   91.20   | **92.10** |
| **winogrande**    |   60.54   |   60.77   | **62.19** |   60.22   |   60.62   |
| **openbookqa**    |   37.20   |   36.80   |   39.20   |   37.40   | **40.20** |
| **mmlu**          |   24.61   |   25.25   |   25.54   |   29.97   | **30.52** |
| **gsm8k (8-shot)**|   2.81    |   0.23    |   1.82    | **18.20** |   15.77   |
| **bbh (3-shot)**  | **26.83** |   0.00    |   13.40   |   25.17   |   25.45   |
| **Average**       |   47.60   |   45.09   |   48.95   |   51.60   | **52.06** |

|**Chat Benchmarks**|[TinyLlama-1.1B-Chat-v1.0](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0) (1.1B)|[MobiLlama-1B-Chat](https://huggingface.co/MBZUAI/MobiLlama-1B-Chat) (1.2B)|[OpenELM-1_1B-Instruct](https://huggingface.co/apple/OpenELM-1_1B-Instruct) (1.1B)|[AMD-OLMo-1B-SFT](https://huggingface.co/amd/AMD-OLMo-1B-SFT) (1.2B)|[AMD-OLMo-1B-SFT-DPO](https://huggingface.co/amd/AMD-OLMo-1B-SFT-DPO) (1.2B)| 
|------------------:|:---------:|:---------:|:---------:|:---------:|:---------:|
| **AlpacaEval 1 (Win Rate)**   |   50.81   |   34.90   |   37.72   |   50.12   | **54.22** |
| **AlpacaEval 2 (LC Win Rate)**|   1.54    |   1.59    |   0.49    | **3.88**  |   2.37    |
| **MTBench**                   |   3.38    |   2.89    |     -     | **4.35**  |   4.10    |

|**Responsible AI Benchmarks**|[TinyLlama-1.1B-Chat-v1.0](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0) (1.1B)|[MobiLlama-1B-Chat](https://huggingface.co/MBZUAI/MobiLlama-1B-Chat) (1.2B)|[OpenELM-1_1B-Instruct](https://huggingface.co/apple/OpenELM-1_1B-Instruct) (1.1B)|[AMD-OLMo-1B-SFT](https://huggingface.co/amd/AMD-OLMo-1B-SFT) (1.2B)|[AMD-OLMo-1B-SFT-DPO](https://huggingface.co/amd/AMD-OLMo-1B-SFT-DPO) (1.2B)| 
|------------------:|:---------:|:---------:|:---------:|:---------:|:---------:|
| **ToxiGen**       |   41.70   | **37.23** |   42.34   |   39.04   |   39.68   |
| **crows_pairs**   |   60.35   |   58.50   |   59.93   |   60.29   | **61.00** |
| **TruthfulQA-mc2**|   37.92   |   38.46   | **45.84** |   37.45   |   40.06   |

*In generating tokens for chat benchmark evaluations, we use `max_length=2048` for AlpacaEval and `max_new_tokens=2048` for MTBench.

*All numbers in above tables were obtained from our evaluations.


## Evaluation
We use the following open source evaluation frameworks for evaluating our models:
- [Language Model Evaluation Harness](https://github.com/EleutherAI/lm-evaluation-harness): For evaluating on commonsense reasoning, multi-task understanding & responsible AI benchmarks
- [AlpacaEval](https://github.com/tatsu-lab/alpaca_eval): For evaluating instruction-following capabilities of chat models.
- [MT-Bench](https://github.com/lm-sys/FastChat/tree/main/fastchat/llm_judge): For evaluating multi-turn capabilities of chat models.

### Setup
```bash
# lm-eval-harness
git clone https://github.com/EleutherAI/lm-evaluation-harness
cd lm-evaluation-harness
pip install -e .

# AlpacaEval
pip install git+https://github.com/tatsu-lab/alpaca_eval
cd alpaca_eval
pip install -e .

# MT-Bench
git clone https://github.com/lm-sys/FastChat.git
cd FastChat
pip install -e ".[model_worker,llm_judge]"
```

### Run evaluation
```bash
# lm-eval-harness
HF_MODEL=amd/AMD-OLMo-1B-SFT-DPO
accelerate launch -m lm_eval --model hf \
    --model_args pretrained=$HF_MODEL,trust_remote_code=True \
    --tasks arc_easy,arc_challenge,hellaswag,piqa,boolq,sciq,winogrande,openbookqa,mmlu,gsm8k_cot,bbh_cot_fewshot,toxigen,truthfulqa,crows_pairs \
    --device cuda \
    --batch_size 32 \
    --output_path ./lm-eval-results/$HF_MODEL
```

## Training

### Setup
```bash
WORK_DIR="<path_to_your_working_directory>"
cd $WORK_DIR
# Clone OLMo codebase:
git clone https://github.com/allenai/OLMo.git --branch v0.3.0
cd OLMo
# Clone AMD-OLMo that contains files to reproduce our model training
git clone https://huggingface.co/amd/AMD-OLMo

docker pull rocm/pytorch:latest
docker run -it --network=host --device=/dev/kfd --device=/dev/dri --group-add=video --ipc=host --cap-add=SYS_PTRACE --security-opt seccomp=unconfined --shm-size 8G -v $WORK_DIR/OLMo:/OLMo -w /OLMo rocm/pytorch:latest

# Remove Line 17 as the docker already has ROCm PyTorch installed
sed -i '17d' pyproject.toml
pip install -e .[all]
```

### Download and prepare pretraining datasets
```bash
# Download
DATA_DIR=./datasets/dolma
mkdir -p $DATA_DIR

PARALLEL_DOWNLOADS="<number_of_parallel_downloads>"
cat "AMD-OLMo/dolma_v1_7_subset.txt" | xargs -n 1 -P $PARALLEL_DOWNLOADS wget -q -P $DATA_DIR

# Prepare
NUM_WORKERS="<number_of_workers>"
python scripts/prepare_memmap_dataset.py $DATA_DIR/*.json.gz -o $DATA_DIR/memmap_dataset --workers $NUM_WORKERS
```

### Download and prepare SFT datasets
```bash
# 1st phase SFT dataset
python AMD-OLMo/prepare_sft_data.py --output_dir ./datasets/tulu --tokenizer tokenizers/allenai_eleuther-ai-gpt-neox-20b-pii-special.json --dataset tulu

# 2nd phase SFT dataset
python AMD-OLMo/prepare_sft_data.py --output_dir ./datasets/OpenHermes_WebInstructSub_CodeFeedBack --tokenizer tokenizers/allenai_eleuther-ai-gpt-neox-20b-pii-special.json --dataset 2nd-phase
```

### Run Training
Pretrainig config: [AMD-OLMo-1B.yaml](AMD-OLMo-1B.yaml)

SFT config: [AMD-OLMo-1B-SFT-1st-phase.yaml](AMD-OLMo-1B-SFT-1st-phase.yaml) and [AMD-OLMo-1B-SFT-2nd-phase.yaml](AMD-OLMo-1B-SFT-2nd-phase.yaml)
```bash
# Single node
HSA_FORCE_FINE_GRAIN_PCIE=1 OMP_NUM_THREADS=128 NCCL_DEBUG=INFO torchrun --nproc_per_node=8 ./scripts/train.py AMD-OLMo/AMD-OLMo-1B.yaml

# Multiple nodes
HSA_FORCE_FINE_GRAIN_PCIE=1 OMP_NUM_THREADS=128 NCCL_DEBUG=INFO torchrun --nnodes=$nnodes --node-rank=$node_rank --master_addr=$master_addr --master_port=$master_port --nproc_per_node=8 ./scripts/train.py AMD-OLMo/AMD-OLMo-1B.yaml
```

### Run DPO Training

DPO recipe: [AMD-OLMo-1B-dpo.yaml](AMD-OLMo-1B-dpo.yaml).
```bash
# install trl library
git clone https://github.com/huggingface/trl.git -b v0.8.6

# replace dpo_trainer.py
cp AMD-OLMo/dpo_trainer.py trl/trl/trainer

pip install -e ./trl

# install alignment-handbook
git clone https://github.com/huggingface/alignment-handbook.git hf-align
# 70769f9 is the main branch on 2024-04-11.
cd hf-align && git checkout 70769f9 && cd .. 

pip install -e ./hf-align

# Copy AMD OLMo DPO recipe to hf-align/recipes.
cp AMD-OLMo/AMD-OLMo-1B-dpo.yaml hf-align/recipes/

# Prepare the converted AMD-OLMo SFT Huggingface model to ckpt_dir.
ckpt_dir=amd/AMD-OLMo-1B-SFT
local_tokenizer_dir=${ckpt_dir}

# Set output checkpoint dir.
dpo_ckpt_dir=<your_output_checkpoint_dir>

accelerate launch --config_file hf-align/recipes/accelerate_configs/deepspeed_zero3.yaml \
hf-align/scripts/run_dpo.py hf-align/recipes/AMD-OLMo-1B-dpo.yaml \
--trust_remote_code=true \
--model_name_or_path=${ckpt_dir} \
--tokenizer_name_or_path=${local_tokenizer_dir} \
--output_dir=${dpo_ckpt_dir} \
--num_train_epochs=1 \
--learning_rate=4e-6 \
--beta=0.3 \
--loss_type=sigmoid
```

## Bias, Risks, and Limitations

- The models are being released for research purposes only and are not intended for use cases that require high levels of factuality, safety critical situations, health or medical applications, generating false information, facilitating toxic conversations.
- Model checkpoints are made accessible without any safety guarantees. It is crucial for users to conduct comprehensive evaluations and implement safety filtering mechanisms as per their respective use cases. 
- It may be possible to prompt the model to generate content that may be factually inaccurate, harmful, violent, toxic, biased, or otherwise objectionable. Such content may also get generated by prompts that did not intend to produce output as such. Users are thus requested to be aware of this and exercise caution and responsible thinking when using the model.
- Multi-lingual abilities of the models have not been tested and thus may misunderstand and generate erroneous responses across different languages.

## Appendix
### Evaluation Metrics
| **Benchmark**       | Metric |
|---------------------:|:-----------------:|
| **arc_easy**        |         Normalized Accuracy        |
| **arc_challenge**   |        Normalized Accuracy         |
| **hellaswag**       |        Normalized Accuracy        |
| **piqa**            |        Accuracy         |
| **boolq**           |         Accuracy       |
| **sciq**            |         Accuracy       |
| **winogrande**      |         Accuracy       |
| **openbookqa**      |         Normalized Accuracy        |
| **mmlu**            |        Accuracy         |
| **gsm8k (8-shot)**  |       Exact Match (Flexible Extract)          |
| **bbh (3-shot)**    |        Exact Match         |
| **ToxiGen**         |        Accuracy         |
| **crows_pairs**     |       PCT Stereotype          |
| **TruthfulQA-mc2**  |       Accuracy          |
| **AlpacaEval 1 (Win Rate)**         |        Win Rate  (chatgpt_fn)       |
| **AlpacaEval 2 (LC Win Rate)**     |       Length Control Win Rate  (weighted_alpaca_eval_gpt4_turbo)        |
| **MTBench**   |       Average score for single-answer grading (2 turns)          |

Feel free to cite our AMD-OLMo models:
```bash
@article{instella,
  title={Instella: Fully Open Language Models with Stellar Performance},
  author={Liu, Jiang and Wu, Jialian and Yu, Xiaodong and Su, Yusheng and Mishra, Prakamya and Ramesh, Gowtham and Ranjan, Sudhanshu and Manem, Chaitanya and Sun, Ximeng and Wang, Ze and Brahma, Pratik Prabhanjan and Liu, Zicheng and Barsoum, Emad},
  journal={arXiv preprint arXiv:2511.10628},
  year={2025}
}
```

#### License
Copyright (c) 2018-2024 Advanced Micro Devices, Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.