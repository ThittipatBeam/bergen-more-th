#!/usr/bin/env python3
"""
Build final Thai QA dataset from judge-verified candidates.

Reads verified.jsonl (output of verify.py), filters to judge_ok==true,
maps to bergen-compatible schema, saves as parquet + HF dataset directory.

Output schema (bergen-compatible):
  id:            unique question id (str)
  content:       question text (Thai)
  label:         list of answer strings (Thai)
  ranking_label: list containing one [article_id] list (retrieval provenance)

Usage:
  python th_data_gen/scripts/build_dataset.py \
    [--config-path th_data_gen/config.build.yaml]
"""

import json
from pathlib import Path
from dataclasses import dataclass

import pandas as pd
import yaml
import tyro
from datasets import Dataset
from pythainlp.tokenize import word_tokenize


@dataclass
class Config:
    input: dict       # file: verified.jsonl
    output: dict      # parquet_path, dataset_dir
    stats: dict       # print_per_bucket: bool


def main(config_path: str = "th_data_gen/config.build.yaml"):
    with open(config_path) as f:
        cfg = Config(**yaml.safe_load(f))

    in_file = Path(cfg.input["file"])
    if not in_file.exists():
        raise SystemExit(f"verified input not found: {in_file}")

    records = []
    n_total = n_kept = 0
    for line in open(in_file):
        r = json.loads(line)
        n_total += 1
        if not r.get("judge_ok"):
            continue
        n_kept += 1
        records.append({
            "id": f"{r['article_id']}__{n_kept}",           # unique
            "content": r["question"],
            "label": [r["answer"]],
            "ranking_label": [[r["article_id"]]],
        })

    print(f"[build] kept {n_kept:,} of {n_total:,} verified records")

    df = pd.DataFrame(records)

    # Optional: quick stats by Thai answer token length
    if cfg.stats.get("print_per_bucket"):
        df["ans_toks"] = df["label"].apply(
            lambda lab: len(word_tokenize(lab[0], keep_whitespace=False))
        )
        buckets = [(0, 2), (2, 5), (5, 10), (10, 20), (20, 100)]
        for lo, hi in buckets:
            n = ((df.ans_toks >= lo) & (df.ans_toks < hi)).sum()
            print(f"  ans_toks {lo}-{hi}: {n}")

    out_parquet = Path(cfg.output["parquet_path"])
    out_parquet.parent.mkdir(parents=True, exist_ok=True)
    df = df.drop(columns=["ans_toks"], errors="ignore")
    df.to_parquet(out_parquet, index=False)
    print(f"[build] saved parquet {out_parquet} ({out_parquet.stat().st_size/1e6:.2f} MB)")

    out_dir = Path(cfg.output["dataset_dir"])
    out_dir.parent.mkdir(parents=True, exist_ok=True)
    ds = Dataset.from_pandas(df, preserve_index=False)
    ds.save_to_disk(out_dir)
    print(f"[build] saved HF dataset to {out_dir}")


if __name__ == "__main__":
    tyro.cli(main)
