import type { CSSProperties } from "react";
import type { NitiBenchRow, NitiColumnVisibility } from "@/types/benchmark";
import { formatClock } from "@/lib/benchmark-data";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";
import { SCORE_BAND_CLASSES, scoreBand } from "@/lib/score-scale";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { NitiModeChip, nitiDate } from "@/components/sections/NitiBenchCard";
import { NitiBenchMetricCell } from "@/components/sections/NitiBenchMetricCell";

interface NitiBenchTableRowProps {
  row: NitiBenchRow;
  columns: NitiColumnVisibility;
  isTh: boolean;
  barMin: number;
  barMax: number;
}

/** One legal run with the same podium, brand, score, and metric language as Wiki. */
export function NitiBenchTableRow({
  row,
  columns,
  isTh,
  barMin,
  barMax,
}: NitiBenchTableRowProps) {
  const isLeader = row.rank === 1;
  const isTied = row.tieCount > 1;
  const padRank = `${String(row.rank).padStart(2, "0")}${isTied ? "=" : ""}`;
  const rankColor = RANK_MEDAL_CLASSES[row.rank] ?? "text-[var(--text-muted)]";
  const rowBg =
    row.rank === 1
      ? "var(--rank-gold-solid)"
      : row.rank === 2
        ? "var(--rank-silver-solid)"
        : row.rank === 3
          ? "var(--rank-bronze-solid)"
          : "var(--background-primary)";
  const scoreTint = SCORE_BAND_CLASSES[scoreBand(row.rubricBar, barMin, barMax)];

  return (
    <tr
      style={{ "--row-bg": rowBg } as CSSProperties}
      className="border-b border-[var(--border-default)]/70 bg-[var(--row-bg)] transition-colors hover:bg-[var(--background-subtle)]"
    >
      <td className="sticky left-0 z-10 bg-inherit py-3 px-1.5 text-center">
        <span className={`font-mono font-extrabold text-sm sm:text-base ${rankColor}`}>
          {padRank}
        </span>
      </td>

      <td className="sticky left-14 z-10 bg-inherit py-3 px-2 sm:px-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)] flex items-center justify-center shrink-0 shadow-2xs">
            <BrandIcon name={row.generator} size={18} />
          </div>
          <span className="font-bold text-xs sm:text-sm font-sans tracking-tight text-[var(--text-primary)] whitespace-nowrap max-w-[5.5rem] sm:max-w-none truncate">
            {row.generator}
          </span>
          {row.mode !== "RAG" && <NitiModeChip mode={row.mode} />}
        </div>
      </td>

      {columns.retriever && (
        <td className="py-3 px-3">
          {row.retriever ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <BrandIcon name={row.retriever} size={15} />
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                {row.retriever.replace(/^BAAI\//i, "")}
              </span>
            </div>
          ) : (
            <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
          )}
        </td>
      )}

      {columns.reranker && (
        <td className="py-3 px-3">
          {row.reranker ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <BrandIcon name={row.reranker} size={15} />
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                {row.reranker.replace(/^BAAI\//i, "")}
              </span>
            </div>
          ) : (
            <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
          )}
        </td>
      )}

      {columns.rubricBar && (
        <td className={`py-3 px-2 sm:px-3 text-right ${scoreTint}`}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {row.rubricBar.toFixed(2)}
            </span>
            {isLeader && (
              <span className="font-sans text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-[var(--leader-label)]">
                {isTied ? "Tied #1" : "Leader"}
              </span>
            )}
          </div>
        </td>
      )}

      {columns.citationF1 && <td className="py-3 px-1.5 text-center"><NitiBenchMetricCell value={row.citationF1} /></td>}
      {columns.recallAtK && <td className="py-3 px-1.5 text-center"><NitiBenchMetricCell value={row.recallAtK} /></td>}
      {columns.pAt1 && <td className="py-3 px-1.5 text-center"><NitiBenchMetricCell value={row.pAt1} /></td>}

      {columns.hallucinated && (
        <td className="py-3 px-2 text-center font-mono text-xs text-[var(--text-primary)]">
          {row.hallucinated ?? "—"}
        </td>
      )}
      {columns.nCases && (
        <td className="py-3 px-2 text-center font-mono text-xs text-[var(--text-primary)]">
          {row.nCases ?? "—"}
        </td>
      )}
      {columns.genSeconds && (
        <td className="py-3 px-2 text-right font-mono text-xs font-semibold text-[var(--perf-text)]">
          {formatClock(row.genSeconds)}
        </td>
      )}
      {columns.runDate && (
        <td className="py-3 px-3 text-right font-mono text-xs text-[var(--text-muted)]">
          {nitiDate(row.runDate, isTh)}
        </td>
      )}
    </tr>
  );
}
