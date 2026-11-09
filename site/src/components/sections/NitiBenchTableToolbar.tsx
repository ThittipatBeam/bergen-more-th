"use client";

import type {
  NitiColumnVisibility,
  RerankerFilter,
} from "@/types/benchmark";
import { SCORE_BAND_CLASSES, SCORE_BAND_ORDER } from "@/lib/score-scale";
import { NITI_TABLE_COLUMNS } from "@/lib/nitibench-table-columns";
import { BenchmarkModelFilter } from "@/components/sections/BenchmarkModelFilter";
import { ColumnFilter } from "@/components/ui/ColumnFilter";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

interface NitiBenchTableToolbarProps {
  generators: string[];
  generator: string;
  onGeneratorChange: (generator: string) => void;
  reranker: RerankerFilter;
  onRerankerChange: (reranker: RerankerFilter) => void;
  columns: NitiColumnVisibility;
  onColumnsChange: (columns: NitiColumnVisibility) => void;
  resultsCount: number;
  barMin: number;
  barMax: number;
}

export function NitiBenchTableToolbar(props: NitiBenchTableToolbarProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const t = I18N[language].leaderboard;
  const rerankerOptions: Array<{ id: RerankerFilter; label: string }> = [
    { id: "all", label: t.rerankerAll },
    { id: "yes", label: t.rerankerYes },
    { id: "no", label: isTh ? "ไม่มี Reranker" : "No Reranker" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] transition-colors">
      <div className="flex flex-wrap items-center gap-2">
        <BenchmarkModelFilter
          generators={props.generators}
          value={props.generator}
          onChange={props.onGeneratorChange}
        />
        <div
          role="group"
          aria-label={isTh ? "กรองตามประเภท Reranker" : "Filter by reranker"}
          className="inline-flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-0.5"
        >
          {rerankerOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => props.onRerankerChange(option.id)}
              aria-pressed={props.reranker === option.id}
              className={`min-w-[44px] min-h-[44px] px-3.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                props.reranker === option.id
                  ? "bg-[var(--background-primary)] text-[var(--brand-text)] shadow-2xs font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div
          className="hidden md:flex items-center gap-1.5 whitespace-nowrap"
          title={`Bar score tint: ${props.barMin.toFixed(2)} → ${props.barMax.toFixed(2)}`}
        >
          <span className="text-xs font-sans text-[var(--text-muted)]">Bar</span>
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {SCORE_BAND_ORDER.map((band) => (
              <span
                key={band}
                className={`h-3 w-3 rounded-[2px] border border-[var(--border-default)] ${SCORE_BAND_CLASSES[band]}`}
              />
            ))}
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {props.barMin.toFixed(2)} - {props.barMax.toFixed(2)}
          </span>
        </div>
        <span className="whitespace-nowrap text-xs font-sans text-[var(--text-muted)]">
          <span className="font-mono font-semibold text-[var(--text-secondary)]">{props.resultsCount}</span> {t.runsCount}
        </span>
        <div className="hidden md:block">
          <ColumnFilter
            columns={props.columns}
            options={NITI_TABLE_COLUMNS}
            onChange={props.onColumnsChange}
            footerEn={["Rank = Bar · ties → Citation F1", "Other columns are diagnostics only."]}
            footerTh={["อันดับ = Bar · คะแนนเท่ากันใช้ Citation F1", "คอลัมน์อื่นใช้ประกอบการตรวจสอบเท่านั้น"]}
          />
        </div>
      </div>
    </div>
  );
}
