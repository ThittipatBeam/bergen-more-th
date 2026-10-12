"""FastAPI backend for inspecting eval_dev_out.json results."""

import json
import math
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

DEFAULT_FILE = Path(__file__).parent / "experiments" / "47e629172cfb2942" / "eval_dev_out.json"

app = FastAPI(title="RAG Eval Inspector")

# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------
_data: list[dict] | None = None
_data_file: Path | None = None

METRIC_KEYS = [
    "M", "EM", "F1", "Precision", "Recall", "Recall_char3gram",
    "Rouge-1", "Rouge-2", "Rouge-L", "M_th", "F1_th", "Precision_th", "Recall_th",
]

NUM_BUCKETS = 10


QRELS_FILE = Path(__file__).parent / "qrels" / "qrel.mkqa_th.dev.json"


def load_data(path: Path = DEFAULT_FILE) -> list[dict]:
    global _data, _data_file
    if _data is not None and _data_file == path:
        return _data
    with open(path) as f:
        _data = json.load(f)
    with open(QRELS_FILE) as f:
        qrels = json.load(f)
    for e in _data:
        e["has_ground_truth"] = e.get("q_id") in qrels
    _data_file = path
    return _data


def _get_records() -> list[dict]:
    return load_data()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class Record(BaseModel):
    idx: int
    q_id: str
    question: str
    response: str
    label: list[str]
    has_ground_truth: bool
    ranking_label: Optional[str]
    metrics: dict[str, float]
    system_prompt: str
    user_prompt: str


class PagedResult(BaseModel):
    total: int
    page: int
    per_page: int
    records: list[Record]


class StatsResult(BaseModel):
    count: int
    scorable_count: int
    overall: dict[str, float]
    overall_scorable: dict[str, float]
    histograms: dict[str, list[dict]]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _extract_record(idx: int, e: dict) -> Record:
    sys_prompt, user_prompt = "", ""
    for msg in e.get("instruction", []):
        if msg["role"] == "system":
            sys_prompt = msg["content"]
        elif msg["role"] == "user":
            user_prompt = msg["content"]
    metrics = {k: e.get(k, 0.0) for k in METRIC_KEYS}
    return Record(
        idx=idx,
        q_id=e.get("q_id", ""),
        question=e.get("question", ""),
        response=e.get("response", ""),
        label=e.get("label", []),
        has_ground_truth=e.get("has_ground_truth", False),
        ranking_label=e.get("ranking_label"),
        metrics=metrics,
        system_prompt=sys_prompt,
        user_prompt=user_prompt,
    )


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------
@app.get("/api/records", response_model=PagedResult)
def list_records(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("idx"),
    sort_desc: bool = Query(False),
    min_m: Optional[float] = Query(None),
    max_m: Optional[float] = Query(None),
    min_recall_th: Optional[float] = Query(None),
    max_recall_th: Optional[float] = Query(None),
    has_label: Optional[bool] = Query(None),
    has_ground_truth: Optional[bool] = Query(None),
):
    data = _get_records()

    filtered = []
    search_lower = search.lower() if search else None
    for i, e in enumerate(data):
        if has_ground_truth is not None and e.get("has_ground_truth", False) != has_ground_truth:
            continue
        if search_lower:
            if not any(
                search_lower in s
                for s in (
                    e.get("question", "").lower(),
                    e.get("response", "").lower(),
                    " ".join(e.get("label", [])).lower(),
                )
            ):
                continue
        if min_m is not None and e.get("M", 0) < min_m:
            continue
        if max_m is not None and e.get("M", 0) > max_m:
            continue
        if min_recall_th is not None and e.get("Recall_th", 0) < min_recall_th:
            continue
        if max_recall_th is not None and e.get("Recall_th", 0) > max_recall_th:
            continue
        if has_label is True and not e.get("label"):
            continue
        if has_label is False and e.get("label"):
            continue
        filtered.append((i, e))

    # Sort
    sort_key = sort_by if sort_by != "idx" else None
    if sort_key:
        if sort_key in METRIC_KEYS:
            filtered.sort(key=lambda t: t[1].get(sort_key, 0), reverse=sort_desc)
        elif sort_key == "question":
            filtered.sort(key=lambda t: t[1].get("question", ""), reverse=sort_desc)
        elif sort_key == "q_id":
            filtered.sort(key=lambda t: t[1].get("q_id", ""), reverse=sort_desc)

    total = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page

    return PagedResult(
        total=total,
        page=page,
        per_page=per_page,
        records=[_extract_record(i, e) for i, e in filtered[start:end]],
    )


@app.get("/api/stats", response_model=StatsResult)
def stats():
    data = _get_records()
    scorable = [e for e in data if e.get("has_ground_truth")]

    overall = {}
    overall_scorable = {}
    histograms = {}

    for key in METRIC_KEYS:
        vals = [e.get(key, 0.0) for e in data]
        overall[key] = sum(vals) / len(vals) if vals else 0.0
        svals = [e.get(key, 0.0) for e in scorable]
        overall_scorable[key] = sum(svals) / len(svals) if svals else 0.0

        # Histogram
        mn, mx = min(vals), max(vals)
        if mx == mn:
            buckets = [{"range": f"{mn:.4f}", "count": len(vals), "range_start": mn, "range_end": mx}]
        else:
            width = (mx - mn) / NUM_BUCKETS
            bucket_counts = [0] * NUM_BUCKETS
            for v in vals:
                idx = min(int((v - mn) / width), NUM_BUCKETS - 1)
                bucket_counts[idx] += 1
            buckets = [
                {
                    "range": f"{mn + i * width:.2f}–{mn + (i + 1) * width:.2f}",
                    "count": c,
                    "range_start": round(mn + i * width, 4),
                    "range_end": round(mn + (i + 1) * width, 4),
                }
                for i, c in enumerate(bucket_counts)
            ]
        histograms[key] = buckets

    return StatsResult(
        count=len(data),
        scorable_count=len(scorable),
        overall=overall,
        overall_scorable=overall_scorable,
        histograms=histograms,
    )


# ---------------------------------------------------------------------------
# Frontend
# ---------------------------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
def index():
    html_path = Path(__file__).parent / "inspect_ui.html"
    return HTMLResponse(html_path.read_text())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8400)
