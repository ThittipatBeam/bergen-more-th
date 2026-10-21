"use client";

import { useMemo, useState } from "react";
import type {
  BenchmarkRow,
  ColumnVisibility,
  RerankerFilter,
  SortDirection,
  SortKey,
} from "@/types/benchmark";
import { BenchmarkTableHeader } from "@/components/sections/BenchmarkTableHeader";
import { BenchmarkTableRow } from "@/components/sections/BenchmarkTableRow";
import { BenchmarkTableToolbar } from "@/components/sections/BenchmarkTableToolbar";
import { BenchmarkNextRunRow } from "@/components/sections/BenchmarkNextRunRow";

const DEFAULT_COLUMNS: ColumnVisibility = {
  retriever: true,
  reranker: true,
  judgePct: true,
  mTh: true,
  f1Th: true,
  precisionTh: true,
  recallTh: true,
  em: false,
  latency: false,
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
      } else if (sortKey === "precisionTh") {
        aVal = a.precisionTh;
        bVal = b.precisionTh;
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
      {/* Toolbar & Filters */}
      <BenchmarkTableToolbar
        generators={generators}
        generator={generator}
        onGeneratorChange={setGenerator}
        reranker={reranker}
        onRerankerChange={setReranker}
        columns={columns}
        onColumnsChange={setColumns}
        resultsCount={processedRows.length}
      />

      {/* Measured Sheet Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs transition-colors">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <caption className="sr-only">
            Leaderboard of evaluated Thai RAG pipeline combinations, ranked by
            LLM judge score. Column headers are sortable buttons.
          </caption>
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
            <BenchmarkNextRunRow columns={columns} />
          </tbody>
        </table>

        {processedRows.length === 0 && (
          <div className="py-12 text-center font-mono">
            <p className="text-xs text-[var(--text-muted)]">
              No benchmark runs match the current filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setGenerator("all");
                setReranker("all");
              }}
              className="mt-3 min-h-[44px] px-4 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-[var(--brand-text)] hover:border-[var(--border-focus)] transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
