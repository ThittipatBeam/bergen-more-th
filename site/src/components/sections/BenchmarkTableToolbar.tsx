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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#E3DCD1] dark:border-[#2E2A24] bg-[#FAF7F2] dark:bg-[#1C1A17]">
      <div className="flex flex-wrap items-center gap-2">
        {/* Generator Model Filter */}
        <select
          value={generator}
          onChange={(e) => onGeneratorChange(e.target.value)}
          aria-label="Filter by model"
          className="min-h-[44px] px-3 rounded-lg border border-[#E3DCD1] dark:border-[#332E27] bg-white dark:bg-[#23201C] text-xs font-mono text-[var(--text-primary)] cursor-pointer focus:outline-none"
        >
          <option value="all">All Models ({generators.length})</option>
          {generators.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Reranker Segmented Filter */}
        <div className="inline-flex items-center rounded-lg border border-[#E3DCD1] dark:border-[#332E27] bg-[#F1ECE1] dark:bg-[#23201C] p-0.5">
          {RERANKER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onRerankerChange(opt.id)}
              className={`min-h-[38px] px-3 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                reranker === opt.id
                  ? "bg-white dark:bg-[#1E1C18] text-[var(--text-primary)] shadow-2xs font-bold"
                  : "text-[#736B5E] dark:text-[#A89E90] hover:text-[var(--text-primary)]"
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
          {resultsCount} runs
        </span>
        <BenchmarkColumnFilter columns={columns} onChange={onColumnsChange} />
      </div>
    </div>
  );
}
