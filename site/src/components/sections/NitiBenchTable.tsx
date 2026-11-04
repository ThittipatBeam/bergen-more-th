"use client";

import type { NitiBenchRow } from "@/types/benchmark";
import { useLanguage } from "@/hooks/use-language";
import { NitiBenchCaveats } from "@/components/sections/NitiBenchCaveats";
import { NitiBenchTableRow } from "@/components/sections/NitiBenchTableRow";
import { NitiBenchCard } from "@/components/sections/NitiBenchCard";

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
  // Board-wide rubric range; drives the sequential tint on the headline score.
  const barValues = rows.map((r) => r.rubricBar);
  const barMin = Math.min(...barValues);
  const barMax = Math.max(...barValues);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans text-[var(--text-muted)]">
        {isTh
          ? "จัดอันดับตามคะแนน rubric มาตรฐานสภาทนายความ (0–10) · Citation F1 ใช้ตัดสินเมื่อคะแนนเท่ากัน · Recall@k วัดแบบตรงฉบับมาตรา (version-exact)"
          : "Ranked by the official Bar-Council rubric score (0–10); Citation F1 breaks ties. Recall@k is version-exact (the statute version in force on the decision date)."}
      </p>

      {/* Mobile: one item per run, same list shell as the Wikipedia board */}
      <div className="flex flex-col gap-3 md:hidden">
        <ol className="divide-y divide-[var(--border-default)] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs">
          {rows.map((row) => (
            <NitiBenchCard
              key={row.id}
              row={row}
              isTh={isTh}
              barMin={barMin}
              barMax={barMax}
            />
          ))}
        </ol>
      </div>

      {/* Tablet/desktop: full table, same chrome as the Wikipedia board */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs transition-colors md:block">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <caption className="sr-only">
            {isTh
              ? "ตารางอันดับ NitiBench+ เรียงตามคะแนน rubric สภาทนายความ"
              : "NitiBench+ leaderboard ranked by the Bar-Council rubric score."}
          </caption>
          <thead>
            <tr className="bg-[var(--background-subtle)] border-b border-[var(--border-default)] text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-secondary)] transition-colors select-none">
              <th
                scope="col"
                className="sticky left-0 z-20 w-10 bg-[var(--background-subtle)] py-3.5 px-1.5 text-center"
              >
                #
              </th>
              <th
                scope="col"
                className="sticky left-14 z-20 bg-[var(--background-subtle)] py-3.5 px-2 text-left sm:px-3"
              >
                {isTh ? "โมเดล" : "Model"}
              </th>
              <th scope="col" className="py-3.5 px-3 text-left">
                Embedding
              </th>
              <th scope="col" className="py-3.5 px-3 text-left">
                Reranker
              </th>
              <th
                scope="col"
                className="py-3.5 px-2 sm:px-3 text-right bg-[var(--surface-brand)] text-[var(--brand-text)]"
              >
                Bar (0–10)
              </th>
              <th scope="col" className="py-3.5 px-2 text-center">
                Citation F1
              </th>
              <th scope="col" className="py-3.5 px-2 text-center">
                Recall@k
              </th>
              <th scope="col" className="py-3.5 px-2 text-center">
                P@1
              </th>
              <th scope="col" className="py-3.5 px-2 text-center">
                {isTh ? "อ้างเพี้ยน" : "Halluc."}
              </th>
              <th scope="col" className="py-3.5 px-2 text-center">
                {isTh ? "คดี" : "Cases"}
              </th>
              <th scope="col" className="py-3.5 px-2 text-right">
                {isTh ? "เวลาสร้าง" : "Gen time"}
              </th>
              <th scope="col" className="py-3.5 px-3 text-right">
                {isTh ? "วันที่" : "Date"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <NitiBenchTableRow
                key={row.id}
                row={row}
                isTh={isTh}
                barMin={barMin}
                barMax={barMax}
              />
            ))}
          </tbody>
        </table>
      </div>

      <NitiBenchCaveats isTh={isTh} judgeModel={judgeModel} />
    </div>
  );
}
