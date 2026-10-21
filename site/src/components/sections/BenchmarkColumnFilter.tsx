"use client";

import { useEffect, useRef, useState } from "react";
import type { ColumnVisibility, MetricColumnKey } from "@/types/benchmark";

interface ColumnOption {
  key: MetricColumnKey;
  label: string;
  category: "metric" | "pipeline";
}

const COLUMN_OPTIONS: ColumnOption[] = [
  { key: "judgePct", label: "Judge Score (%)", category: "metric" },
  { key: "mTh", label: "Thai M-Score (M_th)", category: "metric" },
  { key: "f1Th", label: "Thai F1-Score (F1_th)", category: "metric" },
  { key: "precisionTh", label: "Thai Precision (Precision_th)", category: "metric" },
  { key: "recallTh", label: "Thai Recall (Recall_th)", category: "metric" },
  { key: "em", label: "Exact Match (EM)", category: "metric" },
  { key: "latency", label: "Latency (Gen Time)", category: "metric" },
  { key: "retriever", label: "Embedding (Retriever)", category: "pipeline" },
  { key: "reranker", label: "Reranker Model", category: "pipeline" },
];

export function BenchmarkColumnFilter({
  columns,
  onChange,
}: {
  columns: ColumnVisibility;
  onChange: (columns: ColumnVisibility) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const activeCount = Object.values(columns).filter(Boolean).length;

  const toggleColumn = (key: MetricColumnKey) => {
    onChange({
      ...columns,
      [key]: !columns[key],
    });
  };

  const setAll = (val: boolean) => {
    const next = {} as ColumnVisibility;
    for (const opt of COLUMN_OPTIONS) {
      next[opt.key] = val;
    }
    onChange(next);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button with Filter Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Filter metrics and columns"
        className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] hover:border-[#73B7DC] text-xs font-mono font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer inline-flex items-center gap-2 shadow-2xs"
      >
        <svg
          className="w-4 h-4 text-[#0795CF]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>Customize Metrics</span>
        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#0795CF]/15 text-[#0795CF] font-bold">
          {activeCount}/{COLUMN_OPTIONS.length}
        </span>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-3.5 shadow-xl z-30 transition-all">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-default)]/60">
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
              Display Metrics & Columns
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setAll(true)}
                className="text-[#0795CF] hover:underline cursor-pointer"
              >
                All
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setAll(false)}
                className="text-[var(--text-muted)] hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 py-2 max-h-72 overflow-y-auto">
            {COLUMN_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--background-subtle)] cursor-pointer text-xs font-mono transition-colors"
              >
                <input
                  type="checkbox"
                  checked={columns[opt.key]}
                  onChange={() => toggleColumn(opt.key)}
                  className="rounded border-[var(--border-default)] text-[#0795CF] focus:ring-[#0795CF] cursor-pointer"
                />
                <span className="text-[var(--text-secondary)] font-medium">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border-default)]/60 text-[10px] font-mono text-[var(--text-muted)] text-center">
            Check or uncheck to show/hide columns
          </div>
        </div>
      )}
    </div>
  );
}