'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Unit tests for API-based retriever (DenseAPI) and reranker (APIReranker)
and the shared api_utils helpers. No network access: provider clients are
stubbed.

Run from the root folder:
    pytest tests/api_models_test.py
'''

import sys
import types

import pytest
import torch

from models.api_utils import call_with_retry, confirm_api_cost, require_env
from models.api_utils import is_retryable


# ---------------------------------------------------------------------------
# stubs mimicking provider SDKs (no real packages / network needed)
# ---------------------------------------------------------------------------

class _FakeRateLimitError(Exception):
    status_code = 429


class _FakeHTTPError(Exception):
    status_code = 500


class FakeOpenAIEmbeddingData:
    def __init__(self, embedding):
        self.embedding = embedding


class FakeOpenAIEmbeddingsResponse:
    def __init__(self, embeddings, total_tokens=0):
        self.data = [FakeOpenAIEmbeddingData(e) for e in embeddings]
        self.usage = types.SimpleNamespace(total_tokens=total_tokens)


class FakeOpenAIEmbeddings:
    def create(self, model, input, dimensions=None):
        dim = dimensions or 4
        return FakeOpenAIEmbeddingsResponse(
            [[float(len(t))] * dim for t in input], total_tokens=sum(len(t) for t in input))


class FakeOpenAIClient:
    def __init__(self, api_key=None, base_url=None):
        self.api_key = api_key
        self.base_url = base_url
        self.embeddings = FakeOpenAIEmbeddings()


class FakeCohereRerankResult:
    def __init__(self, query, documents):
        # fake scores: longer doc = more relevant
        order = sorted(range(len(documents)), key=lambda i: len(documents[i]))
        self.results = [types.SimpleNamespace(index=i, relevance_score=float(rank))
                        for rank, i in enumerate(order)]


class FakeCohereClient:
    def __init__(self, api_key=None):
        pass

    def rerank(self, model, query, documents, top_n=None):
        return FakeCohereRerankResult(query, documents)


def _install_fake_openai(monkeypatch):
    fake_openai = types.ModuleType('openai')
    fake_openai.OpenAI = FakeOpenAIClient
    monkeypatch.setitem(sys.modules, 'openai', fake_openai)


def _install_fake_cohere(monkeypatch):
    fake_cohere = types.ModuleType('cohere')
    fake_cohere.ClientV2 = FakeCohereClient
    monkeypatch.setitem(sys.modules, 'cohere', fake_cohere)


# ---------------------------------------------------------------------------
# api_utils
# ---------------------------------------------------------------------------

def test_call_with_retry_succeeds_after_transient_errors(monkeypatch):
    monkeypatch.setattr('time.sleep', lambda s: None)
    calls = {'n': 0}

    def flaky():
        calls['n'] += 1
        if calls['n'] < 3:
            raise _FakeRateLimitError('slow down')
        return 'ok'

    assert call_with_retry(flaky, provider='cohere') == 'ok'
    assert calls['n'] == 3


def test_call_with_retry_raises_after_max_retries(monkeypatch):
    monkeypatch.setattr('time.sleep', lambda s: None)

    def always_fails():
        raise _FakeHTTPError('boom')

    with pytest.raises(RuntimeError, match='COHERE_API_KEY'):
        call_with_retry(always_fails, max_retries=2, provider='cohere')


def test_call_with_retry_non_retryable_raises_immediately(monkeypatch):
    monkeypatch.setattr('time.sleep', lambda s: None)
    calls = {'n': 0}

    def bad():
        calls['n'] += 1
        raise ValueError('not retryable')

    with pytest.raises(RuntimeError, match='after 1 attempt'):
        call_with_retry(bad, provider='jina')
    assert calls['n'] == 1


def test_is_retryable_status_and_classname():
    assert is_retryable(_FakeRateLimitError('x'))
    assert is_retryable(_FakeHTTPError('x'))

    class BareTimeoutError(Exception):
        pass

    assert is_retryable(BareTimeoutError('x'))
    assert not is_retryable(ValueError('x'))


def test_require_env(monkeypatch):
    monkeypatch.delenv('MISSING_ENV_FOR_TEST', raising=False)
    with pytest.raises(ValueError, match='export MISSING_ENV_FOR_TEST'):
        require_env('MISSING_ENV_FOR_TEST', 'cohere')
    monkeypatch.setenv('MISSING_ENV_FOR_TEST', 'abc')
    assert require_env('MISSING_ENV_FOR_TEST', 'cohere') == 'abc'


def test_confirm_api_cost_dry_run_exits():
    with pytest.raises(SystemExit):
        confirm_api_cost('test', dry_run=True)


def test_confirm_api_cost_auto_proceeds_with_env(monkeypatch):
    monkeypatch.setenv('BERGEN_API_CONFIRM', '1')
    assert confirm_api_cost('test', require_confirmation=True)


def test_confirm_api_cost_non_tty_auto_proceeds(monkeypatch):
    class NoTTY:
        def isatty(self):
            return False
    monkeypatch.setattr(sys, 'stdin', NoTTY())
    assert confirm_api_cost('test', require_confirmation=True)


# ---------------------------------------------------------------------------
# DenseAPI
# ---------------------------------------------------------------------------

def _make_dense_api(monkeypatch, **overrides):
    from models.retrievers.similarities import CosineSim
    from models.retrievers.dense_api import DenseAPI
    _install_fake_openai(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    kwargs = dict(model_name='text-embedding-3-large',
                  provider='openai_compatible',
                  similarity=CosineSim(),
                  dimensions=4,
                  require_confirmation=False)
    kwargs.update(overrides)
    return DenseAPI(**kwargs)


def test_dense_api_collate_fn_picks_fields(monkeypatch):
    model = _make_dense_api(monkeypatch)
    docs = [{'content': 'passage one', 'generated_query': 'q1', 'id': 'd1'},
            {'content': 'passage two', 'generated_query': 'q2', 'id': 'd2'}]
    assert model.collate_fn(docs, 'doc') == ['passage one', 'passage two']
    assert model.collate_fn(docs, 'query') == ['q1', 'q2']


def test_dense_api_call_returns_float_tensor(monkeypatch):
    model = _make_dense_api(monkeypatch)
    out = model('doc', ['hello', 'hello world'])
    emb = out['embedding']
    assert isinstance(emb, torch.Tensor)
    assert emb.dtype == torch.float32
    assert emb.shape == (2, 4)
    assert emb[1, 0].item() == float(len('hello world'))


def test_dense_api_query_batch_size_is_one(monkeypatch):
    model = _make_dense_api(monkeypatch)
    # query encoding sends 1 text per API call
    assert model.request_batch_size['query'] == 1
    out = model('query', ['a', 'b', 'c'])
    assert out['embedding'].shape == (3, 4)


def test_dense_api_dry_run_exits_before_api_call(monkeypatch):
    model = _make_dense_api(monkeypatch, dry_run=True)
    with pytest.raises(SystemExit):
        model('doc', ['hello'])


def test_dense_api_similarity_fn(monkeypatch):
    model = _make_dense_api(monkeypatch)
    q = torch.randn(2, 4)
    d = torch.randn(3, 4)
    scores = model.similarity_fn(q, d)
    assert scores.shape == (2, 3)


def test_dense_api_accepts_slash_in_model_name(monkeypatch):
    # endpoint-served model ids look like 'BAAI/bge-m3'; BERGEN sanitizes '/'
    # -> '_' when building index paths (modules/retrieve.get_clean_model_name),
    # same as for local HuggingFace retrievers, so the class must not reject them
    from models.retrievers.similarities import CosineSim
    from models.retrievers.dense_api import DenseAPI
    _install_fake_openai(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    model = DenseAPI(model_name='BAAI/bge-m3',
                     provider='openai_compatible',
                     similarity=CosineSim(),
                     require_confirmation=False)
    assert model.model_name == 'BAAI/bge-m3'
    out = model('doc', ['hello'])
    assert out['embedding'].shape[0] == 1


def test_reranker_accepts_slash_in_model_name(monkeypatch):
    from models.rerankers.api_reranker import APIReranker
    _install_fake_cohere(monkeypatch)
    monkeypatch.setenv('COHERE_API_KEY', 'fake-key')
    model = APIReranker(model_name='BAAI/bge-reranker-v2-m3',
                        provider='cohere',
                        require_confirmation=False)
    assert model.model_name == 'BAAI/bge-reranker-v2-m3'
    out = model({'queries': ['q'], 'docs': ['d']})
    assert out['score'].shape == (1,)


# ---------------------------------------------------------------------------
# per-component env vars: embedder / reranker / LLM can sit on different
# servers than the shared OPENAI_BASE_URL (e.g. LiteLLM + separate TEI box)
# ---------------------------------------------------------------------------

def test_data_loader_collate_is_pickle_safe_under_spawn(monkeypatch):
    # bergen.py uses the spawn start method; DataLoader num_workers>0 then has
    # to pickle the collate function - a lambda breaks. The module must use a
    # picklable partial over the bound model method.
    import pickle
    from functools import partial
    model = _make_dense_api(monkeypatch)
    collate = partial(model.collate_fn, query_or_doc='doc')
    collate = pickle.loads(pickle.dumps(collate))
    docs = [{'content': 'a', 'generated_query': 'q'}]
    assert collate(docs) == ['a']


def test_model_picklable_after_client_created(monkeypatch):
    # encode_and_save creates the DataLoader dataloader (pickled for spawn
    # workers) once per direction; after the first direction ran, the model
    # holds a live httpx/SDK client with thread locks that cannot be pickled.
    # __getstate__ must drop it; workers rebuild their own lazily.
    import pickle
    import threading
    model = _make_dense_api(monkeypatch)
    model._get_client()
    # emulate the unpicklable internals of a real SDK client (httpx pool lock)
    model.client.__dict__['_pool_lock'] = threading.RLock()
    with pytest.raises(TypeError):
        pickle.dumps(model.client)          # sanity: raw client is unpicklable
    restored = pickle.loads(pickle.dumps(model))
    assert restored.client is None
    # and the restored copy is fully functional (lazy client recreated)
    docs = [{'content': 'x', 'generated_query': 'q'}]
    assert restored.collate_fn(docs, 'doc') == ['x']
    out = restored('doc', ['x'])
    assert out['embedding'].shape[0] == 1

def test_dense_api_uses_embed_env_overrides(monkeypatch):
    model = _make_dense_api(monkeypatch)
    monkeypatch.setenv('EMBED_BASE_URL', 'http://embed-server/v1')
    monkeypatch.setenv('EMBED_API_KEY', 'embed-key')
    client = model._get_client()
    assert client.base_url == 'http://embed-server/v1'
    assert client.api_key == 'embed-key'


def test_dense_api_falls_back_to_shared_openai_vars(monkeypatch):
    model = _make_dense_api(monkeypatch)
    monkeypatch.delenv('EMBED_BASE_URL', raising=False)
    monkeypatch.delenv('EMBED_API_KEY', raising=False)
    client = model._get_client()
    # base_url=None -> the real openai client would fall back to $OPENAI_BASE_URL
    assert client.base_url is None
    assert client.api_key == 'fake-key'


def test_dense_api_base_url_config_beats_embed_env(monkeypatch):
    model = _make_dense_api(monkeypatch, base_url='http://from-config/v1')
    monkeypatch.setenv('EMBED_BASE_URL', 'http://embed-server/v1')
    assert model._get_client().base_url == 'http://from-config/v1'


# ---------------------------------------------------------------------------
# APIReranker
# ---------------------------------------------------------------------------

def _make_reranker(monkeypatch, **overrides):
    from models.rerankers.api_reranker import APIReranker
    _install_fake_cohere(monkeypatch)
    monkeypatch.setenv('COHERE_API_KEY', 'fake-key')
    kwargs = dict(model_name='rerank-multilingual-v3.0',
                  provider='cohere',
                  require_confirmation=False)
    kwargs.update(overrides)
    return APIReranker(**kwargs)


def test_reranker_collate_fn_keeps_ids(monkeypatch):
    model = _make_reranker(monkeypatch)
    examples = [{'query': 'q', 'doc': 'd', 'q_id': 'Q1', 'd_id': 'D1'},
                {'query': 'q', 'doc': 'dd', 'q_id': 'Q1', 'd_id': 'D2'}]
    batch = model.collate_fn(examples)
    assert batch['q_id'] == ['Q1', 'Q1']
    assert batch['d_id'] == ['D1', 'D2']
    assert batch['queries'] == ['q', 'q']
    assert batch['docs'] == ['d', 'dd']


def test_reranker_scores_map_back_to_pair_order(monkeypatch):
    model = _make_reranker(monkeypatch)
    # two interleaved queries; FakeCohereClient scores by doc length
    batch = {
        'queries': ['qA', 'qB', 'qA'],
        'docs': ['short', 'x' * 50, 'x' * 5],  # qA: doc0(len5)>doc2(len5)? use distinct lens
    }
    batch['docs'] = ['' + 'a' * 5, 'b' * 50, 'c' * 2]
    out = model(batch)
    scores = out['score']
    assert isinstance(scores, torch.Tensor)
    assert scores.dtype == torch.float32
    assert scores.shape == (3,)
    # qA docs: 'aaaaa' (len5) -> rank1, 'cc' (len2) -> rank0 ; qB doc: 'b'*50 alone -> rank0
    assert scores[0].item() > scores[2].item()


def test_reranker_dry_run_exits_before_api_call(monkeypatch):
    model = _make_reranker(monkeypatch, dry_run=True)
    with pytest.raises(SystemExit):
        model({'queries': ['q'], 'docs': ['d']})


def test_reranker_max_doc_chars_truncates(monkeypatch):
    model = _make_reranker(monkeypatch, max_doc_chars=10)
    batch = model.collate_fn([{'query': 'q', 'doc': 'x' * 100, 'q_id': 'Q', 'd_id': 'D'}])
    assert batch['docs'][0] == 'x' * 10


def test_reranker_openai_compatible_requires_base_url(monkeypatch):
    from models.rerankers.api_reranker import APIReranker
    for var in ('OPENAI_BASE_URL', 'RERANK_BASE_URL', 'EMBED_BASE_URL',
                'RERANK_API_KEY', 'OPENAI_API_KEY', 'LLM_BASE_URL', 'LLM_API_KEY'):
        monkeypatch.delenv(var, raising=False)
    model = APIReranker(model_name='some-reranker',
                        provider='openai_compatible',
                        require_confirmation=False)
    with pytest.raises(ValueError, match='base_url'):
        model({'queries': ['q'], 'docs': ['d']})


def _make_openai_compatible_reranker(monkeypatch, **overrides):
    from models.rerankers.api_reranker import APIReranker
    for var in ('OPENAI_BASE_URL', 'RERANK_BASE_URL', 'RERANK_API_KEY', 'OPENAI_API_KEY'):
        monkeypatch.delenv(var, raising=False)
    kwargs = dict(model_name='bge-reranker-v2-m3',
                  provider='openai_compatible',
                  require_confirmation=False)
    kwargs.update(overrides)
    return APIReranker(**kwargs)


def test_reranker_uses_rerank_env_overrides(monkeypatch):
    model = _make_openai_compatible_reranker(monkeypatch)
    monkeypatch.setenv('OPENAI_BASE_URL', 'http://shared/v1')
    monkeypatch.setenv('RERANK_BASE_URL', 'http://rerank-server/v1')
    monkeypatch.setenv('RERANK_API_KEY', 'rerank-key')
    base_url, api_key = model._openai_compatible_endpoint()
    assert base_url == 'http://rerank-server/v1'
    assert api_key == 'rerank-key'


def test_reranker_falls_back_to_shared_openai_vars(monkeypatch):
    model = _make_openai_compatible_reranker(monkeypatch)
    monkeypatch.setenv('OPENAI_BASE_URL', 'http://shared/v1')
    monkeypatch.setenv('OPENAI_API_KEY', 'shared-key')
    base_url, api_key = model._openai_compatible_endpoint()
    assert base_url == 'http://shared/v1'
    assert api_key == 'shared-key'


def test_reranker_base_url_config_beats_env(monkeypatch):
    model = _make_openai_compatible_reranker(monkeypatch, base_url='http://from-config/v1')
    monkeypatch.setenv('RERANK_BASE_URL', 'http://rerank-server/v1')
    base_url, _ = model._openai_compatible_endpoint()
    assert base_url == 'http://from-config/v1'


def test_reranker_key_defaults_to_empty(monkeypatch):
    model = _make_openai_compatible_reranker(monkeypatch, base_url='http://local-tei/v1')
    _, api_key = model._openai_compatible_endpoint()
    assert api_key == 'EMPTY'


# ---------------------------------------------------------------------------
# LLM generator endpoint routing
# ---------------------------------------------------------------------------

def test_llm_uses_llm_env_overrides(monkeypatch):
    _install_fake_openai(monkeypatch)
    monkeypatch.setenv('LLM_BASE_URL', 'http://llm-server/v1')
    monkeypatch.setenv('LLM_API_KEY', 'llm-key')
    monkeypatch.setenv('OPENAI_API_KEY', 'shared-key')
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4, prompt={'system': '', 'user': ''})
    client = gen._get_client()  # client is lazy (built on first generate call)
    assert client.base_url == 'http://llm-server/v1'
    assert client.api_key == 'llm-key'


def test_llm_falls_back_to_shared_openai_key(monkeypatch):
    _install_fake_openai(monkeypatch)
    for var in ('LLM_BASE_URL', 'LLM_API_KEY'):
        monkeypatch.delenv(var, raising=False)
    monkeypatch.setenv('OPENAI_API_KEY', 'shared-key')
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4, prompt={'system': '', 'user': ''})
    client = gen._get_client()
    # base_url=None -> real openai client falls back to $OPENAI_BASE_URL
    assert client.base_url is None
    assert client.api_key == 'shared-key'


def test_llm_picklable_after_client_created(monkeypatch):
    # generation eval DataLoader runs with num_workers=4 under spawn: the
    # generator (holding a live openai client with thread locks) is pickled
    # into workers via functools.partial(self.collate_fn). __getstate__ must
    # drop the client; workers only collate, the main process generates.
    import pickle
    import threading
    _install_fake_openai(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4, prompt={'system': '', 'user': ''})
    gen._get_client()
    gen.client.__dict__['_pool_lock'] = threading.RLock()
    with pytest.raises(TypeError):
        pickle.dumps(gen.client)  # sanity: raw client is unpicklable
    restored = pickle.loads(pickle.dumps(gen))
    assert restored.client is None
    restored = restored._get_client()  # lazy rebuild keeps same endpoint config
    assert restored.api_key == 'fake-key'


def _install_fake_chat_openai(monkeypatch, fail_contents=()):
    # chat.completions fake: response content = the user message, so we can
    # verify order preservation under concurrency. patches the already-imported
    # module attribute too: swapping sys.modules alone is a no-op once
    # models.generators.llm_openai has bound its top-level `import openai`.
    # fail_contents: user-message contents whose requests raise a permanent
    # (non-retryable) 400-shaped error, to emulate a poison prompt.
    fail_contents = set(fail_contents)

    class _FakeBadRequest(Exception):
        status_code = 400

    class FakeMessage:
        def __init__(self, content):
            self.content = content

    class FakeChoice:
        def __init__(self, content):
            self.message = FakeMessage(content)

    class FakeCompletions:
        def create(self, messages, model):
            # no sleep here: earlier tests monkeypatch time.sleep to a no-op,
            # and order preservation is verified with a delay-free fake anyway
            if messages[-1]['content'] in fail_contents:
                raise _FakeBadRequest('poison prompt')
            return types.SimpleNamespace(
                choices=[FakeChoice(messages[-1]['content'])],
                usage=types.SimpleNamespace(prompt_tokens=1, completion_tokens=1))

    class FakeChatOpenAIClient(FakeOpenAIClient):
        def __init__(self, api_key=None, base_url=None):
            super().__init__(api_key, base_url)
            self.chat = types.SimpleNamespace(completions=FakeCompletions())

    fake_openai = types.ModuleType('openai')
    fake_openai.OpenAI = FakeChatOpenAIClient
    monkeypatch.setitem(sys.modules, 'openai', fake_openai)
    import models.generators.llm_openai as llm_mod
    monkeypatch.setattr(llm_mod, 'openai', fake_openai)


def _msgs(n):
    return [[{'role': 'system', 'content': 's'},
             {'role': 'user', 'content': str(i)}] for i in range(n)]


def test_llm_generate_sequential_preserves_order(monkeypatch):
    _install_fake_chat_openai(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    monkeypatch.delenv('LLM_CONCURRENCY', raising=False)
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4,
                 prompt={'system': '', 'user': ''}, concurrency=1)
    assert gen.generate(_msgs(5)) == ['0', '1', '2', '3', '4']


def test_llm_generate_concurrent_preserves_order(monkeypatch):
    _install_fake_chat_openai(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    monkeypatch.delenv('LLM_CONCURRENCY', raising=False)
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4,
                 prompt={'system': '', 'user': ''}, concurrency=8)
    assert gen.generate(_msgs(20)) == [str(i) for i in range(20)]


def test_llm_concurrency_env_override(monkeypatch):
    _install_fake_openai(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    monkeypatch.setenv('LLM_CONCURRENCY', '32')
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4,
                 prompt={'system': '', 'user': ''}, concurrency=8)
    assert gen.concurrency == 32


def test_llm_generate_partial_failure_inserts_empty(monkeypatch):
    # one poison prompt (permanent 400-like failure) must not kill the batch:
    # its answer becomes '' (scores 0 downstream), others are unaffected
    _install_fake_chat_openai(monkeypatch, fail_contents={'3'})
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    monkeypatch.delenv('LLM_CONCURRENCY', raising=False)
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4,
                 prompt={'system': '', 'user': ''}, concurrency=8)
    out = gen.generate(_msgs(8))
    assert [r for i, r in enumerate(out) if i != 3] == [str(i) for i in range(8) if i != 3]
    assert out[3] == ''
    assert gen.failed_requests == 1


def test_llm_generate_all_fail_raises(monkeypatch):
    # systemic guard: if EVERY request in a batch fails, the endpoint is
    # down/misconfigured - crash loudly instead of writing empty answers
    _install_fake_chat_openai(monkeypatch, fail_contents={str(i) for i in range(4)})
    monkeypatch.setenv('OPENAI_API_KEY', 'fake-key')
    monkeypatch.delenv('LLM_CONCURRENCY', raising=False)
    from models.generators.llm_openai import OpenAI
    gen = OpenAI(model_name='my-model', max_new_tokens=4,
                 prompt={'system': '', 'user': ''}, concurrency=1)
    with pytest.raises(RuntimeError, match='endpoint is likely down'):
        gen.generate(_msgs(4))


# ---------------------------------------------------------------------------
# generation resume / checkpointing
# ---------------------------------------------------------------------------

def _stub_generator(init_resp=None, **kwargs):
    """OpenAI generator with a canned generate() and a minimal prompt template."""
    from models.generators.llm_openai import OpenAI
    responses = list(init_resp or [])
    gen = OpenAI(model_name='my-model', max_new_tokens=4,
                 prompt={'system': 's', 'user': 'u'}, concurrency=1, **kwargs)
    def fake_generate(messages, _resp=responses):
        return [f'GEN-{_resp.pop(0)}' for _ in messages]
    gen.generate = fake_generate
    gen.format_instruction = lambda e: f"instr-{e['q_id']}"
    return gen


def _gen_dataset(n, prefix='Q'):
    import datasets
    return datasets.Dataset.from_list([
        {'q_id': f'{prefix}{i}', 'query': f'question {i}', 'label': [f'a{i}'],
         'doc': [f'doc {i}'], 'ranking_label': [f'r{i}']} for i in range(n)])


def test_generator_eval_checkpoint_after_each_batch(monkeypatch, tmp_path):
    gen = _stub_generator(init_resp=['x'] * 3)
    out_file = str(tmp_path / 'eval_dev_out.json')
    ids, queries, instrs, resps, labels, rl = gen.eval(_gen_dataset(3), resume_file=out_file, num_workers=0)
    assert resps == ['GEN-x'] * 3
    import json
    records = json.load(open(out_file))  # checkpoint written during eval
    assert [r['q_id'] for r in records] == ['Q0', 'Q1', 'Q2']
    assert [r['response'] for r in records] == ['GEN-x'] * 3


def test_generator_eval_resume_skips_done(monkeypatch, tmp_path):
    import json
    # pretend a previous run answered Q0 before crashing
    out_file = str(tmp_path / 'eval_dev_out.json')
    json.dump([{'q_id': 'Q0', 'response': 'OLD-ANSWER', 'instruction': 'old-instr',
                'label': ['a0'], 'question': 'question 0', 'ranking_label': ['r0']}],
              open(out_file, 'w'))
    gen = _stub_generator(init_resp=['y'])
    dataset = _gen_dataset(2)
    dataset = dataset.map(lambda x: {'existing_response': {'Q0': 'OLD-ANSWER'}.get(x['q_id'])})
    ids, queries, instrs, resps, labels, rl = gen.eval(dataset, resume_file=out_file, num_workers=0)
    # Q0 replayed without an API call, Q1 generated fresh
    assert resps == ['OLD-ANSWER', 'GEN-y']
    records = json.load(open(out_file))
    assert [r['q_id'] for r in records] == ['Q0', 'Q1']
    assert records[0]['response'] == 'OLD-ANSWER'


# ---------- Thai-aware metrics ----------
# The Thai gold/prediction pairs below are the real cases that motivated this:
# retrieved docs are word-segmented while model answers often are not, so the
# original metrics scored verbatim-correct answers as 0.

def test_thai_match_fixes_whitespace_mismatch():
    """M is whitespace-sensitive: gold 'เลดี้ กาก้า' vs an answer written without
    the space scores 0 under the original normalize, but 1 under normalize_th."""
    from modules.metrics import match_score, normalize_th
    gold = [['เลดี้ กาก้า']]
    pred = ['เพลงนี้ร้องโดยเลดี้กาก้าในปีค.ศ.สองพันแปด']
    assert match_score(pred, gold) == [0.0]
    assert match_score(pred, gold, normalize_th) == [1.0]


def test_thai_f1_fixes_untokenized_split():
    """str.split() sees space-less Thai as one token, so P/R collapse to 0 even
    when the gold string is present verbatim; pythainlp tokens overlap."""
    from modules.metrics import f1_score, thai_tokens
    gold = [['เลดี้ กาก้า']]
    pred = ['เพลงนี้ร้องโดยเลดี้กาก้าในปีค.ศ.สองพันแปด']
    assert f1_score(pred, gold)['recall'] == [0.0]
    assert f1_score(pred, gold, thai_tokens)['recall'] == [1.0]


def test_thai_rejects_year_false_positive():
    """The case that started this: gold 1980, prediction says 1985.
    char-3gram recall gives 0.5 credit ('198' matches); Thai F1 gives 0."""
    from modules.metrics import RAGMetrics
    gold = [['1980']]
    pred = ['อิลลินอยส์ปรับอายุการดื่มเป็น 21 ปีในปี 1985']
    assert RAGMetrics.compute(pred, gold)['Recall_char3gram'] == [0.5]
    assert RAGMetrics.compute(pred, gold, thai=True)['Recall_th'] == [0.0]


def test_thai_false_leaves_standard_metrics_untouched():
    """thai=False must reproduce the original 9 keys byte-for-byte - this is
    what keeps the existing DEEPSEEK baseline comparable."""
    from modules.metrics import RAGMetrics
    gold = [['เลดี้ กาก้า']]
    pred = ['เพลงนี้ร้องโดยเลดี้กาก้า']
    base = RAGMetrics.compute(pred, gold)
    assert sorted(base) == sorted(['M', 'EM', 'F1', 'Precision', 'Recall',
                                   'Recall_char3gram', 'Rouge-1', 'Rouge-2', 'Rouge-L'])
    with_thai = RAGMetrics.compute(pred, gold, thai=True)
    for k, v in base.items():
        assert with_thai[k] == v, f'standard metric {k} changed when thai=True'
    assert sorted(with_thai) == sorted(list(base) + ['M_th', 'F1_th', 'Precision_th', 'Recall_th'])


def _stub_rag_config(dataset_cfg, thai_metrics=None):
    """Minimal RAG-like object exposing only what _resolve_thai_metrics reads."""
    from modules.rag import RAG
    obj = object.__new__(RAG)
    obj.config = {'dataset': dataset_cfg, 'thai_metrics': thai_metrics}
    return obj


def _cfg_with_lang(lang):
    inner = {'query': {'init_args': {'lang': lang}}} if lang is not None else {'query': {'init_args': {}}}
    return {'dev': inner}


def test_resolve_thai_metrics_auto_by_language():
    from modules.rag import RAG
    assert RAG._resolve_thai_metrics(_stub_rag_config(_cfg_with_lang('th')), 'dev') is True
    assert RAG._resolve_thai_metrics(_stub_rag_config(_cfg_with_lang('en')), 'dev') is False


def test_resolve_thai_metrics_missing_lang_defaults_false():
    from modules.rag import RAG
    assert RAG._resolve_thai_metrics(_stub_rag_config(_cfg_with_lang(None)), 'dev') is False
    # a config that does not look like ours at all must not raise
    assert RAG._resolve_thai_metrics(_stub_rag_config({}), 'dev') is False


def test_resolve_thai_metrics_explicit_override_wins():
    from modules.rag import RAG
    # force on for a non-Thai dataset
    assert RAG._resolve_thai_metrics(_stub_rag_config(_cfg_with_lang('en'), thai_metrics=True), 'dev') is True
    # force off for a Thai dataset
    assert RAG._resolve_thai_metrics(_stub_rag_config(_cfg_with_lang('th'), thai_metrics=False), 'dev') is False


def test_thai_tokenize_engine_is_configurable(monkeypatch):
    """THAI_ENGINE is read from the env at import time; both zero-extra engines
    must produce usable tokens."""
    from modules.metrics import thai_tokens
    for eng in ('newmm', 'longest'):
        monkeypatch.setattr('modules.metrics.THAI_ENGINE', eng)
        toks = thai_tokens('เลดี้ กาก้า')
        assert isinstance(toks, list) and len(toks) > 0
        assert all(isinstance(t, str) for t in toks)
