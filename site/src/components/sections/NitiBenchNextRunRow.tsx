"use client";

import Link from "next/link";
import type { NitiColumnVisibility } from "@/types/benchmark";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

export function NitiBenchNextRunRow({ columns }: { columns: NitiColumnVisibility }) {
  const { language } = useLanguage();
  const t = I18N[language].leaderboard;
  const emptyCell = <td className="py-3 px-2 text-center text-[var(--text-muted)]">—</td>;

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
            {t.requestRunRow}
          </Link>
        </div>
      </td>
      {columns.retriever && emptyCell}
      {columns.reranker && emptyCell}
      {columns.rubricBar && emptyCell}
      {columns.citationF1 && emptyCell}
      {columns.recallAtK && emptyCell}
      {columns.pAt1 && emptyCell}
      {columns.hallucinated && emptyCell}
      {columns.nCases && emptyCell}
      {columns.genSeconds && emptyCell}
      {columns.runDate && emptyCell}
    </tr>
  );
}
