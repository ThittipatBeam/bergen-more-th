'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Citation F1 for NitiBench+ runs, per the official scoring rules
(datasets/nitibench_plus_raw/grading/citation_rules.md).

Gold set   : load-bearing citations that resolve in the corpus (gold sidecar
             `gold_citations` with in_corpus=True), each identified by its
             version_uri - the version in force on the decision date.
Pred set   : citations parsed from the model's JSON answer ({law_name, section}),
             minus citations matching a background citation of the same
             sub-question (removed BEFORE scoring: neither hit nor miss).
Modes      : - identifier: the model saw statute text and copied the header
               "อ้างอิง: <law> <label>"; match on (normalized law, normalized
               label).
             - fuzzy (Parametric): law name matched to the law catalog with
               rapidfuzz WRatio >= 85, the label normalized (Thai numerals to
               Arabic digits, วรรค/อนุมาตรา/(n) markers removed) and the
               section resolved to the version in force on the decision date;
               hit iff that version_uri is in the gold set. This is where the
               temporal trap bites: citing the CURRENT version of an amended
               section is a miss, because the gold is the decision-date version.
Scores     : P/R/F1 per sub-question (all 0 when nothing usable is cited),
             averaged within case, within domain, macro over domains, plus the
             plain per-sub-question micro means for reference.
Skipped    : sub-questions with no in-corpus load-bearing gold (rubric-only).
Reported separately (never part of P/R): hallucinated citations (law not in
the corpus catalog, or the law has no such section) and undecidable citations
(no corpus version covers the decision date) - both dropped from the pred set.

Documented approximations vs the official harness:
- identifier mode cannot discriminate two corpus versions that share one
  law+label (our doc headers carry no version id); a hit counts on the pair.
- "citations the corpus cannot decide" are approximated by the version-gap
  rule above; amending acts/ministerial regulations named in the rules land
  in the hallucination bucket here because they are outside the law catalog.
'''

import json
import os
import re

from rapidfuzz import fuzz, process

from models.evaluators.niti_rubric import parse_loose_json

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
GOLD_SECTIONS = os.path.join(REPO_ROOT, 'datasets', 'nitibench_plus_raw',
                             'gold_sections.jsonl')

THAI_DIGITS = str.maketrans('๐๑๒๓๔๕๖๗๘๙', '0123456789')
FUZZY_LAW_CUTOFF = 85   # rapidfuzz WRatio threshold (official rules)


def normalize_law_name(s):
    """Whitespace-collapsed law name; catalog keys are built the same way."""
    if not s:
        return ''
    return re.sub(r'\s+', ' ', str(s)).strip()


def normalize_label(s):
    """Section label core: Thai digits -> Arabic, sub-paragraph markers removed
    ("มาตรา 372 วรรคสอง" / "มาตรา 372(1)" -> "มาตรา 372"), prefix normalized
    ("ม.372" / "มาตราที่ 372" -> "มาตรา 372")."""
    if not s:
        return ''
    s = str(s).translate(THAI_DIGITS)
    s = re.split(r'\s*(?:วรรค|อนุมาตรา|หมวด|\()', s, maxsplit=1)[0]
    s = re.sub(r'^(มาตราที่|มาตรา|ม\.|ข้อที่|ข้อ)\s*', '', s).strip()
    return re.sub(r'\s+', ' ', s)


def load_corpus_index(path=None):
    """Build the matching index over gold_sections.jsonl.

    Returns:
      by_uri    : version_uri -> section dict
      by_key    : (norm_law, norm_label) -> [version dicts]  (identifier mode)
      norm2law  : norm law -> canonical law_name_th          (fuzzy mode)
    """
    path = path or GOLD_SECTIONS
    if not os.path.exists(path):
        raise FileNotFoundError(
            f'gold_sections not found: {path} (expected datasets/nitibench_plus_raw/)')
    by_uri, by_key, norm2law = {}, {}, {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            s = json.loads(line)
            by_uri[s['version_uri']] = s
            key = (normalize_law_name(s['law_name_th']), normalize_label(s['label']))
            by_key.setdefault(key, []).append(s)
            norm2law.setdefault(normalize_law_name(s['law_name_th']), s['law_name_th'])
    return by_uri, by_key, norm2law


def resolve_version_in_force(versions, decision_date):
    """Pick the version whose [valid_from, valid_to] covers the decision date.

    Returns the version dict or None when no corpus version covers the date
    (undecidable: the pred is left out of scoring, counted separately).
    Date strings are YYYY-MM-DD so lexicographic comparison is calendar order.
    """
    if not decision_date:
        return max(versions, key=lambda v: v.get('valid_from') or '')
    for v in versions:
        if (v.get('valid_from') or '') <= decision_date <= (v.get('valid_to') or ''):
            return v
    return None


def _pref(precision_denominator, hits):
    return hits / precision_denominator if precision_denominator else 0.0


def _f1(p, r):
    return 2 * p * r / (p + r) if (p + r) else 0.0


def score_case_predictions(sq_records, by_uri, by_key, norm2law, mode):
    """Score the parsed citations of one list of sub-question records.

    sq_records: [{'q_id','case_id','domain','decision_date','parsed','gold'}]
      parsed : the model answer dict (or None when unparseable)
      gold   : the sidecar gold record
    mode     : 'identifier' | 'fuzzy'
    Returns (per_qid, aggregates).
    """
    per_qid = {}
    for rec in sq_records:
        gold = rec['gold']
        gold_cites = [g for g in gold.get('gold_citations', []) if g.get('in_corpus')]
        if not gold_cites:
            per_qid[rec['q_id']] = {'note': 'rubric_only'}
            continue
        gold_uris = {g['version_uri'] for g in gold_cites}
        gold_keys = {(normalize_law_name(g.get('law_name_th')),
                      normalize_label(g.get('label'))) for g in gold_cites}
        background_keys = {(normalize_law_name(b.get('law_name_th')),
                            normalize_label(b.get('label')))
                           for b in gold.get('background_citations', [])}

        parsed = rec.get('parsed')
        raw_cites = parsed.get('citations') if isinstance(parsed, dict) else None
        unparseable = not isinstance(parsed, dict)
        if not isinstance(raw_cites, list):
            raw_cites = []

        hits_uri, hits_key = set(), set()
        n_fp, n_hallucinated, n_undecidable, n_dropped_bg = 0, 0, 0, 0
        seen_preds = set()

        for cit in raw_cites:
            if not isinstance(cit, dict):
                continue
            law_n = normalize_law_name(cit.get('law_name') or cit.get('law_name_th'))
            label_n = normalize_label(cit.get('section') or cit.get('label'))
            if not law_n or not label_n:
                continue
            if (law_n, label_n) in seen_preds:
                continue  # identical citation repeated: count once
            seen_preds.add((law_n, label_n))
            # background citations of this sub-question are stripped first:
            # neither hit nor false positive (official rules)
            if (law_n, label_n) in background_keys:
                n_dropped_bg += 1
                continue

            if mode == 'identifier':
                key = (law_n, label_n)
                if key not in by_key:
                    n_hallucinated += 1
                    continue
                if key in gold_keys and key not in hits_key:
                    hits_key.add(key)
                else:
                    n_fp += 1
            else:  # fuzzy / parametric
                match = process.extractOne(
                    law_n, list(norm2law.keys()), scorer=fuzz.WRatio,
                    score_cutoff=FUZZY_LAW_CUTOFF)
                if match is None:
                    n_hallucinated += 1      # law not in the corpus catalog
                    continue
                key = (match[0], label_n)
                versions = by_key.get(key)
                if not versions:
                    n_hallucinated += 1      # the law has no such section
                    continue
                resolved = resolve_version_in_force(versions, rec['decision_date'])
                if resolved is None:
                    n_undecidable += 1       # corpus cannot decide: left out
                    continue
                uri = resolved['version_uri']
                if uri in gold_uris and uri not in hits_uri:
                    hits_uri.add(uri)
                else:
                    n_fp += 1

        tp = len(hits_key) if mode == 'identifier' else len(hits_uri)
        n_gold = len(gold_keys) if mode == 'identifier' else len(gold_uris)
        fn = n_gold - tp
        if tp == 0 and n_fp == 0:
            p = r = f1 = 0.0     # nothing usable cited (official: all zero)
        else:
            p = _pref(tp + n_fp, tp)
            r = tp / n_gold if n_gold else 0.0
            f1 = _f1(p, r)
        per_qid[rec['q_id']] = {
            'case_id': rec['case_id'], 'domain': gold.get('domain'),
            'precision': p, 'recall': r, 'f1': f1,
            'tp': tp, 'fp': n_fp, 'fn': fn,
            'n_hallucinated': n_hallucinated,
            'n_undecidable': n_undecidable,
            'n_dropped_background': n_dropped_bg,
            'n_gold': n_gold,
            'note': ('unparseable_answer' if unparseable else ''),
        }

    scored = [v for v in per_qid.values() if 'f1' in v]
    aggregates = _roll_up(scored)
    aggregates['n_scored'] = len(scored)
    aggregates['n_rubric_only'] = len(per_qid) - len(scored)
    aggregates['n_hallucinated'] = sum(v['n_hallucinated'] for v in scored)
    aggregates['n_undecidable'] = sum(v['n_undecidable'] for v in scored)
    aggregates['n_dropped_background'] = sum(v['n_dropped_background'] for v in scored)
    aggregates['n_unparseable'] = sum(1 for v in scored
                                      if v['note'] == 'unparseable_answer')
    aggregates['mode'] = mode
    return per_qid, aggregates


def _roll_up(scored):
    """sub-question -> case -> domain -> macro over domains, plus micro means."""
    if not scored:
        return {'n_domains': 0,
                'micro': {'precision': 0.0, 'recall': 0.0, 'f1': 0.0},
                'macro': {'precision': 0.0, 'recall': 0.0, 'f1': 0.0}}
    micro = {m: sum(v[m] for v in scored) / len(scored)
             for m in ('precision', 'recall', 'f1')}
    case_scores, case_domain = {}, {}
    for v in scored:
        case_scores.setdefault(v['case_id'], []).append(v)
        case_domain[v['case_id']] = v['domain']
    domain_means = {}
    for case_id, vs in case_scores.items():
        case_mean = {m: sum(v[m] for v in vs) / len(vs)
                     for m in ('precision', 'recall', 'f1')}
        domain_means.setdefault(case_domain[case_id], []).append(case_mean)
    macro = {}
    for m in ('precision', 'recall', 'f1'):
        dm = [sum(cm[m] for cm in cms) / len(cms)
              for cms in domain_means.values()]
        macro[m] = sum(dm) / len(dm)
    return {'n_domains': len(domain_means), 'micro': micro, 'macro': macro}
