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

export function BenchmarkTableHeader({
  columns,
  sortKey,
  sortDirection,
  onSort,
}: BenchmarkTableHeaderProps) {
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
      title={COLUMN_DEFS[key]}
      aria-label={`${COLUMN_DEFS[key]}. Activate to sort.`}
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
          {sortBtn("rank", "#", "center")}
        </th>

        <th
          scope="col"
          className="sticky left-14 z-20 bg-[var(--background-subtle)] py-3.5 px-2 text-left sm:px-3"
        >
          Model
        </th>

        {columns.retriever && (
          <th scope="col" aria-sort={ariaSort("retriever")} className="py-3.5 px-3 text-left">
            {sortBtn("retriever", "Embedding", "left")}
          </th>
        )}

        {columns.reranker && (
          <th scope="col" aria-sort={ariaSort("reranker")} className="py-3.5 px-3 text-left">
            {sortBtn("reranker", "Reranker", "left")}
          </th>
        )}

        {columns.q && (
          <th scope="col" aria-sort={ariaSort("q")} className="py-3.5 px-2 sm:px-3 text-right bg-[var(--surface-brand)] text-[var(--brand-text)]">
            {sortBtn("q", "Overall", "right")}
          </th>
        )}

        {columns.judgePct && (
          <th scope="col" aria-sort={ariaSort("judgePct")} className="py-3.5 px-2 text-center">
            {sortBtn("judgePct", "Judge", "center")}
          </th>
        )}

        {columns.mTh && (
          <th scope="col" aria-sort={ariaSort("mTh")} className="py-3.5 px-2 text-center">
            {sortBtn("mTh", "Match TH", "center")}
          </th>
        )}

        {columns.f1Th && (
          <th scope="col" aria-sort={ariaSort("f1Th")} className="py-3.5 px-2 text-center">
            {sortBtn("f1Th", "F1 TH", "center")}
          </th>
        )}

        {columns.precisionTh && (
          <th scope="col" aria-sort={ariaSort("precisionTh")} className="py-3.5 px-2 text-center">
            {sortBtn("precisionTh", "Precision TH", "center")}
          </th>
        )}

        {columns.recallTh && (
          <th scope="col" aria-sort={ariaSort("recallTh")} className="py-3.5 px-2 text-center">
            {sortBtn("recallTh", "Recall TH", "center")}
          </th>
        )}

        {columns.em && (
          <th scope="col" aria-sort={ariaSort("em")} className="py-3.5 px-2 text-center">
            {sortBtn("em", "EM", "center")}
          </th>
        )}

        {columns.latency && (
          <th scope="col" aria-sort={ariaSort("latency")} className="py-3.5 px-2 text-right">
            {sortBtn("latency", "Gen Time", "right")}
          </th>
        )}
      </tr>
    </thead>
  );
}
