"use client";

import type { NitiBenchRow } from "@/types/benchmark";
import { useLanguage } from "@/hooks/use-language";
import { formatClock } from "@/lib/benchmark-data";
import { NitiBenchCaveats } from "@/components/sections/NitiBenchCaveats";
import {
  NitiBenchCard,
  NitiModeChip,
  nitiDate,
  nitiPct,
} from "@/components/sections/NitiBenchCard";

/**
 * NitiBench+ (Thai legal) board. Ranked by the official Bar-Council rubric
 * score (0-10); Citation F1, version-exact Recall@k and hallucinated-citation
 * counts are the diagnostics. Lexical EM/F1 deliberately never appear here.
 */

export function NitiBenchTable({ rows }: { rows: NitiBenchRow[] }) {
  const { language } = useLanguage();
  const isTh = language === "TH";

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] py-12 text-center font-mono">
          <p className="text-xs text-[var(--text-muted)]">
            {isTh
              ? "ยังไม่มีรัน NitiBench+ ที่ประเมินด้วย rubric + citation ครบ"
              : "No NitiBench+ runs scored with rubric + citation yet."}
          </p>
        </div>
        <NitiBenchCaveats isTh={isTh} judgeModel={null} />
      </div>
    );
  }

  const judgeModel = rows.find((r) => r.judgeModel)?.judgeModel ?? null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans text-[var(--text-muted)]">
        {isTh
          ? "จัดอันดับตามคะแนน rubric มาตรฐานสภาทนายความ (0–10) · Citation F1 ใช้ตัดสินเมื่อคะแนนเท่ากัน · Recall@k วัดแบบตรงฉบับมาตรา (version-exact)"
          : "Ranked by the official Bar-Council rubric score (0–10); Citation F1 breaks ties. Recall@k is version-exact (the statute version in force on the decision date)."}
      </p>

      {/* Mobile: one card per run */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <NitiBenchCard key={row.id} row={row} isTh={isTh} />
        ))}
      </div>

      {/* Tablet/desktop: full table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs transition-colors md:block">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <caption className="sr-only">
            {isTh
              ? "ตารางอันดับ NitiBench+ เรียงตามคะแนน rubric สภาทนายความ"
              : "NitiBench+ leaderboard ranked by the Bar-Council rubric score."}
          </caption>
          <thead>
            <tr className="border-b border-[var(--border-default)] text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              <th scope="col" className="px-3 py-3 font-medium">#</th>
              <th scope="col" className="px-3 py-3 font-medium">{isTh ? "โมเดล" : "Model"}</th>
              <th scope="col" className="px-3 py-3 font-medium">{isTh ? "โหมด" : "Mode"}</th>
              <th scope="col" className="px-3 py-3 font-medium">Embedding</th>
              <th scope="col" className="px-3 py-3 font-medium">Bar (0–10)</th>
              <th scope="col" className="px-3 py-3 font-medium">Citation F1</th>
              <th scope="col" className="px-3 py-3 font-medium">Recall@k</th>
              <th scope="col" className="px-3 py-3 font-medium">P@1</th>
              <th scope="col" className="px-3 py-3 font-medium">{isTh ? "อ้างเพี้ยน" : "Halluc."}</th>
              <th scope="col" className="px-3 py-3 font-medium">{isTh ? "คดี" : "Cases"}</th>
              <th scope="col" className="px-3 py-3 font-medium">{isTh ? "เวลาสร้าง" : "Gen time"}</th>
              <th scope="col" className="px-3 py-3 font-medium">{isTh ? "วันที่" : "Date"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--border-default)] last:border-0 transition-colors"
              >
                <td className="px-3 py-3 font-mono text-xs font-bold text-[var(--text-muted)]">
                  {row.rank}
                  {row.tieCount > 1 ? ` ×${row.tieCount}` : ""}
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-[var(--text-primary)]">
                  {row.generator}
                </td>
                <td className="px-3 py-3"><NitiModeChip mode={row.mode} /></td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-secondary)]">
                  {row.retriever ?? (isTh ? "ไม่ได้ค้น" : "none")}
                </td>
                <td className="px-3 py-3 font-mono text-sm font-bold text-[var(--brand-text)]">
                  {row.rubricBar.toFixed(2)}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-primary)]">
                  {nitiPct(row.citationF1)}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-primary)]">
                  {nitiPct(row.recallAtK)}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-primary)]">
                  {nitiPct(row.pAt1)}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-primary)]">
                  {row.hallucinated ?? "—"}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-primary)]">
                  {row.nCases ?? "—"}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-primary)]">
                  {formatClock(row.genSeconds)}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--text-muted)]">
                  {nitiDate(row.runDate, isTh)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NitiBenchCaveats isTh={isTh} judgeModel={judgeModel} />
    </div>
  );
}
