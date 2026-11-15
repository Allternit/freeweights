###Coherent Frankenstein of smolLm-0.36b upped to 0.4b

This took about 5 hours of semi-automated continuous merging to figure out the recipe.
Model is smarter, and UNTRAINED. Uploaded it for training. Yet it performs well as is even quantized to 8bit.
8bit gguf included for testing.

```bash
wget https://huggingface.co/nisten/Biggie-SmoLlm-0.4B/resolve/main/Biggie_SmolLM_400M_q8_0.gguf
```
```verilog
./llama-cli -ngl 99 -co --temp 0 -p "How to build a city on Mars via calculating Aldrin-Cycler orbits?" -m Biggie_SmolLM_400M_q8_0.gguf -cnv -fa --keep -1
```
![image/png](https://cdn-uploads.huggingface.co/production/uploads/6379683a81c1783a4a2ddba8/XgF2kz3Zz0Jqz7BEVZ96h.png)




