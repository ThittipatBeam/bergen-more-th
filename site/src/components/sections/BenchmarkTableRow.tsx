"use client";

import type { BenchmarkRow, ColumnVisibility } from "@/types/benchmark";
import { formatClock } from "@/lib/benchmark-data";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";

interface BenchmarkTableRowProps {
  row: BenchmarkRow;
  columns: ColumnVisibility;
}

export function BenchmarkTableRow({ row, columns }: BenchmarkTableRowProps) {
  const medalClass = RANK_MEDAL_CLASSES[row.rank];

  return (
    <tr className="border-b border-[var(--border-default)]/70 hover:bg-[var(--background-subtle)] transition-colors text-xs font-mono">
      {/* Rank */}
      <td className="py-3 px-4 font-bold">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
            medalClass
              ? `${medalClass} bg-[var(--background-primary)] shadow-2xs font-extrabold`
              : "text-[var(--text-muted)] font-medium"
          }`}
        >
          {row.rank}
        </span>
      </td>

      {/* Generator & Dataset */}
      <td className="py-3 px-4 font-sans">
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
            {row.generator}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {row.dataset}
          </span>
        </div>
      </td>

      {/* Embedding (Retriever) */}
      {columns.retriever && (
        <td className="py-3 px-4">
          <span className="text-[11px] text-[var(--text-secondary)] font-mono truncate max-w-[200px] inline-block">
            {row.retriever}
          </span>
        </td>
      )}

      {/* Reranker */}
      {columns.reranker && (
        <td className="py-3 px-4">
          {row.reranker ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-[#0795CF]/10 text-[#0795CF] font-medium border border-[#0795CF]/20">
              {row.reranker}
            </span>
          ) : (
            <span className="text-[var(--text-muted)] text-[11px]">—</span>
          )}
        </td>
      )}

      {/* Judge Score */}
      {columns.judgePct && (
        <td className="py-3 px-4 text-right">
          <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[#0795CF] bg-[#0795CF]/10 font-mono">
            {row.judgePct.toFixed(1)}%
          </span>
        </td>
      )}

      {/* Thai M-Score */}
      {columns.mTh && (
        <td className="py-3 px-3 text-right text-[var(--text-primary)] font-mono">
          {row.mTh.toFixed(1)}%
        </td>
      )}

      {/* Exact Match */}
      {columns.em && (
        <td className="py-3 px-3 text-right text-[var(--text-secondary)] font-mono">
          {row.em.toFixed(1)}%
        </td>
      )}

      {/* Thai F1 */}
      {columns.f1Th && (
        <td className="py-3 px-3 text-right text-[var(--text-secondary)] font-mono">
          {row.f1Th.toFixed(1)}%
        </td>
      )}

      {/* Thai Recall */}
      {columns.recallTh && (
        <td className="py-3 px-3 text-right text-[var(--text-secondary)] font-mono">
          {row.recallTh.toFixed(1)}%
        </td>
      )}

      {/* Latency (Generation Time) */}
      {columns.latency && (
        <td className="py-3 px-4 text-right font-mono text-[var(--text-muted)]">
          {formatClock(row.genSeconds)}
        </td>
      )}
    </tr>
  );
}
