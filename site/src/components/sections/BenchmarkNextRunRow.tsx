import type { ColumnVisibility } from "@/types/benchmark";

export function BenchmarkNextRunRow({
  columns,
}: {
  columns: ColumnVisibility;
}) {
  return (
    <tr className="border-b border-[var(--border-default)]/50 opacity-60 font-mono text-xs">
      <td className="py-3 px-3 text-center text-[var(--text-muted)]" />
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-dashed border-[var(--border-strong)] flex items-center justify-center shrink-0" />
          <span className="text-xs font-mono text-[var(--text-muted)] tracking-wider">
            — next run —
          </span>
        </div>
      </td>
      {columns.retriever && (
        <td className="py-3 px-4 text-[var(--text-muted)]">—</td>
      )}
      {columns.reranker && (
        <td className="py-3 px-4 text-[var(--text-muted)]">—</td>
      )}
      {columns.judgePct && (
        <td className="py-3 px-4 text-right bg-[#0795CF]/4 dark:bg-[#0795CF]/8 text-[var(--text-muted)]">
          —
        </td>
      )}
      {columns.mTh && (
        <td className="py-3 px-3 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.f1Th && (
        <td className="py-3 px-3 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.precisionTh && (
        <td className="py-3 px-3 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.recallTh && (
        <td className="py-3 px-3 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.em && (
        <td className="py-3 px-3 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.latency && (
        <td className="py-3 px-4 text-right text-[var(--text-muted)]">—</td>
      )}
    </tr>
  );
}
