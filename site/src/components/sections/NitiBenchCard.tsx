"use client";

import type { NitiBenchRow } from "@/types/benchmark";
import { formatClock } from "@/lib/benchmark-data";

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

/** One compact metric tile for the mobile card grid. */
function MetricTile({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--border-default)] px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </span>
      <span
        className={`font-mono ${
          strong
            ? "text-lg font-bold text-[var(--brand-text)]"
            : "text-sm font-semibold text-[var(--text-primary)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/** One NitiBench+ run as a stacked card — the mobile view of the board. */
export function NitiBenchCard({
  row,
  isTh,
}: {
  row: NitiBenchRow;
  isTh: boolean;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
          #{row.rank}
          {row.tieCount > 1 ? ` (×${row.tieCount})` : ""}
        </span>
        <NitiModeChip mode={row.mode} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {row.generator}
        </h3>
        <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
          {row.retriever ?? (isTh ? "ไม่ได้ค้นเอกสาร" : "no retrieval")}
          {row.reranker ? ` + ${row.reranker}` : ""} ·{" "}
          {nitiDate(row.runDate, isTh)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <MetricTile
            label={isTh ? "คะแนนมาตรฐานสภาทนาย (0–10)" : "Bar-standard (0–10)"}
            value={row.rubricBar.toFixed(2)}
            strong
          />
        </div>
        <MetricTile label="Citation F1" value={nitiPct(row.citationF1)} />
        <MetricTile label="Recall@k" value={nitiPct(row.recallAtK)} />
        <MetricTile label="P@1" value={nitiPct(row.pAt1)} />
        <MetricTile
          label={isTh ? "อ้างเพี้ยน" : "Hallucinated"}
          value={row.hallucinated === null ? "—" : String(row.hallucinated)}
        />
        <MetricTile
          label={isTh ? "คดีที่ประเมิน" : "Cases judged"}
          value={row.nCases === null ? "—" : String(row.nCases)}
        />
        <MetricTile
          label={isTh ? "เวลาสร้างคำตอบ" : "Gen time"}
          value={formatClock(row.genSeconds)}
        />
      </div>
    </article>
  );
}
