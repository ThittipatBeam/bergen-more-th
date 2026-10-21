"use client";

import type {
  ColumnVisibility,
  SortDirection,
  SortKey,
} from "@/types/benchmark";

interface BenchmarkTableHeaderProps {
  columns: ColumnVisibility;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

export function BenchmarkTableHeader({
  columns,
  sortKey,
  sortDirection,
  onSort,
}: BenchmarkTableHeaderProps) {
  const renderIndicator = (key: SortKey) => {
    if (sortKey === key) {
      return (
        <span className="ml-1 text-[#0795CF] font-bold">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      );
    }
    return (
      <span className="ml-1 text-[var(--text-muted)] opacity-35 group-hover:opacity-100 transition-opacity">
        ↕
      </span>
    );
  };

  const sortBtn = (key: SortKey, label: string, align: "left" | "right" | "center") => (
    <button
      type="button"
      onClick={() => onSort(key)}
      className={`group cursor-pointer uppercase inline-flex items-center gap-0.5 text-inherit hover:text-[var(--text-primary)] transition-colors ${
        align === "right" ? "ml-auto" : align === "center" ? "mx-auto" : ""
      }`}
    >
      <span>{label}</span>
      {renderIndicator(key)}
    </button>
  );

  return (
    <thead>
      <tr className="bg-[var(--background-subtle)] border-b border-[var(--border-default)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] transition-colors select-none">
        <th className="py-3.5 px-3 w-12 text-center">
          {sortBtn("rank", "#", "center")}
        </th>

        <th className="py-3.5 px-4 text-left">MODEL</th>

        {columns.retriever && (
          <th className="py-3.5 px-4 text-left">
            {sortBtn("retriever", "EMBEDDING", "left")}
          </th>
        )}

        {columns.reranker && (
          <th className="py-3.5 px-4 text-left">
            {sortBtn("reranker", "RERANKER", "left")}
          </th>
        )}

        {columns.judgePct && (
          <th className="py-3.5 px-4 text-right bg-[#0795CF]/10 dark:bg-[#0795CF]/20 text-[#0795CF] dark:text-[#73B7DC]">
            {sortBtn("judgePct", "JUDGE SCORE", "right")}
          </th>
        )}

        {columns.mTh && (
          <th className="py-3.5 px-3 text-center">
            {sortBtn("mTh", "M_TH", "center")}
          </th>
        )}

        {columns.f1Th && (
          <th className="py-3.5 px-3 text-center">
            {sortBtn("f1Th", "F1_TH", "center")}
          </th>
        )}

        {columns.precisionTh && (
          <th className="py-3.5 px-3 text-center">
            {sortBtn("precisionTh", "PRECISION_TH", "center")}
          </th>
        )}

        {columns.recallTh && (
          <th className="py-3.5 px-3 text-center">
            {sortBtn("recallTh", "RECALL_TH", "center")}
          </th>
        )}

        {columns.em && (
          <th className="py-3.5 px-3 text-center">
            {sortBtn("em", "EM", "center")}
          </th>
        )}

        {columns.latency && (
          <th className="py-3.5 px-4 text-right">
            {sortBtn("latency", "LATENCY", "right")}
          </th>
        )}
      </tr>
    </thead>
  );
}
