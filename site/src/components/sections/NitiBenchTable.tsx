"use client";

import { useMemo, useState } from "react";
import type {
  NitiBenchRow,
  NitiColumnVisibility,
  NitiSortKey,
  RerankerFilter,
  SortDirection,
} from "@/types/benchmark";
import { compareNitiRows } from "@/lib/nitibench-sort";
import { useLanguage } from "@/hooks/use-language";
import { NitiBenchCaveats } from "@/components/sections/NitiBenchCaveats";
import { NitiBenchTableHeader } from "@/components/sections/NitiBenchTableHeader";
import { NitiBenchTableToolbar } from "@/components/sections/NitiBenchTableToolbar";
import { NitiBenchTableRow } from "@/components/sections/NitiBenchTableRow";
import { NitiBenchNextRunRow } from "@/components/sections/NitiBenchNextRunRow";
import { NitiBenchMobileList } from "@/components/sections/NitiBenchMobileList";

const DEFAULT_COLUMNS: NitiColumnVisibility = {
  retriever: true,
  reranker: true,
  rubricBar: true,
  citationF1: true,
  recallAtK: true,
  pAt1: true,
  hallucinated: true,
  nCases: true,
  genSeconds: true,
  runDate: true,
};

/** Legal board with the same filtering, sorting, and column controls as Wiki. */
export function NitiBenchTable({ rows }: { rows: NitiBenchRow[] }) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const [columns, setColumns] = useState<NitiColumnVisibility>(DEFAULT_COLUMNS);
  const [generator, setGenerator] = useState("all");
  const [reranker, setReranker] = useState<RerankerFilter>("all");
  const [sortKey, setSortKey] = useState<NitiSortKey>("rubricBar");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const generators = useMemo(
    () => [...new Set(rows.map((row) => row.generator))],
    [rows]
  );

  const handleSort = (key: NitiSortKey) => {
    if (sortKey === key) {
      setSortDirection((previous) => previous === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection(key === "rank" || key === "genSeconds" ? "asc" : "desc");
    }
  };

  const filteredRows = useMemo(() => rows.filter((row) => {
    if (generator !== "all" && row.generator !== generator) return false;
    if (reranker === "yes" && !row.reranker) return false;
    if (reranker === "no" && row.reranker) return false;
    return true;
  }), [rows, generator, reranker]);

  const mobileRows = useMemo(
    () => [...filteredRows].sort((a, b) => a.rank - b.rank),
    [filteredRows]
  );
  const processedRows = useMemo(
    () => [...filteredRows].sort((a, b) => compareNitiRows(a, b, sortKey, sortDirection)),
    [filteredRows, sortKey, sortDirection]
  );

  const judgeModel = rows.find((row) => row.judgeModel)?.judgeModel ?? null;
  const barValues = rows.map((row) => row.rubricBar);
  const barMin = rows.length > 0 ? Math.min(...barValues) : 0;
  const barMax = rows.length > 0 ? Math.max(...barValues) : 0;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] py-12 text-center font-mono">
          <p className="text-xs text-[var(--text-muted)]">
            {isTh
              ? "ยังไม่มีรัน NitiBench+ เต็ม 498 คดีที่ประเมินด้วย rubric + citation ครบ"
              : "No complete 498-case NitiBench+ runs scored with rubric + citation yet."}
          </p>
        </div>
        <NitiBenchCaveats isTh={isTh} judgeModel={null} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans text-[var(--text-muted)]">
        {isTh
          ? "จัดอันดับตามคะแนน rubric มาตรฐานสภาทนายความ (0–10) · Citation F1 ใช้ตัดสินเมื่อคะแนนเท่ากัน · คลิกหัวคอลัมน์เพื่อเรียงลำดับใหม่"
          : "Ranked by the official Bar-Council rubric score (0–10); Citation F1 breaks ties. Select any metric header to sort."}
      </p>

      <NitiBenchTableToolbar
        generators={generators}
        generator={generator}
        onGeneratorChange={setGenerator}
        reranker={reranker}
        onRerankerChange={setReranker}
        columns={columns}
        onColumnsChange={setColumns}
        resultsCount={processedRows.length}
        barMin={barMin}
        barMax={barMax}
      />

      {processedRows.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] py-12 text-center font-mono">
          <p className="text-xs text-[var(--text-muted)]">
            {isTh
              ? "ไม่พบผลการทดลองที่ตรงกับตัวกรองปัจจุบัน"
              : "No benchmark runs match the current filters."}
          </p>
          <button
            type="button"
            onClick={() => {
              setGenerator("all");
              setReranker("all");
            }}
            className="mt-3 min-h-[44px] rounded-xl border border-[var(--border-default)] px-4 text-xs font-semibold text-[var(--brand-text)] transition-colors hover:border-[var(--border-focus)] cursor-pointer"
          >
            {isTh ? "รีเซ็ตตัวกรอง" : "Reset filters"}
          </button>
        </div>
      ) : (
        <>
          <NitiBenchMobileList rows={mobileRows} barMin={barMin} barMax={barMax} />
          <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs transition-colors md:block">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <caption className="sr-only">
                {isTh
                  ? "ตารางอันดับ NitiBench+ เรียงตามคะแนน Bar คลิกหัวคอลัมน์ metric เพื่อเรียงลำดับใหม่ได้ คอลัมน์โมเดลเรียงไม่ได้"
                  : "NitiBench+ leaderboard ranked by Bar score. Metric headers are sortable; the Model column is not."}
              </caption>
              <NitiBenchTableHeader
                columns={columns}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <tbody>
                {processedRows.map((row) => (
                  <NitiBenchTableRow
                    key={row.id}
                    row={row}
                    columns={columns}
                    isTh={isTh}
                    barMin={barMin}
                    barMax={barMax}
                  />
                ))}
                <NitiBenchNextRunRow columns={columns} />
              </tbody>
            </table>
          </div>
        </>
      )}

      <NitiBenchCaveats isTh={isTh} judgeModel={judgeModel} />
    </div>
  );
}
