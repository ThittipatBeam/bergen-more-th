"""
NitiBench+ processors for the Thai RAG benchmark.

Source files: datasets/nitibench_plus_raw/
  - validation_split.jsonl : 498 decided court cases / 1,228 sub-questions
  - gold_sections.jsonl    : 3,253 statute-section versions (id = version_uri)

Two processors:
  - NitiBenchPlusSections : retrieval corpus, one row per section VERSION.
      columns: id (= version_uri), content, wikipedia_id (= version_uri).
      wikipedia_id is REQUIRED: rag.py maps retrieved ids through
      get_by_id(doc, ids, 'wikipedia_id') before retrieval eval — without it
      recall is silently computed against nothing.
  - NitiBenchPlusQA : one row per sub-question.
      id = "{case_id}#sq{i}" (1-based), content = fact pattern + decision date
      + prior question texts (when depends_on_previous) + the question,
      label = [verdict + reasoning], ranking_label = [[load-bearing
      in-corpus version_uris]], and doc/doc_id = gold-cited oracle context
      (RGB pattern, inert unless retriever=oracle_provenance).

Sentinels: sub-questions with NO in-corpus load-bearing citation (5 of 1,228)
get __out_of_corpus__ in ranking_label/doc_id and a Thai placeholder in doc,
because ProcessDatasets.sanity_checks rejects empty lists. Those 5 rows are
excluded from qrels (see scripts/nitibench/build_qrels.py).

This module also exposes parse_nitibench() and helpers shared with
scripts/nitibench/build_qrels.py so the processor and the qrels generator can
never drift apart.
"""

from ..dataset_processor import Processor
from datasets import Dataset
import json
import os

SENTINEL_ID = '__out_of_corpus__'
SENTINEL_DOC = '(ไม่มีคำอ้างอิงในคลังกฎหมายที่ให้มา)'

GOLD_SIDECAR_NAME = 'nitibench_plus_qa_gold.jsonl'


def parse_nitibench(data_dir):
    """Load the raw NitiBench+ files.

    Returns (cases, sections, sections_by_uri):
      sections_by_uri: version_uri -> section dict (used to resolve citations).
    """
    def _load(name):
        with open(os.path.join(data_dir, name), encoding='utf-8') as f:
            return [json.loads(line) for line in f if line.strip()]

    cases = _load('validation_split.jsonl')
    sections = _load('gold_sections.jsonl')
    sections_by_uri = {s['version_uri']: s for s in sections}
    return cases, sections, sections_by_uri


def format_section(doc):
    """Corpus-side text presentation of one section version."""
    return f"อ้างอิง: {doc['law_name_th']} {doc['label']}\n{doc['text']}"


def in_corpus_loadbearing_uris(sq, sections_by_uri):
    """Load-bearing citation version_uris of one sub-question that resolve in
    the gold-section corpus (deduplicated, order-preserving)."""
    uris = []
    seen = set()
    for cit in sq.get('citations', []):
        uri = cit.get('version_uri')
        if cit.get('is_loadbearing') and uri and uri in sections_by_uri and uri not in seen:
            seen.add(uri)
            uris.append(uri)
    return uris


def gold_sidecar_record(case, sq, sq_index, sections_by_uri):
    """Structured gold for one sub-question — consumed by the rubric judge and
    Citation F1 evaluators (Phase C)."""
    return {
        'id': f"{case['id']}#sq{sq_index}",
        'case_id': case['id'],
        'sq_index': sq_index,
        'decision_date': case['decision_date'],
        'domain': case['domain'],
        'court': case['court'],
        'drift_band': case['drift_band'],
        'question': sq['question'],
        'fact_pattern': case['fact_pattern'],
        'question_type': sq.get('question_type'),
        'depends_on_previous': bool(sq.get('depends_on_previous')),
        'verdict': sq['verdict'],
        'reasoning': sq['reasoning'],
        'gold_citations': [
            {
                'law_name_th': c.get('law_name_th'),
                'label': c.get('label'),
                'version_uri': c.get('version_uri'),
                'in_corpus': bool(
                    c.get('is_loadbearing')
                    and c.get('version_uri')
                    and c['version_uri'] in sections_by_uri),
            }
            for c in sq.get('citations', []) if c.get('is_loadbearing')
        ],
        'background_citations': [
            {'law_name_th': c.get('law_name_th'), 'label': c.get('label')}
            for c in sq.get('citations', []) if not c.get('is_loadbearing')
        ],
    }


class NitiBenchPlusSections(Processor):
    """Retrieval corpus: 3,253 statute-section versions keyed by version_uri."""

    def __init__(self, data_dir='datasets/nitibench_plus_raw', *args, **kwargs):
        super().__init__(*args, **kwargs, dataset_name='nitibench-plus-sections')
        self.data_dir = data_dir

    def process(self):
        _, sections, sections_by_uri = parse_nitibench(self.data_dir)
        assert len(sections_by_uri) == len(sections), 'duplicate version_uri in gold_sections.jsonl'
        rows = {
            'id': [],
            'content': [],
            'wikipedia_id': [],
        }
        for s in sections:
            assert s['version_uri'] and s['text'] and s['law_name_th'] and s['label'], \
                f'incomplete gold section: {s.get("version_uri")}'
            rows['id'].append(s['version_uri'])
            rows['content'].append(format_section(s))
            rows['wikipedia_id'].append(s['version_uri'])
        dataset = Dataset.from_dict(rows)
        assert len(dataset) == 3253, f'expected 3,253 section versions, got {len(dataset)}'
        return dataset


class NitiBenchPlusQA(Processor):
    """Query set: one row per sub-question (1,228 rows over 498 cases).

    Also writes the gold sidecar (<out_folder>/nitibench_plus_qa_gold.jsonl)
    whenever the dataset is (re)built; scripts/nitibench/build_qrels.py writes
    the same sidecar so it can be refreshed without invalidating the cached
    processed dataset.
    """

    def __init__(self, data_dir='datasets/nitibench_plus_raw', lang='th', *args, **kwargs):
        super().__init__(*args, **kwargs, dataset_name='nitibench_plus_qa')
        self.data_dir = data_dir
        self.lang = lang

    def process(self):
        cases, _, sections_by_uri = parse_nitibench(self.data_dir)
        rows = {
            'id': [],
            'content': [],
            'label': [],
            'ranking_label': [],
            'doc': [],
            'doc_id': [],
        }
        sidecar_records = []
        n_sentinel = 0
        n_qrel_pairs = 0

        for case in cases:
            for i, sq in enumerate(case['sub_questions'], start=1):
                qid = f"{case['id']}#sq{i}"
                uris = in_corpus_loadbearing_uris(sq, sections_by_uri)
                n_qrel_pairs += len(uris)

                # --- content: fact pattern + decision date + prior questions + question
                parts = [
                    f"ข้อเท็จจริง: {case['fact_pattern']}",
                    f"วันพิพากษา: {case['decision_date']} "
                    "(ตอบด้วยกฎหมายที่มีผลบังคับใช้ ณ วันพิพากษานี้เท่านั้น)",
                ]
                if sq.get('depends_on_previous') and i > 1:
                    prior = [p['question'] for p in case['sub_questions'][: i - 1]]
                    parts.append(
                        "คำถามที่ตอบไปแล้ว:\n"
                        + "\n".join(f"{j}. {q}" for j, q in enumerate(prior, start=1))
                    )
                parts.append(f"คำถาม: {sq['question']}")
                content = "\n\n".join(parts)

                # --- label: court verdict + reasoning (context for prompts;
                #     headline scores come from the rubric/citation evaluators)
                label = f"{sq['verdict']}\nเหตุผล: {sq['reasoning']}"

                # --- gold-cited oracle columns (RGB pattern)
                if uris:
                    doc = [format_section(sections_by_uri[u]) for u in uris]
                    doc_id = uris
                    ranking = [uris]
                else:
                    n_sentinel += 1
                    doc = [SENTINEL_DOC]
                    doc_id = [SENTINEL_ID]
                    ranking = [[SENTINEL_ID]]

                # fail loudly here rather than in sanity_checks with no context
                assert qid and content.strip() and label.strip(), f'empty field in {qid}'

                rows['id'].append(qid)
                rows['content'].append(content)
                rows['label'].append([label])
                rows['ranking_label'].append(ranking)
                rows['doc'].append(doc)
                rows['doc_id'].append(doc_id)

                sidecar_records.append(
                    gold_sidecar_record(case, sq, i, sections_by_uri))

        assert len(rows['id']) == len(set(rows['id'])), 'duplicate sub-question ids'
        dataset = Dataset.from_dict(rows)
        assert len(dataset) == 1228, f'expected 1,228 sub-questions, got {len(dataset)}'

        sidecar_path = os.path.join(self.out_folder, GOLD_SIDECAR_NAME)
        os.makedirs(self.out_folder, exist_ok=True)
        with open(sidecar_path, 'w', encoding='utf-8') as f:
            for rec in sidecar_records:
                f.write(json.dumps(rec, ensure_ascii=False) + '\n')

        print(f'NitiBenchPlusQA: {len(dataset)} sub-questions, '
              f'{len(cases)} cases, {n_sentinel} sentinel rows, '
              f'{n_qrel_pairs} qrel pairs, sidecar -> {sidecar_path}')
        return dataset
