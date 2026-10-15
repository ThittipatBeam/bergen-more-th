#!/usr/bin/env python3
"""
Scan experiments/ directory, extract run metadata + metrics into a JSON index.

Output: experiments_data.json at repo root.
Fields: dataset, models (retriever/reranker/generator/judge), all metrics,
judge stats, generation time. Later consumed by the front-end site.

Usage:
    python scripts/scan_experiments.py [--output experiments_data.json]
"""

import json
import re
from datetime import datetime
from pathlib import Path

import tyro
import yaml
from tqdm import tqdm

# Matches "eval_dev_judge_<modelname>[_500][_seed42]_partial.jsonl"
JUDGE_FILE_PATTERN = re.compile(r"eval_(.+?)_judge_(.+?)(_partial\.jsonl)?$")


def find_judge_files(exp_dir: Path, split: str = "dev") -> dict:
    """Extract judge model name from checkpoint filename; returns per-judge info."""
    judge_files = list(exp_dir.glob(f"eval_{split}_judge_*_partial.jsonl"))
    judges = {}
    for f in judge_files:
        m = JUDGE_FILE_PATTERN.match(f.name)
        if m:
            split_name, judge_model = m.groups()
            judges[judge_model] = {"checkpoint_file": str(f)}
    return judges


def load_metrics(exp_dir: Path, split: str = "dev") -> dict:
    """Load all metrics json files for a split."""
    metrics = {}
    candidates = [
        ("metrics", f"eval_{split}_metrics.json"),
        ("metrics_scorable771", f"eval_{split}_metrics_scorable771.json"),
        ("judge_cost", f"eval_{split}_cost_LLMeval_judge_out.json"),
        ("ranking_metrics", f"eval_{split}_ranking_metrics.json"),
        ("reranking_metrics", f"eval_{split}_reranking_metrics.json"),
        ("generation_time", f"eval_{split}_generation_time.json"),
        ("generation_cost", f"eval_{split}_generation_cost.json"),
    ]
    for key, fname in candidates:
        f = exp_dir / fname
        if f.exists():
            try:
                metrics[key] = json.loads(f.read_text())
            except Exception as e:
                metrics[key] = {"_error": str(e)}
    return metrics


def load_config(exp_dir: Path) -> dict:
    """Load bergen experiment config.yaml."""
    config_file = exp_dir / "config.yaml"
    if not config_file.exists():
        return {}
    try:
        return yaml.safe_load(config_file.read_text())
    except Exception:
        return {}


def get_model_info(cfg: dict, component: str) -> dict:
    """Extract model_name, provider, batch_size from config component."""
    comp = cfg.get(component, {}) or {}
    init_args = comp.get("init_args", {}) or {}
    return {
        "model_name": init_args.get("model_name"),
        "provider": init_args.get("provider") or init_args.get("class"),
        "batch_size": comp.get("batch_size"),
    }


def get_dataset_info(cfg: dict, split: str = "dev") -> dict:
    """Extract dataset name/type from config."""
    dset = cfg.get("dataset", {}) or {}
    split_cfg = dset.get(split, {}) or {}

    def get_target(section_name):
        sec = split_cfg.get(section_name, {}) or {}
        init_args = sec.get("init_args", {}) or {}
        return {
            "target": init_args.get("_target_"),
            "split": init_args.get("split"),
            "lang": init_args.get("lang"),
            "sources": init_args.get("sources"),
            "num_words": init_args.get("num_words"),
        }

    return {
        "doc": get_target("doc"),
        "query": get_target("query"),
    }


def extract_run_date(exp_dir: Path) -> str:
    """Use config.yaml mtime as proxy for run date."""
    config_file = exp_dir / "config.yaml"
    if config_file.exists():
        ts = config_file.stat().st_mtime
        return datetime.fromtimestamp(ts).isoformat()
    return ""


def scan_experiment(exp_dir: Path, split: str = "dev") -> dict:
    """Build one experiment record."""
    exp_id = exp_dir.name
    cfg = load_config(exp_dir)
    metrics = load_metrics(exp_dir, split)
    judge_files = find_judge_files(exp_dir, split)

    record = {
        "experiment_id": exp_id,
        "run_date": extract_run_date(exp_dir),

        "dataset": get_dataset_info(cfg, split),
        "retriever": get_model_info(cfg, "retriever"),
        "reranker": get_model_info(cfg, "reranker"),
        "generator": get_model_info(cfg, "generator"),
        "judge_candidates": list(judge_files.keys()),

        "retrieval": {
            "retrieve_top_k": cfg.get("retrieve_top_k"),
            "rerank_top_k": cfg.get("rerank_top_k"),
            "generation_top_k": cfg.get("generation_top_k"),
        },

        "metrics": metrics.get("metrics", {}),
        "metrics_scorable771": metrics.get("metrics_scorable771"),
        "ranking_metrics": metrics.get("ranking_metrics", {}),
        "reranking_metrics": metrics.get("reranking_metrics", {}),
        "judge_cost": metrics.get("judge_cost"),
        "generation_time": metrics.get("generation_time", {}).get("Generation time"),
        "generation_cost": metrics.get("generation_cost"),
    }

    # Judge info: from metrics (if metrics.json has judge keys) or judge files
    judge_metrics = {}
    for key, val in metrics.get("metrics", {}).items():
        if "judge" in key.lower():
            judge_metrics[key] = val
    if judge_metrics:
        record["judge_metrics"] = judge_metrics
    if judge_files:
        record["judge_files"] = judge_files

    # File paths for linking in the frontend
    record["file_paths"] = {
        "eval_out": str(exp_dir / "eval_dev_out.json") if (exp_dir / f"eval_{split}_out.json").exists() else None,
        "config_yaml": str(exp_dir / "config.yaml"),
        "input_retrieval_run": str(exp_dir / cfg.get("runs_folder", "runs/")),
    }

    return record


def main(output: str = "experiments_data.json", split: str = "dev"):
    exp_root = Path("experiments")
    if not exp_root.exists():
        raise SystemExit(f"experiments/ directory not found")

    experiments = []
    subdirs = [d for d in exp_root.iterdir() if d.is_dir()]

    print(f"Scanning {len(subdirs)} experiments...")
    for d in tqdm(sorted(subdirs)):
        try:
            rec = scan_experiment(d, split)
            experiments.append(rec)
        except Exception as e:
            print(f"⚠️ Error scanning {d.name}: {e}")
            experiments.append({"experiment_id": d.name, "_scan_error": str(e)})

    output_path = Path(output)
    output_path.write_text(json.dumps(experiments, indent=2, ensure_ascii=False))
    print(f"✓ Wrote {len(experiments)} experiments to {output_path}")


if __name__ == "__main__":
    tyro.cli(main)
