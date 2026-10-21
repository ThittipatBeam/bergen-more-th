"use client";

import type { ColumnVisibility, RerankerFilter } from "@/types/benchmark";
import { BenchmarkColumnFilter } from "@/components/sections/BenchmarkColumnFilter";

interface BenchmarkTableToolbarProps {
  generators: string[];
  generator: string;
  onGeneratorChange: (gen: string) => void;
  reranker: RerankerFilter;
  onRerankerChange: (reranker: RerankerFilter) => void;
  columns: ColumnVisibility;
  onColumnsChange: (cols: ColumnVisibility) => void;
  resultsCount: number;
}

const RERANKER_OPTIONS: Array<{ id: RerankerFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "yes", label: "With Reranker" },
  { id: "no", label: "Dense Only" },
];

export function BenchmarkTableToolbar({
  generators,
  generator,
  onGeneratorChange,
  reranker,
  onRerankerChange,
  columns,
  onColumnsChange,
  resultsCount,
}: BenchmarkTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] transition-colors">
      <div className="flex flex-wrap items-center gap-2">
        {/* Generator Model Filter */}
        <select
          value={generator}
          onChange={(e) => onGeneratorChange(e.target.value)}
          aria-label="Filter by model"
          className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-base font-sans font-medium text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--border-focus)] transition-colors"
        >
          <option value="all">All models</option>
          {generators.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Reranker Segmented Filter */}
        <div
          role="group"
          aria-label="Filter by reranker"
          className="inline-flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-0.5"
        >
          {RERANKER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onRerankerChange(opt.id)}
              aria-pressed={reranker === opt.id}
              className={`min-w-[44px] min-h-[44px] px-3.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                reranker === opt.id
                  ? "bg-[var(--background-primary)] text-[var(--brand-text)] shadow-2xs font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Column Customizer with Filter Icon */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <span className="text-xs font-sans text-[var(--text-muted)]">
          <span className="font-mono font-semibold text-[var(--text-secondary)]">{resultsCount}</span> runs
        </span>
        <BenchmarkColumnFilter columns={columns} onChange={onColumnsChange} />
      </div>
    </div>
  );
}
