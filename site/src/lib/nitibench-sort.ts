import type {
  NitiBenchRow,
  NitiSortKey,
  SortDirection,
} from "@/types/benchmark";

function sortValue(row: NitiBenchRow, key: NitiSortKey): number | string | null {
  switch (key) {
    case "rank": return row.rank;
    case "retriever": return row.retriever;
    case "reranker": return row.reranker;
    case "rubricBar": return row.rubricBar;
    case "citationF1": return row.citationF1;
    case "recallAtK": return row.recallAtK;
    case "pAt1": return row.pAt1;
    case "hallucinated": return row.hallucinated;
    case "nCases": return row.nCases;
    case "genSeconds": return row.genSeconds;
    case "runDate": return row.runDate;
  }
}

/** Sort a copy-safe comparison for every Niti column; missing values stay last. */
export function compareNitiRows(
  a: NitiBenchRow,
  b: NitiBenchRow,
  sortKey: NitiSortKey,
  sortDirection: SortDirection
): number {
  const aVal = sortValue(a, sortKey);
  const bVal = sortValue(b, sortKey);
  if (aVal === bVal) return 0;
  if (aVal === null) return 1;
  if (bVal === null) return -1;

  const result =
    typeof aVal === "number" && typeof bVal === "number"
      ? aVal < bVal ? -1 : 1
      : String(aVal).localeCompare(String(bVal));
  return sortDirection === "asc" ? result : -result;
}
