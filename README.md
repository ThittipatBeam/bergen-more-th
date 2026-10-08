<img src="documentation/images/BERGEN.png" width="500">

# BERGEN: A Benchmarking Library for Retrieval-Augmented Generation
 
[![arXiv](https://img.shields.io/badge/arXiv-2407.01102-b31b1b.svg)](https://arxiv.org/abs/2407.01102)
[![arXiv](https://img.shields.io/badge/arXiv-2407.01463-b31b1b.svg)](https://arxiv.org/abs/2407.01463)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

BERGEN (BEnchmarking Retrieval-augmented GENeration) is a library designed to benchmark RAG systems with a focus on question-answering (QA). It addresses the challenge of inconsistent benchmarking in comparing approaches and understanding the impact of each component in a RAG pipeline.

> **This repository is a Thai-focused fork of [BERGEN](https://github.com/naver/bergen).** In addition to everything upstream provides, it adds Thai-aware evaluation metrics (`M_th`, `F1_th`, …), an LLM-as-judge that scores factual correctness against the retrieved context (robust to Thai transliteration and correct refusals), and fully API-based pipeline components. See [Thai RAG Benchmark](#thai-rag-benchmark) below.

## Key Features

- Easy reproducibility and integration of new datasets and models
- Support for various retrievers (20+), rerankers(4) and large language models (20+)
- Flexible configuration system using YAML files
- Comprehensive evaluation metrics (*Match, EM, LLMEval*, ... )
- Support for multilingual experiments
- Thai-aware evaluation: `pythainlp`-tokenized metrics (`M_th`, `F1_th`, `Precision_th`, `Recall_th`) that auto-enable for Thai datasets — see the [evaluation guide](documentation/evaluations.md)
- LLM-as-judge: post-hoc, resumable factual-correctness scoring judged against the retrieved context — robust to Thai transliteration differences and correct refusals, which string-match metrics cannot credit
- Support for API-based components: full pipelines running on embedding, reranking and LLM APIs (OpenAI-compatible endpoints, Cohere, Voyage, Gemini, Jina) with built-in cost guardrails — see [documentation/apis.md](documentation/apis.md)

![](documentation/images/teaser_bergen.jpg) 

For more information and experimental findings, please see:
- The initial BERGEN paper: https://arxiv.org/abs/2407.01102 and our [EMNLP'24 slides](documentation/BERGEN.pdf)
- The Multilingual RAG paper: https://arxiv.org/abs/2407.01463

## Quick Start

A typical RAG setup follows this pipeline:

`question` >> `retriever` >> `reranker` >> `LLM` >> `answer`

You can configure each component using simple YAML files. Here's an example of running an experiment:

```bash
python3 bergen.py retriever="bm25" reranker="minilm6" generator='tinyllama-chat' dataset='kilt_nq'
```

## Installation

One-shot install (core deps + torch for your platform):

```bash
./install.sh                    # minimal
./install.sh --all              # ... plus all API provider clients
```

For more details and options (CUDA torch, vllm, etc.) see the [installation guide](documentation/INSTALL.md).


## Usage

```
# simple setup for benchmarking
# run the retriever and cache results
# do the generation with VLLM
for dataset in kilt_nq kilt_hotpotqa kilt_triviaqa asqa popqa ; do
   
   python3 bergen.py  retriever=splade-v3 reranker=debertav3  dataset=$dataset
    
   python3 bergen.py  retriever=splade-v3 reranker=debertav3 dataset=$dataset  generator=vllm_SOLAR-107B
done
```


To fully configure BERGEN, please read our [configuration guide](documentation/config.md)

## Evaluation

Run the evaluation script to calculate LLMEval metrics and print the results:

```bash
python3 evaluate.py --experiments_folder experiments/ --llm_batch_size 16 --split 'dev' --llm vllm_SOLAR-107B

#parse all the experiments files into a panda dataframe
python print_results.py --folder experiments/ --format=tiny
```

Bergen also offers the possiblity to run pairwise comparisons using an LLM as judge. For more evaluation options and details, refer to the [Evaluation section](documentation/evaluations.md) in the complete documentation.

## RAG Baselines
Bergen provides results for several models and many datasets aiming to **provide strong baselines**. On the important datasets for RAG, the match metric is given by this table (see more in our paper): 
### Match Metric
 Model | ASQA | NQ | TriviaQA | POPQA | HotPotQA|
:----------:|:----------:|:----------:|:----------:|:----------:|:----------:
Llama-2-7B  | 68.4 | 61.6 | 87.9 | 60.2 |  45.9|
Llama-2-70B | 73.2 | 65.8 | 92.3 | 65.5  | 53.6|
Mistral-8x7B| 73.5 | 67.1 | 91.8 | 67.9 |  54.5|
Solar-10.7B   | 76.2 | 70.2 | 92.8 | 71.2 |  53.9|

## Thai RAG Benchmark

This fork evaluates full RAG pipelines on **Thai** tasks over a Thai Wikipedia datastore (MKQA `lang=th` queries over `wiki-100w-th` chunks). String metrics alone under-credit Thai answers (different transliteration of the same entity, or a correct refusal such as `ไม่พบข้อมูล`), so results are reported with both lexical metrics and the LLM-as-judge — full details in the [evaluation guide](documentation/evaluations.md).

### MKQA `mkqa_th` (dev, 2,827 questions) — judge score `LLMeval_judge_pct` is the headline
Retrieval: BGE-M3 (top-100) → rerank: BGE-reranker-v2-M3 (top-10) → generation over top-5 docs.

| Generator (LLM) | `M_th` | `F1_th` | `Recall_th` | `LLMeval_judge_pct` |
|:---:|:---:|:---:|:---:|:---:|
| DeepSeek-V4.1F | 23.5 | 13.3 | 32.4 | **64.3** |

Reproduce:

```bash
# full Thai pipeline (BGE-M3 retrieval + rerank via an OpenAI-compatible endpoint,
# generation via a compatible chat endpoint) — cost-guardrailed
python3 bergen.py dataset='mkqa/mkqa_th.retrieve_th' \
  retriever='api-embed-openai-compatible' retriever.init_args.model_name=BAAI/bge-m3 \
  reranker='api-rerank-openai-compatible' \
  generator='openai_compatible' generator.init_args.model_name=DEEPSEEK-V4.1F \
  retrieve_top_k=100 rerank_top_k=10 generation_top_k=5

# score it (Thai string metrics auto-enable; the judge reads only on-disk data)
python3 evaluate.py --folder experiments/<exp_folder> --split dev --judge
python3 print_results.py --folder experiments/ --format=tiny
```

> Note: the `api-*-openai-compatible` configs used above are thin wrappers over the OpenAI-compatible endpoint you point them at — set `EMBED_BASE_URL`, `RERANK_BASE_URL`, `LLM_BASE_URL` and the matching `*_API_KEY` in `.env` (see `example.env` and [documentation/apis.md](documentation/apis.md)). The BGE-M3 / BGE-reranker-v2-M3 ids shown are just the model names your endpoint serves, so any compatible endpoint works.

## Multilingual Experiments

Refer to our [multilingual RAG guide](documentation/multilingual.md) for running experiments with multilingual user queries and/or multilingual Wikipedia as a datastore.


## Training

To train a model, add a training config:

```bash
python3 bergen.py retriever="bm25" reranker="minilm6" generator='tinyllama-chat' dataset='kilt_nq' train='lora'
```

## Extensions

To add new datasets and models, or configure prompts, see our [reference guide](/extensions.md).


## Cite

If you use BERGEN for your research, please consider citing:

```bibtex
@misc{rau2024bergenbenchmarkinglibraryretrievalaugmented,
      title={BERGEN: A Benchmarking Library for Retrieval-Augmented Generation}, 
      author={David Rau and Hervé Déjean and Nadezhda Chirkova and Thibault Formal and
      Shuai Wang and Vassilina Nikoulina and Stéphane Clinchant},
      year={2024},
      eprint={2407.01102},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2407.01102}, 
}

@misc{chirkova2024retrievalaugmentedgenerationmultilingualsettings,
      title={Retrieval-augmented generation in multilingual settings}, 
      author={Nadezhda Chirkova and David Rau and Hervé Déjean and Thibault Formal and Stéphane Clinchant and Vassilina Nikoulina},
      year={2024},
      eprint={2407.01463},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2407.01463}, 
}
```

## License

BERGEN is released under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 license. For more details, see the [LICENSE](LICENSE) file.

---
