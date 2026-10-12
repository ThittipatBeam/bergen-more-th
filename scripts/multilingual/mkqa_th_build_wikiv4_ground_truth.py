"""
Build Thai retrieval ground truth for MKQA-TH from KILT English provenance
through Wikidata's en→th interlanguage links, resolved against
pythainlp/thai-wiki-dataset-v4.

Inputs (all under the repo):
  data/train-0000*-of-00002.parquet   thai-wiki-dataset-v4 shards
  data/enwiki-latest-langlinks.sql.gz Wikidata langlinks dump (you supply)
  qrels/qrel.mkqa_th.dev.json         existing KILT-English provenance qrels

Outputs:
  data/en2th_titles.json            intermediate English pageid → Thai title map
  qrels/qrel.mkqa_th.dev.json       REWRITTEN: English ids replaced with Thai curids.
                                    Its doc_dataset_name becomes the ThaiWikiV4
                                    corpus name so retrieval metrics fire when the
                                    doc corpus IS that corpus (and stay silently
                                    skipped for the old wiki-100w-th corpus, which
                                    is correct — those qrels were never Thai).
                                    The original English file is backed up to
                                    qrels/qrel.mkqa_th.dev.kilt-en-backup.json on
                                    first run.
  qrels/qrel.mkqa_th.dev.txt        TREC-style copy
  data/mkqa_th_wikiv4_coverage.json attrition/stats for the benchmark write-up

Usage:
    # 1) download the langlinks dump one time into data/ (user does this):
    #    wget https://mirrors.wikimedia.org/enwiki/latest/enwiki-latest-langlinks.sql.gz -P data/
    # 2) run this script
    python3 scripts/multilingual/mkqa_th_build_wikiv4_ground_truth.py [--chunk-words 1000]

The langlinks dump is a .gz-compressed SQL file whose INSERT rows look like:
    (12345,0,'th','เรดฮอตชิลีเพปเปอส์'),(...)...
Each row maps `ll_from` (English pageid) → `ll_title` (foreign article title)
and the source dataset id column is a string cast as pageid. We only need
rows with lang = 'th'.
"""
import argparse
import glob
import gzip
import json
import os
import re
import sys
from collections import defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(REPO, 'data')

LL_GLOB = os.path.join(DATA, 'enwiki-latest-langlinks.sql.gz')
EN2TH_JSON = os.path.join(DATA, 'en2th_titles.json')

# The qrel filename is keyed on the QUERY dataset name ('mkqa_th'), which is how
# utils.eval_retrieval_kilt finds it — not on the doc corpus. The doc corpus
# lives in the qrel's doc_dataset_name field; here that is the ThaiWikiV4
# corpus name produced by config/dataset/mkqa/mkqa_th-wikiv4.retrieve_th.yaml.
QUERY_DATASET = 'mkqa_th'
QREL_JSON = os.path.join(REPO, 'qrels', f'qrel.{QUERY_DATASET}.dev.json')
QREL_TXT = os.path.join(REPO, 'qrels', f'qrel.{QUERY_DATASET}.dev.txt')
QREL_EN_BACKUP = os.path.join(REPO, 'qrels', f'qrel.{QUERY_DATASET}.dev.kilt-en-backup.json')
COVERAGE_JSON = os.path.join(DATA, 'mkqa_th_wikiv4_coverage.json')

# ---------------------------------------------------------------------------
# 1) parse the Wikidata langlinks dump into {en_pageid: th_title}
# ---------------------------------------------------------------------------
# rows look like: (26589,'th','เรดฮอตชิลีเพปเปอส์'),(2973792,'th','ประเทศฝรั่งเศส...')
# langlinks dump columns are (ll_from, ll_lang, ll_title) — three values per row,
# no ll_from_lang in the current dump layout. Match lang='th' only.
ROW_RE = re.compile(r"\((\d+),'th','((?:[^'\\]|\\.)*)'\)")


def parse_langlinks(path_glob):
    files = sorted(glob.glob(path_glob))
    if not files:
        raise SystemExit(
            f"No langlinks dump found matching {path_glob}. Download it first:\n"
            f"  wget https://mirrors.wikimedia.org/enwiki/latest/enwiki-latest-langlinks.sql.gz -P {DATA}/"
        )
    path = files[0]
    en2th = {}
    # read the stream as bytes and decode whole rows manually: the dump is
    # utf8mb4 with occasional invalid bytes, so strict per-line decoding drops data.
    row_re = re.compile(rb"\((\d+),'th','((?:[^'\\]|\\.)*)'\)")
    with gzip.open(path, 'rb') as fh:
        data = fh.read()
    for m in row_re.finditer(data):
        pid = m.group(1).decode('ascii')
        try:
            th_title = (m.group(2)
                        .replace(b"\\'", b"'")
                        .replace(b'\\"', b'"')
                        .replace(b'\\\\', b'\\')
                        .decode('utf-8'))
        except UnicodeDecodeError:
            continue  # skip rows with unrepaired encoding artifacts
        if th_title:
            en2th[pid] = th_title
    return en2th


# ---------------------------------------------------------------------------
# 2) load Thai corpus rows: title -> curid (there can be >1 row per title
#    across sources; we only care about thwiki)
# ---------------------------------------------------------------------------

def load_th_title_index():
    files = sorted(glob.glob(os.path.join(DATA, 'train-0000*-of-00002.parquet')))
    if not files:
        raise SystemExit(f"No thai-wiki-dataset-v4 parquet files in {DATA}; expected data/train-0000*-of-00002.parquet")
    try:
        import pyarrow.parquet as pq
    except ImportError:
        raise SystemExit("pyarrow is required to read the parquet shards: pip install pyarrow")
    title2curids = defaultdict(set)
    for f in files:
        table = pq.read_table(f, columns=['id', 'title', 'source'])
        ids = table.column('id').to_pylist()
        titles = table.column('title').to_pylist()
        sources = table.column('source').to_pylist()
        for curid, title, src in zip(ids, titles, sources):
            if src != 'thwiki':
                continue
            if not title:
                continue
            # KILT/Wikidata sitelinks use underscores instead of spaces
            # ('The_Lion_King' vs the dataset's human title). Register both
            # spellings so either lookup form hits.
            title2curids[title].add(curid)
            if ' ' in title:
                title2curids[title.replace(' ', '_')].add(curid)
    return title2curids


# ---------------------------------------------------------------------------
# 3) join: KILT provenance (en pageids) -> th titles -> th curids -> qrels
# ---------------------------------------------------------------------------

def build(en2th, title2curids, qrel_en):
    """Join KILT provenance (English pageids) through en2th + title2curids.

    `qrel_en` is the ORIGINAL KILT-English qrels dict (doc_dataset_name removed).
    Returns (new_qrels, stats) where new_qrels maps qid -> {thai curid: 1}.
    """
    th_qrels = {}
    stats = {
        'questions_in_qrel_mkqa_th_dev': len(qrel_en),
        'distinct_en_provenance_pages': 0,
        'en_pages_with_thai_link': 0,
        'th_titles_matched_in_v4_thwiki': 0,
        'questions_with_thai_ground_truth': 0,
        'questions_dropped_no_thai_page': 0,
        'distinct_th_ground_truth_pages': 0,
    }
    all_en_pids = {pid for q in qrel_en.values() for pid in q}
    stats['distinct_en_provenance_pages'] = len(all_en_pids)
    stats['en_pages_with_thai_link'] = sum(1 for p in all_en_pids if p in en2th)

    th_curids_seen = set()
    for qid, pages in qrel_en.items():
        th_docs = {}
        for en_pid in pages:
            th_title = en2th.get(en_pid)
            if not th_title:
                continue
            curids = title2curids.get(th_title, set())
            if curids:
                stats['th_titles_matched_in_v4_thwiki'] += 1
            for curid in curids:
                th_docs[curid] = 1
                th_curids_seen.add(curid)
        if th_docs:
            th_qrels[qid] = th_docs
        else:
            stats['questions_dropped_no_thai_page'] += 1
    stats['questions_with_thai_ground_truth'] = len(th_qrels)
    stats['distinct_th_ground_truth_pages'] = len(th_curids_seen)
    return th_qrels, stats


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--en2th', default=EN2TH_JSON,
                    help='cached english pid -> th title mapping; if absent, it is built from the dump')
    ap.add_argument('--chunk-words', type=int, default=1000,
                    help='passage size the ThaiWikiV4 benchmark corpus was built with; '
                         'becomes doc_dataset_name in the qrels (thai-wiki-v4-<N>w-thwiki) '
                         'so retrieval metrics fire on the matching run')
    args = ap.parse_args()
    doc_corpus_name = f'thai-wiki-v4-{args.chunk_words}w-thwiki'

    # step 1
    if os.path.exists(args.en2th):
        print(f'[1/3] loading cached {args.en2th}')
        en2th = json.load(open(args.en2th))
    else:
        print('[1/3] parsing langlinks dump (this can take a few minutes)')
        en2th = parse_langlinks(LL_GLOB)
        json.dump(en2th, open(args.en2th, 'w'), ensure_ascii=False)
        print(f'      wrote {len(en2th):,} mappings to {args.en2th}')

    # step 2
    print('[2/3] indexing th wiki titles from thai-wiki-dataset-v4')
    title2curids = load_th_title_index()
    print(f'      {len(title2curids):,} distinct thwiki titles')

    # step 3: read the original English qrels, build, back them up once, rewrite
    with open(QREL_JSON) as fh:
        qrel_en = json.load(fh)
    if qrel_en.get('doc_dataset_name') != 'kilt-100w':
        raise SystemExit(
            f'{QREL_JSON} has doc_dataset_name={qrel_en.get("doc_dataset_name")}; '
            'this script expects the original KILT-English provenance file. '
            f'Restore it from {QREL_EN_BACKUP} first.')
    if not os.path.exists(QREL_EN_BACKUP):
        import shutil
        shutil.copy(QREL_JSON, QREL_EN_BACKUP)
        print(f'[3/3] backed up original English qrels to {QREL_EN_BACKUP}')
    qrel_en.pop('doc_dataset_name', None)

    th_qrels, stats = build(en2th, title2curids, qrel_en)
    th_qrels = dict(sorted(th_qrels.items(), key=lambda kv: kv[0]))
    th_qrels['doc_dataset_name'] = doc_corpus_name
    with open(QREL_JSON, 'w') as fh:
        json.dump(th_qrels, fh, ensure_ascii=False)
    with open(QREL_TXT, 'w') as fh:
        for qid, docs in th_qrels.items():
            if qid == 'doc_dataset_name':
                continue
            for docid in docs:
                fh.write(f'{qid} 0 {docid} 1\n')
    stats['doc_corpus_name'] = doc_corpus_name
    json.dump(stats, open(COVERAGE_JSON, 'w'), indent=2, ensure_ascii=False)

    print('\ncoverage:')
    for k, v in stats.items():
        print(f'  {k}: {v:,}' if isinstance(v, int) else f'  {k}: {v}')
    print(f'\nwrote {QREL_JSON} (now Thai ground truth against {doc_corpus_name})')
    print(f'wrote {QREL_TXT}')
    print(f'wrote {COVERAGE_JSON}')


if __name__ == '__main__':
    sys.exit(main())
