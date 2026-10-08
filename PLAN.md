# Plan: API-based Retrievers & Rerankers for BERGEN (Full RAG pipeline on Thai via APIs)

> Status: **implemented ✅** — `models/api_utils.py`, `models/retrievers/dense_api.py`, `models/rerankers/api_reranker.py`, `models/env.py`, the `config/{retriever,reranker,generator}/api-*.yaml` configs, `documentation/apis.md`, `tests/api_models_test.py` and `example.env` are all in the repo. This file is kept as the design record. Note two decisions evolved during implementation: `model_name` *may* contain `/` now (`modules/retrieve.py::get_clean_model_name` sanitizes index paths for us, same as for the HF retrievers), and the per-component endpoint routing (`EMBED_*` / `RERANK_*` / `LLM_*` / `JUDGE_*` env vars with the `OPENAI_BASE_URL` fallback) is documented in `documentation/apis.md`.

## Context

This fork of BERGEN currently supports only **local** retrievers (BM25/pyserini, HF dense, SPLADE) and **local** rerankers (HF CrossEncoders). The goal is to run the **full RAG pipeline on Thai tasks** (`mkqa/mkqa_th.retrieve_th`) using **endpoint APIs for all three stages**:

- LLM — ✅ already supported (`models/generators/llm_openai.py`)
- Embedding — ❌ new `DenseAPI` retriever (this plan)
- Reranker — ❌ new `APIReranker` (this plan)

Hardware: GPU available but API is primary. Cost guardrails required (indexing the Thai Wikipedia, 1–2M 100-word chunks, through an embedding API costs real money). Code should follow repo conventions so it could be upstreamed as a PR.

**Approved provider scope:**
| Stage | Providers |
|---|---|
| Embedding | OpenAI-compatible (base_url: Together/vLLM/TEI/LiteLLM/internal Thai endpoints), Cohere, Voyage, Google Gemini |
| Reranker | OpenAI-compatible (`/rerank` style), Cohere Rerank, Jina, Voyage Rerank |

## Key wiring facts (verified in code)

- **Retriever contract**: `__call__(query_or_doc, batch) -> {"embedding": Tensor}`, `collate_fn(batch, query_or_doc)`, `similarity_fn(q, d)`. `modules/retrieve.py` drives indexing (`encode_and_save` writes `index_path/embedding_chunk_*.pt`) and search (brute-force `similarity_fn` + torch top-k). No FAISS in repo.
- **Reranker contract**: `collate_fn(examples)` -> mutable dict containing `q_id`/`d_id` keys (popped by `Rerank.eval` before `__call__`); `__call__(kwargs) -> {"score": CPU Tensor}`. `modules/rerank.py` concatenates, sorts per query, writes TREC run.
- Both modules hardcode `.to('cuda')` (`modules/retrieve.py:76,124,153`; `modules/rerank.py:28`). API classes expose a stub `self.model = torch.nn.Identity()` so those lines become harmless no-ops. The only *real* GPU need left is the similarity top-k (`retrieve.py:153`) → one optional 2-line device-fallback patch.
- **Caching keyed on `model_name`** → must be path-safe (no `/`). Changing `model_name` = new index dir = automatic re-index.
- Indexing DataLoader uses `num_workers=4` → `collate_fn` runs in **subprocesses** → API clients must be **lazy per-process**; confirmation banner may print once per worker (documented).
- Precedent: `llm_openai.py` tracks `total_cost` (read by `rag.py:480-486`). Optional client libs (openai/pyserini/vllm) are NOT in `requirements.txt` — installed ad-hoc per `INSTALL.md`. Same policy for `cohere`, `voyageai`, `google-genai`.
- Yaml convention — retriever: `{init_args: {_target_, ...kwargs incl nested similarity}, batch_size, batch_size_sim}`; reranker: `{init_args: {_target_, ...}, batch_size}`.

## Implementation

### 1. NEW `models/api_utils.py` — shared helpers (repo copyright header)
- `call_with_retry(fn, max_retries=6, base_delay=2.0, provider="API")` — exponential backoff + jitter; honors `Retry-After`; retryable = HTTP 429/5xx or SDK exceptions detected by class-name substring (`RateLimit`, `Internal`, `ServerError`, `ServiceUnavailable`, `Timeout`) — so **no SDK imports** in this module. On exhaustion: `RuntimeError` naming provider + env-var hint.
- `confirm_api_cost(what, estimated_calls, price_note, dry_run, require_confirmation)`:
  - `dry_run=True` → print banner + raise `SystemExit` **before any API call** (zero spend)
  - non-tty stdin / `BERGEN_API_CONFIRM` env / `require_confirmation=False` → auto-proceed (prints note)
  - else interactive `input('Proceed? [y/N] ')`

### 2. NEW `models/retrievers/dense_api.py` — `DenseAPI(Retriever)`
- `__init__(model_name, provider, similarity, dimensions=None, base_url=None, max_retries=6, batch_pause=0.0, dry_run=False, require_confirmation=True, index_tokens_estimate=None)`
  - asserts no `/` in `model_name`
  - `self.model = torch.nn.Identity()` (stub for `.to('cuda')` calls in `retrieve.py`)
  - `self._client = None` — lazy, built once **per process** (safe with `num_workers=4`)
- `collate_fn(batch, query_or_doc=None)` — mirrors `Dense.collate_fn`'s text selection (`sample['generated_query']` for queries, `sample['content']` for docs) but returns `list[str]` (no tokenizer).
- `__call__(query_or_doc, batch)` — dispatches per provider through `call_with_retry`, returns `{"embedding": torch.tensor(..., dtype=float32)}`.
- Provider specifics:
  - `openai_compatible`: `openai.OpenAI(api_key=$OPENAI_API_KEY, base_url=base_url or $OPENAI_BASE_URL)`; `client.embeddings.create(model, input=texts, dimensions=?)`
  - `cohere`: `cohere.ClientV2($COHERE_API_KEY)`; `input_type="search_query"/"search_document"`
  - `voyage`: `voyageai.Client($VOYAGE_API_KEY)`; `input_type="query"/"document"`
  - `google`: `google.genai.Client($GOOGLE_API_KEY)`; `task_type="RETRIEVAL_QUERY"/"RETRIEVAL_DOCUMENT"`
  - Missing key → fail fast: `ValueError: {PROVIDER} requires the {ENV} environment variable... export {ENV}=<your-key>`
- `similarity_fn` → `self.similarity.sim(...)`, reusing existing `models.retrievers.dense.CosineSim` via yaml `_target_`.
- One-time banner per direction (provider/model/batch size + corpus-size caveat + optional `index_tokens_estimate`), gated by `confirm_api_cost`.
- Tracks `total_tokens` / `estimated_cost` attrs (provider `usage` fields where returned) for future rag.py cost wiring.

### 3. NEW `models/rerankers/api_reranker.py` — `APIReranker(Reranker)`
- Same init/stub/`Identity`/lazy-client pattern.
- `collate_fn(examples)` → mutable dict `{queries, docs (optional max_doc_chars truncation), q_id, d_id}`.
- `__call__` groups batch by **unique query** (order-preserving), calls provider per group, maps results back to pair order via `results[i].index`; returns `{"score": torch.tensor(scores, float32)}` on CPU.
- Providers:
  - `cohere` → `client.rerank(model, query, documents, top_n)`
  - `jina` → `requests` POST `https://api.jina.ai/v1/rerank` (`$JINA_API_KEY`)
  - `voyage` → `client.rerank(query, documents, model, top_k)`
  - `openai_compatible` → `requests` POST `{base_url}/rerank` (Cohere-shaped JSON; TEI `{scores}` fallback); `base_url` required → clear error if absent
- Retries; retry-exhausted → **hard error**, never silent zero-scores; same dry-run/confirm banner.

### 4. NEW configs (8 files, `api-*` naming)
`config/retriever/`:
- `api-embed-cohere-embed-multilingual-v3.yaml` ← **Thai primary** (`embed-multilingual-v3`, batch 96)
- `api-embed-openai-text-embedding-3-large.yaml` (`dimensions: 3072`, batch 256)
- `api-embed-voyage-3.yaml` (`voyage-3`, batch 100)
- `api-embed-google-gemini-embedding-001.yaml` (`gemini-embedding-001`, `dimensions: 768`, batch 100)

Each shaped like:
```yaml
init_args:
  _target_: models.retrievers.dense_api.DenseAPI
  model_name: "embed-multilingual-v3"   # literal API id, path-safe
  provider: cohere
  similarity:
    _target_: models.retrievers.dense.CosineSim
  max_retries: 6
  dry_run: false
  require_confirmation: true
batch_size: 96
batch_size_sim: 2048
```

`config/reranker/`:
- `api-rerank-cohere-rerank-v3.yaml` (`rerank-multilingual-v3.0` ← Thai-capable)
- `api-rerank-jina-v2.yaml` (`jina-reranker-v2-base-multilingual`)
- `api-rerank-voyage-2.yaml` (`rerank-2`)
- `api-rerank-openai-compatible.yaml` (`base_url: ${oc.env:RERANK_BASE_URL}`)

### 5. Patches to existing files (minimal, separable)
- `models/generators/llm_openai.py`: add optional `base_url=None` kwarg (client already falls back to `OPENAI_BASE_URL` env → one-line change); wrap the `pricing[model]` `KeyError` → warning + 0 cost so custom-served models don't crash cost tracking.
- `modules/retrieve.py`: **optional** 2-line device fallback — `device = 'cuda' if torch.cuda.is_available() else 'cpu'` at lines 76 & 153. Zero behavior change on GPU machines; makes API retrieval work CPU-only. Kept as a separate small hunk for the PR.

(No other module changes — API classes fit existing `Retrieve`/`Rerank` drivers as-is.)

### 6. Docs & README
- NEW `documentation/apis.md`: provider/env-var table, install lines (`pip install cohere voyageai google-genai` — NOT added to `requirements.txt`, per INSTALL.md precedent), cost-safety usage (`dry_run`, `require_confirmation`, `BERGEN_API_CONFIRM`, cost estimate ≈ ceil(corpus_size / batch_size)), resume via `+continue_batch=N` (restart at last saved `embedding_chunk_*.pt` boundary), index cache keyed on `model_name`, Thai example commands.
- `documentation/extensions.md`: short "API-based retriever/reranker" subsection linking apis.md.
- `README.md`: one feature bullet.

### 7. NEW `tests/api_models_test.py` (pytest, no network)
- `DenseAPI.collate_fn` content/generated_query selection; `__call__` with stubbed client → `[B, D]` float32.
- `call_with_retry`: fake 429-twice-then-success; 6 consecutive failures → `RuntimeError` mentions provider + env var.
- `APIReranker.collate_fn` keeps `q_id`/`d_id`; `__call__` with stubbed client + 2 interleaved queries → scores mapped back to original pair order.
- `dry_run=True` → `SystemExit` before any client call; non-tty → auto-proceed.

## Verification plan (exact commands)

```bash
pytest tests/api_models_test.py

# 1. Oracle sanity — no API indexing (uses cached runs/run.oracle.mkqa_th.dev.trec)
python3 bergen.py dataset='mkqa/mkqa_th.retrieve_th' retriever='oracle_provenance' \
  reranker='api-rerank-cohere-rerank-v3' generator='openai_gpt4o' \
  retrieve_top_k=100 rerank_top_k=10 +reranker.init_args.dry_run=true   # verify dry-run gate
# repeat with dry_run=false to actually run

# 2. Embedding DRY-RUN smoke on small corpus (never dry-run the Thai wiki blind)
python3 bergen.py dataset='2wikimultihopqa' \
  retriever='api-embed-openai-text-embedding-3-large' +retriever.init_args.dry_run=true
# then real small-corpus run (dry_run removed)

# 3. Full Thai pipeline (real cost; confirmation prompt appears)
python3 bergen.py dataset='mkqa/mkqa_th.retrieve_th' \
  retriever='api-embed-cohere-embed-multilingual-v3' \
  reranker='api-rerank-cohere-rerank-v3' generator='openai_gpt4o' \
  retrieve_top_k=100 rerank_top_k=10 generation_top_k=5
# resume after crash: +continue_batch=<batch idx of last embedding_chunk_*.pt>

# 4. Metrics
python3 evaluate.py --experiments_folder experiments/ --split dev
python3 print_results.py --folder experiments/ --format=tiny
```

All standard BERGEN metrics apply unchanged (retrieval recall from qrels+pytrec_eval, Match/EM/char-3-gram-recall/ROUGE, optional LLMEval + Thai LID correct-language-rate) — the API classes only swap *where* embeddings/scores come from.

## Edge cases checklist
- 429 / Retry-After / sustained limits → backoff + `batch_pause` knob
- Thai text → handled provider-side (no local tokenization at API level)
- Long docs → optional `max_doc_chars` client-side truncation (warns once)
- Partial batch failure → hard error with context; never silent zero-fill
- `num_workers=4` subprocesses → lazy per-process clients; banner may print per worker (documented)
- Index caching keyed on `model_name` → path-safety assert; new model/dim = new index dir
- CPU-only machines → device fallback patch
- CI/slurm non-interactive → confirmation auto-proceeds (prints note); `BERGEN_API_CONFIRM` documented
