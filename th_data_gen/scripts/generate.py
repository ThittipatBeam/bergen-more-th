#!/usr/bin/env python3
"""
Generate Thai QA triples from thai-wiki-dataset-v4 articles.

Reads raw parquets from th_data_gen/source/, filters to Thai wiki articles
with sufficient tokens, samples up to max_articles, sends each to the LLM
for question+answer generation, validates answer is in article text, and
writes resumable JSONL output.

Resume: if interrupted, re-run and it skips already-processed articles.

Usage:
  python th_data_gen/scripts/generate.py [--config th_data_gen/config.yaml]
"""

import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import pandas as pd
import yaml
import tyro
from openai import OpenAI
from pythainlp.tokenize import word_tokenize
from tqdm import tqdm
from dotenv import load_dotenv

# Load .env from repo root (OPENAI_BASE_URL, OPENAI_API_KEY)
load_dotenv(Path(__file__).parent.parent.parent / ".env")


PROMPT = """Generate question-answer pairs from the Thai Wikipedia article below.

ARTICLE:
{article_text}

REQUIREMENTS:
- Questions must be factual and specific to the article (who, when, where, what style)
- Answers must be SHORT: a name, date, place, number, or brief phrase (2-10 words)
- Answers must be an EXACT substring of the article text (not paraphrased)
- Return exactly {n_questions} Q/A pairs as JSON array: [{{"question":"...","answer":"..."}}, ...]
- Return ONLY the JSON array, no other text
"""


@dataclass
class Config:
    model: dict
    filter: dict
    article_selection: dict
    generation: dict
    output: dict


def load_articles(min_tokens: int, tokenizer_engine: str, source: str) -> pd.DataFrame:
    """Load and filter articles from source parquets."""
    parquets = sorted(Path("th_data_gen/source").glob("train-*.parquet"))
    if not parquets:
        raise SystemExit("No parquets found in th_data_gen/source/")

    df = pd.concat([pd.read_parquet(p) for p in parquets], ignore_index=True)
    print(f"[load] {len(df):,} total articles from {len(parquets)} parquets")

    df = df[df["source"] == source].copy()
    print(f"[filter source] {len(df):,} after source=='{source}'")

    # Tokenize with pythainlp (slow but accurate for Thai)
    tqdm.pandas(desc="tokenize")
    df["token_count"] = df["text"].progress_apply(
        lambda t: len(
            word_tokenize(t, keep_whitespace=False, engine=tokenizer_engine)
        )
    )
    df = df[df["token_count"] >= min_tokens].copy()
    print(f"[filter tokens] {len(df):,} after >= {min_tokens} tokens")
    return df.reset_index(drop=True)


def main(config_path: str = "th_data_gen/config.yaml"):
    with open(config_path) as f:
        cfg_dict = yaml.safe_load(f)
    cfg = Config(**cfg_dict)

    out_dir = Path(cfg.output["dir"])
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / cfg.output["filename"]

    df = load_articles(
        cfg.filter["min_tokens"],
        cfg.filter["tokenizer_engine"],
        cfg.article_selection["source"],
    )

    # Sample articles
    n = min(cfg.article_selection["max_articles"], len(df))
    df = df.sample(n=n, random_state=cfg.article_selection["random_seed"]).reset_index(
        drop=True
    )
    print(f"[sample] processing {len(df):,} articles")

    # Resume: skip already-processed article_ids
    seen = set()
    if out_file.exists():
        with open(out_file) as f:
            for line in f:
                seen.add(json.loads(line)["article_id"])
    print(f"[resume] skipping {len(seen):,} already-processed articles")

    client = OpenAI()  # uses OPENAI_BASE_URL / OPENAI_API_KEY from env

    def gen_for_row(row: pd.Series) -> list[dict]:
        """Call LLM for one article, return list of records (may contain errors)."""
        article_id = row["id"]
        raw = ""
        try:
            resp = client.chat.completions.create(
                model=cfg.model["name"],
                max_tokens=cfg.model["max_tokens"],
                temperature=cfg.model["temperature"],
                messages=[
                    {
                        "role": "user",
                        "content": PROMPT.format(
                            article_text=row["text"],
                            n_questions=cfg.generation["questions_per_article"],
                        ),
                    }
                ],
            )
            raw = resp.choices[0].message.content.strip()
            raw_clean = raw
            if "```json" in raw:
                raw_clean = raw.split("```json")[1].split("```")[0].strip()
            candidates = json.loads(raw_clean)
        except (json.JSONDecodeError, IndexError, KeyError) as e:
            return [
                {
                    "article_id": article_id,
                    "ok": False,
                    "err": f"json_parse:{e}",
                    "raw": raw,
                }
            ]

        results = []
        for item in candidates:
            # Validate answer is in article text
            if cfg.generation["require_answer_in_text"]:
                if item["answer"] not in row["text"]:
                    results.append(
                        {
                            "article_id": article_id,
                            "ok": False,
                            "err": "answer_not_in_text",
                            "raw": raw,
                        }
                    )
                    continue

            # Check answer length
            ans_tokens = len(
                word_tokenize(
                    item["answer"],
                    keep_whitespace=False,
                    engine=cfg.filter["tokenizer_engine"],
                )
            )
            if ans_tokens < cfg.generation["min_answer_tokens"]:
                results.append(
                    {
                        "article_id": article_id,
                        "ok": False,
                        "err": "answer_too_short",
                        "raw": raw,
                    }
                )
                continue

            results.append(
                {
                    "article_id": article_id,
                    "ok": True,
                    "url": row["url"],
                    "title": row["title"],
                    "question": item["question"],
                    "answer": item["answer"],
                    "answer_tokens": ans_tokens,
                    "article_token_count": int(row["token_count"]),
                }
            )
        return results

    # Filter out already-processed
    to_process = df[~df["id"].isin(seen)].reset_index(drop=True)
    if len(to_process) == 0:
        print("[done] nothing new to process")
        return

    written = 0
    with open(out_file, "a") as fout:
        with ThreadPoolExecutor(max_workers=cfg.model["concurrency_"]) as ex:
            futures = {
                ex.submit(gen_for_row, row): idx
                for idx, row in to_process.iterrows()
            }
            for fut in tqdm(
                as_completed(futures), total=len(futures), desc="generate"
            ):
                idx = futures[fut]
                try:
                    records = fut.result()
                except Exception as e:
                    # Mark as processed so resume skips it; keep the error visible
                    records = [
                        {
                            "article_id": to_process.loc[idx, "id"],
                            "ok": False,
                            "err": f"api:{e}",
                            "raw": "",
                        }
                    ]
                for rec in records:
                    fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    written += 1
                fout.flush()

    print(f"[done] wrote {written} records to {out_file}")


if __name__ == "__main__":
    tyro.cli(main)
