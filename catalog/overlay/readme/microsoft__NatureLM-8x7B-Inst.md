# Model details
## Model description
Nature Language Model (NatureLM) is a sequence-based science foundation model designed for scientific discovery. Pre-trained with data from multiple scientific domains, NatureLM offers a unified, versatile model that enables various applications including generating and optimizing small molecules, proteins, RNA, and materials using text instructions; cross-domain generation/design such as protein-to-molecule and protein-to-RNA generation; and top performance across different domains.

- Developed by:  SFM team ∗ Microsoft Research AI for Science
- Model type: Sequence-based science foundation model
- Language(s): English
- License:  MIT License
- Finetuned from model: one version of the model is finetuned from Mixtral-8x7B-v0.1


# Model sources 
## Repository:
We provide two repositories for 8x7B models, including both base versions and instruction-finetuned versions.

- https://huggingface.co/microsoft/NatureLM-8x7B
- https://huggingface.co/microsoft/NatureLM-8x7B-Inst
  

## Paper:
[[2502.07527] Nature Language Model: Deciphering the Language of Nature for Scientific Discovery](https://arxiv.org/abs/2502.07527)

# Uses
## Direct intended uses
NatureLM is designed to facilitate scientific discovery across multiple domains, including the generation and optimization of small molecules, proteins, and RNA. It offers two unique features: (1) Text-driven capability — users can prompt NatureLM using natural language instructions; and (2) Cross-domain functionality — NatureLM can perform complex cross-domain tasks, such as generating compounds for specific targets or designing protein binders for small molecules.
Downstream uses:
Science researchers can finetune NatureLM for their own tasks, especially cross-domain generation tasks.

## Out-of-scope uses
### Use in Real-World Applications Beyond Proof of Concept
NatureLM currently not ready to use in clinical applications, without rigorous external validation and additional specialized development. It is being released for research purposes only.
### Use outside of the science domain
NatureLM is not a general-purpose language model and is not designed or optimized to perform general tasks like text summarization or Q&A. 
### Use by Non-Experts
NatureLM outputs scientific entities (e.g., molecules, proteins, materials) and requires expert interpretation, validation, and analysis. It is not intended for use by non-experts or individuals without the necessary domain knowledge to evaluate and verify its outputs. Outputs, such as small molecule inhibitors for target proteins, require rigorous validation to ensure safety and efficacy. Misuse by non-experts may lead to the design of inactive or suboptimal compounds, resulting in wasted resources and potentially delaying critical research or development efforts. 
### CBRN Applications (Chemical, Biological, Radiological, and Nuclear)
NatureLM is not intended for the design, development, or optimization of agents or materials for harmful purposes, including but not limited to weapons of mass destruction, bioterrorism, or other malicious uses.
### Unethical or Harmful Applications
The use of NatureLM must align with ethical research practices. It is not intended for tasks that could cause harm to individuals, communities, or the environment.



## Risks and limitations
NatureLM may not always generate compounds or proteins precisely aligned with user instructions. Users are advised to apply their own adaptive filters before proceeding. Users are responsible for verification of model outputs and decision-making.
NatureLM was designed and tested using the English language. Performance in other languages may vary and should be assessed by someone who is both an expert in the expected outputs and a native speaker of that language.
NatureLM inherits any biases, errors, or omissions characteristic of its training data, which may be amplified by any AI-generated interpretations.  For example, inorganic data in our training corpus is relatively limited, comprising only 0.02 billion tokens out of a total of 143 billion tokens. As a result, the model's performance on inorganic-related tasks is constrained. In contrast, protein-related data dominates the corpus, with 65.3 billion tokens, accounting for the majority of the training data.
There has not been a systematic effort to ensure that systems using NatureLM are protected from security vulnerabilities such as indirect prompt injection attacks. Any systems using it should take proactive measures to harden their systems as appropriate.  


# Training details
## Training data
The pre-training data includes text, small molecules (SMILES notations), proteins (FASTA format), materials (chemical composition and space group number), DNA (FASTA format), and RNA (FASTA format). The dataset contains single-domain sequences and cross-domain sequences.

## Training procedure
Preprocessing
The training procedure involves two stages: Stage 1 focuses on training newly introduced tokens while freezing existing model parameters. Stage 2 involves joint optimization of both new and existing parameters to enhance overall performance.

## Training hyperparameters
-	Learning Rate: 2×10<sup>−4</sup>
-	Batch Size (Sentences): 8x7B model: 1536
-	Context Length (Tokens): 8192
-   GPU Number (H100): 8x7B model: 256

## Speeds, sizes, times

Model sized listed above;

# Evaluation
## Testing data, factors, and metrics
Testing data
The testing data includes 22 types of scientific tasks such as molecular generation, protein generation, material generation, RNA generation, and prediction tasks across small molecules, proteins, DNA.

## Factors
1.	Cross-Domain Adaptability: The ability of NatureLM to perform tasks that span multiple scientific domains (e.g., protein-to-compound generation, RNA design for CRISPR targets, or material design with specific properties).
2.	Accuracy of Outputs: For tasks like retrosynthesis, assess the correctness of the outputs compared to ground truth or experimentally validated data.
3.	Diversity and Novelty of Outputs: Evaluate whether the generated outputs are novel (e.g., new molecules or materials not present in databases or training data).
4.	Scalability Across Model Sizes: Assess the performance improvements as the model size increases (1B, 8B, and 46.7B parameters).
## Metrics
Accuracy, AUROC, and independently trained AI-based predictors are utilized for various tasks.
Evaluation results

1.	We successfully demonstrated that NatureLM is capable of performing tasks such as target-to-compound, target-to-RNA, and DNA-to-RNA generation.
2.	NatureLM achieves state-of-the-art results on retrosynthesis benchmarks and the MatBench benchmark for materials.
3.	NatureLM can generate novel proteins, small molecules, and materials.

# Summary
Nature Language Model (NatureLM) is a groundbreaking sequence-based science foundation model designed to unify multiple scientific domains, including small molecules, materials, proteins, DNA and RNA. This innovative model leverages the "language of nature" to enable scientific discovery through text-based instructions. NatureLM represents a significant advancement in the field of artificial intelligence, providing researchers with a powerful tool to drive innovation and accelerate scientific breakthroughs. By integrating knowledge across multiple scientific domains, NatureLM paves the way for new discoveries and advancements in various fields of science. We hope to release it to benefit more users and 
contribute to the development of AI for Science research.

# Model card contact
This work was conducted in Microsoft Research AI for Science. We welcome feedback and collaboration from our audience. If you have suggestions, questions, or observe unexpected/offensive behavior in our technology, please contact us at: 
- Yingce Xia, Yingce.Xia@microsoft.com
- Chen Hu, chehu@microsoft.com
- Yawen Yang, v-yangyawen@microsoft.com
 
If the team receives reports of undesired behavior or identifies issues independently, we will update this repository with appropriate mitigations.