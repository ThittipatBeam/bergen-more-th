# API-based retrievers, rerankers and generators

BERGEN can run a **full RAG pipeline with all model components hosted behind
HTTP APIs** — useful for benchmarking hosted models (OpenAI, Cohere, Voyage,
Gemini, Jina…) or your own OpenAI-compatible endpoints (vLLM, TEI, LiteLLM,
internal services) without any local GPU.

The corresponding model classes live in:

| Component | Class | Providers |
|---|---|---|
| Retriever (embeddings) | `models/retrievers/dense_api.py` (`DenseAPI`) | `openai_compatible`, `cohere`, `voyage`, `google` |
| Reranker | `models/rerankers/api_reranker.py` (`APIReranker`) | `cohere`, `voyage`, `jina`, `openai_compatible` |
| Generator (LLM) | `models/generators/llm_openai.py` (`OpenAI`) | any OpenAI-compatible chat endpoint (`base_url` / `OPENAI_BASE_URL`) |

## Installation

Like `openai`, `vllm` and `pyserini`, the API client packages are **not** in
`requirements.txt` — install the ones you need:

```bash
pip install openai            # openai_compatible (retriever + generator)
pip install cohere             # cohere embed / rerank
pip install voyageai           # voyage embed / rerank
pip install google-genai       # gemini embeddings
# jina rerank only needs `requests` (already a dependency)
```

## API keys

Keys can be `export`ed as usual **or** placed in a `.env` file in the repo
root — make it from the template and keep it to yourself:

```bash
cp example.env .env    # then fill in the keys you use
```

`.env` is gitignored and is picked up automatically by `bergen.py` and
`evaluate.py` (requires `python-dotenv`, part of `requirements.txt`; if the
package is missing the file is silently ignored and real environment
variables still work). Real environment variables always win over `.env`
entries.

## Endpoint routing: same server vs. different servers

Every OpenAI-compatible component (LLM generator, embedding retriever,
reranker, LLM-as-judge) resolves its base URL and key with the same precedence:

1. the `base_url` field in its own yaml config (explicit, per-run)
2. its component-specific env var: `LLM_*`, `EMBED_*`, `RERANK_*`, `JUDGE_*`
3. the shared `OPENAI_BASE_URL` / `OPENAI_API_KEY` fallback

Two common setups — see `example.env` for the matching template:

- **One server for everything** (e.g. a LiteLLM gateway or a vLLM box
  serving chat + embeddings + rerank): set only `OPENAI_BASE_URL` and
  `OPENAI_API_KEY` — all three components inherit them.
- **Different servers** (e.g. embeddings via OpenAI, LLM via Together,
  rerank via a local TEI container): set the component-specific vars
  (`EMBED_BASE_URL`/`EMBED_API_KEY`, etc.) for the components that differ
  and leave the rest on the shared fallback.

| Provider | Env var | Notes |
|---|---|---|
| openai_compatible | `OPENAI_API_KEY`, `OPENAI_BASE_URL` | `base_url` config field works too (retriever yamls: `init_args.base_url`) |
| cohere | `COHERE_API_KEY` | |
| voyage | `VOYAGE_API_KEY` | |
| google | `GOOGLE_API_KEY` | Gemini embeddings |
| jina | `JINA_API_KEY` | rerank only |
| judge | `JUDGE_API_KEY`, `JUDGE_BASE_URL`, `JUDGE_MODEL` | `python3 evaluate.py --judge`; openai_compatible only. `JUDGE_CONCURRENCY` caps in-flight requests (default 4). Set `JUDGE_MODEL` to the judge model id, or pass `--judge_model` |

Embedding runs use asymmetric input types (`search_query` / `search_document`,
or the provider equivalent) automatically, based on the encoding direction.

## Configs

Retrievers (`config/retriever/`):
- `api-embed-cohere-embed-multilingual-v3.yaml` — **multilingual, recommended for Thai**
- `api-embed-openai-text-embedding-3-large.yaml`
- `api-embed-voyage-3.yaml`
- `api-embed-google-gemini-embedding-001.yaml`

Rerankers (`config/reranker/`):
- `api-rerank-cohere-rerank-v3.yaml` (`rerank-multilingual-v3.0`, multilingual)
- `api-rerank-jina-v2.yaml` (`jina-reranker-v2-base-multilingual`)
- `api-rerank-voyage-2.yaml`
- `api-rerank-openai-compatible.yaml` — points at `${oc.env:RERANK_BASE_URL}`; set `export RERANK_BASE_URL=https://your-server/v1` (expects a Cohere- or TEI-shaped `/rerank` endpoint; plain `{scores: [...]}` responses are also accepted)

To point the **LLM** at your own endpoint, add `base_url` to a generator config:

```yaml
init_args:
  _target_: models.generators.llm_openai.OpenAI
  model_name: "my-thai-model"
  base_url: "https://my-server/v1"   # or export OPENAI_BASE_URL
```

## Cost guardrails

Indexing a full corpus (e.g. the Thai Wikipedia used by
`mkqa/mkqa_th.retrieve_th`, ~1–2M 100-word passages) through an embedding API
**costs real money**. The API classes therefore ship with guardrails:

- `dry_run: true` — prints the provider/model banner and exits **before any
  API call**: `python3 bergen.py ... +retriever.init_args.dry_run=true`
- `require_confirmation: true` (default) — an interactive `Proceed? [y/N]`
  prompt appears once per direction before the first request
- non-interactive sessions (CI, slurm) auto-proceed and print a note
- `export BERGEN_API_CONFIRM=1` — skip the prompt globally
- estimate your spend: `calls ≈ ceil(corpus_size / batch_size)` — run a dry-run
  first and check `batch_size` in the retriever yaml
- optional `init_args.index_tokens_estimate: 400000000` adds your own corpus
  token estimate to the banner
- `init_args.batch_pause: 0.5` adds a sleep between API calls for aggressive
  rate limits; retryable errors (429/5xx) are retried with exponential
  backoff (`init_args.max_retries: 6`)

## Caching & resume

- The index folder is keyed on the **API model id** (`model_name` in the
  yaml), e.g. `indexes/mkqa_th_devdoc_embed-multilingual-v3/`. Changing
  provider/model creates a fresh index — old indexes are kept.
- If indexing crashes mid-run, resume from the last saved embedding chunk:
  `+continue_batch=<batch index of the last embedding_chunk_*.pt file>`
  (the chunk file name stores the batch index; saved chunks are complete —
  restart at the batch number of the last existing chunk file).

## Example: full Thai pipeline over APIs

```bash
python3 bergen.py \
  dataset='mkqa/mkqa_th.retrieve_th' \
  retriever='api-embed-cohere-embed-multilingual-v3' \
  reranker='api-rerank-cohere-rerank-v3' \
  generator='openai_gpt4o' \
  retrieve_top_k=100 rerank_top_k=10 generation_top_k=5
```

### All-Cohere variant (single API key)

Cohere's chat models are exposed through an OpenAI-compatibility endpoint,
so a single `COHERE_API_KEY` covers all three stages — see the "all-Cohere"
block in `example.env`:

```bash
# .env
COHERE_API_KEY=<your key>
LLM_BASE_URL=https://api.cohere.ai/compatibility/v1
LLM_API_KEY=${COHERE_API_KEY}
```

```bash
python3 bergen.py \
  dataset='mkqa/mkqa_th.retrieve_th' \
  retriever='api-embed-cohere-embed-multilingual-v3' \
  reranker='api-rerank-cohere-rerank-v3' \
  generator='cohere_command_a' \
  retrieve_top_k=100 rerank_top_k=10 generation_top_k=5
```

(`generator=cohere_command_a` pins `base_url` in its yaml, so
`LLM_BASE_URL` in `.env` is only needed if you use a different generator
config against Cohere models — e.g. `generator=openai_gpt4o` with
`init_args.model_name` overridden.)

Dry-run it first: add `+retriever.init_args.dry_run=true` (and similarly for
`reranker.init_args`). Then evaluate as usual:

```bash
python3 evaluate.py --experiments_folder experiments/ --split dev
python3 print_results.py --folder experiments/ --format=tiny
```

All BERGEN metrics are unchanged — retrieval recall (qrels + pytrec_eval),
Match/EM/char-3-gram-recall/ROUGE, optional LLMEval and
correct-language-rate (LID) evaluation.
