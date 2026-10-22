import type { CSSProperties } from "react";
import type { BenchmarkRow, ColumnVisibility } from "@/types/benchmark";
import {
  QUALITY_MAX,
  QUALITY_MIN,
  formatClock,
} from "@/lib/benchmark-data";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";
import { SCORE_BAND_CLASSES, scoreBand } from "@/lib/score-scale";
import { BrandIcon } from "@/components/ui/BrandIcon";

interface BenchmarkTableRowProps {
  row: BenchmarkRow;
  columns: ColumnVisibility;
}

export function BenchmarkTableRow({ row, columns }: BenchmarkTableRowProps) {
  const isLeader = row.rank === 1;
  const isTied = row.tieCount > 1;
  const padRank = `${String(row.rank).padStart(2, "0")}${isTied ? "=" : ""}`;
  // Medals are redundant with the rank numeral itself (color is never the only cue)
  const rankColor = RANK_MEDAL_CLASSES[row.rank] ?? "text-[var(--text-muted)]";
  // Opaque so the sticky rank/model cells can inherit the podium wash instead
  // of showing the columns scrolling underneath them.
  const rowBg =
    row.rank === 1
      ? "var(--rank-gold-solid)"
      : row.rank === 2
        ? "var(--rank-silver-solid)"
        : row.rank === 3
          ? "var(--rank-bronze-solid)"
          : "var(--background-primary)";
  const scoreTint =
    SCORE_BAND_CLASSES[scoreBand(row.q, QUALITY_MIN, QUALITY_MAX)];

  const renderMetricCell = (val: number) => {
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
          {val.toFixed(1)}
        </span>
        {/* Shared 0–100 track so bar length carries real meaning */}
        <div
          className="w-10 h-[3px] rounded-full bg-[var(--border-default)] mt-1 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, val))}%`,
              backgroundImage:
                "linear-gradient(90deg, var(--metric-bar-from), var(--metric-bar-to))",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <tr
      style={{ "--row-bg": rowBg } as CSSProperties}
      className="border-b border-[var(--border-default)]/70 bg-[var(--row-bg)] transition-colors hover:bg-[var(--background-subtle)]"
    >
      {/* Rank # */}
      <td className="sticky left-0 z-10 bg-inherit py-3 px-1.5 text-center">
        <span
          className={`font-mono font-extrabold text-sm sm:text-base ${rankColor}`}
        >
          {padRank}
        </span>
      </td>

      {/* MODEL (Tile + Logo + Name + Leader badge) */}
      <td className="sticky left-14 z-10 bg-inherit py-3 px-2 sm:px-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)] flex items-center justify-center shrink-0 shadow-2xs">
            <BrandIcon name={row.generator} size={18} />
          </div>
          <span className="font-bold text-xs sm:text-sm font-sans tracking-tight text-[var(--text-primary)] whitespace-nowrap max-w-[5.5rem] sm:max-w-none truncate">
            {row.generator}
          </span>
        </div>
      </td>

      {/* EMBEDDING */}
      {columns.retriever && (
        <td className="py-3 px-3">
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

      {/* OVERALL — the headline number, tinted by the board's observed range.
          It follows the connected pipeline: model → embedding → reranker → score. */}
      {columns.q && (
        <td className={`py-3 px-2 sm:px-3 text-right ${scoreTint}`}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {row.q.toFixed(1)}
            </span>
            {/* The leader is the leader by overall score, so the label lives here rather
                than widening the model column. The gold rank numeral and row
                tint already carry the same message without it. */}
            {isLeader && (
              <span className="font-sans text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-[var(--leader-label)]">
                {isTied ? "Tied #1" : "Leader"}
              </span>
            )}
          </div>
        </td>
      )}

      {/* JUDGE */}
      {columns.judgePct && (
        <td className="py-3 px-1.5 text-center">
          {renderMetricCell(row.judgePct)}
        </td>
      )}

      {/* M_TH */}
      {columns.mTh && (
        <td className="py-3 px-1.5 text-center">{renderMetricCell(row.mTh)}</td>
      )}

      {/* F1_TH */}
      {columns.f1Th && (
        <td className="py-3 px-1.5 text-center">{renderMetricCell(row.f1Th)}</td>
      )}

      {/* PRECISION_TH */}
      {columns.precisionTh && (
        <td className="py-3 px-1.5 text-center">
          {renderMetricCell(row.precisionTh)}
        </td>
      )}

      {/* RECALL_TH */}
      {columns.recallTh && (
        <td className="py-3 px-1.5 text-center">
          {renderMetricCell(row.recallTh)}
        </td>
      )}

      {/* EM */}
      {columns.em && (
        <td className="py-3 px-1.5 text-center">{renderMetricCell(row.em)}</td>
      )}

      {/* LATENCY */}
      {columns.latency && (
        <td className="py-3 px-2 text-right font-mono text-xs font-semibold text-[var(--perf-text)]">
          {formatClock(row.genSeconds)}
        </td>
      )}
    </tr>
  );
}
