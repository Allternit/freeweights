Detects age group with about 59% accuracy based on an image.

See https://www.kaggle.com/code/dima806/age-group-image-classification-vit for details.

![image/png](https://cdn-uploads.huggingface.co/production/uploads/6449300e3adf50d864095b90/gvzsgTtWDOE4vxwugZF4P.png)

```
Classification report:

              precision    recall  f1-score   support

         0-2     0.7803    0.7500    0.7649       180
         3-9     0.7998    0.7998    0.7998      1249
       10-19     0.5361    0.4236    0.4733      1086
       20-29     0.6402    0.7221    0.6787      3026
       30-39     0.4935    0.5083    0.5008      2099
       40-49     0.4848    0.4386    0.4606      1238
       50-59     0.5000    0.4814    0.4905       725
       60-69     0.4497    0.4685    0.4589       286
more than 70     0.6897    0.1802    0.2857       111

    accuracy                         0.5892     10000
   macro avg     0.5971    0.5303    0.5459     10000
weighted avg     0.5863    0.5892    0.5844     10000
```