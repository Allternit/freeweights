# License review, 2026-11-15

Phase A license review of the batch1 review queue (`fw-lanes/batch1/work/classify-queue-batch1.json`, re-classified on main first). Each line is one decision: the queue key, the verdict, the license id, the deciding clause quoted from the text, and how many of the cluster's repos it cleared (a repo stays queued when another license in its lineage is still unread). Texts are in the work folder `license-texts/<sha256>.txt`; the decisions are in `policy/licenses.json` (`reviewed_texts`, `names`, `licenses`, `held`) and, for base models, in `catalog/_audit/licenses.csv`.

Repos cleared counts the verdicts after this change, with the base models recorded in `licenses.csv` counted as listed (they become catalog rows on the next catalog build; until then `classify.py` still sees a `parent:` base as not classified).

Verdicts: permissive and custom are hosted (signed manifest); gated, territory, non-commercial and unreviewed are link only; refused is not listed. Content clusters are left to PR #18.

## Decisions (180)

| Key | Verdict | License id | Deciding clause | Repos cleared |
| --- | --- | --- | --- | --- |
| `text:b82a2805162bde714a4eb27b9063c4fc3345d08a30be055134a6160e5430ba74` | custom | LicenseRef-Krea-2-Community | Commercial Use ... is permitted only if you ... have total company-wide annual revenue of less than one million United States dollars | 4 of 4 |
| `name:nvidia-nemotron-open-model-license` | custom | LicenseRef-NVIDIA-Nemotron-Open-Model | declared license_name maps to licenseref-nvidia-nemotron-open-model; text read at https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/ | 11 of 12 |
| `held:creativeml-openrail-m` | custom | LicenseRef-CreativeML-OpenRAIL-M | You may host ... reproduce and distribute copies ... provided that ... Use-based restrictions as referenced in paragraph 5 MUST be included as an enforceable provision (CompVis license.txt, 2022-08-22) | 12 of 12 |
| `text:8aff84e2629edb092f195c1d91bc368d8bb40eeb5fcedce2df19e405ee2cc876` | custom | LicenseRef-Qwen-License | If you are commercially using the Materials, and your product or service has more than 100 million monthly active users, you shall request a license from us. | 24 of 24 |
| `name:ltx-2-community-license-agreement` | custom | LicenseRef-LTX-2-Community | declared license_name maps to licenseref-ltx-2-community; same license as text e28ef68d90e1: "Entities with annual revenues of at least $10,000,000 ... are required to obtain a paid commercial use license" | 2 of 2 |
| `parent-unlicensed:Qwen/Qwen2.5-VL-3B-Instruct` | non-commercial | LicenseRef-Qwen-Research | license text sha256 b5c0e5cf74cf matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 16 of 16 |
| `parent-unlicensed:MiniMaxAI/MiniMax-Music3` | custom | LicenseRef-MiniMax-Music3-Community | license text sha256 b21d12df2ada matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `text:278b29a14cf6b0cc60519617909af61fa4a6aca4ee928d6178cb9799785c5cc0` | custom | LicenseRef-MiniMax-Model | to use, reproduce, distribute, copy, create derivative works of, and make modifications to the Model Materials | 1 of 1 |
| `text:4f5b74db4fd26299a166688de8a3bde046fd7d9cc13ecab64532c24310bc18d7` | custom | LicenseRef-LiveKit-Model | not to use any LiveKit Models on a standalone basis or with any frameworks other than LiveKit Agents | 3 of 3 |
| `text:20c797ce19af0c17de52c6afb144644768a591c521655f5ebf5712c9850f2887` | custom | LicenseRef-Kimi-K3 | If the Licensee ... operates a Model as a Service business, and the aggregate revenue ... exceeds 20 million US dollars ... the Licensee must enter into a separate agreement with Moonshot AI | 3 of 3 |
| `name:nvidia-open-model-license` | custom | LicenseRef-NVIDIA-Open-Model | declared license_name maps to licenseref-nvidia-open-model; text read at https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/ | 82 of 82 |
| `name:stabilityai-ai-community` | gated | LicenseRef-Stability-AI-Community | declared license_name maps to licenseref-stability-ai-community; same license as text d6f6b1a4dce5: "If You are using or distributing the Stability AI Materials for a Commercial Purpose, You must register with Stability AI" | 16 of 16 |
| `text:e28ef68d90e17b06308e4c5cba5c9a967b70c3d67f87ddc3dfc46a312cb6a134` | custom | LicenseRef-LTX-2-Community | Entities with annual revenues of at least $10,000,000 ... are required to obtain a paid commercial use license | 1 of 1 |
| `text:294fd63925d81e9a11a2bd71fefecbfefb0d1a329eef7de28b96e49b6da4f67e` | refused | LicenseRef-EXAONE-NC | Any use beyond the scope of this license, including any commercial application or external distribution, is strictly prohibited | 7 of 7 |
| `name:stable-audio-community` | gated | LicenseRef-Stability-AI-Community | declared license_name maps to licenseref-stability-ai-community; same license as text d6f6b1a4dce5: "If You are using or distributing the Stability AI Materials for a Commercial Purpose, You must register with Stability AI" | 5 of 5 |
| `text:be75acae5c99b0fb16ed6cfbf8f731e5121a729bef112d20337699407e796451` | custom | LicenseRef-LTX-2.x-Community | Entities with annual revenues of at least $10,000,000 ... are required to obtain a paid license for any use (excluding use solely for a Non-Commercial Purpose | 2 of 2 |
| `text:5188f2b355da20647257a3156db5834c794e5fb5e6d8dc4d4cdbb3180e75b85b` | custom | LicenseRef-LFM-1.0 | LFM Open License v1.0: "Threshold" shall mean annual revenue of 10 million United States dollars ($10,000,000) or more. | 20 of 20 |
| `text:c524b41658421b8b143c5b50637ef008909da56013ad12ccaba0536139ee35b0` | custom | LicenseRef-Kimi-Modified-MIT | if the Software ... is used for any of your commercial products or services that have more than 100 million monthly active users, or more than 20 million US dollars ... in monthly revenue, you shall prominently display "Kimi K2.5" | 1 of 1 |
| `text:7c7b8e244f6aa1ac8c32b74f56d42c41a0364dd2dabed8d9c6030a862e805b54` | custom | LicenseRef-Tongyi-Qianwen | If you are commercially using the Materials, and your product or service has more than 100 million monthly active users, You shall request a license from Us. | 49 of 49 |
| `name:polyform-strict-1-0-0` | refused | PolyForm-Strict-1.0.0 | declared license_name maps to polyform-strict-1.0.0; same license as text e2361f52ad5b: "for any permitted purpose, other than distributing the software or making changes or new works based on the software" | 1 of 1 |
| `text:d6f6b1a4dce5c852bd6d7d9482d002baf0ccdb71e662250b73be9eec8764ee8d` | gated | LicenseRef-Stability-AI-Community | If You are using or distributing the Stability AI Materials for a Commercial Purpose, You must register with Stability AI | 14 of 14 |
| `text:41c2cf8c272f6fb0080a97cd9d9bd7d4604072b80a0b10e7d65ca26ef5000c0c` | non-commercial | LicenseRef-Tongyi-Qianwen-Research | to use, reproduce, distribute ... the Materials FOR NON-COMMERCIAL PURPOSES ONLY. | 13 of 13 |
| `text:ccfee4895df06bcab524151c278e8dde88bbe76165a24ecbcbcf9fafd71fd2b3` | custom | LicenseRef-DeepSeek-1.0 | Use-based restrictions as referenced in paragraph 5 MUST be included as an enforceable provision by You in any type of legal agreement ... governing the use and/or distribution | 17 of 17 |
| `text:b280da6f496d75e0c5beb79b03520d190fce67dfe12f75cf3aadad8670839d93` | custom | LicenseRef-Kimi-Modified-MIT | same as c524b4165842 with "Kimi K2" (2025) | 3 of 3 |
| `text:9cb73476cecdfabac7775bf7c225bd5f6017d5d678372917e4456964c0454f7a` | custom | LicenseRef-Kimi-Modified-MIT | same as c524b4165842 with "Kimi K2.7 Code" | 1 of 1 |
| `name:ltx-2-community-license` | custom | LicenseRef-LTX-2-Community | declared license_name maps to licenseref-ltx-2-community; same license as text e28ef68d90e1: "Entities with annual revenues of at least $10,000,000 ... are required to obtain a paid commercial use license" | 1 of 2 |
| `text:6373a886779a26e56af8070699ebaa8f90104cadcc7bbf6897037f72017bedfe` | non-commercial | LicenseRef-MiniMax-M2.7-NC | Any Commercial Use of the Software or any derivative work thereof is prohibited without obtaining a separate, prior written authorization from MiniMax. | 1 of 1 |
| `name:kimi-k3` | custom | LicenseRef-Kimi-K3 | declared license_name maps to licenseref-kimi-k3; same license as text 20c797ce19af: "If the Licensee ... operates a Model as a Service business, and the aggregate revenue ... exceeds 20 million US dollars ... the Licensee must enter into a separate agreement with Moonshot AI" | 1 of 1 |
| `text:1d4ab2d8404287de44429024a78b58d3aabc4df9d0c490e73fec9ff1fd842529` | custom | LicenseRef-Kimi-Modified-MIT | same as c524b4165842 with "Kimi K2.6" | 1 of 1 |
| `name:llama4` | gated | LicenseRef-Llama-4-Community | declared license_name maps to llama4; same license as text f95172ae8c82: "Llama 4 Community License: "provide a copy of this Agreement ... and prominently display \"Built with Llama\""" | 15 of 15 |
| `name:deepseek-license` | custom | LicenseRef-DeepSeek-1.0 | declared license_name maps to licenseref-deepseek; same license as text ccfee4895df0: "Use-based restrictions as referenced in paragraph 5 MUST be included as an enforceable provision by You in any type of legal agreement ... governing the use and/or distribution" | 12 of 12 |
| `parent:stepfun-ai/step-3.5-flash` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 4 of 4 |
| `name:qwen` | custom | LicenseRef-Qwen-License | declared license_name maps to licenseref-qwen-license; same license as text 8aff84e2629e: "If you are commercially using the Materials, and your product or service has more than 100 million monthly active users, you shall request a license from us." | 29 of 30 |
| `name:krea-2-community-license` | custom | LicenseRef-Krea-2-Community | declared license_name maps to licenseref-krea-2-community; same license as text b82a2805162b: "Commercial Use ... is permitted only if you ... have total company-wide annual revenue of less than one million United States dollars" | 2 of 2 |
| `text:d13f50f252706283b7495f659545d907d8b2e40cec5ae9c0e428450ee57c1868` | gated | LicenseRef-GLM-4 | 本许可允许您免费使用本仓库中的所有开源模型进行学术研究，对于希望将模型用于商业目的的用户，需在这里完成登记 (academic research free; commercial use must register) | 14 of 14 |
| `name:deepseek` | custom | LicenseRef-DeepSeek-1.0 | declared license_name maps to licenseref-deepseek; same license as text ccfee4895df0: "Use-based restrictions as referenced in paragraph 5 MUST be included as an enforceable provision by You in any type of legal agreement ... governing the use and/or distribution" | 13 of 13 |
| `name:sapiens2-license` | custom | LicenseRef-Sapiens2 | declared license_name maps to licenseref-sapiens2; same license as text 1c77a629ee16: "If you distribute or make the Sapiens Materials ... available to a third party, you may only do so under the terms of this Agreement" | 22 of 22 |
| `text:b53f2fdda3049b0e9013207be51efc2d372cda1fcfdd8bb4bb8b22658ca5db9c` | non-commercial | LicenseRef-MiniMax-Community | to deal in the Software for non-commercial purposes | 2 of 2 |
| `text:c04f7c8d5721b4081eb4e95ebf19224ffd459e5d185a13ca2d7dc4405b34ed95` | custom | LicenseRef-Qwen-License | same text as 8aff84e2629e (whitespace differs) | 7 of 7 |
| `parent:OpenGVLab/InternVL3_5-8B-Pretrained` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 5 of 5 |
| `name:qwen-community-1.0` | custom | LicenseRef-Qwen-Community-1.0 | declared license_name maps to licenseref-qwen-community-1.0; table entry | 2 of 2 |
| `name:apple-amlr` | non-commercial | LicenseRef-Apple-AMLR | declared license_name maps to licenseref-apple-amlr; same license as text d8f5d9dfbdb6: "to use, copy, modify, distribute, and create Model Derivatives ... exclusively for Research Purposes" | 10 of 10 |
| `text:648194727930df730890e9f9affdbcc5c930d406d6829559b25ca3d5a973fc8c` | custom | LicenseRef-Mistral-Modified-MIT | You are not authorized to exercise any rights under this license if the global consolidated monthly revenue of your company (or that of your employer) exceeds $20 million | 10 of 10 |
| `name:mit-and-apache-2.0` | permissive | MIT AND Apache-2.0 | declared license_name maps to mit-and-apache-2.0; same license as text 3799742c9ad6: "clip_l.safetensors -- MIT License ... t5xxl_fp16.safetensors ... -- Apache License 2.0" | 1 of 1 |
| `name:sam-license` | custom | LicenseRef-SAM | declared license_name maps to licenseref-sam; same license as text bec48f70bd37: "If you distribute or make the SAM Materials ... available to a third party, you may only do so under the terms of this Agreement and you shall provide a copy of this Agreement" | 2 of 2 |
| `text:a3a0e9449cb691a12f4de1d03725fd41326614fdeaf5d80b28c51187da0bed0e` | custom | LicenseRef-DeepSeek-1.0 | same text as ccfee4895df0 (whitespace differs) | 4 of 4 |
| `text:e3e51427556222cb152990f47991eedbd6ffa6561bb9346580d32e841e13530c` | territory | LicenseRef-Tencent-Hunyuan-Community | "Territory" shall mean the worldwide territory, excluding the territory of the European Union, United Kingdom and South Korea. | 1 of 1 |
| `text:3fe50bcae6f8a3c8aac0eb641f2cdf62f066f1967a95bb4303eefd7e123ff0f1` | permissive | Apache-2.0 | This project is dual-licensed under the OpenMDW License 1.0 and the Apache License 2.0. You may use this project under the terms of either license, at your option. | 1 of 1 |
| `text:6e521a32ba6661de2b3e7b1cd27d7e1e9b8ff99633c79462a23284cac13c8b8d` | custom | LicenseRef-Tongyi-Qianwen | same text as 7c7b8e244f6a (whitespace differs) | 2 of 2 |
| `held:bigcode-openrail-m` | custom | LicenseRef-BigCode-OpenRAIL-M | 5.1. You may Share the Model ... under any license of your choice that does not contradict the restrictions in Attachment A (BigCode model license agreement space) | 5 of 5 |
| `text:fa2dd8ae5b5fa27c2b5bbc835a053930efcf42451768aebdfac230f350f1aa62` | custom | LicenseRef-Kimi-Modified-MIT | same as c524b4165842 with "Kimi K2" (2025) | 2 of 2 |
| `text:5a974fcf1ffb2bc86af3ce6a6f55b60e351537cf6761443a1dc2db557f9c82af` | non-commercial | LicenseRef-NVIDIA-Source-Code-NC | The Work and any derivative works thereof only may be used or intended for use non-commercially. | 1 of 1 |
| `text:733a32442087acbda12ecafe8e71eb8ee5890c89b50ce7ac4ea3777faa3c823e` | custom | LicenseRef-Fish-Audio-Community-1.0 | for a Commercial Purpose, but only while Your Annual Revenue is less than USD 500,000 | 5 of 5 |
| `text:52ba86caf2ccf9ef4ee6553586f2ed3755dbfd9a9b182fee5b49693283c8f065` | custom | LicenseRef-LTX-2-Community | same as e28ef68d90e1 ("more than" for "or more") | 1 of 1 |
| `name:msrla` | refused | LicenseRef-MSRLA | declared license_name maps to licenseref-msrla; same license as text 17694bc66d04: "If machine learning model(s) are included, you may use the model(s), but you may not distribute the models." | 1 of 1 |
| `text:3799742c9ad6becfab256ac51ab1069e9a75ccf67cb886c10a61c078399c21f8` | permissive | MIT AND Apache-2.0 | clip_l.safetensors -- MIT License ... t5xxl_fp16.safetensors ... -- Apache License 2.0 | 1 of 1 |
| `text:a136bc4137ef3d7a7a54963164a47270f73e497917728ea0f4407a0115db1290` | custom | LicenseRef-Qwen3.8-Max | If the licensee ... conducts a Model as a Service or AI Work Assistant business, and the aggregate revenue ... exceeds US$50,000,000 ... shall obtain a separate license | 2 of 2 |
| `text:458a5c57d8e622e395eb0e59799ba5bba1ea7524ffd120ee6e3018688d7d6ace` | custom | LicenseRef-Muse-Spark-Open | Licensee shall prominently display "Built with Muse Spark Open" | 8 of 8 |
| `text:f1702a540abe80caa3458a4eb539d8a138ffeab99d971d14a99083726814037e` | gated | LicenseRef-CogVideoX | Users who wish to use the models for commercial purposes must register and obtain a basic commercial license | 7 of 7 |
| `name:ltx-2.x-community-license-agreement` | custom | LicenseRef-LTX-2.x-Community | declared license_name maps to licenseref-ltx-2.x-community; same license as text be75acae5c99: "Entities with annual revenues of at least $10,000,000 ... are required to obtain a paid license for any use (excluding use solely for a Non-Commercial Purpose" | 1 of 1 |
| `text:8c1762fb4bd94c8f17e114c5caa567e0948e1da7d02b79b55e99be9616e0f9e3` | refused | LicenseRef-EXAONE-NC | EXAONE 1.2-NC: same research-only grant and the same ban on external distribution | 10 of 10 |
| `text:cc7da9ea0f8a97ef15ab3bf0389e636ce79ffca1aef5489520796ac87d87a87b` | custom | LicenseRef-bilibili-Model-Use | more than 100 million monthly active users ... or annual revenue ... exceeded RMB 1 billion, You must request a separated license | 1 of 1 |
| `name:kwaipilot-license` | custom | LicenseRef-Kwaipilot-Model | declared license_name maps to licenseref-kwaipilot-model; same license as text bf552305d13e: "You may ... distribute or make available to Third Parties the Model Works, provided that You ... provide ... the source of the Model and a copy of this Agreement" | 6 of 6 |
| `parent-unlicensed:huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated` | permissive | MIT | "Permission is hereby granted, free of charge, to any person obtaining a copy of this software ... to deal in the Software without restriction" (standard MIT text); Base model of queued derivatives. LICENSE file read (cardData license None) | 2 of 2 |
| `text:9db8f114ce84e3eba181a98edb3034cef64ee09de8b1b2af765c7433554491c9` | non-commercial | LicenseRef-Katanemo-Community | If you use, reproduce, modify, distribute, and create derivative works from the Katanemo Materials for commercial purposes, you must obtain a separate commercial license from DigitalOcean | 3 of 3 |
| `name:swift-open-license-1.0` | custom | LicenseRef-Swift-Open-1.0 | declared license_name maps to licenseref-swift-open-1.0; same license as text 1367057bf170: "The rights granted under this License for Commercial Use are conditioned upon You or Your Legal Entity not exceeding the Threshold." | 3 of 3 |
| `name:minimax-community` | non-commercial | LicenseRef-MiniMax-Community | declared license_name maps to licenseref-minimax-community; same license as text b53f2fdda304: "to deal in the Software for non-commercial purposes" | 4 of 4 |
| `text:d242ebedb53ffd7e26c220e3305665ca47e4e5267fa62ff4cdeb3953b8353c78` | custom | LicenseRef-Mistral-Ecosystem-Open-Weight | If the Licensee or any of its affiliates operates a Model as a Service business, the Licensee must enter into a separate commercial license with Mistral | 6 of 6 |
| `name:mistral-ecosystem-open-weight` | custom | LicenseRef-Mistral-Ecosystem-Open-Weight | declared license_name maps to licenseref-mistral-ecosystem-open-weight; same license as text d242ebedb53f: "If the Licensee or any of its affiliates operates a Model as a Service business, the Licensee must enter into a separate commercial license with Mistral" | 1 of 1 |
| `text:8b2e018eeb3967a4636ccc57528440b33c14dd6e02ad67571fc7759489dde9a0` | custom | LicenseRef-Boson-Higgs-Audio-2-Community | greater than 100,000 annual active users ... you must request an expanded license from Boson AI | 3 of 3 |
| `text:d8f5d9dfbdb60dc81b8f1720421699e7811070f0b46f6668f90253d5ac8c0b20` | non-commercial | LicenseRef-Apple-AMLR | to use, copy, modify, distribute, and create Model Derivatives ... exclusively for Research Purposes | 1 of 1 |
| `parent:OpenGVLab/InternVL3_5-4B-Pretrained` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 5 of 5 |
| `name:exaone` | refused | LicenseRef-EXAONE-NC | declared license_name maps to licenseref-exaone-nc; same license as text 294fd63925d8: "Any use beyond the scope of this license, including any commercial application or external distribution, is strictly prohibited" | 9 of 9 |
| `name:tongyi-qianwen` | custom | LicenseRef-Tongyi-Qianwen | declared license_name maps to licenseref-tongyi-qianwen; same license as text 7c7b8e244f6a: "If you are commercially using the Materials, and your product or service has more than 100 million monthly active users, You shall request a license from Us." | 12 of 12 |
| `parent:OpenGVLab/InternVL3_5-14B-Pretrained` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 5 of 5 |
| `parent:OpenGVLab/InternVL3_5-2B-Pretrained` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 5 of 5 |
| `text:710a4abbfbd30343be4b1d507835a1ae27e4b441e8a1211befc3f2124347e81a` | gated | LicenseRef-GLM-4 | GLM-Edge: same text as d13f50f25270 with the model name changed | 10 of 10 |
| `name:muse-model-license` | custom | LicenseRef-Muse-Spark-Open | declared license_name maps to licenseref-muse-spark-open; same license as text 458a5c57d8e6: "Licensee shall prominently display "Built with Muse Spark Open"" | 1 of 1 |
| `name:glm-4` | gated | LicenseRef-GLM-4 | declared license_name maps to licenseref-glm-4; same license as text d13f50f25270: "本许可允许您免费使用本仓库中的所有开源模型进行学术研究，对于希望将模型用于商业目的的用户，需在这里完成登记 (academic research free; commercial use must register)" | 3 of 3 |
| `parent-unlicensed:huihui-ai/DeepSeek-R1-Distill-Llama-70B-abliterated` | permissive | MIT | "Permission is hereby granted, free of charge, to any person obtaining a copy of this software ... to deal in the Software without restriction" (standard MIT text); Base model of queued derivatives. LICENSE file read (cardData license None) | 1 of 1 |
| `name:llama3` | gated | LicenseRef-Llama-3-Community | declared license_name maps to llama3; same license as text 60fb8cdec6dc: "Meta Llama 3 Community License: "prominently display \"Built with Meta Llama 3\""" | 3 of 3 |
| `parent-unlicensed:deepseek-ai/DeepSeek-V3` | custom | LicenseRef-DeepSeek-1.0 | license text sha256 ccfee4895df0 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 3 of 3 |
| `parent:OpenGVLab/InternVL3_5-30B-A3B-Pretrained` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 5 of 5 |
| `name:mistral-ecosystem-open-weight-license` | custom | LicenseRef-Mistral-Ecosystem-Open-Weight | declared license_name maps to licenseref-mistral-ecosystem-open-weight; same license as text d242ebedb53f: "If the Licensee or any of its affiliates operates a Model as a Service business, the Licensee must enter into a separate commercial license with Mistral" | 2 of 2 |
| `parent:OpenGVLab/InternVL3_5-1B-Pretrained` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 5 of 5 |
| `text:af5b7213e07135d1dcd2c745612fa6b074b1f982879f6d52158062f9245b5964` | gated | LicenseRef-Moonshine-Community | register with Moonshine AI at (https://moonshine.ai/community-license) | 12 of 12 |
| `parent-unlicensed:jinaai/jina-embeddings-v4` | non-commercial | LicenseRef-Qwen-Research | license text sha256 5410c8985a7f matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 4 of 4 |
| `parent:google/gemma-4-31b-it` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 6 of 6 |
| `text:9b60b9d0411f54d4087484ad4acf28ca6fd9f6a84c30ddacb04de2c623254749` | gated | LicenseRef-Stability-AI-Community | same as d6f6b1a4dce5 (quotes, numbering) | 9 of 9 |
| `text:17694bc66d045524ab4c0cf15765414cdf71cdf507520a97b1c2721303749e67` | refused | LicenseRef-MSRLA | If machine learning model(s) are included, you may use the model(s), but you may not distribute the models. | 1 of 1 |
| `name:qwen3.8-max` | custom | LicenseRef-Qwen3.8-Max | declared license_name maps to licenseref-qwen3.8-max; same license as text a136bc4137ef: "If the licensee ... conducts a Model as a Service or AI Work Assistant business, and the aggregate revenue ... exceeds US$50,000,000 ... shall obtain a separate license" | 1 of 1 |
| `text:f95172ae8c823aebb14f73810fc71ce026e27555a17134d4720233caf8c2b2f0` | gated | LicenseRef-Llama-4-Community | Llama 4 Community License: "provide a copy of this Agreement ... and prominently display \"Built with Llama\"" | 2 of 2 |
| `name:tongyi-qianwen-research` | non-commercial | LicenseRef-Tongyi-Qianwen-Research | declared license_name maps to licenseref-tongyi-qianwen-research; same license as text 41c2cf8c272f: "to use, reproduce, distribute ... the Materials FOR NON-COMMERCIAL PURPOSES ONLY." | 3 of 3 |
| `parent:OpenGVLab/InternVL3_5-38B-Pretrained` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 4 of 4 |
| `parent:OpenGVLab/InternViT-6B-448px-V1-5` | permissive | MIT | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (mit); no LICENSE file in repo | 9 of 9 |
| `parent-unlicensed:tencent/Hunyuan-7B-Instruct` | territory | LicenseRef-Tencent-Hunyuan-Community | license text sha256 0d666200251c matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `text:867daee3b68e4e9392c9767fec4f099096fa6ad67adfc9c24020494e97766778` | custom | LicenseRef-Mistral-Modified-MIT | same as 648194727930 (2025 notice) | 2 of 2 |
| `name:stability-ai-community` | gated | LicenseRef-Stability-AI-Community | declared license_name maps to licenseref-stability-ai-community; same license as text d6f6b1a4dce5: "If You are using or distributing the Stability AI Materials for a Commercial Purpose, You must register with Stability AI" | 1 of 1 |
| `text:9509b94e411ef77117514268f8338d40fa76287a506a957025e97e266e9fb450` | non-commercial | LicenseRef-SAI-NC-Community | to use, reproduce, distribute, and create Derivative Works of, the Software Products, in each case for Non-Commercial Uses only | 1 of 1 |
| `name:grok-2` | custom | LicenseRef-xAI-Community | declared license_name maps to licenseref-xai-community; table entry | 1 of 1 |
| `parent-unlicensed:tencent/Hunyuan-0.5B-Instruct` | territory | LicenseRef-Tencent-Hunyuan-Community | license text sha256 a82a277ebb5d matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `parent-unlicensed:deepseek-ai/DeepSeek-Prover-V2-7B` | permissive | MIT | "Permission is hereby granted, free of charge, to any person obtaining a copy of this software ... to deal in the Software without restriction" (standard MIT text); Base model of queued derivatives. LICENSE file read (cardData license None) | 1 of 1 |
| `parent-unlicensed:tencent/Hunyuan-1.8B-Instruct` | territory | LicenseRef-Tencent-Hunyuan-Community | license text sha256 a01de4040025 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `text:3587f7eb49ecda1fdd4b53fffd72c043337c8772eaf5eeade9a9c1b07421c183` | custom | LicenseRef-INF-Model | You are permitted to reproduce and distribute the Model or any Derivative Models ... If you choose to distribute the Model, it is mandatory to: Provide each recipient with a copy of this Agreement. | 4 of 4 |
| `text:1367057bf17041aa1d69286a1400be5f464d2f8b8f54f600088b209eac1850be` | custom | LicenseRef-Swift-Open-1.0 | The rights granted under this License for Commercial Use are conditioned upon You or Your Legal Entity not exceeding the Threshold. | 1 of 1 |
| `text:b7833bfbf8008d43a06103eaebc873c64dfb3fee1135942fa1e41ac4b86cc6df` | gated | LicenseRef-GLM-4 | CodeGeeX4: same text as d13f50f25270 with the model name changed | 2 of 2 |
| `name:inf` | custom | LicenseRef-INF-Model | declared license_name maps to licenseref-inf-model; same license as text 3587f7eb49ec: "You are permitted to reproduce and distribute the Model or any Derivative Models ... If you choose to distribute the Model, it is mandatory to: Provide each recipient with a copy of this Agreement." | 2 of 2 |
| `text:7ef64a58bdbe3ca4dc3299df7ef969cb41065301852356d152309dc471f97c7b` | territory | LicenseRef-Youtu-LLM | Youtu-LLM IS NOT INTENDED FOR USE WITHIN THE EUROPEAN UNION. IN THE EVENT OF ANY CONFLICT, THIS CLAUSE SHALL PREVAIL. | 2 of 2 |
| `parent:google/gemma-4-31b` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 4 of 4 |
| `text:7a3af3e6b43fcb7c486ea8167252a36a9532dcbdf02d1704a749881872ec551c` | custom | LicenseRef-Swift-Open-1.0 | same as 1367057bf170 (base model Qwen3.8-Flash-Next under the Qwen Community License) | 2 of 2 |
| `name:tencent-hunyuan-a13b` | territory | LicenseRef-Tencent-Hunyuan-Community | declared license_name maps to licenseref-tencent-hunyuan-community; same license as text e3e514275562: ""Territory" shall mean the worldwide territory, excluding the territory of the European Union, United Kingdom and South Korea." | 3 of 3 |
| `parent:mistralai/mistral-7b-instruct-v0.2` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 1 of 1 |
| `text:59b99642b95ea21630e311198ddbfffbfe05aadba0c2f5d884cbdf4efcc90f44` | territory | LicenseRef-MiniMax-H3-Community | "Excluded Territories" means the European Union, the United Kingdom, the Republic of Korea and the United States of America. | 1 of 1 |
| `parent-unlicensed:browser-use/bu-30b-a3b-preview` | custom | LicenseRef-Browser-Use-Modified-MIT | license text sha256 26272dfb472c matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `text:3149da85443e5802bf4e97678c0d1cba8917382ac5aa1ecb2c0353c508c49a14` | gated | LicenseRef-CogVLM | Users who wish to use the models for commercial purposes must register | 6 of 6 |
| `text:191ee7ebecd395ef20b98fa55c803d2d0bfc50cdbefaa0eafbaef3e79f4d2475` | custom | LicenseRef-LTX-2-Community | same as e28ef68d90e1 (licensing link added) | 1 of 1 |
| `name:fastino-community` | custom | LicenseRef-Fastino-Community | declared license_name maps to licenseref-fastino-community; same license as text 4948c7c82e68: "used in Production for any Commercial Use by an entity whose Annual Revenue exceeds 10,000,000 US dollars ... shall obtain a separate written commercial agreement" | 1 of 1 |
| `name:katanemo-research` | non-commercial | LicenseRef-Katanemo-Community | declared license_name maps to licenseref-katanemo-community; same license as text 9db8f114ce84: "If you use, reproduce, modify, distribute, and create derivative works from the Katanemo Materials for commercial purposes, you must obtain a separate commercial license from DigitalOcean" | 2 of 2 |
| `parent:unsloth/qwen2.5-14b-bnb-4bit` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 5 of 5 |
| `name:cogvlm2` | gated | LicenseRef-CogVLM | declared license_name maps to licenseref-cogvlm; same license as text 3149da85443e: "Users who wish to use the models for commercial purposes must register" | 1 of 1 |
| `text:41f3a23ef5ca5bf9dec082e2f0da6a9c74b69e24d15b7baa8a8e9dd2edf7cf63` | non-commercial | LicenseRef-Tongyi-Qianwen-Research | same text as 41c2cf8c272f (whitespace differs) | 6 of 6 |
| `text:60fb8cdec6dc73528073d611d551f25b922868cc7d2424a4cec738924a3d1cc2` | gated | LicenseRef-Llama-3-Community | Meta Llama 3 Community License: "prominently display \"Built with Meta Llama 3\"" | 1 of 1 |
| `parent-unlicensed:xai-org/grok-2` | custom | LicenseRef-xAI-Community | license text sha256 2576e2a47e57 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `text:915ffe920f90088d15986bb6f7fab02e08b9a167cfbde65b012741ad88010e4f` | custom | LicenseRef-Swift-Open-1.0 | same as 1367057bf170 | 1 of 1 |
| `name:glm-5.3` | custom | LicenseRef-GLM-5.3 | declared license_name maps to licenseref-glm-5.3; table entry | 2 of 2 |
| `text:f715982df6ce767ae64864d74b95644e5d658aab54717dbceeb252eb3cbcb421` | permissive | Apache-2.0 | This model is a derivative work of Qwen3-0.6B ... licensed under the Apache License, Version 2.0 (full Apache-2.0 text follows) | 2 of 2 |
| `text:906173ddd513292907b27eef9c5e7d35085bfc4a17c6c4e599677ee5bdcf19dd` | custom | LicenseRef-Qwen-License | same text as 8aff84e2629e (whitespace differs) | 1 of 1 |
| `parent-unlicensed:deepseek-ai/DeepSeek-V3-Base` | custom | LicenseRef-DeepSeek-1.0 | license text sha256 ccfee4895df0 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 4 of 4 |
| `text:4102997e49bf6fd1f96a426feabb6ec8611d94a8f318a9473a5277498c4c6df5` | non-commercial | LicenseRef-ContextPilot | ContextPilot-14B is made available solely for the purpose of scientific research and development. You shall not use it for any other purpose. | 1 of 1 |
| `parent-unlicensed:tencent/Hunyuan-4B-Instruct` | territory | LicenseRef-Tencent-Hunyuan-Community | license text sha256 b9a1719c6f32 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `parent-unlicensed:deepseek-ai/DeepSeek-Prover-V2-671B` | permissive | MIT | "Permission is hereby granted, free of charge, to any person obtaining a copy of this software ... to deal in the Software without restriction" (standard MIT text); Base model of queued derivatives. LICENSE file read (cardData license None) | 1 of 1 |
| `parent-unlicensed:allenai/tulu-2-13b` | custom | LicenseRef-AI2-ImpACT-LR-1.0 | license text sha256 a81b6035bfb4 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 17 of 17 |
| `parent-unlicensed:nvidia/Nemotron-Orchestrator-8B` | non-commercial | LicenseRef-NVIDIA-Source-Code-NC | license text sha256 80b482a0c943 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `parent:nbeerbower/Qwen2.5-32B-abliterated-LORA` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 4 of 4 |
| `name:gemma-terms-of-use` | gated | LicenseRef-Gemma | declared license_name maps to gemma; table entry | 3 of 3 |
| `parent:deepseek-ai/DeepSeek-v3-0324` | permissive | MIT | "Permission is hereby granted, free of charge, to any person obtaining a copy of this software ... to deal in the Software without restriction" (standard MIT text); Base model of queued derivatives. LICENSE file read (cardData license 'mit') | 1 of 1 |
| `parent:unsloth/phi-3.5-mini-instruct-bnb-4bit` | permissive | MIT | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (mit); no LICENSE file in repo | 2 of 2 |
| `parent:flammenai/Flammades-Mistral-Nemo-12B` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 4 of 4 |
| `parent:microsoft/phi-3-mini-4k-instruct` | permissive | MIT | "Permission is hereby granted, free of charge, to any person obtaining a copy of this software ... to deal in the Software without restriction" (standard MIT text); Base model of queued derivatives. LICENSE file read (cardData license 'mit') | 3 of 3 |
| `parent-unlicensed:sarvamai/sarvam-1` | non-commercial | LicenseRef-Sarvam-Research | license text sha256 1dcf264c3e30 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 1 of 1 |
| `parent:google/gemma-4-26b-a4b` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 1 of 2 |
| `parent:qwen/Qwen3.5-35B-A3B` | permissive | Apache-2.0 | "Apache License Version 2.0, January 2004" (standard text); Base model of queued derivatives. LICENSE file read (cardData license 'apache-2.0') | 2 of 2 |
| `parent-unlicensed:Tiiny/SmallThinker-3B-Preview` | non-commercial | LicenseRef-Qwen-Research | license text sha256 ef52482bb785 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 2 of 2 |
| `text:b21d12df2adae59dad3fcf80c1d81492654c662342f497d9a9770198c9317e58` | custom | LicenseRef-MiniMax-Music3-Community | You shall obtain a separate, prior written authorization from MiniMax ... if the aggregate yearly revenue ... exceeds 20 million US dollars | 3 of 3 |
| `text:4e7dd26d9c9294e1e0549587505dcf4ba40c7c82c50850559f846f92245f6120` | custom | LicenseRef-LTX-2.x-Community | same as be75acae5c99 (Markdown formatting) | 2 of 2 |
| `parent-unlicensed:tencent/HY-MT1.5-1.8B` | territory | LicenseRef-Tencent-Hunyuan-Community | license text sha256 d7d9db858500 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 2 of 2 |
| `text:c0092bdb55bb39a32898ea8c1692b1969df0821b47ea42fa3435f5fd2d0a515a` | non-commercial | LicenseRef-SAI-NC-Community | same text as 9509b94e411e | 1 of 1 |
| `parent:PleIAs/Pleias-1.2B-Preview` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 2 of 2 |
| `text:f748459fcf7a7f26f591ccd8364422e2a707cd68a4b7a0d5151a0850e9b656ec` | non-commercial | LicenseRef-SAI-NC-Community | same text as 9509b94e411e | 2 of 2 |
| `text:4948c7c82e6879d25a10ebcb153361b373cec319490f6ba4616c2825df37c989` | custom | LicenseRef-Fastino-Community | used in Production for any Commercial Use by an entity whose Annual Revenue exceeds 10,000,000 US dollars ... shall obtain a separate written commercial agreement | 1 of 1 |
| `text:8257988a0f68ad229af9f5357c4f4ce7d8f1a00022e6263e7dde83c08939ed4c` | non-commercial | LicenseRef-Apple-AMLR | same as d8f5d9dfbdb6 (2026) | 1 of 1 |
| `text:d956d2d305a0639211c9cbde71501accb0e1474cc9ddf79a47820a522aff6f98` | permissive | Apache-2.0 | Apache License Version 2.0, January 2004 (standard text) | 1 of 1 |
| `text:e41645104f7e83d614d94daf93c452ebeaeca12415865b0f76cc02374ad3a223` | custom | LicenseRef-bilibili-Model-Use | same text as cc7da9ea0f8a | 1 of 1 |
| `text:1c77a629ee16972ddb9844378038b20321143a6faf0cac26c2c04dc9b61c5288` | custom | LicenseRef-Sapiens2 | If you distribute or make the Sapiens Materials ... available to a third party, you may only do so under the terms of this Agreement | 1 of 1 |
| `text:c1211a85bc9fab9e4bcf4b3711d2e100967bc3244b6b48404ce609553660ceae` | non-commercial | LicenseRef-Apple-AMLR | same text as d8f5d9dfbdb6 | 1 of 1 |
| `text:6eb8a48a607a23a77032ec5849ef6077a9bd519c8fa0ed37fe1a9e5e82c252a6` | refused | LicenseRef-Personal-Use-1.0 | Sell, rent, lease, license, sublicense, or redistribute the Model or its Derivatives to any third party. | 1 of 1 |
| `text:e2361f52ad5be22b937a6e983c824a534c5cffa454b6c34af2f8ce0c2cdf7c1a` | refused | PolyForm-Strict-1.0.0 | for any permitted purpose, other than distributing the software or making changes or new works based on the software | 1 of 1 |
| `parent:google/gemma-4-e2b` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 1 of 1 |
| `parent:google/gemma-4-e4b` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 1 of 1 |
| `text:c1ad1d99a8d46a00610db35d97c787d10b7e81661e48a1e389ae6cbb51a45630` | gated | LicenseRef-CogAgent | Users wishing to use the model for commercial purposes must complete registration | 1 of 1 |
| `text:d9950a9f78d08ebfcf55567f0b7265893abfbdd57daa2f62cf08b96294386bec` | non-commercial | LicenseRef-Katanemo-Community | If you are commercially using the Materials, you shall request a license from us. | 1 of 1 |
| `parent-unlicensed:allenai/tulu-2-70b` | custom | LicenseRef-AI2-ImpACT-LR-1.0 | license text sha256 a81b6035bfb4 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256 | 4 of 4 |
| `text:fd0689724426a3adbc3c8866e85a14c63b1c02df220a371e38699cda47ee276e` | gated | LicenseRef-GLM-4 | same text as d13f50f25270 | 1 of 1 |
| `parent:unsloth/llama-3.2-3b-instruct-bnb-4bit` | gated | LicenseRef-Llama-3.2-Community | Llama 3.2 Community License (table entry read 2026-11-15); Base model of queued derivatives. License from the repo's cardData (llama3.2); no LICENSE file in repo | 2 of 2 |
| `text:e7914ddbb068110d9f9e1e1283dd4bc23ec2a5223909b7fd2a2ca9a152d853fe` | custom | LicenseRef-Hi3D-Open-1.0 | Within sixty days after first triggering the Scale Threshold, you must notify OCEANO HK HOLDING LIMITED and apply for a separate written license. | 2 of 2 |
| `text:d6b41838fa748a1d88481a3d0ef476c87f5538747f54057f9324066606af32a7` | non-commercial | LicenseRef-FAIR-NC-Research-1 | FAIR Noncommercial Research License v1 | 1 of 1 |
| `text:bf552305d13e35571ee07d8b4ad060932c4a95640df2e07703fde0bd8b8e8751` | custom | LicenseRef-Kwaipilot-Model | You may ... distribute or make available to Third Parties the Model Works, provided that You ... provide ... the source of the Model and a copy of this Agreement | 1 of 1 |
| `parent:Vortex5/G4-Moonlight-Dusk-26B-A4B` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 2 of 2 |
| `text:214742a89d95d503b15a0ae7a459e0df214ad02493233016e329a812e22009c3` | custom | LicenseRef-DeepSeek-1.0 | same text as ccfee4895df0 (whitespace differs) | 1 of 1 |
| `parent:unsloth/qwen2.5-0.5b-instruct-unsloth-bnb-4bit` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 2 of 2 |
| `parent:Supralabs/Supra2-Nano` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 1 of 1 |
| `parent-unlicensed:facebook/dinov3-vitl16-chmv2-dpt-head` | gated | LicenseRef-DINOv3 | license text sha256 f52767b81fa3 matches a text read on 2026-11-15 (see license-review-2026-11-15.md); Base model of queued derivatives. LICENSE text matched by sha256; gated (manual) at source: link only | 1 of 1 |
| `name:youtu-llm` | territory | LicenseRef-Youtu-LLM | declared license_name maps to licenseref-youtu-llm; same license as text 7ef64a58bdbe: "Youtu-LLM IS NOT INTENDED FOR USE WITHIN THE EUROPEAN UNION. IN THE EVENT OF ANY CONFLICT, THIS CLAUSE SHALL PREVAIL." | 1 of 1 |
| `text:507fa93cb20c8ea1cb59831122f8c37e8e3f7badb9605951cfaf6613ddb7cb08` | gated | LicenseRef-Stability-AI-Community | same as d6f6b1a4dce5 (quotes, numbering) | 2 of 2 |
| `parent:unsloth/gemma-4-26b-a4b-it` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 1 of 1 |
| `parent:tiiuae/falcon-perception` | permissive | Apache-2.0 | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (apache-2.0); no LICENSE file in repo | 1 of 1 |
| `parent:Delta-Vector/Austral-70B-Preview` | gated | LicenseRef-Llama-3.3-Community | Llama 3.3 Community License (table entry read 2026-11-15); Base model of queued derivatives. License from the repo's cardData (llama3.3); no LICENSE file in repo | 1 of 1 |
| `parent:Aratako/Irodori-TTS-500M-v2` | permissive | MIT | MIT/Apache standard grant; Base model of queued derivatives. License from the repo's cardData (mit); no LICENSE file in repo | 3 of 3 |
| `text:79eda083d6eb7ae2714e2b9115ea5eef6b6fa6a6d597f38a439a0a0d22cb2b38` | gated | LicenseRef-Stability-AI-Community | same as d6f6b1a4dce5 (numbering) | 2 of 2 |
| `text:6d306d7f3715f89e46acc8af9f8a83334b4c5ce76acdb5cb9841535799e44977` | custom | LicenseRef-Stability-AI-Control-LoRA-Community | greater than 1 million monthly active users ... you must request a license from Stability AI | 1 of 1 |

## Still queued (257 clusters)

| Key | Repos still queued | Downloads (30 days) | Why |
| --- | --- | --- | --- |
| `held:other` | 474 | 5,486,351 | Matched by the hash of its text or the declared license name; otherwise not reviewed. |
| `parent-unlicensed:MAGREF-Video/MAGREF` | 1 | 4,946,066 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `text:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | 2 | 2,031,825 | empty LICENSE file (sha256 of zero bytes): nothing to read |
| `parent-unlicensed:nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large` | 1 | 1,200,445 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:yl4579/StyleTTS2-LJSpeech` | 7 | 1,013,580 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:nomic-ai/nomic-embed-text-v2-moe-unsupervised` | 3 | 821,622 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:nreimers/BERT-Tiny_L-2_H-128_A-2` | 2 | 549,654 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `text:bec48f70bd37bf8280a9d1ebf01642d26086f6122ba735baa08fe03c5a6e7448` | 2 | 421,746 | decided custom (LicenseRef-SAM), but every repo is still held by a stricter or unread license elsewhere in its lineage |
| `name:modified-mit` | 25 | 409,903 | no text on file for this declared name, and the name alone does not identify one license |
| `parent:google/gemma-4-26B-A4B-it-QAT` | 1 | 369,900 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `name:health-ai-developer-foundations` | 18 | 297,425 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:nreimers/MiniLMv2-L6-H768-distilled-from-RoBERTa-Large` | 1 | 213,814 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:mrl` | 27 | 158,243 | no text on file for this declared name, and the name alone does not identify one license |
| `name:afl-3.0` | 2 | 153,970 | no text on file for this declared name, and the name alone does not identify one license |
| `name:nvidia-open-model-agreement` | 5 | 149,668 | no text on file for this declared name, and the name alone does not identify one license |
| `name:falcon-llm-license` | 51 | 138,545 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:TheDrummer/Artemis-31B-v1.2` | 1 | 86,657 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:wtfpl` | 1 | 70,439 | no text on file for this declared name, and the name alone does not identify one license |
| `parent:huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated` | 1 | 69,512 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:microsoft/Mage-Flow` | 1 | 67,052 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:huihui-ai/Qwen2.5-Coder-14B-Instruct-abliterated` | 4 | 64,179 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Orion-26B-A4B-v1.1` | 1 | 60,774 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:mnpl` | 5 | 57,668 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:dphn/Dolphin3.0-Mistral-24B` | 1 | 52,029 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Cydonia-24B-v4.3` | 1 | 51,641 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:chuanli11/Llama-3.2-3B-Instruct-uncensored` | 2 | 46,341 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:microsoft/MiniLM-L6-v2` | 4 | 44,529 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:Wan-AI/Wan2.2-Dancer-14B` | 1 | 37,324 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Magidonia-24B-v4.3` | 1 | 33,943 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:huihui-ai/Qwen2.5-Coder-32B-Instruct-abliterated` | 2 | 30,480 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:SicariusSicariiStuff/Qwen2.5-14B_Uncensored_Instruct` | 1 | 28,033 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `name:apple-ascl` | 7 | 21,585 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:nreimers/TinyBERT_L-6_H-768_v2` | 1 | 19,558 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:openbmb/MiniCPM-V-2_6` | 6 | 18,763 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Rocinante-X-12B-v1` | 1 | 17,177 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:THUDM/GLM-4-32B-0414` | 3 | 16,538 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `name:unknown` | 6 | 16,230 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:BirdToast/Gemma-4-31B-glimmer-rp-v0.1` | 4 | 16,210 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `held:openrail` | 8 | 15,774 | "openrail" names the OpenRAIL family, not one license: the text differs per repo, so each repo's own license text is read (matched by its sha256). |
| `parent-unlicensed:inclusionAI/UI-Venus-2-9B` | 1 | 15,092 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:inflatebot/MN-12B-Mag-Mell-R1` | 1 | 14,021 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1` | 2 | 12,920 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Rocinante-XL-16B-v1` | 1 | 12,177 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:huihui-ai/Qwen2.5-Coder-1.5B-Instruct-abliterated` | 1 | 11,562 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:DunnBC22/wav2vec2-base-Speech_Emotion_Recognition` | 1 | 11,517 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:dphn/Dolphin3.0-R1-Mistral-24B` | 2 | 11,435 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:nanonets/Nanonets-OCR-s` | 1 | 10,808 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Skyfall-31B-v4.2` | 1 | 10,313 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Orion-26B-A4B-v1` | 1 | 9,363 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Goekdeniz-Guelmez/Josiefied-Qwen3-14B-abliterated-v3` | 2 | 8,909 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:stabilityai/stable-diffusion-2-1` | 1 | 8,713 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `held:agpl-3.0` | 9 | 8,117 | Copyleft for weights waits for counsel: what counts as Corresponding Source for model weights, and the AGPL network-use duty. |
| `parent-unlicensed:TheDrummer/Cydonia-24B-v4.2.0` | 1 | 7,775 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TencentARC/T2I-Adapter` | 1 | 7,672 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Artemis-31B-v1.1` | 1 | 7,613 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Cydonia-R1-24B-v4.1` | 1 | 7,381 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:SUFE-AIFLM-Lab/Fin-R1` | 1 | 7,161 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:apple-sample-code-license` | 5 | 6,513 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:nielsr/vitpose-base-simple` | 1 | 6,473 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:bria-fibo` | 2 | 6,309 | no text on file for this declared name, and the name alone does not identify one license |
| `name:falcon-mamba-7b-license` | 2 | 6,295 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:BeaverAI/Cydonia-24B-v4x-GGUF` | 2 | 6,292 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Spectre-37B-v1` | 1 | 5,685 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ConicCat/Gemma4-Writer-26BA4B` | 2 | 5,499 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Cydonia-24B-v4.1` | 1 | 5,420 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Anubis-70B-v1.2` | 1 | 5,331 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:huihui-ai/Mistral-Small-24B-Instruct-2501-abliterated` | 1 | 5,313 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:huihui-ai/Qwen2.5-Coder-0.5B-Instruct-abliterated` | 1 | 4,455 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `name:vggt-aup-license` | 1 | 4,365 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:openbmb/MiniCPM-Llama3-V-2_5` | 3 | 4,219 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `held:gpl-3.0` | 2 | 4,216 | Copyleft for weights waits for counsel: what counts as Corresponding Source for model weights, and whether a hub copy must offer it. |
| `parent-unlicensed:Goekdeniz-Guelmez/Josiefied-Qwen3-4B-abliterated-v1` | 1 | 4,201 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:chameleon-research-license` | 1 | 4,196 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:TheDrummer/Artemis-31B-v1` | 1 | 4,120 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Tiger-Gemma-12B-v3` | 1 | 4,081 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:RWKV/rwkv-6-world-7b` | 1 | 3,998 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:k2-fsa/OmniVoice` | 5 | 3,735 | declares no license for the model: no license tag, and the only license file is in a subfolder (audio_tokenizer/LICENSE) |
| `parent-unlicensed:TheDrummer/Anubis-Mini-8B-v1` | 1 | 3,733 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Valkyrie-49B-v2.1` | 1 | 3,702 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Undi95/Lumimaid-Magnum-v4-12B` | 1 | 3,634 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:inclusionAI/ZoomGain-9B` | 1 | 3,432 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:stable-video-diffusion-1-1-community` | 1 | 3,419 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:mlabonne/Hermes-3-Llama-3.1-8B-lorablated` | 1 | 3,324 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:togethercomputer/Tev1-4B-experimental` | 1 | 3,322 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:HuggingFaceTB/SmolLM-1.7B-Instruct-v0.2` | 2 | 3,269 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `name:plamo-community-license` | 3 | 3,132 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:Skywork/Skywork-OR1-Math-7B` | 2 | 3,130 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:nbeerbower/Qwen3.6-27B-TIES` | 2 | 3,119 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Tiger-Gemma-9B-v1` | 1 | 3,063 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:inclusionAI/ZwZ2-4B` | 1 | 3,025 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Cydonia-24B-v4` | 1 | 2,974 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:allura-org/Q3-30B-A3B-Designant` | 1 | 2,777 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:huihui-ai/Qwen2-VL-7B-Instruct-abliterated` | 1 | 2,768 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Magidonia-24B-v4.2.0` | 1 | 2,683 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:inclusionAI/ZoomGain-4B` | 1 | 2,678 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:allura-org/Q3-30b-A3b-Pentiment` | 1 | 2,628 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:burtenshaw/GemmaCoder3-12B` | 1 | 2,565 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Undi95/Meta-Llama-3.1-8B-Claude` | 1 | 2,536 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:qgallouedec/gemma-3-27b-it-codeforces-SFT` | 1 | 2,476 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Big-Tiger-Gemma-27B-v3` | 1 | 2,458 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:nvidia-internal-scientific-research-and-development-model-license` | 2 | 2,367 | no text on file for this declared name, and the name alone does not identify one license |
| `name:nvidia-community-model-license` | 1 | 2,358 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:zai-org/LongWriter-glm4-9b` | 2 | 2,351 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Snowpiercer-15B-v4` | 1 | 2,276 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:smolagents/SmolVLM2-2.2B-Instruct-Agentic-GUI` | 1 | 2,265 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:cosmicstack/cosmic-lightning` | 1 | 2,237 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:openai/clip-vit-large-patch14-336` | 1 | 2,195 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:LyraNovaHeart/Prismatic-12b` | 1 | 2,183 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:ozone-research/Reverb-7b` | 1 | 2,115 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Anubis-70B-v1.1` | 1 | 2,114 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:soob3123/amoral-gemma3-12B-v2` | 1 | 2,085 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Rivermind-Lux-12B-v1` | 1 | 2,060 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:HuggingFaceTB/SmolLM2-135B-Instruct` | 1 | 2,055 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:Tralalabs/Pythia-6.9B-Instruct-v1-Merged` | 1 | 1,996 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:trashpanda-org/QwQ-32B-Snowdrop-v0` | 1 | 1,978 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:FuseAI/FuseChat-Llama-3.2-3B-Instruct` | 1 | 1,969 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Replete-AI/Replete-Coder-Instruct-8b-Merged` | 1 | 1,939 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Cydonia-R1-24B-v4` | 1 | 1,932 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Delta-Vector/MS3.2-Austral-24B-KTO` | 2 | 1,914 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Goekdeniz-Guelmez/Josiefied-Qwen3-1.7B-abliterated-v1` | 1 | 1,878 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Valkyrie-49B-v1` | 1 | 1,844 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Alfitaria/Q25-1.5B-VeoLu` | 1 | 1,825 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Replete-AI/Replete-Coder-V2-Llama-3.1-8b` | 1 | 1,820 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:soob3123/Veritas-12B` | 1 | 1,818 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:artistic-2.0` | 2 | 1,805 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:Ilya626/Cydonia_Vistral` | 1 | 1,793 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:openai/clip-vit-large-patch14` | 2 | 1,774 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Tencent-Hunyuan/Hy-MT2-1.8B` | 2 | 1,753 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:Delta-Vector/Austral-SFT-KTO` | 2 | 1,750 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Cydonia-Redux-22B-v1.1` | 1 | 1,747 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:AuriAetherwiing/Yi-1.5-9B-32K-tokfix` | 2 | 1,738 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:openerotica/writing-roleplay-20k-context-nemo-12b-v1.0` | 1 | 1,716 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Tralalabs/Qwen3-2507-4B-Instruct-Haiku-4.5-Merged-FP16` | 1 | 1,716 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Behemoth-X-123B-v2` | 1 | 1,710 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:andrewzh/Absolute_Zero_Reasoner-Coder-3b` | 1 | 1,709 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Dans-DiscountModels/Meta-Llama-3.1-8B-ChatML` | 3 | 1,705 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ConicCat/Mistral-Small-3.2-AntiRep-24B` | 2 | 1,701 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Skywork/Skywork-OR1-32B-Preview` | 2 | 1,701 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Behemoth-X-123B-v2.1` | 1 | 1,671 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Skywork/Skywork-OR1-7B` | 2 | 1,660 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Precog-24B-v1` | 1 | 1,655 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Valkyrie-49B-v2` | 1 | 1,585 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:krutrim-community-license-agreement-version-1.0` | 1 | 1,568 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:openbmb/MiniCPM-V-2` | 1 | 1,542 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:PinkPixel/Crystal-Think-V2` | 1 | 1,538 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:concedo/Beepo-22B` | 1 | 1,498 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Skywork/Skywork-OR1-32B` | 2 | 1,490 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Skywork/Skywork-OR1-7B-Preview` | 2 | 1,480 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `name:model-license` | 1 | 1,479 | no text on file for this declared name, and the name alone does not identify one license |
| `parent:Replete-AI/Replete-LLM-Qwen2-7b` | 1 | 1,463 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:zerofata/MS3.2-PaintedFantasy-Visage-v3-34B` | 1 | 1,451 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Nohobby/L3.3-Prikol-70B-v0.5` | 1 | 1,437 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:andrewzh/Absolute_Zero_Reasoner-Coder-14b` | 1 | 1,430 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Daemontatox/RA_Reasoner` | 1 | 1,424 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:TheDrummer/Snowpiercer-15B-v3` | 1 | 1,414 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:TheDrummer/Behemoth-X-123B-v2.2` | 1 | 1,396 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:Replete-AI/Replete-LLM-Mist-Nemo-12b-test-merged-250k` | 1 | 1,381 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:FuseAI/FuseChat-Qwen-2.5-7B-Instruct` | 1 | 1,351 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:openai/clip-vit-base-patch16` | 2 | 1,127 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:perplexity-ai/r1-1776` | 2 | 1,062 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:perplexity-ai/r1-1776-distill-llama-70b` | 2 | 1,008 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:ornith-ai/Ornith-1.5-9B-MLX` | 1 | 1,006 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:zai/glm-4.7` | 3 | 913 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `name:gml` | 1 | 912 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:Goekdeniz-Guelmez/Josiefied-Qwen3-30B-A3B-abliterated-v2` | 1 | 881 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:snakers4/silero-vad` | 1 | 839 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent:Tencent-Hunyuan/Hy-MT2-7B` | 1 | 783 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:Hello-SimpleAI/chatgpt-detector-roberta` | 1 | 739 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Qwen2.5-72B-Instruct-abliterated` | 1 | 624 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:huihui-ai/Qwen2.5-0.5B-Instruct-abliterated` | 1 | 594 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:mistralai/Voxtral-Mini-4B-Realtime-Arabic` | 1 | 588 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `text:53875532237e0a97b17a41721556ff57e93193fc566e48c3a0febe6e35bb5343` | 1 | 573 | decided custom (LicenseRef-bilibili-Model-Use), but every repo is still held by a stricter or unread license elsewhere in its lineage |
| `parent:TeichAI/Qwen3.8-27B-Fable-Distill` | 2 | 423 | decided permissive (Apache-2.0), but every repo is still held by a stricter or unread license elsewhere in its lineage |
| `parent-unlicensed:typeform/distilbert-base-uncased-mnli` | 1 | 360 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Qwen2.5-1.5B-Instruct-abliterated` | 1 | 351 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:avichr/heBERT_NER` | 1 | 258 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:mrm8488/bert-tiny-finetuned-sms-spam-detection` | 1 | 205 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:roneneldan/TinyStories-33M` | 1 | 205 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:WithinUsAI/Gemma3-Prompt.Coder.it.Uncensored-270m` | 1 | 204 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:Kae-X/DialoGPT-medium-Rick-from-RickAndMorty` | 1 | 183 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-llama-3-70B-Instruct-abliterated` | 1 | 175 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Qwen2.5-7B-Instruct-abliterated-v3` | 1 | 156 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:roneneldan/TinyStories-Instruct-33M` | 1 | 149 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:aml` | 1 | 144 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:nreimers/TinyBERT_L-4_H-312_v2` | 1 | 135 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:google/gemma4-26B-it` | 1 | 133 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:ngxson/LoRA-Qwen2.5-32B-Instruct-abliterated` | 1 | 129 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:cardiffnlp/twitter-roberta-base-sentiment` | 1 | 124 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-phi-4-abliterated` | 1 | 114 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:rizvandwiki/gender-classification` | 1 | 110 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:tjoab/latex_finetuned` | 1 | 89 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ApocalypseParty/G4-26B-SFT-6` | 1 | 88 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:adel-cybral/TinyBERT-finetuned-NER` | 1 | 83 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:ReadyArt/Heimdallr-26B-A4B-v0.35` | 1 | 72 | LICENSE file (LICENSE.txt, sha256 7f9d27970fee) is not a text on the table yet: needs a read (tag 'apache-2.0') |
| `parent-unlicensed:ngxson/LoRA-Qwen2.5-Coder-7B-Instruct` | 1 | 71 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent:marin-community/marin` | 3 | 70 | Hugging Face API returns 401 (deleted, private or gated); no license can be read |
| `parent-unlicensed:facebook/maskformer-resnet50-ade20k-full` | 1 | 68 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:dleemiller/EttinX-nli-xxs` | 1 | 67 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Qwen2.5-3B-Instruct-abliterated` | 1 | 66 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Stacy123/rubert_tiny_qa_kontur` | 1 | 62 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:cognition-ai/Kevin-32B` | 1 | 62 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:neulab/codebert-javascript` | 1 | 61 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Qwen2.5-14B-Instruct-abliterated-v2` | 1 | 53 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:lewtun/tiny-clip-test` | 1 | 51 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:speech31/wavlm-large-english-phoneme` | 1 | 51 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:descript/dac_44khz` | 1 | 49 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:taufeeque/tiny-gpt2` | 1 | 49 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ai-forever/rugpt3small_based_on_gpt2` | 1 | 48 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Qwen/Qwen-VL-Chat` | 1 | 46 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:huggingface/CodeBERTa-small-v1` | 2 | 43 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:hatmimoha/arabic-ner` | 1 | 43 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Human-Like-Qwen2.5-7B-Instruct` | 1 | 43 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:DavidAU/Qwen3-0.6B-heretic-abliterated-uncensored` | 1 | 42 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:cointegrated/rubert-tiny-sentiment-balanced` | 1 | 42 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:speech31/hubert-base-english-ipa` | 1 | 42 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:rahuldshetty/tiny-starcoder-instruct` | 1 | 41 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Qwerus-7B` | 1 | 40 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-SmallThinker-3B-Preview` | 1 | 39 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:NlpHUST/gpt2-vietnamese` | 1 | 38 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Deepthink-Reasoning-7B` | 1 | 37 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:alibaba-damo/mgp-str-base` | 1 | 36 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:UX4567/Text-Summarizer-t5-small` | 1 | 35 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ngxson/LoRA-Llama-3.1-8B-MultiReflection` | 1 | 34 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:roneneldan/TinyStories-1M` | 2 | 33 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Goekdeniz-Guelmez/Josiefied-Qwen3.5-0.8B-gabliterated-v1` | 1 | 31 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:laion/delphi-1e23-p33m67-k0p076-prepared` | 2 | 27 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:MoritzLaurer/DeBERTa-v3-base-mnli` | 1 | 27 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:aliyzd95/wavlm-persian-base-plus` | 1 | 26 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:commercial-evaluation` | 1 | 25 | no text on file for this declared name, and the name alone does not identify one license |
| `parent-unlicensed:microsoft/codebert-base` | 1 | 25 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:nktpv/Qwen2.5-1.5B-abliterated` | 1 | 24 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ai-forever/rugpt3large_based_on_gpt2` | 1 | 23 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:facebook/maskformer-resnet101-ade20k-full` | 1 | 23 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:facebook/maskformer-resnet50-vistas` | 1 | 22 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:huawei-noah/TinyBERT_General_4L_312D` | 1 | 22 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:jjzha/jobbert_skill_extraction` | 1 | 22 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:prithivida/grammar_error_correcter_v1` | 1 | 21 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:AliGhiasvand86/10-animals-classification` | 1 | 20 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Mathnub/ruRoberta-sberquad` | 1 | 20 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:edbeeching/decision-transformer-gym-halfcheetah-medium` | 1 | 19 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:facebook/maskformer-resnet50-coco-stuff` | 1 | 19 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Fahim18/multilingual-nli-bert` | 1 | 18 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:abletobetable/mdeberta-ru-qa` | 1 | 18 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:ai-forever/rugpt3medium_based_on_gpt2` | 1 | 18 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:EbanLee/kobart-summary-v3` | 1 | 17 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:facebook/maskformer-resnet101-cityscapes` | 1 | 17 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:lazy-guy12/chess-llama` | 1 | 17 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:MilaNLProc/feel-it-italian-sentiment` | 1 | 16 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:edbeeching/decision-transformer-gym-hopper-expert` | 1 | 16 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:jdakillah/Bender` | 1 | 16 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:FacebookAI/xlm-roberta-large-finetuned-conll03-english` | 1 | 15 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:KingNish/Qwen2.5-infill-test` | 1 | 14 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:mesolitica/Malaysian-TTS-0.6B-v0.1` | 1 | 14 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:microsoft/wavlm-large` | 1 | 14 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:Johnyquest7/llama-3.2-1b-medical-notes` | 1 | 13 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `parent-unlicensed:valhalla/distilbart-mnli-12-3` | 1 | 13 | declares no license: no license tag, no license_name and no LICENSE file on the repo |
| `name:other` | 1 | 0 | no text on file for this declared name, and the name alone does not identify one license |

## Counts

`classify.py` over `candidates-batch1.jsonl` (16,243 repos), `--now 2026-11-15T00:00:00Z`:

| Verdict | Main before | After | After, recorded bases listed |
| --- | --- | --- | --- |
| permissive | 7,795 | 7,810 | 7,901 |
| custom | 224 | 675 | 685 |
| gated | 1,062 | 1,237 | 1,238 |
| territory | 11 | 19 | 19 |
| non-commercial | 978 | 1,075 | 1,075 |
| unreviewed | 1,824 | 1,066 | 964 |
| refused | 4,315 | 4,327 | 4,327 |
| queue (content) | 17 | 17 | 17 |
| out | 17 | 17 | 17 |
| Queue clusters | 454 | 304 | 274 |

The queue handed over (`classify-queue-batch1.json`, 540 clusters) was built before the 2026-11-14 table; re-classified on main it was already 454.

## Needs an owner decision or counsel

1. **Registration before commercial use (Stability AI Community, Moonshine Community; Zhipu GLM-4, GLM-Edge, CodeGeeX4, CogVideoX, CogVLM, CogAgent).** The texts allow redistribution, but commercial use (Stability: "If You are using or distributing the Stability AI Materials for a Commercial Purpose, You must register") needs registration first; Zhipu's free grant is academic research only. Marked gated (link only). Owner decision: does Allternit hosting a free mirror count as a Commercial Purpose, and should Allternit register? If it registers, these become custom (hosted).
2. **No-redistribution licenses are refused (EXAONE NC, Microsoft Research License, AI Model Personal Use 1.0, PolyForm Strict 1.0.0; 32 repos).** The rule used: refused means no grant to redistribute. A link-only listing copies nothing, so the owner may prefer non-commercial (link only) to keep them listed. One-line change per entry in `policy/licenses.json`.
3. **GPL-3.0, LGPL-3.0, AGPL-3.0 for weights (held).** Counsel: what is Corresponding Source for weights, must a hub copy offer it, and the AGPL network duty.
4. **CC BY-ND 4.0 (held).** Unchanged copies may be shared, Adapted Material may not; needs a rule that hosts only unchanged originals, never a quantization or fine-tune.
5. **ReadyArt/Heimdallr-26B-A4B-v0.35.** Tag apache-2.0, but `LICENSE.txt` is a click-wrap ("By using this model, you agree ... you're at least 18+ years old"). Does that change the verdict? Left unreviewed.
6. **NVIDIA Open Model License guardrail clause.** "If You bypass, disable, reduce the efficacy of, or circumvent any ... safety guardrail ... your rights under this Agreement will automatically terminate." No hosted abliterated derivative of an NVIDIA Open Model License model is in this batch, but the abliteration lane should check this before hosting one.
