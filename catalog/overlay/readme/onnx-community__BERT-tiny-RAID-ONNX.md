# BERT-tiny-RAID (ONNX)


This is an ONNX version of [ShantanuT01/BERT-tiny-RAID](https://huggingface.co/ShantanuT01/BERT-tiny-RAID). It was automatically converted and uploaded using [this Hugging Face Space](https://huggingface.co/spaces/onnx-community/convert-to-onnx).


## Usage with Transformers.js


See the pipeline documentation for `text-classification`: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextClassificationPipeline


---


# BERT-tiny RAID Detector

This model is used to detect AI-generated texts from the RAID dataset. 
The model outputs a score corresponding to the likelihood that the text is human. 

This model was trained on a stratified subset of RAID's training data. 


# Model Details

- Base Model: `prajjwal1/bert-tiny`
- Optimizer: `Adam`
- Loss Function: `FocalLoss`
- Hyperparameters:
    - Learning rate: `5e-5`
    - Epochs: 5
    - Learning rate: `1e-5`
    - Epochs: 5
