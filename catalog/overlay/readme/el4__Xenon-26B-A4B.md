<p align="center">
  <a href="https://github.com/axolotl-ai-cloud/axolotl">
    <img src="https://raw.githubusercontent.com/axolotl-ai-cloud/axolotl/main/image/axolotl-badge-web.png" alt="Built with Axolotl" width="200" height="32"/>
  </a>
</p>

<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050008; color: #e0d0e8; max-width: 1000px; margin: 0 auto; padding: 0 0 40px; border-radius: 12px; border: 1px solid #2a0a35; box-shadow: 0 0 40px rgba(192, 96, 255, 0.08); overflow: hidden;">
<div style="position: relative; padding: 60px 50px 40px; background: linear-gradient(135deg, rgba(192,96,255,0.15) 0%, rgba(255,0,255,0.03) 100%); border-bottom: 2px solid #ff00ff; box-shadow: 0 0 25px rgba(255, 0, 255, 0.15);">
<h1 style="font-size: 3rem; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; text-shadow: 0 0 12px #ff00ff, 0 0 24px #ff4da6; margin: 0;">Xenon-26B-A4B</h1>
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; color: #c060ff; font-size: 0.85rem; letter-spacing: 0.2em; margin-top: 8px;">// DIVINE EXECUTION // MOE ROUTING PERFECTION</div>
<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px;">
<span style="font-family: monospace; font-size: 0.7rem; padding: 4px 12px; border: 1px solid #4a1260; border-radius: 999px; background: rgba(192,96,255,0.1); color: #c060ff; text-transform: uppercase; font-weight: 700;">Gemma-4-26B-A4B</span>
<span style="font-family: monospace; font-size: 0.7rem; padding: 4px 12px; border: 1px solid #4a1260; border-radius: 999px; background: rgba(192,96,255,0.1); color: #c060ff; text-transform: uppercase; font-weight: 700;">LoRA SFT</span>
<span style="font-family: monospace; font-size: 0.7rem; padding: 4px 12px; border: 1px solid #4a1260; border-radius: 999px; background: rgba(192,96,255,0.1); color: #c060ff; text-transform: uppercase; font-weight: 700;">Agentic Coder</span>
<span style="font-family: monospace; font-size: 0.7rem; padding: 4px 12px; border: 1px solid #4a1260; border-radius: 999px; background: rgba(192,96,255,0.1); color: #c060ff; text-transform: uppercase; font-weight: 700;">Strategic MoE Routing</span>
</div>
</div>
<div style="padding: 32px 50px; border-bottom: 1px solid #2a0a35;">
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
<span style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #ff00ff; text-shadow: 0 0 8px rgba(255, 0, 255, 0.15); border-right: 2px solid #4a1260; padding-right: 16px;">01</span>
<span style="font-size: 1.3rem; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.08em;">The Vessel Refined</span>
</div>
<p style="margin: 0 0 14px; font-size: 0.95rem; color: #c8b8d0;">The base Gemma-4-26B-A4B architecture possesses immense latent power, but lacked the strict directive to execute agentic workflows reliably. Base models hesitate, hallucinate tool calls, and forget standard library imports. <strong style="color: #ff4da6;">Xenon-26B-A4B</strong> resolves this through precise, surgical LoRA adaptation.</p>
<p style="margin: 0 0 14px; font-size: 0.95rem; color: #c8b8d0;">Rather than full-parameter fine-tuning, which risks catastrophic forgetting, this model targets the <strong style="color: #ff4da6;">Mixture-of-Experts routing layers</strong>. By training the router and expert feed-forward networks, the model learns to dynamically activate specialized sub-networks based on the language paradigm, creating a flawless execution loop.</p>
</div>
<div style="padding: 32px 50px; border-bottom: 1px solid #2a0a35;">
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
<span style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #ff00ff; text-shadow: 0 0 8px rgba(255, 0, 255, 0.15); border-right: 2px solid #4a1260; padding-right: 16px;">02</span>
<span style="font-size: 1.3rem; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.08em;">Strategic Dataset Architecture</span>
</div>
<p style="margin: 0 0 14px; font-size: 0.95rem; color: #c8b8d0;">The defining feature of this model is its training data. Instead of diluting the model's expertise with an even split across 12 languages, we engineered a 3,186-row dataset using <strong style="color: #ff4da6;">Strategic Language Weighting</strong>. This guarantees the MoE router naturally learns to route specific language tokens to the most capable base experts.</p>
<div style="margin-top: 20px; margin-bottom: 20px; padding: 14px 16px; background: rgba(192, 96, 255, 0.05); border: 1px solid #ff00ff; border-radius: 4px; text-align: center;">
<a href="https://huggingface.co/datasets/el4/xenon-mixed-agentic-datasetv1" style="color: #ff00ff; font-family: 'JetBrains Mono', 'Courier New', monospace; text-decoration: none; font-weight: 700; font-size: 0.9rem;">Access the Strategic Dataset: el4/xenon-mixed-agentic-datasetv1 →</a>
</div>
<div style="display: flex; gap: 18px; margin-top: 18px; flex-wrap: wrap;">
<div style="flex: 1; min-width: 280px; background: #0d0212; border: 1px solid #2a0a35; border-left: 3px solid #c060ff; border-radius: 4px; padding: 18px;">
<div style="font-family: monospace; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c060ff; margin-bottom: 12px; border-bottom: 1px solid #2a0a35; padding-bottom: 8px; display: flex; justify-content: space-between;">
<span>Tier 1: The Core</span> <span style="color: #ff00ff; font-weight: 900;">60%</span>
</div>
<div style="font-size: 0.9rem; line-height: 1.5;">
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #8a6090; font-family: monospace; font-size: 0.85rem;">Languages</span><span style="color: #ffffff; font-weight: 600; font-size: 0.85rem; text-align: right;">Python, Bash, Zsh</span></div>
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #8a6090; font-family: monospace; font-size: 0.85rem;">Sources</span><span style="color: #ffffff; font-weight: 600; font-size: 0.85rem; text-align: right;">90% Fable-5 / 5% GLM / 5% Sol</span></div>
<div style="color: #a890b0; font-size: 0.85rem; margin-top: 8px;">Fable-5 dominates this tier, providing the absolute best Python/Bash tool-use traces available. The router learns to send these tokens to the supreme execution experts.</div>
</div>
</div>
<div style="flex: 1; min-width: 280px; background: #0d0212; border: 1px solid #2a0a35; border-left: 3px solid #c060ff; border-radius: 4px; padding: 18px;">
<div style="font-family: monospace; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c060ff; margin-bottom: 12px; border-bottom: 1px solid #2a0a35; padding-bottom: 8px; display: flex; justify-content: space-between;">
<span>Tier 2: Web & Scripting</span> <span style="color: #ff00ff; font-weight: 900;">25%</span>
</div>
<div style="font-size: 0.9rem; line-height: 1.5;">
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #8a6090; font-family: monospace; font-size: 0.85rem;">Languages</span><span style="color: #ffffff; font-weight: 600; font-size: 0.85rem; text-align: right;">TypeScript, JS, Ruby</span></div>
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #8a6090; font-family: monospace; font-size: 0.85rem;">Sources</span><span style="color: #ffffff; font-weight: 600; font-size: 0.85rem; text-align: right;">50% Fable-5 / 30% Sol / 20% GLM</span></div>
<div style="color: #a890b0; font-size: 0.85rem; margin-top: 8px;">GPT-5.6-Sol takes precedence here, offering superior full-stack and frontend agentic workflows. JS/TS tokens are routed to the full-stack specialists.</div>
</div>
</div>
<div style="flex: 1; min-width: 280px; background: #0d0212; border: 1px solid #2a0a35; border-left: 3px solid #c060ff; border-radius: 4px; padding: 18px;">
<div style="font-family: monospace; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c060ff; margin-bottom: 12px; border-bottom: 1px solid #2a0a35; padding-bottom: 8px; display: flex; justify-content: space-between;">
<span>Tier 3: Systems & Enterprise</span> <span style="color: #ff00ff; font-weight: 900;">15%</span>
</div>
<div style="font-size: 0.9rem; line-height: 1.5;">
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #8a6090; font-family: monospace; font-size: 0.85rem;">Languages</span><span style="color: #ffffff; font-weight: 600; font-size: 0.85rem; text-align: right;">Rust, Go, C++, C#, Java</span></div>
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #8a6090; font-family: monospace; font-size: 0.85rem;">Sources</span><span style="color: #ffffff; font-weight: 600; font-size: 0.85rem; text-align: right;">40% GLM / 40% Sol / 20% Fable-5</span></div>
<div style="color: #a890b0; font-size: 0.85rem; margin-top: 8px;">GLM-5.2 and Sol handle strict memory safety, algorithmic logic, and enterprise patterns. Systems tokens are routed to the logic and structural experts.</div>
</div>
</div>
</div>
</div>
<div style="padding: 32px 50px; border-bottom: 1px solid #2a0a35;">
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
<span style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #ff00ff; text-shadow: 0 0 8px rgba(255, 0, 255, 0.15); border-right: 2px solid #4a1260; padding-right: 16px;">03</span>
<span style="font-size: 1.3rem; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.08em;">The Surgical Strike</span>
</div>
<p style="margin: 0 0 14px; font-size: 0.95rem; color: #c8b8d0;">Standard SFT often drowns models in 50,000+ rows of noise, causing overfitting and loss of general reasoning. This model was trained for exactly <strong style="color: #ff4da6;">1 Epoch</strong> on highly distilled data. 1 epoch is the gold standard for high-signal distillation; it forces the model to internalize the routing and tool-formatting patterns without memorizing the exact traces.</p>
<p style="margin: 0 0 14px; font-size: 0.95rem; color: #c8b8d0;">To prevent the MoE router from collapsing—sending all tokens to a single expert—we enforced an auxiliary loss penalty of <strong style="color: #ff4da6;">0.01</strong>. The LoRA adapters were explicitly targeted at the <code style="background: rgba(192,96,255,0.1); padding: 2px 5px; border-radius: 3px; color: #ff4da6;">experts</code> and <code style="background: rgba(192,96,255,0.1); padding: 2px 5px; border-radius: 3px; color: #ff4da6;">router</code> modules, ensuring the base 26B parameters remained frozen and pristine.</p>
<details style="background: #0d0212; border: 1px solid #2a0a35; border-radius: 4px; margin-top: 20px; overflow: hidden;">
<summary style="cursor: pointer; padding: 14px 18px; font-family: monospace; font-size: 0.85rem; color: #c060ff; list-style: none; display: flex; align-items: center; gap: 10px; transition: background 0.2s;">✦ Axolotl Training Configuration</summary>
<div style="padding: 0 18px 18px;">
<pre style="background: #020003; border: 1px solid #2a0a35; border-left: 3px solid #ff00ff; padding: 16px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #e0d0e8; margin: 16px 0; box-shadow: inset 0 0 20px rgba(255,0,255,0.03);"><code>base_model: google/gemma-4-26b-A4B-it
model_type: gemma4_moe
trust_remote_code: true
adapter: lora
lora_r: 16
lora_alpha: 32
lora_dropout: 0.0  # MUST be 0.0 for lora_target_parameters
lora_target_modules: 'model.language_model.layers.[\d]+.(_checkpoint_wrapped_module.)?(mlp|self_attn).(up|down|gate|q|k|v|o)_proj'
lora_target_parameters:
  - experts.gate_up_proj
  - experts.down_proj
aux_loss_alpha: 0.01 
learning_rate: 1.0e-4
lr_scheduler: cosine
warmup_steps: 20
max_steps: 250  # &lt;--- SANITY CHECK FIRST! Change to 250 later.
gradient_accumulation_steps: 16
micro_batch_size: 1
max_seq_length: 8192
sequence_len: 8192
bf16: true
gradient_checkpointing: true
flash_attention: false
attn_implementation: sdpa
datasets:
  - path: mixed_coding_traces.jsonl
    type: chat_template
save_steps: 50
logging_steps: 5
output_dir: ./outputs/gemma4-26b-mixed</code></pre>
</div>
</details>
</div>
<div style="padding: 32px 50px;">
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
<span style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #ff00ff; text-shadow: 0 0 8px rgba(255, 0, 255, 0.15); border-right: 2px solid #4a1260; padding-right: 16px;">04</span>
<span style="font-size: 1.3rem; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.08em;">Evaluation & Invocation</span>
</div>
<p style="margin: 0 0 14px; font-size: 0.95rem; color: #c8b8d0;">This model expects strict ChatML formatting. It is designed to operate as an autonomous agent within harnesses like OpenCode, OpenHands, or Aider. It will not merely write code; it will execute workflows.</p>
<pre style="background: #020003; border: 1px solid #2a0a35; border-left: 3px solid #ff00ff; padding: 16px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #e0d0e8; margin: 16px 0; box-shadow: inset 0 0 20px rgba(255,0,255,0.03);"><code>{"role": "system", "content": "You are an autonomous coding agent. Reproduce failures, inspect files, make the smallest coherent fix, and verify."}
{"role": "user", "content": "The deployment script is mangling spaces in arguments. Fix it."}
{"role": "assistant", "content": "I will inspect the repository state and reproduce the failure.", "tool_calls": [{"id": "call_1", "type": "function", "function": {"name": "Bash", "arguments": "{\"command\": \"ls -la\"}"}}]}</code></pre>
<div style="margin-top: 20px; padding: 16px; background: linear-gradient(90deg, rgba(192,96,255,0.1) 0%, rgba(255,0,255,0.05) 100%); border: 1px solid #4a1260; border-radius: 4px; display: flex; align-items: center; gap: 12px; font-family: monospace; font-size: 0.85rem; color: #c060ff;">
<span style="width: 8px; height: 8px; background: #ff00ff; border-radius: 50%; box-shadow: 0 0 8px #ff00ff;">&nbsp;</span>
<span>BENCHMARKS COMING SOON // HumanEval, SWE-bench, & Terminal-Bench evaluation currently in progress.</span>
</div>
</div>
</div>

<div style="text-align: center; margin-top: 20px;">
<p><em>May the uncomfortable-olive-cockroach rest in peace 🙏</em></p>
</div>