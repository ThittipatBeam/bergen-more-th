"use client";

import type { ColumnVisibility, MetricColumnKey } from "@/types/benchmark";
import {
  ColumnFilter,
  type ColumnFilterOption,
} from "@/components/ui/ColumnFilter";

const COLUMN_OPTIONS: readonly ColumnFilterOption<MetricColumnKey>[] = [
  { key: "q", labelEn: "Overall Score", labelTh: "Overall Score", category: "metric" },
  { key: "judgePct", labelEn: "Judge Score (%)", labelTh: "คะแนน Judge (%)", category: "metric" },
  { key: "mTh", labelEn: "Thai M-Score (M_th)", labelTh: "Thai M-Score (M_th)", category: "metric" },
  { key: "f1Th", labelEn: "Thai F1-Score (F1_th)", labelTh: "Thai F1-Score (F1_th)", category: "metric" },
  { key: "precisionTh", labelEn: "Thai Precision (Precision_th)", labelTh: "Thai Precision (Precision_th)", category: "metric" },
  { key: "recallTh", labelEn: "Thai Recall (Recall_th)", labelTh: "Thai Recall (Recall_th)", category: "metric" },
  { key: "em", labelEn: "Exact Match (EM)", labelTh: "Exact Match (EM)", category: "metric" },
  { key: "latency", labelEn: "Generation Time (min:sec)", labelTh: "เวลาสร้างคำตอบ (นาที:วินาที)", category: "metric" },
  { key: "retriever", labelEn: "Embedding (Retriever)", labelTh: "โมเดล Embedding", category: "pipeline" },
  { key: "reranker", labelEn: "Reranker Model", labelTh: "โมเดล Reranker", category: "pipeline" },
];

export function BenchmarkColumnFilter({
  columns,
  onChange,
}: {
  columns: ColumnVisibility;
  onChange: (columns: ColumnVisibility) => void;
}) {
  return (
    <ColumnFilter
      columns={columns}
      options={COLUMN_OPTIONS}
      onChange={onChange}
      footerEn={["Overall = Judge 80% + Match TH 20%", "Other metrics never move the rank."]}
      footerTh={["Overall = Judge 80% + Match TH 20%", "metric อื่นไม่เปลี่ยนอันดับ"]}
    />
  );
}
