'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Reranker backed by a reranking API instead of a local cross-encoder.
Providers: cohere, voyage, jina, openai_compatible (any Cohere/TEI-compatible
/rerank endpoint, e.g. vLLM, TEI or a self-hosted gateway - set base_url,
RERANK_BASE_URL or OPENAI_BASE_URL).

Cost guardrails: a confirmation banner is shown once before the first API
call, unless disabled via `require_confirmation: false` or the
BERGEN_API_CONFIRM env var; `dry_run: true` exits before any API call is made.
'''

import os
import time

import torch

from models.api_utils import call_with_retry, confirm_api_cost, require_env
from models.rerankers.reranker import Reranker


class APIReranker(Reranker):
    def __init__(self,
                 model_name,
                 provider,
                 base_url=None,
                 max_retries=6,
                 batch_pause=0.0,
                 max_doc_chars=None,
                 dry_run=False,
                 require_confirmation=True):
        # model_name may contain '/' (e.g. 'BAAI/bge-reranker-v2-m3' on a LiteLLM
        # endpoint): modules/rerank.py replaces '/' with '_' when building run
        # file names, same as it does for local HuggingFace rerankers.
        assert provider in ('cohere', 'voyage', 'jina', 'openai_compatible'), \
            f'Unknown reranking provider: {provider}'
        self.model_name = model_name
        self.provider = provider
        self.base_url = base_url
        self.max_retries = max_retries
        self.batch_pause = batch_pause
        self.max_doc_chars = max_doc_chars
        self.dry_run = dry_run
        self.require_confirmation = require_confirmation

        # stub so that `self.model.model.to(...)` in modules/rerank.py is a no-op
        self.model = torch.nn.Identity()
        self.client = None
        self._confirmed = False
        self._truncation_warned = False

    # ---------- pickling (DataLoader spawn workers) ----------

    def __getstate__(self):
        # spawn workers receive this object via pickle; httpx/SDK clients hold
        # thread locks and must not be pickled. drop the client - the worker
        # lazily creates its own on first use
        state = self.__dict__.copy()
        state['client'] = None
        return state

    # ---------- cost guardrail ----------

    def _confirm_once(self):
        if self._confirmed:
            return
        self._confirmed = True
        confirm_api_cost(
            what=f'Reranking API scoring of (query, document) pairs '
                 f'(provider={self.provider}, model={self.model_name})',
            dry_run=self.dry_run,
            require_confirmation=self.require_confirmation,
        )

    # ---------- collate ----------

    def collate_fn(self, examples):
        # module/rerank.py pops 'q_id' and 'd_id' from this dict before calling the model
        return {
            'queries': [e['query'] for e in examples],
            'docs': [self._truncate(e['doc']) for e in examples],
            'q_id': [e['q_id'] for e in examples],
            'd_id': [e['d_id'] for e in examples],
        }

    def _truncate(self, text):
        if self.max_doc_chars is None or len(text) <= self.max_doc_chars:
            return text
        if not self._truncation_warned:
            print(f'[APIReranker] WARNING: documents are truncated to max_doc_chars={self.max_doc_chars} '
                  'before being sent to the API (shown once)')
            self._truncation_warned = True
        return text[:self.max_doc_chars]

    # ---------- scoring ----------

    def __call__(self, kwargs):
        # kwargs is the collate_fn output with 'q_id'/'d_id' already popped by Rerank.eval
        self._confirm_once()
        queries, docs = kwargs['queries'], kwargs['docs']

        # reranking APIs take one query and a list of documents per call:
        # group the (query, doc) pairs of this batch by unique query, order-preserving
        groups = {}
        order = []
        for position, (query, doc) in enumerate(zip(queries, docs)):
            if query not in groups:
                groups[query] = []
                order.append(query)
            groups[query].append((position, doc))

        scores = [None] * len(queries)
        for group_index, query in enumerate(order):
            positions = [p for p, _ in groups[query]]
            texts = [d for _, d in groups[query]]
            group_scores = self._dispatch(query, texts)
            for position, score in zip(positions, group_scores):
                scores[position] = score
            if self.batch_pause and group_index < len(order) - 1:
                time.sleep(self.batch_pause)

        return {'score': torch.tensor(scores, dtype=torch.float32)}

    def _dispatch(self, query, documents):
        if self.provider == 'cohere':
            return self._rerank_cohere(query, documents)
        if self.provider == 'voyage':
            return self._rerank_voyage(query, documents)
        if self.provider == 'jina':
            return self._rerank_jina(query, documents)
        # openai_compatible (Cohere/TEI-shaped /rerank endpoint)
        return self._rerank_openai_compatible(query, documents)

    def _get_client(self):
        if self.client is None:
            if self.provider == 'cohere':
                import cohere
                self.client = cohere.ClientV2(api_key=require_env('COHERE_API_KEY', self.provider))
            elif self.provider == 'voyage':
                import voyageai
                self.client = voyageai.Client(api_key=require_env('VOYAGE_API_KEY', self.provider))
        return self.client

    @staticmethod
    def _scores_from_indexed_results(results, n_docs):
        """Map provider results ([{index, score}]) back to document order."""
        scores = [0.0] * n_docs
        seen = [False] * n_docs
        for result in results:
            index = result['index']
            score = result.get('relevance_score', result.get('score'))
            scores[index] = float(score)
            seen[index] = True
        if not all(seen):
            missing = [i for i, ok in enumerate(seen) if not ok]
            raise RuntimeError(
                f'Reranking API returned no score for {len(missing)} of {n_docs} '
                f'documents (indices {missing[:5]}...); refusing to zero-fill silently.')
        return scores

    def _rerank_cohere(self, query, documents):
        def call():
            return self._get_client().rerank(
                model=self.model_name,
                query=query,
                documents=documents,
                top_n=len(documents),
            )

        result = call_with_retry(call, max_retries=self.max_retries, provider=self.provider)
        results = [{'index': r.index, 'score': r.relevance_score} for r in result.results]
        return self._scores_from_indexed_results(results, len(documents))

    def _rerank_voyage(self, query, documents):
        def call():
            return self._get_client().rerank(
                query=query,
                documents=documents,
                model=self.model_name,
                top_k=len(documents),
            )

        result = call_with_retry(call, max_retries=self.max_retries, provider=self.provider)
        results = [{'index': r.index, 'score': r.relevance_score} for r in result.results]
        return self._scores_from_indexed_results(results, len(documents))

    def _post_rerank_http(self, url, api_key, query, documents):
        import requests

        def call():
            response = requests.post(
                url,
                headers={'Authorization': f'Bearer {api_key}',
                         'Content-Type': 'application/json'},
                json={'model': self.model_name,
                      'query': query,
                      'documents': documents,
                      'top_n': len(documents)},
                timeout=120,
            )
            response.raise_for_status()
            return response.json()

        data = call_with_retry(call, max_retries=self.max_retries, provider=self.provider)
        if isinstance(data, list):
            # TEI shape: [{"index": i, "score": s}, ...]
            results = data
        elif 'results' in data:
            # Cohere/Jina shape: {"results": [{"index": i, "relevance_score": s}, ...]}
            results = data['results']
        elif 'scores' in data:
            # plain score list, already in document order
            return [float(s) for s in data['scores']]
        else:
            raise RuntimeError(f'Unexpected {self.provider} rerank response shape: {list(data)[:5]}')
        return self._scores_from_indexed_results(results, len(documents))

    def _rerank_jina(self, query, documents):
        return self._post_rerank_http(
            'https://api.jina.ai/v1/rerank',
            require_env('JINA_API_KEY', self.provider),
            query, documents)

    def _rerank_openai_compatible(self, query, documents):
        base_url, api_key = self._openai_compatible_endpoint()
        return self._post_rerank_http(
            base_url.rstrip('/') + '/rerank', api_key, query, documents)

    def _openai_compatible_endpoint(self):
        # precedence: config field > RERANK_BASE_URL > OPENAI_BASE_URL, so the
        # reranker can live on a different endpoint than the embedder/LLM
        base_url = (self.base_url or os.environ.get('RERANK_BASE_URL')
                    or os.environ.get('OPENAI_BASE_URL'))
        if not base_url:
            raise ValueError(
                'provider=openai_compatible requires a base_url: set the base_url config field '
                'or export RERANK_BASE_URL (or OPENAI_BASE_URL), e.g. https://my-server/v1')
        # rerank servers (vLLM, TEI, LiteLLM gateway keys) either need the
        # gateway key or accept any key; local/proxy servers accept 'EMPTY'
        api_key = (os.environ.get('RERANK_API_KEY') or os.environ.get('OPENAI_API_KEY')
                   or 'EMPTY')
        return base_url, api_key
