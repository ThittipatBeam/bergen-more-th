'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Unit tests for the LLM-as-judge (models/evaluators/judge.py) and the shared
metric-persist helper in evaluate.py. No network access: the openai client is
stubbed.

Run from the root folder:
    pytest tests/judge_test.py
'''

import json
import os
import sys
import types

import pytest


# ---------------------------------------------------------------------------
# fake openai client
# ---------------------------------------------------------------------------

class _FakeMessage:
    def __init__(self, content):
        self.content = content


class _FakeChoice:
    def __init__(self, content):
        self.message = _FakeMessage(content)


class _FakeUsage:
    prompt_tokens = 100
    completion_tokens = 20


class _FakeResponse:
    def __init__(self, content):
        self.choices = [_FakeChoice(content)]
        self.usage = _FakeUsage()


class FakeChatCompletions:
    def __init__(self, owner):
        self.owner = owner

    def create(self, messages, model):
        self.owner.calls.append({'messages': messages, 'model': model})
        return self.owner.respond(messages, model)


class FakeChat:
    def __init__(self, owner):
        self.completions = FakeChatCompletions(owner)


class FakeOpenAIClient:
    """Records calls and replies with whatever the test's responder returns."""

    def __init__(self, api_key=None, base_url=None):
        self.api_key = api_key
        self.base_url = base_url


def _install_fake_openai(monkeypatch, calls, responder):
    class _Client(FakeOpenAIClient):
        def __init__(self, api_key=None, base_url=None):
            super().__init__(api_key, base_url)
            self.calls = calls
            self.respond = responder
            self.chat = FakeChat(self)

    fake = types.ModuleType('openai')
    fake.OpenAI = _Client
    # judge.py does `import openai` at module scope, so patching sys.modules is
    # only enough on a first import - rebind the module global as well.
    monkeypatch.setitem(sys.modules, 'openai', fake)
    from models.evaluators import judge as judge_module
    monkeypatch.setattr(judge_module, 'openai', fake, raising=False)


def _make_judge(monkeypatch, calls=None, responder=None, **overrides):
    calls = calls if calls is not None else []
    responder = responder or (lambda messages, model: _FakeResponse('{"verdict": 1, "reason": "ถูกต้อง"}'))
    _install_fake_openai(monkeypatch, calls, responder)
    from models.evaluators.judge import LLMJudge
    kwargs = dict(model='gpt-4o', prompt_config='judge_qa',
                  dry_run=False, require_confirmation=False)
    kwargs.update(overrides)
    return LLMJudge(**kwargs)


def _record(q_id='q1', question='ถามอะไร', docs='Background:\nDocument 1: ก',
            gold='ข', response='ข'):
    return {'q_id': q_id, 'question': question, 'docs': docs,
            'gold': gold, 'response': response}


# ---------------------------------------------------------------------------
# prompt rendering / extraction
# ---------------------------------------------------------------------------

def test_render_prompt_single_pass_handles_literal_braces():
    """The judge template contains a literal {"verdict": 1}; str.format would
    raise KeyError on it, and a brace inside document text must not re-expand."""
    from models.evaluators.judge import render_prompt
    template = 'Reply like {"verdict": 1}. Q={question} D={docs}'
    out = render_prompt(template, {'question': 'ก', 'docs': 'text with {gold} inside'})
    assert out == 'Reply like {"verdict": 1}. Q=ก D=text with {gold} inside'


def test_render_prompt_missing_placeholder_is_empty():
    from models.evaluators.judge import render_prompt
    assert render_prompt('a{gold}b{prediction}c', {'gold': 'G'}) == 'aGbc'
    # unknown names are left alone, not treated as fields
    assert render_prompt('{other}', {'gold': 'G'}) == '{other}'


def test_extract_docs_slices_before_question_marker():
    from models.evaluators.judge import extract_docs
    content = 'Background:\nDocument 1: เอกสาร\nDocument 2: สอง\n\nQuestion: ถาม'
    instruction = [{'role': 'system', 'content': 'sys'},
                   {'role': 'user', 'content': content}]
    docs, ok = extract_docs(instruction)
    assert ok is True
    assert docs == 'Background:\nDocument 1: เอกสาร\nDocument 2: สอง'
    assert 'Question' not in docs


def test_extract_docs_missing_marker_keeps_whole_content():
    from models.evaluators.judge import extract_docs
    docs, ok = extract_docs([{'role': 'user', 'content': 'just context'}])
    assert ok is True and docs == 'just context'


def test_extract_docs_handles_plain_string_and_absent_instruction():
    from models.evaluators.judge import extract_docs
    docs, ok = extract_docs('Background:\nDocument 1: x\n\nQuestion: q')
    assert ok is True and docs == 'Background:\nDocument 1: x'
    # must degrade gracefully, not raise
    assert extract_docs(None) == ('', False)
    assert extract_docs([]) == ('', False)
    assert extract_docs([{'role': 'system', 'content': ''}]) == ('', False)


def test_join_gold_list_and_string():
    from models.evaluators.judge import join_gold
    assert join_gold(['เลดี้ กาก้า']) == 'เลดี้ กาก้า'
    assert join_gold(['a', 'b', 'c']) == 'a; b; c'
    assert join_gold('plain') == 'plain'
    assert join_gold(None) == ''


# ---------------------------------------------------------------------------
# verdict parsing
# ---------------------------------------------------------------------------

def test_parse_verdict_strict_json():
    from models.evaluators.judge import parse_verdict
    assert parse_verdict('{"verdict": 1, "reason": "ถูกต้อง"}') == (1, 'ถูกต้อง')
    assert parse_verdict('{"verdict": 0, "reason": "ผิด"}') == (0, 'ผิด')


def test_parse_verdict_json_alias_keys():
    from models.evaluators.judge import parse_verdict
    assert parse_verdict('{"correct": true, "reason": "ok"}')[0] == 1
    assert parse_verdict('{"score": 0, "reason": "no"}')[0] == 0


def test_parse_verdict_fenced_and_prose():
    from models.evaluators.judge import parse_verdict
    assert parse_verdict('```json\n{"verdict": 1, "reason": "x"}\n```') == (1, 'x')
    assert parse_verdict('Sure! {"verdict": 0, "reason": "y"} done') == (0, 'y')


def test_parse_verdict_bare_number_requires_unambiguous():
    from models.evaluators.judge import parse_verdict
    assert parse_verdict('1')[0] == 1
    assert parse_verdict('verdict: 0')[0] == 0
    # two candidate digits is ambiguous -> unparseable
    assert parse_verdict('score 1 or 0') [0] is None


def test_parse_verdict_correctness_words():
    from models.evaluators.judge import parse_verdict
    assert parse_verdict('The answer is correct.')[0] == 1
    assert parse_verdict('This answer is wrong.')[0] == 0


def test_parse_verdict_unparseable_is_none():
    from models.evaluators.judge import parse_verdict
    assert parse_verdict('') == (None, '')
    assert parse_verdict('I cannot tell.') == (None, '')


# ---------------------------------------------------------------------------
# env resolution
# ---------------------------------------------------------------------------

def _clear_judge_env(monkeypatch):
    for var in ('JUDGE_MODEL', 'JUDGE_BASE_URL', 'JUDGE_API_KEY',
                'JUDGE_CONCURRENCY', 'OPENAI_BASE_URL', 'OPENAI_API_KEY'):
        monkeypatch.delenv(var, raising=False)


def test_judge_requires_a_model(monkeypatch):
    from models.evaluators.judge import LLMJudge
    _clear_judge_env(monkeypatch)
    with pytest.raises(ValueError, match='JUDGE_MODEL'):
        LLMJudge(model=None, prompt_config='judge_qa')


def test_judge_requires_an_api_key(monkeypatch):
    from models.evaluators.judge import LLMJudge
    _clear_judge_env(monkeypatch)
    monkeypatch.setenv('JUDGE_MODEL', 'gpt-4o')
    with pytest.raises(ValueError, match='JUDGE_API_KEY'):
        LLMJudge(prompt_config='judge_qa')


def test_judge_env_precedence_judge_beats_shared(monkeypatch):
    judge = _make_judge(monkeypatch)
    _clear_judge_env(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'shared')
    monkeypatch.setenv('OPENAI_BASE_URL', 'http://shared/v1')
    monkeypatch.setenv('JUDGE_API_KEY', 'judge-key')
    monkeypatch.setenv('JUDGE_BASE_URL', 'http://judge/v1')
    from models.evaluators.judge import LLMJudge
    j = LLMJudge(model='gpt-4o', prompt_config='judge_qa')
    assert j._api_key == 'judge-key'
    assert j.base_url == 'http://judge/v1'
    assert judge is not None


def test_judge_falls_back_to_shared_openai_vars(monkeypatch):
    _clear_judge_env(monkeypatch)
    monkeypatch.setenv('OPENAI_API_KEY', 'shared-key')
    monkeypatch.setenv('OPENAI_BASE_URL', 'http://shared/v1')
    from models.evaluators.judge import LLMJudge
    j = LLMJudge(model='gpt-4o', prompt_config='judge_qa')
    assert j._api_key == 'shared-key'
    assert j.base_url == 'http://shared/v1'


def test_judge_env_precedence_model_and_concurrency(monkeypatch):
    _clear_judge_env(monkeypatch)
    monkeypatch.setenv('JUDGE_MODEL', 'from-env-model')
    monkeypatch.setenv('JUDGE_API_KEY', 'k')
    monkeypatch.setenv('JUDGE_CONCURRENCY', '9')
    from models.evaluators.judge import LLMJudge
    j = LLMJudge(prompt_config='judge_qa')
    assert j.model_name == 'from-env-model'
    assert j.concurrency == 9


# ---------------------------------------------------------------------------
# cost
# ---------------------------------------------------------------------------

def test_judge_unknown_model_cost_is_zero_not_an_exception(monkeypatch):
    """A judge served through a gateway alias is never in the price dict; the
    openai.py version raises ValueError here, the llm_openai.py version warns."""
    judge = _make_judge(monkeypatch)
    judge.model_name = 'some/gateway-alias'
    assert judge.openai_api_calculate_cost(_FakeUsage()) == (0.0, 0.0, 0.0)


def test_judge_known_model_cost_is_computed(monkeypatch):
    judge = _make_judge(monkeypatch)
    total, prompt, completion = judge.openai_api_calculate_cost(_FakeUsage())
    assert total == pytest.approx(100 * 0.005 / 1000 + 20 * 0.015 / 1000, abs=1e-6)
    assert prompt + completion == pytest.approx(total, abs=1e-6)


# ---------------------------------------------------------------------------
# judging
# ---------------------------------------------------------------------------

def test_judge_one_returns_score_and_reason(monkeypatch):
    judge = _make_judge(monkeypatch)
    q_id, score, reason, raw, cost, ok = judge.judge_one(_record())
    assert (q_id, score, ok) == ('q1', 1, True)
    assert reason == 'ถูกต้อง'


def test_judge_one_unparseable_is_unknown_but_ok(monkeypatch):
    """A parse failure is deterministic - record it as -100 rather than
    re-buying the same answer, and never as 0 (which would bias the mean)."""
    judge = _make_judge(monkeypatch, responder=lambda m, mo: _FakeResponse('I cannot tell.'))
    q_id, score, reason, raw, cost, ok = judge.judge_one(_record())
    assert score == -100 and ok is True


def test_judge_one_api_failure_is_not_ok(monkeypatch):
    """ok=False means the caller must not freeze a transient outage into results."""
    def boom(messages, model):
        raise RuntimeError('endpoint down')

    judge = _make_judge(monkeypatch, responder=boom)
    q_id, score, reason, raw, cost, ok = judge.judge_one(_record())
    assert ok is False and score == -100


def test_judge_prompt_contains_all_four_inputs(monkeypatch):
    calls = []
    judge = _make_judge(monkeypatch, calls=calls)
    judge.judge_one(_record(question='คำถาม', docs='บริบท', gold='ทอง', response='ตอบ'))
    user = calls[0]['messages'][1]['content']
    assert 'คำถาม' in user and 'บริบท' in user and 'ทอง' in user and 'ตอบ' in user
    assert calls[0]['messages'][0]['role'] == 'system'


def test_judge_max_docs_chars_truncates(monkeypatch):
    calls = []
    judge = _make_judge(monkeypatch, calls=calls)
    judge.max_docs_chars = 5
    judge.judge_one(_record(docs='0123456789'))
    assert '01234' in calls[0]['messages'][1]['content']
    assert '0123456789' not in calls[0]['messages'][1]['content']


def test_judge_mean_excludes_unknown(monkeypatch):
    judge = _make_judge(monkeypatch)
    assert judge.mean([1, 0, -100]) == 0.5
    assert judge.mean([1, 1]) == 1.0
    # the BERGEN convention returns 0 when nothing is known
    assert judge.mean([-100, -100]) == 0


# ---------------------------------------------------------------------------
# checkpointing
# ---------------------------------------------------------------------------

def test_judge_batch_writes_checkpoint(tmp_path, monkeypatch):
    judge = _make_judge(monkeypatch)
    ckpt = str(tmp_path / 'c.jsonl')
    records = [_record(q_id=f'q{i}') for i in range(5)]
    scores, reasons, stats = judge.judge_batch(records, checkpoint_path=ckpt)
    assert len(scores) == 5 and stats['n_judged'] == 5
    lines = [json.loads(l) for l in open(ckpt, encoding='utf-8') if l.strip()]
    assert len(lines) == 5
    assert all(l['ok'] and l['prompt_hash'].startswith('sha1:') for l in lines)


def test_judge_batch_resume_skips_done_and_preserves_order(tmp_path, monkeypatch):
    calls = []
    ckpt = str(tmp_path / 'c.jsonl')
    # first run judges two questions
    judge = _make_judge(monkeypatch, calls=calls)
    judge.judge_batch([_record(q_id='a'), _record(q_id='b')], checkpoint_path=ckpt)
    assert len(calls) == 2

    # second run over three: a and b must not be re-asked
    calls.clear()
    judge2 = _make_judge(monkeypatch, calls=calls)
    records = [_record(q_id='a'), _record(q_id='b'), _record(q_id='c')]
    scores, reasons, stats = judge2.judge_batch(records, checkpoint_path=ckpt)
    assert len(calls) == 1
    assert stats['n_reused'] == 2 and stats['n_judged'] == 1
    assert set(scores) == {'a', 'b', 'c'}


def test_judge_checkpoint_tolerates_truncated_tail(tmp_path, monkeypatch):
    ckpt = tmp_path / 'c.jsonl'
    ckpt.write_text(
        json.dumps({'q_id': 'a', 'ok': True, 'score': 1, 'reason': '', 'prompt_hash': 'x'}) + '\n'
        '{"q_id": "b", "ok": true, "sco',  # crash mid-write
        encoding='utf-8')
    judge = _make_judge(monkeypatch)
    from models.evaluators.judge import LLMJudge
    loaded = LLMJudge.load_checkpoint(str(ckpt), judge.prompt_hash)
    assert loaded == {}  # hash mismatch on the pinned record
    # the file must have been repaired to just the valid prefix
    repaired = [json.loads(l) for l in open(ckpt, encoding='utf-8') if l.strip()]
    assert len(repaired) == 1 and repaired[0]['q_id'] == 'a'


def test_judge_checkpoint_hash_mismatch_forces_rejudge(tmp_path, monkeypatch):
    calls = []
    ckpt = str(tmp_path / 'c.jsonl')
    judge = _make_judge(monkeypatch, calls=calls)
    judge.judge_batch([_record(q_id='a')], checkpoint_path=ckpt)
    # rewrite the hash, simulating an edited prompt
    lines = [json.loads(l) for l in open(ckpt, encoding='utf-8') if l.strip()]
    lines[0]['prompt_hash'] = 'sha1:stale'
    with open(ckpt, 'w', encoding='utf-8') as fh:
        for l in lines:
            fh.write(json.dumps(l, ensure_ascii=False) + '\n')
    calls.clear()
    judge2 = _make_judge(monkeypatch, calls=calls)
    judge2.judge_batch([_record(q_id='a')], checkpoint_path=ckpt)
    assert len(calls) == 1  # stale verdicts are not reused


def test_judge_batch_failed_calls_are_retried_next_run(tmp_path, monkeypatch):
    ckpt = str(tmp_path / 'c.jsonl')
    state = {'fail': True}

    def responder(messages, model):
        if state['fail']:
            raise RuntimeError('down')
        return _FakeResponse('{"verdict": 1, "reason": "ok"}')

    judge = _make_judge(monkeypatch, responder=responder)
    # concurrency 1 keeps this deterministic: one attempt per question
    judge.concurrency = 1
    import pytest as _pytest
    with _pytest.raises(RuntimeError):
        judge.judge_batch([_record(q_id='a'), _record(q_id='b')], checkpoint_path=ckpt)
    # nothing was recorded as a verdict
    assert not os.path.exists(ckpt) or open(ckpt).read().strip() == ''

    state['fail'] = False
    calls = []
    judge2 = _make_judge(monkeypatch, calls=calls, responder=responder)
    scores, _, stats = judge2.judge_batch(
        [_record(q_id='a'), _record(q_id='b')], checkpoint_path=ckpt)
    assert len(calls) == 2 and stats['n_judged'] == 2


def test_judge_batch_systemic_failure_raises(tmp_path, monkeypatch):
    def boom(messages, model):
        raise RuntimeError('down')

    judge = _make_judge(monkeypatch, responder=boom)
    with pytest.raises(RuntimeError, match='all 2 judge requests failed'):
        judge.judge_batch([_record(q_id='a'), _record(q_id='b')],
                          checkpoint_path=str(tmp_path / 'c.jsonl'))


def test_judge_batch_fully_resumed_reports_same_stat_keys(tmp_path, monkeypatch):
    """The nothing-to-do branch must carry unknown_rate: --force re-enters here
    with the metrics skip bypassed, and a missing key crashed it."""
    calls = []
    ckpt = str(tmp_path / 'c.jsonl')
    records = [_record(q_id='a'), _record(q_id='b')]
    _make_judge(monkeypatch, calls=calls).judge_batch(records, checkpoint_path=ckpt)
    calls.clear()
    judge = _make_judge(monkeypatch, calls=calls)
    scores, _, stats = judge.judge_batch(records, checkpoint_path=ckpt)
    assert calls == []  # nothing re-bought
    assert stats['n_reused'] == 2 and stats['n_judged'] == 0
    assert stats['unknown_rate'] == 0.0 and stats['n_unknown'] == 0
    assert set(scores) == {'a', 'b'}


def test_judge_batch_fully_resumed_unknown_rate_is_correct(tmp_path, monkeypatch):
    """All-unknown verdicts that were already paid for must still report 1.0."""
    ckpt = str(tmp_path / 'c.jsonl')
    records = [_record(q_id='a')]
    _make_judge(monkeypatch, responder=lambda m, mo: _FakeResponse('cannot tell')).judge_batch(
        records, checkpoint_path=ckpt)
    judge = _make_judge(monkeypatch)
    _, _, stats = judge.judge_batch(records, checkpoint_path=ckpt)
    assert stats['n_unknown'] == 1 and stats['unknown_rate'] == 1.0


def test_judge_batch_concurrent_appends_are_all_written(tmp_path, monkeypatch):
    judge = _make_judge(monkeypatch, concurrency=8)
    ckpt = str(tmp_path / 'c.jsonl')
    records = [_record(q_id=f'q{i:03d}') for i in range(50)]
    scores, _, stats = judge.judge_batch(records, checkpoint_path=ckpt)
    lines = [l for l in open(ckpt, encoding='utf-8') if l.strip()]
    assert len(lines) == 50 and stats['n_judged'] == 50
    parsed = [json.loads(l) for l in lines]
    assert len({p['q_id'] for p in parsed}) == 50
    assert set(scores) == {f'q{i:03d}' for i in range(50)}


def test_judge_batch_unknown_rate_reported(tmp_path, monkeypatch):
    judge = _make_judge(monkeypatch, responder=lambda m, mo: _FakeResponse('cannot tell'))
    _, _, stats = judge.judge_batch(
        [_record(q_id='a'), _record(q_id='b')], checkpoint_path=str(tmp_path / 'c.jsonl'))
    assert stats['n_unknown'] == 2 and stats['unknown_rate'] == 1.0


def test_judge_batch_dry_run_makes_no_call(tmp_path, monkeypatch):
    calls = []
    judge = _make_judge(monkeypatch, calls=calls, dry_run=True)
    with pytest.raises(SystemExit):
        judge.judge_batch([_record(q_id='a')], checkpoint_path=str(tmp_path / 'c.jsonl'))
    assert calls == []


# ---------------------------------------------------------------------------
# persist_metric helper (shared with eval_single)
# ---------------------------------------------------------------------------

def _write_out(tmp_path, records):
    path = tmp_path / 'eval_dev_out.json'
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(records, fh, ensure_ascii=False)
    return str(tmp_path)


def test_persist_metric_keeps_thai_readable(tmp_path):
    """force_ascii=False must survive the refactor: without it the whole out
    file gets re-escaped into \\u0e.. sequences."""
    import pandas as pd
    from evaluate import persist_metric
    folder = _write_out(tmp_path, [{'q_id': 'a', 'response': 'ไม่พบข้อมูล', 'label': ['x']}])
    data = pd.DataFrame(json.load(open(f'{folder}/eval_dev_out.json')))
    persist_metric(folder, 'dev', 'M_th', data, [1.0], 1.0, metrics_dict={})
    raw = open(f'{folder}/eval_dev_out.json', encoding='utf-8').read()
    assert 'ไม่พบข้อมูล' in raw
    assert '\\u0e' not in raw


def test_persist_metric_writes_column_and_metric(tmp_path):
    import pandas as pd
    from evaluate import persist_metric
    folder = _write_out(tmp_path, [{'q_id': 'a', 'response': 'r'}])
    data = pd.DataFrame(json.load(open(f'{folder}/eval_dev_out.json')))
    persist_metric(folder, 'dev', 'M_th', data, [0.5], 0.5, metrics_dict={})
    out = json.load(open(f'{folder}/eval_dev_out.json'))
    assert out[0]['M_th'] == 0.5
    assert json.load(open(f'{folder}/eval_dev_metrics.json')) == {'M_th': 0.5}


def test_persist_metric_extra_columns(tmp_path):
    import pandas as pd
    from evaluate import persist_metric
    folder = _write_out(tmp_path, [{'q_id': 'a', 'response': 'r'}])
    data = pd.DataFrame(json.load(open(f'{folder}/eval_dev_out.json')))
    persist_metric(folder, 'dev', 'LLMeval_judge', data, [1.0], 1.0,
                   extra_columns={'judge_reason': ['ถูกต้อง']},
                   metrics_dict={})
    out = json.load(open(f'{folder}/eval_dev_out.json'))
    assert out[0]['judge_reason'] == 'ถูกต้อง'
    # the reason column must never enter the metrics JSON: print_results.py
    # would render it into the markdown table via its llmeval filter
    metrics = json.load(open(f'{folder}/eval_dev_metrics.json'))
    assert 'judge_reason' not in metrics
    assert not any('judge_reason' in k.lower() for k in metrics)


def test_judge_reason_column_name_has_no_llmeval():
    assert 'llmeval' not in 'judge_reason'
