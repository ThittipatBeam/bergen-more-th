"""Recall report for NitiBench+ retrieval runs (post-hoc, no re-embedding).

Reads a TREC run file + the qrels built by build_qrels.py and reports:
  - version-exact Recall@k     : gold doc ids (version_uri) found in top-k
  - version-exact Any-Hit@k    : queries with >= 1 gold version in top-k
  - section-level Recall@k     : hit counts when the same (law_code, label)
                                 is retrieved in ANY version
  - section-level Any-Hit@k    : as above, any-hit variant

"version-exact" is the strict temporal-discrimination score (right section,
right enactment); "section-level" shows how often retrieval found the right
statute section but in the wrong version.

Usage:
    python3 scripts/nitibench/recall_report.py [run.trec]
Defaults to the newest runs/*.trec matching the nitibench datasets.
Writes <run>.recall_report.json next to the run file.
"""

import os
import sys
import json
import glob
from collections import defaultdict

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.join(dir_path, '..', '..')

K_LIST = (1, 5, 10, 20, 50, 100)


def find_run():
    pattern = os.path.join(repo_root, 'runs',
                           'run.retrieve.top_*.nitibench_plus_qa*.trec')
    runs = sorted(glob.glob(pattern), key=os.path.getmtime)
    if not runs:
        sys.exit(f'no nitibench run found at {pattern}')
    return runs[-1]


def load_run(trec_path):
    """TREC: qid, q0, doc_id, rank, score, run  ->  qid -> [doc_ids by rank]."""
    ranked = defaultdict(list)
    with open(trec_path, encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) < 4:
                parts = line.strip().split()
            if len(parts) < 4:
                continue
            qid, _, doc_id, rank = parts[0], parts[1], parts[2], int(parts[3])
            ranked[qid].append((rank, doc_id))
    return {qid: [d for _, d in sorted(entries)] for qid, entries in ranked.items()}


def main():
    run_path = sys.argv[1] if len(sys.argv) > 1 else find_run()
    qrels_path = os.path.join(
        repo_root, 'qrels', 'qrel.nitibench_plus_qa.dev.json')
    sections_path = os.path.join(
        repo_root, 'datasets', 'nitibench_plus_raw', 'gold_sections.jsonl')

    qrels = json.load(open(qrels_path, encoding='utf-8'))
    qrels = {q: v for q, v in qrels.items() if q != 'doc_dataset_name'}

    uri_to_section = {}
    with open(sections_path, encoding='utf-8') as f:
        for line in f:
            s = json.loads(line)
            uri_to_section[s['version_uri']] = (s['law_code'], s['label'])

    run = load_run(run_path)
    ks = [k for k in K_LIST if k <= max((len(docs) for docs in run.values()))]

    scores = {kind: {k: [] for k in ks} for kind in
              ('version_recall', 'version_anyhit', 'section_recall', 'section_anyhit')}
    missing_queries = 0

    for qid, gold in qrels.items():
        gold_uris = set(gold)
        gold_sections = {uri_to_section[u] for u in gold_uris if u in uri_to_section}
        retrieved = run.get(qid, [])
        if not retrieved:
            missing_queries += 1
        retrieved_sections = [uri_to_section.get(u) for u in retrieved]
        for k in ks:
            topk = retrieved[:k]
            topk_sections = [s for s in retrieved_sections[:k] if s]
            v_hits = len(gold_uris & set(topk))
            s_hits = len(gold_sections & set(topk_sections))
            scores['version_recall'][k].append(
                v_hits / len(gold_uris) if gold_uris else 0.0)
            scores['version_anyhit'][k].append(1.0 if v_hits else 0.0)
            scores['section_recall'][k].append(
                s_hits / len(gold_sections) if gold_sections else 0.0)
            scores['section_anyhit'][k].append(1.0 if s_hits else 0.0)

    def mean(xs):
        return sum(xs) / len(xs) if xs else 0.0

    report = {
        'run_file': os.path.basename(run_path),
        'n_queries': len(qrels),
        'n_queries_with_empty_run': missing_queries,
        'gold_per_query_mean': round(
            sum(len(v) for v in qrels.values()) / len(qrels), 2),
        'metrics': {kind: {str(k): round(mean(v), 4)
                           for k, v in by_k.items()}
                    for kind, by_k in scores.items()},
    }

    # ---- print table ----
    run_name = os.path.basename(run_path)
    print(f'\nrun: {run_name}')
    print(f'queries: {len(qrels)} (empty run for {missing_queries}) '
          f'| mean gold/query: {report["gold_per_query_mean"]}\n')
    header = f'{"k":>5} | {"ver-recall":>10} | {"ver-anyhit":>10} | ' \
             f'{"sec-recall":>10} | {"sec-anyhit":>10}'
    print(header)
    print('-' * len(header))
    for k in ks:
        r = report['metrics']
        print(f'{k:>5} | {r["version_recall"][str(k)]:>10.4f} | '
              f'{r["version_anyhit"][str(k)]:>10.4f} | '
              f'{r["section_recall"][str(k)]:>10.4f} | '
              f'{r["section_anyhit"][str(k)]:>10.4f}')

    out_path = run_path + '.recall_report.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f'\nwrote {out_path}')

    gate = report['metrics']['version_anyhit'].get(str(ks[-1]), 0.0)
    print(f'gate check: version any-hit Recall@{ks[-1]} = {gate:.4f} '
          f'({"PASS" if gate > 0.7 else "FAIL — discuss before Phase C"})')


if __name__ == '__main__':
    main()
