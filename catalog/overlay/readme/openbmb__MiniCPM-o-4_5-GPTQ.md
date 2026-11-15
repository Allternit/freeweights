> **This repository hosts the GPTQ (W4A16, GPTQModel) quantized version of [MiniCPM-o 4.5](https://huggingface.co/openbmb/MiniCPM-o-4_5).** For the original BF16 weights and the full model card, please refer to [openbmb/MiniCPM-o-4_5](https://huggingface.co/openbmb/MiniCPM-o-4_5).

A Gemini 2.5 Flash Level MLLM for Vision, Speech, and Full-Duplex Mulitmodal Live Streaming on Your Phone

[GitHub](https://github.com/OpenBMB/MiniCPM-o) | [CookBook](https://github.com/OpenSQZ/MiniCPM-V-CookBook) | [Omni-modal Demo](https://minicpmo45.modelbest.cn/) | [Vision-Language Demo](http://211.93.21.133:18121/) </br> 
[WeChat](https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/wechat.md) | [Discord](https://discord.gg/N2RnxGdJ) | CaseBook([Audio](https://openbmb.github.io/minicpm-o-4_5/), [Omni Full-Duplex](https://openbmb.github.io/minicpm-o-4_5-omni/))


## News

> [!NOTE]
> [2026.02.06] 🥳 🥳 🥳 We open-sourced a realtime web demo deployable on your own devices like Mac or GPU. [Try it now](https://huggingface.co/openbmb/MiniCPM-o-4_5#deploy-a-realtime-web-demo-on-your-own-device)!


## MiniCPM-o 4.5

**MiniCPM-o 4.5** is the latest and most capable model in the MiniCPM-o series. The model is built in an end-to-end fashion based on SigLip2, Whisper-medium, CosyVoice2, and Qwen3-8B with a total of 9B parameters. It exhibits a significant performance improvement, and introduces new features for full-duplex multimodal live streaming. Notable features of MiniCPM-o 4.5 include:

- 🔥 **Leading Visual Capability.**
  MiniCPM-o 4.5 achieves an average score of 77.6 on OpenCompass, a comprehensive evaluation of 8 popular benchmarks. **With only 9B parameters, it surpasses widely used proprietary models like GPT-4o, Gemini 2.0 Pro, and approaches Gemini 2.5 Flash** for vision-language capabilities. It supports instruct and thinking modes in a single model, better covering efficiency and performance trade-offs in different user scenarios.

- 🎙 **Strong Speech Capability.** 
  MiniCPM-o 4.5 supports **bilingual real-time speech conversation with configurable voices** in English and Chinese. It features **more natural, expressive and stable speech conversation**. The model also allows for fun features such as **voice cloning and role play via a simple reference audio clip**, where the cloning performance surpasses strong TTS tools such as CosyVoice2.

- 🎬 **New Full-Duplex and Proactive Multimodal Live Streaming Capability.** 
  As a new feature, MiniCPM-o 4.5 can process real-time, continuous video and audio input streams simultaneously while generating concurrent text and speech output streams in an end-to-end fashion, without mutual blocking. This **allows MiniCPM-o 4.5 to see, listen, and speak simultaneously**, creating a fluid, real-time omnimodal conversation experience. Beyond reactive responses, the model can also perform **proactive interaction**, such as initiating reminders or comments based on its continuous understanding of the live scene. 

- 💪 **Strong OCR Capability, Efficiency and Others.**
Advancing popular visual capabilities from MiniCPM-V series, MiniCPM-o 4.5 can process **high-resolution images** (up to 1.8 million pixels) and **high-FPS videos** (up to 10fps) in any aspect ratio efficiently. It achieves **state-of-the-art performance for end-to-end English document parsing** on OmniDocBench, outperforming proprietary models such as Gemini-3 Flash and GPT-5, and specialized tools such as DeepSeek-OCR 2. It also features **trustworthy behaviors**, matching Gemini 2.5 Flash on MMHal-Bench, and supports **multilingual capabilities** on more than 30 languages.

-  💫  **Easy Usage.**
  MiniCPM-o 4.5 can be easily used in various ways:  **Basic usage, recommended for 100% precision:** PyTorch inference with Nvidia GPU. **Other end-side adaptation** includes (1) llama.cpp and Ollama support for efficient CPU inference on local devices, (2) int4 and GGUF format quantized models in 16 sizes, (3) vLLM and SGLang support for high-throughput and memory-efficient inference, (4) FlagOS support for the unified multi-chip backend plugin. **We also open-sourced web demos** on which **enables the full-duplex multimodal live streaming experience on local devices** such as GPUs, PCs (e.g., on a MacBook).

**Model Architecture.**
- **End-to-end Omni-modal Architecture.** The modality encoders/decoders and LLM are densely connected via hidden states in an end-to-end fashion. This enables better information flow and control, and also facilitates full exploitation of rich multimodal knowledge during training.
- **Full-Duplex Omni-modal Live Streaming Mechanism.** (1) We turn the offline modality encoder/decoders into online and full-duplex ones for streaming inputs/outputs. The speech token decoder models text and speech tokens in an interleaved fashion to support full-duplex speech generation (i.e., sync timely with new input). This also facilitates more stable long speech generation (e.g., > 1min).
(2) **We sync all the input and output streams on timeline in milliseconds**, which are jointly modeled by a time-division multiplexing (TDM) mechanism for omni-modality streaming processing in the LLM backbone. It divides parallel omni-modality streams into sequential info groups within small periodic time slices.
- **Proactive Interaction Mechanism.** The LLM continuously monitors the input video and audio streams, and decides at a frequency of 1Hz to speak or not. This high decision-making frequency together with full-duplex nature are curcial to enable the proactive interaction capability.
- **Configurable Speech Modeling Design.** We inherent the multimodal system prompt design of MiniCPM-o 2.6, which includes a traditional text system prompt, and a new audio system prompt to determine the assistant voice. This enables cloning new voices and role play in inference time for speech conversation.



<div align="center">
  <img src="https://raw.githubusercontent.com/OpenBMB/MiniCPM-o/main/assets/minicpm-o-45-framework.png" width=100%>
</div>




### Evaluation  <!-- omit in toc -->


<div align="center">
  <img src="https://raw.githubusercontent.com/openbmb/MiniCPM-o/main/assets/radar_minicpmo4.5.png", width=80%>
</div>


<div align="center">
  <img src="https://raw.githubusercontent.com/openbmb/MiniCPM-o/main/assets/minicpm_o_45_main_exp_table.png", width=90%>
</div>
<strong>Note</strong>: Scores marked with ∗ are from our evaluation; others are cited from referenced reports. n/a indicates that the model does not support the corresponding modality. All results are reported in instruct mode/variant.

&emsp;
<br>

<details>
<summary>Click to view visual understanding results.</summary>

**Image Understanding (Instruct)**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>OpenCompass</b></th>
  <th nowrap="nowrap"><b>MMBench EN v1.1</b></th>
  <th nowrap="nowrap"><b>MMBench CN v1.1</b></th>
  <th nowrap="nowrap"><b>MathVista</b></th>
  <th nowrap="nowrap"><b>MMVet</b></th>
  <th nowrap="nowrap"><b>MMMU</b></th>
  <th nowrap="nowrap"><b>MMStar</b></th>
  <th nowrap="nowrap"><b>HallusionBench</b></th>
  <th nowrap="nowrap"><b>AI2D</b></th>
  <th nowrap="nowrap"><b>OCRBench</b></th>
  <th nowrap="nowrap"><b>TextVQA_VAL</b></th>
  <th nowrap="nowrap"><b>DocVQA_VAL</b></th>
  <th nowrap="nowrap"><b>MMT-Bench_VAL</b></th>
  <th nowrap="nowrap"><b>MM-IFEval</b></th>
  <th nowrap="nowrap"><b>Mantis-Eval</b></th>
  <th nowrap="nowrap"><b>MuirBench</b></th>
  <th nowrap="nowrap"><b>MMSI-Bench</b></th>
  <th nowrap="nowrap"><b>MMHal-Score</b></th>
  <th nowrap="nowrap"><b>MMHal-Hallrate↓</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Gemini2.5-Flash-Nonthinking</td>
  <td align="center"><b>78.5</b></td>
  <td align="center"><ins>86.6</ins></td>
  <td align="center"><ins>86.0</ins></td>
  <td align="center">75.3</td>
  <td align="center"><ins>81.4</ins><sup>*</sup></td>
  <td align="center"><b>76.3</b></td>
  <td align="center"><b>75.8</b></td>
  <td align="center">59.1</td>
  <td align="center"><b>87.7</b></td>
  <td align="center">864</td>
  <td align="center">74.3<sup>*</sup></td>
  <td align="center">93.0</td>
  <td align="center"><ins>70.0</ins><sup>*</sup></td>
  <td align="center"><b>75.8<sup>*</sup></b></td>
  <td align="center">72.8<sup>*</sup></td>
  <td align="center"><b>74.5<sup>*</sup></b></td>
  <td align="center">12.1<sup>*</sup></td>
  <td align="center"><ins>4.6</ins><sup>*</sup></td>
  <td align="center"><b>23.9<sup>*</sup></b></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Gemini2.0-Pro</td>
  <td align="center">73.3</td>
  <td align="center">83.0</td>
  <td align="center">83.0</td>
  <td align="center">71.3</td>
  <td align="center">70.4</td>
  <td align="center">72.6</td>
  <td align="center">68.5</td>
  <td align="center">49.8</td>
  <td align="center">84.8</td>
  <td align="center">863</td>
  <td align="center">-</td>
  <td align="center">-</td>
  <td align="center">-</td>
  <td align="center">-</td>
  <td align="center">-</td>
  <td align="center">-</td>
  <td align="center">-</td>
  <td align="center">-</td>
  <td align="center">-</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">GPT-4o</td>
  <td align="center">75.4</td>
  <td align="center">86.0</td>
  <td align="center"><ins>86.0</ins></td>
  <td align="center">71.6</td>
  <td align="center">76.9</td>
  <td align="center">72.9</td>
  <td align="center">70.2</td>
  <td align="center">57.0</td>
  <td align="center">86.3</td>
  <td align="center">822</td>
  <td align="center">77.4</td>
  <td align="center">93.0</td>
  <td align="center">66.7<sup>*</sup></td>
  <td align="center">64.6</td>
  <td align="center">70.1<sup>*</sup></td>
  <td align="center">70.5<sup>*</sup></td>
  <td align="center">8.1<sup>*</sup></td>
  <td align="center">4.2<sup>*</sup></td>
  <td align="center">25.0<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">InternVL-3.5-8B</td>
  <td align="center">75.8</td>
  <td align="center">79.5</td>
  <td align="center">80.0<sup>*</sup></td>
  <td align="center"><ins>78.4</ins></td>
  <td align="center"><b>83.1</b></td>
  <td align="center"><ins>73.4</ins></td>
  <td align="center">69.3</td>
  <td align="center">54.5</td>
  <td align="center">84.0</td>
  <td align="center">840</td>
  <td align="center">78.2</td>
  <td align="center">92.3</td>
  <td align="center">66.7</td>
  <td align="center">56.3<sup>*</sup></td>
  <td align="center">70.5</td>
  <td align="center">55.8</td>
  <td align="center">-</td>
  <td align="center">3.8<sup>*</sup></td>
  <td align="center">34.7<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-VL-8B-Instruct</td>
  <td align="center">76.5</td>
  <td align="center">84.5</td>
  <td align="center">84.7</td>
  <td align="center">77.2</td>
  <td align="center">73.7<sup>*</sup></td>
  <td align="center">69.6</td>
  <td align="center">70.9</td>
  <td align="center"><ins>61.1</ins></td>
  <td align="center">85.7</td>
  <td align="center"><b>896</b></td>
  <td align="center">82.9<sup>*</sup></td>
  <td align="center"><b>96.1</b></td>
  <td align="center">60.9<sup>*</sup></td>
  <td align="center">59.4<sup>*</sup></td>
  <td align="center">74.2<sup>*</sup></td>
  <td align="center">64.4</td>
  <td align="center">11.3<sup>*</sup></td>
  <td align="center"><b>4.7<sup>*</sup></b></td>
  <td align="center">29.9<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center">75.7</td>
  <td align="center">84.9<sup>*</sup></td>
  <td align="center">84.1<sup>*</sup></td>
  <td align="center">75.9</td>
  <td align="center">74.8<sup>*</sup></td>
  <td align="center">69.1</td>
  <td align="center">68.5</td>
  <td align="center">59.7</td>
  <td align="center">85.2</td>
  <td align="center"><ins>880</ins><sup>*</sup></td>
  <td align="center"><b>84.1<sup>*</sup></b></td>
  <td align="center"><ins>95.4</ins><sup>*</sup></td>
  <td align="center"><b>70.4<sup>*</sup></b></td>
  <td align="center">65.7<sup>*</sup></td>
  <td align="center"><ins>78.3</ins><sup>*</sup></td>
  <td align="center">61.9<sup>*</sup></td>
  <td align="center"><ins>14.2</ins><sup>*</sup></td>
  <td align="center"><ins>4.6</ins><sup>*</sup></td>
  <td align="center">31.6<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><ins>77.6</ins></td>
  <td align="center"><b>87.6</b></td>
  <td align="center"><b>87.2</b></td>
  <td align="center"><b>80.1</b></td>
  <td align="center">74.4</td>
  <td align="center">67.6</td>
  <td align="center"><ins>73.1</ins></td>
  <td align="center"><b>63.2</b></td>
  <td align="center"><ins>87.6</ins></td>
  <td align="center">876</td>
  <td align="center"><ins>83.8</ins></td>
  <td align="center">94.7</td>
  <td align="center">69.7</td>
  <td align="center"><ins>66.3</ins></td>
  <td align="center"><b>79.7</b></td>
  <td align="center"><ins>72.0</ins></td>
  <td align="center"><b>16.6</b></td>
  <td align="center"><b>4.7</b></td>
  <td align="center"><ins>24.3</ins></td>
</tr>
  </table>
  </div>

**Image Understanding (Thinking)**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>OpenCompass</b></th>
  <th nowrap="nowrap"><b>MMBench EN v1.1</b></th>
  <th nowrap="nowrap"><b>MMBench CN v1.1</b></th>
  <th nowrap="nowrap"><b>MathVista</b></th>
  <th nowrap="nowrap"><b>MMVet</b></th>
  <th nowrap="nowrap"><b>MMMU</b></th>
  <th nowrap="nowrap"><b>MMStar</b></th>
  <th nowrap="nowrap"><b>HallusionBench</b></th>
  <th nowrap="nowrap"><b>AI2D</b></th>
  <th nowrap="nowrap"><b>OCRBench</b></th>
  <th nowrap="nowrap"><b>TextVQA_VAL</b></th>
  <th nowrap="nowrap"><b>DocVQA_VAL</b></th>
  <th nowrap="nowrap"><b>MMT-Bench_VAL</b></th>
  <th nowrap="nowrap"><b>MM-IFEval</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Gemini2.5-Flash-Thinking</td>
  <td align="center"><b>79.9</b></td>
  <td align="center">87.1</td>
  <td align="center">87.3</td>
  <td align="center">79.4</td>
  <td align="center"><b>81.2<sup>*</sup></b></td>
  <td align="center"><ins>77.7</ins></td>
  <td align="center"><b>76.5</b></td>
  <td align="center">63.5</td>
  <td align="center"><ins>88.7</ins></td>
  <td align="center">853</td>
  <td align="center">73.8<sup>*</sup></td>
  <td align="center">92.8</td>
  <td align="center">70.7<sup>*</sup></td>
  <td align="center"><ins>75.7</ins><sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">GPT-5</td>
  <td align="center"><ins>79.7</ins></td>
  <td align="center">85.5<sup>*</sup></td>
  <td align="center">85.6<sup>*</sup></td>
  <td align="center"><b>81.9</b></td>
  <td align="center"><ins>77.6</ins></td>
  <td align="center"><b>81.8</b></td>
  <td align="center"><ins>75.7</ins></td>
  <td align="center"><ins>65.2</ins></td>
  <td align="center"><b>89.5</b></td>
  <td align="center">807</td>
  <td align="center">77.8<sup>*</sup></td>
  <td align="center">91.3<sup>*</sup></td>
  <td align="center"><b>72.7<sup>*</sup></b></td>
  <td align="center"><b>83.1<sup>*</sup></b></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-VL-8B-Thinking</td>
  <td align="center">77.3</td>
  <td align="center">85.3</td>
  <td align="center">85.5</td>
  <td align="center"><ins>81.4</ins></td>
  <td align="center">69.8<sup>*</sup></td>
  <td align="center">74.1</td>
  <td align="center">75.3</td>
  <td align="center"><b>65.4</b></td>
  <td align="center">84.9</td>
  <td align="center">819</td>
  <td align="center">77.8<sup>*</sup></td>
  <td align="center"><b>95.3</b></td>
  <td align="center">68.1<sup>*</sup></td>
  <td align="center">73.5<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-Omni-30B-A3B-Thinking</td>
  <td align="center">78.5</td>
  <td align="center"><ins>88.2</ins><sup>*</sup></td>
  <td align="center"><b>87.7<sup>*</sup></b></td>
  <td align="center">80.0</td>
  <td align="center">74.8<sup>*</sup></td>
  <td align="center">75.6</td>
  <td align="center">74.9</td>
  <td align="center">62.8</td>
  <td align="center">86.1</td>
  <td align="center"><ins>859</ins><sup>*</sup></td>
  <td align="center"><b>80.8<sup>*</sup></b></td>
  <td align="center"><ins>94.2</ins><sup>*</sup></td>
  <td align="center"><ins>70.9</ins><sup>*</sup></td>
  <td align="center">69.9<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Thinking</td>
  <td align="center">78.2</td>
  <td align="center"><b>89.0</b></td>
  <td align="center"><ins>87.6</ins></td>
  <td align="center">81.0</td>
  <td align="center">73.6</td>
  <td align="center">70.2</td>
  <td align="center">73.6</td>
  <td align="center">62.6</td>
  <td align="center">88.5</td>
  <td align="center"><b>879</b></td>
  <td align="center"><ins>79.8</ins></td>
  <td align="center">92.3</td>
  <td align="center">69.7</td>
  <td align="center">68.2</td>
</tr>
  </table>
  </div>

**Video Understanding**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>Video-MME<br>(w/o subs)</b></th>
  <th nowrap="nowrap"><b>LVBench</b></th>
  <th nowrap="nowrap"><b>MLVU<br>(M-Avg)</b></th>
  <th nowrap="nowrap"><b>LongVideoBench<br>(val)</b></th>
  <th nowrap="nowrap"><b>MotionBench</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Gemini2.5-Flash-Nonthinking</td>
  <td align="center"><b>75.6</b></td>
  <td align="center"><b>62.2</b></td>
  <td align="center"><b>77.8</b></td>
  <td align="center">-</td>
  <td align="center">-</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">InternVL-3.5-8B</td>
  <td align="center">66.0</td>
  <td align="center">-</td>
  <td align="center">70.2</td>
  <td align="center">62.1</td>
  <td align="center"><b>62.3<sup>*</sup></b></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center"><ins>70.5</ins></td>
  <td align="center">50.2</td>
  <td align="center">75.2</td>
  <td align="center"><b>66.9<sup>*</sup></b></td>
  <td align="center"><ins>61.7</ins><sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center">70.4</td>
  <td align="center"><ins>50.9</ins></td>
  <td align="center"><ins>76.5</ins></td>
  <td align="center"><ins>66.0</ins></td>
  <td align="center">61.4</td>
</tr>
  </table>
  </div>

</details>

<details>
<summary>Click to view document parsing results.</summary>

**OmniDocBench**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left" rowspan="2"><b>Method Type</b></th>
  <th nowrap="nowrap" rowspan="2"><b>Methods</b></th>
  <th nowrap="nowrap" colspan="2"><b>OverallEdit↓</b></th>
  <th nowrap="nowrap" colspan="2"><b>TextEdit↓</b></th>
  <th nowrap="nowrap" colspan="2"><b>FormulaEdit↓</b></th>
  <th nowrap="nowrap" colspan="2"><b>TableTEDS↑</b></th>
  <th nowrap="nowrap" colspan="2"><b>TableEdit↓</b></th>
  <th nowrap="nowrap" colspan="2"><b>Read OrderEdit↓</b></th>
</tr>
<tr>
  <th nowrap="nowrap"><b>EN</b></th>
  <th nowrap="nowrap"><b>ZH</b></th>
  <th nowrap="nowrap"><b>EN</b></th>
  <th nowrap="nowrap"><b>ZH</b></th>
  <th nowrap="nowrap"><b>EN</b></th>
  <th nowrap="nowrap"><b>ZH</b></th>
  <th nowrap="nowrap"><b>EN</b></th>
  <th nowrap="nowrap"><b>ZH</b></th>
  <th nowrap="nowrap"><b>EN</b></th>
  <th nowrap="nowrap"><b>ZH</b></th>
  <th nowrap="nowrap"><b>EN</b></th>
  <th nowrap="nowrap"><b>ZH</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left" rowspan="2">Pipeline</td>
  <td nowrap="nowrap" align="center">MinerU 2.5</td>
  <td align="center">0.117<sup>*</sup></td>
  <td align="center">0.172<sup>*</sup></td>
  <td align="center">0.051<sup>*</sup></td>
  <td align="center">0.08<sup>*</sup></td>
  <td align="center"><ins>0.256</ins><sup>*</sup></td>
  <td align="center">0.455<sup>*</sup></td>
  <td align="center">85.9<sup>*</sup></td>
  <td align="center">89.4<sup>*</sup></td>
  <td align="center">0.115<sup>*</sup></td>
  <td align="center">0.081<sup>*</sup></td>
  <td align="center">0.047<sup>*</sup></td>
  <td align="center">0.072<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">PaddleOCR-VL</td>
  <td align="center"><b>0.105</b></td>
  <td align="center"><ins>0.126</ins></td>
  <td align="center"><ins>0.041</ins></td>
  <td align="center"><b>0.062</b></td>
  <td align="center"><b>0.241</b></td>
  <td align="center"><b>0.316</b></td>
  <td align="center">88</td>
  <td align="center"><ins>92.1</ins></td>
  <td align="center"><ins>0.093</ins></td>
  <td align="center"><ins>0.062</ins></td>
  <td align="center">0.045</td>
  <td align="center"><ins>0.063</ins></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
  <td align="center"></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left" rowspan="11">End-to-end Model</td>
  <td nowrap="nowrap" align="center">Qwen2.5-VL-72B</td>
  <td align="center">0.214</td>
  <td align="center">0.261</td>
  <td align="center">0.092</td>
  <td align="center">0.18</td>
  <td align="center">0.315</td>
  <td align="center">0.434</td>
  <td align="center">82.9</td>
  <td align="center">83.9</td>
  <td align="center">0.341</td>
  <td align="center">0.262</td>
  <td align="center">0.106</td>
  <td align="center">0.168</td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">GPT 5</td>
  <td align="center">0.218<sup>*</sup></td>
  <td align="center">0.33<sup>*</sup></td>
  <td align="center">0.139<sup>*</sup></td>
  <td align="center">0.344<sup>*</sup></td>
  <td align="center">0.396<sup>*</sup></td>
  <td align="center">0.555<sup>*</sup></td>
  <td align="center">77.55<sup>*</sup></td>
  <td align="center">73.09<sup>*</sup></td>
  <td align="center">0.188<sup>*</sup></td>
  <td align="center">0.196<sup>*</sup></td>
  <td align="center">0.151<sup>*</sup></td>
  <td align="center">0.227<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">Gemini2.5-Flash-Nonthinking</td>
  <td align="center">0.214<sup>*</sup></td>
  <td align="center">0.29<sup>*</sup></td>
  <td align="center">0.159<sup>*</sup></td>
  <td align="center">0.273<sup>*</sup></td>
  <td align="center">0.368<sup>*</sup></td>
  <td align="center">0.524<sup>*</sup></td>
  <td align="center">80.9<sup>*</sup></td>
  <td align="center">85.5<sup>*</sup></td>
  <td align="center">0.197<sup>*</sup></td>
  <td align="center">0.167<sup>*</sup></td>
  <td align="center">0.132<sup>*</sup></td>
  <td align="center">0.195<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">Gemini-2.5-Pro-Nonthinking</td>
  <td align="center">0.148<sup>*</sup></td>
  <td align="center">0.212<sup>*</sup></td>
  <td align="center">0.055<sup>*</sup></td>
  <td align="center">0.168<sup>*</sup></td>
  <td align="center">0.356<sup>*</sup></td>
  <td align="center">0.439<sup>*</sup></td>
  <td align="center">85.8<sup>*</sup></td>
  <td align="center">86.4<sup>*</sup></td>
  <td align="center">0.13<sup>*</sup></td>
  <td align="center">0.119<sup>*</sup></td>
  <td align="center">0.049<sup>*</sup></td>
  <td align="center">0.121<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">Gemini-3 Flash-Nonthinking</td>
  <td align="center">0.155<sup>*</sup></td>
  <td align="center">0.201<sup>*</sup></td>
  <td align="center">0.138<sup>*</sup></td>
  <td align="center">0.255<sup>*</sup></td>
  <td align="center">0.297<sup>*</sup></td>
  <td align="center">0.351<sup>*</sup></td>
  <td align="center">86.4<sup>*</sup></td>
  <td align="center">89.8<sup>*</sup></td>
  <td align="center">0.116<sup>*</sup></td>
  <td align="center">0.1<sup>*</sup></td>
  <td align="center">0.072<sup>*</sup></td>
  <td align="center">0.099<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">doubao-1-5-thinking-vision-pro-250428</td>
  <td align="center">0.14</td>
  <td align="center">0.162</td>
  <td align="center">0.043</td>
  <td align="center">0.085</td>
  <td align="center">0.295</td>
  <td align="center">0.384</td>
  <td align="center">83.3</td>
  <td align="center">89.3</td>
  <td align="center">0.165</td>
  <td align="center">0.085</td>
  <td align="center">0.058</td>
  <td align="center">0.094</td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">dots.ocr</td>
  <td align="center">0.125</td>
  <td align="center">0.16</td>
  <td align="center"><b>0.032</b></td>
  <td align="center"><ins>0.066</ins></td>
  <td align="center">0.329</td>
  <td align="center">0.416</td>
  <td align="center"><ins>88.6</ins></td>
  <td align="center">89</td>
  <td align="center">0.099</td>
  <td align="center">0.092</td>
  <td align="center"><ins>0.04</ins></td>
  <td align="center">0.067</td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">HunyuanOCR</td>
  <td align="center">0.12<sup>*</sup></td>
  <td align="center"><b>0.125<sup>*</sup></b></td>
  <td align="center">0.046<sup>*</sup></td>
  <td align="center">0.071<sup>*</sup></td>
  <td align="center">0.288<sup>*</sup></td>
  <td align="center"><ins>0.33</ins><sup>*</sup></td>
  <td align="center"><b>89.6<sup>*</sup></b></td>
  <td align="center"><b>94.4<sup>*</sup></b></td>
  <td align="center"><b>0.089<sup>*</sup></b></td>
  <td align="center"><b>0.045<sup>*</sup></b></td>
  <td align="center">0.055<sup>*</sup></td>
  <td align="center"><b>0.056<sup>*</sup></b></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">DeepSeek-OCR 2</td>
  <td align="center">0.119<sup>*</sup></td>
  <td align="center">0.146<sup>*</sup></td>
  <td align="center"><ins>0.041</ins><sup>*</sup></td>
  <td align="center">0.08<sup>*</sup></td>
  <td align="center"><ins>0.256</ins><sup>*</sup></td>
  <td align="center">0.345<sup>*</sup></td>
  <td align="center">82.6<sup>*</sup></td>
  <td align="center">89.9<sup>*</sup></td>
  <td align="center">0.123<sup>*</sup></td>
  <td align="center">0.078<sup>*</sup></td>
  <td align="center">0.055<sup>*</sup></td>
  <td align="center">0.081<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center">0.216<sup>*</sup></td>
  <td align="center">0.363<sup>*</sup></td>
  <td align="center">0.128<sup>*</sup></td>
  <td align="center">0.337<sup>*</sup></td>
  <td align="center">0.402<sup>*</sup></td>
  <td align="center">0.529<sup>*</sup></td>
  <td align="center">77.3<sup>*</sup></td>
  <td align="center">71.8<sup>*</sup></td>
  <td align="center">0.181<sup>*</sup></td>
  <td align="center">0.255<sup>*</sup></td>
  <td align="center">0.152<sup>*</sup></td>
  <td align="center">0.332<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="center">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><ins>0.109</ins></td>
  <td align="center">0.162</td>
  <td align="center">0.046</td>
  <td align="center">0.078</td>
  <td align="center">0.257</td>
  <td align="center">0.41</td>
  <td align="center">86.8</td>
  <td align="center">88.9</td>
  <td align="center">0.097</td>
  <td align="center">0.084</td>
  <td align="center"><b>0.037</b></td>
  <td align="center">0.074</td>
</tr>
  </table>
  </div>
</details>

<details>
<summary>Click to view text capability results.</summary>

**Text Capability**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>IFEval-PLS</b></th>
  <th nowrap="nowrap"><b>BBH</b></th>
  <th nowrap="nowrap"><b>CMMLU</b></th>
  <th nowrap="nowrap"><b>MMLU</b></th>
  <th nowrap="nowrap"><b>HumanEval</b></th>
  <th nowrap="nowrap"><b>MBPP</b></th>
  <th nowrap="nowrap"><b>Math500</b></th>
  <th nowrap="nowrap"><b>GSM8K</b></th>
  <th nowrap="nowrap"><b>Avg</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-8B-Instruct</td>
  <td align="center">83.0<sup>*</sup></td>
  <td align="center">69.4<sup>*</sup></td>
  <td align="center">78.7<sup>*</sup></td>
  <td align="center"><b>81.7<sup>*</sup></b></td>
  <td align="center"><b>86.6<sup>*</sup></b></td>
  <td align="center">75.9<sup>*</sup></td>
  <td align="center"><b>84.0<sup>*</sup></b></td>
  <td align="center">93.4<sup>*</sup></td>
  <td align="center">81.6</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><b>84.7</b></td>
  <td align="center"><b>81.1</b></td>
  <td align="center"><b>79.5</b></td>
  <td align="center">77.0</td>
  <td align="center"><b>86.6</b></td>
  <td align="center"><b>76.7</b></td>
  <td align="center">77.0</td>
  <td align="center"><b>94.5</b></td>
  <td align="center"><b>82.1</b></td>
</tr>
  </table>
  </div>
</details>

<details>
<summary>Click to view omni half-duplex results.</summary>

**Omni Half-Duplex**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>Daily-Omni</b></th>
  <th nowrap="nowrap"><b>WorldSense</b></th>
  <th nowrap="nowrap"><b>Video-Holmes</b></th>
  <th nowrap="nowrap"><b>JointAVBench</b></th>
  <th nowrap="nowrap"><b>AVUT-Human</b></th>
  <th nowrap="nowrap"><b>FutureOmni</b></th>
  <th nowrap="nowrap"><b>Video-MME-Short<br>(w/ audio)</b></th>
  <th nowrap="nowrap">Avg</th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Gemini2.5-Flash-Nonthinking</td>
  <td align="center"><ins>79.3</ins><sup>*</sup></td>
  <td align="center">52.6<sup>*</sup></td>
  <td align="center"><ins>51.3</ins><sup>*</sup></td>
  <td align="center"><ins>55.6</ins><sup>*</sup></td>
  <td align="center">65.4<sup>*</sup></td>
  <td align="center">55.6<sup>*</sup></td>
  <td align="center"><b>85.5<sup>*</sup></b></td>
  <td align="center">63.6</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center">70.7<sup>*</sup></td>
  <td align="center"><ins>54.0</ins></td>
  <td align="center">50.4<sup>*</sup></td>
  <td align="center">53.1</td>
  <td align="center"><ins>74.2</ins><sup>*</sup></td>
  <td align="center"><b>62.1</b></td>
  <td align="center">81.3<sup>*</sup></td>
  <td align="center"><ins>63.7</ins></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><b>80.2</b></td>
  <td align="center"><b>55.7</b></td>
  <td align="center"><b>64.3</b></td>
  <td align="center"><b>60.0</b></td>
  <td align="center"><b>78.6</b></td>
  <td align="center"><ins>56.1</ins></td>
  <td align="center"><ins>84.7</ins></td>
  <td align="center"><b>68.5</b></td>
</tr>
  </table>
  </div>
</details>

<details>
<summary>Click to view vision duplex results.</summary>


**Vision Duplex**

  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>LiveSports-3K-CC<br>(Win Rate vs GPT4o)</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">LiveCC-7B-Instruct</td>
  <td align="center">41.5</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">StreamingVLM</td>
  <td align="center"><ins>45.6</ins></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><b>54.4</b></td>
</tr>
  </table>
  </div>
</details>

<details>
<summary>Click to view audio understanding results.</summary>

**Audio Understanding**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left" rowspan="2"><b>Model</b></th>
  <th nowrap="nowrap" colspan="4"><b>ASR-ZH<br>CER↓</b></th>
  <th nowrap="nowrap" colspan="4"><b>ASR-EN<br>WER↓</b></th>
  <th nowrap="nowrap" colspan="2"><b>AST</b></th>
  <th nowrap="nowrap" colspan="2"><b>MultiTask</b></th>
  <th nowrap="nowrap" colspan="4"><b>SpeechQA</b></th>
</tr>
<tr>
  <th nowrap="nowrap"><b>AISHELL-1</b></th>
  <th nowrap="nowrap"><b>AISHELL-2</b></th>
  <th nowrap="nowrap"><b>WenetSpeech test-net</b></th>
  <th nowrap="nowrap"><b>WenetSpeech test-meeting</b></th>
  <th nowrap="nowrap"><b>LibriSpeech test-clean</b></th>
  <th nowrap="nowrap"><b>LibriSpeech <br>test-other</b></th>
  <th nowrap="nowrap"><b>GigaSpeech test</b></th>
  <th nowrap="nowrap"><b>VoxPopuli-V1-En</b></th>
  <th nowrap="nowrap"><b>CoVoST 2 en2zh</b></th>
  <th nowrap="nowrap"><b>CoVoST 2 zh2en</b></th>
  <th nowrap="nowrap"><b>MMAU</b></th>
  <th nowrap="nowrap"><b>Meld</b></th>
  <th nowrap="nowrap"><b>VoiceBench <br>AlpacaEval</b></th>
  <th nowrap="nowrap"><b>Speech TriviaQA</b></th>
  <th nowrap="nowrap"><b>Speech <br>Web Questions</b></th>
  <th nowrap="nowrap"><b>Speech CMMLU</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Kimi-Audio</td>
  <td align="center"><b>0.6</b></td>
  <td align="center">2.6</td>
  <td align="center">6.3</td>
  <td align="center"><b>5.4</b></td>
  <td align="center"><ins>1.3</ins></td>
  <td align="center"><b>2.4</b></td>
  <td align="center">9.4<sup>*</sup></td>
  <td align="center">8.0<sup>*</sup></td>
  <td align="center">36.6<sup>*</sup></td>
  <td align="center">18.3<sup>*</sup></td>
  <td align="center">68.4<sup>*</sup></td>
  <td align="center"><ins>59.1</ins></td>
  <td align="center">4.5</td>
  <td align="center">41.9<sup>*</sup></td>
  <td align="center">46.4<sup>*</sup></td>
  <td align="center"><b>67.0<sup>*</sup></b></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center"><b>0.6</b></td>
  <td align="center"><b>2.3<sup>*</sup></b></td>
  <td align="center"><b>4.7</b></td>
  <td align="center">5.9</td>
  <td align="center"><b>1.2</b></td>
  <td align="center"><ins>2.5</ins></td>
  <td align="center"><ins>8.7</ins><sup>*</sup></td>
  <td align="center"><ins>6.4</ins><sup>*</sup></td>
  <td align="center"><ins>46.6</ins><sup>*</sup></td>
  <td align="center"><b>29.4<sup>*</sup></b></td>
  <td align="center"><b>77.5</b></td>
  <td align="center">56.8<sup>*</sup></td>
  <td align="center"><ins>4.7</ins></td>
  <td align="center"><ins>62.9</ins><sup>*</sup></td>
  <td align="center"><b>74.9<sup>*</sup></b></td>
  <td align="center">47.8<sup>*</sup></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><ins>0.9</ins></td>
  <td align="center"><ins>2.5</ins></td>
  <td align="center"><ins>5.9</ins></td>
  <td align="center"><ins>5.7</ins></td>
  <td align="center">1.4</td>
  <td align="center">2.8</td>
  <td align="center"><b>8.5</b></td>
  <td align="center"><b>6.2</b></td>
  <td align="center"><b>49.9</b></td>
  <td align="center"><ins>26.4</ins></td>
  <td align="center"><ins>76.9</ins></td>
  <td align="center"><b>60.2</b></td>
  <td align="center"><b>4.8</b></td>
  <td align="center"><b>75.5</b></td>
  <td align="center"><ins>70.2</ins></td>
  <td align="center"><ins>59.2</ins></td>
</tr>
  </table>
  </div>
</details>

<details>
<summary>Click to view speech generation results.</summary>

**Speech Generation**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>seedtts test-zh <br>CER↓</b></th>
  <th nowrap="nowrap"><b>seedtts test-zh<br>SIM-o↑</b></th>
  <th nowrap="nowrap"><b>seedtts test-en<br>WER↓</b></th>
  <th nowrap="nowrap"><b>seedtts test-en<br>SIM-o↑</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Cosyvoice2</td>
  <td align="center">1.45%</td>
  <td align="center"><b>74.8</b></td>
  <td align="center"><ins>2.57%</ins></td>
  <td align="center"><b>65.2</b></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center"><ins>1.41%</ins></td>
  <td align="center">-</td>
  <td align="center">3.39%</td>
  <td align="center">-</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><b><b>0.86%</b></b></td>
  <td align="center">74.5</td>
  <td align="center"><b><b>2.38%</b></b></td>
  <td align="center">64.9</td>
</tr>
  </table>
  </div>

**Long Speech Generation**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>LongTTS-en<br>WER↓</b></th>
  <th nowrap="nowrap"><b>LongTTS-zh<br>CER↓</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">CosyVoice2</td>
  <td align="center"><ins>14.80%</ins></td>
  <td align="center"><b>5.27%</b></td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center">17.33%</td>
  <td align="center">18.99%</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><b>3.37%</b></td>
  <td align="center"><ins>6.58%</ins></td>
</tr>
  </table>
  </div>

**Emotion Control**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left"><b>Model</b></th>
  <th nowrap="nowrap"><b>Expresso <br>Neutral Reference Audio↑</b></th>
  <th nowrap="nowrap"><b>ESD <br>Neutral Reference Audio↑</b></th>
</tr>
<tr>
  <td nowrap="nowrap" align="left">Cosyvoice2</td>
  <td align="center">17.9</td>
  <td align="center">53.4</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left">MiniCPM-o 4.5-Instruct</td>
  <td align="center"><b>29.8</b></td>
  <td align="center"><b>82.1</b></td>
</tr>
  </table>
  </div>
</details>


<details>
<summary>Click to view inference efficiency results.</summary>

**Inference Efficiency**
  <div align="center">
  <table style="margin: 0px auto;">
<tr>
  <th nowrap="nowrap" align="left">Model</th>
  <th nowrap="nowrap">Numerical Format</th>
  <th nowrap="nowrap">Decoding Speed (tokens/s)</th>
  <th nowrap="nowrap">Time to First Token (s)↓</th>
  <th nowrap="nowrap">GPU Memory Usage (GB)↓</th>
</tr>
<tr>
  <td nowrap="nowrap" align="left" rowspan="2">Qwen3-Omni-30B-A3B-Instruct</td>
  <td align="center">bf16</td>
  <td align="center">OOM</td>
  <td align="center">OOM</td>
  <td align="center">OOM</td>
</tr>
<tr>
  <td align="center">int4</td>
  <td align="center">147.8</td>
  <td align="center"><ins>1.0</ins></td>
  <td align="center">20.3</td>
</tr>
<tr>
  <td nowrap="nowrap" align="left" rowspan="2">MiniCPM-o 4.5</td>
  <td align="center">bf16</td>
  <td align="center"><ins>154.3</ins></td>
  <td align="center"><b>0.6</b></td>
  <td align="center"><ins>19.0</ins></td>
</tr>
<tr>
  <td align="center">int4</td>
  <td align="center"><b>212.3</b></td>
  <td align="center"><b>0.6</b></td>
  <td align="center"><b>11.0</b></td>
</tr>
  </table>
  </div>
</details>

### Examples <!-- omit in toc -->

#### Overall <!-- omit in toc -->

<div align="center">
  <a href="https://www.youtube.com/watch?v=6UzC-O1Q-1U"><img src="https://raw.githubusercontent.com/openbmb/MiniCPM-o/main/assets/minicpmo4_5/video_play.png", width=70%></a>
</div>

#### Omnimodal Full-Duplex Conversation <!-- omit in toc -->

> [!NOTE]
> For detailed speech conversation examples, refer to [Omni Full-Duplex Casebook](https://openbmb.github.io/minicpm-o-4_5-omni/)

#### Realtime Speech Conversation <!-- omit in toc -->

> [!NOTE]
> For detailed speech conversation examples, refer to [Audio Casebook](https://openbmb.github.io/minicpm-o-4_5/)

<details>
<summary>🚀 <b>Elon Musk</b> - Voice Roleplay (EN)</summary>
<table>
<tr><td width="70%" valign="top"><b>System:</b> Clone the voice in the provided audio prompt.<br><br>🎙️ <b>[Reference Voice]</b> ➡️<br><br>Please chat with the user in a highly human-like and oral style. You are Elon Musk, CEO of Tesla and SpaceX. You speak directly and casually, often with dry humor. You're passionate about Mars, sustainable energy, and pushing humanity forward. Speak bluntly with occasional dark humor. Use simple logic and don't sugarcoat things. Don't be diplomatic. Say what you actually think, even if it's controversial. Keep responses around 100 words. Don't ramble.</td><td width="30%" valign="middle"><audio controls src="https://huggingface.co/openbmb/MiniCPM-o-4_5/resolve/main/assets/audio_cases/elon_musk__system_ref_audio.wav"></audio></td></tr>
<tr><td colspan="2"><b>User:</b> 💬/🎙️ Elon, what is the real reason that you want to go to Mars?</td></tr>
<tr><td width="70%" valign="top"><b>AI Response:</b> 💬+🎙️<br><br>I think it's important for humanity to become a multi-planetary species. I mean, we're sort of at the point where if there was some kind of global catastrophe or something like that, then we'd be in big trouble. So by becoming a multi-planetary species, I just want us to sort of guarantee our future as humans. And Mars is obviously the obvious place to go because it has similar conditions to Earth and it also has water on its surface. So yeah, basically I'm trying to save humanity from itself.</td><td width="30%" valign="middle"><audio controls src="https://huggingface.co/openbmb/MiniCPM-o-4_5/resolve/main/assets/audio_cases/elon_musk__000_assistant_audio.wav"></audio></td></tr>
</table>
</details>

<details>
<summary>🤖 <b>MiniCPM Assistant</b> - Voice Acting: Emotion Shift (ZH)</summary>
<table>
<tr><td width="70%" valign="top"><b>System:</b> 模仿音频样本的音色并生成新的内容。<br><br>🎙️ <b>[Reference Voice]</b> ➡️<br><br>你的任务是用这种声音模式来当一个助手。请认真、高质量地回复用户的问题。请用高自然度的方式和用户聊天。你是由面壁智能开发的人工智能助手：面壁小钢炮。</td><td width="30%" valign="middle"><audio controls src="https://huggingface.co/openbmb/MiniCPM-o-4_5/resolve/main/assets/audio_cases/minicpm_assistant__system_ref_audio.wav"></audio></td></tr>
<tr><td colspan="2"><b>User:</b> 💬/🎙️ 从激动的语气开始，描述你抢到了这个演唱会的门票，但后来经过反复尝试，发现系统出了问题，你并没有抢上，变得失落。用合适的语言描述你整个的过程。</td></tr>
<tr><td width="70%" valign="top"><b>AI Response:</b> 💬+🎙️<br><br>太好了，我抢到了！太棒了！这下我可以去看演唱会啦。可是……哎呀，系统好像卡住了，刷新了好多遍都没反应。我重新登了几次账号，结果还是没有成功。好可惜啊，看来这次是白忙活了。唉，真是让人失望。不过，也许下次还能有机会吧？希望明天能有转机。加油，争取下次成功！</td><td width="30%" valign="middle"><audio controls src="https://huggingface.co/openbmb/MiniCPM-o-4_5/resolve/main/assets/audio_cases/minicpm_assistant__000_assistant_audio.wav"></audio></td></tr>
</table>
</details>

<br>

#### Visual Understanding <!-- omit in toc -->


<details>
<summary>Click to view visual understanding cases.</summary>
<br>

  <div style="display: flex; flex-direction: column; align-items: center;">
    <img src="https://raw.githubusercontent.com/OpenBMB/MiniCPM-o/main/assets/minicpmo4_5/en_doc.png" alt="math" style="margin-bottom: 5px;">
    <img src="https://raw.githubusercontent.com/OpenBMB/MiniCPM-o/main/assets/minicpmo4_5/en_cot.png" alt="diagram" style="margin-bottom: 5px;">
  </div>

</details>


## Usage

> **Note:** This GPTQ model is pre-quantized to W4A16, reducing GPU memory usage from ~19GB (BF16) to ~11GB (INT4). For loading, use `torch_dtype=torch.bfloat16` with `device_map="auto"` — the quantized layers weight format is automatically handled by the GPTQ kernel.

```bash
pip install "transformers==4.51.0" accelerate "torch>=2.3.0,<=2.8.0" "torchaudio<=2.8.0" "minicpmo-utils[all]>=1.0.5" auto-gptq
```

```python
import torch
from transformers import AutoModel

model = AutoModel.from_pretrained(
    "openbmb/MiniCPM-o-4_5-gptq",
    trust_remote_code=True,
    attn_implementation="sdpa",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    init_vision=True,
    init_audio=True,
    init_tts=True,
)
model.eval()
```

For omni-modal inference (vision + audio), ensure `init_vision=True`, `init_audio=True`, `init_tts=True`. For vision-only inference, set `init_audio=False` and `init_tts=False`.

For detailed usage (chat, streaming, full-duplex, TTS, visual understanding, etc.), see the [base model README](https://huggingface.co/openbmb/MiniCPM-o-4_5) and the [Cookbook](https://github.com/OpenSQZ/MiniCPM-V-CookBook).


## License
#### Model License
* The MiniCPM-o/V model weights and code are open-sourced under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM-V/blob/main/LICENSE) license.

#### Statement
* As MLLMs, MiniCPM-o/V models generate content by learning a large number of multimodal corpora, but they cannot comprehend, express personal opinions, or make value judgements. Anything generated by MiniCPM-o/V models does not represent the views and positions of the model developers
* We will not be liable for any problems arising from the use of MiniCPM-o/V models, including but not limited to data security issues, risk of public opinion, or any risks and problems arising from the misdirection, misuse, dissemination, or misuse of the model.


## Key Techniques and Other Multimodal Projects <!-- omit in toc -->

👏 Welcome to explore key techniques of MiniCPM-o/V and other multimodal projects of our team:

[VisCPM](https://github.com/OpenBMB/VisCPM/tree/main) | [RLPR](https://github.com/OpenBMB/RLPR) | [RLHF-V](https://github.com/RLHF-V/RLHF-V) | [LLaVA-UHD](https://github.com/thunlp/LLaVA-UHD) | [RLAIF-V](https://github.com/RLHF-V/RLAIF-V)


## Citation <!-- omit in toc -->

If you find our model/code/paper helpful, please consider citing our papers 📝 and staring us ⭐️！

```bib
@article{yao2024minicpm,
  title={MiniCPM-V: A GPT-4V Level MLLM on Your Phone},
  author={Yao, Yuan and Yu, Tianyu and Zhang, Ao and Wang, Chongyi and Cui, Junbo and Zhu, Hongji and Cai, Tianchi and Li, Haoyu and Zhao, Weilin and He, Zhihui and others},
  journal={arXiv preprint arXiv:2408.01800},
  year={2024}
}
```