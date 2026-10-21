import type { BenchmarkRow, ColumnVisibility } from "@/types/benchmark";
import { formatClock } from "@/lib/benchmark-data";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";
import { BrandIcon } from "@/components/ui/BrandIcon";

interface BenchmarkTableRowProps {
  row: BenchmarkRow;
  columns: ColumnVisibility;
}

export function BenchmarkTableRow({ row, columns }: BenchmarkTableRowProps) {
  const isLeader = row.rank === 1;
  const padRank = String(row.rank).padStart(2, "0");
  // Medals are redundant with the rank numeral itself (color is never the only cue)
  const rankColor = RANK_MEDAL_CLASSES[row.rank] ?? "text-[var(--text-muted)]";

  const renderMetricCell = (val: number) => {
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
          {val.toFixed(1)}
        </span>
        {/* Shared 0–100 track so bar length carries real meaning */}
        <div
          className="w-14 h-[3px] rounded-full bg-[var(--border-default)] mt-1 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-[var(--brand-sky-blue)] dark:bg-[var(--brand-ocean-cyan)]"
            style={{ width: `${Math.max(0, Math.min(100, val))}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <tr
      className={`border-b border-[var(--border-default)]/70 transition-colors hover:bg-[var(--background-subtle)] ${
        isLeader
          ? "bg-[var(--brand-sky-blue)]/[0.03] dark:bg-[var(--brand-sky-blue)]/[0.06]"
          : "bg-transparent"
      }`}
    >
      {/* Rank # */}
      <td className="py-3 px-3 text-center">
        <span
          className={`font-mono font-extrabold text-sm sm:text-base ${rankColor}`}
        >
          {padRank}
        </span>
      </td>

      {/* MODEL (Tile + Logo + Name + Leader badge) */}
      <td className="py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)] flex items-center justify-center shrink-0 shadow-2xs">
            <BrandIcon name={row.generator} size={18} />
          </div>
          <span className="font-bold text-xs sm:text-sm font-sans tracking-tight text-[var(--text-primary)] whitespace-nowrap max-w-[5.5rem] sm:max-w-none truncate">
            {row.generator}
          </span>
          {isLeader && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-xs font-sans font-bold tracking-wider uppercase bg-[var(--brand-cta)] text-white shadow-2xs shrink-0">
              Leader
            </span>
          )}
        </div>
      </td>

      {/* EMBEDDING */}
      {columns.retriever && (
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <BrandIcon name={row.retriever} size={15} />
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
              {row.retriever.replace(/^BAAI\//i, "")}
            </span>
          </div>
        </td>
      )}

      {/* RERANKER */}
      {columns.reranker && (
        <td className="py-3 px-4">
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

      {/* JUDGE SCORE (follows the connected pipeline: model → embedding → reranker → score) */}
      {columns.judgePct && (
        <td className="py-3 px-3 sm:px-4 text-right bg-[var(--brand-sky-blue)]/8 dark:bg-[var(--brand-sky-blue)]/15">
          <span className="font-mono text-lg sm:text-xl font-bold text-[var(--brand-text)] tracking-tight">
            {row.judgePct.toFixed(1)}
          </span>
        </td>
      )}

      {/* M_TH */}
      {columns.mTh && (
        <td className="py-3 px-3 text-center">{renderMetricCell(row.mTh)}</td>
      )}

      {/* F1_TH */}
      {columns.f1Th && (
        <td className="py-3 px-3 text-center">{renderMetricCell(row.f1Th)}</td>
      )}

      {/* PRECISION_TH */}
      {columns.precisionTh && (
        <td className="py-3 px-3 text-center">
          {renderMetricCell(row.precisionTh)}
        </td>
      )}

      {/* RECALL_TH */}
      {columns.recallTh && (
        <td className="py-3 px-3 text-center">
          {renderMetricCell(row.recallTh)}
        </td>
      )}

      {/* EM */}
      {columns.em && (
        <td className="py-3 px-3 text-center">{renderMetricCell(row.em)}</td>
      )}

      {/* LATENCY */}
      {columns.latency && (
        <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-[var(--perf-text)]">
          {formatClock(row.genSeconds)}
        </td>
      )}
    </tr>
  );
}
