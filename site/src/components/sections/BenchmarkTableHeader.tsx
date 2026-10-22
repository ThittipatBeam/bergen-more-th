"use client";

import type {
  ColumnVisibility,
  SortDirection,
  SortKey,
} from "@/types/benchmark";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

interface BenchmarkTableHeaderProps {
  columns: ColumnVisibility;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

/** One-line meaning per column, surfaced as tooltip + accessible name. */
const COLUMN_DEFS_EN: Record<SortKey, string> = {
  rank: "Rank — position by overall score",
  retriever: "Embedding — the dense retrieval model",
  reranker: "Reranker — optional second-pass scoring model",
  q: "Overall score — 45% judge + 20% Match TH + 20% F1 TH + 15% Exact Match (0–100). This is the ranking score; generation time is not part of it. Cell tint is scaled to the observed Q range.",
  judgePct:
    "Judge Score — share of answers the LLM judge marked correct (0–100).",
  mTh: "Match TH — share of questions whose full gold answer appears inside the model answer (M_th, whitespace-insensitive containment)",
  f1Th: "F1 TH — harmonic mean of Thai precision and recall (F1_th)",
  precisionTh:
    "Precision TH — share of the model's Thai word pieces that also appear in the reference (Precision_th)",
  recallTh:
    "Recall TH — share of the reference's Thai word pieces the model included (Recall_th)",
  em: "Exact Match — share of questions whose normalized answer equals a reference (EM)",
  latency:
    "Generation time — model generation only (m:ss); excludes retrieval, reranking and scoring",
};

const COLUMN_DEFS_TH: Record<SortKey, string> = {
  rank: "อันดับ — จัดอันดับตามคะแนน Overall Score",
  retriever: "Embedding — โมเดล Dense Retrieval",
  reranker: "Reranker — โมเดลจัดอันดับซ้ำรอบสอง (ไม่บังคับ)",
  q: "Overall score — 45% Judge + 20% Match TH + 20% F1 TH + 15% Exact Match (0–100) ไม่รวมเวลาสร้างคำตอบ",
  judgePct:
    "Judge Score — สัดส่วนคำตอบที่ LLM Judge ตัดสินว่าถูกต้อง (0–100)",
  mTh: "Match TH — สัดส่วนคำถามที่มีคำตอบเฉลยครบถ้วนในข้อความ (M_th, ไม่สนใจช่องว่าง)",
  f1Th: "F1 TH — ค่าเฉลี่ยฮาร์มอนิกของ Precision และ Recall ภาษาไทย (F1_th)",
  precisionTh:
    "Precision TH — สัดส่วนคำภาษาไทยของโมเดลที่ตรงกับคำตอบเฉลย (Precision_th)",
  recallTh:
    "Recall TH — สัดส่วนคำภาษาไทยในเฉลยที่โมเดลตอบได้ครอบคลุม (Recall_th)",
  em: "Exact Match — สัดส่วนคำตอบที่ตรงกับเฉลยแบบ 100% (EM)",
  latency:
    "เวลา Generation — เฉพาะเวลาที่โมเดลสร้างคำตอบ (นาที:วินาที) ไม่รวมการค้นคืนและให้คะแนน",
};

export function BenchmarkTableHeader({
  columns,
  sortKey,
  sortDirection,
  onSort,
}: BenchmarkTableHeaderProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const defs = isTh ? COLUMN_DEFS_TH : COLUMN_DEFS_EN;
  const t = I18N[language].leaderboard;

  const renderIndicator = (key: SortKey) => {
    // Both states share one size so activating a sort never shifts the layout.
    if (sortKey === key) {
      return (
        <span className="ml-0.5 text-[10px] text-[var(--brand-text)] font-bold">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      );
    }
    return (
      <span className="ml-0.5 text-[10px] text-[var(--text-muted)] opacity-35 group-hover:opacity-100 transition-opacity">
        ↕
      </span>
    );
  };

  const ariaSort = (key: SortKey): "ascending" | "descending" | undefined =>
    sortKey === key
      ? sortDirection === "asc"
        ? "ascending"
        : "descending"
      : undefined;

  const sortBtn = (key: SortKey, label: string, align: "left" | "right" | "center") => (
    <button
      type="button"
      onClick={() => onSort(key)}
      title={defs[key]}
      aria-label={`${defs[key]}. ${isTh ? "คลิกเพื่อเรียงลำดับ" : "Activate to sort."}`}
      className={`group cursor-pointer uppercase min-w-[44px] min-h-[44px] inline-flex items-center gap-0.5 text-inherit hover:text-[var(--text-primary)] transition-colors ${
        align === "right" ? "ml-auto" : align === "center" ? "mx-auto justify-center" : ""
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      {renderIndicator(key)}
    </button>
  );

  return (
    <thead>
      <tr className="bg-[var(--background-subtle)] border-b border-[var(--border-default)] text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-secondary)] transition-colors select-none">
        <th
          scope="col"
          aria-sort={ariaSort("rank")}
          className="sticky left-0 z-20 w-10 bg-[var(--background-subtle)] py-3.5 px-1.5 text-center"
        >
          {sortBtn("rank", t.colRank, "center")}
        </th>

        <th
          scope="col"
          className="sticky left-14 z-20 bg-[var(--background-subtle)] py-3.5 px-2 text-left sm:px-3"
        >
          {t.colModel}
        </th>

        {columns.retriever && (
          <th scope="col" aria-sort={ariaSort("retriever")} className="py-3.5 px-3 text-left">
            {sortBtn("retriever", t.colRetriever, "left")}
          </th>
        )}

        {columns.reranker && (
          <th scope="col" aria-sort={ariaSort("reranker")} className="py-3.5 px-3 text-left">
            {sortBtn("reranker", t.colReranker, "left")}
          </th>
        )}

        {columns.q && (
          <th scope="col" aria-sort={ariaSort("q")} className="py-3.5 px-2 sm:px-3 text-right bg-[var(--surface-brand)] text-[var(--brand-text)]">
            {sortBtn("q", t.colOverall, "right")}
          </th>
        )}

        {columns.judgePct && (
          <th scope="col" aria-sort={ariaSort("judgePct")} className="py-3.5 px-2 text-center">
            {sortBtn("judgePct", t.colJudge, "center")}
          </th>
        )}

        {columns.mTh && (
          <th scope="col" aria-sort={ariaSort("mTh")} className="py-3.5 px-2 text-center">
            {sortBtn("mTh", t.colMatchTh, "center")}
          </th>
        )}

        {columns.f1Th && (
          <th scope="col" aria-sort={ariaSort("f1Th")} className="py-3.5 px-2 text-center">
            {sortBtn("f1Th", t.colF1Th, "center")}
          </th>
        )}

        {columns.precisionTh && (
          <th scope="col" aria-sort={ariaSort("precisionTh")} className="py-3.5 px-2 text-center">
            {sortBtn("precisionTh", t.colPrecisionTh, "center")}
          </th>
        )}

        {columns.recallTh && (
          <th scope="col" aria-sort={ariaSort("recallTh")} className="py-3.5 px-2 text-center">
            {sortBtn("recallTh", t.colRecallTh, "center")}
          </th>
        )}

        {columns.em && (
          <th scope="col" aria-sort={ariaSort("em")} className="py-3.5 px-2 text-center">
            {sortBtn("em", t.colEm, "center")}
          </th>
        )}

        {columns.latency && (
          <th scope="col" aria-sort={ariaSort("latency")} className="py-3.5 px-2 text-right">
            {sortBtn("latency", t.colLatency, "right")}
          </th>
        )}
      </tr>
    </thead>
  );
}
