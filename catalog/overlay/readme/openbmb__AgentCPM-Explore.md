## Latest News

* [2026-01-12]🚀🚀🚀 We have open-sourced **AgentCPM-Explore**, an agent foundation model with only **4B parameters**, together with its **entire training and inference infrastructure**. AgentCPM-Explore has successfully entered **8 classic long-horizon agent benchmarks**, including **GAIA,HLE, and BrowserComp**. AgentCPM-Explore achieves **SOTA performance at the same parameter scale** and demonstrates its **accurate deep research capabilities**, effectively breaking the performance bottleneck for **on-device agents**.

## Overview

Key highlights of AgentCPM-Explore include:

- The **first full-parameter 4B agent model** to rank on **8 long-horizon and complex agent benchmarks**, including **GAIA, HLE, and BrowserComp**, in the on-device setting.

- Capable of **over 100 rounds of continuous environment interaction**, supporting **multi-source information cross-validation**, **dynamic search strategy adjustment**, and **real-time verification of up-to-date information**, enabling sustained deep exploration until task completion.

- **Fully open-sourced end-to-end**, including (1) **AgentRL**, a fully asynchronous reinforcement learning framework for agent training, (2) **AgentDock**, a unified management and scheduling platform for tool sandboxes, (3) **AgentToLeaP**, a one-click evaluation platform for agent tool-learning capabilities. These components collectively support **community collaboration and custom extensibility**.

We elaborate on the entire construction pipeline of AgentCPM-Explore on [GitHub](https://github.com/OpenBMB/AgentCPM).


## Experimental Results
<table>
  <thead>
    <tr>
      <th>Model</th>
      <th>GAIA (text-only)</th>
      <th>BrowseComp</th>
      <th>BrowseComp (ZH)</th>
      <th>HLE</th>
      <th>Frames</th>
      <th>WebWalker</th>
      <th>Seal-0</th>
      <th>Xbench-DeepSearch</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="9"><strong>Closed-Source Models</strong></td>
    </tr>
    <tr>
      <td>Claude-4.5-sonnet</td>
      <td>71.2%</td>
      <td>19.6%</td>
      <td>40.8%</td>
      <td>24.5%</td>
      <td>85.0%</td>
      <td>/</td>
      <td>53.4%</td>
      <td>66.0%</td>
    </tr>
    <tr>
      <td>Gemini Deep Research</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>26.9%</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
    </tr>
    <tr>
      <td>DeepSeek-V3.2</td>
      <td>63.5%</td>
      <td>67.6%</td>
      <td>65.0%</td>
      <td>40.8%</td>
      <td>80.2%</td>
      <td>/</td>
      <td>38.5%</td>
      <td>71.0%</td>
    </tr>
    <tr>
      <td>MiniMax-M2</td>
      <td>75.7%</td>
      <td>44.0%</td>
      <td>48.5%</td>
      <td>31.8%</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>72.0%</td>
    </tr>
    <tr>
      <td>OpenAI-GPT-5-high</td>
      <td>76.4%</td>
      <td>54.9%</td>
      <td>65.0%</td>
      <td>35.2%</td>
      <td>/</td>
      <td>/</td>
      <td>51.4%</td>
      <td>77.8%</td>
    </tr>
    <tr>
      <td>GLM-4.6</td>
      <td>71.9%</td>
      <td>45.1%</td>
      <td>49.5%</td>
      <td>30.4%</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>70.0%</td>
    </tr>
    <tr>
      <td>Kimi-Researcher</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>26.9%</td>
      <td>78.8%</td>
      <td>/</td>
      <td>36.0%</td>
      <td>69.0%</td>
    </tr>
    <tr>
      <td>Seed-1.8</td>
      <td>87.4%</td>
      <td>67.6%</td>
      <td>81.3%</td>
      <td>40.9%</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
    </tr>
    <tr>
      <td colspan="9"><strong>Open-Source Models</strong></td>
    </tr>
    <tr>
      <td>MiroThinker 8B</td>
      <td>66.4%</td>
      <td>31.1%</td>
      <td>40.2%</td>
      <td>21.5%</td>
      <td>80.6%</td>
      <td>60.6%</td>
      <td>40.4%</td>
      <td>60.6%</td>
    </tr>
    <tr>
      <td>Tongyi DeepResearch 30B</td>
      <td>70.9%</td>
      <td>43.4%</td>
      <td>46.7%</td>
      <td>32.9%</td>
      <td>90.6%</td>
      <td>72.2%</td>
      <td>/</td>
      <td>75.0%</td>
    </tr>
    <tr>
      <td>ASearcher QWQ 32B v2</td>
      <td>58.7%</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>74.5%</td>
      <td>/</td>
      <td>/</td>
      <td>51.1%</td>
    </tr>
    <tr>
      <td>iterresearch-30B-A3B</td>
      <td>72.8%</td>
      <td>37.3%</td>
      <td>45.2%</td>
      <td>28.8%</td>
      <td>71.0%</td>
      <td>/</td>
      <td>39.6%</td>
      <td>/</td>
    </tr>
    <tr>
      <td>WebSailor-V2-30B-A3B (RL)</td>
      <td>74.1%</td>
      <td>35.3%</td>
      <td>44.1%</td>
      <td>30.6%</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>73.7%</td>
    </tr>
    <tr>
      <td>WebLeaper-30B-A3B-RUC</td>
      <td>73.2%</td>
      <td>38.8%</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>/</td>
      <td>48.6%</td>
      <td>72.0%</td>
    </tr>
    <tr>
      <td>WebDancer (QWQ-32B)</td>
      <td>51.5%</td>
      <td>3.8%</td>
      <td>18.0%</td>
      <td>/</td>
      <td>/</td>
      <td>47.9%</td>
      <td>/</td>
      <td>38.3%</td>
    </tr>
    <tr>
      <td>⭐ <strong>AgentCPM-Explore 4B</strong></td>
      <td>63.9%</td>
      <td>25.0%</td>
      <td>29.0%</td>
      <td>19.1%</td>
      <td>82.7%</td>
      <td>68.1%</td>
      <td>40.0%</td>
      <td>70.0%</td>
    </tr>
  </tbody>
</table>