import type {
  ColumnVisibility,
  SortDirection,
  SortKey,
} from "@/types/benchmark";

interface BenchmarkTableHeaderProps {
  columns: ColumnVisibility;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

/** One-line meaning per column, surfaced as tooltip + accessible name. */
const COLUMN_DEFS: Record<SortKey, string> = {
  rank: "Rank — position by judge score",
  retriever: "Embedding — the dense retrieval model",
  reranker: "Reranker — optional second-pass scoring model",
  judgePct: "Judge Score — answer quality 0–100 rated by the LLM judge",
  mTh: "Match TH — token overlap with human reference answers (M_th)",
  f1Th: "F1 TH — harmonic mean of Thai precision and recall (F1_th)",
  precisionTh: "Precision TH — share of generated tokens that are relevant (Precision_th)",
  recallTh: "Recall TH — share of reference tokens captured (Recall_th)",
  em: "Exact Match — strict equality with the reference answer (EM)",
  latency: "Latency — end-to-end pipeline time (m:ss)",
};

export function BenchmarkTableHeader({
  columns,
  sortKey,
  sortDirection,
  onSort,
}: BenchmarkTableHeaderProps) {
  const renderIndicator = (key: SortKey) => {
    if (sortKey === key) {
      return (
        <span className="ml-1 text-[#0795CF] font-bold">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      );
    }
    return (
      <span className="ml-1 text-[var(--text-muted)] opacity-35 group-hover:opacity-100 transition-opacity">
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
      title={COLUMN_DEFS[key]}
      aria-label={`${COLUMN_DEFS[key]}. Activate to sort.`}
      className={`group cursor-pointer uppercase min-w-[44px] min-h-[44px] inline-flex items-center gap-0.5 text-inherit hover:text-[var(--text-primary)] transition-colors ${
        align === "right" ? "ml-auto" : align === "center" ? "mx-auto justify-center" : ""
      }`}
    >
      <span>{label}</span>
      {renderIndicator(key)}
    </button>
  );

  return (
    <thead>
      <tr className="bg-[var(--background-subtle)] border-b border-[var(--border-default)] text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-secondary)] transition-colors select-none">
        <th scope="col" aria-sort={ariaSort("rank")} className="py-3.5 px-3 w-12 text-center">
          {sortBtn("rank", "#", "center")}
        </th>

        <th scope="col" className="py-3.5 px-3 sm:px-4 text-left">Model</th>

        {columns.retriever && (
          <th scope="col" aria-sort={ariaSort("retriever")} className="py-3.5 px-4 text-left">
            {sortBtn("retriever", "Embedding", "left")}
          </th>
        )}

        {columns.reranker && (
          <th scope="col" aria-sort={ariaSort("reranker")} className="py-3.5 px-4 text-left">
            {sortBtn("reranker", "Reranker", "left")}
          </th>
        )}

        {columns.judgePct && (
          <th scope="col" aria-sort={ariaSort("judgePct")} className="py-3.5 px-3 sm:px-4 text-right bg-[var(--brand-sky-blue)]/10 dark:bg-[var(--brand-sky-blue)]/20 text-[var(--brand-text)]">
            {sortBtn("judgePct", "Judge Score", "right")}
          </th>
        )}

        {columns.mTh && (
          <th scope="col" aria-sort={ariaSort("mTh")} className="py-3.5 px-3 text-center">
            {sortBtn("mTh", "Match TH", "center")}
          </th>
        )}

        {columns.f1Th && (
          <th scope="col" aria-sort={ariaSort("f1Th")} className="py-3.5 px-3 text-center">
            {sortBtn("f1Th", "F1 TH", "center")}
          </th>
        )}

        {columns.precisionTh && (
          <th scope="col" aria-sort={ariaSort("precisionTh")} className="py-3.5 px-3 text-center">
            {sortBtn("precisionTh", "Precision TH", "center")}
          </th>
        )}

        {columns.recallTh && (
          <th scope="col" aria-sort={ariaSort("recallTh")} className="py-3.5 px-3 text-center">
            {sortBtn("recallTh", "Recall TH", "center")}
          </th>
        )}

        {columns.em && (
          <th scope="col" aria-sort={ariaSort("em")} className="py-3.5 px-3 text-center">
            {sortBtn("em", "EM", "center")}
          </th>
        )}

        {columns.latency && (
          <th scope="col" aria-sort={ariaSort("latency")} className="py-3.5 px-4 text-right">
            {sortBtn("latency", "Latency", "right")}
          </th>
        )}
      </tr>
    </thead>
  );
}
