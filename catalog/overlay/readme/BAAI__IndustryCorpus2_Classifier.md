该模型是数据集[BAAI/IndustryCorpus2](https://huggingface.co/datasets/BAAI/IndustryCorpus2)用于31个行业分类

## 模型细节：

为了提升数据集中行业划分对实际行业的覆盖，并对齐国家标准中定义的行业目录，我们参考国家统计局制定的国民经济行业分类体系和世界知识体系，进行类目的合并和整合，设计了覆盖中英文的最终的31个行业类目。类目表名称如下所示

```
{
    "数学_统计": {"zh": "数学与统计", "en": "Math & Statistics"},
    "体育": {"zh": "体育", "en": "Sports"},
    "农林牧渔": {"zh": "农业与渔业", "en": "Agriculture & Fisheries"},
    "房地产_建筑": {"zh": "房地产与建筑", "en": "Real Estate & Construction"},
    "时政_政务_行政": {"zh": "政治与行政", "en": "Politics & Administration"},
    "消防安全_食品安全": {"zh": "安全管理", "en": "Safety Management"},
    "石油化工": {"zh": "石油化工", "en": "Petrochemicals"},
    "计算机_通信": {"zh": "计算机与通信", "en": "Computing & Telecommunications"},
    "交通运输": {"zh": "交通运输", "en": "Transportation"},
    "其他": {"zh": "其他", "en": "Others"},
    "医学_健康_心理_中医": {"zh": "健康与医学", "en": "Health & Medicine"},
    "文学_情感": {"zh": "文学与情感", "en": "Literature & Emotions"},
    "水利_海洋": {"zh": "水利与海洋", "en": "Water Resources & Marine"},
    "游戏": {"zh": "游戏", "en": "Gaming"},
    "科技_科学研究": {"zh": "科技与研究", "en": "Technology & Research"},
    "采矿": {"zh": "采矿", "en": "Mining"},
    "人工智能_机器学习": {"zh": "人工智能", "en": "Artificial Intelligence"},
    "其他信息服务_信息安全": {"zh": "信息服务", "en": "Information Services"},
    "学科教育_教育": {"zh": "学科教育", "en": "Subject Education"},
    "新闻传媒": {"zh": "新闻传媒", "en": "Media & Journalism"},
    "汽车": {"zh": "汽车", "en": "Automobiles"},
    "生物医药": {"zh": "生物医药", "en": "Biopharmaceuticals"},
    "航空航天": {"zh": "航空航天", "en": "Aerospace"},
    "金融_经济": {"zh": "金融与经济", "en": "Finance & Economics"},
    "住宿_餐饮_酒店": {"zh": "住宿与餐饮", "en": "Hospitality & Catering"},
    "其他制造": {"zh": "制造业", "en": "Manufacturing"},
    "影视_娱乐": {"zh": "影视与娱乐", "en": "Film & Entertainment"},
    "旅游_地理": {"zh": "旅游与地理", "en": "Travel & Geography"},
    "法律_司法": {"zh": "法律与司法", "en": "Law & Justice"},
    "电力能源": {"zh": "电力与能源", "en": "Power & Energy"},
    "计算机编程_代码": {"zh": "编程", "en": "Programming"},
}
```

## 行业分类模型的数据构造

  - 数据构建

    - 数据来源：预训练预训练语料抽样和开源文本分类数据，其中预训练语料占比90%，通过数据采样，保证中英文数据占比为1:1
    - 标签构造：使用LLM模型对数据进行多次分类判定，筛选多次判定一致的数据作为训练数据
    - 数据规模：36K
  数据构造的整体流程如下：

  ![image-20240919140307205](./img/classify.png)

## 模型训练：

  参数更新：在预训练的bert模型上添加分类头进行文本分类模型训练

  模型选型：考虑的模型性能和推理效率，我们选用了0.5b规模的模型，通过对比实验最终最终选择了bge-m3并全参数训练的方式，作为我们的基座模型

  训练超参：全参数训练，max_length = 2048，lr=1e-5，batch_size=64,，验证集评估acc：86%

  ![image-20240919141408659](./img/classify_exp.png)


## how to use

```python
from transformers import (
    AutoConfig,
    AutoModelForSequenceClassification,
    AutoTokenizer)
import torch

model_dir = "BAAI/IndustryCorpus2_Classifier"

model = AutoModelForSequenceClassification.from_pretrained(
      model_dir,
      trust_remote_code=False,
      ignore_mismatched_sizes=False,
).half().cuda().eval()

tokenizer = AutoTokenizer.from_pretrained(
    model_dir,
    use_fast=True,
    token=None,
    trust_remote_code=False,
)

config = AutoConfig.from_pretrained(
    model_dir,
    finetuning_task="text-classification",
)

id2label = config.id2label
print(id2label)
label2id = config.label2id
print(label2id)


sentence = "黄龙国际中心位于杭州市西湖区学院路77号，地处杭州黄龙商务区核心位置。项目以“新经济、新生态、新黄龙”的理念和“知识城市创新区”的项目定位，引领着杭州城市的产业升级和创新。\n黄龙国际中心主打“知识盒子”建筑设计，拥有时尚、新潮的建筑立面，聚集不同功能的独立建筑物，打造出包容开放又具有链接性的空间。项目在2018年4月一举斩获开发项目行业最高奖——广厦奖。\n项目整体分四期开发。一期G、H、I三幢楼宇由坤和自主开发建成，于2015年4月投入使用，于2015年5月获得了美国绿色建筑委员会颁发的LEED金级认证，并成功吸引蚂蚁金服、美图、有赞等国内互联网创新巨头率先入驻。\n2016年初，坤和引进万科作为该项目股权合作方通过双方优质资源共享，在产品品质、创新等方面得到全方位提升。\n二期A、B幢由美国KPF设计，并于2018年4月一举获得房地产开发项目行业最高奖——广厦奖。A、B幢写字楼于2018年10月投入使用，B幢与全球领先的创造者社区及空间和服务提供商——WeWork正式签约。商业K-lab于2018年12月28日正式开业。\n项目三期E、F幢已于2020年投入使用。四期C、D幢，计划于2021年底投入使用。\n项目总占地面积约8.7万方，总建筑面积约40万平方米，涵盖9栋国际5A写字楼及8万方K-lab商业新物种，以知识为纽带，打造成一个集商务、商业、教育、文化、娱乐、艺术、餐饮、会展等于一体的完整城市性生态体系。项目全部投入使用后，年租金收入将超6亿元。\n"

result = tokenizer(
            [sentence],
            padding=False,
            max_length=2048,
            truncation=True,
            return_tensors="pt",
        ).to("cuda")
result["input_ids"].to(dtype=torch.bfloat16)

model_out = model(**result)
predict_label_id = torch.argmax(model_out.logits, dim=-1).tolist()[0]
predict_label_str = id2label[predict_label_id]
```

## Citation

If you use this classifier or IndustryCorpus2, please cite the source dataset:

```bibtex
@misc{shi2024industrycorpus2,
  title     = {IndustryCorpus2},
  author    = {Xiaofeng Shi and Lulu Zhao and Hua Zhou and Donglin Hao},
  year      = {2024},
  publisher = {Hugging Face},
  doi       = {10.57967/hf/3488},
  url       = {https://huggingface.co/datasets/BAAI/IndustryCorpus2}
}
```
