'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Dense retriever backed by an embedding API instead of a local model.
Providers: openai_compatible (any OpenAI-compatible /v1/embeddings endpoint,
set base_url, EMBED_BASE_URL or OPENAI_BASE_URL), cohere, voyage, google
(Gemini).

Cost guardrails: a confirmation banner is shown once per direction before the
first API call, unless disabled via `require_confirmation: false` or the
BERGEN_API_CONFIRM env var; `dry_run: true` exits before any API call is made.
'''

import os
import time

import torch

from models.api_utils import call_with_retry, confirm_api_cost, require_env
from models.retrievers.retriever import Retriever


class DenseAPI(Retriever):
    def __init__(self,
                 model_name,
                 provider,
                 similarity,
                 dimensions=None,
                 base_url=None,
                 max_retries=6,
                 batch_pause=0.0,
                 dry_run=False,
                 require_confirmation=True,
                 index_tokens_estimate=None):
        # model_name may contain '/' (e.g. 'BAAI/bge-m3' on a LiteLLM endpoint,
        # or the model id as served): modules/retrieve.py::get_clean_model_name
        # replaces '/' with '_' when building index paths, same as it does for
        # the local HuggingFace retrievers.
        assert provider in ('openai_compatible', 'cohere', 'voyage', 'google'), \
            f'Unknown embedding provider: {provider}'
        self.model_name = model_name
        self.provider = provider
        self.similarity = similarity
        self.dimensions = dimensions
        self.base_url = base_url
        self.max_retries = max_retries
        self.batch_pause = batch_pause
        self.dry_run = dry_run
        self.require_confirmation = require_confirmation
        self.index_tokens_estimate = index_tokens_estimate

        # docs embed with request_batch_size texts per API call, queries 1-by-1.
        # EMBED_DOC_BATCH overrides the doc request batch for endpoints that cap it
        # (e.g. a 422 "batch size 96 > maximum allowed batch size 32").
        doc_batch = int(os.environ.get("EMBED_DOC_BATCH", "96"))
        self.request_batch_size = {'doc': doc_batch, 'query': 1}

        # stub so that `self.model.model.to(...)` in modules/retrieve.py is a no-op
        self.model = torch.nn.Identity()
        # per-process lazy client (the indexing DataLoader runs collate_fn in workers,
        # but __call__ runs in the main process; a per-process client is still the safe
        # pattern if this class is ever used inside workers)
        self.client = None
        self.total_tokens = 0
        self._confirmed = set()

    # ---------- pickling (DataLoader spawn workers) ----------

    def __getstate__(self):
        # spawn workers receive this object via pickle; httpx/SDK clients hold
        # thread locks and must not be pickled. drop the client - the worker
        # lazily creates its own via _get_client()
        state = self.__dict__.copy()
        state['client'] = None
        return state

    # ---------- cost guardrail ----------

    def _confirm_once(self, query_or_doc):
        if query_or_doc in self._confirmed:
            return
        self._confirmed.add(query_or_doc)
        direction = 'documents' if query_or_doc == 'doc' else 'queries'
        price_note = None
        if self.index_tokens_estimate is not None:
            price_note = f'Estimated corpus size (from configuration): ~{self.index_tokens_estimate:,} tokens.'
        confirm_api_cost(
            what=f'Embedding API indexing/encoding of {direction} '
                 f'(provider={self.provider}, model={self.model_name})',
            price_note=price_note,
            dry_run=self.dry_run,
            require_confirmation=self.require_confirmation,
        )

    # ---------- collate ----------

    def collate_fn(self, batch, query_or_doc=None):
        # run in DataLoader worker processes (num_workers > 0): no TTY there, so this
        # is a silent no-op - the real confirmation happens in the main-process __call__
        self._confirm_once(query_or_doc)
        key = 'content' if query_or_doc == 'doc' else 'generated_query'
        return [sample[key] for sample in batch]

    # ---------- encoding ----------

    def _get_client(self):
        if self.client is None:
            if self.provider == 'openai_compatible':
                import openai
                self.client = openai.OpenAI(
                    # per-component EMBED_* vars take precedence so the embedder
                    # can live on a different endpoint than the LLM/reranker
                    # (e.g. one LiteLLM gateway serving only /embeddings);
                    # base_url=None then falls back to $OPENAI_BASE_URL then api.openai.com
                    api_key=os.environ.get('EMBED_API_KEY') or require_env('OPENAI_API_KEY', self.provider),
                    base_url=self.base_url or os.environ.get('EMBED_BASE_URL') or None,
                )
            elif self.provider == 'cohere':
                import cohere
                self.client = cohere.ClientV2(api_key=require_env('COHERE_API_KEY', self.provider))
            elif self.provider == 'voyage':
                import voyageai
                self.client = voyageai.Client(api_key=require_env('VOYAGE_API_KEY', self.provider))
            elif self.provider == 'google':
                from google import genai
                self.client = genai.Client(api_key=require_env('GOOGLE_API_KEY', self.provider))
        return self.client

    def _collect_usage(self, usage):
        if usage is None:
            return
        tokens = getattr(usage, 'total_tokens', None) or getattr(usage, 'prompt_tokens', None)
        if tokens is None and isinstance(usage, dict):
            tokens = usage.get('total_tokens') or usage.get('prompt_tokens') or usage.get('billed_units')
        if tokens is None:
            billed = getattr(usage, 'billed_units', None)
            if billed is not None:
                tokens = getattr(billed, 'input_tokens', None)
        if tokens:
            self.total_tokens += int(tokens)

    def __call__(self, query_or_doc, batch):
        # batch is a plain list of strings produced by collate_fn
        self._confirm_once(query_or_doc)
        embeddings = []
        step = self.request_batch_size[query_or_doc]
        for start in range(0, len(batch), step):
            chunk = batch[start:start + step]
            embeddings.extend(self._dispatch(query_or_doc, chunk))
            if self.batch_pause and start + step < len(batch):
                time.sleep(self.batch_pause)
        return {'embedding': torch.tensor(embeddings, dtype=torch.float32)}

    def _dispatch(self, query_or_doc, texts):
        is_query = query_or_doc == 'query'
        if self.provider == 'openai_compatible':
            kwargs = {'model': self.model_name, 'input': texts}
            if self.dimensions is not None:
                kwargs['dimensions'] = self.dimensions

            def call():
                return self._get_client().embeddings.create(**kwargs)

            result = call_with_retry(call, max_retries=self.max_retries, provider=self.provider)
            self._collect_usage(getattr(result, 'usage', None))
            return [list(data.embedding) for data in result.data]

        if self.provider == 'cohere':
            def call():
                return self._get_client().embed(
                    texts=texts,
                    model=self.model_name,
                    input_type='search_query' if is_query else 'search_document',
                    embedding_types=['float'],
                )

            result = call_with_retry(call, max_retries=self.max_retries, provider=self.provider)
            self._collect_usage(getattr(getattr(result, 'meta', None), 'tokens', None))
            return [list(vec) for vec in result.embeddings.float]

        if self.provider == 'voyage':
            def call():
                return self._get_client().embed(
                    texts,
                    model=self.model_name,
                    input_type='query' if is_query else 'document',
                )

            result = call_with_retry(call, max_retries=self.max_retries, provider=self.provider)
            self._collect_usage(result.total_tokens if hasattr(result, 'total_tokens') else None)
            return [list(vec) for vec in result.embeddings]

        # google (Gemini)
        def call():
            from google.genai import types
            task_type = 'RETRIEVAL_QUERY' if is_query else 'RETRIEVAL_DOCUMENT'
            config_kwargs = {'task_type': task_type}
            if self.dimensions is not None:
                config_kwargs['output_dimensionality'] = self.dimensions
            return self._get_client().models.embed_content(
                model=self.model_name,
                contents=texts,
                config=types.EmbedContentConfig(**config_kwargs),
            )

        result = call_with_retry(call, max_retries=self.max_retries, provider=self.provider)
        self._collect_usage(getattr(getattr(result, 'metadata', None), 'billable_character_count', None))
        return [list(emb.values) for emb in result.embeddings]

    # ---------- similarity (same protocol as Dense) ----------

    def similarity_fn(self, query_embds, doc_embds):
        return self.similarity.sim(query_embds, doc_embds)
