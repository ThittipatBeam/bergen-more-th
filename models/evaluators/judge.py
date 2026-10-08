'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

LLM-as-judge for Thai RAG: a post-hoc, binary (0/1) factual-correctness verdict
per question, judged against the retrieved context with the gold answer as a
fallible hint.

Why this exists: the string metrics all require the gold string to appear in the
answer, so they cannot represent a correct refusal (39.5% of answers in the dev
run say ไม่พบข้อมูล) or a correct answer written with a different Thai
transliteration than the gold ("เลดี้ กาก้า" vs "เล ดี กา กา" vs "Lady Gaga").

Design notes:
- Reads ONLY data already on disk - no re-retrieval, no re-generation.
- Resumable: verdicts are appended to a JSONL sidecar as they arrive, so a
  crash costs at most the in-flight requests, never the whole run.
- Unparseable verdicts use the existing -100 unknown convention rather than
  scoring 0, which would bias the mean downwards.
'''

import hashlib
import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import omegaconf
import openai

from models.api_utils import call_with_retry, confirm_api_cost, require_env
from models.evaluators.utils import get_mean_without_unknown

# score assigned when the judge's reply cannot be parsed (BERGEN convention)
UNKNOWN_SCORE = -100

# only these placeholders may be substituted into a prompt template
_PLACEHOLDERS = ('question', 'docs', 'gold', 'prediction')
_TMPL_RE = re.compile(r'\{(' + '|'.join(_PLACEHOLDERS) + r')\}')

# the context is everything before the question in the generator prompt
_QUESTION_MARKER = '\n\nQuestion:'

MAX_RAW_CHARS = 500


def render_prompt(template, values):
    """Substitute {question}/{docs}/{gold}/{prediction} in a single pass.

    Deliberately NOT str.format: the judge prompt contains a literal
    {"verdict": 1} example (which str.format would treat as a field name and
    raise KeyError on), and retrieved document text containing a brace must
    never be re-expanded. One pass over the original template gives both.
    """
    return _TMPL_RE.sub(lambda m: values.get(m.group(1), ''), template)


def extract_docs(instruction):
    """Pull the retrieved-context block out of the generator's instruction.

    BERGEN stores `instruction` as a chat-message list; the user message holds
    'Background:\\nDocument 1: ...\\n\\nQuestion: ...'. Returns the context and
    whether a context was available at all - older/non-chat generators (oracle
    runs, for instance) may store a plain string or a single message, and that
    must degrade gracefully rather than raise KeyError.
    """
    if isinstance(instruction, str):
        content = instruction
    elif isinstance(instruction, (list, tuple)) and instruction:
        # chat template: the user turn is the last message (the context lives there)
        last = instruction[-1]
        content = last.get('content', '') if isinstance(last, dict) else str(last)
    else:
        return '', False

    if not content:
        return '', False
    idx = content.find(_QUESTION_MARKER)
    docs = content[:idx].rstrip() if idx != -1 else content.strip()
    return docs, bool(docs)


def join_gold(label):
    """`label` is a list of 1-7 acceptable answers; join them for the prompt."""
    if label is None:
        return ''
    if isinstance(label, str):
        return label
    return '; '.join(str(x) for x in label if x is not None)


def prompt_hash(system, user, model):
    """Identify a (prompt, model) pair so edited prompts do not reuse verdicts."""
    payload = '\x00'.join([system, user, model])
    return 'sha1:' + hashlib.sha1(payload.encode('utf-8')).hexdigest()


def _normalize_verdict(value):
    """Map a judge's verdict token onto 1/0, or None if it is not a verdict."""
    if isinstance(value, bool):
        return 1 if value else 0
    if isinstance(value, (int, float)) and value in (0, 1):
        return int(value)
    if isinstance(value, str):
        token = value.strip().lower()
        if token in ('1', 'true', 'yes', 'y', 'correct', 'ถูกต้อง', 'ใช่'):
            return 1
        if token in ('0', 'false', 'no', 'n', 'incorrect', 'wrong', 'ไม่ถูกต้อง', 'ไม่ใช่'):
            return 0
    return None


def parse_verdict(text):
    """Extract (score, reason) from the judge's reply.

    Returns score None when nothing parseable was found; the caller turns that
    into UNKNOWN_SCORE. No retry: re-asking usually reproduces the same text and
    costs money again.
    """
    if not text:
        return None, ''

    # 1. strict JSON
    try:
        payload = json.loads(text.strip())
        if isinstance(payload, dict):
            for key in ('verdict', 'correct', 'score'):
                if key in payload:
                    score = _normalize_verdict(payload[key])
                    if score is not None:
                        return score, str(payload.get('reason', '')).strip()
    except (ValueError, TypeError):
        pass

    # 2. embedded or fenced JSON (```json ... ``` and prose around it)
    match = re.search(r'\{[^{}]*"verdict"\s*:\s*([01])[^{}]*\}', text, re.DOTALL)
    if match:
        reason = re.search(r'"reason"\s*:\s*"([^"]*)"', match.group(0))
        return int(match.group(1)), (reason.group(1).strip() if reason else '')

    # 3. bare verdict number, if it is unambiguous
    numbers = re.findall(r'(?<![\d.])[01](?![\d.])', text)
    if len(numbers) == 1:
        return int(numbers[0]), ''

    # 4. correctness words - require exactly one side to appear
    lowered = text.lower()
    says_correct = any(w in lowered for w in ('correct', 'ถูกต้อง'))
    says_wrong = any(w in lowered for w in ('incorrect', 'wrong', 'ไม่ถูกต้อง'))
    if says_correct and not says_wrong:
        return 1, ''
    if says_wrong and not says_correct:
        return 0, ''

    return None, ''


class LLMJudge:
    """Binary factual-correctness judge over an OpenAI-compatible endpoint."""

    def __init__(self,
                 model=None,
                 prompt_config='judge_qa',
                 base_url=None,
                 concurrency=None,
                 max_retries=6,
                 dry_run=False,
                 require_confirmation=True):
        # three-tier env resolution, matching the other API components:
        # constructor arg -> JUDGE_* -> shared OPENAI_*
        self.model_name = model or os.environ.get('JUDGE_MODEL')
        if not self.model_name:
            raise ValueError(
                'the judge requires a model: pass --judge_model or set JUDGE_MODEL. '
                'Set it with: export JUDGE_MODEL=<model-id>')
        self.base_url = base_url or os.environ.get('JUDGE_BASE_URL') or os.environ.get('OPENAI_BASE_URL') or None
        self._api_key = os.environ.get('JUDGE_API_KEY') or os.environ.get('OPENAI_API_KEY')
        if not self._api_key:
            require_env('JUDGE_API_KEY', 'judge')
        self.concurrency = int(os.environ.get('JUDGE_CONCURRENCY') or concurrency or 4)
        self.max_retries = max_retries
        self.dry_run = dry_run
        self.require_confirmation = require_confirmation
        self.client = None
        self.total_cost = 0.0
        self.prompt_cost = 0.0
        self.completion_cost = 0.0

        path = f'config/evaluator/{prompt_config}.yaml'
        if not os.path.exists(path):
            raise FileNotFoundError(f'judge prompt config not found: {path}')
        config = omegaconf.OmegaConf.load(path)
        self.system_prompt = config['system']
        self.user_template = config['user']
        self.max_docs_chars = int(config.get('max_docs_chars') or 0)
        self.prompt_hash = prompt_hash(self.system_prompt, self.user_template, self.model_name)

    def _get_client(self):
        if self.client is None:
            self.client = openai.OpenAI(api_key=self._api_key, base_url=self.base_url)
        return self.client

    # ---------- cost ----------

    def openai_api_calculate_cost(self, usage):
        # copied from models/generators/llm_openai.py, NOT from
        # models/evaluators/openai.py: that version raises ValueError on any
        # model outside a 5-entry dict, and a judge served through a gateway
        # alias is never in it. Cost tracking degrades to zero instead.
        pricing = {
            'gpt-3.5-turbo': {'prompt': 0.0015, 'completion': 0.0020},
            'gpt-4-1106-preview': {'prompt': 0.01, 'completion': 0.03},
            'gpt-4': {'prompt': 0.03, 'completion': 0.06},
            'gpt-4-0125-preview': {'prompt': 0.01, 'completion': 0.03},
            'gpt-4o': {'prompt': 0.005, 'completion': 0.015},
        }
        if self.model_name not in pricing:
            print(f"WARNING: no pricing entry for model '{self.model_name}', cost tracking disabled")
            return (0.0, 0.0, 0.0)
        model_pricing = pricing[self.model_name]
        prompt_cost = usage.prompt_tokens * model_pricing['prompt'] / 1000
        completion_cost = usage.completion_tokens * model_pricing['completion'] / 1000
        return (round(prompt_cost + completion_cost, 6), prompt_cost, completion_cost)

    # ---------- one question ----------

    def build_messages(self, record):
        docs = record.get('docs') or ''
        if self.max_docs_chars and len(docs) > self.max_docs_chars:
            docs = docs[:self.max_docs_chars]
        values = {
            'question': record.get('question') or '',
            'docs': docs,
            'gold': record.get('gold') or '',
            'prediction': record.get('response') or '',
        }
        return [
            {'role': 'system', 'content': self.system_prompt},
            {'role': 'user', 'content': render_prompt(self.user_template, values)},
        ]

    def judge_one(self, record):
        """Judge one record. Returns (q_id, score, reason, raw, cost, ok).

        ok=False means the API call failed - the caller must NOT record that as
        a verdict, or a transient outage would be frozen into the results.
        """
        messages = self.build_messages(record)

        def call():
            return self._get_client().chat.completions.create(
                messages=messages, model=self.model_name)

        try:
            response = call_with_retry(call, max_retries=self.max_retries,
                                       provider='openai_compatible')
        except Exception as e:
            print(f"WARNING: judge request failed for q_id={record.get('q_id')} "
                  f"({type(e).__name__}: {str(e)[:200]})", file=sys.stderr)
            return record.get('q_id'), UNKNOWN_SCORE, '', '', 0.0, False

        cost = 0.0
        if getattr(response, 'usage', None) is not None:
            cost = self.openai_api_calculate_cost(response.usage)[0]
        try:
            raw = response.choices[0].message.content or ''
        except (AttributeError, IndexError):
            raw = ''

        score, reason = parse_verdict(raw)
        if score is None:
            score = UNKNOWN_SCORE
        return record.get('q_id'), score, reason, raw[:MAX_RAW_CHARS], cost, True

    # ---------- checkpoint ----------

    @staticmethod
    def load_checkpoint(path, current_hash):
        """Read verdicts already paid for.

        A crash can leave a half-written final line; that line is dropped and
        the file rewritten with the valid prefix, so it cannot corrupt the next
        append. Returns {q_id: record} for verdicts matching `current_hash`.
        """
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
        return {rec['q_id']: rec for rec in valid
                if rec.get('ok') and rec.get('prompt_hash') == current_hash and 'q_id' in rec}

    # ---------- batch ----------

    def judge_batch(self, records, checkpoint_path=None, sample_seed=None):
        """Judge records, resuming from and appending to a JSONL checkpoint.

        Returns (scores_by_qid, reasons_by_qid, stats) where stats carries the
        cost split, how many were reused from a previous run, and the unknown
        rate. Failures raise RuntimeError if *every* request failed - writing an
        all-unknown metric silently would be worse and more expensive than
        crashing.
        """
        # always read the checkpoint, dry-run included: resuming tells the user
        # how many calls *would* actually be made
        done = self.load_checkpoint(checkpoint_path, self.prompt_hash) if checkpoint_path else {}
        todo = [r for r in records if r['q_id'] not in done]
        n_reused = len(records) - len(todo)

        confirm_api_cost(
            f'LLM-as-judge scoring of {len(todo)} answers with {self.model_name}',
            estimated_calls=len(todo),
            scale_note=('Judging sends the question, the retrieved context, the gold answer '
                        'and the system answer to the judge model - roughly one call per '
                        'question, ~2-3k prompt tokens each.'),
            dry_run=self.dry_run,
            require_confirmation=self.require_confirmation,
        )
        if not todo:
            print(f'judge: all {len(records)} verdicts already present in {checkpoint_path}')
            scores = {q: r['score'] for q, r in done.items()}
            reasons = {q: r.get('reason', '') for q, r in done.items()}
            # this branch must report the same stat keys as the judging path:
            # callers read unknown_rate unconditionally, and an all-unknown
            # resumed run has to stay distinguishable from a real 0%.
            unknown = sum(1 for s in scores.values() if s == UNKNOWN_SCORE)
            return (scores, reasons,
                    {'n_reused': n_reused, 'n_judged': 0, 'n_failed': 0,
                     'n_unknown': unknown,
                     'unknown_rate': unknown / len(scores) if scores else 0.0,
                     'total_cost': 0.0, 'prompt_cost': 0.0, 'completion_cost': 0.0})

        scores, reasons = {}, {}
        for q_id, rec in done.items():
            scores[q_id] = rec['score']
            reasons[q_id] = rec.get('reason', '')

        lock = threading.Lock()
        n_failed = 0
        handle = open(checkpoint_path, 'a', encoding='utf-8') if checkpoint_path else None
        try:
            with ThreadPoolExecutor(max_workers=max(1, self.concurrency)) as pool:
                futures = [pool.submit(self.judge_one, r) for r in todo]
                for i, future in enumerate(as_completed(futures), 1):
                    q_id, score, reason, raw, cost, ok = future.result()
                    self.total_cost += cost
                    if not ok:
                        n_failed += 1
                        continue
                    scores[q_id] = score
                    reasons[q_id] = reason
                    if handle is not None:
                        line = json.dumps({
                            'q_id': q_id, 'ok': True, 'score': score, 'reason': reason,
                            'raw': raw, 'model': self.model_name,
                            'prompt_hash': self.prompt_hash, 'ts': time.time(),
                        }, ensure_ascii=False)
                        with lock:
                            handle.write(line + '\n')
                            handle.flush()
                    if i % 50 == 0 or i == len(todo):
                        print(f'judge: {i}/{len(todo)} done, '
                              f'cost so far ${self.total_cost:.4f}', file=sys.stderr)
        finally:
            if handle is not None:
                handle.close()

        if todo and n_failed == len(todo):
            raise RuntimeError(
                f'all {len(todo)} judge requests failed - the endpoint is likely down or '
                f'misconfigured; aborting instead of writing an all-unknown metric')

        unknown = sum(1 for q_id in scores if scores[q_id] == UNKNOWN_SCORE)
        stats = {
            'n_reused': n_reused,
            'n_judged': len(todo) - n_failed,
            'n_failed': n_failed,
            'n_unknown': unknown,
            'unknown_rate': unknown / len(scores) if scores else 0.0,
            'total_cost': self.total_cost,
            'prompt_cost': self.prompt_cost,
            'completion_cost': self.completion_cost,
        }
        return scores, reasons, stats

    def mean(self, scores):
        """Mean over known verdicts only (the -100 sentinel is excluded)."""
        return float(get_mean_without_unknown(list(scores)))
