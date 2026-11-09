"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/use-language";

export interface ColumnFilterOption<Key extends string> {
  key: Key;
  labelEn: string;
  labelTh: string;
  category: "metric" | "pipeline";
}

interface ColumnFilterProps<Key extends string> {
  columns: Record<Key, boolean>;
  options: readonly ColumnFilterOption<Key>[];
  onChange: (columns: Record<Key, boolean>) => void;
  footerEn: readonly [string, string];
  footerTh: readonly [string, string];
}

/** Shared metric/column picker. Each board supplies its own columns and rule. */
export function ColumnFilter<Key extends string>({
  columns,
  options,
  onChange,
  footerEn,
  footerTh,
}: ColumnFilterProps<Key>) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const footer = isTh ? footerTh : footerEn;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const activeCount = Object.values(columns).filter(Boolean).length;

  const toggleColumn = (key: Key) => {
    onChange({ ...columns, [key]: !columns[key] });
  };

  const setAll = (value: boolean) => {
    const next = {} as Record<Key, boolean>;
    for (const option of options) next[option.key] = value;
    onChange(next);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isTh ? "เลือกแสดงคอลัมน์และ metric" : "Filter metrics and columns"}
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
          {activeCount}/{options.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-3.5 shadow-xl z-30 transition-all">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-default)]/60">
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
              {isTh ? "แสดงคอลัมน์และ metric" : "Display Metrics & Columns"}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAll(true)}
                className="min-w-[44px] min-h-[44px] px-2 inline-flex items-center justify-center text-[var(--brand-text)] hover:underline cursor-pointer"
              >
                {isTh ? "ทั้งหมด" : "All"}
              </button>
              <span aria-hidden="true">&bull;</span>
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
            {options.map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-2.5 px-2 min-h-[44px] rounded-lg hover:bg-[var(--background-subtle)] cursor-pointer text-xs font-mono transition-colors"
              >
                <input
                  type="checkbox"
                  checked={columns[option.key]}
                  onChange={() => toggleColumn(option.key)}
                  className="rounded border-[var(--border-default)] text-[var(--brand-sky-blue)] focus:ring-[var(--border-focus)] cursor-pointer"
                />
                <span className="text-[var(--text-secondary)] font-medium">
                  {isTh ? option.labelTh : option.labelEn}
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-1 pt-2 border-t border-[var(--border-default)]/60 text-center font-mono text-xs leading-relaxed text-[var(--text-muted)]">
            <span>{footer[0]}</span>
            <span>{footer[1]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
