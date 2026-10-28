"use client";

import type { ColumnVisibility, RerankerFilter } from "@/types/benchmark";
import { QUALITY_MAX, QUALITY_MIN } from "@/lib/benchmark-data";
import { SCORE_BAND_CLASSES, SCORE_BAND_ORDER } from "@/lib/score-scale";
import { BenchmarkColumnFilter } from "@/components/sections/BenchmarkColumnFilter";
import { BenchmarkModelFilter } from "@/components/sections/BenchmarkModelFilter";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

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
  const { language } = useLanguage();
  const t = I18N[language].leaderboard;

  const rerankerOptions: Array<{ id: RerankerFilter; label: string }> = [
    { id: "all", label: t.rerankerAll },
    { id: "yes", label: t.rerankerYes },
    { id: "no", label: t.rerankerNo },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] transition-colors">
      <div className="flex flex-wrap items-center gap-2">
        {/* Generator Model Filter */}
        <BenchmarkModelFilter
          generators={generators}
          value={generator}
          onChange={onGeneratorChange}
        />

        {/* Reranker Segmented Filter */}
        <div
          role="group"
          aria-label={language === "TH" ? "กรองตามประเภท Reranker" : "Filter by reranker"}
          className="inline-flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-0.5"
        >
          {rerankerOptions.map((opt) => (
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
        <div
          className="hidden lg:flex items-center gap-1.5 whitespace-nowrap"
          title={t.overallTintTitle(QUALITY_MIN, QUALITY_MAX)}
        >
          <span className="text-xs font-sans text-[var(--text-muted)]">
            {t.overall}
          </span>
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {SCORE_BAND_ORDER.map((band) => (
              <span
                key={band}
                className={`h-3 w-3 rounded-[2px] border border-[var(--border-default)] ${SCORE_BAND_CLASSES[band]}`}
              />
            ))}
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {QUALITY_MIN.toFixed(1)} - {QUALITY_MAX.toFixed(1)}
          </span>
        </div>

        <span className="whitespace-nowrap text-xs font-sans text-[var(--text-muted)]">
          <span className="font-mono font-semibold text-[var(--text-secondary)]">{resultsCount}</span> {t.runsCount}
        </span>
        <BenchmarkColumnFilter columns={columns} onChange={onColumnsChange} />
      </div>
    </div>
  );
}
