import type { CSSProperties } from "react";
import type { NitiBenchRow } from "@/types/benchmark";
import { formatClock } from "@/lib/benchmark-data";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";
import { SCORE_BAND_CLASSES, scoreBand } from "@/lib/score-scale";
import { BrandIcon } from "@/components/ui/BrandIcon";
import {
  NitiModeChip,
  nitiDate,
  nitiPct,
} from "@/components/sections/NitiBenchCard";

interface NitiBenchTableRowProps {
  row: NitiBenchRow;
  isTh: boolean;
  /** Board-wide rubric range; drives the sequential tint on the headline score. */
  barMin: number;
  barMax: number;
}

/** One run, styled like the Wikipedia board: podium wash, medal rank, brand
 *  tile, band-tinted headline score, and mini-bar metrics on a shared 0–100
 *  track. Only the columns differ — Bar rubric replaces Overall/Judge. */
export function NitiBenchTableRow({
  row,
  isTh,
  barMin,
  barMax,
}: NitiBenchTableRowProps) {
  const padRank = `${String(row.rank).padStart(2, "0")}${
    row.tieCount > 1 ? "=" : ""
  }`;
  const rankColor = RANK_MEDAL_CLASSES[row.rank] ?? "text-[var(--text-muted)]";
  // Opaque so the sticky rank/model cells inherit the podium wash instead of
  // showing the columns scrolling underneath them.
  const rowBg =
    row.rank === 1
      ? "var(--rank-gold-solid)"
      : row.rank === 2
        ? "var(--rank-silver-solid)"
        : row.rank === 3
          ? "var(--rank-bronze-solid)"
          : "var(--background-primary)";
  const scoreTint =
    SCORE_BAND_CLASSES[scoreBand(row.rubricBar, barMin, barMax)];

  const renderMetricCell = (val: number | null) => {
    if (val === null) {
      return (
        <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
          {nitiPct(val)}
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
      className="border-b border-[var(--border-default)]/70 last:border-0 bg-[var(--row-bg)] transition-colors hover:bg-[var(--background-subtle)]"
    >
      {/* Rank # */}
      <td className="sticky left-0 z-10 bg-inherit py-3 px-1.5 text-center">
        <span
          className={`font-mono font-extrabold text-sm sm:text-base ${rankColor}`}
        >
          {padRank}
        </span>
      </td>

      {/* MODEL (Tile + Logo + Name) */}
      <td className="sticky left-14 z-10 bg-inherit py-3 px-2 sm:px-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)] flex items-center justify-center shrink-0 shadow-2xs">
            <BrandIcon name={row.generator} size={18} />
          </div>
          <span className="font-bold text-xs sm:text-sm font-sans tracking-tight text-[var(--text-primary)] whitespace-nowrap max-w-[5.5rem] sm:max-w-none truncate">
            {row.generator}
          </span>
          {/* RAG is the default for this board; only flag the exceptions. */}
          {row.mode !== "RAG" && <NitiModeChip mode={row.mode} />}
        </div>
      </td>

      {/* EMBEDDING */}
      <td className="py-3 px-3">
        {row.retriever ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <BrandIcon name={row.retriever} size={15} />
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
              {row.retriever}
            </span>
          </div>
        ) : (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {isTh ? "ไม่ได้ค้น" : "—"}
          </span>
        )}
      </td>

      {/* RERANKER */}
      <td className="py-3 px-3">
        {row.reranker ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <BrandIcon name={row.reranker} size={15} />
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
              {row.reranker}
            </span>
          </div>
        ) : (
          <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
        )}
      </td>

      {/* BAR (0–10) — the headline number, tinted by the board's observed range */}
      <td className={`py-3 px-2 sm:px-3 text-right ${scoreTint}`}>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {row.rubricBar.toFixed(2)}
          </span>
        </div>
      </td>

      {/* CITATION F1 / RECALL@K / P@1 — diagnostics on the shared track */}
      <td className="py-3 px-1.5 text-center">{renderMetricCell(row.citationF1)}</td>
      <td className="py-3 px-1.5 text-center">{renderMetricCell(row.recallAtK)}</td>
      <td className="py-3 px-1.5 text-center">{renderMetricCell(row.pAt1)}</td>

      {/* HALLUCINATED / CASES */}
      <td className="py-3 px-2 text-center font-mono text-xs text-[var(--text-primary)]">
        {row.hallucinated ?? "—"}
      </td>
      <td className="py-3 px-2 text-center font-mono text-xs text-[var(--text-primary)]">
        {row.nCases ?? "—"}
      </td>

      {/* GEN TIME */}
      <td className="py-3 px-2 text-right font-mono text-xs font-semibold text-[var(--perf-text)]">
        {formatClock(row.genSeconds)}
      </td>

      {/* DATE */}
      <td className="py-3 px-3 text-right font-mono text-xs text-[var(--text-muted)]">
        {nitiDate(row.runDate, isTh)}
      </td>
    </tr>
  );
}
