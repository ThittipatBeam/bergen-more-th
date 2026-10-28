"use client";

import { useEffect, useRef, useState } from "react";
import type { ColumnVisibility, MetricColumnKey } from "@/types/benchmark";
import { useLanguage } from "@/hooks/use-language";

interface ColumnOption {
  key: MetricColumnKey;
  labelEn: string;
  labelTh: string;
  category: "metric" | "pipeline";
}

const COLUMN_OPTIONS: ColumnOption[] = [
  { key: "q", labelEn: "Overall Score", labelTh: "Overall Score", category: "metric" },
  { key: "judgePct", labelEn: "Judge Score (%)", labelTh: "คะแนน Judge (%)", category: "metric" },
  { key: "mTh", labelEn: "Thai M-Score (M_th)", labelTh: "Thai M-Score (M_th)", category: "metric" },
  { key: "f1Th", labelEn: "Thai F1-Score (F1_th)", labelTh: "Thai F1-Score (F1_th)", category: "metric" },
  { key: "precisionTh", labelEn: "Thai Precision (Precision_th)", labelTh: "Thai Precision (Precision_th)", category: "metric" },
  { key: "recallTh", labelEn: "Thai Recall (Recall_th)", labelTh: "Thai Recall (Recall_th)", category: "metric" },
  { key: "em", labelEn: "Exact Match (EM)", labelTh: "Exact Match (EM)", category: "metric" },
  { key: "latency", labelEn: "Generation Time (m:ss)", labelTh: "เวลาสร้างคำตอบ (m:ss)", category: "metric" },
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
  const { language } = useLanguage();
  const isTh = language === "TH";
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
        aria-label={isTh ? "เลือกแสดงคอลัมน์และเมทริกซ์" : "Filter metrics and columns"}
        className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] hover:border-[var(--brand-sky-light)] text-xs font-sans font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer inline-flex items-center gap-2 shadow-2xs"
      >
        <svg
          className="w-4 h-4 text-[var(--brand-sky-blue)]"
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
        <span className="whitespace-nowrap">{isTh ? "เลือกคอลัมน์" : "Customize Metrics"}</span>
        <span className="px-1.5 py-0.5 rounded-full text-xs bg-[var(--brand-sky-blue)]/15 text-[var(--brand-text)] font-bold">
          {activeCount}/{COLUMN_OPTIONS.length}
        </span>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-3.5 shadow-xl z-30 transition-all">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-default)]/60">
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
              {isTh ? "แสดงคอลัมน์และเมทริกซ์" : "Display Metrics & Columns"}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAll(true)}
                className="min-w-[44px] min-h-[44px] px-2 inline-flex items-center justify-center text-[var(--brand-text)] hover:underline cursor-pointer"
              >
                {isTh ? "ทั้งหมด" : "All"}
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setAll(false)}
                className="min-w-[44px] min-h-[44px] px-2 inline-flex items-center justify-center text-[var(--text-muted)] hover:underline cursor-pointer"
              >
                {isTh ? "ล้าง" : "Clear"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 py-2 max-h-72 overflow-y-auto">
            {COLUMN_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2.5 px-2 min-h-[44px] rounded-lg hover:bg-[var(--background-subtle)] cursor-pointer text-xs font-mono transition-colors"
              >
                <input
                  type="checkbox"
                  checked={columns[opt.key]}
                  onChange={() => toggleColumn(opt.key)}
                  className="rounded border-[var(--border-default)] text-[var(--brand-sky-blue)] focus:ring-[var(--border-focus)] cursor-pointer"
                />
                <span className="text-[var(--text-secondary)] font-medium">
                  {isTh ? opt.labelTh : opt.labelEn}
                </span>
              </label>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border-default)]/60 text-xs font-mono text-[var(--text-muted)] text-center">
            {isTh ? "เลือกเพื่อแสดงหรือซ่อนคอลัมน์ในตาราง" : "Check or uncheck to show/hide columns"}
          </div>
        </div>
      )}
    </div>
  );
}
