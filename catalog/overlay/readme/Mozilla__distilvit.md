# distilvit

This model is a work in progress. Fine-tuned version of those base models:

- a VIT model for the image encoder: https://huggingface.co/google/vit-base-patch16-224-in21k
- a Distilled GPT-2 model for the text decoder: https://huggingface.co/distilbert/distilgpt2

This model was trained on:

- [A debiased version of COCO 2017](https://huggingface.co/datasets/Mozilla/coco-gpt4o)
- [A debiased version of Flickr30k](https://huggingface.co/datasets/Mozilla/flickr30k-transformed-captions-gpt4o)
- [Images from pexels](https://huggingface.co/datasets/Mozilla/pexels-gpt4o)
- [DocOrNot](https://huggingface.co/datasets/Mozilla/docornot)
- [Alt Text Validation](https://huggingface.co/datasets/Mozilla/alt-text-validation)



You can find the code used to create the model here: https://github.com/mozilla/distilvit


# training results

```
{
  "train/loss": 0.0781,
  "train/learning_rate": 0.00003793103448275862,
  "train/epoch": 2.41,
  "train/global_step": 700,
  "eval/loss": 0.09741172194480896,
  "eval/rouge1": 60.382,
  "eval/rouge2": 38.0754,
  "eval/rougeL": 56.9132,
  "eval/rougeLsum": 56.9214,
  "eval/meteor": 0.5448683804505693,
  "eval/gen_len": 9.864678265672467,
  "eval/runtime": 343.0443,
  "eval/samples_per_second": 10.555,
  "eval/steps_per_second": 0.108,
  "train/train_runtime": 10567.9413,
  "train/train_samples_per_second": 27.414,
  "train/train_steps_per_second": 0.274,
  "train/total_flos": 9039628706135409000,
  "train/train_loss": 0.09852950266429356,
}
```

