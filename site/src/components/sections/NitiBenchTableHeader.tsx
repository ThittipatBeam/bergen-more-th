"use client";

import type {
  NitiColumnVisibility,
  NitiSortKey,
  SortDirection,
} from "@/types/benchmark";
import { NITI_TABLE_COLUMNS } from "@/lib/nitibench-table-columns";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

interface NitiBenchTableHeaderProps {
  columns: NitiColumnVisibility;
  sortKey: NitiSortKey;
  sortDirection: SortDirection;
  onSort: (key: NitiSortKey) => void;
}

const ALIGN_CLASSES = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function NitiBenchTableHeader({
  columns,
  sortKey,
  sortDirection,
  onSort,
}: NitiBenchTableHeaderProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const t = I18N[language].leaderboard;
  const rankHelp = isTh
    ? "อันดับ: ตำแหน่งตามคะแนน Bar และ Citation F1 เมื่อคะแนนเท่ากัน"
    : "Rank: position by Bar score, with Citation F1 breaking ties";

  const indicator = (key: NitiSortKey) => sortKey === key ? (
    <span className="ml-0.5 text-[10px] text-[var(--brand-text)] font-bold">
      {sortDirection === "asc" ? "↑" : "↓"}
    </span>
  ) : (
    <span className="ml-0.5 text-[10px] text-[var(--text-muted)] opacity-35 group-hover:opacity-100 transition-opacity">
      ↕
    </span>
  );

  const ariaSort = (key: NitiSortKey): "ascending" | "descending" | undefined =>
    sortKey === key
      ? sortDirection === "asc" ? "ascending" : "descending"
      : undefined;

  const sortButton = (
    key: NitiSortKey,
    label: string,
    help: string,
    align: keyof typeof ALIGN_CLASSES
  ) => (
    <button
      type="button"
      onClick={() => onSort(key)}
      title={help}
      aria-label={`${help}. ${isTh ? "คลิกเพื่อเรียงลำดับ" : "Activate to sort."}`}
      className={`group cursor-pointer uppercase min-w-[44px] min-h-[44px] inline-flex items-center gap-0.5 text-inherit hover:text-[var(--text-primary)] transition-colors ${
        align === "right" ? "ml-auto" : align === "center" ? "mx-auto justify-center" : ""
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      {indicator(key)}
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
          {sortButton("rank", t.colRank, rankHelp, "center")}
        </th>
        <th
          scope="col"
          className="sticky left-14 z-20 bg-[var(--background-subtle)] py-3.5 px-2 text-left sm:px-3"
        >
          {t.colModel}
        </th>

        {NITI_TABLE_COLUMNS.filter((column) => columns[column.key]).map((column) => (
          <th
            key={column.key}
            scope="col"
            aria-sort={ariaSort(column.key)}
            className={`py-3.5 px-2 ${ALIGN_CLASSES[column.align]} ${
              column.key === "retriever" || column.key === "reranker" ? "sm:px-3" : ""
            } ${
              column.key === "rubricBar"
                ? "bg-[var(--surface-brand)] text-[var(--brand-text)]"
                : ""
            }`}
          >
            {sortButton(
              column.key,
              isTh ? column.labelTh : column.labelEn,
              isTh ? column.helpTh : column.helpEn,
              column.align
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}
