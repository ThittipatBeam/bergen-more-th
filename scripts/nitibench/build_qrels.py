"""Build qrels (and refresh the gold sidecar) for the NitiBench+ dataset.

Standalone by design: ProcessDatasets caches processed datasets on disk, so a
processor-side writer would silently not run on later invocations. Run this
once after placing/updating datasets/nitibench_plus_raw/.

Outputs:
  - qrels/qrel.nitibench_plus_qa.dev.json  (+ .txt TREC variant) — what
    utils.eval_retrieval_kilt reads; keyed "doc_dataset_name" =
    nitibench-plus-sections plus one entry per sub-question.
  - datasets/nitibench_plus_qa_gold.jsonl — structured gold per sub-question
    (verdict/reasoning/citations), input to the rubric judge + Citation F1.

Sub-questions with no in-corpus load-bearing citation (5 of 1,228) are
excluded from qrels; they carry sentinel values in the processed dataset and
are scored on the rubric only.

Usage:  python3 scripts/nitibench/build_qrels.py [raw_data_dir]
"""

import os
import sys
import json
from collections import defaultdict

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.join(dir_path, '..', '..')
sys.path.append(repo_root)

from utils import get_qrel_ranking_filename  # noqa: E402
from modules.processors.nitibench_processor import (  # noqa: E402
    parse_nitibench, in_corpus_loadbearing_uris, gold_sidecar_record,
    GOLD_SIDECAR_NAME,
)

RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    repo_root, 'datasets', 'nitibench_plus_raw')

QUERY_DATASET_NAME = 'nitibench_plus_qa'
DOC_DATASET_NAME = 'nitibench-plus-sections'

cases, sections, sections_by_uri = parse_nitibench(RAW)

qrels = {'doc_dataset_name': DOC_DATASET_NAME}
n_pairs = 0
n_skipped = 0
sidecar = []

for case in cases:
    for i, sq in enumerate(case['sub_questions'], start=1):
        qid = f"{case['id']}#sq{i}"
        uris = in_corpus_loadbearing_uris(sq, sections_by_uri)
        if uris:
            qrels[qid] = {uri: 1 for uri in uris}
            n_pairs += len(uris)
        else:
            n_skipped += 1
        sidecar.append(gold_sidecar_record(case, sq, i, sections_by_uri))

# ---- qrels json + trec ----
qrel_folder = os.path.join(repo_root, 'qrels')
os.makedirs(qrel_folder, exist_ok=True)
out_file = get_qrel_ranking_filename(qrel_folder, QUERY_DATASET_NAME, 'dev')

with open(out_file, 'w', encoding='utf-8') as fp:
    json.dump(qrels, fp, ensure_ascii=False, indent=1)

trec_path = out_file.replace('.json', '.txt')
with open(trec_path, 'w', encoding='utf-8') as trec_out:
    for qid, docs in qrels.items():
        if qid == 'doc_dataset_name':
            continue
        for uri in docs:
            trec_out.write(f'{qid} 0 {uri} 1\n')

# ---- gold sidecar (refresh even when the processed dataset is cached) ----
sidecar_path = os.path.join(repo_root, 'datasets', GOLD_SIDECAR_NAME)
with open(sidecar_path, 'w', encoding='utf-8') as f:
    for rec in sidecar:
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')

print(f'wrote {out_file}')
print(f'wrote {trec_path}')
print(f'wrote {sidecar_path}')
print(f'sub-questions with qrels: {len(qrels) - 1} | qrel pairs: {n_pairs} | '
      f'skipped (out-of-corpus only): {n_skipped}')
