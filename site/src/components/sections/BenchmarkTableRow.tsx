"use client";

import type { BenchmarkRow, ColumnVisibility } from "@/types/benchmark";
import { formatClock } from "@/lib/benchmark-data";
import { BrandIcon } from "@/components/ui/BrandIcon";

interface BenchmarkTableRowProps {
  row: BenchmarkRow;
  columns: ColumnVisibility;
}

export function BenchmarkTableRow({ row, columns }: BenchmarkTableRowProps) {
  const isLeader = row.rank === 1;
  const padRank = String(row.rank).padStart(2, "0");

  const renderMetricCell = (val: number) => {
    const barWidth = Math.max(22, Math.min(46, Math.round(val * 0.5)));
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
          {val.toFixed(1)}
        </span>
        <div
          className="h-[3px] rounded-full bg-[#0795CF] dark:bg-[#00A0BE] mt-1"
          style={{ width: `${barWidth}px` }}
          aria-hidden="true"
        />
      </div>
    );
  };

  return (
    <tr
      className={`border-b border-[var(--border-default)]/70 transition-colors hover:bg-[var(--background-subtle)] ${
        isLeader
          ? "bg-[#0795CF]/[0.03] dark:bg-[#0795CF]/[0.06]"
          : "bg-transparent"
      }`}
    >
      {/* Rank # */}
      <td className="py-3 px-3 text-center">
        <span
          className={`font-mono font-bold ${
            isLeader
              ? "text-[#0795CF] text-sm sm:text-base font-extrabold"
              : "text-[var(--text-muted)] text-xs font-semibold"
          }`}
        >
          {padRank}
        </span>
      </td>

      {/* MODEL (Tile + Logo + Name + LEADER badge) */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)] flex items-center justify-center shrink-0 shadow-2xs">
            <BrandIcon name={row.generator} size={18} />
          </div>
          <span className="font-bold text-xs sm:text-sm font-sans tracking-tight text-[var(--text-primary)] whitespace-nowrap">
            {row.generator}
          </span>
          {isLeader && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-sans font-bold tracking-wider uppercase bg-[#0795CF] text-white shadow-2xs shrink-0">
              LEADER
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

      {/* JUDGE SCORE (Sky-blue highlighted column wash) */}
      {columns.judgePct && (
        <td className="py-3 px-4 text-right bg-[#0795CF]/8 dark:bg-[#0795CF]/15">
          <span className="font-mono text-lg sm:text-xl font-bold text-[#0795CF] dark:text-[#38bdf8] tracking-tight">
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
        <td className="py-3 px-4 text-right font-mono text-xs text-[var(--text-muted)]">
          {formatClock(row.genSeconds)}
        </td>
      )}
    </tr>
  );
}
