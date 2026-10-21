"use client";

import { useMemo, useState } from "react";
import type {
  BenchmarkRow,
  ColumnVisibility,
  RerankerFilter,
  SortDirection,
  SortKey,
} from "@/types/benchmark";
import { BenchmarkColumnFilter } from "@/components/sections/BenchmarkColumnFilter";
import { BenchmarkTableHeader } from "@/components/sections/BenchmarkTableHeader";
import { BenchmarkTableRow } from "@/components/sections/BenchmarkTableRow";
import { MetricsGuide } from "@/components/sections/MetricsGuide";

const DEFAULT_COLUMNS: ColumnVisibility = {
  retriever: true,
  reranker: true,
  judgePct: true,
  mTh: true,
  em: true,
  f1Th: true,
  recallTh: true,
  latency: true,
};

export function BenchmarkTable({ rows }: { rows: BenchmarkRow[] }) {
  const [columns, setColumns] = useState<ColumnVisibility>(DEFAULT_COLUMNS);
  const [generator, setGenerator] = useState("all");
  const [reranker, setReranker] = useState<RerankerFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("judgePct");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const generators = useMemo(
    () => [...new Set(rows.map((r) => r.generator))],
    [rows]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "rank" || key === "latency" ? "asc" : "desc");
    }
  };

  const processedRows = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (generator !== "all" && r.generator !== generator) return false;
      if (reranker === "yes" && !r.reranker) return false;
      if (reranker === "no" && r.reranker) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      let aVal: number | string | null = null;
      let bVal: number | string | null = null;

      if (sortKey === "rank") {
        aVal = a.rank;
        bVal = b.rank;
      } else if (sortKey === "judgePct") {
        aVal = a.judgePct;
        bVal = b.judgePct;
      } else if (sortKey === "mTh") {
        aVal = a.mTh;
        bVal = b.mTh;
      } else if (sortKey === "em") {
        aVal = a.em;
        bVal = b.em;
      } else if (sortKey === "f1Th") {
        aVal = a.f1Th;
        bVal = b.f1Th;
      } else if (sortKey === "recallTh") {
        aVal = a.recallTh;
        bVal = b.recallTh;
      } else if (sortKey === "latency") {
        aVal = a.genSeconds ?? Number.POSITIVE_INFINITY;
        bVal = b.genSeconds ?? Number.POSITIVE_INFINITY;
      } else if (sortKey === "retriever") {
        aVal = a.retriever;
        bVal = b.retriever;
      } else if (sortKey === "reranker") {
        aVal = a.reranker ?? "";
        bVal = b.reranker ?? "";
      }

      if (aVal === bVal) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      let res = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        res = aVal < bVal ? -1 : 1;
      } else {
        res = String(aVal).localeCompare(String(bVal));
      }
      return sortDirection === "asc" ? res : -res;
    });
  }, [rows, generator, reranker, sortKey, sortDirection]);

  return (
    <div className="flex flex-col gap-4">
      {/* Table Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Generator Filter */}
          <select
            value={generator}
            onChange={(e) => setGenerator(e.target.value)}
            aria-label="Filter by generator model"
            className="min-h-[44px] px-3 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-xs font-mono text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[#73B7DC]"
          >
            <option value="all">All Generators ({generators.length})</option>
            {generators.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Reranker Segmented Filter */}
          <div className="inline-flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-0.5">
            {(
              [
                { id: "all", label: "All Runs" },
                { id: "yes", label: "With Reranker" },
                { id: "no", label: "Dense Only" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setReranker(opt.id)}
                className={`min-h-[40px] px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  reranker === opt.id
                    ? "bg-[var(--background-primary)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column Customizer with Filter Icon */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {processedRows.length} runs
          </span>
          <BenchmarkColumnFilter columns={columns} onChange={setColumns} />
        </div>
      </div>

      {/* Responsive Leaderboard Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <BenchmarkTableHeader
            columns={columns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody>
            {processedRows.map((row) => (
              <BenchmarkTableRow key={row.id} row={row} columns={columns} />
            ))}
          </tbody>
        </table>

        {processedRows.length === 0 && (
          <div className="py-12 text-center text-xs font-mono text-[var(--text-muted)]">
            No benchmark runs match the current filters.
          </div>
        )}
      </div>

      {/* Metric Explanations Guide */}
      <MetricsGuide />
    </div>
  );
}
