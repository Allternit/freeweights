<div align="center">
  <img src="https://github.com/FlagOpen/RoboBrain/raw/main/assets/logo.jpg" width="400"/>
</div>

# [CVPR 25] RoboBrain: A Unified Brain Model for Robotic Manipulation from Abstract to Concrete.


## 🤗 Models

- **[`Base Planning Model`](https://huggingface.co/BAAI/RoboBrain/)**: The model was trained on general datasets in Stages 1–2 and on the Robotic Planning dataset in Stage 3, which is designed for Planning prediction.
- **[`A-LoRA for Affordance`](https://huggingface.co/BAAI/RoboBrain-LoRA-Affordance/)**: Based on the Base Planning Model, Stage 4 involves LoRA-based training with our Affordance dataset to predict affordance.
- **[`T-LoRA for Trajectory`](https://huggingface.co/BAAI/RoboBrain/)**: Based on the Base Planning Model, Stage 4 involves LoRA-based training with our Trajectory dataset to predict trajectory.

![](https://raw.githubusercontent.com/FlagOpen/RoboBrain/main/assets/training.png)


| Models               | Checkpoint                                                     | Description                                                | 
|----------------------|----------------------------------------------------------------|------------------------------------------------------------|
| Planning Model       | [🤗 Planning CKPTs](https://huggingface.co/BAAI/RoboBrain/)   | Used for Planning prediction in our paper                   | 
| Affordance (A-LoRA)  | [🤗 Affordance CKPTs](https://huggingface.co/BAAI/RoboBrain-LoRA-Affordance/)      | Used for Affordance prediction in our paper | 
| Trajectory (T-LoRA)  | [🤗 Trajectory CKPTs](https://huggingface.co/BAAI/RoboBrain-LoRA-Trajectory/)      | Used for Trajectory prediction in our paper | 


## 🛠️ Setup

```bash
# clone repo.
git clone https://github.com/FlagOpen/RoboBrain.git
cd RoboBrain
# build conda env.
conda create -n robobrain python=3.10
conda activate robobrain
pip install -r requirements.txt
```

## <a id="Training"> 🤖 Training</a>

### 1. Data Preparation

```bash
# Modify datasets for Stage 4_aff, please refer to:
- yaml_path: scripts/train/yaml/stage_4_affordance.yaml
```

**Note:** During training, we applied normalization to the bounding boxes, representing them with the coordinates of the top-left and bottom-right corners, and retaining three decimal places for each. 
The sample format in each json file should be like:
```json
{
    "id": xxxx,
    "image": "testsetv3/Unseen/egocentric/ride/bicycle/bicycle_001662.jpg",
    "conversations": [
        {
            "value": "<image>\nYou are a robot using the joint control. The task is \"ride the bicycle\". Please predict a possible affordance area of the end effector?",
            "from": "human"
        },
        {
            "from": "gpt",
            "value": "[0.561, 0.171, 0.645, 0.279]"
        }
    ]
},
```

### 2. Training 
```bash
# Training on Stage 4_aff:
bash scripts/train/stage_4_0_resume_finetune_lora_a.sh
```
**Note:** Please change the environment variables (e.g. *DATA_PATH*, *IMAGE_FOLDER*, *PREV_STAGE_CHECKPOINT*) in the script to your own.

### 3. Convert original weights to HF weights
```bash
# Planning Model
python model/llava_utils/convert_robobrain_to_hf.py --model_dir /path/to/original/checkpoint/ --dump_path /path/to/output/
# A-LoRA & T-RoRA
python model/llava_utils/convert_lora_weights_to_hf.py --model_dir /path/to/original/checkpoint/ --dump_path /path/to/output/
```

## <a id="Inference">⭐️ Inference</a>

### Usage for Affordance Prediction
```python
# please refer to https://github.com/FlagOpen/RoboBrain
from inference import SimpleInference
model_id = "BAAI/RoboBrain"
lora_id = "BAAI/RoboBrain-LoRA-Affordance"
model = SimpleInference(model_id, lora_id)
# Example 1:
prompt = "You are a robot using the joint control. The task is \"pick_up the suitcase\". Please predict a possible affordance area of the end effector?"
image = "./assets/demo/affordance_1.jpg"
pred = model.inference(prompt, image, do_sample=False)
print(f"Prediction: {pred}")
'''
    Prediction: [0.733, 0.158, 0.845, 0.263]
'''
# Example 2:
prompt = "You are a robot using the joint control. The task is \"push the bicycle\". Please predict a possible affordance area of the end effector?"
image = "./assets/demo/affordance_2.jpg"
pred = model.inference(prompt, image, do_sample=False)
print(f"Prediction: {pred}")
'''
    Prediction: [0.600, 0.127, 0.692, 0.227]
'''
```

![](https://raw.githubusercontent.com/FlagOpen/RoboBrain/main/assets/demo/examples.png)




## <a id="Evaluation">🤖 Evaluation</a>
*Coming Soon ...*



## 😊 Acknowledgement  

We would like to express our sincere gratitude to the developers and contributors of the following projects:  
1. [LLaVA-NeXT](https://github.com/LLaVA-VL/LLaVA-NeXT): The comprehensive codebase for training Vision-Language Models (VLMs).  
2. [Open-X-Emboddied](https://github.com/EvolvingLMMs-Lab/lmms-eval): A powerful evaluation tool for Vision-Language Models (VLMs).
3. [AGD20k](https://github.com/lhc1224/Cross-View-AG): An affordance dataset that provides instructions and corresponding affordance regions.

Their outstanding contributions have played a pivotal role in advancing our research and development initiatives.

## 📑 Citation
If you find this project useful, welcome to cite us.
```bib
@article{ji2025robobrain,
  title={RoboBrain: A Unified Brain Model for Robotic Manipulation from Abstract to Concrete},
  author={Ji, Yuheng and Tan, Huajie and Shi, Jiayu and Hao, Xiaoshuai and Zhang, Yuan and Zhang, Hengyuan and Wang, Pengwei and Zhao, Mengdi and Mu, Yao and An, Pengju and others},
  journal={arXiv preprint arXiv:2502.21257},
  year={2025}
}
```