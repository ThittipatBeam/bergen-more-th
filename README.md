<img src="documentation/images/BERGEN.png" width="400">

# BERGEN-TH: Thai RAG Benchmark

Benchmarking **Retrieval-Augmented Generation** pipelines in **Thai** — retrieval over Thai Wikipedia, evaluated with Thai-aware metrics and an LLM-as-judge.

> Thai-focused fork of [BERGEN](https://github.com/naver/bergen). For upstream documentation, see [documentation/legacy/BERGEN_README.md](documentation/legacy/BERGEN_README.md).

## Why Thai-specific?

String metrics (Match/EM, F1, Recall) miscount Thai answers:
- Transliteration of entity names (e.g. `โรนัลโด` vs `Ronaldo`, `โซเยย์` vs `So-yul`)
- pythainlp vs whitespace word segmentation disagreements
- Correct refusals (e.g., `ไม่พบข้อมูล` = "information not found") get 0 instead of credit

This fork adds:
- **Thai-aware metrics** (`M_th`, `F1_th`, `Precision_th`, `Recall_th`) — tokenized with `pythainlp`
- **LLM-as-judge** — factual correctness against the retrieved context, forgiving of spelling/transliteration variance
- **Thai Wikipedia corpus** — PyThaiNLP `thai-wiki-dataset-v4`, `sources=[thwiki]`, chunked to 1000-word passages (179k)
- **Two Thai QA datasets** — MKQA `mkqa_th` over Thai wiki + ThaiWikiV4QA (your new generated set)

## Quick Start

Prereq: one OpenAI-compatible endpoint serving embedding + rerank + LLM. Populate `.env` (see `example.env`).

Full Thai RAG benchmark (BGE-M3 retrieval + rerank + generation on Thai wiki corpus + verified Thai QA):

```bash
python3 bergen.py dataset='mkqa/thai_wiki_v4_qa.retrieve_th' \
  retriever='api-embed-openai-compatible' retriever.init_args.model_name=BAAI/bge-m3 \
  reranker='api-rerank-openai-compatible' \
  generator='openai_compatible' generator.init_args.model_name=DEEPSEEK-V4.1F \
  retrieve_top_k=100 rerank_top_k=10 generation_top_k=5
```

Score:

```bash
python3 evaluate.py --folder experiments/<exp_id> --split dev --judge
python3 print_results.py --folder experiments/ --format=tiny
```

## Datasets

### Doc corpus — Thai Wikipedia

`ThaiWikiV4` — PyThaiNLP `thai-wiki-dataset-v4` chunked into 1000-word passages, `sources=[thwiki]`. 179k passages. Configure via:

```yaml
dev:
  doc:
    init_args:
      _target_: modules.dataset_processor.ThaiWikiV4
      split: train
      num_words: 1000
      sources: [thwiki]
```

### Queries — Thai QA

`ThaiWikiV4QA` — LLM-generated Q/A extracted from Thai Wikipedia articles (PyThaiNLP `thai-wiki-dataset-v4`), verified by a second LLM judge. 100% provenance by design.

| Metric | Value |
|---|---|
| Questions | 5,355 (extractive, verified) |
| Provenance | 100% (every question knows its source article) |
| Answer style | Short extractive spans (2-10 words typical) — works with EM/F1/Recall |
| Judge | Different LLM from generation (anti-confirmation-bias) |

Configure via:

```yaml
dev:
  query:
    init_args:
      _target_: modules.processors.mrag_dataset_processor.ThaiWikiV4QA
      split: train
```

> **Why not MKQA-Thai?** An earlier version used MKQA `lang=th` over `wiki-100w-th`. Underneath: 2,827 questions but only **771 have Thai qrels** — 73% dilute metrics because the English-first mapping can't find Thai ground-truth. `ThaiWikiV4QA` generates from Thai wiki directly, guaranteeing alignment: question ↔ answer ↔ source article.

## Thai metrics

| Metric | Meaning |
|---|---|
| `M`, `EM`, `F1`, `Recall` | Lexical metrics over whitespace tokens |
| `M_th`, `F1_th`, `Recall_th` | Same, but tokenized with `pythainlp` (Thai-aware) |
| `LLMeval_judge_pct` | % of answers rated factually correct by LLM judge vs retrieved context |

**The judge is the headline metric.** String-based EM is stricter in Thai because of transliteration.

## Baseline (ThaiWikiV4QA, dev)

Retrieval: BGE-M3 (top-100) → rerank: BGE-reranker-v2-m3 (top-10) → generation: top-5 docs.

| Generator | `M_th` | `F1_th` | `Recall_th` | `LLMeval_judge_pct` |
|:---|:---:|:---:|:---:|:---:|
| DeepSeek-V4.1F | ~TBD | ~TBD | ~TBD | ~TBD |

*Benchmark run in progress. Earlier MKQA-Thai (cross-lingual) results: `LLMeval_judge_pct` = 64.3%. ThaiWikiV4QA numbers represent pure-Thai RAG (retrieval + generation both over Thai wiki corpus).*

See [documentation/evaluations.md](documentation/evaluations.md) for metrics and scoring.

## Repository structure

- `bergen.py` — main entrypoint (wire dataset + retriever + reranker + generator)
- `evaluate.py` — score experiments
- `inspect_app.py` — browse generated outputs in a web UI (`python3 inspect_app.py`)
- `modules/`, `models/` — pluggable pipeline components
- `config/` — YAML configs for datasets, retrievers, generators
- `th_data_gen/` — Thai QA generation pipeline (LLM-driven, judged, built from `thai-wiki-dataset-v4`)
- `scripts/`, `qrels/` — utilities and ground truth
- `documentation/project/HOW_IT_WORK.md` — pipeline architecture + Thai corpus specifics
- `documentation/legacy/` — upstream BERGEN docs (paper PDF, generic README)

## Installation

```bash
./install.sh
```

See [documentation/INSTALL.md](documentation/INSTALL.md) for details.

## Cite

**BERGEN (original fork):**

```bibtex
@misc{rau2024bergen,
  title={BERGEN: A Benchmarking Library for Retrieval-Augmented Generation},
  author={David Rau and Hervé Déjean and Nadezhda Chirkova and Thibault Formal
    and Shuai Wang and Vassilina Nikoulina and Stéphane Clinchant},
  year={2024}, eprint={2407.01102}, archivePrefix={arXiv}
}
```

**BERGEN multilingual extension:**

```bibtex
@misc{chirkova2024mkqa,
  title={Evaluating Multilingual RAG Systems over Wikipedia},
  author={Nadezhda Chirkova and David Rau and Thibault Formal and Vassilina Nikoulina
    and Stéphane Clinchant},
  year={2024}, eprint={2407.01463}
}
```

**PyThaiNLP (Thai NLP toolkit + corpus):**

```bibtex
@misc{phatthiyaphaibun2023pythainlp,
  title={PyThaiNLP: Thai Natural Language Processing in Python},
  author={Wannaphong Phatthiyaphaibun and Korakot Chaovavanich and Charin Polpanumas
    and Arthit Suriyawongkul and Lalita Lowphansirikul and Pattarawat Chormai},
  year={2023}
}
```

## License

CC BY-NC-SA 4.0 — see [LICENCE.md](LICENCE.md) and upstream [BERGEN](https://github.com/naver/bergen).
