| Quant | Size                  | Mixture | PPL                  | 1-(Mean PPL(Q)/PPL(base)) | KLD                 |
| :---- | :-------------------- | :------ | :------------------- | :------------------------ | :------------------ |
| Q8_0  | 557.39 GiB (8.51 BPW) | Q8_0    | 3.275749 ± 0.017863  | +0.2918%                  | 0.003764 ± 0.000045 |
| IQ1_S | 106.19 GiB (1.62 BPW) | IQ1_S   | 11.010332 ± 0.077291 | +237.0971%                | 1.331246 ± 0.004350 |


![kld_graph](kld_data/01_kld_vs_filesize.png "Chart showing Pareto KLD analysis of quants")
![ppl_graph](kld_data/02_ppl_vs_filesize.png "Chart showing Pareto PPL analysis of quants")