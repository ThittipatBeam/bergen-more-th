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
  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return (
        <span className="opacity-0 group-hover:opacity-60 transition-opacity ml-1">
          ↕
        </span>
      );
    }
    return (
      <span className="ml-1 text-[#0795CF]">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const sortButton = (key: SortKey, label: string, align: "left" | "right") => (
    <button
      type="button"
      onClick={() => onSort(key)}
      className={`group cursor-pointer uppercase inline-flex items-center gap-0.5 text-inherit hover:text-[var(--text-primary)] transition-colors ${
        align === "right" ? "ml-auto" : ""
      }`}
    >
      <span>{label}</span>
      {renderSortIndicator(key)}
    </button>
  );

  return (
    <thead>
      <tr className="bg-[var(--background-subtle)] border-b border-[var(--border-default)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] transition-colors">
        <th className="py-3.5 px-4 w-14">
          {sortButton("rank", "#", "left")}
        </th>

        <th className="py-3.5 px-4">Generator</th>

        {columns.retriever && <th className="py-3.5 px-4">Embedding</th>}

        {columns.reranker && <th className="py-3.5 px-4">Reranker</th>}

        {columns.judgePct && (
          <th className="py-3.5 px-4 text-right">
            {sortButton("judgePct", "Judge Score", "right")}
          </th>
        )}

        {columns.mTh && (
          <th className="py-3.5 px-3 text-right">
            {sortButton("mTh", "M (TH)", "right")}
          </th>
        )}

        {columns.em && (
          <th className="py-3.5 px-3 text-right">
            {sortButton("em", "EM", "right")}
          </th>
        )}

        {columns.f1Th && (
          <th className="py-3.5 px-3 text-right">
            {sortButton("f1Th", "F1 (TH)", "right")}
          </th>
        )}

        {columns.recallTh && (
          <th className="py-3.5 px-3 text-right">
            {sortButton("recallTh", "Recall (TH)", "right")}
          </th>
        )}

        {columns.latency && (
          <th className="py-3.5 px-4 text-right">
            {sortButton("latency", "Latency", "right")}
          </th>
        )}
      </tr>
    </thead>
  );
}