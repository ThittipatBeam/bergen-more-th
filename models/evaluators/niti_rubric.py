'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Official Thai Bar Council 8-tier rubric judge for NitiBench+ runs.

Why this exists next to judge.py: the binary 0/1 factual judge cannot represent
Bar-style grading, where a WRONG verdict with good reasoning still earns 2-4/10
and a RIGHT verdict with unusable reasoning earns 0-1. NitiBench+ ships an
official grading harness (datasets/nitibench_plus_raw/grading/); this module
reimplements its scoring contract against our on-disk experiment format:

- system prompt: verbatim from grading/judge_prompt.md (config/evaluator/
  niti_rubric.yaml, checked byte-identical).
- user message: built by build_user_message(), a faithful port of the official
  build_user() - one call per CASE, all sub-questions graded together, so the
  judge returns a JSON list of {tier, score, justification} in sub-question
  order.
- grouping: our pipeline answers one sub-question per row; rows are regrouped
  per case via q_id.split('#')[0] and re-joined with structured gold from the
  sidecar datasets/nitibench_plus_qa_gold.jsonl.

Design notes (shared with judge.py where applicable):
- reads ONLY data already on disk - no re-retrieval, no re-generation.
- resumable: case-level verdicts append to a JSONL sidecar as they arrive.
- unparseable replies become UNKNOWN results ({tier: None, score: -100})
  per sub-question rather than either 0 (biased) or a crash.
- debug pilots containing only some sub-questions of a case are tolerated:
  the case is graded from the rows present.
'''

import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from tqdm import tqdm

import omegaconf
import openai

from models.api_utils import call_with_retry, confirm_api_cost, require_env
from models.evaluators.judge import UNKNOWN_SCORE, prompt_hash

# max characters of the raw judge reply kept in the checkpoint sidecar
# (a full reply is 1-4k chars; keep enough to debug future parse failures)
MAX_RAW_CHARS = 4000
# max characters of an unparseable model answer shown to the judge as reasoning
MAX_UNPARSEABLE_CHARS = 3000

# sentinel per sub-question when the judge's reply cannot be used
UNKNOWN_RESULT = {'tier': None, 'score': UNKNOWN_SCORE, 'justification': ''}

# nominal score range per tier (Thai Bar Council regulation, grading/rubric.md)
TIER_RANGES = {1: (0, 0), 2: (1, 2), 3: (2, 4), 4: (0, 1),
               5: (2, 5), 6: (5, 6), 7: (7, 8), 8: (9, 10)}

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
GOLD_SIDECAR = os.path.join(REPO_ROOT, 'datasets', 'nitibench_plus_qa_gold.jsonl')


def parse_loose_json(text):
    """json.loads with tolerance for ```json fences and prose around the payload.

    Returns the parsed object or None. Used both for the judge's reply and for
    model answers that are SUPPOSED to be strict JSON but were not
    (nitibench_legal prompt demands JSON; weak models sometimes chatter).
    """
    if not text:
        return None
    candidates = [text.strip()]
    fenced = re.search(r'```(?:json)?\s*(.*?)```', text, re.DOTALL)
    if fenced:
        candidates.insert(0, fenced.group(1).strip())
    t = text
    if '[' in t and ']' in t:
        candidates.append(t[t.find('['):t.rfind(']') + 1])
    if '{' in t and '}' in t:
        candidates.append(t[t.find('{'):t.rfind('}') + 1])
    for candidate in candidates:
        if not candidate:
            continue
        try:
            return json.loads(candidate)
        except (ValueError, TypeError):
            continue
    return None


def format_answer_block(verdict, reasoning, cites):
    """Official _format(): one sub-question answer as a Verdict/Reasoning/Cited
    block. Accepts citation dicts under either the model's key names
    (law_name/section) or the sidecar's (law_name_th/label)."""
    parts = []
    for x in cites or []:
        law = x.get('law_name') or x.get('law_name_th') or '?'
        sec = x.get('section') or x.get('label') or '?'
        parts.append(f'{law}: {sec}')
    c = '; '.join(parts) or '(no citations)'
    return f'  Verdict: {verdict}\n  Reasoning: {reasoning}\n  Cited sections: {c}'


def gold_block(gold_rec):
    """Official gold_strs(): load-bearing citations first, then background."""
    cites = [{'law_name': g.get('law_name_th'), 'section': g.get('label')}
             for g in gold_rec.get('gold_citations', [])]
    cites += [{'law_name': b.get('law_name_th'), 'section': b.get('label')}
              for b in gold_rec.get('background_citations', [])]
    return format_answer_block(gold_rec.get('verdict', ''),
                               gold_rec.get('reasoning', ''), cites)


def model_block(response_text):
    """Render a model row's `response` in the official _format() shape.

    nitibench_legal demands {"verdict","reasoning","citations":[{law_name,
    section}]} JSON. When the answer is not parseable JSON we still hand the
    judge the raw text as the reasoning (truncated) so it can grade the
    substance instead of hitting a blank.
    """
    parsed = parse_loose_json(response_text)
    if isinstance(parsed, dict) and (
            'verdict' in parsed or 'reasoning' in parsed):
        cites = parsed.get('citations') or []
        if not isinstance(cites, list):
            cites = []
        return (format_answer_block(str(parsed.get('verdict', '')),
                                    str(parsed.get('reasoning', '')),
                                    cites),
                True)
    raw = (response_text or '')[:MAX_UNPARSEABLE_CHARS]
    return (format_answer_block('(คำตอบไม่ใช่ JSON ที่อ่านได้ / unparseable JSON)',
                                raw or '(empty response)', []),
            False)


def build_user_message(case_rows):
    """Faithful port of the official build_user() (grading/judge_prompt.md).

    case_rows: [{'question','decision_date','gold_block','model_block'}] in
    sub-question order. Unlike the official harness, a debug pilot may hold
    only SOME sub-questions of a case - we grade exactly the rows present, so
    n = len(case_rows) and position j maps back to case_rows[j].
    """
    n = len(case_rows)
    question = (case_rows[0]['question'] if n == 1
                else '; '.join(r['question'] for r in case_rows))
    parts = [f'QUESTION: {question}',
             f"DECISION DATE: {case_rows[0]['decision_date']}",
             '',
             ('OFFICIAL GOLD ANSWER:' if n == 1
              else f'OFFICIAL GOLD ANSWER ({n} sub-questions):')]
    if n == 1:
        parts += [case_rows[0]['gold_block'], '',
                  'MODEL ANSWER:', case_rows[0]['model_block']]
    else:
        for i, r in enumerate(case_rows):
            parts += [f'  -- sub-question {i + 1} --', r['gold_block']]
        parts += ['', f'MODEL ANSWER ({n} sub-questions):']
        for i, r in enumerate(case_rows):
            parts += [f'  -- sub-question {i + 1} --', r['model_block']]
    return '\n'.join(parts)


def _coerce_tier(value):
    try:
        tier = int(float(value))
    except (TypeError, ValueError):
        return None
    return tier if 1 <= tier <= 8 else None


def _coerce_score(value):
    try:
        score = float(value)
    except (TypeError, ValueError):
        return None
    if 0.0 <= score <= 10.0:
        return score
    return None


def _unwrap_result_list(payload):
    """Accept the judge's reply in the several correct-JSON wrapper styles seen
    in practice (JUDGE_MODEL variants):

      bare list        [{tier,...}, ...]
      single object    {tier, score, justification}          (n==1 case)
      wrapped list     {"results": [...]} / {"grades": [...]} / any dict whose
                       value is the list of per-sub-question dicts
    Returns the list of entry dicts, or None if no list can be recovered.
    """
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        if _coerce_tier(payload.get('tier')) is not None:
            return [payload]
        for value in payload.values():
            if isinstance(value, list) and value and all(
                    isinstance(x, dict) for x in value):
                return value
    return None


def parse_rubric_reply(text, n):
    """Parse the judge's reply into exactly n {tier, score, justification} dicts.

    Any single non-conforming entry - or a length mismatch - yields UNKNOWN for
    that position; the other positions still count. That way one malformed
    sub-question cannot sink a whole case (and a whole case cannot sink a run).
    """
    results = [dict(UNKNOWN_RESULT) for _ in range(n)]
    entries = _unwrap_result_list(parse_loose_json(text))
    if entries is None:
        return results, False
    for i, item in enumerate(entries[:n]):
        if not isinstance(item, dict):
            continue
        tier = _coerce_tier(item.get('tier'))
        score = _coerce_score(item.get('score'))
        justification = str(item.get('justification', '')).strip()
        if tier is None or score is None:
            continue
        results[i] = {'tier': tier, 'score': score, 'justification': justification}
    fully_parsed = all(r['score'] != UNKNOWN_SCORE for r in results)
    return results, fully_parsed


def load_gold_sidecar(path=None):
    """q_id -> structured gold record (written by the NitiBenchPlusQA processor
    and by scripts/nitibench/build_qrels.py)."""
    path = path or GOLD_SIDECAR
    if not os.path.exists(path):
        raise FileNotFoundError(
            f'gold sidecar not found: {path}\n'
            'Run scripts/nitibench/build_qrels.py once to regenerate it.')
    table = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                rec = json.loads(line)
                table[rec['id']] = rec
    return table


def case_id_of(q_id):
    return q_id.split('#')[0]


def sq_index_of(q_id):
    m = re.search(r'#sq(\d+)$', q_id)
    return int(m.group(1)) if m else 0


def group_rows_by_case(data, sidecar):
    """eval_{split}_out.json rows -> ordered {case_id: [case_rows]}.

    case_rows entries: {'q_id','question','decision_date','response'} sorted by
    the #sq index from q_id. Rows whose q_id is missing from the gold sidecar
    are dropped (with a warning) because the judge needs the gold verdict.
    """
    groups, dropped = {}, 0
    for row in data.itertuples():
        gold = sidecar.get(row.q_id)
        if gold is None:
            dropped += 1
            continue
        groups.setdefault(case_id_of(row.q_id), []).append(
            {'q_id': row.q_id,
             'question': gold['question'],
             'decision_date': gold['decision_date'],
             'response': row.response})
    for rows in groups.values():
        rows.sort(key=lambda r: sq_index_of(r['q_id']))
    if dropped:
        print(f'WARNING: {dropped} rows have no gold sidecar record and were '
              f'skipped for rubric judging', file=sys.stderr)
    return groups


def select_case_scope(case_ids, nb_samples, seed):
    """Case-level scope for --sample: legal pilot numbers must be per CASE
    (the judge is called per case), not per row like the other metrics.

    Returns (kept_case_ids, scope_suffix); scope_suffix goes into the sidecar
    filename so a sampled pilot never masquerades as a full run.
    """
    case_ids = list(case_ids)
    if not (nb_samples and nb_samples > 0 and nb_samples < len(case_ids)):
        return case_ids, ''
    if seed is not None:
        import random
        kept = random.Random(seed).sample(sorted(case_ids), nb_samples)
        kept = sorted(kept, key=case_ids.index)
        return kept, f'_cases{nb_samples}_seed{seed}'
    return case_ids[:nb_samples], f'_cases{nb_samples}'


def rollup_scores(per_q):
    """Aggregate per-sub-question dicts {'case_id','domain','score'} per the
    official averaging: sub-question -> case -> domain -> macro over domains.

    Returns (micro_mean, macro_mean, n_domains). UNKNOWN scores must already be
    filtered out by the caller. In pilots the macro is over the domains present.
    """
    if not per_q:
        return 0.0, 0.0, 0
    micro = sum(r['score'] for r in per_q) / len(per_q)
    case_scores, case_domain = {}, {}
    for r in per_q:
        case_scores.setdefault(r['case_id'], []).append(r['score'])
        case_domain[r['case_id']] = r['domain']
    domain_means = {}
    for case_id, scores in case_scores.items():
        domain_means.setdefault(case_domain[case_id], []).append(
            sum(scores) / len(scores))
    macro = sum(sum(v) / len(v) for v in domain_means.values()) / len(domain_means)
    return micro, macro, len(domain_means)


class NitiRubricJudge:
    """Official 8-tier rubric judge over an OpenAI-compatible endpoint.

    One API call per case (all sub-questions of the case in one prompt), a
    case-keyed JSONL checkpoint, and the same env three-tier resolution as
    LLMJudge: constructor arg -> JUDGE_* -> OPENAI_*.
    """

    def __init__(self,
                 model=None,
                 prompt_config='niti_rubric',
                 base_url=None,
                 concurrency=None,
                 max_retries=6,
                 dry_run=False,
                 require_confirmation=True):
        self.model_name = model or os.environ.get('JUDGE_MODEL')
        if not self.model_name:
            raise ValueError(
                'the rubric judge requires a model: pass --judge_model or set '
                'JUDGE_MODEL. Set it with: export JUDGE_MODEL=<model-id>')
        self.base_url = (base_url or os.environ.get('JUDGE_BASE_URL')
                         or os.environ.get('OPENAI_BASE_URL') or None)
        self._api_key = os.environ.get('JUDGE_API_KEY') or os.environ.get('OPENAI_API_KEY')
        if not self._api_key:
            require_env('JUDGE_API_KEY', 'niti_rubric judge')
        self.concurrency = int(os.environ.get('JUDGE_CONCURRENCY') or concurrency or 4)
        self.max_retries = max_retries
        self.dry_run = dry_run
        self.require_confirmation = require_confirmation
        self.client = None
        self.total_cost = 0.0

        path = f'config/evaluator/{prompt_config}.yaml'
        if not os.path.exists(path):
            raise FileNotFoundError(f'rubric prompt config not found: {path}')
        config = omegaconf.OmegaConf.load(path)
        self.system_prompt = str(config['system'])
        # the user message is built by build_user_message(); its format version
        # goes into the hash so a format change never inherits old verdicts
        self.prompt_hash = prompt_hash(
            self.system_prompt, 'official-build_user:v1', self.model_name)

    def _get_client(self):
        if self.client is None:
            self.client = openai.OpenAI(api_key=self._api_key, base_url=self.base_url)
        return self.client

    # ---------- one case ----------

    def judge_case(self, case_id, case_rows):
        """Judge one case. Returns (case_id, results, raw, ok).

        results: list of {tier, score, justification} aligned with case_rows.
        ok=False means the API call itself failed - the caller must NOT record
        that, or a transient outage would be frozen into the results.
        """
        messages = [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': build_user_message(case_rows)},
        ]

        def call():
            return self._get_client().chat.completions.create(
                messages=messages, model=self.model_name)

        try:
            response = call_with_retry(call, max_retries=self.max_retries,
                                       provider='openai_compatible')
        except Exception as e:
            print(f'WARNING: rubric judge request failed for case={case_id} '
                  f'({type(e).__name__}: {str(e)[:200]})', file=sys.stderr)
            return case_id, [dict(UNKNOWN_RESULT) for _ in case_rows], '', False

        try:
            raw = response.choices[0].message.content or ''
        except (AttributeError, IndexError):
            raw = ''
        results, _ = parse_rubric_reply(raw, len(case_rows))
        return case_id, results, raw[:MAX_RAW_CHARS], True

    # ---------- checkpoint ----------

    @staticmethod
    def load_checkpoint(path, current_hash):
        """Case-keyed verdicts already paid for; same truncated-tail repair as
        judge.py. Returns {case_id: record} for records matching current_hash."""
        if not path or not os.path.exists(path):
            return {}
        valid, truncated = [], False
        with open(path, encoding='utf-8') as handle:
            for line in handle:
                stripped = line.strip()
                if not stripped:
                    continue
                try:
                    valid.append(json.loads(stripped))
                except ValueError:
                    truncated = True
                    break
        if truncated:
            print(f'WARNING: {path} ends with a truncated line (crash mid-write); '
                  f'dropping it and repairing the file', file=sys.stderr)
            tmp = path + '_'
            with open(tmp, 'w', encoding='utf-8') as out:
                for rec in valid:
                    out.write(json.dumps(rec, ensure_ascii=False) + '\n')
            os.replace(tmp, path)
        return {rec['case_id']: rec for rec in valid
                if rec.get('ok')
                and rec.get('prompt_hash') == current_hash
                and rec.get('n') == len(rec.get('results', []))
                and 'case_id' in rec}

    # ---------- batch ----------

    def judge_batch(self, cases, checkpoint_path=None):
        """Judge cases, resuming from/appending to a case-keyed JSONL checkpoint.

        cases: {case_id: [case_rows]} (from group_rows_by_case + select_case_scope).
        Returns (results_by_qid, stats) where results_by_qid[q_id] =
        {tier, score, justification} and stats mirrors judge.py's keys.
        """
        done = self.load_checkpoint(checkpoint_path, self.prompt_hash) if checkpoint_path else {}
        todo = [(cid, rows) for cid, rows in cases.items() if cid not in done]
        n_reused = len(cases) - len(todo)

        confirm_api_cost(
            f'NitiBench+ rubric judging of {len(todo)} cases with {self.model_name}',
            estimated_calls=len(todo),
            scale_note=('One API call per CASE: all sub-questions of a case are graded '
                        'together per the official harness - ~4-12k prompt tokens each '
                        '(gold verdicts + reasoning rarely fit in 1-2k).'),
            dry_run=self.dry_run,
            require_confirmation=self.require_confirmation,
        )

        results_by_qid = {}
        for cid, rec in done.items():
            for j, res in enumerate(rec['results']):
                rows = cases.get(cid, [])
                if j < len(rows):
                    results_by_qid[rows[j]['q_id']] = res

        def _stats(todo_len, n_failed, n_known, n_unknown):
            total = len(cases)
            return {'n_reused': n_reused, 'n_judged': todo_len - n_failed,
                    'n_failed': n_failed, 'n_unknown': n_unknown,
                    'unknown_rate': n_unknown / total if total else 0.0,
                    'total_cost': self.total_cost}

        if not todo:
            print(f'rubric: all {len(cases)} case verdicts already present in '
                  f'{checkpoint_path}')
            n_unknown = sum(1 for r in results_by_qid.values()
                            if r['score'] == UNKNOWN_SCORE)
            return results_by_qid, _stats(0, 0, 0, n_unknown)

        lock = threading.Lock()
        n_failed = 0
        n_known_new = 0   # fully-parsed cases from THIS run
        handle = open(checkpoint_path, 'a', encoding='utf-8') if checkpoint_path else None
        try:
            with ThreadPoolExecutor(max_workers=max(1, self.concurrency)) as pool:
                futures = {pool.submit(self.judge_case, cid, rows): cid
                           for cid, rows in todo}
                with tqdm(total=len(todo), desc=f'rubric:{self.model_name}',
                          unit='case', dynamic_ncols=True) as bar:
                    for future in as_completed(futures):
                        case_id, results, raw, ok = future.result()
                        case_rows = cases[case_id]
                        if not ok:
                            n_failed += 1
                        else:
                            for j, res in enumerate(results):
                                if j < len(case_rows):
                                    results_by_qid[case_rows[j]['q_id']] = res
                            if all(r['score'] != UNKNOWN_SCORE for r in results):
                                n_known_new += 1
                            if handle is not None:
                                line = json.dumps({
                                    'case_id': case_id, 'ok': True,
                                    'results': results, 'raw': raw,
                                    'model': self.model_name,
                                    'prompt_hash': self.prompt_hash,
                                    'n': len(case_rows), 'ts': time.time(),
                                }, ensure_ascii=False)
                                with lock:
                                    handle.write(line + '\n')
                                    handle.flush()
                        postfix = {'fully_parsed': n_known_new}
                        if n_failed:
                            postfix['failed'] = n_failed
                        bar.set_postfix(postfix, refresh=False)
                        bar.update(1)
        finally:
            if handle is not None:
                handle.close()

        if todo and n_failed == len(todo):
            raise RuntimeError(
                'all rubric judge requests failed - the endpoint is likely down or '
                'misconfigured; aborting instead of writing an all-unknown metric')

        n_unknown = sum(1 for r in results_by_qid.values()
                        if r['score'] == UNKNOWN_SCORE)
        return results_by_qid, _stats(len(todo), n_failed, n_known_new, n_unknown)
