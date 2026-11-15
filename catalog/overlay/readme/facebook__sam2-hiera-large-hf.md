Repository for SAM 2: Segment Anything in Images and Videos, a foundation model towards solving promptable visual segmentation in images and videos from FAIR. See the [SAM 2 paper](https://arxiv.org/abs/2408.00714) for more information.


The official code is publicly release in this [repo](https://github.com/facebookresearch/segment-anything-2/).
To download the SAM 2 (Hiera-L) checkpoint:

```
from huggingface_hub import hf_hub_download
hf_hub_download(repo_id = "facebook/sam2-hiera-large", filename="sam2_hiera_large.pt", local_dir = "./")
```

### Citation

To cite the paper, model, or software, please use the below:
```
@article{ravi2024sam2,
  title={SAM 2: Segment Anything in Images and Videos},
  author={Ravi, Nikhila and Gabeur, Valentin and Hu, Yuan-Ting and Hu, Ronghang and Ryali, Chaitanya and Ma, Tengyu and Khedr, Haitham and R{\"a}dle, Roman and Rolland, Chloe and Gustafson, Laura and Mintun, Eric and Pan, Junting and Alwala, Kalyan Vasudev and Carion, Nicolas and Wu, Chao-Yuan and Girshick, Ross and Doll{\'a}r, Piotr and Feichtenhofer, Christoph},
  journal={arXiv preprint arXiv:2408.00714},
  url={https://arxiv.org/abs/2408.00714},
  year={2024}
}
```
