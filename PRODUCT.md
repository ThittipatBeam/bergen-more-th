# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Broader public benchmark consumers: an audience that reads and compares published Thai RAG benchmark results without necessarily running the pipeline themselves, plus the researchers/engineers who do run it. Secondary audience: Thai NLP researchers reproducing or extending the benchmark against their own endpoints.

## Product Purpose

BERGEN-more-TH is a Thai-focused fork of BERGEN, the RAG benchmarking library. It lets users benchmark full retrieval-augmented generation pipelines (retriever >> reranker >> LLM) on Thai tasks over a Thai Wikipedia datastore, crediting answers that string metrics miss — Thai transliteration variants and correct refusals such as `ไม่พบข้อมูล`. Success means Thai RAG systems can be compared fairly and reproducibly, and results are now published for public consumption as well as runnable locally.

## Positioning

The only Thai-aware RAG benchmark that scores generation with both Thai-tokenized string metrics (pythainlp) and an LLM-as-judge that evaluates factual correctness against the retrieved context — crediting correct answers other metrics would fail. Unlike generic benchmarks, it runs fully API-based pipelines (any OpenAI-compatible endpoint) with cost guardrails, so no local GPU stack is required.

## Operating Context

- CLI-driven research workflow: YAML-configured experiments via `python3 bergen.py`, evaluation via `python3 evaluate.py`, results via `python3 print_results.py`.
- Headline dataset: MKQA `lang=th` dev split (2,827 questions) over the `wiki-100w-th` chunked Thai Wikipedia datastore; BIOASQ11B oracle runs also present.
- Pipeline under benchmark: BGE-M3 retrieval (top-100) >> BGE-reranker-v2-M3 (top-10) >> generation over top-5 docs.
- API components pointed at OpenAI-compatible endpoints via `.env` (`EMBED_BASE_URL`, `RERANK_BASE_URL`, `LLM_BASE_URL` + keys); model ids in configs are whatever the endpoint serves.
- Judge: post-hoc, resumable LLM scoring reading only on-disk experiment data.
- A results/report website publishing benchmark outputs is planned as the audience-facing surface.

## Capabilities and Constraints

- Thai-aware metrics auto-enable for Thai datasets: `M_th`, `F1_th`, `Precision_th`, `Recall_th`.
- Headline judge metric: `LLMeval_judge_pct`; current published baseline: DeepSeek-V4.1F scoring 64.3 judge pct (M_th 23.5, F1_th 13.3, Recall_th 32.4) on MKQA TH dev.
- License: CC BY-NC-SA 4.0 (non-commercial share-alike); upstream NAVER attribution required (NOTICE.md, papers arXiv:2407.01102 and arXiv:2407.01463).
- Cost guardrails are built into API components; runs are cost-aware by design.
- Everything published must be fully bilingual: Thai and English versions of audience-facing material.
- Technical terminology (API, model names, metric names) stays English within bilingual copy.

## Brand Commitments

- Name: BERGEN (this repo presented as the Thai-focused fork, "bergen-more-th").
- Existing logo: `documentation/images/BERGEN.png`; teaser figure `documentation/images/teaser_bergen.jpg`.
- Upstream BERGEN identity (NAVER/all authors) must remain credited.

## Evidence on Hand

- MKQA TH dev leaderboard table with DeepSeek-V4.1F baseline numbers (README.md).
- Research papers (arXiv:2407.01102, arXiv:2407.01463) and EMNLP'24 slides (`documentation/BERGEN.pdf`).
- Upstream baseline Match-metric tables for LLama-2-7B/70B, Mistral-8x7B, Solar-10.7B across ASQA/NQ/TriviaQA/POPQA/HotpotQA.
- Experiment run outputs in `experiments/`, `outputs/`, `logs/`.
- No fabricated testimonials, customers, or pricing exist; none may be invented.

## Product Principles

1. Judge-first truth: the LLM-as-judge against retrieved context is the headline score; string metrics support, never replace it — Thai answers under-credit otherwise.
2. Reproducibility: every published number must name its dataset split, pipeline configuration, and metrics, and link the exact commands to reproduce it.
3. Endpoint-agnostic: benchmark what any compatible endpoint serves; never hard-couple results to one provider.
4. Bilingual parity: Thai and English outputs carry the same information for the same audience; neither is a summary of the other.
5. Honest absence: publish only measured results; absences are stated, never filled with invented numbers.

## Accessibility & Inclusion

Fully bilingual Thai + English outputs are a hard requirement for any published surface; Thai consumers must not receive a degraded or partial translation.
