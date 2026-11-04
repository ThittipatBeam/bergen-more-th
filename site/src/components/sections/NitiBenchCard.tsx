"use client";

import type { NitiBenchRow } from "@/types/benchmark";
import { formatClock } from "@/lib/benchmark-data";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";
import { SCORE_BAND_CLASSES, scoreBand } from "@/lib/score-scale";
import { BrandIcon } from "@/components/ui/BrandIcon";

/** Small shared display pieces for the NitiBench+ board (mobile card +
 *  desktop row both draw from these so the numbers read identically). */

export const nitiPct = (v: number | null): string =>
  v === null ? "—" : `${v.toFixed(1)}%`;

export const nitiDate = (runDate: string, isTh: boolean): string => {
  const d = new Date(runDate);
  if (Number.isNaN(d.getTime())) return runDate;
  return d.toLocaleDateString(isTh ? "th-TH" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function NitiModeChip({ mode }: { mode: NitiBenchRow["mode"] }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--border-default)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
      {mode}
    </span>
  );
}

function MobileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="font-mono text-base font-bold leading-none text-[var(--text-primary)] tracking-tight">
        {value}
      </dd>
    </div>
  );
}

/** One NitiBench+ run as a mobile list item — same structure, rank numerals,
 *  brand tiles, and band-tinted score chip as the Wikipedia board. */
export function NitiBenchCard({
  row,
  isTh,
  barMin,
  barMax,
}: {
  row: NitiBenchRow;
  isTh: boolean;
  barMin: number;
  barMax: number;
}) {
  const padRank = `${String(row.rank).padStart(2, "0")}${
    row.tieCount > 1 ? "=" : ""
  }`;
  const rankColor = RANK_MEDAL_CLASSES[row.rank] ?? "text-[var(--text-muted)]";
  const scoreTint =
    SCORE_BAND_CLASSES[scoreBand(row.rubricBar, barMin, barMax)];

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <span
          className={`w-6 shrink-0 pt-1 text-center font-mono text-sm font-extrabold ${rankColor}`}
        >
          {padRank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)] shadow-2xs">
              <BrandIcon name={row.generator} size={16} />
            </span>
            <span className="truncate font-sans text-sm font-bold text-[var(--text-primary)]">
              {row.generator}
            </span>
            {/* RAG is the default for this board; only flag the exceptions. */}
            {row.mode !== "RAG" && <NitiModeChip mode={row.mode} />}
          </div>
          <p className="mt-1 font-mono text-[11px] leading-4 text-[var(--text-secondary)]">
            {row.retriever ?? (isTh ? "ไม่ได้ค้นเอกสาร" : "no retrieval")}
            {row.reranker ? ` + ${row.reranker}` : ""}
            {" · "}
            {nitiDate(row.runDate, isTh)}
          </p>
        </div>

        <div
          className={`flex shrink-0 flex-col items-end rounded-lg px-2.5 py-1.5 ${scoreTint}`}
        >
          <span className="font-mono text-xl font-bold leading-none tracking-tight text-[var(--text-primary)]">
            {row.rubricBar.toFixed(2)}
          </span>
          <span className="mt-1 font-mono text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
            Bar
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 border-t border-[var(--border-default)]/60 pt-3">
        <MobileMetric label="Citation F1" value={nitiPct(row.citationF1)} />
        <MobileMetric label="Recall@k" value={nitiPct(row.recallAtK)} />
        <MobileMetric label="P@1" value={nitiPct(row.pAt1)} />
      </dl>

      <p className="font-mono text-[11px] text-[var(--text-muted)]">
        {formatClock(row.genSeconds)}
        {" · "}
        {isTh ? "อ้างเพี้ยน" : "halluc."}{" "}
        {row.hallucinated === null ? "—" : String(row.hallucinated)}
        {" · "}
        {isTh ? "คดี" : "cases"} {row.nCases === null ? "—" : String(row.nCases)}
      </p>
    </li>
  );
}
