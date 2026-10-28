"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  BenchmarkRow,
  ColumnVisibility,
  RerankerFilter,
  SortDirection,
  SortKey,
} from "@/types/benchmark";
import { BenchmarkTableHeader } from "@/components/sections/BenchmarkTableHeader";
import { BenchmarkTableRow } from "@/components/sections/BenchmarkTableRow";
import { BenchmarkTableToolbar } from "@/components/sections/BenchmarkTableToolbar";
import { BenchmarkNextRunRow } from "@/components/sections/BenchmarkNextRunRow";
import { BenchmarkMobileList } from "@/components/sections/BenchmarkMobileList";
import { useLanguage } from "@/hooks/use-language";

const DEFAULT_COLUMNS: ColumnVisibility = {
  retriever: true,
  reranker: true,
  q: true,
  judgePct: true,
  mTh: true,
  f1Th: true,
  precisionTh: true,
  recallTh: true,
  em: true,
  latency: true,
};

export function BenchmarkTable({ rows }: { rows: BenchmarkRow[] }) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const [columns, setColumns] = useState<ColumnVisibility>(DEFAULT_COLUMNS);
  const [generator, setGenerator] = useState("all");
  const [reranker, setReranker] = useState<RerankerFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("q");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  // The swipe hint is chrome, so it only appears while the table really
  // overflows. Starts false so the CSS baseline (md and up) can paint it
  // on the first frame; the measurement below only ever hides it.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fitsWithoutScroll, setFitsWithoutScroll] = useState(false);

  const generators = useMemo(
    () => [...new Set(rows.map((r) => r.generator))],
    [rows]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "rank" || key === "latency" ? "asc" : "desc");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (generator !== "all" && r.generator !== generator) return false;
      if (reranker === "yes" && !r.reranker) return false;
      if (reranker === "no" && r.reranker) return false;
      return true;
    });
  }, [rows, generator, reranker]);

  // Phones read the board in rank order; sorting is a table affordance.
  const mobileRows = useMemo(
    () => [...filteredRows].sort((a, b) => a.rank - b.rank),
    [filteredRows]
  );

  const processedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let aVal: number | string | null = null;
      let bVal: number | string | null = null;

      if (sortKey === "rank") {
        aVal = a.rank;
        bVal = b.rank;
      } else if (sortKey === "q") {
        aVal = a.q;
        bVal = b.q;
      } else if (sortKey === "judgePct") {
        aVal = a.judgePct;
        bVal = b.judgePct;
      } else if (sortKey === "mTh") {
        aVal = a.mTh;
        bVal = b.mTh;
      } else if (sortKey === "em") {
        aVal = a.em;
        bVal = b.em;
      } else if (sortKey === "f1Th") {
        aVal = a.f1Th;
        bVal = b.f1Th;
      } else if (sortKey === "precisionTh") {
        aVal = a.precisionTh;
        bVal = b.precisionTh;
      } else if (sortKey === "recallTh") {
        aVal = a.recallTh;
        bVal = b.recallTh;
      } else if (sortKey === "latency") {
        aVal = a.genSeconds ?? Number.POSITIVE_INFINITY;
        bVal = b.genSeconds ?? Number.POSITIVE_INFINITY;
      } else if (sortKey === "retriever") {
        aVal = a.retriever;
        bVal = b.retriever;
      } else if (sortKey === "reranker") {
        aVal = a.reranker ?? "";
        bVal = b.reranker ?? "";
      }

      if (aVal === bVal) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      let res = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        res = aVal < bVal ? -1 : 1;
      } else {
        res = String(aVal).localeCompare(String(bVal));
      }
      return sortDirection === "asc" ? res : -res;
    });
  }, [filteredRows, sortKey, sortDirection]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () =>
      setFitsWithoutScroll(el.scrollWidth <= el.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [columns]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar & Filters */}
      <BenchmarkTableToolbar
        generators={generators}
        generator={generator}
        onGeneratorChange={setGenerator}
        reranker={reranker}
        onRerankerChange={setReranker}
        columns={columns}
        onColumnsChange={setColumns}
        resultsCount={processedRows.length}
      />

      {/* Definitions at the point of use, not only in title tooltips. */}
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        <span className="font-mono font-semibold text-[var(--text-secondary)]">
          Judge
        </span>{" "}
        = {isTh ? "สัดส่วนคำตอบที่ Judge รับรอง" : "answers the judge marked correct"} ·{" "}
        <span className="font-mono font-semibold text-[var(--text-secondary)]">
          Match TH
        </span>{" "}
        = {isTh ? "คำตอบเฉลยปรากฏครบถ้วนในข้อความ" : "gold answer found in the answer"} ·{" "}
        <span className="font-mono font-semibold text-[var(--text-secondary)]">
          F1 TH
        </span>{" "}
        = {isTh ? "ค่าเฉลี่ยฮาร์มอนิกของ Precision และ Recall" : "harmonic mean of Thai precision and recall"} ·{" "}
        <span className="font-mono font-semibold text-[var(--text-secondary)]">
          EM
        </span>{" "}
        = {isTh ? "ข้อความตรงกับเฉลย 100%" : "normalized exact match"} ·{" "}
        <span className="font-mono font-semibold text-[var(--text-secondary)]">
          {isTh ? "เวลา Gen" : "Gen Time"}
        </span>{" "}
        = {isTh ? "เฉพาะเวลาสร้างคำตอบ" : "generation only"}
      </p>

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
          <BenchmarkMobileList rows={mobileRows} />

          <div className="flex flex-col gap-2">
            <p
              data-scroll-hint
              className={`text-xs text-[var(--text-muted)] ${
                fitsWithoutScroll ? "hidden" : "hidden md:block"
              }`}
            >
              {isTh
                ? "เลื่อนแถบไปด้านขวาเพื่อดู Judge, Match TH, F1, EM และเวลา Gen →"
                : "Scroll sideways for Judge, Match TH, F1, EM and Gen Time →"}
            </p>

            {/* Measured Sheet Table Container */}
            <div
              ref={scrollerRef}
              className="hidden overflow-x-auto rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs transition-colors md:block"
            >
              <table className="w-full text-left border-collapse min-w-[800px]">
                <caption className="sr-only">
                  Leaderboard of evaluated Thai RAG pipeline combinations,
                  ranked by overall score. Metric column headers are sortable
                  buttons; the Model column is not sortable.
                </caption>
                <BenchmarkTableHeader
                  columns={columns}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <tbody>
                  {processedRows.map((row) => (
                    <BenchmarkTableRow
                      key={row.id}
                      row={row}
                      columns={columns}
                    />
                  ))}
                  <BenchmarkNextRunRow columns={columns} />
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
