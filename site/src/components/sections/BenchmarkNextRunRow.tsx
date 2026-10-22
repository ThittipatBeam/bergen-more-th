import Link from "next/link";
import type { ColumnVisibility } from "@/types/benchmark";

export function BenchmarkNextRunRow({
  columns,
}: {
  columns: ColumnVisibility;
}) {
  return (
    <tr className="border-b border-[var(--border-default)]/50 font-mono text-xs">
      <td className="py-3 px-2 text-center text-[var(--text-muted)]" />
      <td className="py-3 px-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-dashed border-[var(--border-strong)] flex items-center justify-center shrink-0" />
          <Link
            href="/request"
            className="inline-flex min-h-[44px] items-center whitespace-nowrap text-xs font-mono font-semibold tracking-wider text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            Request a run &rarr;
          </Link>
        </div>
      </td>
      {columns.retriever && (
        <td className="py-3 px-3 text-[var(--text-muted)]">—</td>
      )}
      {columns.reranker && (
        <td className="py-3 px-3 text-[var(--text-muted)]">—</td>
      )}
      {columns.q && (
        <td className="py-3 px-2 sm:px-3 text-right bg-[var(--brand-sky-blue)]/4 dark:bg-[var(--brand-sky-blue)]/8 text-[var(--text-muted)]">
          —
        </td>
      )}
      {columns.judgePct && (
        <td className="py-3 px-2 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.mTh && (
        <td className="py-3 px-2 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.f1Th && (
        <td className="py-3 px-2 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.precisionTh && (
        <td className="py-3 px-2 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.recallTh && (
        <td className="py-3 px-2 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.em && (
        <td className="py-3 px-2 text-center text-[var(--text-muted)]">—</td>
      )}
      {columns.latency && (
        <td className="py-3 px-2 text-right text-[var(--text-muted)]">—</td>
      )}
    </tr>
  );
}
