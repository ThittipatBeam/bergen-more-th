#!/usr/bin/env python3
"""
Verify generated QA triples using a separate LLM judge.

Reads ok:true candidates from generate.py, asks judge model whether the
answer correctly and completely answers the question given the article
context. Output appends judge_verdict + judge_ok per record.

Resumable: re-running skips candidates whose (article_id, question) pair
already has a verdict in the output file.

Usage:
  python th_data_gen/scripts/verify.py [--config-path th_data_gen/config.verify.yaml]
"""

import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import pandas as pd
import yaml
import tyro
from openai import OpenAI
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env")


PROMPT = """You are evaluating a Thai question-answering pair.

ARTICLE (Thai):
{article}

QUESTION (Thai): {question}
ANSWER (Thai): {answer}

Task: Does the ANSWER correctly and completely answer the QUESTION, based ONLY on the ARTICLE?
- The answer must be factually supported by the article.
- The answer must be complete for what the question asks.
- The answer must not contain information absent from the article.

Reply with ONLY one word: YES or NO"""


@dataclass
class Config:
    model: dict
    input: dict
    output: dict


def main(config_path: str = "th_data_gen/config.verify.yaml"):
    with open(config_path) as f:
        cfg = Config(**yaml.safe_load(f))

    # --- Load source articles for context lookup ---
    parquets = sorted(Path("th_data_gen/source").glob("train-*.parquet"))
    if not parquets:
        raise SystemExit("No parquets in th_data_gen/source/")
    df = pd.concat([pd.read_parquet(p) for p in parquets], ignore_index=True)
    articles = df.set_index("id")["text"].to_dict()
    print(f"[load] {len(articles):,} articles for context")

    # --- Load candidates (ok:true only) ---
    candidates = []
    with open(cfg.input["file"]) as f:
        for line in f:
            r = json.loads(line)
            if r.get("ok"):
                candidates.append(r)
    print(f"[load] {len(candidates):,} valid candidates")

    # --- Resume: skip already-judged (article_id + question) pairs ---
    out_file = Path(cfg.output["dir"]) / cfg.output["filename"]
    out_file.parent.mkdir(parents=True, exist_ok=True)
    seen = set()
    if out_file.exists():
        with open(out_file) as f:
            for line in f:
                r = json.loads(line)
                seen.add((r["article_id"], r["question"]))
    to_judge = [c for c in candidates if (c["article_id"], c["question"]) not in seen]
    print(f"[resume] {len(seen):,} already judged, {len(to_judge):,} to judge")

    if not to_judge:
        print("[done] nothing new to verify")
        return

    client = OpenAI()

    def verify_one(cand: dict) -> dict:
        article = articles.get(cand["article_id"], "")
        if not article:
            return {**cand, "judge_verdict": "ERROR:no_article", "judge_ok": False}
        try:
            resp = client.chat.completions.create(
                model=cfg.model["name"],
                max_tokens=cfg.model["max_tokens"],
                temperature=cfg.model["temperature"],
                messages=[{
                    "role": "user",
                    "content": PROMPT.format(
                        article=article,
                        question=cand["question"],
                        answer=cand["answer"],
                    ),
                }],
            )
            verdict = resp.choices[0].message.content.strip().upper()
            ok = verdict.startswith("YES")
            return {**cand, "judge_verdict": verdict, "judge_ok": ok}
        except Exception as e:
            return {**cand, "judge_verdict": f"ERROR:{e}", "judge_ok": False}

    yes = no = errors = 0
    with open(out_file, "a") as fout:
        with ThreadPoolExecutor(max_workers=cfg.model["concurrency_"]) as ex:
            futures = {ex.submit(verify_one, c): i for i, c in enumerate(to_judge)}
            for fut in tqdm(as_completed(futures), total=len(futures), desc="verify"):
                result = fut.result()
                fout.write(json.dumps(result, ensure_ascii=False) + "\n")
                fout.flush()
                if result["judge_ok"]:
                    yes += 1
                elif result["judge_verdict"].startswith("ERROR"):
                    errors += 1
                else:
                    no += 1

    total = yes + no + errors
    print(f"[done] YES={yes} ({yes/total*100:.1f}%)  NO={no} ({no/total*100:.1f}%)  ERRORS={errors}")
    print(f"[done] wrote {total:,} records to {out_file}")


if __name__ == "__main__":
    tyro.cli(main)
